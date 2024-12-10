import { OtherPolicyValues, ValidValues } from "../validvalues/validvaluesres.model";

 export class ApplicationDetails {
  otherPolicyTypes!: OtherPolicyValues[];
  countries!: ValidValues[];
  multiPolicyDiscounts!: ValidValues[];
  stateValues!: ValidValues[];  
 }
