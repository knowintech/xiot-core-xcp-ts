import {IQQuery} from '../IQQuery';
import {IQResult} from '../IQResult';

export const BYEBYE_METHOD = 'urn:xiot:bye-bye';

export class QueryByebye extends IQQuery {

  constructor(id: string) {
    super(id, BYEBYE_METHOD);
  }

  public result(): ResultByebye {
    return new ResultByebye(this.id);
  }
}

export class ResultByebye extends IQResult {

  constructor(id: string) {
    super(id, BYEBYE_METHOD);
  }
}
