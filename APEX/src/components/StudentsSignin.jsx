/* eslint-disable no-unused-vars */
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { loginStart, loginSuccess, loginFailure } from '../redux/authSlice';
import { Card, Typography, Alert, Form, Input, Button, message, Layout, Tag, Avatar, Space, Divider } from 'antd';
import { 
  UserOutlined, 
  IdcardOutlined, 
  TeamOutlined, 
  DashboardOutlined, 
  LogoutOutlined, 
  ArrowLeftOutlined 
} from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
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
  background: rgba(11, 27, 61, 0.75) !important;
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
  color: #fff !important;

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
const StudentSignin = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [studentData, setStudentData] = useState(() => {
    const id = localStorage.getItem('student_id');
    const name = localStorage.getItem('student_name');
    const sectionId = localStorage.getItem('section_id');
    const sectionName = localStorage.getItem('section_name');
    return id && name ? { studentId: id, name, sectionId, section_name: sectionName } : null;
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSignIn = async (values) => {
    setError('');
    setLoading(true);
    dispatch(loginStart());

    try {
      const response = await fetch('https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/Signin.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: values.name,
          class_no: values.class_number.toString()
        }),
        credentials: 'include'
      });

      const data = await response.json();

      if (!data.success) throw new Error(data.error || 'Login failed');

      localStorage.setItem('student_id', data.user.id);
      localStorage.setItem('student_name', data.user.name);
      localStorage.setItem('section_id', data.user.section_id);
      localStorage.setItem('section_name', data.user.section_name || 'Not Available');
      if (data.session_id) localStorage.setItem('session_id', data.session_id);

      dispatch(loginSuccess({
        userType: 'student',
        userId: data.user.id,
        userName: data.user.name,
        sectionId: data.user.section_id,
        sectionName: data.user.section_name || 'Not Available',
        sessionId: data.session_id
      }));

      setStudentData({
        studentId: data.user.id,
        name: data.user.name,
        sectionId: data.user.section_id,
        section_name: data.user.section_name
      });

      message.success('Login successful!');
      navigate('/student/dashboard');
    } catch (err) {
      console.error('Signin error:', err);
      setError(err.message);
      dispatch(loginFailure(err.message));
      message.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const response = await fetch('https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/Signin.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ action: 'logout' })
      });

      const result = await response.json();
      if (result.success) {
        localStorage.clear();
        setStudentData(null);
        message.success('Logged out successfully');
      } else {
        throw new Error(result.error || 'Logout failed');
      }
    } catch (error) {
      console.error('Logout error:', error);
      message.error('Logout failed');
    }
  };

  return (
    <>
      <GlobalStyle />
      <StyledLayout>
        {/* Header */}
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

        {/* Content */}
        <StyledContent>
          <LoginCard>
            <BadgeHeader>
              <div className="icon-circle">
                <TeamOutlined />
              </div>
              <h2 className="title">Student Portal</h2>
              <p className="subtitle">Sign in to view your courses, attendance & results</p>
            </BadgeHeader>

            {error && (
              <Alert 
                message="Authentication Error" 
                description={error} 
                type="error" 
                showIcon 
                style={{ marginBottom: '20px', borderRadius: 8 }} 
                closable
                onClose={() => setError('')}
              />
            )}

            {!studentData ? (
              <Form layout="vertical" onFinish={handleSignIn}>
                <Form.Item
                  name="name"
                  rules={[{ required: true, message: 'Please enter your full name' }]}
                >
                  <StyledInput 
                    prefix={<UserOutlined />}
                    placeholder="Full Name (e.g. Muhammad Ali)" 
                    size="large"
                    allowClear 
                  />
                </Form.Item>

                <Form.Item
                  name="class_number"
                  rules={[{ required: true, message: 'Please enter your class number' }]}
                >
                  <StyledInput 
                    prefix={<IdcardOutlined />}
                    placeholder="Class Roll / Student Number" 
                    size="large"
                    allowClear 
                  />
                </Form.Item>

                <Form.Item style={{ marginBottom: 0 }}>
                  <SubmitButton 
                    type="primary" 
                    htmlType="submit" 
                    block 
                    loading={loading}
                  >
                    {loading ? 'Authenticating...' : 'Sign In to Student Portal'}
                  </SubmitButton>
                </Form.Item>
              </Form>
            ) : (
              <div style={{ textAlign: 'center' }}>
                <Avatar
                  size={84}
                  icon={<UserOutlined />}
                  style={{
                    backgroundColor: '#0b1b3d',
                    border: '3px solid #d4af37',
                    color: '#d4af37',
                    marginBottom: 16,
                    fontSize: 36,
                    boxShadow: '0 0 15px rgba(212, 175, 55, 0.3)'
                  }}
                />

                <h3 style={{ fontFamily: 'Cinzel, serif', color: '#fff', fontSize: '1.4rem', margin: '0 0 4px' }}>
                  {studentData.name}
                </h3>
                
                <Space style={{ marginTop: 8, marginBottom: 16 }}>
                  <Tag color="#d4af37" style={{ color: '#0b1b3d', fontWeight: 700 }}>
                    Section: {studentData.section_name || 'Assigned'}
                  </Tag>
                  <Tag color="blue" style={{ fontWeight: 600 }}>
                    ID: #{studentData.studentId}
                  </Tag>
                </Space>

                <Divider style={{ borderColor: 'rgba(255,255,255,0.1)', margin: '20px 0' }} />

                <Space direction="vertical" style={{ width: '100%' }} size="middle">
                  <SubmitButton
                    icon={<DashboardOutlined />}
                    block
                    size="large"
                    onClick={() => navigate('/student/dashboard')}
                  >
                    Go to Student Dashboard
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
                    block
                    onClick={handleLogout}
                  >
                    Sign Out
                  </Button>
                </Space>
              </div>
            )}
          </LoginCard>
        </StyledContent>

        {/* Footer */}
        <StyledFooter>
          <div>© {new Date().getFullYear()} Apex College Harichand. All rights reserved.</div>
          <span className="credit">
            Powered by MUHAMMAD KAZIM AHMAD AND YOUSAF SHAH
          </span>
        </StyledFooter>
      </StyledLayout>
    </>
  );
};

export default StudentSignin;