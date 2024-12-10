import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ViolationsComponent } from './violations.component';

const routes: Routes = [{ path: '', component: ViolationsComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ViolationsRoutingModule { }
