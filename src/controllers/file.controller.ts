import { NextFunction, Response } from 'express';
import { RequestWithUser } from '@interfaces/auth.interface';
import { CreateFileDto } from '@dtos/file.dto';
import FileService from '@services/file.service';
import { omit } from 'lodash';

class FileController {
  public fileService = new FileService();

  public uploadCsv = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const csvFileInfo: CreateFileDto = {
        path: req.file.path,
        name: req.file.originalname,
        uploadedBy: req.user,
        status: 'UPLOADED',
      };
      const createdFile = await this.fileService.uploadFile(csvFileInfo);

      res.status(201).json({ data: omit(createdFile, 'uploadedBy'), message: 'OK' });
    } catch (error) {
      next(error);
    }
  };
}

export default FileController;
