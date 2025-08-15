# Multi-stage build for production
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY apps/backend/package*.json ./apps/backend/

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY apps/backend ./apps/backend
COPY packages ./packages

# Generate Prisma client
WORKDIR /app/apps/backend
RUN npm run prisma:generate

# Build the application
RUN npm run build

# Production stage
FROM node:18-alpine AS production

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create app user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001

# Set working directory
WORKDIR /app

# Copy built application
COPY --from=builder --chown=nestjs:nodejs /app/apps/backend/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/apps/backend/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/apps/backend/package*.json ./
COPY --from=builder --chown=nestjs:nodejs /app/apps/backend/prisma ./prisma

# Create logs directory
RUN mkdir -p /app/logs && chown nestjs:nodejs /app/logs

# Switch to non-root user
USER nestjs

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node dist/health-check.js

# Start the application
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/main.js"]