import { Link } from 'react-router-dom';
import { RevealImage } from './Reveal';
import { CAMPUS_PHOTOS } from './media';

export default function AdmissionsPage() {
  return (
    <div>
      <header className="page-hero">
        <p className="kicker">Join Apex</p>
        <h1>Admissions</h1>
      </header>
      <RevealImage src={CAMPUS_PHOTOS.hero} alt="Apex College campus" className="reveal-frame" />
      <section className="manifesto">
        <p className="kicker">Now open</p>
        <h2 className="display">F.Sc, ICS and F.A seats are open.</h2>
        <p className="lead">
          Visit the campus office with your previous result card and photographs, or send an
          enquiry online. After enrolment you receive student-portal access for timetable,
          attendance and announcements.
        </p>
        <div style={{ marginTop: '2rem', display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
          <Link to="/contact" className="btn-gold">Enquire now</Link>
          <Link to="/choose-user" className="btn-outline">Student portal</Link>
        </div>
      </section>
    </div>
  );
}
