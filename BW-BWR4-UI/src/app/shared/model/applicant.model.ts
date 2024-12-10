import { ConsentValues } from "./consentvalues/consentvaluesres.model";
import { ValidValues } from "./validvalues/validvaluesres.model";

export class Applicant {
  firstname!: string;
  birthdate!: string;
  lastname!: string;
  middlename!: string;
  email!: string;
  ssn!: string;
  phone!: string;
  address!: string;
  city!: string;
  state!: string;
  zipcode!: string;
  prevAddress!: string;
  prevCity!: string;
  prevState!: string;
  prevZipcode!: string;
  prevAddressPO = false;
  suffixValues!: ValidValues[];
  maritalStatus!: string;
  maritalStatusValues!: ValidValues[];
  stateValues!: ValidValues[];
  prevStateValues!: ValidValues[];
  polEffDt!: string;
  licensetype!: string;
  licenseID!: string;
  licensestate!: string;
  gender!: string;
  genderValues!: ValidValues[];
  broadpolicy!: string;
  callID!: string;

  policyTerm = '6';
  moved = false;
  suffix = '';
  nonowner = false;
  pobox = false;
  discounts!: ValidValues[];
  custConstentValue!: ValidValues[];
  consentMessage!: ConsentValues[];

  constructor() {
  }
}
