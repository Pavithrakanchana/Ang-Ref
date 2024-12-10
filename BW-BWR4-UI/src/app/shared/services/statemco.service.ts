import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { StateCodesMapping } from '../model/statecodesmapping';
import { StateMCOMapping } from '../model/statemcomapping';

@Injectable({
  providedIn: 'root'
})
export class StatemcoService {

  stateCodeMappingPath = 'assets/data/statecodemapping.json';
  stateCodeMCOMappingPath = 'assets/data/statecodemcomapping.json';

  constructor(private httpClient: HttpClient) { }

  getStateCodesMapping(producerCode: string): Observable<string> {
    return this.httpClient.get<StateCodesMapping>(this.stateCodeMappingPath).pipe(
      map((res: StateCodesMapping) => {
        const stateCode = res.StateCodes.state?.find((x: { _code: string; }) => (x._code === producerCode.substring(0, 2)))?._id || '';

        return stateCode;
      })
    );
  }

  getStateCodeMCOMapping(stateCode: string, channel: string): Observable<string> {


    return this.httpClient.get<StateMCOMapping>(this.stateCodeMCOMappingPath).pipe(
      map((res: StateMCOMapping) => {
        const mcoCode = res.StateMCOConfig.stateConfig?.find((x) => (x.state === stateCode && x.Channel === channel))?.MCO || '';

        return mcoCode;
      })
    );
  }




 }
