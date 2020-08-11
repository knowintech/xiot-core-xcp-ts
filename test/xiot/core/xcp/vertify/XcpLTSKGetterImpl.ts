import {Base642Bin, Curve25519, KeyPair, Random, XcpLTSKGetter} from '../../../../../src';

export class XcpLTSKGetterImpl implements XcpLTSKGetter {

    private keyPair: KeyPair;

    constructor() {
        const deviceLTPK = 'dPeZzV0P8GecYt/mn8tjzPVzaP1fCchxz0H6Xv1q7r0=';
        const deviceLTSK = 'CN3qzfNSIiO0zB3sF3F0sLNZpVBxFV9qwtsY5JSXOkY=';
        this.keyPair = new KeyPair(Base642Bin(deviceLTPK), Base642Bin(deviceLTSK));
    }

    getDeviceKeypair(deviceId: string): KeyPair {
        return this.keyPair;
    }

    getTypeKeyPair(deviceType: string): KeyPair {
        return this.keyPair;
    }
}
