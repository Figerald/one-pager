import { Component, HostListener, OnDestroy, OnInit, QueryList, ViewChildren } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import * as feather from 'feather-icons';
import * as Highcharts from 'highcharts';
import highcharts3D from 'highcharts/highcharts-3d'
import darkUnica from 'highcharts/themes/gray';
import { AnimationOptions } from 'ngx-lottie';
import { Subject, takeUntil } from 'rxjs';
import { animationsArray } from './animations/animations';
import { ReferralData, ResultTypes, WalletInformation } from './services/types/types';
import { SubscriberService } from './services/subscriber.service';
import { Web3Service } from './services/web3.service';
import { LoadingService } from './services/loading.service';
import { AccountBalanceService } from './services/account-balance.service';
import { TokenCalculationService } from './services/token-calculation.service';
import { ReferralService } from './services/referral.service';
import { chartOptions } from './models/chart-options';

declare var require: any;
let Boost = require('highcharts/modules/boost');
let noData = require('highcharts/modules/no-data-to-display');
let More = require('highcharts/highcharts-more');

Boost(Highcharts);
noData(Highcharts);
More(Highcharts);
noData(Highcharts);
highcharts3D(Highcharts);
darkUnica(Highcharts);

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  animations: animationsArray
})
export class AppComponent implements OnInit, OnDestroy {
  @ViewChildren('element1, element2, element3, element4, element5, element6, element7, element8, chartImage') private elements!: QueryList<any>;
  public isWalletModalOpen = false;
  public detectedElements: any[] = [];
  public expanded = false;
  public account: string = '';
  public fullAccount: string | undefined;
  // Referred account data
  public referredAccountData: ReferralData | undefined;
  // Account which referred another account
  public referralAccount: string | undefined;
  public accountLoggedIn: boolean = false;
  public referralInput: string | undefined;
  public referralAddress: string | undefined;
  public walletNotConnected = false;
  public progressRaised: number = 0.4;
  public notificationObj = {
    type: '',
    text: ''
  };
  public referralAnimationStatus = 'hide';
  public notificationAnimationStatus = 'hide';
  public balanceAnimationState = 'hide';
  public aboutState = 'hide';
  public videoState = 'hide';
  public mvpState = 'hide';
  public newsState = 'hide';
  public teamState = 'hide';
  public waitlistState = 'hide';
  public tokenState = 'hide';
  public roadmapState = 'hide';
  public chartImageState = 'hide';
  public connectWalletState = 'hide';
  public subscribeForm: FormControl = new FormControl('', [Validators.required, Validators.email]);
  public formInvalid = false;
  public showWaitlist = false;
  public isLoading = false;
  public alphaTokenAmount: number | undefined;
  public bnbAmount: number | undefined;
  public walletInformation: WalletInformation[] | undefined;
  public accountCurrentBalance: string | undefined;
  public lottieOptions: AnimationOptions = {
    path: '/assets/animations.json'
  };
  public chartOptions: any = chartOptions;
  private referredPrice: number | undefined;
  private destroy$: Subject<void> = new Subject();

  @HostListener('window:scroll', ['$event']) public onScroll(): void {
    this.detectElement();
  }

  @HostListener('document:click', ['$event']) public onDocumentClick(): void {
    this.waitlistState = 'hide';
    this.connectWalletState = 'hide';
    setTimeout(() => {
      this.showWaitlist = false;
      this.isWalletModalOpen = false;
    }, 300);
  }

  public constructor(private readonly subscriberService: SubscriberService,
                     private readonly web3Service: Web3Service,
                     private readonly loadingService: LoadingService,
                     private readonly accountBalanceService: AccountBalanceService,
                     private readonly tokenCalculationService: TokenCalculationService,
                     private readonly referralService: ReferralService) {
    this.web3Service.getResults.pipe(takeUntil(this.destroy$)).subscribe((result: ResultTypes) => {
      if (result) {
        this.handleNotification(result);
      }
    });
    this.loadingService.getLoading.pipe(takeUntil(this.destroy$)).subscribe(loading => this.isLoading = loading);
  }

  public async ngOnInit(): Promise<void> {
    feather.replace();
    Highcharts.chart('token-pie', this.chartOptions);

    this.web3Service.setAccount.pipe(takeUntil(this.destroy$)).subscribe(async (account: string) => {
      if (account) {
        this.account = `${account.substring(0, 4)}...${account.slice(-4)}`;
        this.fullAccount = account;
        this.referredAccountData = await this.referralService.getReferredAddress(this.fullAccount);
        if (this.referredAccountData && this.referredAccountData.address && !this.referredAccountData.isReferComplete) {
          this.referralAnimationStatus = 'show';
          this.referralAccount = this.referredAccountData.address;
        }
      }
    });

    this.web3Service.getAccountBalance.pipe(takeUntil(this.destroy$)).subscribe(balance => {
      if (balance) {
        this.accountCurrentBalance = balance;
        this.balanceAnimationState = 'show';
        setTimeout(() => {
          this.balanceAnimationState =  'hide';
        }, 2500);
      }
    });

    this.accountBalanceService.getAlphaTokenDeposit.pipe(takeUntil(this.destroy$)).subscribe(data => {
      if (data && data.length > 0) {
        this.walletInformation = data;
      } else {
        this.walletInformation = undefined;
      }
    });

    this.progressRaised = await this.tokenCalculationService.getProgressNumber();
    this.setProgressBar();
  }

  public detectElement(): void {
    this.elements.forEach((el, index) => {
      if (this.isInViewport(el.nativeElement)) {
        this.changeAnimation(el.nativeElement.id);
      }
    });
  }

  public toggleMeniu(): void {
    this.expanded = !this.expanded;
    // document.getElementById('header-mobile')!.style.height = this.expanded ? '230px' : '72px';
  }

  public scroll(el: HTMLElement): void {
    const top: number = el.offsetTop - 75;
    window.scrollTo({top, behavior: 'smooth'});
  }

  public open($event: any): void {
    $event.stopPropagation();
    this.showWaitlist = !this.showWaitlist;
    setTimeout(() => {
      this.waitlistState = 'show';
    });
  }

  public openConnectWalletModal($event: any): void {
    $event.stopPropagation();
    this.isWalletModalOpen = true;
    setTimeout(() => {
      this.connectWalletState = 'show';
    });
    if (this.account && this.account.length > 0) {
      this.accountLoggedIn = true;
    }
  }

  public async submit(element?: HTMLButtonElement): Promise<void> {
    // check input validation
    this.formInvalid = this.subscribeForm.status === 'INVALID' ? true : false;
    if (this.formInvalid) {
      if (element) {
        element.classList.add('shake');
        setTimeout(() => {
          element.classList.remove('shake');
        }, 550);
      }

      return;
    }

    // post subscriber email
    const status = await this.subscriberService.postSubscriber(this.subscribeForm.value);

    // reset input value
    this.subscribeForm.setValue('');
    this.waitlistState = 'hide';
    setTimeout(() => {
      this.showWaitlist = false;
    }, 300);
  }

  public async connectWallet(): Promise<void> {
    this.web3Service.startApp();
    this.connectWalletState = 'hide';
    this.walletNotConnected = false;
    this.referralInput = undefined;
    setTimeout(() => {
      this.isWalletModalOpen = false;
    }, 300);
  }

  // TODO
  // error handling
  // check if user has any BNB
  // check if user has more then trying to transfer

  // Handle situation:
  // 1. User do not add referral
  // 2. User adds referral
  //   - check if referral was used

  public async sendToken(): Promise<void> {
    if (this.bnbAmount) {
      this.isLoading = true;
      if (this.referredAccountData && this.referredPrice) {
        await this.web3Service.sendReferralTransaction(this.bnbAmount, this.referredPrice, this.referredAccountData);
        this.referredAccountData.isReferComplete = true;
      } else {
        await this.web3Service.sendTransaction(this.bnbAmount, this.referralAddress);
      }
      this.restoreDepositInputs();
    } else {
      this.handleNotification('BNB-empty');
    }
  }

  public async convertBnbToAlpha(): Promise<number | undefined> {
    if (this.bnbAmount) {
      // Calc for referred address
      if (this.referredPrice) {
        const price: number = Math.round(this.bnbAmount * this.referredPrice * 10000) / 10000;
        return this.alphaTokenAmount = price * 1.2;
      }
      const price: number = await this.tokenCalculationService.calculatePrice(this.bnbAmount);
      return this.alphaTokenAmount = Math.round(this.bnbAmount * price * 10000) / 10000;
    } else {
      this.handleNotification('BNB-empty');
      return this.alphaTokenAmount = undefined;
    }
  }

  public async checkReferredAddress(): Promise<void> {
    // return if wallet not connected
    if (!this.fullAccount) {
      return this.handleNotification('wallet-not-connected');
    }

    if (this.referralInput) {
      // Check if address is valid ETH wallet address
      if (!this.web3Service.checkWalletAddress(this.referralInput)) return this.handleNotification('bad-address');
      
      // Check if referred address is not the same connected
      if (this.fullAccount && this.fullAccount.toLowerCase() === this.referralInput.toLowerCase()) {
        return this.handleNotification('same-account-and-address');
      }

      // Calc price for referred address
      if (this.referralAccount && this.referralInput.toLowerCase() === this.referralAccount.toLowerCase()) {
        return this.calcReferredAddressPrice();
      }

      // Check if address is referred
      const referralData: ReferralData | undefined = await this.referralService.getReferredAddress(this.referralInput);
      if (referralData && referralData.referredAddress.toLowerCase() === this.referralInput.toLowerCase()) {
        return this.handleNotification('address-referred');
      }

      this.referralAddress = this.referralInput;
    }
  }

  public async logOut(): Promise<void> {
    location.reload();
  }

  public ngOnDestroy(): void {
    this.destroy$.next();
  }

  private async calcReferredAddressPrice(): Promise<void> {
    // fullAccount is referredAddress and referralInput the address who referred
    if (this.fullAccount && this.referralInput) {
      this.referredPrice = await this.tokenCalculationService.getReferralPrice(this.referralInput, this.fullAccount);
      this.handleNotification('refer-success');
    }
  }

  private setProgressBar(): void {
    const element: HTMLElement | null = document.querySelector('.goal--progress-bar');
    if (element) {
      element.style.width = `${this.progressRaised * 100}%`;
    }
  }

  private changeAnimation(id: string): void {
    if (id === 'platform') {
      this.aboutState = 'show';
    }

    if (id === 'video') {
      this.videoState = 'show';
    }

    if (id === 'MVP') {
      this.mvpState = 'show';
    }

    if (id === 'news') {
      this.newsState = 'show';
    }

    if (id === 'team') {
      this.teamState = 'show';
    }

    if (id === 'token') {
      this.tokenState = 'show';
    }

    if (id === 'roadmap') {
      this.roadmapState = 'show';
    }

    if (id === 'chart-image') {
      this.chartImageState = 'show';
    }

    // if (id === 'waitlist') {
    //   this.waitlistState = 'show';
    // }
  }

  private isInViewport(element: any): boolean {
    const elementTop = element.offsetTop;
    const elementBottom = elementTop + element.offsetHeight;

    const viewportTop = document.documentElement.scrollTop;
    const viewportBottom = viewportTop + document.documentElement.clientHeight;

    return elementBottom > viewportTop && elementTop < viewportBottom - 100;
  }

  private handleNotification(type: string): void {
    if (type === 'success') {
      this.notificationObj.text = 'Wallet connected successfully!';
      this.notificationObj.type = type;
    };

    if (type === 'TRANSACTION-COMPLETED') {
      this.notificationObj.text = 'Transaction completed successfully!';
      this.notificationObj.type = 'success';
    }

    if (type === 'NOT-BINANCE-NETWORK') {
      this.notificationObj.text = 'Change your network to Binance Smart Chain.';
      this.notificationObj.type = 'warning';
    };

    if (type === 'METAMASK-MISSING') {
      this.notificationObj.text = 'MetaMask not installed!'
      this.notificationObj.type = 'warning';
    };

    if (type === 'METAMASK-NOT-CONNECTED') {
      this.notificationObj.text = 'MetaMask is locked or the user has not connected any accounts.';
      this.notificationObj.type = 'warning';
    };

    if (type === 'TRANSACTION-FAILED') {
      this.notificationObj.text = 'Oops, something went wrong, transaction failed!';
      this.notificationObj.type = 'warning';
    }

    if (type === 'METAMASK-PENDING-CONNECTION') {
      this.notificationObj.text = 'Already pending for connection, please open MetaMask.';
      this.notificationObj.type = 'warning';
    }

    if (type === 'ETHEREUM-NOT-FOUND') {
      this.notificationObj.text = 'Failed to connect. Do you have multiple wallets installed?';
      this.notificationObj.type = 'warning';
    }

    if (type === 'USER-REFUSED-CONNECTION') {
      this.notificationObj.text = 'Failed to connect. User rejected the request.';
      this.notificationObj.type = 'warning';
    }

    if (type === 'ACCOUNT-CHANGED') {
      this.restoreDepositInputs();
      this.notificationObj.text = `Account changed: ${this.fullAccount}`;
      this.notificationObj.type = 'success';
    }

    if (type === 'error') {
      this.notificationObj.text = 'Failed to connect. Please try again later!';
      this.notificationObj.type = 'warning';
    }

    if (type === 'BNB-empty') {
      this.notificationObj.text = 'Please enter BNB amount!';
      this.notificationObj.type = 'warning';
    }

    if (type === 'refer-success') {
      this.notificationObj.text = 'Referral added successfully!';
      this.notificationObj.type = 'success';
    }

    if (type === 'address-referred') {
      this.notificationObj.text = 'This address already referred! Please enter another wallet to refer.';
      this.notificationObj.type = 'warning';
    }

    if (type === 'same-account-and-address') {
      this.notificationObj.text = 'You cannot refer yourself! Please enter your friends address.';
      this.notificationObj.type = 'warning';
    }

    if (type === 'bad-address') {
      this.notificationObj.text = 'Incorrect wallet address!';
      this.notificationObj.type = 'warning';
    }

    if (type === 'wallet-not-connected') {
      this.notificationObj.text = 'Please connect your wallet to refer a friend!';
      this.notificationObj.type = 'warning';
    }

    this.notificationAnimationStatus = 'show';
    setTimeout(() => {
      this.notificationAnimationStatus = 'hide';
    }, 3300);
  }

  private restoreDepositInputs(): void {
    this.bnbAmount = undefined;
    this.alphaTokenAmount = undefined;
    this.referralAddress = undefined;
    this.referralInput = undefined;
    this.referredPrice = undefined;
    this.referralAccount = undefined;
  }
}
