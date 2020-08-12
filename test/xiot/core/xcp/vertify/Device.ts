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
import {XcpClientCipher} from "../../../../../src/xiot/core/xcp/XcpClientCipher";


export class Device {

    private deviceId = '1@313';
    private deviceType = 'urn:homekit-spec:device:switch:00000008:know:klpjd03w:1';

    private deviceKeyPair: KeyPair;
    private serverKeyPair: KeyPair;

    private deviceLocalKeyPair: KeyPair;
    private cipher : XcpClientCipher;


    constructor(deviceKeyPair: KeyPair, serverKeyPair: KeyPair, deviceLocalKeyPair: KeyPair) {
        this.deviceKeyPair = deviceKeyPair;
        this.serverKeyPair = serverKeyPair;
        this.deviceLocalKeyPair = deviceLocalKeyPair;
        this.cipher = new XcpClientCipherProductImpl(this.deviceType, new XcpLTSKGetterImpl(), this.serverKeyPair.pk);
    }

    startVertify(): Map<string, string> {
        console.log('---------startVerify--------');
        const result = new Map<string, string>();
        this.deviceLocalKeyPair = getKeyPair();
        console.log('device publicKey: ' + Bin2Base64(this.deviceLocalKeyPair.pk));
        result.set('publicKey', Bin2Base64(this.deviceLocalKeyPair.pk));
        return result;
    }

    finishVerify(input: Map<string, string>): Map<string, string> {
        const result = new Map<string, string>();
        console.log('---------finishVerify--------');

        const serverPk = input.get('serverPublicKey');
        if (typeof serverPk === 'undefined') {
            return result;
        }
        const serverPublicKey = Base642Bin(serverPk);

        const s = input.get('encryptedSignature');
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
        console.log("device pub key : " + Bin2Base64(this.deviceKeyPair.pk));
        console.log("device s key : " + Bin2Base64(this.deviceKeyPair.sk));

        const cc = new ChaCha20Poly1305(verifyKey);
        const encryptedDeviceId = cc.seal(StringToUint8Array('SV-Msg03'), StringToUint8Array(this.deviceId));
        const encryptedDeviceType = cc.seal(StringToUint8Array('SV-Msg03'), StringToUint8Array(this.deviceType));
        console.log('encrypted DeviceId : ' + Bin2Base64(encryptedDeviceId));
        console.log('encrypted DeviceType ： ' + Bin2Base64(encryptedDeviceType));

        result.set('encryptedDeviceId', Bin2Base64(encryptedDeviceId));
        result.set('encryptedDeviceType', Bin2Base64(encryptedDeviceType));

        const serverSignature = cc.open(StringToUint8Array('SV-Msg02'), encryptedServerSignature);
        if (serverSignature == null) {
            console.log('decode serverSignature failed, serverSignature is null');
            throw new Error('decode serverSignature failed, serverSignature is null');
        }
        console.log("server serverSignature : " + Bin2Base64(serverSignature));

        const e = new Ed25519();
        // if (this.cipher.verify(sessionInfo, serverSignature)) {
        if (e.verify(sessionInfo, this.serverKeyPair.pk, serverSignature)){
            const signature = e.sign(sessionInfo, this.deviceKeyPair.sk, this.deviceKeyPair.pk);
            console.log('device signature: ', Bin2Base64(signature));
            // const encryptedSignature = Convert.bin2base64(cc.seal(StringToUint8Array('SV-Msg03'), signature));
            // console.log('device signature: ', Convert.bin2base64(signature));
            const encryptedSignature = cc.seal(StringToUint8Array('SV-Msg03'), signature);

            result.set('encryptedSign', Bin2Base64(encryptedSignature));
        } else {
            console.log('server signature verified failed');

            console.log("-------------------------------------------------");
            const c = new Curve25519();
            const random = new Random();
            const seed = random.get(32);
            const k = c.generateKeys(seed);
            const keyPair = new KeyPair(Base642Bin("dPeZzV0P8GecYt/mn8tjzPVzaP1fCchxz0H6Xv1q7r0="), Base642Bin("CN3qzfNSIiO0zB3sF3F0sLNZpVBxFV9qwtsY5JSXOkY="));

            console.log('pk : ', Bin2Base64(keyPair.pk));
            console.log('sk : ', Bin2Base64(keyPair.sk));

            const sessionInfo = Base642Bin("FU/PQQizp7ul8j/fDbkD8SxCxiyRKjkPMcR1zZnSOV/99XbhCvtww7rK10yJU6uR/2N8Of+gxsW48hfENeZ4fA==");

            const e = new Ed25519();
            // const sign = e.sign(sessionInfo, keyPair.sk, keyPair.pk);
            const sign = Base642Bin("dy7gmRCUDI3H9ITq94fOgeta+SB2ZnM6kR96rur8dtvRctgZJ6p9MKHb83y/YVsKlk8QHgHiRFgC+IkX3IUuCg==");
            console.log("sign : " + Bin2Base64(sign));

            if (e.verify(sessionInfo, keyPair.pk, sign)) {
                console.log(1111);
            } else {
                console.log(2222);
            }
            console.log("-------------------------------------------------");

            throw new Error('server signature verified failed');
        }

        return result;
    }

    getFinishAnswer(input: Map<string, string>) {
        console.log('---------getFinishAnswer--------');
        console.log(input.get('msg'));
    }

}
