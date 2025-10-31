import { VercelRequest, VercelResponse } from '@vercel/node';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'gaia-secret-key-2025';

// Usuários de teste (em produção, usar banco de dados)
const TEST_USERS = [
  {
    id: 'user-001',
    email: 'admin',
    senha: 'senha123',
    nome: 'Admin',
  },
  {
    id: 'user-002',
    email: 'demo@gaia.app',
    senha: 'demo123456',
    nome: 'Demo User',
  },
];

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Método não permitido' });
  }

  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({
        success: false,
        message: 'Email e senha são obrigatórios',
      });
    }

    // Buscar usuário (em produção, buscar no banco de dados)
    const user = TEST_USERS.find(u => u.email === email && u.senha === senha);

    if (!user) {
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
        nome: user.nome,
      },
    });
  } catch (error) {
    console.error('Erro no login:', error);
    return res.status(500).json({ success: false, message: 'Erro no servidor' });
  }
}
