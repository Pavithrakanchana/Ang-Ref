export interface Vehicle {
    make: string;
    model: string;
    year: string;
    vehicleTrimName: string;
    vehicleType: string[];
}

export interface SearchByCriteria {
    vehicle: Vehicle;
}

export interface VinPrefixReq {
    searchByCriteria: SearchByCriteria;
}