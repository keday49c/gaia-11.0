import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, Eye, EyeOff, Copy, Check } from 'lucide-react';
import { API_URL, getToken } from '@/lib/api';
import { useTheme } from '@/contexts/ThemeContext';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('keys');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});

  // Chaves de API
  const [keys, setKeys] = useState({
    google_ads: '',
    google_ads_customer_id: '',
    instagram: '',
    whatsapp: '',
    openai: '',
    openai_alt: '',
    gemini: '',
    gemini_alt: '',
    meta: '',
  });


  // Chaves de teste
  const [testKeys, setTestKeys] = useState({
    google_ads: '',
    instagram: '',
    whatsapp: '',
  });

  // Validação de chaves
  const [validateResults, setValidateResults] = useState<Record<string, { ok: boolean; message: string }>|null>(null);
  const [validating, setValidating] = useState(false);

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
          google_ads_customer_id: data.data.chaves.google_ads_customer_id || '',
          instagram: data.data.chaves.instagram || '',
          whatsapp: data.data.chaves.whatsapp || '',
          openai: data.data.chaves.openai || '',
          openai_alt: data.data.chaves.openai_alt || '',
          gemini: data.data.chaves.gemini || '',
          gemini_alt: data.data.chaves.gemini_alt || '',
          meta: data.data.chaves.meta || '',
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
          google_ads_customer_id: keys.google_ads_customer_id,
          instagram_token: keys.instagram,
          whatsapp_token: keys.whatsapp,
          openai_key: keys.openai,
          openai_key_alt: keys.openai_alt,
          gemini_key: keys.gemini,
          gemini_key_alt: keys.gemini_alt,
          meta_key: keys.meta,
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

  const handleValidateKeys = async () => {
    try {
      setValidating(true);
      setValidateResults(null);
      const token = getToken();
      const response = await fetch(`${API_URL}/keys/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          google_ads_key: keys.google_ads,
          google_ads_customer_id: keys.google_ads_customer_id,
          instagram_token: keys.instagram,
          whatsapp_token: keys.whatsapp,
          openai_key: keys.openai,
          openai_key_alt: keys.openai_alt,
          gemini_key: keys.gemini,
          gemini_key_alt: keys.gemini_alt,
          meta_key: keys.meta,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setValidateResults(data.data || null);
      } else {
        alert('❌ Erro ao validar chaves');
      }
    } catch (error) {
      console.error('Erro ao validar chaves:', error);
      alert('❌ Erro ao conectar com o servidor');
    } finally {
      setValidating(false);
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

  const { theme, setTheme } = useTheme();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Configurações</h1>
          <p className="text-gray-600">Gerencie suas chaves de API e integração</p>
        </div>

        {/* Appearance */}
        <Card className="p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Aparência</h3>
              <p className="text-sm text-gray-500">Escolha o tema da interface</p>
            </div>
            <div className="flex gap-2">
              <Button variant={theme === 'light' ? 'default' : 'outline'} onClick={() => setTheme?.('light')}>Light</Button>
              <Button variant={theme === 'dark' ? 'default' : 'outline'} onClick={() => setTheme?.('dark')}>Dark</Button>
              <Button variant={theme === 'luxury' ? 'default' : 'outline'} onClick={() => setTheme?.('luxury')}>Dark Luxury</Button>
            </div>
          </div>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="keys">Minhas Chaves</TabsTrigger>
            <TabsTrigger value="test">Chaves de Teste</TabsTrigger>
            <TabsTrigger value="docs">Documentação</TabsTrigger>
            <TabsTrigger value="admin">Admin</TabsTrigger>
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

              <div className="space-y-3 mt-3">
                <label className="block text-sm font-semibold text-gray-900">
                  🆔 Google Ads Customer ID
                </label>
                <Input
                  placeholder="Insira seu Customer ID (ex: 1234567890)"
                  value={keys.google_ads_customer_id}
                  onChange={e => setKeys({ ...keys, google_ads_customer_id: e.target.value })}
                  className="flex-1"
                />
                <p className="text-xs text-gray-500">Usado para criar campanhas reais no Google Ads</p>
              </div>
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

            {/* OpenAI */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-900">
                🤖 OpenAI API Key
              </label>
              <div className="flex gap-2">
                <Input
                  type={showPasswords['openai'] ? 'text' : 'password'}
                  placeholder="Insira sua chave OpenAI"
                  value={keys.openai}
                  onChange={e => setKeys({ ...keys, openai: e.target.value })}
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => toggleShowPassword('openai')}
                >
                  {showPasswords['openai'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
              <p className="text-xs text-gray-500">Usado para análises com IA (OpenAI)</p>
            </div>

            {/* OpenAI Alt */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-900">
                🤖 OpenAI API Key (Alternativa)
              </label>
              <div className="flex gap-2">
                <Input
                  type={showPasswords['openai_alt'] ? 'text' : 'password'}
                  placeholder="Chave OpenAI alternativa (opcional)"
                  value={keys.openai_alt}
                  onChange={e => setKeys({ ...keys, openai_alt: e.target.value })}
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => toggleShowPassword('openai_alt')}
                >
                  {showPasswords['openai_alt'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
              <p className="text-xs text-gray-500">Chave alternativa para fallback de IA</p>
            </div>

            {/* Gemini */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-900">
                🧠 Gemini API Key
              </label>
              <div className="flex gap-2">
                <Input
                  type={showPasswords['gemini'] ? 'text' : 'password'}
                  placeholder="Insira sua chave Gemini / Google Generative"
                  value={keys.gemini}
                  onChange={e => setKeys({ ...keys, gemini: e.target.value })}
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => toggleShowPassword('gemini')}
                >
                  {showPasswords['gemini'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
              <p className="text-xs text-gray-500">Usado para análises com Gemini (Google Generative)</p>
            </div>

            {/* Gemini Alt */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-900">
                🧠 Gemini API Key (Alternativa)
              </label>
              <div className="flex gap-2">
                <Input
                  type={showPasswords['gemini_alt'] ? 'text' : 'password'}
                  placeholder="Chave Gemini alternativa (opcional)"
                  value={keys.gemini_alt}
                  onChange={e => setKeys({ ...keys, gemini_alt: e.target.value })}
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => toggleShowPassword('gemini_alt')}
                >
                  {showPasswords['gemini_alt'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
              <p className="text-xs text-gray-500">Chave alternativa para fallback de Gemini</p>
            </div>

            {/* Meta (Facebook / Instagram / WhatsApp) */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-900">
                🌐 Meta (Facebook / Instagram / WhatsApp) API Key
              </label>
              <div className="flex gap-2">
                <Input
                  type={showPasswords['meta'] ? 'text' : 'password'}
                  placeholder="Insira sua chave Meta (Graph API)"
                  value={keys.meta}
                  onChange={e => setKeys({ ...keys, meta: e.target.value })}
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => toggleShowPassword('meta')}
                >
                  {showPasswords['meta'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
              <p className="text-xs text-gray-500">Usado para autenticar chamadas ao Graph API da Meta</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={handleSaveKeys}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 text-lg font-semibold"
              >
                {loading ? '⏳ Salvando...' : '💾 Salvar Chaves'}
              </Button>

              <Button
                onClick={handleValidateKeys}
                disabled={validating}
                variant="outline"
                className="w-full py-4 text-lg font-semibold"
              >
                {validating ? '⏳ Validando...' : '🔎 Validar Chaves'}
              </Button>
            </div>

            {validateResults && (
              <div className="mt-4 p-4 bg-white border rounded">
                <h4 className="font-semibold mb-2">Resultados da Validação</h4>
                <div className="space-y-2 text-sm">
                  {Object.entries(validateResults).map(([k, v]) => (
                    <div key={k} className="flex items-center justify-between">
                      <div className="capitalize">{k.replace('_', ' ')}</div>
                      <div className={`font-mono ${v.ok ? 'text-green-600' : 'text-red-600'}`}>{v.ok ? 'OK' : 'FAIL'} - {v.message}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
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

          <TabsContent value="admin" className="space-y-6">
            <Card className="p-6 border-2 border-yellow-200 bg-yellow-50">
              <div className="flex items-start gap-3 mb-4">
                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-yellow-900">Administração</h3>
                  <p className="text-sm text-yellow-700 mt-1">Ferramentas de teste e operação</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <label className="font-medium">Modo Dry-Run</label>
                  <input id="dryrun" type="checkbox" className="ml-2" onChange={async (e) => {
                    const enabled = e.currentTarget.checked;
                    const token = getToken();
                    await fetch(`${API_URL}/admin/dry-run`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ enabled }) });
                    appendLogClient('Modo Dry-Run definido: ' + enabled);
                    alert(enabled ? 'Dry-Run ativado' : 'Dry-Run desativado');
                  }} />
                  <Button variant="outline" onClick={async () => {
                    const token = getToken();
                    const res = await fetch(`${API_URL}/admin/dry-run`, { headers: { Authorization: `Bearer ${token}` } });
                    const data = await res.json();
                    if (data.success) {
                      (document.getElementById('dryrun') as HTMLInputElement).checked = !!data.enabled;
                      alert('Dry-Run: ' + (data.enabled ? 'ATIVADO' : 'DESATIVADO'));
                    }
                  }}>Ver Status</Button>
                </div>

                <div>
                  <label className="font-medium">Logs de Ações</label>
                  <div className="mt-2 bg-white p-3 border rounded max-h-48 overflow-auto" id="logs-view">
                    <div id="logs-placeholder" className="text-sm text-gray-600">Carregue os logs abaixo</div>
                  </div>
                  <div className="mt-2 flex gap-2">
                    <Button onClick={async () => {
                      const token = getToken();
                      const res = await fetch(`${API_URL}/admin/logs`, { headers: { Authorization: `Bearer ${token}` } });
                      const data = await res.json();
                      if (data.success) {
                        const container = document.getElementById('logs-view');
                        if (container) container.innerHTML = '<pre class="text-xs text-gray-700">' + data.data.join('\n') + '</pre>';
                      } else alert('Erro ao carregar logs');
                    }}>Carregar Logs</Button>
                    <Button onClick={async () => {
                      const token = getToken();
                      const res = await fetch(`${API_URL}/admin/logs/export`, { headers: { Authorization: `Bearer ${token}` } });
                      if (res.ok) {
                        const txt = await res.text();
                        const blob = new Blob([txt], { type: 'text/plain' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = 'gaia-actions.log';
                        a.click();
                        URL.revokeObjectURL(url);
                      } else alert('No logs to export');
                    }}>Exportar</Button>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

        </Tabs>
      </div>
    </div>
  );
}

function appendLogClient(msg: string) {
  try {
    const token = getToken();
    navigator.sendBeacon(`${API_URL}/admin/logs`, JSON.stringify({ msg }));
  } catch (e) {
    // ignore
  }
}

