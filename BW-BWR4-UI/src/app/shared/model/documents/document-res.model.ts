export interface TransInfo {
  transactionStatus: string;
  errorMessageId: string;
  errorMessageText: string;
}

export interface FetchDocumentRes {
  responseStatus: number;
  responseDescription: string;
  documentBytes: string;
  transInfo: TransInfo;
}
