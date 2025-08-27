/**
 * 필수 환경변수들을 검증하는 함수
 */
export function validateEnvironmentVariables() {
  const nodeEnv = process.env.NODE_ENV || 'development';
  console.log(`🔧 Environment: ${nodeEnv}`);

  const requiredEnvVars = [
    'JWT_SECRET',
    'DB_HOST',
    'DB_PORT',
    'DB_USERNAME',
    'DB_PASSWORD',
    'DB_DATABASE'
  ];

  const missingVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(', ')}\n` +
      `Please check your .env.${nodeEnv} file and ensure all required variables are set.`
    );
  }

  // JWT_SECRET 보안 검증
  const jwtSecret = process.env.JWT_SECRET!;
  if (jwtSecret.length < 32) {
    throw new Error(
      'JWT_SECRET must be at least 32 characters long for security reasons.'
    );
  }

  if (jwtSecret === 'your-secret-key' || jwtSecret === 'your-super-secure-jwt-secret-key-here') {
    throw new Error(
      'JWT_SECRET must be changed from the default value for security reasons.'
    );
  }

  // 환경별 추가 검증
  if (nodeEnv === 'production') {
    if (process.env.DB_PASSWORD === 'postgres') {
      throw new Error(
        'DB_PASSWORD must be changed from default value in production environment.'
      );
    }
  }

  console.log('✅ Environment variables validation passed');
  console.log(`📊 Database: ${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_DATABASE}`);
} 