# 🔧 Guia de Troubleshooting - Gaia 10.0

Soluções para problemas comuns ao executar o Gaia 10.0.

---

## 🐳 Problemas com Docker

### ❌ Erro: "Cannot find path 'C:\gaia-docker\frontend\.env.example'"

**Causa:** Arquivo `.env.example` não existe

**Solução:**
```bash
# Criar arquivo .env manualmente
echo "VITE_API_URL=http://localhost:3001" > .env
```

---

### ❌ Erro: "Error: listen EADDRINUSE :::3001"

**Causa:** Porta 3001 já está em uso

**Solução (Linux/macOS):**
```bash
# Encontrar processo usando a porta
lsof -i :3001

# Matar o processo
kill -9 {PID}

# Ou mudar a porta em docker-compose.yml
```

**Solução (Windows):**
```powershell
# Encontrar processo
netstat -ano | findstr :3001

# Matar o processo
taskkill /PID {PID} /F

# Ou mudar a porta em docker-compose.yml
```

---

### ❌ Erro: "Health check failed" no PostgreSQL

**Causa:** PostgreSQL não consegue iniciar ou não responde

**Solução:**
```bash
# Ver logs detalhados
docker logs gaia-postgres

# Remover volume e recomeçar
docker-compose down -v
docker-compose up -d

# Aguardar 30 segundos
sleep 30

# Verificar status
docker-compose ps
```

---

### ❌ Erro: "Cannot connect to Docker daemon"

**Causa:** Docker não está rodando

**Solução:**
- **Windows:** Abra Docker Desktop
- **macOS:** `open /Applications/Docker.app`
- **Linux:** `sudo systemctl start docker`

---

### ❌ Erro: "Build failed" no Dockerfile

**Causa:** Dependências não instaladas ou erro de sintaxe

**Solução:**
```bash
# Limpar cache e reconstruir
docker-compose down -v
docker system prune -a
docker-compose up -d --build
```

---

## 🌐 Problemas de Conectividade

### ❌ Erro: "Erro ao acessar modo visitante" no frontend

**Causa:** Frontend não consegue conectar ao backend

**Solução 1: Verificar se backend está rodando**
```bash
# Verificar containers
docker-compose ps

# Ver logs do backend
docker logs gaia-backend

# Testar health check
curl http://localhost:3001/health
```

**Solução 2: Verificar URL da API**

Se usar Docker:
- ❌ Errado: `http://localhost:3001` (localhost não funciona do container)
- ✅ Correto: `http://172.18.0.3:3001` (IP do container)

Se usar local:
- ✅ Correto: `http://localhost:3001`

**Solução 3: Verificar CORS**

Se receber erro CORS no console:
```
Access to XMLHttpRequest at 'http://...' from origin 'http://localhost:3000' 
has been blocked by CORS policy
```

Verifique `docker-compose.yml`:
```yaml
CORS_ORIGIN: http://localhost:3000,http://172.18.0.1:3000,http://host.docker.internal:3000
```

---

### ❌ Erro: "Network Error" ao fazer login

**Causa:** Backend não está acessível

**Solução:**
```bash
# Testar conexão com backend
curl -X POST http://localhost:3001/auth/guest

# Se falhar, verificar:
# 1. Backend está rodando?
docker ps | grep gaia-backend

# 2. Porta 3001 está aberta?
netstat -an | grep 3001

# 3. Firewall está bloqueando?
# Adicione exceção no firewall para porta 3001
```

---

### ❌ Erro: "ECONNREFUSED 127.0.0.1:5432"

**Causa:** PostgreSQL não está rodando ou não está acessível

**Solução:**
```bash
# Verificar se container PostgreSQL está rodando
docker ps | grep gaia-postgres

# Ver logs
docker logs gaia-postgres

# Testar conexão
docker exec gaia-postgres pg_isready -U gaia_user

# Reiniciar
docker-compose restart postgres
```

---

## 🔐 Problemas de Autenticação

### ❌ Erro: "Email ou senha inválidos"

**Causa:** Credenciais incorretas ou usuário não existe

**Solução:**

Credenciais padrão (se banco foi inicializado com dados):
```
Email: admin@gaia.local
Senha: admin123
```

Para criar novo usuário:
1. Clique em "Registrar"
2. Preencha email e senha
3. Clique em "Criar Conta"

---

### ❌ Erro: "Token inválido" ou "Token não fornecido"

**Causa:** Token JWT expirou ou não foi salvo

**Solução:**
```javascript
// No console do navegador
localStorage.clear()
location.reload()
```

---

### ❌ Modo Visitante não funciona

**Causa:** Backend não consegue gerar token

**Solução:**
```bash
# Testar endpoint de guest
curl -X POST http://localhost:3001/auth/guest

# Deve retornar:
# {
#   "success": true,
#   "message": "Modo visitante ativado",
#   "data": { "token": "...", "userId": "...", "email": "..." }
# }
```

---

## 📦 Problemas com Dependências

### ❌ Erro: "Cannot find module '@radix-ui/...'"

**Causa:** Dependências não instaladas

**Solução:**
```bash
# Reinstalar dependências do frontend
cd client
npm install

# Ou com pnpm
pnpm install
```

---

### ❌ Erro: "Cannot find module 'express'"

**Causa:** Dependências do backend não instaladas

**Solução:**
```bash
# Reinstalar dependências do backend
cd server
npm install

# Ou com pnpm
pnpm install
```

---

### ❌ Erro: "pnpm: command not found"

**Causa:** pnpm não está instalado

**Solução:**
```bash
# Instalar pnpm globalmente
npm install -g pnpm

# Ou usar npm em vez de pnpm
npm install
```

---

## 🗄️ Problemas com Banco de Dados

### ❌ Erro: "relation 'users' does not exist"

**Causa:** Tabelas não foram criadas

**Solução:**
```bash
# Reiniciar containers para executar init-db.sql
docker-compose down -v
docker-compose up -d

# Aguardar 30 segundos
sleep 30

# Verificar logs
docker logs gaia-backend
```

---

### ❌ Erro: "duplicate key value violates unique constraint 'users_email_key'"

**Causa:** Email já existe no banco

**Solução:**
```bash
# Usar email diferente ao registrar
# Ou limpar banco de dados
docker-compose down -v
docker-compose up -d
```

---

## 🔨 Problemas de Build

### ❌ Erro: "TypeScript error" ao fazer build

**Causa:** Erro de tipo TypeScript

**Solução:**
```bash
# Verificar erros
npm run type-check

# Ou no servidor
cd server
npm run type-check

# Corrigir erros indicados
```

---

### ❌ Erro: "Vite build failed"

**Causa:** Erro durante build do frontend

**Solução:**
```bash
# Limpar cache
rm -rf dist node_modules
npm install

# Tentar build novamente
npm run build

# Ver erros detalhados
npm run build -- --debug
```

---

## 🖥️ Problemas de Desenvolvimento Local

### ❌ Erro: "Cannot find module 'pg'"

**Causa:** PostgreSQL não está instalado localmente

**Solução:**

**macOS (Homebrew):**
```bash
brew install postgresql@15
brew services start postgresql@15
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql
```

**Windows:**
- Download: https://www.postgresql.org/download/windows/
- Instale e inicie o serviço

---

### ❌ Erro: "psql: command not found"

**Causa:** PostgreSQL CLI não está no PATH

**Solução:**
```bash
# macOS
export PATH="/usr/local/opt/postgresql@15/bin:$PATH"

# Linux
export PATH="/usr/lib/postgresql/15/bin:$PATH"

# Windows
# Adicione C:\Program Files\PostgreSQL\15\bin ao PATH
```

---

## 📊 Verificações de Saúde

### Verificar se tudo está funcionando

```bash
# 1. Verificar containers
docker-compose ps

# 2. Verificar health check do PostgreSQL
docker exec gaia-postgres pg_isready -U gaia_user

# 3. Testar backend
curl http://localhost:3001/health

# 4. Verificar logs
docker logs gaia-backend
docker logs gaia-postgres

# 5. Testar login
curl -X POST http://localhost:3001/auth/guest \
  -H "Content-Type: application/json"
```

---

## 🆘 Quando nada funciona

### Reset completo

```bash
# 1. Parar tudo
docker-compose down -v

# 2. Limpar sistema
docker system prune -a

# 3. Reconstruir
docker-compose up -d --build

# 4. Aguardar 30 segundos
sleep 30

# 5. Verificar
docker-compose ps
curl http://localhost:3001/health
```

### Coletar informações para suporte

```bash
# Salvar logs
docker logs gaia-backend > backend.log
docker logs gaia-postgres > postgres.log

# Informações do sistema
docker --version
docker-compose --version
node --version
npm --version

# Informações dos containers
docker-compose ps
docker inspect gaia-backend
docker inspect gaia-postgres
```

---

## 📞 Recursos Adicionais

- **Documentação:** Veja `README_SETUP.md`
- **API Reference:** Veja `API_REFERENCE.md`
- **Issues:** Abra uma issue no GitHub
- **Logs:** `docker logs gaia-backend` e `docker logs gaia-postgres`


