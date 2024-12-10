import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DriversListComponent } from './drivers-list/drivers-list.component';
import { DriversComponent } from './drivers.component';

/*const driverroutes: Routes = [
  { path: '', component: DriversComponent },
];*/

const driverroutes: Routes = [
  { path: '', 
  component: DriversComponent,
  children :[
    { path: 'driverslist', component: DriversListComponent}],
 },
];


@NgModule({
  imports: [RouterModule.forChild(driverroutes)],
  exports: [RouterModule]
})
export class DriversRoutingModule { }
