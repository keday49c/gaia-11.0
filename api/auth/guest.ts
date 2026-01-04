import { VercelRequest, VercelResponse } from '@vercel/node';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Missing required environment variable JWT_SECRET');
  } else {
    console.warn('Warning: JWT_SECRET not set. Using temporary development secret. Set JWT_SECRET in your environment for production.');
  }
}
const ACTIVE_JWT_SECRET = JWT_SECRET || 'dev-temporary-jwt-secret';

const DEMO_USER = {
  id: 'demo-user-001',
  email: 'visitante@gaia.demo',
  nome: 'Visitante Demo',
};

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Método não permitido' });
  }

  try {
    const guestToken = jwt.sign(
      { id: DEMO_USER.id, email: DEMO_USER.email, isGuest: true },
      ACTIVE_JWT_SECRET,
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
  } catch (error) {
    console.error('Erro ao gerar token guest:', error);
    return res.status(500).json({ success: false, message: 'Erro no servidor' });
  }
}
