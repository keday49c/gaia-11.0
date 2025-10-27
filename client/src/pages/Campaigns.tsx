import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Zap, TrendingUp, Loader2 } from 'lucide-react';

interface Campaign {
  id: string;
  titulo: string;
  orcamento: number;
  status: string;
  plataformas: any;
  criado_em: string;
}

export default function Campaigns() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    orcamento: '',
    texto: '',
    cidades: '',
    idade_min: '',
    idade_max: '',
    interesses: '',
  });

  useEffect(() => {
    loadCampaigns();
  }, []);

  const loadCampaigns = async () => {
    try {
      const token = localStorage.getItem('gaia_token');
      const response = await fetch('http://localhost:3001/campaigns/lista', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setCampaigns(data.data || []);
      }
    } catch (err) {
      console.error('Erro ao carregar campanhas:', err);
    }
  };

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('gaia_token');
      const publico = {
        cidades: formData.cidades.split(',').map((c) => c.trim()),
        idade_min: parseInt(formData.idade_min),
        idade_max: parseInt(formData.idade_max),
        interesses: formData.interesses.split(',').map((i) => i.trim()),
      };

      const response = await fetch('http://localhost:3001/campaigns/criar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          titulo: formData.titulo,
          descricao: formData.descricao,
          orcamento: parseFloat(formData.orcamento),
          texto: formData.texto,
          publico,
        }),
      });

      const data = await response.json();
      if (data.success) {
        alert('Campanha criada com sucesso!');
        setFormData({
          titulo: '',
          descricao: '',
          orcamento: '',
          texto: '',
          cidades: '',
          idade_min: '',
          idade_max: '',
          interesses: '',
        });
        setShowForm(false);
        loadCampaigns();
      }
    } catch (err) {
      alert('Erro ao criar campanha');
    } finally {
      setLoading(false);
    }
  };

  const handleDispararCampanha = async (campaignId: string) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('gaia_token');
      const response = await fetch('http://localhost:3001/campaigns/disparar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          campaign_id: campaignId,
          plataformas: {
            instagram: true,
            google_ads: true,
            tiktok: true,
            whatsapp: true,
          },
        }),
      });

      const data = await response.json();
      if (data.success) {
        alert('Campanha disparada com sucesso!');
        loadCampaigns();
      }
    } catch (err) {
      alert('Erro ao disparar campanha');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#001F3F] to-[#2ECC40] p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-white">Campanhas</h1>
          <Button
            onClick={() => setShowForm(!showForm)}
            className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
          >
            <Plus size={20} />
            Nova Campanha
          </Button>
        </div>

        {showForm && (
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Criar Nova Campanha</h2>
            <form onSubmit={handleCreateCampaign} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                  <Input
                    value={formData.titulo}
                    onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                    placeholder="Ex: Black Friday 2025"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Orçamento (R$)</label>
                  <Input
                    type="number"
                    value={formData.orcamento}
                    onChange={(e) => setFormData({ ...formData, orcamento: e.target.value })}
                    placeholder="1000"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                <Input
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  placeholder="Descrição da campanha"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Texto do Anúncio</label>
                <textarea
                  value={formData.texto}
                  onChange={(e) => setFormData({ ...formData, texto: e.target.value })}
                  placeholder="Texto principal do anúncio"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cidades (separadas por vírgula)</label>
                  <Input
                    value={formData.cidades}
                    onChange={(e) => setFormData({ ...formData, cidades: e.target.value })}
                    placeholder="São Paulo, Rio de Janeiro"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Interesses (separados por vírgula)</label>
                  <Input
                    value={formData.interesses}
                    onChange={(e) => setFormData({ ...formData, interesses: e.target.value })}
                    placeholder="tecnologia, marketing"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Idade Mínima</label>
                  <Input
                    type="number"
                    value={formData.idade_min}
                    onChange={(e) => setFormData({ ...formData, idade_min: e.target.value })}
                    placeholder="18"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Idade Máxima</label>
                  <Input
                    type="number"
                    value={formData.idade_max}
                    onChange={(e) => setFormData({ ...formData, idade_max: e.target.value })}
                    placeholder="65"
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <Button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2"
                  disabled={loading}
                >
                  {loading && <Loader2 size={18} className="animate-spin" />}
                  {loading ? 'Criando...' : 'Criar Campanha'}
                </Button>
                <Button
                  type="button"
                  onClick={() => setShowForm(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {campaigns.map((campaign) => (
            <div key={campaign.id} className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-800">{campaign.titulo}</h3>
                  <p className="text-sm text-gray-500">
                    Criado em {new Date(campaign.criado_em).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    campaign.status === 'ativo'
                      ? 'bg-green-100 text-green-800'
                      : campaign.status === 'pausada'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {campaign.status}
                </span>
              </div>

              <div className="mb-4 p-3 bg-gray-50 rounded">
                <p className="text-sm text-gray-600">
                  <strong>Orçamento:</strong> R$ {campaign.orcamento.toFixed(2)}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  <strong>Plataformas:</strong>{' '}
                  {Object.keys(campaign.plataformas || {})
                    .filter((k) => campaign.plataformas[k])
                    .join(', ') || 'Nenhuma'}
                </p>
              </div>

              <div className="flex gap-2">
                {campaign.status === 'rascunho' && (
                  <Button
                    onClick={() => handleDispararCampanha(campaign.id)}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white flex items-center justify-center gap-2"
                    disabled={loading}
                  >
                    <Zap size={18} />
                    Disparar
                  </Button>
                )}
                <Button
                  onClick={() => {
                    window.location.href = `/relatorio/${campaign.id}`;
                  }}
                  variant="outline"
                  className="flex-1 flex items-center justify-center gap-2"
                >
                  <TrendingUp size={18} />
                  Relatório
                </Button>
              </div>
            </div>
          ))}
        </div>

        {campaigns.length === 0 && !showForm && (
          <div className="text-center py-12">
            <p className="text-white text-lg">Nenhuma campanha criada ainda</p>
            <p className="text-white text-sm opacity-75">Clique em "Nova Campanha" para começar</p>
          </div>
        )}
      </div>
    </div>
  );
}

