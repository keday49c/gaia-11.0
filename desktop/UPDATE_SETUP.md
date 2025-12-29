Auto‑Update Setup (Gaia Desktop)

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

Notas:
- Precisamos das credenciais (GH_TOKEN e certificados de assinatura) para completar o fluxo end-to-end e permitir que `autoUpdater` baixe/instale sem bloqueios do sistema.
- Próximo passo: adicionar UI de Changelog + modal de progresso no renderer (feito) e workflow CI para publicar releases assinados automaticamente (adicionado em `.github/workflows/ci.yml`).
