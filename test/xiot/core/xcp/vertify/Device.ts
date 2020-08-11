import {
    Base642Bin,
    Bin2Base64,
    BytesJoin,
    Curve25519,
    KeyPair,
    StringToUint8Array,
    XcpClientCipherProductImpl
} from '../../../../../src';
import {XcpLTSKGetterImpl} from './XcpLTSKGetterImpl';
import {getKeyPair} from './util';
import {XcpKeyCreator} from '../../../../../src/xiot/core/xcp/key/XcpKeyCreator';
import {XcpKeyType} from '../../../../../src/xiot/core/xcp/key/XcpKeyType';
import {ChaCha20Poly1305} from '@stablelib/chacha20poly1305';


export class Device {

    private deviceId = '1@313';
    private deviceType = 'urn:homekit-spec:device:switch:00000008:know:klpjd03w:1';

    private deviceKeyPair: KeyPair;
    private serverKeyPair: KeyPair;

    public deviceLocalKeyPair: KeyPair;

    constructor(deviceKeyPair: KeyPair, serverKeyPair: KeyPair, deviceLocalKeyPair: KeyPair) {
        this.deviceKeyPair = deviceKeyPair;
        this.serverKeyPair = serverKeyPair;
        this.deviceLocalKeyPair = deviceLocalKeyPair;
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
        console.log('server SessionInfo : ', Bin2Base64(sessionInfo));

        const cc = new ChaCha20Poly1305(verifyKey);
        const encryptedDeviceId = cc.seal(StringToUint8Array('SV-Msg03'), Base642Bin(this.deviceId));
        const encryptedDeviceType = cc.seal(StringToUint8Array('SV-Msg03'), Base642Bin(this.deviceType));
        console.log('encrypted DeviceId : ' + Bin2Base64(encryptedDeviceId));
        console.log('encrypted DeviceType ： ' + Bin2Base64(encryptedDeviceType));

        result.set('encryptedDeviceId', Bin2Base64(encryptedDeviceId));
        result.set('encryptedDeviceType', Bin2Base64(encryptedDeviceType));

        const serverSignature = cc.open(StringToUint8Array('SV-Msg02'), encryptedServerSignature);
        if (serverSignature == null) {
            console.log('decode serverSignature failed, serverSignature is null');
            throw new Error('decode serverSignature failed, serverSignature is null');
        }

        const cipher = new XcpClientCipherProductImpl(this.deviceType, new XcpLTSKGetterImpl(), this.serverKeyPair.pk);
        if (!cipher.verify(sessionInfo, serverSignature)) {
            console.log('server signature verified failed');
            throw new Error('server signature verified failed');
        }

        const signature = cipher.sign(sessionInfo);
        // const encryptedSignature = Convert.bin2base64(cc.seal(StringToUint8Array('SV-Msg03'), signature));
        // console.log('device signature: ', Convert.bin2base64(signature));
        const encryptedSignature = cc.seal(StringToUint8Array('SV-Msg03'), signature);
        console.log('device signature: ', Bin2Base64(signature));

        result.set('encryptedSign', Bin2Base64(encryptedSignature));
        return result;
    }

    getFinishAnswer(input: Map<string, string>) {
        console.log('---------getFinishAnswer--------');
        console.log(input.get('msg'));
    }
}
