import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { GlobalConstants } from '../constants/global.constant';
import { ProducerData, ProducerDataRes } from '../shared/model/producer.model';
import { Observable, of } from 'rxjs';
import { EmailVerificationReq } from '../shared/model/email/email-verification-req.model';

@Injectable({
  providedIn: 'root'
})
export class ApplicationService {

  constructor(private httpClient: HttpClient) { }

  public getProducerNameData(effectiveDate: string, qid: string, mco: string, producerCode: string): Observable<ProducerData> {
    const params = {
      context: '',
      effectiveDate: effectiveDate,
      lob: GlobalConstants.LINE_OF_BUSINESS,
      mco: mco,
      policyNumber: qid,
      producerCode: producerCode,
      requestingProgram: GlobalConstants.APP_NAME
    }
    return this.httpClient.get<ProducerData>(`${environment.baseWASUrl}${environment.getLicensedAgentsAPI}`,{params});

  }
  public sendProducerData(email: string, lob: string, fullName: string, phone: string,
    effectiveDate: string, mco: string, quoteNum: string, producerCode: string): Observable<any> {
    const req: ProducerDataRes = {
      context: `${environment.storageLibrary}`,
      policyMCO: mco,
      producerCode: producerCode,
      policySymbol: quoteNum.slice(0, 3),
      policyNumber: quoteNum.slice(3, 10),
      policyModule: quoteNum.slice(10, 12),
      requestingProgram: GlobalConstants.BWR_APP_NAME,
      emailAddress: email,
      lineOfBusiness: lob,
      fullName
      // phoneNumber: data.phoneNumber,
    }


    return this.httpClient.post(`${environment.baseWASUrl}${environment.producerPOSTAPI}`, req);
  }


  validateEmail(email: string, mco: string, quoteNum: string, producerCode: string): Observable<any> {

    const req: EmailVerificationReq = {
      context: '',
      emailAddress: email,
      policyMCO: mco,
      producerCode: producerCode,
      policySymbol: quoteNum.slice(0, 3),
      policyNumber: quoteNum.slice(3, 7),
      policyModule: quoteNum.slice(10, 2),
      requestingProgram: GlobalConstants.BWR_APP_NAME
    }

    return this.httpClient.post(`${environment.baseWASUrl}${environment.emailVerificationAPI}`, req);
  }

  duplicateEmail(email: string): Observable<any> {
    return this.httpClient.post(`${environment.baseWASUrl}${environment.emailDuplicateCheckAPI}`, {emailAddress: email});
  }
}
