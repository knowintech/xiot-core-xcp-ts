import {KeyPair} from './KeyPair';

export interface XcpLTSKGetter {

  getDeviceKeypair(deviceId: string): KeyPair;

  getTypeKeyPair(deviceType: string): KeyPair;
}
