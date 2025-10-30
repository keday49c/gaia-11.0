/**
 * Chaves de Teste para Demonstração
 * Use essas chaves para testar o Gaia sem suas chaves reais
 */

export const TEST_KEYS = {
  // Google Ads - Chave de Teste
  GOOGLE_ADS: {
    key: 'TEST_GOOGLE_ADS_KEY_12345',
    customerId: 'TEST_CUSTOMER_ID_67890',
    description: 'Chave de teste para Google Ads',
    status: 'test',
  },

  // Instagram - Token de Teste
  INSTAGRAM: {
    token: 'TEST_INSTAGRAM_TOKEN_ABCDEF123456',
    businessAccountId: 'TEST_BUSINESS_ACCOUNT_ID',
    description: 'Token de teste para Instagram',
    status: 'test',
  },

  // WhatsApp - Chave de Teste
  WHATSAPP: {
    token: 'TEST_WHATSAPP_TOKEN_GHIJKL789012',
    phoneNumberId: 'TEST_PHONE_NUMBER_ID',
    businessAccountId: 'TEST_BUSINESS_ACCOUNT_ID',
    description: 'Token de teste para WhatsApp',
    status: 'test',
  },
};

/**
 * Campanhas de Demonstração
 * Dados reais para o modo visitante
 */
export const DEMO_CAMPAIGNS = [
  {
    id: '1',
    nome: 'Black Friday 2025',
    descricao: 'Campanha de Black Friday com desconto de 50%',
    status: 'ativa',
    tipo: 'promocao',
    plataforma: 'google_ads',
    cliques: 5420,
    impressoes: 125000,
    conversoes: 542,
    orcamento: 5000,
    ctr: 4.34,
    cpc: 0.92,
    roi: 285.5,
  },
  {
    id: '2',
    nome: 'Lançamento Produto X',
    descricao: 'Campanha de lançamento do novo produto X',
    status: 'ativa',
    tipo: 'lancamento',
    plataforma: 'instagram',
    cliques: 8920,
    impressoes: 250000,
    conversoes: 892,
    orcamento: 8000,
    ctr: 3.57,
    cpc: 0.89,
    roi: 312.8,
  },
  {
    id: '3',
    nome: 'Reengajamento WhatsApp',
    descricao: 'Campanha de reengajamento via WhatsApp',
    status: 'pausada',
    tipo: 'reengajamento',
    plataforma: 'whatsapp',
    cliques: 3200,
    impressoes: 45000,
    conversoes: 320,
    orcamento: 2000,
    ctr: 7.11,
    cpc: 6.25,
    roi: 425.0,
  },
  {
    id: '4',
    nome: 'Webinar Gratuito',
    descricao: 'Campanha para promover webinar gratuito',
    status: 'ativa',
    tipo: 'webinar',
    plataforma: 'google_ads',
    cliques: 2150,
    impressoes: 85000,
    conversoes: 215,
    orcamento: 1500,
    ctr: 2.53,
    cpc: 0.70,
    roi: 198.3,
  },
  {
    id: '5',
    nome: 'Programa de Afiliados',
    descricao: 'Campanha para recrutar afiliados',
    status: 'rascunho',
    tipo: 'afiliacao',
    plataforma: 'instagram',
    cliques: 0,
    impressoes: 0,
    conversoes: 0,
    orcamento: 3000,
    ctr: 0,
    cpc: 0,
    roi: 0,
  },
];

/**
 * Métricas de Demonstração
 * Dados históricos para gráficos
 */
export const DEMO_METRICS = [
  {
    data: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
    cliques: 450,
    impressoes: 15000,
    conversoes: 45,
    custo: 350,
    receita: 1200,
  },
  {
    data: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    cliques: 520,
    impressoes: 18000,
    conversoes: 52,
    custo: 400,
    receita: 1400,
  },
  {
    data: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    cliques: 480,
    impressoes: 16500,
    conversoes: 48,
    custo: 380,
    receita: 1300,
  },
  {
    data: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    cliques: 620,
    impressoes: 22000,
    conversoes: 62,
    custo: 480,
    receita: 1650,
  },
  {
    data: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    cliques: 750,
    impressoes: 25000,
    conversoes: 75,
    custo: 550,
    receita: 2000,
  },
  {
    data: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    cliques: 890,
    impressoes: 28000,
    conversoes: 89,
    custo: 650,
    receita: 2400,
  },
  {
    data: new Date(),
    cliques: 920,
    impressoes: 30000,
    conversoes: 92,
    custo: 700,
    receita: 2500,
  },
];

/**
 * Usuário de Demonstração
 * Para o modo visitante
 */
export const DEMO_USER = {
  id: 'demo-user-001',
  email: 'visitante@gaia.demo',
  nome: 'Visitante Demo',
  google_ads_key: TEST_KEYS.GOOGLE_ADS.key,
  instagram_token: TEST_KEYS.INSTAGRAM.token,
  whatsapp_token: TEST_KEYS.WHATSAPP.token,
};

