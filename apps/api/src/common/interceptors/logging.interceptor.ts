import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';

@Injectable()
export class StructuredLoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const http = context.switchToHttp();
    const req = http.getRequest<Request>();
    const res = http.getResponse<Response>();

    const requestId = (req.headers['x-request-id'] as string) || `req-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    res.setHeader('X-Request-ID', requestId);

    const startTime = Date.now();
    const { method, originalUrl, ip } = req;

    return next.handle().pipe(
      tap({
        next: () => {
          const durationMs = Date.now() - startTime;
          const logPayload = {
            timestamp: new Date().toISOString(),
            requestId,
            method,
            path: originalUrl,
            statusCode: res.statusCode,
            durationMs,
            clientIp: ip,
          };
          this.logger.log(JSON.stringify(logPayload));
        },
        error: (err) => {
          const durationMs = Date.now() - startTime;
          const logPayload = {
            timestamp: new Date().toISOString(),
            requestId,
            method,
            path: originalUrl,
            statusCode: err.status || 500,
            durationMs,
            error: err.message,
            clientIp: ip,
          };
          this.logger.error(JSON.stringify(logPayload));
        },
      }),
    );
  }
}
