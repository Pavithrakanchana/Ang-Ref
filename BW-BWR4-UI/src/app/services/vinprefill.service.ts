import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { VinPrefillReq } from '../shared/model/vehicles/vin-prefill-req.model';



@Injectable({
  providedIn: 'root'
})
export class VinprefillService {

  constructor(private httpClient: HttpClient) { }

  public getVinPrefillOrderStatus(vinfillReq:VinPrefillReq): Observable<any> {
    const vinPrefillGETURL = `${environment.baseUrl}${environment.vinPrefillGETStatusAPI}`.replace(':masterCompany', `${vinfillReq?.autoPrefillReportQuery?.masterCompanyCode}`).replace
      ('quoteNumber',`${vinfillReq?.autoPrefillReportQuery?.quoteNumber}`);
      return this.httpClient.get(vinPrefillGETURL);
  }
  public retrieveAutoPrefillReportPriorVehicle(vinfillReq:VinPrefillReq): Observable<any> {
    return this.httpClient.post(`${environment.baseUrl}${environment.vinPrefillPOSTAPI}`, vinfillReq);
  }
}
