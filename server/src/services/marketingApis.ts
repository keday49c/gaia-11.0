/**
 * Serviço de Mock para APIs de Marketing
 * Simula Google Ads, Instagram, TikTok e WhatsApp
 */

export interface CampaignData {
  titulo: string;
  descricao?: string;
  publico: {
    cidades?: string[];
    idade_min?: number;
    idade_max?: number;
    interesses?: string[];
  };
  orcamento: number;
  imagem_url?: string;
  texto: string;
}

export interface CampaignMetrics {
  plataforma: string;
  impressoes: number;
  cliques: number;
  conversoes: number;
  custo: number;
  receita: number;
}

/**
 * Mock: Dispara campanha no Google Ads
 */
export async function dispararGoogleAds(campaign: CampaignData): Promise<{
  success: boolean;
  campaign_id: string;
  plataforma: string;
  status: string;
}> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        campaign_id: `gads_${Date.now()}`,
        plataforma: 'google_ads',
        status: 'ativo',
      });
    }, 1000);
  });
}

/**
 * Mock: Dispara campanha no Instagram
 */
export async function dispararInstagram(campaign: CampaignData): Promise<{
  success: boolean;
  campaign_id: string;
  plataforma: string;
  status: string;
}> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        campaign_id: `insta_${Date.now()}`,
        plataforma: 'instagram',
        status: 'ativo',
      });
    }, 1200);
  });
}

/**
 * Mock: Agenda campanha no TikTok
 */
export async function agendarTikTok(campaign: CampaignData): Promise<{
  success: boolean;
  campaign_id: string;
  plataforma: string;
  status: string;
}> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        campaign_id: `tiktok_${Date.now()}`,
        plataforma: 'tiktok',
        status: 'agendado',
      });
    }, 1100);
  });
}

/**
 * Mock: Abre fluxo no WhatsApp
 */
export async function abrirFluxoWhatsApp(campaign: CampaignData): Promise<{
  success: boolean;
  campaign_id: string;
  plataforma: string;
  status: string;
}> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        campaign_id: `whatsapp_${Date.now()}`,
        plataforma: 'whatsapp',
        status: 'ativo',
      });
    }, 900);
  });
}

/**
 * Mock: Gera métricas simuladas para uma campanha
 */
export function gerarMetricasMock(plataforma: string): CampaignMetrics {
  const baseImpressoes = Math.floor(Math.random() * 10000) + 1000;
  const ctr = Math.random() * 0.05 + 0.01;
  const cliques = Math.floor(baseImpressoes * ctr);
  const taxaConversao = Math.random() * 0.1 + 0.02;
  const conversoes = Math.floor(cliques * taxaConversao);
  const custoPorClique = Math.random() * 2 + 0.5;
  const custo = cliques * custoPorClique;
  const valorMedio = Math.random() * 100 + 50;
  const receita = conversoes * valorMedio;

  return {
    plataforma,
    impressoes: baseImpressoes,
    cliques,
    conversoes,
    custo: parseFloat(custo.toFixed(2)),
    receita: parseFloat(receita.toFixed(2)),
  };
}

/**
 * Mock: Simula atualização de métricas
 */
export function atualizarMetricasMock(metricas: CampaignMetrics): CampaignMetrics {
  const incrementoImpressoes = Math.floor(Math.random() * 500) + 100;
  const incrementoCliques = Math.floor(incrementoImpressoes * (Math.random() * 0.05 + 0.01));
  const incrementoConversoes = Math.floor(incrementoCliques * (Math.random() * 0.1 + 0.02));

  return {
    ...metricas,
    impressoes: metricas.impressoes + incrementoImpressoes,
    cliques: metricas.cliques + incrementoCliques,
    conversoes: metricas.conversoes + incrementoConversoes,
    custo: parseFloat(
      (metricas.custo + incrementoCliques * (Math.random() * 2 + 0.5)).toFixed(2)
    ),
    receita: parseFloat(
      (metricas.receita + incrementoConversoes * (Math.random() * 100 + 50)).toFixed(2)
    ),
  };
}

/**
 * Mock: Calcula CPC, CTR e ROAS
 */
export function calcularKPIs(metricas: CampaignMetrics): {
  cpc: number;
  ctr: number;
  roas: number;
} {
  const cpc = metricas.cliques > 0 ? parseFloat((metricas.custo / metricas.cliques).toFixed(2)) : 0;
  const ctr =
    metricas.impressoes > 0 ? parseFloat(((metricas.cliques / metricas.impressoes) * 100).toFixed(2)) : 0;
  const roas = metricas.custo > 0 ? parseFloat((metricas.receita / metricas.custo).toFixed(2)) : 0;

  return { cpc, ctr, roas };
}

