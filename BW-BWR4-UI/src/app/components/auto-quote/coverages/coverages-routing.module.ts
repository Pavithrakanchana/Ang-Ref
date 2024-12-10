import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CoveragesComponent } from './coverages.component';

const coveragesroutes: Routes = [
{ path: '', component: CoveragesComponent }
];

@NgModule({
  imports: [RouterModule.forChild(coveragesroutes)],
  exports: [RouterModule]
})
export class CoveragesRoutingModule { }
