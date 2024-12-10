export interface ValidvaluesCommon {
  code: string;
  description: string;
  order: number;
  required: boolean;
  values: ValuePair[];
}
export interface ValuePair {
  key: string;
  displayvalue: string;
}
export interface ResponseMap {
  ValidValues: ValidvaluesCommon[];

}
export interface ValidvaluesCommonRes {
  responseMap: ResponseMap;
}