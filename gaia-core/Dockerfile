FROM node:20-alpine AS client-build
WORKDIR /client
COPY client/package.json client/package-lock.json* ./
RUN set -eux; set +e; if npm ci --silent --legacy-peer-deps || npm install --no-audit --no-fund --legacy-peer-deps; then npm run build || echo "client build produced no dist"; else echo "Warning: client install failed, continuing without client dist"; fi; set -e
COPY client/ ./
# Try to build; non-fatal so the rest of image can be built even if client build fails
RUN set -eux; if [ -f package.json ]; then npm run build || echo "client build produced no dist"; fi
# Ensure /client/dist exists so final COPY won't fail even if build produced nothing
RUN mkdir -p /client/dist || true

FROM node:20-alpine AS core-build
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --silent || npm install --no-audit --no-fund
COPY . ./
RUN set -eux; if npm run build --if-present; then echo "core build completed"; else echo "Warning: core build skipped or failed, continuing"; fi
RUN mkdir -p /app/dist || true

FROM nginx:stable-alpine
# Fallback: copy any core dist first, then overlay with client dist so client wins when present
COPY --from=core-build /app/dist /usr/share/nginx/html
COPY --from=client-build /client/dist /usr/share/nginx/html
COPY gaia-core/nginx/default.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
