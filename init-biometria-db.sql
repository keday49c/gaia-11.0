-- Tabela de biometria (fingerprint/face)
CREATE TABLE IF NOT EXISTS user_biometrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  biometric_type VARCHAR(50) NOT NULL,
  biometric_data BYTEA NOT NULL,
  enabled BOOLEAN DEFAULT false,
  criado_em TIMESTAMP DEFAULT NOW(),
  atualizado_em TIMESTAMP DEFAULT NOW()
);

-- Tabela de logs de acesso detalhados
CREATE TABLE IF NOT EXISTS detailed_access_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  acao VARCHAR(100) NOT NULL,
  ip_address VARCHAR(45),
  user_agent TEXT,
  detalhes JSONB,
  resultado VARCHAR(50),
  timestamp TIMESTAMP DEFAULT NOW()
);

-- Tabela de modo teste
CREATE TABLE IF NOT EXISTS test_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  titulo VARCHAR(255) NOT NULL,
  descricao TEXT,
  publico JSONB,
  orcamento DECIMAL(10, 2),
  status VARCHAR(50) DEFAULT 'simulado',
  metricas_simuladas JSONB,
  criado_em TIMESTAMP DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_user_biometrics_user_id ON user_biometrics(user_id);
CREATE INDEX IF NOT EXISTS idx_detailed_access_logs_user_id ON detailed_access_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_detailed_access_logs_timestamp ON detailed_access_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_test_campaigns_user_id ON test_campaigns(user_id);

-- Trigger para atualizar atualizado_em em user_biometrics
CREATE TRIGGER update_user_biometrics_updated_at BEFORE UPDATE ON user_biometrics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

