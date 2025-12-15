import { VercelRequest, VercelResponse } from '@vercel/node';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'gaia-secret-key-2025';

// Armazenar usuários em memória (em produção, usar banco de dados)
let registeredUsers: Array<{
  id: string;
  email: string;
  senha: string;
  nome: string;
}> = [];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Método não permitido' });
  }

  try {
    const { email, senha, nome } = req.body;

    if (!email || !senha) {
      return res.status(400).json({
        success: false,
        message: 'Email e senha são obrigatórios',
      });
    }

    // Verificar se usuário já existe
    if (registeredUsers.some(u => u.email === email)) {
      return res.status(400).json({
        success: false,
        message: 'Usuário já existe',
      });
    }

    // Criar novo usuário (hash da senha)
    const userId = crypto.randomUUID();
    const hashedSenha = await bcrypt.hash(senha, 10);
    const newUser = {
      id: userId,
      email,
      senha: hashedSenha,
      nome: nome || 'Usuário',
    };

    registeredUsers.push(newUser);

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
        nome: newUser.nome,
      },
    });
  } catch (error) {
    console.error('Erro no registro:', error);
    return res.status(500).json({ success: false, message: 'Erro no servidor' });
  }
}
