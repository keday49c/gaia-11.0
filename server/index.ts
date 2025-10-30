import express, { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import cors from 'cors';
import crypto from 'crypto';

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'gaia-secret-key-2025';

// Middleware
app.use(cors());
app.use(express.json());

// Tipos
interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    isGuest: boolean;
  };
}

interface User {
  id: string;
  email: string;
  senha: string;
  google_ads?: string;
  instagram?: string;
  whatsapp?: string;
  criadoEm: string;
  atualizadoEm: string;
}

// Banco de dados simulado (em memória)
const users: Map<string, User> = new Map();
const guestToken = jwt.sign(
  { id: 'guest-demo', email: 'visitante@gaia.demo', isGuest: true },
  JWT_SECRET,
  { expiresIn: '24h' }
);

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

// ============ ROTAS DE AUTENTICAÇÃO ============

/**
 * Login - Autenticação real com usuário
 */
app.post('/auth/login', (req: Request, res: Response) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({
      success: false,
      message: 'Email e senha são obrigatórios',
    });
  }

  // Verificar se usuário existe
  const user = Array.from(users.values()).find(u => u.email === email);

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
});

/**
 * Registro - Criar novo usuário
 */
app.post('/auth/register', (req: Request, res: Response) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({
      success: false,
      message: 'Email e senha são obrigatórios',
    });
  }

  // Verificar se usuário já existe
  if (Array.from(users.values()).some(u => u.email === email)) {
    return res.status(400).json({
      success: false,
      message: 'Usuário já existe',
    });
  }

  // Criar novo usuário
  const userId = crypto.randomUUID();
  const newUser: User = {
    id: userId,
    email,
    senha,
    criadoEm: new Date().toISOString(),
    atualizadoEm: new Date().toISOString(),
  };

  users.set(userId, newUser);

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
});

/**
 * Modo Visitante - Acesso sem autenticação
 */
app.post('/auth/guest', (req: Request, res: Response) => {
  return res.json({
    success: true,
    message: 'Modo visitante ativado',
    data: {
      token: guestToken,
      userId: 'guest-demo',
      email: 'visitante@gaia.demo',
      isGuest: true,
    },
  });
});

// ============ ROTAS DE CHAVES DE API ============

/**
 * Salvar chaves de API
 */
app.post('/keys/salvar', authenticateToken, (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Não autenticado' });
  }

  const { google_ads, instagram, whatsapp } = req.body;
  const user = users.get(req.user.id);

  if (!user) {
    return res.status(404).json({ success: false, message: 'Usuário não encontrado' });
  }

  // Atualizar chaves
  user.google_ads = google_ads;
  user.instagram = instagram;
  user.whatsapp = whatsapp;
  user.atualizadoEm = new Date().toISOString();

  return res.json({
    success: true,
    message: 'Chaves salvas com sucesso',
    data: {
      userId: user.id,
      email: user.email,
    },
  });
});

/**
 * Obter dados do usuário
 */
app.get('/keys/meus-dados', authenticateToken, (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Não autenticado' });
  }

  // Se for visitante, retornar dados simulados
  if (req.user.isGuest) {
    return res.json({
      success: true,
      data: {
        usuario: {
          id: 'guest-demo',
          email: 'visitante@gaia.demo',
          criadoEm: new Date().toISOString(),
          atualizadoEm: new Date().toISOString(),
        },
        chaves: {
          google_ads: 'DEMO_KEY_123',
          instagram: 'DEMO_KEY_456',
          whatsapp: 'DEMO_KEY_789',
        },
        logs: [
          {
            id: '1',
            ip_address: '192.168.1.1',
            acao: 'login_visitante',
            timestamp: new Date().toISOString(),
            detalhes: { modo: 'demo' },
          },
        ],
      },
    });
  }

  const user = users.get(req.user.id);

  if (!user) {
    return res.status(404).json({ success: false, message: 'Usuário não encontrado' });
  }

  return res.json({
    success: true,
    data: {
      usuario: {
        id: user.id,
        email: user.email,
        criadoEm: user.criadoEm,
        atualizadoEm: user.atualizadoEm,
      },
      chaves: {
        google_ads: user.google_ads,
        instagram: user.instagram,
        whatsapp: user.whatsapp,
      },
      logs: [],
    },
  });
});

// ============ ROTAS DE CAMPANHAS (DEMO) ============

/**
 * Listar campanhas
 */
app.get('/campaigns/lista', authenticateToken, (req: AuthRequest, res: Response) => {
  const campanhas = [
    {
      id: '1',
      nome: 'Campanha Black Friday',
      status: 'ativa',
      criacao: new Date().toISOString(),
      cliques: 1250,
      impressoes: 5000,
      conversoes: 125,
    },
    {
      id: '2',
      nome: 'Promoção de Verão',
      status: 'pausada',
      criacao: new Date().toISOString(),
      cliques: 890,
      impressoes: 3500,
      conversoes: 89,
    },
    {
      id: '3',
      nome: 'Lançamento de Produto',
      status: 'ativa',
      criacao: new Date().toISOString(),
      cliques: 2100,
      impressoes: 8000,
      conversoes: 210,
    },
  ];

  return res.json({
    success: true,
    data: campanhas,
  });
});

/**
 * Criar campanha
 */
app.post('/campaigns/criar', authenticateToken, (req: AuthRequest, res: Response) => {
  const { nome, descricao } = req.body;

  if (!nome) {
    return res.status(400).json({
      success: false,
      message: 'Nome da campanha é obrigatório',
    });
  }

  const novaCampanha = {
    id: crypto.randomUUID(),
    nome,
    descricao,
    status: 'rascunho',
    criacao: new Date().toISOString(),
    cliques: 0,
    impressoes: 0,
    conversoes: 0,
  };

  return res.json({
    success: true,
    message: 'Campanha criada com sucesso',
    data: novaCampanha,
  });
});

/**
 * Disparar campanha
 */
app.post('/campaigns/disparar', authenticateToken, (req: AuthRequest, res: Response) => {
  const { campaignId } = req.body;

  if (!campaignId) {
    return res.status(400).json({
      success: false,
      message: 'ID da campanha é obrigatório',
    });
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
});

/**
 * Obter métricas da campanha
 */
app.get('/campaigns/:campaignId/metricas', authenticateToken, (req: AuthRequest, res: Response) => {
  const { campaignId } = req.params;

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
    },
  });
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
    },
  });
});

// ============ INICIAR SERVIDOR ============

app.listen(PORT, () => {
  console.log(`✅ Servidor Gaia rodando em http://localhost:${PORT}`);
  console.log(`📊 Modo: Backend Real com Autenticação JWT`);
  console.log(`🎭 Modo Visitante disponível em POST /auth/guest`);
});

export default app;

