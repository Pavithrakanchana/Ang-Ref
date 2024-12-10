import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { map} from 'rxjs/operators';
import { ConsentValuesRes } from '../model/consentvalues/consentvaluesres.model';
import { ConsentValuesReq } from '../model/consentvalues/consentvaluesreq.model';


@Injectable({
  providedIn: 'root'
})
export class ConsentValuesService {

  constructor(private httpClient: HttpClient) { }

  getConsentMessage(req: ConsentValuesReq): Observable<any> {

    const httpparams = new HttpParams()
      .set('appName', req.appName)
      .set('pageName', req.pageName)
      .set('agentType', req.agentType)
      .set('state', req.state)
      .set('dropdownName', req.dropdownName);

      return this.httpClient.get<ConsentValuesRes>(`${environment.baseWASUrl}${environment.consentValues}`, {params: httpparams })
    .pipe(map((res: ConsentValuesRes) => {
        return res;
      })

    );
  }
}