import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ApplicantComponent } from './applicant.component';

const applicantroutes: Routes = [
  { path: '', component: ApplicantComponent },
];

@NgModule({
  imports: [RouterModule.forChild(applicantroutes)],
  exports: [RouterModule]
})
export class ApplicantRoutingModule { }
