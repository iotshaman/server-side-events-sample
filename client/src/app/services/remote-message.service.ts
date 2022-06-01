import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

import { AppConfig } from "../models/app.config";
import { RemoteMessage } from '../models/remote-message';

@Injectable()
export class RemoteMessageService {
  
  protected apiBaseUri: Observable<string>;
  private eventSourceBaseUri: Observable<string>;

  constructor(config: AppConfig) {
    this.apiBaseUri = of(config.apiBaseUri);
    this.eventSourceBaseUri = of(config.eventSourceBaseUri);
  }

  attachListener = <T = any>(sourceName: string): Observable<RemoteMessage<T>> => {
    return this.eventSourceBaseUri.pipe(map(uri => `${uri}/messages/${sourceName}`))
      .pipe(map(url => new EventSource(url)))
      .pipe(switchMap(source => {
        return new Observable<RemoteMessage<T>>(s => {
          source.onopen = (_message) => s.next({topic: 'init', payload: null});
          source.onmessage = (message) => {
            let data: RemoteMessage = JSON.parse(message.data);
            if (data.topic == 'sys' && data.payload.type == 'dispose') source.close();
            else s.next(data);
          }
          return () => source.close();
        });
      }));
  }

}