import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RetrieveQuoteComponent } from './retrieve-quote.component';

const routes: Routes = [
  { path: '', component: RetrieveQuoteComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RetrieveQuoteRoutingModule { }
