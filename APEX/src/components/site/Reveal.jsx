import { useInView } from './useInView';

export function Reveal({ children, className = '', delay = 0 }) {
  const { ref, inView } = useInView();
  return (
    <div
      ref={ref}
      className={`reveal-up ${inView ? 'is-in' : ''} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

export function RevealImage({ src, alt, className = '', imgClassName = '' }) {
  const { ref, inView } = useInView();
  return (
    <div ref={ref} className={`reveal-frame ${className}`}>
      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        className={`reveal-clip ${inView ? 'is-in' : ''} ${imgClassName}`}
      />
    </div>
  );
}

export function Marquee({ text, reverse = false, className = '' }) {
  const phrase = `${text} — `;
  const copies = Array.from({ length: 8 }, () => phrase).join('');
  return (
    <div className={`site-marquee ${className}`}>
      <div className={reverse ? 'marquee-track-reverse' : 'marquee-track'}>
        <span>{copies}</span>
        <span>{copies}</span>
      </div>
    </div>
  );
}
