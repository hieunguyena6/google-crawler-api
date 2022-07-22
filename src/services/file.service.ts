import { AppDataSource } from '@/data-source';
import { File, Keyword } from '@/entity';
import { CreateFileDto } from '@dtos/file.dto';
import { keywordsCsvProcessQueue } from '@/queue';
import { HttpException } from '@exceptions/HttpException';

const fs = require('fs');

class FileService {
  public fileRepository = AppDataSource.getRepository(File);
  public keywordRepository = AppDataSource.getRepository(Keyword);

  public async uploadFile(fileInfo: CreateFileDto): Promise<File> {
    Object.keys(fileInfo).forEach(k => fileInfo[k] == null || (fileInfo[k] == '' && delete fileInfo[k]));
    const keywords = Array.from(new Set(this.readCsvFile(fileInfo.path))).filter(Boolean);
    if (!keywords.length) {
      throw new HttpException(400, 'CSV file is empty !');
    } else if (keywords.length > 100) {
      throw new HttpException(400, 'CSV is too long (> 100 keywords)');
    }
    const createdFile = await this.fileRepository.save(fileInfo);
    keywordsCsvProcessQueue.add({
      keywords: keywords,
      fileInfo: createdFile,
    });
    keywords.forEach((keyword: string) => {
      const newKeyword = new Keyword();
      newKeyword.file = createdFile;
      newKeyword.keyword = keyword;
      newKeyword.status = 'CREATED';
      this.keywordRepository.save(newKeyword);
    });
    return createdFile;
  }

  private readCsvFile(filePath) {
    return fs.readFileSync(filePath, 'utf8')?.toString()?.split('\n') || [];
  }
}
export default FileService;
