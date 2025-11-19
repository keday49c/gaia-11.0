import { Pool } from 'pg';

// Configurar conexão com PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://gaia_user:gaia_password@postgres:5432/gaia_db',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// Event handlers para pool
pool.on('error', (err) => {
  console.error('❌ Erro inesperado no pool de conexões:', err);
});

pool.on('connect', () => {
  console.log('✅ Nova conexão estabelecida com o banco de dados');
});

// Schema do banco de dados
export const initializeDatabase = async () => {
  try {
    // Testar conexão
    const testConnection = await pool.query('SELECT NOW()');
    console.log('✅ Conexão com banco de dados estabelecida:', testConnection.rows[0]);

    // Tabela de usuários
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        senha VARCHAR(255) NOT NULL,
        nome VARCHAR(255),
        google_ads_key VARCHAR(500),
        instagram_token VARCHAR(500),
        whatsapp_token VARCHAR(500),
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Tabela "users" pronta');

    // Tabela de campanhas
    await pool.query(`
      CREATE TABLE IF NOT EXISTS campaigns (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        nome VARCHAR(255) NOT NULL,
        descricao TEXT,
        status VARCHAR(50) DEFAULT 'rascunho',
        tipo VARCHAR(50),
        plataforma VARCHAR(50),
        data_inicio TIMESTAMP,
        data_fim TIMESTAMP,
        orcamento DECIMAL(10, 2),
        cliques INTEGER DEFAULT 0,
        impressoes INTEGER DEFAULT 0,
        conversoes INTEGER DEFAULT 0,
        ctr DECIMAL(5, 2),
        cpc DECIMAL(10, 2),
        roi DECIMAL(5, 2),
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Tabela "campaigns" pronta');

    // Tabela de métricas
    await pool.query(`
      CREATE TABLE IF NOT EXISTS metrics (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
        data DATE NOT NULL,
        cliques INTEGER DEFAULT 0,
        impressoes INTEGER DEFAULT 0,
        conversoes INTEGER DEFAULT 0,
        custo DECIMAL(10, 2),
        receita DECIMAL(10, 2),
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Tabela "metrics" pronta');

    // Tabela de logs
    await pool.query(`
      CREATE TABLE IF NOT EXISTS logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        acao VARCHAR(255) NOT NULL,
        detalhes TEXT,
        ip_address VARCHAR(45),
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Tabela "logs" pronta');

    // Seed usuário padrão se não existir
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      ['admin@gaia.local']
    );

    if (existingUser.rows.length === 0) {
      await pool.query(
        `INSERT INTO users (email, senha, nome) VALUES ($1, $2, $3)`,
        ['admin@gaia.local', 'senha123', 'Administrador']
      );
      console.log('✅ Usuário padrão criado: admin@gaia.local / senha123');
    } else {
      console.log('✅ Usuário padrão já existe no banco de dados');
    }

    console.log('\n✅ Banco de dados inicializado com sucesso\n');
  } catch (error) {
    console.error('\n❌ Erro ao inicializar banco de dados:', error);
    throw error;
  }
};

export default pool;

