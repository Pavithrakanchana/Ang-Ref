export interface Location {
    city: string;
    state: string;
    zipCode: string;
}

export interface Street {
    name: string;
    number: string;
}

export interface Address {
    addressType: string;
    location: Location;
    street: Street;
    unparsedAddress: string[];
}

export interface DriversLicense {
    expiryDate: string;
    issuanceState: string;
    issueDate: string;
    number: string;
    status: string;
    type: string;
}

export interface Name {
    firstName: string;
    generationalPrefix: string;
    generationalSuffix: string;
    lastName: string;
    middleName: string;
}

export interface PhoneNumber {
    type: string;
    number: string;
}

export interface Driver {
    number: string;
    dateOfBirth: string;
    gender: string;
    addresses: Address[];
    driversLicense: DriversLicense;
    name: Name;
    phoneNumbers: PhoneNumber[];
    role: string;
    taxRegistrationId: string;
}

export interface RiskReportQuery {
    quoteNumber: string;
    masterCompanyCode: string;
    staleDays?: string;
    optIn?: boolean;
    orderPlacedTime?: string;
    rulePlan?: string;
    uwCompanyCode?: string;
    uwCompanyName?: string;
    account?: string;
    agentOfRecord?: string;
    checkForPriorRecord?: boolean;
    drivers?: Driver[];
}

export interface ClueRequest {
    riskReportQuery: RiskReportQuery;
}