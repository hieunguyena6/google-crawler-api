import authMiddleware from '@middlewares/auth.middleware';
import { Router } from 'express';
import KeywordController from '@controllers/keyword.controller';
import { Routes } from '@interfaces/routes.interface';

class KeywordRoute implements Routes {
  public path = '/keywords';
  public router = Router();
  public keywordController = new KeywordController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    try {
      this.router.get(`${this.path}`, authMiddleware, this.keywordController.get);
    } catch (error) {
      console.log(error);
    }
  }
}
export default KeywordRoute;
