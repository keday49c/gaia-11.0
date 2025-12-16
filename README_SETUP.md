# 🚀 Gaia 10.0 - Setup Completo

Guia passo-a-passo para configurar e executar o Gaia 10.0 em seu ambiente local.

---

## 📋 Pré-requisitos

- **Docker** (versão 20.10+)
- **Docker Compose** (versão 2.0+)
- **Node.js** (versão 20+) - Apenas se rodar sem Docker
- **npm** ou **pnpm**

---

## 🐳 Opção 1: Com Docker (Recomendado)

### Passo 1: Clonar o repositório

```bash
git clone https://github.com/seu-usuario/Gaia-10.0.git
cd Gaia-10.0
```

### Passo 2: Configurar variáveis de ambiente

Copie o arquivo de exemplo:

```bash
cp .env.example .env
```

Edite `.env` se necessário (valores padrão funcionam para desenvolvimento):

```env
VITE_API_URL=http://localhost:3001
PORT=3001
JWT_SECRET=gaia-super-secret-jwt-key-2025-change-in-production
NODE_ENV=development
```

### Passo 3: Iniciar os containers

```bash
docker-compose up -d
```

Aguarde 30 segundos para os containers iniciarem.

### Passo 4: Verificar status

```bash
docker-compose ps
```

Você deve ver:
- ✅ `gaia-postgres` - Healthy
- ✅ `gaia-backend` - Running

### Passo 5: Acessar a aplicação

**Frontend:** http://localhost:3000

**Backend API:** http://localhost:3001

**Health Check:** http://localhost:3001/health

---

## 💻 Opção 2: Sem Docker (Desenvolvimento Local)

### Passo 1: Instalar dependências do backend

```bash
cd server
npm install
```

### Passo 2: Configurar banco de dados

Certifique-se de que PostgreSQL está rodando localmente:

```bash
# macOS (com Homebrew)
brew services start postgresql

# Linux (Ubuntu/Debian)
sudo systemctl start postgresql

# Windows
# Inicie o PostgreSQL via Services ou PostgreSQL installer
```

### Passo 3: Criar banco de dados

```bash
psql -U postgres -c "CREATE DATABASE gaia_db;"
psql -U postgres -d gaia_db -f ../init-db.sql
```

### Passo 4: Configurar variáveis de ambiente

```bash
cp server/.env.example server/.env
```

Edite `server/.env`:

```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/gaia_db
PORT=3001
JWT_SECRET=gaia-super-secret-jwt-key-2025-change-in-production
NODE_ENV=development
```

Para ativar a análise por IA (gera recomendações reais), adicione as variáveis abaixo em `server/.env` ou no ambiente do container:

```env
AI_PROVIDER=gemini   # ou 'openai'
OPENAI_API_KEY=sk-...
GEMINI_API_KEY=ya29...
OPENAI_MODEL=gpt-4o-mini
GEMINI_MODEL=models/text-bison-001
```

Se for usar CI (GitHub Actions), **adicione as chaves como GitHub Secrets** (Repository > Settings > Secrets > Actions):
- `OPENAI_API_KEY` (se usar OpenAI)
- `GEMINI_API_KEY` (se usar Gemini/Google)

O workflow de smoke tests foi atualizado para **rodar os testes de análise somente quando estes secrets estiverem presentes**. Se as variáveis não estiverem definidas localmente a rota `/campaigns/:id/analisar` retornará 501 (Not Implemented) com instruções.


### Passo 5: Iniciar o backend

```bash
npm run dev
```

### Passo 6: Em outro terminal, iniciar o frontend

```bash
cd frontend
npm install
npm run dev
```

---

## 🔐 Credenciais de Login

### Modo Visitante (Sem autenticação)

Clique em **"Acessar como Visitante"** na tela de login.

### Login Padrão

| Campo | Valor |
|-------|-------|
| **Email** | `admin@gaia.local` |
| **Senha** | `admin123` |

### Criar novo usuário

Use o formulário de **Registro** na tela de login.

---

## 📡 API Endpoints

### Autenticação

```bash
# Login
POST /auth/login
Content-Type: application/json

{
  "email": "admin@gaia.local",
  "senha": "admin123"
}

# Registro
POST /auth/register
Content-Type: application/json

{
  "email": "novo@usuario.com",
  "senha": "senha123",
  "nome": "Novo Usuário"
}

# Modo Visitante
POST /auth/guest
```

### Chaves de API

```bash
# Salvar chaves
POST /keys/salvar
Authorization: Bearer {token}
Content-Type: application/json

{
  "google_ads_key": "sua-chave-aqui",
  "instagram_token": "seu-token-aqui",
  "whatsapp_token": "seu-token-aqui"
}

# Obter dados do usuário
GET /keys/meus-dados
Authorization: Bearer {token}
```

### Campanhas

```bash
# Listar campanhas
GET /campaigns/lista
Authorization: Bearer {token}

# Criar campanha
POST /campaigns/criar
Authorization: Bearer {token}
Content-Type: application/json

{
  "nome": "Minha Campanha",
  "descricao": "Descrição da campanha",
  "tipo": "anuncio",
  "plataforma": "google_ads",
  "orcamento": 1000
}

# Disparar campanha
POST /campaigns/disparar
Authorization: Bearer {token}
Content-Type: application/json

{
  "campaignId": "uuid-da-campanha"
}

# Obter métricas
GET /campaigns/{campaignId}/metricas
Authorization: Bearer {token}

# Analisar campanha com IA (Real)
POST /campaigns/{campaignId}/analisar
Authorization: Bearer {token}

Notes:
- This endpoint calls an external AI provider (OpenAI or Google Gemini) and persists recommendations in the DB.
- To enable, set `AI_PROVIDER` and provider credentials in `server/.env` (see `server/.env.example`).
- If the server is not configured with AI credentials it returns HTTP 501 (Not Implemented).
```

---

## 🐛 Troubleshooting

### Backend não conecta ao banco de dados

**Erro:** `Error: connect ECONNREFUSED 127.0.0.1:5432`

**Solução:**
- Verifique se PostgreSQL está rodando
- Verifique as credenciais em `.env`
- Verifique se o banco de dados `gaia_db` existe

### Frontend não conecta ao backend

**Erro:** `Error: Network Error` ou `CORS error`

**Solução:**
- Verifique se o backend está rodando em `http://localhost:3001`
- Verifique a variável `VITE_API_URL` em `.env`
- Se usar Docker, use `http://172.18.0.3:3001` (IP do container)

### Porta 3001 já está em uso

**Erro:** `Error: listen EADDRINUSE :::3001`

**Solução:**
```bash
# Encontrar processo usando a porta
lsof -i :3001

# Matar o processo
kill -9 {PID}

# Ou mudar a porta em .env
PORT=3002
```

### Container PostgreSQL não inicia

**Erro:** `Health check failed`

**Solução:**
```bash
# Verificar logs
docker logs gaia-postgres

# Remover volume e recomeçar
docker-compose down -v
docker-compose up -d
```

---

## 🧹 Limpeza

### Parar containers

```bash
docker-compose down
```

### Remover dados (banco de dados)

```bash
docker-compose down -v
```

### Limpar tudo (containers, imagens, volumes)

```bash
docker-compose down -v --rmi all
```

---

## 📚 Estrutura do Projeto

```
Gaia-10.0/
├── server/                 # Backend Express + TypeScript
│   ├── index.ts           # Servidor principal
│   ├── db.ts              # Conexão PostgreSQL
│   ├── test-keys.ts       # Dados de teste
│   ├── package.json       # Dependências do backend
│   ├── tsconfig.json      # Configuração TypeScript
│   └── .env               # Variáveis de ambiente
├── client/                # Frontend React + Vite
│   ├── src/
│   │   ├── pages/         # Páginas
│   │   ├── components/    # Componentes
│   │   └── App.tsx        # Componente raiz
│   └── package.json       # Dependências do frontend
├── docker-compose.yml     # Configuração Docker
├── Dockerfile             # Build do backend
├── .env.example           # Exemplo de variáveis
└── README.md              # Este arquivo
```

---

## 🚀 Próximos Passos

1. **Integrar APIs reais** (Google Ads, Instagram, WhatsApp)
2. **Implementar dashboard** com gráficos de métricas
3. **Adicionar autenticação OAuth**
4. **Criar sistema de notificações**
5. **Implementar automação de campanhas**

---

## 📞 Suporte

Para problemas ou dúvidas:
- Abra uma issue no GitHub
- Verifique a documentação em `GAIA_COMPLETO.md`
- Consulte os logs: `docker logs gaia-backend`

---

## 📄 Licença

MIT License - Veja LICENSE para detalhes


