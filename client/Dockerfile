# Estágio 1: Construir a aplicação
# Usamos uma imagem Debian slim para o estágio de build para evitar falhas
# de dependências nativas que ocorrem em Alpine/musl (ex.: rollup native).
FROM node:20-slim AS builder

# Definir o diretório de trabalho no contêiner
WORKDIR /app

# Copiar os arquivos package.json e package-lock.json da raiz e do cliente
# Esta etapa é crucial para o cache. Se estes arquivos mudarem, o npm install será refeito.
COPY package*.json ./
COPY client/package*.json ./client/

# Instalar dependências do monorepo e do cliente. Não omitimos dependências opcionais
# no ambiente Debian-slim para permitir instalação de binários nativos necessários (rollup native).
# Remove any package-lock files to allow npm to resolve optional/native
# dependencies for the current build platform, then install.
RUN rm -f package-lock.json client/package-lock.json || true \
	&& npm install --legacy-peer-deps

# Copiar o restante do código-fonte do projeto
COPY . .

# Construir o cliente, tentando ignorar dependências opcionais que causam falhas em alguns
# ambientes de CI/container. Se a primeira tentativa falhar, reexecuta sem --no-optional.
RUN cd client && npm run build

# Estágio 2: Servir a aplicação com Nginx
FROM nginx:stable-alpine

# Copiar os ativos construídos do estágio de construção
# O `vite.config.ts` do projeto gera os arquivos em `/app/dist/public` (fora da pasta `client`).
# Ajustamos o caminho de cópia para corresponder ao `outDir` configurado.
COPY --from=builder /app/dist/public /usr/share/nginx/html

# Copy our custom Nginx config (overrides default). This config proxies /api to the
# backend service and enables SPA fallback (try_files -> index.html).
COPY client/nginx/default.conf /etc/nginx/conf.d/default.conf

# Expor a porta 80
EXPOSE 80

# Comando para iniciar o Nginx
CMD ["nginx", "-g", "daemon off;"]

