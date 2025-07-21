import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ChevronLeft, ChevronRight, Plus, MessageSquare, Trash2, User, History } from 'lucide-react';
import { ChatSession, SessionInfo } from '../../types';

// Fungsi helper untuk format waktu tanpa date-fns
const formatTimeAgo = (date: Date): string => {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return 'just now';
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  }
  
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths} month${diffInMonths > 1 ? 's' : ''} ago`;
  }
  
  const diffInYears = Math.floor(diffInMonths / 12);
  return `${diffInYears} year${diffInYears > 1 ? 's' : ''} ago`;
};

// Komponen Avatar
const Avatar = ({ isGuest, sessionId }: { isGuest: boolean; sessionId: string }) => {
  // Generate warna berdasarkan sessionId
  const getAvatarColor = (id: string) => {
    const colors = [
      'bg-red-500',
      'bg-blue-500', 
      'bg-green-500',
      'bg-yellow-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-orange-500'
    ];
    const hash = id.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    return colors[Math.abs(hash) % colors.length];
  };

  // Generate initial berdasarkan sessionId
  const getInitial = (id: string) => {
    if (isGuest) {
      return 'G';
    }
    return id.charAt(0).toUpperCase();
  };

  return (
    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold ${
      isGuest ? 'bg-orange-500' : getAvatarColor(sessionId)
    }`}>
      {getInitial(sessionId)}
    </div>
  );
};

interface SidebarProps {
  chatSessions: ChatSession[];
  currentChatId: string | null;
  onNewChat: () => void;
  onLoadChat: (sessionId: string) => void;
  onDeleteChat: (sessionId: string, e: React.MouseEvent) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onMobileClose?: () => void;
  sessionInfo?: {
    isGuest: boolean;
    sessionId: string;
  };
  isClient?: boolean;
}

export const Sidebar = ({ 
  chatSessions, 
  currentChatId, 
  onNewChat, 
  onLoadChat, 
  onDeleteChat, 
  isCollapsed, 
  onToggleCollapse,
  onMobileClose,
  sessionInfo,
  isClient = false
}: SidebarProps) => {
  const sidebarRef = useRef<HTMLDivElement>(null);
  const chatItemsRef = useRef<HTMLDivElement[]>([]);

  // Animasi sidebar toggle dengan width yang diperbarui
  useEffect(() => {
    if (sidebarRef.current) {
      gsap.to(sidebarRef.current, {
        width: isCollapsed ? '4rem' : '16.25rem', // 260px untuk expanded, 64px untuk collapsed
        duration: 0.3,
        ease: 'power2.out'
      });
    }
  }, [isCollapsed]);

  // Animasi chat items saat load
  useEffect(() => {
    if (chatItemsRef.current.length > 0) {
      gsap.fromTo(chatItemsRef.current,
        {
          opacity: 0,
          x: -20
        },
        {
          opacity: 1,
          x: 0,
          duration: 0.3,
          stagger: 0.05,
          ease: 'power2.out'
        }
      );
    }
  }, [chatSessions]);

  const handleButtonHover = (element: HTMLElement, isHover: boolean) => {
    gsap.to(element, {
      scale: isHover ? 1.05 : 1,
      duration: 0.2,
      ease: 'power2.out'
    });
  };

  if (isCollapsed) {
    return (
      <div ref={sidebarRef} className="w-16 bg-zinc-900 border-r border-zinc-800 flex flex-col h-full">
        {/* Header collapsed */}
        <div className="p-4 border-b border-zinc-800">
          <button
            onClick={onToggleCollapse}
            onMouseEnter={(e) => handleButtonHover(e.currentTarget, true)}
            onMouseLeave={(e) => handleButtonHover(e.currentTarget, false)}
            className="p-2 hover:bg-zinc-800 rounded mb-3 w-full transition-colors"
            title="Expand Sidebar"
          >
            <ChevronRight className="w-4 h-4 mx-auto" />
          </button>
          
          {/* New Chat Button */}
          <button
            onClick={onNewChat}
            onMouseEnter={(e) => handleButtonHover(e.currentTarget, true)}
            onMouseLeave={(e) => handleButtonHover(e.currentTarget, false)}
            className="p-2 hover:bg-zinc-800 rounded w-full bg-zinc-800 transition-colors"
            title="New Chat"
          >
            <Plus className="w-4 h-4 mx-auto" />
          </button>
        </div>
        
        {/* Chat History Icons */}
        <div className="flex-1 overflow-y-auto p-2 space-y-2">
          {chatSessions.length === 0 ? (
            <div className="flex justify-center py-4">
              <MessageSquare className="w-4 h-4 text-zinc-500" />
            </div>
          ) : (
            chatSessions.slice(0, 8).map((session) => (
              <button
                key={session.id}
                onClick={() => onLoadChat(session.id)}
                className={`w-full p-2 rounded transition-colors group relative ${
                  currentChatId === session.id
                    ? 'bg-zinc-700'
                    : 'hover:bg-zinc-800'
                }`}
                title={session.title}
              >
                <MessageSquare className="w-4 h-4 mx-auto" />
                {/* Indicator untuk current chat */}
                {currentChatId === session.id && (
                  <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-6 bg-blue-500 rounded-r"></div>
                )}
                {/* Session type indicator */}
                {session.sessionType === 'guest' && (
                  <div className="absolute top-1 right-1 w-2 h-2 bg-orange-500 rounded-full"></div>
                )}
              </button>
            ))
          )}
          
          {/* Show more indicator jika ada lebih dari 8 chat */}
          {chatSessions.length > 8 && (
            <div className="flex justify-center py-2">
              <div className="w-1 h-1 bg-zinc-500 rounded-full mx-0.5"></div>
              <div className="w-1 h-1 bg-zinc-500 rounded-full mx-0.5"></div>
              <div className="w-1 h-1 bg-zinc-500 rounded-full mx-0.5"></div>
            </div>
          )}
        </div>
        
        {/* Avatar di collapsed state */}
        {isClient && sessionInfo && (
          <div className="p-4 border-t border-zinc-800">
            <div className="flex justify-center">
              <Avatar 
                isGuest={sessionInfo.isGuest} 
                sessionId={sessionInfo.sessionId} 
              />
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div ref={sidebarRef} className="w-65 bg-zinc-900 border-r border-zinc-800 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-zinc-800">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Chat History</h2>
          <div className="flex items-center gap-2">
            {/* Close button untuk mobile */}
            <button
              onClick={onMobileClose}
              onMouseEnter={(e) => handleButtonHover(e.currentTarget, true)}
              onMouseLeave={(e) => handleButtonHover(e.currentTarget, false)}
              className="md:hidden p-1 hover:bg-zinc-800 rounded transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {/* Collapse button untuk desktop */}
            <button
              onClick={onToggleCollapse}
              onMouseEnter={(e) => handleButtonHover(e.currentTarget, true)}
              onMouseLeave={(e) => handleButtonHover(e.currentTarget, false)}
              className="hidden md:block p-1 hover:bg-zinc-800 rounded transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        <button
          onClick={onNewChat}
          onMouseEnter={(e) => handleButtonHover(e.currentTarget, true)}
          onMouseLeave={(e) => handleButtonHover(e.currentTarget, false)}
          className="w-full flex items-center gap-2 p-3 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Chat
        </button>
      </div>
      
      {/* Chat Sessions */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {chatSessions.length === 0 ? (
          <div className="text-center text-zinc-500 py-8">
            <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No chat history yet</p>
          </div>
        ) : (
          chatSessions.map((session, index) => (
            <div
              key={session.id}
              ref={(el) => {
                if (el) chatItemsRef.current[index] = el;
              }}
              onClick={() => onLoadChat(session.id)}
              onMouseEnter={(e) => handleButtonHover(e.currentTarget, true)}
              onMouseLeave={(e) => handleButtonHover(e.currentTarget, false)}
              className={`group p-3 rounded-lg cursor-pointer transition-colors ${
                currentChatId === session.id
                  ? 'bg-zinc-700 border border-zinc-600'
                  : 'hover:bg-zinc-800'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm truncate mb-1">
                    {session.title}
                  </h3>
                  <p className="text-xs text-zinc-400">
                    {isClient ? formatTimeAgo(session.lastUpdated) : 'Loading...'}
                  </p>
                  {session.sessionType && (
                    <span className={`inline-block mt-1 px-1.5 py-0.5 text-xs rounded ${
                      session.sessionType === 'guest' ? 'bg-orange-600/20 text-orange-400' : 'bg-green-600/20 text-green-400'
                    }`}>
                      {session.sessionType}
                    </span>
                  )}
                </div>
                <button
                  onClick={(e) => onDeleteChat(session.id, e)}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-zinc-600 rounded transition-all"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
      
      {/* User Info di bagian bawah */}
      {isClient && sessionInfo && (
        <div className="p-4 border-t border-zinc-800">
          <div className="flex items-center gap-3 p-3 bg-zinc-800 rounded-lg">
            <Avatar 
              isGuest={sessionInfo.isGuest} 
              sessionId={sessionInfo.sessionId} 
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">
                  {sessionInfo.isGuest ? 'Guest User' : 'User'}
                </span>
                <span className={`px-2 py-0.5 text-xs rounded ${
                  sessionInfo.isGuest ? 'bg-orange-600' : 'bg-green-600'
                } text-white`}>
                  {sessionInfo.isGuest ? 'Guest' : 'Logged In'}
                </span>
              </div>
              <div className="text-xs text-zinc-400 truncate mt-1">
                ID: {sessionInfo.sessionId.length > 25 ? sessionInfo.sessionId.substring(0, 25) + '...' : sessionInfo.sessionId}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};