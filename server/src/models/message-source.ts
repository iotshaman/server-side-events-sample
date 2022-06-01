import { Response } from 'express';
import { v4 as uuid4 } from 'uuid';

import { MessageListener } from './message-listener';
import { SystemMessage } from './messages/system-message';

export class MessageSource {

  sourceName: string;
  private listeners: MessageListener[];
  private messageCount: number;

  constructor(sourceName: string) {
    this.sourceName = sourceName;
    this.listeners = [];
    this.messageCount = 0;
  }

  get listenerCount(): number {
    return this.listeners?.length || 0;
  }

  AddListener = (res: Response): string => {
    var id = uuid4()
    res.set({
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
      "x-session": id
    });
    res.write("retry: 10000\n\n");
    let listener: MessageListener = {id: id, response: res};
    this.listeners.push(listener);
    return id;
  }

  RemoveListener = (id: string): void => {
    this.listeners = this.listeners.filter(l => l != null && l.id != id);
  }

  SendMessage = <T>(topic: string, payload: T): void => {
    this.messageCount++;
    var message = JSON.stringify({topic, payload});
    this.listeners.forEach(listener => {
      listener.response.write('id: ' + this.messageCount + '\n');
      listener.response.write("data: " + message + '\n\n'); 
      let channel: any = listener.response;
      channel.flush();
    });    
  }

  Destroy = () => {
    this.listeners.forEach(l => {
      this.SendMessage<SystemMessage>('sys', {type: 'dispose'});
      l.response.end();
    });
    this.listeners = [];
  }

}