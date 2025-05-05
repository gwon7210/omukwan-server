import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DataSource } from 'typeorm';
import { createUserSeed } from './seeds/user.seed';
import { createPostSeed } from './seeds/post.seed';
import { HttpExceptionFilter } from './filters/http-exception.filter';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });
  
  // 전역 예외 필터 적용
  app.useGlobalFilters(new HttpExceptionFilter());
  
  // 시드 데이터 생성
  const dataSource = app.get(DataSource);
  await createUserSeed(dataSource);
  await createPostSeed(dataSource);
  
  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  logger.log(`Application is running on: http://localhost:${port}`);
}

bootstrap();
