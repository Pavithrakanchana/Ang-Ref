import { PolicySummaryResponse } from "./applicant-policy-summary-response"
import { ProspectResponse } from "./applicant-prospect-response";

export interface ApplicantInfoResponse {
    policySummary: PolicySummaryResponse
    Prospects: ProspectResponse[];
    "navigationURL" : null;

}
