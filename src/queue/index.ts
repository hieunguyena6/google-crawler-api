import Queue from 'bull';

const keywordsProcessQueue = new Queue('keyword process', {
  redis: {
    port: Number(process.env.REDIS_PORT),
    host: process.env.REDIS_HOST,
    username: process.env.REDIS_USERNAME,
    password: process.env.REDIS_PASSWORD,
  },
});

export { keywordsProcessQueue };
