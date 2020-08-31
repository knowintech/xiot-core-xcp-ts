import {XcpAuthenticationType} from './common/XcpAuthenticationType';

export interface XcpClientCipher {

    getAuthenticationType(): XcpAuthenticationType;

    sign(info: Uint8Array): Promise<Uint8Array>;

    verify(info: Uint8Array, signature: Uint8Array): Promise<boolean>;
}
