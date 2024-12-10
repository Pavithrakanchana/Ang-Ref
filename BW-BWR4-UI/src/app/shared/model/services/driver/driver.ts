import { License } from "./driver-license";
import { Person } from "./driver-person";

export interface driver {
    "id": number;
    "primaryInsuredIndicator": boolean;
    "person": Person;
    "license": License;
    "relationshipToInsured": string;
    "ratingIndicator": string;
    "sr22FilingIndicator": boolean;
    "distantStudentIndicator": boolean;
    "caseFilingNumber": string;
}
