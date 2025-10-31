import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Eye, MousePointer } from 'lucide-react';

interface Metric {
  plataforma: string;
  impressoes: number;
  cliques: number;
  conversoes: number;
  custo: number;
  receita: number;
}

interface ReportProps {
  campaignId?: string;
}

export default function Reports({ campaignId }: ReportProps) {
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    
    const loadMetricsIfMounted = async () => {
      if (!isMounted) return;
      await loadMetrics();
    };
    
    loadMetricsIfMounted();
    const interval = setInterval(loadMetricsIfMounted, 5000);
    
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [campaignId]);

  const loadMetrics = async () => {
    try {
      const token = localStorage.getItem('gaia_token');
      if (!campaignId) return;

      const response = await fetch(`http://localhost:3001/campaigns/${campaignId}/metricas`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      if (data.success && data.data && data.data.length > 0) {
        setMetrics(data.data);
        setLoading(false);
      }
    } catch (err) {
      console.error('Erro ao carregar métricas:', err);
      setLoading(false);
    }
  };

  const totalMetrics = metrics.reduce(
    (acc, m) => ({
      impressoes: acc.impressoes + m.impressoes,
      cliques: acc.cliques + m.cliques,
      conversoes: acc.conversoes + m.conversoes,
      custo: acc.custo + m.custo,
      receita: acc.receita + m.receita,
    }),
    { impressoes: 0, cliques: 0, conversoes: 0, custo: 0, receita: 0 }
  );

  const cpc = totalMetrics.cliques > 0 ? (totalMetrics.custo / totalMetrics.cliques).toFixed(2) : '0';
  const ctr =
    totalMetrics.impressoes > 0
      ? ((totalMetrics.cliques / totalMetrics.impressoes) * 100).toFixed(2)
      : '0';
  const roas = totalMetrics.custo > 0 ? (totalMetrics.receita / totalMetrics.custo).toFixed(2) : '0';

  const KPICard = ({
    icon: Icon,
    label,
    value,
    trend,
  }: {
    icon: any;
    label: string;
    value: string;
    trend?: number;
  }) => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{label}</p>
          <p className="text-3xl font-bold text-gray-800 mt-2">{value}</p>
          {trend !== undefined && (
            <p className={`text-sm mt-2 ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {trend >= 0 ? <TrendingUp className="inline" size={16} /> : <TrendingDown className="inline" size={16} />}{' '}
              {Math.abs(trend)}%
            </p>
          )}
        </div>
        <Icon size={32} className="text-blue-600" />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#001F3F] to-[#2ECC40] p-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Relatório de Campanhas</h1>

        {loading ? (
          <div className="text-center text-white">Carregando métricas...</div>
        ) : (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
              <KPICard
                icon={Eye}
                label="Impressões"
                value={totalMetrics.impressoes.toLocaleString()}
                trend={12}
              />
              <KPICard
                icon={MousePointer}
                label="Cliques"
                value={totalMetrics.cliques.toLocaleString()}
                trend={8}
              />
              <KPICard
                icon={DollarSign}
                label="Custo"
                value={`R$ ${totalMetrics.custo.toFixed(2)}`}
                trend={-5}
              />
              <KPICard
                icon={TrendingUp}
                label="Conversões"
                value={totalMetrics.conversoes.toLocaleString()}
                trend={15}
              />
              <KPICard
                icon={DollarSign}
                label="Receita"
                value={`R$ ${totalMetrics.receita.toFixed(2)}`}
                trend={20}
              />
            </div>

            {/* Métricas Detalhadas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-600 text-sm font-medium">CPC (Custo por Clique)</p>
                <p className="text-3xl font-bold text-gray-800 mt-2">R$ {cpc}</p>
                <p className="text-xs text-gray-500 mt-2">Custo médio por clique</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-600 text-sm font-medium">CTR (Taxa de Clique)</p>
                <p className="text-3xl font-bold text-gray-800 mt-2">{ctr}%</p>
                <p className="text-xs text-gray-500 mt-2">Cliques / Impressões</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-600 text-sm font-medium">ROAS (Retorno sobre Gasto)</p>
                <p className="text-3xl font-bold text-gray-800 mt-2">{roas}x</p>
                <p className="text-xs text-gray-500 mt-2">Receita / Custo</p>
              </div>
            </div>

            {/* Gráfico de Barras Tailwind */}
            <div className="bg-white rounded-lg shadow p-6 mb-8">
              <h2 className="text-xl font-bold text-gray-800 mb-6">Performance por Plataforma</h2>
              <div className="space-y-6">
                {metrics.map((metric) => {
                  const maxValue = Math.max(...metrics.map((m) => m.impressoes));
                  const percentage = (metric.impressoes / maxValue) * 100;

                  return (
                    <div key={metric.plataforma}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700 capitalize">
                          {metric.plataforma}
                        </span>
                        <span className="text-sm text-gray-600">{metric.impressoes.toLocaleString()} impressões</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <div className="grid grid-cols-4 gap-2 mt-2 text-xs text-gray-600">
                        <span>Cliques: {metric.cliques}</span>
                        <span>Conversões: {metric.conversoes}</span>
                        <span>Custo: R$ {metric.custo.toFixed(2)}</span>
                        <span>Receita: R$ {metric.receita.toFixed(2)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Tabela de Métricas */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-100 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Plataforma</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Impressões</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Cliques</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Conversões</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Custo</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Receita</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {metrics.map((metric) => (
                    <tr key={metric.plataforma} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-800 capitalize">{metric.plataforma}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{metric.impressoes.toLocaleString()}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{metric.cliques.toLocaleString()}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{metric.conversoes.toLocaleString()}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">R$ {metric.custo.toFixed(2)}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">R$ {metric.receita.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

