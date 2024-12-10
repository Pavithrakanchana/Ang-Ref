import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import {CreditReportData} from '../shared/model/services/applicant/propcredit-post-request';
import { Observable } from 'rxjs';
import { CreditReportResponse } from '../shared/model/propcredit/creditreportres.model';
import { map} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})

export class PropCreditService {
  constructor(private httpClient: HttpClient) { }

  public invokePropCreditService(req: CreditReportData):  Promise<CreditReportResponse> {
    return new Promise((resolve, reject) => {
      if(req != undefined) {

        this.postPropCredit(req).subscribe((propCreditRes: CreditReportResponse) => {
            resolve(propCreditRes);
          },
          error => reject(error));

      }
    });
  }

  public postPropCredit(req: CreditReportData): Observable<any> {
    return this.httpClient.post(`${environment.baseUrl}${environment.propCreditReportURL}`, req);
  }

  public getCreditStatus(qid: string, mco: string): Observable<any> {
    const httpparams = new HttpParams().set('masterCompany', mco);
    return this.httpClient.get(`${environment.baseUrl}${environment.propCreditStatusURL}`.replace('QID', qid), {params: httpparams });

  }

}
