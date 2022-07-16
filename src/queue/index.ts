import Queue from 'bull';

const keywordsCsvProcessQueue = new Queue('keywords csv process', {
  redis: {
    port: Number(process.env.REDIS_PORT),
    host: process.env.REDIS_HOST,
    username: process.env.REDIS_USERNAME,
    password: process.env.REDIS_PASSWORD,
  },
});

export { keywordsCsvProcessQueue };
