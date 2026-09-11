import { useState } from 'react';
import { FALLBACK_IMAGES } from './media';

export default function GalleryPage() {
  const pics = FALLBACK_IMAGES;
  const [active, setActive] = useState(null);

  return (
    <div>
      <header className="page-hero">
        <p className="kicker">Campus photos</p>
        <h1>Gallery</h1>
      </header>
      <section className="masonry site-pad" style={{ paddingBottom: '5rem' }}>
        {pics.map((src, i) => (
          <img key={`${src}-${i}`} src={src} alt="Apex College campus" loading="lazy" onClick={() => setActive(src)} />
        ))}
      </section>
      {active && (
        <div className="lightbox" onClick={() => setActive(null)} role="presentation">
          <img src={active} alt="" />
        </div>
      )}
    </div>
  );
}
