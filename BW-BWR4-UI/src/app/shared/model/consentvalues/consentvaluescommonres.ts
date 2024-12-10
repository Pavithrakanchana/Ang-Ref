export interface ConsentvaluesCommon {
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
    ConsentValues: ConsentvaluesCommon[];
  
  }
  export interface ConsentvaluesCommonRes {
    responseMap: ResponseMap;
  }