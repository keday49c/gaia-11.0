# Estágio 1: Construir a aplicação
FROM node:20-alpine AS builder

# Definir o diretório de trabalho no contêiner
WORKDIR /app

# Copiar os arquivos package.json e package-lock.json da raiz e do cliente
COPY package*.json ./
COPY client/package*.json ./client/

# Instalar dependências da raiz (se houver)
# RUN npm install

# Copiar o restante do código-fonte do projeto
COPY . .

# Instalar dependências do cliente e construir o cliente
# O tsconfig.json na raiz do projeto usa paths que dependem da raiz do projeto,
# então o build deve ser executado a partir da raiz do projeto.
RUN cd client && npm install && npm run build

# Estágio 2: Servir a aplicação com Nginx
FROM nginx:stable-alpine

# Copiar os ativos construídos do estágio de construção
COPY --from=builder /app/client/dist /usr/share/nginx/html

# Expor a porta 80
EXPOSE 80

# Comando para iniciar o Nginx
CMD ["nginx", "-g", "daemon off;"]
