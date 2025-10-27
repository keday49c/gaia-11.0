import { Request, Response, NextFunction } from 'express';
import { query } from '../config/database';

/**
 * Middleware para logar todos os acessos
 */
export async function loggerMiddleware(req: Request, res: Response, next: NextFunction): Promise<void> {
  const startTime = Date.now();

  // Capturar o método original de send
  const originalSend = res.send;

  res.send = function (data: any) {
    const duration = Date.now() - startTime;
    const statusCode = res.statusCode;

    // Log no console
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} - ${statusCode} (${duration}ms)`);

    // Log no banco de dados se o usuário estiver autenticado
    if (req.user) {
      logAccessToDB(req, statusCode, duration).catch((err) => {
        console.error('Erro ao logar acesso no banco:', err);
      });
    }

    // Chamar o método original
    return originalSend.call(this, data);
  };

  next();
}

/**
 * Loga um acesso no banco de dados
 */
async function logAccessToDB(
  req: Request,
  statusCode: number,
  duration: number
): Promise<void> {
  try {
    const userId = req.user?.userId;
    const ipAddress = req.ip || 'unknown';
    const acao = `${req.method} ${req.path}`;
    const detalhes = {
      statusCode,
      duration,
      method: req.method,
      path: req.path,
      userAgent: req.get('user-agent'),
    };

    await query(
      `INSERT INTO access_logs (user_id, ip_address, acao, detalhes)
       VALUES ($1, $2, $3, $4)`,
      [userId, ipAddress, acao, JSON.stringify(detalhes)]
    );
  } catch (error) {
    console.error('Erro ao inserir log de acesso:', error);
  }
}

