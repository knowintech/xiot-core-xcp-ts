import {expect} from 'chai';
import 'mocha';
import {XcpKeyCreator} from '../../../../src/xiot/core/xcp/key/XcpKeyCreator';
import {XcpKeyType} from '../../../../src/xiot/core/xcp/key/XcpKeyType';
import {ChaCha20Poly1305} from '@stablelib/chacha20poly1305';
import {XcpLTSKGetterImpl} from './impl/XcpClientVerifierImpl/XcpLTSKGetterImpl';
import {Base642Bin, Bin2Base64, BytesJoin, StringToUint8Array} from '../../../../src/xiot/core/xcp/utils/Uint8ArrayUtils';
import {XcpClientCipherProductImpl} from '../../../../src/xiot/core/xcp/impl/XcpClientCipherProductImpl';
import {Curve25519, Ed25519} from 'mipher-ts';

describe('test', () => {
    const c = new Curve25519();
    const seed = Base642Bin('mzDb6gbmzaXVqjSqSsxl17Bh33pJODTC3SBcEQSNsQo=');
    const deviceKeyPair = c.generateKeys(seed);
    console.log('privateKey: ', Bin2Base64(deviceKeyPair.sk));
    console.log('publicKey: ', Bin2Base64(deviceKeyPair.pk));

    const serverPk = Base642Bin('deAjodec9A3+oe6ipnc8XtXILfwYCn21fIzs6Moa+CY=');
    const serverPublicKey = '8C4h7Goi0rEF0/4PtLusQ52X18OBn+CZWVJsSTT58nc=';
    // tslint:disable-next-line:max-line-length
    const encryptedSignature = 'KPNQ7lvwOVZDzpX6XTeuSIHprfZ1uzTaTrh4MM5S+PItgUKwyLArcmWnhNBrYghYfzYxr1/rJliv4Zt9rzo4yZiK3Zil9j/k15BrgdH/BAo=';
    const sessionInfo = BytesJoin(deviceKeyPair.pk, Base642Bin(serverPublicKey));
    const encryptedSignatureDecoded = Base642Bin(encryptedSignature);
    const sharedKey = c.scalarMult(deviceKeyPair.sk, Base642Bin(serverPublicKey));
    console.log('deviceSharedKey: ', Bin2Base64(sharedKey));
    const verifyKey = XcpKeyCreator.create(sharedKey, XcpKeyType.SESSION_VERIFY_ENCRYPT_KEY);
    // @ts-ignore
    const cc = new ChaCha20Poly1305(verifyKey);
    const serverSignature = cc.open(StringToUint8Array('SV-Msg02'), encryptedSignatureDecoded);
    if (serverSignature == null) {
        console.log('serverSignature fail');
        return;
    }

    const getter = new XcpLTSKGetterImpl();
    const cipher = new XcpClientCipherProductImpl('a', getter, serverPk);
    const e = new Ed25519();

    cipher.verify(sessionInfo, serverSignature).then((res) => {
        if (!res) {
            return;
        }

        const sign = e.sign(sessionInfo, Base642Bin('MC4zOTYwNjM5NDk3ODE0Njc2NA=='), getter.getTypeKeyPair('aa').pk);
        console.log(sign);
        cipher.sign(sessionInfo)
            .then(signature => {
                // tslint:disable-next-line:no-shadowed-variable
                const encryptedSignature = cc.seal(StringToUint8Array('SV-Msg03'), signature);
                const encryptedType = cc.seal(StringToUint8Array('SV-Msg03'), StringToUint8Array('type'));
                console.log('encryptedSign:', Bin2Base64(encryptedSignature));
                console.log('encryptedDeviceType: ', Bin2Base64(encryptedType));
                console.log('encryptedDeviceId: ', Bin2Base64(encryptedType));
                console.log('sign: ', Bin2Base64(signature));
                const b = e.verify(sessionInfo, getter.getTypeKeyPair('aa').pk, sign);
                console.log(b);
            });
    });

    expect(true).to.equal(true);
});
