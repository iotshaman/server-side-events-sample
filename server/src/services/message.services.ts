import { inject, injectable } from 'inversify';
import { Request, Response } from 'express';

import { MessageSource } from '../models/message-source';
import { SystemMessage } from '../models/messages/system-message';
import { ILogger } from '../logger';
import { TYPES } from '../composition/app.composition.types';

export interface IMessageService {
  CreateMessageSource: (name: string) => void;
  AttachListener: (sourceName: string, req: Request, res: Response) => void;
  SendMessage: <T = any>(sourceName: string, topic: string, payload: T) => void;
  RemoveMessageSource: (sourceName: string) => void;
}

@injectable()
export class MessageService implements IMessageService {
  
  private sources: MessageSource[];

  constructor(@inject(TYPES.Logger) private logger: ILogger) {
    this.sources = [];
    setInterval(_ => this.keepAlive(), 25000);
  }

  CreateMessageSource = (name: string): void => {
    this.sources.push(new MessageSource(name));
    this.logger.write(`Message source '${name}' created.`);
  }

  AttachListener = (sourceName: string, req: Request, res: Response): void => {
    let source = this.sources.find(s => s.sourceName == sourceName);
    if (!source) throw new Error(`Invalid source name: ${sourceName}`);
    this.checkMaxAllowedListeners();
    let listenerId = source.AddListener(res);
    this.logger.write(`Message source listener '${listenerId}' added (Source: '${sourceName}').`);
    req.on("close", () => {
      this.logger.write(`Removing message source listener '${listenerId}' (Source: '${sourceName}').`);
      source.RemoveListener(listenerId);
    });
  }

  SendMessage = <T = any>(sourceName: string, topic: string, payload: T): void => {
    let source = this.sources.find(s => s.sourceName == sourceName);
    if (!source) throw new Error(`Invalid source name: ${sourceName}`);
    source.SendMessage(topic, payload);
  }

  RemoveMessageSource = (sourceName: string): void => {
    let index = this.sources.findIndex(s => s.sourceName == sourceName);
    if (index <= -1) throw new Error(`Invalid source name: ${sourceName}`);
    this.logger.write(`Removing message source '${sourceName}'.`);
    this.sources[index].Destroy();
    this.sources = this.sources.filter((_, i) => i != index);  
  }

  private keepAlive = () => {
    this.sources.map(s => s.sourceName).forEach(id => {
      this.SendMessage<SystemMessage>(id, 'sys', {type: 'keep-alive'});
    });
  }

  private checkMaxAllowedListeners = () => {
    let count = this.sources.reduce((a, b) => a + b.listenerCount, 0);
    if (count >= 6) throw new Error("Too many connections, please close other tabs or try again.");
  }

}