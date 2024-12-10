import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ValidValuesReq } from '../../model/validvalues/validvaluesreq.model';
import { ValidValuesRes } from '../../model/validvalues/validvaluesres.model';
import { map} from 'rxjs/operators';
import { ValidvaluesCommonRes } from '../../model/validvalues/validvaluescommonres';


@Injectable({
  providedIn: 'root'
})
export class ValidValuesService {

  constructor(private httpClient: HttpClient) { }

  getValidValues(req: ValidValuesReq): Observable<any> {

    const httpparams = new HttpParams()
      .set('appName', req.appName)
      .set('pageName', req.pageName)
      .set('mco', req.mco)
      .set('ratebook', req.ratebook)
      .set('state', req.state)
      .set('dropdownName', req.dropdownName)
      .set('filter', req.filter);

      return this.httpClient.get<ValidValuesRes>(`${environment.baseWASUrl}${environment.validValuesAPI}`, {params: httpparams })
    .pipe(map((res: ValidValuesRes) => {
        return res;
      })

    );
  }

  getBIPDHighestValidValues(req: ValidValuesReq): Observable<any> {

    const httpparams = new HttpParams()
      .set('appName', req.appName)
      .set('pageName', req.pageName)
      .set('mco', req.mco)
      .set('ratebook', req.ratebook)
      .set('state', req.state)
      .set('dropdownName', req.dropdownName)
      .set('filter', req.filter);
      return this.httpClient.get<ValidValuesRes>(`${environment.baseWASUrl}${environment.BIPDvalidValues}`, {params: httpparams })
    .pipe(map((res: ValidValuesRes) => {
        return res;
      })

    );
}

public getValidValuesDetails(validValesRequest: ValidValuesReq): Observable<any> {
  const params = new HttpParams()
  .set('appName', validValesRequest.appName)
  .set('pageName', validValesRequest.pageName)
  .set('mco', validValesRequest.mco)
  .set('ratebook', validValesRequest.ratebook)
  .set('state', validValesRequest.state)
  .set('dropdownName', validValesRequest.dropdownName)
  .set('filter', validValesRequest.filter);
  return this.httpClient.get(`${environment.baseWASUrl}${environment.validValues}`, {params});
}


}
