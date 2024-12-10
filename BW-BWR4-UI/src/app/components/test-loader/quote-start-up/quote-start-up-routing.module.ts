import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { QuoteStartUpComponent } from './quote-start-up.component';

const routes: Routes = [
  { path: '', component: QuoteStartUpComponent }
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: []
})
export class QuoteStartUpRoutingModule { }
