import pool from '../db';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

function getArg(name: string) {
  const idx = process.argv.indexOf(name);
  return idx >= 0 ? process.argv[idx + 1] : undefined;
}

async function main() {
  const email = getArg('--email') || process.env.EMAIL;
  const password = getArg('--password') || process.env.PASSWORD;

  if (!email || !password) {
    console.error('Uso: tsx server/scripts/set_password.ts --email you@example.com --password 123456');
    process.exit(1);
  }

  try {
    const hashed = await bcrypt.hash(password, 10);

    const updateResult = await pool.query('UPDATE users SET senha = $1, atualizado_em = CURRENT_TIMESTAMP WHERE email = $2', [hashed, email]);

    if (updateResult.rowCount === 0) {
      const id = crypto.randomUUID();
      const nome = email.split('@')[0] || 'Usuário';
      await pool.query('INSERT INTO users (id, email, senha, nome) VALUES ($1, $2, $3, $4)', [id, email, hashed, nome]);
      console.log(`Usuário criado: ${email}`);
    } else {
      console.log(`Senha atualizada para: ${email}`);
    }
  } catch (err: any) {
    console.error('Erro ao setar senha:', err?.message ?? err);
  } finally {
    await pool.end();
    process.exit(0);
  }
}

main();
