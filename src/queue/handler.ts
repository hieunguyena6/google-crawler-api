import { keywordsCsvProcessQueue } from './index';
import { AppDataSource } from '@/data-source';
import { Keyword } from '@/entity';
import GoogleSpider from '@services/googleSpider.service';

const googleSpider = new GoogleSpider();
const sleep = ms => new Promise(res => setTimeout(res, ms));

const initQueueConsumer = () => {
  keywordsCsvProcessQueue.process(async function (job, done) {
    const keywordRepository = AppDataSource.getRepository(Keyword);
    const keywords = job.data.keywords;
    const fileInfo = job.data.fileInfo;
    if (keywords && keywords.length) {
      for (let index = 0; index < keywords.length; index++) {
        const keywordText = keywords[index];
        const keywordDb = await keywordRepository
          .createQueryBuilder('keyword')
          .leftJoinAndSelect('keyword.file', 'file')
          .where('keyword.keyword = :keyword', { keyword: keywordText })
          .andWhere('file.id = :id', { id: fileInfo.id })
          .getOne();
        keywordDb.status = 'PROCESSING';
        keywordRepository.save(keywordDb);

        const { totalResult, timeFetch, totalAd, totalLink, cachePath, cacheFileName } = await googleSpider.crawlData(keywordText);
        keywordDb.totalResult = totalResult;
        keywordDb.timeFetch = timeFetch;
        keywordDb.totalAd = totalAd;
        keywordDb.totalLink = totalLink;
        keywordDb.cachePath = cachePath;
        keywordDb.cacheFileName = cacheFileName;
        keywordDb.status = 'COMPLETED';

        keywordRepository.save(keywordDb);

        await sleep(500);
      }
    }
    done();
  });
};

export default initQueueConsumer;
