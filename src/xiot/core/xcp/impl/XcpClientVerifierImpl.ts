import {XcpClientVerifier} from '../XcpClientVerifier';
import {XcpSessionKey} from '../common/XcpSessionKey';
import {XcpClient} from '../XcpClient';
import {XcpClientCipher} from '../XcpClientCipher';
import {XcpFrameCodecType, XcpFrameCodecTypeToNumber} from '../common/XcpFrameCodecType';
import {XcpAuthenticationTypeToString} from '../common/XcpAuthenticationType';
import {KeyPair} from '../KeyPair';
import {XcpKeyCreator} from '../key/XcpKeyCreator';
import {XcpKeyType} from '../key/XcpKeyType';
import {Base642Bin, Bin2Base64, BytesJoin, StringToUint8Array} from '../utils/Uint8ArrayUtils';
import {ChaCha20Poly1305} from '@stablelib/chacha20poly1305';
import {QueryInitialize} from '../../stanza/typedef/iq/device/verify/Initialize';
import {QueryVerifyStart, ResultVerifyStart} from '../../stanza/typedef/iq/device/verify/VerifyStart';
import {IQResult} from '../../stanza/typedef/iq/IQResult';
import {IQQuery} from '../../stanza/typedef/iq/IQQuery';
import {QueryVerifyFinish, ResultVerifyFinish} from '../../stanza/typedef/iq/device/verify/VerifyFinish';
import {Curve25519, Random} from 'mipher-ts';


export class XcpClientVerifierImpl implements XcpClientVerifier {
    private sharedKey: Uint8Array | null = null;
    private verifyKey: Uint8Array | null = null;
    private sessionInfo: Uint8Array | null = null;

    constructor(private client: XcpClient,
                private version: string,
                private cipher: XcpClientCipher,
                private codec: XcpFrameCodecType) {
    }

    start(): Promise<XcpSessionKey> {
        return this.initialization()
            .then(x => this.verifyStart(x))
            .then(n => this.verifyFinish(n));
    }

    private initialization(): Promise<KeyPair> {
        const auth = XcpAuthenticationTypeToString(this.cipher.getAuthenticationType());
        const query = new QueryInitialize(this.client.getNextStanzaId(), this.version, auth);
        return this.client.sendQuery(query).then(() => this.generateKeyPair());
    }

    private generateKeyPair(): KeyPair {
        const random = new Random();
        const c = new Curve25519();
        const seed = random.get(32);
        const k = c.generateKeys(seed);
        return new KeyPair(k.pk, k.sk);
    }

    private verifyStart(keyPair: KeyPair): Promise<Uint8Array> {
        const publicKey = Bin2Base64(keyPair.pk);
        console.log('verifyStart publicKey: ' + publicKey);
        const query = new QueryVerifyStart(this.client.getNextStanzaId(), publicKey);
        return this.client.sendQuery(query).then(x => this.parseResultVerifyStart(keyPair, x));
    }

    private parseResultVerifyStart(keyPair: KeyPair, x: IQResult): Uint8Array {
        if (!(x instanceof ResultVerifyStart)) {
            throw new Error('invalid result');
        }

        const serverPublicKey = Base642Bin(x.publicKey);
        const serverEncryptedSignature = Base642Bin(x.signature);

        console.log('serverPublicKey: ', serverPublicKey);
        console.log('serverEncryptedSignature: ', serverEncryptedSignature);

        const c = new Curve25519();
        this.sharedKey = c.scalarMult(keyPair.sk, serverPublicKey);
        console.log('SharedKey: ', Bin2Base64(this.sharedKey));

        this.verifyKey = XcpKeyCreator.create(this.sharedKey, XcpKeyType.SESSION_VERIFY_ENCRYPT_KEY);
        if (this.verifyKey != null) {
            console.log('VerifyKey: ', Bin2Base64(this.verifyKey));
        }

        this.sessionInfo = BytesJoin(keyPair.pk, serverPublicKey);
        console.log('SessionInfo: ', Bin2Base64(this.sessionInfo));

        return serverEncryptedSignature;
    }

    private verifyFinish(serverEncryptedSignature: Uint8Array): Promise<XcpSessionKey> {
        if (this.verifyKey == null || this.sessionInfo == null) {
            throw new Error('invalid result');
        }

        const cc = new ChaCha20Poly1305(this.verifyKey);
        const serverSignature = cc.open(StringToUint8Array('SV-Msg02'), serverEncryptedSignature);
        if (serverSignature == null) {
            console.log('decode serverSignature failed, serverSignature is null');
            throw new Error('decode serverSignature failed, serverSignature is null');
        }

        return this.verify(this.sessionInfo, serverSignature)
            .then(x => this.sign(this.sessionInfo))
            .then(x => this.parseQueryVerifyFinish(x, cc))
            .then(x => this.client.sendQuery(x))
            .then(x => this.parseResultVerifyFinish(x));
    }

    private sign(sessionInfo: Uint8Array | null = null): Promise<Uint8Array> {
        if (sessionInfo == null) {
            return Promise.reject('sessionInfo is null');
        }

        return this.cipher.sign(sessionInfo);
    }

    private verify(sessionInfo: Uint8Array, serverSignature: Uint8Array): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            this.cipher.verify(sessionInfo, serverSignature)
                .then(x => {
                    if (x) {
                        resolve(x);
                    } else {
                        reject('server signature verify failed');
                    }
                }).catch(err => {
                console.error(err);
                reject(err);
            });
        });

    }

    private parseQueryVerifyFinish(signature: Uint8Array, cc: ChaCha20Poly1305): Promise<IQQuery> {
        const encryptedSignature = Bin2Base64(cc.seal(StringToUint8Array('SV-Msg03'), signature));
        console.log('device signature: ', Bin2Base64(signature));
        const deviceId = Bin2Base64(cc.seal(StringToUint8Array('SV-Msg03'), StringToUint8Array(this.client.getDeviceId())));
        const deviceType = Bin2Base64(cc.seal(StringToUint8Array('SV-Msg03'), StringToUint8Array(this.client.getDeviceType())));
        const id = this.client.getNextStanzaId();
        const frameCodecType = XcpFrameCodecTypeToNumber(this.codec);
        const query = new QueryVerifyFinish(id, deviceId, deviceType, encryptedSignature, frameCodecType);
        return Promise.resolve(query);
    }

    private parseResultVerifyFinish(x: IQResult): XcpSessionKey {
        if (!(x instanceof ResultVerifyFinish)) {
            throw new Error('invalid result');
        }

        if (this.sharedKey == null) {
            throw new Error('invalid result');
        }

        const outKey = XcpKeyCreator.create(this.sharedKey, XcpKeyType.DEVICE_TO_SERVER_KEY);
        if (outKey == null) {
            throw new Error('invalid result');
        }

        const inKey = XcpKeyCreator.create(this.sharedKey, XcpKeyType.SERVER_TO_DEVICE_KEY);
        if (inKey == null) {
            throw new Error('invalid result');
        }

        // console.log('outKey: ', Convert.bin2base64(outKey));
        // console.log('inKey: ', Convert.bin2base64(inKey));
        console.log('outKey: ', Bin2Base64(outKey));
        console.log('inKey: ', Bin2Base64(inKey));

        return new XcpSessionKey(this.codec, outKey, inKey);
    }
}
