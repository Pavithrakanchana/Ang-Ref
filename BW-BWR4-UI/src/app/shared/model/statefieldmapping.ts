  export interface FieldConfig {
      state: string;
      page : string,
      field: string;
  }

  export interface StateFieldConfig {
    FieldConfig: FieldConfig[];
  }
 
  export interface StateFieldsMapping {
    StateFieldConfig: StateFieldConfig;
    }


