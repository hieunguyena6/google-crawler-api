import authMiddleware from '@middlewares/auth.middleware';
import { Router } from 'express';
import FileController from '@controllers/file.controller';
import { Routes } from '@interfaces/routes.interface';
import csvUploadFile from '@middlewares/uploadCsv.middleware';
import fileController from '@controllers/file.controller';

class FileRoute implements Routes {
  public path = '/file';
  public router = Router();
  public fileController = new FileController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    try {
      this.router.post(`${this.path}/csv/upload`, csvUploadFile.single('file'), this.fileController.uploadCsv);
    } catch (error) {
      console.log(error);
    }
  }
}
export default FileRoute;
