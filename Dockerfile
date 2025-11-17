# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy server package files
COPY server/package.json server/package-lock.json* ./

# Install dependencies
RUN npm install

# Copy TypeScript source files
COPY server/*.ts ./

# Copy tsconfig
COPY server/tsconfig.json ./

# Build TypeScript
RUN npm run build

# Runtime stage
FROM node:20-alpine

WORKDIR /app

# Copy server package files
COPY server/package.json server/package-lock.json* ./

# Install production dependencies only
RUN npm install --production

# Copy built application from builder
COPY --from=builder /app/dist ./dist

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})" || exit 1

# Start application
CMD ["node", "dist/index.js"]

