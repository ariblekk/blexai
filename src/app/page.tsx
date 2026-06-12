'use client';

import { useState } from 'react';
import { Message } from './types';
import { ChatArea } from './components/layout/ChatArea';
import { Sidebar } from './components/layout/Sidebar';
import { ChatInput } from './components/chat/ChatInput';
import { useChatSessions } from './hooks/useChatSessions';

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const {
    chatSessions,
    currentChatId,
    sessionInfo,
    isClient,
    setCurrentChatId,
    saveCurrentChat,
    loadChatSession,
    deleteChatSession,
    startNewGuestSession
  } = useChatSessions();

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputText,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputText;
    setInputText('');
    setIsTyping(true);

    if (!currentChatId) {
      setCurrentChatId(Date.now().toString());
    }

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: currentInput,
          model: 'openai/gpt-oss-120b:free' // Menggunakan model gratis OpenRouter
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.response,
        sender: 'ai',
        timestamp: new Date(),
        provider: data.provider,
        fallback: data.fallback
      };

      setMessages(prev => {
        const newMessages = [...prev, aiMessage];
        // Auto-save chat session
        setTimeout(() => {
          saveCurrentChat(newMessages);
        }, 100);
        return newMessages;
      });

    } catch (error) {
      console.error('Error:', error);

      let errorMessage: Message;

      // Periksa apakah error adalah response dari API
      if (error instanceof Error && error.message.includes('Kedua AI service')) {
        // Tampilkan pesan khusus untuk user ketika semua AI service tidak tersedia
        errorMessage = {
          id: (Date.now() + 1).toString(),
          content: 'Maaf, semua AI service sedang tidak tersedia. Silakan coba lagi nanti.',
          sender: 'ai',
          timestamp: new Date(),
          isError: true
        };
      } else {
        // Error umum lainnya
        errorMessage = {
          id: (Date.now() + 1).toString(),
          content: error instanceof Error ? error.message : 'Terjadi kesalahan saat mengirim pesan.',
          sender: 'ai',
          timestamp: new Date(),
          isError: true
        };
      }

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleNewChat = () => {
    if (messages.length > 0) {
      saveCurrentChat(messages);
    }
    setMessages([]);
    setCurrentChatId(null);
  };

  const handleLoadChat = (sessionId: string) => {
    const sessionMessages = loadChatSession(sessionId);
    setMessages(sessionMessages);
  };

  const handleDeleteChat = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteChatSession(sessionId);
    if (currentChatId === sessionId) {
      setMessages([]);
      setCurrentChatId(null);
    }
  };

  const handleNewGuestSession = () => {
    if (messages.length > 0) {
      saveCurrentChat(messages);
    }
    startNewGuestSession();
    setMessages([]);
  };

  const handleSampleClick = (text: string) => {
    setInputText(text);
  };

  const handleToggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  return (
    <div className="flex h-dvh bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 text-white relative">
      {/* Mobile Sidebar Overlay */}
      {isMobileSidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Desktop: Always visible, Mobile: Overlay */}
      <div className={`
        hidden md:block flex-shrink-0
        md:relative fixed inset-y-0 left-0 z-50 
        transform transition-transform duration-300 ease-in-out 
        ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }
      `}>
        <Sidebar
          chatSessions={chatSessions}
          currentChatId={currentChatId}
          onNewChat={handleNewChat}
          onLoadChat={handleLoadChat}
          onDeleteChat={handleDeleteChat}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          sessionInfo={sessionInfo}
          isClient={isClient}
          onMobileClose={() => setIsMobileSidebarOpen(false)}
        />
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileSidebarOpen && (
        <div className="md:hidden fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out translate-x-0">
          <Sidebar
            chatSessions={chatSessions}
            currentChatId={currentChatId}
            onNewChat={handleNewChat}
            onLoadChat={handleLoadChat}
            onDeleteChat={handleDeleteChat}
            isCollapsed={false}
            onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            sessionInfo={sessionInfo}
            isClient={isClient}
            onMobileClose={() => setIsMobileSidebarOpen(false)}
          />
        </div>
      )}

      <div className="flex-1 flex flex-col min-h-0 custom-scrollbar relative z-10">
        <ChatArea
          messages={messages}
          isTyping={isTyping}
          onSampleClick={handleSampleClick}
          onToggleSidebar={handleToggleMobileSidebar}
        />

        <ChatInput
          inputText={inputText}
          setInputText={setInputText}
          onSendMessage={handleSendMessage}
          isTyping={isTyping}
        />
      </div>
    </div>
  );
}
