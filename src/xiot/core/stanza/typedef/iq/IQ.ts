import {Stanza} from '../Stanza';
import {IQType} from './IQType';
import {StanzaType} from '../StanzaType';

export const IQ_TYPE = 'type';
export const IQ_METHOD = 'method';
export const IQ_CONTENT = 'content';

export class IQ extends Stanza {

  public type: IQType;
  public content: any;

  constructor(id: string, type: IQType) {
    super(id, StanzaType.IQ);
    this.type = type;
  }
}
