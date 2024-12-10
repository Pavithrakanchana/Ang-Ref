import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { GlobalConstants } from 'src/app/constants/global.constant';
import { RatesService } from 'src/app/services/rates.service';
import { HelpTextDialogComponent } from 'src/app/shared/dialog/helptext-dialog/helptext-dialog.component';
import { ReviewUploaddocPopupComponent } from 'src/app/shared/dialog/review-uploaddoc-popup/review-uploaddoc-popup.component';
import { MessagesService } from 'src/app/shared/services/messages.service';
import QuoteSummary, { BindData, Coverage, Indicators, PageStatus } from 'src/app/state/model/summary.model';
import { SpinnerStatusService } from 'src/app/shared/services/spinner-status.service';
import { EdmrFormsService } from 'src/app/services/edmr-forms.service';
import { AutoCoverages, AutoQuoteData, Contact, PaymentMethod as PaymentMethodModel, PayPlanDetails, PolicyFees } from 'src/app/shared/model/autoquote/autoquote.model';
import { QuoteDataMapper } from 'src/app/shared/utilities/quotedata-mapper';
import { QuoteDataService } from 'src/app/services/quote-data.service';
import { Observable } from 'rxjs/internal/Observable';
import { ValidValuesService } from 'src/app/shared/services/validvalues/validvalues.service';
import { forkJoin, Subscription } from 'rxjs';
import { CoverageAbstract, CoveragesUtil } from 'src/app/shared/utilities/coverages-util';
import { ValidvaluesCommon } from 'src/app/shared/model/validvalues/validvaluescommonres';
import { PaymentsService } from 'src/app/shared/services/payments.service';
import { Paymenttokenreq } from 'src/app/shared/model/payments/paymenttokenreq';
import { Paymentautopayreq, Account, PaymentMethods, Customer, Address } from 'src/app/shared/model/payments/paymentautopayreq';
import { PaymentMethodComponent } from 'src/app/shared/dialog/payment-method/payment-method.component';
import { SplPaymentMethodComponent } from 'src/app/shared/dialog/spl-payment-dialog/spl-payment-dialog.component';
import { PaymentMethod } from 'src/app/shared/model/payments/payment-method-model';
import { CommonUtils } from 'src/app/shared/utilities/common-utils';
import { MessageConstants } from 'src/app/constants/message.constant';
import * as Actions from '../../../state/actions/summary.action';
import { ObjectUtils } from 'src/app/shared/utilities/object-utils';
import { BindService } from 'src/app/services/bind.service';
import { BindRequest, DownPayment, Quote } from 'src/app/shared/model/bind/bind-request';
import { PolicyDupcheckComponent } from 'src/app/shared/dialog/policy-dupcheck/policy-dupcheck.component';
import { Payment, PaymentCancelAutoPayReq } from 'src/app/shared/model/payments/paymentcancelautopayreq';
import { GenericDialogComponent } from 'src/app/shared/dialog/generic-dialog/generic-dialog.component';
import { NavigationService } from 'src/app/shared/services/navigation.service';
import { Tracker } from 'src/app/shared/utilities/tracker';
import { addPageStatus } from '../../../state/actions/summary.action';
import { HelptextMapper } from 'src/app/shared/utilities/helptext-mapper';
import { DocumentsService } from 'src/app/services/documents.service';
import { SharedService } from 'src/app/services/shared.service';

@Component({
  selector: 'app-review',
  templateUrl: './review.component.html',
  styleUrls: ['./review.component.scss']
})
export class ReviewComponent implements OnInit {

  @ViewChild('next', { read: ElementRef }) nextButton!: ElementRef;

  policyPackages: any;
  reviewCoverageForm!: UntypedFormGroup;
  policyCoverages!: Coverage[];
  layout = GlobalConstants.LAYOUT_VERTICAL;
  helpText = '';
  helpTextTitle = '';
  recalculateStatus: boolean = false;
  vehicleCoverages!: Coverage[];
  applicantNonOwner!: any;
  riskState = '';
  boardFormOrNNO = '';
  quoteNumber!: any;
  mco!: any;
  producerCode!: string;
  pageStatus!: number;
  vehicleList!: any[];
  dueAmountChange!: string;
  termVal: any;
  selectedPackage: string = 'Premium';
  page: string = 'review';
  formSubmitAttempt!: boolean;
  selectedPayPlans!: PayPlanDetails[];
  autoQuoteData!: AutoQuoteData;
  selectPayPlanCode: string = '';
  payPlanDetail: string = '';
  eftFutureInstallValue!: string;
  downpaymentValue!: string;
  autoCoverages!: AutoCoverages;
  clickBack = false;
  policyCoverageAbs: CoverageAbstract[] = [];
  vehicleCoverageValidValues: ValidvaluesCommon[] = [];
  policyCoverageValidValues: ValidvaluesCommon[] = [];
  downpayPaymentMethod!: any;
  installmentPaymentMethod!: any;
  paymenttokenreq!: Paymenttokenreq;
  paymentAutoPayReq!: Paymentautopayreq;
  account!: Account;
  //amountPaylessError!: string;
  amountPayPIFError!: string;
  producerNote = '';
  paymetnSetup = true;
  nonOwner = false;
  bindData: BindData = {} as BindData;
  storePayPlan!: PayPlanDetails;
  accountOwnerId!: string;
  pniContact!: Contact;
  bindPolicyNumber!: string;
  pco!: string;
  policyEffDate!: string;
  amountPaid!: string;
  autoPayReference!: string;
  isCSR = false;
  navigationObvSubscription!: Subscription;
  requestedRoute = '';
  performSaveExit = false;
  policyFees: PolicyFees[] = [];
  _eftPayMethod!: string;
  _downPayMethod!: string;
  producerUserId: string = '';
  ratebook!: string;
  dynamicVehFields: any;
  antiTheftRequired: boolean = false;
  stepperRestriction: boolean = false;
  rideShareIndicator!: any;
  downpayReferenceNumber!: string;
  isSamePayMethodsForSPL : boolean = false;
  amountValidPattern = /^(\d{1, 3}(\, \d{3})*|(\d+))(\.\d{2})?$/;
  constructor(public quoteDataMapper: QuoteDataMapper, public edmrService: EdmrFormsService,
    public fb: UntypedFormBuilder, private showSpinnerService: SpinnerStatusService,
    private readonly messageservice: MessagesService, private ratesService: RatesService,
    public reviewDialog: MatDialog, public paymentMethodDialog: MatDialog, public securePayLineDialog: MatDialog,
    private router: Router, private store: Store<{ quoteSummary: QuoteSummary }>,
    public quoteDataService: QuoteDataService, private validValuesService: ValidValuesService,
    private logTracker: Tracker,
    private navigationService: NavigationService,
    private paymentService: PaymentsService,
    private bindService: BindService,
    private helpTextMapper: HelptextMapper,
    public producerDialog: MatDialog,
    public documentService: DocumentsService,
  private sharedService: SharedService) {

    this.store.select('quoteSummary').subscribe(data => {
      this.applicantNonOwner = data.nonOwner;
      this.riskState = data.policyState;
      this.boardFormOrNNO = data.policyState == "CO" ? "BROAD Form" : "Named Non Owner"
      this.quoteNumber = data.qid;
      this.mco = data.mco;
      this.ratebook = data.rateBook;
      this.producerCode = data.producerCode;
      this.producerUserId = data.producerUserId;
      this.payPlanDetail = 'Premium';
      const pageStatusArr = data.pageStatus.filter(page => (page.name === 'REVIEW'));
      this.pageStatus = pageStatusArr.length > 0 ? pageStatusArr[0].status : 0;
      this.bindData = data.bindData;
      this._eftPayMethod = data.bindData.eftPayMethod || '';
      this._downPayMethod = data.bindData.downPayMethod || '';
      this.accountOwnerId = this.bindData.accountOwnerId || '';
      this.storePayPlan = data.payPlan;
      this.policyEffDate = data.policyEffectiveDate;
      this.policyFees = data.policyFees;
      this.nonOwner = data.nonOwner;
      this.dynamicVehFields = data.dynamicValidValues;
      this.stepperRestriction = data.stepperRestriction;
      this.rideShareIndicator = data.rideShare;
      this.isCSR = data.quoteResponseChannel === GlobalConstants.CUSTOMER_TYPE? true : false;
      this.downpayReferenceNumber = data.bindData.downpayReferenceNumber || '';
    });
  }

  ngOnDestroy(): void {
    this.navigationService.updateNavigationRequestedRoute('');
    this.navigationObvSubscription.unsubscribe();
  }

  ngOnInit(): void {
    this.initReviewForm();
    this.showSpinnerService.showSpinner(true);

    let getReviewObservables: Observable<any>[] = new Array();
    getReviewObservables.push(this.validValuesService.getValidValuesDetails(this.policyCoveragesValidValuesReq(this.riskState)));
    getReviewObservables.push(this.validValuesService.getValidValuesDetails(this.vehicleCovergesValidValuesReq(this.riskState)));
    getReviewObservables.push(this.quoteDataService.retrieveQuote(this.quoteNumber, 'getPolicyReview', this.riskState, this.ratebook));

    if (!ObjectUtils.isObjectEmpty(this.bindData) && !ObjectUtils.isFieldEmpty(this.bindData.accountOwnerId)) {
      getReviewObservables.push(this.paymentService.viewPaymentMethod(this.bindData.accountOwnerId));
      getReviewObservables.push(this.paymentService.autoPayDetails(this.bindData.accountOwnerId));
    }

    let paymentResults: any;
    forkJoin(getReviewObservables).subscribe(async (results: any) => {

      paymentResults = results;
      this.showSpinnerService.showSpinner(false);

      this.policyCoverageValidValues = results[0].responseMap.ValidValues;
      this.vehicleCoverageValidValues = results[1].responseMap.ValidValues;


      this.stateDynamicFields();
      this.loadReviewData(results[2]);
      this.bindPolicyNumber = results[2].autoQuote.policyNumber;
      this.store.dispatch(Actions.addPolicyNumber ({ policyNumber: this.bindPolicyNumber }));
      this.logTracker.loginfo('ReviewComponent', 'ngOninit', 'Policy Number', 'Policy Number from Review GET: '.concat(this.bindPolicyNumber));
      this.pco = results[2].autoQuote.policyCompany;

      this.accountOwnerId = this.generateOwnerAccountId(this.bindPolicyNumber, this.pco);

      this.updateStoreBind({ policyNumber: this.bindPolicyNumber, pco: this.pco });

      if (!ObjectUtils.isObjectEmpty(results[3])) {
        this.loadPaymentInformation(results[2], results[3]);
        this.downpaymentValue = results[2].autoQuote.policyDiscountIndicators.downPaymentMethod;
        this.eftFutureInstPay(this.downpaymentValue);

        this.autoPayReference = results[4].account.referenceNumber;
        this.updateStoreBind({ autoPayref: results[4].account.referenceNumber });
      } else {
        this.viewPayment(results);

        this.autopayDetails();
      }

      this.updatePaymentSetupStatus({postReview: false});
    },
      (errorData: any) => {
        this.logTracker.logerror('ReviewComponent', 'ngOninit', 'validValuesService.getValidValuesDetails|quoteDataService.retrieveQuote|paymentService.viewPaymentMethod|paymentService.autoPayDetails',
        'Error=Review Page ForkJoin Error', errorData);
        this.errorHandler(errorData);
        this.clickBack = false;

      });

      this.navigationObservableWatch();

  }

  stateDynamicFields() {
    if(!this.applicantNonOwner){
    for(let i=0;i<=this.dynamicVehFields?.length;i++) {
      if(this.dynamicVehFields[i]?.key === 'Antitheft') {
        this.antiTheftRequired = true
      }
    }
    // console.log("antiTheftRequired", this.antiTheftRequired);
   }
  }


  viewPayment = (results: any): void => {
    this.paymentService.viewPaymentMethod(this.accountOwnerId).subscribe(paymentInfo => {
      this.loadPaymentInformation(results[2], paymentInfo);
    });
  }

  autopayDetails = (): void => {
    this.paymentService.autoPayDetails(this.bindData.accountOwnerId || this.accountOwnerId).subscribe(paymentInfo => {
      this.autoPayReference = paymentInfo.account.referenceNumber;
      this.updateStoreBind({ autoPayref: paymentInfo.account.referenceNumber });
    });
  }

  generateOwnerAccountId = (policyNumber: string, pco: string): string => {
    // PCO|MCO|MOD|SYM|POLICYNUM
    const symbol = policyNumber.slice(0, 3).toLocaleLowerCase();
    const policyNum = policyNumber.slice(3, 10);
    const mod = policyNumber.slice(10);

    return pco.concat(this.mco).concat(mod).concat(symbol).concat(policyNum);
  }

  initReviewForm(): void {
    this.reviewCoverageForm = this.fb.group({

      payPlan: [''],
      //amountPaid: ['', Validators.compose([Validators.required])],
      amountPaid: ['', Validators.compose([Validators.required, Validators.pattern(this.amountValidPattern)])],
      downPayment: [''],
      eft: [''],
      samePaymentChk: [false]
    })
  }
  /* Handle form errors */
  public hasError = (controlName: string, errorName: string) => {
    return this.reviewCoverageForm.controls[controlName].hasError(errorName);
  }

  eftFutureInstPay(downPayMethod: any) {
    if(this._downPayMethod !== downPayMethod) {
      this.reviewCoverageForm.controls.samePaymentChk.patchValue(false);
    }
  }

  loadReviewData(data: any) {

    this.vehicleList = data.autoQuote.personalAuto?.vehicles;
    this.eftFutureInstallValue = data.autoQuote.policyDiscountIndicators.eftFutureInstallments;
    this.downpaymentValue = data.autoQuote.policyDiscountIndicators.downPaymentMethod;
    this.pniContact = data.autoQuote.contact;

    this.fetchTerm(data);
    this.loadPayPlansAndFeesAndPremium(data);

    this.policyCoverageAbs = CoveragesUtil.prepareCoverageAbstract(this.riskState, this.policyCoverageValidValues, data.autoQuote.policyCoveragesDetails?.coverages, [], this.antiTheftRequired);

    this.reviewCoverageForm.patchValue({
      eft: this.eftFutureInstallValue,
      downPayment: this.downpaymentValue,
      payPlan: this.selectPayPlanCode
    });

    this.producerNote = this.downpaymentValue === 'N' ? MessageConstants.PRODUCER_NOTE_SWEEP : this.downpaymentValue === 'Y' ? MessageConstants.PRODUCER_NOTE_CHECKINS : MessageConstants.PRODUCER_NOTE_CC;

    this.logTracker.loginfo('ReviewComponent', 'ngOninit-loadReviewData', 'Retrieve Review Page data', 'Retrieve Review Page data Successful');
  }

  loadPaymentInformation(data: any, paymentsInfoData: any) {

    this.eftFutureInstallValue = data.autoQuote.policyDiscountIndicators.eftFutureInstallments;
    this.downpaymentValue = data.autoQuote.policyDiscountIndicators.downPaymentMethod;

    const eftPaymentInfo = paymentsInfoData.customer.paymentMethods.filter((payInfo: { recurringEnabled: boolean; }) => payInfo.recurringEnabled === true) || [];

    if (eftPaymentInfo && eftPaymentInfo.length > 0) {
      this.installmentPaymentMethod = {
        Token: eftPaymentInfo[0].paymentToken,
        CardHolderName: eftPaymentInfo[0].accountHolderName,
        MaskedAccountNumber: eftPaymentInfo[0].accountNumber,
        ExpiryDate: eftPaymentInfo[0].expiryMonth ? eftPaymentInfo[0].expiryMonth + '/' + eftPaymentInfo[0].expiryYear : '',
        zipCode: eftPaymentInfo[0].zipCode ? eftPaymentInfo[0].zipCode : '',
        Type: eftPaymentInfo[0].type,
        BankName: eftPaymentInfo[0].bankName
      }
    }

    const downPaymentInfo = paymentsInfoData.customer.paymentMethods.filter((payInfo: { recurringEnabled: boolean; }) => payInfo.recurringEnabled === false) || [];

    if (downPaymentInfo && downPaymentInfo.length > 0) {
      this.downpayPaymentMethod = {
        Token: downPaymentInfo[0].paymentToken,
        CardHolderName: downPaymentInfo[0].accountHolderName,
        MaskedAccountNumber: downPaymentInfo[0].accountNumber,
        ExpiryDate: downPaymentInfo[0].expiryMonth ? downPaymentInfo[0].expiryMonth + '/' + downPaymentInfo[0].expiryYear : '',
        zipCode: downPaymentInfo[0].zipCode ? downPaymentInfo[0].zipCode : '',
        Type: downPaymentInfo[0].type,
        BankName: downPaymentInfo[0].bankName
      }
    }

    // After Proper load of Paymentus information check of Payment Methods change and delete them if changed
    if (data.autoQuote.personalAuto.paymentInformation.paymentMethods.length > 0) {

      this.processPaymentusInformation(data);
    }

    this.logTracker.loginfo('ReviewComponent', 'loadPaymentInformation', 'Retrieve Payment Information', 'Retrieve Payment Information Successful');

  }

  processPaymentusInformation = (reviewGetData: any): void => {
    const paymentMethodsDB: PaymentMethodModel[] = reviewGetData.autoQuote.personalAuto.paymentInformation.paymentMethods;

    const downPaymentMethod: PaymentMethodModel = paymentMethodsDB?.find((x: { mode: string; }) => (x.mode === GlobalConstants.PAYMENT_DOWNPAYMENT )) || {} as any;
    const installmentPaymentMethod: PaymentMethodModel = paymentMethodsDB?.find((x: { mode: string; }) => (x.mode === GlobalConstants.PAYMENT_INSTALLMENT )) || {} as any;

    const _downPayMethodChanged: boolean = !ObjectUtils.isObjectEmpty(downPaymentMethod) && this.downpaymentValue !== downPaymentMethod.paymentMethodOnFile;
    const _eftPayMethodChanged: boolean =  !ObjectUtils.isObjectEmpty(installmentPaymentMethod) &&  this.eftFutureInstallValue !== installmentPaymentMethod.paymentMethodOnFile;

    let sameAsOther = false;
    if (!ObjectUtils.isObjectEmpty(downPaymentMethod) && !ObjectUtils.isObjectEmpty(installmentPaymentMethod) &&
          downPaymentMethod.sameAsOtherPaymentModeIndicator && installmentPaymentMethod.sameAsOtherPaymentModeIndicator) {
      this.reviewCoverageForm.controls.samePaymentChk.patchValue(true);
      sameAsOther = true;
    } else {
      this.reviewCoverageForm.controls.samePaymentChk.patchValue(false);
    }
    if(this.isCSR && paymentMethodsDB.length>1 && !ObjectUtils.isObjectEmpty(installmentPaymentMethod) && ObjectUtils.isObjectEmpty(this.downpayPaymentMethod)){
      this.isSamePayMethodsForSPL = true;
    }
    if (_downPayMethodChanged || _eftPayMethodChanged) {
      if (_downPayMethodChanged && this.downpayPaymentMethod) {
        this.deletePaymentMethod(GlobalConstants.PAYMENT_DOWNPAYMENT);
      }

      if (_eftPayMethodChanged && this.installmentPaymentMethod) {
        this.deletePaymentMethod(GlobalConstants.PAYMENT_INSTALL);
      }
    } else {
      if(this.isCSR && paymentMethodsDB.length>1 && !ObjectUtils.isObjectEmpty(installmentPaymentMethod) && ObjectUtils.isObjectEmpty(this.downpayPaymentMethod)){
        this.downpayPaymentMethod = this.installmentPaymentMethod;
      }
      if (sameAsOther && !ObjectUtils.isObjectEmpty(installmentPaymentMethod) && ObjectUtils.isObjectEmpty(this.downpayPaymentMethod)) {
        this.downpayPaymentMethod = this.installmentPaymentMethod;
      }

      this.updatePaymentSetupStatus({postReview: false});
    }
  }

  policyCoveragesValidValuesReq = (state: string) => {
    return {
      appName: GlobalConstants.APP_NAME,
      pageName: GlobalConstants.POLICY_COVERAGE_PAGE_NAME,
      mco: GlobalConstants.MCO_ALL_VALID_VALUES,
      ratebook: this.ratebook,
      state: this.riskState,
      dropdownName: GlobalConstants.POLICY_COVERAGE_PAGE_DROPDOWN,
      filter: this.applicantNonOwner? GlobalConstants.APPLICANT_NAMED_NON_OWNER: (this.rideShareIndicator? GlobalConstants.VEHICLE_USE_RIDESHARE :'')
    }
  }

  vehicleCovergesValidValuesReq = (state: string) => {
    return {
      appName: GlobalConstants.APP_NAME,
      pageName: GlobalConstants.VEHICLE_COVERAGE_PAGE_NAME,
      mco: GlobalConstants.MCO_ALL_VALID_VALUES,
      ratebook: this.ratebook,
      state: state,
      dropdownName: GlobalConstants.VEHICLE_COVERAGE_PAGE_DROPDOWN,
      filter: ''
    }
  }

  vehicleCoverageAbs(index: any): CoverageAbstract[] {
    const compVal =  this.vehicleList[index].coverages.find((cov: { code: string }) => cov.code == 'OTC')?.deductible;
    this.antiTheftRequired = compVal !== '' ?true : false;
    return CoveragesUtil.prepareCoverageAbstract(this.riskState, this.vehicleCoverageValidValues, this.vehicleList[index].coverages, this.vehicleList[index].discountIndicators, this.antiTheftRequired);

  }



  fetchTerm(obj: any) {
    this.termVal = obj.autoQuote.term;
  }

  errorHandler(errorData: any) {
    const errorArr: any = [];
    this.showSpinnerService.showSpinner(false);
    const dupCheckMessage = errorData?.error?.transactionNotification?.remark?.find((x: { messageCode: string; }) => x.messageCode === GlobalConstants.ERROR_STATUS_CODE_406)?.messageText || '';

    if (!ObjectUtils.isFieldEmpty(dupCheckMessage)) {
      this.openDupCheckConfirmation(dupCheckMessage);
    } else {
      this.performSaveExit = false;
      errorData?.error?.transactionNotification?.remark?.forEach((val: any) => {
        errorArr.push(val.messageText);
      });
      this.messageservice.showError(errorArr);
      const element = document.querySelector('#topcontent');
      element?.scrollIntoView();
    }

  }

  openDupCheckConfirmation(message: string): void {
    const dialogRef = this.reviewDialog.open(PolicyDupcheckComponent, {
      width: '40%',
      height: 'auto',
      data: {
        message: message
      },
      panelClass: 'dup-check-content'
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result && result === true) {
        // Call Bind Service and navigate to confirmation page

        this.invokebindService(false);


      }
    });
  }



  launchApplicatioPage(formData: any): void {
    // this.viewDocsAndUploadApplication(formData)
    this.router.navigateByUrl('/application?qid=' + this.quoteNumber);
  }


  viewDocsAndUploadApplication(formData: any): void {

    this.formSubmitAttempt = true;
    if (this.reviewCoverageForm.valid) {
      const amountPaidToday = this.reviewCoverageForm.controls.amountPaid.value;
      const numberOfInstallments = this.storePayPlan.installment?.numberOfInstallments;
      const totalPremium = this.policyPackages[0]?.autoCoverages.premiumDetails[0].savingsAmount.theCurrencyAmount;
      if (amountPaidToday && Number(amountPaidToday) === Number(totalPremium) && Number(numberOfInstallments) != 0) {
        this.performSaveExit = false;
        this.addPIFError(true);
        return;
      }
      if (amountPaidToday && Number(amountPaidToday) > 0 && (Number(amountPaidToday) > Number(this.dueAmountChange) || Number(amountPaidToday) < Number(this.dueAmountChange) - 5)) {
        this.performSaveExit = false;
        this.addPIFieldError(true);
        return;
       }

      const pageStatus: PageStatus = { name: 'REVIEW', status: 1 };
      this.store.dispatch(addPageStatus({ pageStatus }));
      if (!this.stepperRestriction) {
        this.sharedService.updateLastVisitedPage(9);
        this.navigationService.removeRuleOnNext(9);
      }
      if (this.performSaveExit) {
        this.showSpinnerService.showSpinner(false);
        this.navigationService.getNextRoutingRule(this.requestedRoute);
        return;
      }
      if (this.clickBack) {
        this.router.navigateByUrl('/application?qid=' + this.quoteNumber);
        return;
      }
      this.updateStoreBind({ policyNumber: this.bindPolicyNumber, pco: this.pco, amountPaid: amountPaidToday });

      this.amountPaid = amountPaidToday;

      this.openUploadConfirmation();
    } else {
      this.performSaveExit = false;
    }
  }

  createBindRequest = (performDupCheck: boolean): BindRequest => {
    const downPayment: DownPayment = {
      theCurrencyAmount: Number(this.amountPaid),
      method: this.downpaymentValue
    }

    const qid = this.quoteNumber.substr(0, 3) + this.quoteNumber.substr(3, 7) + this.quoteNumber.substr(10, 2);
    const quote: Quote = {
      quoteNumber: qid,
      policyNumber: this.bindPolicyNumber,
      houseHoldNumber: '',
      processingAgent: this.producerCode,
      effectiveDate: this.policyEffDate,
      stateCode: this.riskState,
      lineOfBusinessCode: GlobalConstants.LINE_OF_BUSINESS,
      agentLoginId: this.producerUserId ?  this.producerUserId : GlobalConstants.EMPTY_STRING,
      checkPolicyExistsForOtherLineOfBusiness: performDupCheck ? 'Y' : 'N',
      downPayment
    }

    const req: BindRequest = {
      quote
    }

    return req;
  }

  updateStoreBind(bdata: any) {
    let updateBindData: BindData = {};

    updateBindData.bindPolicyNumber = bdata.policyNumber ? bdata.policyNumber : this.bindPolicyNumber || this.bindData.bindPolicyNumber,
    updateBindData.bindPco =  bdata.pco ? bdata.pco : this.pco || this.bindData.bindPco,
    updateBindData.accountOwnerId = this.accountOwnerId,
    updateBindData.amountPaid = bdata.amountPaid ? bdata.amountPaid : this.bindData.amountPaid,
    updateBindData.confirmationNum = bdata.confirmationNumber ? bdata.confirmationNumber : this.bindData.confirmationNum,
    updateBindData.autoPayReference = bdata.autoPayref ? bdata.autoPayref : this.bindData.autoPayReference || this.autoPayReference,
    updateBindData.uploadDate = bdata.uploadDate ? bdata.uploadDate : this.bindData.uploadDate,
    updateBindData.uploadTime = bdata.uploadTime ? bdata.uploadTime : this.bindData.uploadTime

    if (bdata.downPayMethod || this._downPayMethod) {
      updateBindData.downPayMethod = bdata.downPayMethod === 'X' ? '' :  bdata.downPayMethod || (this._downPayMethod);
    }

    if (bdata.eftPayMethod || this._eftPayMethod) {
      updateBindData.eftPayMethod = bdata.eftPayMethod === 'X' ? '' :  bdata.eftPayMethod || (this._eftPayMethod);
    }
    updateBindData.downpayReferenceNumber = bdata.downPayref ? bdata.downPayref : this.bindData.downpayReferenceNumber || this.downpayReferenceNumber,

    this.store.dispatch(Actions.bindData({ bindData: updateBindData }));
  }

  openUploadConfirmation(): void {
    const dialogRef = this.reviewDialog.open(ReviewUploaddocPopupComponent, {
      width: '40%',
      height: 'auto',
      data: {
        policyEffectiveDate: this.policyEffDate
      },
      panelClass: 'confirm-dailog'
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result && result === true) {
        // Call Bind Service and navigate to confirmation page

        this.invokebindService(true);


      }
    });
  }

  invokebindService = (runDupCheck: boolean): void => {
    this.showSpinnerService.showSpinner(true);
    const req: BindRequest = this.createBindRequest(runDupCheck);
    this.bindService.bindQuote(req).subscribe(async (data: any) => {
      await data;

      this.updateStoreBind({ confirmationNumber: data.quote.confirmationNumber, uploadDate: data.quote.bindDateTime.date, uploadTime: data.quote.bindDateTime.timestamp })
      const indicators: Indicators = {
          dobIndicator: '',
          nameIndicator: ''
        }
        this.store.dispatch(Actions.indicators({ indicators }));

      const pageStatus: PageStatus = { name: 'REVIEW', status: 1 };
      this.store.dispatch(addPageStatus({ pageStatus }));
      if (!this.stepperRestriction) {
        this.sharedService.updateLastVisitedPage(9);
        this.navigationService.removeRuleOnNext(9);
      }
      this.logTracker.loginfo('ReviewComponent', 'invokebindService', 'Quote Bind', 'Quote Bind Successful');
      this.router.navigateByUrl('/confirmation?qid=' + this.quoteNumber).then(r => r.valueOf());

    },
      errorData => {
        this.showSpinnerService.showSpinner(false);
        this.errorHandler(errorData);
        this.logTracker.logerror('ReviewComponent', 'invokebindService', 'bindService.bindQuote', 'Error=Bind Error', errorData);
      });
  }

  onClickBack(formData: any): void {
    this.clickBack = true;
    this.messageservice.clearAllErrors();
    this.sharedService.updateLastVisitedPage(9);
    this.navigationService.removeRuleOnNext(9);
    this.launchApplicatioPage(formData);
  }

  loadPayPlansAndFeesAndPremium(data: any) {
    this.policyPackages = data.autoQuote.policyPackage;

    const userSelPayplan = data.autoQuote.policyPackage[0].autoCoverages?.userSelectedPayplan;
    const defaultPayplan = data.autoQuote.policyPackage[0].autoCoverages.payplansDetails
      .find((payplan: { defaultIndicator: boolean; }) => payplan.defaultIndicator === true)?.payPlan;
    this.selectPayPlanCode = userSelPayplan ? userSelPayplan : defaultPayplan;

    // this.selectedPayPlans = this.policyPackage[0]?.autoCoverages?.payplansDetails?.filter((obj) => obj.payPlan === this.selectPayPlanCode);

    this.dueAmountChange = '' + this.storePayPlan.downPayment?.theCurrencyAmount || GlobalConstants.AMOUNT_ZERO;

    this.reviewCoverageForm.controls.amountPaid.patchValue(this.bindData.amountPaid ? this.bindData.amountPaid : this.dueAmountChange);
    this.reviewCoverageForm.controls.amountPaid.setValidators([Validators.required, Validators.pattern(this.amountValidPattern) ]);

  }


  printApplicationPackage() {
    this.showSpinnerService.showSpinner(true);
    let startTime = new Date();
    this.edmrService.printEdmrDoc(this.quoteNumber, this.mco, GlobalConstants.APPLICATION_PACKAGE, GlobalConstants.REVIEW_PAGE_NAME, GlobalConstants.UPLOAD_STATUS_YES).subscribe({
      next: res => {
        if (res?.documents[0].documentBytes !== undefined && res?.documents[0].documentBytes !== null) {
          CommonUtils.downloadDocument(res?.documents[0].documentBytes, 'ApplicationPackage-'+ this.quoteNumber);
        } else {
          this.showDocumentError(res);

        }
        this.showSpinnerService.showSpinner(false);
        // window.open(res.documents[0].link, "_blank")
        this.logTracker.loginfo('ReviewComponent', 'printApplicationPackage', 'edmrService.printEdmrDoc', 'QuoteNumber='.concat(this.quoteNumber + '|Duration='.concat(CommonUtils.elapsedTime(startTime).toString())));
      },
      complete(): void {  },
      error: err => this.logTracker.logerror('ReviewComponent', 'printApplicationPackage', 'edmrService.printEdmrDoc', 'Error=Print Application Doc Error', err)
    });
  }

  showDocumentError = (res: any): void => {
    const docSeqNo = res?.documents[0].sequenceNumber || '';
    const docType = res?.documents[0].documentType;
    const errorMsg = res?.documents[0]?.transactionNotification?.remark[0]?.messageText;
    const errorDetails = 'DocumentSeqNo: '.concat(docSeqNo).concat(' DocumentTpe: ').concat(docType).concat(' Error Message: ').concat(errorMsg);
    this.logTracker.logerror('ReviewComponent', 'printApplicationPackage', 'edmrService.printEdmrDoc',  'Review Page Applicant Package', errorDetails);

    this.messageservice.showError([errorMsg]);
    const element = document.querySelector('#topcontent');
    element?.scrollIntoView();
  }


  _printApplicationPackage() {
    this.showSpinnerService.showSpinner(true);
    let startTime = new Date();
    this.documentService.fetchExtreamDoc(this.quoteNumber, this.mco, GlobalConstants.APPLICATION_PACKAGE, GlobalConstants.REVIEW_PAGE_NAME).subscribe({
      next: res => {
        if (res?.documentBytes !== undefined && res?.documentBytes !== null) {
          CommonUtils.downloadDocument(res.documentBytes, 'ApplicationPackage-'+ this.quoteNumber);
      } else {
        this.logTracker.logerror('ReviewComponent', 'printApplicationPackage', 'documentService.fetchQuoteSheetDoc',  'QuoteNumber='.concat(this.quoteNumber), 'Unable to retrieve Print Application Doc at this time');
      }
      this.showSpinnerService.showSpinner(false);
      this.logTracker.loginfo('ReviewComponent', 'printApplicationPackage', 'documentService.fetchQuoteSheetDoc',
      'QuoteNumber='.concat(this.quoteNumber + '|Duration='.concat(CommonUtils.elapsedTime(startTime).toString())));
    },
      complete(): void {  },
      error: err => this.logTracker.logerror('ReviewComponent', 'printApplicationPackage', 'documentService.fetchQuoteSheetDoc', 'Error=Print Application Doc Error', err)
    });
  }

  checkPayAmount(event: any): void {

    const userPay = Number(event.target.value).toFixed(2) || Number(this.reviewCoverageForm.controls.amountPaid.value).toFixed(2);
    //let userPay = Number((event.target.value || this.reviewCoverageForm.controls.amountPaid.value).replace(',','')).toFixed(2);
    this.reviewCoverageForm.controls.amountPaid.clearValidators();
    // reset required validator
    //this.reviewCoverageForm.controls.amountPaid.setValidators(Validators.required);
    this.reviewCoverageForm.controls.amountPaid.setValidators([Validators.required, Validators.pattern(this.amountValidPattern) ]);
    const numberOfInstallments = this.storePayPlan.installment?.numberOfInstallments;
    const totalPremium = this.policyPackages[0]?.autoCoverages.premiumDetails[0].savingsAmount.theCurrencyAmount;
    this.messageservice.clearErrors();
    //this.amountPaylessError = '';
    // Check if the amount entered is more than $5 below the required downpay
    /*if (userPay && Number(userPay) > 0 && ((Number(userPay) > Number(this.dueAmountChange) && Number(userPay) < Number(totalPremium))
|| Number(userPay) < Number(this.dueAmountChange) - 5) || Number(userPay) > Number(totalPremium)) {*/


      if ((userPay && Number(userPay) === Number(totalPremium)) && Number(numberOfInstallments) != 0) {
        // console.log("Inside addPIFError");
        this.addPIFError(true);
      }else if (userPay && Number(userPay) > 0 && (Number(userPay) > Number(this.dueAmountChange) || Number(userPay) < Number(this.dueAmountChange) - 5)) {
        // console.log("Inside addPIFieldError");
        this.reviewCoverageForm.controls.amountPaid.setValidators([CommonUtils.amountPayValidator('amountLess')]);
        this.addPIFieldError(true);
       }
    this.reviewCoverageForm.controls.amountPaid.updateValueAndValidity();

  }

  addPIFieldError(pifError: boolean) {
    if (pifError) {
      const dollarOneAmt = (Number(this.dueAmountChange) - 5).toFixed(2);
      const dollarTwoAmt = Number(this.dueAmountChange).toFixed(2)
      let message = MessageConstants.AMOUNT_PAY_5LESS.replace('{1}', '$' + dollarOneAmt);
      message = message.replace('{2}', '$' + dollarTwoAmt);
      this.messageservice.showError([message]);
      const element = document.querySelector('#topcontent');
      element?.scrollIntoView();
    }
  }

  addPIFError(pifError: boolean) {
    if (pifError) {
      const dollarOneAmt = (Number(this.dueAmountChange) - 5).toFixed(2);
      const dollarTwoAmt = Number(this.dueAmountChange).toFixed(2)
      let message = MessageConstants.AMOUNT_PAY_5LESS.replace('{1}', '$' + dollarOneAmt);
      message = message.replace('{2}', '$' + dollarTwoAmt);
      this.messageservice.showError([MessageConstants.AMOUNT_PAY_PIF,message]);
      const element = document.querySelector('#topcontent');
      element?.scrollIntoView();
    }
  }

  loadHelpText(fieldID: string): void {
    let helpTextObj = this.helpTextMapper.mapHelpText(fieldID);

    if (helpTextObj) {
      this.producerDialog.open(HelpTextDialogComponent, {
        width: '30%',
        panelClass: 'full-width-dialog',
        data: {
          title: helpTextObj.title,
          text: helpTextObj.text
        }
      });
    }
  }

  deletePaymentMethod(method: string): boolean {
    // call delete payment API and pass token
   if(this.isCSR){
    this.deleteSPLPaymentMethod(method);
   }
   else{
    let paymentMethodToken = '';

    const isSamePayCheck = this.reviewCoverageForm.controls.samePaymentChk.value;

    if (isSamePayCheck === true && method === GlobalConstants.PAYMENT_INSTALL && !ObjectUtils.isObjectEmpty(this.downpayPaymentMethod)) {
      paymentMethodToken = this.installmentPaymentMethod.Token;
      this.paymentService.cancelAutoPay(this.cancelAutoPayReq(), this.accountOwnerId, this.autoPayReference).subscribe(res => {
        this.installmentPaymentMethod = null;
        this.reviewCoverageForm.controls.samePaymentChk.patchValue(false);
        this.updateStoreBind({ autoPayref: ''});

        this.autoPayReference = '';
        // Update the PaymentSetup status and Make a post call for QSMICS update with the PaymentInformation
        this.updatePaymentSetupStatus({postReview: true});
      }, (errorData: any) => {
        this.errorHandler(errorData);
      });

      return false;
    } else if (isSamePayCheck === true && method === GlobalConstants.PAYMENT_DOWNPAYMENT && !ObjectUtils.isObjectEmpty(this.installmentPaymentMethod)) {
      paymentMethodToken = this.downpayPaymentMethod.Token;
      this.downpayPaymentMethod = null;
      this.reviewCoverageForm.controls.samePaymentChk.patchValue(false);

      // Update the PaymentSetup status and Make a post call for QSMICS update with the PaymentInformation
      this.updatePaymentSetupStatus({postReview: true});
      return false;
    } else if (method && method === GlobalConstants.PAYMENT_DOWNPAYMENT) {
      paymentMethodToken = this.downpayPaymentMethod.Token;
    } else {
      paymentMethodToken = this.installmentPaymentMethod.Token;
    }

    this.showSpinnerService.showSpinner(true);
    this.paymentService.deletePaymentToken(this.bindData.accountOwnerId, paymentMethodToken).subscribe(async (data: any) => {
      await data;

      method === GlobalConstants.PAYMENT_DOWNPAYMENT ? this.downpayPaymentMethod = null : this.installmentPaymentMethod = null;
      if (method === GlobalConstants.PAYMENT_INSTALL) {

        this.updateStoreBind({ autoPayref: ''});
        this.autoPayReference = '';
      }

      this.logTracker.loginfo('ReviewComponent', 'deletePaymentMethod', 'Delete Payment Info', 'Delete Payment Info Successful '.concat(method));
      // Update the PaymentSetup status and Make a post call for QSMICS update with the PaymentInformation
      this.updatePaymentSetupStatus({postReview: true});

      this.showSpinnerService.showSpinner(false);

    },
      (errorData: any) => {

        this.errorHandler(errorData);
        this.logTracker.logerror('ReviewComponent', 'deletePaymentMethod', 'paymentService.deletePaymentToken', 'Error=Error Deleting '.concat(method), errorData);
      });

   }
    return false;
  }

  deleteSPLPaymentMethod(method: string): boolean {
    // call spl cancel autopay & down payment API and pass token
    this.showSpinnerService.showSpinner(true);
    let paymentMethodToken = '';
    if (this.isSamePayMethodsForSPL && method === GlobalConstants.PAYMENT_INSTALL && !ObjectUtils.isObjectEmpty(this.downpayPaymentMethod)) {
      paymentMethodToken = this.installmentPaymentMethod.Token;
      this.paymentService.cancelAutoPay(this.cancelAutoPayReq(), this.accountOwnerId, this.autoPayReference).subscribe(res => {
        this.installmentPaymentMethod = null;
        this.updateStoreBind({ autoPayref: ''});
        this.autoPayReference = '';
        this.updatePaymentSetupStatus({postReview: true});
      }, (errorData: any) => {
        this.errorHandler(errorData);
      });
      this.showSpinnerService.showSpinner(false);
      return false;
    } else if (this.isSamePayMethodsForSPL && method === GlobalConstants.PAYMENT_DOWNPAYMENT && !ObjectUtils.isObjectEmpty(this.installmentPaymentMethod)) {
      paymentMethodToken = this.downpayPaymentMethod.Token;

      this.paymentService.cancelDownPay( this.accountOwnerId, this.downpayReferenceNumber).subscribe(res => {
        this.downpayPaymentMethod = null;
        this.updateStoreBind({ downPayref: ''});
        this.downpayReferenceNumber = '';
        this.updatePaymentSetupStatus({postReview: true});
      }, (errorData: any) => {
        this.errorHandler(errorData);
      });
      this.showSpinnerService.showSpinner(false);
      return false;
    }else if (method && method === GlobalConstants.PAYMENT_DOWNPAYMENT) {
      paymentMethodToken = this.downpayPaymentMethod.Token;
      this.paymentService.cancelDownPay( this.accountOwnerId, this.downpayReferenceNumber).subscribe(res => {
        this.deleteSPLPaymentToken(method,paymentMethodToken);
      }, (errorData: any) => {
        this.errorHandler(errorData);
      });
      return false;
    } else{
      paymentMethodToken = this.installmentPaymentMethod.Token;
      this.deleteSPLPaymentToken(method,paymentMethodToken);
    }
    return false;
  }

  trimSpace(formControlNameVal: any) {
    if (this.reviewCoverageForm.controls[formControlNameVal]?.value !== "" && this.reviewCoverageForm.controls[formControlNameVal]?.value !== null ) {
      this.reviewCoverageForm.controls[formControlNameVal]?.patchValue(this.reviewCoverageForm.controls[formControlNameVal]?.value.trim()); 
    }
  }

  deleteSPLPaymentToken(method: string,paymentMethodToken: string){
    this.paymentService.deletePaymentToken(this.bindData.accountOwnerId, paymentMethodToken).subscribe(async (data: any) => {
      await data;

      if (method === GlobalConstants.PAYMENT_INSTALL) {
        this.installmentPaymentMethod = null;
        this.updateStoreBind({ autoPayref: ''});
        this.autoPayReference = '';
      }else{
        this.downpayPaymentMethod = null;
        this.updateStoreBind({ downPayref: ''});
        this.downpayReferenceNumber = '';
      }

      this.logTracker.loginfo('ReviewComponent', 'deleteSPLPaymentToken', 'Delete SPL Payment token', 'Delete SPL Payment token Successful '.concat(method));
      // Update the PaymentSetup status and Make a post call for QSMICS update with the PaymentInformation
      this.updatePaymentSetupStatus({postReview: true});
      this.showSpinnerService.showSpinner(false);
    },
      (errorData: any) => {

        this.errorHandler(errorData);
        this.logTracker.logerror('ReviewComponent', 'deleteSPLPaymentToken', 'paymentService.deletePaymentToken', 'Error=Error Deleting '.concat(method), errorData);
      });
  }
  public cancelAutoPayReq = (): PaymentCancelAutoPayReq => {
    const payment: Payment = {
      notes: 'Canceling AutoPay',
      transactionSourceSystem: GlobalConstants.BWR_APP_NAME,
      userId: this.producerCode,
      userType: 'CUSTOMER'
    }

    const paymentCancelAutoPayReq: PaymentCancelAutoPayReq = {
      payment: payment
    }

    return paymentCancelAutoPayReq;
  }



  displayPaymentDialog(method: string): boolean {
    if (this.isCSR && (!this.installmentPaymentMethod || !this.downpayPaymentMethod)) {
      // this.displaySplAlertDialog(method);
      this.displaySplPaymentDialog(method);
      return false;
    }else{
    let type = '';
    if (method === GlobalConstants.PAYMENT_DOWNPAYMENT) {
      type = (this.downpaymentValue === 'Y' ?
        GlobalConstants.PAYMENT_TYPE_CHECKING_SAVINGS : GlobalConstants.PAYMENT_TYPE_CREDIT_DEBIT);
    } else {
      type = (this.eftFutureInstallValue === 'Y' ?
        GlobalConstants.PAYMENT_TYPE_CHECKING_SAVINGS : GlobalConstants.PAYMENT_TYPE_CREDIT_DEBIT);
    }

    const accountOwnerId = this.accountOwnerId;
    const dialogRef = this.paymentMethodDialog.open(PaymentMethodComponent, {
      height: '81%',
      width: '25%',
      panelClass: 'full-width-dialog',
      /*data: { firstName: 'John', lastName: 'TESTINGCHECKINGSAVINGS', ownerId: accountOwnerId,
              type: type, origin: window.location.href, method: method },*/
      data: {
        firstName: this.pniContact.person.firstName, lastName: this.pniContact.person.lastName, ownerId: accountOwnerId,
        type: type, origin: window.location.href, method: method
      },

      hasBackdrop: true,
      disableClose: true
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result && result.data) {
        if (method && method === GlobalConstants.PAYMENT_DOWNPAYMENT) {
          this.downpayPaymentMethod = this.mapPaymentMethodData(result.data);

        } else {
          this.installmentPaymentMethod = this.mapPaymentMethodData(result.data);

          // Make API call to enroll in AutoPay for Installment
          if (this.eftFutureInstallValue !== 'N') {
            this.enrollAutoPay();
          }
        }

        this.logTracker.loginfo('ReviewComponent', 'displayPaymentDialog', 'Add Payment Info', 'Add Payment Info Successful '.concat(method));
        //Make a POST call once user completes installment payment information details
        this.updatePaymentSetupStatus({postReview: true});

      }
    });
    return false;
  }
}
displaySplAlertDialog(method: string){
  const accountOwnerId = this.accountOwnerId;
  const dialogRef = this.securePayLineDialog.open(GenericDialogComponent, {
    width: '30%',
    height: 'auto',
    panelClass: 'full-width-dialog',
    data: {
      message: 'Please transfer user to Secure Pay Line to capture payment information',
      title: 'Secure Pay Line Transfer',
      acceptButtonText: 'Secure Pay Line process completed',
      cancelButtonText: ''
    },
    hasBackdrop: true,
    disableClose: true
  });
  dialogRef.afterClosed().subscribe(result => {
    if (result && result === true) {
      this.displaySplPaymentDialog(method);
    }
  });
}
displaySplPaymentDialog(method: string){
  const accountOwnerId = this.accountOwnerId;
  const dialogRef = this.securePayLineDialog.open(SplPaymentMethodComponent, {
    height: 'auto',
    width: '680px',
    panelClass: 'full-width-dialog',
    data: {
      firstName: this.pniContact.person.firstName, lastName: this.pniContact.person.lastName, ownerId: accountOwnerId,
      type: '', origin: window.location.href, method: method,paidAmount : this.reviewCoverageForm.controls.amountPaid.value,
      producerCode: this.producerCode,mco: this.mco
    },
    hasBackdrop: true,
    disableClose: true
  });
  dialogRef.afterClosed().subscribe(result => {
    if (result && result.data) {
      if (method && method === GlobalConstants.PAYMENT_DOWNPAYMENT) {
        this.downpayPaymentMethod = this.mapSPLPaymentMethodData(result.data);
        this.downpayReferenceNumber = this.downpayPaymentMethod.Token;
        this.updateStoreBind({ downPayref: this.downpayPaymentMethod.Token });
      } else {
        this.installmentPaymentMethod = this.mapSPLPaymentMethodData(result.data);
        this.autoPayReference = this.installmentPaymentMethod.Token;
        this.updateStoreBind({ autoPayref: this.installmentPaymentMethod.Token });
      }

      this.logTracker.loginfo('ReviewComponent', 'displaySPLPaymentDialog', 'Add Payment Info', 'Add Payment Info Successful '.concat(method));
      //Make a POST call once user completes installment payment information details
      this.updatePaymentSetupStatus({postReview: true});
      this.updateSPLPaymentInfoToken();
    }
  });
}

updateSPLPaymentInfoToken() {
  this.paymentService.viewPaymentMethod(this.accountOwnerId).subscribe(paymentsInfoData => {

    if(paymentsInfoData.customer.paymentMethods.length<2 && !ObjectUtils.isObjectEmpty(this.installmentPaymentMethod) && !ObjectUtils.isObjectEmpty(this.downpayPaymentMethod)){
      this.isSamePayMethodsForSPL = true;
    }

    const eftPaymentInfo = paymentsInfoData.customer.paymentMethods.filter((payInfo: { recurringEnabled: boolean; }) => payInfo.recurringEnabled === true) || [];

     if (eftPaymentInfo && eftPaymentInfo.length > 0) {
       this.installmentPaymentMethod = {
         Token: eftPaymentInfo[0].paymentToken,
         CardHolderName: eftPaymentInfo[0].accountHolderName,
         MaskedAccountNumber: eftPaymentInfo[0].accountNumber,
         ExpiryDate: eftPaymentInfo[0].expiryMonth ? eftPaymentInfo[0].expiryMonth + '/' + eftPaymentInfo[0].expiryYear : '',
         zipCode: eftPaymentInfo[0].zipCode ? eftPaymentInfo[0].zipCode : '',
         Type: eftPaymentInfo[0].type,
         BankName: eftPaymentInfo[0].bankName
       }
     }

     const downPaymentInfo = paymentsInfoData.customer.paymentMethods.filter((payInfo: { recurringEnabled: boolean; }) => payInfo.recurringEnabled === false) || [];

     if (downPaymentInfo && downPaymentInfo.length > 0) {
       this.downpayPaymentMethod = {
         Token: downPaymentInfo[0].paymentToken,
         CardHolderName: downPaymentInfo[0].accountHolderName,
         MaskedAccountNumber: downPaymentInfo[0].accountNumber,
         ExpiryDate: downPaymentInfo[0].expiryMonth ? downPaymentInfo[0].expiryMonth + '/' + downPaymentInfo[0].expiryYear : '',
         zipCode: downPaymentInfo[0].zipCode ? downPaymentInfo[0].zipCode : '',
         Type: downPaymentInfo[0].type,
         BankName: downPaymentInfo[0].bankName
       }
     }
     this.logTracker.loginfo('ReviewComponent', 'updateSPLPaymentInfoToken', 'Retrieve Payment Information For SPL', 'Retrieve Payment Information Successful');
     });

   }
  mapPaymentMethodData(paymentMethodData: any): PaymentMethod {
    const paymentMethod = {
      Token: paymentMethodData['Token'],
      Type: paymentMethodData['Type'],
      MaskedAccountNumber: paymentMethodData['MaskedAccountNumber'],
      CardHolderName: paymentMethodData['CardHolderName'],
      RoutingNumber: paymentMethodData['RoutingNumber'],
      BankName: paymentMethodData['BankName'],
      Default: paymentMethodData['Default'],
      ExpiryDate: paymentMethodData['ExpiryDate'],
      zipCode: paymentMethodData['zipCode']
    }
    return paymentMethod;
  }
  mapSPLPaymentMethodData(paymentMethodData: any): PaymentMethod {
    const paymentMethod = {
      Token: paymentMethodData['token'],
      Type: paymentMethodData['type'],
      MaskedAccountNumber: paymentMethodData['accountNumber'],
      CardHolderName: paymentMethodData['cardHolderName'],
      RoutingNumber: paymentMethodData['routingNumber'],
      BankName: paymentMethodData['bankName'],
      Default: '', //paymentMethodData['Default'],
      ExpiryDate: '',//paymentMethodData['ExpiryDate'],
      zipCode: paymentMethodData['cardHolderZip']
    }
    return paymentMethod;
  }
  updateSamePaymentInfo(): void {

    const chkValue = this.reviewCoverageForm.controls.samePaymentChk.value;
    if (chkValue === true) {
      if (ObjectUtils.isObjectEmpty(this.installmentPaymentMethod)) {
        this.installmentPaymentMethod = this.downpayPaymentMethod;

        this.enrollAutoPay();


      } else {
        this.downpayPaymentMethod = this.installmentPaymentMethod;

      }

      // Update the PaymentSetup status and Make a post call for QSMICS update with the PaymentInformation
      this.updatePaymentSetupStatus({postReview: true});

      this.logTracker.loginfo('ReviewComponent', 'updateSamePaymentInfo', 'Update Same Payment Info', 'Update Same Payment Info Successful ');
    }
  }

  updatePaymentSetupStatus = (postData: any): void => {
    this.paymetnSetup = true;

    if ((this.downpaymentValue !== 'N' && ObjectUtils.isObjectEmpty(this.downpayPaymentMethod)) ||
      (this.eftFutureInstallValue !== 'N' && ObjectUtils.isObjectEmpty(this.installmentPaymentMethod))) {
      this.paymetnSetup = false;
    }

    if (postData.postReview) {
      this.postReviewCall();
    }

  }

  enrollAutoPay() {
    this.showSpinnerService.showSpinner(true);
    let paymentMethods: PaymentMethods[] = [];
    const paymentMethod: PaymentMethods = {
      token: this.installmentPaymentMethod.Token,
      scheduleEnabled: 'true'
    }
    paymentMethods.push(paymentMethod);
    const address: Address = {
      line1: this.pniContact.addresses[0].streetName!,
      city: this.pniContact.addresses[0].city,
      state: this.pniContact.addresses[0].state,
      zipCode: this.pniContact.addresses[0].postalCode,
      country: GlobalConstants.PAYMENT_COUNTRY
    }

    const customer: Customer = {
      firstName: this.pniContact.person.firstName!,
      lastName: this.pniContact.person.lastName!,
      email: this.pniContact.person.emailAddress!,
      phoneNumber: this.pniContact.phones[0].phoneNumber,
      address: address
    }

    const account: Account = {
      id: this.accountOwnerId,
      referenceNumber: '',
      duplicateCheck: true,
      scheduleType: GlobalConstants.PAYMENT_SCHEDULE_TYPE,
      transactionSourceSystem: GlobalConstants.APP_NAME,
      scheduleStatus: GlobalConstants.PAYMENT_SCHEDULE_STATUS,
      transactionType: GlobalConstants.PAYMENT_TRANSACTION_TYPE,
      userType: GlobalConstants.PAYMENT_USER_TYPE,
      walletId: this.accountOwnerId,
      agentOfRecord: this.producerCode,
      paymentMethods: paymentMethods,
      customer: customer
    }

    this.paymentAutoPayReq = {
      account: account
    }


    this.paymentService.enrollAutoPay(this.paymentAutoPayReq).subscribe(async (data: any) => {
      await data;
      this.autoPayReference = data.account.scheduleReferenceNumber;
      this.updateStoreBind({ autoPayref: data.account.scheduleReferenceNumber });
      this.showSpinnerService.showSpinner(false);
      this.logTracker.loginfo('ReviewComponent', 'enrollAutoPay', 'Enroll Autopay', 'Enroll Autopay Successful ');

    },
      (errorData: any) => {
        this.errorHandler(errorData);
        this.logTracker.logerror('ReviewComponent', 'enrollAutoPay', 'paymentService.enrollAutoPay', 'Enroll Autopay Failed ', errorData);
      });
  }

  postReviewCall(): void {

    this.autoQuoteData = this.quoteDataMapper.mapReviewData({downPay: this.downpaymentValue, downpaySetup:  this.downpayPaymentMethod,
      installPay: this.eftFutureInstallValue, installmentSetup: this.installmentPaymentMethod, samePayCheck: this.reviewCoverageForm.controls.samePaymentChk.value});
    this.quoteDataService.saveUpdateQuote(this.autoQuoteData, this.quoteNumber, 'saveQuote').subscribe(async (data: any) => {
      await data;
      this.logTracker.loginfo('ReviewComponent', 'postReviewCall', 'QuoteAPI Save Quote', 'QuoteAPI Save Quote Successful ');
    },
      errorData => {
        this.errorHandler(errorData);
        this.logTracker.logerror('ReviewComponent', 'postReviewCall', 'quoteDataService.saveUpdateQuote', 'QuoteAPI Save Quote Failed ', errorData);
      });
  }

  navigationObservableWatch(): void {
    this.navigationObvSubscription = this.navigationService.navigationStepObv.subscribe(
      nextRoute => {

        if (nextRoute.startsWith('save-')) {

          this.requestedRoute =  nextRoute.split('-')[1].trim();
          this.performSaveExit = true;
          if (this.nextButton?.nativeElement?.disabled) {
            this.viewDocsAndUploadApplication(this.reviewCoverageForm);
          } else {
            this.nextButton.nativeElement.click();
          }
        }
      },
      error => this.logTracker.logerror('ReviewComponent', 'navigationObservableWatch', 'navigationStepObv',
        'Review Page navigationObservableWatch Error', error));
  }

}

