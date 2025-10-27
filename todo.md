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

## Fase 3: Viva (APIs e IA)

### Integração de APIs
- [ ] Criar branch viva a partir de blindada
- [ ] Integrar Google Ads API com chaves do banco
- [ ] Integrar Instagram Graph API com chaves do banco
- [ ] Integrar TikTok Ads API com chaves do banco
- [ ] Integrar WhatsApp Business API com chaves do banco
- [ ] Criar tabela campaigns (id, titulo, publico, orcamento, status, metricas)
- [ ] Criar tabela campaign_logs (id, campaign_id, acao, timestamp, resultado)

### Painel de Campanhas
- [ ] Implementar botão "Nova Campanha" no dashboard
- [ ] Criar formulário: título, público (cidade, idade, interesse), orçamento, imagem, texto
- [ ] Implementar upload de imagem (Canva ou local)
- [ ] Implementar botão "Disparar" que publica em todas as plataformas
- [ ] Disparar no Instagram (post + stories)
- [ ] Disparar no Google Ads (criar anúncio)
- [ ] Agendar no TikTok (post automático)
- [ ] Abrir fluxo no WhatsApp (mensagem automática com botão de compra)

### Relatórios ao Vivo
- [ ] Criar página de relatórios com métricas em tempo real
- [ ] Implementar gráficos Tailwind (impressões, cliques, custo)
- [ ] Sincronizar dados das APIs a cada 5 minutos
- [ ] Mostrar CPC, CTR, ROAS para cada campanha

### Integração Gemini
- [ ] Integrar Google Gemini API
- [ ] Analisar dados de campanhas automaticamente
- [ ] Pausar campanhas com custo alto
- [ ] Aumentar orçamento em campanhas que convertem
- [ ] Otimizar textos e públicos automaticamente

### Voz (Speech-to-Text e Text-to-Speech)
- [ ] Implementar Web Speech API para speech-to-text
- [ ] Integrar Eleven Labs para text-to-speech (voz feminina, calma)
- [ ] Criar comando de voz: "Gaia, mostra CPC"
- [ ] Responder com áudio natural usando Eleven Labs
- [ ] Implementar reconhecimento de comandos

### Assistente Virtual WhatsApp
- [ ] Integrar Twilio para WhatsApp Business
- [ ] Receber mensagens de voz/texto do usuário
- [ ] Converter voz em texto (speech-to-text)
- [ ] Processar com Gemini para gerar resposta
- [ ] Converter resposta em voz com Eleven Labs
- [ ] Enviar resposta via WhatsApp (áudio ou texto)
- [ ] Exemplo: "Oi Davi, ontem você ganhou R$ 200, quer disparar igual?"

### Testes
- [ ] Criar 10 campanhas de teste
- [ ] Testar disparo em todas as plataformas
- [ ] Testar relatórios em tempo real
- [ ] Testar otimização automática com Gemini
- [ ] Testar voz (speech-to-text e text-to-speech)
- [ ] Testar WhatsApp com IA
- [ ] Validar sincronização offline

### Deploy
- [ ] Fazer commit na branch viva
- [ ] Push para GitHub
- [ ] Entregar link da branch ao usuário

---

## Próximas Fases

- [ ] Fase 4: Mobile (React Native)
- [ ] Fase 5: Segurança Avançada
- [ ] Fase 6: Backup e Sincronização
- [ ] Fase 7: Entrega Final

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

### Fase 3
- APIs: Google Ads, Instagram, TikTok, WhatsApp
- IA: Gemini para otimização automática
- Voz: Speech-to-text + Eleven Labs (text-to-speech)
- Relatórios: Gráficos Tailwind com métricas em tempo real
- WhatsApp: Assistente virtual com IA

