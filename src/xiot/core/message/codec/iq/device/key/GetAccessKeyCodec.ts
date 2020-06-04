import {IqCodec} from '../../../IqCodec';
import {IQQuery} from '../../../../../../..';
import {IQResult} from '../../../../../../..';
import {QueryGetAccessKey, ResultGetAccessKey} from '../../../../../../..';

export class GetAccessKeyCodec implements IqCodec {

  encodeQueryContent(query: IQQuery): any | null {
    return null;
  }

  encodeResultContent(result: IQResult): any | null {
    if (result instanceof ResultGetAccessKey) {
      return {key: result.key};
    }

    return null;
  }

  decodeQuery(id: string, content: any): IQQuery | null {
    return new QueryGetAccessKey(id);
  }

  decodeResult(id: string, content: any): IQResult | null {
    return new ResultGetAccessKey(id, content['key']);
  }
}
