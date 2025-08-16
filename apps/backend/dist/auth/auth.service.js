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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const users_service_1 = require("../users/users.service");
const cognito_service_1 = require("./cognito.service");
let AuthService = class AuthService {
    constructor(usersService, jwtService, cognitoService) {
        this.usersService = usersService;
        this.jwtService = jwtService;
        this.cognitoService = cognitoService;
    }
    async register(registerDto) {
        const { email, password, firstName, lastName, role } = registerDto;
        const existingUser = await this.usersService.findByEmail(email);
        if (existingUser) {
            throw new common_1.ConflictException('User with this email already exists');
        }
        try {
            const cognitoUser = await this.cognitoService.createUser({
                email,
                password,
                firstName,
                lastName,
            });
            const user = await this.usersService.create({
                email,
                firstName,
                lastName,
                role,
                cognitoId: cognitoUser.Username,
            });
            const payload = {
                sub: user.id,
                email: user.email,
                role: user.role,
            };
            return {
                user: {
                    id: user.id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    role: user.role,
                },
                accessToken: this.jwtService.sign(payload),
            };
        }
        catch (error) {
            if (error.code === 'UsernameExistsException') {
                throw new common_1.ConflictException('User with this email already exists');
            }
            throw error;
        }
    }
    async login(loginDto) {
        const { email, password } = loginDto;
        try {
            const cognitoAuth = await this.cognitoService.authenticateUser({
                email,
                password,
            });
            const user = await this.usersService.findByEmail(email);
            if (!user || !user.isActive) {
                throw new common_1.UnauthorizedException('Invalid credentials');
            }
            const payload = {
                sub: user.id,
                email: user.email,
                role: user.role,
            };
            return {
                user: {
                    id: user.id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    role: user.role,
                },
                accessToken: this.jwtService.sign(payload),
                cognitoTokens: cognitoAuth,
            };
        }
        catch (error) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
    }
    async validateUser(email, password) {
        try {
            await this.cognitoService.authenticateUser({ email, password });
            const user = await this.usersService.findByEmail(email);
            if (user && user.isActive) {
                return user;
            }
        }
        catch (error) {
            return null;
        }
        return null;
    }
    async validateJwtPayload(payload) {
        const user = await this.usersService.findById(payload.sub);
        if (!user || !user.isActive) {
            throw new common_1.UnauthorizedException('User not found or inactive');
        }
        return user;
    }
    async refreshToken(refreshToken) {
        try {
            const tokens = await this.cognitoService.refreshTokens(refreshToken);
            return tokens;
        }
        catch (error) {
            throw new common_1.UnauthorizedException('Invalid refresh token');
        }
    }
    async logout(accessToken) {
        try {
            await this.cognitoService.signOut(accessToken);
            return { message: 'Successfully logged out' };
        }
        catch (error) {
            throw new common_1.UnauthorizedException('Invalid token');
        }
    }
    async forgotPassword(email) {
        try {
            await this.cognitoService.forgotPassword(email);
            return { message: 'Password reset code sent to email' };
        }
        catch (error) {
            throw new common_1.UnauthorizedException('User not found');
        }
    }
    async resetPassword(email, code, newPassword) {
        try {
            await this.cognitoService.confirmForgotPassword(email, code, newPassword);
            return { message: 'Password reset successfully' };
        }
        catch (error) {
            throw new common_1.UnauthorizedException('Invalid reset code');
        }
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        jwt_1.JwtService,
        cognito_service_1.CognitoService])
], AuthService);
//# sourceMappingURL=auth.service.js.map