import {IqCodec} from '../../../IqCodec';
import {IQQuery} from '../../../../../../../index';
import {IQResult} from '../../../../../../../index';
import {QueryGetChildren, ResultGetChildren} from '../../../../../../../index';
import {ChildCodec} from 'xiot-core-spec-ts';

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

