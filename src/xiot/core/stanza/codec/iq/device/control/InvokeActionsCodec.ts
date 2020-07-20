import {IqCodec} from '../../../IqCodec';
import {IQQuery} from '../../../../../../../index';
import {IQResult} from '../../../../../../../index';
import {QueryInvokeActions, ResultInvokeActions} from '../../../../../../../index';
import {ActionOperationCodec} from 'xiot-core-spec-ts';

export class InvokeActionsCodec implements IqCodec {

    encodeQueryContent(query: IQQuery): any | null {
        if (query instanceof QueryInvokeActions) {
            return ActionOperationCodec.encodeQuery(query.actions);
        }

        return null;
    }

    encodeResultContent(result: IQResult): any | null {
        if (result instanceof ResultInvokeActions) {
            return {
                actions: ActionOperationCodec.encodeResultArray(result.actions)
            };
        }

        return null;
    }

    decodeQuery(id: string, content: any): IQQuery | null {
        return new QueryInvokeActions(id, ActionOperationCodec.decodeQueryArray(content.actions));
    }

    decodeResult(id: string, content: any): IQResult | null {
        const actions = ActionOperationCodec.decodeResultArray(content.actions);
        return new ResultInvokeActions(id, actions);
    }
}

