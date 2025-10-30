import { useState } from 'react';
import { Lock, Mail, Eye, EyeOff, ArrowRight } from 'lucide-react';

export default function LoginRedesigned() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<'login' | 'setup'>('setup');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulação de login
    setTimeout(() => {
      setIsLoading(false);
      // Redirecionar para dashboard
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0e27] via-[#001F3F] to-[#0f1729] flex items-center justify-center p-4">
      {/* Background decorativo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-red-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse"></div>
      </div>

      {/* Container principal */}
      <div className="relative z-10 w-full max-w-md">
        {/* Logo e titulo */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-red-600 rounded-2xl flex items-center justify-center gaia-animate-float">
              <ArrowRight className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-purple-300 bg-clip-text text-transparent mb-2">
            Gaia 10.0
          </h1>
          <p className="text-gray-400">Automação Total de Vendas Digitais</p>
        </div>

        {/* Card principal */}
        <div className="gaia-card mb-6">
          {mode === 'setup' ? (
            // Modo Setup - Defina sua senha
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Bem-vindo ao Gaia</h2>
              <p className="text-gray-400 mb-6">Defina sua senha pessoal para começar</p>

              <form onSubmit={handleLogin} className="space-y-4">
                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    E-mail
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-5 h-5 text-purple-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seu@email.com"
                      className="gaia-input pl-10"
                      required
                    />
                  </div>
                </div>

                {/* Senha */}
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Senha (mínimo 20 caracteres)
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-5 h-5 text-purple-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••••••••••"
                      className="gaia-input pl-10 pr-10"
                      minLength={20}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-purple-400 hover:text-purple-300"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Sua senha será criptografada com AES-256
                  </p>
                </div>

                {/* Botão */}
                <button
                  type="submit"
                  disabled={isLoading || password.length < 20}
                  className="gaia-btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Criando...
                    </>
                  ) : (
                    <>
                      Continuar
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Link para login */}
              <p className="text-center text-gray-400 text-sm mt-4">
                Já tem uma conta?{' '}
                <button
                  onClick={() => setMode('login')}
                  className="text-purple-400 hover:text-purple-300 font-semibold"
                >
                  Faça login
                </button>
              </p>
            </div>
          ) : (
            // Modo Login
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Bem-vindo de volta</h2>
              <p className="text-gray-400 mb-6">Acesse sua conta Gaia</p>

              <form onSubmit={handleLogin} className="space-y-4">
                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    E-mail
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-5 h-5 text-purple-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seu@email.com"
                      className="gaia-input pl-10"
                      required
                    />
                  </div>
                </div>

                {/* Senha */}
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Senha
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-5 h-5 text-purple-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••••••••••"
                      className="gaia-input pl-10 pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-purple-400 hover:text-purple-300"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Botão */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="gaia-btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Entrando...
                    </>
                  ) : (
                    <>
                      Entrar
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Link para setup */}
              <p className="text-center text-gray-400 text-sm mt-4">
                Não tem uma conta?{' '}
                <button
                  onClick={() => setMode('setup')}
                  className="text-purple-400 hover:text-purple-300 font-semibold"
                >
                  Crie uma
                </button>
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-gray-500 text-xs">
          Sua segurança é nossa prioridade. Criptografia AES-256 em todos os dados.
        </p>
      </div>
    </div>
  );
}

