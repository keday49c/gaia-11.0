import pool from './db';

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

    // Inserir usuário padrão
    const result = await pool.query(
      `INSERT INTO users (email, senha, nome) 
       VALUES ($1, $2, $3) 
       RETURNING id, email, nome`,
      ['admin@gaia.local', 'senha123', 'Administrador']
    );

    const user = result.rows[0];
    console.log('✅ Usuário padrão criado com sucesso!\n');
    console.log('📋 Detalhes do usuário:');
    console.log('   ID:', user.id);
    console.log('   Email:', user.email);
    console.log('   Nome:', user.nome);
    console.log('\n🔐 Credenciais de login:');
    console.log('   Email: admin@gaia.local');
    console.log('   Senha: senha123');
    console.log('\n✅ Seed concluído com sucesso!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao fazer seed:', error);
    process.exit(1);
  }
};

seedDefaultUser();

