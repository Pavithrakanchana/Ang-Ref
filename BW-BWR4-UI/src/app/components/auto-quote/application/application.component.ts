import { formatDate } from '@angular/common';
import { ChangeDetectorRef, Component, ElementRef, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { UntypedFormArray, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatOptionSelectionChange } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import { MatRadioChange } from '@angular/material/radio';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { forkJoin, Observable, Subscription } from 'rxjs';
import { GlobalConstants } from 'src/app/constants/global.constant';
import { MessageConstants } from 'src/app/constants/message.constant';
import { AddressVerificationService } from 'src/app/services/address-verification.service';
import { ApplicationService } from 'src/app/services/application.service';
import { QuoteDataService } from 'src/app/services/quote-data.service';
import { SharedService } from 'src/app/services/shared.service';
import { AddressComponent } from 'src/app/shared/components/address/address.component';
import { PayplansComponent } from 'src/app/shared/components/payplans/payplans.component';
import { HelpTextDialogComponent } from 'src/app/shared/dialog/helptext-dialog/helptext-dialog.component';
import { LossPayeePopupComponent } from 'src/app/shared/dialog/loss-payee-popup/loss-payee-popup.component';
import { PopupMailingAddressComponent } from 'src/app/shared/dialog/popup-mailing-address/popup-mailing-address.component';
import { ProducerNamePopupDialogComponent } from 'src/app/shared/dialog/producer-name-popup-dialog/producer-name-popup-dialog.component';
import { ApplicationDetails } from 'src/app/shared/model/application/application.mode';
import { Address, AutoQuoteData, Driver, Error, PayPlanDetails, Phone, PolicyPackage, ReferencePolicy, Vehicle } from 'src/app/shared/model/autoquote/autoquote.model';
import { Agents } from 'src/app/shared/model/producer.model';
import { ValidValuesReq } from 'src/app/shared/model/validvalues/validvaluesreq.model';
import { phonePipe } from 'src/app/shared/pipes/phone.pipe';
import { MessagesService } from 'src/app/shared/services/messages.service';
import { NavigationService } from 'src/app/shared/services/navigation.service';
import { SpinnerStatusService } from 'src/app/shared/services/spinner-status.service';
import { ValidValuesService } from 'src/app/shared/services/validvalues/validvalues.service';
import { CommonUtils } from 'src/app/shared/utilities/common-utils';
import { HelptextMapper } from 'src/app/shared/utilities/helptext-mapper';
import { ObjectUtils } from 'src/app/shared/utilities/object-utils';
import { QuoteDataMapper } from 'src/app/shared/utilities/quotedata-mapper';
import { Tracker } from 'src/app/shared/utilities/tracker';
import { PhoneNumberValidator } from 'src/app/shared/validators/phone.validator';
import { ZipCodeValidator } from 'src/app/shared/validators/zipcode.validator';
import QuoteSummary, { ApplicantAddress, DriverSummary, PageStatus } from 'src/app/state/model/summary.model';
import * as Actions from '../../../state/actions/summary.action';
import { addPageStatus } from '../../../state/actions/summary.action';
import { DeleteLosspayeeAdditionalInterestDialogComponent } from './delete-losspayee-additional-interest-dialog/delete-losspayee-additional-interest-dialog.component';

@Component({
  selector: 'app-application',
  templateUrl: './application.component.html',
  styleUrls: ['./application.component.scss']
})
export class ApplicationComponent implements OnInit {
  @ViewChildren(AddressComponent) child!: QueryList<AddressComponent>;

  @ViewChild('next', { read: ElementRef }) nextButton!: ElementRef;

  applicationForm!: UntypedFormGroup;
  page: string = 'application';
  clickBack = false;
  pageStatus!: number;
  formSubmitAttempt = false;
  sortedCountries! : any;
  emailPattern = /^[a-zA-Z0-9+_.-]+@[a-zA-Z0-9.-]+$/;
  showTextAlertMessage = false;
  textAlertDisclaimer = MessageConstants.TEXT_ALERTS_DISCLAIMER;
  producerDropDownData!: Agents[];
  infoMessage!: string;
  errorMessage = '';
  showSpinner = false;
  esignIndicator!: boolean;
  warnMessage: string[] = [];
  listedDrivers: DriverSummary[] = [];
  goPaperLessIndicator!: boolean;
  goPaperLess!: boolean;
  emailAddress: any;
  vehicleListFormArray!: UntypedFormArray;
  quoteNumber!: any;
  mco!: any;
  autoQuoteData!: AutoQuoteData;
  dbApplicationData!: any;
  addLossPayeeAddInsuByVehicle: any = [];
  policyPackage!: PolicyPackage[];
  selectedPackage = 'Premium';
  vehicles: Vehicle[] = [];
  drivers: Driver[] = [];
  textAlertPhones: any[] = [];
  referencePolicies: ReferencePolicy[] = [];
  fdlDriverList: Driver[] = [];
  additonalNamedInsureds: Driver[] = [];
  selectedPayPlan: string = '';
  selectPayPlanCode: string = '';
  totalPremium: string = '';
  producerCode!: string;
  reqVehiclesForAddressScrub: any[] = [];
  lienHolderTypeList: any[] = [];
  onChangePolicyTypePolicyNoReqMsg: string = 'Please Provide the Farmers Policy number if assigned.';
  onChangePolictTypePolicyNoInValidMsg: string = 'Invalid Farmers Policy Number. Please re-enter';
  applicationDetails: ApplicationDetails = new ApplicationDetails();
  producerDropDown = false;
  softEditStatus: boolean = false;
  effectiveDate: any;
  multiPolicySelected = false;
  valuesLoaded = false;
  eftFutureInstallValue!: string;
  downpaymentValue!: string;
  recalculateStatus: boolean = false;
  policyState!: any;
  boardFormOrNNO!: any;
  applicantAddress!: ApplicantAddress;
  eftPaymentMethods: boolean = false;
  hasProducerSweep = false;
  nonOwner = false;
  @ViewChild(PayplansComponent, { static: true }) payPlanchild!: PayplansComponent;
  losspayeepopupopened = false;
  navigationObvSubscription!: Subscription;
  requestedRoute = '';
  performSaveExit = false;
  helpTextTitle = '';
  helpText = '';
  invalidGarageStateZip = false;
  multiPolicySoftEditFlag = false;
  multiPolicyPattern = /^(?!.*([0-9])\1{4})(?=.*\d).{7,}(?=.*\d)[A-Za-z0-9]+/;
  ratebook!: string;
  stepperRestriction: boolean = false;
  additionalIntVehIndex: any;
  ratingErrors: any;

  constructor(
    private dialog: MatDialog,
    private router: Router,
    private formBuilder: UntypedFormBuilder,
    public addressDialog: MatDialog,
    private applicationService: ApplicationService,
    private readonly messageService: MessagesService,
    private showSpinnerService: SpinnerStatusService,
    private store: Store<{ quoteSummary: QuoteSummary }>,
    private quoteDataMapper: QuoteDataMapper,
    private quoteDataService: QuoteDataService,
    private addressService: AddressVerificationService,
    public validValuesService: ValidValuesService,
    public producerDialog: MatDialog,
    private navigationService: NavigationService,
    private logTracker: Tracker,
    private helpTextMapper: HelptextMapper,
    private sharedService: SharedService,
    private  changeDetectorRef: ChangeDetectorRef) {
      this.store.select('quoteSummary').subscribe(data => {
        this.quoteNumber = data.qid;
        this.mco = data.mco;
        this.ratebook = data.rateBook;
        const pageStatusArr = data.pageStatus.filter(page => (page.name === 'APPLICATION'));
        this.pageStatus = pageStatusArr.length > 0 ? pageStatusArr[0].status : 0;
        this.producerCode = data.producerCode; // '0299999';
        this.listedDrivers = data.drivers.length != 0 ? data.drivers.slice(1) : [];
        this.applicantAddress = data.applicantAddress;
        this.policyState = data.policyState;
        this.boardFormOrNNO = data.policyState == "CO" ? "BROAD Form" : "Named Non Owner"
        this.hasProducerSweep = data.prodSweepStatus;
        this.nonOwner = data.nonOwner;
        this.esignIndicator = data.esign;
        this.stepperRestriction = data.stepperRestriction;
      });
  }

  ngOnDestroy(): void {
    this.navigationService.updateNavigationRequestedRoute('');
    this.navigationObvSubscription.unsubscribe();
  }

  ngAfterViewChecked(): void {
    this.changeDetectorRef.detectChanges();
  }

  ngOnInit(): void {
    this.applicationForm = this.formBuilder.group({
      producerName: ['', Validators.required],
      phone: ['', Validators.compose([Validators.required, PhoneNumberValidator.phoneValidator])],
      email: ['', Validators.pattern('[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,3}$')],
      payPlan: [''],
      additionalNamedInsured: [''],
      mobilePhone1: ['', PhoneNumberValidator.phoneValidator],
      mobilePhone2: ['', PhoneNumberValidator.phoneValidator],
      mobilePhone3: ['', PhoneNumberValidator.phoneValidator],
      textAlerts: ['0'],
      goPaperlessDiscount: ['0'],
      vehicles: this.formBuilder.array([]),
      fdl: this.formBuilder.array([]),
      eft: [''],
      downPayment: [''],
      multipolicyDiscounts: this.formBuilder.array([])
    });

    this.effectiveDate = formatDate(new Date(), 'yyyy-MM-dd', 'en');




    this.autoQuoteData = this.quoteDataMapper.mapRateQuoteRequestData('', 'application');

    let getApplicationObservables: Observable<any>[] = new Array();
    const validvaluesreq: ValidValuesReq = {
      appName: GlobalConstants.APP_NAME,
      pageName: GlobalConstants.APPLICATION_PAGE_NAME,
      mco: GlobalConstants.MCO_ALL_VALID_VALUES,
      ratebook: GlobalConstants.RATEBOOK_ALL_VALID_VALUES,
      state: this.policyState,
      dropdownName: GlobalConstants.DROPDOWN_ALL_VALID_VALUES,
      filter:''
    };
    this.showSpinnerService.showSpinner(true);
    let startTime = new Date();
    getApplicationObservables.push(this.validValuesService.getValidValues(validvaluesreq));
    getApplicationObservables.push(this.applicationService.getProducerNameData(this.effectiveDate, this.quoteNumber, this.mco, this.producerCode));
    getApplicationObservables.push(this.quoteDataService.rateUpdateQuote(this.autoQuoteData, 'rateQuote'));

    this.logTracker.loginfo('ApplicationComponent', 'getApplication', 'On Page load', 'On Page load Calls ' + getApplicationObservables);
    forkJoin(getApplicationObservables).subscribe(results => {
      if (!ObjectUtils.isObjectEmpty(results[0])) {
        this.applicationDetails.multiPolicyDiscounts = results[0].responseMap.multi_policy_discount;
        this.applicationDetails.otherPolicyTypes = [
          {
            label: 'FARMERS',
            options: results[0].responseMap.farmers_multipolicy_type
          },
          {
            label: 'FOREMOST',
            options: results[0].responseMap.foremost_multipolicy_type
          },
          {
            label: 'ZURICH',
            options: results[0].responseMap.zurich_multipolicy_type
          }];

        this.applicationDetails.countries = results[0].responseMap.countries;
          this.sortedCountries = this.applicationDetails?.countries.sort((a, b) => a.displayvalue > b.displayvalue ? 1 : -1);
        if (!ObjectUtils.isObjectEmpty(results[1])) {
          if (results[1].reportStatus === 'Hit' && results[1].agents.length != 0) {
            this.producerDropDownData = results[1].agents
            this.producerDropDown = true;
          }
        }
        if (!ObjectUtils.isObjectEmpty(results[2])) {
          this.ratingErrors = results[2];
          const ratingErrors: string[] = this.checkForRateErrors(results[2].autoQuote.policyPackage[0]?.autoCoverages?.errors);
          if (ratingErrors && ratingErrors.length > 0) {
            this.messageService.showError(ratingErrors);
            const element = document.querySelector('#topcontent');
            element?.scrollIntoView();
            this.showSpinnerService.showSpinner(false);
            return;
          } else {
            this.infoMessage = MessageConstants.APPL_FINAL_RATE;
            this.valuesLoaded = true;
            this.updatingESignOnVehicle(results[2]);
            this.loadApplicationDetails(results[2]);
          }
        }
      }
      this.logTracker.loginfo('ApplicationComponent', 'ngOnInit', 'quoteDataService.rateUpdateQuote|validValuesService.getValidValues|applicationService.getProducerNameData',
        'QuoteNumber='.concat(this.quoteNumber + '|Duration='.concat(CommonUtils.elapsedTime(startTime).toString())));
    },
      (errorData: any) => {
        this.logTracker.logerror('ApplicationComponent', 'ngOnInit', 'quoteDataService.rateUpdateQuote',
          'Error=Application Page Rate Quote', errorData);

        this.errorHandler(errorData);

        this.showSpinnerService.showSpinner(false);
      });

      this.getStateValues();


    // save & exit behaviour subjec observable
    this.navigationObservableWatch();
  }

  getStateValues(){
    let getStateObservables: Observable<any>[] = new Array();
      const validvaluesrequest: ValidValuesReq = {
      appName: GlobalConstants.APP_NAME,
      pageName: GlobalConstants.APPLICANT_PAGE_NAME,
      mco: GlobalConstants.MCO_ALL_VALID_VALUES,
      ratebook: this.ratebook,
      state: GlobalConstants.STATE_ALL_VALID_VALUES,
      dropdownName: GlobalConstants.DROPDOWN_ALL_VALID_VALUES,
      filter:''
      }
    this.showSpinnerService.showSpinner(true);
    getStateObservables.push(this.validValuesService.getValidValues(validvaluesrequest));
    forkJoin(getStateObservables).subscribe(results => {
      if (!ObjectUtils.isObjectEmpty(results[0])) {
        this.applicationDetails.stateValues = results[0].responseMap.states;
        }
      });
  }

  checkPayMethodChange(rerateStatus: any) {
    this.recalculateStatus = rerateStatus;
    if (rerateStatus === true) {
      this.messageService.showError([MessageConstants.PAYMETHOD_CHANGE_EDIT]);
      const element = document.querySelector('#topcontent');
      element?.scrollIntoView();
    } else {
      this.messageService.clearErrors();
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

  updatingESignOnVehicle(data: any){
    const vehicles: Vehicle[] = data.autoQuote.personalAuto?.vehicles || [];
    vehicles.forEach((veh: any, i: number) => {
      if(veh.make && veh.make.toUpperCase()=="CONV"){
        this.esignIndicator = false;
      }
    })
  }
  loadApplicationDetails(data: any) {
    const phoneFormat = new phonePipe();
    // Load premium and Payplans
    this.loadPayPlansAndFeesAndPremium(data);
    this.emailAddress = data.autoQuote.contact?.person.emailAddress?.trim();
    this.goPaperLess = data.autoQuote.policyDiscountIndicators?.goPaperlessIndicator;
    const gpVal = data.autoQuote.policyDiscountIndicators?.goPaperlessIndicator === true ? '1' : '0';
    this.applicationForm.controls.goPaperlessDiscount.patchValue(gpVal);

    if(data.autoQuote.messages?.length > 0){
    const esignMsg = data.autoQuote.messages[0]?.description;
    this.messageService.softError([esignMsg]);
    }

    if (this.goPaperLess) {
      this.goPaperLessIndicator=true;
      CommonUtils.updateControlValidation(this.applicationForm?.controls?.email, true);
    } else {
      this.goPaperLessIndicator=false;
      CommonUtils.updateControlValidation(this.applicationForm?.controls?.email, false);
    }
    if (this.esignIndicator) {
      CommonUtils.updateControlValidation(this.applicationForm?.controls?.email, true);
    }

    if (!this.goPaperLess && this.emailAddress === '') {
      this.applicationForm.controls.email.patchValue('');
    } else {
      this.applicationForm.controls.email.patchValue(this.emailAddress);
    }

    const agentUID = data.autoQuote.agents && data.autoQuote.agents.length > 0 ? data.autoQuote.agents[0].uniqueAgentNumber : '';
    this.applicationForm.controls.producerName.patchValue(agentUID);

    const pniPhone = phoneFormat.transform(data.autoQuote.contact?.phones?.find((phone: Phone) => phone.textAlertEnrollmentIndicator === false)?.phoneNumber || GlobalConstants.EMPTY_STRING);
    this.applicationForm.controls.phone.patchValue(pniPhone);

    const phones: Phone[] = data.autoQuote?.contact?.phones || [];


    if (phones.length > 1 || this.pageStatus !== 1) {
      this.applicationForm.controls.textAlerts.patchValue('1');
      this.onTextAlertsChange('1');

      const textAlertPhones: Phone[] = data.autoQuote.contact?.phones?.filter((phone: Phone) => phone.textAlertEnrollmentIndicator === true) || [];

      this.applicationForm.controls.mobilePhone1.patchValue(!ObjectUtils.isObjectEmpty(textAlertPhones[0]) ? phoneFormat?.transform(textAlertPhones[0]?.phoneNumber) : GlobalConstants.EMPTY_STRING);
      this.applicationForm.controls.mobilePhone2.patchValue(!ObjectUtils.isObjectEmpty(textAlertPhones[1]) ? phoneFormat?.transform(textAlertPhones[1]?.phoneNumber) : GlobalConstants.EMPTY_STRING);
      this.applicationForm.controls.mobilePhone3.patchValue(!ObjectUtils.isObjectEmpty(textAlertPhones[2]) ? phoneFormat?.transform(textAlertPhones[2]?.phoneNumber) : GlobalConstants.EMPTY_STRING);
    }

    const vehicles: Vehicle[] = data.autoQuote.personalAuto?.vehicles || [];

    this.addVehicleNLienHolderForm(vehicles);
    this.vehicles = vehicles;
    this.dbApplicationData = data.autoQuote;

    const drivers: Driver[] = data.autoQuote.personalAuto?.drivers || []
    this.addFDLDriverForm(drivers);
    this.fdlDriverList = drivers.filter((driver: Driver) => driver?.license?.licenseType === 'F');
    this.additonalNamedInsureds = drivers.filter((driver: Driver) => driver?.sequenceNumber !== '1');
    this.applicationForm.controls.additionalNamedInsured.patchValue('None');
    if (this.additonalNamedInsureds.length > 0) {
      this.additonalNamedInsureds.forEach((namedInsured: any, i: number) => {
        if (namedInsured.addionalNamedInsuredSelectedIndicator) {
          this.applicationForm.controls.additionalNamedInsured.patchValue(namedInsured.sequenceNumber);
        }
      });
    }

    this.multiPolicySelected = data.autoQuote.policyDiscountIndicators.multiPolicy === 'N' ? true : false;

    this.addMultiPolicyDiscountForm(data.autoQuote.policyDiscountIndicators.multiPolicy, data.autoQuote.referencePolicies);
    // this.referencePolicies = data.autoQuote.referencePolicies;
  }

  vehicleHasCompNColl = (vehCoverages: any): boolean => {
    const compVal = vehCoverages?.find((x: { code: string; }) => (x.code === 'OTC' || x.code === 'OTC0GD'))?.deductible || GlobalConstants.NONE;
    const collVal = vehCoverages?.find((x: { code: string; }) => x.code === 'COL')?.deductible || GlobalConstants.NONE;

    return compVal !== GlobalConstants.NONE && collVal !== GlobalConstants.NONE;
  }

  addMultiPolicyDiscountForm(multipolicyCd: string, referencePolicies: ReferencePolicy[]): void {
    if (multipolicyCd && multipolicyCd !== 'N') {
      referencePolicies.forEach((ref: ReferencePolicy, i: number) => {
        if (ref.lineOfBusiness?.toUpperCase() === 'HOME' && (multipolicyCd !== 'B' || GlobalConstants.MULTI_POLICY_HOME_WITH_OTHER.includes(multipolicyCd))) {
          this.addMultiPolicyForms(ref);
          this.checkAndRemovePolicyNumberAsRequired(ref, i); // TO:DO US330315: Multi-policy discount
          this.referencePolicies.push(ref);
        }
        if (ref.lineOfBusiness?.toUpperCase() === 'OTHER' && (multipolicyCd === 'B' || GlobalConstants.MULTI_POLICY_HOME_WITH_OTHER.includes(multipolicyCd))) {
          this.addMultiPolicyForms(ref);
          this.checkPolicyTypeIsRequired(ref, i);
          this.checkAndRemovePolicyNumberAsRequired(ref, i); // TO:DO US330315: Multi-policy discount
          this.referencePolicies.push(ref);
        }
      });
    }
  }
  checkAndRemovePolicyNumberAsRequired(ref: ReferencePolicy, i: number): void {

    if (ref?.verificationIndicator && ref?.policyNumber !== '') {
      const policyNumberControl = this.applicationForm.controls['multipolicyDiscounts']?.get([i, 'policyNumber']);


      policyNumberControl?.setValidators(null);
      policyNumberControl?.updateValueAndValidity();

    }
  }
  checkPolicyTypeIsRequired(ref: ReferencePolicy, i: number): void {
    // console.log(ref, i)
    const policyTypeControl = this.applicationForm.controls['multipolicyDiscounts']?.get([i, 'policyType']);
    policyTypeControl?.setValidators([Validators.required]);
    policyTypeControl?.updateValueAndValidity();

  }
  addMultiPolicyForms(ref: any): void {
    this.multiPolicyDiscountForm().push(this.initmultipolicy(ref));
  }

  multiPolicyDiscountForm(): UntypedFormArray {
    return this.applicationForm.get('multipolicyDiscounts') as UntypedFormArray;
  }

  initmultipolicy(ref: any): UntypedFormGroup {
    const otherPolicyVal = ref.policyType?.trim() === 'BRISTL WEST COMMERCIAL' ? ref.policyType?.trim() : this.filterOtherPolicy(ref.policyType?.trim());

    const policyTypeKey = ref?.lineOfBusiness.trim().toUpperCase() === 'OTHER' ? otherPolicyVal : ref.policyType?.trim();
    return this.formBuilder.group({
      lineOfBusiness: [ref.lineOfBusiness],
      policyType: [policyTypeKey],
      policyNumber: [ref.policyNumber?.trim()]
    });
  }

  filterOtherPolicy(value: string) {
    let valueObj = '';
    this.applicationDetails.otherPolicyTypes?.forEach((othPolObj: any) => {
      othPolObj?.options.filter((policyOptions: any) => {
        if (policyOptions?.key?.trim()?.toUpperCase() === value?.trim()?.toUpperCase()) {
          valueObj = policyOptions.key.trim();
        }
      });
    });
    return valueObj;
  }

  addFDLDriverForm(drivers: any[]): void {
    const fdlDrivers = drivers?.filter((driver: { license: { licenseType: string; }; }) => driver?.license?.licenseType === 'F');
    fdlDrivers.forEach((driver: any, i: number) => {
      this.addDriversForm(driver);
    });
  }

  fdlDriversFormArray(): UntypedFormArray {
    return this.applicationForm.get('fdl') as UntypedFormArray;
  }

  addDriversForm(driver: Driver): void {
    this.fdlDriversFormArray().push(this.initDriver(driver));
  }

  initDriver(driver: Driver): UntypedFormGroup {
    return this.formBuilder.group({
      driverId: [driver.sequenceNumber],
      driverName: [driver.firstName + '' + driver.lastName],
      countryIssuingLicense: [(driver.license?.issuingCountry !== '0.00000' ? driver.license?.issuingCountry?.slice(0, driver.license?.issuingCountry.indexOf(".")) : ''), [Validators.required]]
    });
  }

  loadPayPlansAndFeesAndPremium(obj: any) {
    this.policyPackage = obj.autoQuote.policyPackage;
    this.selectPayPlanCode = obj.autoQuote.policyPackage[0].autoCoverages?.userSelectedPayplan;
    this.totalPremium = '' + obj.autoQuote.policyPackage[0].autoCoverages?.premiumDetails[0]?.savingsAmount?.theCurrencyAmount || '0';
    this.eftFutureInstallValue = obj.autoQuote.policyDiscountIndicators.eftFutureInstallments;
    this.downpaymentValue = obj.autoQuote.policyDiscountIndicators.downPaymentMethod;
    this.eftPaymentMethods = this.eftFutureInstallValue != 'N';
    this.applicationForm.patchValue({
      eft: obj.autoQuote.policyDiscountIndicators.eftFutureInstallments,
      downPayment: obj.autoQuote.policyDiscountIndicators.downPaymentMethod
    });
  }

  initVehicle(): UntypedFormGroup {
    return this.formBuilder.group({
      id: '',
      bodyType: '',
      year: '',
      make: '',
      model: '',
      address: ['', [Validators.required, Validators.pattern("^[A-Za-z0-9 \/\&\.\'\#\-]+$")]],
      city: ['', [Validators.required, Validators.pattern('^[A-Za-z][A-Za-z -]*$')]],
      state: ['', Validators.required],//this.policyState
      zipcode: ['', [Validators.required, ZipCodeValidator.zipcodeValidator]],
      addionalInterests: this.formBuilder.array([])
    });
  }

  initLienholder(): UntypedFormGroup {
    return this.formBuilder.group({
      type: ['', Validators.required],
      firstName: '',
      lastName: '',
      middleName: '',
      institutionName: [''],
      address: ['', [Validators.required, Validators.pattern("^[A-Za-z0-9 \/\&\.\'\#\-]+$")]],
      state: ['', Validators.required],//this.policyState
      city: ['', [Validators.required, Validators.pattern('^[A-Za-z][A-Za-z -]*$')]],
      zipcode: ['', [Validators.required, ZipCodeValidator.zipcodeValidator]],
    });
  }

  vehiclesFormGroup(index: any): UntypedFormGroup {
    const itemControls = this.applicationForm.get('vehicles') as UntypedFormArray;
    return itemControls.controls[index] as UntypedFormGroup;
  }

  lienholderFormGroup(vehIndex: any, lhIndex: any): UntypedFormGroup {
    const itemControls = this.vehiclesFormGroup(vehIndex).get('addionalInterests') as UntypedFormArray;
    return itemControls.controls[lhIndex] as UntypedFormGroup;
  }

  vehiclesFormArray(): UntypedFormArray {
    return this.applicationForm.get('vehicles') as UntypedFormArray;
  }

  lienholderFormArray(index: any): UntypedFormArray {
    this.additionalIntVehIndex = index;
    return this.vehiclesFormArray().at(index).get('addionalInterests') as UntypedFormArray;
  }

  addVehicleForm(): void {
    this.vehiclesFormArray().push(this.initVehicle());
  }

  addLienholderForm(vehIndex: any): void {
    this.lienholderFormArray(vehIndex).push(this.initLienholder());
  }

  trimSpace(formControlNameVal: any) {
    if (this.applicationForm.controls[formControlNameVal]?.value !== "" && this.applicationForm.controls[formControlNameVal]?.value !== null ) {
      this.applicationForm.controls[formControlNameVal]?.patchValue(this.applicationForm.controls[formControlNameVal]?.value.trim());
    }
  }

  addVehicleNLienHolderForm(vehicles: Vehicle[]): void {
    // console.log(JSON.stringify(vehicles));
    vehicles.forEach((veh: any, i: number) => {
      this.addVehicleForm();
      let compareMailingZipWithGarageZip = true;
      if (!this.applicantAddress.POBoxIndicator && (this.applicantAddress.postalCode.substring
        (0,5) === veh.garageAddress?.postalCode)) {
        if (veh?.garageAddress?.streetName?.trim() !== GlobalConstants.EMPTY_STRING && this.applicantAddress.streetName?.trim()?.toUpperCase() !== veh?.garageAddress?.streetName?.trim().toUpperCase()) {
          compareMailingZipWithGarageZip = false;
        } else {
          compareMailingZipWithGarageZip = true;
        }
      }else{
        compareMailingZipWithGarageZip = false;
      }
      this.vehiclesFormGroup(i).patchValue({
        bodyType: veh.bodyType,
        year: veh.year,
        make: veh.make,
        model: veh.model,
        id: veh.sequenceNumber
      });

      setTimeout(() => {
        const childFormGroup = this.child.toArray();
          childFormGroup[i].addressForm.patchValue({
            address: compareMailingZipWithGarageZip ? this.applicantAddress.streetName : veh?.garageAddress?.streetName?.trim(),
            state: compareMailingZipWithGarageZip ? this.applicantAddress.state : veh?.garageAddress?.state,//this.policyState
            city: compareMailingZipWithGarageZip ? this.applicantAddress.city : veh?.garageAddress?.city,
            zipcode: veh?.garageAddress?.postalCode
          })
        this.showSpinnerService.showSpinner(false);
      }, 1000);


      if (veh.addionalInterests && veh.addionalInterests.length > 0) {
        veh.addionalInterests.forEach((lh: any, v: number) => {
          this.addLienholderForm(i);
          if (lh.addresses && lh.addresses !== null && lh.addresses.length > 0) {
            const streetName = lh.addresses[0].streetName; // + ' ' + lh.addresses[0].addressLine;
            const name = lh.firstName + ' ' + lh.middleName + ' ' + lh.lastName;
            this.lienholderFormGroup(i, v).patchValue({
              type: lh.type,
              firstName: lh.firstName,
              middleName: lh.middleName,
              lastName: lh.lastName,
              institutionName: lh.institutionName,
              address: streetName.trim(),
              state: lh.addresses[0].state,//this.policyState
              city: lh.addresses[0].city,
              zipcode: lh.addresses[0].postalCode
            });
          }
        });
      }
    })
  }

  loadNamedInsured(res: AutoQuoteData): void {
    const phoneFormat = new phonePipe();
    this.applicationForm.patchValue({
      email: res.autoQuote.contact?.person.emailAddress?.trim() ?? '',
      phone: res.autoQuote?.contact?.phones[0]?.phoneNumber?.trim() ?? '',
    });
  }

  // producer name popup logics here
  producerPopup(): void {
    const dialogRef = this.producerDialog.open(ProducerNamePopupDialogComponent, {
      width: '70%',
      height: 'auto',
      panelClass: 'full-width-dialog',
      disableClose: true,
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result.clicked === 'submit') {

      }
    });
  }


  public hasError = (controlName: string, errorName: string, index: any, formArrayName: string) => {
    if (index != 'null' && Number(index) >= 0 && formArrayName != 'null') {
      return this.applicationForm.controls[formArrayName].get([index, controlName])?.hasError(errorName);
    } else {
      return this.applicationForm.controls[controlName].hasError(errorName);
    }
  };
  phoneNumberValidations(controlName: string, phoneValue: string): boolean {
    const control = this.applicationForm.controls[controlName];
    let isValidPhone = true;
    if (!phoneValue || phoneValue?.length < 12 || phoneValue === GlobalConstants.EMPTY_STRING) { // check if phone is "" and add required condition
      (phoneValue === GlobalConstants.EMPTY_STRING) ? control.patchValue(GlobalConstants.EMPTY_STRING) : ''
      CommonUtils.updateControlValidation(control, true);
      isValidPhone = false;
    }
    if (phoneValue?.length < 12 && phoneValue !== GlobalConstants.EMPTY_STRING) {
      control.patchValue(phoneValue);
      control.setValidators([PhoneNumberValidator.phoneValidator]);
      control.updateValueAndValidity();
      isValidPhone = false;
    }

    return isValidPhone;
  }

  vehicleGarageValidations(controlName: string, vehicles: any) {
    const control = this.applicationForm.controls[controlName];
    let addrCount = 0;
    let startTime = new Date();
    if(control?.status === 'INVALID'){
      const errorArr: any = [];
      vehicles?.value.forEach((veh: any, i: number) => {
        addrCount++;
        const addrValue = veh?.address;
        const cityValue = veh?.city;
        const stateValue = veh?.state;
        const vehicleId = i + 1;
        if(addrValue === GlobalConstants.EMPTY_STRING)
      {
        errorArr.push('Vehicle ' + vehicleId + ' - ' + MessageConstants.VEH_GARAGE_ADDRESS_REQ);
      }
      if(cityValue === GlobalConstants.EMPTY_STRING)
      {
        errorArr.push('Vehicle ' + vehicleId + ' - ' + MessageConstants.VEH_GARAGE_CITY_REQ);
      }
      if(stateValue === GlobalConstants.EMPTY_STRING)
      {
        errorArr.push('Vehicle ' + vehicleId + ' - ' + MessageConstants.VEH_GARAGE_STATE_REQ);
      }
      if(errorArr?.length>0)
      {
        this.messageService.showError(errorArr);
        const element = document.querySelector('#topcontent');
        element?.scrollIntoView();
        this.showSpinnerService.showSpinner(false);
        return;
      }
      });
    }
    this.logTracker.loginfo('ApplicationComponent', 'onSubmit', 'vehicleGarageValidations',
    'QuoteNumber='.concat(this.quoteNumber + '|Duration='.concat(CommonUtils.elapsedTime(startTime).toString())));
  }
  addLienholder(vehIndex: any, operation: string): void {
    let vehicleLienFormArray = this.lienholderFormArray(vehIndex);
    this.losspayeepopupopened = true;

    const dialogRef = this.addressDialog.open(LossPayeePopupComponent, {
      width: '85%',
      panelClass: 'full-width-dialog',
      disableClose: true,
      data: {
        vehicleLienFormArray: vehicleLienFormArray,
        linenHolderObject: this.vehicles[vehIndex].addionalInterests,
        stateValues: this.applicationDetails.stateValues,
        LP_AI_data: [],
        lhIndex: ''
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      this.losspayeepopupopened = false;
      if (result.event) {
        this.vehicles.forEach((veh: any, i: number) => {
          if (vehIndex === i) {
            veh.addionalInterests.push(result.data[0]);
          }
        });
      } else {
        this.updateAdditionalInterests();
      }
    });
  }

  updateAdditionalInterests() {
        const lpForm = (this.applicationForm.get('vehicles') as UntypedFormArray).controls[this.additionalIntVehIndex] as UntypedFormGroup;
        if((lpForm.controls['addionalInterests'] as UntypedFormArray).controls.length!==0) {
        (lpForm.controls['addionalInterests'] as UntypedFormArray).controls.splice(-1);
        lpForm.updateValueAndValidity();
        (lpForm.get('addionalInterests') as UntypedFormArray).clearValidators();
        (lpForm.get('addionalInterests') as UntypedFormArray).updateValueAndValidity();
        this.applicationForm.get('vehicles')?.updateValueAndValidity();
        this.applicationForm.updateValueAndValidity();
        }
  }

  getAdditionaInterestByIndex(v: any, l: any) {
    return this.vehicles[v].addionalInterests?.filter((obj, i) => {
      return i == l;
    })[0];
  }

  editLienholder(vehInd: any, lhIndex: any): void {
    this.losspayeepopupopened = true;
    let vehicleLienFormArray = this.lienholderFormArray(vehInd);
    let LP_AI_data = this.getAdditionaInterestByIndex(vehInd, lhIndex)

    // let LP_AI_data = this.vehicles[vehInd];

    const dialogRef = this.addressDialog.open(LossPayeePopupComponent, {
      width: '80%',
      panelClass: 'full-width-dialog',
      disableClose: true,
      data: {
        vehicleLienFormArray: vehicleLienFormArray,
        stateValues: this.applicationDetails.stateValues,
        LP_AI_data: LP_AI_data,
        lhIndex: lhIndex
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      this.losspayeepopupopened = false;
      this.messageService.clearErrors();

      if (result.event) {
        this.vehicles.forEach((veh: any, i: number) => {
          if (vehInd === i) {
            veh.addionalInterests[lhIndex] = result.data[0];
          }
        });
      }
    });


  }

  removeLienholder(vehInd: any, lhIndex: any): void {
    const dialogRef = this.dialog.open(DeleteLosspayeeAdditionalInterestDialogComponent, {
      width: '30%',
      panelClass: 'full-width-dialog',
    });
    dialogRef.afterClosed().subscribe((result) => {

      if (result) {
        this.vehicles.forEach((veh: any, i: number) => {
          if (vehInd === i) {
            veh.addionalInterests.splice(lhIndex, 1);
          }
        });
      }
    });
  }

  onClickBack(formData: any): void {
    this.clickBack = true;
    this.onSubmit(formData, 'back');
  }

  onTextAlertsChange(value: string) {
    this.showTextAlertMessage = (value === '1' ? true : false);
    this.applicationForm.controls.mobilePhone1.patchValue(GlobalConstants.EMPTY_STRING);
    this.applicationForm.controls.mobilePhone2.patchValue(GlobalConstants.EMPTY_STRING);
    this.applicationForm.controls.mobilePhone3.patchValue(GlobalConstants.EMPTY_STRING);
    if (this.showTextAlertMessage) {
      CommonUtils.updateControlValidation(this.applicationForm?.controls?.mobilePhone1, true);
    } else {
      CommonUtils.updateControlValidation(this.applicationForm?.controls?.mobilePhone1, false);
    }
  }

  optionSelected(event: MatOptionSelectionChange, groupName: string, index: number) {
    if (event.isUserInput) {
      let group = groupName;
      const policyNumberControl = this.applicationForm.controls['multipolicyDiscounts'].get([index, 'policyNumber'])
      //CommonUtils.updateControlValidation(this.applicationForm?.controls?.email, true);
      if (group === 'FARMERS') {
        this.onChangePolictTypePolicyNoInValidMsg = MessageConstants.POLICY_NO_FARMERS_INVALID;
      } else if (group === 'FOREMOST') {
        this.onChangePolictTypePolicyNoInValidMsg = MessageConstants.POLICY_NO_FOREMOST_INVALID;
      }
      else if (group === 'ZURICH') {
        this.onChangePolictTypePolicyNoInValidMsg = MessageConstants.POLICY_NO_ZURICH_INVALID;
      } else if (group === 'BRISTOLWEST') {
        this.onChangePolictTypePolicyNoInValidMsg = MessageConstants.POLICY_NO_BRISTOL_INVALID;
      }
    }
  }

  onGoPaperLessChange(event: MatRadioChange) {
    const goPaperLessFormData = event.value === '1' ? true : false;
    this.recalculateStatus = (goPaperLessFormData === this.goPaperLess) ? false : true;

    let editsArry: string[] = [];
    if (this.recalculateStatus) {
      editsArry.push(MessageConstants.PAYMETHOD_CHANGE_EDIT);
    }
    if (goPaperLessFormData) {
      this.goPaperLessIndicator = true;
      CommonUtils.updateControlValidation(this.applicationForm?.controls?.email, true);
      //editsArry.push(MessageConstants.GO_PAPERLESS_DISCLAIMER);
    }
    else {
      this.goPaperLessIndicator = false;
      CommonUtils.updateControlValidation(this.applicationForm?.controls?.email, false);
      this.messageService.clearErrors();
    }
    if (editsArry) {
      this.messageService.showError(editsArry);
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

  /* API error handling*/
  errorHandler(errorData?: any): void {
    const errorArr: any = [];
    errorData?.error?.transactionNotification?.remark?.forEach((val: any) => {
      errorArr.push(val.messageText);
    });
    this.messageService.showError(errorArr);
    const element = document.querySelector('#topcontent');
    element?.scrollIntoView();
    this.showSpinnerService.showSpinner(false);
  }

  recalculate(operation: string, formData: any) {
    this.showSpinnerService.showSpinner(true);

    this.selectedPayPlan = this.applicationForm.get('payPlan')?.value || this.payPlanchild?.form.get('payPlan')?.value;

    // const payPlanSelectedObj = this.policyPackage[0]?.autoCoverages?.payplansDetails?.filter((obj) => obj.payPlan === this.selectedPayPlan);
    this.autoQuoteData = this.quoteDataMapper.mapPayPlanDetailsData(this.selectedPayPlan, this.totalPremium, formData, this.dbApplicationData?.term, this.dbApplicationData);
    let startTime = new Date();
    this.quoteDataService.rateUpdateQuote(this.autoQuoteData, 'rateQuote').subscribe(async (data: any) => {
      await data;
      this.loadPayPlansAndFeesAndPremium(data);
      this.recalculateStatus = false;
      this.messageService.clearErrors();
      this.showSpinnerService.showSpinner(false);
      const ratingErrors: string[] = this.checkForRateErrors(data.autoQuote.policyPackage[0].autoCoverages.errors);
      if (ratingErrors && ratingErrors.length > 0) {
        this.messageService.showError(ratingErrors);
        const element = document.querySelector('#topcontent');
        element?.scrollIntoView();
      }

      this.logTracker.loginfo('ApplicationComponent', 'recalculate', 'quoteDataService.rateUpdateQuote',
        'QuoteNumber='.concat(this.quoteNumber + '|Duration='.concat(CommonUtils.elapsedTime(startTime).toString())));
    }, (errorData: any) => {
      this.errorHandler(errorData);
      this.logTracker.logerror('ApplicationComponent', 'recalculate', 'quoteDataService.rateUpdateQuote',
        'Error=Application Page Recalculate|QuoteNumber='.concat(this.quoteNumber), errorData);

      this.clickBack = false;
    });
  }

  validateMultiPolicy = (formData: any): boolean => {
    const multipolicyDiscounts = formData.get('multipolicyDiscounts')?.value;

    let isValidMultiPolicy = true;
    if (multipolicyDiscounts && multipolicyDiscounts.length > 0 && !this.multiPolicySoftEditFlag) {
      multipolicyDiscounts.forEach((ref: any) => {
      if (ObjectUtils.isFieldEmpty(ref.policyNumber) || (!ObjectUtils.isFieldEmpty(ref.policyNumber) && !ref.policyNumber.match(this.multiPolicyPattern))) {
          isValidMultiPolicy = false;
          this.multiPolicySoftEditFlag = true;
        }
      });
    }

    return isValidMultiPolicy;
  }

  mobileNumberLogic() {
    let phonepattern = /^[0-9]{3}-[0-9]{3}-[0-9]{4}$/;
    let phone1 = this.applicationForm?.controls?.mobilePhone1.value
    let phone2 = this.applicationForm?.controls?.mobilePhone2.value
    let phone3 = this.applicationForm?.controls?.mobilePhone3.value
    if (phone1 === '' && phone2.match(phonepattern)) {
      this.applicationForm.controls.mobilePhone1.setValue(phone2);
      this.applicationForm.controls.mobilePhone2.setValue('');
    }
    if(phone1 === '' && phone3.match(phonepattern)) {
      this.applicationForm.controls.mobilePhone1.setValue(phone3);
      this.applicationForm.controls.mobilePhone3.setValue('');
    }
    if (phone1 === '' && phone2.match(phonepattern) && phone3.match(phonepattern)) {
      this.applicationForm.controls.mobilePhone1.setValue(phone2);
      this.applicationForm.controls.mobilePhone2.setValue(phone3);
      this.applicationForm.controls.mobilePhone3.setValue('');
    }

  }

  onSubmit(formData: any, btnName:string): void {
    this.mobileNumberLogic();
    this.clickBack = btnName === 'next' ? false : true;
    const isValidMultiPolicy = this.validateMultiPolicy(formData);
    if (!isValidMultiPolicy) {
      this.messageService.softError([MessageConstants.POLICY_NO_MULTI_MSG]);
      const element = document.querySelector('#topcontent');
      element?.scrollIntoView();
      this.performSaveExit = false;
      return;
    }
    let stateZipCount = 0;
    let phoneValue = this.applicationForm?.controls?.phone.value?.trim();
    let mobile1Value = this.applicationForm.controls?.mobilePhone1?.value?.trim();

    if(phoneValue !== '' && phoneValue?.length<2) {
      phoneValue = '';
    }
    if(mobile1Value !== '' && mobile1Value?.length<2) {
      mobile1Value = '';
    }

    this.applicationForm.get('vehicles')?.value.forEach((veh: any, i: number) => {
      veh.zipcode = veh.zipcode.length <= 6 ? veh.zipcode.replace(/-/g, "") : veh.zipcode;
    });
    this.formSubmitAttempt = true;
    let qid = JSON.stringify(this.quoteNumber);
    qid = qid.replace(/"/g, '');
    if (!this.recalculateStatus) {
      this.messageService.clearErrors();
      if (!this.producerDropDown) {
        this.messageService.showError([MessageConstants.PRODUCER_DATA_NOT_FOUND]);
      }
      if (this.applicationForm?.controls?.phone.value === GlobalConstants.EMPTY_STRING) { // check if phone is "" and add required condition
        CommonUtils.updateControlValidation(this.applicationForm?.controls?.phone, true);

      }
      this.phoneNumberValidations('phone', phoneValue);
      if(this.showTextAlertMessage) {
       
        if(mobile1Value === ''){
          this.messageService.showError([MessageConstants.TEXT_ALERT_MOBILE1_REQ]);
          CommonUtils.updateControlValidation(this.applicationForm?.controls?.mobilePhone1, true);
          const element = document.querySelector('#topcontent');
          element?.scrollIntoView();
          this.performSaveExit = false;
          this.showSpinnerService.showSpinner(false);
          return;
        }

        const isValid = this.phoneNumberValidations('mobilePhone1', mobile1Value);
        if(!isValid) return;
      }
      this.vehicleGarageValidations('vehicles',this.applicationForm.get('vehicles'))
      this.logTracker.loginfo('ApplicationComponent', 'onSubmit', 'Next Button Click', 'Application FormData Submission and Is Form Valid ' + this.applicationForm.valid);
      if (this.applicationForm.valid) {
        this.showSpinnerService.showSpinner(true);
        const errorMsg: string[] = [];
        let bannedStates = GlobalConstants.VEHICLE_BANNED_STATES;
        let noInsuranceStates = GlobalConstants.VEHICLE_NO_INSURANCE_STATES;
        let vehiclesCheck = this.applicationForm.get('vehicles')?.value.length !== 0 ? true : false;
        if(vehiclesCheck) {
        this.applicationForm.get('vehicles')?.value.forEach((vehicle: any, index: number) => {
          let garState = vehicle?.state;
          let garZip = vehicle?.zipcode;
          let garStreetAddr = vehicle?.address;
          let startTime = new Date();
          const vehicleId = index + 1;
          if (garZip?.includes('-')) {
            garZip = garZip?.replace('-', '');
          }
          let poerror=false;
          if (garStreetAddr?.trim()?.toUpperCase()?.includes('P.O BOX')) {
            poerror=true;
            errorMsg.push('Vehicle ' + vehicleId + ' - ' + MessageConstants.INVALID_STATE_ZIP_OR_HAS_POBOX);
          }
          let zip = garZip.substring(0,5);
          this.sharedService.getStatesByZipcode(zip).subscribe((data: any) => {
            const states = data.States;
            stateZipCount++;

            let vehErrMsg = '';
            if ((states?.length > 0 && states[0] !== garState) || states?.length === 0) {
              if(!poerror)
              {
                errorMsg.push('Vehicle ' + vehicleId + ' - ' + MessageConstants.INVALID_ZIP_CODE);
              }

              //check vehicle garage zipcode state is providing insurance or not
              const noInsuranceStateFound = states.filter((returnState: any) =>
                noInsuranceStates.some((noInsuranceState: any) => returnState === noInsuranceState)
              );

              // check vehicle zipcode state is in banned state or not
              const bannedStateFound = states.filter((returnState: any) =>
                bannedStates.some((bannedState: any) => returnState === bannedState)
              );

              // check vehicle zipcode is out of state
              const mailingStateStatus = states.indexOf(this.policyState) == -1 ? false : true;

              if (noInsuranceStateFound?.length > 0) {
                errorMsg.push('Vehicle ' + vehicleId + ' - ' + MessageConstants.NO_INSURANCE_STATE_MSG);
              }
              if (bannedStateFound?.length > 0 && this.policyState !== GlobalConstants.STATE_PA) {
                errorMsg.push('Vehicle ' + vehicleId + ' - ' + MessageConstants.BANNED_STATE_MSG);
              } if (index === 0 && !mailingStateStatus) {
                errorMsg.push('Vehicle ' + vehicleId + ' - ' + MessageConstants.OUT_OF_STATE_ZIPCODE);
              }
            }

           if (errorMsg?.length > 0) {
              this.invalidGarageStateZip = true;
              this.messageService.showError(errorMsg);
              const element = document.querySelector('#topcontent');
              element?.scrollIntoView();
              this.performSaveExit = false;
              this.showSpinnerService.showSpinner(false);
              return;
            }
            else if (stateZipCount == this.applicationForm.get('vehicles')?.value?.length) {
              this.invalidGarageStateZip = false;
              const email = formData.get('email')?.value;
              const validEmail = this.emailPattern.test(email);

              // const textalerts = this.applicationForm.get('textAlerts')?.value === '1' ? true : false;
              // if (textalerts && this.applicationForm.get('mobilePhone1')?.value?.trim() === '') {
              //   this.messageService.showError([MessageConstants.TEXT_ALERTS_REQUIRED]);
              //   CommonUtils.updateControlValidation(this.applicationForm?.controls?.mobilePhone1, true);
              //   const element = document.querySelector('#topcontent');
              //   element?.scrollIntoView();
              //   this.performSaveExit = false;
              //   this.showSpinnerService.showSpinner(false);
              //   return;
              // }
              if (!ObjectUtils.isFieldEmpty(email)) {
                if (validEmail) {

                  let emailCheckObservables: Observable<any>[] = new Array();
                  let startTime = new Date();
                  emailCheckObservables.push(this.applicationService.validateEmail(email, this.mco, qid, this.producerCode));
                  emailCheckObservables.push(this.applicationService.duplicateEmail(email));

                  forkJoin(emailCheckObservables).subscribe(results => {
                    let validemailcheck = false;
                    let dupemailcheck = false;
                    const errorArr: any = [];
                    if (!ObjectUtils.isObjectEmpty(results[1]) || !ObjectUtils.isObjectEmpty(results[0])) {
                      if (results[0] && results[0].status !== 'VALID') {
                        errorArr.push(MessageConstants.INVALID_EMAIL);
                        validemailcheck = true;
                      }
                      if (results[1]) {
                        let policyStatus = results[1].policyStatus;
                        let cancelDate = policyStatus === "Cancelled" ? results[1].cancelDate : "";
                        let policyStatusFlag = results[1].policyStatus === 'Cancelled' ? false : true;
                        let today = new Date();
                        let tomDate = new Date(today.setDate(today.getDate() + 1));
                        let dateCondition = (new Date(cancelDate) <= tomDate) ? true : false;

                        if ((this.goPaperLessIndicator || this.esignIndicator) && (policyStatus === 'Verified' || policyStatus === 'Pending'
                          || policyStatus === 'PendingCancel' || (policyStatusFlag && dateCondition))) {
                          errorArr.push(MessageConstants.DUPLICATE_EMAIL);
                          dupemailcheck = true;
                        }
                      }
                      this.messageService.showError(errorArr);
                      const element = document.querySelector('#topcontent');
                      element?.scrollIntoView();

                    }

                    if (!validemailcheck && !dupemailcheck && !this.invalidGarageStateZip) {
                      this.saveApplicationData(qid);
                    } else {
                      this.performSaveExit = false;
                    }

                    this.logTracker.loginfo('ApplicationComponent', 'onSubmit', 'validateEmail-duplicateEmail',
                      'QuoteNumber='.concat(this.quoteNumber + '|Duration='.concat(CommonUtils.elapsedTime(startTime).toString())));
                  },
                    (errorData: any) => {
                      this.logTracker.logerror('ApplicationComponent', 'onSubmit', 'validateEmail-duplicateEmail',
                        'Error=Application Page validateEmail/DuplicateEmail|QuoteNumber='.concat(this.quoteNumber), errorData);
                    });
                }
                else if (email === " " || this.esignIndicator) {
                  this.showSpinnerService.showSpinner(false);
                  this.messageService.showError([MessageConstants.ESIGN_VALID_EMAIL]);
                  const element = document.querySelector('#topcontent');
                  element?.scrollIntoView();
                  this.performSaveExit = false;
                  return;

                } else {
                  this.showSpinnerService.showSpinner(false);
                  this.messageService.showError([MessageConstants.EMAIL_REQUIRED]);
                  const element = document.querySelector('#topcontent');
                  element?.scrollIntoView();
                  this.performSaveExit = false;
                  return;
                }

              }
              else {

                if (!this.invalidGarageStateZip) {
                  this.saveApplicationData(qid);
                }
              }
            }

            this.showSpinnerService.showSpinner(false);
            this.logTracker.loginfo('ApplicationComponent', 'checkForValidZipCode', 'sharedService.getStatesByZipcode',
              'QuoteNumber='.concat(this.quoteNumber + '|Duration='.concat(CommonUtils.elapsedTime(startTime).toString())));
          }, (errorData: any) => {
            this.showSpinnerService.showSpinner(false);
            this.logTracker.logerror('ApplicationComponent', 'checkForValidZipCode', 'sharedService.getStatesByZipcode',
              'Error=Get state by zipcode|QuoteNumber='.concat(this.quoteNumber), errorData);
            this.errorHandler(errorData);
          });
        });
      } else {
        const ratingErrors: string[] = this.checkForRateErrors(this.ratingErrors.autoQuote.policyPackage[0]?.autoCoverages?.errors);
          if (ratingErrors && ratingErrors.length > 0) {
            if(this.clickBack){
              this.launchReports(qid);
            } else if(!this.clickBack && (this.requestedRoute !== GlobalConstants.EMPTY_STRING)){
              this.navigationService.getNextRoutingRule(this.requestedRoute);
              this.showSpinnerService.showSpinner(true);
              this.showSpinnerService.showSpinner(false);
            } else {
            this.messageService.showError(ratingErrors);
            const element = document.querySelector('#topcontent');
            element?.scrollIntoView();
            this.showSpinnerService.showSpinner(false);
            return;
            }
          }
      }
      } else {
         this.performSaveExit = false;
      }
    } else {
      const element = document.querySelector('#recalculateBtn');
      element?.scrollIntoView();
    }

  }

  launchReports(quoteId: any) {
    this.router.navigateByUrl('/reports?qid=' + quoteId);
  }


  vehicleGaragingAddressVerification(dbAddress: any, formAddress: any) {
    const dbQuoteDataAddress = dbAddress.personalAuto?.vehicles;
    const formDataAddress = formAddress.autoQuote.personalAuto?.vehicles || [];
    let addressVerificationObj: Address[] = [];
    formDataAddress.forEach((item: any, i: number) => {
      const verifyAddress = this.addressService.verifyAddress(dbQuoteDataAddress[i].garageAddress, item.garageAddress);
      if (verifyAddress) {
        this.reqVehiclesForAddressScrub.push(item);
        addressVerificationObj.push(item.garageAddress);
      }
    });
    return addressVerificationObj;
  }

  saveApplicationData(qid: any): void {

    this.selectedPayPlan = this.applicationForm.get('payPlan')?.value || this.payPlanchild.form.get('payPlan')?.value;;
    // const payPlanSelectedObj = this.applicationGetResponse.autoQuote.policyPackage[0].autoCoverages.payplansDetails.filter((obj) => obj.payPlan === this.selectedPayPlan);
    // const payPlanSelectedObj = this.policyPackage[0]?.autoCoverages?.payplansDetails?.filter((obj) => obj.payPlan === this.selectedPayPlan);
    this.autoQuoteData = this.quoteDataMapper.mapApplicationData(this.applicationForm, this.selectedPayPlan, this.totalPremium, this.dbApplicationData, this.producerDropDownData, this.vehicles);

    // Address Verification
    const verifyAddressObj = this.vehicleGaragingAddressVerification(this.dbApplicationData, this.autoQuoteData);
    if (verifyAddressObj.length > 0) {
      let startTime = new Date();
      this.addressService.getAddressScrubbingResult(verifyAddressObj).subscribe(
        (addressResults: Array<any>) => {
          // In case error occured e.g. for the 'addresses' (our 'result' identifier) at position 1,
          // Output wil be: [result1, null, result2];
          const addressErrors: any = this.addressService.checkForAddressErrors(addressResults, 'vehicleGarage', this.reqVehiclesForAddressScrub);
          this.messageService.softError([]);
          if (addressErrors?.COR.length > 0) {
            addressErrors?.COR?.forEach((obj: any, i: number) => {
              // this.patchAddressDetails(obj);
              let correctedAddress = obj.correctedAddress;
              if(correctedAddress.fullStreetAddress.length > 30){
                  correctedAddress.fullStreetAddress = correctedAddress.fullStreetAddress.substring(0,30);
                }
              const vehicleId = this.vehicles.findIndex((z: any) => z.sequenceNumber?.toString() === obj?.id);
              this.vehiclesFormArray()?.controls[vehicleId]?.patchValue({
                address: correctedAddress?.fullStreetAddress,
                city: correctedAddress?.city,
                state: correctedAddress?.state,
                zipcode: correctedAddress?.zipCode
              });
            });
          }

          if (addressErrors?.hardEdit?.length > 0) {
            this.messageService.showError(addressErrors?.hardEdit);
            const element = document.querySelector('#topcontent');
            element?.scrollIntoView();
            this.performSaveExit = false;
          }
          else if (addressErrors?.softEdit.length > 0 && !this.softEditStatus) {
            this.messageService.softError(addressErrors?.softEdit);
            this.softEditStatus = true;
            const element = document.querySelector('#topcontent');
            element?.scrollIntoView();
            this.performSaveExit = false;
          } else {
            const formDataAddress = verifyAddressObj;
            const compareObj = this.addressService.compareScrubAddressWithFormAddress(addressResults, formDataAddress, 'vehicleGarage', this.reqVehiclesForAddressScrub);
            if (compareObj.length > 0) {
              this.openDialog(compareObj, qid);
              this.performSaveExit = false;
            }
            else {
              this.saveApplication(qid);
            }
          }

          this.logTracker.loginfo('ApplicationComponent', 'saveApplicationData', 'addressService.getAddressScrubbingResult',
            'QuoteNumber='.concat(this.quoteNumber + '|Duration='.concat(CommonUtils.elapsedTime(startTime).toString())));
        }, (errorData: any) => {
          this.logTracker.logerror('ApplicationComponent', 'saveApplicationData', 'addressService.getAddressScrubbingResult',
            'Error=Application Page Address Scrubbing Result|QuoteNumber='.concat(this.quoteNumber), errorData);

          this.clickBack = false;
        });
    }
  }

  saveApplication(qid: any): void {
    let startTime = new Date();

    // Temp code to read the Text phone numbers from Quote Data and log into file DE151005-fix
    const phones: Phone[] =  this.autoQuoteData.autoQuote.contact?.phones || [];
    let txtPhones = '';
    if (phones.length > 0) {
      phones.forEach(phnumber => {
        phnumber.type === 'text' ? txtPhones += phnumber.phoneNumber + ' ' : ''
      });
    }

    this.logTracker.loginfo('ApplicationComponent', 'saveApplication', 'Validating Text Phone Numbers',
        'Text Alert Phonumber Numbers '.concat(txtPhones));


    this.quoteDataService.saveUpdateQuote(this.autoQuoteData, qid, 'rateQuote').subscribe(async (data: any) => {
      await data;


      const pageStatus: PageStatus = { name: 'APPLICATION', status: 1 };
      this.store.dispatch(addPageStatus({ pageStatus }));
      if (!this.stepperRestriction) {
        this.sharedService.updateLastVisitedPage(8);
        this.navigationService.removeRuleOnNext(8);
      }
      // Updating the selected Payplan to Store to use in Review Page
      this.store.dispatch(Actions.payPlan({ payPlan: <PayPlanDetails>this.selectedPayPlan }));
      this.store.dispatch(Actions.policyFees({ policyFees: this.policyPackage[0].policyFees }));
      this.navigationService.removeRuleOnNext(8);
      if (this.performSaveExit) {
        this.showSpinnerService.showSpinner(false);
        this.navigationService.getNextRoutingRule(this.requestedRoute);
        return;
      }
      this.showSpinnerService.showSpinner(false);
      if (this.clickBack) {
        this.router.navigateByUrl('/reports?qid=' + qid);
      } else {
        this.router.navigateByUrl('/review?qid=' + qid);
      }

      this.logTracker.loginfo('ApplicationComponent', 'saveApplication', 'quoteDataService.saveUpdateQuote',
        'QuoteNumber='.concat(this.quoteNumber + '|Duration='.concat(CommonUtils.elapsedTime(startTime).toString())));
    },
      errorData => {
        this.logTracker.logerror('ApplicationComponent', 'saveApplication', 'quoteDataService.saveUpdateQuote',
          'Error=Application Page Save|QuoteNumber='.concat(this.quoteNumber), errorData);

        this.errorHandler(errorData);
      });
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
    dialogRef.afterClosed().subscribe((result: any) => {
      const dialogValue = result;
      if (dialogValue.event) {
        addressComparer.forEach((obj: any, i: number) => {
          const correctedAddress = obj.correctedAddress;
          if (dialogValue.data['addressSelection' + i] !== 'enteredAddress') {
            const vehicleId = this.vehicles.findIndex((z: any) => z.sequenceNumber?.toString() === obj?.id);
            this.vehiclesFormArray()?.controls[vehicleId]?.patchValue({
              address: correctedAddress?.fullStreetAddress,
              city: correctedAddress?.city,
              state: correctedAddress?.state,
              zipcode: correctedAddress?.zipCode
            });
          }
          if (correctedAddress?.zipCode !== obj.enteredAddress?.zipCode) {
            this.recalculateStatus = true;
            this.checkPayMethodChange(this.recalculateStatus);
            this.performSaveExit = false;
          } else {
            this.saveApplication(qid);
          }

        });
      }
    });
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
          this.performSaveExit = true;
          this.nextButton.nativeElement.click();
        }
      },
      error => this.logTracker.logerror('ApplicationComponent', 'navigationObservableWatch', 'navigationStepObv',
        'Vehicle Page navigationObservableWatch Error', error));
  }
}
