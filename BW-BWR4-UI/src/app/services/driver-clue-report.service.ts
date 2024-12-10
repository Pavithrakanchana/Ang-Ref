import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { ClueRequest } from '../shared/model/cluereport/clue-request.model';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class DriverClueReportService {

  constructor(private httpClient: HttpClient) { }

  orderClueReport(quoteNumber: any, mco: any): Observable<any> {
    const req: ClueRequest = {
      riskReportQuery: {
        quoteNumber: quoteNumber,
        masterCompanyCode: mco
      }
    }
    const clueReportAPIUrl = `${environment.baseUrl}${environment.driversClueReportAPI}?reportType=CLUE&bypasscache=false`;
    return this.httpClient.post(clueReportAPIUrl, req);
  }
}
