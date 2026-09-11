import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { loginStart, loginSuccess, loginFailure } from '../redux/authSlice';
import { Alert, Form, Input, message } from 'antd';
import { Link, useNavigate } from 'react-router-dom';

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
          class_no: values.class_number.toString(),
        }),
        credentials: 'include',
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
        sessionId: data.session_id,
      }));

      setStudentData({
        studentId: data.user.id,
        name: data.user.name,
        sectionId: data.user.section_id,
        section_name: data.user.section_name,
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
        body: JSON.stringify({ action: 'logout' }),
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
    <div className="auth-page">
      <div>
        <p className="eyebrow">Students</p>
        <h1 className="display">Student login</h1>
        <p className="lede">Courses, attendance, results — sign in with the name and class number on your record.</p>
        <Link to="/choose-user" className="btn btn--ghost">All portals</Link>
      </div>
      <div className="auth-card">
        {error && (
          <div className="alert-inline">
            <Alert message={error} type="error" showIcon closable onClose={() => setError('')} />
          </div>
        )}
        {!studentData ? (
          <Form layout="vertical" onFinish={handleSignIn}>
            <Form.Item name="name" rules={[{ required: true, message: 'Please enter your full name' }]}>
              <Input placeholder="Full name" size="large" />
            </Form.Item>
            <Form.Item name="class_number" rules={[{ required: true, message: 'Please enter your class number' }]}>
              <Input placeholder="Class roll / student number" size="large" />
            </Form.Item>
            <button className="btn btn--gold" type="submit" disabled={loading} style={{ width: '100%' }}>
              {loading ? 'Authenticating…' : 'Enter student portal'}
            </button>
          </Form>
        ) : (
          <div>
            <h1>{studentData.name}</h1>
            <p>Section {studentData.section_name || 'Assigned'} · #{studentData.studentId}</p>
            <div className="hero__row" style={{ marginTop: '1.2rem' }}>
              <button className="btn btn--gold" type="button" onClick={() => navigate('/student/dashboard')}>
                Dashboard
              </button>
              <button className="btn btn--ink" type="button" onClick={handleLogout}>
                Sign out
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentSignin;
