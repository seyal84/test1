import { UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
export declare class UsersService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(data: {
        email: string;
        firstName: string;
        lastName: string;
        role: UserRole;
        cognitoId?: string;
        phone?: string;
    }): Promise<{
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        phone: string;
        role: import(".prisma/client").$Enums.UserRole;
        avatar: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findById(id: string): Promise<{
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        phone: string;
        role: import(".prisma/client").$Enums.UserRole;
        avatar: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findByEmail(email: string): Promise<{
        id: string;
        email: string;
        cognitoId: string;
        firstName: string;
        lastName: string;
        phone: string;
        role: import(".prisma/client").$Enums.UserRole;
        avatar: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findByCognitoId(cognitoId: string): Promise<{
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        phone: string;
        role: import(".prisma/client").$Enums.UserRole;
        avatar: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(id: string, data: {
        firstName?: string;
        lastName?: string;
        phone?: string;
        avatar?: string;
    }): Promise<{
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        phone: string;
        role: import(".prisma/client").$Enums.UserRole;
        avatar: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    deactivate(id: string): Promise<{
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        phone: string;
        role: import(".prisma/client").$Enums.UserRole;
        avatar: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findAll(page?: number, limit?: number, role?: UserRole): Promise<{
        users: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
            phone: string;
            role: import(".prisma/client").$Enums.UserRole;
            avatar: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
        }[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
}
