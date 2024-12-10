import { ActionReducer, Action } from "@ngrx/store";

export function metaReducer(reducer: ActionReducer<any>) : ActionReducer<any> {
    // a function with the exact same signature of a reducer
    return function(state: any, action: Action) {
      return reducer(state, action);
    };
  }