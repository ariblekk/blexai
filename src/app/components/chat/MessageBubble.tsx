import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { Message } from '../../types';
import { MessageContent } from '../ui/MessageContent';

interface MessageBubbleProps {
  message: Message;
}

export const MessageBubble = ({ message }: MessageBubbleProps) => {
  const messageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messageRef.current) {
      gsap.fromTo(messageRef.current,
        {
          opacity: 0,
          y: 20,
          scale: 0.95
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.4,
          ease: 'back.out(1.7)'
        }
      );
    }
  }, []);

  return (
    <div
      ref={messageRef}
      className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={`max-w-[95%] sm:max-w-[85%] md:max-w-[80%] rounded-2xl px-3 sm:px-4 py-3 ${message.sender === 'user' ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-zinc-100'}`}
      >
        <MessageContent text={message.content} />
        <div className="text-xs opacity-70 mt-2">
          {message.timestamp.toLocaleTimeString()}
        </div>
        {message.fallback && (
        <span className="text-xs bg-yellow-600 text-white px-2 py-1 rounded">
          Fallback Mode
        </span>
        )}
      </div>
    </div>
  );
};