import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { VinPrefixReq } from '../shared/model/vehicles/vin-prefix-req.model';
import { CommonUtils } from '../shared/utilities/common-utils';
import { VehicleSymbolsReq } from '../shared/model/vehicles/vehicle-symbols-req.model';

@Injectable({
  providedIn: 'root'
})
export class VintelligenceSymbolsService {

  constructor(private httpClient: HttpClient) { }

  retrieveVehicleSpecsWithSymbols(vin: string, mco: string, ratebook: string, symbols : string): Observable<any> {

    const vintelligenceAPI = `${environment.baseUrl}${environment.vintelligenceSymbolsAPI}`.replace(':vin', `${vin}`) + (
      `?rateBook=${ratebook}&masterCompany=${mco}&symbols=${symbols}`);

    return this.httpClient.get(vintelligenceAPI);
  }

  retrieveVehicleMakes(year: string): Observable<any> {

    const makesAPI = `${environment.baseUrl}${environment.vintelligenceMakesAPI}`.replace(':year', `${year}`) + (
      `?vehicletype=P,T`); // vehicletype=P,T,C

    return this.httpClient.get(makesAPI);
  }

  retrieveVehicleModels(year: string, make: string): Observable<any> {

    const modelsAPI = `${environment.baseUrl}${environment.vintelligenceModelsAPI}`.replace(':year', `${year}`)
      .replace(':make', `${make}`) + (`?vehicletype=P,T`); // vehicletype=P,T,C

    return this.httpClient.get(modelsAPI);
  }


  retrieveVinPrefix(req: VinPrefixReq): Observable<any> {
    const vinPrefixURL = `${environment.baseUrl}${environment.vinPrefixAPI}`;
    return this.httpClient.post(vinPrefixURL, req);
  }

  retrieveVehicleSymbols(req: VehicleSymbolsReq): Observable<any> {

    const vintelSymbolsURL = `${environment.baseUrl}${environment.vintelSymbolsAPI}`;
    return this.httpClient.post(vintelSymbolsURL, req);
  }

}
