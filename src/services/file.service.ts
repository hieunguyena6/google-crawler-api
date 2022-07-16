import { AppDataSource } from '../data-source';
import { File } from '@/entity/File';
import { CreateFileDto } from '@dtos/file.dto';

class FileService {
  public fileRepository = AppDataSource.getRepository(File);

  public async uploadFile(fileInfo: CreateFileDto): Promise<File> {
    Object.keys(fileInfo).forEach(k => fileInfo[k] == null || (fileInfo[k] == '' && delete fileInfo[k]));
    return this.fileRepository.save(fileInfo);
  }
}
export default FileService;
