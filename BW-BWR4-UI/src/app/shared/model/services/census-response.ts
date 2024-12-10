import { Policy } from "./policy";

export class CensusResponse {
    policy : Policy = {
        garagingAddresses : []
    };
    errorCode : string = "";
    errorMessage : string = "";
}
