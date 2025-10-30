import { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  Users,
  DollarSign,
  Settings,
  LogOut,
  Plus,
  Search,
  Bell,
  Menu,
  X,
  Zap,
  Eye,
  EyeOff,
} from 'lucide-react';

export default function DashboardRedesigned() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showKeys, setShowKeys] = useState(false);
  const [googleAdsKey, setGoogleAdsKey] = useState('');
  const [instagramKey, setInstagramKey] = useState('');
  const [whatsappKey, setWhatsappKey] = useState('');

  const stats = [
    {
      title: 'Campanhas Ativas',
      value: '12',
      change: '+3 esta semana',
      icon: Zap,
      color: 'from-purple-600 to-purple-400',
    },
    {
      title: 'Impressões',
      value: '45.2K',
      change: '+12% vs semana passada',
      icon: TrendingUp,
      color: 'from-blue-600 to-blue-400',
    },
    {
      title: 'Conversões',
      value: '1,234',
      change: '+8% vs semana passada',
      icon: Users,
      color: 'from-green-600 to-green-400',
    },
    {
      title: 'Gasto Total',
      value: 'R$ 2,450',
      change: '-5% vs semana passada',
      icon: DollarSign,
      color: 'from-red-600 to-red-400',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0e27] via-[#001F3F] to-[#0f1729]">
      {/* Header */}
      <header className="bg-opacity-50 bg-gray-900 backdrop-blur-xl border-b border-purple-500 border-opacity-20 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden text-purple-400 hover:text-purple-300"
            >
              {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-purple-300 bg-clip-text text-transparent">
              Gaia 10.0
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center bg-gray-800 bg-opacity-50 rounded-lg px-4 py-2 border border-purple-500 border-opacity-20">
              <Search className="w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar campanhas..."
                className="bg-transparent ml-2 text-white placeholder-gray-500 outline-none w-48"
              />
            </div>

            <button className="relative p-2 text-gray-400 hover:text-purple-400 transition">
              <Bell className="w-6 h-6" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            <button className="p-2 text-gray-400 hover:text-purple-400 transition">
              <Settings className="w-6 h-6" />
            </button>

            <button className="p-2 text-gray-400 hover:text-red-400 transition">
              <LogOut className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`${
            sidebarOpen ? 'w-64' : 'w-0'
          } bg-opacity-50 bg-gray-900 backdrop-blur-xl border-r border-purple-500 border-opacity-20 transition-all duration-300 overflow-hidden lg:w-64`}
        >
          <nav className="p-6 space-y-2">
            <NavItem icon={BarChart3} label="Dashboard" active />
            <NavItem icon={Zap} label="Campanhas" />
            <NavItem icon={TrendingUp} label="Relatórios" />
            <NavItem icon={Settings} label="Configurações" />
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <StatCard key={index} {...stat} />
            ))}
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Campanhas */}
            <div className="lg:col-span-2">
              <div className="gaia-card">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">Campanhas Recentes</h2>
                  <button className="gaia-btn-primary flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Nova Campanha
                  </button>
                </div>

                {/* Campaign List */}
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="bg-gray-800 bg-opacity-50 rounded-lg p-4 border border-purple-500 border-opacity-10 hover:border-opacity-30 transition"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-white">Campanha #{i}</h3>
                        <span className="gaia-badge gaia-badge-primary">Ativa</span>
                      </div>
                      <p className="text-gray-400 text-sm mb-3">
                        Campanha de marketing digital com foco em conversão
                      </p>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Impressões</p>
                          <p className="text-white font-semibold">15.2K</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Cliques</p>
                          <p className="text-white font-semibold">342</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Conversões</p>
                          <p className="text-white font-semibold">45</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* API Keys */}
            <div>
              <div className="gaia-card">
                <h2 className="text-2xl font-bold text-white mb-6">Suas Chaves de API</h2>

                <div className="space-y-4">
                  {/* Google Ads */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">
                      Google Ads
                    </label>
                    <div className="relative">
                      <input
                        type={showKeys ? 'text' : 'password'}
                        value={googleAdsKey}
                        onChange={(e) => setGoogleAdsKey(e.target.value)}
                        placeholder="Cole sua chave aqui"
                        className="gaia-input pr-10"
                      />
                      <button
                        onClick={() => setShowKeys(!showKeys)}
                        className="absolute right-3 top-3 text-purple-400"
                      >
                        {showKeys ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Instagram */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">
                      Instagram
                    </label>
                    <div className="relative">
                      <input
                        type={showKeys ? 'text' : 'password'}
                        value={instagramKey}
                        onChange={(e) => setInstagramKey(e.target.value)}
                        placeholder="Cole sua chave aqui"
                        className="gaia-input pr-10"
                      />
                      <button
                        onClick={() => setShowKeys(!showKeys)}
                        className="absolute right-3 top-3 text-purple-400"
                      >
                        {showKeys ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* WhatsApp */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">
                      WhatsApp Business
                    </label>
                    <div className="relative">
                      <input
                        type={showKeys ? 'text' : 'password'}
                        value={whatsappKey}
                        onChange={(e) => setWhatsappKey(e.target.value)}
                        placeholder="Cole sua chave aqui"
                        className="gaia-input pr-10"
                      />
                      <button
                        onClick={() => setShowKeys(!showKeys)}
                        className="absolute right-3 top-3 text-purple-400"
                      >
                        {showKeys ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <button className="gaia-btn-primary w-full mt-6">Salvar Chaves</button>

                <p className="text-xs text-gray-500 mt-4 text-center">
                  Suas chaves são criptografadas com AES-256
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function StatCard({ title, value, change, icon: Icon, color }: any) {
  return (
    <div className="gaia-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-gray-400 text-sm font-semibold">{title}</h3>
        <div className={`p-3 rounded-lg bg-gradient-to-br ${color} text-white`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <p className="text-3xl font-bold text-white mb-2">{value}</p>
      <p className="text-xs text-gray-400">{change}</p>
    </div>
  );
}

function NavItem({ icon: Icon, label, active = false }: any) {
  return (
    <button
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
        active
          ? 'bg-purple-600 bg-opacity-20 text-purple-300 border border-purple-500 border-opacity-30'
          : 'text-gray-400 hover:text-purple-300 hover:bg-purple-600 hover:bg-opacity-10'
      }`}
    >
      <Icon className="w-5 h-5" />
      <span className="font-medium">{label}</span>
    </button>
  );
}

