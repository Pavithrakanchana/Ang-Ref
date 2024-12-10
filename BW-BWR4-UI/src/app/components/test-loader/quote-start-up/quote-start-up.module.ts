import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AngularMaterialModule } from 'src/app/modules/angular-material/angular-material.module';
import { SharedModule } from 'src/app/modules/shared/shared.module';
import { QuoteStartUpRoutingModule } from './quote-start-up-routing.module';
import { QuoteStartUpComponent } from './quote-start-up.component';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [QuoteStartUpComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    QuoteStartUpRoutingModule,
    AngularMaterialModule,
      SharedModule
  ]
})
export class QuoteStartUpModule { }
