import {XcpClient} from '../XcpClient';
import {XcpClientVerifier} from '../XcpClientVerifier';
import {XcpClientVerifierImpl} from './XcpClientVerifierImpl';
import {XcpClientCipher} from '../XcpClientCipher';
import {WebSocketBinaryFrameCodecImpl} from '../codec/WebSocketBinaryFrameCodecImpl';
import {BinaryFrameCodec} from '../BinaryFrameCodec';
import {Status} from 'xiot-core-spec-ts';
import {StanzaCodec} from '../../stanza/codec/StanzaCodec';
import {IQResult} from '../../stanza/typedef/iq/IQResult';
import {IQError} from '../../stanza/typedef/iq/IQError';
import {IQQuery} from '../../stanza/typedef/iq/IQQuery';
import {XcpFrameCodecType} from '../common/XcpFrameCodecType';
import {Message} from '../../stanza/typedef/message/Message';
import {Stanza} from '../../stanza/typedef/Stanza';
import {Utf8ArrayToStr} from '../utils/Uint8ArrayUtils';
import {IQ} from '../../stanza/typedef/iq/IQ';
import {IQType} from '../../stanza/typedef/iq/IQType';
import {XcpSessionKey} from '../common/XcpSessionKey';

export class XcpClientBase implements XcpClient {

    private ws: WebSocket | null = null;
    private did: string;
    private type: string;
    private verifier: XcpClientVerifier | null = null;
    private verified = false;
    private frameCodec: BinaryFrameCodec | null = null;
    private messageCodec: StanzaCodec;
    private resultHandlers: Map<string, (result: IQResult | null, error: IQError | null) => void>;
    private queryHandlers: Map<string, (query: IQQuery) => void>;
    private messageId = 1;
    private verifyHandler: (result: boolean, error?: IQError) => void = () => {};
    private disconnectHandler: () => void = () => {};

    constructor(serialNumber: string,
                productId: number,
                type: string,
                private cipher: XcpClientCipher,
                private codec: XcpFrameCodecType) {
        this.did = serialNumber + '@' + productId;
        this.type = type;
        this.messageCodec = new StanzaCodec();
        this.resultHandlers = new Map<string, (result: IQResult | null, error: IQError | null) => void>();
        this.queryHandlers = new Map<string, (query: IQQuery) => void>();
    }

    protected createWebSocket(url: string): any {
        // this.ws = new WebSocket(url);
        throw Error('createWebSocket failed !');
    }

    connect(host: string, port: number, uri: string): Promise<void> {
        const url = 'ws://' + host + ':' + port + uri;
        console.log('connect: ' + url);

        this.ws = this.createWebSocket(url);
        if (this.ws == null) {
            throw Error('new WebSocket Failed!');
        }

        this.ws.addEventListener('open', () => this.onConnected());
        this.ws.addEventListener('close', () => this.onDisconnect());
        this.ws.addEventListener('error', () => this.onError());
        this.ws.addEventListener('message', message => this.onMessage(message));

        return new Promise<void>((resolve, reject) => {
            this.verifyHandler = (result, err) => {
                if (result) {
                    resolve();
                    return;
                }

                reject(err);
            };
        });
    }

    disconnect(): void {
        if (this.ws != null) {
            this.ws.close();
        }
    }

    getDeviceId(): string {
        return this.did;
    }

    getDeviceType(): string {
        return this.type;
    }

    getNextStanzaId(): string {
        return Date.now() + '#' + this.messageId++;
    }

    addQueryHandler(method: string, handler: (query: IQQuery) => void): void {
        console.log('addQueryHandler: ', method);
        this.queryHandlers.set(method, handler);
    }

    addDisconnectHandler(handler: () => void): void {
        this.disconnectHandler = handler;
    }

    sendQuery(query: IQQuery): Promise<IQResult> {
        this.write(this.messageCodec.encode(query));
        return new Promise<IQResult>((resolve, reject) => {
            this.resultHandlers.set(query.id, (result, error) => {
                if (error != null) {
                    reject(error);
                    return;
                }

                if (result == null) {
                    return;
                }

                resolve(result);
            });
        });
    }

    sendResult(result: IQResult): void {
        this.write(this.messageCodec.encode(result));
    }

    sendError(error: IQError): void {
        this.write(this.messageCodec.encode(error));
    }

    sendMessage(message: Message): void {
      this.write(this.messageCodec.encode(message));
    }

    private onConnected(): void {
        console.log('onConnected');
        this.startVerify('1.0')
            .then(() => this.verifyHandler(true))
            .catch(e => this.verifyHandler(false, e));
    }

    private onDisconnect(): void {
        console.log('onDisconnect');
        this.ws = null;
        this.disconnectHandler();
    }

    private onError(): void {
        console.log('onError');
        this.ws = null;
    }

    private onMessage(message: any): void {
        let msg: Stanza | null = null;

        if (this.frameCodec == null) {
            console.log(Date() + ' recv text frame: ', message.data);
            msg = this.messageCodec.decode(message.data);
        } else {
            const data = this.frameCodec.decrypt(message.data);
            if (data != null) {
                const s = Utf8ArrayToStr(data);
                console.log(Date() + ' recv binary frame: ', s);
                msg = this.messageCodec.decode(s);
            }
        }

        if (msg == null) {
            return;
        }

        this.handleMessage(msg);
    }

    private handleMessage(message: Stanza) {
        if (message instanceof IQ) {
            switch (message.type) {
                case IQType.QUERY:
                    this.handleQuery(message);
                    break;

                case IQType.RESULT:
                    this.handleResult(message);
                    break;

                case IQType.ERROR:
                    this.handleError(message);
                    break;

                default:
                    console.log('invalid message: ', message);
                    break;
            }
        } else {
            console.log('message not IQ: ', message);
        }
    }

    private handleQuery(query: IQ) {
        if (!(query instanceof IQQuery)) {
            return;
        }

        const handler = this.queryHandlers.get(query.method);
        if (handler != null) {
            handler(query);
        } else {
            this.sendError(query.error(Status.UNDEFINED, 'Query Handler not found'));
        }
    }

    private handleResult(result: IQ) {
        if (!(result instanceof IQResult)) {
            return;
        }

        const handler = this.resultHandlers.get(result.id);
        if (handler != null) {
            handler(result, null);
            this.resultHandlers.delete(result.id);
        } else {
            console.log('handle for result not found: ', result.id);
        }
    }

    private handleError(error: IQ) {
        if (!(error instanceof IQError)) {
            return;
        }

        const handler = this.resultHandlers.get(error.id);
        if (handler != null) {
            this.verifyHandler(false, error);
            handler(null, error);
            this.resultHandlers.delete(error.id);
        } else {
            console.log('handle for error not found: ', error.id);
        }
    }

    private startVerify(version: string): Promise<void> {
        this.verifier = new XcpClientVerifierImpl(this, version, this.cipher, this.codec);
        return this.verifier.start().then(x => this.setXcpSessionKey(x));
    }

    private setXcpSessionKey(key: XcpSessionKey): void {
        console.log('setXcpSessionKey, codec: ', key.codec);

        if (key.codec !== XcpFrameCodecType.NOT_CRYPT) {
            this.frameCodec = new WebSocketBinaryFrameCodecImpl(key.deviceToServer, key.serverToDevice);
        }

        console.log('verify succeed!');
        this.verified = true;
    }

    private write(o: Object) {
        const s = JSON.stringify(o);
        console.log(Date() + ' write: ', s);

        if (this.ws != null) {
            this.ws.send(s);
        }
    }

}
