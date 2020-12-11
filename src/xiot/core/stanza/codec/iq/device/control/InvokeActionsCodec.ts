import {IqCodec} from '../../../IqCodec';
import {ActionOperationCodec} from 'xiot-core-spec-ts';
import {IQQuery} from '../../../../typedef/iq/IQQuery';
import {QueryInvokeActions, ResultInvokeActions} from '../../../../typedef/iq/device/control/InvokeActions';
import {IQResult} from '../../../../typedef/iq/IQResult';

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

