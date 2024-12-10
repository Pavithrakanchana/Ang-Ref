import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatNativeDateModule, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AngularMaterialModule } from 'src/app/modules/angular-material/angular-material.module';
import { SharedModule } from 'src/app/modules/shared/shared.module';
import { ConfirmatioRoutingModule } from './confirmatio-routing.module';
import { ConfimationComponent } from './confimation.component';
import { ESignatureDialogPopupComponent } from 'src/app/shared/dialog/eSignature-dialog-popup/e-signature-dialog-popup.component';



@NgModule({
  providers: [{provide: MAT_DATE_LOCALE, useValue: 'en-US'} ],
  declarations: [
    ConfimationComponent,
    ESignatureDialogPopupComponent

  ],
  imports: [
    CommonModule,
    ConfirmatioRoutingModule,
    NgbModule,
    AngularMaterialModule,
    ReactiveFormsModule,
    SharedModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  exports: [ConfimationComponent]
})
export class ConfirmationModule { }
