INSERT INTO campaign_logs (campaign_id, acao, detalhes)
SELECT id, 'disparar', ('{\"plataformas\": [\"instagram\",\"google_ads\",\"tiktok\",\"whatsapp\"], \"timestamp\": \"' || NOW() || '\", \"status\": \"sucesso\"}')::jsonb
FROM campaigns WHERE status = 'ativo';
