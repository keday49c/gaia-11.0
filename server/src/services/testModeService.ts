/**
 * Serviço de Modo Teste
 * Simula campanhas sem gastar recursos reais
 */

import { query } from '../config/database';

export interface TestCampaignResult {
  success: boolean;
  campaign_id: string;
  metricas: {
    impressoes: number;
    cliques: number;
    conversoes: number;
    custo: number;
    receita: number;
    cpc: number;
    ctr: number;
    roas: number;
  };
  plataformas: {
    instagram: {
      status: string;
      impressoes: number;
      cliques: number;
    };
    google_ads: {
      status: string;
      impressoes: number;
      cliques: number;
    };
    tiktok: {
      status: string;
      impressoes: number;
      cliques: number;
    };
    whatsapp: {
      status: string;
      mensagens: number;
      respostas: number;
    };
  };
}

/**
 * Simular campanha sem gastar recursos
 */
export async function simulateCampaign(
  userId: string,
  campaignData: {
    titulo: string;
    descricao?: string;
    orcamento: number;
    texto: string;
  }
): Promise<TestCampaignResult> {
  try {
    // Gerar dados simulados realistas
    const baseImpressoes = Math.floor(Math.random() * 1000) + 500;
    const baseCtr = Math.random() * 0.05 + 0.01;
    const baseCliques = Math.floor(baseImpressoes * baseCtr);
    const baseTaxaConversao = Math.random() * 0.1 + 0.02;
    const baseConversoes = Math.floor(baseCliques * baseTaxaConversao);
    const custoPorClique = Math.random() * 2 + 0.5;
    const custoTotal = baseCliques * custoPorClique;
    const valorMedio = Math.random() * 100 + 50;
    const receita = baseConversoes * valorMedio;

    // Distribuir métricas por plataforma
    const instagramImpressoes = Math.floor(baseImpressoes * 0.3);
    const googleAdsImpressoes = Math.floor(baseImpressoes * 0.4);
    const tiktokImpressoes = Math.floor(baseImpressoes * 0.2);
    const whatsappMensagens = Math.floor(baseCliques * 0.1);

    const resultado: TestCampaignResult = {
      success: true,
      campaign_id: `test_${Date.now()}`,
      metricas: {
        impressoes: baseImpressoes,
        cliques: baseCliques,
        conversoes: baseConversoes,
        custo: parseFloat(custoTotal.toFixed(2)),
        receita: parseFloat(receita.toFixed(2)),
        cpc: parseFloat((custoTotal / baseCliques).toFixed(2)),
        ctr: parseFloat(((baseCliques / baseImpressoes) * 100).toFixed(2)),
        roas: parseFloat((receita / custoTotal).toFixed(2)),
      },
      plataformas: {
        instagram: {
          status: 'simulado',
          impressoes: instagramImpressoes,
          cliques: Math.floor(instagramImpressoes * baseCtr),
        },
        google_ads: {
          status: 'simulado',
          impressoes: googleAdsImpressoes,
          cliques: Math.floor(googleAdsImpressoes * baseCtr),
        },
        tiktok: {
          status: 'simulado',
          impressoes: tiktokImpressoes,
          cliques: Math.floor(tiktokImpressoes * baseCtr),
        },
        whatsapp: {
          status: 'simulado',
          mensagens: whatsappMensagens,
          respostas: Math.floor(whatsappMensagens * 0.8),
        },
      },
    };

    // Salvar no banco como teste
    await query(
      `INSERT INTO test_campaigns (user_id, titulo, descricao, orcamento, status, metricas_simuladas)
       VALUES ($1, $2, $3, $4, 'simulado', $5)`,
      [
        userId,
        campaignData.titulo,
        campaignData.descricao,
        campaignData.orcamento,
        JSON.stringify(resultado),
      ]
    );

    return resultado;
  } catch (error) {
    console.error('Erro ao simular campanha:', error);
    return {
      success: false,
      campaign_id: '',
      metricas: {
        impressoes: 0,
        cliques: 0,
        conversoes: 0,
        custo: 0,
        receita: 0,
        cpc: 0,
        ctr: 0,
        roas: 0,
      },
      plataformas: {
        instagram: { status: 'erro', impressoes: 0, cliques: 0 },
        google_ads: { status: 'erro', impressoes: 0, cliques: 0 },
        tiktok: { status: 'erro', impressoes: 0, cliques: 0 },
        whatsapp: { status: 'erro', mensagens: 0, respostas: 0 },
      },
    };
  }
}

/**
 * Listar campanhas de teste do usuário
 */
export async function listTestCampaigns(userId: string): Promise<any[]> {
  try {
    const result = await query(
      `SELECT * FROM test_campaigns WHERE user_id = $1 ORDER BY criado_em DESC LIMIT 50`,
      [userId]
    );

    return result.rows;
  } catch (error) {
    console.error('Erro ao listar campanhas de teste:', error);
    return [];
  }
}

/**
 * Deletar campanha de teste
 */
export async function deleteTestCampaign(campaignId: string, userId: string): Promise<boolean> {
  try {
    const result = await query(
      `DELETE FROM test_campaigns WHERE id = $1 AND user_id = $2`,
      [campaignId, userId]
    );

    return result.rowCount > 0;
  } catch (error) {
    console.error('Erro ao deletar campanha de teste:', error);
    return false;
  }
}

