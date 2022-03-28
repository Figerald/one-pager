import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { AppComponent } from './app.component';
import { SubscriberService } from './services/subscriber.service'
import { HttpClientModule } from '@angular/common/http';
import { Web3Service } from './services/web3.service';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    NgbModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    HttpClientModule
  ],
  providers: [SubscriberService, Web3Service],
  bootstrap: [AppComponent]
})
export class AppModule { }
