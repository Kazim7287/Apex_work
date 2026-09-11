import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import SiteHeader from './SiteHeader';
import SiteFooter from './SiteFooter';
import SmoothScroll from './SmoothScroll';
import './site.css';

const AUTH = ['/choose-user', '/admin-signIn', '/teacher-signIn', '/student-signIn'];

export default function SiteLayout() {
  const { pathname } = useLocation();
  const isAuth = AUTH.includes(pathname);

  useEffect(() => {
    document.documentElement.classList.add('apex-site');
    document.body.classList.add('apex-site');
    return () => {
      document.documentElement.classList.remove('apex-site');
      document.body.classList.remove('apex-site');
    };
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [pathname]);

  return (
    <div className="apex-shell">
      <SmoothScroll />
      <SiteHeader />
      <main>
        <Outlet />
      </main>
      {!isAuth && <SiteFooter />}
    </div>
  );
}
