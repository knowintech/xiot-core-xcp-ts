import {expect} from 'chai';
import 'mocha';
import * as fs from 'async-file';
import {Device} from './vertify/Device';
import {Convert, Curve25519, Ed25519, Random} from '../../../../src/xiot/core/xcp/utils/mipher/dist';
import {Base642Bin, Bin2Base64, BytesJoin, StringToUint8Array, XcpClientCipherProductImpl,} from '../../../../src';
import {XcpKeyCreator} from '../../../../src/xiot/core/xcp/key/XcpKeyCreator';
import {XcpKeyType} from '../../../../src/xiot/core/xcp/key/XcpKeyType';
import {ChaCha20Poly1305} from '@stablelib/chacha20poly1305';
import base642bin = Convert.base642bin;
import {XcpLTSKGetterImpl} from './vertify/XcpLTSKGetterImpl';
describe('test',  () => {
    let c = new Curve25519();
    const seed = Base642Bin('mzDb6gbmzaXVqjSqSsxl17Bh33pJODTC3SBcEQSNsQo=');
    let deviceKeyPair = c.generateKeys(seed);
    console.log('privateKey: ', Bin2Base64(deviceKeyPair.sk));
    console.log('publicKey: ', Bin2Base64(deviceKeyPair.pk));
    const serverPk = Base642Bin('deAjodec9A3+oe6ipnc8XtXILfwYCn21fIzs6Moa+CY=');
    const serverPublicKey = '8C4h7Goi0rEF0/4PtLusQ52X18OBn+CZWVJsSTT58nc=';
    const encryptedSignature = 'KPNQ7lvwOVZDzpX6XTeuSIHprfZ1uzTaTrh4MM5S+PItgUKwyLArcmWnhNBrYghYfzYxr1/rJliv4Zt9rzo4yZiK3Zil9j/k15BrgdH/BAo=';
    const sessionInfo = BytesJoin(deviceKeyPair.pk, Base642Bin(serverPublicKey));
    const encryptedSignatureDecoded = Base642Bin(encryptedSignature);
    const sharedKey = c.scalarMult(deviceKeyPair.sk, Base642Bin(serverPublicKey));
    console.log("deviceSharedKey: ",Bin2Base64(sharedKey))
    let verifyKey = XcpKeyCreator.create(sharedKey, XcpKeyType.SESSION_VERIFY_ENCRYPT_KEY);
    const cc = new ChaCha20Poly1305(verifyKey);
    const serverSignature = cc.open(StringToUint8Array('SV-Msg02'), encryptedSignatureDecoded);
    if (serverSignature == null){
        console.log("serverSignature fail")
        return ;
    }
    let getter = new XcpLTSKGetterImpl();
    let cipher = new XcpClientCipherProductImpl("a",getter,serverPk);
    let e = new Ed25519();
    cipher.verify(sessionInfo,serverSignature).then((res) =>{
        if (!res){
            return ;
        }
        let sign = e.sign(sessionInfo, Base642Bin('MC4zOTYwNjM5NDk3ODE0Njc2NA=='), getter.getTypeKeyPair('aa').pk);
        console.log(sign)
        cipher.sign(sessionInfo)
            .then(signature =>{
                const encryptedSignature = cc.seal(StringToUint8Array('SV-Msg03'), signature);
                const encryptedType = cc.seal(StringToUint8Array('SV-Msg03'), StringToUint8Array('type'));
                console.log('encryptedSign:', Bin2Base64(encryptedSignature));
                console.log('encryptedDeviceType: ', Bin2Base64(encryptedType));
                console.log('encryptedDeviceId: ', Bin2Base64(encryptedType));
                console.log('sign: ', Bin2Base64(signature));
                let b = e.verify(sessionInfo, getter.getTypeKeyPair('aa').pk, sign);
                console.log(b);

            });
        /*ed.verify(sign, sessionInfo, getter.getTypeKeyPair('aa').pk).then((res) => {
            console.log("server signature verify: ",res)
            console.log('sessionInfo: ', Bin2Base64(sessionInfo));
        });*/
    });
    expect(true).to.equal(true);
});

    // const deviceKeyPair = getKeyPair();
    // console.log('device pk : ', Bin2Base64(deviceKeyPair.pk));
    // console.log('device sk : ', Bin2Base64(deviceKeyPair.sk));
    // const serverPk = Base642Bin('/8meBcfecxNl7pMIO0Zxbhx70A4DSGio7C2H7VzZLB8=');
    // const serverSk = Base642Bin('SJzNn9Xhnh8u2cW9hGUWXbDKF206/frAmzwMSDMSpmY=');
    // const serverKeyPair = new KeyPair(serverPk, serverSk);
    // console.log('server pk : ', Bin2Base64(serverKeyPair.pk));
    // console.log('server sk : ', Bin2Base64(serverKeyPair.sk));
    // const server = new Server(deviceKeyPair, serverKeyPair);
    //
    // const start = device.startVertify();
    // const answerStart = server.answerStart(start);
    // const finish = device.finishVerify(answerStart);
    // const answerFinish = server.answerFinish(finish);
    // device.getFinishAnswer(answerFinish);

    // const deviceType = "urn:homekit-spec:device:switch:00000008:know:klpjd03w:1";
    // const getter = new XcpLTSKGetterImpl();
    // const serverLTPK = Base642Bin("/8meBcfecxNl7pMIO0Zxbhx70A4DSGio7C2H7VzZLB8=");
    // const cipher = new XcpClientCipherProductImpl(deviceType, getter, serverLTPK);
    //
    // const sessionInfo = Base642Bin("5HxQNw3qbnTA5gkJurIAA4YxBHtrZA6/IzkL/en9imwjzHQieF8LM2ptmEzsBTYX0jSz3A3nmt6zrOV+M4BxSA==");
    // const signature = cipher.sign(sessionInfo);
    // console.log('device signature: ', Bin2Base64(signature));
    //
    // const verifyKey = Base642Bin("DrC/i0b+PpNvazdc58e65zErz+pwMqe+6nWTsp1LJdg=");
    // const cc = new ChaCha20Poly1305(verifyKey);
    // const encryptedSignature = Bin2Base64(cc.seal(StringToUint8Array('SV-Msg03'), signature));
    // console.log('device encrypteSignature: ', encryptedSignature);

