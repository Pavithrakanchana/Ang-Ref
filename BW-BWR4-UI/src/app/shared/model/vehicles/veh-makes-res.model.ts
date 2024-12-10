    export interface Specification {
        identifier: string;
        fullname: string;
    }

    export interface Make {
        specifications: Specification[];
    }

    export interface VintelMakesResponse {
        makes: Make[];
    }