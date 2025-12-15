FROM node:20-alpine
WORKDIR /srv
COPY package.json package-lock.json* ./
RUN npm ci --silent || npm install --no-audit --no-fund
COPY . .
RUN npm run build --if-present
ENV NODE_ENV=production
EXPOSE 3001
CMD ["npm", "start"]
