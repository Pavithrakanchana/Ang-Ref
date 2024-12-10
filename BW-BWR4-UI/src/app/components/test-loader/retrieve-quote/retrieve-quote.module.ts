import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RetrieveQuoteRoutingModule } from './retrieve-quote-routing.module';
import { RetrieveQuoteComponent } from './retrieve-quote.component';


@NgModule({
  declarations: [RetrieveQuoteComponent],
  imports: [
    CommonModule,
    RetrieveQuoteRoutingModule
  ]
})
export class RetrieveQuoteModule { }
