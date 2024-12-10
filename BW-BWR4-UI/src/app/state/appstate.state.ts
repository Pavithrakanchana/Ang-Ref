import { ActionReducerMap, MetaReducer } from "@ngrx/store";
import QuoteSummary from "./model/summary.model";
import { storageMetaReducer } from "./reducers/storage.metareducer";
import { summaryReducer } from "./reducers/summary.reducer";

export interface Appstate {
    quoteSummary: Readonly<QuoteSummary>;
}

export const reducers: ActionReducerMap<Appstate> = {
    quoteSummary: summaryReducer
}

export const metaReducers: MetaReducer[] = [
    storageMetaReducer
  ]
