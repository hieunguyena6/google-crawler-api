const fs = require('fs');
const FormData = require('form-data');
import request from 'supertest';
import App from '@/app';
import KeywordRoute from '@routes/keyword.route';
import { AppDataSource } from '../data-source';
import redisClient from '@utils/redis';
import { userRepository } from '@/middlewares/auth.middleware';

jest.mock('jsonwebtoken', () => ({
  verify: jest.fn().mockReturnValue({ foo: 'bar' }), // overwrite verify
}));

userRepository.findOneBy = jest.fn().mockReturnValue({
  id: 1,
  email: 'test@email.com',
});

jest.mock('../queue/index.ts', () => ({
  keywordsCsvProcessQueue: {
    add: jest.fn(),
    process: jest.fn(),
  },
}));

afterAll(async () => {
  await new Promise<void>(resolve => setTimeout(() => resolve(), 500));
  await AppDataSource.close();
  await redisClient.quit();
});

describe('Testing GET keywords', () => {
  const keywordRoute = new KeywordRoute();
  const app = new App([keywordRoute]);
  const keywordRepository = keywordRoute.keywordController.keywordService.keywordRepository;

  describe('[GET] /keywords', () => {
    it('should be success ', async () => {
      interface IKeyword {
        id: number;
        keyword: string;
      }
      const fakeKeywordsResponse = [
        [
          {
            id: 1,
            keyword: 'a',
          },
          {
            id: 2,
            keyword: 'b',
          },
          {
            id: 3,
            keyword: 'c',
          },
          {
            id: 4,
            keyword: 'd',
          },
        ],
        4,
      ];
      const createQueryBuilder: any = {
        leftJoinAndSelect: () => createQueryBuilder,
        where: () => createQueryBuilder,
        offset: () => createQueryBuilder,
        skip: () => createQueryBuilder,
        orderBy: () => createQueryBuilder,
        getManyAndCount: () => fakeKeywordsResponse,
      };
      jest.spyOn(keywordRepository, 'createQueryBuilder').mockImplementation(() => createQueryBuilder);
      const response = await request(app.getServer()).get(`/v1${keywordRoute.path}`).set({
        Authorization: 'Bearer fakeToken',
      });
      expect(response.statusCode).toBe(200);
      expect(response.body.message).toEqual('OK');
      expect(response.body.total).toEqual(fakeKeywordsResponse[1]);
      expect(response.body.data).toEqual(expect.arrayContaining(fakeKeywordsResponse[0] as IKeyword[]));
    });
  });
});
