/* istanbul ignore file */
import { Container } from 'inversify';

import { Configure } from './composition/app.composition';
import { TYPES } from './composition/app.composition.types';
import { ConfigFactory } from './config.factory';
import { IApiService } from './api.service';
import { IMessageService } from './services/message.services';
import { SampleMessage } from './models/messages/sample.message';

ConfigFactory.GenerateConfig()
  .then(config => Configure(config))
  .then((container: Container) => {
    let apiService = container.get<IApiService>(TYPES.ApiService);
    let messageService = container.get<IMessageService>(TYPES.MessageService);
    messageService.CreateMessageSource("sample");
    sendSampleMessages(messageService);
    apiService.configure(container);
    return apiService.startApplication();
  })
  .catch(ex => {
    console.dir(ex);
    process.exit(1);
  });

function sendSampleMessages(messageService: IMessageService) {
  let flag = true;
  setInterval(_ => {
    const messageType = flag ? 'sample 1' : 'sample 2';
    const messageText = flag ? 'Sample 1 message details...' : 'Sample 2 message details';
    messageService.SendMessage<SampleMessage>("sample", "sample", {messageType, messageText});
    flag = !flag;
  }, 5000);
}