import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { AppComponent } from './app.component';
import { SubscriberService } from './services/subscriber.service'
import { HttpClientModule } from '@angular/common/http';
import { Web3Service } from './services/web3.service';
import { LoadingService } from './services/loading.service';
import { AccountBalanceService } from './services/account-balance.service';
import { LottieModule } from 'ngx-lottie';
import player from 'lottie-web';
import { TokenCalculationService } from './services/token-calculation.service';
import { ReferralService } from './services/referral.service';

export function playerFactory() {
  return player;
}

@NgModule({
  declarations: [
    AppComponent
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
    TokenCalculationService,
    ReferralService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
