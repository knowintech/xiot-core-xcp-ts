import {IQQuery} from '../../IQQuery';
import {IQResult} from '../../IQResult';
import {Summary} from 'xiot-core-spec-ts';

export const GET_SUMMARIES_METHOD = 'urn:xiot:get-summaries';

export class QueryGetSummaries extends IQQuery {

    public devices: string[];

    constructor(id: string, devices: string[]) {
        super(id, GET_SUMMARIES_METHOD);
        this.devices = devices;
    }

    public result(devices: Map<String, Summary>): ResultGetSummaries {
        return new ResultGetSummaries(this.id, devices);
    }
}

export class ResultGetSummaries extends IQResult {

    public devices: Map<String, Summary>;

    constructor(id: string, devices: Map<String, Summary>) {
        super(id, GET_SUMMARIES_METHOD);
        this.devices = devices;
    }
}
