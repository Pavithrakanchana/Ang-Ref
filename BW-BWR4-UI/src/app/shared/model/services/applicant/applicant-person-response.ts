import { AddressResponse } from "./applicant-address-response";
import { PhoneResponse } from "./applicant-phone-response";

export interface PersonResponse {
    
    firstName: string;
    middleName: string;
    lastName: string;
    suffixName: string;
    dateOfBirth: string;
    socialSecurityNumber: string;
    maritalStatus: string;
    gender: string;
    emailAddress: string;

    phones: PhoneResponse[];
    addresses: AddressResponse[];
    
}
