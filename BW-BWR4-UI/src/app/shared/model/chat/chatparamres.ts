export class Chatparamres {
    id: string;
    success: boolean;
    errors: string[];

    constructor(values: Object = {}) {
        Object.assign(this, values);
    }
}
