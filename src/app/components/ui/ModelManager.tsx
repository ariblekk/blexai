import { useState } from 'react';
import { Plus, Download, Trash2, RefreshCw, Bot, AlertCircle, CheckCircle } from 'lucide-react';
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
    addModel,
    deleteModel,
  } = useModelManager();
  
  const [newModelName, setNewModelName] = useState('');
  const [isAddingModel, setIsAddingModel] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const handleAddModel = async () => {
    if (!newModelName.trim()) return;
    
    setIsAddingModel(true);
    const result = await addModel(newModelName.trim());
    
    if (result.success) {
      setNewModelName('');
      setShowAddForm(false);
      setNotification({ type: 'success', message: result.message || 'Model berhasil ditambahkan' });
    } else {
      setNotification({ type: 'error', message: result.error || 'Gagal menambahkan model' });
    }
    
    setIsAddingModel(false);
    
    // Auto hide notification after 5 seconds
    setTimeout(() => setNotification(null), 5000);
  };

  const handleDeleteModel = async (modelName: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus model "${modelName}"?`)) {
      return;
    }
    
    const result = await deleteModel(modelName);
    
    if (result.success) {
      setNotification({ type: 'success', message: result.message || 'Model berhasil dihapus' });
    } else {
      setNotification({ type: 'error', message: result.error || 'Gagal menghapus model' });
    }
    
    // Auto hide notification after 5 seconds
    setTimeout(() => setNotification(null), 5000);
  };

  const handleModelSelect = (modelName: string) => {
    setSelectedModel(modelName);
    onModelSelect?.(modelName);
  };

  const formatModelSize = (model: AIModel) => {
    if (model.size) {
      const sizeInGB = parseInt(model.size) / (1024 * 1024 * 1024);
      return `${sizeInGB.toFixed(1)} GB`;
    }
    return 'Unknown';
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Bot className="w-5 h-5 text-blue-400" />
          <h3 className="text-lg font-semibold text-white">Model Manager</h3>
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
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center space-x-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add Model</span>
          </button>
        </div>
      </div>

      {/* Notification */}
      {notification && (
        <div className={`flex items-center space-x-2 p-3 rounded-lg ${
          notification.type === 'success' 
            ? 'bg-green-900/50 border border-green-700 text-green-200'
            : 'bg-red-900/50 border border-red-700 text-red-200'
        }`}>
          {notification.type === 'success' ? (
            <CheckCircle className="w-4 h-4" />
          ) : (
            <AlertCircle className="w-4 h-4" />
          )}
          <span className="text-sm">{notification.message}</span>
        </div>
      )}

      {/* Add Model Form */}
      {showAddForm && (
        <div className="p-4 bg-zinc-800/50 border border-zinc-700 rounded-lg space-y-3">
          <h4 className="text-sm font-medium text-white">Tambah Model Baru</h4>
          <div className="flex space-x-2">
            <input
              type="text"
              value={newModelName}
              onChange={(e) => setNewModelName(e.target.value)}
              placeholder="Contoh: llama2, codellama:7b, mistral"
              className="flex-1 px-3 py-2 bg-zinc-900 border border-zinc-600 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:border-blue-500"
              disabled={isAddingModel}
            />
            <button
              onClick={handleAddModel}
              disabled={isAddingModel || !newModelName.trim()}
              className="flex items-center space-x-1 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-zinc-600 disabled:opacity-50 text-white rounded-lg transition-colors"
            >
              {isAddingModel ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              <span>{isAddingModel ? 'Downloading...' : 'Download'}</span>
            </button>
          </div>
          <p className="text-xs text-zinc-400">
            Model akan didownload dari Ollama registry. Proses ini mungkin membutuhkan waktu beberapa menit.
          </p>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="flex items-center space-x-2 p-3 bg-red-900/50 border border-red-700 rounded-lg text-red-200">
          <AlertCircle className="w-4 h-4" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {/* Models List */}
      <div className="space-y-2">
        {isLoading && models.length === 0 ? (
          <div className="flex items-center justify-center p-8 text-zinc-400">
            <RefreshCw className="w-5 h-5 animate-spin mr-2" />
            <span>Loading models...</span>
          </div>
        ) : models.length === 0 ? (
          <div className="text-center p-8 text-zinc-400">
            <Bot className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>Tidak ada model yang tersedia</p>
            <p className="text-sm">Tambahkan model pertama Anda</p>
          </div>
        ) : (
          models.map((model) => (
            <div
              key={model.name}
              className={`p-3 border rounded-lg cursor-pointer transition-all ${
                selectedModel === model.name
                  ? 'bg-blue-900/30 border-blue-600'
                  : 'bg-zinc-800/50 border-zinc-700 hover:border-zinc-600'
              }`}
              onClick={() => handleModelSelect(model.name)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h4 className="font-medium text-white">{model.name}</h4>
                    {selectedModel === model.name && (
                      <span className="px-2 py-1 bg-blue-600 text-white text-xs rounded-full">
                        Active
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-4 mt-1 text-sm text-zinc-400">
                    <span>Size: {formatModelSize(model)}</span>
                    {model.details?.parameter_size && (
                      <span>Params: {model.details.parameter_size}</span>
                    )}
                    {model.details?.quantization_level && (
                      <span>Quant: {model.details.quantization_level}</span>
                    )}
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteModel(model.name);
                  }}
                  className="p-2 text-zinc-400 hover:text-red-400 transition-colors"
                  title="Delete Model"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};