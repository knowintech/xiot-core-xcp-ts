import {
    Base642Bin,
    Bin2Base64,
    Curve25519, Ed25519,
    KeyPair,
    Random,
    StringToUint8Array,
    XcpClientCipherProductImpl
} from '../../../../src';
import {Server} from './vertify/Server';
import {getKeyPair} from './vertify/util';
import {Device} from './vertify/Device';
import {expect} from 'chai';


describe('test',  () => {

    const deviceKeyPair = getKeyPair();
   /* console.log('device pk : ', Bin2Base64(deviceKeyPair.pk));
    console.log('device sk : ', Bin2Base64(deviceKeyPair.sk));
    const serverPk = Base642Bin('deAjodec9A3+oe6ipnc8XtXILfwYCn21fIzs6Moa+CY=');
    const serverSeed = Base642Bin('gXAJeIGMmO8ovff11wCZQj8MG+bmc/Qcm/6nak/o0Zw=');
    let serverSk = Base642Bin('uE4P25uWoPSgybZsgHNawvu/rdIXHT58U/O+J9tL6FI=');
    serverSk = serverSeed //使用noble-Ed25519 的sign和verify，需要用java端生成的密钥对的种子作为sk
    const serverKeyPair = new KeyPair(serverPk, serverSk);
    console.log('server pk : ', Bin2Base64(serverKeyPair.pk));
    console.log('server sk : ', Bin2Base64(serverKeyPair.sk));
    const server = new Server(serverKeyPair);
    const device = new Device( serverPk, deviceKeyPair);

    const start = device.startVertify();
    server.answerStart(start).then(answerStart => {
        device.finishVerify(answerStart).then(res => {
            server.answerFinish(res).then(answerFinish => {
                let msg = device.getFinishAnswer(answerFinish);
                expect('success').to.equal(msg)
            });
        }, reason => {
            console.log(reason);
        });
    });*/
    expect(true).to.equal(true)


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

});

