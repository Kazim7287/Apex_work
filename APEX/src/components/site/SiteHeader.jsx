import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { startLenis, stopLenis } from './lenisControl';
import { useOverDarkNav } from './useOverDarkNav';
import { brand } from './media';

const NAV = [
  { to: '/about', label: 'About' },
  { to: '/programs', label: 'Programs' },
  { to: '/admissions', label: 'Admissions' },
  { to: '/campus', label: 'Campus' },
  { to: '/news', label: 'News' },
  { to: '/contact', label: 'Contact' },
];

const MOBILE = [
  { to: '/', label: 'Home', hint: 'Start' },
  { to: '/about', label: 'About', hint: 'College' },
  { to: '/programs', label: 'Programs', hint: 'F.Sc · ICS · F.A' },
  { to: '/admissions', label: 'Admissions', hint: 'Apply' },
  { to: '/campus', label: 'Campus', hint: 'Student life' },
  { to: '/gallery', label: 'Gallery', hint: 'Photos' },
  { to: '/news', label: 'News', hint: 'Events' },
  { to: '/contact', label: 'Contact', hint: 'Office' },
];

export default function SiteHeader() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const overDark = useOverDarkNav();

  useEffect(() => setOpen(false), [location.pathname]);

  useEffect(() => {
    if (!open) {
      startLenis();
      document.body.style.removeProperty('overflow');
      return undefined;
    }
    stopLenis();
    document.body.style.overflow = 'hidden';
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      startLenis();
      document.body.style.removeProperty('overflow');
    };
  }, [open]);

  return (
    <header className={`site-header ${open ? 'is-open' : overDark ? 'is-dark' : 'is-light'}`}>
      <div className="site-header__bar">
        <Link to="/" className="site-logo">
          <img src={brand.logo} alt="" />
          <span>
            Apex College
            <small>Harichand</small>
          </span>
        </Link>
        <nav className="site-nav" aria-label="Primary">
          {NAV.map((item) => (
            <NavLink key={item.to} to={item.to}>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="site-header__right">
          <Link to="/admissions" className="hidden-sm">Apply</Link>
          <Link to="/choose-user">Portal</Link>
          <button
            type="button"
            className="menu-btn"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen((v) => !v)}
          >
            <span>{open ? 'Close' : 'Menu'}</span>
            <span className={`menu-mark ${open ? 'is-open' : ''}`} aria-hidden="true">
              <span />
              <span />
            </span>
          </button>
        </div>
      </div>

      <div id="mobile-nav" className={`mobile-nav ${open ? 'is-open' : ''}`} aria-hidden={!open}>
        <div className="mobile-nav-panel">
          <div className="site-pad" style={{ paddingTop: '7rem', paddingBottom: '2rem' }}>
            <p className="kicker" style={{ color: '#d4af37' }}>Menu</p>
            <div style={{ marginTop: '1.5rem' }}>
              {MOBILE.map((item, i) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="mobile-nav-item"
                  style={{ '--i': i }}
                >
                  {item.label}
                  <span>{item.hint}</span>
                </Link>
              ))}
            </div>
            <Link to="/choose-user" className="btn-gold" style={{ marginTop: '2rem' }}>
              Student &amp; faculty login
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
