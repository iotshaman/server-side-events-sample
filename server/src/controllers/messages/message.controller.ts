import { Request, Response, Application, Router } from "express";
import { inject, injectable } from 'inversify';
import { TYPES } from "../../composition/app.composition.types";
import { RouteError } from "../../models/route-error";
import { IMessageService } from "../../services/message.services";

@injectable()
export class MessageController {

  private router: Router;

  constructor(@inject(TYPES.ExpressApplication) app: Application,
    @inject(TYPES.MessageService) private messageService: IMessageService) {
    this.router = Router();
    this.router
      .get('/:name', this.AttachListener)

    app.use('/api/messages', this.router);
  }

  AttachListener = (req: Request, res: Response, next: any) => {
    try {
      this.messageService.AttachListener(req.params.name, req, res);
    } catch(ex) {
      next(new RouteError(ex.message, 500));
    }
  }

}