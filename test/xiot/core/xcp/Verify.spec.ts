import {Server} from './impl/XcpClientVerifierImpl/Server';
import {Device} from './impl/XcpClientVerifierImpl/Device';
import ITestCallbackContext = Mocha.ITestCallbackContext;

describe('test', (this: ITestCallbackContext) => {
    it('verify', (done) => {
        done();
    });
});

function test(server: Server, device: Device): Promise<string> {
    return new Promise<string>((resolve, reject) => {
        const start = device.startVertify();
        server.answerStart(start).then(answerStart => {
            device.finishVerify(answerStart).then(res => {
                server.answerFinish(res).then(answerFinish => {
                    const msg = device.getFinishAnswer(answerFinish);
                    resolve(msg);
                });
            }, reason => {
                console.log(reason);
                reject(reason);
            });
        });
    });
}
