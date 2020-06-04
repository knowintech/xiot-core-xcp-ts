import {IQError, IQQuery, IQResult, Message} from '../../..';

export interface XcpClient {

  connect(host: string, port: number, uri: string): Promise<void>;

  disconnect(): void;

  getDeviceId(): string;

  getDeviceType(): string;

  getNextStanzaId(): string;

  addQueryHandler(method: string, handler: (query: IQQuery) => void): void;

  addDisconnectHandler(handler: () => void): void;

  sendQuery(query: IQQuery): Promise<IQResult>;

  sendResult(result: IQResult): void;

  sendError(error: IQError): void;

  sendMessage(message: Message): void;
}
