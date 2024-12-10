import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { UntypedFormArray, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatRadioChange } from '@angular/material/radio';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { forkJoin, Observable, of, Subscription } from 'rxjs';
import { MessageConstants } from 'src/app/constants/message.constant';
import { DriverClueReportService } from 'src/app/services/driver-clue-report.service';
import { QuoteDataService } from 'src/app/services/quote-data.service';
import { SharedService } from 'src/app/services/shared.service';
import { AutoQuoteData, Driver, Exceptions, PriorCarrierInfo, UnderWritingReports } from 'src/app/shared/model/autoquote/autoquote.model';
import { ClueResponse } from 'src/app/shared/model/cluereport/clue-response.model';
import { ValidValuesReq } from 'src/app/shared/model/validvalues/validvaluesreq.model';
import { MessagesService } from 'src/app/shared/services/messages.service';
import { NavigationService } from 'src/app/shared/services/navigation.service';
import { SpinnerStatusService } from 'src/app/shared/services/spinner-status.service';
import { ValidValuesService } from 'src/app/shared/services/validvalues/validvalues.service';
import { CommonUtils } from 'src/app/shared/utilities/common-utils';
import { ObjectUtils } from 'src/app/shared/utilities/object-utils';
import { QuoteDataMapper } from 'src/app/shared/utilities/quotedata-mapper';
import { Tracker } from 'src/app/shared/utilities/tracker';
import { addPageStatus } from 'src/app/state/actions/summary.action';
import * as Actions from '../../../state/actions/summary.action';
import QuoteSummary, { PageStatus } from 'src/app/state/model/summary.model';
import { GlobalConstants } from '../../../constants/global.constant';
import { ViolationsListComponent } from '../violations/violations-list/violations-list.component';
import { ViolationsUtil } from 'src/app/shared/utilities/violations-util';
@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss'],
})
export class ReportsComponent implements OnInit {
  @ViewChild('back', { read: ElementRef }) backButton!: ElementRef;
  clickBack = false;
  @ViewChild(ViolationsListComponent) child!: ViolationsListComponent;
  @ViewChild(ViolationsListComponent, { read: ElementRef }) violationChild!: ElementRef;
  clueResponseObj!: ClueResponse;
  priorCarrierData!: PriorCarrierInfo[];
  underWritingsData!: any;
  errorArr: any = [];
  formSubmitAttempt!: boolean;
  mco!: any;
  orderCLUEReportStatus: any = false;
  qid!: any;
  quoteNumber!: any;
  reportsForm!: UntypedFormGroup;
  violations: any = [];
  violationsLoaded = false;
  showSpinner = false;
  errorMessage = '';
  infoMessage!: string;
  page: string = 'Reports';
  verification_codes: any = GlobalConstants.REPORTS_VERIFICATION_CODES;
  selectedPriorInsurance: string = 'InsuredProvided';
  autoQuoteData!: AutoQuoteData;
  orderMVRDriverStatusList: boolean[] = [];
  orderMVRStatus: boolean = false;
  //onLoadOrderMVRStatus: boolean = false;
  licensePatternStatus: boolean = false;
  isMVRPNIDOBChanged!: boolean;
  driverListForMVROrder: string[] = [];
  isPNIDOBEditApplied: boolean = false;
  primaryResidence: boolean = false;
  multipolicy: boolean = false;
  popServiceEdits: Exceptions[] = [];
  pageStatus!: number;
  priorInsuranceStatus!: string;
  vendorCarrier!: string;
  hasPriorInsuranceLapse = false;
  underWritingStatus!: string;
  navigationObvSubscription!: Subscription;
  requestedRoute = '';
  performSaveExit = false;
  priorCarrierList!: any;
  priorCarrierInfoObj: PriorCarrierInfo[] = [];
  priorLimitList: any;
  hardEditMessages: string[] = [];
  mvrStatus!: string;
  clueStatus!: string;
  ratebook!: string;
  policyState!: string;
  stepperRestriction: boolean = false;
  priorInsuranceDBValue: string = GlobalConstants.EMPTY_STRING;
  priorInsuranceInd!: string;
  popReportSource!: string;
  policyEffectiveDate!: string;
  formSubmitCount=0;
  filingValStartsWith2or4: boolean = false;
  softErrArr: any = [];
  within35MonthsIndi: boolean = false;
  constructor(private formb: UntypedFormBuilder, private router: Router,
    private showSpinnerService: SpinnerStatusService,
    private quoteDataService: QuoteDataService, private store: Store<{ quoteSummary: QuoteSummary }>,
    public quoteDataMapper: QuoteDataMapper,
    private readonly messageService: MessagesService,
    private clueReportService: DriverClueReportService,
    public sharedService: SharedService,
    private navigationService: NavigationService, private logTracker: Tracker,
    public validValuesService: ValidValuesService,) {
      this.store.select('quoteSummary').subscribe(data => {
        this.mco = data.mco;
        this.policyState = data.policyState;
        this.ratebook = data.rateBook;
        this.orderCLUEReportStatus = data.orderCLUEReport;
        let qid = JSON.stringify(data.qid);
        this.quoteNumber = qid.replace(/"/g, '');
        this.policyState = data.policyState;
        this.priorInsuranceInd = data.priorCarrierInsIndicator;
        this.policyEffectiveDate= data.policyEffectiveDate;
        const pageStatusArr = data.pageStatus.filter(page => (page.name === 'REPORTS'));
        this.pageStatus = pageStatusArr.length > 0 ? pageStatusArr[0].status : 0;
        this.stepperRestriction = data.stepperRestriction;
      });
    }


  ngOnDestroy(): void {
    this.navigationService.updateNavigationRequestedRoute('');
    this.navigationObvSubscription.unsubscribe();
  }

  ngOnInit(): void {
    this.reportsForm = this.formb.group({
      addViolation: this.formb.array([]),
      priorInsurance: ['N', Validators.required]
    });


    this.getViolationsAndReports();
    // save & exit behaviour subjec observable
    this.navigationObservableWatch();
  }
  violationFormGroup(index: number): UntypedFormGroup {
    const itemControls = this.reportsForm.get('addViolation') as UntypedFormArray;
    return itemControls.controls[index] as UntypedFormGroup;
  }
  getViolationsAndReports(): void {
    const validvaluesreq: ValidValuesReq = {
      appName: GlobalConstants.APP_NAME,
      pageName: GlobalConstants.COVERAGE_PAGE_NAME,
      mco: GlobalConstants.MCO_ALL_VALID_VALUES,
      ratebook: GlobalConstants.RATEBOOK_ALL_VALID_VALUES,
      state: this.policyState,
      dropdownName: GlobalConstants.DROPDOWN_ALL_VALID_VALUES,
      filter:''
    };
    if ((sessionStorage.getItem('NEWQUOTE') !== 'TRUE') || (sessionStorage.getItem('violationFormData') != null)) {
      let violationsReportsObservables: Observable<any>[] = new Array();
      //uncomment if getreport API is ready --
      let startTime = new Date();

      violationsReportsObservables.push(this.sharedService.getBWLookUpForPriorCarrier());
      violationsReportsObservables.push(this.validValuesService.getValidValues(validvaluesreq));
      violationsReportsObservables.push(this.quoteDataService.retrieveQuote(this.quoteNumber, 'getReports', this.policyState, this.ratebook));
      this.showSpinnerService.showSpinner(true);
      forkJoin(violationsReportsObservables)
        .subscribe(results => {
          this.violations = results[2]?.autoQuote?.personalAuto?.drivers;
          if(this.policyState === GlobalConstants.STATE_FL)
          {
            this.retrieveStateFiling(this.violations);
          }
          this.priorCarrierList = this.sharedService.mapBWLookUpForPriorCarrier(results[0]);
          this.priorLimitList = results[1]?.responseMap?.prior_carrier_limits;
          this.priorCarrierData = results[2]?.autoQuote?.priorCarrierInfo;
          this.priorInsuranceStatus = (this.priorInsuranceStatusMethod('InsuredProvided')[0].priorCarrierName)?.trim();          
          this.priorCarrierDisplayValueFilter(this.priorCarrierData);
          this.underWritingsData = results[2]?.autoQuote?.underWritingReports;
          this.underWritingStatus = this.underWritingsReport('POP')[0].status;
          this.setLapseYesNo(results[2]?.autoQuote?.priorCarrierInfo[1].policyExpirationDate);
          this.selectedPriorInsurance = results[2]?.autoQuote?.underWritingReportsModifiedAttributes.filter((obj: { code: string; }) => (obj.code === 'priorInsuranceVendorAsSourceIndicator'))[0].value;
          this.priorInsuranceDBValue = JSON.parse(JSON.stringify(this.selectedPriorInsurance));          
          // Hide priorInsurance section if POP Source = 'UserSelect' , prior name = BW/FO and POPReports is not gernerated
          if (this.popReportSource === 'UserSelected' && ((this.priorInsuranceStatus === 'BW' || this.priorInsuranceStatus === 'FO') && this.priorCarrierInfoObj[0].priorCarrierName?.trim() === 'No Prior')) {
            this.priorInsuranceStatus = 'NO';
          }
          this.priorInsuranceStatus?.toUpperCase() === 'NO' ? CommonUtils.updateControlValidation(this.reportsForm.controls.priorInsurance, false)
            : CommonUtils.updateControlValidation(this.reportsForm.controls.priorInsurance, true);
          // Condition for PriorInsurance Default value
          if (this.popReportSource === 'UserSelected' && !this.checkForDriverStateFiling()) {
            this.selectedPriorInsurance = 'N'; // If popReportSource = 'UserSelected', deafult to InsuredPro
          } else {
             this.selectedPriorInsurance = 'Y'; // If popReportSource = Reports , default to Vendor 
          }     
          this.reportsForm.get('priorInsurance')?.patchValue(this.selectedPriorInsurance);
          // T/Y/R/M  /D/G/N/J/K/H/I/B
          this.primaryResidence = (results[2]?.autoQuote?.policyDiscountIndicators?.primaryResidence === 'Y' || results[2]?.autoQuote?.policyDiscountIndicators?.primaryResidence === 'M') ? true : false;
          this.multipolicy = results[2]?.autoQuote?.policyDiscountIndicators?.multiPolicy == 'N' ? false : true;

          // check of PNI's DOB change indicator
          this.isMVRPNIDOBChanged = (this.violations[0]?.sequenceNumber === 1 && this.violations[0]?.mvrDateOfBirthChangeIndicator) ? true : false;
          this.violationsLoaded = true;
          this.showSpinnerService.showSpinner(false);
          this.checkForReportEdits(this.underWritingsData);
          this.mvrClueStatus(results[2]);

          this.logTracker.loginfo('ReportsComponent', 'getViolationsAndReports', 'this.quoteDataService.retrieveQuote',
            'QuoteNumber='.concat(this.quoteNumber + '|Duration='.concat(CommonUtils.elapsedTime(startTime).toString())));
        },
          (error: any) => {
            this.logTracker.logerror('ReportsComponent', 'getViolationsAndReports', 'this.quoteDataService.retrieveQuote',
              'Error=Reports Page Rate Get|QuoteNumber='.concat(this.quoteNumber), error);

            this.errorHandler(error);
            this.violationsLoaded = true;
            this.showSpinnerService.showSpinner(false);
          });
    }
  }

  popReportSourceIdentifier() {
    return this.priorCarrierInfoObj[0].priorCarrierName !== this.priorCarrierInfoObj[1].priorCarrierName ||
      this.priorCarrierInfoObj[0].priorLimits !== this.priorCarrierInfoObj[1].priorLimits ||
      this.priorCarrierInfoObj[0].policyExpirationDate !== this.priorCarrierInfoObj[1].policyExpirationDate;      
  }

  mvrClueStatus = (reportData: any): void => {
    const underwriterData: UnderWritingReports[] = reportData?.autoQuote?.underWritingReports;
    const driversData: Driver[] =  reportData?.autoQuote?.personalAuto?.drivers
    let emptyDriverslicences = false;
    driversData?.forEach((driver: any, i: number) => {
      if (driver?.license?.licenseType !== 'F' && driver?.license?.licenseType !== 'N' && driver?.driverType !== 'E' && ObjectUtils.isFieldEmpty(driver?.license?.licenseNumber)) {
        emptyDriverslicences = true;
      }
    });
     this.orderMVRStatus = this.checkForDriversOrderMVRStatus(this.violations)?.length > 0 && !emptyDriverslicences;

    const mvrReportStatus = underwriterData.find((r: {reportName: string}) => r.reportName === 'MVR')?.status || GlobalConstants.NONE;
    const clueReportStatus = underwriterData.find((r: {reportName: string}) => r.reportName === 'CLUE')?.status || GlobalConstants.NONE;

    this.clueStatus = clueReportStatus &&  clueReportStatus === 'Yes' ? 'Complete' : 'Not Run';
    this.mvrStatus = this.checkForMVRStatus(reportData?.autoQuote?.personalAuto?.drivers)?.length > 0 ? 'Not Run' : 'Complete';//mvrReportStatus && mvrReportStatus === 'Yes' ? 'Complete' : 'Not Run';
    //this.orderMVRStatus = this.mvrStatus !== 'Complete' && emptyDriverslicences ? false : true;
    //this.onLoadOrderMVRStatus = this.mvrStatus !== 'Complete' && emptyDriverslicences ? false : true;
  }

  setLapseYesNo(dateString: string): boolean {
    const expirationDate = new Date(dateString);
    expirationDate.setHours(0, 0, 0, 0);

    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);


    return expirationDate < todayDate;
  }

  priorCarrierDisplayValueFilter(priorInfoObj: any): void {
    priorInfoObj.forEach((dataObj: PriorCarrierInfo) => {

      dataObj.priorCarrierName = (dataObj?.priorCarrierName ==='99' )? 'Bristol West': (this.priorCarrierList?.find((x: { key: string; }) => x.key === dataObj?.priorCarrierName)?.displayvalue || '');

        if (dataObj?.priorCarrierName?.trim() === 'No Prior') {
        dataObj.priorLimits = 'No Prior';
        dataObj.policyExpirationDate = 'No Prior';
        dataObj.continuousInsuranceIndicator = false;
      } else { // Requirement : BW < 2 years returned from Verisk, Foremost < 2 years returned from Verisk
       dataObj.priorLimits = this.priorLimitList?.find((x: { key: string; }) => x.key === dataObj.priorLimits)?.displayvalue || '';
        dataObj.priorLimits = dataObj.priorLimits? dataObj.priorLimits :
        ((dataObj.priorCarrierName?.trim()?.toUpperCase() === 'BRISTOL WEST' || dataObj.priorCarrierName?.trim()?.toUpperCase() === 'FOREMOST') && (dataObj.priorLimits?.trim()?.toUpperCase() === 'NO' || dataObj.priorLimits ==='')) ?'No Prior' : '';

      }
      this.priorCarrierInfoObj.push(dataObj);
    });
    this.popReportSource = this.popReportSourceIdentifier() ? 'UserSelected' : 'Reports'; 
  }

  priorInsuranceStatusMethod(origin: string) {
     return this.priorCarrierData?.filter(x => (x.reportOrigin === origin));
  }

  underWritingsReport(name: string) {
    return this.underWritingsData?.filter(((x: { reportName: string; }) => (x.reportName === name)));
  }

  checkForBWFarmersAffiliate(value: string) {
    return GlobalConstants.POP_BLOCK_VALUES.includes(value) && this.popReportSource === 'Reports';
  }

  checkForDriverStateFiling() {
    return (this.policyState === GlobalConstants.STATE_FL && this.filingValStartsWith2or4);
  }

  priorInsStatusCheck(index: any) {
    console.log(this.priorCarrierData[index], "========");
    
    let softEditsArry: string[] = [];
    if (this.priorInsuranceInd === 'Y' && this.priorCarrierData[index].reportOrigin === "Vendor") { //SoftEdit Display Condition - If Prior Insurance returns response and user DOES change the prefill response on the Coverages Page to another selection  and priorInsurance section should be visible
      // alert("1")
      this.messageService.clearSoftErrors();
    }else if (this.priorInsuranceInd === 'Y' && this.priorCarrierData[index].reportOrigin === "InsuredProvided") {
      // alert("2") 
      softEditsArry.push(MessageConstants.PRIOR_INSUR_STATUS_MSG);
    }

    this.messageService.softError(softEditsArry);
  }

  checkForReportEdits(reportData: UnderWritingReports[]): void {
    const mvrEdits: Exceptions[] = reportData.find((rdata: { reportName: string; }) => (rdata.reportName === 'MVR'))?.exceptions || [];
    const drivingscroreStatus: string = reportData.find((rdata: { reportName: string; }) => (rdata?.reportName?.toLocaleUpperCase() === 'DRIVERSCORE'))?.status || '';
    const vehicleHistEdits: Exceptions[] = reportData.find((rdata: { reportName: string; }) => (rdata.reportName === 'VEHICLEHISTORY'))?.exceptions || [];
    const popServiceEdits = reportData.find((rdata: { reportName: string; }) => (rdata.reportName === 'POP'))?.exceptions || [];
    this.updateFollowupReqLimitValue(popServiceEdits);
    let softEditsArry: string[] = [];
    let hardEditsArry: string[] = [];
    let infoEditsArry: string[] = [];
    const serviceEdits = mvrEdits?.concat(vehicleHistEdits);    
    if (this.priorInsuranceInd === 'Y' && this.priorInsuranceStatus !== 'NO' && this.reportsForm.get('priorInsurance')?.value !== 'Y') { //SoftEdit Display Condition - If Prior Insurance returns response and user DOES change the prefill response on the Coverages Page to another selection  and priorInsurance section should be visible
      softEditsArry.push(MessageConstants.PRIOR_INSUR_STATUS_MSG);
    }
    if (serviceEdits && serviceEdits.length > 0) {
      serviceEdits.forEach((edit: Exceptions) => {
        if (edit.type.toLocaleUpperCase() === 'HARD' || edit.type.toLocaleUpperCase() === 'HARD EDIT') {
          hardEditsArry.push(edit.text);
          this.messageService.showError(hardEditsArry);
          this.hardEditMessages = hardEditsArry;
        } else if (edit.type.toLocaleUpperCase() === 'SOFT' || edit.type.toLocaleUpperCase() === 'SOFT EDIT') {
          softEditsArry.push(edit.text);
          if (edit?.text?.toLocaleUpperCase().startsWith('DRIVER 1: MVR DATE OF BIRTH MISMATCH')) { this.isPNIDOBEditApplied = true }
        }
      });
      const element = document.querySelector('#topcontent');
      element?.scrollIntoView();
    }

    if (drivingscroreStatus === 'No') {
      softEditsArry.push(MessageConstants.DRIVING_SCORE_NO_CONNECT_MSG);

    }
    
    if(this.checkForDriverStateFiling() && this.priorInsuranceStatus?.toUpperCase() !='NO' && (this.priorInsuranceStatusMethod('InsuredProvided')[0].reportOrigin)?.trim() === 'InsuredProvided'
    && (this.priorInsuranceStatusMethod('Vendor')[0].priorCarrierName)?.trim() === 'No Prior' && (this.priorInsuranceStatusMethod('Vendor')[0].reportOrigin)?.trim() === 'Vendor'){
      softEditsArry.push(MessageConstants.PRIOR_INSURANCE_SR22_FR44);
    }

    if (softEditsArry.length > 0) {
      this.messageService.softError(softEditsArry);
      // scrollIntoView allows you to bring elements back into the visible viewport by scrolling the parent container.
      const element = document.querySelector('#topcontent');
      element?.scrollIntoView();
    }
  }

  updateFollowupReqLimitValue(popServiceEdits:Exceptions[]) {
    this.popServiceEdits = popServiceEdits?.filter( (x: any) => {
      const editText = x.text;
      if (editText.split('of')[0].trim() === 'Prior BI Limits') {
        const priorLimitKey = editText.split('of')[1].substring(0, 3);

        const priorLimitVal = this.priorLimitList?.find((obj: any) => obj.key === priorLimitKey.trim())?.displayvalue || '';
        x.text = 'Prior BI Limits of '+ priorLimitVal+' ' + editText.substring(22, editText.length);
      }
      return x;
    });
  }

  loadReportsData(data: AutoQuoteData) {
    this.underWritingsData = data?.autoQuote?.underWritingReports;
    this.mvrStatus = (this.checkForMVRStatus(data?.autoQuote?.personalAuto?.drivers)?.length > 0) ? 'Not Run' : 'Complete';
    this.clueStatus = this.underWritingsReport('CLUE')[0].status &&  this.underWritingsReport('CLUE')[0].status === 'Yes' ? 'Complete' : 'Not Run';;
    this.child.loadViolationList(data?.autoQuote?.personalAuto?.drivers);
    this.violations = data?.autoQuote?.personalAuto?.drivers;
    this.isMVRPNIDOBChanged = (this.violations[0]?.sequenceNumber === 1 && this.violations[0]?.mvrDateOfBirthChangeIndicator) ? true : false;
    this.checkForReportEdits(this.underWritingsData);
    //this.refresh(); //temp re-solution
  }

  checkForDriversOrderMVRStatus(driversList: any) {
    return driversList.filter((driver: any, _i: number) => ((driver?.orderMVR.trim() === 'NO' || driver?.orderMVR.trim() === 'N' || driver?.orderMVR.trim() === 'NC') && (driver?.license?.licenseType !== 'F' && driver?.license?.licenseType !== 'N' && driver?.license?.licenseType !== 'I')
    && driver?.license?.licenseNumber !== GlobalConstants.EMPTY_STRING && driver?.driverType !== 'E' && (this.checkForDriversAgeAndSelfReportedViolations(driver)))); 
  }
  checkForMVRStatus(driversList: any) {
    return driversList.filter((driver: any, _i: number) => ((driver?.orderMVR.trim() === 'NO' || driver?.orderMVR.trim() === 'N' || driver?.orderMVR.trim() === 'NH' || driver?.orderMVR.trim() === 'NC') && (driver?.license?.licenseType !== 'F' && driver?.license?.licenseType !== 'N' && driver?.license?.licenseType !== 'I')
      && driver?.driverType !== 'E' && (this.checkForDriversAgeAndSelfReportedViolations(driver)) ));
  }

  checkForDriversAgeAndSelfReportedViolations(driverDetails: any) {
    let status = true;
    if (this.driverAgeEligibility(driverDetails?.birthDate)) {
      const selfReportingList = driverDetails?.violations?.filter((violations:any) => (violations.sequenceNumber != 0 && (violations?.reportingSource?.trim()?.toUpperCase() === 'SR' || violations?.reportingSource?.trim() === 'Self Reported')));
      status = selfReportingList.length > 0 ? true : false;
    }
    return status;
  }

   /* Driver age calculation*/
  driverAgeEligibility(birthdate: any): boolean {
    var birthDate = new Date(birthdate);
    var today = new Date();
    var Time = today.getTime() - birthDate.getTime();
    var Days = Time / (1000 * 3600 * 24);
    return (Math.floor((Math.round(Days)) / 365)) <= 16 ? true : false;
  }

  createForm(): UntypedFormGroup {
    return this.reportsForm;
  }

  onPriorInsuranceChange(event: MatRadioChange) {
    this.selectedPriorInsurance = event.value;
    this.reportsForm.get('priorInsurance')?.patchValue(event.value);
  }

  onLicenseChange(data: any): void {
    this.orderMVRDriverStatusList = data;
    this.driverListForMVROrder = [];
    data.forEach((val: any, index: number) => {
      if (val) {
        this.driverListForMVROrder.push('Driver ' + (index + 1));
      }
    });

    let driverLicErr = this.checkForDriverLicenseID('onchange');
   // if (this.onLoadOrderMVRStatus) {
   //    this.orderMVRStatus = driverLicErr.length == 0 && !this.licensePatternStatus ? true : false;
   // } else {
    const driversOrderStatus = this.checkForDriversOrderMVRStatus(this.violations)?.length > 0
    //on drivers license number change, enable orderMVR button if allLicensefields are filled, no licenseNumber pattern errors and (if there is any change in license number or received orderMVR='NO'|| 'N' from backend response)
      this.orderMVRStatus = !this.licensePatternStatus && driverLicErr.length == 0 && (data?.includes(true) || driversOrderStatus);
   // }
  }

  /* API error handling*/
  errorHandler(errorData: any): void {
   errorData?.error?.transactionNotification?.remark?.forEach((val: any) => {
      if (!this.errorArr.includes(val.messageText)) {
        if(val.messageType !== "Soft Edit"){
          this.errorArr.push(val.messageText);
        }else {
          this.softErrArr.push(val.messageText);
        }
      } 
    });
    this.messageService.showError(this.errorArr);
    this.messageService.softError(this.softErrArr);
    const element = document.querySelector('#topcontent');
    element?.scrollIntoView();
    this.showSpinnerService.showSpinner(false);
  }

  refresh(): void {
    window.location.reload();
  }

  onClickBack(formData: any): void {
    this.clickBack = true;
    this.onSubmit(formData);
  }

  onSubmit(formData: any): void {
    if (this.performSaveExit) {
      this.clickBack = (this.requestedRoute === GlobalConstants.PAGE_URLS[8] || this.requestedRoute === GlobalConstants.PAGE_URLS[9]) ? false : true;
    }
    this.formSubmitAttempt = true;
    this.formSubmitCount= this.formSubmitCount+1;
    let uiEditsArry: string[] = [];
     this.violationChild?.nativeElement?.querySelector('#violationNext')?.click();
    const violationReq = JSON.parse(JSON.stringify(this.violations));
    let duiIndicator = this.getDUIViolationInd(violationReq)
      this.store.dispatch(Actions.setDUIViolationInd ({ duiViolationInd: duiIndicator })); 
    //this.violationChild.nativeElement.querySelector('#violationListForm').submit();   
    if(this.policyState === GlobalConstants.STATE_FL && this.formSubmitCount == 1){
          const violationRequestObj = JSON.parse(JSON.stringify(this.violations));
          let hasMaturedDriverViolation: any = ViolationsUtil.validateMatureDriverViolation(violationRequestObj, formData.value.addViolation,this.policyEffectiveDate);
          if (hasMaturedDriverViolation.violation) {
            this.messageService.softError(hasMaturedDriverViolation.edit);
            const element = document.querySelector('#topcontent');
            element?.scrollIntoView();
            this.performSaveExit = false;
            return;
          }
        }
    if (this.reportsForm.valid) {
      if (this.checkForDriverLicenseID('').length == 0 || this.clickBack) {
        if (this.hardEditMessages.length == 0) {
          this.orderMVR(formData, 'NEXT');
        } else {
          this.messageService.showError(this.hardEditMessages);
          const element = document.querySelector('#topcontent');
          element?.scrollIntoView();          
          if (this.performSaveExit) {
            this.showSpinnerService.showSpinner(false);
            this.navigationService.getNextRoutingRule(this.requestedRoute);
            return;
          } else if (this.clickBack) {
              this.router.navigateByUrl('/rates?qid=' + this.quoteNumber);
          }
        }
      }
    } else {
      //this.checkForDriverLicenseID();
      this.performSaveExit = false;
      this.clickBack = false;
    }

  }

  //DUI violation Indicator
  getDUIViolationInd(drivers: any) : boolean {
    // this.violationsMonthsCal(drivers);
    let duiIndicator = false;
    drivers?.forEach((driver: any) => {
      driver.violations.forEach((violation: any) => {
        if (violation?.violationCode === GlobalConstants.DUI_VIOLATION && this.violationsMonthsCal(violation) && (violation?.operation !== 'delete' || violation?.operation === undefined)) {
        duiIndicator = true;
        return;
      }
    });
  });
    return duiIndicator;
  }

violationsMonthsCal(violation: any) {
   // drivers.forEach((driver: any) => {
     // driver.violations.forEach((violation: any) => {
        let violatioNDate = violation.violationDate;
        var today = new Date(this.policyEffectiveDate);
        let violationOccDate = new Date(violatioNDate);
        if (CommonUtils.monthDiff(violationOccDate, today) <= 35 && CommonUtils.daysDiff(violationOccDate, today) <= 1060) {
          this.within35MonthsIndi = true;
          // return;
        } else {
          this.within35MonthsIndi = false;
        }
      // });
    // });
    return this.within35MonthsIndi;
  }

  orderMVR(formData: any, orderMVRPageStatus: string) {
    // If NEXT btn is clicked, allow only if ORDERMVR btn is hidden and orderMVRPageStatus=='' and Untill ORDERMVR btn is clicked dont allow user to navigate to next page
    // If ORDERMVR btn clicked allow to proceed
    //logger
    this.logTracker.loginfo('ReportsComponent', 'orderMVR', 'this.quoteDataService.retrieveQuote',
            'QuoteNumber='.concat(this.quoteNumber + 'LicensePatternsStatus='+ this.licensePatternStatus));
    if(!this.licensePatternStatus){
    if (!this.checkForDuplicateLicenseId()) {
      //looger
      this.logTracker.loginfo('ReportsComponent', 'orderMVR', 'this.quoteDataService.retrieveQuote',
            'QuoteNumber='.concat(this.quoteNumber + 'OrderMVRStatus='+ this.orderMVRStatus + 'OrderMVRPageStatus='+ orderMVRPageStatus));
      if (!this.orderMVRStatus || orderMVRPageStatus === 'reorder' || this.clickBack) {
        if (orderMVRPageStatus === 'reorder') {
          this.navigationService.addRequiredRoutes(this.navigationService.actionBasedRoutes('ReportsUpdate'));
        }
        this.messageService.clearErrors();
        this.hardEditMessages = [];
        this.showSpinnerService.showSpinner(true);
        const violationRequestObj = JSON.parse(JSON.stringify(this.violations));
        const priorInsuranceVal = this.reportsForm.controls.priorInsurance.value;
        sessionStorage.setItem('violationFormData', violationRequestObj);
        let startTime = new Date();
        this.autoQuoteData = this.quoteDataMapper.mapOrderMVRRequestData(violationRequestObj, formData.value.addViolation, this.orderMVRDriverStatusList, orderMVRPageStatus, priorInsuranceVal, this.priorInsuranceDBValue);
        this.quoteDataService.orderMVRQuote(this.autoQuoteData, 'saveQuote').subscribe(async (data: any) => {
          //logger
          this.logTracker.loginfo('ReportsComponent', 'orderMVR', 'this.quoteDataService.retrieveQuote',
            'QuoteNumber='.concat(this.quoteNumber + 'OrderMVRStatus='+ this.orderMVRStatus));
          const pageStatus: PageStatus = { name: 'REPORTS', status: 1 };
          this.store.dispatch(addPageStatus({ pageStatus }));
          if (!this.stepperRestriction) {
            this.sharedService.updateLastVisitedPage(7);
            this.navigationService.removeRuleOnNext(7);
          }          
          this.orderMVRStatus = false;
          //this.onLoadOrderMVRStatus = false;
          this.orderMVRDriverStatusList = [];
          if (orderMVRPageStatus === 'reorder') {
            this.loadReportsData(data);
          }
          this.showSpinnerService.showSpinner(false);
          if (orderMVRPageStatus !== 'reorder') {
            if (this.isMVRPNIDOBChanged && this.isPNIDOBEditApplied) {
              this.router.navigateByUrl('/applicant?qid=' + this.quoteNumber);
            }
            else {
              if (this.performSaveExit) {
                this.navigationService.getNextRoutingRule(this.requestedRoute);
                return;
              }
              if (this.clickBack) {
                this.router.navigateByUrl('/rates?qid=' + this.quoteNumber);
              } else {
                this.router.navigateByUrl('/application?qid=' + this.quoteNumber);
              }
            }
          }
          this.logTracker.loginfo('ReportsComponent', 'orderMVR', 'quoteDataService.orderMVRQuote',
            'QuoteNumber='.concat(this.quoteNumber + '|Duration='.concat(CommonUtils.elapsedTime(startTime).toString())));
        }, (errorData: any) => {
          this.logTracker.logerror('ReportsComponent', 'orderMVR', 'quoteDataService.orderMVRQuote',
            'Error=Reports Page Rate Order MVR|QuoteNumber='.concat(this.quoteNumber), errorData);
          this.errorHandler(errorData);
          if (this.clickBack) {
            if(this.softErrArr.length>0) {
              this.messageService.softError(this.softErrArr);
              const element = document.querySelector('#topcontent');
              element?.scrollIntoView();
            } else {
              this.router.navigateByUrl('/rates?qid=' + this.quoteNumber);
            }
          } else if (this.performSaveExit) {
            this.navigationService.getNextRoutingRule(this.requestedRoute);
            return;
          }
        });
        if (this.isMVRPNIDOBChanged && this.isPNIDOBEditApplied) {
          this.router.navigateByUrl('/applicant?qid=' + this.quoteNumber);
        }
      } else {
        this.messageService.showError(['You must order an MVR before proceeding to the Application.']);
        const element = document.querySelector('#topcontent');
        element?.scrollIntoView();
        this.performSaveExit = false;
      }
    } else {
      let uiEditsArry: string[] = [];
      uiEditsArry.push(MessageConstants.LICENSE_ID_DUPLICATE);
      this.messageService.showError(uiEditsArry);
      const element = document.querySelector('#topcontent');
      element?.scrollIntoView();
      if (this.clickBack) {
        this.router.navigateByUrl('/rates?qid=' + this.quoteNumber);
      } else if (this.performSaveExit) {
        this.navigationService.getNextRoutingRule(this.requestedRoute);
        return;
      }

    }
  }

  }

  checkForDriverLicenseID(operation: string) {
    let driverLicenseReq: string[] = [];
    let licensePatternStatusArray: boolean[] = [];
    if (!this.clickBack) {
      this.reportsForm.value.addViolation.forEach((val: any, index: number) => {
        let driverType = this.violations[index]?.driverType;
        if ((val.licenseType !== 'F' && val.licenseType !== 'N' && driverType !== 'E')
          && val.licenseNumber === GlobalConstants.EMPTY_STRING && val.dob !== GlobalConstants.EMPTY_STRING ) {
          driverLicenseReq.push('Driver ' + (index + 1) + ': Drivers License/ID# is required');
        }
        licensePatternStatusArray[index] = this.driverFormHasError('licenseNumber', 'pattern', index);

      });
      if (licensePatternStatusArray?.includes(true)) {
        this.licensePatternStatus = true;
      } else {
        this.licensePatternStatus = false;
      }
      // if (driverLicenseReq.length === 0) {
      //   this.orderMVRStatus =  this.orderMVRDriverStatusList?.includes(true) ? true : false;
      // }
      
    }
    if(operation === GlobalConstants.EMPTY_STRING){ //onBlur of license num field dont display required field error
      this.messageService.showError(driverLicenseReq);
      if (driverLicenseReq.length > 0) { //Scroll to top only if there are atleast one error to display
        const element = document.querySelector('#topcontent');
        element?.scrollIntoView();
        this.performSaveExit = false;
      }
    }
    return driverLicenseReq;
  }
  /* Handle form errors */
  public hasError = (controlName: string, errorName: string) => {
    return this.reportsForm.controls[controlName].hasError(errorName);
  }
   public driverFormHasError = (controlName: string, errorName: string, index: any) => {
    return this.violationFormGroup(index)?.controls[controlName]?.hasError(errorName);
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
          this.backButton.nativeElement.click();
        }
      },
      error => this.logTracker.logerror('ReportsComponent', 'navigationObservableWatch', 'navigationStepObv',
        'Vehicle Page navigationObservableWatch Error', error));
  }

  checkForDuplicateLicenseId() {
    const driverDetails = this.reportsForm?.value?.addViolation;
    var licenseNumArray = driverDetails.filter((driver: any, _i: number) => !ObjectUtils.isFieldEmpty(driver?.licenseNumber))
          .map(function (_filteredList: any) { return _filteredList?.licenseNumber?.toUpperCase() });
    return licenseNumArray?.some( (driver: any, index: number) => {
      var status;
      if (!ObjectUtils.isFieldEmpty(driver)) {
        status = licenseNumArray?.indexOf(driver?.toUpperCase()) != index
      }
      this.logTracker.loginfo('ReportsComponent', 'orderMVR', 'this.quoteDataService.retrieveQuote',
            'QuoteNumber='.concat(this.quoteNumber)+ 'CheckDuplicateLicenseIDStatus=' + status);
      return status;
    });
  }

  retrieveStateFiling(dbdrivers: any) {
    if (dbdrivers && dbdrivers.length > 0) {
      dbdrivers.forEach((ref: any, i: number) => {
        let stateFilingIndicators = ref.discountIndicators?.stateFiling?.indicators;
        if (stateFilingIndicators && stateFilingIndicators.length > 0) {
          stateFilingIndicators?.forEach((filingType: any) => {
            const caseNumber = ref.discountIndicators?.stateFiling?.caseNumber
            if ((filingType.name === 'SR22' || filingType.name === 'FR44')
              && (caseNumber?.startsWith('2') || caseNumber?.startsWith('4'))) {
              this.filingValStartsWith2or4 = true;
            }
          });
        }
      });
    }
  }
}
function obj(obj: any, arg1: (any: any) => void) {
  throw new Error('Function not implemented.');
}