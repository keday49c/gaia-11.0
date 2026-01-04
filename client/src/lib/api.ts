/**
 * Serviço de API para comunicação com o backend Gaia
 */

// Default to a relative `/api` path. The frontend image's Nginx will proxy
// `/api` to the backend service inside the Docker network. Set `VITE_API_URL`
// at build time to override in non-proxy setups.
export const API_URL = import.meta.env.VITE_API_URL || '/api';
const API_BASE_URL = API_URL;

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

/**
 * Faz uma requisição para o backend
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = localStorage.getItem('gaia_token');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  if (options.headers && typeof options.headers === 'object') {
    Object.assign(headers, options.headers);
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      console.error(`Erro na API: ${response.status}`, data);
      return {
        success: false,
        message: data.message || 'Erro na requisição',
        error: data.error,
      };
    }

    return data;
  } catch (error) {
    console.error('Erro ao fazer requisição:', error);
    return {
      success: false,
      message: 'Erro ao conectar com o servidor',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Faz login no backend
 */
export async function login(email: string, senha: string): Promise<ApiResponse<{
  token: string;
  userId: string;
  email: string;
}>> {
  return apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, senha }),
  });
}

/**
 * Registra um novo usuário
 */
export async function register(email: string, senha: string): Promise<ApiResponse<{
  token: string;
  userId: string;
  email: string;
}>> {
  return apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, senha }),
  });
}

/**
 * Salva as chaves de API
 */
export async function saveApiKeys(
  google_ads?: string,
  instagram?: string,
  whatsapp?: string
): Promise<ApiResponse<{ userId: string; email: string }>> {
  // Envia os nomes de campo esperados pelo backend
  return apiRequest('/keys/salvar', {
    method: 'POST',
    body: JSON.stringify({
      google_ads_key: google_ads,
      instagram_token: instagram,
      whatsapp_token: whatsapp,
    }),
  });
}

/**
 * Valida chaves no backend (POC). O endpoint faz validações básicas/simuladas
 * e retorna um objeto com o status de cada provedor.
 */
export async function validateApiKeys(
  google_ads?: string,
  instagram?: string,
  whatsapp?: string
): Promise<ApiResponse<{ google_ads: { ok: boolean; message?: string }, instagram: { ok: boolean; message?: string }, whatsapp: { ok: boolean; message?: string } }>> {
  return apiRequest('/keys/validate', {
    method: 'POST',
    body: JSON.stringify({
      google_ads_key: google_ads,
      instagram_token: instagram,
      whatsapp_token: whatsapp,
    }),
  });
}

/**
 * Busca os dados do usuário com chaves descriptografadas
 */
export async function getMyData(): Promise<ApiResponse<{
  usuario: {
    id: string;
    email: string;
    criadoEm: string;
    atualizadoEm: string;
  };
  chaves: {
    google_ads?: string;
    instagram?: string;
    whatsapp?: string;
  };
  logs: Array<{
    id: string;
    ip_address: string;
    acao: string;
    timestamp: string;
    detalhes: any;
  }>;
}>> {
  return apiRequest('/keys/meus-dados', {
    method: 'GET',
  });
}

/**
 * Verifica a saúde do servidor
 */
export async function checkHealth(): Promise<ApiResponse<{
  status: string;
  timestamp: string;
}>> {
  return apiRequest('/health', {
    method: 'GET',
  });
}

/**
 * Verifica se existe um administrador/usuário real no servidor.
 * Retorna { hasAdmin: boolean }
 */
export async function getHasAdmin(): Promise<ApiResponse<{ hasAdmin: boolean }>> {
  return apiRequest('/auth/has-admin', { method: 'GET' });
}

/**
 * Salva o token no localStorage
 */
export function saveToken(token: string): void {
  // Prefer secure storage when running inside the desktop app (Keychain via preload)
  try {
    const gaia = (window as any).gaia;
    if (gaia && typeof gaia.storeCredential === 'function') {
      // store under service 'gaia' account 'token'
      gaia.storeCredential('gaia', 'token', token);
      // keep a fallback in localStorage for web environments
      localStorage.setItem('gaia_token', token);
      return;
    }
  } catch (e) {
    // ignore and fallback to localStorage
  }
  localStorage.setItem('gaia_token', token);
}

/**
 * Recupera o token do armazenamento seguro (Keychain) ou localStorage
 */
export function getToken(): string | null {
  try {
    const gaia = (window as any).gaia;
    if (gaia && typeof gaia.getCredential === 'function') {
      const res = gaia.getCredential('gaia', 'token');
      // getCredential returns a Promise on preload invocation
      if (res && typeof res.then === 'function') {
        // synchronous fallback: return from localStorage and let async retrieval be used elsewhere
        return localStorage.getItem('gaia_token');
      }
    }
  } catch (e) {
    // ignore
  }
  return localStorage.getItem('gaia_token');
}

/**
 * Remove o token do armazenamento seguro (Keychain) e localStorage
 */
export function removeToken(): void {
  try {
    const gaia = (window as any).gaia;
    if (gaia && typeof gaia.storeCredential === 'function') {
      // remove by setting empty - keytar does not expose delete via preload helper; store empty instead
      gaia.storeCredential('gaia', 'token', '');
    }
  } catch (e) {
    // ignore
  }
  localStorage.removeItem('gaia_token');
}

/**
 * Verifica se o usuário está autenticado
 */
export function isAuthenticated(): boolean {
  return getToken() !== null;
}

