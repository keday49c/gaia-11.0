import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, Eye, EyeOff, Copy, Check } from 'lucide-react';
import { API_URL, getToken } from '@/lib/api';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('keys');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});

  // Chaves de API
  const [keys, setKeys] = useState({
    google_ads: '',
    instagram: '',
    whatsapp: '',
  });

  // Chaves de teste
  const [testKeys, setTestKeys] = useState({
    google_ads: '',
    instagram: '',
    whatsapp: '',
  });

  // Carregar dados ao montar
  useEffect(() => {
    loadKeys();
  }, []);

  const loadKeys = async () => {
    try {
      setLoading(true);
      const token = getToken();
      const response = await fetch(`${API_URL}/keys/meus-dados`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();

      if (data.success) {
        setKeys({
          google_ads: data.data.chaves.google_ads || '',
          instagram: data.data.chaves.instagram || '',
          whatsapp: data.data.chaves.whatsapp || '',
        });

        if (data.data.testKeys) {
          setTestKeys({
            google_ads: data.data.testKeys.google_ads.key || '',
            instagram: data.data.testKeys.instagram.token || '',
            whatsapp: data.data.testKeys.whatsapp.token || '',
          });
        }
      }
    } catch (error) {
      console.error('Erro ao carregar chaves:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveKeys = async () => {
    try {
      setLoading(true);
      const token = getToken();
      const response = await fetch(`${API_URL}/keys/salvar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          google_ads_key: keys.google_ads,
          instagram_token: keys.instagram,
          whatsapp_token: keys.whatsapp,
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert('✅ Chaves salvas com sucesso!');
      } else {
        alert('❌ Erro ao salvar chaves');
      }
    } catch (error) {
      console.error('Erro ao salvar:', error);
      alert('❌ Erro ao conectar com o servidor');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const toggleShowPassword = (key: string) => {
    setShowPasswords(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Configurações</h1>
          <p className="text-gray-600">Gerencie suas chaves de API e integração</p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="keys">Minhas Chaves</TabsTrigger>
            <TabsTrigger value="test">Chaves de Teste</TabsTrigger>
            <TabsTrigger value="docs">Documentação</TabsTrigger>
          </TabsList>

          {/* Tab: Minhas Chaves */}
          <TabsContent value="keys" className="space-y-6">
            <Card className="p-6 border-2 border-blue-200 bg-blue-50">
              <div className="flex items-start gap-3 mb-4">
                <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-blue-900">Suas Chaves Reais</h3>
                  <p className="text-sm text-blue-700 mt-1">
                    Adicione suas chaves de API reais aqui para fazer automação de verdade
                  </p>
                </div>
              </div>
            </Card>

            {/* Google Ads */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-900">
                🔑 Google Ads API Key
              </label>
              <div className="flex gap-2">
                <Input
                  type={showPasswords['google_ads'] ? 'text' : 'password'}
                  placeholder="Insira sua chave do Google Ads"
                  value={keys.google_ads}
                  onChange={e => setKeys({ ...keys, google_ads: e.target.value })}
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => toggleShowPassword('google_ads')}
                >
                  {showPasswords['google_ads'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
              <p className="text-xs text-gray-500">
                Obtenha em: https://console.cloud.google.com
              </p>
            </div>

            {/* Instagram */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-900">
                📱 Instagram Business Token
              </label>
              <div className="flex gap-2">
                <Input
                  type={showPasswords['instagram'] ? 'text' : 'password'}
                  placeholder="Insira seu token do Instagram"
                  value={keys.instagram}
                  onChange={e => setKeys({ ...keys, instagram: e.target.value })}
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => toggleShowPassword('instagram')}
                >
                  {showPasswords['instagram'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
              <p className="text-xs text-gray-500">
                Obtenha em: https://developers.facebook.com
              </p>
            </div>

            {/* WhatsApp */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-900">
                💬 WhatsApp Business API Key
              </label>
              <div className="flex gap-2">
                <Input
                  type={showPasswords['whatsapp'] ? 'text' : 'password'}
                  placeholder="Insira sua chave do WhatsApp"
                  value={keys.whatsapp}
                  onChange={e => setKeys({ ...keys, whatsapp: e.target.value })}
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => toggleShowPassword('whatsapp')}
                >
                  {showPasswords['whatsapp'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
              <p className="text-xs text-gray-500">
                Obtenha em: https://www.whatsapp.com/business/api
              </p>
            </div>

            <Button
              onClick={handleSaveKeys}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-lg font-semibold"
            >
              {loading ? '⏳ Salvando...' : '💾 Salvar Chaves'}
            </Button>
          </TabsContent>

          {/* Tab: Chaves de Teste */}
          <TabsContent value="test" className="space-y-6">
            <Card className="p-6 border-2 border-green-200 bg-green-50">
              <div className="flex items-start gap-3 mb-4">
                <AlertCircle className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-green-900">Chaves de Teste Disponíveis</h3>
                  <p className="text-sm text-green-700 mt-1">
                    Use essas chaves para testar o Gaia sem suas chaves reais
                  </p>
                </div>
              </div>
            </Card>

            {/* Google Ads Test */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-900">
                🔑 Google Ads (Teste)
              </label>
              <div className="flex gap-2">
                <Input
                  type="text"
                  value={testKeys.google_ads}
                  readOnly
                  className="flex-1 bg-gray-100"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleCopyToClipboard(testKeys.google_ads, 'google_ads_test')}
                >
                  {copied === 'google_ads_test' ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-gray-500">Clique para copiar</p>
            </div>

            {/* Instagram Test */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-900">
                📱 Instagram (Teste)
              </label>
              <div className="flex gap-2">
                <Input
                  type="text"
                  value={testKeys.instagram}
                  readOnly
                  className="flex-1 bg-gray-100"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleCopyToClipboard(testKeys.instagram, 'instagram_test')}
                >
                  {copied === 'instagram_test' ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-gray-500">Clique para copiar</p>
            </div>

            {/* WhatsApp Test */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-900">
                💬 WhatsApp (Teste)
              </label>
              <div className="flex gap-2">
                <Input
                  type="text"
                  value={testKeys.whatsapp}
                  readOnly
                  className="flex-1 bg-gray-100"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleCopyToClipboard(testKeys.whatsapp, 'whatsapp_test')}
                >
                  {copied === 'whatsapp_test' ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-gray-500">Clique para copiar</p>
            </div>
          </TabsContent>

          {/* Tab: Documentação */}
          <TabsContent value="docs" className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Como Obter Suas Chaves</h3>

              <div className="space-y-6">
                {/* Google Ads */}
                <div>
                  <h4 className="font-semibold text-blue-600 mb-2">🔑 Google Ads API</h4>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
                    <li>Acesse https://console.cloud.google.com</li>
                    <li>Crie um novo projeto</li>
                    <li>Ative a API do Google Ads</li>
                    <li>Crie credenciais (OAuth 2.0)</li>
                    <li>Copie a chave e cole aqui</li>
                  </ol>
                </div>

                {/* Instagram */}
                <div>
                  <h4 className="font-semibold text-pink-600 mb-2">📱 Instagram Business API</h4>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
                    <li>Acesse https://developers.facebook.com</li>
                    <li>Crie um aplicativo</li>
                    <li>Configure Instagram Graph API</li>
                    <li>Gere um token de acesso</li>
                    <li>Copie o token e cole aqui</li>
                  </ol>
                </div>

                {/* WhatsApp */}
                <div>
                  <h4 className="font-semibold text-green-600 mb-2">💬 WhatsApp Business API</h4>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
                    <li>Acesse https://www.whatsapp.com/business/api</li>
                    <li>Solicite acesso à API</li>
                    <li>Configure sua conta de negócios</li>
                    <li>Gere uma chave de API</li>
                    <li>Copie a chave e cole aqui</li>
                  </ol>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

