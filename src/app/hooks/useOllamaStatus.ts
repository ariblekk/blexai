import { useState, useEffect } from 'react';

export const useOllamaStatus = () => {
  const [isOnline, setIsOnline] = useState<boolean>(false);
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const checkOllamaStatus = async () => {
    try {
      setIsChecking(true);
      setError(null);
      
      const response = await fetch('http://localhost:11434/api/tags', {
        method: 'GET',
        signal: AbortSignal.timeout(5000),
      });
      
      setIsOnline(response.ok);
      if (!response.ok) {
        throw new Error(`Ollama server tidak tersedia: ${response.status}`);
      }
    } catch (error) {
      setIsOnline(false);
      setError(error instanceof Error ? error.message : 'Gagal memeriksa status Ollama');
      console.error('Error checking Ollama status:', error);
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    checkOllamaStatus();
    
    // Periksa status Ollama setiap 30 detik
    const intervalId = setInterval(checkOllamaStatus, 30000);
    
    return () => clearInterval(intervalId);
  }, []);

  return {
    isOnline,
    isChecking,
    error,
    checkOllamaStatus
  };
};