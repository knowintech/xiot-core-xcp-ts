import {IQQuery} from '../../../../index';
import {IQResult} from '../../../../index';

export interface IqCodec {

  encodeQueryContent(query: IQQuery): any | null;

  encodeResultContent(result: IQResult): any | null;

  decodeQuery(id: string, content: any): IQQuery | null;

  decodeResult(id: string, content: any): IQResult | null;
}
