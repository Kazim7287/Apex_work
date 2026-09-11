import { useState, useEffect } from 'react';
import { Input, message } from 'antd';
import { useNavigate, Link } from 'react-router-dom';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [adminData, setAdminData] = useState(null);
  const [sessionChecked, setSessionChecked] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const storedAdminData = localStorage.getItem('adminData');
        if (storedAdminData) {
          try {
            const parsedData = JSON.parse(storedAdminData);
            setIsLoggedIn(true);
            setAdminData(parsedData);
            await verifySessionWithServer(parsedData);
          } catch (e) {
            console.error('Error parsing stored admin data:', e);
            localStorage.removeItem('adminData');
          }
        } else {
          await verifySessionWithServer();
        }
      } catch (error) {
        console.error('Session check failed:', error);
        handleLogoutCleanup();
      } finally {
        setSessionChecked(true);
      }
    };

    const verifySessionWithServer = async (storedData = null) => {
      try {
        const token = storedData?.token || null;

        const response = await fetch('https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/AdminSignin.php', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          body: JSON.stringify({ action: 'check_session' }),
        });

        if (!response.ok) throw new Error('Network response was not ok');

        const data = await response.json();

        if (data.status === 'success') {
          const adminDataWithToken = {
            ...(data.admin_data || storedData),
            token: data.token || storedData?.token,
          };

          setIsLoggedIn(true);
          setAdminData(adminDataWithToken);
          localStorage.setItem('adminData', JSON.stringify(adminDataWithToken));
        } else {
          handleLogoutCleanup();
        }
      } catch (error) {
        console.error('Error verifying session with server:', error);
        if (storedData) {
          setIsLoggedIn(true);
          setAdminData(storedData);
        } else {
          handleLogoutCleanup();
        }
      }
    };

    checkSession();
  }, []);

  const handleLogoutCleanup = () => {
    setIsLoggedIn(false);
    setAdminData(null);
    setEmail('');
    setPassword('');
    localStorage.removeItem('adminData');
  };

  const handleSignIn = async () => {
    if (!email || !password) {
      message.error('Please enter both email and password');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        'https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/AdminSignin.php',
        {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );
      if (!response.ok) throw new Error('Network response was not ok');

      const data = await response.json();

      if (data.status === 'success') {
        const adminDataWithToken = {
          id: data.admin.id,
          name: data.admin.name,
          email: data.admin.email,
          designation: data.admin.designation,
          token: data.token,
        };

        setIsLoggedIn(true);
        setAdminData(adminDataWithToken);
        localStorage.setItem('adminData', JSON.stringify(adminDataWithToken));
        message.success('Login successful!');
        navigate('/admin/dashboard');
      } else {
        message.error(data.message || 'Login failed');
        handleLogoutCleanup();
      }
    } catch (error) {
      message.error('An error occurred during login');
      console.error('Login error:', error);
      handleLogoutCleanup();
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const response = await fetch('https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/AdminSignin.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'logout' }),
      });

      handleLogoutCleanup();

      if (response.ok) {
        const data = await response.json();
        if (data.status === 'success') {
          message.success('Logged out successfully');
        } else {
          message.warning('Logged out locally but server logout may have failed');
        }
      } else {
        message.warning('Logged out locally but server logout may have failed');
      }

      navigate('/choose-user');
    } catch (error) {
      console.error('Logout error:', error);
      handleLogoutCleanup();
      navigate('/choose-user');
      message.warning('Logged out locally but server logout may have failed');
    }
  };

  if (!sessionChecked) {
    return (
      <div className="auth-page">
        <p className="lede">Verifying admin session…</p>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div>
        <p className="eyebrow">Administration</p>
        <h1 className="display">Admin login</h1>
        <p className="lede">Operations, enrolment and the college ledger — for authorised staff only.</p>
        <Link to="/choose-user" className="btn btn--ghost">All portals</Link>
      </div>
      <div className="auth-card">
        {isLoggedIn ? (
          <div>
            <h1>Welcome back</h1>
            <p>
              {adminData?.name || 'Administrator'} · {adminData?.designation || 'System Admin'}
            </p>
            <div className="hero__row" style={{ marginTop: '1.2rem' }}>
              <button className="btn btn--gold" type="button" onClick={() => navigate('/admin/dashboard')}>
                Dashboard
              </button>
              <button className="btn btn--ink" type="button" onClick={handleLogout} disabled={loading}>
                Sign out
              </button>
            </div>
          </div>
        ) : (
          <div>
            <Input
              placeholder="Administrator email"
              size="large"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ marginBottom: 16 }}
            />
            <Input.Password
              placeholder="Password"
              size="large"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onPressEnter={handleSignIn}
              style={{ marginBottom: 20 }}
            />
            <button className="btn btn--gold" type="button" onClick={handleSignIn} disabled={loading} style={{ width: '100%' }}>
              {loading ? 'Signing in…' : 'Enter admin portal'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminLogin;
