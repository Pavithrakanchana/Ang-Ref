export interface BindRequest {
    quote: Quote;
}

export interface Quote {
    quoteNumber: string;
    policyNumber: string;
    houseHoldNumber: string;
    processingAgent: string;
    effectiveDate: string;
    stateCode: string;
    lineOfBusinessCode: string;
    agentLoginId?: string;
    checkPolicyExistsForOtherLineOfBusiness: string;
    downPayment: DownPayment;
}

export interface DownPayment {
  theCurrencyAmount: number;
  method: string
}
