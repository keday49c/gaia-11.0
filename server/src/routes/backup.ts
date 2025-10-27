import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth';
import {
  createLocalBackup,
  getBackupConfig,
  updateBackupConfig,
  listBackups,
  deleteBackup,
  restoreLocalBackup,
} from '../services/backupService';
import {
  getUnsyncedData,
  syncAllOfflineData,
  getSyncStatus,
  clearSyncedCache,
} from '../services/offlineService';
import {
  getVoiceHistory,
  getVoiceHistoryByDate,
  searchVoiceHistory,
  getVoiceStats,
  exportVoiceHistory,
} from '../services/voiceHistoryService';
import {
  startDemoSession,
  simulateDemoCampaign,
  getDemoSessionStatus,
  stopDemoSession,
  resetDemoSession,
  getDemoSessionHistory,
  generateDemoReport,
} from '../services/demoModeService';

const router = Router();

// ===== BACKUP =====

/**
 * POST /backup/criar
 * Criar backup local
 */
router.post('/criar', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Usuário não autenticado' });
      return;
    }

    const result = await createLocalBackup(userId);
    res.json(result);
  } catch (error) {
    console.error('Erro ao criar backup:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

/**
 * GET /backup/lista
 * Listar backups
 */
router.get('/lista', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Usuário não autenticado' });
      return;
    }

    const backups = await listBackups(userId);
    res.json({ success: true, data: backups });
  } catch (error) {
    console.error('Erro ao listar backups:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

/**
 * GET /backup/config
 * Obter configuração de backup
 */
router.get('/config', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Usuário não autenticado' });
      return;
    }

    const config = await getBackupConfig(userId);
    res.json({ success: true, data: config });
  } catch (error) {
    console.error('Erro ao obter config:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

/**
 * PUT /backup/config
 * Atualizar configuração de backup
 */
router.put('/config', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Usuário não autenticado' });
      return;
    }

    const result = await updateBackupConfig(userId, req.body);
    res.json(result);
  } catch (error) {
    console.error('Erro ao atualizar config:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

// ===== OFFLINE =====

/**
 * GET /backup/sync-status
 * Obter status de sincronização
 */
router.get('/sync-status', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Usuário não autenticado' });
      return;
    }

    const status = await getSyncStatus(userId);
    res.json({ success: true, data: status });
  } catch (error) {
    console.error('Erro ao obter status:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

/**
 * POST /backup/sync
 * Sincronizar dados offline
 */
router.post('/sync', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Usuário não autenticado' });
      return;
    }

    const result = await syncAllOfflineData(userId);
    res.json(result);
  } catch (error) {
    console.error('Erro ao sincronizar:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

// ===== VOZ =====

/**
 * GET /backup/voz/historico
 * Obter histórico de voz
 */
router.get('/voz/historico', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Usuário não autenticado' });
      return;
    }

    const limit = parseInt(req.query.limit as string) || 100;
    const history = await getVoiceHistory(userId, limit);
    res.json({ success: true, data: history });
  } catch (error) {
    console.error('Erro ao obter histórico:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

/**
 * GET /backup/voz/buscar
 * Buscar registros de voz
 */
router.get('/voz/buscar', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const searchTerm = req.query.q as string;

    if (!userId || !searchTerm) {
      res.status(400).json({ success: false, message: 'Parâmetros inválidos' });
      return;
    }

    const results = await searchVoiceHistory(userId, searchTerm);
    res.json({ success: true, data: results });
  } catch (error) {
    console.error('Erro ao buscar:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

// ===== DEMO =====

/**
 * POST /backup/demo/iniciar
 * Iniciar sessão de demo
 */
router.post('/demo/iniciar', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Usuário não autenticado' });
      return;
    }

    const result = await startDemoSession(userId);
    res.json(result);
  } catch (error) {
    console.error('Erro ao iniciar demo:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

/**
 * POST /backup/demo/:sessionId/campanha
 * Simular campanha no modo demo
 */
router.post('/demo/:sessionId/campanha', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { sessionId } = req.params;

    if (!userId || !sessionId) {
      res.status(400).json({ success: false, message: 'Parâmetros inválidos' });
      return;
    }

    const result = await simulateDemoCampaign(sessionId, userId);
    res.json(result);
  } catch (error) {
    console.error('Erro ao simular campanha:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

/**
 * GET /backup/demo/:sessionId/status
 * Obter status da sessão de demo
 */
router.get('/demo/:sessionId/status', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { sessionId } = req.params;

    if (!userId || !sessionId) {
      res.status(400).json({ success: false, message: 'Parâmetros inválidos' });
      return;
    }

    const status = await getDemoSessionStatus(sessionId, userId);
    if (!status) {
      res.status(404).json({ success: false, message: 'Sessão não encontrada' });
      return;
    }

    res.json({ success: true, data: status });
  } catch (error) {
    console.error('Erro ao obter status:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

/**
 * POST /backup/demo/:sessionId/relatorio
 * Gerar relatório de demo
 */
router.post('/backup/demo/:sessionId/relatorio', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { sessionId } = req.params;

    if (!userId || !sessionId) {
      res.status(400).json({ success: false, message: 'Parâmetros inválidos' });
      return;
    }

    const result = await generateDemoReport(sessionId, userId);
    res.json(result);
  } catch (error) {
    console.error('Erro ao gerar relatório:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

export default router;

