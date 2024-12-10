import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ConfimationComponent } from './confimation.component';


const confirmationroutes: Routes = [
  { path: '', component: ConfimationComponent },
];

@NgModule({
  imports: [RouterModule.forChild(confirmationroutes)],
  exports: [RouterModule]
})
export class ConfirmatioRoutingModule { }


