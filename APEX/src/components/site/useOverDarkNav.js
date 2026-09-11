import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

export function useOverDarkNav() {
  const location = useLocation();
  const [overDark, setOverDark] = useState(false);

  useEffect(() => {
    const sync = () => {
      const elements = document.querySelectorAll("[data-nav-theme='dark']");
      setOverDark(
        Array.from(elements).some((el) => {
          const rect = el.getBoundingClientRect();
          return rect.top < 96 && rect.bottom > 0;
        })
      );
    };
    sync();
    window.addEventListener('scroll', sync, { passive: true });
    window.addEventListener('resize', sync);
    return () => {
      window.removeEventListener('scroll', sync);
      window.removeEventListener('resize', sync);
    };
  }, [location.pathname]);

  return overDark;
}
