import * as _ from 'lodash';

export class ObjectUtils {
    constructor() {}

    public static compareObjects(o1: Object | undefined, o2: Object | undefined): boolean {

        return _.isEqual(o1, o2);
    }

    public static isObjectEmpty(o1: Object | undefined | null): boolean {
        return _.isUndefined(o1) || _.isEmpty(o1);
    }

    public static isFieldEmpty(value: any): boolean {
        return _.isUndefined(value) || _.isEmpty(value) || _.isNull(value);
    }
}
