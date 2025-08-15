# HomeFlow - AI-Powered Real Estate Transaction Platform

HomeFlow is a comprehensive, secure, and modern real estate transaction platform that leverages AI to streamline property listings, offers, negotiations, and closing processes. Built with cutting-edge technologies and security best practices.

## 🏗️ Architecture Overview

### Tech Stack

**Backend:**
- **Framework:** NestJS (TypeScript)
- **Database:** PostgreSQL with Prisma ORM
- **Authentication:** AWS Cognito + JWT
- **File Storage:** AWS S3
- **AI/ML:** Hugging Face NLP models
- **Caching:** Redis
- **API Documentation:** Swagger/OpenAPI

**Frontend:**
- **Framework:** React 18 with TypeScript
- **UI Library:** Material-UI (MUI)
- **State Management:** Redux Toolkit + React Query
- **Routing:** React Router v6
- **Build Tool:** Vite
- **PWA Support:** Vite PWA plugin

**Mobile:**
- **Framework:** React Native
- **Navigation:** React Navigation
- **State Management:** Redux Toolkit

**Infrastructure:**
- **Containerization:** Docker & Docker Compose
- **Cloud:** AWS (ECS Fargate, RDS, S3, Cognito, CloudTrail)
- **IaC:** AWS CDK
- **CI/CD:** GitHub Actions
- **Monitoring:** CloudWatch, Sentry

## 🚀 Features

### Core Functionality
- ✅ **Secure Authentication** - AWS Cognito with RBAC (Buyer/Seller/Service Provider/Admin)
- ✅ **Property Listings** - Create, search, and manage property listings
- ✅ **AI-Enhanced Descriptions** - Hugging Face NLP for automatic description enhancement
- ✅ **Offer Management** - Submit, negotiate, and track offers
- ✅ **Escrow Management** - Track escrow status and document uploads
- ✅ **Service Provider Directory** - Find and book real estate professionals
- ✅ **Document Management** - Secure document storage and e-signatures
- ✅ **Analytics Dashboard** - Property performance and market insights

### Integrations
- 🔄 **MLS Integration** - Synchronize property data (stubbed for MVP)
- 💳 **Stripe Payments** - Escrow deposit handling (stubbed for MVP)
- ✍️ **DocuSign** - Electronic document signing (stubbed for MVP)

### Security Features
- 🔒 **End-to-end Encryption** - All data encrypted at rest and in transit
- 🛡️ **Role-Based Access Control** - Granular permissions system
- 📊 **Audit Logging** - Complete audit trail with CloudTrail
- 🚨 **Rate Limiting** - API protection against abuse
- 🔐 **Secrets Management** - AWS Secrets Manager integration

## 📋 Prerequisites

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0
- **Docker** and **Docker Compose**
- **PostgreSQL** >= 13
- **Redis** >= 6
- **AWS Account** (for production deployment)

## 🛠️ Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/homeflow.git
cd homeflow
```

### 2. Environment Setup

```bash
# Copy environment template
cp .env.example .env

# Edit the .env file with your configuration
nano .env
```

### 3. Install Dependencies

```bash
# Install root dependencies
npm install

# Install backend dependencies
cd apps/backend && npm install

# Install frontend dependencies
cd ../frontend && npm install

# Return to root
cd ../..
```

### 4. Database Setup

```bash
# Start PostgreSQL and Redis with Docker
docker-compose up -d postgres redis

# Generate Prisma client
cd apps/backend
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# Seed the database (optional)
npm run prisma:seed
```

### 5. Start Development Servers

```bash
# Start all services
npm run dev

# Or start individually:
npm run dev:backend  # Backend API (port 3001)
npm run dev:frontend # Frontend App (port 3000)
```

### 6. Access the Application

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:3001
- **API Documentation:** http://localhost:3001/api/docs

## 🔧 Configuration

### Required Environment Variables

```bash
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/homeflow"

# JWT
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="1d"

# AWS Configuration
AWS_REGION="us-west-2"
AWS_ACCESS_KEY_ID="your-aws-access-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret-key"

# AWS Cognito
COGNITO_USER_POOL_ID="us-west-2_xxxxxxxxx"
COGNITO_CLIENT_ID="xxxxxxxxxxxxxxxxxxxxxxxxxx"

# AWS S3
S3_BUCKET_NAME="homeflow-media-bucket"

# Hugging Face API
HUGGING_FACE_API_KEY="your-hugging-face-api-key"
```

### AWS Services Setup

1. **Create Cognito User Pool:**
   ```bash
   aws cognito-idp create-user-pool --pool-name homeflow-users
   aws cognito-idp create-user-pool-client --user-pool-id YOUR_POOL_ID --client-name homeflow-client
   ```

2. **Create S3 Bucket:**
   ```bash
   aws s3 mb s3://homeflow-media-bucket
   ```

3. **Set up IAM Roles and Policies** (see `infrastructure/` directory)

## 🚀 Deployment

### Development with Docker

```bash
# Build and start all services
docker-compose up --build

# Run in background
docker-compose up -d
```

### Production Deployment (AWS)

1. **Deploy Infrastructure:**
   ```bash
   cd infrastructure
   npm install
   npm run deploy
   ```

2. **Deploy Application:**
   ```bash
   # Build production images
   docker build -t homeflow-backend -f apps/backend/Dockerfile .
   docker build -t homeflow-frontend -f apps/frontend/Dockerfile .

   # Push to ECR
   aws ecr get-login-password --region us-west-2 | docker login --username AWS --password-stdin YOUR_ECR_URI
   docker tag homeflow-backend:latest YOUR_ECR_URI/homeflow-backend:latest
   docker push YOUR_ECR_URI/homeflow-backend:latest
   ```

3. **Update ECS Services:**
   ```bash
   aws ecs update-service --cluster homeflow-cluster --service homeflow-backend --force-new-deployment
   ```

## 🧪 Testing

### Backend Tests

```bash
cd apps/backend

# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

### Frontend Tests

```bash
cd apps/frontend

# Unit tests
npm run test

# Cypress E2E tests
npm run cypress:open  # Interactive mode
npm run cypress:run   # Headless mode
```

### Security Testing

```bash
# Run security audit
npm audit

# Check for vulnerabilities
npm run security:check
```

## 📊 Monitoring and Logging

### Application Monitoring

- **Logs:** Centralized logging with Winston
- **Metrics:** CloudWatch metrics and dashboards
- **Alerts:** CloudWatch alarms for critical events
- **APM:** Sentry for error tracking and performance monitoring

### Health Checks

```bash
# Backend health check
curl http://localhost:3001/health

# Database health check
curl http://localhost:3001/health/db
```

## 🔐 Security Considerations

### Data Protection
- All sensitive data encrypted at rest using AWS KMS
- TLS 1.3 for data in transit
- Regular security audits and penetration testing

### Authentication & Authorization
- Multi-factor authentication support
- Session management with secure cookies
- JWT tokens with short expiration times
- Role-based access control (RBAC)

### API Security
- Rate limiting to prevent abuse
- Input validation and sanitization
- CORS configuration
- Helmet.js security headers

### Compliance
- GDPR compliance with data deletion capabilities
- Audit logging for all critical actions
- Data retention policies

## 📚 API Documentation

### Authentication Endpoints

```
POST /api/v1/auth/register     # User registration
POST /api/v1/auth/login        # User login
POST /api/v1/auth/refresh      # Refresh tokens
POST /api/v1/auth/logout       # User logout
GET  /api/v1/auth/profile      # Get user profile
```

### Listings Endpoints

```
GET    /api/v1/listings        # Search listings
POST   /api/v1/listings        # Create listing
GET    /api/v1/listings/:id    # Get listing details
PUT    /api/v1/listings/:id    # Update listing
DELETE /api/v1/listings/:id    # Delete listing
```

### Offers Endpoints

```
GET    /api/v1/offers          # Get user offers
POST   /api/v1/offers          # Submit offer
PUT    /api/v1/offers/:id      # Update offer status
```

For complete API documentation, visit: http://localhost:3001/api/docs

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Write comprehensive tests
- Use conventional commits
- Update documentation for new features
- Ensure security best practices

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation:** [Wiki](https://github.com/your-org/homeflow/wiki)
- **Issues:** [GitHub Issues](https://github.com/your-org/homeflow/issues)
- **Discussions:** [GitHub Discussions](https://github.com/your-org/homeflow/discussions)

## 🗺️ Roadmap

### Phase 1 (MVP) ✅
- Basic authentication and user management
- Property listing creation and search
- Offer submission and basic negotiation
- Service provider directory

### Phase 2 (Q2 2024)
- Advanced AI features (price prediction, market analysis)
- Real-time notifications
- Mobile app release
- Enhanced analytics dashboard

### Phase 3 (Q3 2024)
- Blockchain integration for smart contracts
- Virtual reality property tours
- Advanced workflow automation
- Multi-language support

### Phase 4 (Q4 2024)
- Machine learning recommendations
- Advanced reporting and analytics
- Third-party integrations expansion
- Enterprise features

---

**Built with ❤️ by the HomeFlow Team**