import {IQQuery} from '../../IQQuery';
import {IQResult} from '../../IQResult';
import {ActionOperation} from 'xiot-core-spec-ts';

export const INVOKE_ACTIONS_METHOD = 'urn:xiot:invoke-actions';

export class QueryInvokeActions extends IQQuery {

    public actions: ActionOperation[] = [];

    constructor(id: string, actions: ActionOperation[]) {
        super(id, INVOKE_ACTIONS_METHOD);
        this.actions = actions;
    }

    public result(actions: ActionOperation[]): ResultInvokeActions {
        return new ResultInvokeActions(this.id, actions);
    }
}

export class ResultInvokeActions extends IQResult {

    public actions: ActionOperation[] = [];

    constructor(id: string, actions: ActionOperation[]) {
        super(id, INVOKE_ACTIONS_METHOD);
        this.actions = actions;
    }
}
