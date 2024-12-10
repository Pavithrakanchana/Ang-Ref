import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { TokenGenRes } from '../shared/model/sso/generate-token-res.model';

@Injectable({
  providedIn: 'root'
})
export class SsoService {

  constructor(private httpClient: HttpClient) { }

  tokenLogin( tokenReq: any): Observable<object> {
    const bwTokenAPIUrl = `${environment.baseUrl}${environment.bwTokenAPI}`;
    return this.httpClient.post(bwTokenAPIUrl.replace('providerId', 'usm'),tokenReq);
  }

  generateToken(sessionTicket: any): Observable<TokenGenRes> {
    const bwGenerateTokenAPIUrl = `${environment.baseUrl}${environment.bwGenerateTokenAPI}`;

    return this.httpClient.get<TokenGenRes>(bwGenerateTokenAPIUrl.replace('providerId', 'usm'), { headers: new HttpHeaders({'authorization_token': sessionTicket}) });

  }
}
