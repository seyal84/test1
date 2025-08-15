import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, body, user } = request;
    const userInfo = user ? `User: ${user.email}` : 'Anonymous';
    
    const startTime = Date.now();
    
    this.logger.log(`${method} ${url} - ${userInfo}`);
    
    if (method !== 'GET' && body && Object.keys(body).length > 0) {
      // Log request body but exclude sensitive fields
      const sanitizedBody = { ...body };
      delete sanitizedBody.password;
      delete sanitizedBody.token;
      this.logger.debug(`Request body: ${JSON.stringify(sanitizedBody)}`);
    }

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - startTime;
        this.logger.log(`${method} ${url} - ${userInfo} - ${duration}ms`);
      }),
    );
  }
}