import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { GlobalConstants } from '../constants/global.constant';
import { InvokeExstreamFeedRequest } from '../shared/model/documents/document-req.model';
import QuoteSummary from '../state/model/summary.model';

@Injectable({
  providedIn: 'root'
})
export class DocumentsService {
  quoteNumber!: string;
  policyNumber!: string;
  constructor(private httpClient: HttpClient, private store: Store<{ quoteSummary: QuoteSummary }>) {
    this.store.select('quoteSummary').subscribe(data => {
      this.quoteNumber = data.qid;
      this.policyNumber = data.policyNumber;
    });
  }


  fetchExtreamDoc(quoteNumber: string, mco: string, docType: string, page: string): Observable<any> {
    const documentsAPI = environment.baseWASUrl + environment.invokeExstreamFeedURL;
    const qid = quoteNumber.slice(0, 12);

    const req: InvokeExstreamFeedRequest = {
      quoteNumber:qid,
      boundPolicyNumber:  (page === GlobalConstants.CONFIRMATION_PAGE_NAME) ? this.policyNumber : qid,
      documentTransactionCode:docType,
      sourceSystem:GlobalConstants.BWR_APP_NAME,
      masterCompany:mco

    }

    return this.httpClient.post(documentsAPI, req);
  }

  fetchDocument = (quoteNumber: string, mco: string, docType: string, page: string): Observable<any> => {
    const documentsAPI = environment.baseWASUrl + environment.fetchDocumentsURL;

    const qid = quoteNumber.slice(0, 12);

    const fetchDocReq = {
      policyNumber: (page === GlobalConstants.CONFIRMATION_PAGE_NAME) ? quoteNumber : qid,
      transactionCode: docType
    }

    return this.httpClient.post(documentsAPI, fetchDocReq);
  }
}
