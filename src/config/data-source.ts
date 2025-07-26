import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

// 환경에 따른 .env 파일 로드
dotenv.config({
  path: `.env.${process.env.NODE_ENV || 'development'}`
});

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST!,
  port: parseInt(process.env.DB_PORT!, 10),
  username: process.env.DB_USERNAME!,
  password: process.env.DB_PASSWORD!,
  database: process.env.DB_DATABASE!,
  entities: ['src/entities/*.entity.ts'],
  migrations: ['src/migrations/*.ts'],
  synchronize: process.env.NODE_ENV !== 'production',
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false
  } : false,
  logging: process.env.NODE_ENV === 'development',
  maxQueryExecutionTime: 1000,
  poolSize: process.env.NODE_ENV === 'production' ? 20 : 10,
  extra: {
    connectionTimeoutMillis: process.env.NODE_ENV === 'production' ? 10000 : 5000,
    query_timeout: process.env.NODE_ENV === 'production' ? 30000 : 10000,
    statement_timeout: process.env.NODE_ENV === 'production' ? 30000 : 10000,
  }
}); 