import {Message} from '../../../../index';

export interface MessageCodec {

  encode(notice: Message): any;

  decode(id: string, type: string, payload: Object): Message;
}
