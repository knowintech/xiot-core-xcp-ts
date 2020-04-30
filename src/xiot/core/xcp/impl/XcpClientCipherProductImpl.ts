import {XcpClientCipher} from '../XcpClientCipher';
import {XcpAuthenticationType} from '../common/XcpAuthenticationType';
import {XcpLTSKGetter} from '../XcpLTSKGetter';
 import {Ed25519} from 'mipher';
// import * as fs from 'fs';
// import * as crypto from 'crypto';


export class XcpClientCipherProductImpl implements XcpClientCipher {

    private  algorithm = 'RSA-SHA256';
    constructor(private deviceType: string,
                private getter: XcpLTSKGetter,
                private serverLTPK: Uint8Array) {
    }
    getAuthenticationType(): XcpAuthenticationType {
        return XcpAuthenticationType.DEVICE_TYPE;
    }

    sign(info: Uint8Array): Uint8Array {
         const keypair = this.getter.getTypeKeyPair(this.deviceType);

     /*   const key  = 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';  // 密钥
        const iv   = '1234567812345678';
        const encrypted = this.getAesString(info, key, iv); // 密文
        const encryptedInfo = CryptoJS.enc.Utf8.parse(encrypted);
        return encryptedInfo;*/

        const e = new Ed25519();
        return e.sign(info, keypair.sk, keypair.pk);


        // return sign(keypair.sk, info);

       // const signInfo = crypto.createSign(this.algorithm);
       //  signInfo.update(info);
       //  const privatePem = fs.readFileSync('server.pem');
       //  const pubkey = privatePem.toString();
       //   return  StringToUint8Array( signInfo.sign(privatePem, 'hex'));
    }

    /**
     * 加密
     * @param data
     * @param key
     * @param iv
     * @returns {string}
     */
   /* getAesString( data: Uint8Array, key: String, iv: String): String {
        const Seckey  = CryptoJS.enc.Utf8.parse(key);
         const SecIv  = CryptoJS.enc.Utf8.parse(iv);
        const encrypted = CryptoJS.AES.encrypt(data, Seckey,
            {
                iv: SecIv,
                mode: CryptoJS.mode.CBC,
                padding: CryptoJS.pad.Pkcs7
            });
        return encrypted.toString();    // 返回的是base64格式的密文
    }*/

    /**
     * 解密
     * @param {String} encrypted
     * @param {string} key
     * @param {string} iv
     * @returns {string}
     */
  /* getDAesString(encrypted: String, key: string, iv: string): string {
        const Serkey  = CryptoJS.enc.Utf8.parse(key);
        const  Seriv   = CryptoJS.enc.Utf8.parse(iv);
        const decrypted = CryptoJS.AES.decrypt(encrypted, Serkey,
            {
                iv: Seriv,
                mode: CryptoJS.mode.CBC,
                padding: CryptoJS.pad.Pkcs7
            });
        return decrypted.toString(CryptoJS.enc.Utf8);
    }*/






    verify(info: Uint8Array, signature: Uint8Array): boolean {
        const key  = 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
        const  iv   = '1234567812345678';
        // const  decryptedStr = this.getDAesString( info , key, iv);
        // return decryptedStr;

         const e = new Ed25519();
        return e.verify(info, this.serverLTPK, signature);


        // return verify(this.serverLTPK, info, signature);

       /* const verifyInfo = crypto.createVerify(this.algorithm);
        verifyInfo.update(info);
        const publicPem = fs.readFileSync('cert.pem');
        const sig = this.sign(info);
        return verifyInfo.verify(publicPem.toString(), Unit8ArrayToString(sig), 'hex');*/




    }
}
