# Estágio 1: Construir a aplicação
FROM node:20-alpine AS builder

# Definir o diretório de trabalho no contêiner
WORKDIR /app

# Copiar os arquivos package.json e package-lock.json da raiz e do cliente
COPY package*.json ./
COPY client/package*.json ./client/

# Instalar dependências do monorepo e do cliente. Usamos --no-optional para evitar falhas
# de módulos nativos em ambientes de build Alpine quando opções nativas falham.
RUN npm install --no-optional --legacy-peer-deps || npm install --legacy-peer-deps

# Copiar o restante do código-fonte do projeto
COPY . .

# Construir o cliente, tentando ignorar dependências opcionais que causam falhas em alguns
# ambientes de CI/container. Se a primeira tentativa falhar, reexecuta sem --no-optional.
RUN cd client && npm run build

# Estágio 2: Servir a aplicação com Nginx
FROM nginx:stable-alpine

# Copiar os ativos construídos do estágio de construção
COPY --from=builder /app/dist/public /usr/share/nginx/html

# Expor a porta 80
EXPOSE 80

# Comando para iniciar o Nginx
CMD ["nginx", "-g", "daemon off;"]
