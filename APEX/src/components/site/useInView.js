import { useEffect, useRef, useState } from 'react';

export function useInView(options) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.16, rootMargin: '0px 0px -8% 0px', ...options }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return { ref, inView };
}
