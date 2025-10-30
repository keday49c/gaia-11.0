import express, { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import cors from 'cors';
import crypto from 'crypto';
import { VercelRequest, VercelResponse } from '@vercel/node';

// Tipos
interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    isGuest: boolean;
  };
}

const JWT_SECRET = process.env.JWT_SECRET || 'gaia-secret-key-2025';

// Dados em memória (sem banco de dados)
const users: any = {};
const campaigns: any = {};

// Chaves de teste
const TEST_KEYS = {
  GOOGLE_ADS: {
    key: 'TEST_GOOGLE_ADS_KEY_12345',
    customerId: 'TEST_CUSTOMER_ID_67890',
  },
  INSTAGRAM: {
    token: 'TEST_INSTAGRAM_TOKEN_ABCDEF123456',
    businessAccountId: 'TEST_BUSINESS_ACCOUNT_ID',
  },
  WHATSAPP: {
    token: 'TEST_WHATSAPP_TOKEN_GHIJKL789012',
    phoneNumberId: 'TEST_PHONE_NUMBER_ID',
  },
};

// Campanhas de demo
const DEMO_CAMPAIGNS = [
  {
    id: '1',
    nome: 'Black Friday 2025',
    descricao: 'Campanha de Black Friday com desconto de 50%',
    status: 'ativa',
    tipo: 'promocao',
    plataforma: 'google_ads',
    cliques: 5420,
    impressoes: 125000,
    conversoes: 542,
    orcamento: 5000,
    ctr: 4.34,
    cpc: 0.92,
    roi: 285.5,
  },
  {
    id: '2',
    nome: 'Lançamento Produto X',
    descricao: 'Campanha de lançamento do novo produto X',
    status: 'ativa',
    tipo: 'lancamento',
    plataforma: 'instagram',
    cliques: 8920,
    impressoes: 250000,
    conversoes: 892,
    orcamento: 8000,
    ctr: 3.57,
    cpc: 0.89,
    roi: 312.8,
  },
  {
    id: '3',
    nome: 'Reengajamento WhatsApp',
    descricao: 'Campanha de reengajamento via WhatsApp',
    status: 'pausada',
    tipo: 'reengajamento',
    plataforma: 'whatsapp',
    cliques: 3200,
    impressoes: 45000,
    conversoes: 320,
    orcamento: 2000,
    ctr: 7.11,
    cpc: 6.25,
    roi: 425.0,
  },
];

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

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
 * Login
 */
app.post('/auth/login', (req: Request, res: Response) => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({
        success: false,
        message: 'Email e senha são obrigatórios',
      });
    }

    // Verificar usuário em memória
    const user = users[email];

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
 * Registro
 */
app.post('/auth/register', (req: Request, res: Response) => {
  try {
    const { email, senha, nome } = req.body;

    if (!email || !senha) {
      return res.status(400).json({
        success: false,
        message: 'Email e senha são obrigatórios',
      });
    }

    // Verificar se usuário já existe
    if (users[email]) {
      return res.status(400).json({
        success: false,
        message: 'Usuário já existe',
      });
    }

    // Criar novo usuário
    const userId = crypto.randomUUID();
    users[email] = {
      id: userId,
      email,
      senha,
      nome: nome || 'Usuário',
      google_ads_key: '',
      instagram_token: '',
      whatsapp_token: '',
    };

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
 * Modo Visitante
 */
app.post('/auth/guest', (req: Request, res: Response) => {
  const guestToken = jwt.sign(
    { id: 'demo-user-001', email: 'visitante@gaia.demo', isGuest: true },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  return res.json({
    success: true,
    message: 'Modo visitante ativado',
    data: {
      token: guestToken,
      userId: 'demo-user-001',
      email: 'visitante@gaia.demo',
      isGuest: true,
    },
  });
});

// ============ ROTAS DE CHAVES DE API ============

/**
 * Salvar chaves
 */
app.post('/keys/salvar', authenticateToken, (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Não autenticado' });
    }

    const { google_ads_key, instagram_token, whatsapp_token } = req.body;

    // Atualizar chaves em memória
    const user = users[req.user.email];
    if (user) {
      user.google_ads_key = google_ads_key;
      user.instagram_token = instagram_token;
      user.whatsapp_token = whatsapp_token;
    }

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
 * Obter dados do usuário
 */
app.get('/keys/meus-dados', authenticateToken, (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Não autenticado' });
    }

    // Se for visitante, retornar dados de teste
    if (req.user.isGuest) {
      return res.json({
        success: true,
        data: {
          usuario: {
            id: 'demo-user-001',
            email: 'visitante@gaia.demo',
            nome: 'Visitante Demo',
          },
          chaves: {
            google_ads: TEST_KEYS.GOOGLE_ADS.key,
            instagram: TEST_KEYS.INSTAGRAM.token,
            whatsapp: TEST_KEYS.WHATSAPP.token,
          },
          testKeys: {
            google_ads: TEST_KEYS.GOOGLE_ADS,
            instagram: TEST_KEYS.INSTAGRAM,
            whatsapp: TEST_KEYS.WHATSAPP,
          },
          isGuest: true,
        },
      });
    }

    // Buscar usuário real
    const user = users[req.user.email];

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
          google_ads: user.google_ads_key,
          instagram: user.instagram_token,
          whatsapp: user.whatsapp_token,
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
 * Listar campanhas
 */
app.get('/campaigns/lista', authenticateToken, (req: AuthRequest, res: Response) => {
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

    // Retornar campanhas do usuário
    const userCampaigns = campaigns[req.user.id] || [];

    return res.json({
      success: true,
      data: userCampaigns,
    });
  } catch (error) {
    console.error('Erro ao listar campanhas:', error);
    return res.status(500).json({ success: false, message: 'Erro no servidor' });
  }
});

/**
 * Criar campanha
 */
app.post('/campaigns/criar', authenticateToken, (req: AuthRequest, res: Response) => {
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
    const campaign = {
      id: campaignId,
      nome,
      descricao,
      tipo,
      plataforma,
      orcamento: orcamento || 0,
      status: 'rascunho',
      cliques: 0,
      impressoes: 0,
      conversoes: 0,
    };

    if (!campaigns[req.user.id]) {
      campaigns[req.user.id] = [];
    }

    campaigns[req.user.id].push(campaign);

    return res.json({
      success: true,
      message: 'Campanha criada com sucesso',
      data: campaign,
    });
  } catch (error) {
    console.error('Erro ao criar campanha:', error);
    return res.status(500).json({ success: false, message: 'Erro no servidor' });
  }
});

/**
 * Disparar campanha
 */
app.post('/campaigns/disparar', authenticateToken, (req: AuthRequest, res: Response) => {
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

    // Encontrar e atualizar campanha
    const userCampaigns = campaigns[req.user.id] || [];
    const campaign = userCampaigns.find((c: any) => c.id === campaignId);

    if (campaign) {
      campaign.status = 'ativa';
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
  } catch (error) {
    console.error('Erro ao disparar campanha:', error);
    return res.status(500).json({ success: false, message: 'Erro no servidor' });
  }
});

/**
 * Obter métricas
 */
app.get('/campaigns/:campaignId/metricas', authenticateToken, (req: AuthRequest, res: Response) => {
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
        },
      });
    }

    return res.json({
      success: true,
      data: {
        campaignId,
        metricas: [],
      },
    });
  } catch (error) {
    console.error('Erro ao buscar métricas:', error);
    return res.status(500).json({ success: false, message: 'Erro no servidor' });
  }
});

// ============ HEALTH CHECK ============

app.get('/health', (req: Request, res: Response) => {
  return res.json({
    success: true,
    data: {
      status: 'ok',
      timestamp: new Date().toISOString(),
      backend: 'running',
    },
  });
});

// ============ EXPORT PARA VERCEL ============

export default app;

