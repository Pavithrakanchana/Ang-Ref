import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatNativeDateModule, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AngularMaterialModule } from 'src/app/modules/angular-material/angular-material.module';
import { SharedModule } from 'src/app/modules/shared/shared.module';
import { LossPayeePopupComponent } from 'src/app/shared/dialog/loss-payee-popup/loss-payee-popup.component';
import { ProducerNamePopupDialogComponent } from 'src/app/shared/dialog/producer-name-popup-dialog/producer-name-popup-dialog.component';
import { ApplicationRoutingModule } from './application-routing.module';
import { ApplicationComponent } from './application.component';
import { DeleteLosspayeeAdditionalInterestDialogComponent } from './delete-losspayee-additional-interest-dialog/delete-losspayee-additional-interest-dialog.component';

@NgModule({
  providers: [{provide: MAT_DATE_LOCALE, useValue: 'en-US'} ],
  declarations: [
    ApplicationComponent,
    ProducerNamePopupDialogComponent,
    LossPayeePopupComponent,
    DeleteLosspayeeAdditionalInterestDialogComponent
  ],
  imports: [
    CommonModule,
    ApplicationRoutingModule,
    NgbModule,
    AngularMaterialModule,
    ReactiveFormsModule,
    SharedModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
 exports: [ApplicationComponent]
})
export class ApplicationModule { }
