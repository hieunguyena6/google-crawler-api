import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { User, File, Keyword } from './entity';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.PG_HOST,
  port: Number(process.env.PG_PORT),
  username: process.env.PG_USERNAME,
  password: process.env.PG_PASSWORD,
  database: process.env.PG_DATABASE,
  schema: process.env.PG_SCHEMA,
  synchronize: true,
  logging: process.env.NODE_ENV === 'development',
  entities: [User, File, Keyword],
  migrations: [],
  subscribers: [],
  logger: 'advanced-console',
});
