export interface VehSymbol {
    name: string;
    value: string;
}

export interface Vehicle {
    vin: string;
    symbols: VehSymbol[];
}

export interface VehicleSymbolsRes {
    vehicles: Vehicle[];
}