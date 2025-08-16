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
exports.CognitoService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const client_cognito_identity_provider_1 = require("@aws-sdk/client-cognito-identity-provider");
let CognitoService = class CognitoService {
    constructor(configService) {
        this.configService = configService;
        this.cognitoClient = new client_cognito_identity_provider_1.CognitoIdentityProviderClient({
            region: this.configService.get('AWS_REGION'),
            credentials: {
                accessKeyId: this.configService.get('AWS_ACCESS_KEY_ID'),
                secretAccessKey: this.configService.get('AWS_SECRET_ACCESS_KEY'),
            },
        });
        this.userPoolId = this.configService.get('COGNITO_USER_POOL_ID');
        this.clientId = this.configService.get('COGNITO_CLIENT_ID');
    }
    async createUser(userData) {
        const { email, password, firstName, lastName } = userData;
        const createUserCommand = new client_cognito_identity_provider_1.AdminCreateUserCommand({
            UserPoolId: this.userPoolId,
            Username: email,
            UserAttributes: [
                { Name: 'email', Value: email },
                { Name: 'given_name', Value: firstName },
                { Name: 'family_name', Value: lastName },
                { Name: 'email_verified', Value: 'true' },
            ],
            MessageAction: 'SUPPRESS',
            TemporaryPassword: password,
        });
        const createResult = await this.cognitoClient.send(createUserCommand);
        const setPasswordCommand = new client_cognito_identity_provider_1.AdminSetUserPasswordCommand({
            UserPoolId: this.userPoolId,
            Username: email,
            Password: password,
            Permanent: true,
        });
        await this.cognitoClient.send(setPasswordCommand);
        return createResult.User;
    }
    async authenticateUser(credentials) {
        const { email, password } = credentials;
        const authCommand = new client_cognito_identity_provider_1.AdminInitiateAuthCommand({
            UserPoolId: this.userPoolId,
            ClientId: this.clientId,
            AuthFlow: 'ADMIN_NO_SRP_AUTH',
            AuthParameters: {
                USERNAME: email,
                PASSWORD: password,
            },
        });
        const authResult = await this.cognitoClient.send(authCommand);
        if (authResult.ChallengeName === 'NEW_PASSWORD_REQUIRED') {
            throw new Error('New password required');
        }
        return {
            accessToken: authResult.AuthenticationResult?.AccessToken,
            refreshToken: authResult.AuthenticationResult?.RefreshToken,
            idToken: authResult.AuthenticationResult?.IdToken,
            expiresIn: authResult.AuthenticationResult?.ExpiresIn,
        };
    }
    async refreshTokens(refreshToken) {
        const refreshCommand = new client_cognito_identity_provider_1.InitiateAuthCommand({
            ClientId: this.clientId,
            AuthFlow: 'REFRESH_TOKEN_AUTH',
            AuthParameters: {
                REFRESH_TOKEN: refreshToken,
            },
        });
        const result = await this.cognitoClient.send(refreshCommand);
        return {
            accessToken: result.AuthenticationResult?.AccessToken,
            idToken: result.AuthenticationResult?.IdToken,
            expiresIn: result.AuthenticationResult?.ExpiresIn,
        };
    }
    async signOut(accessToken) {
        const signOutCommand = new client_cognito_identity_provider_1.GlobalSignOutCommand({
            AccessToken: accessToken,
        });
        return await this.cognitoClient.send(signOutCommand);
    }
    async forgotPassword(email) {
        const forgotPasswordCommand = new client_cognito_identity_provider_1.ForgotPasswordCommand({
            ClientId: this.clientId,
            Username: email,
        });
        return await this.cognitoClient.send(forgotPasswordCommand);
    }
    async confirmForgotPassword(email, code, newPassword) {
        const confirmCommand = new client_cognito_identity_provider_1.ConfirmForgotPasswordCommand({
            ClientId: this.clientId,
            Username: email,
            ConfirmationCode: code,
            Password: newPassword,
        });
        return await this.cognitoClient.send(confirmCommand);
    }
    async deleteUser(email) {
        const deleteCommand = new client_cognito_identity_provider_1.AdminDeleteUserCommand({
            UserPoolId: this.userPoolId,
            Username: email,
        });
        return await this.cognitoClient.send(deleteCommand);
    }
};
exports.CognitoService = CognitoService;
exports.CognitoService = CognitoService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], CognitoService);
//# sourceMappingURL=cognito.service.js.map