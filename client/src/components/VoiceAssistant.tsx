import { useState, useRef } from 'react';
import { Mic, Volume2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface VoiceAssistantProps {
  onCommand?: (command: string) => void;
}

export default function VoiceAssistant({ onCommand }: VoiceAssistantProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Inicializar Web Speech API
  const initSpeechRecognition = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Seu navegador não suporta reconhecimento de voz');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'pt-BR';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
      setTranscript('');
    };

    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          setTranscript(transcript);
          handleVoiceCommand(transcript);
        } else {
          interimTranscript += transcript;
        }
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Erro no reconhecimento de voz:', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
  };

  const startListening = () => {
    if (!recognitionRef.current) {
      initSpeechRecognition();
    }
    recognitionRef.current?.start();
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setIsListening(false);
  };

  const handleVoiceCommand = async (command: string) => {
    console.log('Comando recebido:', command);

    // Processar comando
    let response = '';

    if (command.toLowerCase().includes('cpc')) {
      response = 'Seu CPC médio é de 2 reais e 50 centavos';
    } else if (command.toLowerCase().includes('campanha')) {
      response = 'Você tem 5 campanhas ativas gerando 150 reais por dia';
    } else if (command.toLowerCase().includes('relatório') || command.toLowerCase().includes('relatorio')) {
      response = 'Suas campanhas estão performando 25% melhor que a semana passada';
    } else if (command.toLowerCase().includes('disparar')) {
      response = 'Vou disparar uma nova campanha para você';
    } else {
      response = 'Desculpe, não entendi o comando. Tente perguntar sobre CPC, campanhas ou relatórios';
    }

    setResponse(response);
    speakResponse(response);

    if (onCommand) {
      onCommand(command);
    }
  };

  const speakResponse = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'pt-BR';
    utterance.rate = 0.9;
    utterance.pitch = 1.2;
    utterance.volume = 1;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-lg font-bold text-gray-800 mb-4">Assistente de Voz</h3>

      <div className="space-y-4">
        {/* Controles de Voz */}
        <div className="flex gap-2">
          <Button
            onClick={startListening}
            disabled={isListening}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2"
          >
            <Mic size={20} />
            {isListening ? 'Escutando...' : 'Iniciar Voz'}
          </Button>
          <Button
            onClick={stopListening}
            disabled={!isListening}
            variant="outline"
            className="flex-1"
          >
            Parar
          </Button>
        </div>

        {/* Transcrição */}
        {transcript && (
          <div className="p-3 bg-blue-50 rounded border border-blue-200">
            <p className="text-sm text-gray-600 mb-1">Você disse:</p>
            <p className="text-gray-800 font-medium">{transcript}</p>
          </div>
        )}

        {/* Resposta */}
        {response && (
          <div className="p-3 bg-green-50 rounded border border-green-200">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Resposta:</p>
                <p className="text-gray-800 font-medium">{response}</p>
              </div>
              <Button
                onClick={() => speakResponse(response)}
                disabled={isSpeaking}
                size="sm"
                variant="outline"
                className="flex items-center gap-2"
              >
                {isSpeaking ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Falando...
                  </>
                ) : (
                  <>
                    <Volume2 size={16} />
                    Ouvir
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Dicas */}
        <div className="p-3 bg-gray-50 rounded">
          <p className="text-xs font-semibold text-gray-700 mb-2">Comandos disponíveis:</p>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>• "Mostra CPC" - Ver custo por clique</li>
            <li>• "Minhas campanhas" - Listar campanhas ativas</li>
            <li>• "Relatório" - Ver performance</li>
            <li>• "Disparar campanha" - Criar nova campanha</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

