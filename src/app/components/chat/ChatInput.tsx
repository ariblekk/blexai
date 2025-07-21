import { Send, RefreshCw, AlertTriangle } from 'lucide-react';
import { useOllamaStatus } from '../../hooks/useOllamaStatus';

interface ChatInputProps {
  inputText: string;
  setInputText: (text: string) => void;
  onSendMessage: () => void;
  isTyping: boolean;
}

export const ChatInput = ({ inputText, setInputText, onSendMessage, isTyping }: ChatInputProps) => {
  const { isOnline, error, checkOllamaStatus, isChecking } = useOllamaStatus();
  
  // Dapat mengirim pesan jika Ollama online atau sedang mengetik
  const canSendMessage = isOnline || isTyping;
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isTyping && canSendMessage) {
        onSendMessage();
      }
    }
  };
  
  const getPlaceholderText = () => {
    return "Tanyakan sesuatu...";
  };
  
  const getStatusColor = () => {
    if (!isOnline) return 'border-red-700 focus:ring-red-500';
    return 'border-zinc-700 focus:ring-blue-500';
  };
  
  return (
    <div className="border-t border-zinc-800 p-4 md:p-6 bg-zinc-900 sticky bottom-0">
      {!isOnline && (
        <div className="max-w-3xl mx-auto mb-2 p-2 bg-red-900/50 text-red-200 rounded-md text-sm flex justify-between items-center">
          <div className="flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-red-300" />
            <span>Server Ollama tidak tersedia. Silakan pastikan server Ollama berjalan.</span>
          </div>
          <button 
            onClick={checkOllamaStatus}
            disabled={isChecking}
            className={`p-1.5 rounded-md ${isChecking ? 'bg-zinc-700 text-zinc-400' : 'bg-red-700 hover:bg-red-600 text-white'}`}
            title="Periksa ulang koneksi"
          >
            <RefreshCw className={`w-4 h-4 ${isChecking ? 'animate-spin' : ''}`} />
          </button>
        </div>
      )}
      <div className="max-w-3xl mx-auto">
        <div className="relative flex items-center">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={getPlaceholderText()}
            className={`flex-1 px-4 py-2 pr-14 bg-zinc-800 border rounded-xl resize-none focus:outline-none focus:ring-2 focus:border-transparent text-white placeholder-zinc-400 min-h-[36px] max-h-[100px] ${getStatusColor()}`}
            disabled={isTyping || !isOnline}
            style={{
              fontSize: '16px',
              WebkitAppearance: 'none',
              WebkitTapHighlightColor: 'transparent'
            }}
          />
          
          <button
            onClick={onSendMessage}
            disabled={isTyping || !inputText.trim() || !canSendMessage}
            className={`absolute right-2 p-2 rounded-lg transition-all duration-200 ${
              inputText.trim() && !isTyping && canSendMessage
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-zinc-700 text-zinc-400 cursor-not-allowed'
            }`}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};