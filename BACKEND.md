# Gaia 10.0 - Fase 2: Backend Blindado

## 📋 Visão Geral

Backend seguro e robusto para o projeto Gaia, construído com Node.js, Express e PostgreSQL em Docker. Implementa autenticação JWT, criptografia AES-256, rate limiting e logging completo de acessos.

## 🏗️ Arquitetura

### Stack Tecnológico

- **Runtime**: Node.js 20
- **Framework**: Express.js
- **Banco de Dados**: PostgreSQL 15
- **Autenticação**: JWT (JSON Web Tokens)
- **Criptografia**: bcrypt (senhas) + AES-256 (chaves de API)
- **Rate Limiting**: express-rate-limit
- **Containerização**: Docker + Docker Compose

### Estrutura de Diretórios

```
server/
├── src/
│   ├── config/          # Configuração de banco de dados
│   ├── middleware/      # Middlewares (auth, logging, rate limiting)
│   ├── routes/          # Rotas da API
│   ├── utils/           # Utilitários (criptografia, JWT)
│   └── index.ts         # Arquivo principal
├── dist/                # Código compilado
├── package.json
├── tsconfig.json
├── .env                 # Variáveis de ambiente
└── Dockerfile
```

## 🔐 Segurança

### Autenticação

- **JWT com expiração de 15 minutos**
- Tokens assinados com HS256
- Validação em todas as rotas protegidas
- Captura de IP do cliente em logs

### Criptografia

- **Senhas**: bcrypt com salt de 12 rounds
- **Chaves de API**: AES-256 com chave secreta
- Todas as chaves armazenadas criptografadas no banco

### Rate Limiting

- **Login**: 5 tentativas por minuto
- **Salvar chaves**: 10 requisições por minuto
- **Geral**: 100 requisições por minuto

### Logging

- Log de todos os acessos (IP, timestamp, ação)
- Armazenamento em tabela `access_logs`
- Rastreamento de usuário, método HTTP e status

## 🚀 Como Usar

### Pré-requisitos

- Docker e Docker Compose instalados
- Node.js 20+ (para desenvolvimento local)

### Iniciar com Docker Compose

```bash
# Clonar repositório
git clone https://github.com/keday49c/Gaia-10.0.git
cd Gaia-10.0

# Checkout na branch blindada
git checkout blindada

# Iniciar containers
docker-compose up -d

# Aguardar inicialização (20-30 segundos)
docker-compose logs -f backend

# Verificar saúde
curl http://localhost:3001/health
```

### Desenvolvimento Local

```bash
# Instalar dependências
cd server
npm install

# Configurar banco de dados (PostgreSQL rodando localmente)
# Criar banco: createdb gaia_db
# Executar init-db.sql

# Variáveis de ambiente
cp .env.example .env
# Editar .env com suas configurações

# Iniciar servidor
npm run dev

# Build para produção
npm run build
npm start
```

## 📡 Endpoints da API

### Autenticação

#### POST `/auth/login`
Autentica um usuário e retorna um JWT.

**Request:**
```json
{
  "email": "usuario@example.com",
  "senha": "sua_senha_forte_aqui"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login realizado com sucesso",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "email": "usuario@example.com"
  }
}
```

#### POST `/auth/register`
Registra um novo usuário.

**Request:**
```json
{
  "email": "novo@example.com",
  "senha": "senha_forte_com_20_caracteres_ou_mais"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Usuário registrado com sucesso",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "email": "novo@example.com"
  }
}
```

### Chaves de API

#### POST `/keys/salvar`
Salva as chaves de API criptografadas.

**Headers:**
```
Authorization: Bearer {token}
```

**Request:**
```json
{
  "google_ads": "sua-chave-google-ads",
  "instagram": "sua-chave-instagram",
  "whatsapp": "sua-chave-whatsapp"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Chaves de API salvas com sucesso",
  "data": {
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "email": "usuario@example.com"
  }
}
```

#### GET `/keys/meus-dados`
Retorna os dados do usuário com chaves descriptografadas e logs de acesso.

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "usuario": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "usuario@example.com",
      "criadoEm": "2025-10-27T15:30:00Z",
      "atualizadoEm": "2025-10-27T15:35:00Z"
    },
    "chaves": {
      "google_ads": "sua-chave-google-ads",
      "instagram": "sua-chave-instagram",
      "whatsapp": "sua-chave-whatsapp"
    },
    "logs": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440001",
        "ip_address": "192.168.1.1",
        "acao": "POST /keys/salvar",
        "timestamp": "2025-10-27T15:35:00Z",
        "detalhes": {
          "statusCode": 200,
          "duration": 45
        }
      }
    ]
  }
}
```

### Health Check

#### GET `/health`
Verifica a saúde do servidor.

**Response (200):**
```json
{
  "status": "ok",
  "timestamp": "2025-10-27T15:30:00Z"
}
```

## 🗄️ Schema do Banco de Dados

### Tabela: users
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  senha VARCHAR(255) NOT NULL,
  chaves_api JSONB,
  criado_em TIMESTAMP,
  atualizado_em TIMESTAMP
);
```

### Tabela: access_logs
```sql
CREATE TABLE access_logs (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  ip_address VARCHAR(45),
  acao VARCHAR(100),
  timestamp TIMESTAMP,
  detalhes JSONB
);
```

### Tabela: jwt_sessions
```sql
CREATE TABLE jwt_sessions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  token_hash VARCHAR(255) UNIQUE,
  criado_em TIMESTAMP,
  expira_em TIMESTAMP,
  revogado BOOLEAN
);
```

## 🔧 Variáveis de Ambiente

| Variável | Padrão | Descrição |
|----------|--------|-----------|
| `DATABASE_URL` | - | URL de conexão PostgreSQL |
| `DB_HOST` | postgres | Host do banco |
| `DB_PORT` | 5432 | Porta do banco |
| `DB_USER` | gaia_user | Usuário do banco |
| `DB_PASSWORD` | gaia_password | Senha do banco |
| `DB_NAME` | gaia_db | Nome do banco |
| `JWT_SECRET` | - | Chave secreta JWT |
| `JWT_EXPIRATION` | 15m | Expiração do JWT |
| `PORT` | 3001 | Porta do servidor |
| `NODE_ENV` | development | Ambiente |
| `AES_SECRET_KEY` | - | Chave AES-256 |
| `CORS_ORIGIN` | http://localhost:3000 | Origem CORS |

## 📊 Monitoramento

### Logs do Docker

```bash
# Ver logs do backend
docker-compose logs -f backend

# Ver logs do banco de dados
docker-compose logs -f postgres

# Ver logs de um container específico
docker logs -f gaia-backend
```

### Verificar Conexão

```bash
# Testar conexão com banco
curl http://localhost:3001/test-db

# Verificar saúde do servidor
curl http://localhost:3001/health
```

## 🛑 Parar os Containers

```bash
# Parar containers
docker-compose down

# Parar e remover volumes
docker-compose down -v
```

## 📝 Notas de Desenvolvimento

- **Senhas**: Sempre com mínimo 20 caracteres
- **Rate Limiting**: Configurável por rota
- **Logging**: Automático para todas as requisições
- **Criptografia**: AES-256 para chaves de API
- **JWT**: Expiração curta (15 min) para segurança

## 🚀 Próximas Fases

- Fase 3: Integração com APIs (Google Ads, Instagram, TikTok, WhatsApp)
- Fase 4: Processamento de Campanhas
- Fase 5: IA Gemini para Análise
- Fase 6: Interface Móvel

---

**Versão**: 2.0.0  
**Data**: Outubro 2025  
**Status**: Blindado e Pronto para Produção

