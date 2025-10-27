import { Router, Request, Response } from 'express';
import { query } from '../config/database';
import { hashPassword, validatePassword } from '../utils/crypto';
import { generateToken } from '../utils/jwt';
import { loginLimiter } from '../middleware/rateLimiter';

const router = Router();

/**
 * POST /auth/login
 * Autentica um usuário e retorna um JWT
 */
router.post('/login', loginLimiter, async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, senha } = req.body;

    // Validar entrada
    if (!email || !senha) {
      res.status(400).json({
        success: false,
        message: 'E-mail e senha são obrigatórios',
      });
      return;
    }

    // Buscar usuário no banco
    const result = await query('SELECT id, email, senha FROM users WHERE email = $1', [email]);

    if (result.rows.length === 0) {
      res.status(401).json({
        success: false,
        message: 'E-mail ou senha incorretos',
      });
      return;
    }

    const user = result.rows[0];

    // Validar senha
    const isPasswordValid = await validatePassword(senha, user.senha);

    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        message: 'E-mail ou senha incorretos',
      });
      return;
    }

    // Gerar JWT
    const token = generateToken(user.id, user.email);

    res.json({
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
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
    });
  }
});

/**
 * POST /auth/register
 * Registra um novo usuário
 */
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, senha } = req.body;

    // Validar entrada
    if (!email || !senha) {
      res.status(400).json({
        success: false,
        message: 'E-mail e senha são obrigatórios',
      });
      return;
    }

    // Validar força da senha (mínimo 20 caracteres)
    if (senha.length < 20) {
      res.status(400).json({
        success: false,
        message: 'Senha deve ter no mínimo 20 caracteres',
      });
      return;
    }

    // Validar formato de e-mail
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({
        success: false,
        message: 'E-mail inválido',
      });
      return;
    }

    // Verificar se usuário já existe
    const existingUser = await query('SELECT id FROM users WHERE email = $1', [email]);

    if (existingUser.rows.length > 0) {
      res.status(409).json({
        success: false,
        message: 'E-mail já cadastrado',
      });
      return;
    }

    // Hash da senha
    const senhaHash = await hashPassword(senha);

    // Inserir novo usuário
    const result = await query(
      `INSERT INTO users (email, senha, chaves_api)
       VALUES ($1, $2, $3)
       RETURNING id, email`,
      [
        email,
        senhaHash,
        JSON.stringify({
          google_ads: null,
          instagram: null,
          whatsapp: null,
        }),
      ]
    );

    const newUser = result.rows[0];

    // Gerar JWT
    const token = generateToken(newUser.id, newUser.email);

    res.status(201).json({
      success: true,
      message: 'Usuário registrado com sucesso',
      data: {
        token,
        userId: newUser.id,
        email: newUser.email,
      },
    });
  } catch (error) {
    console.error('Erro no registro:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
    });
  }
});

export default router;

