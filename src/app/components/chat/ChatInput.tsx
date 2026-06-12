import { Send } from 'lucide-react';

interface ChatInputProps {
  inputText: string;
  setInputText: (text: string) => void;
  onSendMessage: () => void;
  isTyping: boolean;
}

export const ChatInput = ({ inputText, setInputText, onSendMessage, isTyping }: ChatInputProps) => {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isTyping) {
        onSendMessage();
      }
    }
  };
  
  const getPlaceholderText = () => {
    return "Tanyakan sesuatu...";
  };
  
  return (
    <div className="border-t border-zinc-800 p-4 md:p-4 bg-zinc-900 sticky bottom-0">
      <div className="max-w-3xl mx-auto">
        <div className="relative flex items-center">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={getPlaceholderText()}
            className={`flex-1 px-2 py-2 pr-14 bg-zinc-800 border rounded-xl resize-none focus:outline-none focus:ring-2 focus:border-transparent text-white placeholder-zinc-400 min-h-[36px] max-h-[100px] border-zinc-700 focus:ring-blue-500`}
            disabled={isTyping}
            style={{
              fontSize: '16px',
              WebkitAppearance: 'none',
              WebkitTapHighlightColor: 'transparent'
            }}
          />
          
          <button
            onClick={onSendMessage}
            disabled={isTyping || !inputText.trim()}
            className={`absolute right-2 p-2 rounded-lg transition-all duration-200 ${
              inputText.trim() && !isTyping
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-zinc-700 text-zinc-400 cursor-not-allowed'
            }`}
          >
            <Send className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};