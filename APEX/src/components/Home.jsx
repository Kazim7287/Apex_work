import { useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { Reveal, RevealImage, Marquee } from './site/Reveal';
import { FALLBACK_IMAGES, CAMPUS_PHOTOS } from './site/media';
import { useCampusMedia } from './site/useCampusMedia';

const PROGRAMS = [
  { code: '01', title: 'F.Sc Pre-Medical', subjects: 'Biology, Chemistry, Physics' },
  { code: '02', title: 'F.Sc Pre-Engineering', subjects: 'Mathematics, Physics, Chemistry' },
  { code: '03', title: 'ICS', subjects: 'Computer Science & Mathematics' },
  { code: '04', title: 'F.A', subjects: 'Humanities & General Science' },
];

export default function Home() {
  const { sections } = useCampusMedia();
  const titleRef = useRef(null);
  const hero = CAMPUS_PHOTOS.hero;
  const stories = useMemo(
    () =>
      (sections.length ? sections : []).slice(0, 3).map((s, i) => ({
        id: s.id,
        title: s.title,
        content: s.content,
        image: s.images?.[0]?.src || FALLBACK_IMAGES[i],
      })),
    [sections]
  );

  useEffect(() => {
    const el = titleRef.current;
    if (!el) return undefined;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const words = el.querySelectorAll('.w');
    const tween = gsap.from(words, {
      yPercent: 40,
      opacity: 0,
      duration: 0.85,
      stagger: 0.08,
      ease: 'power3.out',
    });
    return () => tween.kill();
  }, []);

  return (
    <div>
      <section className="hero" data-nav-theme="dark">
        <div className="hero__media">
          <img src={hero} alt="Apex College Harichand campus" />
        </div>
        <div className="hero__shade" />
        <div className="hero__copy">
          <p className="kicker" style={{ color: '#d4af37' }}>
            Harichand, Khyber Pakhtunkhwa · Est. 2021
          </p>
          <div>
            <h1 ref={titleRef}>
              <span className="w" style={{ display: 'inline-block' }}>Apex College</span>
              <br />
              <span className="w" style={{ display: 'inline-block' }}>Harichand</span>
            </h1>
            <div className="hero__foot">
              <p className="hero__lede">
                A board-recognised intermediate college for F.Sc, ICS and F.A — strong faculty,
                modern labs, and a clear path to university.
              </p>
              <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
                <Link to="/admissions" className="btn-gold">Admissions Open</Link>
                <Link to="/programs" className="btn-outline" style={{ color: '#f7f8fb' }}>View programs</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div data-nav-theme="dark">
        <Marquee text="F.SC PRE-MEDICAL — PRE-ENGINEERING — ICS — F.A — ADMISSIONS OPEN" className="marque-xl" />
      </div>

      <section className="section">
        <p className="kicker">Welcome</p>
        <h2 className="display">A college built for board results and beyond.</h2>
        <p className="lead" style={{ marginTop: '1rem', maxWidth: '40rem', lineHeight: 1.7, color: '#334155' }}>
          Apex College Harichand was established in 2021 to give students of this region a serious
          place to prepare for BISE examinations and competitive university admissions — with
          discipline, qualified teachers, and facilities that match the syllabus.
        </p>
        <div className="stats" style={{ marginTop: '2.5rem' }}>
          <div><strong>2021</strong><span>Established</span></div>
          <div><strong>10+</strong><span>Programs</span></div>
          <div><strong>1000+</strong><span>Alumni</span></div>
          <div><strong>100%</strong><span>Board affiliated</span></div>
        </div>
      </section>

      <section className="section ink-panel" data-nav-theme="dark">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', gap: '1.5rem', marginBottom: '2rem' }}>
          <Reveal>
            <h2 className="display">Academic programs</h2>
          </Reveal>
          <Link to="/programs" className="link-line hidden-sm">All programs</Link>
        </div>
        <div>
          {PROGRAMS.map((p) => (
            <Link to="/programs" className="program-row" key={p.code}>
              <em>{p.code}</em>
              <strong>{p.title}</strong>
              <b>{p.subjects}</b>
            </Link>
          ))}
        </div>
      </section>

      <section className="section">
        <Reveal>
          <h2 className="display" style={{ marginBottom: '2rem' }}>Campus &amp; laboratories</h2>
        </Reveal>
        <div className="figure-grid">
          <RevealImage src={CAMPUS_PHOTOS.courtyard} alt="College courtyard" className="reveal-frame" />
          <div style={{ display: 'grid', gap: '1.5rem' }}>
            <RevealImage src={CAMPUS_PHOTOS.scienceLab} alt="Science laboratory" />
            <RevealImage src={CAMPUS_PHOTOS.computerLab} alt="Computer laboratory" />
          </div>
        </div>
        <div style={{ marginTop: '1.8rem' }}>
          <Link to="/gallery" className="btn-gold">Campus gallery</Link>
        </div>
      </section>

      <section className="split" data-nav-theme="dark">
        <RevealImage src={CAMPUS_PHOTOS.sports} alt="College sports" />
        <div className="split-copy ink-panel">
          <p className="kicker">Student life</p>
          <div>
            <h2 className="font-display display-md">Labs, library and a campus that stays busy.</h2>
            <p className="font-serif" style={{ marginTop: '1.2rem', maxWidth: '28rem', lineHeight: 1.65 }}>
              Physics, chemistry, biology and computer labs; quiet study space for board prep;
              sports and college events through the year.
            </p>
          </div>
          <Link to="/campus" className="btn-gold">Campus life</Link>
        </div>
      </section>

      <section className="section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', marginBottom: '2rem', gap: '1rem' }}>
          <h2 className="display">News &amp; events</h2>
          <Link to="/news" className="link-line">View all</Link>
        </div>
        <div className="journal-grid">
          {(stories.length
            ? stories
            : [
                { id: 1, title: 'Orientation day', content: 'New session begins at Apex College Harichand.', image: CAMPUS_PHOTOS.courtyard },
                { id: 2, title: 'Board examination prep', content: 'Library hours extended for board candidates.', image: CAMPUS_PHOTOS.library },
                { id: 3, title: 'Science practicals', content: 'Chemistry and physics labs in session.', image: CAMPUS_PHOTOS.scienceLab },
              ]
          ).map((story) => (
            <Link to="/news" className="journal-card" key={story.id}>
              <img src={story.image} alt="" loading="lazy" />
              <h3>{story.title}</h3>
              <p>{(story.content || '').slice(0, 120)}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="section ink-panel" data-nav-theme="dark" style={{ textAlign: 'center' }}>
        <p className="kicker" style={{ color: '#d4af37' }}>Admissions 2026</p>
        <h2 className="display">Apply for F.Sc, ICS and F.A</h2>
        <p style={{ maxWidth: '36rem', margin: '1rem auto 1.6rem', lineHeight: 1.7, opacity: 0.85 }}>
          Visit the campus near Harichand Bazar or send an enquiry. Office hours Monday to Saturday,
          8:00 AM – 3:00 PM.
        </p>
        <Link to="/contact" className="btn-gold">Contact admissions</Link>
      </section>
    </div>
  );
}
