import {XcpClientCipher} from '../XcpClientCipher';
import {XcpAuthenticationType} from '../common/XcpAuthenticationType';
import {XcpLTSKGetter} from '../XcpLTSKGetter';
import {Ed25519} from 'mipher-ts';

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
        const ed25519 = new Ed25519();
        return new Promise<Uint8Array>((resolve, reject) => {
            const res = ed25519.sign(info, keypair.sk, keypair.pk);
            if (!res) {
                reject('sign error');
            } else {
                resolve(res);
            }
        });

    }

    verify(info: Uint8Array, signature: Uint8Array): Promise<boolean> {
        const ed25519 = new Ed25519();
        return new Promise<boolean>((resolve, reject) => {
            const res = ed25519.verify(info, this.serverLTPK, signature);
            if (!res) {
                reject('verify error');
            } else {
                resolve(res);
            }
        });
    }
}
