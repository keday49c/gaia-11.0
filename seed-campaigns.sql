-- Script de seed atualizado para o esquema atual (campaigns, metrics, logs)
-- OBS: este script é idempotente e compatível com o schema definido em `server/db.ts`

-- Ajuste: defina o ID do usuário que receberá as campanhas (substitua se necessário)
-- Para descobrir o id do admin: SELECT id FROM users WHERE email='admin@gaia.local';
\set demo_user_id '550e8400-e29b-41d4-a716-446655440000'

-- Inserir campanhas (campo `nome`)
INSERT INTO campaigns (user_id, nome, descricao, status, orcamento, criado_em)
SELECT :'demo_user_id', 'Black Friday 2025', 'Promoção de Black Friday com desconto de 50%', 'ativa', 1000.00, NOW()
WHERE NOT EXISTS (SELECT 1 FROM campaigns WHERE nome = 'Black Friday 2025');

INSERT INTO campaigns (user_id, nome, descricao, status, orcamento, criado_em)
SELECT :'demo_user_id', 'Lançamento Produto X', 'Lançamento do novo produto X com tecnologia inovadora', 'ativa', 1500.00, NOW()
WHERE NOT EXISTS (SELECT 1 FROM campaigns WHERE nome = 'Lançamento Produto X');

INSERT INTO campaigns (user_id, nome, descricao, status, orcamento, criado_em)
SELECT :'demo_user_id', 'Webinar Marketing Digital', 'Webinar gratuito sobre estratégias de marketing digital', 'ativa', 800.00, NOW()
WHERE NOT EXISTS (SELECT 1 FROM campaigns WHERE nome = 'Webinar Marketing Digital');

INSERT INTO campaigns (user_id, nome, descricao, status, orcamento, criado_em)
SELECT :'demo_user_id', 'Curso Python Avançado', 'Curso online de Python para iniciantes', 'ativa', 1200.00, NOW()
WHERE NOT EXISTS (SELECT 1 FROM campaigns WHERE nome = 'Curso Python Avançado');

-- Inserir métricas simples para as campanhas recém-criadas (se ainda não existir métrica para hoje)
INSERT INTO metrics (campaign_id, data, impressoes, cliques, conversoes, custo, receita)
SELECT c.id, CURRENT_DATE, (RANDOM()*10000+1000)::int, (RANDOM()*500+50)::int, (RANDOM()*50+5)::int, (RANDOM()*500+50)::numeric, (RANDOM()*1000+100)::numeric
FROM campaigns c WHERE c.nome IN ('Black Friday 2025','Lançamento Produto X','Webinar Marketing Digital','Curso Python Avançado')
  AND NOT EXISTS (SELECT 1 FROM metrics m WHERE m.campaign_id = c.id AND m.data = CURRENT_DATE);

-- Inserir logs de ação para as campanhas (ação: disparar)
INSERT INTO logs (user_id, acao, detalhes)
SELECT c.user_id, 'disparar', jsonb_build_object('campaign', c.nome, 'status', 'sucesso', 'timestamp', to_char(NOW(), 'YYYY-MM-DD"T"HH24:MI:SSZ'))::text
FROM campaigns c WHERE c.nome IN ('Black Friday 2025','Lançamento Produto X')
  AND NOT EXISTS (SELECT 1 FROM logs l WHERE l.user_id = c.user_id AND l.acao = 'disparar' AND l.detalhes LIKE ('%"' || c.nome || '"%'));

-- Relatórios rápidos
SELECT COUNT(*) AS total_campanhas FROM campaigns;
SELECT COUNT(*) AS total_metricas FROM metrics;
SELECT COUNT(*) AS total_logs FROM logs;

