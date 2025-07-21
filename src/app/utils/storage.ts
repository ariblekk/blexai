import { ChatSession } from '../types';
import { getGuestId, isGuestSession } from './guestSession';

// Check if we're in browser environment
const isBrowser = typeof window !== 'undefined';

// Get storage key based on user type
const getStorageKey = (): string => {
  if (!isBrowser) return 'chatSessions_ssr';
  
  if (isGuestSession()) {
    const guestId = getGuestId();
    return `chatSessions_${guestId}`;
  }
  // For logged users, use userId from localStorage
  const userId = localStorage.getItem('userId') || 'default';
  return `chatSessions_${userId}`;
};

export const saveChatSessions = (sessions: ChatSession[]) => {
  if (!isBrowser || sessions.length === 0) return;
  
  const storageKey = getStorageKey();
  localStorage.setItem(storageKey, JSON.stringify(sessions));
};

export const loadChatSessions = (): ChatSession[] => {
  if (!isBrowser) return [];
  
  const storageKey = getStorageKey();
  const savedSessions = localStorage.getItem(storageKey);
  if (savedSessions) {
    try {
      return JSON.parse(savedSessions).map((session: any) => ({
        ...session,
        lastUpdated: new Date(session.lastUpdated),
        messages: session.messages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }))
      }));
    } catch (error) {
      console.error('Error parsing chat sessions:', error);
      return [];
    }
  }
  return [];
};

// Clear all guest sessions (for cleanup)
export const clearAllGuestSessions = () => {
  if (!isBrowser) return;
  
  const keys = Object.keys(localStorage);
  keys.forEach(key => {
    if (key.startsWith('chatSessions_guest_')) {
      localStorage.removeItem(key);
    }
  });
};

// Get session info
export const getSessionInfo = () => {
  if (!isBrowser) {
    return {
      isGuest: true,
      sessionId: 'ssr',
      storageKey: 'chatSessions_ssr'
    };
  }
  
  const isGuest = isGuestSession();
  const sessionId = isGuest ? getGuestId() : localStorage.getItem('userId') || 'default';
  return {
    isGuest,
    sessionId,
    storageKey: getStorageKey()
  };
};