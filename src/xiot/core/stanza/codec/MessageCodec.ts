import {Message} from '../typedef/message/Message';

export interface MessageCodec {

  encode(notice: Message): any;

  decode(id: string, type: string, payload: Object): Message;
}
