import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { Validators, UntypedFormGroup, UntypedFormArray, UntypedFormBuilder } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { DeleteVehicleDialogComponent } from 'src/app/shared/dialog/delete-vehicle-dialog/delete-vehicle-dialog.component';
import { VehicleDetail } from 'src/app/shared/model/vehicles/add-vehicle.model';
import { VehicleHistoryReq } from 'src/app/shared/model/vehicles/vehicles.model';
import { QuoteDataService } from 'src/app/services/quote-data.service';
import { VinprefillService } from '../../../services/vinprefill.service';
import { VintelligenceSymbolsService } from 'src/app/services/vintelligence-symbols.service';
import {
  AutoQuoteData, Coverage, Vehicle as AutoQuoteVehicle
} from 'src/app/shared/model/autoquote/autoquote.model';
import { QuoteDataMapper } from 'src/app/shared/utilities/quotedata-mapper';
import { addPageStatus , setRideShare} from 'src/app/state/actions/summary.action';
import { Store } from '@ngrx/store';
import * as Actions from '../../../state/actions/summary.action';
import QuoteSummary, { ApplicantAddress, PageStatus } from 'src/app/state/model/summary.model';
import { VehicleSpecsAndSymbols, Symbol as VintellSymbol } from 'src/app/shared/model/vehicles/vehicle-specs-symbols.model';
import { SpinnerStatusService } from 'src/app/shared/services/spinner-status.service';
import { ValidValuesService } from 'src/app/shared/services/validvalues/validvalues.service';
import { ValidValuesReq } from 'src/app/shared/model/validvalues/validvaluesreq.model';
import { ValidValues, ValidValuesRes } from 'src/app/shared/model/validvalues/validvaluesres.model';
import { GlobalConstants } from 'src/app/constants/global.constant';
import { ZipCodeValidator } from 'src/app/shared/validators/zipcode.validator';
import { MessagesService } from 'src/app/shared/services/messages.service';
import { CommonUtils } from 'src/app/shared/utilities/common-utils';
import { forkJoin, from, Observable, of, Subscription } from 'rxjs';
import { concatMap, map, startWith, takeWhile } from 'rxjs/operators';
import { zipcodePipe } from 'src/app/shared/pipes/zipcode.pipe';
import { Specification, VintelMakesResponse } from 'src/app/shared/model/vehicles/veh-makes-res.model';
import { Specification as ModelSpecs, VintelModelsResponse } from 'src/app/shared/model/vehicles/veh-models-res.model';
import { ObjectUtils } from 'src/app/shared/utilities/object-utils';
import { VinPrefixRes, Vehicle as VehiclePrefix } from 'src/app/shared/model/vehicles/vin-prefixes-res.model';
import { VehicleVinPrefixPopupComponent } from 'src/app/shared/dialog/vehicle-vin-prefix-popup/vehicle-vin-prefix-popup.component';
import { VehVintelStatus } from '../../../shared/model/vehicles/veh-vintel-status.model';
import { VinPrefillRes } from 'src/app/shared/model/vehicles/vin-prefill-res.model';
import { SearchByCriteria, Vehicle, VinPrefixReq } from 'src/app/shared/model/vehicles/vin-prefix-req.model';
import { AutoPrefillReportQuery, VinPrefillReq } from 'src/app/shared/model/vehicles/vin-prefill-req.model';
import { VehicleSymbolsReq, Vehicle as VehicleSymReqInfo } from '../../../shared/model/vehicles/vehicle-symbols-req.model';
import { VehicleSymbolsRes } from '../../../shared/model/vehicles/vehicle-symbols-res.model';
import { VehicleVinPrefillPopupComponent } from 'src/app/shared/dialog/vehicle-vin-prefill-popup/vehicle-vin-prefill-popup.component';
import { MessageConstants } from 'src/app/constants/message.constant';
import { SharedService } from 'src/app/services/shared.service';
import { VehicleCoverageValidvaluesComponent } from './vehicle-validvalues/vehiclecoverage-validvalues.component';
import { VehiclesService } from 'src/app/services/vehicles.service';
import { Tracker } from 'src/app/shared/utilities/tracker';
import { NavigationService } from 'src/app/shared/services/navigation.service';
import { HelptextMapper } from 'src/app/shared/utilities/helptext-mapper';
import { HelpTextDialogComponent } from 'src/app/shared/dialog/helptext-dialog/helptext-dialog.component';

@Component({
  selector: 'app-vehicles',
  templateUrl: './vehicles.component.html',
  styleUrls: ['./vehicles.component.scss']
})
export class VehiclesComponent implements OnInit {
  @ViewChild('next', { read: ElementRef }) nextButton!: ElementRef;
  @ViewChild(VehicleCoverageValidvaluesComponent, { static: false }) child!: VehicleCoverageValidvaluesComponent;

  vehiclesForm!: UntypedFormGroup; // our form model
  vehicleList!: UntypedFormArray;
  formSubmitAttempt!: boolean;
  vehicleObject: VehicleDetail = new VehicleDetail();
  compVal = '';
  displayCoverageFlag: any = [];
  showCoverageFlag : Array<boolean>  = [false];
  displayACVFlag: any = [];
  displayTrimFlag: any = [];
  disableRoadSide: any = [];
  disableLoanLeaseVal: any = [];
  deletevehicledialog!: MatDialogRef<DeleteVehicleDialogComponent>;
  deleteVehicle!: boolean;
  quoteID: any = sessionStorage.getItem('STATE');
  vehicleHistory!: VehicleHistoryReq;
  pageStatus!: number;
  addVehicleBtnStatus!: number;
  clickBack = false;
  isStorageUSE = false;
  quoteNumber!: any;
  mco!: any;
  qid!: any;
  policyState!: any;
  applicantAddress!: ApplicantAddress;
  ratebook = ''; // 'A'; Removed hardcoding logic
  autoQuoteData!: AutoQuoteData;
  dbApplicantData!: any;
  dbVehiclesData!: any;
  onLoadVehiclesData!:any
  errorMessage = '';
  serverErrorArr: any = [];
  editsErrorArr: any = [];
  lastFilter = '';
  filteredVehYears: Observable<ValidValues[]> | undefined;
  filteredVehMakes: Observable<ValidValues[]> | undefined;
  nonOwnerIndicator!: any;
  page = 'vehicles';
  layout = GlobalConstants.LAYOUT_VERTICAL;
  vehiclesSliced: any;

  reportsByVehicleId: any = [];
  vehGarageZipCodeByVehicleId: any = [];
  vehGarageStateByVehicleId: any = [];
  vehGarageZipCodeErrors: any = [];
  VINtelligenceErrMsgs: any[] = [];
  duplicateVINErrMSG: string[] = [];
  vehVintelStatusById: any = {};
  vehicleYears: any = [];
  vehicleModels: Observable<ValidValues[]>[] = [];
  vehicleMakes: Observable<ValidValues[]>[] = [];
  vehicleMakesDB: any = [];
  vehicleModelsDB: any = [];
  vehicleBodyTypesDB: any = [];
  vehicleTrimsDB: any = [];
  validAcvPattern = /^[0-9]*$/;
  validOdometerPattern = /^[0-9]*$/;

  vehiclePrefixData: any = [];
  vehicleBodyTypes: Observable<ValidValues[]>[] = [];
  vehicleTrims: Observable<ValidValues[]>[] = [];

  vehicleUseValues: any = [];
  vehicleComprehensiveValues: any = [];


  public vinPrefixReq!: VinPrefixReq;
  vinPrefillVehicles: any = [];
  vinPrefillVINs: any = [];
  isGetVehiclesAPICalled = false;
  unacceptableVehicle = false;
  mailingStateStatus = false;
  // @Input is useful when using a form as a reusable component and need to make the editable/read-only decision at the DOM level.
  @Input() isVINValid: any = [];
  quoteBridgeStatus: boolean = false;
  navigationObvSubscription!: Subscription;
  requestedRoute = '';
  performSaveExit = false;
  vehicleZipCode: any;
  storedGarageZipcode: any;
  dynamicVehFields: any;

  selectedOption: Array<string> = [];
  umpdRequired: boolean = false;
  antiTheftRequired: boolean = false;
  commuteRequired: boolean = false;

  finalValidVinList: any = [];
  routeMessageObj!: any;
  applicantNonOwnerStatus = false;
  checkUpdateVin = false;
  umpdDefaultValState!: string;
  constructor(private _fb: UntypedFormBuilder, private dialog: MatDialog,
    private router: Router, private quoteSVC: QuoteDataService,
    public quoteDataMapper: QuoteDataMapper,
    public quoteDataService: QuoteDataService,
    private store: Store<{ quoteSummary: QuoteSummary }>,
    private vinPrefillService: VinprefillService,
    private vintelligenceSymbolService: VintelligenceSymbolsService,
    public validValuesService: ValidValuesService,
    private readonly messageService: MessagesService,
    private showSpinnerService: SpinnerStatusService,
    public sharedService: SharedService,
    private vehiclesService: VehiclesService,
    public vinPrefixDialog: MatDialog,
    private navigationService: NavigationService,
    private logTracker: Tracker,
    private helpTextMapper: HelptextMapper,) {
    this.store.select('quoteSummary').subscribe(data => {
      this.quoteNumber = data.qid;
      this.mco = data.mco;
      this.ratebook = data.rateBook;
      this.quoteBridgeStatus = data.bridgeStatus;
      const pageStatusArr = data.pageStatus.filter(page => (page?.name === 'VEHICLES'));
      this.storedGarageZipcode = data.applicantAddress.postalCode;
      this.dynamicVehFields = data.dynamicValidValues;
      this.applicantNonOwnerStatus = data.nonOwner;

      this.pageStatus = pageStatusArr.length > 0 ? pageStatusArr[0].status : 0;
      this.applicantAddress = data.applicantAddress;
      this.policyState = data.policyState;
      this.mailingStateStatus = data.mailingStateStatus;
      this.routeMessageObj = data?.routingRules?.messages;
    });

    // loads Valid values for Vehicles screen
    // this.loadValidValues();
  }

  ngOnDestroy(): void {
    this.navigationService.updateNavigationRequestedRoute('');
    this.navigationObvSubscription.unsubscribe();
  }

  ngOnInit(): void {
    this.qid = JSON.stringify(this.quoteNumber);
    this.qid = this.qid.replace(/"/g, '');

    // we will initialize our form here
    this.vehiclesForm = this._fb.group({
      vehicles: this._fb.array([
        this.initVehicle()
      ])
    });
    this.vehicleList = this.vehiclesForm.get('vehicles') as UntypedFormArray;
    const index = this.vehicleList.length - 1;
    this.setVehicleFieldsAsRequired(index);
    this.showSpinnerService.showSpinner(true);
    let vehicleGetObservables: Observable<any>[] = new Array();
    vehicleGetObservables.push(this.validValuesService.getValidValues(this.validvaluesreq()));
    vehicleGetObservables.push(this.quoteDataService.retrieveQuote(this.qid, 'getVehicles', this.policyState, this.ratebook));
    vehicleGetObservables.push(of(this.loadVinPrefillData()));


    forkJoin(vehicleGetObservables).subscribe(results => {
      // this.showSpinnerService.showSpinner(false);
      // loads Valid values for Vehicles screen
      this.loadValidValues(results[0]);

      this.loadVehicleData(results[1]);

      // this.loadVinPrefillData();

    }, (errorData: any) => {
      this.errorHandler(errorData);
      this.logTracker.logerror('VehiclesComponent', 'ngOnInit', 'quoteDataService.retrieveQuote|validValuesService.getValidValues|vinPrefillService.getVinPrefillOrderStatus',
        'Error=Vehicles Page GET|QuoteNumber='.concat(this.qid), errorData);
    });

    this.umpdDefaultValState = this.vehiclesService.setUMPDDefaultVal();
    // save & exit behaviour subjec observable
    this.navigationObservableWatch();
    this.stateDynamicFields();
  }

  // antiTheftEnable(index:any) {
  //   console.log("callled1111111111111111", this.vehiclesForm.controls.vehicles.value[index].OTC, this.antiTheftRequired);
  //   if(this.vehiclesForm.controls.vehicles.value[index].OTC !== 'None' && this.antiTheftRequired) {
  //     console.log("true");
  //     return true;
  //   } else {
  //     console.log("false");
  //     return false;
  //   }
  // }
  stateDynamicFields() {
    for(let i=0;i<=this.dynamicVehFields?.length;i++) {
      if(this.dynamicVehFields[i]?.key === 'Antitheft') {
        this.antiTheftRequired = true
      }
      if(this.dynamicVehFields[i]?.key === 'Commute') {
        this.commuteRequired = true;
      }
    }
  }

  loadVehicleData = (data: any): void => {

    const dataString = JSON.stringify(data);
    const obj = JSON.parse(dataString) as AutoQuoteData;
    this.clearFormArray();
    this.loadVehicles(obj);


    this.logTracker.loginfo('VehiclesComponent', 'ngOnInit-loadVehicleData', 'quoteDataService.retrieveQuote', 'Retrieve Quote Successful');
  }

  loadVehicles(res: AutoQuoteData): void {
    const garageZipcodeFormat = new zipcodePipe();
    this.dbApplicantData = res.autoQuote.contact?.person;
    this.onLoadVehiclesData = res.autoQuote.personalAuto?.vehicles;
    let is17DigitVinerrorList: any[] = [];
    const urlParams:any = this.sharedService.getURLQueryParameter();
    if (urlParams !== undefined && urlParams?.m !== undefined && urlParams?.m !== GlobalConstants.EMPTY_STRING) {
      const routeMessage = this.routeMessageObj?.filter((obj: any) => obj.routeIndex === urlParams?.m)[0]?.message;
      is17DigitVinerrorList.push(routeMessage);
    }
    res.autoQuote.personalAuto?.vehicles?.forEach((vehicle, index) => {
      this.addVehicle();
      this.dbVehiclesData = res.autoQuote.personalAuto?.vehicles;
      this.dbApplicantData = res.autoQuote.contact?.person;
      //this.child.vehicleDetails[index].coverages = this.dbApplicantData[index].coverages;


      let vehicleType = this.vehicleObject.typeValues?.find(x => x.key === CommonUtils.lrtrim(vehicle?.vehicleType))?.key || 'A';
      vehicleType = vehicleType === 'N' && !this.applicantNonOwnerStatus ? 'A' : vehicleType;
      this.nonOwnerIndicator = this.applicantNonOwnerStatus; // vehicleType === 'N' ? true : false;
      if (vehicleType === 'A' && !(ObjectUtils.isFieldEmpty(vehicle.vin ==='N/A')) && vehicle.vin.length < 17) {
        let vehicleId = index + 1;
        is17DigitVinerrorList.push('Vehicle ' + vehicleId + ' - ' + MessageConstants.VEHICLE_VIN_EDT_LESSTHAN_17);
      }

      if (vehicle.year === '0') {
        vehicle.year = '';
      }
      const compCode = vehicle?.coverages?.find((x: { code: string; }) => (x.code === 'OTC' || x.code === 'OTC0GD'))?.code || GlobalConstants.NONE;
      const compVal = vehicle?.coverages?.find((x: { code: string; }) => (x.code === 'OTC' || x.code === 'OTC0GD'))?.deductible || GlobalConstants.NONE;

      const collVal = vehicle?.coverages?.find((x: { code: string; }) => x.code === 'COL')?.deductible || GlobalConstants.NONE;
      let vehicleCovObj = this.vehiclesService.loadVehicleCoverages(vehicle?.coverages);
      const yearVal = vehicle.year === GlobalConstants.NON_OWNER_YEAR_VALUE ? GlobalConstants.EMPTY_STRING : vehicle.year;
      let use = vehicleType === 'N' ? 'P' : vehicle.primaryUse;
      this.vehicleList?.controls[index].patchValue({
        type: vehicleType,
        vin: vehicle.vin === GlobalConstants.NOT_APPLICABLE ? GlobalConstants.EMPTY_STRING : vehicle.vin,
        year: yearVal,
        make: (vehicle.make === GlobalConstants.NON_OWNER_MAKE_VALUE || vehicle.make === GlobalConstants.CONVERSION_VAN_MAKE_VALUE)
          ? GlobalConstants.EMPTY_STRING : vehicle.make,
        model: (vehicle.model === GlobalConstants.NON_OWNER_MODEL_VALUE || vehicle.model === GlobalConstants.BROAD_FORM_MODEL_VALUE
              || vehicle.model === GlobalConstants.CONVERSION_VAN_MODEL_VALUE) ? GlobalConstants.EMPTY_STRING : vehicle.model,
        bodyType: vehicle.bodyType,
        trim: vehicle.trimDescription,
        acv: parseInt(vehicle?.theCurrencyAmount)?.toString() || '', // show only the integer part of ACV value
        use: vehicle.primaryUse,
        odometer: vehicle.odometerReading || '',
        // Other Vehicle attributes
        antiTheftCode: vehicle.discountIndicators?.find((x: { code: string; }) => x.code === 'antiTheftCode')?.value || '-',
        antiLockBrakesOption: vehicle.discountIndicators?.find((x: { code: string; }) => x.code === 'antiLockBrakesOption')?.value || '',
        airBagTypeCode: vehicle.discountIndicators?.find((x: { code: string; }) => x.code === 'airBagTypeCode')?.value || '',
        daylightRunningLightsOption: vehicle.discountIndicators?.find((x: { code: string; }) => x.code === 'daylightRunningLightsOption')?.value || '',
        OTC: vehicleCovObj.OTC,
        UMPD: vehicleCovObj.UMPD,
        COL: vehicleCovObj.COL,
        CEQ: vehicleCovObj.CEQ,
        EXTR: vehicleCovObj.EXTR,
        ALL: vehicleCovObj.ALL,
        RA: vehicleCovObj.RA,
        commuteToNJNYSurcharge: vehicle?.commuteToNJNYSurcharge === '' ? 'N' : vehicle?.commuteToNJNYSurcharge,
        garageZipCode: this.transform(vehicle?.garageAddress?.postalCode),
        garageState: vehicle?.garageAddress?.state?.trim(),
        isOutOfState: vehicle?.garageAddress?.outOfStateIndicator,
        symbols: this.prepareSymbols(vehicle),
        dbVehicleSeqNo: vehicle.sequenceNumber,
        vehIndexNumber: index + 1,
        operation: ''

      });

      if (this.policyState === GlobalConstants.STATE_IL && compVal !=='None') {
      const antiTheftCode = vehicle.discountIndicators?.find((x: { code: string; }) => x.code === 'antiTheftCode')?.value || '-';
      const val = {compVal: compVal ,antiTheftCode: antiTheftCode,index: index};
      this.child.antiTheftCode = antiTheftCode;
      // this.displayAntitheft(val);
      }
      if (vehicle?.vin) {
        //check whether vehicle coverage symbols exists,if not exists then try to get the symbols by hitting VINTElligence API
        const biSymbol = vehicle?.symbols?.find((x: { name: string; }) => (x.name === 'BI2' || x.name === 'BI'))?.value || '';
        const pdSymbol = vehicle?.symbols?.find((x: { name: string; }) => (x.name === 'PD2' || x.name === 'PD'))?.value || '';
        const pipSymbol = vehicle?.symbols?.find((x: { name: string; }) => (x.name === 'PIP2' || x.name === 'PIP'))?.value || '';
        if (!biSymbol || !pdSymbol || !pipSymbol) {
          this.retrieveSymbols(vehicle?.vin, index, [],this.onLoadVehiclesData);

        }
      }
      // console.log('Vehicles: Non Owner Indicator ===> ', this.nonOwnerIndicator);
      /*if (index === 0) {
        // Default type=non-onwer , if non-owner in Applicant page is checked
        if (this.nonOwnerIndicator) {
          this.vehiclesFormGroup(0).controls.type.patchValue('N')
        }
        else {
          this.vehiclesFormGroup(0).controls.type.patchValue(GlobalConstants.EMPTY_STRING)
        }
      }*/
      this.isVINValid[index] = false;
      this.onLoadBusinessLogic(vehicleType, yearVal, compVal, compCode, collVal,use, /*vehicle.primaryUse*/ index);
      this.updateVintelStatus(index, vehicle?.vin, vehicle.year, vehicle.make, vehicle.model, vehicle.bodyType, vehicle.trimDescription);
      //if (this.pageStatus === 0 && vehicle?.garageAddress?.postalCode === '') {
      this.garageZipCodeLogic(index);
      //}

    });
    this.isGetVehiclesAPICalled = true;
    this.checkForBridgeEdits(is17DigitVinerrorList);

  }

  transform(inputVal: any): any {

    if (!inputVal) { return null; }
    else {
      inputVal = inputVal.replace(/-/g, '');
      if (inputVal.toString().length == 9) {
        return inputVal.substring(0, 5)+'-';
      }
      else {
        return inputVal;
      }
    }
  }

  loadVinPrefillData = (): void => {
    // Do not show VIN Prefill POPUP for bridged quotes
    if (this.quoteBridgeStatus === false || this.quoteBridgeStatus.toString() === 'false') {
      // this.showSpinnerService.showSpinner(true);
      this.vinPrefillService.getVinPrefillOrderStatus(this.vinprefillreq()).subscribe(async (data: any) => {
        await data;
        const orderStatus = data;
        if (orderStatus) { // TO:DO put !prefillOrderedStatus when Andrew is ready with real data
          this.showSpinnerService.showSpinner(true);
          this.vinPrefillService.retrieveAutoPrefillReportPriorVehicle(this.vinprefillreq()).subscribe(async (vinfillRes: VinPrefillRes) => {
            await vinfillRes;
            // if VINs are returned , then launch VIN prefill pop up dialog
            if (vinfillRes?.autoPrefillReport?.vehicles?.length > 0) {
              this.vinPrefillVehicles = vinfillRes?.autoPrefillReport?.vehicles;
              this.pickValidVinPrefill(this.vinPrefillVehicles);

            } else {
              this.showSpinnerService.showSpinner(false);
            }

            this.logTracker.loginfo('VehiclesComponent', 'ngOnInit-loadVinPrefillData', 'vinPrefillService.retrieveAutoPrefillReportPriorVehicle', 'Prior Vehicle Report Successful');

          },
            (errorData: any) => {
              this.logTracker.logerror('VehiclesComponent', 'ngOnInit', 'vinPrefillService.retrieveAutoPrefillReportPriorVehicle',
                'Error=Vehicles Page Retrieve Auto Prefill Report Prior Vehicle|QuoteNumber='.concat(this.qid), errorData);
              this.errorHandler(errorData);
            });
        }
      },
        (errorData: any) => {
          this.logTracker.logerror('VehiclesComponent', 'ngOnInit', 'vinPrefillService.getVinPrefillOrderStatus',
            'Error=Vehicles Page Get Vin Prefill Status|QuoteNumber='.concat(this.qid), errorData);
          if (errorData.status != GlobalConstants.HTTP_STATUS_CODE_404) {
            this.errorHandler(errorData);
          } else {
            this.showSpinnerService.showSpinner(false);
          }
        });
    } else {
      this.showSpinnerService.showSpinner(false);
    }
  }

  vinprefillreq = (): VinPrefillReq => {
    const autoPrefillRepQry: AutoPrefillReportQuery = {
      quoteNumber: this.qid,
      masterCompanyCode: this.mco,
    };
    const vinPrefillReq: VinPrefillReq = {
      autoPrefillReportQuery: autoPrefillRepQry
    };

    return vinPrefillReq;
  }

  checkForBridgeEdits(errorList: any[]) {
    this.messageService.softError(errorList);
  }

  prepareSymbols(vehicle: AutoQuoteVehicle): VintellSymbol[] {
    let vehSymbolsFlat: VintellSymbol[] = [];
    vehSymbolsFlat = vehicle.symbols;

    vehicle?.coverages?.forEach((cov: Coverage) => {
      vehSymbolsFlat.push({ name: cov.code, value: cov.symbols || '' });
    });

    vehicle?.policyCoverages?.forEach((cov: Coverage) => {
      vehSymbolsFlat.push({ name: cov.code, value: cov.symbols || '' });
    });

    return vehSymbolsFlat;
  }

  initVehicleCoverages(): UntypedFormGroup {
    // initialize our vehicledetails
    return this._fb.group({

      OTC: GlobalConstants.NONE,
      UMPD: '000',
      COL: GlobalConstants.NONE,
      CEQ: GlobalConstants.NONE,
      EXTR: GlobalConstants.NONE,
      ALL: ['N'],
      RA: ['N'],
      commuteToNJNYSurcharge: ['N']
    });
  }

  initVehicle(): UntypedFormGroup {
    // initialize our vehicledetails
    return this._fb.group({
      vin: '',
      year: '',
      make: '',
      model: '',
      bodyType: '',
      trim: '',
      type: 'A',
      acv: ['', Validators.pattern(this.validAcvPattern)],
      use: 'P',
      odometer: ['', Validators.pattern(this.validOdometerPattern)],
      antiTheftCode: 'N',
      antiLockBrakesOption: '',
      airBagTypeCode: '',
      daylightRunningLightsOption: '',
      UMPD:this.umpdDefaultValState,
      OTC: GlobalConstants.NONE,
      COL: GlobalConstants.NONE,
      CEQ: GlobalConstants.NONE,
      EXTR: GlobalConstants.NONE,
      ALL: ['N'],
      RA: ['N'],
      commuteToNJNYSurcharge: ['N'],
      garageZipCode: ['', Validators.required],
      garageState: '',
      isOutOfState: false,
      symbols: [],
      hardEditMessages: '',
      dbVehicleSeqNo: '',
      vehIndexNumber: 1,
      operation: 'Add'
    });
  }

  public hasError = (controlName: string, errorName: string, index: any) => {
    return this.vehiclesFormGroup(index).controls[controlName].hasError(errorName);
  }

  addVehicle(): void {
    this.vehicleList.push(this.initVehicle());
    // console.log(this.vehicleList);
    const vehicleDetails = this.vehiclesForm.controls.vehicles.value;
    const vehListOnScreen = vehicleDetails.filter((z: any) => z.operation !== 'delete')
      .map(function (x: any) { return x.vin; });
    this.addVehicleBtnStatus = vehListOnScreen.length;
    this.reorderVehicleIndexNumber(vehicleDetails);
    if (this.isGetVehiclesAPICalled) {
      const index = this.vehicleList.length - 1;
      // Filter Vehicle Years/Make/Model/BodyType for Added New Vehicle
      this.filterYearMakeModelBodyTypeValues(index);
      this.setVehicleFieldsAsRequired(index);
      //this.displayCoverage(GlobalConstants.NONE, index);
      this.onUseChange('P', index);
      this.onTypeChange('A', index);
      this.garageZipCodeLogic(index);
      this.vehiclesFormGroup(index).controls.UMPD.patchValue(this.umpdDefaultValState);
    }
    this.logTracker.loginfo('VehiclesComponent', 'addVehicle', 'Add New Vehicle', 'Add New Vehicle');
  }

  clearFormArray(): void {
    this.vehicleList.clear();
  }

  get vehiclesArrayControl() {
    return (this.vehiclesForm.get('vehicles') as UntypedFormArray).controls;
  }

  vehiclesFormGroup(index: any): UntypedFormGroup {
    const itemArray = this.vehiclesForm.controls.vehicles as UntypedFormArray;
    const itemFormGroup = itemArray?.controls[index] as UntypedFormGroup;
    return itemFormGroup;
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
  onSubmit(_formData: any): void {
    if (this.checkForNonOwner()) {
      return;
    }
    this.formSubmitAttempt = true;
    this.logTracker.loginfo('VehiclesComponent', 'onSubmit', 'Next Button Clicked', 'Vehicle Form Submission and Form status ' + this.vehiclesForm.valid);
    if (this.vehiclesForm.valid) {
      this.serverErrorArr = this.messageService.clearErrors();
      const obj = JSON.parse(JSON.stringify(this.vehicleList.value));
      this.showSpinnerService.showSpinner(true);
      let qid = JSON.stringify(this.quoteNumber);
      qid = qid.replace(/"/g, '');

      // Check for fieldLevel errors , Check for Unacceptable Vehicles and No Symbols
      const errors = this.checkVehicleErrors(obj);
      if (this.fieldLevelErrorHandler()) {
        return;
      } else if (errors.length > 0) {
        this.messageService.showError(errors);
        const element = document.querySelector('#topcontent');
        element?.scrollIntoView();
        this.showSpinnerService.showSpinner(false);
        return;
      } else {
        this.saveVehicles(obj, qid, this.dbVehiclesData, this.dbApplicantData);
      }
    } else {
      const err = this.vehiclesForm.errors;
      this.performSaveExit = false;
    }
  }
  checkVehicleErrors(formData: any): string[] {
    const errMsgs: string[] = [];
    formData?.forEach((vehicle: any, index: number) => {
      if (!(vehicle.type === GlobalConstants.NON_OWNER_CODE || vehicle.type === GlobalConstants.CONVERSION_VAN_CODE
        || Number(vehicle.year) <= 1980)) {
        if (ObjectUtils.isObjectEmpty(vehicle.symbols) || vehicle.symbols.length <= 0) {
          errMsgs.push(`Vehicle ${index + 1}: Symbols Not Found`);
        } else {
          const unacceptVal = vehicle.symbols?.find((x: { name: string; }) => (x?.name === 'UNACCEPT'))?.value || '';

          if (!ObjectUtils.isFieldEmpty(unacceptVal) && Number(unacceptVal) === 90 && this.policyState !== GlobalConstants.STATE_PA) {
            this.unacceptableVehicle = true;
            errMsgs.push(`Vehicle ${index + 1}: This is an unacceptable vehicle`);
          }
        }
      }
    });

    return errMsgs;
  }

  checkForNonOwner() {
    const vehicleDetails = this.vehiclesForm.controls.vehicles.value;
    const vehiclesAdded = vehicleDetails.filter((x: any) => (x.operation === "Add" || x.operation === ""));
    // check if non-owner is selected and more than one vehiles is added
    if (this.nonOwnerIndicator && vehiclesAdded.length > 1) {
      var editsErrorArr = [];
      editsErrorArr.push(GlobalConstants.BROAD_FORM_STATES.includes(this.policyState) ?  MessageConstants.BROAD_FORM_DELETE_VEHICLES : MessageConstants.NON_OWNER_DELETE_VEHICLES);
      this.messageService.showError(editsErrorArr);
      this.errorHandler();
      return true;
    }
    return false;
  }

  saveVehicles(formData: any, qid: string, dbData: any, dbApplicantData: any): void {
    this.autoQuoteData = this.quoteDataMapper.mapVehicleData(formData, 'Add', dbData, dbApplicantData);
    let rideShareIndicatorCount = 0
    formData.forEach((element: any) => {
      if (element.use === 'R' && element.operation !== undefined && element.operation !== "delete") {
        rideShareIndicatorCount++;
      }
    });
    const rideShareIndicator = rideShareIndicatorCount === 0 ? false : true;
    this.quoteDataService.saveUpdateQuote(this.autoQuoteData, qid, 'saveQuote').subscribe(async (data: any) => {
      await data;
      const pageStatus: PageStatus = { name: 'VEHICLES', status: 1 };
      this.store.dispatch(addPageStatus({ pageStatus }));
      this.store.dispatch(Actions.setRideShare({ rideShare: rideShareIndicator }));
      this.sharedService.updateLastVisitedPage(3);
      this.navigationService.removeRuleOnNext(3);
      if (this.performSaveExit) {
        this.showSpinnerService.showSpinner(false);
        this.navigationService.getNextRoutingRule(this.requestedRoute);
        return;
      }
      this.router.navigateByUrl('/coverages?qid=' + qid);
      this.showSpinnerService.showSpinner(false);

      this.logTracker.loginfo('VehiclesComponent', 'saveVehicles', 'quoteDataService.saveUpdateQuote', 'Vehicle Save Successfull');
      if (this.clickBack) {
        this.launchViolations(qid);
      } else {
        await this.router.navigateByUrl('/coverages?qid=' + qid);
      }

    },
      (errorData: any) => {
        this.logTracker.logerror('VehiclesComponent', 'saveVehicles', 'quoteDataService.saveUpdateQuote',
          'Error=Vehicles Page POST|QuoteNumber='.concat(this.qid), errorData);

        sessionStorage.removeItem('driverFormData');
        this.errorHandler(errorData);
        this.clickBack = false;
      });
  }
  removeVehicle(i: number): void {
    const dialogRef = this.dialog.open(DeleteVehicleDialogComponent, {
      width: '25%',
      panelClass: 'delete-vehicle-dialog'
    });
    dialogRef.afterClosed().subscribe(result => {
      this.deleteVehicle = result;
      if (this.deleteVehicle) {
        if (this.vehiclesFormGroup(i).controls.operation.value === 'Add') {
          this.vehicleList.removeAt(i);
          this.VINtelligenceErrMsgs.splice(i, 1);
          this.vehGarageZipCodeErrors.splice(i, 1);
        } else {
          this.removeVehicleFieldsAsRequired(i);
          this.vehiclesFormGroup(i).controls.operation.patchValue('delete');

          //reorder the vehicle list again when acvehicle is deleted.
          // this.vehiclesArrayControl.splice(i, 1);  // Commenting this line as it permanetly deleting from Form object and not passing the deleted Vehicle to POINT

          this.VINtelligenceErrMsgs[i] = false;
          this.vehGarageZipCodeErrors[i] = '';
        }
        this.isVINValid[i] = false;

        //On deleting vehicle check and remove duplicate hard edit
        this.checkForDuplicateVIN(i, 'delete');

        this.navigationService.addRequiredRoutes(this.navigationService.actionBasedRoutes('RemoveVehicle'));
        this.messageService.softError([]);
        this.messageService.showError([]);
        const vehicleDetails = this.vehiclesForm.controls.vehicles.value;
        const vehListOnScreen = vehicleDetails.filter((z: any, _i: number) => z.operation !== 'delete')
          .map(function (x: any) { return x.vin; });
        this.addVehicleBtnStatus = vehListOnScreen.length;
        this.reorderVehicleIndexNumber(vehicleDetails);
        this.logTracker.loginfo('VehiclesComponent', 'removeVehicle', 'Removing Vehicle', 'Removing Vehicle ' + i)
      }
    });
  }
  reorderVehicleIndexNumber(vehDetails: any): void {
    let vehIndNumber = 2;
    vehDetails.forEach((element: any, _z:number) => {
      if(element.operation !== 'delete' && _z > 0){
        this.vehiclesFormGroup(_z).controls.vehIndexNumber.patchValue(vehIndNumber++);

      }

    });

  }

  setVehicleFieldsAsRequired(index: any): void {
    const garageZipCode = this.vehiclesFormGroup(index).controls.garageZipCode;
    const acv = this.vehiclesFormGroup(index).controls.acv;
    const odometer = this.vehiclesFormGroup(index).controls.odometer;


    this.checkVINisRequired(index);
    CommonUtils.updateControlValidation(this.vehiclesFormGroup(index).controls.year, true);
    CommonUtils.updateControlValidation(this.vehiclesFormGroup(index).controls.make, true);
    CommonUtils.updateControlValidation(this.vehiclesFormGroup(index).controls.model, true);
    CommonUtils.updateControlValidation(this.vehiclesFormGroup(index).controls.bodyType, true);
    CommonUtils.updateControlValidation(this.vehiclesFormGroup(index).controls.type, true);
    CommonUtils.updateControlValidation(this.vehiclesFormGroup(index).controls.use, true);
    garageZipCode?.setValidators([Validators.required, ZipCodeValidator.zipcodeValidator]);
    acv?.setValidators(Validators.pattern(this.validAcvPattern));
    odometer?.setValidators(Validators.pattern(this.validOdometerPattern));

    garageZipCode?.updateValueAndValidity();
    acv?.updateValueAndValidity();
    odometer?.updateValueAndValidity();
  }

  removeVehicleFieldsAsRequired(index: any): void {
    CommonUtils.updateControlValidation(this.vehiclesFormGroup(index).controls.vin, false);
    CommonUtils.updateControlValidation(this.vehiclesFormGroup(index).controls.year, false);
    CommonUtils.updateControlValidation(this.vehiclesFormGroup(index).controls.make, false);
    CommonUtils.updateControlValidation(this.vehiclesFormGroup(index).controls.model, false);
    CommonUtils.updateControlValidation(this.vehiclesFormGroup(index).controls.bodyType, false);
    CommonUtils.updateControlValidation(this.vehiclesFormGroup(index).controls.trim, false);
    CommonUtils.updateControlValidation(this.vehiclesFormGroup(index).controls.type, false);
    CommonUtils.updateControlValidation(this.vehiclesFormGroup(index).controls.use, false);
    CommonUtils.updateControlValidation(this.vehiclesFormGroup(index).controls.garageZipCode, false);
    CommonUtils.updateControlValidation(this.vehiclesFormGroup(index).controls.acv, false);
    CommonUtils.updateControlValidation(this.vehiclesFormGroup(index).controls.odometer, false);
  }

  setVehicleModelDetailsRequired(status: boolean, index: number): void {
    if (!status) {

      this.checkVINisRequired(index);
      CommonUtils.updateControlValidation(this.vehiclesFormGroup(index).controls.year, true);
      CommonUtils.updateControlValidation(this.vehiclesFormGroup(index).controls.make, true);
      CommonUtils.updateControlValidation(this.vehiclesFormGroup(index).controls.model, true);
      CommonUtils.updateControlValidation(this.vehiclesFormGroup(index).controls.bodyType, true);
    } else {
      CommonUtils.updateControlValidation(this.vehiclesFormGroup(index).controls.vin, false);
      CommonUtils.updateControlValidation(this.vehiclesFormGroup(index).controls.year, false);
      CommonUtils.updateControlValidation(this.vehiclesFormGroup(index).controls.make, false);
      CommonUtils.updateControlValidation(this.vehiclesFormGroup(index).controls.model, false);
      CommonUtils.updateControlValidation(this.vehiclesFormGroup(index).controls.bodyType, false);
      this.vehiclesFormGroup(index).controls.year.patchValue('');
      this.vehiclesFormGroup(index).controls.make.patchValue('');
      this.vehiclesFormGroup(index).controls.model.patchValue('');
      this.vehiclesFormGroup(index).controls.bodyType.patchValue('');
    }
  }

  onUseChange(val: any, index: any): void {
   const additionalEquipment = this.vehiclesFormGroup(index).controls.CEQ.value;
   if(this.policyState === GlobalConstants.STATE_IL){
    const antiTheftCode=this.dbVehiclesData[index]?.discountIndicators?.find((x: { code: string; }) => x.code === 'antiTheftCode')?.value || '-';
    this.child.antiTheftCode = antiTheftCode;
    this.vehiclesFormGroup(index).controls.antiTheftCode.patchValue(antiTheftCode);
   }
    if (val.value === 'O') {
      // this.isStorageUSE = true;
      //this.disableRoadSide[index] = true;
      this.vehiclesFormGroup(index).controls.RA.patchValue('N');
      this.vehiclesFormGroup(index).controls.COL.patchValue('None');
      this.vehiclesFormGroup(index).controls.EXTR.patchValue('None');
      this.vehiclesFormGroup(index).controls.UMPD.patchValue(this.umpdDefaultValState);
      this.vehiclesFormGroup(index).controls.CEQ.patchValue(additionalEquipment);
    } else {
      // this.disableRoadSide[index] = false;
      if (additionalEquipment === GlobalConstants.NONE) {
        this.vehiclesFormGroup(index).controls.CEQ.patchValue('None');
        // this.vehiclesFormGroup(index).controls.COL.patchValue('None');
        // this.vehiclesFormGroup(index).controls.EXTR.patchValue('None');
      }

    }
    this.ComprehensiveCoverageOptions(index);

    this.logTracker.loginfo('VehiclesComponent', 'onUseChange', 'Vehicle Usage changed', 'Vehicle Usage Change'.concat(val));
  }

  disableLoanLease(index: number): boolean {
    const compVal = this.vehiclesFormGroup(index).controls.OTC.value;
    const collVal = this.vehiclesFormGroup(index).controls.COL.value;
    let returnVal = false;
    if (compVal === GlobalConstants.NONE || collVal === GlobalConstants.NONE) {
      this.vehiclesFormGroup(index).controls.ALL.patchValue('N');
    } else {
      returnVal = true;
    }
    return returnVal;
  }

  onTypeChange(val: any, index: any): void {
    const typeVal = val;
    this.child.vehTypeChange(val, index);
    this.vehiclesFormGroup(index).controls.vin.patchValue('');
    this.vehiclesFormGroup(index).controls.year.patchValue('');
    this.vehiclesFormGroup(index).controls.make.patchValue('');
    this.vehiclesFormGroup(index).controls.model.patchValue('');
    this.vehiclesFormGroup(index).controls.bodyType.patchValue('');
    if (typeVal === 'N') {
      // hide ACV field and remove field as required
      this.displayACVFlag[index] = false;
      CommonUtils.updateControlValidation(this.vehiclesFormGroup(index).controls.acv, false);
      this.vehiclesFormGroup(index).controls.acv.patchValue('0');
      this.resetVehCoverages(index);
      this.nonOwnerIndicator = true;
      this.isVINValid[index] = false; // if auto/trck has VIn filled already, then we need to make yr/mk/mdl/bdType editable
      this.setVehicleModelDetailsRequired(this.nonOwnerIndicator, index);
      this.checkForNonOwner();
      this.messageService.softError([]);
      this.navigationService.addRequiredRoutes(this.navigationService.actionBasedRoutes('VehicleNNO'));
    } else { // set vin, year,make,model,bodyType as requ if Type = auto/trck/van or conv Van
      this.nonOwnerIndicator = false;
      this.setVehicleModelDetailsRequired(this.nonOwnerIndicator, index);
      // show ACV field and hide make/model/bodytype if type=conv van
      if (typeVal === 'C') {
        this.displayACVFlag[index] = true;
        this.isVINValid[index] = false;  // if auto/trck has VIn filled already, then we need to make yr/mk/mdl/bdType editable
        CommonUtils.updateControlValidation(this.vehiclesFormGroup(index).controls.vin, false);
        this.vehiclesFormGroup(index).controls.vin.setValidators([Validators.pattern('^[A-Za-z0-9]*$'), Validators.maxLength(17)]);
        this.vehiclesFormGroup(index).controls.acv.setValidators([Validators.required, Validators.pattern(this.validAcvPattern)]);
        CommonUtils.updateControlValidation(this.vehiclesFormGroup(index).controls.make, false);
        CommonUtils.updateControlValidation(this.vehiclesFormGroup(index).controls.model, false);
        CommonUtils.updateControlValidation(this.vehiclesFormGroup(index).controls.bodyType, false);
        this.resetVehCoverages(index);
        this.messageService.softError([]);
        //this.navigationService.addRequiredRoutes(this.navigationService.actionBasedRoutes('VehicleNNO'));
        const setRouteRule = index == 0 ? 'VehicleNNO' : 'AddVehicle';
        this.navigationService.addRequiredRoutes(this.navigationService.actionBasedRoutes(setRouteRule));
      } else {
        // hide ACV field and remove field as required
        this.displayACVFlag[index] = false;
        CommonUtils.updateControlValidation(this.vehiclesFormGroup(index).controls.acv, false);
        this.vehiclesFormGroup(index).controls.acv.patchValue('0');
        CommonUtils.updateControlValidation(this.vehiclesFormGroup(index).controls.vin, true);
        this.resetVehCoverages(index);
        const setRouteRule = index == 0 && typeVal == 'A' ? 'VehicleNNO' : 'AddVehicle';
        this.navigationService.addRequiredRoutes(this.navigationService.actionBasedRoutes(setRouteRule));
      }
      this.navigationService.addRequiredRoutes(this.navigationService.actionBasedRoutes('AddVehicle'));
    }

    // Add the Navigation Rules


    this.checkVINisRequired(index);

    // Update USE coverage on TYPE change

    this.UseCoverageOptions(index);

    this.logTracker.loginfo('VehiclesComponent', 'onTypeChange', 'Vehicle Type changed', 'Vehicle Type Change'.concat(val));
  }

  resetVehCoverages(index: any){
    this.vehiclesFormGroup(index).controls.UMPD.patchValue(this.umpdDefaultValState);
      this.vehiclesFormGroup(index).controls.OTC.patchValue('None');
      this.vehiclesFormGroup(index).controls.COL.patchValue('None');
      this.vehiclesFormGroup(index).controls.CEQ.patchValue('None');
      this.vehiclesFormGroup(index).controls.EXTR.patchValue('None');
      this.vehiclesFormGroup(index).controls.RA.patchValue('N');
      this.vehiclesFormGroup(index).controls.ALL.patchValue('N');
  }

  decodeVin(index: any, symObj: any): void {

    const vinValue = (this.vehiclesFormGroup(index).controls.vin.value).toUpperCase();
    const typeValue = this.vehiclesFormGroup(index).controls.type.value;
    const yearValue = this.vehiclesFormGroup(index).controls.year.value;
    const makeValue = this.vehiclesFormGroup(index).controls.make.value;
    const modelValue = this.vehiclesFormGroup(index).controls.model.value;
    const bodyTypeValue = this.vehiclesFormGroup(index).controls.bodyType.value;
    const useValue = this.vehiclesFormGroup(index)?.controls.use.value;




    this.checkVINisRequired(index);

    const vintelStatus: VehVintelStatus = this.vehVintelStatusById[index];
    if (this.hasError('vin', 'pattern', index) || (vinValue === null || vinValue === '' || vinValue === undefined || vinValue.length < 10 ||
      (vintelStatus?.vin === vinValue && !ObjectUtils.isFieldEmpty(yearValue) && !ObjectUtils.isFieldEmpty(bodyTypeValue) && !ObjectUtils.isFieldEmpty(makeValue) && !ObjectUtils.isFieldEmpty(modelValue))
      || (!ObjectUtils.isFieldEmpty(yearValue) && yearValue <= 1980))) {
      if (vinValue === "") {
        this.vehiclesFormGroup(index)?.controls.year.patchValue("");
        this.vehiclesFormGroup(index)?.controls.make.patchValue("");
        this.vehiclesFormGroup(index)?.controls.model.patchValue("");
        this.vehiclesFormGroup(index).controls.bodyType.patchValue("");
        this.vehiclesFormGroup(index).controls.trim.patchValue("");
        this.isVINValid[index] = false;
      }

      return;
    }

    this.child.use = useValue;
    const isVINDuplicated = this.checkForDuplicateVIN(index, 'add');
    if (isVINDuplicated) {
      this.isVINValid[index] = false;
      return;
    }
    if (typeValue === 'C') {
      return;
    }
    this.updateVintelStatus(index, vinValue, '');

    this.showSpinnerService.showSpinner(true);

    this.retrieveSymbols(vinValue, index, symObj,this.onLoadVehiclesData)
  }

  retrieveSymbols(vinValue: any, index: any, symObj: any, vehiclesData: any) {
    let startTime = new Date();
    const symbolStatus = symObj?.length > 0 ? 'N' : 'Y';
    this.vintelligenceSymbolService.retrieveVehicleSpecsWithSymbols(CommonUtils.lrtrim(vinValue), this.mco,
      this.ratebook, symbolStatus).subscribe((res: VehicleSpecsAndSymbols) => {

        const vehicleId = index + 1;
        let vehErrMsg = false;
        this.showSpinnerService.showSpinner(false);
        if (res?.vehicle?.correctedVINIndicator) {
          this.vehiclesFormGroup(index).controls.vin.patchValue(res?.vehicle?.vehicleIdentificationNumber);
          const softErr = ['Vehicle ' + vehicleId + ' - ' + MessageConstants.CORRECTED_VIN_SOFT_MSG];
          this.messageService.softError(softErr);
          this.errorHandler();
          if (this.checkForDuplicateVIN(index, 'add')) {
            return;
          }
        } else {
          this.messageService.softError([]);
        }
        if (res?.vehicle?.correctedVINCode == '1') {
          const vehVinErrMsg = ['Vehicle ' + vehicleId + '-' + MessageConstants.VEHICLES_VIN_INVALID];
          this.messageService.softError(vehVinErrMsg);
          this.errorHandler();
        }

        this.logTracker.loginfo('VehiclesComponent', 'decodeVin', 'vintelligenceSymbolService.retrieveVehicleSpecsWithSymbols',
          'QuoteNumber='.concat(this.qid + '|Duration='.concat(CommonUtils.elapsedTime(startTime).toString())));

        if (CommonUtils.lrtrim(res?.vehicle?.vinDecodeCode) !== "") {
          vehErrMsg = true;
          this.vehiclesFormGroup(index)?.controls.year.patchValue("");
          this.vehiclesFormGroup(index)?.controls.make.patchValue("");
          this.vehiclesFormGroup(index)?.controls.model.patchValue("");
          this.vehiclesFormGroup(index).controls.bodyType.patchValue("");
        }
        this.VINtelligenceErrMsgs[index] = vehErrMsg;
        this.fieldLevelErrorHandler();
        // TODO: Uncomment during edits
        /*else if(res.vehicle.symbolCode === '0') {
          errMsgs.push(res.vehicle.symbolDescription);
        }*/
        if (!this.VINtelligenceErrMsgs[index]) {
          // populate year make model and type
          const year = res.vehicle.specifications.modelYear;
          const make = res.vehicle.specifications.manufacturerCode;
          const model = res.vehicle.specifications.modelName;
          const bodyType = res.vehicle.specifications.bodySpecifications.bodyStyleCode;
          const bodyTypeDesc = res.vehicle.specifications.bodySpecifications.bodyStyleDescription;
          const trim = res.vehicle.specifications.getTrimDescription;
          const symbols = this.getSymWithoutSpaces(res?.vehicle?.symbols);
          const antiTheftCode = res.vehicle.specifications.antiTheftCode;
          const antiLockBrakesOption = res.vehicle.specifications.bodySpecifications.antiLockBrakesOption;
          const airBagTypeCode = res.vehicle.specifications.airBagTypeCode;
          const daylightRunningLightsOption = res.vehicle.specifications.bodySpecifications.daylightRunningLightsOption;

          this.child.year = year;

          if (!ObjectUtils.isFieldEmpty(year)) {
            this.vehicleYears[index] = of([{ key: year, displayvalue: year }]);
            this.vehiclesFormGroup(index).controls.year.patchValue(year);
          }

          if (!ObjectUtils.isFieldEmpty(make)) {
            this.vehicleMakes[index] = of([{ key: make, displayvalue: res.vehicle.specifications.manufacturerName }]);
            this.vehiclesFormGroup(index).controls.make.patchValue(make);
          }

          if (!ObjectUtils.isFieldEmpty(model)) {
            this.vehicleModels[index] = of([{ key: model, displayvalue: model }]);
            this.vehiclesFormGroup(index).controls.model.patchValue(model);
          }
          if (!ObjectUtils.isFieldEmpty(bodyType)) {
            this.vehicleBodyTypes[index] = of([{ key: bodyType, displayvalue: bodyTypeDesc }]);
            this.vehiclesFormGroup(index).controls.bodyType.patchValue(bodyType);
          }

          if (!ObjectUtils.isFieldEmpty(trim)) {
            this.vehicleTrims[index] = of([{ key: trim, displayvalue: trim }]);
            this.vehiclesFormGroup(index).controls.trim.patchValue(trim);
          } else {
            this.vehicleTrims[index] = of([]);
            CommonUtils.updateControlValidation(this.vehiclesFormGroup(index).controls.trim, false);
          }
          const symbolsData = symObj.length > 0 ? symObj : symbols;
          this.vehiclesFormGroup(index).controls.symbols.patchValue(symbolsData);
          // Other  Vehicle Attributes
          //this.vehiclesFormGroup(index).controls.antiTheftCode.patchValue(antiTheftCode);
          this.vehiclesFormGroup(index).controls.antiLockBrakesOption.patchValue(antiLockBrakesOption);
          this.vehiclesFormGroup(index).controls.airBagTypeCode.patchValue(airBagTypeCode);
          this.vehiclesFormGroup(index).controls.daylightRunningLightsOption.patchValue(daylightRunningLightsOption);

          this.reportsByVehicleId[index] = 'VINTELSYM';
          this.showSpinnerService.showSpinner(false);

          this.UseCoverageOptions(index);
          this.isVINValid[index] = true;
          this.vinUpdateCheck(vehiclesData[index]?.vin, vinValue,res.vehicle.correctedVINCode);
          let onNonOwnerCheck = (vehiclesData[index]?.vin === vinValue || vehiclesData[index]?.vin === 'N/A') ? false : true;
          if (ObjectUtils.isFieldEmpty(res.vehicle.vehicleIdentificationNumber) || res.vehicle.vehicleIdentificationNumber.length < 17) {
            let vehicleId = index + 1;
            this.checkForBridgeEdits(['Vehicle ' + vehicleId + ' - ' + MessageConstants.VEHICLE_VIN_EDT_LESSTHAN_17]);
          }
          // console.log("onvinchange", res.vehicle.vehicleIdentificationNumber,  res, vinValue, vehiclesData[index]?.vin);
          if(res.vehicle.vehicleIdentificationNumber.length == 17 && (!ObjectUtils.isFieldEmpty(vehiclesData[index]?.vin) && this.checkUpdateVin && onNonOwnerCheck)){
            let vehicleId = index + 1;
            this.checkForBridgeEdits(['Vehicle ' + vehicleId + ' - ' + MessageConstants.VEHICLE_VIN_EDT_17]);
          }

        }
        else {
          this.isVINValid[index] = false;
        }
      },
        (errorData: any) => {
          this.logTracker.logerror('VehiclesComponent', 'decodeVin', 'vintelligenceSymbolService.retrieveVehicleSpecsWithSymbols',
            'Error=Vehicles Vintel|QuoteNumber='.concat(this.qid), errorData);
          this.errorHandler(errorData);
          this.isVINValid[index] = false;
        });
  }

  getSymWithoutSpaces(symbols: any) {
    let modifiedSymbols = symbols;
    symbols.forEach((symbol: any, i: number) => {
      if(symbol?.value.includes(" ")) {
        modifiedSymbols[i].value = symbol?.value.replace(/\s/g, '');
      }
    })
    return modifiedSymbols;
  }

  vinUpdateCheck(vin: any, updatedVin: any, vinCode: any) {
    if(vinCode === '0') {
      this.checkUpdateVin = true;
    } else {
      this.checkUpdateVin = false;
    }
}

  validvaluesreq = (): ValidValuesReq => {
    return {
      appName: GlobalConstants.APP_NAME,
      pageName: GlobalConstants.VEHICLE_PAGE_NAME,
      mco: GlobalConstants.MCO_ALL_VALID_VALUES,
      ratebook: GlobalConstants.RATEBOOK_ALL_VALID_VALUES,
      state: this.policyState,
      dropdownName: GlobalConstants.DROPDOWN_ALL_VALID_VALUES,
      filter:''
    };
  }
  private loadValidValues(data: ValidValuesRes): void {
    this.vehicleObject.typeValues = data.responseMap.vehicletype;
    this.vehicleObject.useValues = data.responseMap.vehicleuse;
    this.vehicleObject.comprehensiveValues = data.responseMap.vehiclecomprehensive;
    this.vehicleObject.umpdValues = data.responseMap.vehicleumpd;
    this.vehicleObject.collisionValues = data.responseMap.vehiclecollision;
    this.vehicleObject.additionalEquipmentValues = data.responseMap.vehicleadditionalequipment;
    this.vehicleObject.rentalValues = data.responseMap.vehiclerental;
    this.vehicleObject.antitheftValues = data.responseMap.antitheft;
    this.vehicleObject.years = data.responseMap.vehicleyear;


    // Filter Vehicle Years/Make/Model/BodyType for first Vehicle
    this.filterYearMakeModelBodyTypeValues(0);

    this.logTracker.loginfo('VehiclesComponent', 'ngOnInit-loadValidValues', 'validValuesService.getValidValues', 'Retrieve Valid Values Successful');


  }
  /* VINtelligence ErrorHandler */
  VINtelligenceErrorHandler(index: number) {
    if (this.VINtelligenceErrMsgs[index] === "") {
      this.vehiclesFormGroup(index)?.controls.year.patchValue("");
      this.vehiclesFormGroup(index)?.controls.make.patchValue("");
      this.vehiclesFormGroup(index)?.controls.model.patchValue("");
      this.vehiclesFormGroup(index).controls.bodyType.patchValue("");
      this.fieldLevelErrorHandler();
    }
    return this.VINtelligenceErrMsgs[index] !== "" ? false : true;
  }
  /* API error handling*/
  fieldLevelErrorHandler() {
    let errorList: string[] = [];
    if (!this.checkForNonOwner()) {

      errorList = this.duplicateVINErrMSG.length > 0 ? errorList.concat(this.duplicateVINErrMSG) : errorList;
      this.VINtelligenceErrMsgs.forEach((val: any, i: number) => {
        if (val) {
          const vehErrMsg = 'Vehicle ' + (i + 1) + '-' + MessageConstants.VEHICLES_VIN_INVALID;
          errorList.push(vehErrMsg);
        }
      });
      this.vehGarageZipCodeErrors.forEach((val: any, i: number) => {
        if (val && val !== '') {
          const vehErrMsg = 'Vehicle ' + (i + 1) + '-' + val;
          errorList.push(vehErrMsg);
        }
      });
      errorList = errorList.filter(x => (x !== "" || x != null || x != undefined));
      this.messageService.showError(errorList);
      if (errorList.length > 0) {
        const element = document.querySelector('#topcontent');
        element?.scrollIntoView();
        this.showSpinnerService.showSpinner(false);
        return true;
      }
    }
    return false;
  }
  /* API error handling*/
  errorHandler(errorData?: any): void {
    if (errorData) {
      errorData?.error?.transactionNotification?.remark?.forEach((val: any) => {
        this.serverErrorArr.push(val.messageText);
      });
      this.messageService.showError(this.serverErrorArr);
    }
    const element = document.querySelector('#topcontent');
    element?.scrollIntoView();
    this.showSpinnerService.showSpinner(false);
  }

  filter(filter: string): ValidValues[] {

    this.lastFilter = filter;
    if (filter) {
      return this.vehicleObject.years.filter(option => {
        return option.displayvalue.indexOf(filter) >= 0;
      });
    } else {
      return this.vehicleObject.years; // .slice();
    }
  }

  _filter(filter: string, dbCollection: any): Observable<ValidValues[]> {

    if (dbCollection === undefined || dbCollection.length === 0) {
      return of([]);
    }

    return dbCollection.filter((option: ValidValues) => {
      return option.displayvalue.toLowerCase().indexOf(filter.toLowerCase()) === 0;
    });

  }


  displayFn(value: ValidValues[] | string): string | undefined {
    let displayValue!: string;
    if (Array.isArray(value)) {
      value?.forEach((vehyear, _index) => {

        displayValue = vehyear.displayvalue;

      });
    } else {
      displayValue = value;
    }
    return displayValue;
  }


  filterYearMakeModelBodyTypeValues(vehicleindex: any): void {
    this.filteredVehYears = this.vehiclesFormGroup(vehicleindex).controls.year?.valueChanges.pipe(startWith<string | ValidValues[]>(''),
      map(value => typeof value === 'string' ? value : this.lastFilter),
      map(filter => this.filter(filter)));
    this.vehicleYears[vehicleindex] = this.filteredVehYears;

    this.vehicleMakes[vehicleindex] = this.vehiclesFormGroup(vehicleindex).controls.make.valueChanges.pipe(
      startWith<string | ValidValues>(''),
      map(value => typeof value === 'string' ? value : value?.displayvalue),
      map(filter => filter ? this._filter(filter, this.vehicleMakesDB[vehicleindex]) : this.vehicleMakesDB[vehicleindex]));

    this.vehicleModels[vehicleindex] = this.vehiclesFormGroup(vehicleindex).controls.model.valueChanges.pipe(
      startWith<string | ValidValues>(''),
      map(value => typeof value === 'string' ? value : value?.displayvalue),
      map(filter => filter ? this._filter(filter, this.vehicleModelsDB[vehicleindex]) : this.vehicleModelsDB[vehicleindex]));

    this.vehicleBodyTypes[vehicleindex] = this.vehiclesFormGroup(vehicleindex).controls.bodyType.valueChanges.pipe(
      startWith<string | ValidValues>(''),
      map(value => typeof value === 'string' ? value : value?.displayvalue),
      map(filter => filter ? this._filter(filter, this.vehicleBodyTypesDB[vehicleindex]) : this.vehicleBodyTypesDB[vehicleindex]));

    this.vehicleTrims[vehicleindex] = this.vehiclesFormGroup(vehicleindex).controls.trim.valueChanges.pipe(
      startWith<string | ValidValues>(''),
      map(value => typeof value === 'string' ? value : value?.displayvalue),
      map(filter => filter ? this._filter(filter, this.vehicleTrimsDB[vehicleindex]) : this.vehicleTrimsDB[vehicleindex]));


  }
  onClickBack(formData: any): void {
    this.clickBack = true;
    this.logTracker.loginfo('VehiclesComponent', 'onClickBack', 'Back Button Clicked', 'Vehicle Form Submission');
    this.onSubmit(formData);
  }

  launchViolations(quoteId: string): void {
    this.router.navigateByUrl('/violations?qid=' + quoteId);
  }

  retrieveMakes(vehindex: any): void {
    const vehType = this.vehiclesFormGroup(vehindex).controls.type.value;
    const selectedVin = this.vehiclesFormGroup(vehindex).controls.vin.value;
    const selectedYear = this.vehiclesFormGroup(vehindex).controls.year.value;
    this.checkVINisRequired(vehindex);
    this.child.year = selectedYear;
    // Update comp,coll,addEqu to 'Not available'
    if ((selectedYear && Number(selectedYear) <= 1980)) {
      this.vehiclesFormGroup(vehindex).controls.OTC.patchValue(GlobalConstants.NONE);
      this.vehiclesFormGroup(vehindex).controls.COL.patchValue(GlobalConstants.NONE);
      this.vehiclesFormGroup(vehindex).controls.CEQ.patchValue(GlobalConstants.NONE);
      this.vehiclesFormGroup(vehindex).controls.EXTR.patchValue(GlobalConstants.NONE);
      this.vehiclesFormGroup(vehindex).controls.UMPD.patchValue(this.umpdDefaultValState);
      // Update the Use,Comprehensive coverage Values on Year Change
      this.UseCoverageOptions(vehindex);
      this.ComprehensiveCoverageOptions(vehindex);
    }
    const vintelStatus: VehVintelStatus = this.vehVintelStatusById[vehindex];
    if (ObjectUtils.isFieldEmpty(selectedYear) || vehType === 'C' || this.isVINValid[vehindex]) {
      return;
    }
    else {
      this.vehiclesFormGroup(vehindex).controls.vin.patchValue('');
      this.vehiclesFormGroup(vehindex).controls.make.patchValue('');
      this.vehiclesFormGroup(vehindex).controls.model.patchValue('');
      this.vehiclesFormGroup(vehindex).controls.bodyType.patchValue('');
      this.vehiclesFormGroup(vehindex).controls.trim.patchValue('');
      this.vehicleMakes[vehindex] = of([]);
      this.vehicleModels[vehindex] = of([]);
      this.vehicleBodyTypes[vehindex] = of([]);
      this.vehicleTrims[vehindex] = of([]);
    }
    if ((selectedYear && Number(selectedYear) > 1980)) {
      let startTime = new Date();
      this.vintelligenceSymbolService.retrieveVehicleMakes(CommonUtils.lrtrim(selectedYear)).subscribe((res: VintelMakesResponse) => {
        const vehMakes: ValidValues[] = [];

        res?.makes?.forEach(make => {
          make.specifications?.forEach((spec: Specification) => {
            vehMakes.push({ key: spec.identifier, displayvalue: spec.fullname });
          })
        });


        this.vehicleMakes[vehindex] = of(vehMakes?.sort((a, b) => a.displayvalue > b.displayvalue ? 1 : -1));
        this.vehicleMakesDB[vehindex] = vehMakes.filter((ele, index, array) =>
          index === array.findIndex((testEl) => testEl.displayvalue === ele.displayvalue )
        );
        this.filterYearMakeModelBodyTypeValues(vehindex);
        // Update the model to verify the value change and decide to invoke the service again
        this.updateVintelStatus(vehindex, selectedVin, selectedYear);
        // Update the Use,Comprehensive coverage Values on Year Change
        this.UseCoverageOptions(vehindex);
        this.ComprehensiveCoverageOptions(vehindex);

        this.logTracker.loginfo('VehiclesComponent', 'retrieveMakes', 'vintelligenceSymbolService.retrieveVehicleMakes',
          'QuoteNumber='.concat(this.qid + '|Duration='.concat(CommonUtils.elapsedTime(startTime).toString())));
      },
        (errorData: any) => {
          this.logTracker.logerror('VehiclesComponent', 'retrieveMakes', 'vintelligenceSymbolService.retrieveVehicleMakes',
            'Error=Vehicles Retrieve Vehicle Makes|QuoteNumber='.concat(this.qid), errorData);
          this.errorHandler(errorData);
        });
    }
  }

  retrieveModels(vehindex: any): void {
    const selectedVin = this.vehiclesFormGroup(vehindex).controls.vin.value;
    const selectedYear = this.vehiclesFormGroup(vehindex).controls.year.value;
    const selectedMake = this.vehiclesFormGroup(vehindex).controls.make.value;
    this.checkVINisRequired(vehindex);

    const vintelStatus: VehVintelStatus = this.vehVintelStatusById[vehindex];
    if (!ObjectUtils.isObjectEmpty(vintelStatus) && (selectedYear === vintelStatus.year && selectedMake === vintelStatus.make)
      || this.isVINValid[vehindex]) {
      return;
    }
    else {
      this.vehiclesFormGroup(vehindex).controls.vin.patchValue('');
      this.vehiclesFormGroup(vehindex).controls.model.patchValue('');
      this.vehiclesFormGroup(vehindex).controls.bodyType.patchValue('');
      this.vehiclesFormGroup(vehindex).controls.trim.patchValue('');
      this.vehicleModels[vehindex] = of([]);
      this.vehicleBodyTypes[vehindex] = of([]);
      this.vehicleTrims[vehindex] = of([]);
    }

    const selectedMakeKey = !ObjectUtils.isFieldEmpty(selectedMake) && this.vehicleMakesDB[vehindex] ? this.vehicleMakesDB[vehindex].find((x: { displayvalue: any; }) => x.displayvalue === selectedMake)?.key : '';
    if (!ObjectUtils.isFieldEmpty(selectedYear) && !ObjectUtils.isFieldEmpty(selectedMakeKey) && Number(selectedYear) > 1980) {

      let startTime = new Date();
      this.vintelligenceSymbolService.retrieveVehicleModels(CommonUtils.lrtrim(selectedYear), CommonUtils.lrtrim(selectedMakeKey))
        .subscribe((res: VintelModelsResponse) => {
          const vehModels: ValidValues[] = [];
          res?.models?.forEach(model => {
            model.specifications?.forEach((spec: ModelSpecs) => {
              vehModels.push({ key: spec?.name, displayvalue: spec.value });
            })
          });

          this.vehicleModels[vehindex] = of(vehModels?.sort((a, b) => a.displayvalue > b.displayvalue ? 1 : -1));
          this.vehicleModelsDB[vehindex] = vehModels;

          this.filterYearMakeModelBodyTypeValues(vehindex);
          // Update the model to verify the value change and decide to invoke the service again
          this.updateVintelStatus(vehindex, selectedVin, selectedYear, selectedMake);

          this.logTracker.loginfo('VehiclesComponent', 'retrieveMakes', 'vintelligenceSymbolService.retrieveVehicleModels',
            'QuoteNumber='.concat(this.qid + '|Duration='.concat(CommonUtils.elapsedTime(startTime).toString())));
        },
          (errorData: any) => {
            this.logTracker.logerror('VehiclesComponent', 'retrieveModels', 'vintelligenceSymbolService.retrieveVehicleModels',
              'Error=Vehicles Retrieve Vehicle Models|QuoteNumber='.concat(this.qid), errorData);
            this.errorHandler(errorData);
          });
    }
  }

  retrieveBodyTypes(vehindex: any): void {
    const selectedVin = this.vehiclesFormGroup(vehindex).controls.vin.value;
    const selectedYear = this.vehiclesFormGroup(vehindex).controls.year.value;
    const selectedMake = this.vehiclesFormGroup(vehindex).controls.make.value;
    const selectedModel = this.vehiclesFormGroup(vehindex).controls.model.value;
    this.checkVINisRequired(vehindex);

    const vintelStatus: VehVintelStatus = this.vehVintelStatusById[vehindex];
    if (!ObjectUtils.isObjectEmpty(vintelStatus) && (selectedYear === vintelStatus.year &&
      selectedMake === vintelStatus.make && selectedModel === vintelStatus.model) || this.isVINValid[vehindex]) {
      return;
    }
    else {
      this.vehiclesFormGroup(vehindex).controls.vin.patchValue('');
      this.vehiclesFormGroup(vehindex).controls.bodyType.patchValue('');
      this.vehiclesFormGroup(vehindex).controls.trim.patchValue('');
      this.vehicleBodyTypes[vehindex] = of([]);
      this.vehicleTrims[vehindex] = of([]);
    }
    const selectedMakeKey = !ObjectUtils.isFieldEmpty(selectedMake) && this.vehicleMakesDB[vehindex] ? this.vehicleMakesDB[vehindex].find((x: { displayvalue: any; }) => x.displayvalue === selectedMake)?.key : '';
    const selectedModelKey = !ObjectUtils.isFieldEmpty(selectedModel) && this.vehicleModelsDB[vehindex] ? this.vehicleModelsDB[vehindex].find((x: { displayvalue: any; }) => x.displayvalue === selectedModel)?.key : '';
    if (!ObjectUtils.isFieldEmpty(selectedYear) && !ObjectUtils.isFieldEmpty(selectedMakeKey)
      && !ObjectUtils.isFieldEmpty(selectedModelKey) && Number(selectedYear) > 1980) {


      const vehicle: Vehicle = {
        make: selectedMakeKey,
        model: selectedModelKey,
        year: selectedYear,
        vehicleTrimName: '',
        vehicleType: ['P', 'T']
      };

      const searchByCriteria: SearchByCriteria = {
        vehicle
      };
      this.vinPrefixReq = {
        searchByCriteria
      };
      let startTime = new Date();
      this.vintelligenceSymbolService.retrieveVinPrefix(this.vinPrefixReq).subscribe((data: VinPrefixRes) => {
        const vehBodyTypes: ValidValues[] = [];

        this.vehiclePrefixData[vehindex] = data.vehicles;
        data?.vehicles?.forEach((veh: VehiclePrefix) => {
          vehBodyTypes.push({ key: veh.vehicleModel.bodyStyleCode, displayvalue: veh.vehicleModel.bodyStyleDescription });
        });

        this.vehicleBodyTypesDB[vehindex] = vehBodyTypes?.sort((a, b) => a.displayvalue > b.displayvalue ? 1 : -1)
          .filter(
            (btype, i, arr) => arr.findIndex(t => t.key === btype.key) === i);

        this.filterYearMakeModelBodyTypeValues(vehindex);

        // Update the model to verify the value change and decide to invoke the service again
        this.updateVintelStatus(vehindex, selectedVin, selectedYear, selectedMake, selectedModel);


        this.logTracker.loginfo('VehiclesComponent', 'retrieveBodyTypes', 'vintelligenceSymbolService.retrieveVinPrefix',
          'QuoteNumber='.concat(this.qid + '|Duration='.concat(CommonUtils.elapsedTime(startTime).toString())));
        // Display Trim field
        // this.displayTrimField(vehindex);
      },
        (errorData: any) => {
          this.logTracker.logerror('VehiclesComponent', 'retrieveBodyTypes', 'vintelligenceSymbolService.retrieveVinPrefix',
            'Error=Vehicles Retrieve Vehicle Body Types|QuoteNumber='.concat(this.qid), errorData);
          this.errorHandler(errorData);
        }
      );
    }
  }

  retrieveTrims(vehindex: any): void {
    const selectedBodyType = this.vehiclesFormGroup(vehindex).controls.bodyType.value;
    this.checkVINisRequired(vehindex);
    if (ObjectUtils.isFieldEmpty(selectedBodyType) || this.vehiclePrefixData[vehindex]?.length <= 0
      || this.isVINValid[vehindex]) {
      return;
    }
    const vehTrims: ValidValues[] = [];
    const filteredBodyTypes = this.vehiclePrefixData[vehindex]?.filter((vehList: any) =>
      selectedBodyType === vehList.vehicleModel.bodyStyleCode
    );

    filteredBodyTypes?.forEach((veh: VehiclePrefix) => {
      if (!ObjectUtils.isFieldEmpty(veh.getTrimDescription)) {
        vehTrims.push({ key: veh.getTrimDescription, displayvalue: veh.getTrimDescription });
      }

    });

    this.vehicleTrimsDB[vehindex] = vehTrims?.sort((a, b) => a.displayvalue > b.displayvalue ? 1 : -1)
      .filter(
        (btrim, i, arr) => arr.findIndex(t => t.key === btrim.key) === i);

    if (this.vehicleTrimsDB[vehindex].length === 0) {
      CommonUtils.updateControlValidation(this.vehiclesFormGroup(vehindex).controls.trim, false);
      this.pickVinPrefix(vehindex);
    } else if (this.vehicleTrimsDB[vehindex].length === 1) {
      this.vehiclesFormGroup(vehindex).controls.trim.patchValue(this.vehicleTrimsDB[vehindex][0].key);
      CommonUtils.updateControlValidation(this.vehiclesFormGroup(vehindex).controls.trim, true);
      this.pickVinPrefix(vehindex);
    } else {
      CommonUtils.updateControlValidation(this.vehiclesFormGroup(vehindex).controls.trim, true);
      this.filterYearMakeModelBodyTypeValues(vehindex);
    }

    this.logTracker.loginfo('VehiclesComponent', 'retrieveTrims', 'Retrieving Trims', 'Retrieving Trims vehiclePrefixData for Vehicle '.concat(vehindex));
  }

  pickVinPrefix(vehindex: any): void {
    const selectedBodyType = this.vehiclesFormGroup(vehindex).controls.bodyType.value;
    const selectedTrim = this.vehiclesFormGroup(vehindex).controls.trim.value;

    let validVINs;
    this.checkVINisRequired(vehindex);
    if (ObjectUtils.isFieldEmpty(selectedBodyType) || (this.vehicleTrimsDB[vehindex]?.length > 0 && ObjectUtils.isFieldEmpty(selectedTrim))
      || this.vehiclePrefixData[vehindex]?.length <= 0) {
      return;
    }

    // get valid vin details
    if (ObjectUtils.isFieldEmpty(selectedTrim)) {
      validVINs = this.vehiclePrefixData[vehindex]?.filter((vehList: any) =>
        selectedBodyType === vehList.vehicleModel.bodyStyleCode
      );
    } else {
      validVINs = this.vehiclePrefixData[vehindex]?.filter((vehList: any) =>
        (selectedBodyType === vehList.vehicleModel.bodyStyleCode && selectedTrim === vehList.getTrimDescription)
      );
    }
    if (validVINs?.length > 1) {
      this.openVinPrefixDialog(vehindex, validVINs);
    } else if (validVINs?.length === 1) {
      this.vehiclesFormGroup(vehindex).controls.vin.patchValue(validVINs[0].vehicleModel.vehicleIdentificationNumberPrefix);
      this.decodeVin(vehindex, []);
    }

    this.logTracker.loginfo('VehiclesComponent', 'pickVinPrefix', 'Pick VinPrefix', 'Picking VIN prefix for Vehicle '.concat(vehindex));
  }



  pickValidVinPrefill(vinObj: any, index?: any): void {
    this.checkVINisRequired(index);
    if (vinObj.length > 0) {
      this.showSpinnerService.showSpinner(true);
       vinObj = this.sortVINsByLatestYear(vinObj);
    let priorVehicleVinList = JSON.parse(JSON.stringify(vinObj));
      let startTime = new Date();

      const splitVinObj = new Array(Math.ceil(vinObj.length / 6)).fill(vinObj)
        .map(_ => vinObj.splice(0, 6));

      from(splitVinObj).pipe(
        concatMap(e => this.vintelligenceSymbolService.retrieveVehicleSymbols(this.createSymbolsReq(e))
        .pipe(
          map(objResult => {
            this.getValidVinWithSymbols(objResult, priorVehicleVinList);
            return objResult;
          }),
        )),
        takeWhile(objResult => this.finalValidVinList.length < 6)
      ).subscribe({
        next: (res: VehicleSymbolsRes) => console.log(''),
        error: (errorData: any) => {
          this.logTracker.logerror('VehiclesComponent', 'pickValidVinPrefill', 'vintelligenceSymbolService.retrieveVehicleSymbols',
            'Error=Vehicles Retrieve Vehicle Symbols|QuoteNumber='.concat(this.qid), errorData);
          this.errorHandler(errorData);
        },
        complete: () => {
          this.showSpinnerService.showSpinner(false);
          if (this.finalValidVinList.length > 0) {
            this.openVinPrefillDialog(this.finalValidVinList);
          }
          this.logTracker.loginfo('VehiclesComponent', 'pickValidVinPrefill', 'vintelligenceSymbolService.retrieveVehicleSymbols',
          'QuoteNumber='.concat(this.qid + '|Duration='.concat(CommonUtils.elapsedTime(startTime).toString())));
          // console.log("=====DONE=====");
        }
        });
    } else {
      this.showSpinnerService.showSpinner(false);
    }
  }
  getValidVinWithSymbols(res: any, vinObj: any) {
     const vinWithSymbols: string[] = [];
    const vinList = res.vehicles;
          vinList?.forEach((vehDetails: any) => {
            if (vehDetails.symbols.length > 0 && vehDetails?.symbols[0]?.name !== 'ERROR') {
              vinWithSymbols.push(vehDetails);
            }
          });
          // get selected vin details
          const validVINs =  vinWithSymbols.filter((vehList: any) =>
            vinObj.map((popupVin: any) =>
            {
              if (popupVin.vin === vehList.vin) {
                // console.log(vehList);
                vehList['make'] = popupVin?.make;
                vehList['model'] = popupVin?.model;
                vehList['year'] = popupVin?.year;
              }
            }
            ));
    this.finalValidVinList = validVINs.length > 0 ? this.finalValidVinList.concat(validVINs) : this.finalValidVinList;
    return this.finalValidVinList;
  }

  sortVINsByLatestYear(vinObj:any) {
    return vinObj?.sort((a: any, b: any) => a.year < b.year ? 1 : -1);
  }

  openVinPrefixDialog(index: any, vinData: any): void {
    const dialogRef = this.vinPrefixDialog.open(VehicleVinPrefixPopupComponent, {
      width: '80%',
      panelClass: 'vin-prefix-full-width-dialog',
      disableClose: true,
      data: {
        index,
        data: vinData
      }
    });
    dialogRef.afterClosed().subscribe((result: any) => {
      const dialogValue = result;
      if (dialogValue.event) {
        // get selected vin details and display in screen
        const selectedVIN = vinData.filter((vinList: any) =>
          dialogValue.data.some((popupVin: any) =>
            popupVin.vehicleModel.vehicleIdentificationNumberPrefix === vinList.vehicleModel.vehicleIdentificationNumberPrefix)
        );
        this.vehiclesFormGroup(index).controls.vin.patchValue(selectedVIN[0].vehicleModel.vehicleIdentificationNumberPrefix);
        this.decodeVin(index, []);
      }
    });
  }

  openVinPrefillDialog(vinData: any): void {
    const dialogRef = this.vinPrefixDialog.open(VehicleVinPrefillPopupComponent, {
      width: '95%',
      panelClass: 'full-width-dialog',
      disableClose: true,
      data: {
        data: vinData
      }
    });
    dialogRef.afterClosed().subscribe((result: any) => {
      const dialogValue = result;
      if (dialogValue.event) {
        // get selected vin details and display in screen
        const selectedVIN = vinData.filter((vinList: any) =>
          dialogValue.data.some((popupVin: any) => popupVin === vinList.vin)
        );

        selectedVIN.forEach((vehDetails: any) => {
          let index = this.vehicleList.length;
          const vinValue = this.vehiclesFormGroup(0).controls.vin.value;
          const yearValue = this.vehiclesFormGroup(0).controls.year.value;
          if (index === 1 && vinValue === GlobalConstants.EMPTY_STRING && yearValue === GlobalConstants.EMPTY_STRING) {
            index = 0;
            this.vehiclesFormGroup(index).controls.vin.patchValue(vehDetails.vin);
          } else {
            this.addVehicle();
            this.vehiclesFormGroup(index).controls.vin.patchValue(vehDetails.vin);
            this.vehiclesFormGroup(index).controls.operation.patchValue('Add');
          }
            this.decodeVin(index, vehDetails?.symbols);
         });
      }
    });
  }

  updateVintelStatus(vehindex: any, selectedVin: string, selectedYear: string, selectedMake?: string,
    selectedModel?: string, selectedBodyType?: string, selectedTrim?: string): void {
    const vintelStatus: VehVintelStatus = {
      year: selectedYear, make: selectedMake, model: selectedModel, bodyType: selectedBodyType,
      trim: selectedTrim, reportType: 'VINTELMANUAL', vin: selectedVin
    };
    this.vehVintelStatusById[vehindex] = vintelStatus;
  }

  UseCoverageOptions(vehindex: any): void {
    const year = this.vehiclesFormGroup(vehindex)?.controls.year.value;
    const typeValue = this.vehiclesFormGroup(vehindex)?.controls.type.value;
    const useValue = this.vehiclesFormGroup(vehindex)?.controls.use.value;
    const umpdVal = this.vehiclesFormGroup(vehindex)?.controls.UMPD.value;

    //this.child.year = year;
    this.vehicleUseValues[vehindex] = this.vehicleObject.useValues;
    if (this.nonOwnerIndicator || typeValue === 'N') {
      let useValidvalues = this.vehicleObject.useValues;
      useValidvalues = useValidvalues.filter((obj, i) => obj.key === 'P');
      this.vehicleUseValues[vehindex] = useValidvalues;
      this.vehiclesFormGroup(vehindex)?.controls.use.patchValue('P');
    } else {
      if ((year && Number(year) <= 1980)) {
        let useValidvalues = this.vehicleObject.useValues;
        useValidvalues = useValidvalues?.filter((obj, i) => obj.key !== 'O');
        this.vehicleUseValues[vehindex] = useValidvalues;
        this.vehiclesFormGroup(vehindex)?.controls.use.patchValue('P');
      } else {
        this.vehicleUseValues[vehindex] = this.vehicleObject.useValues;
        this.vehiclesFormGroup(vehindex)?.controls.use.patchValue(useValue);
      }
    }
    if (ObjectUtils.isFieldEmpty(year) || year <=1980){
      this.vehiclesFormGroup(vehindex)?.controls.UMPD.patchValue(this.umpdDefaultValState);
      }else{
        // console.log("umpdVal"+umpdVal);
        this.vehiclesFormGroup(vehindex)?.controls.UMPD.patchValue(umpdVal);
    }
  }

  ComprehensiveCoverageOptions(vehindex: any): void {
    const useValue = this.vehiclesFormGroup(vehindex).controls.use.value;
    const umpd = this.vehiclesFormGroup(vehindex).controls.UMPD.value;
    const year = this.vehiclesFormGroup(vehindex).controls.year.value;
    const comp = this.vehiclesFormGroup(vehindex).controls.OTC.value;
    this.child.year = year;
    this.child.use = useValue;
    if (useValue === 'O' && (year && Number(year) > 1980)) {
      let compValidvalues = this.vehicleObject.comprehensiveValues;
      compValidvalues = compValidvalues.filter((obj) => obj.key !== GlobalConstants.NONE);
      this.vehicleComprehensiveValues[vehindex] = compValidvalues;

      if (comp === GlobalConstants.NONE) {
        this.vehiclesFormGroup(vehindex).controls.OTC.patchValue('500OTC');
      }
    } else {
      this.vehicleComprehensiveValues[vehindex] = this.vehicleObject.comprehensiveValues;
      this.vehiclesFormGroup(vehindex).controls.OTC.patchValue(comp);
      this.vehiclesFormGroup(vehindex).controls.UMPD.patchValue(umpd);

    }
  }
  garageZipCodeLogic(index: any): void {
    const zipcodeFormat = new zipcodePipe();
    const vehicleGarageZipCode = this.vehiclesFormGroup(index).controls.garageZipCode.value;
    if (vehicleGarageZipCode === GlobalConstants.EMPTY_STRING && index != 0) { // expect vehicle 1, if any new vehicle is added, prefill vehicles garage zipcode with  vehicle1 garage zipcode
      const firstVehZip = this.vehiclesFormGroup(0).controls.garageZipCode.value;
      (this.vehGarageZipCodeErrors.length > 0 && this.vehGarageZipCodeErrors[0] !== GlobalConstants.EMPTY_STRING) ?
        this.vehiclesFormGroup(index).controls.garageZipCode.patchValue(GlobalConstants.EMPTY_STRING) :
        this.vehiclesFormGroup(index).controls.garageZipCode.patchValue(zipcodeFormat.transform(firstVehZip));
      this.vehGarageZipCodeByVehicleId[index] = this.applicantAddress.postalCode;
    } else if (index == 0 && (vehicleGarageZipCode === GlobalConstants.EMPTY_STRING || vehicleGarageZipCode === null) && !this.applicantAddress.POBoxIndicator && this.mailingStateStatus) { // only for vehicle 1, if poxbox is unchecked and mailing zipcode is not outOfState then prefill vehicle 1 garageZipCode with mailing zipCode
      this.vehiclesFormGroup(index).controls.garageZipCode.patchValue(zipcodeFormat.transform(this.applicantAddress.postalCode.substring(0,5)));
      this.vehGarageZipCodeByVehicleId[index] = this.applicantAddress.postalCode;
    } else if (index == 0 && (vehicleGarageZipCode === GlobalConstants.EMPTY_STRING || vehicleGarageZipCode === null) && (this.applicantAddress.POBoxIndicator || !this.mailingStateStatus)) { // only for vehicle 1, if poxbox is checked or  mailing zipcode is  outOfState then empty vehicle 1 garageZipCode
      this.vehiclesFormGroup(index).controls.garageZipCode.patchValue(GlobalConstants.EMPTY_STRING);
      this.vehGarageZipCodeByVehicleId[index] = GlobalConstants.EMPTY_STRING;
    }
  }

  onZipcodeChange(event: any) {
    let newVal = event.replace(/\D/g, "");
    this.vehicleZipCode = newVal;
  }

  createSymbolsReq(vins: any): VehicleSymbolsReq {
    const vehicleInfo: VehicleSymReqInfo[] = [];
    vins.forEach((vinObj: any) => {
      vehicleInfo.push({
        vin: vinObj.vin,
        state: this.policyState,
        rateBook: this.ratebook,
        masterCompany: this.mco,
        lineOfBusiness: GlobalConstants.LINE_OF_BUSINESS
      });
    });

    const vehicleSymbolsReq: VehicleSymbolsReq = {
      vehicles: vehicleInfo
    };
    return vehicleSymbolsReq;
  }

  onLoadBusinessLogic(vehicleType: any, year: any, compVal: any, compCode: any, collVal: any, use: any, index: number): void {
    this.vehiclesFormGroup(index)?.controls?.type?.patchValue(vehicleType);
    this.vehiclesFormGroup(index)?.controls?.year?.patchValue(year);
    const comprehensive = (compVal !== '0' && !isNaN(+compVal)) ?
      CommonUtils.toInteger(compVal)?.toString() + compCode : GlobalConstants.NONE;
    const collision = (collVal !== '0' && !isNaN(+collVal)) ? CommonUtils.toInteger(collVal)?.toString() : GlobalConstants.NONE;
    let useValidvalues = this.vehicleObject?.useValues;
    if (vehicleType === GlobalConstants.NON_OWNER_CODE) {
      this.nonOwnerIndicator = true;
      this.setVehicleModelDetailsRequired(true, index);
      useValidvalues = useValidvalues?.filter((obj, i) => obj.key === 'P');
    } else {
      this.setVehicleModelDetailsRequired(false, index);
      // if type=conv van, show ACV field and hide make/model/bodytype
      if (vehicleType === 'C') {
        this.displayACVFlag[index] = true;
        CommonUtils.updateControlValidation(this.vehiclesFormGroup(index)?.controls?.acv, true);
        CommonUtils.updateControlValidation(this.vehiclesFormGroup(index)?.controls?.make, false);
        CommonUtils.updateControlValidation(this.vehiclesFormGroup(index)?.controls?.model, false);
        CommonUtils.updateControlValidation(this.vehiclesFormGroup(index)?.controls?.bodyType, false);
      } else {
        this.displayACVFlag[index] = false;
        //on first time load  of vehicle screen, VIN value do not exists
        if (!ObjectUtils.isFieldEmpty(this.vehiclesFormGroup(index)?.controls?.vin?.value)) {
          this.isVINValid[index] = true;
        }
        else {
          this.isVINValid[index] = false;
        }
        CommonUtils.updateControlValidation(this.vehiclesFormGroup(index)?.controls?.acv, false);
      }

      // If vehType != Nonowner and year < 198o then USE shouldnt contain 'storageCOMP'
      if ((year && Number(year) <= 1980)) {
        useValidvalues = useValidvalues?.filter((obj, i) => obj.key !== 'O');
      }
    }
    this.vehicleUseValues[index] = useValidvalues;

    // TYPE/YEAR: Set the VIN req field logic Based on TYPE and YEAR
    this.checkVINisRequired(index);

    // USE=storage disable road side
    this.vehiclesFormGroup(index)?.controls?.use?.patchValue(use);
    let compValidvalues = this.vehicleObject?.comprehensiveValues;
    if (use === 'O') {
      this.disableRoadSide[index] = true;
      // USE=storage disable road side and yera>198 remove NONE from comprehensiveCov
      if (year && Number(year) > 1980) {
        compValidvalues = compValidvalues?.filter((obj, i) => obj?.key !== GlobalConstants.NONE);
      }
    } else {
      this.disableRoadSide[index] = false;
    }
    this.vehicleComprehensiveValues[index] = compValidvalues;

    // COMPREHENSIVE: Set the vehicleCov filed logic based on Comprehensive value
    if(this.nonOwnerIndicator){
      this.vehiclesFormGroup(index)?.controls?.OTC?.patchValue('None');
      this.vehiclesFormGroup(index)?.controls?.COL?.patchValue('None');
    }
    else{
      this.vehiclesFormGroup(index)?.controls?.OTC?.patchValue(comprehensive);
      this.vehiclesFormGroup(index)?.controls?.COL?.patchValue(collision);
    }

    if (!ObjectUtils.isFieldEmpty(compVal)) {
      this.displayCoverageFlag[index] = true;
    } else {
      this.displayCoverageFlag[index] = false;
    }
    // COMPREHENSIVE/COLLISION: Set LoanLease field logic
    this.disableLoanLeaseVal[index] = this.disableLoanLease(index);
  }

  checkForDuplicateVIN(index: number, operation: string) {
    var indexlist: number[] = [];
    var isVinDuplicate = false;
    const vehicleDetails = this.vehiclesForm?.controls?.vehicles?.value;

    // Individual VIN Check
    const vin = this.vehiclesForm?.controls?.vehicles?.value[index]?.vin;
    var vinArrList = vehicleDetails?.filter((z: any, i: number) => (i != index && z?.operation !== 'delete' && (!ObjectUtils.isFieldEmpty(z?.vin) && !ObjectUtils.isFieldEmpty(vin))
      && (z?.vin)?.toUpperCase() === (vin)?.toUpperCase()));

    var isVinExist = vinArrList?.map(function (x: any) {
      // if we need compare first 1O characters of VIN return vin.substring(0, 10);
      return x.vin;
    });

    //Global check for VIN's
    var vinFiltered = vehicleDetails?.filter((z: any) => z?.operation !== 'delete');
    var vinArr = vinFiltered?.map(function (x: any) {
      return x?.vin?.toUpperCase();
    });
    var isVinExistInList = vinArr?.some(function (vinVal: string, index: number) {
      return vinArr?.indexOf(vinVal) != index;
    });



    isVinDuplicate = isVinExist?.length > 0 ? true : false;



    if (isVinDuplicate) {
      if (operation !== 'delete') {
        this.vehiclesFormGroup(index)?.controls?.year?.patchValue("");
        this.vehiclesFormGroup(index)?.controls?.make?.patchValue("");
        this.vehiclesFormGroup(index)?.controls?.model?.patchValue("");
        this.vehiclesFormGroup(index)?.controls?.bodyType?.patchValue("");
      }

      if (this.duplicateVINErrMSG?.length === 0) {
        this.duplicateVINErrMSG?.push(MessageConstants.VEHICLES_VIN_DUPLICATE);
      }

    } else {
      if (!isVinExistInList) {
        this.duplicateVINErrMSG = [];
      }
    }
    this.fieldLevelErrorHandler();


    return isVinDuplicate;
  }


  checkVINisRequired(vehindex: any): void {
    const vin = this.vehiclesFormGroup(vehindex)?.controls.vin;
    const typeVal = this.vehiclesFormGroup(vehindex)?.controls.type.value;
    const year = this.vehiclesFormGroup(vehindex)?.controls.year.value;
    if (!ObjectUtils.isFieldEmpty(year) && !isNaN(Number(year))) {
      if ((Number(year) > 1980) && typeVal === 'A' && !this.nonOwnerIndicator) { // TODO: verify for non-owner and ConVan -- && !this.nonOwnerIndicator
        vin?.setValidators([Validators.required, Validators.pattern('^[A-Za-z0-9]*$'), Validators.minLength(10), Validators.maxLength(17)]);
      }
      else if (typeVal === 'C') {
        vin?.setValidators([Validators.pattern('^[A-Za-z0-9]*'), Validators.maxLength(17)]);
      } else {
        vin?.setValidators(null);
      }
    }
    else {
      if (!this.nonOwnerIndicator && typeVal === 'A') {
        vin?.setValidators([Validators.required, Validators.pattern('^[A-Za-z0-9]*$'), Validators.minLength(10), Validators.maxLength(17)]);
      } else if (typeVal === 'C') {
        vin?.setValidators([Validators.pattern('^[A-Za-z0-9]*'), Validators.maxLength(17)]);
      } else {
        vin?.setValidators(null);
      }
    }
    vin?.updateValueAndValidity();
    this.UseCoverageOptions(vehindex);

  }

  getStatesByZipcode(index: number) {
    let bannedStates = GlobalConstants.VEHICLE_BANNED_STATES;
    let noInsuranceStates = GlobalConstants.VEHICLE_NO_INSURANCE_STATES;
    const zipcodeFormat = new zipcodePipe();
    const formZipCode = this.vehiclesFormGroup(index)?.controls.garageZipCode.value;
    const zipCode = formZipCode == null ? null : zipcodeFormat.transform(formZipCode);
    let vehErrMsg = '';
    if (zipCode !== null && zipCode !== GlobalConstants.EMPTY_STRING) {
      this.showSpinnerService.showSpinner(true);
      this.vehGarageZipCodeByVehicleId[index] = zipCode;
      const zipcodeFormatted = zipCode?.replace('-', '');
      let zip = zipcodeFormatted.substring(0, 5);
      this.sharedService.getStatesByZipcode(zip).subscribe((data: any) => {
        const states = data.States;
        this.showSpinnerService.showSpinner(false);

        // If API return no state throw error msg
        if (states?.length === 0) {
          vehErrMsg = MessageConstants.INVALID_ZIP_CODE;
          this.vehGarageZipCodeErrors[index] = vehErrMsg;
          this.fieldLevelErrorHandler();
          return;
        }
        else {
          this.vehGarageStateByVehicleId[index] = states[0];
          this.vehiclesFormGroup(index).controls.garageState.patchValue(states[0]);
        }

        //check vehicle garage zipcode state is providing insurance or not
        const noInsuranceStateFound = states.filter((returnState: any) =>
          noInsuranceStates.some((noInsuranceState: any) => returnState === noInsuranceState)
        );
        if (noInsuranceStateFound?.length > 0) {
          vehErrMsg = MessageConstants.NO_INSURANCE_STATE_MSG;
          this.vehGarageZipCodeErrors[index] = vehErrMsg;
          this.fieldLevelErrorHandler();
          return;
        } else {
          this.vehGarageZipCodeErrors[index] = '';
        }

        // check vehicle zipcode state is in banned state or not
        const bannedStateFound = states.filter((returnState: any) =>
          bannedStates.some((bannedState: any) => returnState === bannedState)
        );
        if (bannedStateFound?.length > 0 && this.policyState !== GlobalConstants.STATE_PA) {
          vehErrMsg = MessageConstants.BANNED_STATE_MSG;
          this.vehGarageZipCodeErrors[index] = vehErrMsg;
          this.fieldLevelErrorHandler();
          return;
        } else {
          this.vehGarageZipCodeErrors[index] = '';
        }

        // check vehicle zipcode is out of state
        const mailingStateStatus = states.indexOf(this.policyState) == -1 ? false : true;
        if (index === 0) {
          if (!mailingStateStatus) {
            vehErrMsg = MessageConstants.OUT_OF_STATE_ZIPCODE;
            this.vehGarageZipCodeErrors[index] = vehErrMsg;
          } else {
            this.vehGarageZipCodeErrors[index] = "";
          }
        } else {
          if (!mailingStateStatus) {
            this.vehiclesFormGroup(index)?.controls.isOutOfState.patchValue(true);
          }
        }
        this.fieldLevelErrorHandler();
        this.showSpinnerService.showSpinner(false);
      }), (errorData: any) => {
        this.logTracker.logerror('VehiclesComponent', 'getStatesByZipcode', 'sharedService.getStatesByZipcode',
          'Error=Vehicles Get State By ZipCode|QuoteNumber='.concat(this.qid), errorData);
        this.showSpinnerService.showSpinner(false);
        this.errorHandler(errorData);
      };
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
        }
      },
      error => this.logTracker.logerror('VehiclesComponent', 'navigationObservableWatch', 'navigationStepObv',
        'Vehicle Page navigationObservableWatch Error', error));
  }
}

