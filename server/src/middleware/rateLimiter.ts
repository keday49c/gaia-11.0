import rateLimit from 'express-rate-limit';

/**
 * Rate limiter para login: máximo 5 tentativas por minuto
 */
export const loginLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: 5, // 5 requisições por janela
  message: {
    success: false,
    message: 'Muitas tentativas de login. Tente novamente em 1 minuto.',
  },
  standardHeaders: true, // Retorna informações de rate limit nos headers
  legacyHeaders: false, // Desabilita headers X-RateLimit-*
  skip: (req) => {
    // Não aplicar rate limit a IPs confiáveis (opcional)
    return false;
  },
  keyGenerator: (req) => {
    // Usar IP do cliente como chave
    return req.ip || 'unknown';
  },
});

/**
 * Rate limiter geral: máximo 100 requisições por minuto
 */
export const generalLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: 100, // 100 requisições por janela
  message: {
    success: false,
    message: 'Muitas requisições. Tente novamente mais tarde.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return req.ip || 'unknown';
  },
});

/**
 * Rate limiter para salvar chaves: máximo 10 requisições por minuto
 */
export const saveKeysLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: 10, // 10 requisições por janela
  message: {
    success: false,
    message: 'Muitas requisições de salvamento. Tente novamente em 1 minuto.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return req.user?.userId || req.ip || 'unknown';
  },
});

