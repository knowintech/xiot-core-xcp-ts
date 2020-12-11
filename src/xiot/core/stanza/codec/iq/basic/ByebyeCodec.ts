import {IqCodec} from '../../IqCodec';
import {IQQuery} from '../../../typedef/iq/IQQuery';
import {IQResult} from '../../../typedef/iq/IQResult';
import {QueryByebye, ResultByebye} from '../../../typedef/iq/basic/Byebye';

export class ByebyeCodec implements IqCodec {

    encodeQueryContent(query: IQQuery): any | null {
        return null;
    }

    encodeResultContent(result: IQResult): any | null {
        return null;
    }

    decodeQuery(id: string, content: Object): IQQuery | null {
        return new QueryByebye(id);
    }

    decodeResult(id: string, content: Object): IQResult | null {
        return new ResultByebye(id);
    }
}
