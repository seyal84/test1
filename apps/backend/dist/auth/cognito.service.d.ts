import { ConfigService } from '@nestjs/config';
export declare class CognitoService {
    private configService;
    private cognitoClient;
    private userPoolId;
    private clientId;
    constructor(configService: ConfigService);
    createUser(userData: {
        email: string;
        password: string;
        firstName: string;
        lastName: string;
    }): Promise<import("@aws-sdk/client-cognito-identity-provider").UserType>;
    authenticateUser(credentials: {
        email: string;
        password: string;
    }): Promise<{
        accessToken: string;
        refreshToken: string;
        idToken: string;
        expiresIn: number;
    }>;
    refreshTokens(refreshToken: string): Promise<{
        accessToken: string;
        idToken: string;
        expiresIn: number;
    }>;
    signOut(accessToken: string): Promise<import("@aws-sdk/client-cognito-identity-provider").GlobalSignOutCommandOutput>;
    forgotPassword(email: string): Promise<import("@aws-sdk/client-cognito-identity-provider").ForgotPasswordCommandOutput>;
    confirmForgotPassword(email: string, code: string, newPassword: string): Promise<import("@aws-sdk/client-cognito-identity-provider").ConfirmForgotPasswordCommandOutput>;
    deleteUser(email: string): Promise<import("@aws-sdk/client-cognito-identity-provider").AdminDeleteUserCommandOutput>;
}
