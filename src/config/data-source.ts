import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

// 환경에 따른 .env 파일 로드
dotenv.config({
  path: `.env.${process.env.NODE_ENV || 'development'}`
});

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_DATABASE || 'gaechuk_db',
  entities: ['src/entities/*.entity.ts'],
  migrations: ['src/migrations/*.ts'],
  synchronize: true,
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false
  } : false,
  logging: process.env.NODE_ENV === 'development',
  maxQueryExecutionTime: 1000,
  poolSize: 10,
  extra: {
    connectionTimeoutMillis: 5000,
    query_timeout: 10000,
    statement_timeout: 10000,
  }
}); 