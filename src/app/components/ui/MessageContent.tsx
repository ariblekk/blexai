import { CodeBlock } from './CodeBlock';
import { ReactNode } from 'react';

interface MessageContentProps {
  text: string;
}

export const MessageContent = ({ text }: MessageContentProps) => {
  // Tambahkan null/undefined check
  if (!text || typeof text !== 'string') {
    return <span className="text-red-400 italic">Error: Invalid message content</span>;
  }

  // Regex yang lebih fleksibel untuk menangani berbagai format code block
  const codeBlockRegex = /```([a-zA-Z]*)?\s*([\s\S]*?)```/g;
  const parts: ReactNode[] = [];
  let lastIndex = 0;
  let match;

  // ... existing code ...
  match = codeBlockRegex.exec(text);
  while (match !== null) {
    if (match.index > lastIndex) {
      const beforeText = text.slice(lastIndex, match.index);
      if (beforeText.trim()) {
        parts.push(
          <span key={`text-${lastIndex}`} className="whitespace-pre-wrap">
            {parseTextContent(beforeText)}
          </span>
        );
      }
    }

    const language = match[1] || '';
    const code = match[2].trim();
    parts.push(
      <CodeBlock key={`code-${match.index}`} code={code} language={language} />
    );

    lastIndex = match.index + match[0].length;
    match = codeBlockRegex.exec(text);
  }

  if (lastIndex < text.length) {
    const remainingText = text.slice(lastIndex);
    if (remainingText.trim()) {
      parts.push(
        <span key={`text-${lastIndex}`} className="whitespace-pre-wrap">
          {parseTextContent(remainingText)}
        </span>
      );
    }
  }

  if (parts.length === 0) {
    return <span className="whitespace-pre-wrap">{parseTextContent(text)}</span>;
  }

  return <div>{parts}</div>;
};

// Helper function untuk parsing text content
const parseTextContent = (content: string): (string | ReactNode)[] => {
  // Tambahkan null check
  if (!content || typeof content !== 'string') {
    return [''];
  }

  const parts: (string | ReactNode)[] = [];
  let currentIndex = 0;
  
  const combinedRegex = /(\*\*([^*]+)\*\*)|(https?:\/\/[^\s]+)/g;
  let match;
  
  match = combinedRegex.exec(content);
  while (match !== null) {
    if (match.index > currentIndex) {
      const beforeText = content.slice(currentIndex, match.index);
      parts.push(beforeText);
    }
    
    if (match[1]) {
      const boldText = match[2];
      parts.push(
        <strong key={`bold-${match.index}`} className="font-semibold">
          {boldText}
        </strong>
      );
    } else if (match[3]) {
      const url = match[3];
      parts.push(
        <a 
          key={`link-${match.index}`}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 hover:text-blue-300 underline transition-colors"
        >
          {url}
        </a>
      );
    }
    
    currentIndex = match.index + match[0].length;
    match = combinedRegex.exec(content);
  }
  
  if (currentIndex < content.length) {
    parts.push(content.slice(currentIndex));
  }
  
  return parts.length > 0 ? parts : [content];
};