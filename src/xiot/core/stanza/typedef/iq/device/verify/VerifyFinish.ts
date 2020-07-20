import {IQQuery} from '../../IQQuery';
import {IQResult} from '../../IQResult';

export const VERIFY_FINISH_METHOD = 'urn:xiot:verify-finish';

export class QueryVerifyFinish extends IQQuery {

    public deviceId: string;
    public deviceType: string;
    public signature: string;
    public codec: number;

    constructor(id: string, deviceId: string, deviceType: string, signature: string, codec: number) {
        super(id, VERIFY_FINISH_METHOD);
        this.deviceId = deviceId;
        this.deviceType = deviceType;
        this.signature = signature;
        this.codec = codec;
    }

    public result(): ResultVerifyFinish {
        return new ResultVerifyFinish(this.id);
    }
}

export class ResultVerifyFinish extends IQResult {

    constructor(id: string) {
        super(id, VERIFY_FINISH_METHOD);
    }
}
