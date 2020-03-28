import {XcpClientCipher} from '../XcpClientCipher';
import {XcpAuthenticationType} from '../common/XcpAuthenticationType';
import {XcpLTSKGetter} from '../XcpLTSKGetter';
// import {sign, verify} from '@stablelib/ed25519';
import {Ed25519} from 'mipher';

export class XcpClientCipherProductImpl implements XcpClientCipher {

  constructor(private deviceType: string,
              private getter: XcpLTSKGetter,
              private serverLTPK: Uint8Array) {
  }

  getAuthenticationType(): XcpAuthenticationType {
    return XcpAuthenticationType.DEVICE_TYPE;
  }

  sign(info: Uint8Array): Uint8Array {
    const keypair = this.getter.getTypeKeyPair(this.deviceType);
    const e = new Ed25519();
    return e.sign(info, keypair.sk, keypair.pk);
    // return sign(keypair.sk, info);
  }

  verify(info: Uint8Array, signature: Uint8Array): boolean {
    const e = new Ed25519();
    return e.verify(info, this.serverLTPK, signature);
    // return verify(this.serverLTPK, info, signature);
  }
}
