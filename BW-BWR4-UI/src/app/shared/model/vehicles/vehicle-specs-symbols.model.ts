        export interface Engine {
            fuelCode: string;
            fuelText: string;
        }
    
        export interface BodySpecifications {
            antiLockBrakesOption: string;
            bodyStyleCode: string;
            bodyStyleDescription: string;
            segmentationCode: string;
            segmentationDescription: string;
            daylightRunningLightsOption: string;
        }
    
        export interface Specifications {
            engine: Engine;
            airConditioningOption: string;
            manufacturerCode: string;
            manufacturerName: string;
            modelName: string;
            modelYear: string;
            antiTheftCode: string;
            antiTheftProtectionCode: string;
            airBagTypeCode: string;
            airBagTypeDescription: string;
            getTrimDescription: string;
            bodySpecifications: BodySpecifications;
        }
        export interface Symbol {
            name: string;
            value: string;
        }
    
        export interface Vehicle {
            vehicleIdentificationNumber: string;
            specifications: Specifications;
            correctedVINCode: string;
            correctedVINIndicator: boolean;
            vinDecodeCode: string;
            vinDecodeDescription: string;
            symbols: Symbol[];
            symbolCode: string;
            symbolDescription: string;
        }
    
        export interface VehicleSpecsAndSymbols {
            vehicle: Vehicle;
        }
    
    
    
    





