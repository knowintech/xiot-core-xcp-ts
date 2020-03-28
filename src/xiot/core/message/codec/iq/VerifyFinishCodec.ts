import {IQCodec} from '../IQCodec';
import {IQQuery} from '../../typedef/iq/IQQuery';
import {IQResult} from '../../typedef/iq/IQResult';
import {QueryVerifyFinish, ResultVerifyFinish} from '../../typedef/iq/basic/VerifyFinish';

export class VerifyFinishCodec implements IQCodec {

  encodeQueryContent(query: IQQuery): any | null {
    if (query instanceof QueryVerifyFinish) {
      return {
        'device-id': query.deviceId,
        'device-type': query.deviceType,
        signature: query.signature,
        codec: query.codec
      };
    }

    return null;
  }

  encodeResultContent(result: IQResult): any | null {
    return null;
  }

  decodeQuery(id: string, content: any): IQQuery | null {
    return new QueryVerifyFinish(id,
      content['device-id'],
      content['device-type'],
      content['signature'],
      content['codec']);
  }

  decodeResult(id: string, content: any): IQResult | null {
    return new ResultVerifyFinish(id);
  }
}
