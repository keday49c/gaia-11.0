import { Router, Request, Response } from 'express';
import { query } from '../config/database';
import { encryptApiKeys, decryptApiKeys } from '../utils/crypto';
import { authMiddleware } from '../middleware/auth';
import { saveKeysLimiter } from '../middleware/rateLimiter';

const router = Router();
const AES_SECRET_KEY = process.env.AES_SECRET_KEY || 'gaia-aes-secret-key-2025-change-in-production';

/**
 * POST /keys/salvar
 * Salva as chaves de API criptografadas
 */
router.post(
  '/salvar',
  authMiddleware,
  saveKeysLimiter,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { google_ads, instagram, whatsapp } = req.body;
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Usuário não autenticado',
        });
        return;
      }

      // Validar que pelo menos uma chave foi fornecida
      if (!google_ads && !instagram && !whatsapp) {
        res.status(400).json({
          success: false,
          message: 'Pelo menos uma chave de API deve ser fornecida',
        });
        return;
      }

      // Preparar objeto de chaves
      const keysObject = {
        google_ads: google_ads || null,
        instagram: instagram || null,
        whatsapp: whatsapp || null,
      };

      // Criptografar chaves
      const encryptedKeys = encryptApiKeys(keysObject, AES_SECRET_KEY);

      // Atualizar no banco de dados
      const result = await query(
        `UPDATE users
         SET chaves_api = $1
         WHERE id = $2
         RETURNING id, email`,
        [encryptedKeys, userId]
      );

      if (result.rows.length === 0) {
        res.status(404).json({
          success: false,
          message: 'Usuário não encontrado',
        });
        return;
      }

      res.json({
        success: true,
        message: 'Chaves de API salvas com sucesso',
        data: {
          userId: result.rows[0].id,
          email: result.rows[0].email,
        },
      });
    } catch (error) {
      console.error('Erro ao salvar chaves:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
      });
    }
  }
);

/**
 * GET /keys/meus-dados
 * Retorna os dados do usuário com chaves descriptografadas
 */
router.get('/meus-dados', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Usuário não autenticado',
      });
      return;
    }

    // Buscar usuário
    const result = await query(
      `SELECT id, email, chaves_api, criado_em, atualizado_em
       FROM users
       WHERE id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: 'Usuário não encontrado',
      });
      return;
    }

    const user = result.rows[0];

    // Descriptografar chaves
    let decryptedKeys = {
      google_ads: null,
      instagram: null,
      whatsapp: null,
    };

    if (user.chaves_api) {
      try {
        decryptedKeys = decryptApiKeys(user.chaves_api, AES_SECRET_KEY);
      } catch (error) {
        console.error('Erro ao descriptografar chaves:', error);
      }
    }

    // Buscar logs de acesso recentes
    const logsResult = await query(
      `SELECT id, ip_address, acao, timestamp, detalhes
       FROM access_logs
       WHERE user_id = $1
       ORDER BY timestamp DESC
       LIMIT 10`,
      [userId]
    );

    res.json({
      success: true,
      data: {
        usuario: {
          id: user.id,
          email: user.email,
          criadoEm: user.criado_em,
          atualizadoEm: user.atualizado_em,
        },
        chaves: decryptedKeys,
        logs: logsResult.rows,
      },
    });
  } catch (error) {
    console.error('Erro ao buscar dados:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
    });
  }
});

export default router;

