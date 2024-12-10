import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DateformatterDirective } from 'src/app/shared/directives/dateformatter.directive';
import { SsnMaskDirective } from 'src/app/shared/directives/ssn-mask.directive';
import { AppMessageComponent } from 'src/app/shared/components/app-message/app-message.component';
import { SortbyPipe } from 'src/app/shared/pipes/sortby.pipe';
import { ZipcodeFormatDirective } from 'src/app/shared/directives/zipcode-format.directive';
import { PolicyCoverageValidValues } from 'src/app/components/auto-quote/coverages/coverage-validvalues/policycoverage-validvalues.component';
import { VehicleCoverageValidvaluesComponent } from 'src/app/components/auto-quote/vehicles/vehicle-validvalues/vehiclecoverage-validvalues.component';
import { ReactiveFormsModule } from '@angular/forms';
import { AngularMaterialModule } from '../angular-material/angular-material.module';
import { PayplansComponent } from 'src/app/shared/components/payplans/payplans.component';
import { ViolationsListComponent } from 'src/app/components/auto-quote/violations/violations-list/violations-list.component';
import { PhoneFormatDirective } from 'src/app/shared/directives/phone-format.directive';

import { PaymentMethodsComponent } from 'src/app/shared/components/payment-methods/payment-methods.component';
import { PremiumComponent } from 'src/app/shared/components/premium/premium.component';
import { AddressComponent } from '../../shared/components/address/address.component';
import { PolicyFeesComponent } from 'src/app/shared/components/policy-fees/policy-fees.component';
import { DisableDirective } from '../../shared/directives/disable.directive';

@NgModule({
  declarations: [
    DateformatterDirective,
    SsnMaskDirective,
    AppMessageComponent,
    SortbyPipe,
    ZipcodeFormatDirective,
    PolicyCoverageValidValues,
    VehicleCoverageValidvaluesComponent,
    PayplansComponent,
    ViolationsListComponent,
    PhoneFormatDirective,
    PaymentMethodsComponent,
    PremiumComponent,
    AddressComponent,
    PolicyFeesComponent,
    DisableDirective
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AngularMaterialModule,
  ],
  exports: [
    DateformatterDirective,
    SsnMaskDirective,
    AppMessageComponent,
    SortbyPipe,
    ZipcodeFormatDirective,
    PolicyCoverageValidValues,
    VehicleCoverageValidvaluesComponent,
    PayplansComponent,
    ViolationsListComponent,
    PhoneFormatDirective,
    PaymentMethodsComponent,
    PremiumComponent,
    AddressComponent,
    PolicyFeesComponent,
    DisableDirective
  ]
})
export class SharedModule {

}
