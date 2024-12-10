import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgIdleKeepaliveModule } from '@ng-idle/keepalive';
import { AngularMaterialModule } from './modules/angular-material/angular-material.module';
import { AppRoutingModule } from './routes/app-routing.module';
import { AppComponent } from './app.component';
import { FooterComponent } from './components/footer/footer.component';
import { HeaderComponent } from './components/header/header.component';
import { QuoteDataService } from './services/quote-data.service';
import { StepperComponent } from './shared/components/stepper/stepper.component';
import { QuoteSummaryComponent } from './shared/components/quote-summary/quote-summary.component';
import { QuoteSummaryDialogComponent } from './shared/components/quote-summary-dialog/quote-summary-dialog.component';
import { HttpClientModule } from '@angular/common/http';
import { StoreModule } from '@ngrx/store';
import { DatePipe } from '@angular/common';
import { DeleteVehicleDialogComponent } from './shared/dialog/delete-vehicle-dialog/delete-vehicle-dialog.component';
import { reducers, metaReducers } from './state/appstate.state';
import { HelpTextDialogComponent } from './shared/dialog/helptext-dialog/helptext-dialog.component';
import { VehicleVinPrefixPopupComponent } from './shared/dialog/vehicle-vin-prefix-popup/vehicle-vin-prefix-popup.component';
import { VehicleVinPrefillPopupComponent } from './shared/dialog/vehicle-vin-prefill-popup/vehicle-vin-prefill-popup.component';
import { NewAutoQuoteDialogComponent } from './shared/dialog/new-auto-quote-dialog/new-auto-quote-dialog.component';
import { ReviewUploaddocPopupComponent } from './shared/dialog/review-uploaddoc-popup/review-uploaddoc-popup.component';
import { SafePipe } from './shared/pipes/safe.pipe';
import { PaymentMethodComponent } from './shared/dialog/payment-method/payment-method.component';
import { SplPaymentMethodComponent } from './shared/dialog/spl-payment-dialog/spl-payment-dialog.component';
import { GoPaperlessPopupComponent } from './shared/dialog/go-paperless-popup/go-paperless-popup.component';
import { ExitComponent } from './shared/components/exit/exit.component';
import { PolicyDupcheckComponent } from './shared/dialog/policy-dupcheck/policy-dupcheck.component';
import { SaveExitPopupComponent } from './shared/dialog/save-exit-popup/save-exit-popup.component';
import { GenericDialogComponent } from './shared/dialog/generic-dialog/generic-dialog.component';
import { ChatComponent } from './shared/components/chat/chat.component';
import { AuthGuard } from './shared/guards/auth.guard';
import { DevresourcesGuard } from './shared/guards/devresources.guard';
import { UnauthorizedComponent } from './shared/components/unauthorized/unauthorized.component';
import { bwr4HttpInterceptorProviders } from './interceptors';

@NgModule({
    declarations: [
        AppComponent,
        FooterComponent,
        HeaderComponent,
        StepperComponent,
        QuoteSummaryComponent,
        QuoteSummaryDialogComponent,
        DeleteVehicleDialogComponent,
        HelpTextDialogComponent,
        VehicleVinPrefixPopupComponent,
        VehicleVinPrefillPopupComponent,
        NewAutoQuoteDialogComponent,
        ReviewUploaddocPopupComponent,
        SafePipe,
        PaymentMethodComponent,
        SplPaymentMethodComponent,
        GoPaperlessPopupComponent,
        ExitComponent,
        PolicyDupcheckComponent,
        SaveExitPopupComponent,
        GenericDialogComponent,
        ChatComponent,
        UnauthorizedComponent
    ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        NgbModule,
        FormsModule,
        ReactiveFormsModule,
        BrowserAnimationsModule,
        AngularMaterialModule,
        HttpClientModule,
        StoreModule.forRoot(reducers, { metaReducers }),
        NgIdleKeepaliveModule.forRoot()
    ],
    providers: [
        bwr4HttpInterceptorProviders,
        QuoteDataService,
        DatePipe,
        AuthGuard,
        DevresourcesGuard
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
