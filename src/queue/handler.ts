import { keywordsProcessQueue } from './index';
import { AppDataSource } from '@/data-source';
import { Keyword } from '@/entity';
import GoogleSpider from '@services/googleSpider.service';
import { logger } from '@utils/logger';
import redisClient from '@utils/redis';
import parseHTML from '@utils/parseHTML';

const googleSpider = new GoogleSpider();
const sleep = ms => new Promise(res => setTimeout(res, ms));
const keywordRepository = AppDataSource.getRepository(Keyword);

const initQueueConsumer = () => {
  let prevKeywordGetFromRedis = false;
  keywordsProcessQueue.process(async function (job, done) {
    const keywordDB = await keywordRepository.findOneBy({
      id: job.data.id,
    });
    if (!keywordDB) {
      logger.error(`[KeywordProcessing] ERROR: not found keyword id ${job.data.id}`);
      return;
    }
    logger.info(`[KeywordProcessing] START: with keyword ${JSON.stringify(keywordDB)}`);
    let cachedKeywordStr = '';
    try {
      cachedKeywordStr = await redisClient.get(`CACHE-${keywordDB.keyword}`);
    } catch (error) {
      logger.error(`REDIS ERROR: ${error}, skip read from Redis`);
    }
    let updateData = {};
    if (cachedKeywordStr) {
      logger.info(`[KeywordProcessing] Keyword ${keywordDB.keyword}: Found in redis`);
      const cachedKeyword = JSON.parse(cachedKeywordStr);
      updateData = cachedKeyword;
      prevKeywordGetFromRedis = true;
    } else {
      logger.info(`[KeywordProcessing] Keyword  ${keywordDB.keyword}: Not found in redis`);
      if (!prevKeywordGetFromRedis) await sleep(500);
      const HTMLPage = await googleSpider.crawlData(keywordDB.keyword);
      const { totalResult, timeFetch, totalAd, totalLink } = parseHTML(HTMLPage);
      updateData = {
        totalResult,
        timeFetch,
        totalAd,
        totalLink,
        HTMLPage,
        dataFetchedAt: new Date(),
        status: 'COMPLETED',
      };
      logger.info(`[KeywordProcessing] Keyword ${keywordDB.keyword} data: set to redis with 12hrs TTL`);
      try {
        await redisClient.set(`CACHE-${keywordDB.keyword}`, JSON.stringify(updateData), {
          EX: 12 * 60 * 60,
        });
      } catch (error) {
        logger.error(`REDIS ERROR: ${error}, skip write to Redis`);
      }
      prevKeywordGetFromRedis = false;
    }
    await keywordRepository.update(keywordDB.id, updateData);
    done();
  });
};

export default initQueueConsumer;
