import {IqCodec} from '../../../IqCodec';
import {IQQuery} from '../../../../../../..';
import {IQResult} from '../../../../../../..';
import {QueryInvokeAction, ResultInvokeAction} from '../../../../../../..';
import {ActionOperationCodec} from 'xiot-core-spec-ts';

export class InvokeActionCodec implements IqCodec {

    encodeQueryContent(query: IQQuery): any | null {
        if (query instanceof QueryInvokeAction) {
            return ActionOperationCodec.encodeQuery(query.actions);
        }

        return null;
    }

    encodeResultContent(result: IQResult): any | null {
        if (result instanceof ResultInvokeAction) {
            return {
                actions: ActionOperationCodec.encodeResultArray(result.actions)
            };
        }

        return null;
    }

    decodeQuery(id: string, content: any): IQQuery | null {
        return new QueryInvokeAction(id, ActionOperationCodec.decodeQueryArray(content.actions));
    }

    decodeResult(id: string, content: any): IQResult | null {
        const actions = ActionOperationCodec.decodeResultArray(content.actions);
        return new ResultInvokeAction(id, actions);
    }
}

