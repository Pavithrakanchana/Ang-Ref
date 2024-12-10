export interface BindResponse {
    quote: Quote;
}

export interface Quote {
    confirmationNumber: string;
    bindDateTime: BindDateTime;
}

export interface BindDateTime {
    date: string;
    timestamp: string;
}