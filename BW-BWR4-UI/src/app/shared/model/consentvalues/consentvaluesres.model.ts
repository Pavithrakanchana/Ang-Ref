export interface ConsentValues {
    key: string;
    displayvalue: string;
  }
  
  
  export interface ResponseMap {
      consent_message : ConsentValues[];
      
  }
  export interface ConsentValuesRes {
    responseMap: ResponseMap;
  }
  