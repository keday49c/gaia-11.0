import { VercelRequest, VercelResponse } from '@vercel/node';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'gaia-secret-key-2025';

const TEST_KEYS = {
  GOOGLE_ADS: {
    key: 'TEST_GOOGLE_ADS_KEY_12345',
    customerId: 'TEST_CUSTOMER_ID_67890',
    description: 'Chave de teste para Google Ads',
    status: 'test',
  },
  INSTAGRAM: {
    token: 'TEST_INSTAGRAM_TOKEN_ABCDEF123456',
    businessAccountId: 'TEST_BUSINESS_ACCOUNT_ID',
    description: 'Token de teste para Instagram',
    status: 'test',
  },
  WHATSAPP: {
    token: 'TEST_WHATSAPP_TOKEN_GHIJKL789012',
    phoneNumberId: 'TEST_PHONE_NUMBER_ID',
    businessAccountId: 'TEST_BUSINESS_ACCOUNT_ID',
    description: 'Token de teste para WhatsApp',
    status: 'test',
  },
};

const DEMO_USER = {
  id: 'demo-user-001',
  email: 'visitante@gaia.demo',
  nome: 'Visitante Demo',
};

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Método não permitido' });
  }

  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ success: false, message: 'Token não fornecido' });
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;

      // Se for visitante, retornar dados de teste
      if (decoded.isGuest) {
        return res.json({
          success: true,
          data: {
            usuario: DEMO_USER,
            chaves: {
              google_ads: TEST_KEYS.GOOGLE_ADS.key,
              instagram: TEST_KEYS.INSTAGRAM.token,
              whatsapp: TEST_KEYS.WHATSAPP.token,
            },
            isGuest: true,
          },
        });
      }

      // Retornar dados do usuário (em produção, buscar no banco de dados)
      return res.json({
        success: true,
        data: {
          usuario: {
            id: decoded.id,
            email: decoded.email,
            nome: 'Usuário',
          },
          chaves: {
            google_ads: null,
            instagram: null,
            whatsapp: null,
          },
          testKeys: {
            google_ads: TEST_KEYS.GOOGLE_ADS.key,
            instagram: TEST_KEYS.INSTAGRAM.token,
            whatsapp: TEST_KEYS.WHATSAPP.token,
          },
        },
      });
    } catch (error) {
      return res.status(403).json({ success: false, message: 'Token inválido' });
    }
  } catch (error) {
    console.error('Erro ao buscar dados:', error);
    return res.status(500).json({ success: false, message: 'Erro no servidor' });
  }
}
