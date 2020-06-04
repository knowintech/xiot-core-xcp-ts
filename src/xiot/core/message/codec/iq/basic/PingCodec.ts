import {IqCodec} from '../../IqCodec';
import {IQQuery} from '../../../../../..';
import {IQResult} from '../../../../../..';
import {QueryPing, ResultPing} from '../../../../../..';

export class PingCodec implements IqCodec {

    encodeQueryContent(query: IQQuery): any | null {
        return null;
    }

    encodeResultContent(result: IQResult): any | null {
        return null;
    }

    decodeQuery(id: string, content: any): IQQuery | null {
        return new QueryPing(id);
    }

    decodeResult(id: string, content: any): IQResult | null {
        return new ResultPing(id);
    }
}
