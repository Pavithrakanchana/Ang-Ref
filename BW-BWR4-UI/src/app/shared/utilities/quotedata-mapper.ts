import { DatePipe } from '@angular/common';
import { Store } from '@ngrx/store';
import QuoteSummary, { ApplicantAddress, DriverSummary, Indicators, PNIDetails, VehicleSummary } from 'src/app/state/model/summary.model';
import * as Actions from '../../state/actions/summary.action';
import { ObjectUtils } from 'src/app/shared/utilities/object-utils';
import { GlobalConstants } from 'src/app/constants/global.constant';
import { Symbol } from '../model/vehicles/vehicle-specs-symbols.model';
import { PolicyinfoService } from 'src/app/services/policyinfo.service';
import {
  AutoQuoteData, AutoQuote, Address, Contact, Person, Phone,
  PolicyDiscountIndicators, CustomAttributes, Driver, Vehicle,
  Coverage,
  GarageAddress, License, DiscountIndicators, Violation, ClaimsPayouts, DiscountIndicator, PolicyCoveragesDetails, PolicyCoveragePerVehicleId, PriorCarrierInfo, Disputes, SavingsAmount, PayPlanDetails, PremiumDetails, AutoCoverages, PolicyPackage, DownPayment, AddionalInterest, ReferencePolicy, Agent, Installment, UnderWritingReportsModifiedAttributes, PaymentMethod, PaymentInformation, PersonalAuto, Answer, PreQualQuestionSets, sr22fr44indicators, driverCategoryReason, StateFiling, AssociatedVehicles
} from '../model/autoquote/autoquote.model';
import { zipcodePipe } from '../pipes/zipcode.pipe';
import { QuoteDataService } from 'src/app/services/quote-data.service';
import { Injectable } from '@angular/core';
import { VehSymbol } from '../model/vehicles/vehicle-symbols-res.model';
import { CommonUtils } from './common-utils';
import { addDriver, addVehicle } from '../../state/actions/summary.action';
import { isEmpty } from 'lodash';
import { NavigationService } from '../services/navigation.service';
import { ValidvaluesCommon } from '../model/validvalues/validvaluescommonres';
@Injectable({
  providedIn: 'root'
})

export class QuoteDataMapper {
  public autoQuoteData!: AutoQuoteData;
  public autoQuote!: AutoQuote;
  public policyDiscountIndicators!: PolicyDiscountIndicators;
  public quoteNumber = '';
  public mco = '';
  public orderCLUE = false;
  public additionalDrivers: any;
  public policyCoveragesDetails!: PolicyCoveragesDetails;
  public isNonOwner!: boolean;
  private riskState!: string;
  public storeRateBook = '';
  public state = '';
  public userName!: any;
  public vehiclesPrimaryUse = [''];
  public pipUMSTSym : any;
  public pipUIMSTSym: any;

  public static isNullOrEmptyOrDefault(value: any): boolean {
    switch (value) {
      case '':
      case 0:
      case false:
      case null:
      case typeof (value) === 'undefined':
        return true;
      default:
        return false;
    }
  }

  constructor(public store: Store<{ quoteSummary: QuoteSummary }>, public quoteDataService: QuoteDataService,
    private policyInfoService: PolicyinfoService, private navigationService: NavigationService
  ) {
    store.select('quoteSummary').subscribe(data => {
      this.quoteNumber = data.qid;
      this.mco = data.mco;
      this.orderCLUE = data.orderCLUEReport;
      this.riskState = data.policyState;
      this.storeRateBook = data.rateBook;
      this.state = data.policyState;
      this.userName = data.userName;
    });
  }

  /*
      Utility function to map Applicant Form data to AutoQuote Data object
  */
  mapApplicantData(applicantFormData: any, dbSavedData: any, operationType: string, isNewQuote: any): AutoQuoteData {
    const datePipe = new DatePipe('en-US');
    const dbAutoQuoteData = dbSavedData?.autoQuote;
    const driversData: Driver[] = [];
    const zipcodeFormat = new zipcodePipe();
    const ssn = applicantFormData.get('ssn').value;
    const phoneNo = applicantFormData.get('phone').value;
    const pNIDetails: PNIDetails = {
      firstName: applicantFormData.get('firstname')?.value?.trim().toUpperCase().trim(),
      middleName: applicantFormData.get('middlename')?.value == null ? '' : applicantFormData.get('middlename')?.value?.trim().toUpperCase().trim(),
      lastName: applicantFormData.get('lastname')?.value?.trim().toUpperCase().trim(),
      suffix: applicantFormData.get('suffix')?.value == null ? '' : applicantFormData.get('suffix')?.value.toUpperCase(),
      dateOfBirth: datePipe.transform(
        new Date(applicantFormData.get('birthdate')?.value), 'MM/dd/yyyy') ?? Date.now().toString(),
      socialSecurityNumber: (ssn == null || ssn?.length < 9) ? '' : applicantFormData.get('ssn').value.replace(/-/g, ''),
      maritalStatus: applicantFormData.get('maritalStatus')?.value.toUpperCase(),
      gender: applicantFormData.get('gender')?.value.toUpperCase(),
      emailAddress: applicantFormData.get('email')?.value == null ? '' : applicantFormData.get('email')?.value?.toUpperCase(),
      nonOwnerPolicyIndicator: applicantFormData.get('nonowner')?.value
    };

    this.store.dispatch(Actions.pNIDetails({ pNIDetails }));
    this.store.dispatch(Actions.setPNIEmail({ PNIEmail: pNIDetails.emailAddress || '' }));

    const phonesData: Phone[] = [{
      type: 'Home',
      phoneNumber: (phoneNo == null || phoneNo.length == 1) ? '' : phoneNo.replace(/\D/g, ''),
    }];

    const addressData: Address[] = [];
    const hasMovedWithinPastSixMonthIndicator = applicantFormData.get('moved').value == null ?
      false : applicantFormData.get('moved').value;
    const currentAddress: Address = {
      addressType: 'Current',
      streetName: applicantFormData.get('address')?.value.toUpperCase(),
      POBoxIndicator: applicantFormData.get('pobox')?.value,
      city: applicantFormData.get('city')?.value.toUpperCase(),
      state: applicantFormData.get('state')?.value.toUpperCase(),
      postalCode: applicantFormData.get('zipcode').value == null ?
        null : zipcodeFormat.transform(applicantFormData.get('zipcode').value),
      movedWithinPastSixMonthIndicator: hasMovedWithinPastSixMonthIndicator
    };

    addressData.push(currentAddress);

    const custAns: Answer = {
      consentQuestion: applicantFormData.get('custConsent').value
    };

    const preQualQuestionSets: PreQualQuestionSets[] = [{
      // code :  '',
      answers: custAns
    }]
    /*//Condition for RE-ORDERing POP Service API

    if(dbApplicantData && (personData.firstName !== dbApplicantData?.person?.firstName || personData?.lastName !== dbApplicantData?.person?.lastName ||
      currentAddress.streetName !== dbApplicantData?.addresses[0]?.streetName || currentAddress.city !== dbApplicantData?.addresses[0]?.city ||
      currentAddress.state !== dbApplicantData?.addresses[0]?.state || currentAddress.postalCode !== dbApplicantData?.addresses[0]?.postalCode)) {

    }*/

    if (hasMovedWithinPastSixMonthIndicator) {
      const previousAddress: Address = {
        addressType: 'Previous',
        streetName: applicantFormData.get('prevAddress')?.value?.toUpperCase(),
        POBoxIndicator: applicantFormData.get('prevAddressPO')?.value,
        city: applicantFormData.get('prevCity')?.value?.toUpperCase(),
        state: applicantFormData.get('prevState')?.value?.toUpperCase(),
        postalCode: applicantFormData.get('prevZipcode').value == null ? null :
          zipcodeFormat.transform(applicantFormData.get('prevZipcode').value),
        // Is this value even necessary?
        movedWithinPastSixMonthIndicator: hasMovedWithinPastSixMonthIndicator
      };

      addressData.push(previousAddress);
    }
    const applicantAddress: ApplicantAddress = {
      addressType: currentAddress.addressType,
      streetName: currentAddress.streetName,
      city: currentAddress.city,
      state: currentAddress.state,
      postalCode: currentAddress.postalCode,
      POBoxIndicator: currentAddress.POBoxIndicator,
      movedWithinPastSixMonthIndicator: currentAddress.movedWithinPastSixMonthIndicator
    };
    this.store.dispatch(Actions.applicantAddress({ applicantAddress }));
    const customAttributesData: CustomAttributes = {
      operation: operationType
    };

    const agentsOnj = [{
      userId: this.userName
    }]


    const contactData: Contact = {
      person: pNIDetails,
      phones: phonesData,
      addresses: addressData,
      customAttributes: customAttributesData
    };

    const licenseData: License = {
      licenseType: '',
      licenseNumber: '',
      licenseState: ''
    };
    const discountIndicatorsData: DiscountIndicators = {
      //sr22FilingIndicator: false,
      stateFiling: {
        indicators: [
          {
            name: 'No',
            value: 'N'
          }
        ], caseNumber: ''
      },
      distantStudentIndicator: false
    };
    let orderMVRStatus = dbAutoQuoteData?.personalAuto?.drivers?.length > 0 ? dbAutoQuoteData?.personalAuto?.drivers[0]?.orderMVR : GlobalConstants.EMPTY_STRING;
    // condition for reordering MVR for a driver
    if (dbAutoQuoteData && (pNIDetails.firstName !== dbAutoQuoteData?.contact?.person?.firstName || pNIDetails?.lastName !== dbAutoQuoteData?.contact?.person?.lastName || pNIDetails?.middleName !== dbAutoQuoteData?.contact?.person?.middleName)) {
      orderMVRStatus = 'NO';
    }

    const driverCategoryReason: driverCategoryReason[] = []
    const driverCategoryReasonData = {
      name: "",
      value: "",
    };
    driverCategoryReason.push(driverCategoryReasonData);

    const driver: Driver = {
      // sequenceNumber: `${index + 1}`,
      sequenceNumber: '',
      driverType: '',
      source: '',
      primaryInsuredIndicator: true,
      firstName: applicantFormData.get('firstname')?.value?.trim().toUpperCase().trim(),
      middleName: applicantFormData.get('middlename')?.value?.trim().toUpperCase().trim(),
      lastName: applicantFormData.get('lastname')?.value?.trim().toUpperCase().trim(),
      suffix: '',
      birthDate: datePipe.transform(
        new Date(applicantFormData.get('birthdate')?.value), 'MM/dd/yyyy') ?? Date.now().toString(),
      gender: '',
      maritalStatus: '',
      education: '',
      driverCategoryReasons: driverCategoryReason,
      occupationCode: '',
      subOccupationCode: '',
      relationshipToInsured: '',
      discountIndicators: discountIndicatorsData,
      license: licenseData,
      orderMVR: orderMVRStatus,
      violationsCount: 0
    };

    if (dbAutoQuoteData && orderMVRStatus !== GlobalConstants.EMPTY_STRING) {
      driversData.push(driver);
    }
    const personalAutoData = {
      drivers: driversData
    };

    let originalPolicyEffectiveDateVal: any;
    originalPolicyEffectiveDateVal = isNewQuote == true ? "" : dbAutoQuoteData.quoteInitiationDate == undefined || dbAutoQuoteData.quoteInitiationDate == "" ? dbAutoQuoteData.effectiveDate : datePipe.transform(new Date(dbAutoQuoteData.quoteInitiationDate), 'MM/dd/yyyy')

    const autoQuoteData = {
      quoteNumber: this.quoteNumber,
      rateBook: this.storeRateBook,
      state: this.state,
      quoteInitiationDate: originalPolicyEffectiveDateVal,
      effectiveDate: datePipe.transform(
        new Date(applicantFormData.get('polEffDt')?.value), 'MM/dd/yyyy') ?? Date.now().toString(),
      term: applicantFormData.get('policyTerm')?.value,
      quoteReference: applicantFormData.get('callID')?.value ? applicantFormData.get('callID')?.value : '',
      contact: contactData,
      agents: agentsOnj,
      preQualQuestionSets: preQualQuestionSets,
      personalAuto: personalAutoData
    };
    this.store.dispatch(Actions.policyEffectiveDate({ policyEffectiveDate: autoQuoteData.effectiveDate }));
    this.autoQuoteData = {
      autoQuote: autoQuoteData
    };
    // set CLUE API status while leaving Applicant screen
    if (!this.orderCLUE) {
      if (dbAutoQuoteData && (pNIDetails.firstName !== dbAutoQuoteData?.contact?.person?.firstName || pNIDetails?.lastName !== dbAutoQuoteData?.contact?.person?.lastName
        || pNIDetails?.middleName !== dbAutoQuoteData?.contact?.person?.middleName || pNIDetails?.dateOfBirth !== dbAutoQuoteData?.contact?.person?.dateOfBirth)) {
        this.store.dispatch(Actions.orderCLUEReport({ orderCLUEReport: true }));
      }
    }
    return this.autoQuoteData;
  }


  mapDriverData(driverFormData: any, operationType: string, dbData: any, dbApplicantData: any, hasDriverLicenseType: any): AutoQuoteData {
    let orderCLUE = false;
    let pniDriverDetailsChange: boolean = false;
    let otherDetailsChange: boolean = false;
    let DriverOtherRated: boolean = false;
    let hasDeletedDriver: boolean = false;
    let hasFilingChanged: boolean = false;
    let filingStatus: any[] = [];
    const datePipe = new DatePipe('en-US');
    const driversData: Driver[] = [];
    let dbDriverFiling = '';
    let orderMVRStatus = '';
    const personData: Person = {
      firstName: '',
      middleName: '',
      lastName: '',
      suffix: '',
      dateOfBirth: '',
      socialSecurityNumber: '',
      maritalStatus: '',
      gender: '',
      emailAddress: '',
      nonOwnerPolicyIndicator: dbApplicantData.nonOwnerPolicyIndicator
    };

    this.store.dispatch(Actions.clearDrivers());
    driverFormData.forEach((item: any, index: number) => {

      let orderMVR = ''
      if (item.licenseType !== dbData[index]?.license?.licenseType ||
        item.licensenumber !== dbData[index]?.license?.licenseNumber ||
        (item.licensestate !== dbData[index]?.license?.licenseState && dbData[index]?.license?.licenseState !== 'IT') ||
        (item.rated === 'R' && dbData[index]?.driverType === 'E')) {
        orderMVR = 'NO';
        orderMVRStatus = 'reorder';
      }
      let lastIndex = driversData[index - 1];
      const licenseData: License = {
        licenseType: item.licenseType,
        licenseNumber: item.licensenumber,
        licenseState: (item.licenseType === 'F' ? GlobalConstants.ITERNATIONAL_LICENSE : item.licensestate),
        isRecentLicenseHolder: item.licenselessthenoneyear == "Y" ? true : false,
      };

      //hasFilingChanged = item.filingType !== dbData[index]?.filingType ? true : false;
      dbDriverFiling = dbData[index]?.discountIndicators.stateFiling.indicators[0].value;
      if (dbDriverFiling !== undefined) {
        filingStatus.push(item.filingType !== dbDriverFiling ? true : false);
      } else {
        filingStatus.push(item.filingType !== 'N' ? true : false);
      }
      hasFilingChanged = filingStatus.includes(true) ? true : false;
      // console.log("==item.filingType=="+item.filingType+"==hasFilingChanged=="+hasFilingChanged+"==dbDriverFiling=="+dbDriverFiling);
      let checkSR22Box = GlobalConstants.SR22_CHECKBOX_STATE.includes(this.state) ? true : false;
      if (checkSR22Box) {
        item.filing === true ? item.filingType = 'C' : item.filingType = 'N';
      }
      const discountIndicatorsData: DiscountIndicators = {
        //sr22FilingIndicator: item.filing,
        stateFiling: {
          indicators: [
            {
              name: item.filingType === 'N' ? "No" : item.filingType === 'C' ? "SR22" : item.filingType === 'H' ? "FR44" : "",
              value: item.filingType
            }
          ], caseNumber: item.caseNumber
        },
        distantStudentIndicator: item.distantstd,
        matureDriverIndicator: item.matureDriver
      };
      // console.log("v", index, discountIndicatorsData)

      const driverCategoryReason: driverCategoryReason[] = []
      const driverCategoryReasonData = {
        name: "",
        value: item.reason !== undefined ? item.reason : "",
      };
      driverCategoryReason.push(driverCategoryReasonData);

      const driver: Driver = {
        // sequenceNumber: `${index + 1}`,
        sequenceNumber: item.dbDriverSeqNo != '' ? item.dbDriverSeqNo : `${Number(lastIndex?.sequenceNumber) + 1}`,
        driverType: item.rated,
        source: item.source,
        primaryInsuredIndicator: index === 0,
        firstName: item.firstname.toUpperCase().trim(),
        middleName: item.middlename == null ? '' : item.middlename.toUpperCase().trim(),
        lastName: item.lastname.toUpperCase().trim(),
        suffix: item.suffix == null ? '' : item.suffix,
        birthDate: datePipe.transform(new Date(item.dob), 'MM/dd/yyyy') ?? Date.now().toString(),
        gender: item.gender,
        maritalStatus: item.maritalStatus,
        education: item.education,
        driverCategoryReasons: driverCategoryReason,
        occupationCode: item.occupation,
        subOccupationCode: item.suboccupation,
        relationshipToInsured: item.relationship,
        matureDrivercourseCompletionDate: item.courseDate ? datePipe.transform(new Date(item.courseDate), 'MM/dd/yyyy') ?? Date.now().toString() : '01/01/0001',
        discountIndicators: discountIndicatorsData,
        license: licenseData,
        orderMVR: orderMVR === 'NO' ? orderMVR : dbData[index]?.orderMVR,
        violationsCount: 0
      };
      const customAttributesData: CustomAttributes = {
        operation: item.operation
      };

      if (item.operation === 'delete') {
        hasDeletedDriver = true;
      }

      // Check for Name & DOB change details for Navigation rules
      if ((item.firstname !== dbData[index]?.firstName ||
        item.lastname !== dbData[index]?.lastName ||
        driver.birthDate !== dbData[index]?.birthDate)) {
        if (index === 0) {
          pniDriverDetailsChange = true;
        } else {
          if (item.operation !== 'Add') {
            otherDetailsChange = true;
          }
        }
      }

      if (item.rated !== dbData[index]?.driverType && this.riskState == GlobalConstants.STATE_VA) {
        DriverOtherRated = true;
      }

      // set CLUE API status
      if (!this.orderCLUE) {
        if (item.firstname !== dbData[index]?.firstName ||
          item.middlename !== dbData[index]?.middleName ||
          item.lastname !== dbData[index]?.lastName ||
          driver.birthDate !== dbData[index]?.birthDate || item.licenseType !== dbData[index]?.license?.licenseType ||
          item.licensenumber !== dbData[index]?.license?.licenseNumber ||
          (item.licensestate !== dbData[index]?.license?.licenseState && dbData[index]?.license?.licenseState !== 'IT') ||
          (item.rated === 'R' && dbData[index]?.driverType === 'E')) {
          orderCLUE = true;
        }
        if (customAttributesData.operation === 'delete' || customAttributesData.operation === 'Add') {
          orderCLUE = true;
        }
      } else {
        orderCLUE = this.orderCLUE;
      }

      // comparing FormData and DBData
      const dbDriversObj = dbData[index];
      const formDriverObj = driverFormData[index];

      if (customAttributesData.operation !== ('delete' || 'Add')) {
        if (!ObjectUtils.isObjectEmpty(dbDriversObj) && !ObjectUtils.isObjectEmpty(driver)) {
          customAttributesData.operation = 'Add';
        }
      }
      driver.customAttributes = customAttributesData;
      driversData.push(driver);

      // add driver to store for quote summary
      this.addDriverToStore(driver);
    });


    // console.log('State: ', this.state, ' hasFilingChanged: ', hasFilingChanged);
    if (this.state === GlobalConstants.STATE_FL && hasFilingChanged) {
      this.navigationService.addRequiredRoutes(this.navigationService.actionBasedRoutes('DriverFiling'));
    }

    const phonesData: Phone[] = [];
    const addressData: Address[] = [];

    const contactData: Contact = {
      person: personData,
      phones: phonesData,
      addresses: addressData,
    };
    const personalAutoData = {
      drivers: driversData
    };

    const autoQuoteData = {
      quoteNumber: this.quoteNumber,
      rateBook: this.storeRateBook,
      state: this.state,
      personalAuto: personalAutoData,
      contact: contactData
    };

    this.autoQuoteData = {
      autoQuote: autoQuoteData
    };

    // Adding Routing Rules based on the Driver actions
    // console.log('Driver Details change: ', pniDriverDetailsChange, '  OtherDriver Details Change: ', otherDetailsChange, '  Drivers DB Length: ', dbData.length, '  Drivers from Form Data: ', driversData.length);
    if (dbData.length !== driversData.length || hasDeletedDriver || hasDriverLicenseType) {
      this.navigationService.addRequiredRoutes(this.navigationService.actionBasedRoutes('AddDriver'));
    }

    if (pniDriverDetailsChange) {
      this.navigationService.addRequiredRoutes(this.navigationService.actionBasedRoutes('DriverPNI'));
    }
    
    if (otherDetailsChange) {
      this.navigationService.addRequiredRoutes(this.navigationService.actionBasedRoutes('DriverOther'));
    }
    if (DriverOtherRated) {
      this.navigationService.addRequiredRoutes(this.navigationService.actionBasedRoutes('DriverOtherRated'));
    }
    this.store.dispatch(Actions.orderCLUEReport({ orderCLUEReport: orderCLUE }));

    return this.autoQuoteData;
  }

  mapVehicleData(vehicleFormData: any, operationType: string, dbData: any, dbApplicantData: any): AutoQuoteData {
    const vehicleData: Vehicle[] = [];
    const garageZipcodeFormat = new zipcodePipe();
    let hasDeletedVehicle: boolean = false;
    let hasAddedVehicles: boolean = false;
    let vehUseUpdated: boolean = false;
    let vehicleChange: boolean = false;

    vehicleFormData.forEach((item: any, index: number) => {
      const garageAddress: GarageAddress = {
        addressLine: '',
        streetName: '',
        streetType: '',
        apartmentNumber: '',
        houseNumber: '',
        postalOfficeBoxNumber: '',
        ruralRouteNumber: '',
        city: '',
        state: item.garageState || '',
        postalCode: item.garageZipCode == null ?
          null : garageZipcodeFormat.transform(item.garageZipCode),
        outOfStateIndicator: item.isOutOfState
      };

      const vehSymbols = this.deriveVehicleSymbols(item, item.symbols);
      this.isNonOwner = item.type === 'N' ? true : false;
      if (index == 0) { this.store.dispatch(Actions.setNonOwner({ nonOwner: this.isNonOwner })); }
      let antiTheftCode = this.isNonOwner && this.riskState === GlobalConstants.STATE_IL ? "-" : this.isNonOwner ? "N" : item.antiTheftCode;
      const discountIndicators: DiscountIndicator[] = [
        {
          code: GlobalConstants.ANTI_THEFT_CODE,
          value: antiTheftCode
        },
        {
          code: GlobalConstants.AIRBAG_TYPE_COPDE,
          value: this.isNonOwner ? GlobalConstants.EMPTY_STRING : (this.getAirBagInd(item.type, item.year, item.airBagTypeCode) || GlobalConstants.EMPTY_STRING)
        },
        {
          code: GlobalConstants.ANTI_LOCK_BRAKE_OPTION,
          value: this.isNonOwner ? GlobalConstants.EMPTY_STRING : (this.getAntiLockBrakeInd(item.type, item.year, item.antiLockBrakesOption) || GlobalConstants.EMPTY_STRING)
        },
        {
          code: GlobalConstants.DAYLIGHT_RUNNING_LIGHT,
          value: this.isNonOwner ? GlobalConstants.EMPTY_STRING : (item.daylightRunningLightsOption || GlobalConstants.EMPTY_STRING)
        }
      ];

      const policyLevelCoverages = this.derivePolicyCovSymbols(item, this.isNonOwner);
      const vehicleLevelCoverages = this.deriveVehicleCovSymbols(item, this.isNonOwner);


      let lastIndex = vehicleData[index - 1];
      const vehicle: Vehicle = {
        // sequenceNumber: `${index + 1}`,
        sequenceNumber: item.dbVehicleSeqNo != '' ? item.dbVehicleSeqNo : `${Number(lastIndex?.sequenceNumber) + 1}`,
        driverId: '1',
        vin: item.type === 'N' ? GlobalConstants.NOT_APPLICABLE : item.vin?.toUpperCase(),
        vinHitIndicator: false,
        vehicleType: item.type?.toUpperCase(),
        bodyType: item.bodyType === GlobalConstants.EMPTY_STRING ? "0" : item.bodyType?.toUpperCase(),
        year: item.type === 'N' ? GlobalConstants.NON_OWNER_YEAR_VALUE : item.year === GlobalConstants.EMPTY_STRING ? "0" : item.year,
        make: (item.type === 'N' && GlobalConstants.BROAD_FORM_STATES.includes(this.riskState)) ? GlobalConstants.BROAD_FORM_MAKE_VALUE : (item.type === 'N' ? GlobalConstants.NON_OWNER_MAKE_VALUE : item.type === 'C'
          ? GlobalConstants.CONVERSION_VAN_MAKE_VALUE : item.make === GlobalConstants.EMPTY_STRING ? "0" : item.make?.toUpperCase()),
        model: (item.type === 'N' && GlobalConstants.BROAD_FORM_STATES.includes(this.riskState)) ? GlobalConstants.BROAD_FORM_MODEL_VALUE : (item.type === 'N' ? GlobalConstants.NON_OWNER_MODEL_VALUE : item.type === 'C'
          ? GlobalConstants.CONVERSION_VAN_MODEL_VALUE : item.model === GlobalConstants.EMPTY_STRING ? "0" : item.model?.toUpperCase()),
        trimDescription: item.trim?.toUpperCase(),
        odometerReading: item.odometer !== GlobalConstants.EMPTY_STRING ? item.odometer : '0',
        annualMileage: '',
        primaryUse: item.use,
        commuteToNJNYSurcharge: item.commuteToNJNYSurcharge,
        theCurrencyAmount: item.acv ? item.acv : '0',
        garageAddress,
        discountIndicators,
        coverages: vehicleLevelCoverages,
        policyCoverages: policyLevelCoverages,
        symbols: vehSymbols
      };

      const customAttributesData: CustomAttributes = {
        operation: item.operation
      };

      if (item.operation === 'delete') {
        hasDeletedVehicle = true;
      }

      if (item.operation === 'Add') {
        hasAddedVehicles = true;
      }




      // comparing FormData and DBData
      const dbVehiclesObj = dbData[index];
      if (customAttributesData.operation !== 'delete' && customAttributesData.operation !== 'Add') {
        if (!ObjectUtils.isObjectEmpty(dbVehiclesObj) && !ObjectUtils.isObjectEmpty(vehicle)) {
          customAttributesData.operation = 'Add';
        }
      }
      vehicle.customAttributes = customAttributesData;

      // console.log('DB Vehicle Object ===> ', dbVehiclesObj);
      if (!ObjectUtils.isObjectEmpty(dbVehiclesObj) && ((item.use === 'O' && dbVehiclesObj?.primaryUse !== 'O') || (item.use !== 'O' && dbVehiclesObj?.primaryUse === 'O'))
        || ((item.use === 'R' && dbVehiclesObj?.primaryUse !== 'R') || (item.use !== 'R' && dbVehiclesObj?.primaryUse === 'R'))) {
        vehUseUpdated = true;
      }
           
      if (this.riskState == GlobalConstants.STATE_VA && (item.vin !== dbVehiclesObj?.vin || item.bodyType !== dbVehiclesObj?.bodyType || item.make !== dbVehiclesObj?.make || item.model !== dbVehiclesObj?.model || item.year !== dbVehiclesObj?.year)){
        vehicleChange = true;
      }
      vehicleData.push(vehicle);
      //add vehicles to store for quote summary
      this.addVehicleToStore(vehicle);

    });

    const personalAutoData = {
      vehicles: vehicleData
    };

    // console.log('=== Vehicles in the DB: ', dbData.length, '  Vehicles in Form: ', vehicleData.length);
    if (hasAddedVehicles) {
      this.navigationService.addRequiredRoutes(this.navigationService.actionBasedRoutes('AddVehicle'));
    }

    if (vehUseUpdated) {
      this.navigationService.addRequiredRoutes(this.navigationService.actionBasedRoutes('VehicleUse'));
    }
    if (vehicleChange) {
      this.navigationService.addRequiredRoutes(this.navigationService.actionBasedRoutes('VehicleChange'));
    }

    const autoQuoteData = {
      quoteNumber: this.quoteNumber,
      rateBook: this.storeRateBook,
      state: this.state,
      //contact: contactData,
      personalAuto: personalAutoData,
      policyCoveragesDetails: this.policyCoveragesDetails
    };

    this.autoQuoteData = {
      autoQuote: autoQuoteData
    };
    return this.autoQuoteData;
  }

  assignSymbol(vehicle: any, nonOwnerPolicyIndicator: boolean): number {
    let derivedSymbol = 0;

    if (nonOwnerPolicyIndicator) {
      derivedSymbol = GlobalConstants.BROAD_FORM_STATES.includes(this.riskState) ? 65 : 66;
    } else if (Number(vehicle.year) <= 1980) {
      derivedSymbol = 69;
    } else if (vehicle.type === GlobalConstants.CONVERSION_VAN_CODE && !ObjectUtils.isFieldEmpty(vehicle.acv)) {
      const acv = Number(vehicle.acv);
      if (acv > 0 && acv <= 10000) {
        derivedSymbol = 71;
      } else if (acv >= 10001 && acv <= 20000) {
        derivedSymbol = 72;
      } else if (acv >= 20001 && acv <= 30000) {
        derivedSymbol = 73;
      } else if (acv >= 30001 && acv <= 40000) {
        derivedSymbol = 74;
      } else if (acv >= 40001 && acv <= 50000) {
        derivedSymbol = 75;
      } else if (acv >= 50001 && acv <= 70000) {
        derivedSymbol = 76;
      }
    }
    return derivedSymbol;
  }

  deriveVehicleCovSymbols(vehicle: any, nonOwnerPolicyIndicator: boolean): any {
    const vehicleLevelCovSymbols: Coverage[] = [];
    const symbols = vehicle.symbols;
    const COMPSymbol = symbols?.find((x: { name: string; }) => (x.name === 'COMP2' || x.name === 'COMP' || x.name === 'OTC' || x.name === 'OTC0GD'))?.value || '';
    const COLLSymbol = symbols?.find((x: { name: string; }) => (x.name === 'COLL2' || x.name === 'COLL' || x.name === 'COL'))?.value || '';

    const compSelectedVal = vehicle.OTC;
    const compVal = compSelectedVal !== GlobalConstants.NONE ? compSelectedVal.split('O') : GlobalConstants.NONE;
    const compCode = compSelectedVal !== GlobalConstants.NONE ? 'O' + compVal[1] : 'OTC'
    const COMPDeductible = compSelectedVal !== GlobalConstants.NONE ? compVal[0] : GlobalConstants.EMPTY_STRING;
    const COLLDeductible = vehicle.COL !== GlobalConstants.NONE ? vehicle.COL : GlobalConstants.EMPTY_STRING;
    const AddEquLimit = vehicle.CEQ !== GlobalConstants.NONE ? vehicle.CEQ : GlobalConstants.EMPTY_STRING;
    const UmpdLimit = vehicle.UMPD !== '000' ? vehicle.UMPD : GlobalConstants.EMPTY_STRING;
    const RentLimit = vehicle.EXTR !== GlobalConstants.NONE ? vehicle.EXTR : GlobalConstants.EMPTY_STRING;
    const derivedSymbol = this.assignSymbol(vehicle, nonOwnerPolicyIndicator);
    if (derivedSymbol > 0) {
      // COMP
      vehicleLevelCovSymbols.push(this.createCoverage(compCode, '', COMPDeductible, derivedSymbol.toString(),''));
      // COLL
      vehicleLevelCovSymbols.push(this.createCoverage('COL', '', COLLDeductible, derivedSymbol.toString(),''));
      // ALL
      vehicleLevelCovSymbols.push(this.createCoverage('ALL', vehicle.ALL, '', derivedSymbol.toString(),''));
      this.pushVehicleLevelCoveragesAsPerState(vehicleLevelCovSymbols, UmpdLimit, derivedSymbol.toString());
    } else {
      vehicleLevelCovSymbols.push(this.createCoverage(compCode, '', COMPDeductible, COMPSymbol,''));
      vehicleLevelCovSymbols.push(this.createCoverage('COL', '', COLLDeductible, COLLSymbol,''));
      vehicleLevelCovSymbols.push(this.createCoverage('ALL', vehicle.ALL, '', COMPSymbol,''));
      this.pushVehicleLevelCoveragesAsPerState(vehicleLevelCovSymbols, UmpdLimit, COLLSymbol);
    }
    vehicleLevelCovSymbols.push(this.createCoverage('EXTR', RentLimit, '', '',''));
    vehicleLevelCovSymbols.push(this.createCoverage('CEQ', AddEquLimit, '', '',''));
    vehicleLevelCovSymbols.push(this.createCoverage('RA', vehicle.RA, '', '',''));


    /*TODO: DO NOT Delete code.. Below logic can be used for future states roll out
    if (!ObjectUtils.isFieldEmpty(COLLSymbol)) {
    policyLevelCovSymbols.push(this.createCoverage('UMPD', '', '', COMPSymbol));
    policyLevelCovSymbols.push(this.createCoverage('UIMPD', '', '', COMPSymbol));
    }
    */
    return vehicleLevelCovSymbols;
  }

  private pushVehicleLevelCoveragesAsPerState(vehicleLevelCovSymbols: Coverage[], UmpdLimit: any, COLLSymbol: any): void {
    switch (this.riskState) {
      case GlobalConstants.STATE_IL:
        if (!UmpdLimit) {
          UmpdLimit = GlobalConstants.EMPTY_VALUE;
        }
        vehicleLevelCovSymbols.push(this.createCoverage('UMPD', UmpdLimit, '', COLLSymbol,''));
        break;
      case GlobalConstants.STATE_CO:
        if (!UmpdLimit || UmpdLimit === 'None') {
          UmpdLimit = GlobalConstants.EMPTY_STRING;
        }
        vehicleLevelCovSymbols.push(this.createCoverage('UMPD', '', UmpdLimit, COLLSymbol, ''));
        break;
      case GlobalConstants.STATE_OH:
        if (!UmpdLimit || UmpdLimit === 'None') {
          UmpdLimit = GlobalConstants.EMPTY_STRING;
        }
        vehicleLevelCovSymbols.push(this.createCoverage('UMPD', UmpdLimit, '', COLLSymbol, ''));
        break;
      default:
        break;
    }
  }


  derivePolicyCovSymbols(vehicle: any, nonOwnerPolicyIndicator: boolean): any {
    const policyLevelCovSymbols: Coverage[] = [];
    const symbols = vehicle.symbols;
    const pipSymbol = symbols?.find((x: { name: string; }) => (x.name === 'PIP2' || x.name === 'PIP'))?.value || '';


    const derivedSymbol = this.assignSymbol(vehicle, nonOwnerPolicyIndicator);

    if (derivedSymbol > 0) {

      // BI
      policyLevelCovSymbols.push(this.createCoverage('BI', '', '', derivedSymbol.toString(), ''));

      // PD
      policyLevelCovSymbols.push(this.createCoverage('PD', '', '', derivedSymbol.toString(), ''));

      // PIP
      policyLevelCovSymbols.push(this.createCoverage('PIP', '', '', derivedSymbol.toString(), ''));

      // UM/UIM
      policyLevelCovSymbols.push(this.createCoverage('UM/UIM', '', '', derivedSymbol.toString(), ''));



      // MP
      // policyLevelCovSymbols.push(this.createCoverage('MP', '', '', derivedSymbol.toString()));

      // UIM
      // policyLevelCovSymbols.push(this.createCoverage('UIM', '', '', derivedSymbol.toString()));


    } else {
      // BI
      const biSymbol = symbols?.find((x: { name: string; }) => (x.name === 'BI2' || x.name === 'BI'))?.value || '';
      policyLevelCovSymbols.push(this.createCoverage('BI', '', '', biSymbol, ''));

      // PD
      const pdSymbol = symbols?.find((x: { name: string; }) => (x.name === 'PD2' || x.name === 'PD'))?.value || '';
      policyLevelCovSymbols.push(this.createCoverage('PD', '', '', pdSymbol, ''));

      // PIP
      policyLevelCovSymbols.push(this.createCoverage('PIP', '', '', pipSymbol, ''));

      if (GlobalConstants.UMUIM_SYMBOLS_STATES.includes(this.riskState)) {
        // UM/UIM
        policyLevelCovSymbols.push(this.createCoverage('UM/UIM', '', '', pipSymbol, ''));
      }


      /* TODO: DO NOT Delete code.. Below logic can be used for future states roll out
      if (!ObjectUtils.isFieldEmpty(PIPSymbol)) {
        policyLevelCovSymbols.push(this.createCoverage('MP', '', '', PIPSymbol));
        policyLevelCovSymbols.push(this.createCoverage('UMBI', '', '', PIPSymbol));
        policyLevelCovSymbols.push(this.createCoverage('UIMBI', '', '', PIPSymbol));
      }

     */


    }



    return policyLevelCovSymbols;
  }



  deriveVehicleSymbols(vehicle: any, symbols: Symbol[]): VehSymbol[] {

    const vtiSymVal = symbols?.find((x: { name: string; }) => (x.name === 'VTI3' || x.name === 'VTI'))?.value || '';
    const vehAdjFactor = symbols?.find((x: { name: string; }) => x.name === 'USERCODE1')?.value || '';
    const ymmSymVal = symbols?.find((x: { name: string; }) => x.name === 'YMM')?.value || '';
    const unacceptVal = this.riskState === GlobalConstants.STATE_PA
        ? symbols?.find((x: { name: string; }) => (x?.name === 'UNACCEPT'))?.value || '00'
        : '00';

    const vehSymbols: VehSymbol[] = [
      {
        name: 'YMM',
        value: this.getYMM(vehicle.type, vehicle.year, ymmSymVal)
      },
      {
        name: 'VTI',
        value: this.getVTI(vehicle.type, vehicle.year, vtiSymVal)
      },
      {
        name: 'USERCODE1',
        value: this.getVehAdjustFactor(vehicle.type, vehicle.year, vehAdjFactor)
      },
      {
        name: 'UNACCEPT',
        value: unacceptVal
      }
    ];

    return vehSymbols;
  }

  createCoverage(code: string, limits: string, deductible: string, symbols: string, type:string): Coverage {
    const coverage: Coverage = {
      code, limits,
      deductible: !ObjectUtils.isObjectEmpty(deductible) ? Number(deductible).toFixed(2) : deductible,
      symbols, type
    }

    return coverage;
  }
  createCoverageDetail(vehicleId: string, code: string, limits: string, deductible: string, symbols: string, type:string): PolicyCoveragePerVehicleId {
    const coverage: Coverage = {
      code, limits, deductible, symbols, type
    }
    const policyCoveragePerVehicleId: PolicyCoveragePerVehicleId = {
      vehicleId, coverage
    }
    return policyCoveragePerVehicleId;
  }

  mapViolationData(violationData: any, violationsFormData: any): AutoQuoteData {
    const driversData: Driver[] = [];
    let hasDUIViolation: boolean = false;
    violationData.forEach((driverData: any, driverIndex: number) => {
      // if (driverData?.violations?.length > 0) {
      const licenseData: License = {
        licenseType: driverData.licenseType,
        licenseNumber: driverData.licensenumber,
        licenseState: driverData.licensestate
      };
      const driverCategoryReason: driverCategoryReason[] = []
      const driverCategoryReasonData = {
        name: "",
        value: "",
      };
      driverCategoryReason.push(driverCategoryReasonData);
      // console.log(driverData.filing + "====driverData.filing");
      let checkSR22Box = GlobalConstants.SR22_CHECKBOX_STATE.includes(this.state) ? true : false;
      if (checkSR22Box) {
        driverData.filing === true ? driverData.filingType = 'C' : driverData.filingType = 'N';
      }
      const discountIndicatorsData: DiscountIndicators = {
        //sr22FilingIndicator: driverData.filing,
        stateFiling: {
          indicators: [{
            name: driverData.filingType === 'N' ? "No" : driverData.filingType === 'C' ? "SR22" : driverData.filingType === 'H' ? "FR44" : "",
            value: driverData.filingType
          }]
          , caseNumber: driverData.caseNumber
        },
        distantStudentIndicator: driverData.distantstd
      };
      const violationsData: Violation[] = [];
      if (driverData.violations != null && driverData.violations !== '') {
        driverData.violations.forEach((violationDataObj: any, violationIndex: number) => {
          if (violationDataObj?.violationCode && violationDataObj?.violationCode !== GlobalConstants.EMPTY_STRING) {
            const customAttributesData: CustomAttributes = {
              operation: violationDataObj.operation
            };
            let claimsPayoutsArr: any = [];
            violationDataObj?.claimsPayouts?.forEach((claimData: { status: any; code: any; amount: { toString: () => any; }; }) => {
              const claimsPayouts: ClaimsPayouts = {
                name: "",
                status: claimData?.status == null ? "" : claimData?.status,
                code: claimData?.code == null ? "" : claimData?.code,
                amount: claimData?.amount == null ? "0" : (claimData?.amount).toString()
              };
              claimsPayoutsArr.push(claimsPayouts)
            });
            /*const claimsPayouts: ClaimsPayouts = {
              name: "",
              status: violationDataObj?.claimsPayouts == undefined ? "" : violationDataObj?.claimsPayouts[0].status == null ? "" : violationDataObj?.claimsPayouts[0].status,
              code: violationDataObj?.claimsPayouts == undefined ? "" : violationDataObj?.claimsPayouts[0].code == null ? "" : violationDataObj?.claimsPayouts[0].code,
              amount: violationDataObj?.claimsPayouts == undefined ? "0" : violationDataObj?.claimsPayouts[0].amount == null ? "0" : (violationDataObj?.claimsPayouts[0].amount).toString()
            };
            let claimsPayoutsArr = [];
            claimsPayoutsArr.push(claimsPayouts)*/
            const violation: Violation = {
              // sequenceNumber: `${violationIndex + 1}`,
              //sequenceNumber: customAttributesData.operation === 'Add' ? '0' : `${violationDataObj.sequenceNumber}`,
              sequenceNumber: `${violationDataObj.sequenceNumber}`,
              violationCode: violationDataObj.violationCode.toUpperCase(),
              violationName: violationDataObj.violationName.toUpperCase(),
              violationDate: violationDataObj.violationDate,
              // displayingDisputeIndicator: violationData.displayingDisputeIndicator,
              // disputeExplanation:'',
              displayingDisputeIndicator: violationsFormData[driverIndex].listOfViolations[violationIndex].dispute,
              disputeExplanation: violationsFormData[driverIndex].listOfViolations[violationIndex].explanation,
              disputeLevel: violationDataObj.disputeLevel,
              reportingSource: violationDataObj.reportingSource === 'Self Reported' ? 'SR' : violationDataObj.reportingSource === 'MVR' ? 'MVR' : 'CLUE',
              withinChargeablePeriodIndicator: false,
              editableIndicator: violationDataObj.reportingSource === 'Self Reported',
              removableIndicator: violationDataObj.reportingSource === 'Self Reported',
              convictionDate: violationDataObj?.convictionDate ? violationDataObj?.convictionDate : GlobalConstants.EMPTY_STRING,
              claimsPayouts: claimsPayoutsArr
              // clmViolationAmt: violationDataObj?.clmViolationAmt,
              // clmViolationType: violationDataObj?.clmViolationType,
              // clmViolationStatus: violationDataObj?.clmViolationStatus
            };

            if (violationDataObj.violationCode.toUpperCase() === GlobalConstants.DUI_VIOLATION && violationDataObj.operation === 'Add'
              && violationDataObj.reportingSource) {
              hasDUIViolation = true;
            }

            // hasDUIViolation = violationDataObj.violationCode.toUpperCase() === GlobalConstants.DUI_VIOLATION && violationDataObj.operation === 'Add'
            //  && violationDataObj.reportingSource === 'Self Reported' ? true : false;
            // console.log('violationDataObj.operation: ',violationDataObj.operation, '   Has DUI violation: ', hasDUIViolation);
            // comparing violationData and Violation DBData
            if (customAttributesData.operation !== ('delete' || 'Add')) {
              if (!ObjectUtils.isObjectEmpty(violation)) {
                customAttributesData.operation = 'Add';
              }
            }
            violation.customAttributes = customAttributesData;
            violationsData.push(violation);
          }
        });

        const driver: Driver = {
          sequenceNumber: `${driverData.sequenceNumber}`,
          //sequenceNumber:`${driverIndex + 1}`,
          driverType: driverData.rated,
          source: driverData.status,
          primaryInsuredIndicator: driverIndex === 0,
          firstName: driverData.firstName.toUpperCase().trim(),
          middleName: (driverData.middleName !== null && driverData.middleName !== undefined ? driverData.middleName.toUpperCase().trim() : ''),
          lastName: driverData.lastName.toUpperCase().trim(),
          suffix: (driverData.suffix !== null && driverData.suffix !== undefined ? driverData.suffix?.toUpperCase() : ''),
          birthDate: driverData.dob ? JSON.stringify(driverData.dob).replace(/"/g, '').slice(0, 10) : '',
          gender: (driverData.gender !== null && driverData.gender !== undefined ? driverData.gender.toUpperCase() : ''),
          maritalStatus: (driverData.maritalStatus !== null && driverData.maritalStatus !== undefined ? driverData.maritalStatus.toUpperCase() : ''),
          education: driverData.education,
          driverCategoryReasons: driverCategoryReason,
          occupationCode: driverData.occupation,
          subOccupationCode: driverData.suboccupation,
          relationshipToInsured: driverData.relationship,
          discountIndicators: discountIndicatorsData,
          license: licenseData,
          violations: violationsData,
          violationsCount: 0
        };

        !isEmpty(violationsData) ? driversData.push(driver) : '';
        // driversData.push(driver)

      }
      //  }
    });

    if (this.state === GlobalConstants.STATE_FL && hasDUIViolation) {
      this.navigationService.addRequiredRoutes(this.navigationService.actionBasedRoutes('ViolationDUI'));
    }

    const personalAutoData = {
      drivers: driversData
    };

    const autoQuoteData = {
      quoteNumber: this.quoteNumber,
      rateBook: this.storeRateBook,
      state: this.state,
      personalAuto: personalAutoData,
    };

    this.autoQuoteData = {
      autoQuote: autoQuoteData
    };


    return this.autoQuoteData;
  }

  getVehicleYear(type: string, year: string): string {
    const vehYear = type === GlobalConstants.NON_OWNER_CODE ? GlobalConstants.NON_OWNER_YEAR_VALUE : year;
    return vehYear;
  }
  getAntiLockBrakeInd(type: string, year: string, antiLockBrake: string): string {
    const antiLockBrakeInd = type === GlobalConstants.NON_OWNER_CODE ||
      type === GlobalConstants.CONVERSION_VAN_CODE ||
      Number(year) <= 1980 ? 'N' : antiLockBrake;
    return antiLockBrakeInd || GlobalConstants.EMPTY_STRING;
  }

  getAirBagInd(type: string, year: string, airBag: string): string {
    const airBagInd = type === GlobalConstants.NON_OWNER_CODE ||
      type === GlobalConstants.CONVERSION_VAN_CODE ||
      Number(year) <= 1980 ? 'J' : airBag;
    return airBagInd;
  }

  getVehAdjustFactor(type: string, year: string, vehAdjFtr: string): string {
    const vehAdjFactor = type === GlobalConstants.NON_OWNER_CODE ||
      type === GlobalConstants.CONVERSION_VAN_CODE ||
      Number(year) <= 1980 ? 'Z' : CommonUtils.lrtrim(vehAdjFtr);
    return vehAdjFactor;
  }

  getVTI(type: string, year: string, vti: string): string {
    const vehVTI = type === GlobalConstants.NON_OWNER_CODE ||
      type === GlobalConstants.CONVERSION_VAN_CODE ||
      Number(year) <= 1980 ? 'Z' : vti;
    return vehVTI;
  }

  getYMM(type: string, year: string, ymm: string): string {
    return type === GlobalConstants.NON_OWNER_CODE ||
      type === GlobalConstants.CONVERSION_VAN_CODE ||
      Number(year) <= 1980 ? 'XXX' : ymm;
  }

  mapCoveragesData(coveragesFormData: any, priorCarrierValidValues: any, coverageDBdata: any, coveragesValidValues: ValidvaluesCommon[], changeCount: any, applicantNonOwner: any,driversData : Driver[],vehicleData : Vehicle[]): AutoQuoteData {
    let source = coverageDBdata?.priorCarrierInfo[0]?.source?.trim();
    let priorCarrierValue = coverageDBdata?.priorCarrierInfo[0]?.priorCarrierName?.trim();
    const datePipe = new DatePipe('en-US');
    const policyCoverages: Coverage[] = [];
    const phones: Phone[] = [];
    const addresses: Address[] = [];
    const customAttributes: CustomAttributes = {
      operation: "Add"
    };
    const personData: Person = {
      socialSecurityNumber: coveragesFormData.get('ssn').value == null ? '' :
        coveragesFormData.get('ssn').value.length < 9 ? GlobalConstants.EMPTY_STRING : coveragesFormData.get('ssn').value.replace(/-/g, '')
    }
    const contact: Contact = {
      person: personData,
      phones,
      addresses
    }
    const policyExpdate = (coveragesFormData.get('expiryDate')?.value === '' || coveragesFormData.get('expiryDate')?.value.toString() === 'Invalid Date' ? '' : datePipe.transform(
      new Date(coveragesFormData.get('expiryDate')?.value), 'MM/dd/yyyy') ?? Date.now().toString());

    const priorCarrier = coveragesFormData.get('priorCarrier')?.value.toUpperCase();
    const priorCarrierDBVal = priorCarrierValue === '99' ? '99' : priorCarrierValidValues?.find((x: { displayvalue: string; }) => x.displayvalue.toUpperCase() === priorCarrier)?.key;
    const continousInsuranceIndicator = priorCarrierDBVal === 'NR' && this.state === GlobalConstants.STATE_IN ? 'Y' : coveragesFormData.get('autoInsurance')?.value;
    const priorCarrierVal = continousInsuranceIndicator === 'Y' ? priorCarrierDBVal : GlobalConstants.EMPTY_STRING;
    let policyExpirationDate = GlobalConstants.DUMMY_DATE;
    if (continousInsuranceIndicator === 'Y') {
      policyExpirationDate = (policyExpdate === GlobalConstants.EMPTY_STRING ? GlobalConstants.DUMMY_DATE : policyExpdate);
    }
    const priorLimits = continousInsuranceIndicator === 'Y' ? coveragesFormData.get('policyLimit')?.value : GlobalConstants.EMPTY_STRING;
    // Check SOurce = REPORT data or USER SELECTED data

    if ((continousInsuranceIndicator === 'N' && // If continousInsuranceIndicator = N , Compare only DBcontinousInsuranceIndicator with Form continousInsuranceIndicator. Ignore other fields priorCarrier, limits, endDate
      coverageDBdata?.priorCarrierInfo[0].priorInsuranceIndicator?.trim() !== continousInsuranceIndicator)
      ||
      (continousInsuranceIndicator !== 'N' && this.priorInsuranceDBFormValuesComparison(coverageDBdata, coveragesFormData, priorCarrierDBVal, continousInsuranceIndicator, policyExpirationDate)) // If continousInsuranceIndicator = Y , Compare all fields continousInsuranceIndicator, priorCarrier, limits, endDate
    ) {
      source = 'UserSelected';
      if (changeCount !== 0) {
        this.store.dispatch(Actions.priorCarrierInsIndicator({ priorCarrierInsIndicator: 'Y' })); // Set Indicatoer to 'Y'(To display soft edit on reports page), If Prior Insurance returns response and user DOES change the prefill response on the Coverages Page to another selection
      }
    } else {
      this.store.dispatch(Actions.priorCarrierInsIndicator({ priorCarrierInsIndicator: 'N' }));
    }

    // Store POP report SOurce = REPORT data or USER SELECTED data
    const priorCarrierInfo: PriorCarrierInfo[] = [{
      source: source,
      priorInsuranceIndicator: continousInsuranceIndicator,
      priorCarrierName: priorCarrierVal,
      policyExpirationDate: policyExpirationDate,
      priorLimits: priorLimits,
      customAttributes
    }];

    const policyCoveragesDetails = this.policyLevelCoveragesDataMapping(coveragesFormData, coveragesValidValues, applicantNonOwner);
    // console.log('====== Policy Level COverages =======> ', policyCoveragesDetails);
    const personalAutoData = this.riskState ===GlobalConstants.STATE_VA?this.PrimaryVehicleSelection(coveragesFormData,driversData,vehicleData):undefined;

    const autoQuoteData = {
      quoteNumber: this.quoteNumber,
      rateBook: this.storeRateBook,
      state: this.state,
      contact,
      personalAuto: personalAutoData, 
      policyCoveragesDetails,
      priorCarrierInfo
    };
    this.autoQuoteData = {
      autoQuote: autoQuoteData
    };

    return this.autoQuoteData;
  }

  priorInsuranceDBFormValuesComparison(coverageDBdata: any, coveragesFormData: any, priorCarrierDBVal: any, continousInsuranceIndicator: any, policyExpirationDate: any) {
    return (coverageDBdata?.priorCarrierInfo[0].priorInsuranceIndicator?.trim() !== continousInsuranceIndicator ||
      coverageDBdata?.priorCarrierInfo[0]?.priorCarrierName?.trim() !== priorCarrierDBVal ||
      // For BRISTOL_WEST_AFFILIATED_VALUES , UI defaulting limits and date value. SO always DB limit / Date will vary from Form Limit / date values
      (!GlobalConstants.BRISTOL_WEST_AFFILIATED_VALUES.includes(priorCarrierDBVal) && coverageDBdata?.priorCarrierInfo[0]?.priorLimits?.trim() !== undefined && coverageDBdata?.priorCarrierInfo[0]?.priorLimits?.trim() !== (coveragesFormData.get('policyLimit')?.value)) ||
      (!GlobalConstants.BRISTOL_WEST_AFFILIATED_VALUES.includes(priorCarrierDBVal) && coverageDBdata?.priorCarrierInfo[0]?.policyExpirationDate?.trim() !== undefined && coverageDBdata?.priorCarrierInfo[0]?.policyExpirationDate?.trim() !== policyExpirationDate))
  }

  policyLevelCoveragesDataMapping(formData: any, coveragesValidValues: ValidvaluesCommon[], applicantNonOwner: any) {
    const _policyCoverages: Coverage[] = [];
    let _underinsuredMotoristSelection:string = "";

    const customAttributes: CustomAttributes = {
      // operation: page === 'coverages' ? "Add" : "Update"
      operation: 'Add'
    };
    if(this.riskState === GlobalConstants.STATE_VA){
      let ums_type =  formData.get("UMS").value;
      if(ums_type==='Y')
      {
        _underinsuredMotoristSelection = 'Standard';
      }else{
        _underinsuredMotoristSelection = 'Alternative';
      }

    }
    coveragesValidValues.forEach(validValue => {
      const cvgValue = formData.get(validValue.code)?.value;
      if (validValue.code == "PIP") {
        if (this.riskState === GlobalConstants.STATE_TX) {
          let pipdVal = formData.get("PIP")?.value;
          _policyCoverages.push(this.createCoverage(validValue.code, this.deriveCoverageValue(this.riskState, validValue.code, cvgValue), '', '', ''));
        } else {
          if (applicantNonOwner) {
            let coverage = {
              "code": "PIP", "limits": "",
              "deductible": "",
              "symbols": "","type": ""
            }
            _policyCoverages.push(coverage);
          } else {
            let pipdVal = formData.get("PIPD")?.value
            let codeVal = cvgValue.substring(0, 1) + validValue.code;
            const cvgPIPD_Value = formData.get("PIPI")?.value == "NIO" ? "N" : formData.get("PIPI")?.value == "NIRR" ? "D" : "";
            let cvgValueLimit = "010" + cvgValue.substring(cvgValue.length - 1, cvgValue.length) + cvgPIPD_Value;
            _policyCoverages.push(this.createCoverage(codeVal, this.deriveCoverageValue(this.riskState, validValue.code, cvgValueLimit),
              this.deriveCoverageDeductible(this.riskState, validValue.code, cvgValueLimit, pipdVal), '', ''));
            const addlCvg = this.checkForAdditionalCoverages(this.riskState, validValue.code, cvgValueLimit);
            addlCvg !== null ? _policyCoverages.push(addlCvg) : null;
          }
        }
      }
       else if (validValue.code !== "PIPI" && validValue.code !== "PIPD" && validValue.code!== "UMS" && validValue.code !== "") {
        _policyCoverages.push(this.createCoverage(validValue.code, this.deriveCoverageValue(this.riskState, validValue.code, cvgValue),
          this.deriveCoverageDeductible(this.riskState, validValue.code, cvgValue, ""), '',GlobalConstants.UMS_FOR_UMPD_UMUIM.includes(validValue.code)?_underinsuredMotoristSelection:''));
        const addlCvg = this.checkForAdditionalCoverages(this.riskState, validValue.code, formData.get(validValue.code)?.value);
        addlCvg !== null ? _policyCoverages.push(addlCvg) : null;
      }

      if(this.riskState === GlobalConstants.STATE_PA) {
        let umunstValue = formData.get("UMUNST")?.value;
        let uimunsValue = formData.get("UIMUNS")?.value;
        if(umunstValue.includes('S') && validValue.code === 'UMUNST') {
          const limit = umunstValue.replace('S','');
          let umstCov: Coverage = {
            code: 'UMST',
            deductible: '',
            limits: limit,
            symbols: this.pipUMSTSym
          }
          _policyCoverages.push(umstCov);
          let umunst = _policyCoverages.find((x: { code: string; }) => x.code === 'UMUNST');
            if(umunst){
              umunst.limits = '';
            }
        }
        if(uimunsValue.includes('S') && validValue.code === 'UIMUNS') {
          const limit = uimunsValue.replace('S','');
          
            let uimstCov: Coverage = {
            code: 'UIMST',
            deductible: '',
            limits: limit,
            symbols: this.pipUIMSTSym
          }
          _policyCoverages.push(uimstCov);
          let uimuns = _policyCoverages.find((x: { code: string; }) => x.code === 'UIMUNS');
            if(uimuns){
              uimuns.limits = '';
            }
        }
      }
    });

    //console.log('New Coverages List =====> ', _policyCoverages);
    const policyCoveragesDetails: PolicyCoveragesDetails = {
      coverages: _policyCoverages,
      customAttributes
    }
    return policyCoveragesDetails;
  }

  deriveCoverageValue(stateCode: string, coverageCode: string, coverageVal: string): string {
    let covgVal = '';
    covgVal = coverageCode === GlobalConstants.UIM_COVERAGE_CD && coverageVal === 'None' ? GlobalConstants.UIM_COVERAGE_DEFAULT : (coverageCode === GlobalConstants.UMBI_COVERAGE_CD && coverageVal === 'None' && stateCode == GlobalConstants.STATE_AZ) ? GlobalConstants.UMBI_COVERAGE_DEFAULT : (coverageVal === 'None' ? GlobalConstants.EMPTY_STRING : coverageVal)
    return covgVal;
  }

  deriveCoverageDeductible(stateCode: string, coverageCode: string, coverageVal: string, pipdVal: string): string {
    let dedVal = '';
    if (coverageCode === GlobalConstants.UMPD_COVERAGE_CD && coverageVal !== GlobalConstants.NONE) {
      dedVal = GlobalConstants.STATE_TX === this.riskState ? GlobalConstants.UMPD_DEDUCTIBLE_DEFAULT_TX : GlobalConstants.UMPD_DEDUCTIBLE_DEFAULT
    }
    if (coverageCode == "PIP" && pipdVal !== "") {
      dedVal = pipdVal
    }
    return dedVal;

  }

  checkForAdditionalCoverages(stateCode: string, coverageCode: string, coverageVal: string): Coverage | null {

    // State Specific Logic goes here - specific to coverage limit value
    if (stateCode === GlobalConstants.STATE_IN && coverageCode === GlobalConstants.UMBI_COVERAGE_CD) {
      const covgValue = coverageVal === GlobalConstants.UMBI_COVERAGE_2550 ? GlobalConstants.UMBI_COVERAGE_5050 :
        (coverageVal !== GlobalConstants.NONE ? coverageVal : GlobalConstants.EMPTY_STRING);
      return this.createCoverage(GlobalConstants.UIM_COVERAGE_CD, covgValue, '', '', '');
    }

    return null;

  }

  //

  private pushCoveragesAsPerState(policyCoverages: Coverage[], formData: any): void {
    switch (this.riskState) {
      case "IN":
        if (formData.get('UMPD')?.value === 'None') {
          policyCoverages.push((this.createCoverage('UMPD', '', '', '', '')));
        }
        else {
          policyCoverages.push((this.createCoverage('UMPD', formData.get('UMPD')?.value, '300', '','')));
        }
        break;
      case "IL":
        policyCoverages.push((this.createCoverage('UM/UIM', formData.get('UM/UIM')?.value, '', '', '')))
        break;
      default:
        // console.log("No");
        break;
    }
  }

  PrimaryVehicleSelection(coveragesFormData: any, drivers: Driver[], vehicleData: Vehicle[]){
    const driversData: Driver[] = [];
    drivers?.forEach((driver,index)=>{
      const associatedIndex  = coveragesFormData.get('primaryVehicleAssignment')?.value[index].vehicle
     
      const associatedVehiclesData: AssociatedVehicles = {
        key: associatedIndex,
        value: ''
      }
      const licenceData : License= {
        licenseNumber: '',
        licenseState: '',
        licenseType: ''
      }
      const stateFilingData : StateFiling= {
        indicators: []
      }
      const discountIndicatorsData: DiscountIndicators ={
        stateFiling: stateFilingData,
        distantStudentIndicator: false
      }
      const modifiedDriverData : Driver = {
        associatedVehicles:[associatedVehiclesData],
        sequenceNumber: `${driver.sequenceNumber}`,
        firstName: driver.firstName.toUpperCase().trim(),
        middleName: (driver.middleName !== null && driver.middleName !== undefined ? driver.middleName.toUpperCase().trim() : ''),
        lastName: driver.lastName.toUpperCase().trim(),
        suffix: (driver.suffix !== null && driver.suffix !== undefined ? driver.suffix?.toUpperCase() : ''),
        gender: (driver.gender !== null && driver.gender !== undefined ? driver.gender.toUpperCase() : ''),
        driverType: '',
        source: '',
        primaryInsuredIndicator: false,
        birthDate: '',
        maritalStatus: '',
        education: '',
        occupationCode: '',
        subOccupationCode: '',
        relationshipToInsured: '',
        discountIndicators: discountIndicatorsData,
        license: licenceData,
        violationsCount: 0
      }
      driversData.push(modifiedDriverData);
    })
    const personalAutoData = {
          drivers: driversData,
          vehicles: vehicleData
        };
    return personalAutoData;
  }
  
  mapPolicyInfoData(policyInfoForm: any, operationType: string): AutoQuoteData {

    const driversData: Driver[] = [];
    this.additionalDrivers = this.policyInfoService.getAdditionalDrivers();
    const datePipe = new DatePipe('en-US');
    const customAttributes: CustomAttributes = {
      operation: 'Add'
    };
    const person: Person = {
      householdMembers: policyInfoForm.get('householdMember')?.value
    };
    const policyDiscountIndicators: PolicyDiscountIndicators =
    {
      primaryResidence: policyInfoForm.get('primaryResidence')?.value,
      goPaperlessIndicator: policyInfoForm.get('goPaperlessDiscount')?.value == '' ? false : true,
      esignatureIndicator: policyInfoForm.get('eSignature')?.value == '' ? false : true,
      multiPolicy: policyInfoForm.get('multilineDiscount')?.value,
      downPaymentMethod: policyInfoForm.get('downPayment')?.value,
      eftFutureInstallments: policyInfoForm.get('eft')?.value,
      customAttributes
    };
    const Contact: Contact =
    {
      person: person,
      phones: [],
      addresses: [],
      customAttributes: customAttributes
    };
    const addDriversArr = policyInfoForm.get('additionalDrivers')?.value;
    addDriversArr.forEach((item: any, index: number) => {
      let addDriverIndex = this.additionalDrivers[index];
      const licenseData: License = {
        licenseType: '',
        licenseNumber: addDriverIndex?.licenceNumber,
        licenseState: addDriverIndex?.licenceState.toUpperCase()
      };
      let checkSR22Box = GlobalConstants.SR22_CHECKBOX_STATE.includes(this.state) ? true : false;
      if (checkSR22Box) {
        addDriverIndex.filingType = 'N';
      }
      const discountIndicatorsData: DiscountIndicators = {
        //sr22FilingIndicator: false,
        stateFiling: {
          indicators: [{
            name: addDriverIndex?.filingType === 'N' ? "No" : addDriverIndex?.filingType === 'C' ? "SR22" : addDriverIndex?.filingType === 'H' ? "FR44" : "",
            value: addDriverIndex?.filingType
          }], caseNumber: ""
        },
        distantStudentIndicator: false
      };

      const disputes: Disputes = {
        action: item.action,
        reason: item.explanation?.toUpperCase(),
        level: item.level || '0'
      }

      const driverCategoryReason: driverCategoryReason[] = []
      const driverCategoryReasonData = {
        name: "",
        value: "",
      };
      driverCategoryReason.push(driverCategoryReasonData);

      const driver: Driver = {
        sequenceNumber: '',
        driverType: 'Additional',
        source: addDriverIndex?.source.toUpperCase(),
        linkedDriver: item.listedDriver || '',
        primaryInsuredIndicator: false,
        firstName: addDriverIndex?.firstName.toUpperCase().trim(),
        middleName: addDriverIndex?.middleInitial == null ? '' : addDriverIndex?.middleInitial?.toUpperCase().trim(),
        lastName: addDriverIndex?.lastName.toUpperCase().trim(),
        suffix: '',
        birthDate: addDriverIndex?.dateOfBirth,
        gender: '',
        maritalStatus: '',
        education: '',
        driverCategoryReasons: driverCategoryReason,
        occupationCode: '',
        subOccupationCode: '',
        relationshipToInsured: '',
        discountIndicators: discountIndicatorsData,
        license: licenseData,
        disputes,
        customAttributes,
        violationsCount: 0
      };

      driversData.push(driver);
    });
    const multiPolicy = policyInfoForm.get('multilineDiscount')?.value === 'None' ? 'N' : policyInfoForm.get('multilineDiscount')?.value;

    const personalAutoData = {
      drivers: driversData
    };
    const autoQuoteData = {
      quoteNumber: this.quoteNumber,
      rateBook: this.storeRateBook,
      state: this.state,
      contact: Contact,
      personalAuto: personalAutoData,
      policyDiscountIndicators: policyDiscountIndicators

    };
    this.autoQuoteData = {
      autoQuote: autoQuoteData
    };

    return this.autoQuoteData;
  }

  addDriverToStore(driverForm: Driver): void {

    const driver: DriverSummary = {
      driverId: driverForm.sequenceNumber,
      firstName: driverForm.firstName.toUpperCase().trim(),
      middleName: driverForm.middleName.toUpperCase().trim(),
      lastName: driverForm.lastName.toUpperCase().trim(),
      //matureDriverIndicator: matureDriverStatus
    }

    if (driverForm.customAttributes?.operation !== 'delete') {
      this.store.dispatch(addDriver({ driver }));
    }
  }

  addVehicleToStore(vehicleForm: Vehicle): void {
    const vehicle: VehicleSummary = {
      sequenceNumber: vehicleForm.sequenceNumber,
      year: vehicleForm.year,
      make: vehicleForm.make.toUpperCase(),
      model: vehicleForm.model.toUpperCase(),
      vin: vehicleForm.vin?.toUpperCase(),
      use: vehicleForm.primaryUse,
      commuteToNJNYSurcharge: vehicleForm.commuteToNJNYSurcharge,
      coverages: []
    }

    if (vehicleForm.customAttributes?.operation !== 'delete') {
      this.store.dispatch(addVehicle({ vehicle }));
    }
  }

  mapRateSaveQuoteRequestData(ratesForm: any, selectedPayPlan: any, page: string, coverageValidValues: ValidvaluesCommon[], applicantNonOwner: boolean= false, vehicles: Vehicle[]): AutoQuoteData {
    const policyCoveragesDetails = this.policyLevelCoveragesDataMapping(ratesForm, coverageValidValues, applicantNonOwner);
    const vehicleData: Vehicle[] = [];
    const payPlnsData: PayPlanDetails[] = [];
    vehicles.filter((vehicle:any,index: number) => {
      if(vehicle) {
        this.vehiclesPrimaryUse[index] = vehicle.primaryUse;
      }
    })
    const customAttributes: CustomAttributes = {
      operation: 'Add'
    };
    let isEftPayplanOnly;

    if (selectedPayPlan) {
      if (selectedPayPlan[0] !== undefined && typeof selectedPayPlan[0] !== 'string') {
        selectedPayPlan[0].defaultIndicator = true;
        isEftPayplanOnly = selectedPayPlan[0].electronicFundTransfer.requiredIndicator;
      }
    }
    selectedPayPlan?.forEach((paypln: any) => {
      if (paypln && typeof paypln !== 'string') {
        paypln.customAttributes = customAttributes;
        payPlnsData.push(paypln);
      }
    });

    const autoCoverages: AutoCoverages = {
      payplansDetails: payPlnsData,
      premiumDetails: [],
      packageType: ''
    }

    const policyPackage: PolicyPackage[] = [{
      autoCoverages: autoCoverages,
      policyFees: [],
      serviceFees: []
    }];
    const vehiclesList = ratesForm.get('vehicles')?.value;
    vehiclesList.forEach((vehicle: any,index:number) => {
      const vehicleLevelCovSymbols: Coverage[] = [];
      const symbols = vehicle.symbols;
      const compSelectedVal = vehicle.OTC;
      const COMPSymbol = symbols?.find((x: { name: string; }) => (x.name === 'COMP2' || x.name === 'COMP' || x.name === 'OTC' || x.name === 'OTC0GD'))?.value || '';
      const compVal = compSelectedVal !== GlobalConstants.NONE ? compSelectedVal.split('O') : GlobalConstants.NONE;
      const compCode = compSelectedVal !== GlobalConstants.NONE ? 'O' + compVal[1] : 'OTC'
      const COMPDeductible = compSelectedVal !== GlobalConstants.NONE ? compVal[0] : GlobalConstants.EMPTY_STRING;
      const COLLDeductible = vehicle.COL !== GlobalConstants.NONE ? vehicle.COL : GlobalConstants.EMPTY_STRING;
      const AddEquLimit = vehicle.CEQ !== GlobalConstants.NONE ? vehicle.CEQ : GlobalConstants.EMPTY_STRING;
      const UmpdLimit = vehicle.UMPD !== '000' ? vehicle.UMPD : GlobalConstants.EMPTY_STRING;
      const RentLimit = vehicle.EXTR !== GlobalConstants.NONE ? vehicle.EXTR : GlobalConstants.EMPTY_STRING;
      const primaryUse = this.vehiclesPrimaryUse[index];
      const commuteToNJNYSurcharge = vehicle.commuteToNJNYSurcharge;

      vehicleLevelCovSymbols.push(this.createCoverage(compCode, '', COMPDeductible, '', ''));
      vehicleLevelCovSymbols.push(this.createCoverage('COL', '', COLLDeductible, '', ''));
      vehicleLevelCovSymbols.push(this.createCoverage('ALL', vehicle.ALL, '', '', ''));
      vehicleLevelCovSymbols.push(this.createCoverage('EXTR', RentLimit, '', '', ''));
      vehicleLevelCovSymbols.push(this.createCoverage('CEQ', AddEquLimit, '', '', ''));
      vehicleLevelCovSymbols.push(this.createCoverage('RA', vehicle.RA, '', '', ''));
      this.pushVehicleLevelCoveragesAsPerState(vehicleLevelCovSymbols, UmpdLimit, '');


      const garageAddress: GarageAddress = {
        addressLine: '',
        streetName: '',
        streetType: '',
        apartmentNumber: '',
        houseNumber: '',
        postalOfficeBoxNumber: '',
        ruralRouteNumber: '',
        city: '',
        state: '',
        postalCode: '',
        outOfStateIndicator: false
      };

      const discountIndicators: DiscountIndicator[] = [
        {
          code: GlobalConstants.ANTI_THEFT_CODE,
          value: vehicle.antiTheftCode || "-"
        }
      ];
      const vehSymbols: VehSymbol[] = [];
      const policyLevelCoverages: Coverage[] = [];

      const veh: Vehicle = {
        // sequenceNumber: `${index + 1}`,
        sequenceNumber: vehicle.id,
        driverId: '',
        vin: '',
        vinHitIndicator: false,
        vehicleType: '',
        bodyType: '',
        year: '',
        make: '',
        model: '',
        trimDescription: '',
        odometerReading: '',
        annualMileage: '',
        primaryUse: primaryUse,
        commuteToNJNYSurcharge: commuteToNJNYSurcharge,
        theCurrencyAmount: '0',
        garageAddress,
        discountIndicators,
        coverages: vehicleLevelCovSymbols,
        policyCoverages: policyLevelCoverages,
        symbols: vehSymbols,
        customAttributes
      };
      vehicleData.push(veh);
    });
    const personalAutoData = {
      vehicles: vehicleData
    };
    const eftInstallInd = isEftPayplanOnly === true && ratesForm.get('eft')?.value === 'N' ? 'Y' : ratesForm.get('eft')?.value;
    const downPayInd = isEftPayplanOnly === true && ratesForm.get('eft')?.value === 'N' ? 'Y' : ratesForm.get('downPayment')?.value;
    const policyDiscountIndicators: PolicyDiscountIndicators = {
      downPaymentMethod: downPayInd,
      eftFutureInstallments: eftInstallInd,
      customAttributes
    }
    const autoQuoteData = {
      quoteNumber: this.quoteNumber,//'Q0217316160028',
      rateBook: this.storeRateBook,
      state: this.state,
      masterCompany: this.mco, //'29',
      policyCompany: '00',
      forceRulesForRatingIndicator: true,
      transactionType: page === 'rate' ? 'preUnderWritter' : 'postUnderWritter',
      forceRating: true,
      term: '6',
      policyCoveragesDetails,
      policyPackage,
      personalAuto: personalAutoData,
      policyDiscountIndicators
    };
    this.autoQuoteData = {
      autoQuote: autoQuoteData
    };

    return this.autoQuoteData;
  }

  mapRateQuoteRequestData(operation: string, page: string): AutoQuoteData {
    const autoQuoteData = {
      quoteNumber: this.quoteNumber,//'Q0217316160028',
      rateBook: this.storeRateBook,
      state: this.state,
      masterCompany: this.mco, //'29',
      policyCompany: '00',
      forceRulesForRatingIndicator: true,
      transactionType: page === 'rate' ? 'preUnderWritter' : (page === 'onload-rerate') ? 'selectedPreUnderWritter' : 'postUnderWritter',
      forceRating: true,
    };
    this.autoQuoteData = {
      autoQuote: autoQuoteData
    };

    if (operation === 'Update') //TO:DO RECALCULATE button request structure needs to be set here.
    {
      //Policy level coverages and custom attribute need to be set here
    }
    return this.autoQuoteData;
  }

  mapPayPlanDetailsData(selectedPayPlan: any, premiumAmount: string, applicationForm: any, policyTerm: string, dbappData: any): AutoQuoteData {
    const vehicleData: Vehicle[] = [];
    const payPlanDetails: PayPlanDetails[] = [];
    const premiumDetails: PremiumDetails[] = [];
    const customAttributes: CustomAttributes = {
      operation: 'Add'
    };
    if (selectedPayPlan !== undefined) {
      const savingsAmount: SavingsAmount = {
        theCurrencyAmount: '' + selectedPayPlan?.savingsAmount?.theCurrencyAmount
      }

      const installment: Installment = {
        firstDueDate: selectedPayPlan?.installment?.firstDueDate,
        // amount: selectedPayPlan?.installment?.amount,
        theCurrencyAmount: selectedPayPlan?.installment?.theCurrencyAmount,
        percent: selectedPayPlan?.installment?.percent,
        numberOfDaysFirstInstallmentDue: selectedPayPlan?.installment?.numberOfDaysFirstInstallmentDue,
        numberOfInstallments: selectedPayPlan?.installment?.numberOfInstallments
      }
      selectedPayPlan.defaultIndicator = true;
      const downPayment: DownPayment = {
        percent: '0',
        method: '',
        theCurrencyAmount: selectedPayPlan?.downPayment?.theCurrencyAmount
      }
      const payPlanDetail: PayPlanDetails = {
        savingsAmount: savingsAmount,
        downPayment: downPayment,
        payPlan: selectedPayPlan?.payPlan,
        installment: installment,
        customAttributes
      };
      payPlanDetails.push(payPlanDetail);

      const premiumDetail: PremiumDetails =
      {
        type: 'Total Premium',
        savingsAmount: {
          theCurrencyAmount: premiumAmount
        }
      }
      premiumDetails.push(premiumDetail);
    }

    const goPaperlessDiscount = applicationForm.get('goPaperlessDiscount')?.value === '1' ? true : false;


    const vehiclesList = applicationForm.get('vehicles')?.value;
    vehiclesList.forEach((vehicle: any) => {
      const garageAddress: GarageAddress = {
        addressLine: '',
        streetName: vehicle.address,
        streetType: '',
        apartmentNumber: '',
        houseNumber: '',
        postalOfficeBoxNumber: '',
        ruralRouteNumber: '',
        city: vehicle.city,
        state: vehicle.state,
        postalCode: vehicle.zipcode,
        outOfStateIndicator: false
      };

      const veh: Vehicle = {
        // sequenceNumber: `${index + 1}`,
        sequenceNumber: vehicle.id,
        driverId: '',
        vin: '',
        vinHitIndicator: false,
        vehicleType: '',
        bodyType: '',
        year: '',
        make: '',
        model: '',
        trimDescription: '',
        odometerReading: '',
        annualMileage: '',
        primaryUse: '',
        commuteToNJNYSurcharge: '',
        theCurrencyAmount: '0',
        garageAddress,
        discountIndicators: [],
        coverages: [],
        policyCoverages: [],
        symbols: [],
        customAttributes
      };
      vehicleData.push(veh);

    });

    const personalAutoData = {
      vehicles: vehicleData
    };

    const autoCoverages: AutoCoverages = {
      payplansDetails: payPlanDetails,
      premiumDetails: premiumDetails,
      packageType: 'Premium'
    }
    const policyPackage: PolicyPackage[] = [{
      autoCoverages: autoCoverages,
      policyFees: [],
      serviceFees: []
    }];
    const isEftPayplanOnly: boolean = selectedPayPlan?.electronicFundTransfer?.requiredIndicator;
    const eftInstallInd = isEftPayplanOnly === true && applicationForm.get('eft')?.value === 'N' ? 'Y' : applicationForm.get('eft')?.value;
    const downPayInd = isEftPayplanOnly === true && applicationForm.get('eft')?.value === 'N' ? 'Y' : applicationForm.get('downPayment')?.value;
    const multPolicyIND = dbappData?.policyDiscountIndicators?.multiPolicy;


    const policyDiscountIndicators: PolicyDiscountIndicators = {
      downPaymentMethod: downPayInd,
      eftFutureInstallments: eftInstallInd,
      goPaperlessIndicator: goPaperlessDiscount,
      customAttributes,
      multiPolicy: multPolicyIND
    }
    const autoQuoteData = {
      quoteNumber: this.quoteNumber,
      rateBook: this.storeRateBook,
      state: this.state,
      masterCompany: this.mco,
      policyCompany: '00',
      term: policyTerm,
      forceRulesForRatingIndicator: true,
      transactionType: 'postUnderWritter',
      forceRating: true,
      policyPackage,
      personalAuto: personalAutoData,
      policyDiscountIndicators
    };

    this.autoQuoteData = {
      autoQuote: autoQuoteData
    };



    return this.autoQuoteData;
  }
  mapApplicationData(applicationFormData: any, selectedPayPlan: any, totalPremium: string, dbApplicantData: any, agentList: any, vehiclesList: any): AutoQuoteData {
    const driversData: Driver[] = [];
    const vehicleData: Vehicle[] = [];
    let phonesData: Phone[] = [];
    const garageZipcodeFormat = new zipcodePipe();
    const referencePolicyData: ReferencePolicy[] = [];
    const driversList = dbApplicantData?.personalAuto?.drivers;
    const phoneNo = applicationFormData.get('phone').value;
    const goPaperlessDiscount = applicationFormData.get('goPaperlessDiscount')?.value;
    const multiPolicyInd = dbApplicantData?.policyDiscountIndicators?.multiPolicy;
    const customAttributesData: CustomAttributes = {
      operation: 'Add'
    };
    const personData: Person = {
      emailAddress: applicationFormData.get('email')?.value == null ? '' : applicationFormData.get('email')?.value?.toUpperCase(),
    };
    const isEftPayplanOnly: boolean = selectedPayPlan?.electronicFundTransfer?.requiredIndicator;
    const eftInstallInd = isEftPayplanOnly === true && applicationFormData.get('eft')?.value === 'N' ? 'Y' : applicationFormData.get('eft')?.value;
    const downPayInd = isEftPayplanOnly === true && applicationFormData.get('eft')?.value === 'N' ? 'Y' : applicationFormData.get('downPayment')?.value;
    /*let myString = '(717)-a.c-8& 9';
    myString = myString.replace(/\D/g,'');
    // console.log(myString,'myString');*/
    // Phone Number and TextAlerts
    phonesData = [{
      type: 'Home',
      phoneNumber: (phoneNo == null || phoneNo.length == 1) ? '' : phoneNo.replace(/\D/g, ''),
      textAlertEnrollmentIndicator: false
    }];

    const mobileObj = ['mobilePhone1', 'mobilePhone2', 'mobilePhone3'];
    mobileObj.forEach((obj: any, index: number) => {
      const mobilePhone = applicationFormData.controls[obj].value;
      if (mobilePhone !== GlobalConstants.EMPTY_STRING) {
        const phonesDataObj: Phone = {
          type: 'text',
          phoneNumber: (mobilePhone == null || mobilePhone.length == 1) ? '' : mobilePhone.replace(/\D/g, ''),
          textAlertEnrollmentIndicator: true
        }
        phonesData.push(phonesDataObj);
      } else {
        phonesData.splice(index + 1, 1);
      }
    });

    // Agent/Producer name
    const agentSelected = applicationFormData.get('producerName')?.value.toUpperCase();
    const agentDetails = agentList?.filter((agent: { uniqueID: string }) => agent?.uniqueID === agentSelected);
    const agents: Agent[] = [{
      agentCode: '',
      firstName: agentDetails[0].firstName.toUpperCase().trim(),
      middleName: agentDetails[0].middleName.toUpperCase().trim(),
      lastName: agentDetails[0].lastName.toUpperCase().trim(),
      uniqueAgentNumber: agentDetails[0].uniqueID
    }];

    // Multi-policy/Refernce Policy
    const multipolicyDiscounts = applicationFormData.get('multipolicyDiscounts')?.value;
    let hasOtherPolicy: boolean = false;

    multipolicyDiscounts.forEach((obj: any, index: number) => {
      const referencePolicy: ReferencePolicy = {
        lineOfBusiness: obj.lineOfBusiness.toUpperCase(),
        policyNumber: obj.policyNumber,
        policyType: obj.policyType.toUpperCase(),
        verificationIndicator: obj.verificationIndicator // TO:DO US330315: Multi-policy discount
      }

      if (obj.lineOfBusiness.toUpperCase() === 'OTHER') {
        hasOtherPolicy = true;
      }
      referencePolicyData.push(referencePolicy);
    });


    //Policy Discount Indicator
    const policyDiscountIndicators: PolicyDiscountIndicators = {
      downPaymentMethod: downPayInd,
      eftFutureInstallments: eftInstallInd,
      goPaperlessIndicator: (goPaperlessDiscount == '0') ? false : true,
      multiPolicy: multiPolicyInd,
      customAttributes: customAttributesData
    };

    // Additional Named Insured / Foreign Drivers License
    const fdlList = applicationFormData.get('fdl')?.value;
    const additionNamedInsuredSelected = applicationFormData.get('additionalNamedInsured')?.value;

    //check if Additional Named Insured is already listed in FDL(Foreign Drivers License)

    const NamedInsuredCheck = fdlList?.filter((driver: any) => driver?.driverId === additionNamedInsuredSelected)
    /*.map(function (obj: any) {
     obj['addionalNamedInsuredSelectedIndicator'] = true;
      return obj;
     });*/
    if (NamedInsuredCheck && NamedInsuredCheck.length >= 1) {
      NamedInsuredCheck[0].addionalNamedInsuredSelectedIndicator = true;
    }

    if (NamedInsuredCheck.length === 0) {
      const additionNamedInsured = driversList?.filter((driver: { sequenceNumber: string }) => driver?.sequenceNumber === additionNamedInsuredSelected);
      if (additionNamedInsured.length > 0) {
        additionNamedInsured[0]['addionalNamedInsuredSelectedIndicator'] = true;

        const customAttributesData: CustomAttributes = {
          operation: 'Add'
        };
        additionNamedInsured[0].customAttributes = customAttributesData;
        driversData.push(additionNamedInsured[0]);
      } else if (additionNamedInsuredSelected === 'None') {
        driversList?.forEach((driver: any, index: number) => {
          driver['addionalNamedInsuredSelectedIndicator'] = false;
          const customAttributesData: CustomAttributes = {
            operation: 'Add'
          };
          driver['customAttributes'] = customAttributesData;
          driversData.push(driver);
        });
      }
    }



    fdlList.forEach((item: any, index: number) => {
      const fdlDetails = driversList?.filter((driver: { sequenceNumber: string }) => driver?.sequenceNumber === item.driverId);
      const licenseData: License = {
        licenseType: fdlDetails[0].licenseType,
        licenseNumber: fdlDetails[0].licenseNumber,
        licenseState: fdlDetails[0].licenseState?.toUpperCase(),
        issuingCountry: item.countryIssuingLicense?.toUpperCase()
      };
      let checkSR22Box = GlobalConstants.SR22_CHECKBOX_STATE.includes(this.state) ? true : false;
      if (checkSR22Box) {
        item.filing === true ? item.filingType = 'C' : item.filingType = 'N';
      }
      const discountIndicators: DiscountIndicators = {
        //sr22FilingIndicator: false,
        stateFiling: {
          indicators: [{
            name: item.filingType === 'N' ? "No" : item.filingType === 'C' ? "SR22" : item.filingType === 'H' ? "FR44" : "",
            value: item.filingType
          }], caseNumber: ''
        },
        distantStudentIndicator: false
      };

      const driverCategoryReason: driverCategoryReason[] = []
      const driverCategoryReasonData = {
        name: "",
        value: "",
      };
      driverCategoryReason.push(driverCategoryReasonData);

      const driver: Driver = {
        //sequenceNumber: `${index + 1}`,
        sequenceNumber: item.driverId,
        driverType: '',
        source: '',
        primaryInsuredIndicator: false,
        firstName: fdlDetails[0].firstName.toUpperCase().trim(),
        middleName: fdlDetails[0].middleName == null ? '' : fdlDetails[0].middleName.toUpperCase().trim(),
        lastName: fdlDetails[0].lastName.toUpperCase().trim(),
        suffix: '',
        birthDate: '',
        gender: '',
        maritalStatus: '',
        education: '',
        driverCategoryReasons: driverCategoryReason,
        occupationCode: '',
        subOccupationCode: '',
        relationshipToInsured: '',
        discountIndicators,
        license: licenseData,
        addionalNamedInsuredSelectedIndicator: item.driverId === NamedInsuredCheck[0]?.driverId ? true : false,
        violationsCount: 0
      };
      const customAttributesData: CustomAttributes = {
        operation: 'Add'
      };
      driver.customAttributes = customAttributesData;
      driversData.push(driver);
    });
    // Vehicles Garaging Address & LineHolder Info
    const lossPayeeAddIntList = vehiclesList;
    const vehiclesFormData = applicationFormData.get('vehicles')?.value
    lossPayeeAddIntList.forEach((item: any, index: number) => {
      const garageAddress: GarageAddress = {
        addressLine: '',
        streetName: (vehiclesFormData[index].address !== null ? vehiclesFormData[index].address.trim().toUpperCase() : ''),
        streetType: '',
        apartmentNumber: '',
        houseNumber: '',
        postalOfficeBoxNumber: '',
        ruralRouteNumber: '',
        city: vehiclesFormData[index].city.toUpperCase(),
        state: vehiclesFormData[index].state.toUpperCase(),
        postalCode: vehiclesFormData[index].zipcode == null ? null : garageZipcodeFormat.transform(vehiclesFormData[index].zipcode),
        outOfStateIndicator: false
      };


      const additionalIntersetData: AddionalInterest[] = [];

      // When Vehicles do not have COMP and COL then remove the LP/AI if exists - DE76755
      const compVal = item.coverages?.find((x: { code: string; }) => (x.code === 'OTC' || x.code === 'OTC0GD'))?.deductible || GlobalConstants.NONE;

      const collVal = item.coverages?.find((x: { code: string; }) => x.code === 'COL')?.deductible || GlobalConstants.NONE;

      const hasCompNColl = compVal !== GlobalConstants.NONE && collVal !== GlobalConstants.NONE;

      if (hasCompNColl) {
        item.addionalInterests.forEach((lienholdersObj: any, zIndex: number) => {
          const addresses: Address[] = [{
            addressType: '',
            streetName: lienholdersObj.addresses[0].streetName.toUpperCase(),
            city: lienholdersObj.addresses[0].city.toUpperCase(),
            state: lienholdersObj.addresses[0].state.toUpperCase(),
            postalCode: lienholdersObj.addresses[0].postalCode,
            POBoxIndicator: false,
            movedWithinPastSixMonthIndicator: false
          }]

          let addionalInterest: AddionalInterest = {
            type: lienholdersObj.type.toUpperCase(),
            firstName: lienholdersObj.firstName.toUpperCase().trim(),
            lastName: lienholdersObj.lastName.toUpperCase().trim(),
            middleName: lienholdersObj.middleName.toUpperCase().trim(),
            institutionName: lienholdersObj.institutionName?.toUpperCase().trim(),
            addresses
          }
          additionalIntersetData.push(addionalInterest);
        });

      }
      const vehicle: Vehicle = {
        // sequenceNumber: `${index + 1}`,
        sequenceNumber: `${index + 1}`,
        driverId: '',
        vin: '',
        vinHitIndicator: false,
        vehicleType: '',
        bodyType: item.bodyType?.toUpperCase(),
        year: item.year,
        make: item.make?.toUpperCase(),
        model: item.model?.toUpperCase(),
        trimDescription: '',
        odometerReading: '0',
        annualMileage: '',
        primaryUse: '',
        commuteToNJNYSurcharge: '',
        theCurrencyAmount: '0',
        garageAddress,
        discountIndicators: [],
        coverages: [],
        policyCoverages: [],
        symbols: [],
        addionalInterests: additionalIntersetData
      };
      vehicle.customAttributes = customAttributesData;
      vehicleData.push(vehicle);
    });
    const customAttributes: CustomAttributes = {
      operation: 'Add'
    };

    const installment: Installment = {
      firstDueDate: selectedPayPlan?.installment?.firstDueDate,
      // amount: selectedPayPlan?.installment?.amount,
      theCurrencyAmount: selectedPayPlan?.installment?.theCurrencyAmount,
      percent: selectedPayPlan?.installment?.percent,
      numberOfDaysFirstInstallmentDue: selectedPayPlan?.installment?.numberOfDaysFirstInstallmentDue,
      numberOfInstallments: selectedPayPlan?.installment?.numberOfInstallments
    }

    const contactData: Contact = {
      person: personData,
      phones: phonesData,
      addresses: [],
      customAttributes
    };

    const savingsAmount: SavingsAmount = {
      theCurrencyAmount: '' + selectedPayPlan?.savingsAmount?.theCurrencyAmount
    }
    const downPayment: DownPayment = {
      percent: '0',
      method: '',
      theCurrencyAmount: selectedPayPlan?.downPayment?.theCurrencyAmount
    }

    const payPlanDetails: PayPlanDetails[] = [{
      savingsAmount: savingsAmount,
      downPayment: downPayment,
      payPlan: selectedPayPlan?.payPlan,
      installment: installment,
      customAttributes
    }];
    const premiumDetails: PremiumDetails[] = [
      {
        type: 'Total Premium',
        savingsAmount: {
          theCurrencyAmount: totalPremium
        }
      }
    ]
    const autoCoverages: AutoCoverages = {
      payplansDetails: payPlanDetails,
      premiumDetails: premiumDetails,
      packageType: ''
    }
    const policyPackage: PolicyPackage[] = [{
      autoCoverages: autoCoverages,
      policyFees: [],
      serviceFees: []
    }];
    const personalAutoData = {
      vehicles: vehicleData,
      drivers: driversData
    };
    const autoQuoteData = {
      quoteNumber: this.quoteNumber,
      rateBook: this.storeRateBook,
      state: this.state,
      contact: contactData,
      term: dbApplicantData.term,
      policyPackage,
      referencePolicies: referencePolicyData,
      personalAuto: personalAutoData,
      policyDiscountIndicators,
      agents,
      transactionType: "postUnderWritter",
    };
    this.autoQuoteData = {
      autoQuote: autoQuoteData
    };

    return this.autoQuoteData;
  }

  mapOrderMVRRequestData(violationData: any, violationsFormData: any, orderMVRStatusList: any, orderMVRStatus: string, priorInsuranceVal: any, priorCarrierDBData: string): AutoQuoteData {

    let reportSource = '';
    const driversData: Driver[] = [];
    let orderMVR = '';
    let addRoutingRuleStatus = false;
    const customAttributesData: CustomAttributes = {
      operation: 'Add'
    };
    violationData.forEach((driverData: any, driverIndex: number) => {
      if (driverData.dob !== GlobalConstants.EMPTY_STRING && driverData.licenseNumber !== GlobalConstants.EMPTY_STRING) {

        const licenseData: License = {
          licenseType: driverData?.licenseType || '',
          licenseNumber: violationsFormData[driverIndex].licenseNumber.toUpperCase(),
          licenseState: violationsFormData[driverIndex].licensestate.toUpperCase()
        };
        orderMVR = orderMVRStatusList[driverIndex] ? 'NO' : driverData?.orderMVR;
        let checkSR22Box = GlobalConstants.SR22_CHECKBOX_STATE.includes(this.state) ? true : false;
        if (checkSR22Box) {
          violationsFormData[driverIndex].filing === true ? violationsFormData[driverIndex].filingType = 'C' : violationsFormData[driverIndex].filingType = 'N';
        }
        const discountIndicatorsData: DiscountIndicators = {
          //sr22FilingIndicator: false,
          stateFiling: {
            indicators: [{
              name: violationsFormData[driverIndex].filingType === 'N' ? "No" : violationsFormData[driverIndex].filingType === 'C' ? "SR22" : violationsFormData[driverIndex].filingType === 'H' ? "FR44" : "",
              value: violationsFormData[driverIndex].filingType
            }]
            , caseNumber: driverData?.caseNumber || ''
          },
          distantStudentIndicator: false
        };

        const violationsData: Violation[] = [];

        if (driverData.violations != null && driverData.violations !== '') {
          const addedDeletedViolationList = driverData?.violations?.filter((dataObj: any) => dataObj?.operation === 'Add' || dataObj?.operation === 'delete');
          // console.log(addedDeletedViolationList);
          if (!addRoutingRuleStatus && addedDeletedViolationList !== undefined && addedDeletedViolationList?.length > 0) {
            addRoutingRuleStatus = true;
            this.navigationService.addRequiredRoutes(this.navigationService.actionBasedRoutes('ReportsUpdate'));
          }
          driverData.violations.forEach((violationData: any, violationIndex: number) => {
            if (violationData?.violationCode && violationData?.violationCode !== GlobalConstants.EMPTY_STRING) {
              const customAttributesData: CustomAttributes = {
                operation: violationData.operation
              };
              if (violationData.reportingSource === 'Self Reported') {
                reportSource = 'SR';
              } else if (violationData.reportingSource === 'MVR') {
                reportSource = 'MVR';
              } else {
                reportSource = 'CLUE';
              }
              // console.log(violationData, "====violationData");
              const claimsPayouts: ClaimsPayouts = {
                name: "",
                status: violationData?.claimsPayouts == undefined ? "" : violationData?.claimsPayouts[0].status == null ? "" : violationData?.claimsPayouts[0].status,
                code: violationData?.claimsPayouts == undefined ? "" : violationData?.claimsPayouts[0].code == null ? "" : violationData?.claimsPayouts[0].code,
                amount: violationData?.claimsPayouts == undefined ? "0" : violationData?.claimsPayouts[0].amount == null ? "0" : (violationData?.claimsPayouts[0].amount).toString(),
              };

              let claimsPayoutsArr = [];
              claimsPayoutsArr.push(claimsPayouts)
              const violation: Violation = {
                sequenceNumber: `${violationData.sequenceNumber}`,
                violationCode: violationData.violationCode.toUpperCase(),
                violationName: violationData.violationName.toUpperCase(),
                violationDate: violationData.violationDate,
                displayingDisputeIndicator: violationsFormData[driverIndex].listOfViolations[violationIndex].dispute,
                disputeExplanation: violationsFormData[driverIndex].listOfViolations[violationIndex].explanation.toUpperCase(),
                disputeLevel: violationData.disputeLevel,
                reportingSource: reportSource.toUpperCase(),
                withinChargeablePeriodIndicator: false,
                editableIndicator: violationData.reportingSource === 'Self Reported',
                removableIndicator: violationData.reportingSource === 'Self Reported',
                convictionDate: violationData?.convictionDate ? violationData?.convictionDate : GlobalConstants.EMPTY_STRING,
                claimsPayouts: claimsPayoutsArr
                // clmViolationAmt: violationData?.clmViolationAmt,
                // clmViolationType: violationData?.clmViolationType,
                // clmViolationStatus: violationData?.clmViolationStatus
              };
              if (!addRoutingRuleStatus && violation.displayingDisputeIndicator != violationData.displayingDisputeIndicator) {
                addRoutingRuleStatus = true;
                this.navigationService.addRequiredRoutes(this.navigationService.actionBasedRoutes('ReportsUpdate'))
              }
              // comparing violationData and Violation DBData

              if (customAttributesData.operation !== ('delete' || 'Add')) {
                if (!ObjectUtils.isObjectEmpty(violation)) {
                  customAttributesData.operation = 'Add';
                }
              }
              violation.customAttributes = customAttributesData;
              violationsData.push(violation);
            }
          });

          const driverCategoryReason: driverCategoryReason[] = []
          const driverCategoryReasonData = {
            name: "",
            value: "",
          };
          driverCategoryReason.push(driverCategoryReasonData);

          const driver: Driver = {
            sequenceNumber: `${driverIndex + 1}`,
            driverType: driverData?.rated || '',
            source: driverData?.status || '',
            primaryInsuredIndicator: driverIndex === 0,
            firstName: driverData.firstName.trim(),
            middleName: driverData.middleName,
            lastName: driverData.lastName.trim(),
            suffix: driverData?.suffix || '',
            birthDate: driverData.birthDate ? JSON.stringify(driverData.birthDate).replace(/"/g, '').slice(0, 10) : '',
            gender: driverData?.gender || '',
            driverCategoryReasons: driverCategoryReason,
            maritalStatus: driverData?.maritalStatus || '',
            education: driverData?.education || '',
            occupationCode: driverData?.occupation || '',
            subOccupationCode: driverData?.suboccupation || '',
            relationshipToInsured: driverData?.relationship || '',
            discountIndicators: discountIndicatorsData,
            license: licenseData,
            violations: violationsData, //orderMVRStatus === 'reorder' ? [] : violationsData, :TODO:Uncomment if there is restriction on sending violationsdata
            orderMVR: orderMVR,
            customAttributes: customAttributesData,
            violationsCount: 0
          };
          driversData.push(driver);

        }
      }
    });
    if (priorCarrierDBData !== priorInsuranceVal) {
      this.navigationService.addRequiredRoutes(this.navigationService.actionBasedRoutes('ReportsUpdate'));
    }
    const personalAutoData = {
      drivers: driversData
    };
    const underWritingReportsModifiedAttributes: UnderWritingReportsModifiedAttributes[] = [{
      code: 'priorInsuranceVendorAsSourceIndicator',
      value: priorInsuranceVal
    }];

    const autoQuoteData = {
      quoteNumber: this.quoteNumber,
      rateBook: this.storeRateBook,
      state: this.state,
      orderMVRStatus: orderMVRStatus === 'reorder' ? 'reorder' : GlobalConstants.EMPTY_STRING,
      personalAuto: personalAutoData,
      priorCarrierInfo: [],
      underWritingReportsModifiedAttributes
    };

    this.autoQuoteData = {
      autoQuote: autoQuoteData
    };


    return this.autoQuoteData;

  }

  mapReviewData(paymentData: any): AutoQuoteData {

    const customAttributes: CustomAttributes = {
      operation: 'Add'
    };

    let paymentMethods = [];
    if (!ObjectUtils.isObjectEmpty(paymentData.downpaySetup)) {
      const downPaymentMethod: PaymentMethod = {
        mode: 'DOWNPAY',
        method: paymentData.downpaySetup.Type,
        paymentMethodOnFile: paymentData.downPay,
        sameAsOtherPaymentModeIndicator: paymentData.samePayCheck
      }

      paymentMethods.push(downPaymentMethod);
    }

    if (!ObjectUtils.isObjectEmpty(paymentData.installmentSetup)) {
      const installmentPaymentMethod: PaymentMethod = {
        mode: 'INSTALLMENT',
        method: paymentData.installmentSetup.Type,
        paymentMethodOnFile: paymentData.installPay,
        sameAsOtherPaymentModeIndicator: paymentData.samePayCheck
      }

      paymentMethods.push(installmentPaymentMethod);

    }

    const paymentInformation: PaymentInformation = {
      paymentMethods
    }

    const personalAuto: PersonalAuto = {
      paymentInformation
    }

    const autoQuoteData = {
      quoteNumber: this.quoteNumber,
      rateBook: this.storeRateBook,
      state: this.state,
      masterCompany: this.mco,
      policyCompany: '00',
      personalAuto

    };



    this.autoQuoteData = {
      autoQuote: autoQuoteData
    };


    return this.autoQuoteData;
  }
}


