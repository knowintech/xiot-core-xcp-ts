import {
    Base642Bin,
    Bin2Base64,
    BytesJoin,
    Convert,
    Curve25519,
    Ed25519,
    KeyPair,
    StringToUint8Array,
    XcpClientCipherProductImpl
} from "../../../../../src";
import {getKeyPair} from "./util";
import bin2base64 = Convert.bin2base64;
import {XcpKeyCreator} from "../../../../../src/xiot/core/xcp/key/XcpKeyCreator";
import {XcpKeyType} from "../../../../../src/xiot/core/xcp/key/XcpKeyType";
import {ChaCha20Poly1305} from "@stablelib/chacha20poly1305";
import {XcpLTSKGetterImpl} from "./XcpLTSKGetterImpl";


export class Server {

    private deviceType = "urn:homekit-spec:device:switch:00000008:know:klpjd03w:1";

    private deviceKeyPair : KeyPair;
    private serverKeyPair : KeyPair;

    private serverLocalKeyPair : KeyPair | null = null;

    private sharedKey: Uint8Array | null = null;
    private verifyKey : Uint8Array | null = null;
    private sessionInfo : Uint8Array | null = null;

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

    answerStart(input : Map<string, object>) : Map<string, object> {
        let result = new Map<string, object>();
        console.log("---------answerStart--------");
        let devicePk = input.get("publicKey") as Uint8Array;

        this.serverLocalKeyPair = getKeyPair();

        const c = new Curve25519();
        this.sharedKey = c.scalarMult(this.serverLocalKeyPair.sk, devicePk);
        console.log("server sharedKey :" + bin2base64(this.sharedKey));

        this.verifyKey = XcpKeyCreator.create(this.sharedKey, XcpKeyType.SESSION_VERIFY_ENCRYPT_KEY);
        if (this.verifyKey == null) {
            return result;
            // console.log('VerifyKey: ', Convert.bin2base64(this.verifyKey));
        }
        console.log('server VerifyKey : ', Bin2Base64(this.verifyKey));


        this.sessionInfo = BytesJoin(this.serverLocalKeyPair.pk, devicePk);
        // console.log('SessionInfo: ', Convert.bin2base64(this.sessionInfo));
        console.log('server SessionInfo : ', Bin2Base64(this.sessionInfo));

        const e = new Ed25519();
        let serverSignature = e.sign(this.sessionInfo, this.serverKeyPair.sk, this.serverKeyPair.pk);
        console.log("server signature : " + bin2base64(serverSignature));

        const cc = new ChaCha20Poly1305(this.verifyKey);
        const encryptedSignature = cc.seal(StringToUint8Array('SV-Msg02'), serverSignature);
        console.log('device signature : ', Bin2Base64(encryptedSignature));

        result.set("serverPublicKey", this.serverLocalKeyPair.pk);
        result.set("encryptedSignature", encryptedSignature);

        return result;
    }

    answerFinish(input : Map<string, object>) : Map<string, string> {
        const result = new Map<string, string>();

        if (this.verifyKey == null) {
            return result;
        }

        if (this.sessionInfo == null) {
            return result;
        }

        const encryptedDeviceId = input.get("encryptedDeviceId") as Uint8Array;
        const encryptedDeviceType = input.get("encryptedDeviceType") as Uint8Array;
        const encryptedSign = input.get("encryptedSign") as Uint8Array;

        if (encryptedDeviceId == null || encryptedDeviceType == null || encryptedSign == null) {
            return result;
        }

        const cc = new ChaCha20Poly1305(this.verifyKey);
        const sign = cc.open(StringToUint8Array('SV-Msg03'), encryptedSign);

        const cipher = new XcpClientCipherProductImpl(this.deviceType, new XcpLTSKGetterImpl(), this.serverKeyPair.pk);
        if (cipher.verify(this.sessionInfo, sign as Uint8Array)) {
            console.log("device signature verify successed!");
            const deviceId = cc.open(StringToUint8Array('SV-Msg03'), encryptedDeviceId);
            if (deviceId != null) {
                console.log("did = " + deviceId);
            }

            const deviceType = cc.open(StringToUint8Array('SV-Msg03'), encryptedDeviceType);
            if (deviceType != null) {
                console.log("type = " + deviceType);
            }
            result.set("msg", "success");
        } else {
            result.set("msg", "error");
        }

        return result;
    }
}
