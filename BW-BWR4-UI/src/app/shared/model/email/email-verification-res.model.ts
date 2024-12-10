
  export interface ErrorMessage {
    name: string;
    declaredType: string;
    scope: string;
    value?: any;
    nil: boolean;
    globalScope: boolean;
    typeSubstituted: boolean;
}

export interface EmailVerificationRes {
    errorMessage: ErrorMessage;
    status: string;
}
