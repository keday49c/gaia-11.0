/**
 * Serviço de API para comunicação com o backend Gaia
 */

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
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
  return apiRequest('/keys/salvar', {
    method: 'POST',
    body: JSON.stringify({
      google_ads,
      instagram,
      whatsapp,
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
 * Salva o token no localStorage
 */
export function saveToken(token: string): void {
  localStorage.setItem('gaia_token', token);
}

/**
 * Recupera o token do localStorage
 */
export function getToken(): string | null {
  return localStorage.getItem('gaia_token');
}

/**
 * Remove o token do localStorage
 */
export function removeToken(): void {
  localStorage.removeItem('gaia_token');
}

/**
 * Verifica se o usuário está autenticado
 */
export function isAuthenticated(): boolean {
  return getToken() !== null;
}

