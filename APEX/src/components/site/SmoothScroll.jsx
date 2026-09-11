import { useEffect } from 'react';
import Lenis from 'lenis';
import { setLenis } from './lenisControl';

export default function SmoothScroll() {
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return undefined;

    const lenis = new Lenis({
      autoRaf: true,
      duration: 0.95,
      lerp: 0.12,
      smoothWheel: true,
      syncTouch: false,
    });
    setLenis(lenis);

    return () => {
      setLenis(null);
      lenis.destroy();
    };
  }, []);

  return null;
}
