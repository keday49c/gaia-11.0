import { Router, Request, Response } from 'express';
import { query } from '../config/database';
import { decryptAES } from '../utils/crypto';
import { logAdminAccess } from '../middleware/detailedLogger';

const router = Router();

/**
 * POST /admin/login
 * Login no modo admin (credenciais hardcoded)
 */
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, senha } = req.body;
    const ip = (req as any).clientIp;

    // Credenciais hardcoded (MUDAR EM PRODUÇÃO)
    const ADMIN_EMAIL = 'admin';
    const ADMIN_PASSWORD = 'senha123';

    const isValid = email === ADMIN_EMAIL && senha === ADMIN_PASSWORD;

    await logAdminAccess(undefined, email, isValid, ip as string);

    if (!isValid) {
      res.status(401).json({
        success: false,
        message: 'Credenciais de admin inválidas',
      });
      return;
    }

    // Gerar token admin (válido por 1 hora)
    const adminToken = Buffer.from(`admin:${Date.now()}`).toString('base64');

    res.json({
      success: true,
      message: 'Admin autenticado com sucesso',
      token: adminToken,
      expiresIn: 3600,
    });
  } catch (error) {
    console.error('Erro ao fazer login admin:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

/**
 * GET /admin/logs
 * Obter todos os logs de acesso
 */
router.get('/logs', async (req: Request, res: Response): Promise<void> => {
  try {
    const adminToken = req.headers.authorization?.replace('Bearer ', '');

    // Validar token admin
    if (!adminToken || !adminToken.startsWith('YWRtaW4=')) {
      res.status(401).json({ success: false, message: 'Token admin inválido' });
      return;
    }

    const result = await query(
      `SELECT * FROM detailed_access_logs ORDER BY timestamp DESC LIMIT 1000`
    );

    res.json({
      success: true,
      total: result.rows.length,
      data: result.rows,
    });
  } catch (error) {
    console.error('Erro ao obter logs:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

/**
 * GET /admin/keys
 * Obter todas as chaves descriptografadas (APENAS ADMIN)
 */
router.get('/keys', async (req: Request, res: Response): Promise<void> => {
  try {
    const adminToken = req.headers.authorization?.replace('Bearer ', '');

    // Validar token admin
    if (!adminToken || !adminToken.startsWith('YWRtaW4=')) {
      res.status(401).json({ success: false, message: 'Token admin inválido' });
      return;
    }

    const result = await query(
      `SELECT id, email, chaves_api FROM users ORDER BY criado_em DESC`
    );

    // Descriptografar chaves
    const usersWithKeys = result.rows.map((user: any) => {
      try {
        const decryptedKeys = decryptAES(user.chaves_api);
        return {
          id: user.id,
          email: user.email,
          chaves_api: JSON.parse(decryptedKeys),
        };
      } catch (error) {
        return {
          id: user.id,
          email: user.email,
          chaves_api: null,
          erro: 'Erro ao descriptografar',
        };
      }
    });

    res.json({
      success: true,
      total: usersWithKeys.length,
      data: usersWithKeys,
    });
  } catch (error) {
    console.error('Erro ao obter chaves:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

/**
 * GET /admin/users
 * Obter lista de usuários
 */
router.get('/users', async (req: Request, res: Response): Promise<void> => {
  try {
    const adminToken = req.headers.authorization?.replace('Bearer ', '');

    // Validar token admin
    if (!adminToken || !adminToken.startsWith('YWRtaW4=')) {
      res.status(401).json({ success: false, message: 'Token admin inválido' });
      return;
    }

    const result = await query(
      `SELECT id, email, criado_em, atualizado_em FROM users ORDER BY criado_em DESC`
    );

    res.json({
      success: true,
      total: result.rows.length,
      data: result.rows,
    });
  } catch (error) {
    console.error('Erro ao obter usuários:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

/**
 * DELETE /admin/database
 * Deletar TUDO do banco (CUIDADO!)
 */
router.delete('/database', async (req: Request, res: Response): Promise<void> => {
  try {
    const adminToken = req.headers.authorization?.replace('Bearer ', '');
    const { confirmacao } = req.body;

    // Validar token admin
    if (!adminToken || !adminToken.startsWith('YWRtaW4=')) {
      res.status(401).json({ success: false, message: 'Token admin inválido' });
      return;
    }

    // Exigir confirmação
    if (confirmacao !== 'DELETAR_TUDO') {
      res.status(400).json({
        success: false,
        message: 'Confirmação inválida. Digite DELETAR_TUDO',
      });
      return;
    }

    // Deletar tudo
    await query('DELETE FROM test_campaigns');
    await query('DELETE FROM whatsapp_messages');
    await query('DELETE FROM campaign_logs');
    await query('DELETE FROM campaign_metrics');
    await query('DELETE FROM campaigns');
    await query('DELETE FROM jwt_sessions');
    await query('DELETE FROM detailed_access_logs');
    await query('DELETE FROM access_logs');
    await query('DELETE FROM user_biometrics');
    await query('DELETE FROM users');

    res.json({
      success: true,
      message: 'Banco de dados completamente deletado',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Erro ao deletar banco:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

/**
 * GET /admin/stats
 * Obter estatísticas do sistema
 */
router.get('/stats', async (req: Request, res: Response): Promise<void> => {
  try {
    const adminToken = req.headers.authorization?.replace('Bearer ', '');

    // Validar token admin
    if (!adminToken || !adminToken.startsWith('YWRtaW4=')) {
      res.status(401).json({ success: false, message: 'Token admin inválido' });
      return;
    }

    const usersResult = await query('SELECT COUNT(*) FROM users');
    const campaignsResult = await query('SELECT COUNT(*) FROM campaigns');
    const logsResult = await query('SELECT COUNT(*) FROM detailed_access_logs');

    res.json({
      success: true,
      stats: {
        total_users: parseInt(usersResult.rows[0].count),
        total_campaigns: parseInt(campaignsResult.rows[0].count),
        total_logs: parseInt(logsResult.rows[0].count),
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Erro ao obter estatísticas:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

export default router;

