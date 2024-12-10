
export interface Paymentautopayres {
    account: Account
}

export interface Account {
    scheduleReferenceNumber: string;
    status: string;
}