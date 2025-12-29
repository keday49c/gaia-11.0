import pool from './db.js';
import bcrypt from 'bcryptjs';

/**
 * Script para inserir usuário padrão no banco de dados
 * Execução: npx ts-node server/seed-default-user.ts
 */

const seedDefaultUser = async () => {
  try {
    console.log('🌱 Iniciando seed do usuário padrão...\n');

    // Verificar se usuário já existe
    const existing = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      ['admin@gaia.local']
    );

    if (existing.rows.length > 0) {
      console.log('⚠️  Usuário admin@gaia.local já existe no banco de dados');
      console.log('   ID:', existing.rows[0].id);
      console.log('\n✅ Seed concluído (usuário já existente)');
      process.exit(0);
    }

    // Inserir usuário padrão (senha será hasheada)
    const DEFAULT_ADMIN_PASSWORD = process.env.DEFAULT_ADMIN_PASSWORD || 'senha123';
    if (DEFAULT_ADMIN_PASSWORD === 'senha123') {
      console.warn('⚠️ Usando senha padrão de desenvolvimento. Defina DEFAULT_ADMIN_PASSWORD em produção!');
    }
    const hashed = await bcrypt.hash(DEFAULT_ADMIN_PASSWORD, 10);
    const result = await pool.query(
      `INSERT INTO users (email, senha, nome) 
       VALUES ($1, $2, $3) 
       RETURNING id, email, nome`,
      ['admin@gaia.local', hashed, 'Administrador']
    );

    const user = result.rows[0];
    console.log('✅ Usuário padrão criado com sucesso!\n');
    console.log('📋 Detalhes do usuário:');
    console.log('   ID:', user.id);
    console.log('   Email:', user.email);
    console.log('   Nome:', user.nome);
    console.log('\n🔐 Observação: A senha padrão foi usada em ambiente de desenvolvimento e está **hasheada**. NÃO exiba a senha em logs.');
    console.log('\n✅ Seed concluído com sucesso!');

    process.exit(0);
  } catch (error: any) {
    console.error('❌ Erro ao fazer seed:', error?.message ?? error);
    process.exit(1);
  }
};

seedDefaultUser();

