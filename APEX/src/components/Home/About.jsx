import { useFaculty } from '../site/useCampusMedia';
import { RevealImage } from '../site/Reveal';
import { brand, CAMPUS_PHOTOS } from '../site/media';

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
        <RevealImage src={brand.principal} alt="Eng. Naveed Ahmad, Managing Director" />
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
              {teacher.image ? (
                <img src={teacher.image} alt={teacher.name} loading="lazy" />
              ) : (
                <div className="ph" />
              )}
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
