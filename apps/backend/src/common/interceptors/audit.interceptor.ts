import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private readonly prisma: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, user, body, ip, headers } = request;

    // Only audit non-GET requests and authenticated users
    if (method === 'GET' || !user) {
      return next.handle();
    }

    const action = this.getActionFromRequest(method, url);
    const entity = this.getEntityFromUrl(url);

    return next.handle().pipe(
      tap(async (response) => {
        try {
          // Create audit log entry
          await this.prisma.auditLog.create({
            data: {
              action,
              entity,
              entityId: this.extractEntityId(response, body),
              newValues: this.sanitizeData(body),
              ipAddress: ip || headers['x-forwarded-for'] || headers['x-real-ip'],
              userAgent: headers['user-agent'],
              userId: user.id,
            },
          });
        } catch (error) {
          // Don't fail the request if audit logging fails
          console.error('Audit logging failed:', error);
        }
      }),
    );
  }

  private getActionFromRequest(method: string, url: string): string {
    const urlParts = url.split('/');
    
    switch (method) {
      case 'POST':
        return urlParts.includes('login') ? 'LOGIN' : 'CREATE';
      case 'PUT':
      case 'PATCH':
        return 'UPDATE';
      case 'DELETE':
        return 'DELETE';
      default:
        return method;
    }
  }

  private getEntityFromUrl(url: string): string {
    const urlParts = url.split('/').filter(part => part && part !== 'api' && part !== 'v1');
    return urlParts[0]?.toUpperCase() || 'UNKNOWN';
  }

  private extractEntityId(response: any, body: any): string {
    // Try to extract ID from response or request body
    if (response?.id) return response.id;
    if (response?.data?.id) return response.data.id;
    if (body?.id) return body.id;
    return 'unknown';
  }

  private sanitizeData(data: any): any {
    if (!data) return null;
    
    const sanitized = { ...data };
    
    // Remove sensitive fields
    delete sanitized.password;
    delete sanitized.token;
    delete sanitized.accessToken;
    delete sanitized.refreshToken;
    
    return sanitized;
  }
}