import { useState, useEffect } from 'react';
import { AIModel, ModelResponse } from '../types';

export const useModelManager = () => {
  const [models, setModels] = useState<AIModel[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<string>('incept5/llama3.1-claude:latest');

  const fetchModels = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/models');
      if (!response.ok) {
        throw new Error('Gagal mengambil daftar model');
      }
      
      const data: ModelResponse = await response.json();
      setModels(data.models || []);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Terjadi kesalahan');
      setModels([]);
    } finally {
      setIsLoading(false);
    }
  };

  const addModel = async (modelName: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/models', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: modelName }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Gagal menambahkan model');
      }
      
      // Refresh daftar model setelah berhasil menambah
      await fetchModels();
      return { success: true, message: data.message };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const deleteModel = async (modelName: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(`/api/models?name=${encodeURIComponent(modelName)}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Gagal menghapus model');
      }
      
      // Refresh daftar model setelah berhasil menghapus
      await fetchModels();
      
      // Reset selected model jika model yang dihapus sedang dipilih
      if (selectedModel === modelName && models.length > 1) {
        const remainingModels = models.filter(m => m.name !== modelName);
        if (remainingModels.length > 0) {
          setSelectedModel(remainingModels[0].name);
        }
      }
      
      return { success: true, message: data.message };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchModels();
  }, []);

  return {
    models,
    isLoading,
    error,
    selectedModel,
    setSelectedModel,
    fetchModels,
    addModel,
    deleteModel,
  };
};