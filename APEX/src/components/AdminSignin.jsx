import { useState, useEffect } from 'react';
import { Layout, Card, Input, Button, Typography, Tag, message, Spin } from 'antd';
import { 
  LockOutlined, 
  MailOutlined, 
  CrownOutlined, 
  ArrowLeftOutlined,
  DashboardOutlined,
  LogoutOutlined,
  SafetyCertificateOutlined
} from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import styled, { createGlobalStyle, keyframes } from 'styled-components';
import logo from '/src/assets/images.png';

const { Content, Footer, Header } = Layout;
const { Text } = Typography;

// ==================== GLOBAL STYLES ====================
const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
  
  body {
    font-family: 'Plus Jakarta Sans', sans-serif;
    background-color: #061129;
  }
`;

// ==================== KEYFRAMES ====================
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(18px); }
  to { opacity: 1; transform: translateY(0); }
`;

// ==================== STYLED COMPONENTS ====================
const StyledLayout = styled(Layout)`
  min-height: 100vh;
  background: linear-gradient(135deg, #0b1b3d 0%, #061129 100%);
  color: #fff;
`;

const StyledHeader = styled(Header)`
  background: rgba(11, 27, 61, 0.85) !important;
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  height: 76px;
  line-height: 76px;
  padding: 0 24px;
`;

const HeaderContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const BrandWrapper = styled(Link)`
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;

  .brand-logo {
    width: 42px;
    height: 42px;
    border-radius: 8px;
    background: #fff;
    padding: 3px;
  }

  .brand-name {
    font-family: 'Cinzel', serif;
    font-size: 1.2rem;
    font-weight: 700;
    color: #fff;
  }
`;

const BackButton = styled(Button)`
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #cbd5e1;
  border-radius: 6px;
  font-weight: 500;

  &:hover {
    background: #d4af37 !important;
    color: #0b1b3d !important;
    border-color: #d4af37 !important;
  }
`;

const StyledContent = styled(Content)`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 60px 24px;
  animation: ${fadeIn} 0.6s ease-out;
`;

const LoginCard = styled(Card)`
  width: 100%;
  max-width: 460px;
  background: rgba(11, 27, 61, 0.72) !important;
  backdrop-filter: blur(16px);
  border: 1px solid rgba(212, 175, 55, 0.3) !important;
  border-top: 4px solid #d4af37 !important;
  border-radius: 16px !important;
  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.5), 0 0 20px rgba(212, 175, 55, 0.15);

  .ant-card-body {
    padding: 40px 32px;
  }

  @media (max-width: 576px) {
    .ant-card-body {
      padding: 28px 20px;
    }
  }
`;

const BadgeHeader = styled.div`
  text-align: center;
  margin-bottom: 28px;

  .icon-circle {
    width: 68px;
    height: 68px;
    border-radius: 50%;
    background: rgba(212, 175, 55, 0.12);
    border: 1px solid #d4af37;
    color: #d4af37;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 30px;
    margin-bottom: 16px;
    box-shadow: 0 0 15px rgba(212, 175, 55, 0.2);
  }

  .title {
    font-family: 'Cinzel', serif;
    font-size: 1.65rem;
    font-weight: 700;
    color: #ffffff;
    margin: 0 0 6px;
  }

  .subtitle {
    color: #94a3b8;
    font-size: 0.92rem;
  }
`;

const StyledInput = styled(Input)`
  height: 48px;
  background: rgba(255, 255, 255, 0.06) !important;
  border: 1px solid rgba(255, 255, 255, 0.15) !important;
  border-radius: 8px !important;
  color: #ffffff !important;
  margin-bottom: 18px;

  input {
    background: transparent !important;
    color: #fff !important;
  }

  .ant-input-prefix {
    color: #d4af37;
    margin-right: 12px;
  }

  &:hover, &:focus {
    border-color: #d4af37 !important;
    box-shadow: 0 0 10px rgba(212, 175, 55, 0.3) !important;
  }
`;

const StyledPasswordInput = styled(Input.Password)`
  height: 48px;
  background: rgba(255, 255, 255, 0.06) !important;
  border: 1px solid rgba(255, 255, 255, 0.15) !important;
  border-radius: 8px !important;
  color: #fff !important;
  margin-bottom: 28px;

  input {
    background: transparent !important;
    color: #fff !important;
  }

  .ant-input-prefix {
    color: #d4af37;
    margin-right: 12px;
  }

  .ant-input-password-icon {
    color: #94a3b8 !important;
  }

  &:hover, &:focus {
    border-color: #d4af37 !important;
    box-shadow: 0 0 10px rgba(212, 175, 55, 0.3) !important;
  }
`;

const SubmitButton = styled(Button)`
  height: 48px;
  border-radius: 8px;
  font-weight: 700;
  font-size: 1rem;
  background: linear-gradient(135deg, #d4af37 0%, #b8860b 100%);
  border: none;
  color: #0b1b3d;
  box-shadow: 0 4px 16px rgba(212, 175, 55, 0.35);

  &:hover {
    background: linear-gradient(135deg, #f39c12 0%, #d4af37 100%) !important;
    color: #0b1b3d !important;
  }
`;

const StyledFooter = styled(Footer)`
  text-align: center;
  background: #040c1e;
  color: #64748b;
  padding: 24px 50px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);

  .credit {
    color: #cbd5e1;
    font-weight: 600;
    margin-top: 4px;
    display: block;
  }
`;

// ==================== MAIN COMPONENT ====================
const AdminLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [adminData, setAdminData] = useState(null);
    const [sessionChecked, setSessionChecked] = useState(false);
    const navigate = useNavigate();

    // Check session on component mount
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
                        ...(token && { 'Authorization': `Bearer ${token}` })
                    },
                    body: JSON.stringify({ action: 'check_session' })
                });

                if (!response.ok) throw new Error('Network response was not ok');

                const data = await response.json();

                if (data.status === 'success') {
                    // ✅ Store both admin data AND token
                    const adminDataWithToken = {
                        ...(data.admin_data || storedData),
                        token: data.token || storedData?.token
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
            const response = await fetch('https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/AdminSignin.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    email: email,
                    password: password
                })
            });

            if (!response.ok) throw new Error('Network response was not ok');

            const data = await response.json();

            if (data.status === 'success') {
                // ✅ IMPORTANT: Store admin data WITH the token
                const adminDataWithToken = {
                    id: data.admin.id,
                    name: data.admin.name,
                    email: data.admin.email,
                    designation: data.admin.designation,
                    token: data.token  // <-- THIS IS CRITICAL
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
                body: JSON.stringify({ action: 'logout' })
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

    // Show loading state until session check is complete
    if (!sessionChecked) {
        return (
            <StyledLayout style={{ justifyContent: 'center', alignItems: 'center' }}>
                <Spin size="large" tip="Verifying Admin Session..." />
            </StyledLayout>
        );
    }

    return (
        <>
            <GlobalStyle />
            <StyledLayout>
                <StyledHeader>
                    <HeaderContainer>
                        <BrandWrapper to="/">
                            <img src={logo} alt="Apex College Logo" className="brand-logo" />
                            <span className="brand-name">Apex College Harichand</span>
                        </BrandWrapper>

                        <Link to="/choose-user">
                            <BackButton icon={<ArrowLeftOutlined />}>
                                Choose Portal
                            </BackButton>
                        </Link>
                    </HeaderContainer>
                </StyledHeader>

                <StyledContent>
                    <LoginCard>
                        {isLoggedIn ? (
                            <div>
                                <BadgeHeader>
                                    <div className="icon-circle">
                                        <CrownOutlined />
                                    </div>
                                    <h2 className="title">Welcome Back</h2>
                                    <p className="subtitle">
                                        Signed in as <strong style={{ color: '#d4af37' }}>{adminData?.name || 'Administrator'}</strong> ({adminData?.designation || 'System Admin'})
                                    </p>
                                </BadgeHeader>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                    <SubmitButton 
                                        icon={<DashboardOutlined />}
                                        onClick={() => navigate('/admin/dashboard')}
                                    >
                                        Go to Admin Dashboard
                                    </SubmitButton>

                                    <Button 
                                        size="large"
                                        style={{ 
                                            height: 48, 
                                            borderRadius: 8, 
                                            background: 'rgba(255,255,255,0.08)', 
                                            borderColor: 'rgba(255,255,255,0.2)', 
                                            color: '#cbd5e1',
                                            fontWeight: 600
                                        }}
                                        icon={<LogoutOutlined />}
                                        onClick={handleLogout}
                                        loading={loading}
                                    >
                                        Sign Out
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div>
                                <BadgeHeader>
                                    <div className="icon-circle">
                                        <CrownOutlined />
                                    </div>
                                    <h2 className="title">Admin Portal</h2>
                                    <p className="subtitle">Sign in to access administrative operations</p>
                                </BadgeHeader>

                                <div>
                                    <StyledInput
                                        prefix={<MailOutlined />}
                                        placeholder="Administrator Email"
                                        size="large"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />

                                    <StyledPasswordInput
                                        prefix={<LockOutlined />}
                                        placeholder="Security Password"
                                        size="large"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        onPressEnter={handleSignIn}
                                    />

                                    <SubmitButton 
                                        block
                                        loading={loading}
                                        onClick={handleSignIn}
                                    >
                                        Sign In to Portal
                                    </SubmitButton>
                                </div>
                            </div>
                        )}
                    </LoginCard>
                </StyledContent>

                <StyledFooter>
                    <div>© {new Date().getFullYear()} Apex College Harichand. All rights reserved.</div>
                    <span className="credit">
                        Powered by MUHAMMAD KAZIM AHMAD AND MUHAMMAD RAYYAN
                    </span>
                </StyledFooter>
            </StyledLayout>
        </>
    );
};

export default AdminLogin;