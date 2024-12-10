import { ActionReducer, INIT, UPDATE } from "@ngrx/store";
import { Appstate } from "../appstate.state";

const sessionStorageKey = '__app_storage__';

export const storageMetaReducer = (
    reducer: ActionReducer<Appstate>
  ): ActionReducer<Appstate> => {
    return (state, action) => {

      if (action.type === INIT || action.type === UPDATE) {
        const storageValue = sessionStorage.getItem(sessionStorageKey);
        if (storageValue) {
          try {
            return JSON.parse(storageValue);
          } catch {
            sessionStorage.removeItem(sessionStorageKey);
          }
        }
      }
      const nextState = reducer(state, action);
      sessionStorage.setItem(sessionStorageKey, JSON.stringify(nextState));
      return nextState;
    };
  };
