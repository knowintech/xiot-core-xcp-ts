import {Stanza} from '../Stanza';
import {StanzaType} from '../StanzaType';

export const MESSAGE_TYPE = 'type';
export const MESSAGE_TOPIC = 'topic';
export const MESSAGE_PAYLOAD = 'payload';

export class Message extends Stanza {

    public topic: string;
    public type: string;

    constructor(id: string, topic: string, type: string) {
        super(id, StanzaType.MESSAGE);
        this.topic = topic;
        this.type = type;
    }
}
