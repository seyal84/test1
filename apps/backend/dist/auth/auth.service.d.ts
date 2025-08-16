import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { CognitoService } from './cognito.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
export declare class AuthService {
    private readonly usersService;
    private readonly jwtService;
    private readonly cognitoService;
    constructor(usersService: UsersService, jwtService: JwtService, cognitoService: CognitoService);
    register(registerDto: RegisterDto): Promise<{
        user: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
            role: import(".prisma/client").$Enums.UserRole;
        };
        accessToken: string;
    }>;
    login(loginDto: LoginDto): Promise<{
        user: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
            role: import(".prisma/client").$Enums.UserRole;
        };
        accessToken: string;
        cognitoTokens: {
            accessToken: string;
            refreshToken: string;
            idToken: string;
            expiresIn: number;
        };
    }>;
    validateUser(email: string, password: string): Promise<{
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
    validateJwtPayload(payload: JwtPayload): Promise<{
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
    refreshToken(refreshToken: string): Promise<{
        accessToken: string;
        idToken: string;
        expiresIn: number;
    }>;
    logout(accessToken: string): Promise<{
        message: string;
    }>;
    forgotPassword(email: string): Promise<{
        message: string;
    }>;
    resetPassword(email: string, code: string, newPassword: string): Promise<{
        message: string;
    }>;
}
