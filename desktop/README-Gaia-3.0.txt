Gaia 3.0 - Notas rápidas

Este diretório contém scripts para gerar um artefato portátil e para iniciar a aplicação em modo portátil quando o instalador empacotado não está presente.

Arquivos úteis:
- scripts/download-ffmpeg.ps1 : baixa e coloca FFmpeg em vendor/ffmpeg/win64
- scripts/make_portable_gaia3.ps1 : empacota o build (--dir), cria zip e copia o exe para desktop/Gaia 3.0.exe (se presente)
- Gaia-3.0.ps1 : runner de conveniência (executa exe empacotado se existir, senão inicia servidor + abre browser)

Para gerar o executável real (Windows installer ou portable), rode no diretório `desktop`:

1) Garantir dependências:
   npm install

2) Gerar build e artefato portátil:
   npm run build:gaia3
   npm run make-portable-gaia3

Observação: para builds distribuíveis (NSIS) recomenda-se executar no Windows runner do CI ou em um Windows com permissões para extrair win tools (7z) e com certificados para assinatura.
