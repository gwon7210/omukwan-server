import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export interface EnvironmentConfig {
  nodeEnv: string;
  port: number;
  jwtSecret: string;
  database: TypeOrmModuleOptions;
  logLevel: string;
  ssl?: {
    enabled: boolean;
    certPath?: string;
    keyPath?: string;
  };
}

export function getEnvironmentConfig(): EnvironmentConfig {
  const nodeEnv = process.env.NODE_ENV || 'development';
  
  const baseConfig = {
    nodeEnv,
    port: parseInt(process.env.PORT || '3000', 10),
    jwtSecret: process.env.JWT_SECRET!,
    logLevel: process.env.LOG_LEVEL || 'info',
  };

  switch (nodeEnv) {
    case 'production':
      return {
        ...baseConfig,
        database: {
          type: 'postgres',
          host: process.env.DB_HOST!,
          port: parseInt(process.env.DB_PORT!, 10),
          username: process.env.DB_USERNAME!,
          password: process.env.DB_PASSWORD!,
          database: process.env.DB_DATABASE!,
          entities: [__dirname + '/../**/*.entity{.ts,.js}'],
          synchronize: false, // 프로덕션에서는 false
          ssl: {
            rejectUnauthorized: false,
          },
          logging: false,
          maxQueryExecutionTime: 1000,
          poolSize: 20,
          extra: {
            connectionTimeoutMillis: 10000,
            query_timeout: 30000,
            statement_timeout: 30000,
          }
        },
        ssl: {
          enabled: process.env.SSL_ENABLED === 'true',
          certPath: process.env.SSL_CERT_PATH,
          keyPath: process.env.SSL_KEY_PATH,
        }
      };

    case 'test':
      return {
        ...baseConfig,
        database: {
          type: 'postgres',
          host: process.env.DB_HOST!,
          port: parseInt(process.env.DB_PORT!, 10),
          username: process.env.DB_USERNAME!,
          password: process.env.DB_PASSWORD!,
          database: process.env.DB_DATABASE!,
          entities: [__dirname + '/../**/*.entity{.ts,.js}'],
          synchronize: true,
          ssl: false,
          logging: false,
          maxQueryExecutionTime: 1000,
          poolSize: 5,
        }
      };

    case 'development':
    default:
      return {
        ...baseConfig,
        database: {
          type: 'postgres',
          host: process.env.DB_HOST!,
          port: parseInt(process.env.DB_PORT!, 10),
          username: process.env.DB_USERNAME!,
          password: process.env.DB_PASSWORD!,
          database: process.env.DB_DATABASE!,
          entities: [__dirname + '/../**/*.entity{.ts,.js}'],
          synchronize: true,
          ssl: false,
          logging: true,
          maxQueryExecutionTime: 1000,
          poolSize: 10,
          extra: {
            connectionTimeoutMillis: 5000,
            query_timeout: 10000,
            statement_timeout: 10000,
          }
        }
      };
  }
} 