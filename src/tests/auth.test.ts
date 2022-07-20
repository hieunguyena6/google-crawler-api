import bcrypt from 'bcrypt';
import request from 'supertest';
import App from '@/app';
import { CreateUserDto } from '@dtos/users.dto';
import AuthRoute from '@routes/auth.route';
import { AppDataSource } from '../data-source';
import redisClient from '@utils/redis';

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

describe('Testing Auth', () => {
  const authRoute = new AuthRoute();
  const app = new App([authRoute]);
  const userRepository = authRoute.authController.authService.userRepository;

  describe('[POST] /signup', () => {
    const userData: CreateUserDto = {
      email: 'test@email.com',
      password: 'q1w2e3r4!',
    };

    it('should be success & response should have the Create userData', async () => {
      userRepository.findOneBy = jest.fn().mockReturnValue(null);
      userRepository.save = jest.fn().mockReturnValue({
        id: 1,
        email: 'test@email.com',
        password: await bcrypt.hash(userData.password, 10),
      });

      const response = await request(app.getServer()).post(`/v1${authRoute.path}signup`).send(userData);
      expect(response.statusCode).toBe(201);
      expect(response.body.message).toEqual('signup');
      expect(response.body.data.email).toEqual(userData.email);
    });

    it('should be email existed', async () => {
      userRepository.findOneBy = jest.fn().mockReturnValue({
        id: 1,
        email: 'test@email.com',
        password: await bcrypt.hash(userData.password, 10),
      });

      const response = await request(app.getServer()).post(`/v1${authRoute.path}signup`).send(userData);
      expect(response.statusCode).toBe(409);
      expect(response.body.message).toEqual(`You're email ${userData.email} already exists`);
    });
  });

  describe('[POST] /login', () => {
    it('shold be success & have jwt in response', async () => {
      const userData: CreateUserDto = {
        email: 'test@email.com',
        password: 'q1w2e3r4!',
      };

      userRepository.findOneBy = jest.fn().mockReturnValue({
        id: 1,
        email: 'test@email.com',
        password: await bcrypt.hash(userData.password, 10),
      });

      const response = await request(app.getServer()).post(`/v1${authRoute.path}login`).send(userData);

      expect(response.statusCode).toBe(200);
      expect(response.body.message).toEqual('login');
      expect(response.body.data.user.email).toEqual(userData.email);
      expect(response.body.data.token).toBeDefined();
    });

    it('shold be email not found', async () => {
      const userData: CreateUserDto = {
        email: 'test1@email.com',
        password: 'q1w2e3r4!',
      };

      userRepository.findOneBy = jest.fn().mockReturnValue(null);

      const response = await request(app.getServer()).post(`/v1${authRoute.path}login`).send(userData);

      expect(response.statusCode).toBe(409);
      expect(response.body.message).toEqual(`You're email ${userData.email} not found`);
    });

    it('shold be password not match', async () => {
      const userData: CreateUserDto = {
        email: 'test1@email.com',
        password: 'wrongpassword',
      };

      userRepository.findOneBy = jest.fn().mockReturnValue({
        id: 1,
        email: 'test@email.com',
        password: await bcrypt.hash('userData.password', 10),
      });

      const response = await request(app.getServer()).post(`/v1${authRoute.path}login`).send(userData);

      expect(response.statusCode).toBe(409);
      expect(response.body.message).toEqual(`You're password not matching`);
    });
  });
});
