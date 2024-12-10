import { Address } from "./parsed-address.model";

export interface ScrubAddrRes {
  errorMessage: string;
  parsedAddresses: Address[];
  serviceCallResult: string;
  status: string;
  addressResultCode: string;
  addressResultDescription: string;
}
