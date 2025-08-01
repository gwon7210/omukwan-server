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
import { createOmukwanSeed } from './seeds/omukwan.seed';
import { validateEnvironmentVariables } from './config/env.validation';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  
  // 환경변수 검증
  try {
    validateEnvironmentVariables();
  } catch (error) {
    logger.error('Environment validation failed:', error.message);
    process.exit(1);
  }
  
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });
  
  // CORS 설정
  app.enableCors({
    origin: '*', // Flutter 앱에서는 * 허용 필요
    credentials: true,
  });
  
  // 정적 파일 제공 설정
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads',
  });
  
  // 공개 정적 파일 제공 설정 (계정 삭제 안내 페이지 등)
  app.useStaticAssets(join(__dirname, '..', 'public'), {
    prefix: '/',
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
    await createOmukwanSeed(dataSource);
  } else {
    logger.log('프로덕션 환경에서는 시드 데이터가 실행되지 않습니다.');
  }

  const port = process.env.PORT ?? 3000;
  await app.listen(port, '0.0.0.0');
  logger.log(`Application is running on: http://0.0.0.0:${port}`);
}

bootstrap();
