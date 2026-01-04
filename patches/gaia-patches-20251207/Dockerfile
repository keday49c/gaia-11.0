# Runtime stage (patched for wait-for-db and non-root execution)
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
