import { useFaculty } from '../site/useCampusMedia';
import { RevealImage } from '../site/Reveal';
import { brand, CAMPUS_PHOTOS } from '../site/media';

function initials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

const AVATAR_PALETTE = [
  { bg: '#0b1f3a', ring: '#c9a24b' },
  { bg: '#1f3a5f', ring: '#e0b84b' },
  { bg: '#3a1f2f', ring: '#d98a5f' },
  { bg: '#123d33', ring: '#5fd9a0' },
  { bg: '#3a2a1f', ring: '#e0a45f' },
  { bg: '#221f3a', ring: '#8a7fe0' },
];

function paletteFor(name = '') {
  const sum = [...name].reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return AVATAR_PALETTE[sum % AVATAR_PALETTE.length];
}

function PersonIcon() {
  return (
    <svg width="42%" height="42%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="8" r="3.5" />
      <path d="M4.5 20c1.4-3.8 4.4-5.8 7.5-5.8s6.1 2 7.5 5.8" strokeLinecap="round" />
    </svg>
  );
}

function FacultyAvatar({ name, image }) {
  if (image) {
    return <img src={image} alt={name} loading="lazy" />;
  }
  const { bg, ring } = paletteFor(name);
  return (
    <div
      className="faculty-card__avatar"
      style={{ background: bg, borderColor: ring, color: ring }}
      aria-hidden="true"
    >
      <PersonIcon />
      <span className="faculty-card__initials">{initials(name)}</span>
    </div>
  );
}

export default function About() {
  const { faculty } = useFaculty();

  return (
    <div>
      <header className="page-hero">
        <p className="kicker">About the college</p>
        <h1>Apex College Harichand</h1>
      </header>

      <RevealImage src={CAMPUS_PHOTOS.hero} alt="Apex College campus" className="reveal-frame" />

      <section className="manifesto paper-2">
        <p className="kicker">Since 2021</p>
        <h2 className="display">A higher-secondary college for this region.</h2>
        <p className="lead">
          Apex College Harichand is a premier intermediate institution in Khyber Pakhtunkhwa.
          We prepare students for BISE board examinations and university admissions through a rigorous
          curriculum, experienced faculty, and well-equipped science and computer laboratories.
        </p>
      </section>

      <section className="split" data-nav-theme="dark">
        <RevealImage src="/MD.png" alt="Eng. Naveed Ahmad, Managing Director" />
        <div className="split-copy ink-panel">
          <p className="kicker">Leadership</p>
          <div>
            <h2 className="font-display display-md">Eng. Naveed Ahmad</h2>
            <p className="font-serif" style={{ marginTop: '0.6rem', color: '#d4af37' }}>Managing Director</p>
            <p className="font-serif" style={{ marginTop: '1.2rem', maxWidth: '28rem', lineHeight: 1.65 }}>
              “Shaping future academic leaders through quality education, discipline, and moral integrity.”
            </p>
          </div>
          <a className="btn-gold" href="mailto:principal@apexcollege.edu.pk">principal@apexcollege.edu.pk</a>
        </div>
      </section>

      <section className="section">
        <h2 className="display" style={{ marginBottom: '2rem' }}>Our faculty</h2>
        <div className="faculty-grid">
          {faculty.map((teacher) => (
            <article className="faculty-card" key={teacher.name}>
              <FacultyAvatar name={teacher.name} image={teacher.image} />
              <h3>{teacher.name}</h3>
              <p>{teacher.designation || 'Lecturer'}</p>
              <p>{teacher.qualification}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}