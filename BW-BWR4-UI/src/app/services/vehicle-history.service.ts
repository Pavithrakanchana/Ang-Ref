import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import {VehicleHistoryReq} from '../shared/model/vehicles/vehicles.model';

@Injectable({
  providedIn: 'root'
})

export class VehicleHistoryService {
  constructor(private httpClient: HttpClient) { }

  public getVehicleHistoryReport(qid: string, req: VehicleHistoryReq): any {
    return this.httpClient.post(`${environment.baseUrl}${environment.vehicleHistoryReportURL}`.replace('QID', qid), req);
  }  
}
