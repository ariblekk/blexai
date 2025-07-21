import { MessageSquare } from 'lucide-react';

interface WelcomeScreenProps {
  onSampleClick: (text: string) => void;
}

export const WelcomeScreen = ({ onSampleClick }: WelcomeScreenProps) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 bg-zinc-800 rounded-2xl flex items-center justify-center mb-6 mx-auto">
          <MessageSquare className="w-8 h-8 text-zinc-400" />
        </div>
        <h2 className="text-2xl font-semibold mb-2">Welcome to Blex AI</h2>
        <p className="text-zinc-400 mb-8">Mulai percakapan dengan Blex AI, InsyaAllah jawabannya gak ngaco.</p>
        
        <div className="grid grid-cols-1 gap-3">
          <button 
            onClick={() => onSampleClick("Halo, apa yang bisa kamu bantu?")}
            className="p-4 bg-zinc-900 hover:bg-zinc-800 rounded-xl text-left transition-colors border border-zinc-800"
          >
            <div className="font-medium mb-1">Mulai Chat</div>
            <div className="text-sm text-zinc-400">Halo, apa yang bisa kamu bantu?</div>
          </button>
          
          <button 
            onClick={() => onSampleClick("Jelaskan tentang dirimu")}
            className="p-4 bg-zinc-900 hover:bg-zinc-800 rounded-xl text-left transition-colors border border-zinc-800"
          >
            <div className="font-medium mb-1">Tentang AI</div>
            <div className="text-sm text-zinc-400">Jelaskan tentang dirimu</div>
          </button>
        </div>
      </div>
    </div>
  );
};