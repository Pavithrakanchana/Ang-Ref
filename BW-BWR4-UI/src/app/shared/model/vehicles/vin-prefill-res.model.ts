export interface Vehicles {
    sequenceNumber: number;
    vin:string;
    make: string;
    year:string;
    model:string;
}

export interface VehiclesSummary {
    totalVehiclesCount: number;
}

export interface PriorCarrierOrVehicleMessages {
    messageType: string;
    messageBody: string;
}

export interface AutoPrefillReport {
    statusCode: string;
    statusDescription: string;
    issuingAuthority: string;
    priorCarrierOrVehicleMessages: PriorCarrierOrVehicleMessages[];
    vehiclesSummary: VehiclesSummary;
    vehicles:Vehicles[];
    referenceNumber:string;
}

export interface VinPrefillRes {
    autoPrefillReport: AutoPrefillReport;
}



