/* eslint-disable no-unused-vars */
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { loginStart, loginSuccess, loginFailure } from '../redux/authSlice';
import { Card, Typography, Alert, Form, Input, Button, message } from 'antd';
import { Link, useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

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
    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '50px' }}>
      {!studentData ? (
        <Card title="Student Sign In" style={{ width: 400, textAlign: 'center' }}>
          {error && (
            <Alert 
              message="Error" 
              description={error} 
              type="error" 
              showIcon 
              style={{ marginBottom: '20px' }} 
              closable
              onClose={() => setError('')}
            />
          )}
          <Form layout="vertical" onFinish={handleSignIn}>
            <Form.Item
              label="Full Name"
              name="name"
              rules={[{ required: true, message: 'Please enter your full name' }]}
            >
              <Input placeholder="Enter your full name" allowClear />
            </Form.Item>

            <Form.Item
              label="Class Number"
              name="class_number"
              rules={[{ required: true, message: 'Please enter your class number' }]}
            >
              <Input placeholder="Enter your class number" allowClear />
            </Form.Item>

            <Form.Item>
              <Button 
                type="primary" 
                htmlType="submit" 
                block 
                loading={loading}
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </Button>
            </Form.Item>
          </Form>
        </Card>
      ) : (
        <Card 
          title={`Welcome, ${studentData.name}!`} 
          style={{ width: '80%', maxWidth: '600px' }}
        >
          {/* <div style={{ marginBottom: '20px' }}>
            <Title level={4}>Student Information</Title>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div>
                <Text strong>Student ID:</Text>
                <div>{studentData.studentId}</div>
              </div>
              <div>
                <Text strong>Section ID:</Text>
                <div>{studentData.sectionId}</div>
              </div>
              <div>
                <Text strong>Section Name:</Text>
                <div>{studentData.section_name}</div>
              </div>
            </div>
          </div> */}

          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <Link to="/student/dashboard">
              <Button type="primary" size="large" style={{ marginRight: 16 }}>
                Go to Dashboard
              </Button>
            </Link>
            <Button danger type="primary" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};

export default StudentSignin;
