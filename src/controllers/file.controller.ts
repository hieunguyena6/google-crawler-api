import { NextFunction, Response } from 'express';
import { RequestWithUser } from '@interfaces/auth.interface';
import { CreateFileDto } from '@dtos/file.dto';
import FileService from '@services/file.service';
const fs = require('fs');

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
      const keywords = this.readCsvFile(createdFile.path);
      console.log(keywords);

      res.status(201).json({ data: createdFile, message: 'OK' });
    } catch (error) {
      next(error);
    }
  };

  private readCsvFile(filePath) {
    return fs.readFileSync(filePath).toString().split('\n');
  }
}

export default FileController;
