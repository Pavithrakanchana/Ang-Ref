import { ValidValues } from '../validvalues/validvaluesres.model';

export class VehicleDetail {
  vin: string = '';
  years!: ValidValues[];
  year!: string;
  makes: ValidValues[] = [];
  make!: string;
  models: ValidValues[] = [];
  model!: string;
  bodyTypes: ValidValues[] = [];
  bodyType!: string;
  trims: ValidValues[] = [];
  trim: string = '';
  dbVehicleSeqNo: string='';

  typeValues!: ValidValues[];;
 // type!: DropDownItem[];

  acv: string = '';

  useValues!: ValidValues[];
  use: string = ''; 

  odometer: string = '';

  umpdValues!: ValidValues[];
  umpd: string= '';

  comprehensiveValues!: ValidValues[];
  comprehensive: string = '';
  
  collisionValues!: ValidValues[];
  collision: string = '';

  additionalEquipmentValues!: ValidValues[];
  additionalEquipment: string = '';

  rentalValues!: ValidValues[];
  rental: string = '';

  loanCar: string = '';
  roadSide: string = '';
  garageZipCode: string = '';

  antitheftValues!: ValidValues[];
  antitheft: string = '';
  
  constructor(values: Object = {}) {
    Object.assign(this, values);
/*
    this.typeValues = [
      { value: 'N', viewValue: 'Auto/Truck/Van' },
      { value: 'N-CVAN', viewValue: 'Conversion Van' },
      { value: 'Y', viewValue: 'Non Owner' }
    ] 

    this.useValues = [
      { value: 'P', viewValue: 'Pleasure/Commute' },
      { value: 'B', viewValue: 'Business' },
      { value: 'A', viewValue: 'Artisan' },
      { value: 'O', viewValue: 'Storeage (COMP Only)' },
      { value: 'R', viewValue: 'Ridesharing' }
    ];

    this.comprehensiveValues = [
      { value: '', viewValue: 'No Coverage' },
      { value: '250', viewValue: '250' },
      { value: 'G250', viewValue: '250 Glass' },
      { value: '500', viewValue: '500' },
      { value: 'G500', viewValue: '500 Glass' },
      { value: '750', viewValue: '750' },
      { value: 'G750', viewValue: '750 Glass' },
      { value: '1000', viewValue: '1000' },
      { value: 'G1000', viewValue: '1000 Glass' }
    ];
    
     this.collisionValues = [
       { value: '', viewValue: 'No Coverage' },
       { value: '250', viewValue: '250' },
       { value: '500', viewValue: '500' },
       { value: '750', viewValue: '750' },
       { value: '1000', viewValue: '1000' }
       
     ] 

     this.additionalEquipmentValues = [
      { value: '', viewValue: 'No Coverage' },
      { value: '0100', viewValue: '1-100' },
      { value: '0200', viewValue: '101-200' },
      { value: '0500', viewValue: '201-500' },
      { value: '1000', viewValue: '501-1000' },
      { value: '1500', viewValue: '1001-1500' },
      { value: '2000', viewValue: '1501-2000' },
      { value: '2500', viewValue: '2001-2500' },
      { value: '3000', viewValue: '2501-3000' },
      { value: '3500', viewValue: '3001-3500' },
      { value: '4000', viewValue: '3501-4000' },
      { value: '4500', viewValue: '4001-4500' },
      { value: '5000', viewValue: '4501-5000' }
      
    ] 

    this.rentalValues = [
      { value: '', viewValue: 'No Coverage' },
      { value: '30/30', viewValue: '30' },
      { value: '40/30', viewValue: '40' },
      { value: '50/30', viewValue: '50' }
           
    ] 
    */
  }
}

export class DropDownItem {
  value!: string;
  viewValue!: string;
  constructor(values: Object = {}) {
    Object.assign(this, values);
  }
}
