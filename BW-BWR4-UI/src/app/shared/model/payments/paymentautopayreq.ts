export interface Paymentautopayreq {
    account: Account;
}

export interface Account {
    id: string;
    referenceNumber: string;
    duplicateCheck: boolean;
    scheduleType: string;
    transactionSourceSystem: string;
    scheduleStatus: string;
    transactionType: string;
    userType: string;
    walletId: string;
    agentOfRecord: string;
    paymentMethods: PaymentMethods[];
	customer: Customer;	
}

export interface PaymentMethods {
    token: string;
	scheduleEnabled: string;
}

export interface Customer {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    address: Address;
}

export interface Address {
    line1: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
}