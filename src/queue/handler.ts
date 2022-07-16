import { keywordsCsvProcessQueue } from './index';
import { AppDataSource } from '@/data-source';
import { File } from '@/entity/File';

const initQueueConsumer = () => {
  keywordsCsvProcessQueue.process(function (job, done) {
    const fileRepository = AppDataSource.getRepository(File);
    fileRepository.update(job.data.fileInfo.id, {
      status: 'PROCESSING',
    });
    done();
  });
};

export default initQueueConsumer;
