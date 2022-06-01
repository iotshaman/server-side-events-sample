import { Component, NgZone, OnInit } from '@angular/core';
import { filter, map } from 'rxjs';
import { SampleMessage } from './models/messages/sample.message';
import { SystemMessage } from './models/messages/system.message';
import { RemoteMessage } from './models/remote-message';
import { RemoteMessageService } from './services/remote-message.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less']
})
export class AppComponent implements OnInit {

  messages: string[] = [];
  
  constructor(private messageService: RemoteMessageService, private zone: NgZone) {

  }

  ngOnInit(): void {
    // CREATE TOPIC LISTENER
    const sampleMessages = this.messageService.attachListener<SampleMessage>("sample").pipe(filter(m => !!m?.payload))
    // CREATE SUBSCRIPTION LISTENER
    var subscription1 = sampleMessages.pipe(filter(m => m.payload.messageType == "sample 1"));
    var subscription2 = sampleMessages.pipe(filter(m => m.payload.messageType == "sample 2"));
    var subscription3 = sampleMessages.pipe(
      filter(m => m.topic == "sys"), 
      map((m: unknown) => <RemoteMessage<SystemMessage>>m)
    );
    // ADD ELEMENTS TO ARRAY WHEN MESSAGES ARRIVE
    subscription1.subscribe(m => this.writeMessage(`Received sample message of type 1: ${m.payload.messageText}`));
    subscription2.subscribe(m => this.writeMessage(`Received sample message of type 2: ${m.payload.messageText}`));
    subscription3.subscribe(m => this.writeMessage(`Received system message: ${m.payload.type}`));
  }

  private writeMessage = (message: string): void => {
    this.zone.run(() => {
      console.log(message);
      this.messages.push(message);
    })
  }

}
