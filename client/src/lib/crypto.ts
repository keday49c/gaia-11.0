import CryptoJS from 'crypto-js';

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
 * Salva a senha criptografada no localStorage
 * @param password - Senha a ser salva
 */
export function saveEncryptedPassword(password: string): void {
  const encrypted = encryptAES256(password, 'gaia-secret-key');
  localStorage.setItem('gaia_password', encrypted);
}

/**
 * Recupera a senha criptografada do localStorage
 * @returns Senha descriptografada ou null se não existir
 */
export function getEncryptedPassword(): string | null {
  const encrypted = localStorage.getItem('gaia_password');
  if (!encrypted) return null;
  try {
    return decryptAES256(encrypted, 'gaia-secret-key');
  } catch {
    return null;
  }
}

/**
 * Verifica se a senha foi configurada
 * @returns true se a senha foi configurada
 */
export function isPasswordSet(): boolean {
  return localStorage.getItem('gaia_password') !== null;
}

/**
 * Valida a senha inserida contra a senha armazenada
 * @param inputPassword - Senha inserida pelo usuário
 * @returns true se a senha está correta
 */
export function validatePassword(inputPassword: string): boolean {
  const storedPassword = getEncryptedPassword();
  if (!storedPassword) return false;
  return inputPassword === storedPassword;
}

/**
 * Limpa todos os dados do localStorage (modo admin)
 */
export function clearAllData(): void {
  localStorage.clear();
}

