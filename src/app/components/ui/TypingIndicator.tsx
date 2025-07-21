import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

export const TypingIndicator = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const dotsRef = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    if (dotsRef.current.length > 0) {
      gsap.to(dotsRef.current, {
        scale: 1.2,
        duration: 0.6,
        ease: 'power2.inOut',
        stagger: 0.1,
        repeat: -1,
        yoyo: true
      });
    }
  }, []);

  return (
    <div ref={containerRef} className="flex justify-start">
      <div className="bg-zinc-800 rounded-2xl px-4 py-3">
        <div className="flex space-x-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              ref={(el) => {
                if (el) dotsRef.current[i] = el;
              }}
              className="typing-dot w-2 h-2 bg-zinc-400 rounded-full"
            />
          ))}
        </div>
      </div>
    </div>
  );
};