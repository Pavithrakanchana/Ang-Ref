import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { ObjectUtils } from '../shared/utilities/object-utils';
import QuoteSummary from '../state/model/summary.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  authStatus$!: Observable<QuoteSummary>;

  constructor(private store: Store<{ quoteSummary: QuoteSummary }>) {
    this.authStatus$ = this.store.select('quoteSummary');
   }

  getAuthStatus(): boolean {
    let authStatus = false;
    this.authStatus$.subscribe(data => {
      const sessionTicket = data.sessionToken;
      authStatus = !ObjectUtils.isFieldEmpty(sessionTicket);
    });

    return authStatus;
  }
}
