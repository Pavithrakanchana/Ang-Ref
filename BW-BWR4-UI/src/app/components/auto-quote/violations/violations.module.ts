import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ViolationsRoutingModule } from './violations-routing.module';
import { ViolationsComponent } from './violations.component';
import { AngularMaterialModule } from 'src/app/modules/angular-material/angular-material.module';
import { ReactiveFormsModule } from '@angular/forms';
import { AddViolationComponent } from './add-violation/add-violation.component';
import { DeleteViolationDialogComponent } from './delete-violation-dialog/delete-violation-dialog.component';
import { SharedModule } from 'src/app/modules/shared/shared.module';

@NgModule({
  declarations: [
    ViolationsComponent, 
    AddViolationComponent, 
    DeleteViolationDialogComponent],
  imports: [
    CommonModule,
    ViolationsRoutingModule,
    AngularMaterialModule,
    ReactiveFormsModule,
    SharedModule
  ],
  //exports: [ViolationsComponent]
})
export class ViolationsModule { }
