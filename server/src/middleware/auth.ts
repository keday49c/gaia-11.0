import { Request, Response, NextFunction } from 'express';
import { verifyToken, JWTPayload } from '../utils/jwt';

// Estender o tipo Request para incluir o payload do JWT
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
      ip?: string;
    }
  }
}

/**
 * Middleware para validar token JWT
 */
export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      message: 'Token não fornecido ou formato inválido',
    });
    return;
  }

  const token = authHeader.substring(7);
  const payload = verifyToken(token);

  if (!payload) {
    res.status(401).json({
      success: false,
      message: 'Token inválido ou expirado',
    });
    return;
  }

  req.user = payload;
  next();
}

/**
 * Middleware para capturar IP do cliente
 */
export function ipMiddleware(req: Request, res: Response, next: NextFunction): void {
  req.ip =
    (req.headers['x-forwarded-for'] as string)?.split(',')[0] ||
    req.socket.remoteAddress ||
    'unknown';
  next();
}

