import { Link } from 'react-router-dom';
import { Marquee } from './Reveal';
import { brand } from './media';

export default function SiteFooter() {
  return (
    <footer className="site-footer" data-nav-theme="dark">
      <Marquee
        text="APEX COLLEGE HARICHAND — F.SC — ICS — F.A — ADMISSIONS OPEN"
        className="marque-xl"
      />
      <div className="site-footer__grid">
        <div>
          <Link to="/" className="site-logo" style={{ color: '#f7f8fb' }}>
            <img src={brand.logo} alt="" />
            <span>
              Apex College
              <small>Harichand</small>
            </span>
          </Link>
          <p className="font-serif" style={{ marginTop: '1.2rem', maxWidth: '26rem', lineHeight: 1.7, color: 'rgba(247,248,251,.78)' }}>
            Intermediate college in Harichand, Khyber Pakhtunkhwa. Affiliated for F.Sc Pre-Medical,
            Pre-Engineering, ICS and F.A.
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem' }}>
          <div>
            <h4>Explore</h4>
            <div className="col-links">
              <Link to="/about">About</Link>
              <Link to="/programs">Programs</Link>
              <Link to="/admissions">Admissions</Link>
              <Link to="/campus">Campus</Link>
              <Link to="/contact">Contact</Link>
            </div>
          </div>
          <div>
            <h4>Academics</h4>
            <div className="col-links" style={{ fontSize: '1.05rem' }}>
              <Link to="/programs">F.Sc Pre-Medical</Link>
              <Link to="/programs">F.Sc Pre-Engineering</Link>
              <Link to="/programs">ICS</Link>
              <Link to="/programs">F.A</Link>
            </div>
          </div>
          <div>
            <h4>Contact</h4>
            <p className="font-serif" style={{ margin: 0, color: 'rgba(247,248,251,.75)', lineHeight: 1.7 }}>
              Near Harichand Bazar<br />Peshawar Road, Pakistan
              <br />
              <a href="tel:+921234567890">+92 123 4567890</a>
              <br />
              <a href="mailto:info@apexcollege.edu.pk">info@apexcollege.edu.pk</a>
            </p>
          </div>
        </div>
      </div>
      <div className="site-footer__base">
        <span>© {new Date().getFullYear()} Apex College Harichand. All rights reserved.</span>
        <span>Board-recognised institution</span>
      </div>
    </footer>
  );
}
