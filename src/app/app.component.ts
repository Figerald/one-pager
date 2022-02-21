import { Component, HostListener, OnInit, QueryList, ViewChildren } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import * as feather from 'feather-icons';
import * as Highcharts from 'highcharts';
import highcharts3D from 'highcharts/highcharts-3d'
import darkUnica from 'highcharts/themes/gray';
import { animationsArray } from './animations/animations';
import { SubscriberService } from './services/subscriber.service';

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
export class AppComponent implements OnInit {
  @ViewChildren('element1, element2, element3, element4, element5, element6, element7, element8, chartImage') private elements!: QueryList<any>;
  public detectedElements: any[] = [];
  public expanded = false;
  public aboutState = 'hide';
  public videoState = 'hide';
  public mvpState = 'hide';
  public newsState = 'hide';
  public teamState = 'hide';
  public waitlistState = 'hide';
  public tokenState = 'hide';
  public roadmapState = 'hide';
  public chartImageState = 'hide';
  public subscribeForm: FormControl = new FormControl('', [Validators.required, Validators.email]);
  public formInvalid = false;
  public showWaitlist = false;
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
          y: 370000000
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

  @HostListener('window:scroll', ['$event']) public onScroll(): void {
    this.detectElement();
  }

  @HostListener('document:click', ['$event']) public onDocumentClick(): void {
    this.waitlistState = 'hide';
    this.showWaitlist = false;
  }

  public constructor(private readonly subscriberService: SubscriberService) {
  }

  public ngOnInit(): void {
    feather.replace();
    Highcharts.chart('token-pie', this.chartOptions);
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

    // if (id === 'news') {
    //   this.newsState = 'show';
    // }

    // if (id === 'team') {
    //   this.teamState = 'show';
    // }

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
}
