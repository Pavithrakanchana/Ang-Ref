import { policyEffectiveDate } from './../../../state/actions/summary.action';
import { Component, ElementRef, EventEmitter, Injectable, Input, OnInit, Output, ViewChild } from '@angular/core';
import { Validators, UntypedFormGroup, UntypedFormArray, UntypedFormBuilder, UntypedFormControl, AbstractControl } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { DeleteDriverDialogComponent } from 'src/app/shared/dialog/delete-driver-dialog/delete-driver-dialog.component';
import { DriverDetails } from 'src/app/shared/model/drivers/add-driver.model';
import { QuoteDataService } from 'src/app/services/quote-data.service';
import QuoteSummary, { Indicators, PageStatus } from 'src/app/state/model/summary.model';
import { Store } from '@ngrx/store';
import { AutoQuoteData, DriverReportStatus } from 'src/app/shared/model/autoquote/autoquote.model';
import { QuoteDataMapper } from 'src/app/shared/utilities/quotedata-mapper';
import { addPageStatus, removeDriver } from 'src/app/state/actions/summary.action';
import * as Actions from '../../../state/actions/summary.action';
import { DatePipe, formatDate } from '@angular/common';
import { SpinnerStatusService } from 'src/app/shared/services/spinner-status.service';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { MessagesService } from 'src/app/shared/services/messages.service';
import { MessageConstants } from 'src/app/constants/message.constant';
import { HelpTextDialogComponent } from 'src/app/shared/dialog/helptext-dialog/helptext-dialog.component';
import { ValidValuesService } from 'src/app/shared/services/validvalues/validvalues.service';
import { GlobalConstants } from 'src/app/constants/global.constant';
import { ValidValuesReq } from 'src/app/shared/model/validvalues/validvaluesreq.model';
import { ValidValuesRes } from 'src/app/shared/model/validvalues/validvaluesres.model';
import { Tracker } from 'src/app/shared/utilities/tracker';
import { CommonUtils } from 'src/app/shared/utilities/common-utils';
import { Subscription } from 'rxjs';
import { NavigationService } from 'src/app/shared/services/navigation.service';
import { HelptextMapper } from 'src/app/shared/utilities/helptext-mapper';
import { ObjectUtils } from 'src/app/shared/utilities/object-utils';
import { SharedService } from 'src/app/services/shared.service';
import { CaseNumberValidator } from 'src/app/shared/validators/casenumber.validator';
@Component({
  selector: 'app-drivers',
  templateUrl: './drivers.component.html',
  styleUrls: ['./drivers.component.scss']
})

@Injectable({
  providedIn: 'root'
})
export class DriversComponent implements OnInit {

  @ViewChild('next', { read: ElementRef }) nextButton!: ElementRef;
  // Emits when a change event is fired on Date Of Birth
  @Output()
  dateChange: EventEmitter<MatDatepickerInputEvent<any>> = new EventEmitter();

  public driversForm!: UntypedFormGroup; // our form model
  public driverList!: UntypedFormArray;
  deletedriverdialog!: MatDialogRef<DeleteDriverDialogComponent>;
  deleteDriver!: boolean;
  public drivers: DriverDetails = new DriverDetails();
  formSubmitAttempt = false;
  public options = ['Option 1', 'Option 2', 'Option 3'];
  alphaCharValidPattern = '^[a-zA-Z]';
  alphaNumValidPattern = '^[A-Za-z0-9 ]+$';
  fistnamePrefill!: string;
  selectedOccupationCd!: string;
  occupationsCds: Array<string> = ['AFF', 'ADM', 'BFR', 'BSO', 'CEM', 'EDL', 'EAS', 'FDH', 'GMI', 'ITE', 'INS', 'LLS', 'MSR', 'PCS', 'PMA', 'RMG', 'SRE', 'TTS'];
  licenseTypes: Array<string> = ['V', 'P', 'I', 'S', 'R'];
  selectedLicenseType!: string;
  selectedFilingType!: string;
  displayCaseNumber: any = [];
  displaySubOccuByDriver: any = [];
  displayLicTypeByDriver: any = [];
  dataModel: any;
  displayRatedSR22Error: any = [];
  displayFDLSR22Error: any = [];
  nameValidPattern = /^[A-Za-z-'\s]*$/;
  showSpinner = false;
  clickBack = false;
  // we will use form builder to simplify our syntax
  autoQuoteData!: AutoQuoteData;
  pageStatus!: number;
  riskState = '';
  mdBasedOnLisType: any = ['CO'];
  dbDriversData!: any;
  displayDistantStudent: any = [];
  ageless23: any = [];
  age55ormore: any = [];
  isMatureDriver: any = [];
  isNotMatureDriver: any = [];
  HasDriverLicenseType: any = false;
  errorMessage = '';
  driverAgeEligibilityErr: any = [];
  isLicenseTypeRevoked: any = [];
  public pnifomrgroup!: UntypedFormGroup;
  isPNIChanged!: boolean;
  qid!: any;
  isDriverNonOwner!: any;
  todayDate = new Date();
  dbApplicantData!: any;
  isAddlDriver!: boolean;
  sourceReportStatus: DriverReportStatus[] = [];
  driverid!: number;
  removeMatureDriver: any = [];
  // @Input is useful when using a form as a reusable component and need to make the editable/read-only decision at the DOM level.
  @Input() isRatedReadOnly: any = [];
  isMVRDOBChanged: any = [];
  minDate = new Date(1900, 0, 1);
  pniDBFirstNm!: string;
  pniDBMiddleNm!: string;
  pniDBLastNm!: string;
  pniDBSuffix!: string;
  pniDBdob!: string;
  dobIndicator: string = 'N';
  nameIndicator: string = 'N';
  navigationObvSubscription!: Subscription;
  requestedRoute = '';
  performSaveExit = false;
  pNIDetails!: any;
  indicators!: Indicators;
  policyEffectiveDate!: string;
  courseDategreater35or36months: any = [];
  ratebook!: string;
  dynamicFields: any;
  matureDriverReq: boolean = false;
  sr22FillingReq: boolean = false;
  fillingReq: boolean = false;
  courseDateReq: boolean = false;
  drvImprovCertDate: boolean = false;
  licenseMoreThenOneYearReq: boolean = false;
  matureDriverEnaDis: boolean = false;
  displayFDLSR22FR44Error: any = [false];
  routeMessageStatus!: string;
  routeMessageObj!: any;
  CaseNumberReq: boolean = false;
  filingTypeFR44: boolean = false;
  filingTypeSR22: boolean = false;
  courseDateOnMature: boolean = false;
  afterDelDriverObj: any
  driverDeleted: boolean = false;
  courseDateDriversCount: number = 0;
  pniMatureSel: boolean = false;
  //courseDategreater35months: any = [];
  constructor(
    private fb: UntypedFormBuilder,
    private dialog: MatDialog,
    private router: Router,
    private showSpinnerService: SpinnerStatusService,
    public quoteDataService: QuoteDataService,
    private readonly messageservice: MessagesService,
    public store: Store<{ quoteSummary: QuoteSummary }>,
    public validValuesService: ValidValuesService,
    public quoteDataMapper: QuoteDataMapper,
    private logTracker: Tracker,
    private navigationService: NavigationService,
    private helpTextMapper: HelptextMapper,
    private sharedService: SharedService
  ) {
    this.store.select('quoteSummary').subscribe(data => {
      this.riskState = data.policyState;
      this.indicators = data.indicators;
      this.policyEffectiveDate = data.policyEffectiveDate;
      this.ratebook = data.rateBook;
      this.routeMessageObj = data?.routingRules?.messages;
    });
  }
  ngOnUpdates() {
  }
  ngOnDestroy(): void {
    this.navigationService.updateNavigationRequestedRoute('');
    this.navigationObvSubscription.unsubscribe();
  }
  ngOnInit(): void {
    let errorArr: string[] = [];
    const urlParams: any = this.sharedService.getURLQueryParameter();
    if (urlParams !== undefined && urlParams?.m !== undefined && urlParams?.m !== GlobalConstants.EMPTY_STRING) {
      const routeMessage = this.routeMessageObj?.filter((obj: any) => obj.routeIndex === urlParams?.m)[0]?.message;
      /* errorArr.push(routeMessage); uncomment if VVT routingRule message need to be displayed for drivers page. */
    }
    this.loadValidValues();

    this.dataModel = Object.create(null);
    // we will initialize our form here
    this.driversForm = this.fb.group({ drivers: this.fb.array([]) });
    this.driverList = this.driversForm.get('drivers') as UntypedFormArray;

    this.store.select('quoteSummary').subscribe(data => {
      const pageStatusArr = data.pageStatus.filter(page => (page.name === 'DRIVERS'));
      this.pageStatus = pageStatusArr.length > 1 ? pageStatusArr[1].status : 0;
      let qid = JSON.stringify(data.qid);
      this.qid = qid.replace(/"/g, '');
      this.pNIDetails = data.pNIDetails;
      this.dynamicFields = data.dynamicDriverValues;
    });
    //this.stateDynamicFields();
    this.showSpinner = true;
    // TO:DO put business logic which UI need to handle
    this.showSpinnerService.showSpinner(true);

    let startTime = new Date();
    this.quoteDataService.retrieveQuote(this.qid, 'getDrivers', this.riskState, this.ratebook).subscribe(async (data: any) => {
      await data;
      const dataString = JSON.stringify(data);
      const obj = JSON.parse(dataString) as AutoQuoteData;
      this.clearFormArray();
      this.loadDrivers(obj);
      this.showSpinnerService.showSpinner(false);
      this.checkIfPNIMaritalStatusChanged();

      //Get the Addtional driver status from Drivers screen
      this.quoteDataService.isAddtionalDriver.asObservable().subscribe((indicator: any) => {
        if (indicator) {
          this.isAddlDriver = true;
          errorArr.push(MessageConstants.ADDL_DRIVER_MESSAGE);
        }
      });
      this.messageservice.softError(errorArr);
      this.logTracker.loginfo('DriversComponent', 'ngOnInit', 'quoteDataService.retrieveQuote',
        'QuoteNumber='.concat(this.qid + '|Duration='.concat(CommonUtils.elapsedTime(startTime).toString())));

    },
      error => {
        this.showSpinnerService.showSpinner(false);
        this.logTracker.logerror('DriversComponent', 'ngOnInit', 'quoteDataService.retrieveQuote',
          'Error=Retrieve Applicant Data|QuoteNumber='.concat(this.qid), error);
      });

    if (this.driversForm.controls['driversList']) {
      this.driversForm.controls['driversList'].get([0, 'firstname'])?.valueChanges.subscribe(value => {
      });
    }
    this.navigationObservableWatch();
    this.stateDynamicFields();
    if (errorArr?.length > 0) { this.messageservice.softError(errorArr); }
  }

  stateDynamicFields() {
    for (let i = 0; i <= this.dynamicFields?.length; i++) {
      if (this.dynamicFields[i]?.key === 'MD' || this.dynamicFields[i]?.key === 'SD'
          || this.dynamicFields[i]?.key === 'DriverImprovement') {
        this.matureDriverReq = true
        this.drvImprovCertDate = this.dynamicFields[i]?.key === 'DriverImprovement' ? true: false;
      } else if (this.dynamicFields[i]?.key === 'SR22') {
        this.sr22FillingReq = true
      }
      else if (this.dynamicFields[i]?.key === 'Filing') {
        this.fillingReq = true
      }
      else if (this.dynamicFields[i]?.key === 'CaseNumber') {
        this.CaseNumberReq = true
      }
      else if (this.dynamicFields[i]?.key === 'CD') {
        this.courseDateReq = true
      }
      else if (this.dynamicFields[i]?.key === 'IsLicensed') {
        this.licenseMoreThenOneYearReq = true;
      }
    }
  }

  licenseMoreThenOneYearEnable(index: any) {
    const licenseType = this.driversFormGroup(index).controls.licenseType.value;
    const rated = this.driversFormGroup(index).controls.rated.value;
    return licenseType == "F" && rated == "R" && this.licenseMoreThenOneYearReq ? true : false;
  }

  matureDriverEnable(index: any) {
    const maturedriver = this.driversFormGroup(index).controls.matureDriver.value;
    if(maturedriver === true) {
      this.courseDateOnMature = true;
    } else {
      this.courseDateOnMature = false;
    }
    if (this.riskState == GlobalConstants.STATE_IL || (this.riskState == GlobalConstants.STATE_CO)
      || (this.riskState == GlobalConstants.STATE_VA && !this.removeMatureDriver[index]))  {
      return (this.age55ormore[index] && this.matureDriverReq) ? true : false;
    } else if (this.riskState === GlobalConstants.STATE_FL || this.riskState == GlobalConstants.STATE_OH) {
      return (this.age55ormore[index] && this.matureDriverReq && !this.isNotMatureDriver[index]) ? true : false;
    } else if(this.riskState == GlobalConstants.STATE_PA && index == 0) {
      return (this.age55ormore[index] && this.matureDriverReq) ? true : false;
    } else if(this.riskState == GlobalConstants.STATE_PA && this.pniMatureSel) {
      return (this.age55ormore[index] && this.matureDriverReq) ? true : false;
    } else {
      return false;
    }
  }

  onPniChangeDisMature() {
    let drivers = this.driversForm?.controls?.drivers?.value;
    if(!this.pniMatureSel) {
      drivers.forEach((driver: any,i: number) => {
        if(driver && i !==0) {
          this.driversFormGroup(i).controls.matureDriver.patchValue(false);
        }
      })
    }
  }

  sr22FillingEnable(index: any) {
    let filingStatus = true;
    // console.log("this.licenceTypeFieldVal ==== " + this.selectedLicenseType);
    // console.log(this.driversFormGroup(index).controls.licenseType.value, "====this.driversFormGroup(index).controls.licenseType.value");
    let licenseType = this.driversFormGroup(index).controls.licenseType.value;
    if (this.driversFormGroup(index).controls.rated.value == 'R' && this.sr22FillingReq) {
      filingStatus = licenseType === "N" || licenseType === "I" ? false : true; //DE135879
    } else {
      this.driversFormGroup(index).controls.filing.setValue(false);
      filingStatus = false;
    }
    return filingStatus;
  }

  //Toggle Display of Filing fields for Florida State
  fillingEnable(index: any) {
    let filingStatus = true;
    // console.log("this.licenceTypeFieldVal ==== "+this.selectedLicenseType);
    // console.log("this.driversFormGroup(index).controls.licenseType ==== "+this.driversFormGroup(index).controls.licenseType.value);
    let licenseType = this.driversFormGroup(index).controls.licenseType.value;
    if (this.driversFormGroup(index).controls.rated.value == 'R' && this.fillingReq) {
      filingStatus = licenseType === "N" || licenseType === "I" ? false : true; //DE135879
    } else {
      filingStatus = false;
    }
    return filingStatus;
  }

  reasonEnable(index: any) {
    if (this.driversFormGroup(index).controls.rated.value == 'N'){
      return true;
    } else {
      // this.driversFormGroup(index).controls.reason.patchValue('');
      return false;
    }
  }

  checkForUndefined(srcReport: any ,objVal: string){
    if(srcReport && srcReport?.objVal != undefined){
      return true
    }else {
      return false
    }
    }

  courseDateEnable(index: any) {
    if (this.isMatureDriver[index] && this.age55ormore[index]
      && (this.courseDateReq || this.drvImprovCertDate)) {
      return true;
    } else {
      return false;
    }
  }

  initDriver(): UntypedFormGroup {
    // initialize our driverdetails
    return this.fb.group(
      {
        firstname: new UntypedFormControl(''),
        middlename: new UntypedFormControl(''),
        lastname: new UntypedFormControl(''),
        dob: new UntypedFormControl(''),
        maritalStatus: new UntypedFormControl(''),
        suffix: new UntypedFormControl(''),
        gender: new UntypedFormControl(''),
        reason: new UntypedFormControl(''),
        licenselessthenoneyear: 'N',
        licenseType: new UntypedFormControl(''),
        filingType: new UntypedFormControl('N'),
        caseNumber: ['', [CaseNumberValidator.casenumberValidator]],
        licensenumber: new UntypedFormControl(''),
        rated: ['R'],
        licensestate: [this.riskState],
        filing: false,
        occupation: '',
        suboccupation: '',
        education: '',
        relationship: new UntypedFormControl(''),
        distantstd: false,
        matureDriver: false,
        courseDate: new UntypedFormControl(''),
        source: 'UserSelected',
        operation: 'Add',
        dbDriverSeqNo: ''
      });
  }

  trimSpace(formControlNameVal: any, index: any) {
    if (this.driversFormGroup(index).controls[formControlNameVal]?.value !== "" && this.driversFormGroup(index).controls[formControlNameVal]?.value !== null) {
      this.driversFormGroup(index).controls[formControlNameVal]?.patchValue(this.driversFormGroup(index).controls[formControlNameVal]?.value.trim());
    }
    // this.driversFormGroup(index).controls[formControlNameVal]?.patchValue(this.driversFormGroup(index).controls[formControlNameVal]?.value.trim());
  }

  public hasError = (controlName: string, errorName: string, index: any) => {
    return this.driversFormGroup(index).controls[controlName].hasError(errorName);
  }

  addDriver(): void {
    this.driverList.push(this.initDriver());
    const index = this.driverList.length - 1;
    this.setDriverFieldsAsRequired(index);
  }

  get driversArrayControl(): AbstractControl[] {
    return (this.driversForm.get('drivers') as UntypedFormArray).controls;
  }

  driversFormGroup(index: any): UntypedFormGroup {
    const itemControls = this.driversForm.controls.drivers as UntypedFormArray;
    return itemControls.controls[index] as UntypedFormGroup;
  }

  removeDriver(i: number): void {
    const dialogRef = this.dialog.open(DeleteDriverDialogComponent, {
      width: '25%',
      panelClass: 'delete-driver-dialog'
    });
    dialogRef.afterClosed().subscribe(result => {
      this.deleteDriver = result;
      if (this.deleteDriver) {
        if (this.driversFormGroup(i).controls.operation.value === 'Add') {
          this.driverList.removeAt(i);
          this.displayFDLSR22FR44Error.splice(i, 1);
        } else {
          this.driverDeleted = true;
          this.removeDriverFieldsAsRequired(i);
          this.driversFormGroup(i).controls.operation.patchValue('delete');
          this.removeDriverObjDel(i, this.driversForm.value.drivers);
          // reorder the driver list again when driver is deleted.
          // this.driversArrayControl.splice(i,1); // Commenting this line as it permanetly deleting from Form object and not passing the Deleted Driver to POINT
        }


        const drvFName = this.driversFormGroup(i)?.controls?.firstname?.value;
        const drvMName = this.driversFormGroup(i)?.controls?.middlename?.value;
        const drvLName = this.driversFormGroup(i)?.controls?.lastname?.value;
        const driverName = drvFName + drvMName + drvLName;

        this.store.dispatch(removeDriver({ driverName }));

        //When user deletes 2nd driver and when PNI details have certain values then launch driver 2
        //  this.checkAndLaunchDriver2(this.driversFormGroup(0).controls.maritalStatus.value);

      }
    });
  }

  removeDriverObjDel(index: any, driversForm: any) {
    this.afterDelDriverObj = driversForm.filter((driver: any) => driver.firstname !== this.driversForm.value.drivers[index].firstname);
  }

  setDriverFieldsAsRequired(index: any): void {
    const firstname = this.driversFormGroup(index).controls.firstname;
    const middlename = this.driversFormGroup(index).controls.middlename;
    const lastname = this.driversFormGroup(index).controls.lastname;
    const dob = this.driversFormGroup(index).controls.dob;
    const maritalStatus = this.driversFormGroup(index).controls.maritalStatus;
    const gender = this.driversFormGroup(index).controls.gender;
    const licenseType = this.driversFormGroup(index).controls.licenseType;
    const licensenumber = this.driversFormGroup(index).controls.licensenumber;
    const relationship = this.driversFormGroup(index).controls.relationship;

    firstname?.setValidators([Validators.required, Validators.pattern(this.nameValidPattern)])
    middlename?.setValidators(Validators.pattern(this.alphaCharValidPattern))
    lastname?.setValidators([Validators.required, Validators.pattern(this.nameValidPattern)])
    dob?.setValidators([Validators.required])
    maritalStatus?.setValidators([Validators.required])
    gender?.setValidators([Validators.required])
    licenseType?.setValidators([Validators.required])
    licensenumber?.setValidators(Validators.pattern(this.alphaNumValidPattern))
    relationship?.setValidators([Validators.required])

    firstname?.updateValueAndValidity();
    middlename?.updateValueAndValidity();
    lastname?.updateValueAndValidity();
    dob?.updateValueAndValidity();
    maritalStatus?.updateValueAndValidity();
    gender?.updateValueAndValidity();
    licenseType?.updateValueAndValidity();
    licensenumber?.updateValueAndValidity();
    relationship?.updateValueAndValidity();

  }

  setCaseNumberValidation(e: any) {
    // console.log(e);
    const id = e.target.id
    const index = id.substring(10, 13);
    const caseNumber = this.driversFormGroup(index).controls.caseNumber;
    caseNumber?.setValidators([Validators.required, CaseNumberValidator.casenumberValidator])
    caseNumber?.updateValueAndValidity()
  }

  removeDriverFieldsAsRequired(index: any): void {
    const firstname = this.driversFormGroup(index).controls.firstname;
    const middlename = this.driversFormGroup(index).controls.middlename;
    const lastname = this.driversFormGroup(index).controls.lastname;
    const dob = this.driversFormGroup(index).controls.dob;
    const maritalStatus = this.driversFormGroup(index).controls.maritalStatus;
    const gender = this.driversFormGroup(index).controls.gender;
    const licenseType = this.driversFormGroup(index).controls.licenseType;
    const licensenumber = this.driversFormGroup(index).controls.licensenumber;
    const relationship = this.driversFormGroup(index).controls.relationship;
    const caseNumber = this.driversFormGroup(index).controls.caseNumber;

    firstname?.setValidators(null)
    middlename?.setValidators(null)
    lastname?.setValidators(null)
    dob?.setValidators(null)
    maritalStatus?.setValidators(null)
    gender?.setValidators(null)
    licenseType?.setValidators(null)
    licensenumber?.setValidators(Validators.pattern(this.alphaNumValidPattern))
    relationship?.setValidators(null)
    caseNumber?.setValidators(null)

    firstname?.updateValueAndValidity();
    middlename?.updateValueAndValidity();
    lastname?.updateValueAndValidity();
    dob?.updateValueAndValidity();
    maritalStatus?.updateValueAndValidity();
    gender?.updateValueAndValidity();
    licenseType?.updateValueAndValidity();
    licensenumber?.updateValueAndValidity();
    relationship?.updateValueAndValidity();
    caseNumber?.updateValueAndValidity();
  }

  // set required validator dynamically for leasedCompany formControl based on radio selection
  setLicenseFieldsAsRequired(): void {
    const licStateControl = this.driversForm.get('licensestate');
    this.driversForm.get('moved')?.valueChanges.subscribe(
      (mode: string) => {
        (mode === 'R') ? (
          licStateControl?.setValidators([Validators.required])
        ) : (
          licStateControl?.setValidators(null)
        );
        licStateControl?.updateValueAndValidity();
      });
  }

  loadDrivers(res: AutoQuoteData): void {
    const numberOfDrivers = res.autoQuote.personalAuto?.drivers?.length;

    res.autoQuote.personalAuto?.drivers?.forEach((driver, index) => {
      this.dbDriversData = res.autoQuote.personalAuto?.drivers;
      const birthDate = new Date(`${driver.birthDate}`);
      const courseDate = new Date(`${driver.matureDrivercourseCompletionDate}`);
      this.dbApplicantData = res.autoQuote.contact?.person;
      this.isDriverNonOwner = this.dbApplicantData.nonOwnerPolicyIndicator;
      let checkSR22Box = driver.discountIndicators.stateFiling.indicators[0].value === 'N' ? false : true;
      //DOB changed indicator from the MVR Report
      this.isMVRDOBChanged[index] = driver?.mvrDateOfBirthChangeIndicator;
      this.addDriver();
      //check when there is only 1 driver & if driver 1 PNI marital status is Married/Domestic Partner then launch driver2
      if (index === 0 && numberOfDrivers === 1) {
        this.checkAndLaunchDriver2(driver.maritalStatus)
      }
      // when source is Report(addtional driver) then make the fields readable only
      const reportStatus = driver.source === 'Report' ? true : false;
      this.pniDBFirstNm = driver.firstName;
      this.pniDBMiddleNm = driver.middleName;
      this.pniDBLastNm = driver.lastName;
      this.pniDBSuffix = driver.suffix;
      this.pniDBdob = driver.birthDate;
      // display course date field mature driver true
      this.isMatureDriver[index] = driver.discountIndicators.matureDriverIndicator;
      this.pniMatureSel = this.riskState === GlobalConstants.STATE_PA ? this.isMatureDriver[0] : false; // PNI
      this.isNotMatureDriver[index] = driver.discountIndicators.disqualifyMatureDriverIndicator;
      this.HasDriverLicenseType = driver.license.licenseType == "" ? true : false;
      this.driverList.controls[index].patchValue(
        {
          firstname: driver.firstName,
          middlename: driver.middleName,
          lastname: driver.lastName,
          dob: birthDate,
          maritalStatus: driver.maritalStatus,
          suffix: driver.suffix,
          gender: driver.gender,
          reason: driver.driverCategoryReasons !== undefined ? driver.driverCategoryReasons[0].value : "",
          licenselessthenoneyear: driver.license.isRecentLicenseHolder == true ? "Y" : "N",
          licenseType: driver.license.licenseType,
          licensenumber: driver.license.licenseNumber,
          licensestate: driver.license.licenseType === 'F' ? GlobalConstants.EMPTY_STRING : driver.license.licenseState, // TODO: (driver.license.licenseState === '' && reportStatus && driver.license.licenseNumber !== '') ? 'V' : driver.license.licenseState,
          rated: driver.driverType,
          filing: checkSR22Box,
          //filing: driver.discountIndicators.sr22FilingIndicator,
          filingType: driver.discountIndicators.stateFiling.indicators[0].value,
          casenumber: driver.discountIndicators.stateFiling.caseNumber,
          occupation: driver.occupationCode,
          suboccupation: driver.subOccupationCode,
          education: driver.education,
          relationship: driver.relationshipToInsured,
          distantstd: driver.discountIndicators.distantStudentIndicator,
          matureDriver: driver.discountIndicators.matureDriverIndicator,
          notMatureDriver: driver.discountIndicators.disqualifyMatureDriverIndicator,
          courseDate: driver.discountIndicators.matureDriverIndicator ? courseDate : '',
          source: driver.source,
          operation: '',
          dbDriverSeqNo: driver.sequenceNumber
        },
      );

      // Fix for Distant student display
      // if (driver.discountIndicators.distantStudentIndicator === true) {
      //   this.ageless23[index] = true;
      // }
      if (this.calculateAge(birthDate) < 23) {
        this.ageless23[index] = true;
      }
      else {
        this.ageless23[index] = false;
        this.driversFormGroup(index).controls.distantstd.patchValue(false);
      }
      if ((this.riskState === GlobalConstants.STATE_OH && this.calculateMatureDriverAge(birthDate, this.policyEffectiveDate) >= 60) ||
        (this.riskState !== GlobalConstants.STATE_OH && this.calculateMatureDriverAge(birthDate, this.policyEffectiveDate) >= 55)) {
        //update the mature driver checkbox to checked when age>=55 yrs
        //set the age>=55 indicator to true
        this.age55ormore[index] = true;
      }
      else {
        this.age55ormore[index] = false;
        this.driversFormGroup(index).controls.matureDriver.patchValue(false);
      }
      // this.ageless23[index] = true;
      this.displayDrivLicense(driver.license.licenseType, index);
      this.displaySubOccupation(driver.occupationCode, index);
      let stateFiling = driver.discountIndicators.stateFiling.indicators[0].value;
      if (stateFiling === "C" || stateFiling === "H") {
        this.displayCaseNumberByFilingType(stateFiling, index)
        this.driversFormGroup(index).controls.caseNumber.patchValue(driver.discountIndicators.stateFiling.caseNumber);
      }

      // when source is Report(addtional driver) then make the fields readable only
      const driverReportStatus: DriverReportStatus = {
        firstName: (reportStatus && driver.firstName !== '') ? true : false,
        lastName: (reportStatus && driver.lastName !== '') ? true : false,
        birthDate: (reportStatus && driver.birthDate !== '') ? true : false,
        licenseNumber: (reportStatus && driver.license.licenseNumber !== '') ? true : false,
        licenseType: (reportStatus && driver.license.licenseType !== '') ? true : false,
        rated: (reportStatus && driver.driverType !== '') ? true : false
      }
      //check when PNI marital status is Married/Domestic Partner then launch driver2
      // this.checkAndLaunchDriver2(driver.maritalStatus);
      this.sourceReportStatus.push(driverReportStatus);
      this.setExplanationAsRequired(index);
    });
  }

  setExplanationAsRequired(driIndx: number) {
    const reasonControl = this.driversFormGroup(driIndx).controls['reason'];
    let status = this.driversFormGroup(driIndx).controls['rated'];

    if (status.value == "N" && this.riskState === GlobalConstants.STATE_VA) {
      reasonControl?.setValidators([Validators.required])
    } else {
      reasonControl?.setValue('');
      reasonControl?.setValidators(null)
    }
    reasonControl?.updateValueAndValidity();
  }

  saveDrivers(formData: any, qid: string, dbData: any, dbApplicantData: any): void {
    this.autoQuoteData = this.quoteDataMapper.mapDriverData(formData, 'Add', dbData, dbApplicantData, this.HasDriverLicenseType);
    // need to uncomment once muel contract deployed into QA TA807794
    let sessiondob = this.indicators.dobIndicator;
    let sessionName = this.indicators.nameIndicator;

    this.nameIndicator = (sessionName === 'Y' && this.nameIndicator === 'N') ? sessionName : this.nameIndicator;
    this.dobIndicator = (sessiondob === 'Y' && this.dobIndicator === 'N') ? 'Y' : this.dobIndicator;

    this.autoQuoteData.autoQuote.underWritingReportsModifiedAttributes = [{
      "code": "applicantDateofBirthChangeIndicator",
      "value": this.dobIndicator
    },
    {
      "code": "applicantNameChangeIndicator",
      "value": this.nameIndicator
    }
    ];

    let startTime = new Date();
    let quoteData = this.autoQuoteData;
    this.getFilingTypeSelected(quoteData);
    this.quoteDataService.saveUpdateQuote(this.autoQuoteData, qid, 'saveQuote').subscribe(async (data: any) => {
      await data;


      const pageStatus: PageStatus = { name: 'DRIVERS', status: 1 };
      this.store.dispatch(addPageStatus({ pageStatus }));
      this.sharedService.updateLastVisitedPage(1);
      this.navigationService.removeRuleOnNext(1);

      //Check if PNI values are changed, then automatically redirect user to Applciant screen
      if (this.isPNIChanged || this.clickBack) {
        this.clickBack = false;
        this.launchApplicant(qid);
      }
      else {
        if (this.performSaveExit) {
          this.showSpinnerService.showSpinner(false);
          this.navigationService.getNextRoutingRule(this.requestedRoute);
          return;
        }
        this.router.navigateByUrl('/violations?qid=' + qid);
        this.showSpinnerService.showSpinner(false);
      }
      this.logTracker.loginfo('DriversComponent', 'saveDrivers', 'quoteDataService.saveUpdateQuote',
        'QuoteNumber='.concat(this.qid + '|Duration='.concat(CommonUtils.elapsedTime(startTime).toString())));
    },
      (errorData: any) => {
        this.logTracker.logerror('DriversComponent', 'saveDrivers', 'quoteDataService.saveUpdateQuote',
          'Error=Drivers Page Save|QuoteNumber='.concat(this.qid), errorData);

        this.errorHandler(errorData);
        this.clickBack = false;
      });
  }

  getFilingTypeSelected(quoteData: any) {
    quoteData.autoQuote.personalAuto.drivers.forEach((driver: any) => {
      driver.discountIndicators.stateFiling.indicators.forEach((filingType: any) => {
        if (filingType.value === 'H') {
          this.filingTypeFR44 = true;
        }
        if (filingType.value === 'C') {
          this.filingTypeSR22 = true;
        }
      })
    })
    this.store.dispatch(Actions.setFilingTypeFR44({ filingTypeFR44: this.filingTypeFR44 }));
    this.store.dispatch(Actions.setFilingTypeSR22({ filingTypeSR22: this.filingTypeSR22 }));
    // console.log("Check for Non FL State getFilingTypeSelected", this.filingTypeFR44, this.filingTypeSR22);
  }

  onSubmit(): void {
    this.messageservice.clearErrors();
    this.formSubmitAttempt = true;
    let hasRatedDriver;

    if (this.driversForm.valid) {
      let driverHardEdits = this.driversMaritalStatusEditCheck(this.driversForm.value.drivers);
      // let sr22fr44HardEdits: any = this.SR22FR44FilingEdits(this.driversForm.value.drivers);
      // const hardEdits: any[] = driverHardEdits.concat(sr22fr44HardEdits);
      const hardEdits: any[] = driverHardEdits;
      hasRatedDriver = this.driversForm.value.drivers?.find((driv: any) => (driv.rated === 'R')) ? true : false;
      if (!hasRatedDriver && this.riskState !== GlobalConstants.STATE_PA) { hardEdits.push(MessageConstants.POLICY_ATLEAST_ONE_DRIVER); }
      if (this.driverDeleted) {
        this.courseDateHardEditCheck(this.afterDelDriverObj);
      } else {
        this.courseDateHardEditCheck(this.driversForm.value.drivers);
      }
      if (ObjectUtils.isObjectEmpty(hardEdits) && !(this.courseDateDriversCount > 0)) {
        let qid = this.qid;
        const obj = JSON.parse(JSON.stringify(this.driverList.value));

        //SR22 filing edit messages
        //Persist Drivers data
        // console.log(JSON.stringify(obj) + "======");
        this.saveDrivers(obj, qid, this.dbDriversData, this.dbApplicantData);
        //sessionStorage.setItem('driverFormData', 'obj');
      } else {
        if (this.courseDateDriversCount > 0) {
          this.courseDateDriversCount = 0;
          this.showSpinnerService.showSpinner(false);
          return;
        }
        this.messageservice.showError(hardEdits);
        const element = document.querySelector('#topcontent');
        element?.scrollIntoView();
      }
    }
    else {
      this.performSaveExit = false;
      const err = this.driversForm.errors;
    }
  }

  // SR22FR44FilingEdits(driverData: any): void {
  //   let sr22fr44HardEdits: any = [];
  //   driverData.forEach((data: any, index: number) => {
  //     if (data.licenseType === 'F' && data.filingType !== 'N') {
  //       this.displayFDLSR22FR44Error[index] = true;
  //       return;
  //     } else {
  //       this.displayFDLSR22FR44Error[index] = false;
  //     }
  //   });
  //   if (this.displayFDLSR22FR44Error.includes(true)) {
  //     sr22fr44HardEdits.push(MessageConstants.SR22_FR44_FDL_NOT_ACCEPTED);
  //   } else {
  //     sr22fr44HardEdits = [];
  //     this.messageservice.clearErrors();
  //   }
  //   return sr22fr44HardEdits;
  // }

  /*Course Date Hard Edits check*/
  courseDateHardEditCheck(driverDetails: any) {
    let driverHardEdits: string[] = [];
    driverDetails.forEach((val: any, index: number) => {
      if (val?.matureDriver) {
        this.calculateCourseDate(index);
        if (this.courseDategreater35or36months[index]) {
          this.courseDateDriversCount++;
          driverHardEdits.push(
              val.firstname +
              (this.riskState === GlobalConstants.STATE_PA
                ? MessageConstants.COURSE_DATE_GREATER_MONTHS_EDIT_PA
                : MessageConstants.COURSE_DATE_GREATER_MONTHS_EDIT.replace('{0}',(this.riskState === GlobalConstants.STATE_VA ? 'Senior' : 'Mature')).replace('{1}', (this.riskState === GlobalConstants.STATE_OH ? '35' : '36'))));
          this.messageservice.showError(driverHardEdits);
          const element = document.querySelector('#topcontent');
          element?.scrollIntoView();
        }
      }
    });
  }
  /* drivers married / DomesticPartner Edit Checl */
  driversMaritalStatusEditCheck(driverDetails: any) {
    let nonOwnerDriversCount = 0, driverHardEdits: string[] = [], marital_marriedDriversCount = 0, marital_domesticPartnerDriversCount = 0,
      relation_spouseDriversCount = 0, relation_domesticPartnerDriversCount = 0, otherDrivers_marital_relationship_count = 0, otherDrivers_domestic_relationship_count = 0;
    driverDetails.forEach((val: any, index: number) => {
      if (!this.isDriverNonOwner) {
        // if (val?.matureDriver && this.courseDategreater36months[index]) {
        //   driverHardEdits.push(val.firstname + ': Mature Driver Course Date is more than 36 months prior to the Policy Effective Date.');
        // }
        marital_marriedDriversCount = (val?.operation === '' || val?.operation === 'Add') && val.maritalStatus === 'M' ? ++marital_marriedDriversCount : marital_marriedDriversCount;
        marital_domesticPartnerDriversCount = (val?.operation === '' || val?.operation === 'Add') && val.maritalStatus === 'P' ? ++marital_domesticPartnerDriversCount : marital_domesticPartnerDriversCount;
        relation_spouseDriversCount = (val?.operation === '' || val?.operation === 'Add') && index != 0 && val.relationship === 'S' ? ++relation_spouseDriversCount : relation_spouseDriversCount;
        relation_domesticPartnerDriversCount = (val?.operation === '' || val?.operation === 'Add') && index != 0 && val.relationship === 'D' ? ++relation_domesticPartnerDriversCount : relation_domesticPartnerDriversCount;
        if (val?.operation === '' || val?.operation === 'Add') { // Consider existing or newly added drivers
          if (index != 0) { // Logic for other drivers except PNI
            if (val.maritalStatus === 'S') { //DRIVER maritalStatus = single
              if (val.relationship === 'S') { // But relationship to PNI is Spouse
                driverHardEdits.push(val.firstname + ': ' + MessageConstants.MARRIED_DRIVERS_EDIT_MSG);
              } else if (val.relationship === 'D') { //  But relationship to PNI is Domestic Partner
                driverHardEdits.push(val.firstname + ': ' + MessageConstants.DOMESTIC_DRIVERS_EDIT_MSG);
              }
            }
            otherDrivers_marital_relationship_count = (val.maritalStatus === 'M' && val.relationship !== 'S') ? ++otherDrivers_marital_relationship_count : otherDrivers_marital_relationship_count;
            otherDrivers_domestic_relationship_count = (val.maritalStatus === 'P' && val.relationship !== 'D') ? ++otherDrivers_domestic_relationship_count : otherDrivers_domestic_relationship_count;
          }
        }
      } else {
        nonOwnerDriversCount = (val?.operation === '' || val?.operation === 'Add') && index !== 0 ? ++nonOwnerDriversCount : nonOwnerDriversCount;
      }
    });
    //NoNOwner drivers count check for hard edit
    if (nonOwnerDriversCount > 0) {
      driverHardEdits.push(this.riskState === GlobalConstants.STATE_CO ? MessageConstants.DRIVER_BROAD_FORM : MessageConstants.DRIVER_NAMED_NNO);
    }
    /*--- If there are odd no. of married/DomesticPartners - Fire edit (starts) ---*/
    if (marital_marriedDriversCount != 0 && (marital_marriedDriversCount % 2 != 0)) { //when dirvers are odd with married status
      driverHardEdits.push(MessageConstants.EVEN_MARRIED_DRIVERS_EDIT_MSG);
    } else if (marital_domesticPartnerDriversCount != 0 && (marital_domesticPartnerDriversCount % 2 != 0)) { //when dirvers are odd with domesticPartner status
      driverHardEdits.push(MessageConstants.EVEN_DOMESTIC_DRIVERS_EDIT_MSG);
    } else if (this.driversFormGroup(0).controls?.maritalStatus.value === 'M' && otherDrivers_marital_relationship_count % 2 != 0) {
      driverHardEdits.push(MessageConstants.EVEN_MARRIED_DRIVERS_EDIT_MSG);
    } else if (this.driversFormGroup(0).controls?.maritalStatus.value === 'P' && otherDrivers_domestic_relationship_count % 2 != 0) {
      driverHardEdits.push(MessageConstants.EVEN_DOMESTIC_DRIVERS_EDIT_MSG);
    }
    /*--- If there are odd no. of married/DomesticPartners - Fire edit (end) ---*/
    /*--- PNI Marital Status Edits Logic (start) ---*/
    if (this.driversFormGroup(0).controls?.maritalStatus.value === 'M' && relation_spouseDriversCount > 1) {
      driverHardEdits.push(MessageConstants.PNI_MULTI_SPOUSE_EDIT_MSG);
    } else if (this.driversFormGroup(0).controls?.maritalStatus.value === 'P') { //Domestic Partner
      if (relation_spouseDriversCount > 0) {
        driverHardEdits.push(MessageConstants.DOMESTIC_CANNOT_BE_SPOUSE_EDIT_MSG);
      } else if (relation_domesticPartnerDriversCount > 1) {
        driverHardEdits.push(MessageConstants.PNI_MULTI_DOMESTIC_PARTNER_EDIT_MSG);
      }
    } else if (this.driversFormGroup(0).controls?.maritalStatus.value === 'S') { // Single
      if (relation_domesticPartnerDriversCount > 0) {
        driverHardEdits.push(MessageConstants.SINGLE_PNI_WITH_DOMESTIC_PARTNER_EDIT_MSG);
      } else if (relation_spouseDriversCount > 0) {
        driverHardEdits.push(MessageConstants.SINGLE_PNI_WITH_SPOUSE_EDIT_MSG);
      }
    }
    /*--- PNI Marital Status Edits Logic (end) ---*/
    return driverHardEdits;
  }
  /* drivers age calculation*/
  driversAgeEligibilityCheck(driversList: any) {
    this.driverAgeEligibilityErr = [];
    driversList.forEach((driverdata: any, index: number) => {
      const formbirthdate = driverdata.dob;
      const formattedDate = formatDate(formbirthdate, 'MM-dd-yyyy', 'en-US');
      var birthDate = new Date(formattedDate);
      var today = new Date();
      var Time = today.getTime() - birthDate.getTime();
      var Days = Time / (1000 * 3600 * 24);
      if (index == 0) {
        const eligiblity = ((Math.round(Days)) / 365) >= 16 ? true : false;

        if (!eligiblity) {
          this.driverAgeEligibilityErr.push(MessageConstants.PNI_LESS_THAN_16YRS);
        }
      } else {
        const eligiblity = ((Math.round(Days)) / 365) >= 15 ? true : false;

        if (!eligiblity) {
          this.driverAgeEligibilityErr.push('Driver ' + (index + 1) + ' - ' + MessageConstants.DRIVERS_LESS_THAN_15YRS);
        }
      }
    });
    return (this.driverAgeEligibilityErr.length >= 1 ? false : true);
  }

  displaySubOccupation(val: any, index: any): void {
    this.selectedOccupationCd = val.value || val;
    if (this.occupationsCds.includes(this.selectedOccupationCd)) {
      this.displaySubOccuByDriver[index] = true;
    } else {
      this.displaySubOccuByDriver[index] = false;
    }
  }

  //States with MatureDriver Enable/Disable based on LicenseType
  matureDriverBasedOnLisType(index: number) {
    if (this.mdBasedOnLisType.includes(this.riskState)) {
      if (this.selectedLicenseType === 'I' || this.selectedLicenseType === 'N') {
        this.removeMatureDriver[index] = true;
        this.driversFormGroup(index).controls.matureDriver.setValue(false);
        this.driversFormGroup(index).controls.courseDate.setValue('');
        this.matureDriverEnable(index);
      } else {
        this.matureDriverEnable(index);
        this.removeMatureDriver[index] = false;
      }
    }
  }

  displayDrivLicense(val: any, index: any): void {
    this.selectedLicenseType = val.value || val;
    this.matureDriverBasedOnLisType(index);
    if (this.selectedLicenseType === 'R') {
      this.isLicenseTypeRevoked[index] = true;
      if (index != 0 || this.hasExcludedOption(index)) {
        this.riskState == GlobalConstants.STATE_VA ? this.driversFormGroup(index).controls.rated.patchValue('N') : this.driversFormGroup(index).controls.rated.patchValue('E');
        this.driversFormGroup(index).controls.filingType.patchValue('N');
        this.displayCaseNumberByFilingType('', index);
      } else if (index == 0) { //default back the Rated option to 'Rated' for PNI Driver
        this.driversFormGroup(index).controls.rated.patchValue('R');
      }
    }
    else {
      this.isRatedReadOnly[index] = false;
      this.isLicenseTypeRevoked[index] = false;
    }

    if (this.selectedLicenseType === 'F') {

      this.displayFDLSR22FR44Error[index] = true;
    } else {
      this.displayFDLSR22FR44Error[index] = false;
      this.messageservice.clearErrors();
      this.driversFormGroup(index).controls.licenselessthenoneyear.patchValue("N");
    }

    if (this.licenseTypes.includes(this.selectedLicenseType)) {
      let stateVal = this.driversFormGroup(index)?.controls?.licensestate?.value;
      stateVal = (stateVal === 'IT' || stateVal === '') ? this.riskState : stateVal;
      this.driversFormGroup(index).controls.licensestate.patchValue(stateVal);
      this.displayLicTypeByDriver[index] = true;
      this.driversFormGroup(index).controls.licensestate.setValidators([Validators.required]);
    } else {
      this.driversFormGroup(index).controls.licensenumber.patchValue('');
      this.displayLicTypeByDriver[index] = false;
      this.driversFormGroup(index).controls.licensestate.setValidators(null);
    }

    this.driversFormGroup(index).controls.licensestate.updateValueAndValidity();

    //US506914 - Drivers Page : License Type vs. Filing/SR22 Options
    if (this.selectedLicenseType === 'N' || this.selectedLicenseType === 'I') {
      this.driversFormGroup(index).controls.filingType.patchValue('N');
      this.driversFormGroup(index).controls.filing.patchValue(false);
      this.driversFormGroup(index).controls.caseNumber.patchValue('');
      this.displayCaseNumberByFilingType(this.driversFormGroup(index).controls.filingType.value, index);
      this.fillingEnable(index);
      this.sr22FillingEnable(index);
    }
    this.setExplanationAsRequired(index)

  }

  displayCaseNumberByFilingType(val: any, index: any): void {

    this.selectedFilingType = val?.value || val;

    if (this.driversFormGroup(index).controls.licenseType.value !== "R") {
      if (this.CaseNumberReq && (this.selectedFilingType === 'C' || this.selectedFilingType === 'H')) {
        this.displayCaseNumber[index] = true;
        this.driversFormGroup(index).controls.caseNumber.setValidators([Validators.required, CaseNumberValidator.casenumberValidator]);
      }
      else {
        this.displayCaseNumber[index] = false;
        this.driversFormGroup(index).controls.caseNumber.setValidators(null);
      }
    } else {
      this.displayCaseNumber[index] = false;
      this.driversFormGroup(index).controls.caseNumber.setValidators(null);
    }
    this.driversFormGroup(index).controls.caseNumber.patchValue('');
    this.driversFormGroup(index).controls.caseNumber.updateValueAndValidity();
  }

  initialDriverPatchValues(): void {
    const data = {
      drivers: [{
        firstname: '',
        middlename: '',
        lastname: '',
        dob: '',
        maritalStatus: '',
        suffix: '',
        gender: '',
        reason: '',
        licenselessthenoneyear: 'N',
        licenseType: '',
        licensenumber: '',
        rated: 'R',
        licensestate: '',
        filing: false,
        filingType: 'N',
        casenumber: '',
        occupation: '',
        suboccupation: '',
        education: '',
        relationship: 'I',
        distantstd: false,
        matureDriver: false,
        courseDate: '',
        operation: 'Add'
      }]
    };
    this.clearFormArray();
    this.addDriver();
    this.driversForm.patchValue(data);
  }

  clearFormArray(): void {
    this.driverList.clear();
  }

  onFilingOrRatedOrLicTypChange(index: any): void {
    if (this.driversFormGroup(index).controls.filing.value && this.sr22FillingEnable(index)) {

      //When license type is 'Foregin Drivers License (FDL)' & SR22 is checked then display Edit message
      if (this.driversFormGroup(index).controls.licenseType.value === 'F') {
        this.displayFDLSR22Error[index] = true;
        const errorArr = [];
        errorArr.push(MessageConstants.SR22_FDL_NOT_ACCEPTED);
        this.messageservice.showError(errorArr);
        return;
      } else {
        this.displayFDLSR22Error[index] = false;
        this.messageservice.clearErrors();
      }
      //When Excluded & SR22 is checked then display Edit message
      if (this.driversFormGroup(index).controls.rated.value !== 'R') {
        const errorArr = [];
        errorArr.push(MessageConstants.SR22_NEEDS_DRIVER_RATED);
        this.messageservice.showError(errorArr);
        return;
      } else {
        this.messageservice.clearErrors();
      }
    } else {
      this.messageservice.clearErrors();
      this.displayRatedSR22Error[index] = false;
      this.displayFDLSR22Error[index] = false;
    }

    ////  Update licenselessthenoneyear when user update non-rated to rated for VA
    if (this.driversFormGroup(index).controls.rated.value == 'E'){
      this.driversFormGroup(index).controls.licenselessthenoneyear.patchValue('N');
    }

    //// When license type is 'Permanently Revoked License' then default to Excluded
    const val = this.driversFormGroup(index).controls.licenseType.value
    if (this.driversFormGroup(index).controls.licenseType.value === 'R') {
      this.isLicenseTypeRevoked[index] = true;
    }
    else {
      this.isLicenseTypeRevoked[index] = false;
    }
    this.driversFormGroup(index).controls.filingType.patchValue('N');
    this.driversFormGroup(index).controls.caseNumber.patchValue('');
    this.displayCaseNumberByFilingType('', index);
    this.setExplanationAsRequired(index)
  }

  onDOBChange(driverindex: any): void {
    this.courseDateOnMature = false;
    const datePipe = new DatePipe('en-US');
    this.dateChange.emit();
    var dob = this.driversFormGroup(driverindex).controls.dob.value;
    var pnidob = this.driversFormGroup(0).controls.dob.value;
    var dobForm = datePipe.transform(
      new Date(pnidob), 'MM/dd/yyyy') ?? Date.now().toString();
    if (driverindex == 0 && (this.pniDBdob != dobForm)) { //first driver & if user has changed DOB value
      this.dobIndicator = 'Y';
      const indicators: Indicators = {
        dobIndicator: this.dobIndicator
      }
      this.store.dispatch(Actions.indicators({ indicators }));
      this.quoteDataService.isPNIDetailsChanged.next(true);
      this.isPNIChanged = true;
    }
    else {
      this.isPNIChanged = false;
    }
    if (this.calculateAge(dob) < 23) {
      //update the distant student checkbox to checked when age<23 yrs
      //set the age<23 indicator to true
      this.ageless23[driverindex] = true;
    }
    else {
      this.ageless23[driverindex] = false;
      this.driversFormGroup(driverindex).controls.distantstd.patchValue(false);
    }
    if ((this.riskState === GlobalConstants.STATE_OH && this.calculateMatureDriverAge(dob, this.policyEffectiveDate) >= 60) ||
      (this.riskState !== GlobalConstants.STATE_OH && this.calculateMatureDriverAge(dob, this.policyEffectiveDate) >= 55)) {
      //update the mature driver checkbox to checked when age>=55 yrs
      //set the age>=55 indicator to true
      this.age55ormore[driverindex] = true;
    }
    else {
      this.age55ormore[driverindex] = false;
      this.driversFormGroup(driverindex).controls.matureDriver.patchValue(false);
      this.driversFormGroup(driverindex).controls.courseDate.patchValue('');
      this.courseDategreater35or36months[driverindex] = false;
      if (this.riskState === GlobalConstants.STATE_PA && driverindex === 0) {
        this.pniMatureSel = false;
        this.onPniChangeDisMature();
      }
      CommonUtils.updateControlValidation(this.driversFormGroup(driverindex).controls?.courseDate, false);
    }
  }

  calculateAge(dob: any) {
    var today = new Date();
    var birthDate = new Date(dob);
    var age = today.getFullYear() - birthDate.getFullYear();
    var m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }

  calculateMatureDriverAge(dob: any, policyEffectiveDate: any) {
    let effDate = new Date(policyEffectiveDate);
    let birthDate = new Date(dob);
    let age = effDate.getFullYear() - birthDate.getFullYear();
    let m = effDate.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && effDate.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }

  calculateCourseDate(driverindex: any) {
    const cd = this.driversFormGroup(driverindex).controls?.courseDate?.value;
    const maturedriver = this.driversFormGroup(driverindex).controls.matureDriver.value;
    if ((cd === '' || cd === null || cd === undefined) && maturedriver) {
      CommonUtils.updateControlValidation(this.driversFormGroup(driverindex).controls?.courseDate, true);
    }
    var pDate = new Date(this.policyEffectiveDate);
    var courseDate = new Date(this.driversFormGroup(driverindex).controls.courseDate.value);
    var d1Y = pDate.getFullYear();
    var d2Y = courseDate.getFullYear();
    var d1M = pDate.getMonth();
    var d2M = courseDate.getMonth();
    var d1D = pDate.getDate();
    var d2D = courseDate.getDate();

    let monthDiff = (d1M + 12 * d1Y) - (d2M + 12 * d2Y);
    if (this.riskState === GlobalConstants.STATE_OH) {
      if (monthDiff > 35) {
        this.courseDategreater35or36months[driverindex] = true;
      } else if (monthDiff == 35) {
        this.courseDategreater35or36months[driverindex] = (d2D < d1D) ? true : false;
      } else {
        this.courseDategreater35or36months[driverindex] = false;
      }
    }
    else {
      if (monthDiff > 36) {
        this.courseDategreater35or36months[driverindex] = true;
      } else if (monthDiff == 36) {
        this.courseDategreater35or36months[driverindex] = (d2D < d1D) ? true : false;
      } else {
        this.courseDategreater35or36months[driverindex] = false;
      }
    }
    //this.courseDategreater36months[driverindex] =  (d1M + 12 * d1Y) - (d2M + 12 * d2Y)  > 36 ? true : false;
  }

  onPNIchange(event: any, driverindex: any) {
    var pnifirstnm = this.driversFormGroup(0).controls.firstname.value.trim();
    var pnilastnm = this.driversFormGroup(0).controls.lastname.value.trim();
    var pnisuffix = this.driversFormGroup(0).controls.suffix.value;

    // Check for the first driver only & whether firstname,lastname ,Suffix is changed for PNI
    if (driverindex === 0 && (this.pniDBFirstNm != pnifirstnm ||
      this.pniDBLastNm != pnilastnm || this.pniDBSuffix != pnisuffix)) {
      this.quoteDataService.isPNIDetailsChanged.next(true);
      this.isPNIChanged = true;
      this.nameIndicator = 'Y';
      const indicators: Indicators = {
        nameIndicator: this.nameIndicator
      }
      this.store.dispatch(Actions.indicators({ indicators }));
      this.navigationService.addRequiredRoutes(this.navigationService.actionBasedRoutes('DriverPNI'));
    }
    else {
      this.isPNIChanged = false;
    }
  }

  checkAndLaunchDriver2(drv1MaritalStatus: string): void {
    if (!this.isDriverNonOwner) { // When Driver1 is a Non-owner then do not set the MAital & relationship automatically.
      if (this.driverList.length === 1 && (drv1MaritalStatus === 'P' || drv1MaritalStatus === 'M')) {
        //add 2nd driver
        this.addDriver();
        this.defaultDriver2values(drv1MaritalStatus);
      }
      if (this.driverList.length === 2) { // if driver1 and driver2 are there
        this.defaultDriver2values(drv1MaritalStatus);
      }
    }
  }

  defaultDriver2values(drv1MaritalStatus: any): void { // Defaults the driver2's  marital status & relationship
    if (drv1MaritalStatus === 'M') { //Married
      this.driversFormGroup(1).controls.relationship.patchValue('S');
      this.driversFormGroup(1).controls.maritalStatus.patchValue('M');
    }
    if (drv1MaritalStatus === 'P') { //Domestic Partener
      this.driversFormGroup(1).controls.relationship.patchValue('D');
      this.driversFormGroup(1).controls.maritalStatus.patchValue('P');
    }
    if (drv1MaritalStatus === 'S') { //Single
      this.driversFormGroup(1).controls.relationship.patchValue('');
      this.driversFormGroup(1).controls.maritalStatus.patchValue('');
    }
  }

  onClickBack(): void {
    this.clickBack = true;
    this.onSubmit();
  }

  launchApplicant(quoteId: string): void {
    this.router.navigateByUrl('/applicant?qid=' + quoteId);
    this.showSpinnerService.showSpinner(false);
  }

  checkIfPNIMaritalStatusChanged(): void {
    //If PNI's Marital status value changed
    this.driversFormGroup(0)?.controls?.maritalStatus?.valueChanges.subscribe((val) => {
      this.checkAndLaunchDriver2(val);
    });
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

  sr22FillingCheckboxChange(driverindex: any): void {
    const filingCheckbox = this.driversFormGroup(driverindex).controls.filing.value;
    if (filingCheckbox === false) {
      this.driversFormGroup(driverindex).controls.filingType.patchValue('N');
    }
  }

  private loadValidValues(): void {
    const validvaluesreq: ValidValuesReq = {
      appName: GlobalConstants.APP_NAME,
      pageName: GlobalConstants.DRIVER_PAGE_NAME,
      mco: GlobalConstants.MCO_ALL_VALID_VALUES,
      ratebook: this.ratebook,
      state: this.riskState,
      dropdownName: GlobalConstants.DROPDOWN_ALL_VALID_VALUES,
      filter: ''
    }

    let startTime = new Date();
    this.validValuesService.getValidValues(validvaluesreq).subscribe(async (data: ValidValuesRes) => {
      this.drivers.suffixValues = data.responseMap.suffix;
      this.drivers.reasonValues = data.responseMap.nonratedreason;
      this.drivers.maritalStatusValues = data.responseMap.maritalstatus;
      this.drivers.genderValues = data.responseMap.gender;
      this.drivers.relationValues = data.responseMap.relationship;
      this.drivers.licenseTypeValues = data.responseMap.licensetype;
      this.drivers.licenseStateValues = data.responseMap.states;
      this.drivers.ratedValues = data.responseMap.driverrated;
      this.drivers.filingValues = data.responseMap.filing;

      this.logTracker.loginfo('DriversComponent', 'loadValidValues', 'validValuesService.getValidValues',
        'QuoteNumber='.concat(this.qid + '|Duration='.concat(CommonUtils.elapsedTime(startTime).toString())));
    },
      (error: any) => {
        this.showSpinnerService.showSpinner(false);
        this.logTracker.logerror('DriversComponent', 'loadValidValues', 'validValuesService.getValidValues',
          'Error= Load Valid Values', error);
      }
    );
  }


  onmatureDriverChange(driverindex: any): void {
    const maturedriver = this.driversFormGroup(driverindex).controls.matureDriver.value;
    if(driverindex == 0 && this.riskState == GlobalConstants.STATE_PA) {
     this.pniMatureSel = maturedriver ? true : false;
     this.onPniChangeDisMature();
    }
    let CD = this.driversFormGroup(driverindex).controls.courseDate;
    if (maturedriver === true) {
      this.courseDateOnMature = true;
      this.isMatureDriver[driverindex] = true;
      // CD?.setValidators([Validators.required]);
      CommonUtils.updateControlValidation(this.driversFormGroup(driverindex).controls?.courseDate, true);
    }
    else {
      this.isMatureDriver[driverindex] = false;
      // CD?.setValidators(null);
      CommonUtils.updateControlValidation(this.driversFormGroup(driverindex).controls?.courseDate, false);
    }
    this.driversFormGroup(driverindex).controls.matureDriver.updateValueAndValidity();
  }

  /* API error handling*/
  errorHandler(errorData: any) {
    const errorArr: any = [];
    errorData?.error.transactionNotification?.remark?.forEach((val: any) => {
      if (val.messageType === 'Hard Edit') {
        errorArr.push(val.messageText);
      }

    });
    this.messageservice.showError(errorArr);
    const element = document.querySelector('#topcontent');
    element?.scrollIntoView();
    this.showSpinnerService.showSpinner(false);
  }

  navigationObservableWatch(): void {

    this.navigationObvSubscription = this.navigationService.navigationStepObv.subscribe(
      nextRoute => {

        if (nextRoute.startsWith('save-')) {
          this.requestedRoute = nextRoute.split('-')[1].trim();
          // simulate form submit
          this.performSaveExit = true;
          this.nextButton.nativeElement.click();
        }
      },
      error => this.logTracker.logerror('DriversComponent', 'navigationObservableWatch', 'navigationStepObv',
        'Drivers Page navigationObservableWatch Error', error));
  }

  hasExcludedOption(driverIndex: any) {
    return (driverIndex == 0 && (GlobalConstants.PNI_EXCLUDE_STATES.includes(this.riskState)));
  }
}
