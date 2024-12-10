
import { Address } from '../autoquote/autoquote.model';
import {Drivers } from '../drivers/drivers.model';
export interface VehiclesDetails {
    id : string;
    VIN : string;
    make : string;
    model : string;
    year : string;
    riskState : string;
    userEnteredOdometer : string;
    userAnnualMileage : string;
    garagingAddress : Address[];    
}
export interface VehiclesHistoryInfo {
    masterCompany: string;
    producerCode : string;
    effectiveDate : string;
    forceOrder : boolean;
    drivers: Drivers[];
    vehicles: VehiclesDetails[];  
}
export interface VehicleHistoryReq {
    vehicleHistoryRequest : VehiclesHistoryInfo;
}
export interface VehicleHistoryResponse {
    vehicleHistoryResponse : VehiclesHistoryReport;
}
export interface VehiclesHistoryReport {
    reports : ReportsInfo[];
}
export interface ReportsInfo {
    id : string,
    status : string,
    description : string,
    orderNumber : string,
    vehicle : VehicleReport
}
export interface VehicleReport {
    VIN : string,
    numberOfPriorOwners : number,
    fleetTaxiInd : boolean,
    mileage : VehicleMileage,
    owner : VehicleOwner[],
    severeDamage: VehicleSevereDamageDetails
}
export interface VehicleMileage {
    odometer : VehicleOdometer[],
    calculatedMileage : string,
    usedUserEnteredValue : string
}
export interface VehicleOdometer {
    reading : string,
    date : string
}
export interface VehicleOwner {
    ownership : string,
    currentAccidentOwnerInd : boolean,
    currentOwnershipDurationInMonths : string,
    leaseInd : boolean,
    firstName : string,
    middleName : string,
    lastName : string,
    prefixName : string,
    SufixName : string 
}
export interface VehicleSevereDamageDetails {
    severeDamageInd : false,
    descriptions : DamageDescription[]
}
export interface DamageDescription {
    description: string
}