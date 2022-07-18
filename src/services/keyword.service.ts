import { AppDataSource } from '@/data-source';
import { Keyword } from '@/entity';

class KeywordService {
  public keywordRepository = AppDataSource.getRepository(Keyword);

  public getByKeywordAndUserId(keyword: string, userId: number, offset?: number, skip?: number): Promise<[Keyword[], number]> {
    if (!keyword) {
      return this.keywordRepository
        .createQueryBuilder('keyword')
        .leftJoinAndSelect('keyword.file', 'file')
        .where('file.uploadedById = :id', { id: userId })
        .offset(offset || 0)
        .skip(skip || 0)
        .getManyAndCount();
    }
    return this.keywordRepository
      .createQueryBuilder('keyword')
      .leftJoinAndSelect('keyword.file', 'file')
      .where('keyword.keyword like :keyword', { keyword: `%${keyword}%` })
      .andWhere('file.uploadedById = :id', { id: userId })
      .offset(offset || 0)
      .skip(skip || 0)
      .getManyAndCount();
  }
}
export default KeywordService;
