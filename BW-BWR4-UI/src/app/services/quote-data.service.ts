import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { saveApplicantRequest } from '../shared/model/services/applicant/save-applicant-request';
import { saveDriverRequest } from '../shared/model/services/driver/save-driver-request';
import { AutoQuoteData, //VehicleHistoryReq
 } from '../shared/model/autoquote/autoquote.model';

@Injectable({
  providedIn: 'root'
})
export class QuoteDataService {
  constructor(private httpClient: HttpClient) { }

  private data: any = undefined;

  private quote_summary: any = undefined;

  private violations: any = [];

    // PNI details Subject
    isPNIDetailsChanged = new BehaviorSubject<boolean>(false);

     // CLUE API Subject
     orderCLUESubject = new BehaviorSubject<boolean>(false);

    // Addtional Driver Subject
    isAddtionalDriver = new BehaviorSubject<boolean>(false);

  public getQuoteID(mco: string, agentCode: string): any {
    const httpparams = new HttpParams().set('agentCode', agentCode);
    const quoteNumAPIUrl = `${environment.baseUrl}${environment.quoteNumberAPI}?operation=getQuoteNumber`.replace(':mco', mco);
    return this.httpClient.get(quoteNumAPIUrl, {params: httpparams });
  }

  public getRatebook(mco: string, agentCode: string, stateCode: string, effDate: string): any {
    const httpparams = new HttpParams()
                              // .set('operation', 'geRateBook')
                              .set('agentCode', agentCode)
                              .set('effectiveDate', effDate);

    const ratebookAPIUrl = `${environment.baseUrl}${environment.rateBookAPI}`.replace(':MC', mco).replace(':ST', stateCode);
    return this.httpClient.get(ratebookAPIUrl, {params: httpparams }); // of({rateBook: 'A'});
  }

  public saveApplicant(qid: string, req: saveApplicantRequest): Observable<object>{
    return this.httpClient.post(`${environment.baseUrl}${environment.saveApplicantURL}`.replace('QID', qid), req);
  }

  public updateApplicant(qid:string, req: saveApplicantRequest): Observable<object>{
    return this.httpClient.post(`${environment.baseUrl}${environment.updateApplicantURL}`.replace('QID', qid), req);
  }

  public retrieveApplicant(qid: string): Observable<object>{
    return this.httpClient.get(`${environment.baseUrl}${environment.retrieveApplicantURL}`.replace('QID', qid));
  }

  public saveDrivers(qid:string, req: saveDriverRequest){

    //inject quote number into URL template
    return this.httpClient.post(`${environment.baseUrl}${environment.saveDriversURL}`.replace('QID', qid), req);

  }

  public retrieveDrivers(qid:string): Observable<object>{
    return this.httpClient.get(`${environment.baseUrl}${environment.retrieveDriversURL}`.replace('QID', qid));
  }

  // public vehicleHistoryRequest(qid:string, req: VehicleHistoryReq): Observable<object>{
  //   return this.httpClient.post(environment.vehicleHistoryReportURL.replace('QID', qid), req);
  // }

  setData(data: any): void {
    this.data = data;
  }

  getData(): any {
    return this.data;
  }

  getQuoteSummary(): any {
    return this.quote_summary;
  }

  /**
   * Quoting changes as per new Re-Design of API
   */

  saveUpdateQuote(req: AutoQuoteData, quoteNumber: string, operation: string): Observable<object> {
    const saveQuoteAPIUrl = `${environment.baseUrl}${environment.saveQuoteAPI}?operation=${operation}`;
    return this.httpClient.post(saveQuoteAPIUrl, req);
  }

  retrieveQuote(quoteNumber: string, operation: string, state: string, rateBook: string): Observable<AutoQuoteData> {
    const retrieveQuoteAPIUrl = `${environment.baseUrl}${environment.retrieveQuoteAPI}?operation=${operation}&state=${state}&rateBook=${rateBook}`
      .replace(':quoteNumber', quoteNumber);

    return this.httpClient.get<AutoQuoteData>(retrieveQuoteAPIUrl);
  }

  saveAndExitQuote(req: AutoQuoteData, operation: string): Observable<object> {
    const saveAndExitQuoteUrl = `${environment.baseUrl}${environment.saveQuoteAPI}?operation=${operation}`;
    return this.httpClient.post(saveAndExitQuoteUrl, req);
  }

  retrieveLastSavedQuote(quoteNumber: string, state: string, rateBook: string,operation: string, agentCode: string): Observable<AutoQuoteData> {
    const retrieveLastSavedQuoteUrl = `${environment.baseUrl}${environment.retrieveQuoteAPI}?operation=${operation}&state=${state}&rateBook=${rateBook}&producerCode=${agentCode}`
      .replace(':quoteNumber', quoteNumber);
    return this.httpClient.get<AutoQuoteData>(retrieveLastSavedQuoteUrl);
  }

  rateUpdateQuote( req: AutoQuoteData, operation: string): Observable<object> {
    const rateQuoteAPIUrl = `${environment.baseUrl}${environment.rateQuoteAPI}?operation=${operation}`;
    return this.httpClient.post(rateQuoteAPIUrl, req);
  }

  orderMVRQuote( req: AutoQuoteData, operation: string): Observable<object> {
    const orderMVRAPI = `${environment.baseUrl}${environment.saveQuoteAPI}?operation=${operation}`;
    return this.httpClient.post(orderMVRAPI, req);
  }

  retrieveSavedQuoteIndicators(quoteNumber: string, state: string, mco: string): Observable<AutoQuoteData> {
    const retrieveIndicatorsAPIUrl = `${environment.baseUrl}${environment.retrieveQuoteAPI}/filter?state=${state}&masterCompany=${mco}`
      .replace(':quoteNumber', quoteNumber);
    return this.httpClient.get<AutoQuoteData>(retrieveIndicatorsAPIUrl);
  }
}
