export interface ValidValues {
  key: string;
  displayvalue: string;
}

export interface OtherPolicyValues {
  label: string;
  options: ValidValues[];
}
export interface ResponseMap {
    gender: ValidValues[];
    maritalstatus: ValidValues[];
    states: ValidValues[];
    suffix: ValidValues[];
    relationship: ValidValues[];
    licensetype: ValidValues[];
    driverrated: ValidValues[];
    accvoilationcodes: ValidValues[];
    disputereasons: ValidValues[];
    consent_options : ValidValues[];
    displayFields: ValidValues[];
    filing: ValidValues[];
    nonratedreason: ValidValues[];

    //vehicles
    vehicletype: ValidValues[];
    vehicleadditionalequipment: ValidValues[];
    vehiclerental: ValidValues[];
    vehiclecomprehensive: ValidValues[];
    vehicleumpd: ValidValues[];
    vehiclecollision: ValidValues[];
    vehicleuse: ValidValues[];
    vehicleyear:ValidValues[];
    antitheft:ValidValues[];


    //Coverages
    prior_carrier_limits: ValidValues[];
    previous_insurance_information: ValidValues[];
    //PolicyInfo
    addtionaldriver_action: ValidValues[];
    primary_residence: ValidValues[];
    addtionaldriver_explanation: ValidValues[];
    eft_future_installments: ValidValues[];
    down_payment_method: ValidValues[];
    multi_policy_discount: ValidValues[];
    other_policy_types: ValidValues[];
    countries: ValidValues[];
    discounts: ValidValues[];
    household_member_information: ValidValues[];

}
export interface ValidValuesRes {
  responseMap: ResponseMap;
}
