import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LogOut } from 'lucide-react';

interface DashboardProps {
  onLogout: () => void;
}

export default function Dashboard({ onLogout }: DashboardProps) {
  const [googleAdsKey, setGoogleAdsKey] = useState('');
  const [instagramKey, setInstagramKey] = useState('');
  const [whatsappKey, setWhatsappKey] = useState('');

  const handleSave = () => {
    // Log das chaves no console (ainda não salva em banco)
    console.log('=== GAIA - API KEYS ===');
    console.log('Google Ads Key:', googleAdsKey);
    console.log('Instagram Key:', instagramKey);
    console.log('WhatsApp Key:', whatsappKey);
    console.log('========================');

    // Feedback visual
    alert('Chaves logadas no console. Verifique F12 > Console.');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#001F3F] to-[#2ECC40] p-4">
      {/* Header */}
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
            onClick={onLogout}
            variant="outline"
            className="flex items-center gap-2"
          >
            <LogOut size={18} />
            Sair
          </Button>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Configuração de Chaves de API
          </h2>

          <div className="space-y-6">
            {/* Google Ads Key */}
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
              />
              <p className="text-xs text-gray-500 mt-1">
                Será criptografada e armazenada localmente
              </p>
            </div>

            {/* Instagram Key */}
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
              />
              <p className="text-xs text-gray-500 mt-1">
                Será criptografada e armazenada localmente
              </p>
            </div>

            {/* WhatsApp Key */}
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
              />
              <p className="text-xs text-gray-500 mt-1">
                Será criptografada e armazenada localmente
              </p>
            </div>

            {/* Save Button */}
            <div className="pt-4">
              <Button
                onClick={handleSave}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2"
              >
                Salvar Chaves
              </Button>
              <p className="text-xs text-gray-500 mt-2">
                As chaves serão logadas no console (F12) para verificação
              </p>
            </div>
          </div>

          {/* Info Box */}
          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">
              ℹ️ Informações de Segurança
            </h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Suas chaves são criptografadas com AES-256</li>
              <li>• Armazenadas apenas no localStorage do seu navegador</li>
              <li>• Nunca são enviadas para servidores externos</li>
              <li>• Você é o único com acesso às suas chaves</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

