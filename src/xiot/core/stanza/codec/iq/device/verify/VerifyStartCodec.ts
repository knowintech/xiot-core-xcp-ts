import {IqCodec} from '../../../IqCodec';
import {IQQuery} from '../../../../typedef/iq/IQQuery';
import {QueryVerifyStart, ResultVerifyStart} from '../../../../typedef/iq/device/verify/VerifyStart';
import {IQResult} from '../../../../typedef/iq/IQResult';

export class VerifyStartCodec implements IqCodec {

  encodeQueryContent(query: IQQuery): any | null {
    if (query instanceof QueryVerifyStart) {
      return {'public-key': query.publicKey};
    }

    return undefined;
  }

  encodeResultContent(result: IQResult): any | null {
    if (result instanceof ResultVerifyStart) {
      return {
        'public-key': result.publicKey,
        signature: result.signature
      };
    }

    return undefined;
  }

  decodeQuery(id: string, content: any): IQQuery | null {
    return new QueryVerifyStart(id, content['public-key']);
  }

  decodeResult(id: string, content: any): IQResult | null  {
    return new ResultVerifyStart(id, content['public-key'], content['signature']);
  }
}

