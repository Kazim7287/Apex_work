import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setTeacher, clearTeacher } from '../redux/teacherSlice';
import { Form, Input, message, Modal } from 'antd';

const TeacherSignin = () => {
  const [loading, setLoading] = useState(false);
  const [sessionChecking, setSessionChecking] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const teacherData = useSelector((state) => state.teacher?.data || {});

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

    const stored = localStorage.getItem('teacher');
    if (stored) {
      const parsedData = JSON.parse(stored);
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
      <div className="auth-page">
        <p className="lede">Verifying faculty session…</p>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div>
        <p className="eyebrow">Faculty</p>
        <h1 className="display">Teacher login</h1>
        <p className="lede">Attendance, assignments and grading — the academic rooms of Apex.</p>
        <Link to="/choose-user" className="btn btn--ghost">All portals</Link>
      </div>
      <div className="auth-card">
        {!isAuthenticated() ? (
          <Form layout="vertical" onFinish={handleSignIn}>
            <Form.Item
              name="email"
              rules={[
                { required: true, message: 'Please input your email!' },
                { type: 'email', message: 'Please enter a valid email!' },
              ]}
            >
              <Input placeholder="Faculty email" size="large" />
            </Form.Item>
            <Form.Item name="password" rules={[{ required: true, message: 'Please input your password!' }]}>
              <Input.Password placeholder="Password" size="large" />
            </Form.Item>
            <button className="btn btn--gold" type="submit" disabled={loading} style={{ width: '100%' }}>
              {loading ? 'Authenticating…' : 'Enter faculty portal'}
            </button>
          </Form>
        ) : (
          <div>
            <h1>{teacherData?.tech_name || 'Faculty Member'}</h1>
            <p>{teacherData?.tech_email}</p>
            {teacherData?.subjects?.length > 0 && (
              <ul>
                {teacherData.subjects.map((subj, index) => (
                  <li key={index}>
                    {subj.subject_name || 'Subject'} · Sec {subj.section_name || 'A'}
                  </li>
                ))}
              </ul>
            )}
            <div className="hero__row" style={{ marginTop: '1.2rem' }}>
              <button className="btn btn--gold" type="button" onClick={() => navigate('/teacher/dashboard')}>
                Dashboard
              </button>
              <button className="btn btn--ink" type="button" onClick={() => setIsModalVisible(true)}>
                Sign out
              </button>
            </div>
          </div>
        )}
      </div>
      <Modal
        title="Confirm sign out"
        open={isModalVisible}
        onOk={handleLogout}
        onCancel={() => setIsModalVisible(false)}
        okText="Sign out"
        confirmLoading={logoutLoading}
        centered
      >
        <p>Sign out of the faculty portal?</p>
      </Modal>
    </div>
  );
};

export default TeacherSignin;
