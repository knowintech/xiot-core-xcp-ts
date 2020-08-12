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

    private deviceKeyPair: KeyPair;
    private serverKeyPair: KeyPair;

    private serverLocalKeyPair: KeyPair | null = null;

    private sharedKey: Uint8Array | null = null;
    private verifyKey: Uint8Array | null = null;
    private sessionInfo: Uint8Array | null = null;

    constructor(deviceKeyPair: KeyPair, serverKeyPair: KeyPair) {
        this.deviceKeyPair = deviceKeyPair;
        this.serverKeyPair = serverKeyPair;
    }


    getDeviceKeyPair(): KeyPair {
        return this.deviceKeyPair;
    }

    getServerKeyPair(): KeyPair {
        return this.serverKeyPair;
    }

    answerStart(input: Map<string, string>): Map<string, string> {
        const result = new Map<string, string>();
        console.log('---------answerStart--------');
        const devicePk = input.get('publicKey');
        if (typeof devicePk === 'undefined') {
            return result;
        }

        const devicePublicKey = Base642Bin(devicePk);

        this.serverLocalKeyPair = getKeyPair();

        const c = new Curve25519();
        this.sharedKey = c.scalarMult(this.serverLocalKeyPair.sk, devicePublicKey);
        console.log('server sharedKey :' + Bin2Base64(this.sharedKey));

        this.verifyKey = XcpKeyCreator.create(this.sharedKey, XcpKeyType.SESSION_VERIFY_ENCRYPT_KEY);
        if (this.verifyKey == null) {
            return result;
            // console.log('VerifyKey: ', Convert.bin2base64(this.verifyKey));
        }
        console.log('server VerifyKey : ', Bin2Base64(this.verifyKey));


        this.sessionInfo = BytesJoin(devicePublicKey, this.serverLocalKeyPair.pk);
        // console.log('SessionInfo: ', Convert.bin2base64(this.sessionInfo));
        console.log('SessionInfo : ', Bin2Base64(this.sessionInfo));

        const e = new Ed25519();
        const serverSignature = e.sign(this.sessionInfo, this.serverKeyPair.sk, this.serverKeyPair.pk);
        console.log('server signature : ' + Bin2Base64(serverSignature));

        const cc = new ChaCha20Poly1305(this.verifyKey);
        const encryptedSignature = cc.seal(StringToUint8Array('SV-Msg02'), serverSignature);
        console.log('server encryptedSignature : ', Bin2Base64(encryptedSignature));

        result.set('serverPublicKey', Bin2Base64(this.serverLocalKeyPair.pk));
        result.set('encryptedSignature', Bin2Base64(encryptedSignature));

        return result;
    }

    answerFinish(input: Map<string, string>): Map<string, string> {
        console.log("---------answerFinish--------");
        const result = new Map<string, string>();

        if (this.verifyKey == null) {
            return result;
        }

        if (this.sessionInfo == null) {
            return result;
        }

        const encryptedDeviceId = input.get('encryptedDeviceId');
        if (typeof encryptedDeviceId === 'undefined') {
            return result;
        }
        const encDeviceId = StringToUint8Array(encryptedDeviceId);

        const encryptedDeviceType = input.get('encryptedDeviceType');
        if (typeof encryptedDeviceType === 'undefined') {
            return result;
        }
        const encDeviceType = StringToUint8Array(encryptedDeviceType);

        const encryptedSign = input.get('encryptedSign');
        if (typeof encryptedSign === 'undefined') {
            return result;
        }
        console.log("device encryptedSign : " + encryptedSign);
        const encSign = Base642Bin(encryptedSign);

        if (encDeviceId == null || encDeviceType == null || encSign == null) {
            return result;
        }

        const cc = new ChaCha20Poly1305(this.verifyKey);
        const sign = cc.open(StringToUint8Array('SV-Msg03'), encSign);
        if (sign == null) {
            return result;
        }
        console.log("device signature : " + Bin2Base64(sign));
        console.log("sessionInfo : " + Bin2Base64(this.sessionInfo));
        console.log(("device public key : " + Bin2Base64(this.deviceKeyPair.pk)));

        const getter = new XcpLTSKGetterImpl();

        const e = new Ed25519();
        if (e.verify(this.sessionInfo, this.deviceKeyPair.pk, sign)) {
        // if (true) {
            console.log('device signature verify successed!');
            const deviceId = cc.open(StringToUint8Array('SV-Msg03'), encDeviceId);
            if (deviceId != null) {
                console.log('did = ' + Bin2Base64(deviceId));
            }

            const deviceType = cc.open(StringToUint8Array('SV-Msg03'), encDeviceType);
            if (deviceType != null) {
                console.log('type = ' + Bin2Base64(deviceType));
            }
            result.set('msg', 'success');
        } else {
            result.set('msg', 'error');
        }

        return result;
    }
}
