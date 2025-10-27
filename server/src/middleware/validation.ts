/**
 * Middleware de validação contra XSS e SQL injection
 */

import { Request, Response, NextFunction } from 'express';

/**
 * Sanitizar string contra XSS
 */
export function sanitizeString(str: string): string {
  if (typeof str !== 'string') return str;

  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Validar contra SQL injection
 */
export function validateSQLInput(input: any): boolean {
  if (typeof input !== 'string') return true;

  const sqlPatterns = [
    /(\b(UNION|SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE|SCRIPT|JAVASCRIPT|ONERROR|ONLOAD)\b)/gi,
    /(-{2}|\/\*|\*\/|xp_|sp_)/gi,
    /(;|\||&&)/g,
  ];

  for (const pattern of sqlPatterns) {
    if (pattern.test(input)) {
      return false;
    }
  }

  return true;
}

/**
 * Middleware para validar entrada
 */
export function validationMiddleware(req: Request, res: Response, next: NextFunction): void {
  try {
    // Validar body
    if (req.body && typeof req.body === 'object') {
      for (const key in req.body) {
        const value = req.body[key];

        // Validar contra SQL injection
        if (typeof value === 'string' && !validateSQLInput(value)) {
          res.status(400).json({
            success: false,
            message: `Campo "${key}" contém padrões suspeitos`,
          });
          return;
        }

        // Sanitizar string
        if (typeof value === 'string') {
          req.body[key] = sanitizeString(value);
        }
      }
    }

    // Validar query params
    if (req.query && typeof req.query === 'object') {
      for (const key in req.query) {
        const value = req.query[key];

        if (typeof value === 'string' && !validateSQLInput(value)) {
          res.status(400).json({
            success: false,
            message: `Parâmetro "${key}" contém padrões suspeitos`,
          });
          return;
        }
      }
    }

    next();
  } catch (error) {
    console.error('Erro no middleware de validação:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
}

