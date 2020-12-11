import {IqCodec} from './IqCodec';
import {MessageCodec} from './MessageCodec';
import {InitializeCodec} from './iq/device/verify/InitializeCodec';
import {VerifyStartCodec} from './iq/device/verify/VerifyStartCodec';
import {VerifyFinishCodec} from './iq/device/verify/VerifyFinishCodec';
import {SetPropertiesCodec} from './iq/device/control/SetPropertiesCodec';
import {GetPropertiesCodec} from './iq/device/control/GetPropertiesCodec';
import {InvokeActionsCodec} from './iq/device/control/InvokeActionsCodec';
import {GetAccessKeyCodec} from './iq/device/key/GetAccessKeyCodec';
import {SetAccessKeyCodec} from './iq/device/key/SetAccessKeyCodec';
import {ByebyeCodec} from './iq/basic/ByebyeCodec';
import {PingCodec} from './iq/basic/PingCodec';
import {GetChildrenCodec} from './iq/device/control/GetChildrenCodec';
import {DeviceMessageCodec} from './message/device/DeviceMessageCodec';
import {GetSummariesCodec} from './iq/device/control/GetSummariesCodec';
import {GET_SUMMARIES_METHOD} from '../typedef/iq/device/control/GetSummaries';
import {BYEBYE_METHOD} from '../typedef/iq/basic/Byebye';
import {IQError} from '../typedef/iq/IQError';
import {IQQuery} from '../typedef/iq/IQQuery';
import {IQResult} from '../typedef/iq/IQResult';
import {IQType, IQTypeFromString, IQTypeToString} from '../typedef/iq/IQType';
import {IQ} from '../typedef/iq/IQ';
import {Message} from '../typedef/message/Message';
import {Stanza} from '../typedef/Stanza';
import {MESSAGE_DEVICE_TOPIC} from '../typedef/message/device/DeviceMessage';
import {VERIFY_FINISH_METHOD} from '../typedef/iq/device/verify/VerifyFinish';
import {VERIFY_START_METHOD} from '../typedef/iq/device/verify/VerifyStart';
import {INITIALIZE_METHOD} from '../typedef/iq/device/verify/Initialize';
import {SET_ACCESS_KEY_METHOD} from '../typedef/iq/device/key/SetAccessKey';
import {GET_ACCESS_KEY_METHOD} from '../typedef/iq/device/key/GetAccessKey';
import {GET_CHILDREN_METHOD} from '../typedef/iq/device/control/GetChildren';
import {INVOKE_ACTIONS_METHOD} from '../typedef/iq/device/control/InvokeActions';
import {GET_PROPERTIES_METHOD} from '../typedef/iq/device/control/GetProperties';
import {SET_PROPERTIES_METHOD} from '../typedef/iq/device/control/SetProperties';
import {PING_METHOD} from '../typedef/iq/basic/Ping';

export class StanzaCodec {

    private iqCodecs: Map<String, IqCodec>;
    private messageCodecs: Map<String, MessageCodec>;

    constructor() {
        this.iqCodecs = new Map<String, IqCodec>();
        this.messageCodecs = new Map<String, MessageCodec>();

        this.iqCodecs.set(BYEBYE_METHOD, new ByebyeCodec());
        this.iqCodecs.set(PING_METHOD, new PingCodec());

        this.iqCodecs.set(SET_PROPERTIES_METHOD, new SetPropertiesCodec());
        this.iqCodecs.set(GET_PROPERTIES_METHOD, new GetPropertiesCodec());
        this.iqCodecs.set(INVOKE_ACTIONS_METHOD, new InvokeActionsCodec());
        this.iqCodecs.set(GET_CHILDREN_METHOD, new GetChildrenCodec());
        this.iqCodecs.set(GET_SUMMARIES_METHOD, new GetSummariesCodec());

        this.iqCodecs.set(GET_ACCESS_KEY_METHOD, new GetAccessKeyCodec());
        this.iqCodecs.set(SET_ACCESS_KEY_METHOD, new SetAccessKeyCodec());

        this.iqCodecs.set(INITIALIZE_METHOD, new InitializeCodec());
        this.iqCodecs.set(VERIFY_START_METHOD, new VerifyStartCodec());
        this.iqCodecs.set(VERIFY_FINISH_METHOD, new VerifyFinishCodec());

        this.messageCodecs.set(MESSAGE_DEVICE_TOPIC, new DeviceMessageCodec());
    }

    public encode(m: Stanza): any | null {
        if (m instanceof IQ) {
            return this.encodeIQ(m);
        }

        if (m instanceof Message) {
            return this.encodeMessage(m);
        }

        return null;
    }

    private encodeIQ(iq: IQ): any | null {
        if (iq instanceof IQQuery) {
            return this.encodeQuery(iq);
        }

        if (iq instanceof IQResult) {
            return this.encodeResult(iq);
        }

        if (iq instanceof IQError) {
            return this.encodeError(iq);
        }

        return null;
    }

    private encodeQuery(query: IQQuery): any | null {
        const iq = {
            id: query.id,
            type: IQTypeToString(query.type),
            method: query.method,
        };
        this.addQueryContent(iq, query);
        return {iq: iq};
    }

    private addQueryContent(o: any, query: IQQuery) {
        const codec = this.iqCodecs.get(query.method);
        if (codec != null) {
            const content = codec.encodeQueryContent(query);
            if (content != null) {
                o['content'] = content;
            }
        }
    }

    private encodeResult(result: IQResult): any {
        const iq = {
            id: result.id,
            type: IQTypeToString(result.type),
            method: result.method,
        };
        this.addResultContent(iq, result);
        return {iq: iq};
    }

    private addResultContent(o: any, result: IQResult) {
        const codec = this.iqCodecs.get(result.method);
        if (codec != null) {
            const content = codec.encodeResultContent(result);
            if (content != null) {
                o['content'] = content;
            }
        }
    }

    private encodeError(error: IQError): any {
        const e = {
            id: error.id,
            type: IQTypeToString(error.type),
            content: {
                status: error.status,
                description: error.description
            }
        };

        return {iq: e};
    }

    private encodeMessage(m: Message): any | null {
        const codec = this.messageCodecs.get(m.topic);
        if (codec == null) {
            throw new Error('MessageCodec not found: ' + m.topic);
        }

        return {
            message: {
                id: m.id,
                topic: m.topic,
                type: m.type,
                payload: codec.encode(m),
            }
        };
    }

    public decode(string: string): Stanza | null {
        const o = JSON.parse(string);
        const iq = o['iq'];
        const message = o['message'];

        if (iq != null) {
            return this.decodeIQ(iq);
        }

        if (message != null) {
            return this.decodeMessage(message);
        }

        return null;
    }

    private decodeMessage(o: any): Message {
      const id = o.id;
      const topic = o.topic;
      const type = o.type;
      const payload = o.payload;

      const codec = this.messageCodecs.get(topic);
      if (codec == null) {
        throw new Error('invalid message: ' + topic);
      }

      return codec.decode(id, type, payload);
    }

    private decodeIQ(o: any): IQ | null {
        const id = o['id'];
        const type = o['type'];
        const method = o['method'];
        const content = o['content'];

        switch (IQTypeFromString(type)) {
            case IQType.QUERY:
                return this.decodeQuery(id, method, content);

            case IQType.RESULT:
                return this.decodeResult(id, method, content);

            case IQType.ERROR:
                return this.decodeError(id, content);

            default:
                return null;
        }
    }

    private decodeQuery(id: string, method: string, content: any): IQQuery | null {
        let query: IQQuery | null;

        const codec = this.iqCodecs.get(method);
        if (codec != null) {
            query = codec.decodeQuery(id, content);
        } else {
            query = new IQQuery(id, method);
        }

        return query;
    }

    private decodeResult(id: string, method: string, content: any): IQResult | null {
        let result: IQResult | null;

        const codec = this.iqCodecs.get(method);
        if (codec != null) {
            result = codec.decodeResult(id, content);
        } else {
            result = new IQQuery(id, method);
        }

        return result;
    }

    private decodeError(id: string, content: any): IQError | null {
        if (content != null) {
            const status = content['status'];
            const description = content['description'];
            return new IQError(id, status, description);
        }

        return null;
    }
}
