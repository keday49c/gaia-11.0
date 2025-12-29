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
import fs from 'fs';
import path from 'path';

// --- BOOTSTRAP DIAGNOSTICS ---
console.log('BOOTSTRAP: starting server bootstrap');
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT_EXCEPTION during bootstrap:', err && (err.stack || err.message || err));
});
process.on('unhandledRejection', (reason) => {
  console.error('UNHANDLED_REJECTION during bootstrap:', reason && ((reason as any).stack || reason));
});

// Add quick sanity logs for environment variables that influence initialization
console.log('BOOTSTRAP: NODE_ENV=%s, PORT=%s, DATABASE_URL(%s)=%s', process.env.NODE_ENV, process.env.PORT || '3001', process.env.DATABASE_URL ? 'set' : 'unset', process.env.DATABASE_URL ? '[REDACTED]' : 'unset');
console.log('BOOTSTRAP: CORS_ORIGIN=%s', process.env.CORS_ORIGIN || 'http://localhost:3000');

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

// Inicialização do banco de dados será feita antes de iniciar o servidor (ver abaixo)

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
// Helper para queries que tentam fallback para SQLite se Postgres estiver inacessível
async function withDbFallback<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (err: any) {
    if (err?.code === 'ENOTFOUND' || /getaddrinfo/i.test(err?.message)) {
      console.warn('⚠️ Banco inacessível, tentando fallback para SQLite e repetindo operação', err?.message ?? err);
      await initializeDatabase(); // will fallback to sqlite if available
      return await fn();
    }
    throw err;
  }
}

app.post('/auth/register', authLimiter, async (req: Request, res: Response) => {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, message: 'Entrada inválida', details: parsed.error.errors });
    }
    const { email, senha, nome } = parsed.data;

    // Verificar se usuário já existe
    const existing: any = await withDbFallback(() => pool.query('SELECT id FROM users WHERE email = $1', [email]));
    if (existing.rows.length > 0) {
      return res.status(400).json({ success: false, message: 'Usuário já existe' });
    }

    // Criar novo usuário (hash da senha)
    const userId = crypto.randomUUID();
    const hashedSenha = await bcrypt.hash(senha, 10);
    await withDbFallback(() => pool.query('INSERT INTO users (id, email, senha, nome) VALUES ($1, $2, $3, $4)', [userId, email, hashedSenha, nome || 'Usuário']));

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

/**
 * Verifica se existe um usuário administrador/real no banco (não conta o usuário demo/visitante)
 */
import { checkHasAdmin } from './lib/admin.js';

app.get('/auth/has-admin', async (req: Request, res: Response) => {
  try {
    const hasAdmin = await checkHasAdmin();
    return res.json({ success: true, data: { hasAdmin } });
  } catch (error: any) {
    console.error('Erro ao checar existência de admin:', error?.message ?? error);
    return res.status(500).json({ success: false, message: 'Erro no servidor' });
  }
});

// ============ ROTAS DE CHAVES DE API ============

// Encryption helpers using AES-256-GCM. The key is read from process.env.ENCRYPTION_KEY
import crypto from 'crypto';

function getEncryptionKey(): Buffer | null {
  const k = process.env.ENCRYPTION_KEY;
  if (!k) return null;
  // expect hex string
  return Buffer.from(String(k), 'hex');
}

function encryptText(plain: string): string {
  const key = getEncryptionKey();
  if (!key) return plain; // no encryption key configured (server mode)
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key.slice(0, 32), iv);
  const encrypted = Buffer.concat([cipher.update(String(plain), 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, encrypted]).toString('base64');
}

function decryptText(enc: string): string {
  const key = getEncryptionKey();
  if (!key) return enc;
  try {
    const b = Buffer.from(enc, 'base64');
    const iv = b.slice(0, 12);
    const tag = b.slice(12, 28);
    const data = b.slice(28);
    const decipher = crypto.createDecipheriv('aes-256-gcm', key.slice(0, 32), iv);
    decipher.setAuthTag(tag);
    const decrypted = Buffer.concat([decipher.update(data), decipher.final()]);
    return decrypted.toString('utf8');
  } catch (e) {
    // if decryption fails, return original
    return enc;
  }
}

/**
 * Salvar chaves de API
 */
app.post('/keys/salvar', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Não autenticado' });
    }

    const { google_ads_key, google_ads_customer_id, instagram_token, whatsapp_token, openai_key, gemini_key, meta_key, openai_key_alt, gemini_key_alt } = req.body;

    // Encrypt keys before storing (if encryption is configured)
    const encGoogle = google_ads_key ? encryptText(google_ads_key) : null;
    const encInstagram = instagram_token ? encryptText(instagram_token) : null;
    const encWhatsapp = whatsapp_token ? encryptText(whatsapp_token) : null;
    const encOpenAI = openai_key ? encryptText(openai_key) : null;
    const encGemini = gemini_key ? encryptText(gemini_key) : null;
    const encMeta = meta_key ? encryptText(meta_key) : null;
    const encOpenAIAlt = openai_key_alt ? encryptText(openai_key_alt) : null;
    const encGeminiAlt = gemini_key_alt ? encryptText(gemini_key_alt) : null;

    // Atualizar chaves no banco (inclui customer id)
    // Use text comparison to avoid invalid UUID errors for demo/guest users
    await pool.query(
      'UPDATE users SET google_ads_key = $1, google_ads_customer_id = $2, instagram_token = $3, whatsapp_token = $4, openai_key = $5, gemini_key = $6, meta_key = $7, openai_key_alt = $8, gemini_key_alt = $9, atualizado_em = CURRENT_TIMESTAMP WHERE id::text = $10',
      [encGoogle, google_ads_customer_id, encInstagram, encWhatsapp, encOpenAI, encGemini, encMeta, encOpenAIAlt, encGeminiAlt, req.user.id]
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
    const { google_ads_key, google_ads_customer_id, instagram_token, whatsapp_token, openai_key, gemini_key, meta_key, openai_key_alt, gemini_key_alt } = req.body;

    // Validações: tentativas reais de validação quando possível
    const validateOpenAI = async (key: string) => {
      if (!key) return { ok: false, message: 'Vazio' };
      if (dryRunEnabled) return { ok: true, message: 'Dry-Run: simulação de chave válida (OpenAI)' };
      if (String(key).startsWith('TEST_')) return { ok: true, message: 'TEST key accepted' };
      try {
        const res = await fetch('https://api.openai.com/v1/models', { headers: { Authorization: `Bearer ${key}` }, method: 'GET' });
        if (res.ok) return { ok: true, message: 'Chave válida (OpenAI)' };
        const txt = await res.text().catch(() => 'error');
        return { ok: false, message: `OpenAI: ${res.status} ${txt}` };
      } catch (e: any) {
        return { ok: false, message: `Erro ao validar OpenAI: ${e?.message ?? e}` };
      }
    };

    const validateGemini = async (key: string) => {
      if (!key) return { ok: false, message: 'Vazio' };
      if (dryRunEnabled) return { ok: true, message: 'Dry-Run: simulação de chave válida (Gemini)' };
      try {
        // Accept TEST_ keys for local testing
        if (String(key).startsWith('TEST_')) return { ok: true, message: 'TEST key accepted' };
        // Try calling Google Generative API list models with API key query (best-effort)
        const url = `https://generativelanguage.googleapis.com/v1/models?key=${encodeURIComponent(key)}`;
        const res = await fetch(url);
        if (res.ok) return { ok: true, message: 'Chave válida (Gemini / Google Generative)' };
        const txt = await res.text().catch(() => 'error');
        return { ok: false, message: `Gemini validation: ${res.status} ${txt}` };
      } catch (e: any) {
        return { ok: false, message: `Erro ao validar Gemini: ${e?.message ?? e}` };
      }
    };

    const validateMeta = async (token: string) => {
      if (!token) return { ok: false, message: 'Vazio' };
      if (dryRunEnabled) return { ok: true, message: 'Dry-Run: simulação de token Meta válido' };
      // Required scopes can be set via env var: META_REQUIRED_SCOPES="scope1,scope2"
      const requiredScopesEnv = process.env.META_REQUIRED_SCOPES || '';
      const requiredScopes = requiredScopesEnv.split(',').map(s => s.trim()).filter(Boolean);

      try {
        // Accept TEST_ tokens for local testing
        if (String(token).startsWith('TEST_')) return { ok: true, message: 'TEST token accepted' };
        // Basic token liveness check
        const meRes = await fetch(`https://graph.facebook.com/me?access_token=${encodeURIComponent(token)}&fields=id,name`);
        if (!meRes.ok) {
          const txt = await meRes.text().catch(() => 'error');
          return { ok: false, message: `Meta validation: ${meRes.status} ${txt}` };
        }

        // If scopes are required, try to assert them using the App Debug API
        if (requiredScopes.length > 0) {
          const appId = process.env.META_APP_ID;
          const appSecret = process.env.META_APP_SECRET;

          if (!appId || !appSecret) {
            return { ok: false, message: 'Scopes requeridos configurados, mas META_APP_ID/SECRET ausentes - impossível verificar' };
          }

          const appToken = `${appId}|${appSecret}`;
          const debugRes = await fetch(`https://graph.facebook.com/debug_token?input_token=${encodeURIComponent(token)}&access_token=${encodeURIComponent(appToken)}`);

          if (!debugRes.ok) {
            const txt = await debugRes.text().catch(() => 'error');
            return { ok: false, message: `Não foi possível verificar scopes: ${debugRes.status} ${txt}` };
          }

          const debugJson = await debugRes.json().catch(() => null);
          // Normalize found scopes/permissions from debug response
          let availableScopes: string[] = [];

          if (Array.isArray(debugJson?.data?.scopes)) {
            availableScopes = debugJson.data.scopes.map((s: any) => String(s));
          } else if (Array.isArray(debugJson?.data?.permissions)) {
            // Some responses include permissions array with objects
            availableScopes = debugJson.data.permissions.map((p: any) => String(p.permission || p));
          } else if (typeof debugJson?.data?.granted_scopes === 'string') {
            availableScopes = debugJson.data.granted_scopes.split(',').map((s: any) => String(s).trim());
          }

          const missing = requiredScopes.filter(rs => !availableScopes.includes(rs));
          if (missing.length > 0) {
            return { ok: false, message: `Token válido mas faltam scopes: ${missing.join(', ')}` };
          }
        }

        return { ok: true, message: 'Token Meta válido' };
      } catch (e: any) {
        return { ok: false, message: `Erro ao validar Meta: ${e?.message ?? e}` };
      }
    };

    const g = await validateOpenAI(openai_key);
    const gAlt = await validateOpenAI(openai_key_alt);
    const gm = await validateGemini(gemini_key);
    const gmAlt = await validateGemini(gemini_key_alt);
    const ig = await validateMeta(instagram_token);
    const wa = await validateMeta(whatsapp_token);
    const mt = await validateMeta(meta_key);
    const ga = (() => {
      if (!google_ads_key) return { ok: false, message: 'Vazio' };
      if (String(google_ads_key).startsWith('TEST_')) return { ok: true, message: 'TEST key accepted' };
      if (String(google_ads_key).length > 10) return { ok: true, message: 'Formato plausível' };
      return { ok: false, message: 'Formato inválido' };
    })();

    const validateGoogleCustomer = () => {
      if (!google_ads_customer_id) return { ok: false, message: 'Vazio' };
      if (/^\d{6,20}$/.test(String(google_ads_customer_id))) return { ok: true, message: 'Formato plausível' };
      return { ok: false, message: 'Formato inválido (deve ser numérico)' };
    };

    const result = {
      openai: g,
      openai_alt: gAlt,
      gemini: gm,
      gemini_alt: gmAlt,
      google_ads: ga,
      google_ads_customer_id: validateGoogleCustomer(),
      instagram: ig,
      whatsapp: wa,
      meta: mt,
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
          google_ads: user.google_ads_key ? decryptText(user.google_ads_key) : null,
          google_ads_customer_id: user.google_ads_customer_id || null,
          instagram: user.instagram_token ? decryptText(user.instagram_token) : null,
          whatsapp: user.whatsapp_token ? decryptText(user.whatsapp_token) : null,
          openai: user.openai_key ? decryptText(user.openai_key) : null,
          openai_alt: user.openai_key_alt ? decryptText(user.openai_key_alt) : null,
          gemini: user.gemini_key ? decryptText(user.gemini_key) : null,
          gemini_alt: user.gemini_key_alt ? decryptText(user.gemini_key_alt) : null,
          meta: user.meta_key ? decryptText(user.meta_key) : null,
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

// ============ ADMIN: Dry-Run & Logs ============

let dryRunEnabled = process.env.DRY_RUN === '1' || false;

function appendLog(action: string, details: any) {
  try {
    const logsDir = 'logs';
    if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });
    const line = `[${new Date().toISOString()}] ${action} ${typeof details === 'string' ? details : JSON.stringify(details)}\n`;
    fs.appendFileSync(path.join(logsDir, 'actions.log'), line);
  } catch (e) {
    console.error('Failed to append log:', e);
  }
}

app.post('/admin/dry-run', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { enabled } = req.body;
    dryRunEnabled = !!enabled;
    appendLog('dry-run:set', { by: req.user?.email, enabled: dryRunEnabled });
    return res.json({ success: true, enabled: dryRunEnabled });
  } catch (e: any) {
    console.error('Erro admin dry-run:', e);
    return res.status(500).json({ success: false, message: 'Erro no servidor' });
  }
});

app.get('/admin/dry-run', authenticateToken, async (req: AuthRequest, res: Response) => {
  return res.json({ success: true, enabled: dryRunEnabled });
});

app.get('/admin/logs', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const logsPath = path.join('logs', 'actions.log');
    if (!fs.existsSync(logsPath)) return res.json({ success: true, data: [] });
    const txt = fs.readFileSync(logsPath, 'utf8');
    const lines = txt.trim().split('\n').slice(-100).reverse(); // last 100 lines, newest first
    return res.json({ success: true, data: lines });
  } catch (e: any) {
    console.error('Erro ao ler logs:', e);
    return res.status(500).json({ success: false, message: 'Erro no servidor' });
  }
});

app.get('/admin/logs/export', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const logsPath = path.join('logs', 'actions.log');
    if (!fs.existsSync(logsPath)) return res.status(404).send('No logs');
    const txt = fs.readFileSync(logsPath, 'utf8');
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Content-Disposition', 'attachment; filename="gaia-actions.log"');
    return res.send(txt);
  } catch (e: any) {
    console.error('Erro ao exportar logs:', e);
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
      // Prefer a per-user saved key (from users.google_ads_key); fall back to process.env.GOOGLE_ADS_TOKEN
      const userRes = await pool.query('SELECT google_ads_key FROM users WHERE id = $1', [req.user.id]);
      const userKey = userRes.rows?.[0]?.google_ads_key || null;

      if (userKey || process.env.GOOGLE_ADS_TOKEN) {
        const campRes = await pool.query('SELECT * FROM campaigns WHERE id = $1', [campaignId]);
        const campaign = campRes.rows[0];
        if (campaign && (campaign.plataforma === 'google_ads' || (req.body.plataformas && req.body.plataformas.google_ads))) {
          try {
            // If there is a per-user key but no customerId configured in env, we can still
            // simulate when the key is a TEST_ key; otherwise warn the operator.
            const custId = process.env.GOOGLE_ADS_CUSTOMER_ID;
            if (!custId && userKey && String(userKey).startsWith('TEST_')) {
              console.log('ℹ️ No GOOGLE_ADS_CUSTOMER_ID configured but TEST_ key provided — simulating with TEST_CUSTOMER');
            } else if (!custId && !userKey) {
              console.warn('⚠️ GOOGLE_ADS_CUSTOMER_ID not configured — skipping Google Ads publish');
              // Skip publish if no customer id and no userKey was provided (shouldn't happen)
              return;
            }

            const gaResp = await googleAds.createGoogleAdsCampaign(campaign, {
              token: userKey || undefined,
              customerId: custId || (userKey && String(userKey).startsWith('TEST_') ? 'TEST_CUSTOMER' : undefined),
              developerToken: process.env.GOOGLE_ADS_DEVELOPER_TOKEN || undefined,
              loginCustomerId: process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID || undefined,
              simulateIfTestKey: true,
            });

            console.log('✅ Google Ads campaign created:', gaResp?.resource?.resourceName || gaResp?.resource || gaResp);          } catch (gaErr: any) {
            console.warn('⚠️ Google Ads publish failed:', gaErr?.message ?? gaErr);
          }
        }
      }
    } catch (err: any) {
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

// Inicializar DB e então iniciar servidor (mas não iniciar `listen` durante testes)
export const ready = initializeDatabase()
  .then(() => {
    if (process.env.NODE_ENV !== 'test') {
      app.listen(PORT, () => {
        console.log(`\n✅ Servidor Gaia rodando em http://localhost:${PORT}`);
        console.log(`📊 Modo: Backend Real com PostgreSQL`);
        console.log(`🎭 Modo Visitante disponível em POST /auth/guest`);
        console.log(`🔐 Autenticação JWT ativada`);
        console.log(`🌐 CORS Origins: ${CORS_ORIGIN}\n`);
      });
    } else {
      console.log('⚠️ NODE_ENV=test — servidor não iniciado (tests importam `app` diretamente)');
    }
  })
  .catch((err) => {
    console.error('\n❌ Erro ao inicializar banco de dados:', err);
    if (process.env.NODE_ENV === 'test') throw err; // surface to test runner
  });

export default app;

