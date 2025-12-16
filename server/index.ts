import express, { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import cors from 'cors';
import crypto from 'crypto';
import pool, { initializeDatabase } from './db.js';
import ai from './lib/ai.js';
import { TEST_KEYS, DEMO_CAMPAIGNS, DEMO_METRICS, DEMO_USER } from './test-keys.js';
import bcrypt from 'bcryptjs';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';

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

// Rate limiter for auth endpoints
// Some @types versions don't include `standardHeaders`/`legacyHeaders` fields.
// Cast the factory to `any` so TypeScript won't error while preserving runtime behavior.
const authLimiter = (rateLimit as any)({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // limit each IP to 10 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});

// Zod schemas for basic validation
const loginSchema = z.object({
  email: z.string().min(1),
  senha: z.string().min(1),
});

const registerSchema = z.object({
  email: z.string().email(),
  senha: z.string().min(6),
  nome: z.string().optional(),
});

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
    // validate input
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, message: 'Entrada inválida', details: parsed.error.errors });
    }

    const { email, senha } = parsed.data;

    // Buscar usuário no banco
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ success: false, message: 'Email ou senha inválidos' });
    }

    const match = await bcrypt.compare(senha, user.senha);
    if (!match) {
      return res.status(401).json({ success: false, message: 'Email ou senha inválidos' });
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
  } catch (error: any) {
    console.error('Erro no login:', error?.message ?? error);
    return res.status(500).json({ success: false, message: 'Erro no servidor' });
  }
});

/**
 * Registro - Criar novo usuário
 */
app.post('/auth/register', authLimiter, async (req: Request, res: Response) => {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, message: 'Entrada inválida', details: parsed.error.errors });
    }
    const { email, senha, nome } = parsed.data;

    // Verificar se usuário já existe
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ success: false, message: 'Usuário já existe' });
    }

    // Criar novo usuário (hash da senha)
    const userId = crypto.randomUUID();
    const hashedSenha = await bcrypt.hash(senha, 10);
    await pool.query('INSERT INTO users (id, email, senha, nome) VALUES ($1, $2, $3, $4)', [userId, email, hashedSenha, nome || 'Usuário']);

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
  } catch (error: any) {
    console.error('Erro no registro:', error?.message ?? error);
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
  } catch (error: any) {
    console.error('Erro ao salvar chaves:', error?.message ?? error);
    return res.status(500).json({ success: false, message: 'Erro no servidor' });
  }
});

/**
 * Endpoint POC para validar chaves de API sem integração externa.
 * Retorna um objeto com o status de cada provedor: ok:boolean, message:string
 */
app.post('/keys/validate', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { google_ads_key, instagram_token, whatsapp_token } = req.body;

    // Validações simples/simuladas:
    const validateGoogle = () => {
      if (!google_ads_key) return { ok: false, message: 'Vazio' };
      if (String(google_ads_key).startsWith('TEST_')) return { ok: true, message: 'TEST key accepted' };
      if (String(google_ads_key).length > 10) return { ok: true, message: 'Formato plausível' };
      return { ok: false, message: 'Formato inválido' };
    };

    const validateInstagram = () => {
      if (!instagram_token) return { ok: false, message: 'Vazio' };
      if (String(instagram_token).startsWith('TEST_')) return { ok: true, message: 'TEST token accepted' };
      if (String(instagram_token).length > 20) return { ok: true, message: 'Formato plausível' };
      return { ok: false, message: 'Formato inválido' };
    };

    const validateWhatsapp = () => {
      if (!whatsapp_token) return { ok: false, message: 'Vazio' };
      if (String(whatsapp_token).startsWith('TEST_')) return { ok: true, message: 'TEST token accepted' };
      if (String(whatsapp_token).length > 10) return { ok: true, message: 'Formato plausível' };
      return { ok: false, message: 'Formato inválido' };
    };

    const result = {
      google_ads: validateGoogle(),
      instagram: validateInstagram(),
      whatsapp: validateWhatsapp(),
    };

    return res.json({ success: true, data: result });
  } catch (error: any) {
    console.error('Erro ao validar chaves:', error?.message ?? error);
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
  } catch (error: any) {
    console.error('Erro ao buscar dados:', error?.message ?? error);
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

    // Normalize numeric fields returned by Postgres (numeric/decimal often comes as string)
    const normalized = result.rows.map((r: any) => ({
      ...r,
      orcamento: typeof r.orcamento === 'string' ? Number(r.orcamento) : r.orcamento,
    }));

    return res.json({
      success: true,
      data: normalized,
    });
  } catch (error: any) {
    console.error('Erro ao listar campanhas:', error?.message ?? error);
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

    // Accept both `nome` (new) and `titulo` (legacy) from older clients
    const nome = req.body.nome || req.body.titulo || req.body.title || '';
    const { descricao, tipo, plataforma, orcamento } = req.body;

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
        titulo: nome, // legacy compatibility
        descricao,
        tipo,
        plataforma,
        orcamento: typeof orcamento === 'string' ? Number(orcamento) : orcamento || 0,
        status: 'rascunho',
      },
    });
  } catch (error: any) {
    console.error('Erro ao criar campanha:', error?.message ?? error);
    return res.status(500).json({ success: false, message: 'Erro no servidor' });
  }
});

/**
 * Disparar campanha
 */
import googleAds from './lib/googleAds.js';

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

    // Accept multiple possible property names for compatibility with older clients
    const campaignId = req.body.campaignId || req.body.campaign_id || req.body.id || req.body.campaignId;

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

    // Optionally call Google Ads when configured and the campaign platform includes it
    try {
      if (process.env.GOOGLE_ADS_TOKEN) {
        const campRes = await pool.query('SELECT * FROM campaigns WHERE id = $1', [campaignId]);
        const campaign = campRes.rows[0];
        if (campaign && (campaign.plataforma === 'google_ads' || (req.body.plataformas && req.body.plataformas.google_ads))) {
          try {
            const gaResp = await googleAds.createGoogleAdsCampaign(campaign);
            console.log('✅ Google Ads campaign created:', gaResp);
          } catch (gaErr) {
            console.warn('⚠️ Google Ads publish failed:', gaErr?.message ?? gaErr);
          }
        }
      }
    } catch (err) {
      console.warn('⚠️ Optional Google Ads step errored:', err?.message ?? err);
    }

    return res.json({
      success: true,
      message: 'Campanha disparada com sucesso',
      data: {
        campaignId,
        status: 'ativa',
        disparoEm: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error('Erro ao disparar campanha:', error?.message ?? error);
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

    // Normalize numeric fields (Postgres numeric/decimal may be returned as strings)
    const metricas = result.rows.map((m: any) => ({
      ...m,
      impressoes: Number(m.impressoes) || 0,
      cliques: Number(m.cliques) || 0,
      conversoes: Number(m.conversoes) || 0,
      custo: typeof m.custo === 'string' ? Number(m.custo) : m.custo || 0,
      receita: typeof m.receita === 'string' ? Number(m.receita) : m.receita || 0,
      cpc: typeof m.cpc === 'string' ? Number(m.cpc) : m.cpc,
      ctr: typeof m.ctr === 'string' ? Number(m.ctr) : m.ctr,
      roas: typeof m.roas === 'string' ? Number(m.roas) : m.roas,
    }));

    return res.json({
      success: true,
      data: {
        campaignId,
        metricas,
      },
    });
  } catch (error: any) {
    console.error('Erro ao buscar métricas:', error?.message ?? error);
    return res.status(500).json({ success: false, message: 'Erro no servidor' });
  }
});

/**
 * Excluir campanha (apenas proprietário pode excluir)
 */
app.delete('/campaigns/:campaignId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Não autenticado' });
    }

    if (req.user.isGuest) {
      return res.status(403).json({ success: false, message: 'Visitantes não podem excluir campanhas' });
    }

    const { campaignId } = req.params;

    const result = await pool.query('DELETE FROM campaigns WHERE id = $1 AND user_id = $2 RETURNING id', [campaignId, req.user.id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Campanha não encontrada' });
    }

    return res.json({ success: true, message: 'Campanha excluída com sucesso', data: { id: campaignId } });
  } catch (error: any) {
    console.error('Erro ao excluir campanha:', error?.message ?? error);
    return res.status(500).json({ success: false, message: 'Erro no servidor' });
  }
});

/**
 * Analisar campanha com IA (gera recomendações e persiste resultado)
 */
app.post('/campaigns/:campaignId/analisar', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Não autenticado' });

    if (req.user.isGuest) return res.status(403).json({ success: false, message: 'Visitantes não podem solicitar análise' });

    const { campaignId } = req.params;

    // Buscar campanha e checar propriedade
    const campRes = await pool.query('SELECT * FROM campaigns WHERE id = $1 AND user_id = $2', [campaignId, req.user.id]);
    if (campRes.rowCount === 0) return res.status(404).json({ success: false, message: 'Campanha não encontrada' });
    const campaign = campRes.rows[0];

    // Buscar métricas recentes
    const metricsRes = await pool.query('SELECT * FROM metrics WHERE campaign_id = $1 ORDER BY data DESC LIMIT 30', [campaignId]);
    const metrics = metricsRes.rows || [];

    // Check AI config
    if (!ai.isAIConfigured()) {
      return res.status(501).json({ success: false, message: 'IA não configurada. Defina AI_PROVIDER e credenciais (OPENAI_API_KEY or GEMINI_API_KEY).' });
    }

    const analysis = await ai.analyzeCampaignWithAI(campaign, metrics);

    return res.json({ success: true, message: 'Análise realizada', data: analysis });
  } catch (error: any) {
    console.error('Erro ao analisar campanha:', error?.message ?? error);
    return res.status(500).json({ success: false, message: 'Erro ao analisar campanha', error: error?.message });
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
      campaigns: ['/campaigns/lista', '/campaigns/criar', '/campaigns/disparar', '/campaigns/:campaignId/metricas', '/campaigns/:campaignId/analisar', '/campaigns/:campaignId'],
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

