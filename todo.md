# Gaia 10.0 - Rastreamento de Tarefas

## Fase 1: Esqueleto Frontend

- [x] Gerar logomarca "logo.png" (seta pirâmide, degradê azul-roxo-vermelho-preto, glow suave)
- [x] Baixar logo.png e adicionar ao projeto (client/public/logo.png)
- [x] Implementar layout responsivo com gradiente #001F3F → #2ECC40
- [x] Implementar barra de alertas em #FF4136 (vermelho)
- [x] Implementar tela de definição de senha pessoal (primeira vez)
- [x] Implementar criptografia AES-256 com armazenamento em localStorage
- [x] Implementar tela de login permanente (após primeira execução)
- [x] Implementar painel vazio com três campos de API (Google Ads, Instagram, WhatsApp)
- [x] Implementar botão Salvar com console.log das chaves
- [x] Implementar modo admin oculto (e-mail: admin, senha: senha123)
- [x] Implementar tela admin (visualizar código, logs, deletar tudo)
- [x] Testar fluxo completo (login, painel, modo admin)
- [x] Criar repositório GitHub "Gaia 10.0" e fazer push do código
- [x] Criar README com instruções (npm install && npm start)
- [x] Entregar link do repositório ao usuário

## Fase 2: Backend Blindado

- [x] Clonar repositório GitHub Gaia-10.0
- [x] Criar estrutura de backend (server/)
- [x] Configurar Docker (Dockerfile, docker-compose.yml)
- [x] Configurar PostgreSQL em Docker
- [x] Criar tabela users (id, email, senha, chaves_api)
- [x] Implementar criptografia bcrypt para senhas
- [x] Implementar rota /login (JWT 15 min)
- [x] Implementar rota /salvar-chaves (AES-256)
- [x] Implementar rota /meus-dados (descriptografar chaves)
- [x] Implementar rate limiting (5 tentativas/min)
- [x] Implementar logging de acessos (IP, timestamp, ação)
- [x] Integrar frontend com backend
- [x] Testar fluxo completo (login, salvar, recuperar)
- [x] Fazer commit na branch blindada
- [x] Entregar link da branch ao usuário

---

## Próximas Fases

- [ ] Fase 3: Integração com APIs (Google Ads, Instagram, TikTok, WhatsApp)
- [ ] Fase 4: Processamento de Campanhas
- [ ] Fase 5: IA Gemini para Análise
- [ ] Fase 6: Interface Móvel

---

## Notas de Desenvolvimento

### Fase 1
- Frontend: React + TailwindCSS
- Autenticação: Local com localStorage
- Criptografia: AES-256 para senha pessoal
- Modo Admin: Acesso oculto (admin/senha123)

### Fase 2
- Backend: Node.js + Express + PostgreSQL
- Autenticação: JWT com expiração de 15 minutos
- Criptografia: bcrypt para senhas, AES-256 para chaves de API
- Segurança: Rate limiting (5 req/min login), logging completo
- Docker: PostgreSQL + Node.js em containers
- Endpoints: /auth/login, /auth/register, /keys/salvar, /keys/meus-dados

