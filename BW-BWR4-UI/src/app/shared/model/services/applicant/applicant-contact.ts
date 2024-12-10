import { Phone } from "./applicant-phone";
import { Person } from "./applicant-person";
import { Address } from "./applicant-address";

export interface Contact {
    
    person: Person;
    phones: Phone[];
    addresses: Address[];

}

