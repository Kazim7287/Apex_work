import { Link } from 'react-router-dom';

const Unauthorized = () => (
  <header className="page-hero">
    <p className="kicker">403</p>
    <h1>Access denied</h1>
    <p className="font-serif" style={{ marginTop: '1rem' }}>
      You are not authorised to open this page.
    </p>
    <Link to="/" className="btn-gold" style={{ marginTop: '1.5rem' }}>
      Back to home
    </Link>
  </header>
);

export default Unauthorized;
