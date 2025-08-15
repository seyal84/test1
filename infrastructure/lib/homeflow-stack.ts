import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ecsPatterns from 'aws-cdk-lib/aws-ecs-patterns';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import * as cloudtrail from 'aws-cdk-lib/aws-cloudtrail';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as elasticache from 'aws-cdk-lib/aws-elasticache';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as certificatemanager from 'aws-cdk-lib/aws-certificatemanager';
import { Construct } from 'constructs';

export class HomeFlowStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // VPC
    const vpc = new ec2.Vpc(this, 'HomeFlowVPC', {
      maxAzs: 3,
      natGateways: 2,
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: 'public',
          subnetType: ec2.SubnetType.PUBLIC,
        },
        {
          cidrMask: 24,
          name: 'private',
          subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
        },
        {
          cidrMask: 28,
          name: 'isolated',
          subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
        },
      ],
    });

    // Security Groups
    const dbSecurityGroup = new ec2.SecurityGroup(this, 'DatabaseSecurityGroup', {
      vpc,
      description: 'Security group for RDS database',
      allowAllOutbound: false,
    });

    const appSecurityGroup = new ec2.SecurityGroup(this, 'ApplicationSecurityGroup', {
      vpc,
      description: 'Security group for ECS applications',
      allowAllOutbound: true,
    });

    const redisSecurityGroup = new ec2.SecurityGroup(this, 'RedisSecurityGroup', {
      vpc,
      description: 'Security group for Redis cluster',
      allowAllOutbound: false,
    });

    // Allow app to connect to database
    dbSecurityGroup.addIngressRule(
      appSecurityGroup,
      ec2.Port.tcp(5432),
      'Allow ECS tasks to connect to PostgreSQL'
    );

    // Allow app to connect to Redis
    redisSecurityGroup.addIngressRule(
      appSecurityGroup,
      ec2.Port.tcp(6379),
      'Allow ECS tasks to connect to Redis'
    );

    // Secrets Manager
    const dbSecret = new secretsmanager.Secret(this, 'DatabaseSecret', {
      description: 'RDS PostgreSQL credentials',
      generateSecretString: {
        secretStringTemplate: JSON.stringify({ username: 'homeflow' }),
        generateStringKey: 'password',
        excludeCharacters: '"@/\\',
      },
    });

    const appSecrets = new secretsmanager.Secret(this, 'ApplicationSecrets', {
      description: 'Application secrets and API keys',
      secretObjectValue: {
        JWT_SECRET: cdk.SecretValue.unsafePlainText('change-this-in-production'),
        HUGGING_FACE_API_KEY: cdk.SecretValue.unsafePlainText('your-api-key'),
        STRIPE_SECRET_KEY: cdk.SecretValue.unsafePlainText('your-stripe-key'),
        DOCUSIGN_PRIVATE_KEY: cdk.SecretValue.unsafePlainText('your-docusign-key'),
      },
    });

    // RDS PostgreSQL Database
    const database = new rds.DatabaseInstance(this, 'HomeFlowDatabase', {
      engine: rds.DatabaseInstanceEngine.postgres({
        version: rds.PostgresEngineVersion.VER_15_3,
      }),
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.MICRO),
      credentials: rds.Credentials.fromSecret(dbSecret),
      vpc,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
      },
      securityGroups: [dbSecurityGroup],
      databaseName: 'homeflow',
      backupRetention: cdk.Duration.days(7),
      deletionProtection: true,
      storageEncrypted: true,
      monitoringInterval: cdk.Duration.seconds(60),
      enablePerformanceInsights: true,
      cloudwatchLogsExports: ['postgresql'],
    });

    // ElastiCache Redis
    const redisSubnetGroup = new elasticache.CfnSubnetGroup(this, 'RedisSubnetGroup', {
      description: 'Subnet group for Redis cluster',
      subnetIds: vpc.isolatedSubnets.map(subnet => subnet.subnetId),
    });

    const redisCluster = new elasticache.CfnCacheCluster(this, 'RedisCluster', {
      cacheNodeType: 'cache.t3.micro',
      engine: 'redis',
      numCacheNodes: 1,
      cacheSubnetGroupName: redisSubnetGroup.ref,
      vpcSecurityGroupIds: [redisSecurityGroup.securityGroupId],
    });

    // S3 Bucket for media storage
    const mediaBucket = new s3.Bucket(this, 'MediaBucket', {
      bucketName: `homeflow-media-${this.account}-${this.region}`,
      versioned: true,
      encryption: s3.BucketEncryption.S3_MANAGED,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      lifecycleRules: [
        {
          id: 'DeleteIncompleteMultipartUploads',
          abortIncompleteMultipartUploadAfter: cdk.Duration.days(7),
        },
      ],
    });

    // Cognito User Pool
    const userPool = new cognito.UserPool(this, 'HomeFlowUserPool', {
      userPoolName: 'homeflow-users',
      selfSignUpEnabled: true,
      signInAliases: {
        email: true,
      },
      autoVerify: {
        email: true,
      },
      standardAttributes: {
        email: {
          required: true,
          mutable: true,
        },
        givenName: {
          required: true,
          mutable: true,
        },
        familyName: {
          required: true,
          mutable: true,
        },
      },
      passwordPolicy: {
        minLength: 8,
        requireLowercase: true,
        requireUppercase: true,
        requireDigits: true,
        requireSymbols: true,
      },
      accountRecovery: cognito.AccountRecovery.EMAIL_ONLY,
    });

    const userPoolClient = new cognito.UserPoolClient(this, 'HomeFlowUserPoolClient', {
      userPool,
      generateSecret: false,
      authFlows: {
        adminUserPassword: true,
        userPassword: true,
        userSrp: true,
      },
      oAuth: {
        flows: {
          authorizationCodeGrant: true,
        },
        scopes: [cognito.OAuthScope.EMAIL, cognito.OAuthScope.OPENID, cognito.OAuthScope.PROFILE],
      },
    });

    // ECS Cluster
    const cluster = new ecs.Cluster(this, 'HomeFlowCluster', {
      vpc,
      clusterName: 'homeflow-cluster',
      containerInsights: true,
    });

    // Task Role for ECS tasks
    const taskRole = new iam.Role(this, 'ECSTaskRole', {
      assumedBy: new iam.ServicePrincipal('ecs-tasks.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AmazonECSTaskExecutionRolePolicy'),
      ],
    });

    // Grant permissions to access secrets
    dbSecret.grantRead(taskRole);
    appSecrets.grantRead(taskRole);
    mediaBucket.grantReadWrite(taskRole);

    // Grant Cognito permissions
    taskRole.addToPolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: [
        'cognito-idp:AdminCreateUser',
        'cognito-idp:AdminSetUserPassword',
        'cognito-idp:AdminInitiateAuth',
        'cognito-idp:AdminDeleteUser',
        'cognito-idp:ForgotPassword',
        'cognito-idp:ConfirmForgotPassword',
      ],
      resources: [userPool.userPoolArn],
    }));

    // Backend Service
    const backendService = new ecsPatterns.ApplicationLoadBalancedFargateService(this, 'BackendService', {
      cluster,
      serviceName: 'homeflow-backend',
      cpu: 512,
      memoryLimitMiB: 1024,
      desiredCount: 2,
      taskImageOptions: {
        image: ecs.ContainerImage.fromRegistry('homeflow/backend:latest'),
        containerPort: 3001,
        taskRole,
        environment: {
          NODE_ENV: 'production',
          PORT: '3001',
          AWS_REGION: this.region,
          COGNITO_USER_POOL_ID: userPool.userPoolId,
          COGNITO_CLIENT_ID: userPoolClient.userPoolClientId,
          S3_BUCKET_NAME: mediaBucket.bucketName,
          REDIS_URL: `redis://${redisCluster.attrRedisEndpointAddress}:6379`,
        },
        secrets: {
          DATABASE_URL: ecs.Secret.fromSecretsManager(dbSecret, 'connectionString'),
          JWT_SECRET: ecs.Secret.fromSecretsManager(appSecrets, 'JWT_SECRET'),
          HUGGING_FACE_API_KEY: ecs.Secret.fromSecretsManager(appSecrets, 'HUGGING_FACE_API_KEY'),
        },
        logDriver: ecs.LogDrivers.awsLogs({
          streamPrefix: 'homeflow-backend',
          logRetention: logs.RetentionDays.ONE_WEEK,
        }),
      },
      publicLoadBalancer: true,
      listenerPort: 443,
      protocol: ecsPatterns.ApplicationProtocol.HTTPS,
    });

    // Frontend Service
    const frontendService = new ecsPatterns.ApplicationLoadBalancedFargateService(this, 'FrontendService', {
      cluster,
      serviceName: 'homeflow-frontend',
      cpu: 256,
      memoryLimitMiB: 512,
      desiredCount: 2,
      taskImageOptions: {
        image: ecs.ContainerImage.fromRegistry('homeflow/frontend:latest'),
        containerPort: 3000,
        environment: {
          NODE_ENV: 'production',
          REACT_APP_API_URL: `https://${backendService.loadBalancer.loadBalancerDnsName}`,
        },
        logDriver: ecs.LogDrivers.awsLogs({
          streamPrefix: 'homeflow-frontend',
          logRetention: logs.RetentionDays.ONE_WEEK,
        }),
      },
      publicLoadBalancer: true,
      listenerPort: 443,
      protocol: ecsPatterns.ApplicationProtocol.HTTPS,
    });

    // CloudTrail for audit logging
    const auditTrail = new cloudtrail.Trail(this, 'HomeFlowAuditTrail', {
      trailName: 'homeflow-audit-trail',
      includeGlobalServiceEvents: true,
      isMultiRegionTrail: true,
      enableFileValidation: true,
    });

    // CloudWatch Log Groups
    const appLogGroup = new logs.LogGroup(this, 'ApplicationLogGroup', {
      logGroupName: '/aws/homeflow/application',
      retention: logs.RetentionDays.ONE_MONTH,
    });

    // Outputs
    new cdk.CfnOutput(this, 'DatabaseEndpoint', {
      value: database.instanceEndpoint.hostname,
      description: 'RDS PostgreSQL endpoint',
    });

    new cdk.CfnOutput(this, 'UserPoolId', {
      value: userPool.userPoolId,
      description: 'Cognito User Pool ID',
    });

    new cdk.CfnOutput(this, 'UserPoolClientId', {
      value: userPoolClient.userPoolClientId,
      description: 'Cognito User Pool Client ID',
    });

    new cdk.CfnOutput(this, 'MediaBucketName', {
      value: mediaBucket.bucketName,
      description: 'S3 Media Bucket Name',
    });

    new cdk.CfnOutput(this, 'BackendURL', {
      value: `https://${backendService.loadBalancer.loadBalancerDnsName}`,
      description: 'Backend API URL',
    });

    new cdk.CfnOutput(this, 'FrontendURL', {
      value: `https://${frontendService.loadBalancer.loadBalancerDnsName}`,
      description: 'Frontend Application URL',
    });

    new cdk.CfnOutput(this, 'RedisEndpoint', {
      value: redisCluster.attrRedisEndpointAddress,
      description: 'Redis Cluster Endpoint',
    });
  }
}