import { useState, useEffect } from 'react';
import { AIModel, ModelResponse } from '../types';

export const useModelManager = () => {
  const [models, setModels] = useState<AIModel[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<string>('google/gemini-2.0-flash-lite-preview-02-05:free');

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
  };
};