import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

export const useGSAPAnimations = () => {
  const sidebarRef = useRef<HTMLDivElement>(null);
  const messageRefs = useRef<HTMLDivElement[]>([]);
  const headerRef = useRef<HTMLDivElement>(null);

  // Animasi sidebar toggle
  const animateSidebarToggle = (isCollapsed: boolean) => {
    if (sidebarRef.current) {
      gsap.to(sidebarRef.current, {
        width: isCollapsed ? '4rem' : '20rem',
        duration: 0.3,
        ease: 'power2.out'
      });
    }
  };

  // Animasi fade in untuk messages
  const animateMessageIn = (element: HTMLElement) => {
    gsap.fromTo(element, 
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
  };

  // Animasi header slide down
  const animateHeaderIn = () => {
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
  };

  // Animasi typing indicator
  const animateTypingIndicator = (element: HTMLElement) => {
    const dots = element.querySelectorAll('.typing-dot');
    gsap.to(dots, {
      scale: 1.2,
      duration: 0.6,
      ease: 'power2.inOut',
      stagger: 0.1,
      repeat: -1,
      yoyo: true
    });
  };

  // Animasi button hover
  const animateButtonHover = (element: HTMLElement, isHover: boolean) => {
    gsap.to(element, {
      scale: isHover ? 1.05 : 1,
      duration: 0.2,
      ease: 'power2.out'
    });
  };

  return {
    sidebarRef,
    messageRefs,
    headerRef,
    animateSidebarToggle,
    animateMessageIn,
    animateHeaderIn,
    animateTypingIndicator,
    animateButtonHover
  };
};