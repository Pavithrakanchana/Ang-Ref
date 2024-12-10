import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { SplPaymenttokenreq } from '../model/payments/splpaymenttokenreq';
import { Paymentautopayreq } from '../model/payments/paymentautopayreq';
import { PaymentCancelAutoPayReq } from '../model/payments/paymentcancelautopayreq';
import { Paymenttokenreq } from '../model/payments/paymenttokenreq';

@Injectable({
  providedIn: 'root'
})
export class PaymentsService {

  generateIframeTokenURL = environment.paymentTokenURL;
  generateSplIframeTokenURL = environment.splPaymentTokenURL;
  deletePaymentMethodTokenURL = environment.baseUrl +  environment.paymentDeleteMethod;
  viewPaymentMethodURL = environment.baseUrl + environment.paymentListMethods;
  enrollAutoPayURL = environment.baseUrl + environment.paymentEnrollAutoPay;
  cancelAutoPayURL = environment.baseUrl + environment.paymentCancelAutoPay;
  autoPayDetailsURL = environment.baseUrl + environment.paymentAutopayDetails;
  cancelSPLDownPayURL = environment.baseUrl + environment.cancelSPLDownPayURL;
  constructor(private httpClient: HttpClient) {}

  /**
   * Generates payment token needed to launch the Payment Iframe
   * @param paymentsTokenRequest
   * @returns
   */
  generateIframeToken(paymentsTokenRequest: Paymenttokenreq): Observable<any> {
    return this.httpClient.post(`${environment.baseWASUrl}${this.generateIframeTokenURL}`, paymentsTokenRequest);
  }
/**
   * Generates payment token needed to launch the csr Payment Iframe
   * @param paymentsTokenRequest
   * @returns
   */
 generateSplIframeToken(paymentsTokenRequest: SplPaymenttokenreq): Observable<any> {
  return this.httpClient.post(`${environment.baseWASUrl}${this.generateSplIframeTokenURL}`, paymentsTokenRequest);
}
  /**
   * Deletes an existing payment method token
   * @param accountOwnerId
   * @param token
   * @returns
   */
  deletePaymentToken(accountOwnerId: any, token: string): Observable<any> {
     return this.httpClient.delete((this.deletePaymentMethodTokenURL.replace('{AccountNumber}', accountOwnerId)).replace('{PaymentMethodToken}', token));
  }

  /**
   * Returns payment method data based on AccountOwnerId
   * @param accountOwnerId
   * @returns
   */
  viewPaymentMethod(accountOwnerId: any): Observable<any> {
    return this.httpClient.get(this.viewPaymentMethodURL.replace('{AccountNumber}', accountOwnerId));
  }

  /**
   * Enrolls payment method into Auto-Pay reoccurring payments
   * @param paymentautopayreq
   * @returns
   */
  enrollAutoPay(paymentautopayreq: Paymentautopayreq): Observable<any> {
    return this.httpClient.put(this.enrollAutoPayURL.replace('{AccountNumber}', paymentautopayreq.account.id), paymentautopayreq);
  }

  cancelAutoPay(paymentcancelautopayreq: PaymentCancelAutoPayReq, accountId: string, ref: string): Observable<any> {
    return this.httpClient.put((this.cancelAutoPayURL.replace('{AccountNumber}', accountId)).replace('{referenceNumber}', ref), paymentcancelautopayreq);
  }

  autoPayDetails(accountOwnerId: any): Observable<any> {
    return this.httpClient.get(this.autoPayDetailsURL.replace('{AccountNumber}', accountOwnerId));
  }
  cancelDownPay( accountId: string, ref: string): Observable<any> {
    return this.httpClient.put((this.cancelSPLDownPayURL.replace('{AccountNumber}', accountId)).replace('{referenceNumber}', ref), {"accountNumber":""});
  }

}
