import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { GlobalConstants } from '../constants/global.constant';
import { Policy, Quote, Document, EmdrFormsReq } from '../shared/model/edmr/edmr-forms-req.mode';
import { EmdrFormsRes } from '../shared/model/edmr/edmr-forms-res.model';
import QuoteSummary from '../state/model/summary.model';

@Injectable({
  providedIn: 'root'
})
export class EdmrFormsService {
  quoteNumber!: string;
  policyNumber!: string;
  constructor(private httpClient: HttpClient, private store: Store<{ quoteSummary: QuoteSummary }>) { 
    this.store.select('quoteSummary').subscribe(data => {
      this.quoteNumber = data.qid;
      this.policyNumber = data.policyNumber;
    });
  }


  printEdmrDoc(quoteNumber: string, mco: string, docType: string, page: string, uploadStatus:string): Observable<any> {
    const edmrformsAPI = environment.baseUrl + environment.edmrFormsAPI;
    const qid = quoteNumber.slice(0, 3).concat('-').concat(quoteNumber.slice(3, 10)).concat('-').concat(quoteNumber.slice(10, 12));
    const quote: Quote = {
      quoteNumber: qid
    };

    const policy: Policy = {
      policyNumber: (page === GlobalConstants.CONFIRMATION_PAGE_NAME) ? this.policyNumber : qid
    };

    const document: Document = {
      quote,
      policy,
      masterCompany: mco,
      documentType: docType,
      deleteExistingDocument:uploadStatus
    }


    const req: EmdrFormsReq = {
      documents: [
        document
      ]
    }

    return this.httpClient.post(edmrformsAPI, req);
  }
}
