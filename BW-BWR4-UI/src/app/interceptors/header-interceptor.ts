import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Store } from '@ngrx/store';
import QuoteSummary from '../state/model/summary.model';

@Injectable()
export class HeaderInterceptor implements HttpInterceptor {

  policyState!: string;
  mco!: string;
  pco!: string;
  constructor(private store: Store<{ quoteSummary: QuoteSummary }>) {
    this.store.select('quoteSummary').subscribe(data => {

      this.policyState = data.policyState;
      this.mco = data.mco;
    });
  }
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // TODO: Temp fix for Payments URL
    const isPaymentURL: boolean = req.url.indexOf('pymtms/') !== -1;
    const isAutoPayRequest: boolean = req.url.indexOf('recurringSetup') !== -1;
    // console.log('IP Address :::: ', req.headers.get('x-forwarded-for'));

    const modifiedReq = req.clone({
      headers: req.headers.append('frms_ipaddress', '10.140.229.154')
                          .append('frms_state', this.policyState)
                          .append('frms_brand', isAutoPayRequest ? this.mco.concat('00') : 'BW')
                          .append('frms_lob', 'APV')
                          .append('frms_source', 'BWR')
                          .append('frms_region', isPaymentURL ? `${environment.paymentRegion}` : 'Local')
                          .append('frms_tid', '9999999999')
                          .append('frms_appid', 'Select4.0')
                          .append('client_id', `${environment.muleClientId}`)
                          .append('client_secret', `${environment.muleClientSecret}`)
                          .append('Content-Type', 'application/json')
    });
    return next.handle(modifiedReq);
  }
}
