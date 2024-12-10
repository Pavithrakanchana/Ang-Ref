

    export interface Specification {
        name: string;
        value: string;
    }

    export interface Model {
        specifications: Specification[];
    }

    export interface VintelModelsResponse {
        models: Model[];
    }



