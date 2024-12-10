import { ValidValues } from "../validvalues/validvaluesres.model";


export class CoveragesModel{

   bodilyInjury: string = '';
     propertyDamage: string = '';
     uninsuredMotoristBodilyInjury: string = '';
     underInsuredMotoristBodilyInjury: string = '';
     medicalPayments: string = '';
     hasSixMonthsOfContinuousInsurance: boolean = false;
     priorInsuranceName: string = '';
     priorLimits: ValidValues[] = [];
     priorCarrier: ValidValues[] = [];
     priorPolicyExpirationDate: string = '';
     creditStatus: string = '';
     socialSecurityNumber: string = '';
     isNonOwnerPolicy: boolean = false
}
