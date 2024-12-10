import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import {
  UntypedFormArray,
  UntypedFormBuilder,
  UntypedFormControl,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { PolicyinfoService } from 'src/app/services/policyinfo.service';
import { QuoteDataService } from 'src/app/services/quote-data.service';
import * as Actions from '../../../state/actions/summary.action';
import { AutoQuoteData } from 'src/app/shared/model/autoquote/autoquote.model';
import { DropDown } from 'src/app/shared/model/dropdown-values';
import { AdditionalDrivers, PolicyInfo } from 'src/app/shared/model/policyinfo/additional-drivers.model';
import { MessagesService } from 'src/app/shared/services/messages.service';
import { SpinnerStatusService } from 'src/app/shared/services/spinner-status.service';
import { MatDialog } from '@angular/material/dialog';
import { QuoteDataMapper } from 'src/app/shared/utilities/quotedata-mapper';
import { addPageStatus } from 'src/app/state/actions/summary.action';
import QuoteSummary, { DriverSummary, PageStatus } from 'src/app/state/model/summary.model';
import { ValidValuesReq } from 'src/app/shared/model/validvalues/validvaluesreq.model';
import { ValidValuesRes } from 'src/app/shared/model/validvalues/validvaluesres.model';
import { ValidValuesService } from 'src/app/shared/services/validvalues/validvalues.service';
import { GlobalConstants } from 'src/app/constants/global.constant';
import { BehaviorSubject, forkJoin, Observable, Subscription } from 'rxjs';
import { MessageConstants } from 'src/app/constants/message.constant';
import { CommonUtils } from 'src/app/shared/utilities/common-utils';
import { ObjectUtils } from 'src/app/shared/utilities/object-utils';
import { HelpTextDialogComponent } from 'src/app/shared/dialog/helptext-dialog/helptext-dialog.component';
import { Tracker } from 'src/app/shared/utilities/tracker';
import { NavigationService } from 'src/app/shared/services/navigation.service';
import { HelptextMapper } from 'src/app/shared/utilities/helptext-mapper';
import { SharedService } from 'src/app/services/shared.service';

@Component({
  selector: 'app-policyinfo',
  templateUrl: './policyinfo.component.html',
  styleUrls: ['./policyinfo.component.scss'],
})
export class PolicyinfoComponent implements OnInit {
  @ViewChild('next', { read: ElementRef }) nextButton!: ElementRef;
  public policyInfoObj: PolicyInfo = new PolicyInfo();
  public householdInfoObj: PolicyInfo = new PolicyInfo();
  policyInfoForm!: UntypedFormGroup;
  formSubmitAttempt!: boolean;
  primaryResidenceValues!: DropDown[];
  multiLineDiscountValues!: DropDown[];
  actionValues!: DropDown[];
  explanationValues!: DropDown[];
  householdMemberValues!: DropDown[];

  addlnDrvExplanationCntrlStatus: any = [];
  public addlnDriverList!: UntypedFormArray;
  additionalDriverReport: AdditionalDrivers[] = [];

  // PNI details Subject
  isDriverAdded = new BehaviorSubject<boolean>(false);

  autoQuoteData!: AutoQuoteData;
  pageStatus!: number;
  quoteNumber!: any;
  mco!: any;
  riskState!: string;
  qid: any;
  clickBack = false;
  driverCount = 0;
  additionalDrvCnt = 0;
  errorMessage = '';
  listedDrivers: DriverSummary[] = [];
  displayListedDriverStatus: any = [];
  hasApplicantEmail = false;
  hasProducerSweep = false;
  disputeActions: any = [];
  linkedDrivers: DriverSummary[] = [];
  selectedLinkedDrivers: any = [];
  downpaymentValue = '';
  installmentValue = '';
  valuesLoaded = false;
  PNIEmail: string = '';
  page: string = 'policyInfo';
  navigationObvSubscription!: Subscription;
  requestedRoute = '';
  performSaveExit = false;
  policyState: string = '';
  ratebook!: string;
  routeMessageObj!: any;
  nonOwner: boolean = false;
  dynamicFields: any;
  householdMemberReq: boolean = false;
  householdMemberDB: string = 'N';
  checkhhmErrorFlag: boolean = false;

  constructor(
    private _fb: UntypedFormBuilder,
    private dialog: MatDialog,
    private router: Router,
    private showSpinnerService: SpinnerStatusService,
    public quoteDataService: QuoteDataService,
    private policyInfoService: PolicyinfoService,
    public quoteDataMapper: QuoteDataMapper,
    private store: Store<{ quoteSummary: QuoteSummary }>,
    private readonly messageservice: MessagesService,
    public validValuesService: ValidValuesService,
    private logTracker: Tracker,
    private navigationService: NavigationService,
    private helpTextMapper: HelptextMapper,
    private sharedService: SharedService
  ) {

    this.store.select('quoteSummary').subscribe(data => {
      this.riskState = data.policyState;
      this.quoteNumber = data.qid;
      this.mco = data.mco;
      this.ratebook = data.rateBook;
      const pageStatusArr = data.pageStatus.filter(page => (page.name === 'POLICY INFO'));
      this.pageStatus = pageStatusArr.length > 0 ? pageStatusArr[0].status : 0;
      this.driverCount = data.drivers.length;
      this.listedDrivers = data.drivers;
      this.PNIEmail = data.PNIEmail;
      this.hasProducerSweep = data.prodSweepStatus;
      this.policyState = data.policyState;
      this.routeMessageObj = data?.routingRules?.messages;
      this.nonOwner = data.nonOwner;
      this.dynamicFields = data.dynamicPolicyInfoValues;
    });

  }

  ngOnDestroy(): void {
    this.navigationService.updateNavigationRequestedRoute('');
    this.navigationObvSubscription.unsubscribe();
  }

  ngOnInit(): void {
    this.qid = JSON.stringify(this.quoteNumber);
    this.qid = this.qid.replace(/"/g, '');

    this.initPolicyInfoForm();

    this.showSpinnerService.showSpinner(true);
    // Revtriev Valid Values and QuoteAPI data
    let policyinfoeGetObservables: Observable<any>[] = new Array();
    policyinfoeGetObservables.push(this.validValuesService.getValidValues(this.validvaluesreq()));
    policyinfoeGetObservables.push(this.quoteDataService.retrieveQuote(this.qid, 'getDiscountAndAdditionalDrivers', this.riskState, this.ratebook));

    forkJoin(policyinfoeGetObservables).subscribe(results => {

      this.loadValidValues(results[0]);

      this.loadPolicyInfoData(results[1]);

      this.showSpinnerService.showSpinner(false);

    }, (errorData: any) => {
      this.errorHandler(errorData);
      this.logTracker.logerror('PolicyinfoComponent', 'ngOnInit', 'quoteDataService.retrieveQuote|validValuesService.getValidValues', 'Error=Policy Info Page Retrieve Quote', errorData);

    });

    // save & exit behaviour subjec observable
    this.navigationObservableWatch();
    this.stateDynamicFields();
  }

  stateDynamicFields() {
    for (let i = 0; i <= this.dynamicFields?.length; i++) {
      if (this.dynamicFields[i]?.key === 'HMI') {
        this.householdMemberReq = true
      }
    }
  }

  householdMemberEnable() {
    return (!this.nonOwner && this.householdMemberReq && this.householdMemberDB !== 'N') ? true : false;
  }


  initPolicyInfoForm(): void {
    this.policyInfoForm = this._fb.group({
      primaryResidence: ['', Validators.required],
      multilineDiscount: ['', Validators.required],
      goPaperlessDiscount: [''],
      eSignature: [''],
      source: '',
      additionalDrivers: this._fb.array([]),
      householdMember: ['1'],
    });
  }

  loadPolicyInfoData = (data: any) => {
    const dataString = JSON.stringify(data);
    const obj = JSON.parse(dataString) as AutoQuoteData;
    const urlParams: any = this.sharedService.getURLQueryParameter();
    if (urlParams !== undefined && urlParams?.m !== undefined && urlParams?.m !== GlobalConstants.EMPTY_STRING) {
      const routeMessage = this.routeMessageObj?.filter((obj: any) => obj.routeIndex === urlParams?.m)[0]?.message;
      this.messageservice.softError([routeMessage]);
    }
    this.loadGetPolicyInfo(obj);
    this.loadHouseHoldMemberInfo(obj);
    //Patch Addtionol Drivers values if already exists
    this.loadAdditionalDrivers(obj);

    this.logTracker.loginfo('PolicyinfoComponent', 'ngoninit-loadPolicyInfoData', 'quoteDataService.retrieveQuote', 'Retrieve Policy Info Successful');

  }

  loadHouseHoldMemberInfo(obj: any) {
    this.householdMemberDB = obj.autoQuote.contact.person.householdMembers;
    // if (obj.length > householdMemberDB) {
    //   this.policyInfoForm.patchValue({
    //     householdMember: (obj.length).toString()
    //   })
    // } else {
       this.policyInfoForm.patchValue({
        householdMember: this.householdMemberDB
      })
    }
  

  additionalDrivers(): UntypedFormArray {
    return this.policyInfoForm.get('additionalDrivers') as UntypedFormArray;
  }

  loadGetPolicyInfo = (obj: any) => {
    this.hasApplicantEmail = ((this.PNIEmail !== '') ? true : false);
    this.installmentValue = obj.autoQuote.policyDiscountIndicators.eftFutureInstallments ? obj.autoQuote.policyDiscountIndicators.eftFutureInstallments : 'Y';
    this.downpaymentValue = obj.autoQuote.policyDiscountIndicators.downPaymentMethod ? obj.autoQuote.policyDiscountIndicators.downPaymentMethod : 'Y';
    this.valuesLoaded = true;

    this.policyInfoForm.patchValue({
      primaryResidence: (obj.autoQuote.policyDiscountIndicators?.primaryResidence !== '' && obj.autoQuote.policyDiscountIndicators?.primaryResidence !== 'N' ? obj.autoQuote.policyDiscountIndicators?.primaryResidence : 'R'),
      multilineDiscount: (obj.autoQuote.policyDiscountIndicators.multiPolicy !== '' ? obj.autoQuote.policyDiscountIndicators.multiPolicy : 'N'),
      goPaperlessDiscount: (this.hasApplicantEmail && !obj.autoQuote.policyDiscountIndicators.goPaperlessIndicator) ? // If on applicant page email address has been entered and getPolicyInfo API goPaperless=false, then check gopaperless on policyInfo page ELSE map getPolicyInfo API returned gopaperless response to gopaperless field.
        !obj.autoQuote.policyDiscountIndicators.goPaperlessIndicator : obj.autoQuote.policyDiscountIndicators.goPaperlessIndicator,
      eSignature: obj.autoQuote.policyDiscountIndicators.esignatureIndicator
    });
  }

  loadAdditionalDrivers = (res: AutoQuoteData): void => {
    const numberOfDrivers = res.autoQuote.personalAuto?.drivers?.length;
    this.linkedDrivers = this.listedDrivers;

    res.autoQuote.personalAuto?.drivers?.forEach((driver, index) => {

      const driverDetails = {
        source: driver.source,
        firstName: driver.firstName,
        middleInitial: driver.middleName,
        lastName: driver.lastName,
        dateOfBirth: driver.birthDate,
        licenceNumber: driver?.license?.licenseNumber,
        licenceState: driver?.license?.licenseState,
        action: driver?.disputes?.action,
        explanation: driver.disputes?.reason,
        level: driver.disputes?.level,
        listedDriver: driver?.linkedDriver
      }

      if (driver.disputes?.level === '1') {
        this.disputeActions[index] = this.policyInfoObj.action.filter(action => action.key != 'DISPUTE');
      } else {
        this.disputeActions[index] = this.policyInfoObj.action;
      }


      this.additionalDriverReport?.push(driverDetails);

      // Logic to determin if the linkedDriver is deleted
      let isListedDriverDeleted = false;
      const linkedDriverName = this.listedDrivers.find(x => (x.firstName.concat(x.middleName).concat(x.lastName) === driver?.linkedDriver))?.firstName || GlobalConstants.NONE;

      if (driver?.disputes?.action === 'DISPUTE' && driver?.disputes?.reason === 'AL' &&
        (ObjectUtils.isFieldEmpty(driver?.linkedDriver) || !ObjectUtils.isFieldEmpty(driver?.linkedDriver) && (ObjectUtils.isFieldEmpty(linkedDriverName) || linkedDriverName === 'None'))) {
        isListedDriverDeleted = true;
      }

      const explanationControlStatus = {
        id: index,
        status: driver?.disputes?.action != undefined && driver?.disputes?.action === "DISPUTE" && !isListedDriverDeleted ? true : false
      };

      this.addlnDrvExplanationCntrlStatus?.push(explanationControlStatus);
      this.displayListedDriverStatus[index] = driver?.disputes?.reason === 'AL' && !isListedDriverDeleted ? true : false

      this.additionalDrivers().push(
        new UntypedFormGroup({
          action: new UntypedFormControl(!isListedDriverDeleted ? driver?.disputes?.action : '', [Validators.required]),
          explanation: new UntypedFormControl(!isListedDriverDeleted ? driver.disputes?.reason : '', driver?.disputes?.action === 'DISPUTE' ? Validators.required : []),
          level: new UntypedFormControl(driver?.disputes?.level, []),
          listedDriver: new UntypedFormControl(!isListedDriverDeleted ? driver?.linkedDriver : '', driver?.disputes?.reason === 'AL' ? Validators.required : [])
        })
      );
    });

    this.policyInfoService.setAdditionalDrivers(this.additionalDriverReport);
    this.linkedDrivers = this.prepareLinkedDrivers('INITIAL');
    this.showSpinnerService.showSpinner(false);
  }

  updateLinkedDriver(_event: any, driverIndex: any) {
    this.selectedLinkedDrivers[driverIndex] = this.additionalDriversFormGroup(driverIndex).controls['listedDriver'].value
  }

  prepareLinkedDrivers(loadStatus: string): DriverSummary[] {
    let linkDrivers: any[] = [];
    let linkDriverNames: string[] = [];
    this.listedDrivers.forEach(driver => linkDrivers.push(driver));



    if (this.additionalDriverReport.length > 0) {
      this.additionalDriverReport.forEach((driver, index) => {
        const action = loadStatus === 'INITIAL' ? driver.action : this.additionalDriversFormGroup(index).controls['action'].value;
        const reason = loadStatus === 'INITIAL' ? driver.explanation : this.additionalDriversFormGroup(index).controls['explanation'].value;
        if (action === 'DISPUTE' && !GlobalConstants.DISPUTE_LISTED_DECESASED_VALUES.includes(reason)) {
          const addtnlDriver = {
            driverId: '' + index,
            firstName: driver.firstName,
            middleName: driver.middleInitial,
            lastName: driver.lastName
          };
          linkDriverNames.push(driver.firstName + driver.middleInitial + driver.lastName);
          linkDrivers.push(addtnlDriver);
        }
      });

      // Check if selected additional driver is deleted
      this.additionalDriverReport.forEach((driver, index) => {
        const name = this.selectedLinkedDrivers[index];

        if (!ObjectUtils.isFieldEmpty(name) && !linkDriverNames.includes(name) && linkDrivers.length != this.linkedDrivers.length) {
          this.additionalDriversFormGroup(index).controls['action'].patchValue('');
          this.addlnDrvExplanationCntrlStatus[index].status = false;
          this.displayListedDriverStatus[index] = false;
          this.setExplanationAsRequired(index, false);
          this.selectedLinkedDrivers.splice(index, 1);
        }
      });
    }
    return linkDrivers;
  }

  findDriver(driverFullName: string): boolean {
    const driverFirstName = this.linkedDrivers.find(x => (x.firstName.concat(x.middleName).concat(x.lastName) === driverFullName))?.firstName || GlobalConstants.NONE;

    return driverFirstName === GlobalConstants.NONE ? false : true;
  }

  additionalDriversFormGroup(driverIndex: number) {
    const itemControls = this.additionalDrivers();
    const itemFormGroup = <UntypedFormGroup>itemControls.controls[driverIndex];
    return itemFormGroup;
  }

  displayExplanation(event: any, driverIndex: any) {
    const useraction = this.additionalDriversFormGroup(driverIndex).controls['action'].value;
    const explanationDisplayStatus = useraction === 'DISPUTE' || useraction === 'NA' ? true : false;
    this.addlnDrvExplanationCntrlStatus[driverIndex].status = explanationDisplayStatus;
    this.setExplanationAsRequired(driverIndex, explanationDisplayStatus);
  }

  displayListedDriver(val: any, index: any) {
    const reason = val.value || val;
    const status = reason === 'AL' ? true : false
    this.displayListedDriverStatus[index] = status;
    this.additionalDriversFormGroup(index).controls['listedDriver'].patchValue('');
    CommonUtils.updateControlValidation(this.additionalDriversFormGroup(index).controls['listedDriver'], status);

    //this.linkedDrivers = this.prepareLinkedDrivers('CHANGE');
  }

  // set required validator dynamically for explanation formControl based on Action selection
  setExplanationAsRequired(driIndx: number, status: boolean) {
    const explanationControl = this.additionalDriversFormGroup(driIndx).controls['explanation'];

    if (status) {
      explanationControl?.setValidators([Validators.required])
    } else {
      explanationControl?.setValue('');
      explanationControl?.setValidators(null)
    }
    explanationControl?.updateValueAndValidity();
  }

  /* Handle form errors */
  public hasError = (controlName: string, driverIndex: any, errorName: string) => {
    if (driverIndex != 'null' && Number(driverIndex) >= 0) {
      return this.additionalDriversFormGroup(driverIndex).controls[controlName].hasError(errorName);
    } else {
      return this.policyInfoForm.controls[controlName].hasError(errorName);
    }
  };

  validateHHMViolation(driverCount:number, hhmCount:string, back:boolean){
    let isValidHHM = false;
    if ((driverCount > Number(hhmCount)) && back && hhmCount !== 'N' && !this.checkhhmErrorFlag) {
      isValidHHM = true;
      this.checkhhmErrorFlag = true;
    }
    return isValidHHM;
  }

  onSubmit(formData: any): void {
    this.formSubmitAttempt = true;
    this.logTracker.loginfo('PolicyinfoComponent', 'onSubmit', 'Next Button Click', 'PolicyInfo page FormData Submission and Is Form Valid ' + this.policyInfoForm.valid);
    if (this.policyInfoForm.valid) {
      let additionaldriverStatus = this.additionDriverLogic(this.policyInfoForm.controls.additionalDrivers.value);
      if (!additionaldriverStatus) {
        this.navigationService.addRequiredRoutes(this.navigationService.actionBasedRoutes('PolicyInfoADD'));
      }
      //additionaldriverStatus.action.includes(GlobalConstants.ADD_AS_RATED_DRIVER) ? this.navigationService.addRequiredRoutes(this.navigationService.actionBasedRoutes('PolicyInfoADDRated')) : (additionaldriverStatus.action.includes(GlobalConstants.ADD_AS_EXCLUDED_DRIVER) ) ? this.navigationService.addRequiredRoutes(this.navigationService.actionBasedRoutes('PolicyInfoADDExcluded')) : '';

      const esignIndicator = formData.get('eSignature').value;
      this.store.dispatch(Actions.setEsign({ esign: esignIndicator }));

      // check for number of additional drivers
      if ((this.driverCount >=6 && this.additionalDrvCnt > 0) || (this.driverCount + this.additionalDrvCnt) > 6) {
         this.logTracker.loginfo('PolicyinfoComponent', 'onSubmit', 'Next Button Click', 'PolicyInfo page FormData Submission and check for number of additional drivers ' + MessageConstants.ADD_DRIVERS_MAXOUT);
        this.messageservice.showError([MessageConstants.ADD_DRIVERS_MAXOUT]);
        const element = document.querySelector('#topcontent');
        element?.scrollIntoView();
        return;
      }

      //on click back and HHM count <total driver count in the quote
      let householdMemberCount = formData.get('householdMember')?.value;
      let hasHHMError: any = this.validateHHMViolation(this.driverCount, householdMemberCount, this.clickBack );
      if (hasHHMError) {
        this.logTracker.loginfo('PolicyinfoComponent', 'onSubmit', 'Next Button Click', 'PolicyInfo page FormData Submission and check for number of household member < drivers ' + MessageConstants.HHM_DRIVERS_CHECK);
        this.messageservice.softError([MessageConstants.HHM_DRIVERS_CHECK]);
        const element = document.querySelector('#topcontent');
        element?.scrollIntoView();
        this.performSaveExit = false;
        return;
      }
      this.showSpinnerService.showSpinner(true);
      let qid = JSON.stringify(this.quoteNumber);
      qid = qid.replace(/"/g, '');
      this.autoQuoteData = this.quoteDataMapper.mapPolicyInfoData(formData, 'Add');

      let startTime = new Date();
      this.quoteDataService.saveUpdateQuote(this.autoQuoteData, qid, 'saveQuote').subscribe(async (data: any) => {
        await data;
        this.sharedService.updateLastVisitedPage(5);
        this.navigationService.removeRuleOnNext(5);
        if (this.performSaveExit) {
          this.showSpinnerService.showSpinner(false);
          this.navigationService.getNextRoutingRule(this.requestedRoute);
          return;
        }
        const pageStatus: PageStatus = { name: 'POLICY INFO', status: 1 };
        this.store.dispatch(addPageStatus({ pageStatus }));
        //Need to chane
        if (this.clickBack) {
          additionaldriverStatus ? this.launchCoverages(qid) : this.launchDrivers(qid);
          //additionaldriverStatus.status ? this.launchCoverages(qid) : this.launchDrivers(qid);
        } else {
          additionaldriverStatus ? this.router.navigateByUrl('/rates?qid=' + qid) : this.launchDrivers(qid);
          //additionaldriverStatus.status ? this.router.navigateByUrl('/rates?qid=' + qid) : this.launchDrivers(qid);
        }
        this.showSpinnerService.showSpinner(false);

        this.logTracker.loginfo('PolicyinfoComponent', 'onSubmit', 'quoteDataService.saveUpdateQuote',
          'QuoteNumber='.concat(this.qid + '|Duration='.concat(CommonUtils.elapsedTime(startTime).toString())));
      },
        (errorData: any) => {
          this.logTracker.logerror('PolicyinfoComponent', 'onSubmit', 'quoteDataService.saveUpdateQuote',
            'Error=Policy Info Page Save Quote|QuoteNumber='.concat(this.qid), errorData);
          this.errorHandler(errorData);
        });
    } else {
      this.performSaveExit = false;
    }
  }

  additionDriverLogic(driversDetails: any) {
    let status: boolean = true;
    //let action: any[] = [];
    this.additionalDrvCnt = 0;
    driversDetails?.forEach((driverObj: any) => {
      if (driverObj && driverObj.action !== GlobalConstants.DISPUTE) {
        status = false;
        //action.push(driverObj && driverObj.action);
        this.additionalDrvCnt++;
      }
    });
    //return {'status' : status,'action' : action};
    return status;
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

  validvaluesreq = (): ValidValuesReq => {
    return {
      appName: GlobalConstants.APP_NAME,
      pageName: GlobalConstants.POLICY_INFO_PAGE_NAME,
      mco: GlobalConstants.MCO_ALL_VALID_VALUES,
      ratebook: GlobalConstants.RATEBOOK_ALL_VALID_VALUES,
      state: this.policyState,
      dropdownName: GlobalConstants.DROPDOWN_ALL_VALID_VALUES,
      filter: ''
    };
  }

  loadValidValues(data: ValidValuesRes): void {


    this.policyInfoObj.primaryResidence = data.responseMap.primary_residence;
    this.policyInfoObj.multiPolicyDisc = data.responseMap.multi_policy_discount;
    this.policyInfoObj.action = data.responseMap.addtionaldriver_action;
    this.policyInfoObj.explanation = data.responseMap.addtionaldriver_explanation;
    this.householdInfoObj.householdMember = data.responseMap.household_member_information;
    this.logTracker.loginfo('PolicyinfoComponent', 'loadValidValues', 'validValuesService.getValidValues',
      'Success=Policy Info Page Valid Values');
  }

  onClickBack(formData: any): void {
    this.clickBack = true;
    this.onSubmit(formData);
    this.logTracker.loginfo('PolicyinfoComponent', 'onClickBack', 'Back Button Clicked', 'Submitting Policy Form');
  }

  launchCoverages(quoteId: string): void {
    this.router.navigateByUrl('/coverages?qid=' + quoteId);
  }

  launchDrivers(quoteId: string): void {
    this.quoteDataService.isAddtionalDriver.next(true);
    this.router.navigateByUrl('/drivers?qid=' + quoteId);
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

  /**
     * Subscribes to the NavigationService Observable. Runs when the Observable
     * value is updated
     */
  navigationObservableWatch(): void {
    this.navigationObvSubscription = this.navigationService.navigationStepObv.subscribe(
      nextRoute => {
        if (nextRoute.startsWith('save-')) {
          this.requestedRoute = nextRoute.split('-')[1].trim();
          // simulate form submit
          this.performSaveExit = true;
          this.nextButton.nativeElement.click();
          this.logTracker.loginfo('PolicyinfoComponent', 'navigationObservableWatch', 'navigationStepObv',
            'Success=Navigation to ' + this.requestedRoute + ' using stepper');
        }
      },
      error => this.logTracker.logerror('PolicyinfoComponent', 'navigationObservableWatch', 'navigationStepObv',
        'Vehicle Page navigationObservableWatch Error', error));
  }

}

