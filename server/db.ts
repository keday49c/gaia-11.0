import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import Database from 'better-sqlite3';

// Support either postgres (default) or sqlite (portable desktop mode)
const useSqlite = (process.env.DATABASE || '').toLowerCase() === 'sqlite';
let pool: any;

if (useSqlite) {
  const sqliteFile = process.env.SQLITE_FILE || path.resolve(process.cwd(), './data/gaia.sqlite');
  const dir = path.dirname(sqliteFile);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const db = new Database(sqliteFile);

  // Minimal query wrapper to emulate pg Pool.query
  pool = {
    query: async (sql: string, params?: any[]) => {
      const stmt = db.prepare(sql);
      // Heuristic: use .all for SELECT, .run for others
      const isSelect = /^\s*select/i.test(sql);
      if (isSelect) {
        const rows = stmt.all(params || []);
        return { rows };
      } else {
        const info = stmt.run(params || []);
        return { rowCount: info.changes, rows: [] };
      }
    },
    getClient: () => db,
  };
} else {
  // Configurar conexão com PostgreSQL
  const useSSL = typeof process.env.DB_SSL !== 'undefined'
    ? (process.env.DB_SSL === 'true')
    : (process.env.NODE_ENV === 'production');

  pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://gaia_user:gaia_password@postgres:5432/gaia_db',
    ssl: useSSL ? { rejectUnauthorized: false } : false,
  });
}

// Event handlers for pool (only for postgres)
if (!useSqlite) {
  pool.on('error', (err: any) => {
    console.error('❌ Erro inesperado no pool de conexões:', err);
  });

  pool.on('connect', () => {
    console.log('✅ Nova conexão estabelecida com o banco de dados');
  });
}

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

    // Ensure UUID extension exists (needed for uuid_generate_v4)
    try {
      await pool.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);
      await pool.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto";`);
      console.log('✅ Extensions "uuid-ossp" and "pgcrypto" ensured');
    } catch (extErr: any) {
      console.warn('⚠️ could not ensure uuid-ossp extension:', extErr?.message ?? extErr);
    }

    // Tabela de usuários
    if ((process.env.DATABASE || '').toLowerCase() === 'sqlite') {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          email TEXT UNIQUE NOT NULL,
          senha TEXT NOT NULL,
          nome TEXT,
          google_ads_key TEXT,
          instagram_token TEXT,
          whatsapp_token TEXT,
          criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
    } else {
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
    }
    console.log('✅ Tabela "users" pronta');

    // Tabela de análises (resultados de IA)
    if ((process.env.DATABASE || '').toLowerCase() === 'sqlite') {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS analyses (
          id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
          campaign_id TEXT NOT NULL,
          provider TEXT,
          score INTEGER,
          recommendations TEXT,
          raw_response TEXT,
          criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
    } else {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS analyses (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
          provider VARCHAR(100),
          score INTEGER,
          recommendations JSONB,
          raw_response JSONB,
          criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
    }
    console.log('✅ Tabela "analyses" pronta');

    // Tabela de campanhas
    if ((process.env.DATABASE || '').toLowerCase() === 'sqlite') {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS campaigns (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          nome TEXT NOT NULL,
          descricao TEXT,
          status TEXT DEFAULT 'rascunho',
          tipo TEXT,
          plataforma TEXT,
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
      // add foreign key emulation for sqlite (no-op if referenced table not set)
    } else {
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
    }
    console.log('✅ Tabela "campaigns" pronta');

    // Tabela de métricas
    if ((process.env.DATABASE || '').toLowerCase() === 'sqlite') {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS metrics (
          id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
          campaign_id TEXT NOT NULL,
          data DATE NOT NULL,
          cliques INTEGER DEFAULT 0,
          impressoes INTEGER DEFAULT 0,
          conversoes INTEGER DEFAULT 0,
          custo DECIMAL(10, 2),
          receita DECIMAL(10, 2),
          criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
    } else {
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
    }
    console.log('✅ Tabela "metrics" pronta');

    // Tabela de logs
    if ((process.env.DATABASE || '').toLowerCase() === 'sqlite') {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS logs (
          id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
          user_id TEXT,
          acao TEXT NOT NULL,
          detalhes TEXT,
          ip_address TEXT,
          criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
    } else {
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
    }
    console.log('✅ Tabela "logs" pronta');

    // Seed usuário padrão se não existir
    const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', ['admin@gaia.local']);

    if (existingUser.rows.length === 0) {
      // default admin password (hashed)
      const hashed = await bcrypt.hash('senha123', 10);
      const adminId = crypto.randomUUID();
      await pool.query(`INSERT INTO users (id, email, senha, nome) VALUES ($1, $2, $3, $4)`, [adminId, 'admin@gaia.local', hashed, 'Administrador']);
      console.log('✅ Usuário padrão criado: admin@gaia.local / (senha hasheada)');
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

