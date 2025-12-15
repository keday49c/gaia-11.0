FROM node:20-alpine AS client-build
WORKDIR /client
COPY client/package.json client/package-lock.json* ./
RUN npm ci --silent || npm install --no-audit --no-fund
COPY client/ ./
RUN npm run build

FROM node:20-alpine AS core-build
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --silent || npm install --no-audit --no-fund
COPY . ./
RUN npm run build --if-present

FROM nginx:stable-alpine
# Fallback: copy any core dist first, then overlay with client dist so client wins when present
COPY --from=core-build /app/dist /usr/share/nginx/html
COPY --from=client-build /client/dist /usr/share/nginx/html
COPY nginx/default.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
