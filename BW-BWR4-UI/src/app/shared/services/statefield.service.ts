import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { StateCodesMapping } from '../model/statecodesmapping';
import { StateFieldsMapping } from '../model/statefieldmapping';
import { StateMCOMapping } from '../model/statemcomapping';

@Injectable({
  providedIn: 'root'
})
export class StatefieldService {
  displayField: any
  stateFieldMappingPath = 'assets/data/statefieldmapping.json';
  constructor(private httpClient: HttpClient) { }
  getStateFieldMapping(stateCode: string, pageCode: string) {
    return this.httpClient.get<StateFieldsMapping>(this.stateFieldMappingPath).pipe(
      map((res: StateFieldsMapping) => {
        this.displayField = res.StateFieldConfig.FieldConfig?.find((x) => (x.state === stateCode && x.page === pageCode))?.field || '';

        return this.displayField;
      })
    );
  }
}
