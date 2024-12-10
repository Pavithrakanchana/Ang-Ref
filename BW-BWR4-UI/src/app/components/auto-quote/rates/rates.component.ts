import { DatePipe } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { UntypedFormArray, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import * as Actions from '../../../state/actions/summary.action';
import { Subscription } from 'rxjs';
import { GlobalConstants } from 'src/app/constants/global.constant';
import { MessageConstants } from 'src/app/constants/message.constant';
import { DocumentsService } from 'src/app/services/documents.service';
import { EdmrFormsService } from 'src/app/services/edmr-forms.service';
import { QuoteDataService } from 'src/app/services/quote-data.service';
import { RatesService } from 'src/app/services/rates.service';
import { VehiclesService } from 'src/app/services/vehicles.service';
import { PayplansComponent } from 'src/app/shared/components/payplans/payplans.component';
import { HelpTextDialogComponent } from 'src/app/shared/dialog/helptext-dialog/helptext-dialog.component';
import { AutoCoverages, AutoQuoteData, Coverage, Error, Exceptions, PolicyPackage, UnderWritingReports } from 'src/app/shared/model/autoquote/autoquote.model';
import { IDropDownItem } from 'src/app/shared/model/IDropDownItem';
import { ValidValuesReq } from 'src/app/shared/model/validvalues/validvaluesreq.model';
import { MessagesService } from 'src/app/shared/services/messages.service';
import { NavigationService } from 'src/app/shared/services/navigation.service';
import { SpinnerStatusService } from 'src/app/shared/services/spinner-status.service';
import { ValidValuesService } from 'src/app/shared/services/validvalues/validvalues.service';
import { CommonUtils } from 'src/app/shared/utilities/common-utils';
import { HelptextMapper } from 'src/app/shared/utilities/helptext-mapper';
import { ObjectUtils } from 'src/app/shared/utilities/object-utils';
import { QuoteDataMapper } from 'src/app/shared/utilities/quotedata-mapper';
import { Tracker } from 'src/app/shared/utilities/tracker';
import { addPageStatus } from 'src/app/state/actions/summary.action';
import QuoteSummary, { PageStatus, VehicleSummary } from 'src/app/state/model/summary.model';
import { PolicyCoverageValidValues } from '../coverages/coverage-validvalues/policycoverage-validvalues.component';
import { SharedService } from 'src/app/services/shared.service';

@Component({
  selector: 'app-rates',
  templateUrl: './rates.component.html',
  styleUrls: ['./rates.component.scss']
})
export class RatesComponent implements OnInit {
  @ViewChild('next', { read: ElementRef }) nextButton!: ElementRef;
  ratesForm!: UntypedFormGroup;
  clickBack = false;
  recalculateStatus: boolean = false;
  @ViewChild(PolicyCoverageValidValues, { static: true }) child!: PolicyCoverageValidValues;
  @ViewChild(PayplansComponent, { static: true }) payPlanchild!: PayplansComponent;
  public bodilyInjuryCoverages!: IDropDownItem<string, string>[];
  public propertyDamageCoverages!: IDropDownItem<string, string>[];
  public uninsuredMotoristBodilyInjuryCoverages!: IDropDownItem<string, string>[];
  public underInsuredMotoristBodilyInjuryCoverages!: IDropDownItem<string, string>[];
  public medicalPaymentsCoverages!: IDropDownItem<string, string>[];
  vehicleList!: any[];
  vehicleVinValidationMsg: string[] = [];
  selectedPayPlan: string = '';
  dueAmountChange: string = '';
  termVal: any;
  formSubmitAttempt!: boolean;
  vehicleCoverages!: Coverage[];
  page: string = 'rates';
  policyState: string = '';
  //fees!: any[];
  policyCoverages!: Coverage[];
  policyPackage!: PolicyPackage[];
  selectedPackage: string = 'Premium';
  layout = GlobalConstants.LAYOUT_VERTICAL;
  qid!: any;
  pageStatus!: number;
  quoteNumber!: any;
  mco!: any;
  riskState = '';
  boardFormOrNNO = '';
  applicantNonOwner!: any;
  term = '';
  ratesDBData!: any;
  autoQuoteData!: AutoQuoteData;
  vehicleDetails!: VehicleSummary[];
  vehicleListFormArray!: UntypedFormArray;
  dueToday: string = '0';
  policyTerm: string = '0';
  reportEditsStatus: boolean = false;
  eftPaymentMethods: boolean = false;
  highestStateBILimit: string = '';
  highestStatePDLimit: string = '';
  errorMessage = '';
  eftFutureInstallValue!: string;
  downpaymentValue!: string;
  valuesLoaded = false;
  autoCoverages!: AutoCoverages;
  selectPayPlanCode: string = '';
  mvrOrderMsg: string = '';
  quoteBridgeStatus: boolean = false;
  hasProducerSweep = false;
  navigationObvSubscription!: Subscription;
  requestedRoute = '';
  performSaveExit = false;
  ratebook!: string;
  private isNewQuote!: boolean;
  violations: any;
  diffInDays: any;
  policyEffectiveDate:any;
  duiIndicator: boolean | undefined = false;
  within35MonthsIndi: boolean = false;
  filingTypeFR44: boolean | undefined = false;
  filingTypeSR22: boolean | undefined = false;
  rideShareIndicator!: any;

  routeMessageStatus!: string;
   ratingErrors: string[]=[];
   umpdDefaultValState!: string;
  constructor(private formb: UntypedFormBuilder, private router: Router, public datepipe: DatePipe,
    public documentService: DocumentsService, public quoteDataService: QuoteDataService, public validValuesService: ValidValuesService,
    public quoteDataMapper: QuoteDataMapper, private showSpinnerService: SpinnerStatusService, private readonly messageservice: MessagesService,
    private store: Store<{ quoteSummary: QuoteSummary }>, public quoteSvc: QuoteDataService, private ratesService: RatesService,
    private vehiclesService: VehiclesService, private dialog: MatDialog, private logTracker: Tracker, private navigationService: NavigationService,
    private helpTextMapper: HelptextMapper, private edmrFormsService: EdmrFormsService, private sharedService: SharedService
  ) {
    this.store.select('quoteSummary').subscribe(data => {
      this.filingTypeFR44 = data.filingTypeFR44;
      this.filingTypeSR22 = data.filingTypeSR22;
      this.duiIndicator = data.duiViolationInd;
    
    });
  }

  ngOnDestroy(): void {
    this.navigationService.updateNavigationRequestedRoute('');
    this.navigationObvSubscription.unsubscribe();
  }

  ngOnInit(): void {
    this.store.select('quoteSummary').subscribe(data => {
      this.applicantNonOwner = data.nonOwner;
      this.riskState = data.policyState;
      this.boardFormOrNNO = data.policyState == "CO" ? "BROAD Form" : "Named Non Owner"
      this.quoteNumber = data.qid;
      this.mco = data.mco;
      this.ratebook = data.rateBook;
      this.quoteBridgeStatus = data.bridgeStatus;
      this.hasProducerSweep = data.prodSweepStatus;
      this.isNewQuote = (data.newQuote === 'true' ? true : false);
      const pageStatusArr = data.pageStatus.filter(page => (page.name === 'RATE'));
      this.pageStatus = pageStatusArr.length > 0 ? pageStatusArr[0].status : !this.isNewQuote ? 1 : 0;
      this.policyState = data.policyState;
      this.policyEffectiveDate = data.policyEffectiveDate;
    });

    this.ratesForm = this.formb.group({
      BI: ['025/050', Validators.required],
      PD: ['015', Validators.required],
      UMBI: ['None'],
      UIM: ['None'],
      MP: ['None'],
      eft: [''],
      downPayment: [''],
      vehicles: this.formb.array([]),
      payPlan: [this.selectedPayPlan]
    });

    this.vehicleListFormArray = this.ratesForm.get('vehicles') as UntypedFormArray;
    this.vehicleCoverages = [];
    this.autoQuoteData = this.quoteDataMapper.mapRateQuoteRequestData('', this.pageStatus === 1 ? 'onload-rerate' : 'rate');
    //on the load of Rates screen
    this.loadRateDetails('getCall');
    this.umpdDefaultValState = this.vehiclesService.setUMPDDefaultVal();

    // save & exit behaviour subjec observable
    this.navigationObservableWatch();
  }
  initVehicle(): UntypedFormGroup {
    //initialize our vehicledetails
    return this.formb.group({
      id: [],
      OTC: GlobalConstants.NONE,
      UMPD:this.umpdDefaultValState,
      COL: GlobalConstants.NONE,
      CEQ: GlobalConstants.NONE,
      EXTR: GlobalConstants.NONE,
      ALL: ['N'],
      RA: ['N'],
      antiTheftCode: '-'
    });
  }
  addVehicleFormGroup(): void {
    this.clearFormArray();
    this.vehicleList?.forEach(() => {
      this.vehicleListFormArray.push(this.initVehicle());
    })
  }
  vehiclesFormGroup(index: any): UntypedFormGroup {
    const itemArray = this.ratesForm.controls.vehicles as UntypedFormArray;
    return itemArray?.controls[index] as UntypedFormGroup;
  }
  clearFormArray(): void {
    this.vehicleListFormArray.clear();
  }

  //on the load of Rates screen
  loadRateDetails(operation: string) {
    this.showSpinnerService.showSpinner(true);
    let startTime = new Date();
    this.quoteDataService.rateUpdateQuote(this.autoQuoteData, 'rateQuote').subscribe(async (data: any) => {
      await data;
      // console.log('rates data', data);
      this.messageservice.clearErrors();
      this.vehicleVinValidationMsg = [];
      this.logTracker.loginfo('RatesComponent', 'loadRateDetails', 'quoteDataService.rateUpdateQuote',
        'QuoteNumber='.concat(this.quoteNumber + '|Duration='.concat(CommonUtils.elapsedTime(startTime).toString())));

      this.showSpinnerService.showSpinner(false);
      this.valuesLoaded = true;
      // console.log("1");
      this.vehicleList = data.autoQuote.personalAuto?.vehicles;

      this.child.loadOutOfStateList(data.autoQuote.personalAuto?.vehicles);
      this.loadPolicyCoverages(data);
      this.child.filterCoverages('BI', []);
      this.addVehicleFormGroup();
      this.loadVehicleCoverages(data);

     /* if (this.vehicleVinValidationMsg?.length > 0){
      this.messageservice.showError(this.vehicleVinValidationMsg);
     }*/

      //MVR Status check
      this.mvrOrderMsg = data?.autoQuote?.orderMVRStatus && data?.autoQuote?.orderMVRStatus?.toLocaleUpperCase() === 'ORDER' ? MessageConstants.RATE_REPORTS_VERIFIED : MessageConstants.RATE_REPORTS_NONVERIFIED;
      this.ratingErrors = this.checkForRateErrors(data.autoQuote.policyPackage[0].autoCoverages.errors);
      if (this.vehicleVinValidationMsg?.length > 0){
      this.vehicleVinValidationMsg?.forEach((val: any) => {
        this.ratingErrors.push(val);
        });
      }
      if (this.ratingErrors && this.ratingErrors.length > 0) {
        this.messageservice.showError(this.ratingErrors);
        const element = document.querySelector('#topcontent');
        element?.scrollIntoView();
        // return;
      }
      this.eftFutureInstallValue = data.autoQuote.policyDiscountIndicators.eftFutureInstallments;
      this.downpaymentValue = data.autoQuote.policyDiscountIndicators.downPaymentMethod;
      this.ratesForm.patchValue({
        eft: data.autoQuote.policyDiscountIndicators.eftFutureInstallments,
        downPayment: data.autoQuote.policyDiscountIndicators.downPaymentMethod
      });
      this.eftPaymentMethods = this.eftFutureInstallValue != 'N';
      this.fetchTerm(data);
      this.loadPayPlansAndFeesAndPremium(data);
      this.reportEditsStatus = this.checkForReportEdits(data.autoQuote.underWritingReports).length > 0 ? true : false;

      if (this.quoteBridgeStatus === true || this.quoteBridgeStatus.toString() === 'true') {
        this.checkForBridgeEdits(data);
      }

      if ('POSTCall') { //recalculate method
        this.recalculateStatus = false;
        const pageStatus: PageStatus = { name: 'RATE', status: 1 };
        this.store.dispatch(addPageStatus({ pageStatus }));
        this.sharedService.updateLastVisitedPage(6);
      }
      this.showSpinnerService.showSpinner(false);
      if (operation === 'Submit') {
        if (this.clickBack) {
          this.launchPolicyInfo(this.quoteNumber);
        } else {
          this.router.navigateByUrl('/reports?qid=' + this.quoteNumber);
        }
      }
    },
      (errorData: any) => {
        this.logTracker.logerror('RatesComponent', 'loadRateDetails', 'quoteDataService.rateUpdateQuote',
          'Error=Rate Page Rate Quote|QuoteNumber='.concat(this.qid), errorData);

        this.errorHandler(errorData);
        this.clickBack = false;
      });
  }

  checkForBridgeEdits(data: any): void {
    let softEditsArry: string[] = [];
     // Bridge and to Rate screen for first time, then only show this soft edit
    if(this.pageStatus === 0 && this.quoteBridgeStatus)
    {
      softEditsArry.push(MessageConstants.RATE_UPDATEPREM_ON_BRIDGE)
    }
    if (softEditsArry?.length > 0) {
      this.messageservice.softError(softEditsArry);
      // scrollIntoView allows you to bring elements back into the visible viewport by scrolling the parent container.
      const element = document.querySelector('#topcontent');
      element?.scrollIntoView();
    }
  }

  checkForRateErrors(errors: Error[]): string[] {
    const ratingErrors: string[] = [];
    if (errors && errors.length > 0) {
      errors.forEach(error => {
        ratingErrors.push(error.description);
      });
      return ratingErrors;
    } else {
      return [];
    }
  }

  fetchTerm(obj: any) {
    this.termVal = obj.autoQuote.term;
  }

  loadPayPlansAndFeesAndPremium(obj: any) {
    this.policyPackage = obj.autoQuote.policyPackage;
    this.selectPayPlanCode = obj.autoQuote.policyPackage[0].autoCoverages?.userSelectedPayplan;
    if(!ObjectUtils.isObjectEmpty(this.policyPackage[0].autoCoverages?.payplansDetails)){
      let downPaymentObj = this.policyPackage[0].autoCoverages?.payplansDetails.find(o => o.payPlan === this.selectPayPlanCode);
      this.dueAmountChange = downPaymentObj?.downPayment?.theCurrencyAmount ? downPaymentObj?.downPayment?.theCurrencyAmount : '';
    }
    this.ratesForm.get('payPlan')?.patchValue(this.policyPackage[0]?.autoCoverages?.userSelectedPayplan);
  }

  loadPolicyCoverages(dataObj: any) {
    this.policyCoverages = dataObj.autoQuote.policyCoveragesDetails?.coverages;
    let polCovObj = this.policyCoverages;
    const updatedPolCov = this.tranformPolicyCovgForPip(dataObj, polCovObj);
    polCovObj = updatedPolCov;
    const biDBLimit = dataObj.autoQuote.policyCoveragesDetails?.coverages?.find((x: { code: string; }) => x.code === 'BI')?.limits.trim();
    const pdDBLimit = dataObj.autoQuote.policyCoveragesDetails?.coverages?.find((x: { code: string; }) => x.code === 'PD')?.limits.trim();
    const biLimit = this.child.setBILimit(dataObj, biDBLimit);
    const pdLimit = this.child.setpdLimit(dataObj, pdDBLimit);
    const umunstLimit = this.child.getUmunstlimit(dataObj);
    const uimunsLimit = this.child.getUimunsLimit(dataObj);
    const umsLimit = this.child.getUms(dataObj);
    // this.ratesForm.patchValue({
    //   BI: biLimit,
    //   PD: pdLimit
    // });
    for (let obj in polCovObj) {
      const code = polCovObj[obj].code;
      const limits = (polCovObj[obj].limits === GlobalConstants.EMPTY_STRING || (code !== 'UM/UIM' && polCovObj[obj].limits === '000/000')) ? GlobalConstants.NONE : polCovObj[obj].limits;
        this.ratesForm.get(code)?.patchValue(limits);
    };

    this.child.filterCoverages('BI', []);
    this.child.loadCoverages();
    this.child.checkForOutOfState();
    this.ratesForm.patchValue({
      BI: biLimit,
      PD: pdLimit,
      UMUNST: umunstLimit !== '' ? umunstLimit : GlobalConstants.NONE,
      UIMUNS: uimunsLimit !== '' ? uimunsLimit : GlobalConstants.NONE,
      UMS:umsLimit
    });
    
  }

  private tranformPolicyCovgForPip(dataObj: any, polCovObj: Coverage[]) {
    if(polCovObj?.some(x => x.code === "EPIP" || x.code === "BPIP")){
      const pipData = this.child.loadPIPData(dataObj);
      const pip = { code: 'PIP', deductible: '', limits: !this.applicantNonOwner ? pipData.pipVal : "000/000", premiumDetails: '' };
      const pipI = { code: 'PIPI', deductible: '', limits: !this.applicantNonOwner ? pipData.pipiVal : "000/000", premiumDetails: '' };
      const pipD = { code: 'PIPD', deductible: '', limits: !this.applicantNonOwner ? pipData.pipdVal : "000/000", premiumDetails: '' };
      const updatedPolCov = polCovObj.concat([pip, pipI, pipD]).filter(x => (x.code !== "BPIP" && x.code !== "EPIP"));
      this.policyCoverages = updatedPolCov;
      return updatedPolCov;
    }
    return polCovObj;
  }

  loadVehicleCoverages(obj: any) {
    this.vehicleCoverages = obj.autoQuote.personalAuto?.vehicles;
    obj?.autoQuote?.personalAuto?.vehicles?.forEach((vehicle: any, index: number) => {
      if (vehicle?.vin?.length < 17 && !this.applicantNonOwner && vehicle.year>= 1981) {
        this.vehicleVinValidationMsg.push('Vehicle ' + (index + 1) + ' : ' + MessageConstants.VIN_17DIGITS_EDIT);
      }else if (vehicle?.vin?.length == 0 && !this.applicantNonOwner && vehicle.year< 1981) {
        this.vehicleVinValidationMsg.push('Vehicle ' + (index + 1) + ' : ' + MessageConstants.EMPTY_VIN_EDIT);
      }
      let vehicleCovObj = this.vehiclesService.loadVehicleCoverages(vehicle?.vehiclesCoverages);
      this.vehicleListFormArray?.controls[index]?.patchValue({
        id: vehicle?.sequenceNumber,
        OTC: vehicleCovObj.OTC,
        UMPD:vehicleCovObj.UMPD,
        COL: vehicleCovObj.COL,
        CEQ: vehicleCovObj.CEQ,
        EXTR: vehicleCovObj.EXTR,
        ALL: vehicleCovObj.ALL,
        RA: vehicleCovObj.RA,
        antiTheftCode: vehicle.discountIndicators?.find((x: { code: string; }) => x.code === 'antiTheftCode')?.value || '-',
      })
    });
  }

  /* API error handling*/
  errorHandler(errorData: any) {
    const errorArr: any = [];
    errorData?.error?.transactionNotification?.remark?.forEach((val: any) => {
      errorArr.push(val.messageText);
    });
    this.messageservice.showError(errorArr);
    const element = document.querySelector('#topcontent');
    element?.scrollIntoView();
    this.showSpinnerService.showSpinner(false);
  }


  comparePolicyCoverages(formData: any) {
    this.recalculateStatus = this.ratesService.comparePolicyCoverages(formData, this.policyCoverages, this.policyState);
    this.showRecalculateEdit();
  }

  compareVehicleCoverages(formData: any) {
    this.recalculateStatus = this.ratesService.compareVehicleCoverages(formData, this.vehicleCoverages);
    this.showRecalculateEdit();
  }

  checkPayMenthodChange(rerateStatus: any) {
    this.recalculateStatus = rerateStatus;
    if (rerateStatus === true) {
      this.messageservice.showError([MessageConstants.PAYMETHOD_CHANGE_EDIT]);
      const element = document.querySelector('#topcontent');
      element?.scrollIntoView();
    } else {
      this.messageservice.softError([]);
    }

  }

  /* Handle form errors */
  public hasError = (controlName: string, errorName: string) => {
    return this.ratesForm.controls[controlName].hasError(errorName);
  }

  onSubmit(formData: any): void {
    let qid = JSON.stringify(this.quoteNumber);
    qid = qid.replace(/"/g, '');

    if (!this.reportEditsStatus) {
      if (this.vehicleVinValidationMsg.length === 0 || this.clickBack) {

        if (!this.recalculateStatus) {
          const pageStatus: PageStatus = { name: 'RATE', status: 1 };
          this.store.dispatch(addPageStatus({ pageStatus }));
          this.navigationService.removeRuleOnNext(6);
          if (this.performSaveExit) {
            this.sharedService.updateLastVisitedPage(6);
            this.showSpinnerService.showSpinner(false);
            this.navigationService.getNextRoutingRule(this.requestedRoute);
          return;
          }
          if (this.clickBack) {
            this.launchPolicyInfo(qid);
          } else {
            this.router.navigateByUrl('/reports?qid=' + qid);
          }
        } else {
          this.messageservice.softError([]);
          this.messageservice.showError([MessageConstants.PAYMETHOD_CHANGE_EDIT]);
          const element = document.querySelector('#topcontent');
          element?.scrollIntoView();
          this.performSaveExit = false;
          this.logTracker.logerror('RatesComponent', 'onSubmit', 'check for quote recalcute', 'error=PAYMETHOD_CHANGE_EDIT' , MessageConstants.PAYMETHOD_CHANGE_EDIT);
        }
      } else {
        this.navigationService.removeRuleOnNext(6);
        if (this.performSaveExit) {
          this.sharedService.updateLastVisitedPage(6);
          this.navigationService.getNextRoutingRule(this.requestedRoute);
          return;
        }
        this.messageservice.showError(this.vehicleVinValidationMsg);
        const element = document.querySelector('#topcontent');
        element?.scrollIntoView();
        this.logTracker.logerror('RatesComponent', 'onSubmit', 'VIN_17DIGITS_EDIT check', 'error=VIN_17DIGITS_EDIT' , this.vehicleVinValidationMsg.toString());
        // this.clickBack ? this.vehicleVinValidationMsg = [] : '';
      }
    } else {
      const element = document.querySelector('#topcontent');
      element?.scrollIntoView();
      this.performSaveExit = false;
    }
  }

  onClickBack(formData: any): void {
    this.clickBack = true;
    this.onSubmit(formData);
    this.logTracker.loginfo('RatesComponent', 'onClickBack', 'Back Button Clicked', 'Submitting Rates Form');
  }

  launchPolicyInfo(quoteId: string): void {
    this.router.navigateByUrl('/policyinfo?qid=' + quoteId);
  }

  recalculate(operation: string, formData: any) {
    this.formSubmitAttempt = true;
    let selectedPayPlan: any;
    this.logTracker.loginfo('RatesComponent', 'recalculate', 'Recalculate/Paypla change Button Click', 'Rate page FormData Submission and Is Form Valid ' + this.ratesForm.valid);
    if (this.ratesForm.valid) {
      this.messageservice.clearErrors();
      this.showSpinnerService.showSpinner(true);
      selectedPayPlan = this.ratesForm.get('payPlan')?.value || this.payPlanchild.form.get('payPlan')?.value; ///type === 'radio' ? this.ratesForm.get('payPlan')?.value : this.selectPayPlanCode;
      if (typeof selectedPayPlan === 'string') {
        selectedPayPlan = this.policyPackage[0].autoCoverages?.payplansDetails?.find(o => o.payPlan === selectedPayPlan);
      }
      this.autoQuoteData = this.quoteDataMapper.mapRateSaveQuoteRequestData(formData, [selectedPayPlan], 'rate', this.child.validValues,this.applicantNonOwner, this.vehicleList);
      this.loadRateDetails(operation);
    }
  }


  printSheet() {
    this.showSpinnerService.showSpinner(true);
    let startTime = new Date();
    this.edmrFormsService.printEdmrDoc(this.quoteNumber, this.mco, GlobalConstants.QUOTE_WORKSHEET, GlobalConstants.RATE_PAGE_NAME, GlobalConstants.UPLOAD_STATUS_YES).subscribe({
      next: res => {
        if (res?.documents[0].documentBytes !== undefined && res?.documents[0].documentBytes !== null) {
          CommonUtils.downloadDocument(res?.documents[0].documentBytes, 'Quotesheet-'+ this.quoteNumber);

        } else {
          this.showDocumentError(res);
        }
        this.showSpinnerService.showSpinner(false);
        // window.open(res.documents[0].link, "_blank")
        this.logTracker.loginfo('RatesComponent', 'printSheet', 'edmrService.printEdmrDoc',
        'QuoteNumber='.concat(this.qid + '|Duration='.concat(CommonUtils.elapsedTime(startTime).toString())));

      },
      complete(): void {
        // console.log('Print Sheet loaded');
      },
      error: err =>
        this.logTracker.logerror('RatesComponent', 'printSheet', 'edmrService.printEdmrDoc',
          'Error=Rate Page Rate Print Quote Worksheet|QuoteNumber='.concat(this.qid), err)
    });
  }

  showDocumentError = (res: any): void => {
    const docSeqNo = res?.documents[0].sequenceNumber || '';
    const docType = res?.documents[0].documentType;
    const errorMsg = res?.documents[0]?.transactionNotification?.remark[0]?.messageText;
    const errorDetails = 'DocumentSeqNo: '.concat(docSeqNo).concat(' DocumentTpe: ').concat(docType).concat(' Error Message: ').concat(errorMsg);
    this.logTracker.logerror('RatesComponent', 'printSheet', 'edmrService.printEdmrDoc',
    'Error=Rate Page Print Quote Worksheet', errorDetails);

    this.messageservice.showError([errorMsg]);
    const element = document.querySelector('#topcontent');
    element?.scrollIntoView();
  }


  _printSheet() {
    this.showSpinnerService.showSpinner(true);
    let startTime = new Date();
    this.documentService.fetchExtreamDoc(this.quoteNumber, this.mco, GlobalConstants.QUOTE_WORKSHEET, GlobalConstants.RATE_PAGE_NAME).subscribe({
      next: res => {
        if (res?.documentBytes !== undefined && res?.documentBytes !== null) {
          CommonUtils.downloadDocument(res.documentBytes, 'Quotesheet-'+ this.quoteNumber);
      } else {
        this.logTracker.logerror('RatesComponent', 'printQuoteSheet', 'documentService.fetchExtreamDoc',
        'Error=Rate Page Rate Print Quote Worksheet|QuoteNumber='.concat(this.qid), 'Unable to retrieve quote sheet at this time');
      }

        this.showSpinnerService.showSpinner(false);
        this.logTracker.loginfo('RatesComponent', 'printQuoteSheet', 'documentService.fetchExtreamDoc',
          'QuoteNumber='.concat(this.qid + '|Duration='.concat(CommonUtils.elapsedTime(startTime).toString())));
      },
      complete(): void {
        // console.log('Print Quote Sheet loaded');
      },
      error: err =>
        this.logTracker.logerror('RatesComponent', 'printQuoteSheet', 'documentService.fetchExtreamDoc',
          'Error=Rate Page Rate Print Quote Worksheet|QuoteNumber='.concat(this.qid), err)
    });
  }

  checkForReportEdits(reportData: UnderWritingReports[]) {
    let softEditsArry: string[] = [];
    let hardEditsArry: string[] = [];
    let infoEditsArry: string[] = [];
    if (!ObjectUtils.isObjectEmpty(reportData)) {
      const creditEdits: Exceptions[] = reportData.find((rdata: { reportName: string; }) => (rdata.reportName === 'Credit'))?.exceptions || [];
      if (creditEdits && creditEdits.length > 0) {
        creditEdits.forEach((edit: Exceptions) => {
          if (edit.type.toLocaleUpperCase() === 'HARD' || edit.type.toLocaleUpperCase() === 'HARD EDIT') {
            hardEditsArry.push(edit.text)
            this.messageservice.showError(hardEditsArry);
          } else if (edit.type.toLocaleUpperCase() === 'SOFT' || edit.type.toLocaleUpperCase() === 'SOFT EDIT') {
            softEditsArry.push(edit.text);
            this.messageservice.softError(softEditsArry);
          }
        });

        const element = document.querySelector('#topcontent');
        element?.scrollIntoView();
        if(hardEditsArry.length > 0) {
          this.logTracker.logerror('RatesComponent', 'checkForReportEdits', 'Recalculate/OnPayplanChange Button Click', 'error=rate errors' , hardEditsArry.toString());
        }else {
           this.logTracker.loginfo('RatesComponent', 'checkForReportEdits', 'Recalculate/OnPayplanChange Button Click', 'success=No rate errors');
        }

      }
    }
    return hardEditsArry;
  }

  loadHelpText(fieldID: string): void {
    let helpTextObj = this.helpTextMapper.mapHelpText(fieldID);

    if (helpTextObj) {
      this.dialog.open(HelpTextDialogComponent, {
        width: '30%',
        panelClass: 'full-width-dialog',
        data: {
          title: helpTextObj.title,
          text: helpTextObj.text
        }
      });
    }
  }

  showRecalculateEdit() {
    if (!this.recalculateStatus) {
      this.messageservice.softError([]);
       if (this.ratingErrors?.length == 0) {
      this.messageservice.clearErrors();
       } else {
        let biValue = this.ratesForm.value.BI;
            if (this.ratingErrors && this.ratingErrors.length > 0) {
              if(biValue !== '025/050') {
                this.messageservice.clearErrors();
              }
            }
       }
    }
    else {
      this.messageservice.clearErrors();
      this.messageservice.showError([MessageConstants.PAYMETHOD_CHANGE_EDIT]);
      const element = document.querySelector('#topcontent');
      element?.scrollIntoView();
      this.logTracker.logerror('RatesComponent', 'comparePolicyCoverages/compareVehicleCoverages', 'showRecalculateEdit', 'error=PAYMETHOD_CHANGE_EDIT' , MessageConstants.PAYMETHOD_CHANGE_EDIT);
    }
  }

  /**
   * Subscribes to the NavigationService Observable. Runs when the Observable
   * value is updated
   */
  navigationObservableWatch(): void {
    this.navigationObvSubscription = this.navigationService.navigationStepObv.subscribe(
      nextRoute => {
        if (nextRoute.startsWith('save-')) {
          this.requestedRoute =  nextRoute.split('-')[1].trim();
          // simulate form submit
          this.performSaveExit = true;
          this.nextButton.nativeElement.click();
          this.logTracker.loginfo('RatesComponent', 'navigationObservableWatch', 'navigationStepObv',
        'Success=Navigation to '+this.requestedRoute+' using stepper');
        }
      },
      error => this.logTracker.logerror('RatesComponent', 'navigationObservableWatch', 'navigationStepObv',
        'Vehicle Page navigationObservableWatch Error', error));
  }

  private transformCoverageForPip(policyCoverages: any) {

  }
}

