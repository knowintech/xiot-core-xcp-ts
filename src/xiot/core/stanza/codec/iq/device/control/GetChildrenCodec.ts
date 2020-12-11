import {IqCodec} from '../../../IqCodec';
import {ChildCodec} from 'xiot-core-spec-ts';
import {IQQuery} from '../../../../typedef/iq/IQQuery';
import {QueryGetChildren, ResultGetChildren} from '../../../../typedef/iq/device/control/GetChildren';
import {IQResult} from '../../../../typedef/iq/IQResult';

export class GetChildrenCodec implements IqCodec {

    encodeQueryContent(query: IQQuery): any | null {
        if (query instanceof QueryGetChildren) {
            return {
                did: query.did
            };
        }
    }

    encodeResultContent(result: IQResult): any | null {
        if (result instanceof ResultGetChildren) {
            return {children: ChildCodec.encodeArray(result.children)};
        }

        return null;
    }

    decodeQuery(id: string, content: any): IQQuery | null {
        const did = content.did;
        return new QueryGetChildren(id, did);
    }

    decodeResult(id: string, content: any): IQResult | null {
        return new ResultGetChildren(id, ChildCodec.decodeArray(content['children']));
    }
}

