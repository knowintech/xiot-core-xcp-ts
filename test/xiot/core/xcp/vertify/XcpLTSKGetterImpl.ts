import {Base642Bin, Curve25519, KeyPair, Random, XcpLTSKGetter} from "../../../../../src";

export class XcpLTSKGetterImpl implements XcpLTSKGetter{

    private keyPair : KeyPair;

    constructor() {
        this.keyPair = new KeyPair(Base642Bin("dPeZzV0P8GecYt/mn8tjzPVzaP1fCchxz0H6Xv1q7r0="), Base642Bin("CN3qzfNSIiO0zB3sF3F0sLNZpVBxFV9qwtsY5JSXOkY="));
    }

    getDeviceKeypair(deviceId: string): KeyPair {
        return this.keyPair;
    }

    getTypeKeyPair(deviceType: string): KeyPair {
        return this.keyPair;
    }
}
