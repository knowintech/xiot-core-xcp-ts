import {Base642Bin, Curve25519, KeyPair, Random, XcpLTSKGetter} from '../../../../../src';

export class XcpLTSKGetterImpl implements XcpLTSKGetter {

    private keyPair: KeyPair;

    constructor() {
        const deviceLTPK = 'mkStb3c0ji4KLVYQaGgyGO1WpBYQUmbg0j2sHhD/NF8=';
        const deviceLTSK = 'MC4zOTYwNjM5NDk3ODE0Njc2NA==';
        this.keyPair = new KeyPair(Base642Bin(deviceLTPK), Base642Bin(deviceLTSK));
    }

    getDeviceKeypair(deviceId: string): KeyPair {
        return this.keyPair;
    }

    getTypeKeyPair(deviceType: string): KeyPair {
        return this.keyPair;
    }
}
