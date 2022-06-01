export class RemoteMessage<T = any> {
  topic: string;
  payload: T;
}