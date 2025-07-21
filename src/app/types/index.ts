export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  provider?: string;
  fallback?: boolean;
  isError?: boolean;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  lastUpdated: Date;
  sessionType?: 'guest' | 'user';
  guestId?: string;
}

export interface SessionInfo {
  isGuest: boolean;
  sessionId: string;
  storageKey: string;
}

// Tambahan interface untuk model
export interface AIModel {
  name: string;
  size: string;
  digest: string;
  modified_at: string;
  details?: {
    format: string;
    family: string;
    families: string[];
    parameter_size: string;
    quantization_level: string;
  };
}

export interface ModelResponse {
  models: AIModel[];
}

export interface PullModelRequest {
  name: string;
  stream?: boolean;
}

export interface PullModelResponse {
  status: string;
  digest?: string;
  total?: number;
  completed?: number;
}