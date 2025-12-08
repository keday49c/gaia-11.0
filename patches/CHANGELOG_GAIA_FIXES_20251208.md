# Changelog - Correções aplicadas (2025-12-08)

Alterações aplicadas nesta sessão para estabilizar o sistema Gaia:

- Corrigido healthcheck do backend para testar conexão TCP IPv4/IPv6.
- Evitado que `wait-for-db.sh` sobrescrevesse `PORT` do processo (usando `DB_PORT_WAIT`).
- Casts `::jsonb` adicionados em `seed-campaigns.sql` e uso de `jsonb_build_object` para `campaign_logs`.
- Reaplicado `seed-campaigns.sql` com sucesso (inseridos campanhas, métricas e logs de teste).
- Iniciado e verificado `frontend` (NGINX) — `index.html` servido.
- Gerado backup SQL do banco: `patches/pg_backup-20251208-005056.sql`.

Arquivos modificados principais:
- `docker-compose.yml` (healthcheck e PORT explícito)
- `scripts/wait-for-db.sh` (não sobrescrever PORT)
- `seed-campaigns.sql` (casts e jsonb_build_object)

Recomendações finais:
- Verificar instalação do `systemd` unit se for usar Linux em produção.
- Mover segredos (`.env`) para Docker secrets ou gerenciamento seguro.
- Agendar backups regulares (pg_dump) e rotacionamento.
