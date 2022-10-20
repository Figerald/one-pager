import { Component, ElementRef, HostListener, OnDestroy, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import * as feather from 'feather-icons';
import * as Highcharts from 'highcharts';
import highcharts3D from 'highcharts/highcharts-3d'
import darkUnica from 'highcharts/themes/gray';
import { AnimationOptions } from 'ngx-lottie';
import { debounceTime, distinctUntilChanged, map, Subject, takeUntil } from 'rxjs';
import { animationsArray } from './animations/animations';
import { ResultTypes, WalletInformation } from './services/types/types';
import { SubscriberService } from './services/subscriber.service';
import { Web3Service } from './services/web3.service';
import { LoadingService } from './services/loading.service';
import { AccountBalanceService } from './services/account-balance.service';
import { TokenCalculationService } from './services/token-calculation.service';
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
  @ViewChild('notification') public notificationHeader!: ElementRef<HTMLDivElement>;
  @ViewChildren('element1, element2, element3, element4, element5, element6, element7, element8, chartImage') private elements!: QueryList<any>;
  public isWalletModalOpen = false;
  public detectedElements: any[] = [];
  public expanded = false;
  public account: string = '';
  public fullAccount: string | undefined;
  // Account which referred another account
  public accountLoggedIn: boolean = false;
  public referralPrice: number | undefined;
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
  public isCheckingAddress = false;
  public isValidBNBAmount = true;
  public alphaTokenAmount: number | undefined;
  public bonusAlphaToken: number | undefined;
  public walletInformation: WalletInformation[] | undefined;
  public accountCurrentBalance: string | undefined;
  public lottieOptions: AnimationOptions = {
    path: '/assets/animations.json'
  };
  public chartOptions: any = chartOptions;
  public referralAddressControl: FormControl = new FormControl('');
  public bnbAmountControl: FormControl = new FormControl('');
  public disclaimerCheckbox: FormControl = new FormControl();
  private destroy$: Subject<void> = new Subject();

  @HostListener('window:scroll', ['$event']) public onScroll(): void {
    if (document.documentElement.scrollTop > 100) {
      this.notificationHeader.nativeElement.style.height = '0';
      this.notificationHeader.nativeElement.querySelector('.header-notification--button')?.setAttribute('style', 'opacity: 0');
      document.getElementById('header-mobile')!.style.top = '0';
    }
    if (document.documentElement.scrollTop < 100) {
      this.notificationHeader.nativeElement.style.height = '45px';
      this.notificationHeader.nativeElement.querySelector('.header-notification--button')?.setAttribute('style', 'opacity: 1');
      document.getElementById('header-mobile')!.style.top = '45px';
    }
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
    private readonly tokenCalculationService: TokenCalculationService) {
    this.web3Service.getResults.pipe(takeUntil(this.destroy$)).subscribe((result: ResultTypes) => {
      if (result) {
        this.handleNotification(result);
      }
    });
    this.loadingService.getLoading.pipe(takeUntil(this.destroy$)).subscribe(loading => this.isLoading = loading);
  }

  public get referralInput(): string | undefined {
    return this.referralAddressControl.value;
  }

  public get bnbAmount(): number | undefined {
    return this.bnbAmountControl.value;
  }

  public get isDisclaimerChecked(): any {
    return this.disclaimerCheckbox.value;
  }

  public async ngOnInit(): Promise<void> {
    feather.replace();
    Highcharts.chart('token-pie', this.chartOptions);

    this.web3Service.setAccount.pipe(takeUntil(this.destroy$)).subscribe(async (account: string) => {
      if (account) {
        this.account = `${account.substring(0, 4)}...${account.slice(-4)}`;
        this.fullAccount = account;
      }
    });

    this.web3Service.getAccountBalance.pipe(takeUntil(this.destroy$)).subscribe(balance => {
      if (balance) {
        this.accountCurrentBalance = balance;
        this.balanceAnimationState = 'show';
        setTimeout(() => {
          this.balanceAnimationState = 'hide';
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

    this.bnbAmountControl.valueChanges
      .pipe(debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$))
      .subscribe(async () => {
        this.isValidBNBAmount = true;
        if (this.bnbAmountControl.status !== 'VALID') {
          this.isValidBNBAmount = false;
          this.alphaTokenAmount = undefined;
        } else {
          await this.convertBnbToAlpha();
        }
      });

    this.referralAddressControl.valueChanges
      .pipe(map((val) => {
        this.isCheckingAddress = true;
        return val
      }),
        debounceTime(1000),
        distinctUntilChanged(),
        takeUntil(this.destroy$))
      .subscribe(async () => {
        await this.checkReferredAddress()
        this.isCheckingAddress = false;
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
    // document.getElementById('header-wrapper')!.style.height = this.expanded ? '485px' : '0';
  }

  public scroll(el: HTMLElement): void {
    const top: number = el.offsetTop - 75;
    window.scrollTo({ top, behavior: 'smooth' });
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
    this.referralAddressControl.setValue(undefined);
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
      if (this.referralInput && this.referralPrice) {
        await this.web3Service.sendReferralTransaction(this.bnbAmount, this.referralPrice, this.referralInput);
      } else {
        await this.web3Service.sendTransaction(this.bnbAmount);
      }
      this.restoreDepositInputs();
    } else {
      this.handleNotification('BNB-empty');
    }
  }

  public async convertBnbToAlpha(): Promise<number | undefined> {
    this.bonusAlphaToken = undefined;

    if (this.bnbAmount) {
      // Calc for referred address
      if (this.referralInput && this.referralPrice) {
        this.calculateToken();

        return;
      }
      const price: number = await this.tokenCalculationService.calculatePrice();
      return this.alphaTokenAmount = Math.round(this.bnbAmount * price * 100) / 100;
    } else {
      // this.handleNotification('BNB-empty');
      return this.alphaTokenAmount = undefined;
    }
  }

  public async checkReferredAddress(): Promise<void> {
    // return if wallet not connected
    if (!this.fullAccount) {
      return this.handleNotification('wallet-not-connected');
    }

    if (this.referralInput) {
      this.referralPrice = undefined;
      this.bonusAlphaToken = undefined;
      // TODO: START ANIMATION AND STOP FROM ADDING INPUT

      // Check if address is valid ETH wallet address
      if (!this.web3Service.checkWalletAddress(this.referralInput)) {
        this.convertBnbToAlpha();

        return this.handleNotification('bad-address');
      }

      // Check if referred address is not the same connected
      if (this.fullAccount && this.fullAccount.toLowerCase() === this.referralInput.toLowerCase()) {
        this.convertBnbToAlpha();

        return this.handleNotification('same-account-and-address');
      }

      const accountData: WalletInformation[] = await this.accountBalanceService.getAccountData(this.referralInput);
      // Check if address has a trx and throw notification for account without trx and return
      if (accountData && accountData.length === 0) {
        this.convertBnbToAlpha();

        return this.handleNotification('account-without-trx');
      }

      // Find price from latest transaction
      const price: number = accountData.reduce((acc, curr) => new Date(acc.created_at) > new Date(curr.created_at) ? acc : curr).price;
      this.referralPrice = price;

      if (this.bnbAmount) {
        this.calculateToken();
      }

      this.handleNotification('refer-success');
    }
  }

  public async logOut(): Promise<void> {
    location.reload();
  }

  public ngOnDestroy(): void {
    this.destroy$.next();
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

    if (type === 'already-referred') {
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
      this.notificationObj.text = 'Please connect your wallet to get a referral!';
      this.notificationObj.type = 'warning';
    }

    if (type === 'refer-success') {
      this.notificationObj.text = 'Referral bonus added successfully!';
      this.notificationObj.type = 'success';
    }

    if (type === 'account-without-trx') {
      this.notificationObj.text = 'This address does not have a referral!';
      this.notificationObj.type = 'warning';
    }

    this.notificationAnimationStatus = 'show';
    setTimeout(() => {
      this.notificationAnimationStatus = 'hide';
    }, 3300);
  }

  private restoreDepositInputs(): void {
    this.bnbAmountControl.setValue(undefined);
    this.alphaTokenAmount = undefined;
    this.referralAddressControl.setValue(undefined);
    this.bonusAlphaToken = undefined;
    this.disclaimerCheckbox.setValue(false);
  }

  private parseNumber(num: number): number | undefined {
    const floatNumber: RegExpMatchArray | null = num.toString().match(/^-?\d+(?:\.\d{0,2})?/);
    if (floatNumber) {
      return parseFloat(floatNumber[0]);
    }

    return undefined;
  }

  private calculateToken(): void {
    if (this.bnbAmount && this.referralPrice) {
      this.alphaTokenAmount = Math.round(this.bnbAmount * this.referralPrice * 100) / 100;
      this.bonusAlphaToken = this.parseNumber(this.alphaTokenAmount * 0.1);
    }
  }
}
