import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { environment } from 'src/environments/environment';
import { SplPaymenttokenreq, PaymenttokenAccount, PaymenttokenCustomer, PaymenttokenHeader, PaymenttokenLiability } from '../../model/payments/splpaymenttokenreq';
import { Paymenttokenres } from '../../model/payments/paymenttokenres';
import { PaymentsService } from '../../services/payments.service';
import { SpinnerStatusService } from '../../services/spinner-status.service';
import { Tracker } from '../../utilities/tracker';
import { GlobalConstants } from 'src/app/constants/global.constant';
@Component({
  selector: 'app-spl-payment-dialog',
  styleUrls: ['./spl-payment-dialog.component.scss'],
  template: 
  `
  <div class="bwr-payment-iframe-header">
    <button class="close" mat-button aria-label="close dialog" (click)="closeDialog(false)">
        <mat-icon>close</mat-icon>
    </button>
    <h5 *ngIf="this.isDownPay" mat-dialog-title class="bw-header5">Enter Down Payment Information</h5>
    <h5 *ngIf="!this.isDownPay" mat-dialog-title class="bw-header5">Enter Installment Payment Information</h5>
</div>
<!-- IFRAME -->
<iframe class="bwr-payment-iframe" [src]="this.splPaymentIframeURL | safe" title="Payment Info">
</iframe>
  `
})
export class SplPaymentMethodComponent implements OnInit {
paymentType = '';
splPaymentIframeURL = '';
paymentTokenRequest!: SplPaymenttokenreq;
paymentTokenResponse!: Paymenttokenres;
generatePaymentTokenSubscription!: Subscription;
iframePostMessage = '';
isDownPay = false;

  constructor(public dialogRef: MatDialogRef<SplPaymentMethodComponent>,
    @Inject(MAT_DIALOG_DATA) public tokenData: any,
    private paymentService: PaymentsService,
    private showSpinnerService: SpinnerStatusService,
    private logTracker: Tracker)
  
    {
      this.showSpinnerService.showSpinner(true);
      if (window.addEventListener) {
        window.addEventListener("message", this.receiveMessage.bind(this), false);
      } else {
         (<any>window).attachEvent("onmessage", this.receiveMessage.bind(this));
      }
    }

  ngOnInit(): void {
    this.generatePaymentToken();
    if (this.tokenData.method && this.tokenData.method === GlobalConstants.PAYMENT_DOWNPAYMENT) {
      this.isDownPay = true;
    }
  }

/**
 * receiveMessage function that receives the PostMessage message from the Paymentus Iframe
 * @param {any} event - A string param
 * @return {string} Return a string
 */
 receiveMessage: any = (event: any) =>  {
  const postMessageOrigin = event.origin;
  // verify origin to prevent XSS
  if (postMessageOrigin === environment.paymentIframeOrigin) { // read from environment file
    const postMessageDetails = event.data;
    // only look for a PostMessage that includes pmDetails
    if(typeof(postMessageDetails)==='string'){
      const paymentReferencType = this.isDownPay? GlobalConstants.PAYMENT_REFERENCE_STRING_DOWPAY:GlobalConstants.PAYMENT_REFERENCE_STRING_INSTALL;
      if(postMessageDetails.includes(paymentReferencType)){
      const pmDetails =  JSON.parse(postMessageDetails);
      let resJSON = pmDetails[0]?.paymentMethod;
      resJSON.token = this.isDownPay ? pmDetails[0]?.paymentReferenceNumber : pmDetails[0]?.scheduleReferenceNumber;
      this.iframePostMessage = resJSON;
      this.closeDialog(false);
      }
      }
    if(postMessageDetails.paymentReferenceNumber !== undefined && postMessageDetails.paymentReferenceNumber!==''){
      this.iframePostMessage = postMessageDetails.paymentMethod;
      this.closeDialog(false);
    }
  }
}

/**
* generatePaymentToken function to generate URL Token used in Iframe
*/
generatePaymentToken(): void {
  // Paymentus call to generate iframe token
 
const header: PaymenttokenHeader = {
  accountNumber: this.tokenData['ownerId'],
  paymentTypeCode: this.tokenData['mco']+'00',//GlobalConstants.SPL_PAYMENT_TYPE_CODE,
  existing: false
}
const customers: PaymenttokenCustomer = {
  firstName: this.tokenData['firstName'],
  lastName: this.tokenData['lastName'],
  email:'',
  clientId: this.tokenData['ownerId'],
}

const liability: PaymenttokenLiability = {
  amountDue: this.tokenData['paidAmount'] === 'undefined' || this.tokenData['paidAmount']===""? Number((0.0).toFixed(1)): Number(this.tokenData['paidAmount']),
  outstandingAmount: Number((0.0).toFixed(1)),
  policyNumber: this.tokenData['ownerId']?.slice(-10),
  householdNumber:'',
  primaryBillingName: this.tokenData['firstName'] +' '+ this.tokenData['lastName'],
  secondaryBillingName: '',
  agentOfRecord: this.tokenData['producerCode'],
}
const account : PaymenttokenAccount ={
  header : header,
  customers: [customers],
  liability : liability
}

this.paymentTokenRequest = {
accounts : [account],
postMessageTarget: this.tokenData['origin'],
externalChannel: GlobalConstants.SPL_EXTERNAL_CHANNEL,
action: GlobalConstants.SPL_PAYMENT_ACTION,
entryPoint: this.tokenData['method'] === GlobalConstants.PAYMENT_DOWNPAYMENT? GlobalConstants.SPL_ENTRY_POINT:GlobalConstants.SPL_EFT_ENTRY_POINT,
timestamp: Date.now().toString(),
cRid: Math.floor(Math.random() * 1000000000).toString(),
iframe : true,
isPayLaterEnabled: true,
isSecureLine: true
}
  this.generatePaymentTokenSubscription = this.paymentService.generateSplIframeToken(this.paymentTokenRequest).subscribe(async (data: any) => {
    await data;
    this.paymentTokenResponse = data;
    this.showSpinnerService.showSpinner(false);
    this.splPaymentIframeURL = environment.splPaymentIframeURL.concat(this.paymentTokenResponse.encryptedMessage);
    this.logTracker.loginfo(this.constructor.name, 'generatePaymentToken', 'generateIframeToken',
      'Success=paymentTokenResponse');
  },
    (errorData: any) => {
      this.showSpinnerService.showSpinner(false);
      this.logTracker.logerror(this.constructor.name, 'generatesplPaymentToken', 'generatesplIframeToken',
      'error=paymentsplTokenResponse', errorData);
    });
}

/**
* closeDialog function that closes the Payment Method dialog
* @param {boolean} val - true or false value
*/
closeDialog(val: boolean): void {
  this.dialogRef.close({ event: val, data: this.iframePostMessage });
}

ngOnDestroy(): void {
  this.generatePaymentTokenSubscription.unsubscribe();
}
}
