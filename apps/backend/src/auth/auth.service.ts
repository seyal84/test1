import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';

import { UsersService } from '../users/users.service';
import { CognitoService } from './cognito.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly cognitoService: CognitoService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { email, password, firstName, lastName, role } = registerDto;

    // Check if user already exists
    const existingUser = await this.usersService.findByEmail(email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    try {
      // Create user in Cognito
      const cognitoUser = await this.cognitoService.createUser({
        email,
        password,
        firstName,
        lastName,
      });

      // Create user in our database
      const user = await this.usersService.create({
        email,
        firstName,
        lastName,
        role,
        cognitoId: cognitoUser.Username,
      });

      // Generate JWT token
      const payload: JwtPayload = {
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
    } catch (error) {
      if (error.code === 'UsernameExistsException') {
        throw new ConflictException('User with this email already exists');
      }
      throw error;
    }
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    try {
      // Authenticate with Cognito
      const cognitoAuth = await this.cognitoService.authenticateUser({
        email,
        password,
      });

      // Get user from our database
      const user = await this.usersService.findByEmail(email);
      if (!user || !user.isActive) {
        throw new UnauthorizedException('Invalid credentials');
      }

      // Generate JWT token
      const payload: JwtPayload = {
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
    } catch (error) {
      throw new UnauthorizedException('Invalid credentials');
    }
  }

  async validateUser(email: string, password: string) {
    try {
      await this.cognitoService.authenticateUser({ email, password });
      const user = await this.usersService.findByEmail(email);
      
      if (user && user.isActive) {
        return user;
      }
    } catch (error) {
      return null;
    }
    return null;
  }

  async validateJwtPayload(payload: JwtPayload) {
    const user = await this.usersService.findById(payload.sub);
    if (!user || !user.isActive) {
      throw new UnauthorizedException('User not found or inactive');
    }
    return user;
  }

  async refreshToken(refreshToken: string) {
    try {
      const tokens = await this.cognitoService.refreshTokens(refreshToken);
      return tokens;
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(accessToken: string) {
    try {
      await this.cognitoService.signOut(accessToken);
      return { message: 'Successfully logged out' };
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  async forgotPassword(email: string) {
    try {
      await this.cognitoService.forgotPassword(email);
      return { message: 'Password reset code sent to email' };
    } catch (error) {
      throw new UnauthorizedException('User not found');
    }
  }

  async resetPassword(email: string, code: string, newPassword: string) {
    try {
      await this.cognitoService.confirmForgotPassword(email, code, newPassword);
      return { message: 'Password reset successfully' };
    } catch (error) {
      throw new UnauthorizedException('Invalid reset code');
    }
  }
}