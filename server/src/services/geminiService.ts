/**
 * Serviço de IA Gemini (Mock)
 * Simula análise e otimização de campanhas
 */

export interface CampaignAnalysis {
  recomendacoes: string[];
  pausar: boolean;
  aumentarOrcamento: boolean;
  otimizarTexto: string;
  otimizarPublico: {
    cidades?: string[];
    idade_min?: number;
    idade_max?: number;
    interesses?: string[];
  };
  score: number;
}

/**
 * Mock: Analisa campanha com Gemini
 */
export async function analisarCampanha(
  titulo: string,
  metricas: {
    impressoes: number;
    cliques: number;
    conversoes: number;
    custo: number;
    receita: number;
  }
): Promise<CampaignAnalysis> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const ctr = (metricas.cliques / metricas.impressoes) * 100;
      const roas = metricas.receita / metricas.custo;
      const cpc = metricas.custo / metricas.cliques;

      const recomendacoes: string[] = [];
      let pausar = false;
      let aumentarOrcamento = false;

      // Lógica de recomendações
      if (ctr < 1) {
        recomendacoes.push('CTR baixo. Considere ajustar o público-alvo.');
      }
      if (roas < 1.5) {
        recomendacoes.push('ROAS abaixo de 1.5x. Campanha não está convertendo bem.');
        pausar = true;
      }
      if (roas > 3) {
        recomendacoes.push('ROAS excelente! Aumente o orçamento para escalar.');
        aumentarOrcamento = true;
      }
      if (cpc > 5) {
        recomendacoes.push('CPC muito alto. Considere otimizar palavras-chave.');
      }

      const score = Math.min(100, Math.max(0, roas * 30 + ctr * 5 - cpc * 2));

      resolve({
        recomendacoes,
        pausar,
        aumentarOrcamento,
        otimizarTexto: `Versão otimizada de "${titulo}" - Foco em conversão`,
        otimizarPublico: {
          cidades: ['São Paulo', 'Rio de Janeiro', 'Belo Horizonte'],
          idade_min: 25,
          idade_max: 45,
          interesses: ['tecnologia', 'marketing', 'negócios'],
        },
        score: parseFloat(score.toFixed(2)),
      });
    }, 1500);
  });
}

/**
 * Mock: Gera resposta de IA para WhatsApp
 */
export async function gerarRespostaWhatsApp(
  mensagem: string,
  contexto?: {
    nome_cliente?: string;
    ganho_ontem?: number;
    ultima_campanha?: string;
  }
): Promise<string> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const nome = contexto?.nome_cliente || 'Davi';
      const ganho = contexto?.ganho_ontem || 0;

      let resposta = '';

      if (mensagem.toLowerCase().includes('ganho') || mensagem.toLowerCase().includes('faturamento')) {
        resposta = `Oi ${nome}! 👋 Ontem você ganhou R$ ${ganho.toFixed(2)}. Quer disparar uma campanha igual?`;
      } else if (
        mensagem.toLowerCase().includes('campanha') ||
        mensagem.toLowerCase().includes('disparar')
      ) {
        resposta = `Perfeito! Vou criar uma nova campanha. Qual é o orçamento que você quer investir?`;
      } else if (mensagem.toLowerCase().includes('relatorio') || mensagem.toLowerCase().includes('metricas')) {
        resposta = `Suas campanhas estão performando bem! 📊 Quer ver os detalhes?`;
      } else {
        resposta = `Oi ${nome}! Como posso ajudar você com suas campanhas de marketing? 🚀`;
      }

      resolve(resposta);
    }, 800);
  });
}

/**
 * Mock: Gera otimizações automáticas
 */
export async function otimizarCampanhaAutomaticamente(
  campaign_id: string,
  metricas: any
): Promise<{
  pausada: boolean;
  orcamento_aumentado: number;
  novo_texto: string;
  novo_publico: any;
}> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const roas = metricas.receita / metricas.custo;
      const pausada = roas < 1.5;
      const orcamento_aumentado = roas > 3 ? metricas.orcamento * 1.5 : 0;

      resolve({
        pausada,
        orcamento_aumentado: parseFloat(orcamento_aumentado.toFixed(2)),
        novo_texto: 'Versão otimizada pelo Gaia AI',
        novo_publico: {
          cidades: ['São Paulo', 'Rio de Janeiro'],
          idade_min: 25,
          idade_max: 50,
        },
      });
    }, 1000);
  });
}

