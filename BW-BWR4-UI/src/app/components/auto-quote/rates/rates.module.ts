import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RatesRoutingModule } from './rates-routing.module';
import { AngularMaterialModule } from 'src/app/modules/angular-material/angular-material.module';
import { ReactiveFormsModule } from '@angular/forms';
import { RatesComponent } from './rates.component';
import { PolicyFeesComponent } from 'src/app/shared/components/policy-fees/policy-fees.component';
import { SharedModule } from 'src/app/modules/shared/shared.module';


@NgModule({
  declarations: [RatesComponent,],
  imports: [
    CommonModule,
    RatesRoutingModule,
    AngularMaterialModule,
    ReactiveFormsModule,
    SharedModule
  ],
  exports: []
})
export class RatesModule { }
