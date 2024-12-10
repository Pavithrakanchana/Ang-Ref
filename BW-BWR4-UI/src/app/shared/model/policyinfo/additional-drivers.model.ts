import { ValidValues } from "../validvalues/validvaluesres.model";
export interface AdditionalDrivers {
    firstName: string,
    middleInitial: string,
    lastName: string,
    dateOfBirth: string,
    licenceState: string,
    licenceNumber: string,
    action?: string,
    explanation?: string,
    source: string
}

export class PolicyInfo {
    primaryResidence: ValidValues[] = [];
    multiPolicyDisc: ValidValues[] = [];
    eftFuture: ValidValues[] = [];
    downPayment: ValidValues[] = [];
    action: ValidValues[] = [];
    explanation: ValidValues[] = [];
    householdMember: ValidValues[] = [];
}
