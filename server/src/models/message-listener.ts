import { Response } from "express";

export class MessageListener {
  id: string;
  response: Response;

  constructor(id: string, response: Response) {
    id = id;
    response = response;
  }

}