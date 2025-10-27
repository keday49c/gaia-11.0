-- Tabela de campanhas
CREATE TABLE IF NOT EXISTS campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  titulo VARCHAR(255) NOT NULL,
  descricao TEXT,
  publico JSONB NOT NULL,
  orcamento DECIMAL(10, 2) NOT NULL,
  imagem_url VARCHAR(500),
  texto TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'rascunho',
  plataformas JSONB DEFAULT '{"instagram": false, "google_ads": false, "tiktok": false, "whatsapp": false}',
  criado_em TIMESTAMP DEFAULT NOW(),
  atualizado_em TIMESTAMP DEFAULT NOW(),
  iniciado_em TIMESTAMP,
  finalizado_em TIMESTAMP
);

-- Tabela de métricas de campanhas
CREATE TABLE IF NOT EXISTS campaign_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  plataforma VARCHAR(50) NOT NULL,
  impressoes INTEGER DEFAULT 0,
  cliques INTEGER DEFAULT 0,
  conversoes INTEGER DEFAULT 0,
  custo DECIMAL(10, 2) DEFAULT 0,
  receita DECIMAL(10, 2) DEFAULT 0,
  cpc DECIMAL(10, 2) DEFAULT 0,
  ctr DECIMAL(5, 2) DEFAULT 0,
  roas DECIMAL(5, 2) DEFAULT 0,
  timestamp TIMESTAMP DEFAULT NOW()
);

-- Tabela de logs de campanhas
CREATE TABLE IF NOT EXISTS campaign_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  acao VARCHAR(100) NOT NULL,
  detalhes JSONB,
  timestamp TIMESTAMP DEFAULT NOW()
);

-- Tabela de mensagens WhatsApp
CREATE TABLE IF NOT EXISTS whatsapp_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,
  numero_cliente VARCHAR(20) NOT NULL,
  tipo VARCHAR(20) NOT NULL,
  conteudo TEXT NOT NULL,
  resposta TEXT,
  timestamp TIMESTAMP DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_campaigns_user_id ON campaigns(user_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaign_metrics_campaign_id ON campaign_metrics(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_logs_campaign_id ON campaign_logs(campaign_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_user_id ON whatsapp_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_campaign_id ON whatsapp_messages(campaign_id);

-- Triggers para atualizar atualizado_em
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.atualizado_em = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON campaigns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

