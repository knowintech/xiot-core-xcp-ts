import {IqCodec} from '../../../IqCodec';
import {IQQuery} from '../../../../../../..';
import {IQResult} from '../../../../../../..';
import {QueryGetChildren, ResultGetChildren} from '../../../../../../..';
import {DeviceChildCodec} from 'xiot-core-spec-ts';

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
            return {children: DeviceChildCodec.encodeArray(result.children)};
        }

        return null;
    }

    decodeQuery(id: string, content: any): IQQuery | null {
        const did = content.did;
        return new QueryGetChildren(id, did);
    }

    decodeResult(id: string, content: any): IQResult | null {
        return new ResultGetChildren(id, DeviceChildCodec.decodeArray(content['children']));
    }
}

