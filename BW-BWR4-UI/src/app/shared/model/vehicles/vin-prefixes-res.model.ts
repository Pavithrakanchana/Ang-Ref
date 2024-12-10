

export interface VehicleModel {
    fuelCode: string;
    fuelDescription: string;
    modelPattern: string;
    bodyStyleCode: string;
    bodyStyleDescription: string;
    vehicleIdentificationNumberPrefix: string;
    driveOption: string;
    cylinders: string;
}

export interface Vehicle {
    vehicleModel: VehicleModel;
    getTrimDescription: string;
    transmissionCode: string;
    transmissionDescription: string;
    modelDescription: string;
    modelYear: string;
}

export interface VinPrefixRes {
    vehicles: Vehicle[];
}



