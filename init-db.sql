-- Criar extensão UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabela de usuários
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  senha VARCHAR(255) NOT NULL,
  chaves_api JSONB DEFAULT '{"google_ads": null, "instagram": null, "whatsapp": null}',
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de logs de acesso
CREATE TABLE IF NOT EXISTS access_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  ip_address VARCHAR(45),
  acao VARCHAR(100),
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  detalhes JSONB
);

-- Tabela de sessões JWT
CREATE TABLE IF NOT EXISTS jwt_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  token_hash VARCHAR(255) UNIQUE NOT NULL,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expira_em TIMESTAMP NOT NULL,
  revogado BOOLEAN DEFAULT FALSE
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_access_logs_user_id ON access_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_access_logs_timestamp ON access_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_jwt_sessions_user_id ON jwt_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_jwt_sessions_token_hash ON jwt_sessions(token_hash);

-- Função para atualizar atualizado_em
CREATE OR REPLACE FUNCTION update_atualizado_em()
RETURNS TRIGGER AS $$
BEGIN
  NEW.atualizado_em = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar atualizado_em na tabela users
DROP TRIGGER IF EXISTS trigger_update_users_atualizado_em ON users;
CREATE TRIGGER trigger_update_users_atualizado_em
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_atualizado_em();

-- Comentários para documentação
COMMENT ON TABLE users IS 'Tabela de usuários do Gaia com chaves de API criptografadas';
COMMENT ON TABLE access_logs IS 'Log de todos os acessos e ações realizadas no sistema';
COMMENT ON TABLE jwt_sessions IS 'Sessões JWT para controle de tokens';
COMMENT ON COLUMN users.chaves_api IS 'Chaves de API criptografadas em JSON (google_ads, instagram, whatsapp)';

