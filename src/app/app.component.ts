import { Component, HostListener, OnChanges, OnDestroy, OnInit, QueryList, SimpleChanges, ViewChildren } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import * as feather from 'feather-icons';
import * as Highcharts from 'highcharts';
import highcharts3D from 'highcharts/highcharts-3d'
import darkUnica from 'highcharts/themes/gray';
import { AnimationOptions } from 'ngx-lottie';
import { Subject, takeUntil } from 'rxjs';
import { animationsArray } from './animations/animations';
import { ReferralData, ResultTypes } from './services/types/types';
import { SubscriberService } from './services/subscriber.service';
import { Web3Service } from './services/web3.service';
import { LoadingService } from './services/loading.service';
import { AccountBalanceService } from './services/account-balance.service';
import { TokenCalculationService } from './services/token-calculation.service';
import { ReferralService } from './services/referral.service';

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
export class AppComponent implements OnInit, OnDestroy, OnChanges {
  @ViewChildren('element1, element2, element3, element4, element5, element6, element7, element8, chartImage') private elements!: QueryList<any>;
  public isWalletModalOpen = false;
  public isReferModalOpen = false;
  public isReferButtonDisabled = false;
  public addressAlreadyReferred = false;
  public referDiscount: number | undefined;
  public detectedElements: any[] = [];
  public expanded = false;
  public account: string = '';
  public fullAccount: string | undefined;
  public accountLoggedIn: boolean = false;
  public referredAddress: string | undefined;
  public walletNotConnected = false;
  public notificationObj = {
    type: '',
    text: ''
  };
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
  public referState = 'hide';
  public subscribeForm: FormControl = new FormControl('', [Validators.required, Validators.email]);
  public formInvalid = false;
  public showWaitlist = false;
  public isLoading = false;
  public referAddressEmpty = false;
  public invalidReferAddress = false;
  public alphaTokenAmount: number | undefined;
  public bnbAmount: number | undefined;
  public accountAlphaTokenDeposit: number | undefined;
  public accountCurrentBalance: string | undefined;
  public lottieOptions: AnimationOptions = {
    path: '/assets/animations.json'
  };
  public chartOptions: any = {
    chart: {
      type: 'pie',
      options3d: {
        enabled: true,
        alpha: 45,
        beta: 0
      },
      backgroundColor: '#000000'
    },
    title: {
      text: ''
    },
    credits: {
      enabled: false
    },
    accessibility: {
      point: {
        valueSuffix: '%'
      }
    },
    tooltip: {
      pointFormat: '{series.name}: <b>{point.y}</b>'
    },
    plotOptions: {
      pie: {
        allowPointSelect: true,
        cursor: 'pointer',
        depth: 50,
        dataLabels: {
          enabled: false
        },
        showInLegend: true
      }
    },
    legend: {
      backgroundColor: '#000000',
      itemStyle: {
        fontFamily: 'Rubik',
        color: '#a0a0a0'
    }
    },
    series: [{
      type: 'pie',
      name: 'Token share',
      data: [
        {
          name: 'Community building',
          y: 370000000,
          sliced: true,
          selected: true
        },
        {
          name: 'Reserve',
          y: 50000000
        },
        {
          name: 'Team/Advisory',
          y: 180000000
        },
        {
          name: 'Marketing',
          y: 80000000
        },
        {
          name: 'Public sale',
          y: 40000000
        },
        {
          name: 'Initial swap',
          y: 40000000
        },
        {
          name: 'Private sale',
          y: 140000000
        },
        {
          name: 'Marketing',
          y: 50000000
        },
        {
          name: 'Reserve',
          y: 50000000
        }
      ]
    }]
  };
  private destroy$: Subject<void> = new Subject();

  @HostListener('window:scroll', ['$event']) public onScroll(): void {
    this.detectElement();
  }

  @HostListener('document:click', ['$event']) public onDocumentClick(): void {
    this.waitlistState = 'hide';
    this.referState = 'hide';
    this.connectWalletState = 'hide';
    this.referAddressEmpty = false;
    this.invalidReferAddress = false;
    this.addressAlreadyReferred = false;
    setTimeout(() => {
      this.showWaitlist = false;
      this.isWalletModalOpen = false;
      this.isReferModalOpen = false;
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

  public ngOnChanges(changes: SimpleChanges): void {
    console.log(changes);
  }

  public async ngOnInit(): Promise<void> {
    feather.replace();
    Highcharts.chart('token-pie', this.chartOptions);
    this.web3Service.setAccount.pipe(takeUntil(this.destroy$)).subscribe(account => {
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
          this.balanceAnimationState =  'hide';
        }, 2500);
      }
    });
    this.accountBalanceService.getAlphaTokenDeposit.pipe(takeUntil(this.destroy$)).subscribe(deposit => this.accountAlphaTokenDeposit = deposit);
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

  public openReferModal($event: any): void {
    $event.stopPropagation();
    this.isReferModalOpen = true;
    setTimeout(() => {
      this.referState = 'show';
    });
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

  public async referFriend(): Promise<void> {
    if (!this.fullAccount) {
      this.walletNotConnected = true;

      return;
    }

    if (!this.referredAddress) {
      this.referAddressEmpty = true;

      return;
    }

    // Check if valid eth wallet address
    if (!this.web3Service.checkWalletAddress(this.referredAddress)) {
      this.invalidReferAddress = true;

      return;
    }

    // Check if address has been referred before
    const referredAddress: ReferralData = await this.referralService.getReferredAddress(this.referredAddress);
    console.log(referredAddress);
    if (referredAddress) {
      this.addressAlreadyReferred = true;

      return;
    }

    this.referDiscount = 1.2;
    this.alphaTokenAmount = this.alphaTokenAmount ? this.alphaTokenAmount * 1.2 : this.alphaTokenAmount;

    this.referAddressEmpty = false;
    this.invalidReferAddress = false;
    this.isReferModalOpen = false;
    this.addressAlreadyReferred = false;
    this.referState = 'hide';
    setTimeout(() => {
      this.isReferModalOpen = false;
    }, 300);
    this.isReferButtonDisabled = true;
    this.handleNotification('refer-success');
  }

  public async connectWallet(): Promise<void> {
    this.web3Service.startApp();
    this.connectWalletState = 'hide';
    this.referState = 'hide';
    this.walletNotConnected = false;
    setTimeout(() => {
      this.isWalletModalOpen = false;
      this.isReferModalOpen = false;
    }, 300);
  }

  // TODO
  // error handling
  // check if user has any BNB
  // check if user has more then trying to transfer

  public async sendToken(): Promise<void> {
    if (this.bnbAmount) {
      this.isLoading = true;
      await this.web3Service.sendTransaction(this.bnbAmount, this.referredAddress);
      this.bnbAmount = 0;
      this.alphaTokenAmount = undefined;
      this.referredAddress = undefined;
      this.referDiscount = undefined;
    } else {
      this.handleNotification('BNB-empty');
    }
  }

  public async convertBnbToAlpha(): Promise<void> {
    if (this.bnbAmount) {
      console.log(this.bnbAmount);
      const price: number = await this.tokenCalculationService.calculatePrice(this.bnbAmount);
      this.alphaTokenAmount = Math.round(this.bnbAmount * price * 10000) / 10000;
      this.referDiscount ? this.alphaTokenAmount = this.alphaTokenAmount * this.referDiscount : this.alphaTokenAmount;
      if (this.fullAccount) {
        const isFromReferralList: ReferralData | undefined = await this.referralService.getReferredAddress(this.fullAccount);
        isFromReferralList ? this.alphaTokenAmount = this.alphaTokenAmount * 1.2 : this.alphaTokenAmount;
      }
      console.log(this.alphaTokenAmount);
    } else {
      this.handleNotification('BNB-empty');
      this.alphaTokenAmount = undefined;
    }
  }

  public async logOut(): Promise<void> {
    location.reload();
  }

  public ngOnDestroy(): void {
    this.destroy$.next();
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

    this.notificationAnimationStatus = 'show';
    setTimeout(() => {
      this.notificationAnimationStatus = 'hide';
    }, 3300);
  }
}
