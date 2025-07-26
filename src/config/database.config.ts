import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as dotenv from 'dotenv';
import { getEnvironmentConfig } from './environment.config';

// 환경에 따른 .env 파일 로드
dotenv.config({
  path: `.env.${process.env.NODE_ENV || 'development'}`
});

export const databaseConfig: TypeOrmModuleOptions = getEnvironmentConfig().database; 