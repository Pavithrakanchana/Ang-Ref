
  export interface State {
      _id: string;
      _name: string;
      _code: string;
  }

  export interface StateCodes {
      state: State[];
  }

  export interface StateCodesMapping {
      StateCodes: StateCodes;
  }



