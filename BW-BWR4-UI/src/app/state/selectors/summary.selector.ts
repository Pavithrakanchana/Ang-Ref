import { createSelector } from "@ngrx/store";
import { Appstate } from "../appstate.state";
import QuoteSummary from "../model/summary.model";

export const selectQuoteSummary = createSelector(
    (state: Appstate) => state.quoteSummary,
    (quoteSummary: QuoteSummary) => quoteSummary
);
