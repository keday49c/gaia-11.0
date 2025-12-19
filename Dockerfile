# Build stage
FROM node:20-alpine AS builder
WORKDIR /app

# Copy only package files to leverage cache
COPY server/package.json server/package-lock.json* ./
RUN npm install

# Copy TypeScript sources and tsconfig (include entire server directory so types and libs are available)
COPY server/ ./

# Build TypeScript (produces ./dist)
RUN npm run build

# Debug listing (opcional) — mostra o conteúdo de /app/dist no log do build
RUN echo "--- Conteúdo de /app/dist (após build) ---" && ls -la /app/dist || true && echo "--- Conteúdo de /app/dist/public (após build) ---" && ls -la /app/dist/public || true

# Runtime stage
FROM node:20-alpine AS runtime
WORKDIR /app
COPY server/package.json server/package-lock.json* ./
RUN npm install --production

# Copy build artifacts from builder
COPY --from=builder /app/dist ./dist

# Copy helper script to wait for DB and make it executable
COPY scripts/wait-for-db.sh /usr/local/bin/wait-for-db.sh
RUN chmod +x /usr/local/bin/wait-for-db.sh || true

# Install postgres client so wait-for-db.sh can test readiness
RUN apk add --no-cache postgresql-client

# Create a non-root user to run the application
RUN addgroup -S gaia && adduser -S -G gaia gaia || true
RUN chown -R gaia:gaia /app || true

# Expose port and start (entrypoint waits for DB then starts node)
EXPOSE 3001
ENTRYPOINT ["/usr/local/bin/wait-for-db.sh"]
# run as non-root user (will execute node via wait-for-db)
USER gaia

