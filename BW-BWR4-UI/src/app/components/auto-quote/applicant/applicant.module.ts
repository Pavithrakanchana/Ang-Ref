import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApplicantRoutingModule } from './applicant-routing.module';
import { ApplicantComponent } from './applicant.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AngularMaterialModule } from 'src/app/modules/angular-material/angular-material.module';
import { ReactiveFormsModule } from '@angular/forms';
import { MaskinputPipe } from 'src/app/shared/pipes/maskinput.pipe';
//import { ZipcodeFormatDirective } from 'src/app/shared/directives/zipcode-format.directive'; (import from SharedModule)
import { SharedModule } from 'src/app/modules/shared/shared.module';
import { PopupMailingAddressComponent } from 'src/app/shared/dialog/popup-mailing-address/popup-mailing-address.component';
import {MAT_DATE_LOCALE, MatNativeDateModule} from '@angular/material/core';
import {MatDatepickerModule} from '@angular/material/datepicker';

@NgModule({
  providers: [{provide: MAT_DATE_LOCALE, useValue: 'en-US'} ],
  declarations: [
    ApplicantComponent,
    MaskinputPipe,
    //ZipcodeFormatDirective, (import from SharedModule)
    PopupMailingAddressComponent
  ],
  imports: [
    CommonModule,
    ApplicantRoutingModule,
    NgbModule,
    AngularMaterialModule,
    ReactiveFormsModule,
    SharedModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
 exports: [ApplicantComponent]
})
export class ApplicantModule { }
