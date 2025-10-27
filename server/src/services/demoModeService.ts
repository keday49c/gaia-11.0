/**
 * Serviço de Modo Demo
 * Campanha fingida, venda fingida, relatório fingido
 */

import { query } from '../config/database';

export interface DemoSession {
  id: string;
  status: string;
  campanhas_demo: number;
  vendas_demo: number;
  receita_demo: number;
}

/**
 * Iniciar sessão de demo
 */
export async function startDemoSession(userId: string): Promise<{ success: boolean; sessionId?: string; message: string }> {
  try {
    // Verificar se já existe sessão ativa
    const existingResult = await query(
      `SELECT id FROM demo_mode_sessions WHERE user_id = $1 AND status = 'ativo'`,
      [userId]
    );

    if (existingResult.rows.length > 0) {
      return {
        success: true,
        sessionId: existingResult.rows[0].id,
        message: 'Sessão de demo já ativa',
      };
    }

    // Criar nova sessão
    const result = await query(
      `INSERT INTO demo_mode_sessions (user_id, status, campanhas_demo, vendas_demo, receita_demo)
       VALUES ($1, 'ativo', 0, 0, 0)
       RETURNING id`,
      [userId]
    );

    return {
      success: true,
      sessionId: result.rows[0].id,
      message: 'Sessão de demo iniciada',
    };
  } catch (error) {
    console.error('Erro ao iniciar sessão de demo:', error);
    return {
      success: false,
      message: 'Erro ao iniciar sessão de demo',
    };
  }
}

/**
 * Simular campanha no modo demo
 */
export async function simulateDemoCampaign(
  sessionId: string,
  userId: string
): Promise<{ success: boolean; campaign?: any; message: string }> {
  try {
    // Gerar dados simulados
    const campanhaNum = Math.floor(Math.random() * 1000) + 1;
    const titulo = `Campanha Demo #${campanhaNum}`;
    const orcamento = Math.floor(Math.random() * 5000) + 500;
    const impressoes = Math.floor(Math.random() * 2000) + 500;
    const cliques = Math.floor(impressoes * (Math.random() * 0.05 + 0.01));
    const conversoes = Math.floor(cliques * (Math.random() * 0.1 + 0.02));
    const custo = cliques * (Math.random() * 2 + 0.5);
    const receita = conversoes * (Math.random() * 100 + 50);

    const demoData = {
      titulo,
      orcamento,
      metricas: {
        impressoes,
        cliques,
        conversoes,
        custo: parseFloat(custo.toFixed(2)),
        receita: parseFloat(receita.toFixed(2)),
        cpc: parseFloat((custo / cliques).toFixed(2)),
        ctr: parseFloat(((cliques / impressoes) * 100).toFixed(2)),
        roas: parseFloat((receita / custo).toFixed(2)),
      },
      plataformas: {
        instagram: { impressoes: Math.floor(impressoes * 0.3), cliques: Math.floor(cliques * 0.3) },
        google_ads: { impressoes: Math.floor(impressoes * 0.4), cliques: Math.floor(cliques * 0.4) },
        tiktok: { impressoes: Math.floor(impressoes * 0.2), cliques: Math.floor(cliques * 0.2) },
        whatsapp: { mensagens: Math.floor(cliques * 0.1), respostas: Math.floor(cliques * 0.08) },
      },
    };

    // Atualizar sessão
    await query(
      `UPDATE demo_mode_sessions 
       SET campanhas_demo = campanhas_demo + 1,
           vendas_demo = vendas_demo + $1,
           receita_demo = receita_demo + $2,
           atualizado_em = NOW()
       WHERE id = $3 AND user_id = $4`,
      [conversoes, receita, sessionId, userId]
    );

    return {
      success: true,
      campaign: demoData,
      message: 'Campanha demo simulada com sucesso',
    };
  } catch (error) {
    console.error('Erro ao simular campanha demo:', error);
    return {
      success: false,
      message: 'Erro ao simular campanha demo',
    };
  }
}

/**
 * Obter status da sessão de demo
 */
export async function getDemoSessionStatus(sessionId: string, userId: string): Promise<DemoSession | null> {
  try {
    const result = await query(
      `SELECT * FROM demo_mode_sessions WHERE id = $1 AND user_id = $2`,
      [sessionId, userId]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return {
      id: result.rows[0].id,
      status: result.rows[0].status,
      campanhas_demo: result.rows[0].campanhas_demo,
      vendas_demo: result.rows[0].vendas_demo,
      receita_demo: result.rows[0].receita_demo,
    };
  } catch (error) {
    console.error('Erro ao obter status da sessão:', error);
    return null;
  }
}

/**
 * Parar sessão de demo
 */
export async function stopDemoSession(sessionId: string, userId: string): Promise<{ success: boolean; message: string }> {
  try {
    await query(
      `UPDATE demo_mode_sessions SET status = 'parado', atualizado_em = NOW() WHERE id = $1 AND user_id = $2`,
      [sessionId, userId]
    );

    return {
      success: true,
      message: 'Sessão de demo parada',
    };
  } catch (error) {
    console.error('Erro ao parar sessão de demo:', error);
    return {
      success: false,
      message: 'Erro ao parar sessão de demo',
    };
  }
}

/**
 * Resetar sessão de demo
 */
export async function resetDemoSession(sessionId: string, userId: string): Promise<{ success: boolean; message: string }> {
  try {
    await query(
      `UPDATE demo_mode_sessions 
       SET campanhas_demo = 0, vendas_demo = 0, receita_demo = 0, atualizado_em = NOW()
       WHERE id = $1 AND user_id = $2`,
      [sessionId, userId]
    );

    return {
      success: true,
      message: 'Sessão de demo resetada',
    };
  } catch (error) {
    console.error('Erro ao resetar sessão de demo:', error);
    return {
      success: false,
      message: 'Erro ao resetar sessão de demo',
    };
  }
}

/**
 * Obter histórico de sessões de demo
 */
export async function getDemoSessionHistory(userId: string): Promise<DemoSession[]> {
  try {
    const result = await query(
      `SELECT * FROM demo_mode_sessions WHERE user_id = $1 ORDER BY criado_em DESC LIMIT 50`,
      [userId]
    );

    return result.rows;
  } catch (error) {
    console.error('Erro ao obter histórico de demo:', error);
    return [];
  }
}

/**
 * Gerar relatório demo
 */
export async function generateDemoReport(sessionId: string, userId: string): Promise<{ success: boolean; report?: any; message: string }> {
  try {
    const session = await getDemoSessionStatus(sessionId, userId);

    if (!session) {
      return {
        success: false,
        message: 'Sessão não encontrada',
      };
    }

    const report = {
      session_id: sessionId,
      status: session.status,
      total_campanhas: session.campanhas_demo,
      total_vendas: session.vendas_demo,
      total_receita: parseFloat(session.receita_demo.toFixed(2)),
      media_receita_por_campanha: parseFloat((session.receita_demo / session.campanhas_demo).toFixed(2)),
      generated_at: new Date().toISOString(),
    };

    return {
      success: true,
      report,
      message: 'Relatório demo gerado com sucesso',
    };
  } catch (error) {
    console.error('Erro ao gerar relatório demo:', error);
    return {
      success: false,
      message: 'Erro ao gerar relatório demo',
    };
  }
}

