import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { LottieModule } from 'ngx-lottie';
import player from 'lottie-web';

import { AppComponent } from './app.component';

import { SubscriberService } from './services/subscriber.service'
import { Web3Service } from './services/web3.service';
import { LoadingService } from './services/loading.service';
import { AccountBalanceService } from './services/account-balance.service';
import { TokenCalculationService } from './services/token-calculation.service';

import { NumberOnlyDirective } from './directives/numbers-only.directive';

export function playerFactory() {
  return player;
}

@NgModule({
  declarations: [
    AppComponent,
    NumberOnlyDirective
  ],
  imports: [
    BrowserModule,
    NgbModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    HttpClientModule,
    FormsModule,
    LottieModule.forRoot({ player: playerFactory })
  ],
  providers: [
    SubscriberService,
    Web3Service,
    LoadingService,
    AccountBalanceService,
    TokenCalculationService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
