import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'gaia-super-secret-jwt-key-2025-change-in-production';
const JWT_EXPIRATION = process.env.JWT_EXPIRATION || '15m';

export interface JWTPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}

/**
 * Gera um token JWT
 * @param userId - ID do usuário
 * @param email - E-mail do usuário
 * @returns Token JWT
 */
export function generateToken(userId: string, email: string): string {
  const payload: JWTPayload = {
    userId,
    email,
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRATION,
    algorithm: 'HS256',
  });
}

/**
 * Valida um token JWT
 * @param token - Token a validar
 * @returns Payload do token se válido, null se inválido
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    const payload = jwt.verify(token, JWT_SECRET, {
      algorithms: ['HS256'],
    }) as JWTPayload;
    return payload;
  } catch (error) {
    console.error('Erro ao validar token JWT:', error);
    return null;
  }
}

/**
 * Decodifica um token JWT sem validar assinatura (apenas para inspeção)
 * @param token - Token a decodificar
 * @returns Payload do token
 */
export function decodeToken(token: string): JWTPayload | null {
  try {
    const payload = jwt.decode(token) as JWTPayload;
    return payload;
  } catch (error) {
    console.error('Erro ao decodificar token JWT:', error);
    return null;
  }
}

