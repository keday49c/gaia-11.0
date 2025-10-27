import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Play, Trash2 } from 'lucide-react';

interface TestCampaign {
  id: string;
  titulo: string;
  orcamento: number;
  metricas_simuladas: any;
  criado_em: string;
}

export default function TestMode() {
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [testCampaigns, setTestCampaigns] = useState<TestCampaign[]>([]);
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    orcamento: '',
    texto: '',
  });
  const [resultado, setResultado] = useState<any>(null);

  const handleSimular = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('gaia_token');
      const response = await fetch('http://localhost:3001/test-mode/simular', {
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
        }),
      });

      const data = await response.json();
      if (data.success) {
        setResultado(data);
        setFormData({ titulo: '', descricao: '', orcamento: '', texto: '' });
        setShowForm(false);
        loadTestCampaigns();
      }
    } catch (err) {
      alert('Erro ao simular campanha');
    } finally {
      setLoading(false);
    }
  };

  const loadTestCampaigns = async () => {
    try {
      const token = localStorage.getItem('gaia_token');
      const response = await fetch('http://localhost:3001/test-mode/lista', {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      if (data.success) {
        setTestCampaigns(data.data || []);
      }
    } catch (err) {
      console.error('Erro ao carregar campanhas de teste:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Deletar esta campanha de teste?')) return;

    try {
      const token = localStorage.getItem('gaia_token');
      const response = await fetch(`http://localhost:3001/test-mode/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      if (data.success) {
        loadTestCampaigns();
      }
    } catch (err) {
      alert('Erro ao deletar campanha');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Modo Teste</h2>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
        >
          <Play size={18} />
          Simular Campanha
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleSimular} className="space-y-4 mb-6 p-4 bg-gray-50 rounded">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
              <Input
                value={formData.titulo}
                onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                placeholder="Ex: Teste Black Friday"
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
              placeholder="Descrição da campanha de teste"
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

          <div className="flex gap-2">
            <Button
              type="submit"
              className="flex-1 bg-green-600 hover:bg-green-700 text-white flex items-center justify-center gap-2"
              disabled={loading}
            >
              {loading && <Loader2 size={18} className="animate-spin" />}
              {loading ? 'Simulando...' : 'Simular'}
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
      )}

      {resultado && (
        <div className="mb-6 p-4 bg-green-50 rounded border border-green-200">
          <h3 className="font-bold text-green-800 mb-3">Resultado da Simulação</h3>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Impressões</p>
              <p className="text-lg font-bold text-green-700">{resultado.metricas.impressoes}</p>
            </div>
            <div>
              <p className="text-gray-600">Cliques</p>
              <p className="text-lg font-bold text-green-700">{resultado.metricas.cliques}</p>
            </div>
            <div>
              <p className="text-gray-600">Conversões</p>
              <p className="text-lg font-bold text-green-700">{resultado.metricas.conversoes}</p>
            </div>
            <div>
              <p className="text-gray-600">Custo</p>
              <p className="text-lg font-bold text-green-700">R$ {resultado.metricas.custo.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-gray-600">Receita</p>
              <p className="text-lg font-bold text-green-700">R$ {resultado.metricas.receita.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-gray-600">ROAS</p>
              <p className="text-lg font-bold text-green-700">{resultado.metricas.roas}x</p>
            </div>
          </div>
        </div>
      )}

      {testCampaigns.length > 0 && (
        <div>
          <h3 className="font-bold text-gray-800 mb-3">Campanhas de Teste Anteriores</h3>
          <div className="space-y-2">
            {testCampaigns.map((campaign) => (
              <div key={campaign.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div>
                  <p className="font-medium text-gray-800">{campaign.titulo}</p>
                  <p className="text-sm text-gray-500">
                    Orçamento: R$ {campaign.orcamento.toFixed(2)} • {new Date(campaign.criado_em).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <Button
                  onClick={() => handleDelete(campaign.id)}
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:bg-red-50"
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

