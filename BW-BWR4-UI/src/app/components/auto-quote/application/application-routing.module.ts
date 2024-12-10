import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ApplicationComponent } from './application.component';

const applicantroutes: Routes = [
  { path: '', component: ApplicationComponent },
];

@NgModule({
  imports: [RouterModule.forChild(applicantroutes)],
  exports: [RouterModule]
})
export class ApplicationRoutingModule { }
