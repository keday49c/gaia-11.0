import CryptoJS from 'crypto-js';
import bcryptjs from 'bcryptjs';

/**
 * Criptografa uma string usando AES-256
 * @param text - Texto a ser criptografado
 * @param key - Chave de criptografia
 * @returns String criptografada em Base64
 */
export function encryptAES256(text: string, key: string): string {
  return CryptoJS.AES.encrypt(text, key).toString();
}

/**
 * Descriptografa uma string criptografada com AES-256
 * @param encryptedText - Texto criptografado
 * @param key - Chave de descriptografia
 * @returns Texto descriptografado
 */
export function decryptAES256(encryptedText: string, key: string): string {
  const bytes = CryptoJS.AES.decrypt(encryptedText, key);
  return bytes.toString(CryptoJS.enc.Utf8);
}

/**
 * Criptografa uma senha usando bcrypt
 * @param password - Senha a ser criptografada
 * @returns Hash da senha
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcryptjs.genSalt(12);
  return bcryptjs.hash(password, salt);
}

/**
 * Valida uma senha contra seu hash bcrypt
 * @param password - Senha a validar
 * @param hash - Hash da senha armazenada
 * @returns true se a senha está correta
 */
export async function validatePassword(password: string, hash: string): Promise<boolean> {
  return bcryptjs.compare(password, hash);
}

/**
 * Criptografa um objeto de chaves de API
 * @param keys - Objeto com as chaves (google_ads, instagram, whatsapp)
 * @param aesKey - Chave AES-256
 * @returns String JSON criptografada
 */
export function encryptApiKeys(
  keys: { google_ads?: string; instagram?: string; whatsapp?: string },
  aesKey: string
): string {
  const jsonString = JSON.stringify(keys);
  return encryptAES256(jsonString, aesKey);
}

/**
 * Descriptografa um objeto de chaves de API
 * @param encryptedKeys - String JSON criptografada
 * @param aesKey - Chave AES-256
 * @returns Objeto com as chaves
 */
export function decryptApiKeys(
  encryptedKeys: string,
  aesKey: string
): { google_ads?: string; instagram?: string; whatsapp?: string } {
  try {
    const decryptedJson = decryptAES256(encryptedKeys, aesKey);
    return JSON.parse(decryptedJson);
  } catch (error) {
    console.error('Erro ao descriptografar chaves de API:', error);
    return { google_ads: null, instagram: null, whatsapp: null };
  }
}

