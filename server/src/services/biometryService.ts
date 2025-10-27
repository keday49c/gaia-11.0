/**
 * Serviço de Biometria (Fingerprint/Face)
 * Integração com Web Authentication API
 */

import { query } from '../config/database';

export interface BiometricData {
  type: 'fingerprint' | 'face';
  data: string;
}

/**
 * Registrar biometria do usuário
 */
export async function registerBiometric(
  userId: string,
  biometricType: 'fingerprint' | 'face',
  biometricData: string
): Promise<{ success: boolean; message: string }> {
  try {
    // Verificar se já existe biometria registrada
    const existingResult = await query(
      'SELECT id FROM user_biometrics WHERE user_id = $1',
      [userId]
    );

    if (existingResult.rows.length > 0) {
      // Atualizar biometria existente
      await query(
        `UPDATE user_biometrics 
         SET biometric_type = $1, biometric_data = $2, atualizado_em = NOW()
         WHERE user_id = $3`,
        [biometricType, Buffer.from(biometricData), userId]
      );
    } else {
      // Inserir nova biometria
      await query(
        `INSERT INTO user_biometrics (user_id, biometric_type, biometric_data, enabled)
         VALUES ($1, $2, $3, true)`,
        [userId, biometricType, Buffer.from(biometricData)]
      );
    }

    return {
      success: true,
      message: `Biometria ${biometricType} registrada com sucesso`,
    };
  } catch (error) {
    console.error('Erro ao registrar biometria:', error);
    return {
      success: false,
      message: 'Erro ao registrar biometria',
    };
  }
}

/**
 * Verificar se usuário tem biometria habilitada
 */
export async function hasBiometryEnabled(userId: string): Promise<boolean> {
  try {
    const result = await query(
      'SELECT enabled FROM user_biometrics WHERE user_id = $1 AND enabled = true',
      [userId]
    );

    return result.rows.length > 0;
  } catch (error) {
    console.error('Erro ao verificar biometria:', error);
    return false;
  }
}

/**
 * Obter tipo de biometria do usuário
 */
export async function getBiometricType(userId: string): Promise<string | null> {
  try {
    const result = await query(
      'SELECT biometric_type FROM user_biometrics WHERE user_id = $1 AND enabled = true',
      [userId]
    );

    if (result.rows.length > 0) {
      return result.rows[0].biometric_type;
    }

    return null;
  } catch (error) {
    console.error('Erro ao obter tipo de biometria:', error);
    return null;
  }
}

/**
 * Desabilitar biometria
 */
export async function disableBiometric(userId: string): Promise<{ success: boolean; message: string }> {
  try {
    await query(
      'UPDATE user_biometrics SET enabled = false WHERE user_id = $1',
      [userId]
    );

    return {
      success: true,
      message: 'Biometria desabilitada com sucesso',
    };
  } catch (error) {
    console.error('Erro ao desabilitar biometria:', error);
    return {
      success: false,
      message: 'Erro ao desabilitar biometria',
    };
  }
}

