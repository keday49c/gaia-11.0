/**
 * Serviço de Histórico de Voz
 * Cronológico com áudio, transcrição e campanha gerada
 */

import { query } from '../config/database';

export interface VoiceRecord {
  id: string;
  comando: string;
  transcricao: string;
  resposta: string;
  audio_url?: string;
  campanha_id?: string;
  timestamp: string;
}

/**
 * Salvar registro de voz
 */
export async function saveVoiceRecord(
  userId: string,
  comando: string,
  transcricao: string,
  resposta: string,
  audioUrl?: string,
  campanhaId?: string
): Promise<{ success: boolean; recordId?: string; message: string }> {
  try {
    const result = await query(
      `INSERT INTO voice_history (user_id, comando, transcricao, resposta, audio_url, campanha_id, timestamp)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())
       RETURNING id`,
      [userId, comando, transcricao, resposta, audioUrl, campanhaId]
    );

    return {
      success: true,
      recordId: result.rows[0].id,
      message: 'Registro de voz salvo com sucesso',
    };
  } catch (error) {
    console.error('Erro ao salvar registro de voz:', error);
    return {
      success: false,
      message: 'Erro ao salvar registro de voz',
    };
  }
}

/**
 * Obter histórico de voz completo
 */
export async function getVoiceHistory(userId: string, limit: number = 100): Promise<VoiceRecord[]> {
  try {
    const result = await query(
      `SELECT * FROM voice_history WHERE user_id = $1 ORDER BY timestamp DESC LIMIT $2`,
      [userId, limit]
    );

    return result.rows.map((row: any) => ({
      id: row.id,
      comando: row.comando,
      transcricao: row.transcricao,
      resposta: row.resposta,
      audio_url: row.audio_url,
      campanha_id: row.campanha_id,
      timestamp: row.timestamp,
    }));
  } catch (error) {
    console.error('Erro ao obter histórico de voz:', error);
    return [];
  }
}

/**
 * Buscar registros de voz por data
 */
export async function getVoiceHistoryByDate(
  userId: string,
  startDate: Date,
  endDate: Date
): Promise<VoiceRecord[]> {
  try {
    const result = await query(
      `SELECT * FROM voice_history 
       WHERE user_id = $1 AND timestamp BETWEEN $2 AND $3
       ORDER BY timestamp DESC`,
      [userId, startDate.toISOString(), endDate.toISOString()]
    );

    return result.rows;
  } catch (error) {
    console.error('Erro ao buscar por data:', error);
    return [];
  }
}

/**
 * Buscar registros de voz por comando
 */
export async function searchVoiceHistory(userId: string, searchTerm: string): Promise<VoiceRecord[]> {
  try {
    const result = await query(
      `SELECT * FROM voice_history 
       WHERE user_id = $1 AND (comando ILIKE $2 OR transcricao ILIKE $2 OR resposta ILIKE $2)
       ORDER BY timestamp DESC LIMIT 50`,
      [userId, `%${searchTerm}%`]
    );

    return result.rows;
  } catch (error) {
    console.error('Erro ao buscar histórico de voz:', error);
    return [];
  }
}

/**
 * Obter registro de voz específico
 */
export async function getVoiceRecord(recordId: string, userId: string): Promise<VoiceRecord | null> {
  try {
    const result = await query(
      `SELECT * FROM voice_history WHERE id = $1 AND user_id = $2`,
      [recordId, userId]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return result.rows[0];
  } catch (error) {
    console.error('Erro ao obter registro de voz:', error);
    return null;
  }
}

/**
 * Deletar registro de voz
 */
export async function deleteVoiceRecord(recordId: string, userId: string): Promise<{ success: boolean; message: string }> {
  try {
    const result = await query(
      `DELETE FROM voice_history WHERE id = $1 AND user_id = $2`,
      [recordId, userId]
    );

    if (result.rowCount === 0) {
      return {
        success: false,
        message: 'Registro não encontrado',
      };
    }

    return {
      success: true,
      message: 'Registro de voz deletado com sucesso',
    };
  } catch (error) {
    console.error('Erro ao deletar registro de voz:', error);
    return {
      success: false,
      message: 'Erro ao deletar registro de voz',
    };
  }
}

/**
 * Obter estatísticas de voz
 */
export async function getVoiceStats(userId: string): Promise<{ total: number; thisWeek: number; thisMonth: number }> {
  try {
    const totalResult = await query('SELECT COUNT(*) FROM voice_history WHERE user_id = $1', [userId]);

    const weekResult = await query(
      `SELECT COUNT(*) FROM voice_history 
       WHERE user_id = $1 AND timestamp >= NOW() - INTERVAL '7 days'`,
      [userId]
    );

    const monthResult = await query(
      `SELECT COUNT(*) FROM voice_history 
       WHERE user_id = $1 AND timestamp >= NOW() - INTERVAL '30 days'`,
      [userId]
    );

    return {
      total: parseInt(totalResult.rows[0].count),
      thisWeek: parseInt(weekResult.rows[0].count),
      thisMonth: parseInt(monthResult.rows[0].count),
    };
  } catch (error) {
    console.error('Erro ao obter estatísticas de voz:', error);
    return {
      total: 0,
      thisWeek: 0,
      thisMonth: 0,
    };
  }
}

/**
 * Exportar histórico de voz como JSON
 */
export async function exportVoiceHistory(userId: string): Promise<{ success: boolean; data?: any; message: string }> {
  try {
    const history = await getVoiceHistory(userId, 10000);
    const stats = await getVoiceStats(userId);

    const exportData = {
      exported_at: new Date().toISOString(),
      stats,
      records: history,
    };

    return {
      success: true,
      data: exportData,
      message: 'Histórico exportado com sucesso',
    };
  } catch (error) {
    console.error('Erro ao exportar histórico:', error);
    return {
      success: false,
      message: 'Erro ao exportar histórico',
    };
  }
}

