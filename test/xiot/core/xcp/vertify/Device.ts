import {
    Base642Bin,
    Bin2Base64,
    BytesJoin,
    Curve25519, Ed25519,
    KeyPair, Random,
    StringToUint8Array,
    XcpClientCipherProductImpl
} from '../../../../../src';
import {XcpLTSKGetterImpl} from './XcpLTSKGetterImpl';
import {getKeyPair} from './util';
import {XcpKeyCreator} from '../../../../../src/xiot/core/xcp/key/XcpKeyCreator';
import {XcpKeyType} from '../../../../../src/xiot/core/xcp/key/XcpKeyType';
import {ChaCha20Poly1305} from '@stablelib/chacha20poly1305';
import {XcpClientCipher} from '../../../../../src/xiot/core/xcp/XcpClientCipher';
import * as ed from 'noble-ed25519';


export class Device {

    private deviceId = '1@313';
    private deviceType = 'urn:homekit-spec:device:switch:00000008:know:klpjd03w:1';
    private deviceLocalKeyPair: KeyPair;
    private cipher: XcpClientCipher;
    private getter: XcpLTSKGetterImpl;


    constructor( serverLTPK: Uint8Array, deviceLocalKeyPair: KeyPair) {
        this.deviceLocalKeyPair = deviceLocalKeyPair;
        this.getter = new XcpLTSKGetterImpl();
        this.cipher = new XcpClientCipherProductImpl(this.deviceType, this.getter, serverLTPK);
    }

    startVertify(): Map<string, string> {
        console.log('---------startVerify--------');
        const result = new Map<string, string>();
        this.deviceLocalKeyPair = getKeyPair();
        console.log('device publicKey: ' + Bin2Base64(this.deviceLocalKeyPair.pk));
        result.set('publicKey', Bin2Base64(this.deviceLocalKeyPair.pk));
        return result;
    }

    finishVerify(input: Map<string, string>): Promise<Map<string, string>> {
        return new Promise<Map<string, string>>(((resolve, reject) => {
            const result = new Map<string, string>();
            console.log('---------finishVerify--------');
            const serverPk = input.get('serverPublicKey');
            if (typeof serverPk === 'undefined') {
                return result;
            }
            const serverPublicKey = Base642Bin(serverPk);

            var s = input.get('encryptedSignature');
            if (typeof s === 'undefined') {
                return result;
            }
            const encryptedServerSignature = Base642Bin(s);

            const c = new Curve25519();
            const sharedKey = c.scalarMult(this.deviceLocalKeyPair.sk, serverPublicKey);
            console.log('device sharedKey :' + Bin2Base64(sharedKey));

            const verifyKey = XcpKeyCreator.create(sharedKey, XcpKeyType.SESSION_VERIFY_ENCRYPT_KEY);
            if (verifyKey == null) {
                return result;
            }
            console.log('device vertifyKey = ' + Bin2Base64(verifyKey));

            const sessionInfo = BytesJoin(this.deviceLocalKeyPair.pk, serverPublicKey);
            // console.log('SessionInfo: ', Convert.bin2base64(this.sessionInfo));
            console.log('SessionInfo : ', Bin2Base64(sessionInfo));

            const cc = new ChaCha20Poly1305(verifyKey);
            const encryptedDeviceId = cc.seal(StringToUint8Array('SV-Msg03'), StringToUint8Array(this.deviceId));
            const encryptedDeviceType = cc.seal(StringToUint8Array('SV-Msg03'), StringToUint8Array(this.deviceType));
            console.log('encrypted DeviceId : ' + Bin2Base64(encryptedDeviceId));
            console.log('encrypted DeviceType ： ' + Bin2Base64(encryptedDeviceType));

            result.set('encryptedDeviceId', Bin2Base64(encryptedDeviceId));
            result.set('encryptedDeviceType', Bin2Base64(encryptedDeviceType));
            result.set('deviceLtpk', Bin2Base64(this.getter.getDeviceKeypair('a').pk));

            const serverSignature = cc.open(StringToUint8Array('SV-Msg02'), encryptedServerSignature);
            if (serverSignature == null) {
                console.log('decode serverSignature failed, serverSignature is null');
               reject('decode serverSignature failed, serverSignature is null');
               return ;
            }

            console.log('server serverSignature : ' + Bin2Base64(serverSignature));
            this.cipher.verify(sessionInfo, serverSignature).then(res => {
                    if (res) {
                        ed.sign(sessionInfo, this.getter.getDeviceKeypair('sdf').sk)
                            .then((signature) => {
                                console.log('device signature: ', Bin2Base64(signature));
                                // console.log('device signature: ', Convert.bin2base64(signature));
                                const encryptedSignature = cc.seal(StringToUint8Array('SV-Msg03'), signature);
                                result.set('encryptedSign', Bin2Base64(encryptedSignature));
                                resolve(result);
                            });
                    } else {
                        console.log('server signature verified failed');
                        reject('server signature verified failed');
                    }
                }
            );
        }));

    }

    getFinishAnswer(input: Map<string, string>) {
        console.log('---------getFinishAnswer--------');
        let msg = input.get('msg');
        console.log(msg);
        return msg;
    }

}
