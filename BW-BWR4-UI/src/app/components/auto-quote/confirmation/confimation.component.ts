import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { MessageConstants } from 'src/app/constants/message.constant';
import { SpinnerStatusService } from 'src/app/shared/services/spinner-status.service';
import { Store } from '@ngrx/store';
import * as Actions from '../../../state/actions/summary.action';
import QuoteSummary, { BindData } from 'src/app/state/model/summary.model';
import { formatDate } from '@angular/common';
import { forkJoin, Observable } from 'rxjs';
import { CommonUtils } from 'src/app/shared/utilities/common-utils';
import { QuoteDataService } from 'src/app/services/quote-data.service';
import { ObjectUtils } from 'src/app/shared/utilities/object-utils';
import { GlobalConstants } from 'src/app/constants/global.constant';
import { MatDialog } from '@angular/material/dialog';
import { ValidValuesReq } from 'src/app/shared/model/validvalues/validvaluesreq.model';
import { ValidValuesService } from 'src/app/shared/services/validvalues/validvalues.service';
import { EdmrFormsService } from 'src/app/services/edmr-forms.service';

import { GoPaperlessPopupComponent } from 'src/app/shared/dialog/go-paperless-popup/go-paperless-popup.component';
import { ESignatureDialogPopupComponent } from 'src/app/shared/dialog/eSignature-dialog-popup/e-signature-dialog-popup.component';
import { environment } from 'src/environments/environment';
import { ValuePair } from 'src/app/shared/model/validvalues/validvaluescommonres';
import { DocumentsService } from 'src/app/services/documents.service';
import { Tracker } from 'src/app/shared/utilities/tracker';
import { FetchDocumentRes } from 'src/app/shared/model/documents/document-res.model';
import { MessagesService } from 'src/app/shared/services/messages.service';
import { SharedService } from 'src/app/services/shared.service';



@Component({
  selector: 'app-confimation',
  templateUrl: './confimation.component.html',
  styleUrls: ['./confimation.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ConfimationComponent implements OnInit {

  @Input() hasProducerSweep!: boolean;

  confirmationForm!: UntypedFormGroup;
  clickBack = false;
  formSubmitAttempt = false;
  showTextAlertMessage = false;
  textAlertDisclaimer = MessageConstants.TEXT_ALERTS_DISCLAIMER;
  infoMessage!: string;
  errorMessage = '';
  showSpinner = false;
  producerNote = '';
  quoteNumber!: any;
  policyNumber!: any;
  mco!: any;
  bindPolicyNumber!: any;
  bindData: BindData = {} as BindData;
  eSignature!: boolean;
  fullfillmentAgent!: any;
  state!: any;
  uploadDate: any;
  uploadTime: any;
  confirmationNum: any;
  importantMsg: any;
  amount: any;
  confirmationData!: any;
  respKey: any;
  paymentMethod!: any;
  paperLess!: boolean;
  displayPayementMethods!: ValuePair[];
  creditDebitNote: any;
  checkinSavingsNote: any;
  producerSweepNote: any;
  ratebook!: string;
  policyState!: string;


  downpaymentValidValues!: ValuePair[];
  installmentValidValues!: ValuePair[];
  producerUserId: string = '';
  




  constructor(public edmrService: EdmrFormsService,
    private goPaperLessModal: MatDialog,
    private eSignatureModal: MatDialog,
    private messageservice: MessagesService,
    private showSpinnerService: SpinnerStatusService,
    private quoteService: QuoteDataService,
    private validValuesService: ValidValuesService,
    private documentService: DocumentsService,
    private logTracker: Tracker,
    private store: Store<{ quoteSummary: QuoteSummary }>,
  private sharedService: SharedService) {

    this.store.select('quoteSummary').subscribe(data => {
      this.quoteNumber = data.qid;
      this.policyNumber = data.policyNumber;
      const pN = data.policyNumber.split('');
      const pN1 = pN[0]+pN[1]+pN[2];
      const pN2 = pN[3]+pN[4]+pN[5]+pN[6]+pN[7]+pN[8]+pN[9];
      const pN3 = pN[10]+pN[11]
      this.bindPolicyNumber = data.policyNumber ? pN1+'-'+pN2+'-'+pN3 : '';
      this.mco = data.mco;
      this.policyState = data.policyState;
      this.ratebook = data.rateBook;
      this.producerUserId = data.producerUserId;
      this.bindData = data.bindData;
      this.policyState = data.policyState;
    });
  }

  ngOnInit(): void {
    this.sharedService.updateLastVisitedPage(10);
    const validvaluesreq: ValidValuesReq = {
      appName: GlobalConstants.APP_NAME,
      pageName: GlobalConstants.PAYMENT_METHODS_PAGE_NAME,
      mco: GlobalConstants.MCO_ALL_VALID_VALUES,
      ratebook: GlobalConstants.RATEBOOK_ALL_VALID_VALUES,
      state: this.policyState,
      dropdownName: GlobalConstants.PAYMENT_METHODS_DROPDOWN,
      filter:''
    };
    let getConfirmationObservables: Observable<any>[] = new Array();
    getConfirmationObservables.push(this.validValuesService.getValidValuesDetails(validvaluesreq));
    getConfirmationObservables.push(this.quoteService.retrieveQuote(this.quoteNumber, 'getConfirmation', this.policyState, this.ratebook));
    this.showSpinnerService.showSpinner(true);
    forkJoin(getConfirmationObservables).subscribe(results => {
      this.showSpinnerService.showSpinner(false);
      if (!ObjectUtils.isObjectEmpty(results[0])) {
        this.installmentValidValues = results[0].responseMap.ValidValues[0].values;
        this.displayPayementMethods = results[0].responseMap.ValidValues[1].values
        if (!ObjectUtils.isObjectEmpty(results[1])) {
          this.paperLess = results[1]?.autoQuote?.policyDiscountIndicators?.goPaperlessIndicator;
          this.goPaperlessPopup();
          this.retrieveConfirmation(results[1]);
        }
      }
    },
      (errorData: any) => {
        // this.errorHandler(errorData);
        this.showSpinnerService.showSpinner(false);
      });

    this.uploadDate = formatDate(new Date(), 'MM/dd/yyyy', 'en');
    this.uploadTime = formatDate(new Date(), 'hh:mm:ss a', 'en');
    //this.producerNote = "debit_credit" === 'debit_credit' ? MessageConstants.CREDIT_DEBIT_CARD : "c/s" === 'c/s' ? MessageConstants.CHECKING_SAVING_ACCOUNT : MessageConstants.PRODUCER_SWEAP;
    //this.producerNote = MessageConstants.PRODUCER_SWEAP;
  }

  printApplicationPackage() {
    if (this.eSignature) {
      const esignDialogRef = this.eSignatureModal.open(ESignatureDialogPopupComponent, {
        width: '50%',
        height: 'auto',
        panelClass: 'confirm-dailog',
        disableClose: true,
      });
      esignDialogRef.afterClosed().subscribe(result => {
        if (result.clicked === 'submit') {
          this.printPackage(GlobalConstants.APPLICATION_PACKAGE);
        }
      });
    } else {
      this.printPackage(GlobalConstants.APPLICATION_PACKAGE);
    }
  }


  retrieveConfirmation(data: any) {
    this.confirmationData = data.autoQuote;
    this.eSignature = data?.autoQuote?.policyDiscountIndicators?.esignatureIndicator;
    this.respKey = data?.autoQuote?.policyDiscountIndicators?.downPaymentMethod;
    this.paperLess = data?.autoQuote?.policyDiscountIndicators?.goPaperlessIndicator;
    this.fullfillmentAgent = data?.autoQuote?.agents[0]?.fulfillmentIndicator;
    this.state = data?.autoQuote?.state;


    let paymentMethodArray = this.displayPayementMethods.filter(val => (val.key === this.respKey))
    this.paymentMethod = paymentMethodArray[0] ? paymentMethodArray[0].displayvalue : '';
    let paymentMethodNote = this.paymentMethod;
    if (paymentMethodNote === 'Checking/Savings') {
      this.producerNote = MessageConstants.CHECKING_SAVING_ACCOUNT;
    }
    else if (paymentMethodNote === 'Credit Card' || paymentMethodNote === 'Debit Card') {
      this.producerNote = MessageConstants.CREDIT_DEBIT_CARD;
    }
    else {
      this.producerNote = MessageConstants.PRODUCER_SWEAP;
    }

  }

  goPaperlessPopup() {
    if (this.paperLess) {
      this.goPaperLessModal.open(GoPaperlessPopupComponent, {
        width: '30%',
        height: 'auto',
        panelClass: 'full-width-dialog',
        disableClose: false,
      });
    }
  }

  printConfirmationReceipt() {
    window.print();
  }

  _printPackage = (packageType: string) => {
    this.showSpinnerService.showSpinner(true);
    let startTime = new Date();
    // Quote Number is passed in the argument for fall back scenario and Policy NUmber is read from store
    this.documentService.fetchDocument(this.policyNumber, this.mco, packageType, GlobalConstants.CONFIRMATION_PAGE_NAME).subscribe({
      next: (res: FetchDocumentRes) => {
        if (res?.responseStatus === 1 && res?.transInfo?.transactionStatus.toUpperCase() !== 'FAILED' && res?.documentBytes !== undefined && res?.documentBytes !== null) {
          CommonUtils.downloadDocument(res.documentBytes, packageType === GlobalConstants.NEW_BUSINESS ? 'New Business Package-'.concat(this.bindPolicyNumber) : 'Application Package-'.concat(this.bindPolicyNumber));
          this.showSpinnerService.showSpinner(false);

          this.logTracker.loginfo('ConfirmationComponent', 'printPackage', 'documentService.fetchDocument', 'PackageType='.concat(packageType).concat('|Duration='.concat(CommonUtils.elapsedTime(startTime).toString())));
        } else {
          this.logTracker.loginfo('ConfirmationComponent', 'printPackage', 'documentService.fetchDocument',  'PackageType='.concat(packageType).concat('|'.concat(res?.responseDescription)));
          this.printPackageExstream(packageType);
        }
      },
      complete(): void {
        // console.log('Confirmation Package loaded');
      },
      error: err =>
      this.logTracker.logerror('ConfirmationComponent', 'printPackage', 'documentService.fetchDocument', 'Error=Confirmation Page Print New Business Package|QuoteNumber='.concat(this.quoteNumber), err)
    });
  }


  printPackageExstream = (packageType: string) => {

  let startTime = new Date();
  // need to use policy number instead of quote number once all set -- this.bindPolicyNumber
  this.documentService.fetchExtreamDoc(this.quoteNumber, this.mco, packageType, GlobalConstants.CONFIRMATION_PAGE_NAME).subscribe({
    next: res => {
      if (res?.documentBytes !== undefined && res?.documentBytes !== null) {
        CommonUtils.downloadDocument(res.documentBytes, packageType === GlobalConstants.NEW_BUSINESS ? 'New Business Package-'.concat(this.bindPolicyNumber) : 'Application Package-'.concat(this.bindPolicyNumber));
    } else {
      this.logTracker.logerror('ConfirmationComponent', 'printPackageExstream', 'documentService.fetchExtreamDoc',  'PackageType='.concat(packageType), 'Unable to retrieve Package at this time');
    }
    this.showSpinnerService.showSpinner(false);
    this.logTracker.loginfo('ConfirmationComponent', 'printPackageExstream', 'documentService.fetchExtreamDoc',
    'PackageType='.concat(packageType).concat('|Duration='.concat(CommonUtils.elapsedTime(startTime).toString())));
  },
    complete(): void {
      // console.log('Package loaded');
    },
    error: err =>
    this.logTracker.logerror('ConfirmationComponent', 'printPackageExstream', 'documentService.fetchExtreamDoc', 'Error=Confirmation Page Print Package|PackageType='.concat(packageType), err)
  });
}

printPackage = (packageType: string) => {
    let startTime = new Date();
    this.showSpinnerService.showSpinner(true);
    // need to use policy number instead of quote number once all set -- this.bindPolicyNumber
    this.edmrService.printEdmrDoc(this.quoteNumber, this.mco, packageType, GlobalConstants.CONFIRMATION_PAGE_NAME, GlobalConstants.UPLOAD_STATUS_NO).subscribe({
      next: res => {
        if (res?.documents[0].documentBytes !== undefined && res?.documents[0].documentBytes !== null) {
          CommonUtils.downloadDocument(res?.documents[0].documentBytes, packageType === GlobalConstants.NEW_BUSINESS ? 'New Business Package-'.concat(this.bindPolicyNumber) : 'Application Package-'.concat(this.bindPolicyNumber));
      } else {
        this.showDocumentError(res);

      }
        this.showSpinnerService.showSpinner(false);
        // window.open(res.documents[0].link, "_blank")
        this.logTracker.loginfo('ConfirmationComponent', 'printPackageExstream', 'edmrService.printEdmrDoc', 'PackageType='.concat(packageType).concat('|Duration='.concat(CommonUtils.elapsedTime(startTime).toString())));
      },
      complete(): void {
        // console.log('Confirmation Package loaded');
      },
      error: err => this.logTracker.logerror('ConfirmationComponent', 'printPackage', 'edmrService.printEdmrDoc', 'PackageType='.concat(packageType)+'|QuoteNumber='.concat(this.quoteNumber), err)
    });
  }

  showDocumentError = (res: any): void => {
    const docSeqNo = res?.documents[0].sequenceNumber || '';
    const docType = res?.documents[0].documentType;
    const errorMsg = res?.documents[0]?.transactionNotification?.remark[0]?.messageText;
    const errorDetails = 'DocumentSeqNo: '.concat(docSeqNo).concat(' DocumentTpe: ').concat(docType).concat(' Error Message: ').concat(errorMsg);
    this.logTracker.logerror('ConfirmationComponent', 'printPackage', 'edmrService.printEdmrDoc',  'Confirmation Page', errorDetails);

    this.messageservice.showError([errorMsg]);
    const element = document.querySelector('#topcontent');
    element?.scrollIntoView();
  }

  /*printApplicationservicecall() {
    this.showSpinnerService.showSpinner(true);
    let startTime = new Date();
    // need to use policy number instead of quote number once all set -- this.bindPolicyNumber
    this.documentService.fetchExtreamDoc(this.quoteNumber, this.mco, GlobalConstants.APPLICATION_PACKAGE, GlobalConstants.CONFIRMATION_PAGE_NAME).subscribe({
      next: res => {
        if (res?.documentBytes !== undefined && res?.documentBytes !== null) {
          CommonUtils.downloadDocument(res.documentBytes, 'Confirmation Receipt-'+ this.quoteNumber);
      } else {
        this.logTracker.logerror('ConfirmationComponent', 'printApplicationservicecall', 'documentService.fetchExtreamDoc',  'QuoteNumber='.concat(this.quoteNumber), 'Unable to retrieve Print Application at this time');
      }
      this.showSpinnerService.showSpinner(false);
      this.logTracker.loginfo('ConfirmationComponent', 'printApplicationservicecall', 'documentService.fetchExtreamDoc',
      'QuoteNumber='.concat(this.quoteNumber + '|Duration='.concat(CommonUtils.elapsedTime(startTime).toString())));
    },
      complete(): void { 
        // console.log('Confirmation Package loaded'); 
      },
      error: err =>
      this.logTracker.logerror('ConfirmationComponent', 'printApplicationservicecall', 'documentService.fetchExtreamDoc',
    'Error=Confirmation Page Print Application|QuoteNumber='.concat(this.quoteNumber), err)

    });
  }*/

  returnToQuote() {
    window.close();
    window.location.href = environment.returnQuoteSearch;
  }

}
