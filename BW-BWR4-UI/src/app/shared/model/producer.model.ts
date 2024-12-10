export interface Agents{
    firstName : string;
    lastName : string;
    middleName : string;
    licNbr : string;
    suffix : string;
    uniqueID : string;
}

export interface ProducerData {
    errorMessage:string;
    status:string;
    reportStatus:string;
    agents : Agents[]
}

export interface ProducerDataRes {
    context: string;
    policyMCO: string;
    policyModule: string;
    policyNumber: string;
    policySymbol: string;
    producerCode: string;
    requestingProgram: string;
    emailAddress: string;
    lineOfBusiness: string;
    fullName: string;
    // phoneNumber:string;
  }
