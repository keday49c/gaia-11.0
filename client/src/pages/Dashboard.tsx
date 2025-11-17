import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LogOut, Loader2 } from 'lucide-react';
import { saveApiKeys, getMyData, removeToken } from '@/lib/api';

interface DashboardProps {
  onLogout: () => void;
}

export default function Dashboard({ onLogout }: DashboardProps) {
  const [googleAdsKey, setGoogleAdsKey] = useState('');
  const [instagramKey, setInstagramKey] = useState('');
  const [whatsappKey, setWhatsappKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;
    
    const loadUserDataIfMounted = async () => {
      if (!isMounted) return;
      await loadUserData();
    };
    
    loadUserDataIfMounted();
    
    return () => {
      isMounted = false;
    };
  }, []);

  const loadUserData = async () => {
    try {
      const response = await getMyData();
      if (response && response.success && response.data) {
        setUserData(response.data);
        if (response.data.chaves) {
          setGoogleAdsKey(response.data.chaves.google_ads || '');
          setInstagramKey(response.data.chaves.instagram || '');
          setWhatsappKey(response.data.chaves.whatsapp || '');
        }
      }
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
    }
  };

  const handleSave = async () => {
    setError('');
    setLoading(true);

    try {
      // Modo visitante permite salvar sem chaves (para teste)
      // Em produção, você pode exigir pelo menos uma chave

      const response = await saveApiKeys(googleAdsKey, instagramKey, whatsappKey);

      if (!response.success) {
        setError(response.message || 'Erro ao salvar chaves');
        setLoading(false);
        return;
      }

      console.log('=== GAIA - API KEYS SALVAS ===');
      console.log('Google Ads Key:', googleAdsKey);
      console.log('Instagram Key:', instagramKey);
      console.log('WhatsApp Key:', whatsappKey);
      console.log('Timestamp:', new Date().toISOString());
      console.log('================================');

      await loadUserData();
      setLoading(false);
      alert('Chaves salvas com sucesso!');
    } catch (err) {
      setError('Erro ao salvar chaves. Tente novamente.');
      setLoading(false);
    }
  };

  const handleLogout = () => {
    removeToken();
    onLogout();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#001F3F] to-[#2ECC40] p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <img
              src="./logo.png"
              alt="Gaia Logo"
              className="w-12 h-12 object-contain"
            />
            <h1 className="text-3xl font-bold text-white">Gaia Dashboard</h1>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="flex items-center gap-2"
          >
            <LogOut size={18} />
            Sair
          </Button>
        </div>

        {error && (
          <div className="mb-6 bg-[#FF4136] text-white px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Configuracao de Chaves de API
          </h2>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chave Google Ads
              </label>
              <Input
                type="password"
                value={googleAdsKey}
                onChange={(e) => setGoogleAdsKey(e.target.value)}
                placeholder="Cole sua chave de API do Google Ads"
                className="w-full"
                disabled={loading}
              />
              <p className="text-xs text-gray-500 mt-1">
                Sera criptografada e armazenada com seguranca
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chave Instagram
              </label>
              <Input
                type="password"
                value={instagramKey}
                onChange={(e) => setInstagramKey(e.target.value)}
                placeholder="Cole sua chave de API do Instagram"
                className="w-full"
                disabled={loading}
              />
              <p className="text-xs text-gray-500 mt-1">
                Sera criptografada e armazenada com seguranca
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chave WhatsApp
              </label>
              <Input
                type="password"
                value={whatsappKey}
                onChange={(e) => setWhatsappKey(e.target.value)}
                placeholder="Cole sua chave de API do WhatsApp"
                className="w-full"
                disabled={loading}
              />
              <p className="text-xs text-gray-500 mt-1">
                Sera criptografada e armazenada com seguranca
              </p>
            </div>

            <div className="pt-4">
              <Button
                onClick={handleSave}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 flex items-center justify-center gap-2"
                disabled={loading}
              >
                {loading && <Loader2 size={18} className="animate-spin" />}
                {loading ? 'Salvando...' : 'Salvar Chaves'}
              </Button>
              <p className="text-xs text-gray-500 mt-2">
                As chaves serao criptografadas com AES-256 no backend
              </p>
            </div>
          </div>

          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">
              Info Informacoes de Seguranca
            </h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Suas chaves sao criptografadas com AES-256 no backend</li>
              <li>• Armazenadas com seguranca no banco de dados PostgreSQL</li>
              <li>• Acessadas apenas com seu JWT valido</li>
              <li>• Todos os acessos sao registrados em logs</li>
              <li>• Rate limiting protege contra ataques de forca bruta</li>
            </ul>
          </div>

          {userData && (
            <div className="mt-8 p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-3">Seus Dados</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600 font-semibold">E-mail</p>
                  <p className="text-gray-800">{userData.usuario?.email}</p>
                </div>
                <div>
                  <p className="text-gray-600 font-semibold">ID</p>
                  <p className="text-gray-800 font-mono text-xs">
                    {userData.usuario?.id?.substring(0, 8)}...
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 font-semibold">Criado em</p>
                  <p className="text-gray-800 text-xs">
                    {new Date(userData.usuario?.criadoEm).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 font-semibold">Acessos Recentes</p>
                  <p className="text-gray-800">{userData.logs?.length || 0}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
