import { Link } from 'react-router-dom';
import { Marquee } from './Reveal';
import { brand } from './media';

const developers = [
  {
    name: 'Muhammad Rayyan',
    url: 'https://www.linkedin.com/in/muhammad1rayyan/',
  },
  {
    name: 'Muhammad Kazim Ahmed',
    url: 'https://www.linkedin.com/in/muhammad-kazim-ahmad-038636343/',
  },
];

function LinkedInIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.36V9h3.41v1.56h.05c.47-.9 1.63-1.85 3.36-1.85 3.59 0 4.26 2.36 4.26 5.44v6.3zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45z" />
    </svg>
  );
}

function FooterCredits() {
  return (
    <div className="site-footer__credits">
      <span className="site-footer__credits-label">{'Designed and Developed by'}</span>
      <div className="site-footer__credits-devs">
        {developers.map((dev, index) => {
          const isFirst = index === 0;
          return (
            <span className="site-footer__credits-dev-wrap" key={dev.name}>
              <a
                href={dev.url}
                target="_blank"
                rel="noopener noreferrer"
                className="site-footer__credits-dev"
              >
                <LinkedInIcon />
                <span>{dev.name}</span>
              </a>
              {isFirst ? <span className="site-footer__credits-divider">{'•'}</span> : null}
            </span>
          );
        })}
      </div>
    </div>
  );
}

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
              {'Apex College'}
              <small>{'Harichand'}</small>
            </span>
          </Link>
          <p
            className="font-serif"
            style={{
              marginTop: '1.2rem',
              maxWidth: '26rem',
              lineHeight: 1.7,
              color: 'rgba(247,248,251,.78)',
            }}
          >
            {'Intermediate college in Harichand, Khyber Pakhtunkhwa. Affiliated for F.Sc Pre-Medical, Pre-Engineering, ICS and F.A.'}
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem' }}>
          <div>
            <h4>{'Explore'}</h4>
            <div className="col-links">
              <Link to="/about">{'About'}</Link>
              <Link to="/programs">{'Programs'}</Link>
              <Link to="/admissions">{'Admissions'}</Link>
              <Link to="/campus">{'Campus'}</Link>
              <Link to="/contact">{'Contact'}</Link>
            </div>
          </div>

          <div>
            <h4>{'Academics'}</h4>
            <div className="col-links" style={{ fontSize: '1.05rem' }}>
              <Link to="/programs">{'F.Sc Pre-Medical'}</Link>
              <Link to="/programs">{'F.Sc Pre-Engineering'}</Link>
              <Link to="/programs">{'ICS'}</Link>
              <Link to="/programs">{'F.A'}</Link>
            </div>
          </div>

          <div>
            <h4>{'Contact'}</h4>
            <p
              className="font-serif"
              style={{ margin: 0, color: 'rgba(247,248,251,.75)', lineHeight: 1.7 }}
            >
              {'Near Harichand Bazar'}
              <br />
              {'Peshawar Road, Pakistan'}
              <br />
              <a href="tel:+921234567890">{'+92 123 4567890'}</a>
              <br />
              <a href="mailto:info@apexcollege.edu.pk">{'info@apexcollege.edu.pk'}</a>
            </p>
          </div>
        </div>
      </div>

      <FooterCredits />

      <div className="site-footer__base">
        <span>{`© ${new Date().getFullYear()} Apex College Harichand. All rights reserved.`}</span>
        <span>{'Board-recognised institution'}</span>
      </div>
    </footer>
  );
}