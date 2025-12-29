# Gaia (local setup)

Instruções rápidas para rodar o backend e frontend localmente (Docker ou local).

Pré-requisitos
- Node.js 20+
- npm 10+
- Docker (opcional, recomendado)

Usando Docker (recomendado)

1. Na raiz do projeto:

```powershell
docker-compose up --build
```

Isso sobe o Postgres (5432), backend (3001) e frontend (3000).

Usando local (sem Docker)

1. Instalar dependências na raiz (workspaces):

```powershell
npm install
```

2. Rodar backend:

```powershell
npm run server:dev
```

3. Rodar frontend:

```powershell
npm run dev
```

Empacotamento com CMake (Windows)

Se você quer gerar um executável Windows para o backend e empacotar o frontend estático, há um `CMakeLists.txt` e um script de empacotamento em `scripts/cmake` que orquestram o fluxo (instala dependências, compilam server/client e usam `pkg` para gerar `gaia-server.exe`). Veja detalhes em `docs/PACKAGING_CMAKE.md`.

> Observação: este processo requer **Node >=20**, **npm >=10**, **CMake >=3.24** e (opcional) **NSIS** para um instalador Windows.


Setar senha de usuário diretamente no banco

Você pediu para criar/definir a conta:

- Email: `davidcruner@gmail.com`
- Senha: `123456`

Para aplicar essa senha ao banco (se estiver usando o banco do docker ou local), execute este comando a partir da raiz do repositório:

```powershell
# usando tsx (server tem script npm para isso)
npm run server:dev # (em outro terminal, mantê-lo rodando não é estritamente necessário)
npm --prefix server run set-password -- --email davidcruner@gmail.com --password <sua_senha>

# ou, usando tsx direto se você tiver instalado:
npx tsx server/scripts/set_password.ts --email davidcruner@gmail.com --password <sua_senha>
```

Notas de segurança
- Altere `JWT_SECRET` e `AES_SECRET_KEY` antes de colocar em produção.
- Não use senhas fracas em produção; este exemplo usa `123456` por pedido de teste.

O que foi adicionado/alterado
- `server/scripts/set_password.ts` - script para set/reset de senha (usa bcrypt e atualiza/insera usuário).
- `server/index.ts` - adicionada validação (`zod`) e rate-limiting (`express-rate-limit`) nos endpoints de auth. Foi adicionado o endpoint `GET /auth/has-admin` para permitir que o frontend verifique se já existe um administrador/usuário e assim ajustar corretamente a tela de login/registro.
- `.env.example` e `README.md` com instruções.
# Gaia 10.0 - Esqueleto Frontend

**Gaia** é uma plataforma pessoal de automação de marketing digital que permite criar campanhas, publicar em tempo real no Google Ads, Instagram, TikTok, gerenciar conversas no WhatsApp por voz e analisar tudo com IA Gemini. Roda no PC ou no celular, sem servidor obrigatório.

Nota: a integração com IA está disponível mas requer configuração de credenciais (ver `server/.env.example`). Configure `AI_PROVIDER` e a chave (`OPENAI_API_KEY` ou `GEMINI_API_KEY`) para ativar análises reais.

## 📋 Fase 1: Esqueleto

Este é o esqueleto do frontend do projeto Gaia, construído com **React 19** e **TailwindCSS 4**.

### ✨ Funcionalidades Implementadas

- **Layout Responsivo**: Gradiente azul marinho (#001F3F) para verde (#2ECC40)
- **Barra de Alertas**: Alertas em vermelho (#FF4136)
- **Logomarca**: Seta pirâmide com degradê azul-roxo-vermelho-preto e efeito glow
- **Tela de Definição de Senha**: Primeira execução - cria senha forte (20+ caracteres)
- **Criptografia AES-256**: Senha armazenada criptografada no localStorage
- **Tela de Login**: Acesso permanente após primeira execução
- **Painel Principal**: Três campos de API (Google Ads, Instagram, WhatsApp)
- **Botão Salvar**: Loga as chaves no console (F12)
- **Modo Admin Oculto**: E-mail: `admin`, Senha: `senha123`
- **Painel Admin**: Visualizar código, logs, deletar tudo

## 🚀 Instruções de Inicialização

### Pré-requisitos

- Node.js 18+ instalado
- npm ou pnpm

### Instalação

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/Gaia-10.0.git
cd Gaia-10.0

# Instale as dependências
npm install
# ou
pnpm install
```

### Execução

```bash
# Inicie o servidor de desenvolvimento
npm start
# ou
pnpm start
```

O aplicativo abrirá automaticamente em `http://localhost:3000`

## 🔐 Segurança

- **Armazenamento Local**: Todas as chaves são armazenadas apenas no localStorage do navegador
- **Criptografia AES-256**: Senhas e chaves são criptografadas antes do armazenamento
- **Sem Servidor**: Nenhum dado é enviado para servidores externos
- **Acesso Exclusivo**: Apenas você tem acesso às suas chaves

## 📁 Estrutura do Projeto

```
gaia-skeleton/
├── client/
│   ├── public/
│   │   └── logo.png          # Logomarca Gaia
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Login.tsx      # Tela de login e definição de senha
│   │   │   ├── Dashboard.tsx  # Painel principal com campos de API
│   │   │   └── AdminPanel.tsx # Painel admin oculto
│   │   ├── lib/
│   │   │   └── crypto.ts      # Funções de criptografia AES-256
│   │   ├── App.tsx            # Roteamento principal
│   │   └── main.tsx           # Entry point
│   └── package.json
├── README.md
└── todo.md
```

## 🔑 Credenciais de Teste

### Modo Admin

- **E-mail**: `admin`
- **Senha**: `senha123`

> ⚠️ **Importante**: Altere a senha de admin em produção!

## 📝 Próximas Fases

1. **Fase 2**: Integração com APIs (Google Ads, Instagram, TikTok, WhatsApp)
2. **Fase 3**: Mobile (React Native)
3. **Fase 4**: Interações por Voz
4. **Fase 5**: Segurança Avançada
5. **Fase 6**: Backup e Sincronização
6. **Fase 7**: Entrega Final

## 🛠️ Tecnologias

- **React 19**: Framework UI
- **TailwindCSS 4**: Estilização
- **Wouter**: Roteamento
- **crypto-js**: Criptografia AES-256
- **shadcn/ui**: Componentes UI
- **Vite**: Build tool

## 📝 Notas de Desenvolvimento

- Código limpo e comentado
- Sem backend ainda (apenas esqueleto frontend)
- Pronto para expansão nas próximas fases
- Console.log para debugging (F12)

## 📞 Suporte

Para dúvidas ou problemas, consulte a documentação ou abra uma issue no repositório.

---

**Versão**: 1.0.0  
**Data**: Outubro 2025  
**Autor**: Gaia Team

