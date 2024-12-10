
  export interface Quote {
      quoteNumber: string;
  }

  export interface Policy {
      policyNumber: string;
  }

  export interface Document {
      quote: Quote;
      policy: Policy;
      masterCompany: string;
      documentType: string;
      deleteExistingDocument: string;
  }

  export interface EmdrFormsReq {
      documents: Document[];
  }



