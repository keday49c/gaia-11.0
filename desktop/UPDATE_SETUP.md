Auto‑Update Setup (Gaia Desktop)

**Nota:** o aplicativo foi renomeado para **Gaia 3.0** (productName/version atualizados em `desktop/package.json`).

O que fazer para habilitar atualizações automáticas via GitHub Releases:

1) Configure `desktop/package.json`:
   - Defina `publish[0].owner` e `publish[0].repo` com seu repositório GitHub que receberá os releases.

2) CI / Pubicação:
   - Na pipeline de CI, utilize `electron-builder` para criar os instaladores (NSIS) e publique via `GH_TOKEN` (GitHub personal access token com `repo` scopes).
   - Exemplo de secret: `GH_TOKEN` armazenado no GitHub Actions/CI.

3) Code signing (obrigatório para confiança e atualizações sem prompt):
   - Windows: forneça PFX (PFX_PASSWORD) e configure `CSC_LINK` e `CSC_KEY_PASSWORD` ou use marketplace code signing.
   - macOS: configure Apple Developer ID (notar/ID). 

4) Verificação e rollback:
   - A app atualmente chama `autoUpdater.checkForUpdatesAndNotify()` no startup.
   - O instalador anterior não é aplicado automaticamente como "rollback"; implementar rollback automático requer manter artefatos de release histórico e lógica de reinstall/revert. Disponibilizei endpoints e eventos para exibir changelog e progresso (renderer recebe eventos `update-available`, `update-download-progress`, `update-downloaded`).

5) Testes locais:
   - Para testar localmente sem publicar no GitHub, você pode pointar `autoUpdater` para um servidor de updates local (educacional) ou usar artefatos publicados em um repo privado.

6) CI (GitHub Actions) - placeholders e secrets necessários:
   - `GH_TOKEN` (secret): token com permissões `repo` para criar releases.
   - `WINDOWS_SIGNING_P12` (secret): PFX/P12 certificado codificado em Base64 (ou URL apontando para o certificado) para assinatura no Windows.
   - `WINDOWS_SIGNING_PASSWORD` (secret): senha do PFX.
   - (macOS) `APPLE_ID`, `APPLE_PASSWORD`, e certificados relevantes para notarization.

7) FFmpeg (requisito opcional mas comum para funcionalidades de mídia) 🔧
   - Sintoma: ao executar `Gaia 2.0.exe` no Windows pode aparecer "ffmpeg.dll não encontrado" ou erro similar.
   - Causa: o binário/DSL do FFmpeg não foi incluído no empacotamento ou não está no `PATH` do sistema.
   - Teste rápido (local): baixe uma build Windows do FFmpeg (ex.: https://www.gyan.dev/ffmpeg/builds/), extraia e copie os arquivos `ffmpeg.exe` (e quaisquer `.dll` em `bin/`) para a pasta `dist/win-unpacked/` onde fica `Gaia 2.0.exe`, e execute novamente.
   - Empacotamento recomendado: inclua os binários do FFmpeg no artefato do instalador (usando `extraResources` ou `extraFiles` do `electron-builder`) ou inclua a dependência `ffmpeg-static` e copie o binário em tempo de build.
   - Exemplo (electron-builder):
     "win": {
       "extraResources": [ { "from": "desktop/vendor/ffmpeg/win64", "to": "ffmpeg", "filter": ["**/*"] } ]
     }
   - Observação: preferível usar builds estáveis e assinar os binários se necessário para distribuição enterprise.

## Gerar artefato Gaia 3.0 (portable)
Uma conveniência para testes locais: o script `make_portable_gaia3.ps1` gera um build `--dir`, zipa o resultado e cria um atalho `desktop\Gaia 3.0.exe` (se o exe existir no output). Uso:

```powershell
# no diretório repo/desktop
pwsh -File scripts/make_portable_gaia3.ps1 -Force
```

O script executa automaticamente o `download-ffmpeg.ps1` antes do build para garantir que os binários do FFmpeg sejam incluídos em `vendor/ffmpeg/win64`.

Notas:
- Precisamos das credenciais (GH_TOKEN e certificados de assinatura) para completar o fluxo end-to-end e permitir que `autoUpdater` baixe/instale sem bloqueios do sistema.
- Próximo passo: adicionar UI de Changelog + modal de progresso no renderer (feito) e workflow CI para publicar releases assinados automaticamente (adicionado em `.github/workflows/ci.yml`).
