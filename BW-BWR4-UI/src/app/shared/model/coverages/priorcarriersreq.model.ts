import { ValidValues } from "../validvalues/validvaluesres.model";


export interface PriorCarriersReq {
      lookup:LookUp[];
      telephoneNumber?: string;
}

export interface LookUp {
  key: string;
  value: Value;
}

export interface Value{
  attributes: AttributeArray[];
}
export interface AttributeArray{
  name: string;
  value: any;
}