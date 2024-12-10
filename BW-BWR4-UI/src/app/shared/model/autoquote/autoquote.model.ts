
export interface Person {
    firstName?: string;
    lastName?: string;
    middleName?: string;
    suffix?: string;
    gender?: string;
    maritalStatus?: string;
    dateOfBirth?: string;
    socialSecurityNumber?: string;
    emailAddress?: string;
    nonOwnerPolicyIndicator?: boolean;
    householdMembers?: String;
}

export interface Phone {
    type: string;
    phoneNumber: string;
    textAlertEnrollmentIndicator?: boolean;
}

export interface Address {
    id?: string;
    addressType: string;
    addressLine?: string;
    streetName: string;
    city: string;
    state: string;
    postalCode: string;
    postalOfficeBoxNumber?: string;
    POBoxIndicator: boolean;
    ruralRouteNumber?: string;
    apartmentNumber?: string;
    houseNumber?: string;
    streetType?: string;
    movedWithinPastSixMonthIndicator: boolean;
}



export interface Contact {
    person: Person;
    phones: Phone[];
    addresses: Address[];
    customAttributes?: CustomAttributes;
}

export interface DiscountIndicators {
    //sr22FilingIndicator: boolean;
    stateFiling: StateFiling;
    distantStudentIndicator: boolean;
    matureDriverIndicator?: boolean;
    disqualifyMatureDriverIndicator?: boolean;
}

export interface StateFiling {
    indicators: sr22fr44indicators[];
    caseNumber?: string;
}
export interface sr22fr44indicators {
    name: string;
    value: string;
}

export interface License {
    licenseNumber: string;
    licenseState: string;
    licenseType: string;
    issuingCountry?: string;
    isRecentLicenseHolder?: boolean;
}

export interface driverCategoryReason {
    name: string;
    value: string;
}



export interface Violation {
    sequenceNumber: string;
    violationName: string;
    violationCode: string;
    violationDate: string;
    displayingDisputeIndicator: boolean;
    disputeExplanation: string;
    disputeLevel: number;
    reportingSource: string;
    withinChargeablePeriodIndicator: boolean;
    editableIndicator: boolean;
    removableIndicator: boolean;
    convictionDate: string;
    customAttributes?: CustomAttributes;
    // clmViolationAmt: number;
    // clmViolationType: string;
    // clmViolationStatus: string;
    claimsPayouts: ClaimsPayouts[];
}

export interface ClaimsPayouts {
    status: string,
    amount: string,
    code: string,
    name: string
}



export interface Driver {
    sequenceNumber: string;
    driverType: string;
    source: string;
    linkedDriver?: string;
    primaryInsuredIndicator: boolean;
    addionalNamedInsuredSelectedIndicator?: boolean;
    firstName: string;
    middleName: string;
    lastName: string;
    suffix: string;
    birthDate: string;
    gender: string;
    driverCategoryReasons?: driverCategoryReason[];
    maritalStatus: string;
    education: string;
    occupationCode: string;
    subOccupationCode: string;
    relationshipToInsured: string;
    matureDrivercourseCompletionDate?: string;
    discountIndicators: DiscountIndicators;
    license: License;
    violations?: Violation[];
    violationsCount: any;
    disputes?: Disputes,
    customAttributes?: CustomAttributes;
    orderMVR?: string;
    mvrDateOfBirthChangeIndicator?: boolean;
    associatedVehicles?: AssociatedVehicles[];
}

export interface DriverReportStatus {
    firstName: boolean;
    lastName: boolean;
    birthDate: boolean;
    licenseNumber: boolean;
    licenseType: boolean;
    rated: boolean;
}

export interface Disputes {
    action: string;
    reason: string;
    level: string;
}
export interface GarageAddress {
    addressLine?: string;
    streetName: string;
    streetType?: string;
    apartmentNumber?: string;
    houseNumber?: string;
    postalOfficeBoxNumber?: string;
    ruralRouteNumber?: string;
    city: string;
    state: string;
    postalCode: string;
    outOfStateIndicator?: boolean;
}

export interface Symbol {
    name: string;
    value: string;
}

export interface DiscountIndicator {
    code: string;
    value: string;
}

export interface HistoryAttribute {
    code: string;
    value: string;
}

export interface AddionalInterest {
    type: string;
    firstName: string;
    lastName: string;
    middleName: string;
    institutionName: string;
    addresses: Address[];
}
export interface Vehicle {
    sequenceNumber: string;
    driverId: string;
    vin: string;
    vinHitIndicator: boolean;
    vehicleType: string;
    bodyType: string;
    year: string;
    make: string;
    model: string;
    trimDescription: string;
    odometerReading: string;
    annualMileage: string;
    primaryUse: string;
    commuteToNJNYSurcharge: string;
    theCurrencyAmount: string;
    // leaseOrLoanIndicator: boolean;
    // roadSideAssistanceIndicator: boolean;
    discountIndicators: DiscountIndicator[];
    vehicleHistoryAttributes?: HistoryAttribute[];
    symbols: Symbol[];
    garageAddress: GarageAddress;
    coverages: Coverage[];
    policyCoverages: Coverage[];
    addionalInterests?: AddionalInterest[];
    customAttributes?: CustomAttributes;

}

    export interface AssociatedVehicles{
        key:string
        value:string
    }
export interface PersonalAuto {
    drivers?: Driver[];
    vehicles?: Vehicle[];
    paymentInformation?: PaymentInformation;
}

export interface PaymentInformation {
    paymentMethods: PaymentMethod[];
}

export interface PaymentMethod {
    mode: string;
    method: string;
    paymentMethodOnFile: string;
    sameAsOtherPaymentModeIndicator: boolean;
}

export interface Coverage {
    // code: string;
    // value: string;
    code: string;
    deductible?: string;
    limits?: string;
    symbols?: string;
    type?: string;
}

export interface PolicyCoverages {
    coverages: Coverage[];
    customAttributes?: CustomAttributes;
}

export interface PolicyCoveragePerVehicleId {
    vehicleId: string;
    coverage: Coverage;
}

export interface PolicyCoveragesDetails {
    coverages: Coverage[]; //PolicyCoveragePerVehicleId[];
    customAttributes?: CustomAttributes;
}

export interface CarrierMessage {
    value: string;
}
export interface PriorCarrierInfo {
    priorInsuranceIndicator?: string;
    priorCarrierName: string;
    //priorPolicyNumber: string;
    policyExpirationDate?: string;
    priorLimits: string;
    source?: string;
    validatorMessages?: CarrierMessage[];
    customAttributes?: CustomAttributes;
    reportOrigin?: string;
    lapseInCoverages?: string;
    continuousInsuranceIndicator?: boolean;
    continuousInsuranceVerificationIndicator?: boolean;
    lapseInCoveragesVerificationIndicator?: boolean;
    priorCarrierVerificationIndicator?: boolean;
    priorLimitsVerificationIndicator?: boolean;
    priorPolicyNumberVerificationIndicator?: boolean;
}

export interface CustomAttributes {
    operation: string;
}
export interface Agent {
    agentCode?: string,
    firstName?: string;
    middleName?: string;
    lastName?: string;
    uniqueAgentNumber?: string;
    directAgentIndicator?: boolean;
    authorizedForExtendedTermIndicator?: boolean;
    eligibleForProducerSweepIndicator?: boolean;
    rateBook?: string;
    userId?: string;
}
export interface PolicyDiscountIndicators {
    primaryResidence?: string;
    goPaperlessIndicator?: boolean;
    esignatureIndicator?: boolean;
    multiPolicy?: string;
    downPaymentMethod?: string;
    eftFutureInstallments?: string;
    customAttributes?: CustomAttributes;
}
export interface SavingsAmount {
    theCurrencyAmount: string;
}
export interface ServiceCharge {
    theCurrencyAmount: string;
}
export interface Installment {
    percent?: string;
    theCurrencyAmount: string;
    firstDueDate?: string;
    numberOfDaysFirstInstallmentDue?: number;
    numberOfInstallments: number;
    token?: string;
    amount?: string;
}
export interface ElectronicFundTransfer {
    requiredIndicator: boolean;
    method: string;
}

export interface DownPayment {
    percent: string;
    method: string;
    theCurrencyAmount: string;
    token?: string;
}

export interface PayPlanDetails {
    savingsAmount?: SavingsAmount;
    serviceCharge?: ServiceCharge;
    installment?: Installment;
    electronicFundTransfer?: ElectronicFundTransfer;
    downPayment?: DownPayment;
    payPlan?: string;
    numberOfInstallments?: string;
    numberOfDaysFirstInstallmentDue?: string;
    defaultIndicator?: boolean;
    sequenceNumber?: string;
    rank?: number;
    userSelectedIndicator?: boolean;
    customAttributes?: CustomAttributes;
}

export interface AutoCoverages {
    payplansDetails: PayPlanDetails[];
    premiumDetails: PremiumDetails[];
    packageType: string;
    errors?: Error[];
    userSelectedPayplan?: string;
}

export interface Error {
    code: string;
    description: string;
    source: string;
}

export interface Discount {
    code: string;
    description: string;
}
export interface PremiumDetails {
    type: string;
    savingsAmount: SavingsAmount;
}
export interface PolicyFees {
    code: string;
    theCurrencyAmount: string;
    type: string;
}
export interface PolicyPackage {
    autoCoverages: AutoCoverages;
    policyFees: PolicyFees[];
    serviceFees: PolicyFees[];
    underwritingFees?: PolicyFees[];
}

export interface ReferencePolicy {
    lineOfBusiness: string;
    policyNumber: string;
    policyType: string;
    verificationIndicator?: string; // TO:DO US330315: Multi-policy discount
}
export interface Exceptions {
    type: string;
    text: string;
}
export interface UnderWritingReports {
    reportName: string;
    status: string;
    verificationIndicator: string;
    exceptions: Exceptions[];
    dateOfBirthChangeIndicator: string;
}

export interface UnderWritingReportsModifiedAttributes {
    code: string;
    value: string;
}
export interface PreQualQuestionSets {
    code?: string;
    answers?: Answer;
}
export interface Answer {
    consentQuestion?: string;
}
export interface AutoQuote {
    quoteNumber: string;
    policyNumber?: string;
    effectiveDate?: string;
    quoteInitiationDate?: string;
    quoteReference?: string;
    term?: string;
    rateBook?: string;
    accountNumber?: string;
    state?: string;
    policyCompany?: string;
    quoteSourceType?: string;
    quoteResponseChannel?: string;
    forceReportOrdering?: boolean;
    transactionType?: string;
    contact?: Contact;
    personalAuto?: PersonalAuto;
    // policyCoverages?: PolicyCoverages;
    priorCarrierInfo?: PriorCarrierInfo[];
    policyDiscountIndicators?: PolicyDiscountIndicators;
    appliedPolicyDiscounts?: Discount[];
    policyCoveragesDetails?: PolicyCoveragesDetails;
    forceRating?: boolean;
    forceRulesForRatingIndicator?: boolean;
    policyPackage?: PolicyPackage[];
    referencePolicies?: ReferencePolicy[];
    agents?: Agent[];
    underWritingReports?: UnderWritingReports[];
    orderMVR?: string;
    orderMVRStatus?: string;
    totalBridgedVehicles?: number | 0;
    underWritingReportsModifiedAttributes?: UnderWritingReportsModifiedAttributes[];
    preQualQuestionSets?: PreQualQuestionSets[];
    lastVisitedPageOrIndex?: string;
    producerType?: String;
}

export interface AutoQuoteData {
    autoQuote: AutoQuote;
}
