import { keywordsCsvProcessQueue } from './index';
import { AppDataSource } from '@/data-source';
import { Keyword } from '@/entity';
import GoogleSpider from '@services/googleSpider.service';
import { logger } from '@utils/logger';
import redisClient from '@utils/redis';

const googleSpider = new GoogleSpider();
const sleep = ms => new Promise(res => setTimeout(res, ms));

const initQueueConsumer = () => {
  keywordsCsvProcessQueue.process(async function (job, done) {
    const keywordRepository = AppDataSource.getRepository(Keyword);
    const keywords = job.data.keywords;
    const fileInfo = job.data.fileInfo;
    logger.info(`[KeywordProcessing] START: with file ${JSON.stringify(fileInfo)}`);
    if (keywords && keywords.length) {
      let prevKeywordGetFromRedis = false;
      for (let index = 0; index < keywords.length; index++) {
        const keywordText = keywords[index];
        logger.info(`[KeywordProcessing] START: with keyword ${keywordText}`);
        const keywordDb = await keywordRepository
          .createQueryBuilder('keyword')
          .leftJoinAndSelect('keyword.file', 'file')
          .where('keyword.keyword = :keyword', { keyword: keywordText })
          .andWhere('file.id = :id', { id: fileInfo.id })
          .getOne();
        keywordDb.status = 'PROCESSING';
        keywordRepository.save(keywordDb);
        let cachedKeywordStr = '';
        try {
          cachedKeywordStr = await redisClient.get(`CACHE-${keywordDb.keyword}`);
        } catch (error) {
          logger.error(`REDIS ERROR: ${error}, skip read from Redis`);
        }
        if (cachedKeywordStr) {
          logger.info(`[KeywordProcessing] Keyword ${keywordText}: Found in redis: ${cachedKeywordStr}`);
          const cachedKeyword = JSON.parse(cachedKeywordStr);
          const { totalResult, timeFetch, totalAd, totalLink, cachePath, cacheFileName, dataFetchedAt } = cachedKeyword;
          keywordDb.totalResult = totalResult;
          keywordDb.timeFetch = timeFetch;
          keywordDb.totalAd = totalAd;
          keywordDb.totalLink = totalLink;
          keywordDb.cachePath = cachePath;
          keywordDb.cacheFileName = cacheFileName;
          keywordDb.dataFetchedAt = dataFetchedAt;
          prevKeywordGetFromRedis = true;
        } else {
          logger.info(`[KeywordProcessing] Keyword ${keywordText}: Not found in redis`);
          // wait 600ms deplay in 2 requests consecutive
          if (!prevKeywordGetFromRedis && index > 0) await sleep(500);
          const { totalResult, timeFetch, totalAd, totalLink, cachePath, cacheFileName } = await googleSpider.crawlData(keywordText);
          keywordDb.totalResult = totalResult;
          keywordDb.timeFetch = timeFetch;
          keywordDb.totalAd = totalAd;
          keywordDb.totalLink = totalLink;
          keywordDb.cachePath = cachePath;
          keywordDb.cacheFileName = cacheFileName;
          keywordDb.dataFetchedAt = new Date();
          logger.info(`[KeywordProcessing] Keyword ${keywordText}: set to redis: ${JSON.stringify(keywordDb)} with 12hrs TTL`);
          try {
            await redisClient.set(`CACHE-${keywordDb.keyword}`, JSON.stringify(keywordDb), {
              EX: 12 * 60 * 60,
            });
          } catch (error) {
            logger.error(`REDIS ERROR: ${error}, skip write to Redis`);
          }
          prevKeywordGetFromRedis = false;
        }
        keywordDb.status = 'COMPLETED';

        keywordRepository.save(keywordDb);
      }
    }
    done();
  });
};

export default initQueueConsumer;
