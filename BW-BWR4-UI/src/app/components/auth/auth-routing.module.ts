import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthComponent } from './auth.component';
import { RouterModule, Routes } from '@angular/router';


const applicantroutes: Routes = [
  { path: '', component: AuthComponent },
];

@NgModule({
  declarations: [],
  imports: [RouterModule.forChild(applicantroutes)],
  exports: [RouterModule]
})
export class AuthRoutingModule { }
