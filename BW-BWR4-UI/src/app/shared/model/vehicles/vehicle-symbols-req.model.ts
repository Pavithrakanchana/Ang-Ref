export interface Vehicle {
    vin: string;
    state: string;
    rateBook: string;
    masterCompany: string;
    lineOfBusiness: string;
}

export interface VehicleSymbolsReq {
    vehicles: Vehicle[];
}


