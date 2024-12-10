export interface ScrubAddrReq {
  fullAddress: string;
  city: string;
  state: string;
  zip: string;
  sourceSystem: string;
  addressType: string;
}

export interface AddressCompareObj {
  correctedAddress?: any;
  enteredAddress?: any;
  page?: string;
  id?: string;
  name?: string;
}
