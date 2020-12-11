import {IqCodec} from '../../../IqCodec';
import {IQQuery} from '../../../../typedef/iq/IQQuery';
import {QueryInitialize, ResultInitialize} from '../../../../typedef/iq/device/verify/Initialize';
import {IQResult} from '../../../../typedef/iq/IQResult';

export class InitializeCodec implements IqCodec {

  encodeQueryContent(query: IQQuery): any | null {
    if (query instanceof QueryInitialize) {
      return {
        version: query.version,
        authentication: query.authentication
      };
    }

    return null;
  }

  encodeResultContent(query: IQResult): any | null {
    return null;
  }

  decodeQuery(id: string, content: any): IQQuery | null {
    if (content == null) {
      return null;
    }

    const version = content['version'];
    const authentication = content['authentication'];
    return new QueryInitialize(id, version, authentication);
  }

  decodeResult(id: string, content: any): IQResult | null {
    return new ResultInitialize(id);
  }
}
