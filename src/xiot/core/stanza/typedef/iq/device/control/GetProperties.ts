import {IQQuery} from '../../IQQuery';
import {IQResult} from '../../IQResult';
import {PropertyOperation} from 'xiot-core-spec-ts';

export const GET_PROPERTIES_METHOD = 'urn:xiot:get-properties';

export class QueryGetProperties extends IQQuery {

    public properties: Array<PropertyOperation>;

    constructor(id: string, properties: Array<PropertyOperation>) {
        super(id, GET_PROPERTIES_METHOD);
        this.properties = properties;
    }

    public result(): ResultGetProperties {
        return new ResultGetProperties(this.id, this.properties);
    }
}

export class ResultGetProperties extends IQResult {

    public properties: Array<PropertyOperation>;

    constructor(id: string, properties: Array<PropertyOperation>) {
        super(id, GET_PROPERTIES_METHOD);
        this.properties = properties;
    }
}
