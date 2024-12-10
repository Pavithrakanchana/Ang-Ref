
export class BWMessage {
    messageCode!: string;
    messageDesc!: string;
    source!: string;

    constructor(values: Object = {}) {
        Object.assign(this, values);
    }
}
