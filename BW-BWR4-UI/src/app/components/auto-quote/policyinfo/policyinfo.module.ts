import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PolicyinfoComponent } from './policyinfo.component';
import { PolicyinfoRoutingModule } from './policyinfo-routing.module';
import { AngularMaterialModule } from 'src/app/modules/angular-material/angular-material.module';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/modules/shared/shared.module';



@NgModule({
  declarations: [PolicyinfoComponent],
  imports: [
    CommonModule,
    PolicyinfoRoutingModule,
    AngularMaterialModule,
    ReactiveFormsModule,
    SharedModule
  ]
})
export class PolicyinfoModule { }
