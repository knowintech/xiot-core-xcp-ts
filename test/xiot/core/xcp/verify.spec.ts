import {
    Base642Bin,
    Bin2Base64,
    KeyPair,
} from '../../../../src';
import {Server} from './vertify/Server';
import {getKeyPair} from './vertify/util';
import {Device} from './vertify/Device';
import {expect} from 'chai';
import ITestCallbackContext = Mocha.ITestCallbackContext;


describe('test', (this: ITestCallbackContext) => {
    it('verify',   (done) => {
        const deviceKeyPair = getKeyPair();
        console.log('device pk : ', Bin2Base64(deviceKeyPair.pk));
        console.log('device sk : ', Bin2Base64(deviceKeyPair.sk));
        const serverPk = Base642Bin('deAjodec9A3+oe6ipnc8XtXILfwYCn21fIzs6Moa+CY=');
        const serverSeed = Base642Bin('gXAJeIGMmO8ovff11wCZQj8MG+bmc/Qcm/6nak/o0Zw=');
        let serverSk = Base642Bin('uE4P25uWoPSgybZsgHNawvu/rdIXHT58U/O+J9tL6FI=');
        serverSk = serverSeed; //使用noble-Ed25519 的sign和verify，需要用java端生成的密钥对的种子作为sk
        const serverKeyPair = new KeyPair(serverPk, serverSk);
        console.log('server pk : ', Bin2Base64(serverKeyPair.pk));
        console.log('server sk : ', Bin2Base64(serverKeyPair.sk));
        const server = new Server(serverKeyPair);
        const device = new Device(serverPk, deviceKeyPair);
        return test(server, device).then(x => expect(x).to.be.equals('success'));
    });
});

function test(server: Server, device: Device): Promise<string> {
    return new Promise<string>((resolve, reject) => {
        const start = device.startVertify();
        server.answerStart(start).then(answerStart => {
            device.finishVerify(answerStart).then(res => {
                server.answerFinish(res).then(answerFinish => {
                    let msg = device.getFinishAnswer(answerFinish);
                    resolve(msg);
                });
            }, reason => {
                console.log(reason);
                reject(reason);
            });
        });
    });
}
