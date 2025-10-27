/**
 * Serviço de Modo Offline
 * Sincronização automática quando volta internet
 */

import { query } from '../config/database';

export interface OfflineData {
  tipo_dados: string;
  dados: any;
}

/**
 * Salvar dados no cache offline
 */
export async function saveOfflineData(
  userId: string,
  tipoDados: string,
  dados: any
): Promise<{ success: boolean; message: string }> {
  try {
    await query(
      `INSERT INTO offline_cache (user_id, tipo_dados, dados, sincronizado)
       VALUES ($1, $2, $3, false)`,
      [userId, tipoDados, JSON.stringify(dados)]
    );

    return {
      success: true,
      message: 'Dados salvos no cache offline',
    };
  } catch (error) {
    console.error('Erro ao salvar dados offline:', error);
    return {
      success: false,
      message: 'Erro ao salvar dados offline',
    };
  }
}

/**
 * Obter dados não sincronizados
 */
export async function getUnsyncedData(userId: string): Promise<any[]> {
  try {
    const result = await query(
      `SELECT * FROM offline_cache WHERE user_id = $1 AND sincronizado = false ORDER BY criado_em ASC`,
      [userId]
    );

    return result.rows;
  } catch (error) {
    console.error('Erro ao obter dados não sincronizados:', error);
    return [];
  }
}

/**
 * Marcar dados como sincronizados
 */
export async function markAsSynced(cacheId: string): Promise<{ success: boolean; message: string }> {
  try {
    await query(
      `UPDATE offline_cache SET sincronizado = true, sincronizado_em = NOW() WHERE id = $1`,
      [cacheId]
    );

    return {
      success: true,
      message: 'Dados marcados como sincronizados',
    };
  } catch (error) {
    console.error('Erro ao marcar como sincronizado:', error);
    return {
      success: false,
      message: 'Erro ao marcar como sincronizado',
    };
  }
}

/**
 * Sincronizar todos os dados offline
 */
export async function syncAllOfflineData(userId: string): Promise<{ success: boolean; synced: number; message: string }> {
  try {
    const unsyncedData = await getUnsyncedData(userId);

    if (unsyncedData.length === 0) {
      return {
        success: true,
        synced: 0,
        message: 'Nenhum dado para sincronizar',
      };
    }

    // Sincronizar cada item
    for (const item of unsyncedData) {
      try {
        // TODO: Implementar sincronização real baseada no tipo de dados
        // if (item.tipo_dados === 'campanha') { ... }
        // if (item.tipo_dados === 'voz') { ... }

        await markAsSynced(item.id);
      } catch (error) {
        console.error(`Erro ao sincronizar item ${item.id}:`, error);
      }
    }

    return {
      success: true,
      synced: unsyncedData.length,
      message: `${unsyncedData.length} item(ns) sincronizado(s)`,
    };
  } catch (error) {
    console.error('Erro ao sincronizar dados offline:', error);
    return {
      success: false,
      synced: 0,
      message: 'Erro ao sincronizar dados offline',
    };
  }
}

/**
 * Limpar cache offline sincronizado
 */
export async function clearSyncedCache(userId: string): Promise<{ success: boolean; deleted: number; message: string }> {
  try {
    const result = await query(
      `DELETE FROM offline_cache WHERE user_id = $1 AND sincronizado = true`,
      [userId]
    );

    return {
      success: true,
      deleted: result.rowCount,
      message: `${result.rowCount} item(ns) deletado(s)`,
    };
  } catch (error) {
    console.error('Erro ao limpar cache:', error);
    return {
      success: false,
      deleted: 0,
      message: 'Erro ao limpar cache',
    };
  }
}

/**
 * Obter status de sincronização
 */
export async function getSyncStatus(userId: string): Promise<{ total: number; synced: number; pending: number }> {
  try {
    const totalResult = await query('SELECT COUNT(*) FROM offline_cache WHERE user_id = $1', [userId]);
    const syncedResult = await query('SELECT COUNT(*) FROM offline_cache WHERE user_id = $1 AND sincronizado = true', [userId]);

    const total = parseInt(totalResult.rows[0].count);
    const synced = parseInt(syncedResult.rows[0].count);

    return {
      total,
      synced,
      pending: total - synced,
    };
  } catch (error) {
    console.error('Erro ao obter status de sincronização:', error);
    return {
      total: 0,
      synced: 0,
      pending: 0,
    };
  }
}

