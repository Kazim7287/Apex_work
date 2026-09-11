import { useState } from 'react';
import { useCampusMedia } from './useCampusMedia';
import { CAMPUS_PHOTOS } from './media';

export default function NewsPage() {
  const { sections, loading } = useCampusMedia();
  const [open, setOpen] = useState(null);

  return (
    <div>
      <header className="page-hero">
        <p className="kicker">Updates</p>
        <h1>News &amp; events</h1>
      </header>
      <section className="section">
        {loading && <p>Loading campus updates…</p>}
        <div className="journal-grid">
          {(sections.length ? sections : []).map((story) => (
            <button
              type="button"
              className="journal-card"
              key={story.id}
              onClick={() => setOpen(story)}
              style={{ textAlign: 'left', background: 'none', border: 0, padding: 0, cursor: 'pointer' }}
            >
              <img src={story.images?.[0]?.src || CAMPUS_PHOTOS.courtyard} alt="" loading="lazy" />
              <h3>{story.title}</h3>
              <p>{(story.content || '').slice(0, 140)}</p>
            </button>
          ))}
        </div>
      </section>
      {open && (
        <div className="lightbox" onClick={() => setOpen(null)} role="presentation">
          <div onClick={(e) => e.stopPropagation()} style={{ maxWidth: 820 }}>
            <h2 className="display">{open.title}</h2>
            <p className="font-serif" style={{ fontSize: '1.05rem', lineHeight: 1.7 }}>{open.content}</p>
            {open.images?.map((img) => (
              <img key={img.src} src={img.src} alt="" style={{ marginTop: '1rem' }} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
