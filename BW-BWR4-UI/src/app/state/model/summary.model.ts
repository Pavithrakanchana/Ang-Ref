import { PayPlanDetails, PolicyFees } from "src/app/shared/model/autoquote/autoquote.model";
import { RoutingRules } from "src/app/shared/model/routing-rules.model";
import { ValidValues } from "src/app/shared/model/validvalues/validvaluesres.model";

export default interface QuoteSummary {
    quoteNumber: string;
    policyNumber: string;
    drivers: DriverSummary[];
    vehicles: VehicleSummary[];
    qid: string;
    policyState: string;
    nonOwner: boolean;
    rideShare?: boolean;
    esign:boolean;
    PNIEmail: string;
    mco: string;
    rateBook: string;
    channel: string;
    producerCode: string;
    sessionToken: string;
    newQuote: string;
    quoteSrc: string;
    bridgeStatus: boolean;
    applicantSaved: string;
    global: GlobalVariables;
    pageStatus: PageStatus[];
    helpText: HelpText[];
    orderCLUEReport: boolean;
    policyEffectiveDate: string;
    mailingStateStatus: boolean;
    applicantAddress: ApplicantAddress;
    pNIDetails: PNIDetails;
    indicators: Indicators;
    eligibleDiscounts: ValidValues[];
    term: string;
    callIDStatus:boolean;
    bridgeEdits: string[];
    bindData: BindData;
    policyFees: PolicyFees[];
    payPlan: PayPlanDetails;
    prodSweepStatus: boolean;
    producerUserId: string;
    producerUserFirstName: string;
    producerUserLastName: string;
    dynamicValidValues: ValidValues[];
    dynamicDriverValues: ValidValues[];
    dynamicPolicyInfoValues: ValidValues[];
    routingRules: RoutingRules;
    lastVistedPage: number;
    stepperRestriction: boolean;
    priorCarrierInsIndicator: string;
    umpdStoredValue?: string;
    umbiStoredValue?: string;
    clueReport: Object;
    quoteResponseChannel?: string;
    filingTypeFR44?: boolean,
    filingTypeSR22?: boolean,
    duiViolationInd?: boolean,
    userName: string;
    isNotRequiredBylawDisplay : boolean,
    isRequiredConvictionDate : boolean,
}

export interface BindData {
  bindPolicyNumber?: string;
  bindPco?: string;
  accountOwnerId?: string;
  uploadDate?: string;
  uploadTime?: string;
  amountPaid?: string;
  confirmationNum?: string;
  autoPayReference?: string;
  downPayMethod?: string;
  eftPayMethod?: string;
  downpayReferenceNumber?: string;
}
export interface ApplicantAddress {
    addressType: string,
    streetName: string,
    city: string,
    state: string,
    postalCode: string,
    POBoxIndicator: boolean,
    movedWithinPastSixMonthIndicator?: boolean
}

export interface PNIDetails {
    firstName: string;
    lastName: string;
    middleName: string;
    suffix: string;
    gender: string;
    maritalStatus: string;
    dateOfBirth: string;
    socialSecurityNumber: string;
    emailAddress: string;
    nonOwnerPolicyIndicator: boolean;
}
export interface Indicators {
    dobIndicator?: string;
    nameIndicator?: string;
}

export interface StateWiseFields {
    fieldConfig: FieldConfig[];
}

export interface FieldConfig {
    page: string;
    state: string;
    field: string[];
}

export interface DriverSummary {
    driverId: string;
    firstName: string;
    middleName: string;
    lastName: string;
    //matureDriverIndicator?: boolean;
}

export interface VehicleSummary {
    year: string;
    make: string;
    model: string;
    vin: string;
    use?: string;
    commuteToNJNYSurcharge: string;
    coverages: Coverage[];
    customAttributes?: CustomAttributes;
    sequenceNumber?: string;
    theCurrencyAmount?: string;
}

export interface CustomAttributes {
    operation: string;
}

export interface Coverage {
    // code: string;
    // value: string;
    code: string;
    deductible?: string;
    limits?: string;
    symbols?: string;
}

export interface GlobalVariables {
    test: string;
    // policyState: string;
    // mco: string;
    // channel: string;
    // producerCode: string;
    // securityTicket: string;
    // newQuote: string;
    // applicantSaved: string;
}

export interface PageStatus {
    name: 'APPLICANT' | 'DRIVERS' | 'VIOLATIONS' | 'VEHICLES' | 'COVERAGES' | 'POLICY INFO' | 'RATE' | 'REPORTS' | 'REVIEW' | 'APPLICATION' | 'CONFIRMATION',
    status: 0 | 1,
    active?: boolean;
}

export interface OrderCLUEReport {
    status: true | false
}

export interface MailingStateStatus {
    status: true | false
}

export interface HelpText {
    fieldID: string;
    producerText: string;
}

export interface DynamicValidValues {
    values: DynamicValues[];
}

export interface DynamicValues {
    key: string;
    displayvalue: string;
}
