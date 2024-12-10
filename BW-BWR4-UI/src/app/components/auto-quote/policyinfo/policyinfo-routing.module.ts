import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { PolicyinfoComponent } from "./policyinfo.component";

const routes: Routes = [
    { path: '', component: PolicyinfoComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PolicyinfoRoutingModule { }