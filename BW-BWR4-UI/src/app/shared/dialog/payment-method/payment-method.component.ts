import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Paymenttokenreq } from '../../model/payments/paymenttokenreq';
import { Paymenttokenres } from '../../model/payments/paymenttokenres';
import { PaymentsService } from '../../services/payments.service';
import { SpinnerStatusService } from '../../services/spinner-status.service';
import { Tracker } from '../../utilities/tracker';

@Component({
  selector: 'app-payment-method',
  templateUrl: './payment-method.component.html',
  styleUrls: ['./payment-method.component.scss']
})
export class PaymentMethodComponent implements OnInit, OnDestroy {
paymentType = '';
paymentIframeURL = '';
paymentTokenRequest!: Paymenttokenreq;
paymentTokenResponse!: Paymenttokenres;
generatePaymentTokenSubscription!: Subscription;
iframePostMessage = '';
isDownPay = false;

  constructor(public dialogRef: MatDialogRef<PaymentMethodComponent>,
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
    if (this.tokenData.method && this.tokenData.method === 'DOWNPAY') {
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
      if (postMessageDetails.includes("pmDetails")) {
        const pmDetailsJSON =  postMessageDetails.substring(postMessageDetails.indexOf('{'));
        this.iframePostMessage = JSON.parse(pmDetailsJSON);
        this.closeDialog(false);
      }
    }
  }

/**
 * generatePaymentToken function to generate URL Token used in Iframe
 */
  generatePaymentToken(): void {
    // Paymentus call to generate iframe token
    this.paymentTokenRequest = {
      firstName: this.tokenData['firstName'],
      lastName: this.tokenData['lastName'],
      ownerId: this.tokenData['ownerId'],
      type: this.tokenData['type'],
      entryPoint: 'iframe',
      origin: this.tokenData['origin'],
      timeStamp: Date.now(),
      method: this.tokenData['method']
    }
    this.generatePaymentTokenSubscription = this.paymentService.generateIframeToken(this.paymentTokenRequest).subscribe(async (data: any) => {
      await data;
      this.paymentTokenResponse = data;
      this.showSpinnerService.showSpinner(false);
      this.paymentIframeURL = environment.paymentIframeURL.concat(this.paymentTokenResponse.encryptedMessage);
       this.logTracker.loginfo(this.constructor.name, 'generatePaymentToken', 'generateIframeToken',
        'Success=paymentTokenResponse');
    },
      (errorData: any) => {
        this.showSpinnerService.showSpinner(false);
        this.logTracker.logerror(this.constructor.name, 'generatePaymentToken', 'generateIframeToken',
        'error=paymentTokenResponse', errorData);
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
