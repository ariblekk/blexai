import { useState } from 'react';
import { RefreshCw, Bot, AlertCircle, Search } from 'lucide-react';
import { useModelManager } from '../../hooks/useModelManager';
import { AIModel } from '../../types';

interface ModelManagerProps {
  onModelSelect?: (modelName: string) => void;
}

export const ModelManager = ({ onModelSelect }: ModelManagerProps) => {
  const {
    models,
    isLoading,
    error,
    selectedModel,
    setSelectedModel,
    fetchModels,
  } = useModelManager();
  
  const [searchQuery, setSearchQuery] = useState('');

  const handleModelSelect = (modelName: string) => {
    setSelectedModel(modelName);
    onModelSelect?.(modelName);
  };

  const filteredModels = models.filter(model => 
    model.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Bot className="w-5 h-5 text-blue-400" />
          <h3 className="text-lg font-semibold text-white">OpenRouter Models</h3>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={fetchModels}
            disabled={isLoading}
            className="p-2 text-zinc-400 hover:text-white transition-colors disabled:opacity-50"
            title="Refresh Models"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari model..."
          className="w-full pl-9 pr-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:border-blue-500"
        />
      </div>

      {/* Error Display */}
      {error && (
        <div className="flex items-center space-x-2 p-3 bg-red-900/50 border border-red-700 rounded-lg text-red-200">
          <AlertCircle className="w-4 h-4" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {/* Models List */}
      <div className="space-y-2 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
        {isLoading && models.length === 0 ? (
          <div className="flex items-center justify-center p-8 text-zinc-400">
            <RefreshCw className="w-5 h-5 animate-spin mr-2" />
            <span>Loading models...</span>
          </div>
        ) : filteredModels.length === 0 ? (
          <div className="text-center p-8 text-zinc-400">
            <Bot className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>Tidak ada model yang ditemukan</p>
          </div>
        ) : (
          filteredModels.map((model) => (
            <div
              key={model.name}
              className={`p-3 border rounded-lg cursor-pointer transition-all ${
                selectedModel === model.name
                  ? 'bg-blue-900/30 border-blue-600'
                  : 'bg-zinc-800/50 border-zinc-700 hover:border-zinc-600'
              }`}
              onClick={() => handleModelSelect(model.name)}
            >
              <div className="flex flex-col">
                <div className="flex items-center space-x-2">
                  <h4 className="font-medium text-white truncate text-sm">{model.name}</h4>
                  {selectedModel === model.name && (
                    <span className="px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full whitespace-nowrap">
                      Active
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};