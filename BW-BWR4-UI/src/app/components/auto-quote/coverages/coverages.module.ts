import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoveragesRoutingModule } from './coverages-routing.module';
import { CoveragesComponent } from './coverages.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AngularMaterialModule } from 'src/app/modules/angular-material/angular-material.module';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/modules/shared/shared.module';

@NgModule({
  declarations: [CoveragesComponent],
  imports: [
    CommonModule,
    CoveragesRoutingModule,
    NgbModule,
    AngularMaterialModule,
    ReactiveFormsModule,
    SharedModule
  ],
  exports: [CoveragesComponent]
})
export class CoveragesModule { }
