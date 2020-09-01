import {XcpClientCipher} from '../XcpClientCipher';
import {XcpAuthenticationType} from '../common/XcpAuthenticationType';
import {XcpLTSKGetter} from '../XcpLTSKGetter';
import * as ed25519 from 'noble-ed25519';

export class XcpClientCipherProductImpl implements XcpClientCipher {

    private algorithm = 'RSA-SHA256';

    constructor(private deviceType: string,
                private getter: XcpLTSKGetter,
                private serverLTPK: Uint8Array) {
    }

    getAuthenticationType(): XcpAuthenticationType {
        return XcpAuthenticationType.DEVICE_TYPE;
    }

    sign(info: Uint8Array): Promise<Uint8Array> {
        const keypair = this.getter.getTypeKeyPair(this.deviceType);
        return ed25519.sign(info, keypair.sk);
    }


    verify(info: Uint8Array, signature: Uint8Array): Promise<boolean> {
        return ed25519.verify(signature, info, this.serverLTPK);
    }
}
