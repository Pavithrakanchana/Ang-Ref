import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ExitComponent } from '../shared/components/exit/exit.component';
import { UnauthorizedComponent } from '../shared/components/unauthorized/unauthorized.component';
import { AuthGuard } from '../shared/guards/auth.guard';
import { DevresourcesGuard } from '../shared/guards/devresources.guard';

const routes: Routes = [
  { path: '', redirectTo: '/auth', pathMatch: 'full' },
  //{ path: 'auth', component: AuthComponent },
  {
    path: 'auth',
    loadChildren: () => import('../components/auth/auth.module').then(m => m.AuthModule)
  },
  {
    path: 'unauthorized',
    component: UnauthorizedComponent
  },
  {
    path: 'applicant',
    loadChildren: () => import('../components/auto-quote/applicant/applicant.module').then(m => m.ApplicantModule),
    canLoad: [AuthGuard],
    canActivate: [AuthGuard]
  },
  {
    path: 'drivers',
    loadChildren: () => import('../components/auto-quote/drivers/drivers.module').then(m => m.DriversModule),
    canLoad: [AuthGuard],
    canActivate: [AuthGuard]
  },
  {
    path: 'exit', component: ExitComponent
  },
  {
    path: 'vehicles',
    loadChildren: () => import('../components/auto-quote/vehicles/vehicles.module').then(m => m.VehiclesModule),
    canLoad: [AuthGuard],
    canActivate: [AuthGuard]
  },
  {
    path: 'violations',
    loadChildren: () => import('../components/auto-quote/violations/violations.module').then(m => m.ViolationsModule),
    canLoad: [AuthGuard],
    canActivate: [AuthGuard]
  },
  {
    path: 'coverages',
    loadChildren: () => import('../components/auto-quote/coverages/coverages.module').then(m => m.CoveragesModule),
    canLoad: [AuthGuard],
    canActivate: [AuthGuard]
  },
  {
    path: 'policyinfo',
    loadChildren: () => import('../components/auto-quote/policyinfo/policyinfo.module').then(m => m.PolicyinfoModule),
    canLoad: [AuthGuard],
    canActivate: [AuthGuard]
  },
  {
    path: 'rates',
    loadChildren: () => import('../components/auto-quote/rates/rates.module').then(m => m.RatesModule),
    canLoad: [AuthGuard],
    canActivate: [AuthGuard]
  },
  {
    path: 'application',
    loadChildren: () => import('../components/auto-quote/application/application.module').then(m => m.ApplicationModule),
    canLoad: [AuthGuard],
    canActivate: [AuthGuard]
  },
  {
    path: 'reports',
    loadChildren: () => import('../components/auto-quote/reports/reports.module').then(m => m.ReportsModule),
    canLoad: [AuthGuard],
    canActivate: [AuthGuard]
  },
  {
    path: 'review',
    loadChildren: () => import('../components/auto-quote/review/review.module').then(m => m.ReviewModule),
    canLoad: [AuthGuard],
    canActivate: [AuthGuard]
  },
  {
    path: 'confirmation',
    loadChildren: () => import('../components/auto-quote/confirmation/confirmation.module').then(m => m.ConfirmationModule),
    canLoad: [AuthGuard],
    canActivate: [AuthGuard]
  },
  {
    path: 'quotestartup',
    loadChildren: () => import('../components/test-loader/quote-start-up/quote-start-up.module').then(m => m.QuoteStartUpModule) //, canLoad: [DevresourcesGuard]
  },
  {
    path: 'retrievequote',
    loadChildren: () => import('../components/test-loader/retrieve-quote/retrieve-quote.module').then(m => m.RetrieveQuoteModule),
    canLoad: [DevresourcesGuard]
  }

  // TO:DO Page not found/ Error page launch
];
///////////////////////////////

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [],
  declarations: []
})
export class AppRoutingModule { }
