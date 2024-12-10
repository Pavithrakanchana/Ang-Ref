export interface CustomAttributes {
    checkCreditRulesIndicator?: string;
    proprietoryCreditRuleCode?: string;
    extraScoreType?: string;
    reportProcessingOrderIndicator?: string;
    businessTransactionType?: string;
    changeInQuoteInformationIndicator?: string;
    storageLibrary?: string;
}

export interface Models {
    identifier?: string;
}

export interface EquifaxUSConsumerCreditReport {
    securityCode?: string;
    outputFormat?: string;
    ECOAInquiryType?: string;
    multipleFileIndicator?: string;
    permissiblePurposeCode?: string;
    numberOfMonthsToCountInquiries?: string;
    models?: Models[];
    customAttributes?: CustomAttributes[];
}

export interface DataSources {
    equifaxUSConsumerCreditReport: EquifaxUSConsumerCreditReport;
}

export interface Address {
    state?: string;
}

export interface DriversLicense {
    driverLicenseNumber?: string;
    issueDate?: string;
    expirationDate?: string;
    address?: Address;
}

export interface PhoneNumbers {
    identifier?: string;
    telephoneNumber?: string;
}

export interface Addresses {
    addressType: string;
    addressStatus?: string;
    addressPostRuralIndicator?: string;
    boxNumber?: string;
    ruralRouteNumber?: string;
    apartmentNumber?: string;
    houseNumber?: string;
    streetName?: string;
    streetType?: string;
    city?: string;
    state?: string;
    zip?: string;
    preDirectional?: string;
    postDirectional?: string;
    durationOfLivingInYYMM?: string;
}

export interface Names {
    firstName: string;
    lastName: string;
    middleName?: string;
    prefixName?: string;
    suffixName?: string;
}

export interface PersonalInformation {
    names: Names[];
    socialSecurityNumber?: string;
    dateOfBirth: string;
    age?: string;
    householdCode?: string;
    addresses: Addresses[];
    phoneNumbers?: PhoneNumbers[];
    driversLicense?: DriversLicense;
}

export interface Applicant {
    type: string;
    personalInformation?: PersonalInformation;
    dataSources: DataSources;
}

export interface CreditReport {
    quoteNumber: string;
    requestorLOB?: string;
    masterCompanyCode?: string;
    UWCompanyCode?: string;
    UWCompanyName?: string;
    rateBook?: string;
    effectiveDate?: string;
    quoteReference?: string;
    term?: string;
    coverageState?: string;
    producerCode?: string;
    applicants?: Applicant[];
}

export interface CreditReportData {
    creditReport: CreditReport;
}