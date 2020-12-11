import {XcpLTSKGetter} from '../../../../../../src/xiot/core/xcp/XcpLTSKGetter';
import {KeyPair} from '../../../../../../src/xiot/core/xcp/KeyPair';
import {Base642Bin} from '../../../../../../src/xiot/core/xcp/utils/Uint8ArrayUtils';

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
