# Gaia 10.0 - Esqueleto Frontend

**Gaia** é uma plataforma pessoal de automação de marketing digital que permite criar campanhas, publicar em tempo real no Google Ads, Instagram, TikTok, gerenciar conversas no WhatsApp por voz e analisar tudo com IA Gemini. Roda no PC ou no celular, sem servidor obrigatório.

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

