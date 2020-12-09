import {
    Base642Bin,
    Bin2Base64,
    BytesJoin,
    Convert,
    Curve25519,
    Ed25519,
    KeyPair,
    StringToUint8Array,
    XcpClientCipherProductImpl, XcpLTSKGetter
} from '../../../../../src';
import {getKeyPair} from './util';
import bin2base64 = Convert.bin2base64;
import {XcpKeyCreator} from '../../../../../src/xiot/core/xcp/key/XcpKeyCreator';
import {XcpKeyType} from '../../../../../src/xiot/core/xcp/key/XcpKeyType';
import {ChaCha20Poly1305} from '@stablelib/chacha20poly1305';
import {XcpLTSKGetterImpl} from './XcpLTSKGetterImpl';

export class Server {

    private deviceType = 'urn:homekit-spec:device:switch:00000008:know:klpjd03w:1';

    private serverKeyPair: KeyPair;

    private serverLocalKeyPair: KeyPair | null = null;

    private sharedKey: Uint8Array | null = null;
    private verifyKey: Uint8Array | null = null;
    private sessionInfo: Uint8Array | null = null;

    constructor(serverKeyPair: KeyPair) {
        this.serverKeyPair = serverKeyPair;
    }

    getServerKeyPair(): KeyPair {
        return this.serverKeyPair;
    }

    answerStart(input: Map<string, string>): Promise<Map<string, string>> {
        return new Promise((resolve, reject) => {
            const result = new Map<string, string>();
            console.log('---------answerStart--------');
            const devicePk = input.get('publicKey');
            if (typeof devicePk === 'undefined') {
                reject('devicePK undefined');
                return;
            }

            const devicePublicKey = Base642Bin(devicePk);

            this.serverLocalKeyPair = getKeyPair();
            console.log('serverPublicKey: ', Bin2Base64(this.serverLocalKeyPair.pk));
            console.log('serverPrivateKey: ', Bin2Base64(this.serverLocalKeyPair.sk));

            const c = new Curve25519();
            this.sharedKey = c.scalarMult(this.serverLocalKeyPair.sk, devicePublicKey);
            console.log('server sharedKey :' + Bin2Base64(this.sharedKey));

            this.verifyKey = XcpKeyCreator.create(this.sharedKey, XcpKeyType.SESSION_VERIFY_ENCRYPT_KEY);
            if (this.verifyKey == null) {
                reject('verifyKey undefined');
                return;
            }

            console.log('server VerifyKey : ', Bin2Base64(this.verifyKey));


            this.sessionInfo = BytesJoin(devicePublicKey, this.serverLocalKeyPair.pk);
            // console.log('SessionInfo: ', Convert.bin2base64(this.sessionInfo));
            console.log('SessionInfo : ', Bin2Base64(this.sessionInfo));
            const ed = new Ed25519();
            const serverSignature = ed.sign(this.sessionInfo, this.serverKeyPair.sk, this.serverKeyPair.pk);
            console.log('server signature : ' + Bin2Base64(serverSignature));
            const cc = new ChaCha20Poly1305(this.verifyKey);
            const encryptedSignature = cc.seal(StringToUint8Array('SV-Msg02'), serverSignature);
            console.log('server encryptedSignature : ', Bin2Base64(encryptedSignature));

            result.set('serverPublicKey', Bin2Base64(this.serverLocalKeyPair.pk));
            result.set('encryptedSignature', Bin2Base64(encryptedSignature));
            resolve(result);
        });
    }

    answerFinish(input: Map<string, string>): Promise<Map<string, string>> {
        console.log('---------answerFinish--------');
        return new Promise<Map<string, string>>((resolve, reject) => {
            const result = new Map<string, string>();

            if (this.verifyKey == null) {
                reject('verifyKey is null');
                return;
            }

            if (this.sessionInfo == null) {
                reject('sessionInfo is null');
                return;
            }

            const deviceLtpk = input.get('deviceLtpk');
            if (!deviceLtpk) {
                reject('deviceLtpk is null');
                return;
            }

            const encryptedDeviceId = input.get('encryptedDeviceId');
            if (typeof encryptedDeviceId === 'undefined') {
                reject('encryptedDeviceId is null');
                return;
            }

            const encDeviceId = StringToUint8Array(encryptedDeviceId);

            const encryptedDeviceType = input.get('encryptedDeviceType');
            if (typeof encryptedDeviceType === 'undefined') {
                reject('encryptedDeviceType is null');
                return;
            }

            const encDeviceType = StringToUint8Array(encryptedDeviceType);

            const encryptedSign = input.get('encryptedSign');
            if (typeof encryptedSign === 'undefined') {
                reject('encryptedDeviceType is null');
                return;
            }

            console.log('device encryptedSign : ' + encryptedSign);
            const encSign = Base642Bin(encryptedSign);

            if (encDeviceId == null || encDeviceType == null || encSign == null) {
                reject('encDeviceId || encDeviceType || encSign is null');
                return;
            }

            const cc = new ChaCha20Poly1305(this.verifyKey);
            const sign = cc.open(StringToUint8Array('SV-Msg03'), encSign);
            if (sign == null) {
                reject('sign is null');
                return;
            }

            console.log('device signature : ' + Bin2Base64(sign));
            console.log('sessionInfo : ' + Bin2Base64(this.sessionInfo));
            const ed = new Ed25519();
            const res = ed.verify(this.sessionInfo, Base642Bin(deviceLtpk), sign);
                if (res) {
                    result.set('msg', 'success');
                } else {
                    result.set('msg', 'error');
                }

                resolve(result);
        });

    }
}
