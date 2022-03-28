import { Injectable } from '@angular/core';
import detectEthereumProvider from '@metamask/detect-provider';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class Web3Service {
  private currentAccount: BehaviorSubject<string> = new BehaviorSubject('');
  public readonly setAccount: Observable<string> = this.currentAccount.asObservable();

  public async verifyMetaMask(): Promise<void> {
    const provider = await detectEthereumProvider();

    if (provider) {
        // From now on, this should always be true:
        // provider === window.ethereum
        this.startApp(provider); // initialize your app
    } else {
      console.log('Please install MetaMask!');
      window.open('https://metamask.io/download/', '_blank');
    }
  }

  private startApp(provider: any): void {
    // If the provider returned by detectEthereumProvider is not the same as
    // window.ethereum, something is overwriting it, perhaps another wallet.
    if (provider !== window.ethereum) {
        console.error('Do you have multiple wallets installed?');
    }
    // Access the decentralized web!
    provider
      .request({ method: 'eth_requestAccounts' })
      .then((data: any) => this.handleAccountsChanged(data))
      .catch((err: any) => {
          if (err.code === 4001) {
            // EIP-1193 userRejectedRequest error
            // If this happens, the user rejected the connection request.
            console.log('Please connect to MetaMask.');
          } else {
            console.error(err);
          }
      });
  }

  private handleAccountsChanged(accounts: any): void {
    if (accounts.length === 0) {
      // MetaMask is locked or the user has not connected any accounts
      console.log('Please connect to MetaMask.');
    } else if (accounts[0] !== this.currentAccount) {
      this.currentAccount.next(accounts[0]);
      // Do any other work!
      console.log('Wallet connected');
    }
  }
}
