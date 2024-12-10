import { DatePipe, formatDate } from '@angular/common';
import { Component, ElementRef, EventEmitter, OnDestroy, OnInit, Output, ViewChild, ViewEncapsulation } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { QuoteDataService } from 'src/app/services/quote-data.service';
import { Applicant } from 'src/app/shared/model/applicant.model';
import { phonePipe } from 'src/app/shared/pipes/phone.pipe';
import { ssnPipe } from 'src/app/shared/pipes/ssn.pipe';
import { zipcodePipe } from 'src/app/shared/pipes/zipcode.pipe';
import { PhoneNumberValidator } from 'src/app/shared/validators/phone.validator';
import { ZipCodeValidator } from 'src/app/shared/validators/zipcode.validator';
import { addPageStatus } from 'src/app/state/actions/summary.action';
import * as Actions from '../../../state/actions/summary.action';
import QuoteSummary, { Indicators, PageStatus } from 'src/app/state/model/summary.model';
import { QuoteDataMapper } from 'src/app/shared/utilities/quotedata-mapper';
import { AutoQuoteData } from 'src/app/shared/model/autoquote/autoquote.model';
import { MessageConstants } from 'src/app/constants/message.constant';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { MessagesService } from 'src/app/shared/services/messages.service';
import { AddressVerificationService } from 'src/app/services/address-verification.service';
import { PopupMailingAddressComponent } from 'src/app/shared/dialog/popup-mailing-address/popup-mailing-address.component';
import { MatDialog } from '@angular/material/dialog';
import { SsnValidator } from '../../../shared/validators/ssn.validator';
import { SpinnerStatusService } from 'src/app/shared/services/spinner-status.service';
import { QuoteApiActions } from 'src/app/shared/model/quote-actions-enum';
import { PropCreditMapper } from 'src/app/shared/utilities/propcredit-mapper';
import { CreditReportData } from 'src/app/shared/model/services/applicant/propcredit-post-request';
import { PropCreditService } from 'src/app/services/propcredit.service';
import { ValidValuesReq } from '../../../shared/model/validvalues/validvaluesreq.model';
import { GlobalConstants } from '../../../constants/global.constant';
import { ValidValuesService } from '../../../shared/services/validvalues/validvalues.service';
import { ValidValuesRes } from '../../../shared/model/validvalues/validvaluesres.model';
import { HelpTextDialogComponent } from 'src/app/shared/dialog/helptext-dialog/helptext-dialog.component';
import { SharedService } from 'src/app/services/shared.service';
import { NavigationService } from 'src/app/shared/services/navigation.service';
import { forkJoin, Observable, Subscription } from 'rxjs';
import { Tracker } from 'src/app/shared/utilities/tracker';
import { CommonUtils } from 'src/app/shared/utilities/common-utils';
import { isArray, values, zip } from 'lodash';
import { HelptextMapper } from 'src/app/shared/utilities/helptext-mapper';
import { StatemcoService } from 'src/app/shared/services/statemco.service';
import { ConsentValuesReq } from 'src/app/shared/model/consentvalues/consentvaluesreq.model';
import { ConsentValuesService } from 'src/app/shared/services/consentvalues.service';
import { ConsentValuesRes } from 'src/app/shared/model/consentvalues/consentvaluesres.model';
import { MessagesByRoute, RoutesByCode, RoutingRules } from 'src/app/shared/model/routing-rules.model';
import { ValidvaluesCommonRes } from 'src/app/shared/model/validvalues/validvaluescommonres';
import { ObjectUtils } from 'src/app/shared/utilities/object-utils';
import { routingRules } from '../../../state/actions/summary.action';

@Component({
  selector: 'app-applicant',
  templateUrl: './applicant.component.html',
  styleUrls: ['./applicant.component.scss'],
  encapsulation: ViewEncapsulation.None
})

export class ApplicantComponent implements OnInit, OnDestroy {
  @ViewChild('next', { read: ElementRef }) nextButton!: ElementRef;
  // Emits when a change event is fired on Policy Effective date
  @Output()
  dateChange: EventEmitter<MatDatepickerInputEvent<any>> = new EventEmitter();

  public applicant: Applicant = new Applicant();
  applicantForm!: UntypedFormGroup;
  formSubmitAttempt!: boolean;
  //quoteDataMapper: QuoteDataMapper;
  autoQuoteData!: AutoQuoteData;
  dbAutoQuoteData!: AutoQuoteData;
  pageStatus!: number;
  performUpdate = QuoteApiActions.ADD;
  infoMessage!: string;
  private isNewQuote!: boolean;
  private originalPolicyEffectiveDate!: Date;
  isPNIchanged!: boolean;
  warnMessage: string[] = [];
  propCreditMapper: PropCreditMapper;
  creditReportData!: CreditReportData;
  saveQuoteDataStatus: boolean = false;
  // ssnRegexPattern finds 9 digit numbers not separated or separated by - or space, not starting with 000, 666, or 900-999,
  // not containing 00 or 0000 in the middle or at the end of SSN (in compliance with current SSN rules)
  ssnValidPattern = '(?!000)(?!666)(?!9)[0-9]{3}[ -]?(?!00)[0-9]{2}[ -]?(?!0000)[0-9]{4}';
  errorMessage = '';
  verified!: boolean; // mailing & prev address verification status
  /* First & Last Name value pattern : allows alphabet, hyphens, spaces, and apostrophes..
     * (?:\. |[' ]) means "either a dot followed by a space, or an apostrophe, or a space".
     * Allows hyphen [' -] (a hypen must be either at the beginning or at the end of a class to be matched)
     */
  nameValidPattern = /^[A-Za-z]?((\s)?(('|-)?([A-Za-z])+))+(\s)?$/;
  helpText = '';
  helpTextTitle = '';
  showSpinner = false;
  sessionFormData = '';
  policyState!: string;
  policyEffDateRetrievefromSession!: string;
  policyEffDateRetrievefromDB?: string;
  consentObj: boolean = false;
  todayDate = new Date();
  minDate = new Date(1900, 0, 1);
  private today = this.generateCleanDate();
  reportProcessingOrderIndicator = '0';
  termEligible!: string;
  callID!: boolean;
  softEditStatus: boolean = false;
  addressSoftErrArr: string[] = [];
  isMVRDOBChanged: boolean = false;
  uwReportsModifiedAttrsData!: any;
  isBridgedQuote: boolean = false;
  quoteSrc!: string;
  bridgeEdits: string[] = [];
  dynamicFields: any;
  pniDBLastNm!: any;
  pniDBSuffix!: any;
  pniDBdob!: any;
  pniDBFirstNm!: any;
  pniDBMiddleNm!: any;
  pniDBSSN!: any;
  pniDBZip!: any;
  pniDBAddr!: any;
  pniDBState!: any;
  pniDBCity!: any;
  dobIndicator: string = 'N';
  nameIndicator: string = 'N';
  addressIndicator: string = 'N';
  hasChange: boolean = false;
  requestedRoute = '';
  navigationObvSubscription!: Subscription;
  poCheck: boolean = false;
  performSaveExit = false;
  quoteNumber!: string;
  indicators!: Indicators;
  hasProducerSweep = false;
  invalidZipCode: boolean = false;
  mailingAddressObj: boolean[] = [];
  isConsentDisabled: boolean = false;
  producerCode!: string;
  ratebook!: string;
  mco!: string;
  dynamicValidValues: any;
  agentType: any;
  qid: any;
  consentText: string = GlobalConstants.EMPTY_STRING;
  routingRules!: RoutingRules;
  _nonOwner!: boolean;
  broadFormPolicy: boolean = false;
  underWritingRepStates = ['PA'];
  underWritingBool: boolean = false;

  constructor(private showSpinnerService: SpinnerStatusService, private formb: UntypedFormBuilder, private router: Router,
    public quoteDataService: QuoteDataService, private readonly messageservice: MessagesService,
    private addressService: AddressVerificationService, private store: Store<{ quoteSummary: QuoteSummary }>,
    public addressDialog: MatDialog, public propCreditService: PropCreditService,
    public validValuesService: ValidValuesService,
    public consentValuesService: ConsentValuesService,
    public quoteDataMapper: QuoteDataMapper,
    private helpTextDialog: MatDialog,
    private helpTextMapper: HelptextMapper,
    public sharedService: SharedService,
    private navigationService: NavigationService,
    private logTracker: Tracker,
    public stateMCOService: StatemcoService,
  ) {
    this.propCreditMapper = new PropCreditMapper(store);

    this.store.select('quoteSummary').subscribe(data => {
      let qid = JSON.stringify(data.qid);
      this.quoteNumber = qid.replace(/"/g, '');
      this.mco = data.mco;
      this.ratebook = data.rateBook;
      this.indicators = data.indicators;
      this.policyState = data.policyState;
      this.policyEffDateRetrievefromSession = data.policyEffectiveDate;
      this.agentType = data.channel;
      this.termEligible = data.term;
      this.callID = data.callIDStatus;
      this.isBridgedQuote = (data.bridgeStatus ? data.bridgeStatus : false);
      this.quoteSrc = data.quoteSrc;
      this.producerCode = data.producerCode;
      this.bridgeEdits = data.bridgeEdits;
      this.isNewQuote = (data.newQuote === 'true' ? true : false);
      const pageStatusArr = data.pageStatus.filter(page => (page.name === 'APPLICANT'));

      this.pageStatus = pageStatusArr.length > 0 ? pageStatusArr[0].status : 0;
      this.routingRules = data.routingRules;
    });
    this.logTracker.loginfo('ApplicantComponent', 'verifyState', 'ngOnInit',
      'QuoteNumber='.concat(this.quoteNumber + '|policyState='.concat(this.policyState)));
  }

  ngOnDestroy(): void {
    this.navigationService.updateNavigationRequestedRoute('');
    this.navigationObvSubscription.unsubscribe();
  }

  ngOnInit(): void {

    let applicantGetObservables: Observable<any>[] = new Array();
    this.underWritingBool = this.underWritingRepStates.includes(this.policyState) ? true : false;
    applicantGetObservables.push(this.consentValuesService.getConsentMessage(this.consentValuesreq()));
    if (this.routingRules && ObjectUtils.isObjectEmpty(this.routingRules)) {
      applicantGetObservables.push(this.validValuesService.getValidValuesDetails(this.validvaluesreq()));
    }

    forkJoin(applicantGetObservables).subscribe(results => {
      // this.showSpinnerService.showSpinner(false);

      this.loadConsentMessage(results[0]);
      if (this.routingRules && ObjectUtils.isObjectEmpty(this.routingRules)) {
        this.loadRoutingRules(results[1]);
      }

    }, (errorData: any) => {
      this.errorHandler(errorData);
      this.logTracker.logerror('ApplicantComponet', 'ngOnInit', 'validValuesService.getValidValues|consentValuesService|getConsentMessage',
        'Error=Applicant Page GET|QuoteNumber='.concat(this.qid), errorData);
    });
    this.dynamicStateServiceCall();

    //this.loadConsentMessage();


    this.applicantForm = this.initApplicant();
    console.log(this.callID, 'CallID1');
    if (!this.callID) {
      this.applicantForm.controls.callID?.setValidators(null)
    }
    this.setPrevMailFieldsAsRequired();

    // load saved quote
    //if ((sessionStorage.getItem('NEWQUOTE') !== 'TRUE') || (sessionStorage.getItem('applicantFormData') != null)) {
    if (this.pageStatus === 1 || this.isBridgedQuote === true || this.isBridgedQuote.toString() === 'true' || this.isNewQuote === false) {
      this.showSpinner = true;
      let applicantModel!: AutoQuoteData;
      let startTime = new Date();
      this.quoteDataService.retrieveQuote(this.quoteNumber, 'getApplicant', this.policyState, this.ratebook).subscribe(async (data: AutoQuoteData) => {

        applicantModel = data;
        this.dbAutoQuoteData = data;
        this.deriveRateBook(data.autoQuote.effectiveDate || this.today.toString(), false);
       
        setTimeout(() => {
          this.loadValidValues();
        }, 200);



        this.loadApplicant(applicantModel);
        this.setPrevMailFieldsAsRequired();
        this.showSpinner = false;

        // Bridge Edits
        if (this.isBridgedQuote === true || this.isBridgedQuote.toString() === 'true') {
          this.warnMessage.push(MessageConstants.APLCNT_PRM_EDT);
          if (this.bridgeEdits && this.bridgeEdits.length > 0) {
            this.bridgeEdits.forEach(edit => (edit !== '' ? this.warnMessage.push(edit) : null));
          }
        }

        const totalVeh = data.autoQuote?.totalBridgedVehicles || 0;
        if (totalVeh > 6) {
          this.warnMessage.push(MessageConstants.APLCNT_VEH_EDT.replace(':vehhCnt', '' + totalVeh).replace(':bridgeSrc', this.quoteSrc));
        }

        //Get the PNIchanged value from Drivers screen
        this.quoteDataService.isPNIDetailsChanged.asObservable().subscribe((_result) => {
          this.isPNIchanged = _result;
        });
        //If PNI details are changed then display the warning message
        if (this.isPNIchanged) {
          this.warnMessage.push(MessageConstants.APPLICANT_INFO_CHANGED);
        }
        this.storeValuesForExistingQuote(applicantModel);
        console.log(this.callID, 'CallID2');
        if (!this.callID) {
          this.applicantForm.controls.callID?.setValidators(null)
        } else {
          this.applicantForm.controls.callID?.setValidators(Validators.required);
        }
        this.showApplicantEdits();

        this.logTracker.loginfo('ApplicantComponent', 'ngOnInit', 'QuoteAPI.getApplicant', 'QuoteNumber='.concat(this.quoteNumber + '|Duration='.concat(CommonUtils.elapsedTime(startTime).toString())));
      },
        error => {
          this.showSpinner = false;
          this.logTracker.logerror('ApplicantComponent', 'ngOnInit', 'getApplicant', 'Error=Retrieve applicant page error|QuoteNumber='.concat(this.quoteNumber), error);
        }
      );
    }
    else {
      this.loadValidValues();
      const effDate = this.today;
      this.originalPolicyEffectiveDate = this.today;
      this.applicantForm.patchValue({
        polEffDt: effDate,
      });
    }
    this.navigationObservableWatch();
  }

  dynamicStateServiceCall() {
    this.validValuesService.getValidValuesDetails(this.dynamicValidvaluesreq()).subscribe(results => {
      this.dynamicValues(results)
    });
  }

  dynamicValues(result: any) {
    this.dynamicValidValues = result.responseMap.ValidValues;
    for (let i = 0; i <= this.dynamicValidValues.length; i++) {
      if (this.dynamicValidValues[i]?.code === 'APPL') {
        let vehicleDynamicFieldValues = this.dynamicValidValues[i]?.values
        this.setBroadFormPolicy(vehicleDynamicFieldValues);
      }
      if (this.dynamicValidValues[i]?.code === 'VEH') {
        let vehicleDynamicFieldValues = this.dynamicValidValues[i]?.values
        this.store.dispatch(Actions.dynamicValidValues({ dynamicValidValues: vehicleDynamicFieldValues }));
      }
      if (this.dynamicValidValues[i]?.code === 'DRI') {
        let driverDynamicFieldValues = this.dynamicValidValues[i]?.values
        this.store.dispatch(Actions.dynamicDriverValues({ dynamicDriverValues: driverDynamicFieldValues }));
      }
      if (this.dynamicValidValues[i]?.code === 'POL') {
        let policyInfoDynamicFieldValues = this.dynamicValidValues[i]?.values
        this.store.dispatch(Actions.dynamicPolicyInfoValues({ dynamicPolicyInfoValues: policyInfoDynamicFieldValues }));
      }

      if (this.dynamicValidValues[i]?.code === 'COV') {
        let isNotRequiredBylawAvai = false;
        let coverageDynamicValues = this.dynamicValidValues[i]?.values;
        if (coverageDynamicValues && isArray(coverageDynamicValues)) {
          coverageDynamicValues.forEach(item => {
            if (item.key === GlobalConstants.NOT_REQUIRED_BY_LAW_KEY) {
              isNotRequiredBylawAvai = true;
            }
          });
        }
        this.store.dispatch(Actions.setNotRequiredBylawDisplay({ isNotRequiredBylawDisplay: isNotRequiredBylawAvai }))

      }
      if (this.dynamicValidValues[i]?.code === 'VIOL') {
        let isRequiredConvictionDateAvai = false;
        let violationDynamicValues = this.dynamicValidValues[i]?.values;
        if (violationDynamicValues && isArray(violationDynamicValues)) {
          violationDynamicValues.forEach(item => {
            if (item.key === GlobalConstants.CONVICTION_DATE_KEY) {
              isRequiredConvictionDateAvai = true;
            }
          });
        }
        this.store.dispatch(Actions.setIsRequiredConvictionDate({ isRequiredConvictionDate: isRequiredConvictionDateAvai }))

      }
    }
  }

  setBroadFormPolicy(valuesObj: any) {
    valuesObj.forEach((valueObj: any) => {
      if (valueObj.key === 'BroadForm') {
        this.broadFormPolicy = true;
      } else {
        this.broadFormPolicy = false;
      }
    })
  }

  validvaluesreq = (): ValidValuesReq => {
    return {
      appName: GlobalConstants.APP_NAME,
      pageName: GlobalConstants.ROUTING_RULES,
      mco: GlobalConstants.MCO_ALL_VALID_VALUES,
      ratebook: this.ratebook,
      state: this.policyState,
      dropdownName: GlobalConstants.RULES_DROPDOWN,
      filter: ''
    };
  }

  dynamicValidvaluesreq = (): ValidValuesReq => {
    return {
      appName: GlobalConstants.APP_NAME,
      pageName: 'StateFields',
      mco: GlobalConstants.MCO_ALL_VALID_VALUES,
      ratebook: this.ratebook,
      state: this.policyState,
      dropdownName: 'state_fields',
      filter: ''
    };
  }

  loadRoutingRules = (data: ValidvaluesCommonRes) => {
    const routingValidValues = data.responseMap.ValidValues;


    let messages: MessagesByRoute[] = [];
    let routesByCode: RoutesByCode[] = [];
    routingValidValues.forEach(validValue => {

      const routes: string[] = [];
      validValue.values.forEach(value => {
        messages.push({ routeIndex: value.key, message: value.displayvalue });
        routes.push(value.key);
      });

      const routeByCode: RoutesByCode = {
        code: validValue.code,
        routes: routes
      }

      routesByCode.push(routeByCode);


    });

    const uniqueMessages = messages.filter((obj, pos, arr) => {
      return arr.map(mapObj => mapObj['routeIndex']).indexOf(obj['routeIndex']) === pos;
    });

    const _routingRules: RoutingRules = {
      routes: routesByCode,
      messages: uniqueMessages
    };

    console.log('RoutingRules from the Service ===> ', _routingRules);

    this.store.dispatch(Actions.routingRules({ routingRules: _routingRules }));



  }

  storeValuesForExistingQuote(data: any) {
    this.callID = data?.autoQuote?.agents[0]?.directAgentIndicator;
    this.termEligible = data?.autoQuote?.agents[0]?.authorizedForExtendedTermIndicator === true ? '12' : '6';
    this.hasProducerSweep = data?.autoQuote?.agents[0]?.eligibleForProducerSweepIndicator;
    this.store.dispatch(Actions.setTerm({ term: data?.autoQuote?.agents[0]?.authorizedForExtendedTermIndicator === true ? '12' : '6' }));
    this.store.dispatch(Actions.callIDStatus({ callIDStatus: data?.autoQuote?.agents[0]?.directAgentIndicator }));
    this.store.dispatch(Actions.prodSweepStatus({ prodSweepStatus: data?.autoQuote?.agents[0]?.eligibleForProducerSweepIndicator }));
    this.store.dispatch(Actions.setProducerCode({ producerCode: data?.autoQuote?.agents[0]?.agentCode }));
    this.store.dispatch(Actions.setRateBook({ rateBook: data?.autoQuote?.rateBook }));
    this.stateMCOService.getStateCodesMapping(data?.autoQuote?.agents[0]?.agentCode).subscribe(res => {
      this.policyState = res;
      this.store.dispatch(Actions.setPolicyState({ policyState: this.policyState }));
      console.log("Set Policy State " + data?.autoQuote?.agents[0]?.agentCode + " " + res + " " + this.policyState);
    })
  }

  checkFormUpdate(): void {
    if (!!this.applicantForm && this.applicantForm.dirty) {
      this.performUpdate = (this.pageStatus === 1 || this.saveQuoteDataStatus) ? QuoteApiActions.UPDATE : QuoteApiActions.ADD;
    } else {
      this.performUpdate = QuoteApiActions.NONE
    }
  }

  trimSpace(formControlNameVal: any) {
    if (this.applicantForm.controls[formControlNameVal]?.value !== "" && this.applicantForm.controls[formControlNameVal]?.value !== null) {
      this.applicantForm.controls[formControlNameVal]?.patchValue(this.applicantForm.controls[formControlNameVal]?.value.trim());
    }
  }

  launchPrevMailAddress(): boolean {
    if (this.applicantForm.get('moved')?.value) {
      this.applicantForm.get('prevState')?.patchValue(this.applicantForm.controls.prevState.value);
    }
    return this.applicantForm.get('moved')?.value;
  }

  deriveRateBook = (effectiveDate: string, runValidValues: boolean) => {
    this.quoteDataService.getRatebook(this.mco, this.producerCode, this.policyState, effectiveDate).subscribe((rbresult: any) => {
      this.ratebook = rbresult.rateBook;
      this.store.dispatch(Actions.setRateBook({ rateBook: this.ratebook }));

      if (runValidValues) {
        this.loadValidValues();
      }
    });
  }


  initApplicant(): UntypedFormGroup {
    return this.formb.group({
      polEffDt: [this.applicant.polEffDt, Validators.required],
      policyTerm: ['6'],
      firstname: [this.applicant.firstname, [Validators.required, Validators.pattern(this.nameValidPattern)]],
      lastname: [this.applicant.lastname, [Validators.required, Validators.pattern(this.nameValidPattern)]],
      middlename: [this.applicant.middlename, Validators.pattern('^[a-zA-Z]')],
      suffix: [this.applicant.suffix],
      maritalStatus: [this.applicant.maritalStatus, Validators.required],
      birthdate: [this.applicant.birthdate, Validators.required],
      ssn: [this.applicant.ssn, SsnValidator.ssnValidator],
      phone: [this.applicant.phone, PhoneNumberValidator.phoneValidator],
      email: [this.applicant.email, [Validators.pattern('[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,3}$')]],
      //address: [this.applicant.address, [Validators.required, Validators.pattern("^([0-9][a-zA-Z0-9]+)[A-Za-z0-9 \/\.\'\#\-]+$")]],
      address: [this.applicant.address, [Validators.required, Validators.pattern("^([0-9]+)[A-Za-z0-9 \/\&\.\'\#\-]+$")]],
      state: [this.policyState, Validators.required],//this.policyState
      city: [this.applicant.city, [Validators.required, Validators.pattern('^[A-Za-z][A-Za-z -]*$')]],
      zipcode: [this.applicant.zipcode, [Validators.required, ZipCodeValidator.zipcodeValidator]],
      prevAddress: [this.applicant.prevAddress],
      prevState: [this.policyState, Validators.required],
      prevCity: [this.applicant.prevCity, [Validators.pattern('^[A-Za-z][A-Za-z -]*$')]],
      prevZipcode: [this.applicant.prevZipcode],
      prevAddressPO: [this.applicant.prevAddressPO],
      gender: [this.applicant.gender, Validators.required],
      broadpolicy: [this.applicant.broadpolicy],
      nonowner: [this.applicant.nonowner],
      callID: [this.applicant.callID, Validators.required],
      pobox: [this.applicant.pobox],
      moved: [this.applicant.moved],
      custConsent: ['']
    });
  }

  checkUndefined(formValues: any){
    if(formValues.term?.value ==='12'){
    return true;
    }
    else{
      return false;
    }
  }
  
  loadApplicant(res: AutoQuoteData): void {
    const urlParams = this.sharedService.getURLQueryParameter();
    const consentValueObj = res.autoQuote?.preQualQuestionSets ? res.autoQuote?.preQualQuestionSets : [];
    const consentValue = consentValueObj[0]?.answers?.consentQuestion;
    const ssnFormat = new ssnPipe();
    const phoneFormat = new phonePipe();
    const zipcodeFormat = new zipcodePipe();
    this.uwReportsModifiedAttrsData = res.autoQuote?.underWritingReportsModifiedAttributes;
    this.isMVRDOBChanged = this.uwReportsModifiedAttrsData ? this.uwReportsModifiedAttrsData?.some(function (eachUW: any) {
      return (eachUW?.code === 'applicantDateofBirthChangeIndicator' && eachUW?.value === 'Y')
    }) : false;

    this.policyEffDateRetrievefromDB = res.autoQuote.quoteInitiationDate !== undefined && res.autoQuote.quoteInitiationDate !== "" ? res.autoQuote.quoteInitiationDate : res.autoQuote.effectiveDate
    let quoteInitiationDate = new Date(`${res.autoQuote.quoteInitiationDate !== undefined && res.autoQuote.quoteInitiationDate !== "" ? res.autoQuote.quoteInitiationDate : res.autoQuote.effectiveDate}`) ?? this.today;
    let effDate = new Date(`${res.autoQuote.effectiveDate}`) ?? this.today;
    effDate = this.zeroOutHoursForComparison(effDate);
    this.originalPolicyEffectiveDate = quoteInitiationDate;
    const today = new Date();
    const originalPolicyEffectiveDate = new Date(this.originalPolicyEffectiveDate);
    // COMMENTING AS PART OF DE103113
    // if (this.dayDiff(originalPolicyEffectiveDate, today) >= 60) {
    //   this.reportProcessingOrderIndicator = 'true';
    //   this.warnMessage.push(MessageConstants.PROP_CREDIT_REORDER_AFTER_60DAYS);
    // }
    const birthDate = new Date(`${res.autoQuote.contact?.person.dateOfBirth}`);
    if (!this.isValidPolicyEffectivePostDateRange(effDate)) {
      if (this.policyEffDateRetrievefromSession === "") {
        this.setInfoMessage(MessageConstants.EFFECTIVE_DATE_UPDATE_MESSAGE);
      }
      effDate = this.today;
    }
    this.pniDBFirstNm = res.autoQuote?.contact?.person?.firstName;
    this.pniDBMiddleNm = res.autoQuote?.contact?.person?.middleName;
    this.pniDBLastNm = res.autoQuote.contact?.person.lastName;
    this.pniDBSuffix = res.autoQuote.contact?.person.suffix;
    this.pniDBSSN = ssnFormat.transform(res.autoQuote.contact?.person?.socialSecurityNumber?.trim() ?? '');
    this.pniDBdob = birthDate;
    this.pniDBAddr = res?.autoQuote?.contact?.addresses[0]?.streetName;
    this.pniDBZip = zipcodeFormat.transform(res.autoQuote.contact?.addresses[0].postalCode);
    this.pniDBState = zipcodeFormat.transform(res.autoQuote.contact?.addresses[0].state);
    this.pniDBCity = zipcodeFormat.transform(res.autoQuote.contact?.addresses[0].city);
    this._nonOwner = res.autoQuote.contact?.person.nonOwnerPolicyIndicator || false;
    this.applicantForm.patchValue({
      polEffDt: this.policyEffDateRetrievefromSession !== "" ? new Date(`${this.policyEffDateRetrievefromSession}`) : effDate <= this.today ? this.today : effDate,
      policyTerm: res.autoQuote.term?.replace(' months', ''),
      nonowner: res.autoQuote.contact?.person.nonOwnerPolicyIndicator,
      callID: res.autoQuote.quoteReference,
      //callID: '',
      firstname: res.autoQuote.contact?.person.firstName,
      middlename: res.autoQuote.contact?.person.middleName,
      lastname: res.autoQuote.contact?.person.lastName,
      suffix: res.autoQuote.contact?.person.suffix,
      birthdate: birthDate,
      gender: res.autoQuote.contact?.person?.gender?.slice(0, 1),
      maritalStatus: res.autoQuote.contact?.person?.maritalStatus?.slice(0, 1),
      ssn: ssnFormat.transform(res.autoQuote.contact?.person?.socialSecurityNumber?.trim() ?? ''),
      phone: phoneFormat.transform(res.autoQuote?.contact?.phones[0]?.phoneNumber?.trim() ?? ''),
      email: res.autoQuote.contact?.person.emailAddress?.trim() ?? '',
      address: res?.autoQuote?.contact?.addresses[0]?.streetName,
      city: res.autoQuote.contact?.addresses[0]?.city,
      state: res.autoQuote.contact?.addresses[0]?.state,
      zipcode: zipcodeFormat.transform(res.autoQuote.contact?.addresses[0].postalCode),
      pobox: res.autoQuote.contact?.addresses[0].POBoxIndicator,
      prevAddress: res.autoQuote.contact?.addresses[1].streetName,
      prevCity: res.autoQuote.contact?.addresses[1].city,
      prevState: res.autoQuote.contact?.addresses[1].state,
      prevZipcode: zipcodeFormat.transform(res.autoQuote.contact?.addresses[1].postalCode),
      prevAddressPO: res.autoQuote.contact?.addresses[1].POBoxIndicator,
      moved: res.autoQuote.contact?.addresses[0].movedWithinPastSixMonthIndicator,
      custConsent: consentValueObj[0]?.answers?.consentQuestion ?? ''
    });
    if (consentValue !== null && consentValue !== undefined && consentValue !== GlobalConstants.EMPTY_STRING) {
      this.isConsentDisabled = true;
      // this.applicantForm.controls.custConsent?.setValidators(null);
      // this.applicantForm.updateValueAndValidity();

    }

    const pageStatus: PageStatus = { name: 'APPLICANT', status: 1 };
    this.store.dispatch(addPageStatus({ pageStatus }));


    this.applicantForm.clearValidators();
    this.applicantForm.updateValueAndValidity();
  }

  openDialog(addressComparer: any, qid: any): void {
    const dialogRef = this.addressDialog.open(PopupMailingAddressComponent, {
      width: '80%',
      panelClass: 'full-width-dialog',
      disableClose: true,
      data: {
        compareObj: addressComparer
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      const dialogValue = result;

      if (dialogValue.event) {
        addressComparer.forEach((obj: any, i: number) => {
          if (dialogValue.data['addressSelection' + i] !== 'enteredAddress') {
            this.patchAddressDetails(obj);
          }
        });
        const operation = this.performUpdate === QuoteApiActions.UPDATE ? 'Update' : 'Add';
        this.autoQuoteData = this.quoteDataMapper.mapApplicantData(this.applicantForm, this.dbAutoQuoteData, operation, this.isNewQuote);
        // Credit check
        this.creditReportData = this.propCreditMapper.mapPropCreditPostData(this.applicantForm, operation, this.reportProcessingOrderIndicator);
        this.poboxLogic(qid);
      }
    });
  }

  onSubmit(formData: any): void {
    this.messageservice.clearErrors();
    this.formSubmitAttempt = true;
    let qid = this.quoteNumber;
    this.reevaluatePOBoxAddressValidity();
    this.logTracker.loginfo('ApplicantComponent', 'onSubmit', 'Next Button Click', 'Applicant FormData Submission and is Form Valid ' + this.applicantForm.valid);
    if (this.applicantForm.valid) {
      if (!this.invalidZipCode) {
        // Detect form changes to ensure the Update is performed while proceeding to Next
        // if the form already added
        this.checkFormUpdate();
        const nonOwnerIndicator = formData.get('nonowner')?.value;
        this.store.dispatch(Actions.setNonOwner({ nonOwner: nonOwnerIndicator }));

        if (this._nonOwner !== nonOwnerIndicator) {
          this.navigationService.addRequiredRoutes(this.navigationService.actionBasedRoutes('ApplicantNNO'));
        }
        const operation = this.performUpdate === QuoteApiActions.UPDATE ? 'Update' : 'Add';
        this.autoQuoteData = this.quoteDataMapper.mapApplicantData(this.applicantForm, this.dbAutoQuoteData, operation, this.isNewQuote);

        // Address Verification
        const prevAddressCheck = this.dbAutoQuoteData?.autoQuote?.contact?.addresses[1];
        const dbQuoteDataAddress = (prevAddressCheck?.addressType !== undefined) ? this.dbAutoQuoteData?.autoQuote?.contact?.addresses : this.dbAutoQuoteData?.autoQuote?.contact?.addresses?.splice(0, 1);
        const formDataAddress = this.autoQuoteData?.autoQuote?.contact?.addresses;
        const verifyAddress = this.addressService.verifyAddress(dbQuoteDataAddress, formDataAddress);

        if (verifyAddress) {
          this.verifyAddress(qid, formDataAddress, formData, operation);
        } else {
          this.poboxLogic(qid);
        }
      } else {
        const errorMsg = [];
        errorMsg.push(MessageConstants.INVALID_ZIP_CODE);
        this.messageservice.showError(errorMsg);
        const element = document.querySelector('#topcontent');
        element?.scrollIntoView();

      }

    } else {
      this.performSaveExit = false;
    }
  }

  /**
   * reevaulates if the po address is valid at the time of save
   */
  reevaluatePOBoxAddressValidity() {
    if (this.applicantForm.get('pobox')?.value) {
      this.onPoboxChange('pobox');
    }
    if (this.applicantForm.get('prevAddressPO')?.value) {
      this.onPoboxChange('prevAddressPO')
    }
  }

  /**
   * Address Validation used to scrub address
   * @param qid
   * @param formDataAddress
   * @param formData
   * @param operation
   */
  verifyAddress(qid: string, formDataAddress: any, formData: any, operation: any): void {
    let startTime = new Date();
    this.addressService.getAddressScrubbingResult(this.autoQuoteData.autoQuote.contact?.addresses)
      .subscribe((addressResults: Array<any>) => {
        const addressErrors: any = this.addressService.checkForAddressErrors(addressResults, 'applicant', MessageConstants.APPLICANT_ADDRESS_SCRUBBING_TYPE);
        this.messageservice.softError([]);

        if (addressErrors?.COR.length > 0) {
          addressErrors?.COR?.forEach((obj: any, _i: number) => {
            if (obj.correctedAddress.fullStreetAddress.length > 30) {
              obj.correctedAddress.fullStreetAddress = obj.correctedAddress.fullStreetAddress.substring(0, 30);
            }
            this.patchAddressDetails(obj);
          });
        }

        let softEditCheck = addressErrors?.softEdit?.filter((item: string) => this.addressSoftErrArr?.indexOf(item) < 0);
        this.softEditStatus = softEditCheck.length > 0 ? false : true;
        if (addressErrors?.softEdit.length > 0 && !this.softEditStatus) {
          this.messageservice.softError(addressErrors?.softEdit);
          this.softEditStatus = true;
          const element = document.querySelector('#topcontent');
          element?.scrollIntoView();
          this.addressSoftErrArr = addressErrors?.softEdit;
        } else if (addressErrors?.hardEdit.length > 0) {
          this.messageservice.clearSoftErrors();
          this.messageservice.showError(addressErrors?.hardEdit);
          const element = document.querySelector('#topcontent');
          element?.scrollIntoView();
        }
        else {
          const compareObj = this.addressService.compareScrubAddressWithFormAddress(addressResults, formDataAddress, 'applicant', MessageConstants.APPLICANT_ADDRESS_SCRUBBING_TYPE);
          if (compareObj.length > 0) {
            this.openDialog(compareObj, qid);
          }
          else {
            this.autoQuoteData = this.quoteDataMapper.mapApplicantData(this.applicantForm, this.dbAutoQuoteData, operation, this.isNewQuote);
            // Credit check
            this.creditReportData = this.propCreditMapper.mapPropCreditPostData(formData, operation, this.reportProcessingOrderIndicator);
            this.poboxLogic(qid);
          }
        }
        this.logTracker.loginfo('ApplicantComponent', 'verifyAddress', 'addressService.getAddressScrubbingResult',
          'QuoteNumber='.concat(qid + '|Duration='.concat(CommonUtils.elapsedTime(startTime).toString())));
      },
        error => {
          this.showSpinner = false;
          this.logTracker.logerror('ApplicantComponent', 'onSumbit', 'verifyAddress', 'Error=Address Validation Error', error);
        });
  }

  patchAddressDetails(obj: any) {
    const correctedAddress = obj.correctedAddress;
    if (obj.name === 'Mailing Address') {
      this.applicantForm.patchValue({
        address: correctedAddress.fullStreetAddress,
        city: correctedAddress.city,
        state: correctedAddress.state,
        zipcode: correctedAddress.zipCode
      });
    } else if (obj.name === 'Previous Mailing Address') {
      this.applicantForm.patchValue({
        prevAddress: correctedAddress?.fullStreetAddress,
        prevCity: correctedAddress?.city,
        prevState: correctedAddress?.state,
        prevZipcode: correctedAddress?.zipCode
      });
    }
  }

  saveApplicationData(qid: any): void {
    this.showSpinnerService.showSpinner(true);
    if (this.autoQuoteData) {
      var pnifirstnm = this.applicantForm.controls.firstname.value;
      var pnilastnm = this.applicantForm.controls.lastname.value;
      var pnimiddlenm = this.applicantForm.controls.middlename.value;
      var pnisuffix = this.applicantForm.controls.suffix.value;
      var pnizip = this.applicantForm.controls.zipcode.value?.trim();
      var pniaddress = this.applicantForm.controls.address.value;
      var pnistate = this.applicantForm.controls.state.value;
      var pnicity = this.applicantForm.controls.city.value;
      var pnidob = this.applicantForm.controls.birthdate.value;
      if (this.pageStatus === 1) {
        if (this.pniDBFirstNm != pnifirstnm || this.pniDBLastNm != pnilastnm || this.pniDBMiddleNm != pnimiddlenm|| this.pniDBSuffix != pnisuffix) {
          this.nameIndicator = 'Y'
        }
        if (this.pniDBAddr != pniaddress || this.pniDBZip != pnizip || this.pniDBState != pnistate || this.pniDBCity != pnicity) {
          this.addressIndicator = 'Y';
        }
        if (this.pniDBdob != pnidob) {
          this.dobIndicator = 'Y';
        }
      }

      let sessiondob = this.indicators.dobIndicator;
      let sessionName = this.indicators.nameIndicator;


      this.nameIndicator = (sessionName === 'Y' && this.nameIndicator === 'N') ? sessionName : this.nameIndicator;
      this.dobIndicator = (this.isMVRDOBChanged || (sessiondob === 'Y' && this.dobIndicator === 'N')) ? 'Y' : this.dobIndicator;

      const indicators: Indicators = {
        dobIndicator: this.dobIndicator,
        nameIndicator: this.nameIndicator
      }
      this.store.dispatch(Actions.indicators({ indicators }));

      // need to uncomment once muel changes deployed TA806308
      this.autoQuoteData.autoQuote.underWritingReportsModifiedAttributes = [{
        "code": "applicantDateofBirthChangeIndicator",
        "value": this.dobIndicator
      },
      {
        "code": "applicantNameChangeIndicator",
        "value": this.nameIndicator
      },
      {
        "code": "applicantAddressChangeIndicator",
        "value": this.addressIndicator
      }
      ]
      let startTime = new Date();
      this.quoteDataService.saveUpdateQuote(this.autoQuoteData, qid, 'saveQuote').subscribe(async () => {
        //data saved
        this.saveQuoteDataStatus = true;
        this.navigationService.removeRuleOnNext(0);

        if (this.requestedRoute !== '/exit') {
          // call prop credit api
          this.creditReportData = this.propCreditMapper.mapPropCreditPostData(this.applicantForm, 'Update', this.reportProcessingOrderIndicator);
          this.propCreditService.postPropCredit(this.creditReportData).subscribe(async () => {
            const pageStatus: PageStatus = { name: 'APPLICANT', status: 1 };
            this.store.dispatch(addPageStatus({ pageStatus }));
            this.sharedService.updateLastVisitedPage(0);
            this.showSpinnerService.showSpinner(false);
            if (this.performSaveExit) {
              this.navigationService.getNextRoutingRule(this.requestedRoute);
              return;
            } else {
              this.router.navigateByUrl('/drivers?qid=' + qid).then(r => r.valueOf());
            }
            this.logTracker.loginfo('ApplicantComponent', 'saveApplicationData', 'propCreditService.postPropCredit',
              'QuoteNumber='.concat(qid + '|Duration='.concat(CommonUtils.elapsedTime(startTime).toString())));
          },
            (errorData: any) => {
              this.logTracker.logerror('ApplicantComponent', 'saveApplicationData', 'postPropCredit',
                'Error=Applicant Prop Credit|QuoteNumber='.concat(qid), errorData);
              this.errorPropCreditHandler(errorData);
            });
        } else {
          if (this.performSaveExit) {
            this.showSpinnerService.showSpinner(false);
            this.navigationService.getNextRoutingRule(this.requestedRoute);
            return;
          }
        }
        this.logTracker.loginfo('ApplicantComponent', 'saveApplicationData', 'quoteDataService.saveUpdateQuote',
          'QuoteNumber='.concat(qid + '|Duration='.concat(CommonUtils.elapsedTime(startTime).toString())));
      },
        errorData => {
          this.logTracker.logerror('ApplicantComponent', 'saveApplicationData', 'saveUpdateQuote',
            'Error=Save Applicant Data|QuoteNumber='.concat(qid), errorData);
          this.errorHandler(errorData);
        });
    }
    else {
      this.showSpinnerService.showSpinner(false);
      this.router.navigateByUrl('/drivers?qid=' + qid).then(r => r.valueOf());
    }

  }

  // on pobox check change the address (current and prev mailing) field pattern validation
  onPoboxChange(formControlVal: string) {
    const addressTypeVal = formControlVal === 'pobox' ? 'address' : 'prevAddress';
    const poboxStatus = this.applicantForm.get(formControlVal)?.value;
    const addressControl = this.applicantForm.get(addressTypeVal);
    if (poboxStatus) {
      addressControl?.setValidators([Validators.required, Validators.pattern('^[A-Za-z0-9 \/\&\.\'\#\-]+$')]);
    } else {
      addressControl?.setValidators([Validators.required, Validators.pattern('^[A-Za-z0-9 \/\&\.\'\#\-]+$')]);
    }
    addressControl?.updateValueAndValidity();
  }

  /* Pobox uncheked- call getstatedbyzipcode and call saveApplicant, Pobox checked - call saveApplicant  */

  poboxLogic(qid: any): void {
    this.applicantForm.get('pobox')?.valueChanges.subscribe(
      (pobox: boolean) => {
      });

    const mailingAddress = this.autoQuoteData.autoQuote.contact?.addresses[0];
    if (mailingAddress?.streetName.match(/^[\/'#.0-9a-zA-Z\s,-]+$/)) {
      const pobox = mailingAddress?.POBoxIndicator;
      this.poCheck = true;
      pobox ? this.saveApplicationData(qid) : this.getStatesByZipcode(qid);
    }
  }

  onPoClick(event: any): void {
    this.applicantForm.get('pobox')?.valueChanges.subscribe(
      (pobox: boolean) => {
      });
    this.poCheck = event.target.checked;
  }

  /* set status if mailing zip match with API returned states */
  getStatesByZipcode(qid: any) {
    this.showSpinnerService.showSpinner(true);
    const mailingAddress = this.autoQuoteData.autoQuote.contact?.addresses[0];
    const zipcode = mailingAddress?.postalCode || "";
    let state = this.policyState || "";
    let startTime = new Date();
    let zip = zipcode.substring(0, 5);
    this.sharedService.getStatesByZipcode(zip).subscribe((data: any) => {

      const states = data.States;
      const mailingStateStatus = states.indexOf(state) == -1 ? false : true;
      this.store.dispatch(Actions.mailingStateStatus({ mailingStateStatus: mailingStateStatus }));
      this.saveApplicationData(qid);
      this.logTracker.loginfo('ApplicantComponent', 'getStatesByZipcode', 'sharedService.getStatesByZipcode',
        'QuoteNumber='.concat(qid + '|Duration='.concat(CommonUtils.elapsedTime(startTime).toString())));
    }, (errorData: any) => {
      this.logTracker.logerror('ApplicantComponent', 'getStatesByZipcode', 'getStatesByZipcode',
        'Error=Get state by zipcode|QuoteNumber='.concat(qid), errorData);
      this.errorHandler(errorData);
    });
  }
  checkForValidZipCode(str: string) {
    const moved = this.applicantForm.get('moved')?.value;
    let startTime = new Date();
    if (!moved) { // if prevAddress checkbox is Unchecked clear address fields and errors
      this.applicantForm.get('prevZipcode')?.patchValue(GlobalConstants.EMPTY_STRING);
      this.mailingAddressObj[1] = false;
      this.invalidZipCode = this.mailingAddressObj.includes(true);
      this.clearErrorMessages();
    }
    const currstate = this.applicantForm.get('state')?.value;
    const prevstate = this.applicantForm.get('prevState')?.value;
    const prevzipcode = this.applicantForm.get('prevZipcode')?.value?.trim();
    const currzip = this.applicantForm.get('zipcode')?.value?.trim();
    if ((str === 'currentMailAddress' && currzip !== null && currzip !== '' && CommonUtils.toInteger(currzip) !== 0 && currstate !== undefined && currstate !== '') ||
      (str === 'previousMailAddress' && prevzipcode !== null && prevzipcode !== '' && CommonUtils.toInteger(prevzipcode) !== 0 && prevstate !== undefined && prevstate !== '')) {
      let zipcode = (str === 'currentMailAddress') ? currzip : prevzipcode;
      if (zipcode?.includes('-')) {
        zipcode = zipcode?.replace('-', '');
      }
      let state = (str === 'currentMailAddress') ? currstate : prevstate;
      let zip = zipcode.substring(0, 5);
      this.sharedService.getStatesByZipcode(zip).subscribe((data: any) => {
        const states = data.States;
        if ((states?.length > 0 && states[0] !== state) || states?.length === 0) {
          if (str === 'currentMailAddress') {
            this.mailingAddressObj[0] = true;
          } else {
            this.mailingAddressObj[1] = true;
          }
          const errorMsg = [];
          errorMsg.push(MessageConstants.INVALID_ZIP_CODE);
          this.messageservice.showError(errorMsg);
          const element = document.querySelector('#topcontent');
          element?.scrollIntoView();
        }
        else {
          if (str === 'currentMailAddress') {
            this.mailingAddressObj[0] = false;
          } else {
            this.mailingAddressObj[1] = false;
          }
          this.clearErrorMessages();
        }
        this.invalidZipCode = this.mailingAddressObj.includes(true);
        this.showSpinnerService.showSpinner(false);
        this.logTracker.loginfo('ApplicantComponent', 'checkForValidZipCode', 'sharedService.getStatesByZipcode',
          'QuoteNumber='.concat(this.quoteNumber + '|Duration='.concat(CommonUtils.elapsedTime(startTime).toString())));
      }, (errorData: any) => {
        //this.showSpinnerService.showSpinner(false);
        this.logTracker.logerror('ApplicantComponent', 'checkForValidZipCode', 'sharedService.getStatesByZipcode',
          'Error=Get state by zipcode|QuoteNumber='.concat(this.quoteNumber), errorData);
        this.errorHandler(errorData);
      });

    }
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

  /* PNI age calculation*/
  PNIAgeEligibility(birthdate: any): boolean {
    var birthDate = new Date(birthdate);
    var today = new Date();
    var Time = today.getTime() - birthDate.getTime();
    var Days = Time / (1000 * 3600 * 24);
    return ((Math.round(Days)) / 365) >= 16 ? true : false;
  }

  /* Handle form errors */
  public hasError = (controlName: string, errorName: string) => {
    return this.applicantForm.controls[controlName].hasError(errorName);
  }

  onMovedClick(event: any): void {

  }

  // set required validator dynamically for leasedCompany formControl based on radio selection
  setPrevMailFieldsAsRequired(): void {
    const addressControl = this.applicantForm.get('prevAddress');
    const stateControl = this.applicantForm.get('prevState');
    const cityControl = this.applicantForm.get('prevCity');
    const zipcodeControl = this.applicantForm.get('prevZipcode');

    this.applicantForm.get('moved')?.valueChanges.subscribe(
      (mode: boolean) => {

        if (mode === true) {
          addressControl?.setValidators([Validators.required, Validators.pattern('([0-9][a-zA-Z0-9]+)[A-Za-z0-9 \/\&\.\'\#\-]+$')]);
          stateControl?.setValidators([Validators.required]);
          cityControl?.setValidators([Validators.required, Validators.pattern('^[A-Za-z][A-Za-z -]*$')]);
          zipcodeControl?.setValidators([Validators.required, ZipCodeValidator.zipcodeValidator]);
        } else {
          addressControl?.setValidators(null);
          stateControl?.setValidators(null);
          cityControl?.setValidators(null);
          zipcodeControl?.setValidators(null);
        }

        addressControl?.updateValueAndValidity();
        stateControl?.updateValueAndValidity();
        cityControl?.updateValueAndValidity();
        zipcodeControl?.updateValueAndValidity();
      });
  }

  onPolEffDtChange(): void {
    var pnieffdate = this.applicantForm.controls.polEffDt.value;
    const policyEffDt = formatDate(pnieffdate, 'MM-dd-yyyy', 'en-US');
    const formattedDate = formatDate(pnieffdate, 'MM/dd/YYYY', 'en-US');
    this.dateChange.emit();
    this.policyEffDateEligibilityEdit(policyEffDt);
    this.deriveRateBook(formattedDate?.toString(), true);
    if (this.isNewQuote) {
      this.validateNewQuoteEffectiveDate();
      return;
    }

    this.validateSavedQuoteEffectiveDate();
  }

  private validateNewQuoteEffectiveDate(): void {
    const effectiveDate = this.getEffectiveDate();
    const isValidPostDateRange = this.isValidPolicyEffectivePostDateRange(effectiveDate);

    if (isValidPostDateRange) {
      this.clearInfoMessage();
      return;
    }
    this.effectiveDateSharedValidations(effectiveDate);
  }

  private validateSavedQuoteEffectiveDate(): void {
    const effectiveDate = this.getEffectiveDate();
    const isValidPostDateRange = this.isValidPolicyEffectivePostDateRange(effectiveDate);
    const isValidBackDateRange = this.isAllowedBackDate(effectiveDate);

    if (isValidPostDateRange || isValidBackDateRange) {
      this.clearInfoMessage();
      return;
    }
    this.effectiveDateSharedValidations(effectiveDate);
  }

  private effectiveDateSharedValidations(effectiveDate: Date): void {
    const isBackDated = this.isBackdatedPolicyEffectiveDate(effectiveDate);
    if (isBackDated) {
      this.setInfoMessage(MessageConstants.OUT_OF_BINDING_MESSAGE);
      this.setEffectiveDate(this.today);
      return;
    }
    this.setInfoMessage(MessageConstants.createPostDateMessage(this.policyEffDateRetrievefromDB == undefined || this.policyEffDateRetrievefromDB == "" ? this.today : new Date(`${this.policyEffDateRetrievefromDB}`), this.generateMaxPostDate()));
    this.setEffectiveDate(this.today);
  }

  private getEffectiveDate(): Date {
    return this.applicantForm.get('polEffDt')?.value as Date ?? new Date();
  }

  private setEffectiveDate(effectiveDate: Date): void {
    this.applicantForm.patchValue({
      polEffDt: effectiveDate
    });
  }

  private isBackdatedPolicyEffectiveDate(effectiveDate: Date): boolean {
    return effectiveDate < this.today;
  }

  private isAllowedBackDate(effectiveDate: Date): boolean {
    const isValidRangeBackDate = this.isValidPolicyEffectiveBackDateRange(effectiveDate);
    return isValidRangeBackDate;
  }

  private isValidPolicyEffectivePostDateRange(effectiveDate: Date): boolean {
    return effectiveDate <= this.generateMaxPostDate() && effectiveDate >= this.today;
  }

  private isValidPolicyEffectiveBackDateRange(effectiveDate: Date): boolean {
    return effectiveDate >= this.generateMaxBackDate() && effectiveDate <= this.today && effectiveDate >= this.originalPolicyEffectiveDate;
  }

  dayDiff(d1: any, d2: any) {
    const diffTime = d2.getTime() - d1.getTime();
    const diffDays = diffTime / (1000 * 3600 * 24)
    return diffDays <= 0 ? 0 : diffDays;
  }

  private generateMaxBackDate(): Date {
    const maxDaysForBackDate = 2;
    const maxBackDate = this.generateCleanDate();
    maxBackDate.setDate(maxBackDate.getDate() - maxDaysForBackDate);

    return maxBackDate;
  }

  private generateMaxPostDate(): Date {
    const maxDaysForPostDate = 59;
    const maxPostDate = this.policyEffDateRetrievefromDB == undefined || this.policyEffDateRetrievefromDB == "" ? this.generateCleanDate() : new Date(`${this.policyEffDateRetrievefromDB}`);
    maxPostDate.setDate(maxPostDate.getDate() + maxDaysForPostDate);

    return maxPostDate;
  }

  private generateCleanDate(): Date {
    return this.zeroOutHoursForComparison(new Date());
  }

  private zeroOutHoursForComparison(dateToZero: Date): Date {
    dateToZero.setHours(0, 0, 0, 0);

    return dateToZero;
  }

  private clearInfoAndErrorMessages(): void {
    this.clearErrorMessages();
    this.clearInfoMessage();
  }

  private setErrorMessage(message: string[]): void {
    this.messageservice.showError(message);
  }

  private clearErrorMessages(): void {
    this.messageservice.clearErrors();
  }

  private setInfoMessage(message: string): void {
    this.infoMessage = message;
  }

  private clearInfoMessage(): void {
    this.infoMessage = '';
  }

  loadHelpText(fieldID: string): void {
    let helpTextObj = this.helpTextMapper.mapHelpText(fieldID);

    if (helpTextObj) {
      this.helpTextDialog.open(HelpTextDialogComponent, {
        width: '30%',
        panelClass: 'full-width-dialog',
        data: {
          title: helpTextObj.title,
          text: helpTextObj.text
        }
      });
    }
  }

  private loadValidValues(): void {
    const validvaluesreq: ValidValuesReq = {
      appName: GlobalConstants.APP_NAME,
      pageName: GlobalConstants.APPLICANT_PAGE_NAME,
      mco: GlobalConstants.MCO_ALL_VALID_VALUES,
      ratebook: this.ratebook,
      state: this.policyState,
      dropdownName: GlobalConstants.DROPDOWN_ALL_VALID_VALUES,
      filter: ''
    }
    let startTime = new Date();
    this.validValuesService.getValidValues(validvaluesreq).subscribe(async (data: ValidValuesRes) => {
      this.applicant.suffixValues = data.responseMap.suffix;
      this.applicant.maritalStatusValues = data.responseMap.maritalstatus;
      this.applicant.genderValues = data.responseMap.gender;
      this.applicant.stateValues = data.responseMap.states;
      this.applicant.prevStateValues = data.responseMap.states
      this.applicant.discounts = data.responseMap.discounts;
      this.applicant.custConstentValue = data.responseMap.consent_options;
      let suffixObj = this.applicant.suffixValues.filter(dataVal => (dataVal.key === this.pniDBSuffix));
      if (suffixObj.length < 1) {
        this.applicantForm.patchValue({
          suffix: "",
        });
      }
      this.store.dispatch(Actions.addEligibleDiscounts({ eligibleDiscounts: data.responseMap.discounts }));
      this.logTracker.loginfo('ApplicantComponent', 'loadValidValues', 'validValuesService.getValidValues',
        'Duration='.concat(CommonUtils.elapsedTime(startTime).toString()));
    },
      (error: any) => {
        this.showSpinnerService.showSpinner(false);
        this.logTracker.logerror('ApplicantComponent', 'loadValidValues', 'getValidValues', 'Error=Applicant Page Valid Values', error);
      }
    );
  }

  consentValuesreq = (): ConsentValuesReq => {
    return {
      appName: GlobalConstants.APP_NAME,
      pageName: GlobalConstants.APPLICANT_PAGE_CONSENT,
      agentType: this.agentType,//'EA',
      state: this.policyState,
      dropdownName: GlobalConstants.DROPDOWN_NAME
    }
  }

  private loadConsentMessage(data: ConsentValuesRes): void {
    let startTime = new Date();
    this.consentText = data?.responseMap?.consent_message[0]?.displayvalue;

    this.consentObj = data?.responseMap?.consent_message?.length > 0 ? true : false;
    const consentFormEle = this.applicantForm.get('custConsent');
    if (this.consentObj) {
      consentFormEle?.setValidators([Validators.required]);
    } else {
      consentFormEle?.setValidators(null);
    }
    consentFormEle?.updateValueAndValidity();

    this.logTracker.loginfo('ApplicantComponent', 'loadConsentMessage', 'consentValueServive.getConstentMessage',
      'Duration='.concat(CommonUtils.elapsedTime(startTime).toString()));

  }


  onBirthDateChange(_event: any): void {
    const formbirthdate = this.applicantForm.get('birthdate');
    this.applicantForm.patchValue({
      birthdate: formbirthdate,
    });
  }

  /* API error handling for Prop Credit*/
  errorPropCreditHandler(errorData: any) {
    const errorArr: any = [];
    errorData?.error?.transactionNotification?.remark?.forEach((val: any) => {
      errorArr.push(val.messageText);
      if ('Soft Edit' === val.messageType) {
        this.reportProcessingOrderIndicator = '1';
        this.messageservice.softError(errorArr);
      }
      else {
        this.messageservice.showError(errorArr);
      }
    });

    const element = document.querySelector('#topcontent');
    element?.scrollIntoView();
    this.showSpinnerService.showSpinner(false);
  }

  onPNIchange() {
    var pnifirstnm = this.applicantForm.controls.firstname.value?.trim();
    var pnimiddlenm = this.applicantForm.controls.middlename.value?.trim();
    var pnilastnm = this.applicantForm.controls.lastname.value?.trim();
    var pnisuffix = this.applicantForm.controls.suffix.value;
    var pnizip = this.applicantForm.controls.zipcode.value?.trim();
    var pniaddress = this.applicantForm.controls.address.value?.trim();
    var pnissn = this.applicantForm.controls.ssn.value;
    var pnidob = this.applicantForm.controls.birthdate.value;
    if ((this.pageStatus === 1) && (this.pniDBFirstNm != pnifirstnm || this.pniDBLastNm != pnilastnm || this.pniDBLastNm != pnimiddlenm || this.pniDBSuffix != pnisuffix
      || this.pniDBAddr != pniaddress || this.pniDBSSN != pnissn || this.pniDBZip != pnizip
      || this.pniDBdob != pnidob)) {

      this.messageservice.softError([MessageConstants.APPLICANT_INFO_CHANGED]);
      const element = document.querySelector('#topcontent');
      element?.scrollIntoView();

      this.navigationService.addRequiredRoutes(this.navigationService.actionBasedRoutes('ApplicantPNI'));
    }
    else {
      if ((this.pageStatus === 1) && (this.pniDBMiddleNm != pnimiddlenm)) {
        this.navigationService.addRequiredRoutes(this.navigationService.actionBasedRoutes('ApplicantPNI'));
      }
      this.messageservice.softError([]);
      this.messageservice.clearErrors();
    }
  }

  showApplicantEdits() {
    if (this.warnMessage.length > 0) {
      this.messageservice.softError(this.warnMessage);
      const element = document.querySelector('#topcontent');
      element?.scrollIntoView();
    }
    else {
      this.messageservice.clearErrors();
    }
  }

  policyEffDateEligibilityEdit(effctDate: any) {
    var polEffDate = new Date(effctDate);
    var today = new Date();
    var Time = today.getTime() - polEffDate.getTime();
    var Days = Time / (1000 * 3600 * 24);
    var eligiblity = (Math.round(Days)) > 60 ? true : false;
    if (eligiblity) {
      this.messageservice.clearErrors();
      this.messageservice.softError([MessageConstants.APPLICANT_INFO_CHANGED]);
      const element = document.querySelector('#topcontent');
      element?.scrollIntoView();
    }
  }

  /**
   * Determines the next route and routes with quote number as parameter
   * @param qid
   */
  navigate(qid: string): void {
    if (this.requestedRoute !== '') {
      this.navigationService.updateNavigationRequestedRoute('');
      this.router.navigateByUrl(this.requestedRoute.concat('?qid=' + qid)).then(r => r.valueOf());
    } else {
      this.router.navigateByUrl('/drivers?qid=' + qid).then(r => r.valueOf());
    }
  }



  navigationObservableWatch(): void {

    this.navigationObvSubscription = this.navigationService.navigationStepObv.subscribe(
      nextRoute => {

        if (nextRoute.startsWith('save-')) {
          this.requestedRoute = nextRoute.split('-')[1].trim();
          this.performSaveExit = true;
          this.nextButton.nativeElement.click();
        }
      },
      error => this.logTracker.logerror('ApplicantComponent', 'navigationObservableWatch', 'navigationStepObv',
        'Applicant Page navigationObservableWatch Error', error));
  }

}
