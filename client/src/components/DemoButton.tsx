import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Play, Volume2 } from 'lucide-react';

/**
 * Componente: Botão Modo Demo
 * Roda campanha falsa do início ao fim com voz
 */
export default function DemoButton() {
  const [isRunning, setIsRunning] = useState(false);
  const [demoStatus, setDemoStatus] = useState<string | null>(null);

  const startDemoMode = async () => {
    setIsRunning(true);
    setDemoStatus('Iniciando modo demo...');

    try {
      // Passo 1: Falar
      setDemoStatus('🎤 Gaia, tudo bem?');
      await speakText('Tudo certo, pronto pra disparar');
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Passo 2: Criar campanha
      setDemoStatus('📊 Criando campanha falsa...');
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Passo 3: Disparar
      setDemoStatus('🚀 Disparando em todas as plataformas...');
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Passo 4: Simular vendas
      setDemoStatus('💰 Simulando vendas...');
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Passo 5: Gerar relatório
      setDemoStatus('📈 Gerando relatório...');
      const demoReport = {
        impressoes: Math.floor(Math.random() * 2000) + 500,
        cliques: Math.floor(Math.random() * 100) + 20,
        conversoes: Math.floor(Math.random() * 20) + 3,
        receita: Math.floor(Math.random() * 5000) + 500,
      };
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Passo 6: Responder com voz
      setDemoStatus('🎤 Respondendo...');
      const message = `Campanha disparada com sucesso! ${demoReport.impressoes} impressões, ${demoReport.cliques} cliques, ${demoReport.conversoes} vendas, receita de ${demoReport.receita} reais.`;
      await speakText(message);

      setDemoStatus(`✅ Demo concluído! ${demoReport.conversoes} vendas, R$ ${demoReport.receita}`);
    } catch (error) {
      console.error('Erro no modo demo:', error);
      setDemoStatus('❌ Erro ao executar demo');
    } finally {
      setIsRunning(false);
      setTimeout(() => setDemoStatus(null), 5000);
    }
  };

  const speakText = (text: string): Promise<void> => {
    return new Promise((resolve) => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'pt-BR';
      utterance.rate = 0.9;
      utterance.pitch = 1.2;
      utterance.volume = 1;

      utterance.onend = () => resolve();
      utterance.onerror = () => resolve();

      window.speechSynthesis.speak(utterance);
    });
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {demoStatus && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg shadow-lg max-w-xs">
          <p className="text-sm text-blue-900 font-medium">{demoStatus}</p>
        </div>
      )}

      <Button
        onClick={startDemoMode}
        disabled={isRunning}
        className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
        title="Clique para rodar uma campanha demo completa com voz"
      >
        {isRunning ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Demo em andamento...
          </>
        ) : (
          <>
            <Play className="w-4 h-4" />
            <Volume2 className="w-4 h-4" />
            Modo Demo
          </>
        )}
      </Button>

      <p className="text-xs text-gray-500 mt-2 text-center">
        Clique para treinar sem gastar
      </p>
    </div>
  );
}

