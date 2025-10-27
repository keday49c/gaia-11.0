import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertCircle } from 'lucide-react';
import {
  isPasswordSet,
  saveEncryptedPassword,
  validatePassword,
} from '@/lib/crypto';

interface LoginProps {
  onLoginSuccess: () => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const [isSettingPassword, setIsSettingPassword] = useState(!isPasswordSet());
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validações básicas
    if (!password) {
      setError('Senha não pode estar vazia');
      return;
    }

    if (password.length < 20) {
      setError('Senha deve ter no mínimo 20 caracteres');
      return;
    }

    if (password !== confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    // Salva a senha criptografada
    saveEncryptedPassword(password);
    setIsSettingPassword(false);
    setPassword('');
    setConfirmPassword('');
    setEmail('');
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Verifica credenciais de admin
    if (email === 'admin' && password === 'senha123') {
      // Admin login - será tratado no App.tsx
      localStorage.setItem('gaia_admin', 'true');
      onLoginSuccess();
      return;
    }

    // Valida senha regular
    if (!validatePassword(password)) {
      setError('Senha incorreta');
      return;
    }

    onLoginSuccess();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#001F3F] to-[#2ECC40] flex flex-col items-center justify-center p-4">
      {/* Alert Bar */}
      {error && (
        <div className="fixed top-0 left-0 right-0 bg-[#FF4136] text-white px-4 py-3 flex items-center gap-2">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* Logo */}
      <div className="mb-8">
        <img
          src="./logo.png"
          alt="Gaia Logo"
          className="w-32 h-32 object-contain"
        />
      </div>

      {/* Form Container */}
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
        {isSettingPassword ? (
          <>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              Defina sua senha pessoal
            </h1>
            <p className="text-gray-600 mb-6 text-sm">
              Crie uma senha forte com no mínimo 20 caracteres. Ela será
              criptografada com AES-256 e armazenada localmente.
            </p>

            <form onSubmit={handleSetPassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Senha
                </label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mínimo 20 caracteres"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                  >
                    {showPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {password.length}/20 caracteres
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirmar Senha
                </label>
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repita a senha"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                Definir Senha
              </Button>
            </form>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-gray-800 mb-6">
              Login - Gaia
            </h1>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  E-mail
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Senha
                </label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Digite sua senha"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                  >
                    {showPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                Entrar
              </Button>
            </form>
          </>
        )}
      </div>

      {/* Footer */}
      <p className="text-white text-sm mt-8 text-center">
        Gaia - Automação de Marketing Digital
      </p>
    </div>
  );
}

