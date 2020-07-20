import {IQQuery} from '../../IQQuery';
import {IQResult} from '../../IQResult';

export const VERIFY_START_METHOD = 'urn:xiot:verify-start';

export class QueryVerifyStart extends IQQuery {

    public publicKey: string;

    constructor(id: string, publicKey: string) {
        super(id, VERIFY_START_METHOD);
        this.publicKey = publicKey;
    }

    public result(publicKey: string, signature: string): ResultVerifyStart {
        return new ResultVerifyStart(this.id, publicKey, signature);
    }
}

export class ResultVerifyStart extends IQResult {

    public publicKey: string;
    public signature: string;

    constructor(id: string, publicKey: string, signature: string) {
        super(id, VERIFY_START_METHOD);
        this.publicKey = publicKey;
        this.signature = signature;
    }
}
