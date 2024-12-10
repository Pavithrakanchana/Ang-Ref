import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import {UntypedFormArray, FormArrayName, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { forkJoin, Observable, of, Subscription } from 'rxjs';
import { GlobalConstants } from 'src/app/constants/global.constant';
import { QuoteDataService } from 'src/app/services/quote-data.service';
import { AutoQuoteData, Coverage, Driver, PersonalAuto, Vehicle } from 'src/app/shared/model/autoquote/autoquote.model';
import { CoveragesModel } from 'src/app/shared/model/coverages/coverages.model';
import { PriorCarriersReq } from 'src/app/shared/model/coverages/priorcarriersreq.model';
import { ValidValuesReq } from 'src/app/shared/model/validvalues/validvaluesreq.model';
import { ValidValuesRes } from 'src/app/shared/model/validvalues/validvaluesres.model';
import { MessagesService } from 'src/app/shared/services/messages.service';
import { SpinnerStatusService } from 'src/app/shared/services/spinner-status.service';
import { ValidValuesService } from 'src/app/shared/services/validvalues/validvalues.service';
import { QuoteDataMapper } from 'src/app/shared/utilities/quotedata-mapper';
import { addPageStatus } from 'src/app/state/actions/summary.action';
import QuoteSummary, { PageStatus } from 'src/app/state/model/summary.model';
import { SharedService } from 'src/app/services/shared.service';
import { IDropDownItem } from '../../../shared/model/IDropDownItem';
import { ValidValues } from '../../../shared/model/validvalues/validvaluesres.model';
import { map, startWith } from 'rxjs/operators';
import { PolicyCoverageValidValues } from './coverage-validvalues/policycoverage-validvalues.component';
import { ssnPipe } from 'src/app/shared/pipes/ssn.pipe';
import { CommonUtils } from 'src/app/shared/utilities/common-utils';
import { MessageConstants } from 'src/app/constants/message.constant';
import { ObjectUtils } from 'src/app/shared/utilities/object-utils';
import { PropCreditService } from 'src/app/services/propcredit.service';
import { CreditReport } from 'src/app/shared/model/propcredit/creditreportres.model';
import { Tracker } from 'src/app/shared/utilities/tracker';
import { NavigationService } from 'src/app/shared/services/navigation.service';
import { HelptextMapper } from 'src/app/shared/utilities/helptext-mapper';
import { HelpTextDialogComponent } from 'src/app/shared/dialog/helptext-dialog/helptext-dialog.component';
import * as Actions from '../../../state/actions/summary.action';
import { DriversComponent } from '../drivers/drivers.component';

@Component({
  selector: 'app-coverages',
  templateUrl: './coverages.component.html',
  styleUrls: ['./coverages.component.scss']
})

export class CoveragesComponent implements OnInit, OnDestroy {
  @ViewChild('next', { read: ElementRef }) nextButton!: ElementRef;
  public coveragesForm!: UntypedFormGroup;
  public priorCarrierValues!: IDropDownItem<string, string>[];
  public selectedAutoInsurance = 'Y';
  pdSubscription!: Subscription;
  formSubmitAttempt!: boolean;
  autoQuoteData!: AutoQuoteData;
  riskState = '';
  qid!: any;
  pageStatus!: number;
  quoteNumber!: any;
  mco!: any;
  applicantNonOwner!: any;
  rideShareIndicator!: any;
  clickBack = false;
  filteredPriorCarrier: Observable<ValidValues[]> | undefined;
  priorCarriers: any = [];
  priorCarriersDB: any = [];
  coverageDBData!: any;
  prevInsuranceInfoBlockStatus: any = {
    autoInsurance: false,
    priorCarrier: false,
    policyLimit: false,
    expiryDate: false
  }
  hasSelectedPOPBlock = false;
  errorMessage = '';
  creditStatus = '';
  creditStatusMsg = '';
  layout = GlobalConstants.LAYOUT_HORIZONTAL;
  policyState: string = '';
  highestStateBILimit: string = '';
  highestStatePDLimit: string = '';
  policyCoverages!: Coverage[];
  coveragesObject: CoveragesModel = new CoveragesModel();
  @ViewChild(PolicyCoverageValidValues, { static: true }) child!: PolicyCoverageValidValues;
  navigationObvSubscription!: Subscription;
  requestedRoute = '';
  performSaveExit = false;
  policyEffectiveDate: any;
  savedPriorCarrierName: string = '';
  savedPriorCarrierSource: string = '';
  checkPNI = false;
  ratebook!: string;
  routeMessageObj!: any;
  umpdDBStoredValue!: any;
  umbiDBStoredValue!: any;
  selPriorInsuIndicator!: any;
  changeCount = 0;
  prevPriorCarrier = '';
  prevPriorPolicyLmt = '';
  prevPriorPolicyExpDate = '';
  violations: any;
  defaultSelectVehicle = false;
  duiIndicator: boolean | undefined = false;
  within35MonthsIndi: boolean = false;
  filingTypeFR44: boolean | undefined = false;
  filingTypeSR22: boolean | undefined = false;
  dob = '';
  diffInDays: any;
  prePriorInfoValues: any =  [];
  isNotRequiredBylawDisplayDropDown: boolean = false;
  isNotRequiredDisplayPrimaryVehicleSelection: boolean = false;
  driversData: Driver[] = [];
  vehicleData: Vehicle[] =[];
  constructor(private dialog: MatDialog,
    private formBuilder: UntypedFormBuilder,
    private showSpinnerService: SpinnerStatusService,
    public quoteDataService: QuoteDataService,
    private router: Router,
    private store: Store<{ quoteSummary: QuoteSummary }>,
    public quoteDataMapper: QuoteDataMapper,
    private readonly messageservice: MessagesService,
    public validValuesService: ValidValuesService,
    public sharedService: SharedService,
    public propCreditService: PropCreditService,
    private logTracker: Tracker,
    private navigationService: NavigationService,
    private helpTextMapper: HelptextMapper,
    private ageCalcService: DriversComponent
  ) {
    this.store.select('quoteSummary').subscribe(data => {
      this.applicantNonOwner = data.nonOwner;
      this.riskState = data.policyState;
      this.rideShareIndicator = data.rideShare;
      this.quoteNumber = data.qid;
      this.mco = data.mco;
      this.ratebook = data.rateBook;
      const pageStatusArr = data.pageStatus.filter(page => (page.name === 'COVERAGES'));
      this.pageStatus = pageStatusArr.length > 0 ? pageStatusArr[0].status : 0;
      this.policyState = data.policyState;
      this.policyEffectiveDate = data.policyEffectiveDate;
      this.routeMessageObj = data?.routingRules?.messages;
      //this.violations = data.violationCodes;
      this.dob = data.pNIDetails.dateOfBirth;
      this.filingTypeFR44 = data.filingTypeFR44;
      this.filingTypeSR22 = data.filingTypeSR22;
      this.duiIndicator = data.duiViolationInd;
      this.isNotRequiredBylawDisplayDropDown = data.isNotRequiredBylawDisplay;
    });
  }

  ngOnInit() {
    this.priorCarriers = of([]);
    this.policyCoverages = [];
    //this.child.getDriverRateIndicators(this.duiViolationInd, this.filingTypeFR44, this.filingTypeSR22,this.within35MonthsIndi);
    this.isNotRequiredDisplayPrimaryVehicleSelection = this.riskState=== GlobalConstants.STATE_VA ? true : false;
    this.qid = JSON.stringify(this.quoteNumber);
    this.qid = this.qid.replace(/"/g, '');

    this.coveragesForm = this.formBuilder.group({
      prePriorInfo: new UntypedFormControl('Y'),
      autoInsurance: new UntypedFormControl('Y'),
      priorCarrier: new UntypedFormControl(''),
      policyLimit: new UntypedFormControl(''),
      expiryDate: new UntypedFormControl(''),
      vehicle: new UntypedFormControl(''),
      ssn: new UntypedFormControl('', Validators.pattern('^[^-]{1}?[^\"\']*$')),
      primaryVehicleAssignment: this.formBuilder.array([]),
    });
    this.showSpinnerService.showSpinner(true);
    let coverageObservables: Observable<any>[] = new Array();
    coverageObservables.push(this.validValuesService.getValidValues(this.validvaluesreq()));
    coverageObservables.push(this.sharedService.getBWLookUpForPriorCarrier());
    coverageObservables.push(this.propCreditService.getCreditStatus(this.qid, this.mco));
    coverageObservables.push(this.quoteDataService.retrieveQuote(this.qid, 'getPolicyCoverages', this.policyState, this.ratebook));
    this.isNotRequiredDisplayPrimaryVehicleSelection?coverageObservables.push(this.quoteDataService.retrieveQuote(this.qid, 'getDriverVehicleMapping', this.policyState, this.ratebook)):"";
    
    let startTime = new Date();
    forkJoin(coverageObservables).subscribe(results => {

      //this.checkPNI = results[2].creditReportResponse.code === '3' ? true : false;

      // loads Valid values for Coverages  screen
      this.loadValidValues(results[0]);

      // loads prior carriers dropdown list in Coverages screen
      this.loadPriorCarriers(results[1]);

      // load credit message
      this.getPropCreditStatus(results[2]);

      // load Coverage Data from QuoteAPI
      this.umpdDBStoredValue = results[3].autoQuote.policyCoveragesDetails?.coverages?.find((x: { code: string; }) => x.code === 'UMPD')?.limits.trim();
      this.umbiDBStoredValue = results[3].autoQuote.policyCoveragesDetails?.coverages?.find((x: { code: string; }) => x.code === 'UMBI')?.limits.trim();
      this.selPriorInsuIndicator = results[3].autoQuote.priorCarrierInfo[0].priorInsuranceIndicator;
      this.store.dispatch(Actions.umpdStoredValue({ umpdStoredValue: this.umpdDBStoredValue }));
      this.store.dispatch(Actions.umbiStoredValue({ umbiStoredValue: this.umbiDBStoredValue }));
      this.loadCoverageData(results[3]);
      this.loadVehicleDriverdata(results[4]);

      this.showSpinnerService.showSpinner(false);
      this.logTracker.loginfo('CoveragesComponent', 'ngOnInit', 'CoveragePageObservables',
        'QuoteNumber='.concat(this.qid + '|Duration='.concat(CommonUtils.elapsedTime(startTime).toString())));
    },
      (_error: any) => {
        this.errorHandler(_error);
        this.logTracker.logerror('CoveragesComponent', 'CoverageObservables', 'Coverage Page Load services',
          'Error=Coverages Page Load service errrors', _error);
      });
    this.setPriorPolicyFieldsAsRequired();
    // save & exit behaviour subjec observable
    this.navigationObservableWatch();
  }

  setSelectionFieldRequired(index:any){
    const vehicle = this.primaryVehicleAssignmentFormGroup(index).controls['vehicle'].value;
    vehicle?.setValidators([Validators.required]);
    vehicle?.updateValueAndValidity();
  }

  primaryVehicleAssignment(): UntypedFormArray {
    return this.coveragesForm.get('primaryVehicleAssignment') as UntypedFormArray;
  }
  primaryVehicleAssignmentFormGroup(vehicleIndex: number) {
    const itemControls = this.primaryVehicleAssignment();
    const itemFormGroup = <UntypedFormGroup>itemControls.controls[vehicleIndex];
    return itemFormGroup;
  }

  vehicleSelection(event: any, driverIndex: any) {
    const useraction = this.primaryVehicleAssignmentFormGroup(driverIndex).controls['vehicle'].value;
    this.defaultSelectVehicle = event.value === ''? true : false;
  }
  loadVehicleDriverdata(primaryVehicleAssignmentData: any): void {
    this.driversData = primaryVehicleAssignmentData?.autoQuote?.personalAuto?.drivers;
    this.vehicleData = primaryVehicleAssignmentData?.autoQuote?.personalAuto?.vehicles;
    this.driversData?.forEach((driver:Driver, index: any)=>{
      let vehicleIndex; 
      driver?.associatedVehicles?.forEach((item: any) => {
        vehicleIndex = item.key;
      });
      this.defaultSelectVehicle = vehicleIndex === '0'? true : false;
      if(vehicleIndex === '0'){vehicleIndex = '';}
      this.primaryVehicleAssignment().push(
        new UntypedFormGroup({
          vehicle: new UntypedFormControl(vehicleIndex, [Validators.required]),
          })
      );
    })
  }
  loadCoverageData = (coverageData: any) => {
    
    this.coverageDBData = coverageData.autoQuote;
    this.child.loadOutOfStateList(coverageData.autoQuote?.vehicles);
    this.loadGetCoverages(coverageData);
    this.loadPOPServiceData(coverageData.autoQuote);
    
    this.logTracker.loginfo('CoveragesComponent', 'ngOnInit', 'quoteDataService.retrieveQuote',
      'quoteDataService.retrieveQuote');
    this.prevPriorCarrier = this.coveragesForm.get('priorCarrier')?.value;
    this.prevPriorPolicyLmt = this.coveragesForm.get('policyLimit')?.value;
    this.prevPriorPolicyExpDate = this.coveragesForm.get('expiryDate')?.value;;
  }

  autoInschange(event: any) {
    let selectedPriorInsInd = this.coveragesForm.get('priorCarrier')?.value;
    if(event.value === 'Y') {
    this.setPriorLimits();
    } 
  }

  setPriorLimits() {
    if(this.selPriorInsuIndicator === 'N') { 
      this.coveragesForm.patchValue({policyLimit: ''});
    }
  }

  loadGetCoverages = (obj: any) => {
    // if (this.applicantNonOwner) {  Fix for DE77091
    //   this.coveragesForm.patchValue({
    //     BI: '050/100',
    //     PD: '050',
    //     UMBI: GlobalConstants.NONE,
    //     UIM: GlobalConstants.NONE,
    //     MP: GlobalConstants.NONE
    //   });
    // } else {
    this.policyCoverages = obj.autoQuote.policyCoveragesDetails?.coverages;
    const biDBLimit = obj.autoQuote.policyCoveragesDetails?.coverages?.find((x: { code: string; }) => x.code === 'BI')?.limits.trim();
    const pdDBLimit = obj.autoQuote.policyCoveragesDetails?.coverages?.find((x: { code: string; }) => x.code === 'PD')?.limits.trim();
    const mpDBLimit = obj.autoQuote.policyCoveragesDetails?.coverages?.find((x: { code: string; }) => x.code === 'MP')?.limits.trim();
    const umbiDBLimit = obj.autoQuote.policyCoveragesDetails?.coverages?.find((x: { code: string; }) => x.code === 'UMBI')?.limits.trim();
    const uimDBLimit = obj.autoQuote.policyCoveragesDetails?.coverages?.find((x: { code: string; }) => x.code === 'UIM')?.limits.trim();
    const umpdDBLimit = obj.autoQuote.policyCoveragesDetails?.coverages?.find((x: { code: string; }) => x.code === 'UMPD')?.limits.trim();
    const cfpbLimit = obj.autoQuote.policyCoveragesDetails?.coverages?.find((x: { code: string; }) => x.code === 'CFPB')?.limits.trim();
    const umunstLimit = this.child.getUmunstlimit(obj);
    const uimunsLimit = this.child.getUimunsLimit(obj);
    const umsLimit = this.child.getUms(obj);
    const medexpLimit = obj.autoQuote.policyCoveragesDetails?.coverages?.find((x: { code: string; }) => x.code === 'MEDEXP')?.limits.trim();
    const inclLimit = obj.autoQuote.policyCoveragesDetails?.coverages?.find((x: { code: string; }) => x.code === 'INCL')?.limits.trim();
    const accdLimit = obj.autoQuote.policyCoveragesDetails?.coverages?.find((x: { code: string; }) => x.code === 'ACCD')?.limits.trim();
    const funbLimit = obj.autoQuote.policyCoveragesDetails?.coverages?.find((x: { code: string; }) => x.code === 'FUNB')?.limits.trim();
    const embLimit = obj.autoQuote.policyCoveragesDetails?.coverages?.find((x: { code: string; }) => x.code === 'EMB')?.limits.trim();
    const tortLimit = obj.autoQuote.policyCoveragesDetails?.coverages?.find((x: { code: string; }) => x.code === 'TORT')?.limits.trim();  
  
    const umuimDBLimit = obj.autoQuote.policyCoveragesDetails?.coverages?.find((x: { code: string; }) => x.code === 'UM/UIM')?.limits.trim();
    const biLimit = this.child.setBILimit(obj, biDBLimit);
    const pdLimit = this.child.setpdLimit(obj, pdDBLimit);
    const pipLimit = this.child.loadPIPData(obj);
    const pipdLimit = pipLimit.pipdVal === '' ? '1000' : pipLimit.pipdVal;
    const mpLimit = (mpDBLimit !== undefined && mpDBLimit !== '000/000' && mpDBLimit !== '') ? mpDBLimit : GlobalConstants.NONE;
    const umbiLimit = (umbiDBLimit !== '000/000' && umbiDBLimit !== '') ? umbiDBLimit : GlobalConstants.NONE;
    const uimLimit = (uimDBLimit !== '000/000' && uimDBLimit !== '') ? uimDBLimit : GlobalConstants.NONE;
    const umpdLimit = this.setUMPDLimit(obj, umpdDBLimit); //(umpdDBLimit !== '') ? umpdDBLimit : GlobalConstants.NONE;
    const umuimLimit = this.setUMUIMLimit(obj, umuimDBLimit); //(umuimDBLimit !== '') ? umuimDBLimit : '025/050';
    // const umsLimit =  this.setUMS(obj);
    const inclDBLimit = this.setIncomeLoss(obj, inclLimit);

    this.coveragesForm.patchValue({
      BI: biLimit,
      PD: pdLimit,
      UMBI: umbiLimit,
      UIM: uimLimit,
      MP: mpLimit,
      PIP: pipLimit.pipVal,
      PIPI: pipLimit.pipiVal,
      PIPD: pipdLimit,
      UMPD: umpdLimit,
      CFPB: cfpbLimit !== '' ? cfpbLimit : GlobalConstants.NONE,
      UMUNST: umunstLimit !== '' ? umunstLimit : GlobalConstants.NONE,
      UIMUNS: uimunsLimit !== '' ? uimunsLimit : GlobalConstants.NONE,
      MEDEXP: medexpLimit !== '' ? medexpLimit : GlobalConstants.MPEXP_DEFAULT,
      INCL: inclDBLimit,
      ACCD: accdLimit !== '' ? accdLimit : GlobalConstants.NONE,
      FUNB: funbLimit !== '' ? funbLimit : GlobalConstants.NONE,
      EMB: embLimit !== '' ? embLimit : GlobalConstants.NONE,
      TORT: tortLimit !== '' ? tortLimit : 'Limited',
      "UM/UIM": umuimLimit,
      UMS:umsLimit
    });
    // }
    
    this.child.filterCoverages('BI', []);
    this.child.loadCoverages();
    this.child.checkForOutOfState();
  }

  private setUMPDLimit(obj: any, umpdDBLimit: string): string {
    let default_value;
    default_value = umpdDBLimit !== '' ? umpdDBLimit : GlobalConstants.NONE;
    if (this.applicantNonOwner && GlobalConstants.PD_UMPD_STATES.includes(this.riskState)) {
      default_value = GlobalConstants.NONE;
    }
    if(this.riskState === GlobalConstants.STATE_VA && !this.filingTypeFR44){
      default_value = this.applicantNonOwner? (umpdDBLimit > '050' || umpdDBLimit === '') ? '020' : umpdDBLimit : umpdDBLimit !==''? umpdDBLimit: '020';
    }
    if(this.riskState === GlobalConstants.STATE_VA && this.filingTypeFR44){
      default_value = this.applicantNonOwner? (umpdDBLimit < '040' || umpdDBLimit > '050'|| umpdDBLimit === '') ? '040' : umpdDBLimit: umpdDBLimit < '040' ? '040':umpdDBLimit;
    }
    return default_value
  }

  private setUMUIMLimit(obj: any, umuimLimit: string): string {

    let default_value;
    let vvLimit = this.child?.validValues?.filter(obj => GlobalConstants.UM_FILTER_CODES.includes(obj.code))[0]?.values[0]?.key;
    // console.log('umuimLimit:' + umuimLimit);
    // console.log('vvLimit-' + vvLimit);
    default_value = umuimLimit !== '' ? umuimLimit : vvLimit;
     if(this.riskState === GlobalConstants.STATE_VA && this.filingTypeFR44){
      default_value = this.applicantNonOwner? umuimLimit > '060/120' ? '060/120' : '060/120': umuimLimit < '060/120' ? '060/120': umuimLimit;
    }
    return default_value;

  }

  private setUMS(obj: any): string {
    let default_value;
    let umsType = obj.autoQuote.policyCoveragesDetails?.coverages?.find((x: { code: string; }) => x.code === 'UMPD')?.type.trim();
    if(umsType==='Standard'){
      default_value = 'Y';
    }
    else if(umsType==='Alternative'){
      default_value = 'N';
    }
    else{default_value='Y'}
    return default_value;
  }

  private setIncomeLoss(obj: any, inclLimit: string): string {
    let default_value;
    default_value = inclLimit !== '' ? inclLimit : GlobalConstants.NONE;
    if(this.riskState === GlobalConstants.STATE_VA && this.applicantNonOwner){
      default_value =  GlobalConstants.NONE;
    }
    return default_value;
  }

  loadPOPServiceData(obj: any) { //if other than 7 priorlimit='' defaylt N
    const priorCarrierVal = obj?.priorCarrierInfo[0]?.priorCarrierName?.trim() || obj?.priorCarrierInfo[0]?.priorCarrier?.trim();
    const priorCarrierName = priorCarrierVal === '99' ? 'BW' : priorCarrierVal;
    let isPOPBlock = false;
    let isReportPOPBlock = false;
    let isNotRequiredBylaw = false;
    if (obj?.priorCarrierInfo[0]?.source === 'Reports') {
      if (GlobalConstants.BRISTOL_WEST_AFFILIATED_VALUES.includes(priorCarrierName)) {
        isReportPOPBlock = true;
        this.messageservice.softError([MessageConstants.POP_BLOCK_MESSAGE]);
      } else if (GlobalConstants.FARMERS_AFFILIATED_VALUES.includes(priorCarrierName)) {
        isReportPOPBlock = true;
        this.messageservice.softError([MessageConstants.POP_FARMERS_AFFILIATED_MESSAGE]);
      }
    } else {
      if (GlobalConstants.POP_BLOCK_BW_FO_VALUES.includes(priorCarrierName)) {
        isPOPBlock = true;
      }
    }
    this.savedPriorCarrierSource = obj?.priorCarrierInfo[0]?.source;
    this.savedPriorCarrierName = obj?.priorCarrierInfo[0]?.priorCarrierName?.trim();

    const ssnFormat = new ssnPipe(); let expireDate = (isPOPBlock || obj?.priorCarrierInfo[0]?.priorLimits?.trim().toUpperCase() === 'NO' || obj?.priorCarrierInfo[0]?.priorLimits?.trim().toUpperCase() === '' ?
      undefined : obj?.priorCarrierInfo[0]?.policyExpirationDate?.trim());

    let constinousAutoIns = obj?.priorCarrierInfo[0]?.priorInsuranceIndicator.trim();
    let priorCarrierLimit = (isPOPBlock || obj?.priorCarrierInfo[0]?.priorLimits?.trim().toUpperCase() === 'NO') ?
      GlobalConstants.EMPTY_STRING : obj?.priorCarrierInfo[0]?.priorLimits?.trim();

    if (isPOPBlock) {
      this.prevInsuranceInfoBlockStatus = {
        autoInsurance: false,
        priorCarrier: false,
        policyLimit: true,
        expiryDate: true
      }
    } else if (isReportPOPBlock) {
      this.prevInsuranceInfoBlockStatus = {
        autoInsurance: true,
        priorCarrier: true,
        policyLimit: true,
        expiryDate: true
      }
    } else { //if other than 7 priorCarriers, if priorlimit='' default indicator to NO
      if (priorCarrierLimit === GlobalConstants.EMPTY_STRING) {
        constinousAutoIns = 'N';
      }
    }
    CommonUtils.updateControlValidation(this.coveragesForm?.controls?.policyLimit, false);
    //CommonUtils.updateControlValidation(this.coveragesForm?.controls?.expiryDate, false);
    if (this.isNotRequiredBylawDisplayDropDown) {
      let priorCarrierInfo = obj?.priorCarrierInfo[0];
      const priorCarrier = priorCarrierVal === 'NR' ? GlobalConstants.NOT_REQUIRED_BY_LAW : '';
      const effectiveDate = obj?.priorCarrierInfo[0]?.policyExpirationDate?.trim();
      const dateSplit = effectiveDate.split('/');
      const isNRBLPresent = this.priorCarriersDB.find((x: { key: string; }) => x.key === "NR");
      if (isNRBLPresent !== undefined && priorCarrierVal === 'NR') {
        isNotRequiredBylaw = true;
        this.coveragesForm.patchValue({prePriorInfo: 'NR'});
        this.checkNRBL(priorCarrier, dateSplit);
      } else if (isNRBLPresent == undefined && priorCarrierVal === 'NR') {
        if (priorCarrierInfo.source == "UserSelected" && this.checkPNI && priorCarrierInfo.priorCarrierName == "NR") {
          this.coveragesForm.patchValue({prePriorInfo: 'N'});
          priorCarrierInfo.priorInsuranceIndicator = "N";
          priorCarrierInfo.priorCarrierName = 'NO';
          priorCarrierLimit = GlobalConstants.EMPTY_STRING;
          expireDate = GlobalConstants.DUMMY_DATE;
          constinousAutoIns = priorCarrierInfo.priorInsuranceIndicator;
        }
      }
      else if(priorCarrierVal === undefined || priorCarrierVal ==='' || priorCarrierVal ==='NO'){
        this.coveragesForm.patchValue({prePriorInfo: 'N'});
      }


      this.coveragesForm.updateValueAndValidity();
    }



    this.coveragesForm.patchValue({
      autoInsurance: ((constinousAutoIns === 'Y' || constinousAutoIns === GlobalConstants.EMPTY_STRING) && priorCarrierName === GlobalConstants.EMPTY_STRING) ? 'N' : isNotRequiredBylaw? 'N':constinousAutoIns,
      priorCarrier: obj?.priorCarrierInfo[0]?.priorCarrierName === 'NO' ? GlobalConstants.EMPTY_STRING : (this.priorCarriersDB?.find((x: { key: string; }) => x.key === priorCarrierName)?.displayvalue || ''),
      policyLimit: priorCarrierLimit,
      expiryDate: (expireDate == undefined || expireDate === GlobalConstants.DUMMY_DATE || expireDate === GlobalConstants.EMPTY_STRING) ? GlobalConstants.EMPTY_STRING : new Date(`${expireDate}`),
      ssn: ssnFormat.transform(obj.contact?.person?.socialSecurityNumber?.trim() ?? ''),
    });
    this.showSpinnerService.showSpinner(false);
  }

  checkNRBL(priorCarrier: string, dateSplit: string | number | Date) {
    if (priorCarrier === GlobalConstants.NOT_REQUIRED_BY_LAW) {
      this.coveragesForm.controls['priorCarrier']?.setValue(priorCarrier);
      this.coveragesForm.controls['expiryDate']?.setValue(new Date(dateSplit));
      this.coveragesForm.controls['policyLimit']?.setValue('MN');
      this.coveragesForm.controls['policyLimit'].disable();
      this.coveragesForm.controls['expiryDate'].disable();
      return;
    }
  }
  //On prior carrier change
  onPriorCarrierChange() {
    if (!this.prevInsuranceInfoBlockStatus.autoInsurance) { //if continous indicator is disabled do not allow onChange Event
      const priorCarrier = this.coveragesForm.get('priorCarrier')?.value;
      this.savedPriorCarrierName = priorCarrier;
      const effectiveDate = this.policyEffectiveDate;
      const dateSplit = effectiveDate.split('/');
      if (GlobalConstants.POP_BLOCK_BW_FO_VALUES.includes(priorCarrier)) {
        this.hasSelectedPOPBlock = true;
        this.prevInsuranceInfoBlockStatus = {
          autoInsurance: false,
          priorCarrier: false,
          policyLimit: true,
          expiryDate: true
        }
        this.coveragesForm.patchValue({
          policyLimit: GlobalConstants.EMPTY_STRING,
          expiryDate: GlobalConstants.EMPTY_STRING,
        });
        CommonUtils.updateControlValidation(this.coveragesForm?.controls?.policyLimit, false);
        CommonUtils.updateControlValidation(this.coveragesForm?.controls?.expiryDate, false);
      } else {
        this.hasSelectedPOPBlock = false;
        this.coveragesForm.controls['policyLimit'].enable();
        this.coveragesForm.controls['expiryDate'].enable();
        this.prevInsuranceInfoBlockStatus = {
          policyLimit: false,
          expiryDate: false
        }
        /*this.coveragesForm.patchValue({
          policyLimit: GlobalConstants.EMPTY_STRING,
          expiryDate: GlobalConstants.EMPTY_STRING
        });*/
        CommonUtils.updateControlValidation(this.coveragesForm?.controls?.policyLimit, true);
        const expDateVal = this.coveragesForm?.controls?.expiryDate?.value;
        if (expDateVal === GlobalConstants.EMPTY_STRING || !expDateVal) {
          this.coveragesForm?.controls?.expiryDate?.patchValue(GlobalConstants.EMPTY_STRING);
        }
        CommonUtils.updateControlValidation(this.coveragesForm?.controls?.expiryDate, true);
      }
      if (this.isNotRequiredBylawDisplayDropDown) {
        if(priorCarrier===GlobalConstants.NOT_REQUIRED_BY_LAW){
          this.coveragesForm.patchValue({autoInsurance: 'N',prePriorInfo: 'NR'});
          this.coveragesForm.updateValueAndValidity();
        }
        this.checkNRBL(priorCarrier, dateSplit);
      }
    }

  }

  onPreviousPriorInfoChange() {
    const prePriorInfoValue = this.coveragesForm.get('prePriorInfo')?.value;
    const priorCarrierControl = this.coveragesForm.get('priorCarrier');
    const policyLimitControl = this.coveragesForm.get('policyLimit');
    const policyExpiryDateControl = this.coveragesForm.get('expiryDate');
    priorCarrierControl?.setValidators([Validators.required]);
    policyLimitControl?.setValidators([Validators.required]);
    policyExpiryDateControl?.setValidators([Validators.required]);
    priorCarrierControl?.updateValueAndValidity();
    policyLimitControl?.updateValueAndValidity();
    policyExpiryDateControl?.updateValueAndValidity();
    this.selectedAutoInsurance = prePriorInfoValue==='Y'||prePriorInfoValue==='N'? prePriorInfoValue:'N';
    priorCarrierControl?.setValidators(null);
    policyLimitControl?.setValidators(null);
    policyExpiryDateControl?.setValidators(null);
    if (prePriorInfoValue === 'Y') {
      this.setPriorLimits();
      this.coveragesForm.patchValue({ autoInsurance : 'Y'});
      this.coveragesForm.updateValueAndValidity();
      priorCarrierControl?.setValidators([Validators.required]);
      policyLimitControl?.setValidators([Validators.required]);
      this.coveragesForm?.controls?.expiryDate.patchValue('');
      policyExpiryDateControl?.setValidators([Validators.required]);
      if(priorCarrierControl?.value === GlobalConstants.NOT_REQUIRED_BY_LAW){
        priorCarrierControl?.patchValue(GlobalConstants.EMPTY_STRING);
        policyLimitControl?.patchValue(GlobalConstants.EMPTY_STRING);
        policyExpiryDateControl?.patchValue(GlobalConstants.EMPTY_STRING);
        priorCarrierControl?.updateValueAndValidity();
        policyLimitControl?.updateValueAndValidity();
        policyExpiryDateControl?.updateValueAndValidity();
      }
      if (GlobalConstants.POP_BLOCK_VALUES.includes(this.savedPriorCarrierName)) {
        //if (this.savedPriorCarrierSource === 'Reports') {
        policyLimitControl?.setValidators(null);
        policyExpiryDateControl?.setValidators(null);
        policyLimitControl?.updateValueAndValidity();
        policyExpiryDateControl?.updateValueAndValidity();
        // }
      }
    }else if(prePriorInfoValue === 'NR'){
      const effectiveDate = this.policyEffectiveDate;
      const dateSplit = effectiveDate.split('/');
      this.checkNRBL(GlobalConstants.NOT_REQUIRED_BY_LAW, dateSplit);
    }
     else {
      priorCarrierControl?.patchValue(GlobalConstants.EMPTY_STRING);
      policyLimitControl?.patchValue(GlobalConstants.EMPTY_STRING);
      policyExpiryDateControl?.patchValue(GlobalConstants.EMPTY_STRING);
      this.coveragesForm.patchValue({ autoInsurance : 'N'});
      this.coveragesForm.updateValueAndValidity();
      this.prevInsuranceInfoBlockStatus = {
        autoInsurance: false,
        priorCarrier: false,
        policyLimit: false,
        expiryDate: false
      }
    }
    priorCarrierControl?.updateValueAndValidity();
    policyLimitControl?.updateValueAndValidity();
    policyExpiryDateControl?.updateValueAndValidity();
  }
  // set required validator dynamically for policyLimit and PriorCarrier formControl based on radio selection
  setPriorPolicyFieldsAsRequired(): void {
    const priorCarrierControl = this.coveragesForm.get('priorCarrier');
    const policyLimitControl = this.coveragesForm.get('policyLimit');
    const policyExpiryDateControl = this.coveragesForm.get('expiryDate');
    priorCarrierControl?.setValidators([Validators.required]);
    policyLimitControl?.setValidators([Validators.required]);
    policyExpiryDateControl?.setValidators([Validators.required]);
    priorCarrierControl?.updateValueAndValidity();
    policyLimitControl?.updateValueAndValidity();
    policyExpiryDateControl?.updateValueAndValidity();
    this.coveragesForm.get('autoInsurance')?.valueChanges.subscribe(
      (mode: string) => {
        this.selectedAutoInsurance = mode;
        priorCarrierControl?.setValidators(null);
        policyLimitControl?.setValidators(null);
        policyExpiryDateControl?.setValidators(null);
        if (mode === 'Y') {
          priorCarrierControl?.setValidators([Validators.required]);
          policyLimitControl?.setValidators([Validators.required]);
          this.coveragesForm?.controls?.expiryDate.patchValue('');
          policyExpiryDateControl?.setValidators([Validators.required]);
          if (GlobalConstants.POP_BLOCK_VALUES.includes(this.savedPriorCarrierName)) {
            //if (this.savedPriorCarrierSource === 'Reports') {
            policyLimitControl?.setValidators(null);
            policyExpiryDateControl?.setValidators(null);
            policyLimitControl?.updateValueAndValidity();
            policyExpiryDateControl?.updateValueAndValidity();
            // }
          }
        } else {
          priorCarrierControl?.patchValue(GlobalConstants.EMPTY_STRING);
          policyLimitControl?.patchValue(GlobalConstants.EMPTY_STRING);
          policyExpiryDateControl?.patchValue(GlobalConstants.EMPTY_STRING);
          this.prevInsuranceInfoBlockStatus = {
            autoInsurance: false,
            priorCarrier: false,
            policyLimit: false,
            expiryDate: false
          }
        }

        priorCarrierControl?.updateValueAndValidity();
        policyLimitControl?.updateValueAndValidity();
        policyExpiryDateControl?.updateValueAndValidity();
      });
  }

  /* Handle form errors */
  public hasError = (controlName: string, errorName: string, index: any, formArrayName: any) => {    
    if (index === '' ) {
      return this.coveragesForm.controls[controlName].hasError(errorName);
    }else{
      return this.coveragesForm.controls[formArrayName].get([index, controlName])?.hasError(errorName);
    }


    // return index === '' ? this.coveragesForm.controls[controlName].hasError(errorName) : this.primaryVehicleAssignment(index).controls[controlName].hasError(errorName)
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

  rideshareOnFLState() {
    if (this.policyState === GlobalConstants.STATE_FL) {
      const errorArr: any = [];
      errorArr.push(MessageConstants.BI_LIMIT_ON_RIDESHARE);
      this.messageservice.showError(errorArr);
      const element = document.querySelector('#topcontent');
      element?.scrollIntoView();
      this.showSpinnerService.showSpinner(false);
    }
  }

  onSubmit(formData: any): void {
    this.formSubmitAttempt = true;
    if (this.coveragesForm.valid) {
      // console.log("coveragesform", this.coveragesForm)

      // console.log('Coverages Valid Values ====> ', this.child.validValues);
      // return;

      this.showSpinnerService.showSpinner(true);
      let qid = JSON.stringify(this.quoteNumber);
      qid = qid.replace(/"/g, '');
      Object.keys(this.coveragesForm.controls).forEach(key => {
      });
      const priorCarrier = this.coveragesForm.get('priorCarrier')?.value;
      const priorLimit = this.coveragesForm.get('policyLimit')?.value;
      const priorDate = this.coveragesForm.get('expiryDate')?.value;;
      if (this.priorCarrierExists(priorCarrier)) {
        return;
      } else {
        let biLimit = this.coveragesForm.controls['BI'].value;
        if (this.rideShareIndicator && biLimit === 'None') {
          this.rideshareOnFLState();
          return;
        }
        if (this.prevPriorCarrier !== "" || this.prevPriorPolicyLmt !== "" || this.prevPriorPolicyExpDate !== "") {
          if ((this.prevPriorCarrier !== priorCarrier && priorCarrier !== "No Prior") || this.prevPriorPolicyLmt !== priorLimit || this.prevPriorPolicyExpDate !== priorDate) {
            this.changeCount++;
          }
       } else{
          this.changeCount = 0;
        }
        this.autoQuoteData = this.quoteDataMapper.mapCoveragesData(formData, this.priorCarriersDB, this.coverageDBData, this.child.validValues, this.changeCount, this.applicantNonOwner,this.driversData,this.vehicleData);
        // console.log("autoQuoteDate", this.autoQuoteData);
        let startTime = new Date();
        this.quoteDataService.saveUpdateQuote(this.autoQuoteData, qid, 'saveQuote').subscribe(async (data: any) => {
          this.sharedService.updateLastVisitedPage(4);
          await data;
          this.navigationService.removeRuleOnNext(4);


          if (this.requestedRoute === '/exit') {
            if (this.performSaveExit) {
              this.showSpinnerService.showSpinner(false);
              this.navigationService.getNextRoutingRule(this.requestedRoute);
              this.sharedService.updateLastVisitedPage(4);
              return;
            }
          } else {

            if (!ObjectUtils.isFieldEmpty(data?.autoQuote?.priorCarrierInfo[0]?.validatorMessages[0].value)) {
              this.loadPOPServiceData(data?.autoQuote);
              this.messageservice.softError([data?.autoQuote?.priorCarrierInfo[0]?.validatorMessages[0].value])
              const element = document.querySelector('#topcontent');
              element?.scrollIntoView();
              this.showSpinnerService.showSpinner(false);
              //return;
            }
            const pageStatus: PageStatus = { name: 'COVERAGES', status: 1 };
            this.store.dispatch(addPageStatus({ pageStatus }));
            if (this.clickBack) {
              this.launchVehicles(qid);
            } else {
              // credit status 99 (noconnect or deceased) redirects to the applicant page to reorder credit
              if (this.creditStatus === '99') {
                this.router.navigateByUrl('/applicant?qid=' + qid);
              } else {
                if (this.performSaveExit) {
                  this.showSpinnerService.showSpinner(false);
                  this.navigationService.getNextRoutingRule(this.requestedRoute);
                  this.sharedService.updateLastVisitedPage(4);
                  return;
                } else {
                  await this.router.navigateByUrl('/policyinfo?qid=' + qid);
                }

              }
            }
          }


          this.showSpinnerService.showSpinner(false);
          this.logTracker.loginfo('CoveragesComponent', 'onSubmit', 'quoteDataService.saveUpdateQuote',
            'QuoteNumber='.concat(this.qid + '|Duration='.concat(CommonUtils.elapsedTime(startTime).toString())));
        },
          (errorData: any) => {
            this.logTracker.logerror('CoveragesComponent', 'onSubmit', 'quoteDataService.saveUpdateQuote',
              'Error=Coverages Page Save|QuoteNumber='.concat(this.qid), errorData);

            sessionStorage.removeItem('driverFormData');
            this.errorHandler(errorData);
            this.clickBack = false;
          });
      }
    }
  }

  priorCarrierExists(priorname: string) {
    let errorList: string[] = [];
    const contInsurance = this.coveragesForm.controls.autoInsurance.value;
    const matched = this.priorCarriersDB?.find((x: { displayvalue: string; }) => x.displayvalue === priorname)?.key ? true : false;
    if (!matched && contInsurance === 'Y') {
      errorList.push(MessageConstants.INCORRECT_PRIORCARRIER);
      this.messageservice.showError(errorList);
      if (errorList.length > 0) {
        const element = document.querySelector('#topcontent');
        element?.scrollIntoView();
        this.showSpinnerService.showSpinner(false);
        return true;
      }
    }
    this.messageservice.clearErrors();
    return false;
  }

  ngOnDestroy(): void {
    this.pdSubscription?.unsubscribe();
    this.navigationService.updateNavigationRequestedRoute('');
    this.navigationObvSubscription.unsubscribe();
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

  loadValidValues = (data: ValidValuesRes): void => {
    this.coveragesObject.priorLimits = data.responseMap.prior_carrier_limits;
    const pniAge = this.ageCalcService.calculateAge(this.dob).toString();
    this.checkPNI = pniAge <= '18' ? true : false;
    this.prePriorInfoValues = (this.checkPNI) ? data.responseMap.previous_insurance_information.filter(function (val: { key: string; }) { return (val.key !== 'NR'); }) : data.responseMap.previous_insurance_information;
  }

  validvaluesreq = (): ValidValuesReq => {
    return {
      appName: GlobalConstants.APP_NAME,
      pageName: GlobalConstants.COVERAGE_PAGE_NAME,
      mco: GlobalConstants.MCO_ALL_VALID_VALUES,
      ratebook: GlobalConstants.RATEBOOK_ALL_VALID_VALUES,
      state: this.policyState,
      dropdownName: GlobalConstants.DROPDOWN_ALL_VALID_VALUES,
      filter: ''
    }
  }

  onClickBack(formData: any): void {
    this.clickBack = true;
    this.onSubmit(formData);
  }

  launchVehicles(quoteId: string): void {
    this.router.navigateByUrl('/vehicles?qid=' + quoteId);
  }

  loadPriorCarriers = (data: PriorCarriersReq): void => {
    const urlParams: any = this.sharedService.getURLQueryParameter();
    if (urlParams !== undefined && urlParams?.m !== undefined && urlParams?.m !== GlobalConstants.EMPTY_STRING) {
      const routeMessage = this.routeMessageObj?.filter((obj: any) => obj.routeIndex === urlParams?.m)[0]?.message;
      this.messageservice.softError([routeMessage]);
    }
    let priorCarrierValidValObj: ValidValues[] = [];
    priorCarrierValidValObj = this.sharedService.mapBWLookUpForPriorCarrier(data);
    this.priorCarriers = of(
      priorCarrierValidValObj?.sort((a, b) => {
        if (a.displayvalue > b.displayvalue) { return 1 } else { return -1 }
      }));
    if (this.isNotRequiredBylawDisplayDropDown) {
      const birthDate = new Date(`${this.dob}`);
      const pniAge = this.ageCalcService.calculateAge(this.dob).toString();
      this.checkPNI = pniAge <= '18' ? true : false;
      this.priorCarriersDB = (this.checkPNI) ? priorCarrierValidValObj.filter(function (val: { key: string; }) { return (val.key !== 'NR'); }) : priorCarrierValidValObj;
    } else {
      this.priorCarriersDB = priorCarrierValidValObj;
    }

    this.filterPriorCarrierTypeValues();
    this.logTracker.loginfo('CoveragesComponent', 'loadPriorCarriers', 'sharedService.getBWLookUpForPriorCarrier',
      'sharedService.getBWLookUpForPriorCarrier');

  }

  getPropCreditStatus = (creditRes: CreditReport): void => {
    this.creditStatus = creditRes.creditReportResponse.code;
    this.creditStatusMsg = creditRes.creditReportResponse.description;

    this.logTracker.loginfo('CoveragesComponent', 'getPropCreditStatus', 'propCreditService.getCreditStatus',
      'propCreditService.getCreditStatus');
  }

  filterPriorCarrierTypeValues(): void {
    this.priorCarriers = this.coveragesForm.controls.priorCarrier.valueChanges
      .pipe(startWith<string | ValidValues>(''),
        map(value => typeof value === 'string' ? value : value?.displayvalue),
        map(filter => filter ? this._filter(filter, this.priorCarriersDB) : this.priorCarriersDB));
  }

  _filter(filter: string, dbCollection: any): Observable<ValidValues[]> {
    if (dbCollection === undefined || dbCollection.length === 0) {
      return of([]);
    }
    return dbCollection.filter((option: ValidValues) => {
      return option.displayvalue.toLowerCase().trim().indexOf(filter.toLowerCase()) === 0;
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
          // simulate form submit
          this.performSaveExit = true;
          this.nextButton.nativeElement.click();
        }
      },
      error => this.logTracker.logerror('CoveragesComponent', 'navigationObservableWatch', 'navigationStepObv',
        'Vehicle Page navigationObservableWatch Error', error));
  }

}


