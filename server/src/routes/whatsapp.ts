import { Router, Request, Response } from 'express';
import { query } from '../config/database';
import { authMiddleware } from '../middleware/auth';
import { gerarRespostaWhatsApp } from '../services/geminiService';

const router = Router();

/**
 * POST /whatsapp/webhook
 * Recebe mensagens do WhatsApp (webhook do Twilio)
 */
router.post('/webhook', async (req: Request, res: Response): Promise<void> => {
  try {
    const { From, Body, MediaUrl } = req.body;

    console.log('Mensagem WhatsApp recebida:', { From, Body, MediaUrl });

    // Gerar resposta com Gemini
    const resposta = await gerarRespostaWhatsApp(Body, {
      nome_cliente: 'Davi',
      ganho_ontem: 200,
    });

    // Aqui você integraria com Twilio para enviar a resposta
    console.log('Resposta gerada:', resposta);

    res.json({
      success: true,
      message: 'Mensagem processada',
      response: resposta,
    });
  } catch (error) {
    console.error('Erro ao processar mensagem WhatsApp:', error);
    res.status(500).json({ success: false, message: 'Erro ao processar mensagem' });
  }
});

/**
 * POST /whatsapp/enviar
 * Envia uma mensagem via WhatsApp (requer autenticação)
 */
router.post('/enviar', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { numero_cliente, mensagem, campaign_id } = req.body;

    if (!userId || !numero_cliente || !mensagem) {
      res.status(400).json({ success: false, message: 'Parâmetros inválidos' });
      return;
    }

    // Salvar mensagem no banco
    await query(
      `INSERT INTO whatsapp_messages (user_id, campaign_id, numero_cliente, tipo, conteudo)
       VALUES ($1, $2, $3, 'enviada', $4)`,
      [userId, campaign_id || null, numero_cliente, mensagem]
    );

    // Aqui você integraria com Twilio para enviar a mensagem real
    console.log(`Mensagem enviada para ${numero_cliente}: ${mensagem}`);

    res.json({
      success: true,
      message: 'Mensagem enviada com sucesso',
    });
  } catch (error) {
    console.error('Erro ao enviar mensagem WhatsApp:', error);
    res.status(500).json({ success: false, message: 'Erro ao enviar mensagem' });
  }
});

/**
 * GET /whatsapp/mensagens
 * Lista mensagens do usuário
 */
router.get('/mensagens', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ success: false, message: 'Usuário não autenticado' });
      return;
    }

    const result = await query(
      `SELECT * FROM whatsapp_messages WHERE user_id = $1 ORDER BY timestamp DESC LIMIT 50`,
      [userId]
    );

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error('Erro ao listar mensagens:', error);
    res.status(500).json({ success: false, message: 'Erro ao listar mensagens' });
  }
});

export default router;

