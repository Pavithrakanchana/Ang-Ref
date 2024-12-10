export interface PaymenttokenHeader {
    accountNumber: string;
    paymentTypeCode: string;
    existing:  boolean;
}
export interface PaymenttokenCustomer {
    firstName: string;
    lastName: string;
    email: string;
    clientId: string;
}
export interface PaymenttokenLiability {
    amountDue: number;
    outstandingAmount: number;
    policyNumber: string;
    householdNumber: string;
    primaryBillingName: string;
    secondaryBillingName: string;
    agentOfRecord: string;
}
export interface PaymenttokenAccount {
    header : PaymenttokenHeader;
    customers: [PaymenttokenCustomer];
    liability : PaymenttokenLiability;
}

export class SplPaymenttokenreq {
    accounts!: [PaymenttokenAccount];
    postMessageTarget: string ="";
    externalChannel: string="";
    action: string="";
    entryPoint: string="";
    timestamp: string="0";
    cRid: string="";
    iframe :  boolean = true;
    isPayLaterEnabled:  boolean = true;
    isSecureLine: boolean = true;
}
