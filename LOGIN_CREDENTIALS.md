# 🔐 CREDENCIAIS DE ACESSO - GAIA 10.0

## 📋 INFORMAÇÕES DE LOGIN

### 🎭 MODO VISITANTE (Recomendado para Teste)

**Acesso:** Clique em **"Modo Visitante"** na tela inicial

**Benefícios:**
- ✅ Acesso imediato ao dashboard
- ✅ Visualizar campanhas de exemplo
- ✅ Explorar métricas e relatórios
- ✅ Testar funcionalidades
- ✅ Sem necessidade de credenciais

**Limitações:**
- ❌ Não pode salvar chaves de API reais
- ❌ Dados não persistem após logout
- ❌ Modo simulação apenas

---

### 🔒 LOGIN REAL (Com Credenciais)

**Email:** `admin@gaia.local`  
**Senha:** `admin123`

**Benefícios:**
- ✅ Acesso persistente
- ✅ Salvar chaves de API
- ✅ Dados salvos no banco de dados
- ✅ Modo real com integrações

**Passos:**
1. Clique em **"Login Real"** na tela inicial
2. Digite: `admin@gaia.local`
3. Digite: `admin123`
4. Clique em **"Fazer Login"**

---

## 🚀 COMO ACESSAR GAIA

### Local (Windows/Mac/Linux)

```bash
# 1. Abrir navegador
http://localhost:3000

# 2. Escolher modo de acesso
# - Modo Visitante (recomendado para teste)
# - Login Real (com credenciais)
```

### Via IP da Rede

```bash
# Se acessar de outro computador na rede
http://192.168.1.6:3000
# ou
http://172.18.96.1:3000
```

---

## 📊 FUNCIONALIDADES DISPONÍVEIS

### ✅ Modo Visitante

| Funcionalidade | Disponível |
|---|---|
| Visualizar Dashboard | ✅ Sim |
| Ver Campanhas de Exemplo | ✅ Sim |
| Visualizar Métricas | ✅ Sim |
| Explorar Relatórios | ✅ Sim |
| Testar Modo Simulação | ✅ Sim |
| Salvar Chaves de API | ❌ Não |
| Criar Campanhas Reais | ❌ Não |
| Disparar Campanhas | ❌ Não |

### ✅ Login Real

| Funcionalidade | Disponível |
|---|---|
| Visualizar Dashboard | ✅ Sim |
| Ver Campanhas | ✅ Sim |
| Visualizar Métricas | ✅ Sim |
| Explorar Relatórios | ✅ Sim |
| Testar Modo Simulação | ✅ Sim |
| Salvar Chaves de API | ✅ Sim |
| Criar Campanhas Reais | ✅ Sim |
| Disparar Campanhas | ✅ Sim |

---

## 🔑 CHAVES DE API (Para Modo Real)

Após fazer login com credenciais reais, você pode adicionar:

- **Google Ads API Key**
- **Instagram Graph API Token**
- **WhatsApp Business API Key**

**Segurança:**
- ✅ Criptografadas com AES-256 no backend
- ✅ Armazenadas de forma segura no PostgreSQL
- ✅ Acessadas apenas com JWT válido
- ✅ Todos os acessos registrados em logs

---

## 🆘 PROBLEMAS COMUNS

### "Modo Visitante não aparece"
**Solução:** Atualize a página (F5) e verifique se o `.env` está configurado corretamente

### "Erro ao fazer login"
**Solução:** Verifique se o backend está rodando:
```bash
docker-compose ps
# Deve mostrar: gaia-backend (running) e gaia-postgres (healthy)
```

### "Não consegue conectar em localhost:3000"
**Solução:** Verifique se o frontend está rodando:
```bash
# Terminal do frontend deve mostrar:
# ➜ Local: http://localhost:3000/
```

---

## 📝 NOTAS IMPORTANTES

1. **Modo Visitante é recomendado para teste inicial**
   - Não requer credenciais
   - Acesso imediato
   - Dados de demonstração

2. **Login Real é para uso persistente**
   - Requer credenciais
   - Dados salvos no banco
   - Integração com APIs reais

3. **Chaves de API são opcionais**
   - Modo simulação funciona sem chaves
   - Chaves reais para campanhas reais

4. **Segurança**
   - Nunca compartilhe credenciais
   - Mude a senha padrão em produção
   - Use HTTPS em produção

---

## 🔄 REINICIAR GAIA

### Com Docker (Recomendado)

```powershell
# 1. Parar tudo
docker-compose down

# 2. Limpar volumes (opcional)
docker volume prune -f

# 3. Reiniciar
docker-compose up -d

# 4. Aguardar 60 segundos
Start-Sleep -Seconds 60

# 5. Acessar
start http://localhost:3000
```

### Sem Docker (Local)

```powershell
# Terminal 1 - Backend
cd C:\gaia-docker\server
npm install
npm run dev

# Terminal 2 - Frontend
cd C:\gaia-docker\client
npm install
npm run dev

# Terminal 3 - Navegador
start http://localhost:3000
```

---

**Última atualização:** 19 de Novembro de 2025  
**Versão:** Gaia 10.0

