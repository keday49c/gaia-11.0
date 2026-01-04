import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';
import { saveToken } from '@/lib/api';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';

export default function Welcome({ onLogin, onHideWelcome }: { onLogin?: () => void; onHideWelcome?: () => void }) {
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState<'guest' | 'login' | null>(null);

  const handleGuestAccess = async () => {
    setLoading('guest');
    try {
      const response = await fetch(
        `/api/auth/guest`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        }
      );

      const data = await response.json();

      if (data.success && data.data?.token) {
        saveToken(data.data.token);
        try { localStorage.setItem('gaia_isGuest', 'true'); } catch(e) {}
        // Notifica o App que houve login (atualiza estado global local)
        if (onLogin) onLogin();
        try { localStorage.setItem('gaia_welcome_shown', 'true'); } catch(e){}
        if (onHideWelcome) onHideWelcome();
        // Redirecionar para a rota principal (Dashboard está em `/`)
        setLocation('/');
      } else {
        alert('Erro ao acessar modo visitante');
      }
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao conectar com o servidor');
    } finally {
      setLoading(null);
    }
  };

  const handleLoginReal = () => {
    setLoading('login');
    try { localStorage.setItem('gaia_welcome_shown', 'true'); localStorage.setItem('gaia_isGuest', 'false'); } catch(e){}
    if (onHideWelcome) onHideWelcome();
    // Redirecionar para página de login
    setLocation('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-green-500 to-teal-600 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Logo e Título */}
        <div className="text-center mb-12">
          <div className="inline-block mb-6">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-2xl">
              <div className="text-4xl font-bold bg-gradient-to-br from-blue-600 to-green-500 bg-clip-text text-transparent">
                Gaia
              </div>
            </div>
          </div>
          <h1 className="text-5xl font-bold text-white mb-4">
            Gaia 10.0
          </h1>
          <p className="text-xl text-white/90 mb-2">
            Plataforma de Automação de Marketing Digital
          </p>
          <p className="text-lg text-white/80">
            Gerencie suas campanhas com inteligência
          </p>
        </div>

        {/* Cards de Opção */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Card Visitante */}
          <div className="bg-white rounded-2xl shadow-2xl p-8 hover:shadow-3xl transition-shadow">
            <div className="mb-6">
              <div className="inline-block p-4 bg-green-100 rounded-full mb-4">
                <svg
                  className="w-8 h-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Modo Visitante
              </h2>
              <p className="text-gray-600 mb-4">
                Explore a plataforma sem criar uma conta. Veja todos os recursos em ação com dados de demonstração.
              </p>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-center text-gray-700">
                <span className="text-green-600 mr-3">✓</span>
                Acesso imediato ao dashboard
              </div>
              <div className="flex items-center text-gray-700">
                <span className="text-green-600 mr-3">✓</span>
                Visualizar campanhas de exemplo
              </div>
              <div className="flex items-center text-gray-700">
                <span className="text-green-600 mr-3">✓</span>
                Explorar relatórios e métricas
              </div>
              <div className="flex items-center text-gray-700">
                <span className="text-green-600 mr-3">✓</span>
                Sem necessidade de dados reais
              </div>
            </div>

            <Button
              onClick={handleGuestAccess}
              disabled={loading !== null}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-6 text-lg font-semibold rounded-lg transition-colors"
            >
              {loading === 'guest' ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Carregando...
                </>
              ) : (
                '🎭 Entrar como Visitante'
              )}
            </Button>
          </div>

          {/* Card Login Real */}
          <div className="bg-white rounded-2xl shadow-2xl p-8 hover:shadow-3xl transition-shadow border-2 border-blue-600">
            <div className="mb-6">
              <div className="inline-block p-4 bg-blue-100 rounded-full mb-4">
                <svg
                  className="w-8 h-8 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Login Real
              </h2>
              <p className="text-gray-600 mb-4">
                Crie sua conta ou faça login para acessar a plataforma completa com seus dados reais.
              </p>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-center text-gray-700">
                <span className="text-blue-600 mr-3">✓</span>
                Autenticação segura com JWT
              </div>
              <div className="flex items-center text-gray-700">
                <span className="text-blue-600 mr-3">✓</span>
                Salve suas chaves de API
              </div>
              <div className="flex items-center text-gray-700">
                <span className="text-blue-600 mr-3">✓</span>
                Gerencie campanhas reais
              </div>
              <div className="flex items-center text-gray-700">
                <span className="text-blue-600 mr-3">✓</span>
                Acesso persistente aos dados
              </div>
            </div>

            <Button
              onClick={handleLoginReal}
              disabled={loading !== null}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-lg font-semibold rounded-lg transition-colors"
            >
              {loading === 'login' ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Carregando...
                </>
              ) : (
                '🔐 Fazer Login'
              )}
            </Button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-white/80">
          <p className="text-sm">
            Powered by Manus • Gaia 10.0 • Automação de Marketing Digital
          </p>
        </div>
      </div>
    </div>
  );
}

