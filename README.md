# 개척 서버 (Gaechuk Server)

<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## 프로젝트 소개

개축 서버는 NestJS 프레임워크를 기반으로 구축된 백엔드 서버입니다. 이 프로젝트는 효율적이고 확장 가능한 서버 사이드 애플리케이션을 제공합니다.

## 기술 스택

- NestJS
- TypeScript
- TypeORM
- PostgreSQL
- JWT Authentication
- Passport.js
- 카카오 소셜 로그인

## 시작하기

### 필수 조건

- Node.js (v18 이상)
- PostgreSQL
- npm 또는 yarn

### 설치

```bash
# 의존성 설치
$ npm install
```

### 환경 설정

1. `.env` 파일을 프로젝트 루트 디렉토리에 생성하고 필요한 환경 변수를 설정합니다.
2. 데이터베이스 연결 정보를 설정합니다.

### 실행

```bash
# 개발 모드
$ npm run start:dev

# 프로덕션 모드
$ npm run start:prod
```

## API 문서

### 인증 API

#### 1. 카카오 로그인 (POST /auth/kakao-login)

기존 카카오 사용자의 로그인을 처리합니다.

**요청:**
```json
{
  "access_token": "카카오_액세스_토큰",
  "user_id": "카카오_사용자_ID", 
  "email": "사용자_이메일",
  "nickname": "사용자_닉네임",
  "profile_image": "프로필_이미지_URL"
}
```

**응답:**
```json
{
  "access_token": "백엔드_발급_토큰",
  "refresh_token": "리프레시_토큰",
  "user": {
    "id": "사용자_ID",
    "nickname": "닉네임",
    "email": "이메일",
    "profile_image": "프로필_이미지"
  }
}
```

#### 2. 카카오 회원가입 (POST /auth/kakao-signup)

새로운 카카오 사용자의 회원가입을 처리합니다.

**요청:**
```json
{
  "access_token": "카카오_액세스_토큰",
  "user_id": "카카오_사용자_ID",
  "nickname": "사용자_닉네임", 
  "email": "사용자_이메일",
  "profile_image": "프로필_이미지_URL",
  "church_name": "교회명",
  "faith_confession": "신앙고백"
}
```

**응답:**
```json
{
  "access_token": "백엔드_발급_토큰",
  "refresh_token": "리프레시_토큰",
  "user": {
    "id": "사용자_ID",
    "nickname": "닉네임",
    "email": "이메일",
    "profile_image": "프로필_이미지"
  }
}
```

### 구현 로직

1. **카카오 토큰 검증**: 카카오 API로 액세스 토큰 유효성 확인
2. **사용자 정보 조회**: 카카오 API로 사용자 상세 정보 가져오기
3. **기존 사용자 확인**: `kakao_id`로 기존 회원인지 확인
4. **회원가입/로그인 처리**: 신규면 회원가입, 기존이면 로그인

### 데이터베이스 스키마

User 테이블에 추가된 필드:
- `kakao_id` VARCHAR(255) UNIQUE
- `kakao_email` VARCHAR(255)
- `profile_image_url` TEXT (기존 필드)

API 문서는 Swagger를 통해 제공됩니다. 서버가 실행된 후 다음 URL에서 확인할 수 있습니다:
```
http://localhost:3000/api
```

## 테스트

```bash
# 단위 테스트
$ npm run test

# e2e 테스트
$ npm run test:e2e

# 테스트 커버리지
$ npm run test:cov
```

## 프로젝트 구조

```
src/
├── auth/           # 인증 관련 모듈
│   ├── dto/        # 데이터 전송 객체
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── kakao.service.ts
│   └── jwt.strategy.ts
├── users/          # 사용자 관련 모듈
├── common/         # 공통 유틸리티
├── config/         # 설정 파일
└── main.ts         # 애플리케이션 진입점
```

## 라이선스

이 프로젝트는 MIT 라이선스 하에 있습니다.

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
