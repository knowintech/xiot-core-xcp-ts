import {Message} from '../Message';
import {DeviceRecord, DeviceRecordType, DeviceRecordTypeFromString, DeviceRecordTypeToString} from 'xiot-core-spec-ts';

export const MESSAGE_DEVICE_TOPIC = 'urn:xiot:device';

export class DeviceMessage extends Message {

    public payload: DeviceRecord;

    constructor(id: string, type: DeviceRecordType, payload: DeviceRecord) {
        super(id, MESSAGE_DEVICE_TOPIC, DeviceRecordTypeToString(type));
        this.payload = payload;
    }

    public payloadType(): DeviceRecordType {
        return DeviceRecordTypeFromString(this.type);
    }
}
