import { useEffect, useState } from 'react';
import type { RefObject } from 'react';

/**
 * Tracks the scroll progress (0 to 1) of an element as it scrolls through the viewport.
 * Best used with sticky scrollytelling container structures.
 * 
 * @param ref Ref to the wrapper container of the sticky content
 */
export function useScrollProgress(ref: RefObject<HTMLElement | null>): number {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!ref.current) return;
      
      const rect = ref.current.getBoundingClientRect();
      const elementHeight = rect.height;
      const viewportHeight = window.innerHeight;
      
      // Calculate scroll progress from the top of the container reaching the top of the viewport
      // to the bottom of the container reaching the bottom of the viewport.
      const totalScrollable = elementHeight - viewportHeight;
      if (totalScrollable <= 0) {
        setProgress(0);
        return;
      }
      
      const scrolled = -rect.top;
      const pct = Math.max(0, Math.min(1, scrolled / totalScrollable));
      setProgress(pct);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);
    
    // Initial call
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [ref]);

  return progress;
}
