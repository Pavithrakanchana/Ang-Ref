import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DriversRoutingModule } from './drivers-routing.module';
import { DriversComponent } from './drivers.component';
import { DriversListComponent } from './drivers-list/drivers-list.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AngularMaterialModule } from 'src/app/modules/angular-material/angular-material.module';
import { ReactiveFormsModule } from '@angular/forms';
import { DeleteDriverDialogComponent } from 'src/app/shared/dialog/delete-driver-dialog/delete-driver-dialog.component';
import { SharedModule } from 'src/app/modules/shared/shared.module';


@NgModule({
  declarations: [DriversComponent,DriversListComponent,DeleteDriverDialogComponent],
  imports: [
    CommonModule,
    DriversRoutingModule,
    NgbModule,
    AngularMaterialModule,
    ReactiveFormsModule,
    SharedModule

  ],
  exports: [DriversComponent,DriversListComponent,DeleteDriverDialogComponent]
})
export class DriversModule { }
