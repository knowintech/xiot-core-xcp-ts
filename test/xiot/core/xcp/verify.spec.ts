import {Base642Bin, Bin2Base64, KeyPair, StringToUint8Array, XcpClientCipherProductImpl} from '../../../../src';
import {Server} from './vertify/Server';
import {getKeyPair} from './vertify/util';
import {Device} from './vertify/Device';


describe('Cipher', async () => {

    const deviceKeyPair = getKeyPair();
    console.log('device pk : ', Bin2Base64(deviceKeyPair.pk));
    console.log('device sk : ', Bin2Base64(deviceKeyPair.sk));
    const serverPk = Base642Bin('/8meBcfecxNl7pMIO0Zxbhx70A4DSGio7C2H7VzZLB8=');
    const serverSk = Base642Bin('SJzNn9Xhnh8u2cW9hGUWXbDKF206/frAmzwMSDMSpmY=');
    const serverKeyPair = new KeyPair(serverPk, serverSk);
    console.log('server pk : ', Bin2Base64(serverKeyPair.pk));
    console.log('server sk : ', Bin2Base64(serverKeyPair.sk));
    const server = new Server(deviceKeyPair, serverKeyPair);
    const device = new Device(deviceKeyPair, serverKeyPair, getKeyPair());

    const start = device.startVertify();
    const answerStart = server.answerStart(start);
    const finish = device.finishVerify(answerStart);
    const answerFinish = server.answerFinish(finish);
    device.getFinishAnswer(answerFinish);

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

