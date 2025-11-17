# 🚀 SETUP PASSO A PASSO - Gaia 10.0

Guia completo para limpar tudo e começar do zero com a estrutura corrigida.

---

## 🧹 PASSO 1: LIMPAR TUDO (Windows PowerShell 7)

### 1.1 Parar todos os containers

```powershell
# Abra PowerShell 7 como Administrador
pwsh

# Parar todos os containers
docker-compose down -v

# Ou se estiver em outro diretório
cd C:\gaia-docker
docker-compose down -v
```

**Resultado esperado:**
```
Removing gaia-backend ... done
Removing gaia-postgres ... done
Removing network gaia-docker_gaia-network ... done
Removing volume gaia-docker_postgres_data ... done
```

---

### 1.2 Remover imagens antigas

```powershell
# Ver imagens criadas
docker images | findstr gaia

# Remover imagens do gaia-docker
docker rmi gaia-docker-backend -f
docker rmi gaia-docker-postgres -f

# Ou remover tudo relacionado a gaia
docker images --filter "reference=*gaia*" -q | ForEach-Object { docker rmi $_ -f }
```

---

### 1.3 Limpar volumes antigos

```powershell
# Ver volumes
docker volume ls | findstr gaia

# Remover volumes
docker volume rm gaia-docker_postgres_data

# Ou limpar tudo
docker system prune -a --volumes -f
```

---

### 1.4 Apagar pasta local antiga

```powershell
# Navegar até a pasta pai
cd C:\

# Apagar pasta antiga
Remove-Item -Recurse -Force gaia-docker

# Confirmar que foi deletada
ls C:\ | findstr gaia
# (não deve mostrar nada)
```

**Alternativa (via File Explorer):**
1. Abra `C:\`
2. Clique direito em `gaia-docker`
3. Selecione **Deletar**
4. Confirme

---

## 📥 PASSO 2: CLONAR REPOSITÓRIO CORRIGIDO

### 2.1 Clonar do GitHub

```powershell
# Navegar até C:\
cd C:\

# Clonar repositório
git clone https://github.com/keday49c/Gaia-10.0.git gaia-docker

# Entrar na pasta
cd gaia-docker

# Verificar que está na branch master
git branch
# Deve mostrar: * master
```

**Resultado esperado:**
```
Cloning into 'gaia-docker'...
remote: Enumerating objects: ...
Receiving objects: 100% (...)
```

---

### 2.2 Verificar estrutura

```powershell
# Ver estrutura de pastas
ls

# Deve mostrar:
# - client/
# - server/
# - docker-compose.yml
# - Dockerfile
# - package.json
# - README_SETUP.md
# - TROUBLESHOOTING.md
# - etc.
```

---

## 🎯 OPÇÃO A: RODAR COM DOCKER (Recomendado)

### 3A.1 Criar arquivo .env

```powershell
# Criar arquivo .env
@"
VITE_API_URL=http://localhost:3001
PORT=3001
JWT_SECRET=gaia-super-secret-jwt-key-2025-change-in-production
NODE_ENV=development
"@ | Out-File -Encoding UTF8NoBOM .env
```

---

### 3A.2 Iniciar containers

```powershell
# Iniciar Docker Compose
docker-compose up -d

# Aguardar 30 segundos para inicializar
Start-Sleep -Seconds 30

# Verificar status
docker-compose ps
```

**Resultado esperado:**
```
NAME              IMAGE                    STATUS
gaia-postgres     postgres:15-alpine       Up 25 seconds (healthy)
gaia-backend      gaia-docker-backend      Up 20 seconds
```

---

### 3A.3 Verificar logs

```powershell
# Ver logs do backend
docker logs gaia-backend

# Ver logs do PostgreSQL
docker logs gaia-postgres

# Seguir logs em tempo real
docker logs -f gaia-backend
```

**Resultado esperado (backend):**
```
✅ Servidor Gaia rodando em http://localhost:3001
📊 Modo: Backend Real com PostgreSQL
🎭 Modo Visitante disponível em POST /auth/guest
🔐 Autenticação JWT ativada
🌐 CORS Origins: http://localhost:3000,http://172.18.0.1:3000,...
```

---

### 3A.4 Testar backend

```powershell
# Testar health check
curl http://localhost:3001/health

# Testar modo visitante
curl -X POST http://localhost:3001/auth/guest `
  -Headers @{"Content-Type"="application/json"}
```

**Resultado esperado:**
```json
{
  "success": true,
  "data": {
    "status": "ok",
    "timestamp": "2025-11-17T...",
    "database": "connected"
  }
}
```

---

### 3A.5 Abrir frontend no navegador

```powershell
# Abrir navegador (Windows)
start http://localhost:3000

# Ou manualmente
# Copie e cole na barra de endereços:
# http://localhost:3000
```

---

## 🎯 OPÇÃO B: RODAR LOCALMENTE (Sem Docker)

### 3B.1 Instalar PostgreSQL (se não tiver)

**Windows:**
1. Download: https://www.postgresql.org/download/windows/
2. Execute o instalador
3. Anote a senha do usuário `postgres`
4. Instale no caminho padrão

**Verificar instalação:**
```powershell
psql --version
```

---

### 3B.2 Criar banco de dados

```powershell
# Conectar ao PostgreSQL
psql -U postgres

# No prompt do psql, execute:
CREATE DATABASE gaia_db;
\q
```

---

### 3B.3 Inicializar banco de dados

```powershell
# Executar script de inicialização
psql -U postgres -d gaia_db -f init-db.sql

# Verificar tabelas criadas
psql -U postgres -d gaia_db -c "\dt"
```

---

### 3B.4 Instalar dependências do backend

```powershell
# Navegar até server
cd C:\gaia-docker\server

# Instalar dependências
npm install

# Verificar instalação
npm list
```

---

### 3B.5 Criar arquivo .env do backend

```powershell
# Criar arquivo .env
@"
DATABASE_URL=postgresql://postgres:sua_senha@localhost:5432/gaia_db
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=sua_senha
DB_NAME=gaia_db
PORT=3001
NODE_ENV=development
JWT_SECRET=gaia-super-secret-jwt-key-2025-change-in-production
AES_SECRET_KEY=gaia-aes-secret-key-2025-change-in-production
CORS_ORIGIN=http://localhost:3000
"@ | Out-File -Encoding UTF8NoBOM .env
```

⚠️ **IMPORTANTE:** Substitua `sua_senha` pela senha do PostgreSQL que você definiu!

---

### 3B.6 Iniciar backend

```powershell
# Ainda em C:\gaia-docker\server
npm run dev

# Resultado esperado:
# ✅ Servidor Gaia rodando em http://localhost:3001
```

⚠️ **Deixe este terminal aberto!**

---

### 3B.7 Em outro terminal: Instalar dependências do frontend

```powershell
# Abra novo PowerShell 7
pwsh

# Navegar até client
cd C:\gaia-docker\client

# Instalar dependências
npm install

# Verificar instalação
npm list
```

---

### 3B.8 Criar arquivo .env do frontend

```powershell
# Criar arquivo .env
@"
VITE_API_URL=http://localhost:3001
"@ | Out-File -Encoding UTF8NoBOM .env
```

---

### 3B.9 Iniciar frontend (Vite)

```powershell
# Ainda em C:\gaia-docker\client
npm run dev

# Resultado esperado:
# VITE v7.1.9  ready in XXX ms
# ➜  Local:   http://localhost:3000/
# ➜  Network: http://192.168.x.x:3000/
```

⚠️ **Deixe este terminal aberto!**

---

### 3B.10 Abrir frontend no navegador

```powershell
# Em um terceiro terminal
start http://localhost:3000

# Ou manualmente copie:
# http://localhost:3000
```

---

## 📊 RESUMO DOS TERMINAIS (Opção B - Local)

Você precisa de **3 terminais PowerShell** abertos simultaneamente:

| Terminal | Comando | Porta |
|----------|---------|-------|
| **Terminal 1** | `npm run dev` (em `server/`) | 3001 |
| **Terminal 2** | `npm run dev` (em `client/`) | 3000 |
| **Terminal 3** | Navegador / Comandos | - |

---

## 🔐 FAZER LOGIN

### Credenciais Padrão

| Campo | Valor |
|-------|-------|
| **Email** | `admin@gaia.local` |
| **Senha** | `admin123` |

### Ou Modo Visitante

Clique em **"Acessar como Visitante"** para entrar sem autenticação.

---

## 🧪 TESTAR ENDPOINTS DA API

### Testar Login

```powershell
curl -X POST http://localhost:3001/auth/login `
  -Headers @{"Content-Type"="application/json"} `
  -Body '{"email":"admin@gaia.local","senha":"admin123"}'
```

### Testar Modo Visitante

```powershell
curl -X POST http://localhost:3001/auth/guest `
  -Headers @{"Content-Type"="application/json"}
```

### Testar Health Check

```powershell
curl http://localhost:3001/health
```

---

## 📝 ESTRUTURA DE PASTAS ESPERADA

```
C:\gaia-docker\
├── client/                 # Frontend React + Vite
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── lib/
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   ├── vite.config.ts
│   └── .env
├── server/                 # Backend Express + Node
│   ├── index.ts
│   ├── db.ts
│   ├── test-keys.ts
│   ├── package.json
│   ├── tsconfig.json
│   └── .env
├── docker-compose.yml
├── Dockerfile
├── .env
├── package.json
├── README_SETUP.md
├── TROUBLESHOOTING.md
└── SETUP_PASSO_A_PASSO.md
```

---

## ✅ CHECKLIST DE VERIFICAÇÃO

- [ ] Deletou pasta `C:\gaia-docker` antiga
- [ ] Clonou repositório novo
- [ ] Criou arquivo `.env` na raiz
- [ ] **Se Docker:**
  - [ ] Executou `docker-compose up -d`
  - [ ] Aguardou 30 segundos
  - [ ] Verificou `docker-compose ps`
  - [ ] Testou `curl http://localhost:3001/health`
- [ ] **Se Local:**
  - [ ] PostgreSQL instalado e rodando
  - [ ] Banco de dados `gaia_db` criado
  - [ ] Instalou dependências do backend (`npm install`)
  - [ ] Instalou dependências do frontend (`npm install`)
  - [ ] Criou `.env` em `server/`
  - [ ] Criou `.env` em `client/`
  - [ ] Backend rodando em terminal 1 (`npm run dev`)
  - [ ] Frontend rodando em terminal 2 (`npm run dev`)
- [ ] Acessou http://localhost:3000 no navegador
- [ ] Conseguiu fazer login ou acessar modo visitante

---

## 🆘 SE ALGO DER ERRADO

**Veja:** `TROUBLESHOOTING.md` para soluções detalhadas

Comandos rápidos:
```powershell
# Reset completo (Docker)
docker-compose down -v
docker system prune -a -f
docker-compose up -d --build

# Reset completo (Local)
rm -r node_modules
npm install
npm run dev
```

---

## 📞 PRÓXIMOS PASSOS

1. ✅ Setup completo (Docker ou Local)
2. ✅ Fazer login ou acessar como visitante
3. ⏭️ Integrar APIs reais (Google Ads, Instagram, WhatsApp)
4. ⏭️ Implementar dashboard com gráficos
5. ⏭️ Adicionar automação de campanhas

---

## 📚 REFERÊNCIAS

- **Setup:** `README_SETUP.md`
- **Troubleshooting:** `TROUBLESHOOTING.md`
- **API:** `API_REFERENCE.md`
- **Documentação Completa:** `GAIA_COMPLETO.md`


