import { Circle } from 'lucide-react';
import { useOllamaStatus } from '../../hooks/useOllamaStatus';

export const OllamaStatus = () => {
  const { isOnline } = useOllamaStatus();

  return (
    <div className="flex items-center space-x-2 text-sm">
      <div className="flex items-center space-x-1">
        <Circle 
          className={`w-2 h-2 fill-current ${isOnline ? 'text-green-500' : 'text-red-500'}`}
        />
        <span className={isOnline ? 'text-green-400' : 'text-red-400'}>
          Ollama AI
        </span>
      </div>
    </div>
  );
};