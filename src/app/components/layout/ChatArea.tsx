import { useEffect, useRef, useCallback } from 'react';
import { Message } from '../../types';
import { MessageBubble } from '../chat/MessageBubble';
import { WelcomeScreen } from '../chat/WelcomeScreen';
import { TypingIndicator } from '../ui/TypingIndicator';
import { Header } from './Header';

interface ChatAreaProps {
  messages: Message[];
  isTyping: boolean;
  onSampleClick: (text: string) => void;
  onToggleSidebar?: () => void;
}

export const ChatArea = ({ messages, isTyping, onSampleClick, onToggleSidebar }: ChatAreaProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Auto scroll ketika ada pesan baru atau sedang typing
  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, scrollToBottom]);

  // Auto scroll ketika keyboard mobile muncul/hilang
  useEffect(() => {
    const handleResize = () => {
      setTimeout(() => {
        scrollToBottom();
      }, 100);
    };

    window.addEventListener('resize', handleResize);
    if ('visualViewport' in window) {
      window.visualViewport?.addEventListener('resize', handleResize);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      if ('visualViewport' in window) {
        window.visualViewport?.removeEventListener('resize', handleResize);
      }
    };
  }, [scrollToBottom]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col">
        <Header onToggleSidebar={onToggleSidebar} />
        
        <div className="flex-1 overflow-hidden">
          <WelcomeScreen onSampleClick={onSampleClick} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <Header onToggleSidebar={onToggleSidebar} />
      
      {/* Chat Messages Container */}
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 md:p-6"
      >
        <div className="max-w-3xl mx-auto space-y-6 pb-4">
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
          
          {isTyping && <TypingIndicator />}
          
          {/* Invisible element untuk scroll target */}
          <div ref={messagesEndRef} style={{ height: '1px' }} />
        </div>
      </div>
    </div>
  );
};