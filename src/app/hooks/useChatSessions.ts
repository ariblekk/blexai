import { useState, useEffect } from 'react';
import { ChatSession, Message } from '../types';
import { loadChatSessions, saveChatSessions, getSessionInfo } from '../utils/storage';
import { generateChatTitle } from '../utils/time';
import { getGuestId, isGuestSession, clearGuestSession } from '../utils/guestSession';

export const useChatSessions = () => {
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [sessionInfo, setSessionInfo] = useState(() => getSessionInfo());
  const [isClient, setIsClient] = useState(false);

  // Handle client-side hydration
  useEffect(() => {
    setIsClient(true);
    const sessions = loadChatSessions();
    setChatSessions(sessions);
    setSessionInfo(getSessionInfo());
  }, []);

  useEffect(() => {
    if (isClient) {
      saveChatSessions(chatSessions);
    }
  }, [chatSessions, isClient]);

  const saveCurrentChat = (messages: Message[]) => {
    if (messages.length === 0) return;

    const firstUserMessage = messages.find(msg => msg.sender === 'user');
    const title = firstUserMessage ? generateChatTitle(firstUserMessage.content) : 'New Chat';

    const chatSession: ChatSession = {
      id: currentChatId || Date.now().toString(),
      title,
      messages,
      lastUpdated: new Date(),
      sessionType: sessionInfo.isGuest ? 'guest' : 'user',
      guestId: sessionInfo.isGuest ? getGuestId() : undefined
    };

    setChatSessions(prev => {
      const existingIndex = prev.findIndex(session => session.id === chatSession.id);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = chatSession;
        return updated.sort((a, b) => b.lastUpdated.getTime() - a.lastUpdated.getTime());
      } else {
        return [chatSession, ...prev].sort((a, b) => b.lastUpdated.getTime() - a.lastUpdated.getTime());
      }
    });
  };

  const loadChatSession = (sessionId: string) => {
    const session = chatSessions.find(s => s.id === sessionId);
    if (session) {
      setCurrentChatId(sessionId);
      return session.messages;
    }
    return [];
  };

  const deleteChatSession = (sessionId: string) => {
    setChatSessions(prev => prev.filter(session => session.id !== sessionId));
    if (currentChatId === sessionId) {
      setCurrentChatId(null);
      return true;
    }
    return false;
  };

  // New function to start fresh guest session
  const startNewGuestSession = () => {
    if (!isClient) return;
    
    clearGuestSession();
    setChatSessions([]);
    setCurrentChatId(null);
    setSessionInfo(getSessionInfo());
  };

  return {
    chatSessions,
    currentChatId,
    sessionInfo,
    isClient,
    setCurrentChatId,
    saveCurrentChat,
    loadChatSession,
    deleteChatSession,
    startNewGuestSession
  };
};