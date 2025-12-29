# Empacotamento com CMake (Windows)

Este documento descreve como usar o `CMakeLists.txt` adicionado ao projeto para gerar um executável Windows do backend (`gaia-server.exe`) e empacotar o frontend estático.

Requisitos mínimos
- Node.js >= 20
- npm >= 10
- CMake >= 3.24
- Ninja (recomendado) ou outro gerador (Visual Studio)
- (Opcional) NSIS para criar instalador Windows

Passos básicos (Windows / PowerShell)

1. Instalar dependências do sistema (Node, npm, CMake, Ninja)
2. Rodar o script de empacotamento:

   pwsh .\scripts\cmake\package.ps1 -BuildDir build -Generator Ninja

O fluxo executado:
- `npm ci` (workspaces)
- `npm run build --workspace=server` (compila TypeScript para `server/dist`)
- `npm run build --workspace=client` (gera `client/dist` estático)
- `npx pkg server/dist/index.js --targets node20-win-x64 --output build/release/gaia-server.exe`
- copia `client/dist` para `build/release/static`
- gera um ZIP de `build/release` com `cpack` (e NSIS se disponível)

Observações e limitações
- `pkg` cria executáveis Node obrigando que o código seja compatível (requisições dinâmicas, `fs.readFileSync` em paths relativos e alguns módulos nativos podem exigir cuidados adicionais).
- Para builds multiplataforma, altere o valor de `--targets` de `pkg` conforme a plataforma alvo.
- Teste o executável resultante em uma máquina limpa ou contêiner Windows para validar dependências.

Se quiser, eu posso:
- adicionar um target CPack NSIS mais sofisticado (ícone, instalador silencioso, criação de serviço do Windows),
- adaptar o empacotamento para Electron (aplicação desktop) em vez de um simples servidor embutido, ou
- incluir um passo de CI que constrói e publica artefatos na pipeline.

---
