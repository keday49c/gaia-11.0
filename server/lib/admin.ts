import pool from '../db.js';
import { DEMO_USER } from '../test-keys.js';

export async function checkHasAdmin(): Promise<boolean> {
  try {
    const res = await pool.query('SELECT COUNT(*) AS cnt FROM users WHERE email != $1', [DEMO_USER.email]);
    const cnt = Number(res.rows?.[0]?.cnt ?? 0);
    return cnt > 0;
  } catch (err) {
    console.error('Erro ao checar admin:', err);
    throw err;
  }
}

export default { checkHasAdmin };