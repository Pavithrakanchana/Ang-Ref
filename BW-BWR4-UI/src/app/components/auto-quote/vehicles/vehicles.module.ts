import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VehiclesRoutingModule } from './vehicles-routing.module';
import { AngularMaterialModule } from 'src/app/modules/angular-material/angular-material.module';
import { ReactiveFormsModule } from '@angular/forms';
import { VehiclesComponent } from './vehicles.component';
import { VehiclesListComponent } from './vehicles-list/vehicles-list.component';
import { SharedModule } from 'src/app/modules/shared/shared.module';

@NgModule({
  declarations: [VehiclesComponent, VehiclesListComponent],
  imports: [
    CommonModule,
    VehiclesRoutingModule,
    AngularMaterialModule,
    ReactiveFormsModule,
    SharedModule,
  ],
  exports: [VehiclesComponent,VehiclesListComponent]

})
export class VehiclesModule { }
