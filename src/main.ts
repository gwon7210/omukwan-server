import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DataSource } from 'typeorm';
import { createUserSeed } from './seeds/user.seed';
import { createPostSeed } from './seeds/post.seed';
import { groupSeed } from './seeds/group.seed';
import { groupMemberSeed } from './seeds/group-member.seed';
import { HttpExceptionFilter } from './filters/http-exception.filter';
import { Logger } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });
  
  // 정적 파일 제공 설정
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads',
  });
  
  // 전역 예외 필터 적용
  app.useGlobalFilters(new HttpExceptionFilter());
  
  // 시드 데이터 생성
  if (process.env.NODE_ENV !== 'production') {
    const dataSource = app.get(DataSource);
    await createUserSeed(dataSource);
    await groupSeed(dataSource);
    await groupMemberSeed(dataSource);
    await createPostSeed(dataSource);
  } else {
    logger.log('프로덕션 환경에서는 시드 데이터가 실행되지 않습니다.');
  }
  
  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  logger.log(`Application is running on: http://localhost:${port}`);
}

bootstrap();
