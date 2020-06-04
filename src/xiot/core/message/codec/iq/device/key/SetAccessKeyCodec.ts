import {IqCodec} from '../../../IqCodec';
import {IQQuery} from '../../../../typedef/iq/IQQuery';
import {IQResult} from '../../../../typedef/iq/IQResult';
import {QuerySetAccessKey, ResultSetAccessKey} from '../../../../typedef/iq/device/key/SetAccessKey';

export class SetAccessKeyCodec implements IqCodec {

  encodeQueryContent(query: IQQuery): any | null {
    if (query instanceof QuerySetAccessKey) {
      return {
        key: query.key
      };
    }

    return null;
  }

  encodeResultContent(query: IQResult): any | null {
    return null;
  }

  decodeQuery(id: string, content: any): IQQuery | null {
    return new QuerySetAccessKey(id, content['key']);
  }

  decodeResult(id: string, content: any): IQResult | null {
    return new ResultSetAccessKey(id);
  }
}

