import {IQQuery} from '../../IQQuery';
import {IQResult} from '../../IQResult';
import {PropertyOperation} from 'xiot-core-spec-ts';

export const SET_PROPERTIES_METHOD = 'urn:xiot:set-properties';

export class QuerySetProperties extends IQQuery {

    public properties: Array<PropertyOperation> = [];

    constructor(id: string, properties: Array<PropertyOperation>) {
        super(id, SET_PROPERTIES_METHOD);
        this.properties = properties;
    }

    public result(properties: Array<PropertyOperation>): ResultSetProperties {
        return new ResultSetProperties(this.id, properties);
    }
}

export class ResultSetProperties extends IQResult {

    public properties: Array<PropertyOperation>;

    constructor(id: string, properties: Array<PropertyOperation>) {
        super(id, SET_PROPERTIES_METHOD);
        this.properties = properties;
    }
}
