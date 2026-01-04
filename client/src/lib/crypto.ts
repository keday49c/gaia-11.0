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
  // Disabled: storing user passwords client-side is insecure.
  console.warn('DEPRECATED: saveEncryptedPassword() is disabled for security reasons. Use server-side authentication instead.');
  // intentionally no-op
}

/**
 * Recupera a senha criptografada do localStorage
 * @returns null por motivos de segurança
 */
export function getEncryptedPassword(): string | null {
  console.warn('DEPRECATED: getEncryptedPassword() returns null for security reasons.');
  return null;
}

/**
 * Verifica se a senha foi configurada
 * @returns sempre false por segurança
 */
export function isPasswordSet(): boolean {
  return false;
}

/**
 * Valida a senha inserida contra a senha armazenada
 * @param inputPassword - Senha inserida pelo usuário
 * @returns false por segurança
 */
export function validatePassword(inputPassword: string): boolean {
  console.warn('DEPRECATED: validatePassword() is disabled. Authenticate via the backend.');
  return false;
}

/**
 * Limpa dados locais sensíveis
 */
export function clearAllData(): void {
  console.warn('clearAllData() called: removing known keys.');
  try {
    localStorage.removeItem('gaia_password');
  } catch {
    // ignore
  }
} 

