import {MessageCodec} from '../../MessageCodec';
import {DeviceRecordCodec, DeviceRecordTypeFromString} from 'xiot-core-spec-ts';
import {Message} from '../../../typedef/message/Message';
import {DeviceMessage} from '../../../typedef/message/device/DeviceMessage';

export class DeviceMessageCodec implements MessageCodec {

    private payloadCodec = new DeviceRecordCodec();

    encode(message: Message): any {
        if (message instanceof DeviceMessage) {
            return this.payloadCodec.encode(message.payload);
        }
    }

    decode(id: string, type: string, payload: Object): Message {
        const record = this.payloadCodec.decode(type, payload);
        return new DeviceMessage(id, DeviceRecordTypeFromString(type), record);
    }
}
