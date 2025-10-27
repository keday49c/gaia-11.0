import { Router, Request, Response } from 'express';
import { query } from '../config/database';
import { authMiddleware } from '../middleware/auth';
import { saveKeysLimiter } from '../middleware/rateLimiter';
import {
  dispararGoogleAds,
  dispararInstagram,
  agendarTikTok,
  abrirFluxoWhatsApp,
  gerarMetricasMock,
  calcularKPIs,
} from '../services/marketingApis';
import { analisarCampanha, otimizarCampanhaAutomaticamente } from '../services/geminiService';

const router = Router();

/**
 * POST /campaigns/criar
 * Cria uma nova campanha
 */
router.post('/criar', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { titulo, descricao, publico, orcamento, imagem_url, texto } = req.body;

    if (!userId) {
      res.status(401).json({ success: false, message: 'Usuário não autenticado' });
      return;
    }

    if (!titulo || !orcamento || !texto) {
      res.status(400).json({ success: false, message: 'Campos obrigatórios faltando' });
      return;
    }

    const result = await query(
      `INSERT INTO campaigns (user_id, titulo, descricao, publico, orcamento, imagem_url, texto, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'rascunho')
       RETURNING *`,
      [userId, titulo, descricao, JSON.stringify(publico), orcamento, imagem_url, texto]
    );

    res.status(201).json({
      success: true,
      message: 'Campanha criada com sucesso',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Erro ao criar campanha:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

/**
 * POST /campaigns/disparar
 * Dispara uma campanha em todas as plataformas
 */
router.post(
  '/disparar',
  authMiddleware,
  saveKeysLimiter,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;
      const { campaign_id, plataformas } = req.body;

      if (!userId || !campaign_id) {
        res.status(400).json({ success: false, message: 'Parâmetros inválidos' });
        return;
      }

      // Buscar campanha
      const campaignResult = await query('SELECT * FROM campaigns WHERE id = $1 AND user_id = $2', [
        campaign_id,
        userId,
      ]);

      if (campaignResult.rows.length === 0) {
        res.status(404).json({ success: false, message: 'Campanha não encontrada' });
        return;
      }

      const campaign = campaignResult.rows[0];
      const resultados: any = {};

      // Disparar em plataformas selecionadas
      if (plataformas.instagram) {
        resultados.instagram = await dispararInstagram({
          titulo: campaign.titulo,
          descricao: campaign.descricao,
          publico: campaign.publico,
          orcamento: campaign.orcamento,
          imagem_url: campaign.imagem_url,
          texto: campaign.texto,
        });
      }

      if (plataformas.google_ads) {
        resultados.google_ads = await dispararGoogleAds({
          titulo: campaign.titulo,
          descricao: campaign.descricao,
          publico: campaign.publico,
          orcamento: campaign.orcamento,
          imagem_url: campaign.imagem_url,
          texto: campaign.texto,
        });
      }

      if (plataformas.tiktok) {
        resultados.tiktok = await agendarTikTok({
          titulo: campaign.titulo,
          descricao: campaign.descricao,
          publico: campaign.publico,
          orcamento: campaign.orcamento,
          imagem_url: campaign.imagem_url,
          texto: campaign.texto,
        });
      }

      if (plataformas.whatsapp) {
        resultados.whatsapp = await abrirFluxoWhatsApp({
          titulo: campaign.titulo,
          descricao: campaign.descricao,
          publico: campaign.publico,
          orcamento: campaign.orcamento,
          imagem_url: campaign.imagem_url,
          texto: campaign.texto,
        });
      }

      // Atualizar status da campanha
      await query(
        `UPDATE campaigns SET status = 'ativo', plataformas = $1, iniciado_em = NOW()
         WHERE id = $2`,
        [JSON.stringify(plataformas), campaign_id]
      );

      // Logar ação
      await query(
        `INSERT INTO campaign_logs (campaign_id, acao, detalhes)
         VALUES ($1, 'disparar', $2)`,
        [campaign_id, JSON.stringify(resultados)]
      );

      res.json({
        success: true,
        message: 'Campanha disparada com sucesso',
        data: resultados,
      });
    } catch (error) {
      console.error('Erro ao disparar campanha:', error);
      res.status(500).json({ success: false, message: 'Erro interno do servidor' });
    }
  }
);

/**
 * GET /campaigns/lista
 * Lista todas as campanhas do usuário
 */
router.get('/lista', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ success: false, message: 'Usuário não autenticado' });
      return;
    }

    const result = await query(
      `SELECT * FROM campaigns WHERE user_id = $1 ORDER BY criado_em DESC`,
      [userId]
    );

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error('Erro ao listar campanhas:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

/**
 * GET /campaigns/:id/metricas
 * Retorna as métricas de uma campanha
 */
router.get('/:id/metricas', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    if (!userId) {
      res.status(401).json({ success: false, message: 'Usuário não autenticado' });
      return;
    }

    // Verificar se campanha pertence ao usuário
    const campaignResult = await query(
      'SELECT * FROM campaigns WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (campaignResult.rows.length === 0) {
      res.status(404).json({ success: false, message: 'Campanha não encontrada' });
      return;
    }

    // Buscar métricas
    const metricsResult = await query(
      `SELECT * FROM campaign_metrics WHERE campaign_id = $1 ORDER BY timestamp DESC LIMIT 100`,
      [id]
    );

    res.json({
      success: true,
      data: metricsResult.rows,
    });
  } catch (error) {
    console.error('Erro ao buscar métricas:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

/**
 * POST /campaigns/:id/analisar
 * Analisa campanha com Gemini
 */
router.post('/:id/analisar', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    if (!userId) {
      res.status(401).json({ success: false, message: 'Usuário não autenticado' });
      return;
    }

    // Buscar campanha
    const campaignResult = await query(
      'SELECT * FROM campaigns WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (campaignResult.rows.length === 0) {
      res.status(404).json({ success: false, message: 'Campanha não encontrada' });
      return;
    }

    const campaign = campaignResult.rows[0];

    // Buscar última métrica
    const metricsResult = await query(
      `SELECT * FROM campaign_metrics WHERE campaign_id = $1 ORDER BY timestamp DESC LIMIT 1`,
      [id]
    );

    let metricas = metricsResult.rows[0] || gerarMetricasMock('total');

    // Analisar com Gemini
    const analise = await analisarCampanha(campaign.titulo, metricas);

    // Se recomendação for pausar, atualizar status
    if (analise.pausar) {
      await query(`UPDATE campaigns SET status = 'pausada' WHERE id = $1`, [id]);
    }

    // Se recomendação for aumentar orçamento
    if (analise.aumentarOrcamento) {
      const novoOrcamento = campaign.orcamento * 1.5;
      await query(`UPDATE campaigns SET orcamento = $1 WHERE id = $2`, [novoOrcamento, id]);
    }

    res.json({
      success: true,
      message: 'Análise concluída',
      data: analise,
    });
  } catch (error) {
    console.error('Erro ao analisar campanha:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

export default router;

