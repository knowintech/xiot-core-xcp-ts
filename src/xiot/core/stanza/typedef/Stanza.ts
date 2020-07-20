import {StanzaType} from './StanzaType';

export const STANZA_IQ = 'iq';
export const STANZA_MESSAGE = 'message';
export const STANZA_ID = 'id';

export class Stanza {

    public stanzaType: StanzaType;
    public id: string;

    constructor(id: string, stanzaType: StanzaType) {
        this.id = id;
        this.stanzaType = stanzaType;
    }
}
