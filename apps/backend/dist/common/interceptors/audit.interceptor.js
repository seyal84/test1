"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditInterceptor = void 0;
const common_1 = require("@nestjs/common");
const operators_1 = require("rxjs/operators");
const prisma_service_1 = require("../../prisma/prisma.service");
let AuditInterceptor = class AuditInterceptor {
    constructor(prisma) {
        this.prisma = prisma;
    }
    intercept(context, next) {
        const request = context.switchToHttp().getRequest();
        const { method, url, user, body, ip, headers } = request;
        if (method === 'GET' || !user) {
            return next.handle();
        }
        const action = this.getActionFromRequest(method, url);
        const entity = this.getEntityFromUrl(url);
        return next.handle().pipe((0, operators_1.tap)(async (response) => {
            try {
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
            }
            catch (error) {
                console.error('Audit logging failed:', error);
            }
        }));
    }
    getActionFromRequest(method, url) {
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
    getEntityFromUrl(url) {
        const urlParts = url.split('/').filter(part => part && part !== 'api' && part !== 'v1');
        return urlParts[0]?.toUpperCase() || 'UNKNOWN';
    }
    extractEntityId(response, body) {
        if (response?.id)
            return response.id;
        if (response?.data?.id)
            return response.data.id;
        if (body?.id)
            return body.id;
        return 'unknown';
    }
    sanitizeData(data) {
        if (!data)
            return null;
        const sanitized = { ...data };
        delete sanitized.password;
        delete sanitized.token;
        delete sanitized.accessToken;
        delete sanitized.refreshToken;
        return sanitized;
    }
};
exports.AuditInterceptor = AuditInterceptor;
exports.AuditInterceptor = AuditInterceptor = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AuditInterceptor);
//# sourceMappingURL=audit.interceptor.js.map