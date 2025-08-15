import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  CognitoIdentityProviderClient,
  AdminCreateUserCommand,
  AdminSetUserPasswordCommand,
  AdminInitiateAuthCommand,
  AdminRespondToAuthChallengeCommand,
  AdminDeleteUserCommand,
  ForgotPasswordCommand,
  ConfirmForgotPasswordCommand,
  GlobalSignOutCommand,
  InitiateAuthCommand,
} from '@aws-sdk/client-cognito-identity-provider';

@Injectable()
export class CognitoService {
  private cognitoClient: CognitoIdentityProviderClient;
  private userPoolId: string;
  private clientId: string;

  constructor(private configService: ConfigService) {
    this.cognitoClient = new CognitoIdentityProviderClient({
      region: this.configService.get('AWS_REGION'),
      credentials: {
        accessKeyId: this.configService.get('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.get('AWS_SECRET_ACCESS_KEY'),
      },
    });
    
    this.userPoolId = this.configService.get('COGNITO_USER_POOL_ID');
    this.clientId = this.configService.get('COGNITO_CLIENT_ID');
  }

  async createUser(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) {
    const { email, password, firstName, lastName } = userData;

    // Create user
    const createUserCommand = new AdminCreateUserCommand({
      UserPoolId: this.userPoolId,
      Username: email,
      UserAttributes: [
        { Name: 'email', Value: email },
        { Name: 'given_name', Value: firstName },
        { Name: 'family_name', Value: lastName },
        { Name: 'email_verified', Value: 'true' },
      ],
      MessageAction: 'SUPPRESS', // Don't send welcome email
      TemporaryPassword: password,
    });

    const createResult = await this.cognitoClient.send(createUserCommand);

    // Set permanent password
    const setPasswordCommand = new AdminSetUserPasswordCommand({
      UserPoolId: this.userPoolId,
      Username: email,
      Password: password,
      Permanent: true,
    });

    await this.cognitoClient.send(setPasswordCommand);

    return createResult.User;
  }

  async authenticateUser(credentials: { email: string; password: string }) {
    const { email, password } = credentials;

    const authCommand = new AdminInitiateAuthCommand({
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
      // Handle new password challenge if needed
      throw new Error('New password required');
    }

    return {
      accessToken: authResult.AuthenticationResult?.AccessToken,
      refreshToken: authResult.AuthenticationResult?.RefreshToken,
      idToken: authResult.AuthenticationResult?.IdToken,
      expiresIn: authResult.AuthenticationResult?.ExpiresIn,
    };
  }

  async refreshTokens(refreshToken: string) {
    const refreshCommand = new InitiateAuthCommand({
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

  async signOut(accessToken: string) {
    const signOutCommand = new GlobalSignOutCommand({
      AccessToken: accessToken,
    });

    return await this.cognitoClient.send(signOutCommand);
  }

  async forgotPassword(email: string) {
    const forgotPasswordCommand = new ForgotPasswordCommand({
      ClientId: this.clientId,
      Username: email,
    });

    return await this.cognitoClient.send(forgotPasswordCommand);
  }

  async confirmForgotPassword(email: string, code: string, newPassword: string) {
    const confirmCommand = new ConfirmForgotPasswordCommand({
      ClientId: this.clientId,
      Username: email,
      ConfirmationCode: code,
      Password: newPassword,
    });

    return await this.cognitoClient.send(confirmCommand);
  }

  async deleteUser(email: string) {
    const deleteCommand = new AdminDeleteUserCommand({
      UserPoolId: this.userPoolId,
      Username: email,
    });

    return await this.cognitoClient.send(deleteCommand);
  }
}