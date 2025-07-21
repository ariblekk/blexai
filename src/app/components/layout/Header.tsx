import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { Menu } from 'lucide-react';

interface HeaderProps {
  onToggleSidebar?: () => void;
  title?: string;
}

export const Header = ({ onToggleSidebar, title = "Blex AI" }: HeaderProps) => {
  const headerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (headerRef.current) {
      gsap.fromTo(headerRef.current,
        {
          y: -50,
          opacity: 0
        },
        {
          y: 0,
          opacity: 1,
          duration: 0.5,
          ease: 'power2.out'
        }
      );
    }
  }, []);

  const handleButtonHover = (isHover: boolean) => {
    if (buttonRef.current) {
      gsap.to(buttonRef.current, {
        scale: isHover ? 1.1 : 1,
        rotation: isHover ? 180 : 0,
        duration: 0.3,
        ease: 'power2.out'
      });
    }
  };

  return (
    <div ref={headerRef} className="md:hidden bg-zinc-900 border-b border-zinc-800 p-4 flex-shrink-0">
      <div className="flex items-center justify-between">
        <button
          ref={buttonRef}
          onClick={onToggleSidebar}
          onMouseEnter={() => handleButtonHover(true)}
          onMouseLeave={() => handleButtonHover(false)}
          className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-semibold">{title}</h1>
        <div className="w-9"></div>
      </div>
    </div>
  );
};