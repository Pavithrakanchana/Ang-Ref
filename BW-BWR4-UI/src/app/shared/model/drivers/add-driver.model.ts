/*export interface Driver {
    drivers: DriverDetails[];
}*/

import { ValidValues } from "../validvalues/validvaluesres.model";


export class DriverDetails {
  dbDriverSeqNo: string = "";
  firstname: string = "";
  middlename: string = "";
  lastname: string = "";
  dob: string = "";
  maritalStatus: string = "";
  maritalStatusValues!: ValidValues[];
  suffix: string = "";
  suffixValues!: ValidValues[];
  genderValues!: ValidValues[];
  relationValues!: ValidValues[];
  licenseStateValues!: ValidValues[];
  licenseTypeValues!: ValidValues[];
  educationValues!: DropDown[];
  occupationValues!: DropDown[];
  subOccupationValues!: DropDown[];
  ratedValues!: ValidValues[];
  gender: string = "";
  rated: string = "";
  relationship: string = "";
  licenseType: string = "";
  licensestate: string = "";
  filing: boolean = false;
  filingValues!: ValidValues[];
  reasonValues!: ValidValues[];
  distantstd: boolean = false;
  education: string = "";
  occupation: string = "";
  suboccupation: string = "";
  licensenumber: string = "";
  constructor(values: Object = {}) {
    Object.assign(this, values);
    this.educationValues = [
      { value: '1', viewValue: '1' },
      { value: '2', viewValue: '2' }
    ];
    this.occupationValues = [
      { value: '1', viewValue: '1' },
      { value: '2', viewValue: '2' }
    ];
    this.subOccupationValues = [
      { value: '1', viewValue: '1' },
      { value: '2', viewValue: '2' }
    ];

    this.occupationValues = [
      { value: 'HM', viewValue: 'Homemaker (full-time)' },
      { value: 'RT', viewValue: 'Retired (full-time)' },
      { value: 'UM', viewValue: 'Unemployed' },
      { value: 'SD', viewValue: 'Student (full-time)' },
      { value: 'AFF', viewValue: 'Agriculture/Forestry/Fishing' },
      { value: 'ADM', viewValue: 'Art/Design/Media' },
      { value: 'BFR', viewValue: 'Banking/Finance/Real Estate' },
      { value: 'BSO', viewValue: 'Business/Sales/Office' },
      { value: 'CEM', viewValue: 'Construction/Energy/Mining' },
      { value: 'EDL', viewValue: 'Education/Library' },
      { value: 'EAS', viewValue: 'Engineer/Architect/Science/Math' },
      { value: 'FDH', viewValue: 'Food Service/Hotel Service' },
      { value: 'GMI', viewValue: 'Government/Military' },
      { value: 'ITE', viewValue: 'Information Technology' },
      { value: 'INS', viewValue: 'Insurance' },
      { value: 'LLS', viewValue: 'Legal/Law Enforcement/Security' },
      { value: 'MSR', viewValue: 'Medical/Social Services/Religion' },
      { value: 'PCS', viewValue: 'Personal Care/Service' },
      { value: 'PMA', viewValue: 'Production/Manufacturing' },
      { value: 'RMG', viewValue: 'Repair/Maintenance/Grounds' },
      { value: 'SRE', viewValue: 'Sports/Recreation' },
      { value: 'TTS', viewValue: 'Travel/Transportation/Storage' },
      { value: 'NA', viewValue: 'Data not collected' },

    ];

    this.educationValues = [
      { value: 'NA', viewValue: 'Unknown' },
      { value: 'NO', viewValue: 'No High School Diploma or GED' },
      { value: 'HS', viewValue: 'High School Diploma or GED' },
      { value: 'VT', viewValue: 'Vocational/Trade School or Military Training' },
      { value: 'SC', viewValue: 'Some College' },
      { value: 'CC', viewValue: 'Currently in College' },
      { value: 'CD', viewValue: 'College Degree' },
      { value: 'GD', viewValue: 'Graduate work or Graduate Degree' },
    ];
    this.subOccupationValues = [
      { value: 'NA', viewValue: 'Agriculture/Forestry/Fishing' },
      { value: 'NA', viewValue: 'Art/Design/Media' },
      { value: 'NA', viewValue: 'Banking/Finance/Real Estate' },
      { value: 'NA', viewValue: 'Business/Sales/Office' },
      { value: 'NA', viewValue: 'Construction/Energy/Mining' },
      { value: 'NA', viewValue: 'Education/Library' },
      { value: 'NA', viewValue: 'Engineer/Architect/Science/Math' },
      { value: 'NA', viewValue: 'Food Service/Hotel Service' },
      { value: 'NA', viewValue: 'Government/Military' },
      { value: 'NA', viewValue: 'Information Technology' },
      { value: 'NA', viewValue: 'Insurance' },
      { value: 'NA', viewValue: 'Legal/Law Enforcement/Security' },
      { value: 'NA', viewValue: 'Medical/Social Services/Religion' },
      { value: 'NA', viewValue: 'Personal Care/Service' },
      { value: 'NA', viewValue: 'Production/Manufacturing' },
      { value: 'NA', viewValue: 'Repair/Maintenance/Grounds' },
      { value: 'NA', viewValue: 'Sports/Recreation' },
      { value: 'NA', viewValue: 'Travel/Transportation/Storage' },
    ];

  }
}
export class DropDown {
  value!: string;
  viewValue!: string;
  constructor(values: Object = {}) {
    Object.assign(this, values);
  }
}
