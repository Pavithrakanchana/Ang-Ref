import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { GlobalConstants } from '../constants/global.constant';
import { BindRequest, DownPayment, Quote } from '../shared/model/bind/bind-request';
import QuoteSummary from '../state/model/summary.model';

@Injectable({
  providedIn: 'root'
})
export class BindService {

  constructor(private httpClient: HttpClient, private store: Store<{ quoteSummary: QuoteSummary }>) { }

  bindQuote(req: BindRequest): Observable<object> {
    const bindQuoteAPIUrl = `${environment.baseUrl}${environment.bindAPI}`;


    const bindURL = (bindQuoteAPIUrl.replace('{policyNumber}', req.quote.policyNumber)).replace('{quoteNumber}', req.quote.quoteNumber);


    return this.httpClient.post(bindURL, req);
  }
}
