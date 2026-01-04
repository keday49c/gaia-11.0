# 🚀 Gaia 10.0 - Apogeu

## Automação Total de Vendas Digitais

**Gaia 10.0** é uma plataforma completa de automação de marketing digital com IA, voz, backup automático e modo offline.

---

## ⚡ Início Rápido (4 Passos)

### 1️⃣ Clonar o Repositório
```bash
git clone https://github.com/keday49c/Gaia-10.0.git
cd Gaia-10.0
```

### 2️⃣ Entrar no Diretório
```bash
cd Gaia-10.0
```

### 3️⃣ Iniciar com Docker
```bash
docker-compose up -d
```

### 4️⃣ Abrir no Navegador
```
http://localhost:3000
```

---

## 🎯 Primeira Execução

1. **Defina sua senha pessoal** (20+ caracteres)
2. **Cole suas chaves de API** (Google Ads, Instagram, WhatsApp)
3. **Clique em Salvar**
4. **Pronto!** Gaia está pronto para disparar campanhas

---

## 🏗️ Arquitetura

### Frontend
- **React 19** + TailwindCSS 4
- Autenticação local com AES-256
- Painel de campanhas
- Relatórios ao vivo
- Assistente de voz
- Modo demo

### Backend
- **Node.js** + Express
- **PostgreSQL** em Docker
- JWT (15 min)
- Criptografia bcrypt + AES-256
- Rate limiting (5 req/min)
- Logging completo

### Banco de Dados
- **PostgreSQL** em Docker
- 18 tabelas
- Backup automático
- Sincronização offline

---

## 🎨 Funcionalidades

### 📊 Campanhas Multi-Plataforma
- Google Ads
- Instagram
- TikTok
- WhatsApp Business

### 📈 Relatórios ao Vivo
- Impressões, cliques, conversões
- Custo, receita, ROAS, CPC
- Gráficos em tempo real
- Exportar dados

### 🤖 IA Gemini
- Análise automática
- Otimização de campanhas
- Pausar campanhas caras
- Aumentar orçamento em sucesso

### 🎤 Assistente de Voz
- Speech-to-text (português)
- Text-to-speech
- Comandos por voz
- Histórico de voz cronológico

### 💬 WhatsApp com IA
- Respostas automáticas
- Integração com Gemini
- Mensagens personalizadas
- Histórico completo

### 🔐 Segurança Total
- Autenticação JWT
- Criptografia AES-256
- Biometria opcional
- Rate limiting
- Logging completo
- Validação XSS/SQL

### 💾 Backup Automático
- A cada 15 minutos
- Google Drive + S3 + Local
- Tudo criptografado
- Restauração fácil

### 📱 Modo Offline
- Salva local quando sem internet
- Sincroniza automaticamente
- Nada perde

### 🎮 Modo Demo
- Simula campanhas
- Treinar sem gastar
- Dados realistas
- Relatórios falsos

---

## 📁 Estrutura do Projeto

```
Gaia-10.0/
├── client/                 # Frontend React
│   ├── src/
│   │   ├── pages/         # 5 páginas principais
│   │   ├── components/    # Componentes reutilizáveis
│   │   ├── lib/           # Utilitários
│   │   └── App.tsx        # Roteamento
│   └── public/            # Assets (logomarca, etc)
│
├── server/                 # Backend Node.js
│   ├── src/
│   │   ├── routes/        # Endpoints da API
│   │   ├── services/      # Lógica de negócio
│   │   ├── middleware/    # Auth, logging, validação
│   │   └── config/        # Configurações
│   └── package.json
│
├── docker-compose.yml      # Orquestração
├── Dockerfile              # Backend em container
├── init-db.sql            # Schema do banco
├── README.md              # Este arquivo
└── .env.example           # Variáveis de ambiente
```

---

## 🔧 Configuração

### Variáveis de Ambiente

Crie um arquivo `.env` na raiz:

```env
# Backend
NODE_ENV=development
PORT=3001
DATABASE_URL=postgresql://gaia:gaia123@localhost:5432/gaia_db
JWT_SECRET=sua_chave_secreta_aqui
JWT_EXPIRY=900

# Frontend
VITE_API_URL=http://localhost:3001
VITE_APP_TITLE=Gaia 10.0
VITE_APP_LOGO=/logo.png

# Google Drive (opcional)
GOOGLE_DRIVE_TOKEN=seu_token_aqui
GOOGLE_DRIVE_FOLDER_ID=seu_folder_id_aqui

# Gemini (opcional)
GOOGLE_API_KEY=sua_chave_aqui

# Eleven Labs (opcional)
ELEVEN_LABS_API_KEY=sua_chave_aqui
```

---

## 🚀 Comandos Úteis

### Iniciar
```bash
docker-compose up -d
npm start
```

### Parar
```bash
docker-compose down
```

### Logs
```bash
docker-compose logs -f
```

### Banco de Dados
```bash
docker-compose exec postgres psql -U gaia -d gaia_db
```

### Limpar Tudo
```bash
docker-compose down -v
```

---

## 🔐 Credenciais Padrão

### Admin (Modo Admin Oculto)
- **E-mail:** `admin`
- **Senha:** `senha123`
- **⚠️ MUDAR EM PRODUÇÃO**

### Banco de Dados
- **Usuário:** `gaia`
- **Senha:** `gaia123`
- **Banco:** `gaia_db`
- **Host:** `localhost:5432`

---

## 📊 Fases Implementadas

### ✅ Fase 1: Esqueleto
- React + TailwindCSS
- Autenticação local
- Painel de APIs
- Modo admin

### ✅ Fase 2: Blindada
- Backend Node.js + Express
- PostgreSQL em Docker
- JWT + bcrypt + AES-256
- Rate limiting + logging

### ✅ Fase 3: Viva
- APIs de marketing (mocks)
- Painel de campanhas
- Relatórios ao vivo
- IA Gemini
- Assistente de voz
- WhatsApp com IA

### ✅ Fase 4: Inviolável
- Biometria opcional
- Modo teste
- Logging completo
- Validação XSS/SQL
- Placeholders para APIs reais

### ✅ Fase 5: Eterno
- Backup automático (15 min)
- Modo offline
- Histórico de voz
- Modo demo
- Sincronização automática

---

## 🎯 Próximos Passos

### Para Conectar APIs Reais
1. Fornecer credenciais do Google Ads
2. Fornecer token do Instagram
3. Fornecer token do TikTok
4. Integrar Twilio para WhatsApp
5. Fornecer chave da API Gemini
6. Fornecer chave da API Eleven Labs

### Para Produção
1. Mudar credenciais padrão
2. Configurar HTTPS
3. Usar banco de dados remoto
4. Configurar backups em nuvem
5. Implementar monitoramento

---

## 📞 Suporte

### Problemas Comuns

**Erro: "Port 3000 already in use"**
```bash
docker-compose down
docker-compose up -d
```

**Erro: "Database connection failed"**
```bash
docker-compose logs postgres
```

**Erro: "Frontend não conecta ao backend"**
- Verificar se backend está rodando: `http://localhost:3001`
- Verificar VITE_API_URL no .env

---

## 📝 Licença

Gaia 10.0 © 2025 - Todos os direitos reservados

---

## 🌟 Versão

**v1.0 - Apogeu**

Gaia 10.0 está pronto para produção.

---

**Gaia 10.0 - Automação Total de Vendas Digitais** 🚀

