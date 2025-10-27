/**
 * Middleware de Logging Detalhado
 * Registra todas as ações com IP, timestamp e detalhes
 */

import { Request, Response, NextFunction } from 'express';
import { query } from '../config/database';

/**
 * Logar ação do usuário
 */
export async function logAction(
  userId: string | undefined,
  acao: string,
  ip: string | undefined,
  detalhes: any = {},
  resultado: string = 'sucesso'
): Promise<void> {
  try {
    const userAgent = undefined; // Será capturado do request se necessário

    await query(
      `INSERT INTO detailed_access_logs (user_id, acao, ip_address, user_agent, detalhes, resultado, timestamp)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
      [userId || null, acao, ip, userAgent, JSON.stringify(detalhes), resultado]
    );
  } catch (error) {
    console.error('Erro ao logar ação:', error);
  }
}

/**
 * Middleware para logar requisições
 */
export function detailedLoggerMiddleware(req: Request, res: Response, next: NextFunction): void {
  // Capturar IP real (considerando proxies)
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.ip;

  // Armazenar no request para uso posterior
  (req as any).clientIp = ip;

  // Logar requisição (opcional - apenas para debug)
  if (process.env.DEBUG_LOGS === 'true') {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} - IP: ${ip}`);
  }

  next();
}

/**
 * Logar login
 */
export async function logLogin(
  userId: string,
  email: string,
  ip: string | undefined,
  sucesso: boolean
): Promise<void> {
  await logAction(
    userId,
    'login',
    ip,
    { email, timestamp: new Date().toISOString() },
    sucesso ? 'sucesso' : 'falha'
  );
}

/**
 * Logar disparo de campanha
 */
export async function logCampaignLaunch(
  userId: string,
  campaignId: string,
  titulo: string,
  plataformas: string[],
  ip: string | undefined
): Promise<void> {
  await logAction(
    userId,
    'disparar_campanha',
    ip,
    {
      campaign_id: campaignId,
      titulo,
      plataformas,
      timestamp: new Date().toISOString(),
    },
    'sucesso'
  );
}

/**
 * Logar envio de voz
 */
export async function logVoiceCommand(
  userId: string,
  comando: string,
  resposta: string,
  ip: string | undefined
): Promise<void> {
  await logAction(
    userId,
    'comando_voz',
    ip,
    {
      comando,
      resposta,
      timestamp: new Date().toISOString(),
    },
    'sucesso'
  );
}

/**
 * Logar mensagem WhatsApp
 */
export async function logWhatsAppMessage(
  userId: string,
  numero: string,
  tipo: string,
  conteudo: string,
  ip: string | undefined
): Promise<void> {
  await logAction(
    userId,
    'whatsapp_message',
    ip,
    {
      numero,
      tipo,
      conteudo: conteudo.substring(0, 100), // Limitar tamanho
      timestamp: new Date().toISOString(),
    },
    'sucesso'
  );
}

/**
 * Logar tentativa de acesso ao modo admin
 */
export async function logAdminAccess(
  userId: string | undefined,
  email: string,
  sucesso: boolean,
  ip: string | undefined
): Promise<void> {
  await logAction(
    userId,
    'admin_access_attempt',
    ip,
    {
      email,
      timestamp: new Date().toISOString(),
    },
    sucesso ? 'sucesso' : 'falha'
  );
}

/**
 * Logar salvamento de chaves de API
 */
export async function logKeySave(
  userId: string,
  chaves: string[],
  ip: string | undefined
): Promise<void> {
  await logAction(
    userId,
    'salvar_chaves_api',
    ip,
    {
      chaves,
      timestamp: new Date().toISOString(),
    },
    'sucesso'
  );
}

/**
 * Logar simulação de campanha
 */
export async function logTestCampaign(
  userId: string,
  titulo: string,
  orcamento: number,
  ip: string | undefined
): Promise<void> {
  await logAction(
    userId,
    'simular_campanha',
    ip,
    {
      titulo,
      orcamento,
      timestamp: new Date().toISOString(),
    },
    'sucesso'
  );
}

/**
 * Logar tentativa de ação suspeita
 */
export async function logSuspiciousActivity(
  userId: string | undefined,
  acao: string,
  detalhes: any,
  ip: string | undefined
): Promise<void> {
  await logAction(
    userId,
    `suspicious_${acao}`,
    ip,
    {
      ...detalhes,
      timestamp: new Date().toISOString(),
    },
    'suspeita'
  );
}

