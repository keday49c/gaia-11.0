import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, Trash2, Eye, EyeOff } from 'lucide-react';
import { clearAllData } from '@/lib/crypto';

interface AdminPanelProps {
  onLogout: () => void;
}

export default function AdminPanel({ onLogout }: AdminPanelProps) {
  const [showCode, setShowCode] = useState(false);
  const [showLogs, setShowLogs] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleDeleteAll = () => {
    if (confirmDelete) {
      clearAllData();
      alert('Todos os dados foram deletados do localStorage');
      setConfirmDelete(false);
      onLogout();
    } else {
      setConfirmDelete(true);
    }
  };

  const sampleCode = `// Exemplo de código do projeto Gaia
import { encryptAES256, decryptAES256 } from '@/lib/crypto';

const apiKey = 'sua-chave-api-aqui';
const encrypted = encryptAES256(apiKey, 'secret-key');
console.log('Encrypted:', encrypted);

const decrypted = decryptAES256(encrypted, 'secret-key');
console.log('Decrypted:', decrypted);`;

  const sampleLogs = [
    { timestamp: new Date().toISOString(), message: 'App initialized' },
    { timestamp: new Date().toISOString(), message: 'Admin panel accessed' },
    { timestamp: new Date().toISOString(), message: 'Password validation successful' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#001F3F] to-[#2ECC40] p-4">
      {/* Header */}
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">🔐 Admin Panel</h1>
            <p className="text-white text-sm mt-1">Modo oculto - Acesso restrito</p>
          </div>
          <Button
            onClick={onLogout}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            Sair
          </Button>
        </div>

        {/* Alert */}
        <div className="mb-6 bg-[#FF4136] text-white px-4 py-3 rounded-lg flex items-center gap-2">
          <AlertCircle size={20} />
          <span>Você está no modo admin. Use com cuidado!</span>
        </div>

        {/* Admin Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Code Viewer */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-800">Código</h2>
              <button
                onClick={() => setShowCode(!showCode)}
                className="text-gray-600 hover:text-gray-800"
              >
                {showCode ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {showCode && (
              <div className="bg-gray-900 text-green-400 p-4 rounded font-mono text-xs overflow-auto max-h-64">
                <pre>{sampleCode}</pre>
              </div>
            )}

            {!showCode && (
              <p className="text-gray-600 text-sm">
                Clique no ícone para visualizar código de exemplo
              </p>
            )}
          </div>

          {/* Logs Viewer */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-800">Logs</h2>
              <button
                onClick={() => setShowLogs(!showLogs)}
                className="text-gray-600 hover:text-gray-800"
              >
                {showLogs ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {showLogs && (
              <div className="bg-gray-900 text-blue-400 p-4 rounded font-mono text-xs overflow-auto max-h-64">
                {sampleLogs.map((log, idx) => (
                  <div key={idx} className="mb-2">
                    <span className="text-gray-500">[{log.timestamp}]</span>{' '}
                    {log.message}
                  </div>
                ))}
              </div>
            )}

            {!showLogs && (
              <p className="text-gray-600 text-sm">
                Clique no ícone para visualizar logs do sistema
              </p>
            )}
          </div>

          {/* Delete All */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">
              Deletar Tudo
            </h2>

            <Button
              onClick={handleDeleteAll}
              className={`w-full flex items-center justify-center gap-2 ${
                confirmDelete
                  ? 'bg-red-700 hover:bg-red-800'
                  : 'bg-red-600 hover:bg-red-700'
              } text-white`}
            >
              <Trash2 size={18} />
              {confirmDelete ? 'Confirmar Deleção' : 'Deletar Tudo'}
            </Button>

            {confirmDelete && (
              <p className="text-xs text-red-600 mt-2 text-center">
                ⚠️ Clique novamente para confirmar
              </p>
            )}

            <p className="text-gray-600 text-xs mt-3">
              Remove todos os dados do localStorage, incluindo senha e chaves de
              API
            </p>
          </div>
        </div>

        {/* System Info */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">
            Informações do Sistema
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-gray-600 font-semibold">Versão</p>
              <p className="text-gray-800">1.0.0</p>
            </div>
            <div>
              <p className="text-gray-600 font-semibold">Ambiente</p>
              <p className="text-gray-800">Development</p>
            </div>
            <div>
              <p className="text-gray-600 font-semibold">Storage</p>
              <p className="text-gray-800">localStorage</p>
            </div>
            <div>
              <p className="text-gray-600 font-semibold">Criptografia</p>
              <p className="text-gray-800">AES-256</p>
            </div>
          </div>

          <div className="mt-4 p-3 bg-gray-50 rounded border border-gray-200">
            <p className="text-xs text-gray-600">
              <strong>localStorage Keys:</strong>
            </p>
            <p className="text-xs text-gray-700 font-mono mt-1">
              {Object.keys(localStorage).join(', ') || 'Nenhuma chave'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

