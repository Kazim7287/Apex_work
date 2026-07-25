import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
} from 'antd';
import {
  LockOutlined,
  MailOutlined,
  UserOutlined,
  LogoutOutlined,
  DashboardOutlined,
} from '@ant-design/icons';

const { Title, Text } = Typography;

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

        message.success(`Welcome, ${teacherInfo.tech_name}!`);
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
        navigate('/teacher-signIn'); // ✅ Updated here
      } else {
        throw new Error(data.message || 'Logout failed');
      }
    } catch (error) {
      console.error('Logout error:', error);
      message.error(error.message || 'Logout failed');
      navigate('/teacher-signIn'); // ✅ fallback also updated
    } finally {
      setLogoutLoading(false);
    }
  };
  
  if (sessionChecking) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          backgroundColor: '#f0f2f5',
        }}
      >
        <Spin size="large" tip="Loading..." />
      </div>
    );
  }

  return (
    <div
      style={{
        maxWidth: 500,
        margin: '50px auto',
        padding: 20,
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Card
        bordered
        style={{
          width: '100%',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          borderRadius: 8,
        }}
      >
        <Title level={3} style={{ textAlign: 'center', marginBottom: 24, color: '#1890ff' }}>
          Teacher Portal
        </Title>

        {!isAuthenticated() ? (
          <>
            <Title level={4} style={{ textAlign: 'center', marginBottom: 24 }}>
              Sign In
            </Title>
            <Form layout="vertical" onFinish={handleSignIn}>
              <Form.Item
                label="Email"
                name="email"
                rules={[
                  { required: true, message: 'Please input your email!' },
                  { type: 'email', message: 'Please enter a valid email!' },
                ]}
              >
                <Input
                  prefix={<MailOutlined style={{ color: 'rgba(0,0,0,.25)' }} />}
                  placeholder="teacher@school.edu"
                  size="large"
                />
              </Form.Item>

              <Form.Item
                label="Password"
                name="password"
                rules={[{ required: true, message: 'Please input your password!' }]}
              >
                <Input.Password
                  prefix={<LockOutlined style={{ color: 'rgba(0,0,0,.25)' }} />}
                  placeholder="Password"
                  size="large"
                />
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit" loading={loading} block size="large">
                  {loading ? 'Signing In...' : 'Sign In'}
                </Button>
              </Form.Item>
            </Form>
          </>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <Avatar
              size={80}
              icon={<UserOutlined />}
              style={{
                backgroundColor: '#1890ff',
                marginBottom: 16,
                fontSize: 32,
              }}
            />

            <Title level={4}>{teacherData?.tech_name || 'Teacher'}</Title>
            <Text type="secondary">{teacherData?.tech_email || 'teacher@school.edu'}</Text>

            <Divider />


            {teacherData?.subjects?.length > 0 && (
              <>
                <Divider orientation="left">
                  <Text strong>Your Subjects</Text>
                </Divider>
                <div
                  style={{
                    maxHeight: 200,
                    overflowY: 'auto',
                    padding: '0 8px',
                    marginBottom: 16,
                  }}
                >
                  {teacherData.subjects.map((subj, index) => (
                    <div
                      key={index}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: 8,
                        padding: '8px 12px',
                        backgroundColor: index % 2 === 0 ? '#f9f9f9' : 'transparent',
                        borderRadius: 4,
                      }}
                    >
                      <Text strong>{subj.subject_name || 'Unnamed Subject'}</Text>
                      <Text type="secondary">Section {subj.section_name || 'N/A'}</Text>
                    </div>
                  ))}
                </div>
              </>
            )}

            <Space direction="vertical" style={{ width: '100%', marginTop: 24 }}>
              <Button
                type="primary"
                icon={<DashboardOutlined />}
                block
                size="large"
                onClick={() => navigate('/teacher/dashboard')}
              >
                Go to Dashboard
              </Button>
              <Button
                danger
                icon={<LogoutOutlined />}
                block
                size="large"
                onClick={() => setIsModalVisible(true)}
              >
                Logout
              </Button>
            </Space>
          </div>
        )}
      </Card>

      <Modal
        title={
          <Space>
            <LogoutOutlined style={{ color: '#ff4d4f' }} />
            <span>Confirm Logout</span>
          </Space>
        }
        open={isModalVisible}
        onOk={handleLogout}
        onCancel={() => setIsModalVisible(false)}
        okText="Logout"
        cancelText="Cancel"
        okButtonProps={{
          danger: true,
          loading: logoutLoading,
          icon: <LogoutOutlined />,
        }}
      >
        <Text>Are you sure you want to logout from your account?</Text>
      </Modal>
    </div>
  );
};

export default TeacherSignin;
