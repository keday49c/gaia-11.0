-- Script de seed para testar com 10 campanhas falsas
-- Execute este script para popular o banco com dados de teste

-- Primeiro, obtenha o user_id do seu usuário (substitua com o ID real)
-- Você pode descobrir rodando: SELECT id FROM users LIMIT 1;

-- Inserir 10 campanhas de teste
INSERT INTO campaigns (user_id, titulo, descricao, publico, orcamento, texto, status, plataformas, iniciado_em)
VALUES
  -- Campanha 1: Black Friday
  ('550e8400-e29b-41d4-a716-446655440000', 'Black Friday 2025', 'Promoção de Black Friday com desconto de 50%', 
   '{"cidades": ["São Paulo", "Rio de Janeiro"], "idade_min": 18, "idade_max": 65, "interesses": ["compras", "promoções"]}',
   1000.00, 'Aproveite a Black Friday com 50% de desconto em todos os produtos!', 'ativo', 
   '{"instagram": true, "google_ads": true, "tiktok": true, "whatsapp": true}', NOW()),

  -- Campanha 2: Lançamento de Produto
  ('550e8400-e29b-41d4-a716-446655440000', 'Lançamento Produto X', 'Lançamento do novo produto X com tecnologia inovadora',
   '{"cidades": ["São Paulo", "Belo Horizonte", "Brasília"], "idade_min": 25, "idade_max": 45, "interesses": ["tecnologia", "inovação"]}',
   1500.00, 'Conheça o novo Produto X - Tecnologia que muda tudo!', 'ativo',
   '{"instagram": true, "google_ads": true, "tiktok": false, "whatsapp": true}', NOW()),

  -- Campanha 3: Webinar
  ('550e8400-e29b-41d4-a716-446655440000', 'Webinar Marketing Digital', 'Webinar gratuito sobre estratégias de marketing digital',
   '{"cidades": ["São Paulo", "Rio de Janeiro", "Curitiba"], "idade_min": 20, "idade_max": 50, "interesses": ["marketing", "negócios"]}',
   800.00, 'Participe do nosso webinar gratuito sobre Marketing Digital!', 'ativo',
   '{"instagram": true, "google_ads": true, "tiktok": true, "whatsapp": false}', NOW()),

  -- Campanha 4: Desconto Especial
  ('550e8400-e29b-41d4-a716-446655440000', 'Desconto Especial Clientes', 'Desconto exclusivo para clientes VIP',
   '{"cidades": ["São Paulo"], "idade_min": 30, "idade_max": 60, "interesses": ["luxo", "exclusividade"]}',
   2000.00, 'Desconto exclusivo de 30% para nossos clientes VIP!', 'pausada',
   '{"instagram": true, "google_ads": true, "tiktok": false, "whatsapp": true}', NOW()),

  -- Campanha 5: Curso Online
  ('550e8400-e29b-41d4-a716-446655440000', 'Curso Python Avançado', 'Curso online de Python para iniciantes',
   '{"cidades": ["São Paulo", "Rio de Janeiro", "Brasília", "Recife"], "idade_min": 18, "idade_max": 40, "interesses": ["programação", "educação"]}',
   1200.00, 'Aprenda Python do zero com nosso curso completo!', 'ativo',
   '{"instagram": true, "google_ads": true, "tiktok": true, "whatsapp": true}', NOW()),

  -- Campanha 6: Fitness Challenge
  ('550e8400-e29b-41d4-a716-446655440000', 'Fitness Challenge 30 Dias', 'Desafio de fitness de 30 dias com prêmios',
   '{"cidades": ["São Paulo", "Rio de Janeiro", "Belo Horizonte"], "idade_min": 18, "idade_max": 50, "interesses": ["fitness", "saúde"]}',
   1500.00, 'Participe do Fitness Challenge 30 Dias e ganhe prêmios!', 'ativo',
   '{"instagram": true, "google_ads": false, "tiktok": true, "whatsapp": true}', NOW()),

  -- Campanha 7: Viagem Pacote
  ('550e8400-e29b-41d4-a716-446655440000', 'Pacote Viagem Caribe', 'Pacote de viagem para o Caribe com tudo incluído',
   '{"cidades": ["São Paulo", "Rio de Janeiro"], "idade_min": 25, "idade_max": 65, "interesses": ["viagem", "turismo"]}',
   2500.00, 'Viaje para o Caribe com tudo incluído - Aproveite!', 'ativo',
   '{"instagram": true, "google_ads": true, "tiktok": false, "whatsapp": true}', NOW()),

  -- Campanha 8: App Mobile
  ('550e8400-e29b-41d4-a716-446655440000', 'Download App Mobile', 'Campanha para download do novo app mobile',
   '{"cidades": ["São Paulo", "Rio de Janeiro", "Brasília", "Curitiba"], "idade_min": 18, "idade_max": 45, "interesses": ["tecnologia", "apps"]}',
   1000.00, 'Baixe nosso app e ganhe 100 pontos de bônus!', 'ativo',
   '{"instagram": true, "google_ads": true, "tiktok": true, "whatsapp": false}', NOW()),

  -- Campanha 9: Consultoria Empresarial
  ('550e8400-e29b-41d4-a716-446655440000', 'Consultoria Empresarial', 'Serviço de consultoria para empresas',
   '{"cidades": ["São Paulo"], "idade_min": 35, "idade_max": 65, "interesses": ["negócios", "consultoria"]}',
   3000.00, 'Transforme seu negócio com nossa consultoria especializada!', 'rascunho',
   '{"instagram": false, "google_ads": true, "tiktok": false, "whatsapp": true}', NOW()),

  -- Campanha 10: Promoção Sazonal
  ('550e8400-e29b-41d4-a716-446655440000', 'Promoção Natal 2025', 'Promoção especial de Natal com descontos incríveis',
   '{"cidades": ["São Paulo", "Rio de Janeiro", "Belo Horizonte", "Brasília"], "idade_min": 18, "idade_max": 60, "interesses": ["compras", "natal"]}',
   2000.00, 'Natal chegou! Descontos de até 70% em tudo!', 'ativo',
   '{"instagram": true, "google_ads": true, "tiktok": true, "whatsapp": true}', NOW());

-- Inserir métricas simuladas para as campanhas
INSERT INTO campaign_metrics (campaign_id, plataforma, impressoes, cliques, conversoes, custo, receita)
SELECT id, 'instagram', 
  FLOOR(RANDOM() * 10000 + 5000),
  FLOOR(RANDOM() * 500 + 200),
  FLOOR(RANDOM() * 50 + 10),
  FLOOR(RANDOM() * 500 + 100)::numeric,
  FLOOR(RANDOM() * 2000 + 500)::numeric
FROM campaigns WHERE titulo IN ('Black Friday 2025', 'Lançamento Produto X', 'Webinar Marketing Digital', 'Desconto Especial Clientes', 'Curso Python Avançado', 'Fitness Challenge 30 Dias', 'Pacote Viagem Caribe', 'Download App Mobile', 'Consultoria Empresarial', 'Promoção Natal 2025');

INSERT INTO campaign_metrics (campaign_id, plataforma, impressoes, cliques, conversoes, custo, receita)
SELECT id, 'google_ads',
  FLOOR(RANDOM() * 15000 + 8000),
  FLOOR(RANDOM() * 800 + 300),
  FLOOR(RANDOM() * 80 + 20),
  FLOOR(RANDOM() * 800 + 200)::numeric,
  FLOOR(RANDOM() * 3000 + 800)::numeric
FROM campaigns WHERE titulo IN ('Black Friday 2025', 'Lançamento Produto X', 'Webinar Marketing Digital', 'Desconto Especial Clientes', 'Curso Python Avançado', 'Fitness Challenge 30 Dias', 'Pacote Viagem Caribe', 'Download App Mobile', 'Consultoria Empresarial', 'Promoção Natal 2025');

INSERT INTO campaign_metrics (campaign_id, plataforma, impressoes, cliques, conversoes, custo, receita)
SELECT id, 'tiktok',
  FLOOR(RANDOM() * 20000 + 10000),
  FLOOR(RANDOM() * 1000 + 400),
  FLOOR(RANDOM() * 100 + 30),
  FLOOR(RANDOM() * 600 + 150)::numeric,
  FLOOR(RANDOM() * 2500 + 600)::numeric
FROM campaigns WHERE titulo IN ('Black Friday 2025', 'Lançamento Produto X', 'Webinar Marketing Digital', 'Curso Python Avançado', 'Fitness Challenge 30 Dias', 'Download App Mobile', 'Promoção Natal 2025');

INSERT INTO campaign_metrics (campaign_id, plataforma, impressoes, cliques, conversoes, custo, receita)
SELECT id, 'whatsapp',
  FLOOR(RANDOM() * 5000 + 2000),
  FLOOR(RANDOM() * 300 + 100),
  FLOOR(RANDOM() * 40 + 10),
  FLOOR(RANDOM() * 300 + 50)::numeric,
  FLOOR(RANDOM() * 1500 + 300)::numeric
FROM campaigns WHERE titulo IN ('Black Friday 2025', 'Lançamento Produto X', 'Webinar Marketing Digital', 'Desconto Especial Clientes', 'Curso Python Avançado', 'Fitness Challenge 30 Dias', 'Pacote Viagem Caribe', 'Download App Mobile', 'Consultoria Empresarial', 'Promoção Natal 2025');

-- Inserir logs de campanhas
INSERT INTO campaign_logs (campaign_id, acao, detalhes)
SELECT id, 'disparar', '{"plataformas": ["instagram", "google_ads", "tiktok", "whatsapp"], "timestamp": "' || NOW() || '", "status": "sucesso"}'
FROM campaigns WHERE status = 'ativo';

INSERT INTO campaign_logs (campaign_id, acao, detalhes)
SELECT id, 'analisar', '{"score": ' || FLOOR(RANDOM() * 100) || ', "recomendacoes": ["otimizar_publico", "aumentar_orcamento"], "timestamp": "' || NOW() || '"}'
FROM campaigns WHERE status = 'ativo' LIMIT 5;

-- Confirmar inserção
SELECT COUNT(*) as total_campanhas FROM campaigns;
SELECT COUNT(*) as total_metricas FROM campaign_metrics;
SELECT COUNT(*) as total_logs FROM campaign_logs;

