import express, { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import cors from 'cors';
import crypto from 'crypto';
import pool, { initializeDatabase } from './db';
import { TEST_KEYS, DEMO_CAMPAIGNS, DEMO_METRICS, DEMO_USER } from './test-keys';

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'gaia-secret-key-2025';
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3000';

// CORS Configuration - Allow multiple origins
const corsOptions = {
  origin: CORS_ORIGIN.split(',').map(origin => origin.trim()),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Tipos
interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    isGuest: boolean;
  };
}

// Middleware de autenticação
function authenticateToken(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Token não fornecido' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ success: false, message: 'Token inválido' });
  }
}

// ============ INICIALIZAÇÃO ============

// Inicializar banco de dados
initializeDatabase().catch(console.error);

// ============ ROTAS DE AUTENTICAÇÃO ============

/**
 * Login - Autenticação real com usuário
 */
app.post('/auth/login', async (req: Request, res: Response) => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({
        success: false,
        message: 'Email e senha são obrigatórios',
      });
    }

    // Buscar usuário no banco
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user || user.senha !== senha) {
      return res.status(401).json({
        success: false,
        message: 'Email ou senha inválidos',
      });
    }

    // Gerar token JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, isGuest: false },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      success: true,
      message: 'Login realizado com sucesso',
      data: {
        token,
        userId: user.id,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Erro no login:', error);
    return res.status(500).json({ success: false, message: 'Erro no servidor' });
  }
});

/**
 * Registro - Criar novo usuário
 */
app.post('/auth/register', async (req: Request, res: Response) => {
  try {
    const { email, senha, nome } = req.body;

    if (!email || !senha) {
      return res.status(400).json({
        success: false,
        message: 'Email e senha são obrigatórios',
      });
    }

    // Verificar se usuário já existe
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Usuário já existe',
      });
    }

    // Criar novo usuário
    const userId = crypto.randomUUID();
    await pool.query(
      'INSERT INTO users (id, email, senha, nome) VALUES ($1, $2, $3, $4)',
      [userId, email, senha, nome || 'Usuário']
    );

    // Gerar token JWT
    const token = jwt.sign(
      { id: userId, email, isGuest: false },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      success: true,
      message: 'Usuário registrado com sucesso',
      data: {
        token,
        userId,
        email,
      },
    });
  } catch (error) {
    console.error('Erro no registro:', error);
    return res.status(500).json({ success: false, message: 'Erro no servidor' });
  }
});

/**
 * Modo Visitante - Acesso sem autenticação
 */
app.post('/auth/guest', (req: Request, res: Response) => {
  const guestToken = jwt.sign(
    { id: DEMO_USER.id, email: DEMO_USER.email, isGuest: true },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  return res.json({
    success: true,
    message: 'Modo visitante ativado',
    data: {
      token: guestToken,
      userId: DEMO_USER.id,
      email: DEMO_USER.email,
      isGuest: true,
    },
  });
});

// ============ ROTAS DE CHAVES DE API ============

/**
 * Salvar chaves de API
 */
app.post('/keys/salvar', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Não autenticado' });
    }

    const { google_ads_key, instagram_token, whatsapp_token } = req.body;

    // Atualizar chaves no banco
    await pool.query(
      'UPDATE users SET google_ads_key = $1, instagram_token = $2, whatsapp_token = $3, atualizado_em = CURRENT_TIMESTAMP WHERE id = $4',
      [google_ads_key, instagram_token, whatsapp_token, req.user.id]
    );

    return res.json({
      success: true,
      message: 'Chaves salvas com sucesso',
      data: {
        userId: req.user.id,
        email: req.user.email,
      },
    });
  } catch (error) {
    console.error('Erro ao salvar chaves:', error);
    return res.status(500).json({ success: false, message: 'Erro no servidor' });
  }
});

/**
 * Obter dados do usuário e chaves
 */
app.get('/keys/meus-dados', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Não autenticado' });
    }

    // Se for visitante, retornar dados de teste
    if (req.user.isGuest) {
      return res.json({
        success: true,
        data: {
          usuario: DEMO_USER,
          chaves: {
            google_ads: TEST_KEYS.GOOGLE_ADS,
            instagram: TEST_KEYS.INSTAGRAM,
            whatsapp: TEST_KEYS.WHATSAPP,
          },
          isGuest: true,
        },
      });
    }

    // Buscar usuário real
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [req.user.id]);
    const user = result.rows[0];

    if (!user) {
      return res.status(404).json({ success: false, message: 'Usuário não encontrado' });
    }

    return res.json({
      success: true,
      data: {
        usuario: {
          id: user.id,
          email: user.email,
          nome: user.nome,
        },
        chaves: {
          google_ads: user.google_ads_key || null,
          instagram: user.instagram_token || null,
          whatsapp: user.whatsapp_token || null,
        },
        testKeys: {
          google_ads: TEST_KEYS.GOOGLE_ADS,
          instagram: TEST_KEYS.INSTAGRAM,
          whatsapp: TEST_KEYS.WHATSAPP,
        },
      },
    });
  } catch (error) {
    console.error('Erro ao buscar dados:', error);
    return res.status(500).json({ success: false, message: 'Erro no servidor' });
  }
});

// ============ ROTAS DE CAMPANHAS ============

/**
 * Listar campanhas do usuário
 */
app.get('/campaigns/lista', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Não autenticado' });
    }

    // Se for visitante, retornar campanhas de demo
    if (req.user.isGuest) {
      return res.json({
        success: true,
        data: DEMO_CAMPAIGNS,
      });
    }

    // Buscar campanhas do usuário
    const result = await pool.query(
      'SELECT * FROM campaigns WHERE user_id = $1 ORDER BY criado_em DESC',
      [req.user.id]
    );

    return res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error('Erro ao listar campanhas:', error);
    return res.status(500).json({ success: false, message: 'Erro no servidor' });
  }
});

/**
 * Criar campanha
 */
app.post('/campaigns/criar', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Não autenticado' });
    }

    if (req.user.isGuest) {
      return res.status(403).json({
        success: false,
        message: 'Visitantes não podem criar campanhas',
      });
    }

    const { nome, descricao, tipo, plataforma, orcamento } = req.body;

    if (!nome) {
      return res.status(400).json({
        success: false,
        message: 'Nome da campanha é obrigatório',
      });
    }

    const campaignId = crypto.randomUUID();
    await pool.query(
      'INSERT INTO campaigns (id, user_id, nome, descricao, tipo, plataforma, orcamento, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
      [campaignId, req.user.id, nome, descricao, tipo, plataforma, orcamento || 0, 'rascunho']
    );

    return res.json({
      success: true,
      message: 'Campanha criada com sucesso',
      data: {
        id: campaignId,
        nome,
        descricao,
        tipo,
        plataforma,
        orcamento,
        status: 'rascunho',
      },
    });
  } catch (error) {
    console.error('Erro ao criar campanha:', error);
    return res.status(500).json({ success: false, message: 'Erro no servidor' });
  }
});

/**
 * Disparar campanha
 */
app.post('/campaigns/disparar', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Não autenticado' });
    }

    if (req.user.isGuest) {
      return res.status(403).json({
        success: false,
        message: 'Visitantes não podem disparar campanhas',
      });
    }

    const { campaignId } = req.body;

    if (!campaignId) {
      return res.status(400).json({
        success: false,
        message: 'ID da campanha é obrigatório',
      });
    }

    // Atualizar status da campanha
    await pool.query(
      'UPDATE campaigns SET status = $1, atualizado_em = CURRENT_TIMESTAMP WHERE id = $2 AND user_id = $3',
      ['ativa', campaignId, req.user.id]
    );

    return res.json({
      success: true,
      message: 'Campanha disparada com sucesso',
      data: {
        campaignId,
        status: 'ativa',
        disparoEm: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Erro ao disparar campanha:', error);
    return res.status(500).json({ success: false, message: 'Erro no servidor' });
  }
});

/**
 * Obter métricas da campanha
 */
app.get('/campaigns/:campaignId/metricas', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Não autenticado' });
    }

    const { campaignId } = req.params;

    // Se for visitante, retornar métricas de demo
    if (req.user.isGuest) {
      return res.json({
        success: true,
        data: {
          campaignId,
          metricas: {
            cliques: Math.floor(Math.random() * 5000),
            impressoes: Math.floor(Math.random() * 20000),
            conversoes: Math.floor(Math.random() * 500),
            ctr: (Math.random() * 5).toFixed(2),
            cpc: (Math.random() * 10).toFixed(2),
            roi: (Math.random() * 300).toFixed(2),
          },
          historico: DEMO_METRICS,
        },
      });
    }

    // Buscar métricas do banco
    const result = await pool.query(
      'SELECT * FROM metrics WHERE campaign_id = $1 ORDER BY data DESC LIMIT 30',
      [campaignId]
    );

    return res.json({
      success: true,
      data: {
        campaignId,
        metricas: result.rows,
      },
    });
  } catch (error) {
    console.error('Erro ao buscar métricas:', error);
    return res.status(500).json({ success: false, message: 'Erro no servidor' });
  }
});

// ============ ROTAS DE SAÚDE ============

/**
 * Health check
 */
app.get('/health', (req: Request, res: Response) => {
  return res.json({
    success: true,
    data: {
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: 'connected',
    },
  });
});

/**
 * Root endpoint
 */
app.get('/', (req: Request, res: Response) => {
  return res.json({
    success: true,
    message: 'Gaia 10.0 - API Backend',
    version: '1.0.0',
    endpoints: {
      auth: ['/auth/login', '/auth/register', '/auth/guest'],
      keys: ['/keys/salvar', '/keys/meus-dados'],
      campaigns: ['/campaigns/lista', '/campaigns/criar', '/campaigns/disparar', '/campaigns/:campaignId/metricas'],
      health: ['/health'],
    },
  });
});

// ============ ERROR HANDLING ============

// 404 Handler
app.use((req: Request, res: Response) => {
  return res.status(404).json({
    success: false,
    message: 'Rota não encontrada',
    path: req.path,
  });
});

// Global error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Erro não tratado:', err);
  return res.status(500).json({
    success: false,
    message: 'Erro interno do servidor',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// ============ INICIAR SERVIDOR ============

app.listen(PORT, () => {
  console.log(`\n✅ Servidor Gaia rodando em http://localhost:${PORT}`);
  console.log(`📊 Modo: Backend Real com PostgreSQL`);
  console.log(`🎭 Modo Visitante disponível em POST /auth/guest`);
  console.log(`🔐 Autenticação JWT ativada`);
  console.log(`🌐 CORS Origins: ${CORS_ORIGIN}\n`);
});

export default app;

