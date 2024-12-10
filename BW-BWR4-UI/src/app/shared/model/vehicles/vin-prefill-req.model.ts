
export interface VinPrefillReq {
    autoPrefillReportQuery:AutoPrefillReportQuery;
}


export interface AutoPrefillReportQuery {
    quoteNumber: string;
    masterCompanyCode: string;
}