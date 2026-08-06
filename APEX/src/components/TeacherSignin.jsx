import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setTeacher, clearTeacher } from '../redux/teacherSlice';
import {
  Form,
  Input,
  Button,
  Card,
  Typography,
  message,
  Modal,
  Spin,
  Avatar,
  Space,
  Divider,
  Tag,
  Layout
} from 'antd';
import {
  LockOutlined,
  MailOutlined,
  UserOutlined,
  LogoutOutlined,
  DashboardOutlined,
  BookOutlined,
  ArrowLeftOutlined,
  ReadOutlined
} from '@ant-design/icons';
import styled, { createGlobalStyle, keyframes } from 'styled-components';
import logo from '/src/assets/images.png';

const { Content, Footer, Header } = Layout;
const { Title, Text } = Typography;

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
  max-width: 480px;
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

const StyledPasswordInput = styled(Input.Password)`
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

const SubjectItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 14px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  margin-bottom: 8px;
  color: #fff;
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
const TeacherSignin = () => {
  const [loading, setLoading] = useState(false);
  const [sessionChecking, setSessionChecking] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const teacherData = useSelector((state) => state.teacher?.data || {});

  // SESSION CHECK
  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch('https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/teacherSignin.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ action: 'check_session' }),
        });

        const data = await response.json();
        if (data.status === 'success') {
          const teacherInfo = {
            teacher_id: data.session_data.teacher_id,
            tech_name: data.session_data.tech_name,
            tech_email: data.session_data.tech_email,
            teacher_section: data.session_data.teacher_section,
            teacher_no: data.session_data.teacher_no,
            subjects: data.session_data.subjects || [],
            sessionExpires: data.session_data.session_expires,
            expiresAt: Date.now() + data.session_data.session_expires * 1000,
          };
          dispatch(setTeacher(teacherInfo));
          localStorage.setItem('teacher', JSON.stringify(teacherInfo));
          localStorage.setItem('teacher_id', data.session_data.teacher_id);
        } else {
          clearAuthData();
        }
      } catch (error) {
        console.error('Session check error:', error);
        clearAuthData();
      } finally {
        setSessionChecking(false);
      }
    };

    checkSession();
  }, [dispatch]);

  const clearAuthData = () => {
    dispatch(clearTeacher());
    localStorage.removeItem('teacher');
    localStorage.removeItem('teacher_id');
  };

  const isAuthenticated = () => {
    const teacherId = localStorage.getItem('teacher_id');
    if (!teacherId) return false;

    const teacherData = localStorage.getItem('teacher');
    if (teacherData) {
      const parsedData = JSON.parse(teacherData);
      return parsedData.expiresAt > Date.now();
    }
    return false;
  };

  const handleSignIn = async (values) => {
    setLoading(true);
    try {
      const response = await fetch('https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/teacherSignin.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          tech_email: values.email,
          teacher_password: values.password,
        }),
      });

      const data = await response.json();

      if (data.status === 'success') {
        const teacherInfo = {
          teacher_id: data.teacher.id,
          tech_name: data.teacher.tech_name,
          tech_email: data.teacher.tech_email,
          teacher_section: data.teacher.teacher_section,
          teacher_no: data.teacher.teacher_no,
          subjects: data.subjects || [],
          sessionExpires: data.session_expires,
          expiresAt: Date.now() + data.session_expires * 1000,
        };

        dispatch(setTeacher(teacherInfo));
        localStorage.setItem('teacher', JSON.stringify(teacherInfo));
        localStorage.setItem('teacher_id', data.teacher.id);

        message.success(`Welcome back, ${teacherInfo.tech_name}!`);
        navigate('/teacher/dashboard');
      } else {
        throw new Error(data.message || 'Authentication failed');
      }
    } catch (error) {
      console.error('Sign-in error:', error);
      message.error(error.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLogoutLoading(true);
    try {
      const response = await fetch('https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/teacherSignin.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ action: 'logout' }),
      });
  
      const data = await response.json();
      if (data.status === 'success') {
        clearAuthData();
        message.success('Logged out successfully');
        setIsModalVisible(false);
        navigate('/teacher-signIn');
      } else {
        throw new Error(data.message || 'Logout failed');
      }
    } catch (error) {
      console.error('Logout error:', error);
      message.error(error.message || 'Logout failed');
      navigate('/teacher-signIn');
    } finally {
      setLogoutLoading(false);
    }
  };
  
  if (sessionChecking) {
    return (
      <StyledLayout style={{ justifyContent: 'center', alignItems: 'center' }}>
        <Spin size="large" tip="Verifying Faculty Session..." />
      </StyledLayout>
    );
  }

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
                <ReadOutlined />
              </div>
              <h2 className="title">Faculty Portal</h2>
              <p className="subtitle">Sign in to access academic courses & grading</p>
            </BadgeHeader>

            {!isAuthenticated() ? (
              <Form layout="vertical" onFinish={handleSignIn}>
                <Form.Item
                  name="email"
                  rules={[
                    { required: true, message: 'Please input your email!' },
                    { type: 'email', message: 'Please enter a valid email!' },
                  ]}
                >
                  <StyledInput
                    prefix={<MailOutlined />}
                    placeholder="Faculty Email (teacher@apex.edu.pk)"
                    size="large"
                  />
                </Form.Item>

                <Form.Item
                  name="password"
                  rules={[{ required: true, message: 'Please input your password!' }]}
                >
                  <StyledPasswordInput
                    prefix={<LockOutlined />}
                    placeholder="Security Password"
                    size="large"
                  />
                </Form.Item>

                <Form.Item style={{ marginBottom: 0 }}>
                  <SubmitButton type="primary" htmlType="submit" loading={loading} block size="large">
                    {loading ? 'Authenticating...' : 'Sign In to Faculty Portal'}
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
                  {teacherData?.tech_name || 'Faculty Member'}
                </h3>
                <p style={{ color: '#d4af37', fontSize: '0.9rem', margin: 0, fontWeight: 600 }}>
                  {teacherData?.tech_email || 'teacher@apexcollege.edu.pk'}
                </p>

                <Divider style={{ borderColor: 'rgba(255,255,255,0.1)', margin: '20px 0' }} />

                {teacherData?.subjects?.length > 0 && (
                  <div style={{ textAlign: 'left', marginBottom: 24 }}>
                    <Text style={{ color: '#cbd5e1', fontWeight: 700, fontSize: '0.85rem', letterSpacing: 1, textTransform: 'uppercase', display: 'block', marginBottom: 10 }}>
                      Assigned Subjects
                    </Text>
                    <div style={{ maxHeight: 180, overflowY: 'auto' }}>
                      {teacherData.subjects.map((subj, index) => (
                        <SubjectItem key={index}>
                          <span style={{ fontWeight: 600 }}>{subj.subject_name || 'Subject'}</span>
                          <Tag color="#d4af37" style={{ color: '#0b1b3d', fontWeight: 700, margin: 0 }}>
                            Sec {subj.section_name || 'A'}
                          </Tag>
                        </SubjectItem>
                      ))}
                    </div>
                  </div>
                )}

                <Space direction="vertical" style={{ width: '100%' }} size="middle">
                  <SubmitButton
                    icon={<DashboardOutlined />}
                    block
                    size="large"
                    onClick={() => navigate('/teacher/dashboard')}
                  >
                    Go to Faculty Dashboard
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
                    onClick={() => setIsModalVisible(true)}
                  >
                    Sign Out
                  </Button>
                </Space>
              </div>
            )}
          </LoginCard>
        </StyledContent>

        {/* Logout Modal */}
        <Modal
          title={
            <Space style={{ color: '#0b1b3d' }}>
              <LogoutOutlined style={{ color: '#ff4d4f' }} />
              <span>Confirm Sign Out</span>
            </Space>
          }
          open={isModalVisible}
          onOk={handleLogout}
          onCancel={() => setIsModalVisible(false)}
          okText="Sign Out"
          cancelText="Cancel"
          okButtonProps={{
            danger: true,
            loading: logoutLoading,
            icon: <LogoutOutlined />,
          }}
          centered
        >
          <p style={{ margin: 0, color: '#475569' }}>Are you sure you want to sign out from your faculty account?</p>
        </Modal>

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

export default TeacherSignin;