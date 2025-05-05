import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private logger = new Logger('HTTP');

  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl, body } = req;
    const userAgent = req.get('user-agent') || '';
    const startTime = Date.now();

    this.logger.log(
      `[REQUEST] ${method} ${originalUrl} - Body: ${JSON.stringify(body)} - User Agent: ${userAgent}`,
    );

    // 응답이 완료되면 로그 출력
    res.on('finish', () => {
      const { statusCode } = res;
      const contentLength = res.get('content-length');
      const duration = Date.now() - startTime;

      this.logger.log(
        `[RESPONSE] ${method} ${originalUrl} ${statusCode} ${contentLength}B - ${duration}ms`,
      );
    });

    next();
  }
} 