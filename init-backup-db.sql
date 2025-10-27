-- Tabela de histórico de backup
CREATE TABLE IF NOT EXISTS backup_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  backup_type VARCHAR(50) NOT NULL,
  destination VARCHAR(100),
  status VARCHAR(50),
  arquivo_size BIGINT,
  criado_em TIMESTAMP DEFAULT NOW(),
  completado_em TIMESTAMP
);

-- Tabela de histórico de voz
CREATE TABLE IF NOT EXISTS voice_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  comando TEXT NOT NULL,
  transcricao TEXT,
  resposta TEXT,
  audio_url VARCHAR(500),
  campanha_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,
  timestamp TIMESTAMP DEFAULT NOW()
);

-- Tabela de dados offline (cache)
CREATE TABLE IF NOT EXISTS offline_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tipo_dados VARCHAR(100),
  dados JSONB NOT NULL,
  sincronizado BOOLEAN DEFAULT false,
  criado_em TIMESTAMP DEFAULT NOW(),
  sincronizado_em TIMESTAMP
);

-- Tabela de modo demo
CREATE TABLE IF NOT EXISTS demo_mode_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'ativo',
  campanhas_demo INTEGER DEFAULT 0,
  vendas_demo INTEGER DEFAULT 0,
  receita_demo DECIMAL(10, 2) DEFAULT 0,
  criado_em TIMESTAMP DEFAULT NOW(),
  atualizado_em TIMESTAMP DEFAULT NOW()
);

-- Tabela de configuração de backup (Google Drive, S3, etc)
CREATE TABLE IF NOT EXISTS backup_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  google_drive_enabled BOOLEAN DEFAULT false,
  google_drive_token TEXT,
  s3_enabled BOOLEAN DEFAULT false,
  s3_bucket VARCHAR(255),
  s3_region VARCHAR(50),
  local_backup_enabled BOOLEAN DEFAULT true,
  backup_interval_minutes INTEGER DEFAULT 15,
  criado_em TIMESTAMP DEFAULT NOW(),
  atualizado_em TIMESTAMP DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_backup_history_user_id ON backup_history(user_id);
CREATE INDEX IF NOT EXISTS idx_backup_history_status ON backup_history(status);
CREATE INDEX IF NOT EXISTS idx_voice_history_user_id ON voice_history(user_id);
CREATE INDEX IF NOT EXISTS idx_voice_history_timestamp ON voice_history(timestamp);
CREATE INDEX IF NOT EXISTS idx_offline_cache_user_id ON offline_cache(user_id);
CREATE INDEX IF NOT EXISTS idx_offline_cache_sincronizado ON offline_cache(sincronizado);
CREATE INDEX IF NOT EXISTS idx_demo_sessions_user_id ON demo_mode_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_backup_config_user_id ON backup_config(user_id);

-- Trigger para atualizar atualizado_em em backup_config
CREATE TRIGGER update_backup_config_updated_at BEFORE UPDATE ON backup_config
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger para atualizar atualizado_em em demo_mode_sessions
CREATE TRIGGER update_demo_sessions_updated_at BEFORE UPDATE ON demo_mode_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

