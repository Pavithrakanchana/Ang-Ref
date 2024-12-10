
export interface Payment {
  notes: string;
  transactionSourceSystem: string;
  userId: string;
  userType: string;
}

export interface PaymentCancelAutoPayReq {
  payment: Payment;
}
