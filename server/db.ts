import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
// Load better-sqlite3 lazily to avoid import-time failures on platforms where native bindings are missing.
// When not using SQLite, we should not fail because the package is unavailable.
let Database: any;
try {
  // Use eval('require') to avoid bundlers or ESM static analysis errors during packaging
  Database = (eval('require'))('better-sqlite3');
} catch (e) {
  Database = undefined;
}

// Support either postgres (default) or sqlite (portable desktop mode)
// We'll attempt PostgreSQL first unless explicitly asked for SQLite. If Postgres is unreachable
// we'll fall back to SQLite (if available) to keep the portable package usable out-of-the-box.
let pool: any;

const createSqlitePool = () => {
  const sqliteFile = process.env.SQLITE_FILE || path.resolve(process.cwd(), './data/gaia.sqlite');
  const dir = path.dirname(sqliteFile);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const db = new Database(sqliteFile);

  // Minimal query wrapper to emulate pg Pool.query
  return {
    query: async (sql: string, params?: any[]) => {
      // Normalize Postgres-style $1, $2 placeholders to SQLite '?' placeholders
      const normalizedSql = (sql || '').replace(/\$\d+/g, '?');
      const stmt = db.prepare(normalizedSql);
      // Heuristic: use .all for SELECT, .run for others
      const isSelect = /^\s*select/i.test(normalizedSql);
      if (isSelect) {
        const rows = stmt.all(params || []);
        return { rows };
      } else {
        const info = stmt.run(params || []);
        return { rowCount: info.changes, rows: [] };
      }
    },
    getClient: () => db,
    _type: 'sqlite',
  };
};

const preferSqlite = (process.env.DATABASE || '').toLowerCase() === 'sqlite' || process.env.FORCE_SQLITE === '1';

if (preferSqlite) {
  pool = createSqlitePool();
} else {
  // Configure Postgres pool but defer decision to initializeDatabase (we'll try and fall back on errors)
  const useSSL = typeof process.env.DB_SSL !== 'undefined'
    ? (process.env.DB_SSL === 'true')
    : (process.env.NODE_ENV === 'production');

  pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://gaia_user:gaia_password@postgres:5432/gaia_db',
    ssl: useSSL ? { rejectUnauthorized: false } : false,
  });
  // mark as postgres by default
  (pool as any)._type = 'postgres';
}

// Event handlers for pool (only for postgres)
if (!preferSqlite) {
  pool.on('error', (err: any) => {
    console.error('❌ Erro inesperado no pool de conexões:', err);
  });

  pool.on('connect', () => {
    console.log('✅ Nova conexão estabelecida com o banco de dados');
  });
}

// Event handlers para pool
pool.on('error', (err: any) => {
  console.error('❌ Erro inesperado no pool de conexões:', err);
});

pool.on('connect', () => {
  console.log('✅ Nova conexão estabelecida com o banco de dados');
});

// Schema do banco de dados
export const initializeDatabase = async () => {
  try {
    // Test DB connection. If using postgres and it fails, fall back to SQLite (if possible)
    let initialAttempt = (pool && (pool as any)._type) ? (pool as any)._type : 'postgres';
    try {
      const testConnection = await pool.query('SELECT NOW()');
      console.log('✅ Conexão com banco de dados estabelecida:', testConnection.rows && testConnection.rows[0] ? testConnection.rows[0] : testConnection);
    } catch (err: any) {
      console.warn('⚠️ Falha ao conectar ao Postgres:', err?.message ?? err);
      if (Database) {
        console.log('🔁 Tentando fallback para SQLite (disponível)');
        pool = createSqlitePool();
        initialAttempt = 'sqlite';
      } else {
        console.error('❌ SQLite não está disponível para fallback; abortando inicialização do DB');
        throw err;
      }
    }

    // If we ended up on sqlite, ensure the sqlite schema uses TEXT ids etc.
    const isSqlite = initialAttempt === 'sqlite' || (pool && (pool as any)._type === 'sqlite');

    // Ensure UUID extension exists (needed for uuid_generate_v4) - only for postgres
    if (!isSqlite) {
      try {
        await pool.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);
        await pool.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto";`);
        console.log('✅ Extensions "uuid-ossp" and "pgcrypto" ensured');
      } catch (extErr: any) {
        console.warn('⚠️ could not ensure uuid-ossp extension:', extErr?.message ?? extErr);
      }
    }

    // Tabela de usuários
    if (isSqlite) {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          email TEXT UNIQUE NOT NULL,
          senha TEXT NOT NULL,
          nome TEXT,
          google_ads_key TEXT,
          google_ads_customer_id TEXT,
          instagram_token TEXT,
          whatsapp_token TEXT,
          openai_key TEXT,
          gemini_key TEXT,
          meta_key TEXT,
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
          google_ads_customer_id VARCHAR(100),
          instagram_token VARCHAR(500),
          whatsapp_token VARCHAR(500),
          openai_key VARCHAR(500),
          openai_key_alt VARCHAR(500),
          gemini_key VARCHAR(500),
          gemini_key_alt VARCHAR(500),
          meta_key VARCHAR(500),
          criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
    }
    console.log('✅ Tabela "users" pronta');

    // Ensure per-user google_ads_customer_id column exists (idempotent for Postgres; ignored on SQLite if fails)
    try {
      await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS google_ads_customer_id VARCHAR(100);");
      await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS openai_key VARCHAR(500);");
      await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS openai_key_alt VARCHAR(500);");
      await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS gemini_key VARCHAR(500);");
      await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS gemini_key_alt VARCHAR(500);");
      await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS meta_key VARCHAR(500);");
      console.log('✅ Coluna "google_ads_customer_id" garantida (se aplicável)');
    } catch (colErr) {
      // SQLite doesn't support IF NOT EXISTS for columns; ignore errors
      try {
        await pool.query("ALTER TABLE users ADD COLUMN google_ads_customer_id VARCHAR(100);");
        console.log('✅ Coluna "google_ads_customer_id" adicionada');
      } catch (e) {
        // ignore if column exists or operation not supported
      }
    }

    // Tabela de análises (resultados de IA)
    if (isSqlite) {
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
    if (isSqlite) {
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
    if (isSqlite) {
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
    if (isSqlite) {
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

export const getPool = () => pool;

// Export a light wrapper object so that consumers that import the default `pool` (and tests that mock `pool.query`) will
// always call through to the current underlying `pool` instance. This preserves the previous module shape while
// allowing `initializeDatabase()` to replace the internal `pool` variable at runtime (e.g., when falling back to SQLite).
const exportedPool: any = {
  query: async (...args: any[]) => {
    return pool.query(...args);
  },
  getClient: () => (pool && typeof pool.getClient === 'function') ? pool.getClient() : undefined,
};
// Expose a dynamic _type property so tests and callers can read `pool._type` as a string
Object.defineProperty(exportedPool, '_type', {
  get: () => (pool && (pool as any)._type) ? (pool as any)._type : undefined,
  enumerable: true,
});

export default exportedPool;

