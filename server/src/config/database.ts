import { Pool, PoolClient } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('error', (err) => {
  console.error('Erro inesperado no pool de conexões:', err);
});

/**
 * Executa uma query no banco de dados
 * @param query - Query SQL
 * @param values - Valores para prepared statement
 * @returns Resultado da query
 */
export async function query(queryText: string, values?: any[]) {
  const start = Date.now();
  try {
    const result = await pool.query(queryText, values);
    const duration = Date.now() - start;
    console.log(`Query executada em ${duration}ms: ${queryText.substring(0, 50)}...`);
    return result;
  } catch (error) {
    console.error('Erro ao executar query:', error);
    throw error;
  }
}

/**
 * Obtém um cliente do pool para transações
 * @returns Cliente do pool
 */
export async function getClient(): Promise<PoolClient> {
  return pool.connect();
}

/**
 * Fecha o pool de conexões
 */
export async function closePool(): Promise<void> {
  await pool.end();
}

export default pool;

