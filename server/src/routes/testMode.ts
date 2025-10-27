import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth';
import { simulateCampaign, listTestCampaigns, deleteTestCampaign } from '../services/testModeService';
import { query } from '../config/database';

const router = Router();

/**
 * POST /test-mode/simular
 * Simula uma campanha sem gastar recursos
 */
router.post('/simular', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { titulo, descricao, orcamento, texto } = req.body;

    if (!userId || !titulo || !orcamento || !texto) {
      res.status(400).json({ success: false, message: 'Parâmetros inválidos' });
      return;
    }

    const resultado = await simulateCampaign(userId, {
      titulo,
      descricao,
      orcamento: parseFloat(orcamento),
      texto,
    });

    // Logar ação
    await query(
      `INSERT INTO detailed_access_logs (user_id, acao, ip_address, detalhes, resultado)
       VALUES ($1, 'simular_campanha', $2, $3, 'sucesso')`,
      [userId, req.ip, JSON.stringify({ titulo, orcamento })]
    );

    res.json(resultado);
  } catch (error) {
    console.error('Erro ao simular campanha:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

/**
 * GET /test-mode/lista
 * Lista campanhas de teste do usuário
 */
router.get('/lista', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ success: false, message: 'Usuário não autenticado' });
      return;
    }

    const campanhas = await listTestCampaigns(userId);

    res.json({
      success: true,
      data: campanhas,
    });
  } catch (error) {
    console.error('Erro ao listar campanhas de teste:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

/**
 * DELETE /test-mode/:id
 * Deleta uma campanha de teste
 */
router.delete('/:id', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    if (!userId || !id) {
      res.status(400).json({ success: false, message: 'Parâmetros inválidos' });
      return;
    }

    const deleted = await deleteTestCampaign(id, userId);

    if (!deleted) {
      res.status(404).json({ success: false, message: 'Campanha não encontrada' });
      return;
    }

    res.json({
      success: true,
      message: 'Campanha de teste deletada com sucesso',
    });
  } catch (error) {
    console.error('Erro ao deletar campanha de teste:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

export default router;

