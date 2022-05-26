import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import Web3 from 'web3';
import { ReferralData, ResultTypes } from './types/types';
import { LoadingService } from './loading.service';
import { AccountBalanceService } from './account-balance.service';
import { environment } from '../../environments/environment';
import { TokenCalculationService } from './token-calculation.service';
import { ReferralService } from './referral.service';

declare global {
  interface Window {
    ethereum: any
  }
}

@Injectable({
  providedIn: 'root'
})
export class Web3Service {
  private currentAccount: BehaviorSubject<string> = new BehaviorSubject('');
  private setBalance: BehaviorSubject<string> = new BehaviorSubject('');
  private setResultsStatus: BehaviorSubject<ResultTypes> = new BehaviorSubject(undefined as ResultTypes);
  public readonly setAccount: Observable<string> = this.currentAccount.asObservable();
  public readonly getResults: Observable<ResultTypes> = this.setResultsStatus.asObservable();
  public readonly getAccountBalance: Observable<string | undefined> = this.setBalance.asObservable();
  private provider: Web3 = new Web3(Web3.givenProvider);
  private ethereum = window.ethereum;
  private readonly toAddress = environment.toAddress;

  public constructor(private readonly loadingService: LoadingService,
                     private readonly accountBalanceService: AccountBalanceService,
                     private readonly TokenCalculationService: TokenCalculationService,
                     private readonly referralService: ReferralService) {
  }

  public verifyMetaMask(): boolean {
    if (!this.provider.currentProvider) {
      this.setResultsStatus.next('METAMASK-MISSING');
      console.log('Please install MetaMask!');
      window.open('https://metamask.io/download/', '_blank');

      return false;
    }
    this.listenForEthereumChanges();

    return true;
  }

  public async sendTransaction(value: number, referAddress?: string): Promise<void> {
    if (!this.verifyMetaMask()) return;
    if (!await this.getChainId()) return;

    const address: string | undefined = await this.getAccount();
    if (!address) return;

    const bnbAmount: string = this.provider.utils.toWei(value.toString(), 'ether');

    this.provider.eth.sendTransaction({
      from: address,
      to: this.toAddress,
      value: bnbAmount
    }).then(async (result) => {
      // Set loading animation status
      this.loadingService.setLoading(false);

      // Set status of action
      this.setResultsStatus.next('TRANSACTION-COMPLETED');

      // Calc alpha token amount
      const price: number = await this.TokenCalculationService.calculatePrice(value);
      let alphaToken: number = Math.round(value * price * 10000) / 10000;

      // Check if address is from referral list
      const isReferred: ReferralData = await this.referralService.getReferredAddress(address);
      if (isReferred) {
        alphaToken = alphaToken * 1.2;
      }

      // Add referral discount
      if (referAddress) {
        alphaToken = alphaToken * 1.2;
        await this.referralService.saveReferAddress(referAddress);
      }

      // Update Alpha token price
      // TODO: update progress
      await this.TokenCalculationService.updateTokenPrice(price, alphaToken);

      // Save data to DB
      await this.accountBalanceService.saveAccountTokenData(result.from, alphaToken, price, referAddress);
    }).catch(error => {
      this.setResultsStatus.next('TRANSACTION-FAILED');
      this.loadingService.setLoading(false);
    });
  }

  public startApp(): void {
    if (!this.verifyMetaMask()) return;
    // If the provider returned by detectEthereumProvider is not the same as
    // window.ethereum, something is overwriting it, perhaps another wallet.
    if (!this.provider) {
      console.error('Do you have multiple wallets installed?');
      this.setResultsStatus.next('ETHEREUM-NOT-FOUND');

      return;
    }
    // Check network
    this.provider.eth
      .getChainId()
      .then(data => {
        if (data !== 97) {
          this.setResultsStatus.next('NOT-BINANCE-NETWORK');
          return console.error('Wrong network');
        };
        // if (data !== 56) {
        //   this.setResultsStatus.next('NOT-BINANCE-NETWORK');
        //   return console.error('Wrong network');
        // };

        // Access the decentralized web!
        this.provider.eth
          .getAccounts()
          .then((data) => {
            this.handleAccountsChanged(data);
          })
          .catch(err => {
            console.log(err);
            if (err.code === 4001) {
              // EIP-1193 userRejectedRequest error
              // If this happens, the user rejected the connection request.
              this.setResultsStatus.next('METAMASK-NOT-CONNECTED');
            } else {
              this.setResultsStatus.next('error');
              console.log(err);
            }
          });
      })
      .catch(err => this.setResultsStatus.next('error'));
  }

  public checkWalletAddress(address: string): boolean {
    return this.provider.utils.isAddress(address);
  }

  private async handleAccountsChanged(accounts: any): Promise<void> {
    if (accounts.length === 0) {
      // MetaMask is locked or the user has not connected any accounts
      if (!this.provider) {
        this.verifyMetaMask();
      };
      this.provider?.eth.requestAccounts()
        .then(async accounts => {
          this.currentAccount.next(accounts[0]);
          this.setResultsStatus.next('success');
          this.accountBalanceService.getAccountTokens(accounts[0]);
          const balance: string = await this.getBalance(accounts[0]);
          this.setBalance.next(balance);
        })
        .catch(err => {
          console.log(err);
          if (err.code === -32002) {
            return this.setResultsStatus.next('METAMASK-PENDING-CONNECTION');
          }

          if (err.code === 4001) {
            return this.setResultsStatus.next('USER-REFUSED-CONNECTION');
          }
          this.setResultsStatus.next('METAMASK-NOT-CONNECTED');
        });
    } else if (accounts[0] !== this.currentAccount) {
      // send account string
      this.currentAccount.next(accounts[0]);
      this.setResultsStatus.next('success');
      // Do any other work!
      this.accountBalanceService.getAccountTokens(accounts[0]);
      const balance: string = await this.getBalance(accounts[0]);
      this.setBalance.next(balance);
    }
  }

  private async getBalance(address: string): Promise<string> {
    const balanceInWei: string = await this.provider.eth.getBalance(address);
    
    return this.provider.utils.fromWei(balanceInWei, 'ether');
  }

  private async getChainId(): Promise<number | undefined> {
    return await this.provider?.eth.getChainId().then(data => {
      // if (data !== 56) {
      if (data !== 97) {
        this.setResultsStatus.next('NOT-BINANCE-NETWORK');
        console.error('Wrong network');

        return undefined;
      }

      return data;
    }).catch(() => {
      this.setResultsStatus.next('error');

      return undefined;
    });
  }

  private async getAccount(): Promise<string | undefined> {
    return await this.provider?.eth.requestAccounts()
      .then(async accounts => {
        return accounts[0];
      })
      .catch(err => {
        if (err.code === -32002) {
          this.setResultsStatus.next('METAMASK-PENDING-CONNECTION');

          return undefined;
        }
        this.setResultsStatus.next('METAMASK-NOT-CONNECTED');

        return undefined;
      });
  }

  private listenForEthereumChanges(): void {
    if (!this.ethereum) {
      console.log('window.ethereum missing');

      return this.setResultsStatus.next('METAMASK-MISSING');
    }

    this.ethereum.on('accountsChanged', async (accounts: string[]) => {
      this.currentAccount.next(accounts[0]);
      this.setResultsStatus.next('ACCOUNT-CHANGED');
      const balance: string = await this.getBalance(accounts[0]);
      await this.accountBalanceService.getAccountTokens(accounts[0]);
      this.setBalance.next(balance);
    });

    this.ethereum.on('chainChanged', () => location.reload());
    this.ethereum.on('disconnect', () => location.reload());
  }
}
