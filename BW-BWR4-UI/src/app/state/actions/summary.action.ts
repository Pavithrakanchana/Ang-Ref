import { createAction, props } from '@ngrx/store';
import { PayPlanDetails, PolicyFees } from 'src/app/shared/model/autoquote/autoquote.model';
import { RoutingRules } from 'src/app/shared/model/routing-rules.model';
import { ValidValues } from 'src/app/shared/model/validvalues/validvaluesres.model';
import QuoteSummary, { ApplicantAddress, BindData, DriverSummary, GlobalVariables, HelpText, Indicators, StateWiseFields, OrderCLUEReport, PageStatus, PNIDetails, VehicleSummary, DynamicValidValues } from '../model/summary.model';

export const addQuoteNumber = createAction(
    '[Quote Summary] Add QuoteNumber',
    props<{ quoteNumber: string }>()
);

export const addPolicyNumber = createAction(
    '[Quote Summary] Add PolicyNumber',
    props<{ policyNumber: string }>()
);

export const addDriver = createAction(
    '[Quote Summary] Add Driver',
    props<{ driver: DriverSummary }>()
);

export const removeDriver = createAction(
    '[Quote Summary] Remove Driver',
    props<{ driverName: string }>()
);

export const clearDrivers = createAction(
    '[Quote Summary] clear Drivers'
);

export const addVehicle = createAction(
    '[Quote Summary] Add Vehicle',
    props<{ vehicle: VehicleSummary }>()
);

export const clearVehicles = createAction(
    '[Quote Summary] clear Vehicles'
);

export const getQuoteSummary = createAction(
    '[Quote Summary] Get QuoteSummary'
);
export const addPageStatus = createAction(
    '[Quote Summary] Add Page Status',
    props<{ pageStatus: PageStatus }>()
);


export const applicantAddress = createAction(
    '[Quote Summary] Get Applicant Address',
    props<{ applicantAddress: ApplicantAddress }>()
);

export const pNIDetails = createAction(
    '[Quote Summary] Get PNI Details',
    props<{ pNIDetails: PNIDetails }>()
);

export const indicators = createAction(
    '[Quote Summary] Get Indicators',
    props<{ indicators: Indicators }>()
);

export const stateWiseFields = createAction(
    '[Quote Summary] Get stateWiseFields',
    props<{ stateWiseFields: StateWiseFields }>()
);

export const orderCLUEReport = createAction(
    '[Quote Summary] Get Mailing State Status',
    props<{ orderCLUEReport: boolean }>()
);

export const policyEffectiveDate = createAction(
    '[Quote Summary] Get Policy Effective Date',
    props<{ policyEffectiveDate: string }>()
);

export const mailingStateStatus = createAction(
    '[Quote Summary] Get Order Clue Report',
    props<{ mailingStateStatus: boolean }>()
);

export const setQID = createAction(
    '[Global] Set QID',
    props<{ qid: string }>()
);
export const setTerm = createAction(
    '[Global] Set Term',
    props<{ term: string }>()
);
export const callIDStatus = createAction(
    '[Global] Set CallID status',
    props<{ callIDStatus: boolean }>()
);
export const prodSweepStatus = createAction(
    '[Global] Set Producer Sweep status',
    props<{ prodSweepStatus: boolean }>()
);
export const setPolicyState = createAction(
    '[Global] Set State',
    props<{ policyState: string }>()
);

export const setNonOwner = createAction(
    '[Global] Set nonOwner',
    props<{ nonOwner: boolean }>()
);

export const setRideShare = createAction(
    '[Global] Set rideShare',
    props<{ rideShare: boolean }>()
);

export const setEsign = createAction(
    '[Global] Set esign',
    props<{ esign: boolean }>()
);

export const setPNIEmail = createAction(
    '[Global] Set PNIEmail',
    props<{ PNIEmail: string }>()
);

export const setMCO = createAction(
    '[Global] Set MCO',
    props<{ mco: string }>()
);

export const setChannel = createAction(
    '[Global] Set Channel',
    props<{ channel: string }>()
);

export const setProducerCode = createAction(
    '[Global] Set Producer Code',
    props<{ producerCode: string }>()
);
export const setProducerUserId = createAction(
    '[Global] Set Producer User id',
    props<{ producerUserId: string }>()
);
export const setUserName = createAction(
    '[Global] Set Producer User Name',
    props<{ userName: string }>()
);
export const setProducerUserFirstName = createAction(
    '[Global] Set Producer User First Name',
    props<{ producerUserFirstName: string }>()
);
export const setProducerUserLastName = createAction(
    '[Global] Set Producer User Last Name',
    props<{ producerUserLastName: string }>()
);
export const setRateBook = createAction(
    '[Global] Set Producer Code',
    props<{ rateBook: string }>()
);

export const setSSOToken = createAction(
    '[Global] Set SSO Token',
    props<{ ssoToken: string }>()
);

export const sessionToken = createAction(
    '[Global] Set SSO Ticket',
    props<{ sessionToken: string }>()
);

export const setNewQuoteFlag = createAction(
    '[Global] Set New Quote Flag',
    props<{ newQuote: string }>()
);

export const setQuoteSrc = createAction(
    '[Global] Set Quote Source Flag',
    props<{ quoteSrc: string }>()
);
export const setBridgingStatus = createAction(
    '[Global] Set Bridging Status Flag',
    props<{ bridgeStatus: boolean }>()
);

export const setApplicantSavedFlag = createAction(
    '[Global] Set Applicant Page Saved Flag',
    props<{ applicantSaved: string }>()
);

export const setHelpText = createAction(
    '[Quote Summary] Set Help Text',
    props<{ helpText: HelpText }>()
);

export const addEligibleDiscounts = createAction(
    '[Quote Summary] Eligible Discounts',
    props<{ eligibleDiscounts: ValidValues[] }>()
);

export const bridgeEdits = createAction(
    '[Quote Summary] Bridge Edits',
    props<{ bridgeEdits: string[] }>()
);

export const test = createAction(
    '[Global] Set Test',
    props<{ global: GlobalVariables }>()
);

export const bindData = createAction(
    '[Quote Summary] Get Bind Data',
    props<{ bindData: BindData }>()
);

export const payPlan = createAction(
    '[Quote Summary] Get Payplan Data',
    props<{ payPlan: PayPlanDetails }>()
);

export const policyFees = createAction(
    '[Global] Set Policy Fees',
    props<{ policyFees: PolicyFees[] }>()
);

export const dynamicValidValues = createAction(
    '[Global] Dynamic Valid Values',
    props<{ dynamicValidValues: ValidValues[] }>()
);
export const dynamicDriverValues = createAction(
    '[Global] Dynamic Valid Values',
    props<{ dynamicDriverValues: ValidValues[] }>()
);
export const dynamicPolicyInfoValues = createAction(
    '[Global] Dynamic Valid Values',
    props<{ dynamicPolicyInfoValues: ValidValues[] }>()
);
export const routingRules = createAction(
    '[Global] Set Routing Fees',
    props<{ routingRules: RoutingRules }>()
);

export const lastVistedPage = createAction(
    '[Global] Set Last Visited Page',
    props<{ lastVistedPage: number }>()
);

export const stepperRestriction = createAction(
    '[Global] Set Restriction On Stepper',
    props<{ stepperRestriction: boolean }>()
);

export const priorCarrierInsIndicator = createAction(
    '[Global] Set Indicator On Change of Source',
    props<{ priorCarrierInsIndicator: string }>()
);

export const umpdStoredValue = createAction(
    '[Global] Set umpd On Change of Source',
    props<{ umpdStoredValue: string }>()
);

export const umbiStoredValue = createAction(
    '[Global] Set umbi On Change of Source',
    props<{ umbiStoredValue: string }>()
);

export const addClueReport = createAction(
    '[Quote Summary] Get violations',
    props<{ clueReport: Object }>()
);

export const setQuoteResponseChannel = createAction(
    '[Global] Set quoteResponseChannel',
    props<{ quoteResponseChannel: string }>()
);
export const setFilingTypeFR44 = createAction(
    '[Global] Set Filing Type FR44',
    props<{ filingTypeFR44: boolean }>()
);
export const setFilingTypeSR22 = createAction(
    '[Global] Set Filing Type SR22',
    props<{ filingTypeSR22: boolean }>()
);
export const setDUIViolationInd = createAction(
    '[Global] Set DUI Violation',
    props<{ duiViolationInd: boolean }>()
);
export const setNotRequiredBylawDisplay = createAction(
    '[Global] Set Not Required By law Available or not ',
    props<{ isNotRequiredBylawDisplay: boolean }>()
);
export const setIsRequiredConvictionDate = createAction(
    '[Global] Set conviction date Required or not ',
    props<{ isRequiredConvictionDate: boolean }>()
);
