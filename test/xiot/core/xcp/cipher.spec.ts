import {Base642Bin, Bin2Base64, StringToUint8Array, XcpClientCipherProductImpl} from "../../../../src";
import {XcpLTSKGetterImpl} from "./vertify/XcpLTSKGetterImpl";
import {ChaCha20Poly1305} from "@stablelib/chacha20poly1305";
import {Server} from "./vertify/Server";
import {getKeyPair} from "./vertify/util";
import {Device} from "./vertify/Device";


describe("Cipher", async () => {

    /**
     * java code output:
     * device sign =x7GCqk2y3yMWd+eet8E69po+q1OcvVxzZIR7FU1O8IyKRAYjQibG4wSmzdrBLpMb4JFEBDuLGAfEqjGRAT0hDw==
     * device encryptedSign = wJ3vsA6mdDM5RqWl4v8pNiTHWP8h0eZWJXRX1qj2MNNEy9koeUSScuyj9r4tilgUQIZ0ThU/deNWxtcSOhCv8KZCDVdh5iVEpawTCfSarhM=
     */
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

    const deviceKeyPair = getKeyPair();
    const serverKeyPair = getKeyPair();
    const server = new Server(deviceKeyPair, serverKeyPair);
    const device = new Device(deviceKeyPair, serverKeyPair, getKeyPair());

    const start = device.startVertify();
    const answerStart = server.answerStart(start);
    const finish = device.finishVerify(answerStart);
    const answerFinish = server.answerFinish(finish);
    device.getFinishAnswer(answerFinish);
})

