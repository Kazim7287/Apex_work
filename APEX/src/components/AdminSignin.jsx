import { useState, useEffect } from 'react';
import { Layout, Card, Input, Button, Typography, Divider, message, Spin } from 'antd';
import { LockOutlined, MailOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Content, Footer } = Layout;
const { Title, Text } = Typography;

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
                // Check if we have admin data in localStorage first
                const storedAdminData = localStorage.getItem('adminData');
                if (storedAdminData) {
                    try {
                        const parsedData = JSON.parse(storedAdminData);
                        console.log('Found existing admin data in localStorage:', parsedData);
                        setIsLoggedIn(true);
                        setAdminData(parsedData);
                        // Optionally verify with server
                        await verifySessionWithServer(parsedData);
                    } catch (e) {
                        console.error('Error parsing stored admin data:', e);
                        localStorage.removeItem('adminData');
                    }
                } else {
                    // If no localStorage data, check with server
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
                const response = await fetch('https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/AdminSignin.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({ action: 'check_session' })
                });

                if (!response.ok) throw new Error('Network response was not ok');

                const data = await response.json();
                // console.log('Session check response:', data);

                if (data.status === 'success') {
                    setIsLoggedIn(true);
                    setAdminData(data.admin_data || storedData);
                    localStorage.setItem('adminData', JSON.stringify(data.admin_data || storedData));
                } else {
                    handleLogoutCleanup();
                }
            } catch (error) {
                console.error('Error verifying session with server:', error);
                // If we have stored data but server verification failed, use the stored data
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
                credentials: 'include',
                body: JSON.stringify({ 
                    email: email,
                    password: password
                })
            });

            if (!response.ok) throw new Error('Network response was not ok');

            const data = await response.json();
            // console.log('Login response:', data);

            if (data.status === 'success') {
                setIsLoggedIn(true);
                setAdminData(data.admin);
                localStorage.setItem('adminData', JSON.stringify(data.admin));
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
                credentials: 'include',
                body: JSON.stringify({ action: 'logout' })
            });

            // Even if the logout request fails, we'll still clear the client-side state
            handleLogoutCleanup();
            
            if (response.ok) {
                const data = await response.json();
                console.log('Logout response:', data);
                if (data.status === 'success') {
                    message.success('Logged out successfully');
                } else {
                    message.warning('Logged out locally but server logout may have failed');
                }
            } else {
                message.warning('Logged out locally but server logout may have failed');
            }
            
            navigate('/admin-signIn'); // Ensure we redirect to login page
        } catch (error) {
            console.error('Logout error:', error);
            handleLogoutCleanup();
            navigate('/admin/admin-signIn');
            message.warning('Logged out locally but server logout may have failed');
        }
    };

    // Show loading state until session check is complete
    if (!sessionChecked) {
        return (
            <Layout style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Spin size="large" />
            </Layout>
        );
    }

    if (isLoggedIn) {
        return (
            <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
                <Content style={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center',
                    padding: '24px'
                }}>
                    <Card
                        style={{ 
                            width: '100%', 
                            maxWidth: '450px',
                            borderRadius: '8px',
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                        }}
                        bodyStyle={{ padding: '32px' }}
                    >
                        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                            <Title level={3}>Welcome back, {adminData?.name || 'Admin'}!</Title>
                            <Text type="secondary">You are logged in as {adminData?.designation || 'Administrator'}</Text>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <Button 
                                type="primary" 
                                size="large"
                                onClick={() => navigate('/admin/dashboard')}
                            >
                                Go to Dashboard
                            </Button>

                            <Button 
                                type="default" 
                                size="large"
                                onClick={handleLogout}
                                loading={loading}
                            >
                                Logout
                            </Button>
                        </div>
                    </Card>
                </Content>
                <Footer style={{ textAlign: 'center', padding: '16px 50px', backgroundColor: '#f0f2f5' }}>
                    <Text type="secondary">
                        Powered by MUHAMMAD KAZIM AHMAD AND YOUSAF SHAH
                    </Text>
                </Footer>
            </Layout>
        );
    }

    return (
        <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
            <Content style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center',
                padding: '24px'
            }}>
                <Card
                    hoverable
                    style={{ 
                        width: '100%', 
                        maxWidth: '450px',
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                    }}
                    bodyStyle={{ padding: '32px' }}
                >
                    <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                        <Title level={3}>Admin Portal</Title>
                        <Text type="secondary">Sign in to access the admin dashboard</Text>
                    </div>

                    <div>
                        <Input
                            prefix={<MailOutlined />}
                            placeholder="Email"
                            size="large"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            style={{ marginBottom: '16px' }}
                        />

                        <Input.Password
                            prefix={<LockOutlined />}
                            placeholder="Password"
                            size="large"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={{ marginBottom: '24px' }}
                            onPressEnter={handleSignIn}
                        />

                        <Button 
                            type="primary" 
                            size="large"
                            block
                            loading={loading}
                            onClick={handleSignIn}
                        >
                            Sign In
                        </Button>
                    </div>
                </Card>
            </Content>

            <Footer style={{ 
                textAlign: 'center',
                padding: '16px 50px',
                backgroundColor: '#f0f2f5'
            }}>
                <Text type="secondary">
                    Powered by MUHAMMAD KAZIM AHMAD AND YOUSAF SHAH
                </Text>
            </Footer>
        </Layout>
    );
};

export default AdminLogin;