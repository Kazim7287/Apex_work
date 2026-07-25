/* eslint-disable react/prop-types */
import  { useState, useEffect } from "react";
import { 
    Modal, 
    Form, 
    Input, 
    Typography,
    Space,
    Divider,
    Tag,
    Avatar,
    Alert,
    Button,
    Spin,Col,Row,
    message
} from "antd";
import { 
    UserOutlined,
    MailOutlined
} from '@ant-design/icons';
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;

const API_BASE_URL = 'https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/';

const AdminProfile = ({ visible, onCancel }) => {
    const [adminProfile, setAdminProfile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [apiStatus, setApiStatus] = useState({ success: null, message: '' });
    const [profileForm] = Form.useForm();
    const navigate = useNavigate();

    // Fetch admin profile
    const fetchAdminProfile = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_BASE_URL}Admindata.php`, {
                credentials: 'include',
                headers: {
                    'Accept': 'application/json',
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.success) {
                setAdminProfile(data.data);
                return data.data;
            } else {
                if (data.authenticated === false) {
                    navigate('/admin-signIn');
                }
                throw new Error(data.error || 'Failed to fetch admin profile');
            }
        } catch (error) {
            console.error('Profile fetch error:', error);
            message.error(error.message);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    // Update admin profile
    const updateAdminProfile = async (values) => {
        try {
            setLoading(true);
            setApiStatus({ success: null, message: '' });
            
            const response = await fetch(`${API_BASE_URL}Admindata.php`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(values)
            });
            
            const data = await response.json();
            
            if (data.success) {
                setApiStatus({ success: true, message: data.message || 'Profile updated successfully' });
                await fetchAdminProfile();
            } else {
                throw new Error(data.error || 'Failed to update profile');
            }
        } catch (error) {
            console.error('Profile update error:', error);
            setApiStatus({ success: false, message: error.message });
            if (error.message.includes('Unauthorized')) {
                navigate('/admin-signIn');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (visible) {
            const loadProfile = async () => {
                try {
                    const profile = await fetchAdminProfile();
                    profileForm.setFieldsValue({
                        name: profile.name,
                        email: profile.email,
                        designation: profile.designation
                    });
                    setApiStatus({ success: null, message: '' });
                } catch (error) {
                    console.error('Error loading profile:', error);
                }
            };
            loadProfile();
        }
    }, [visible]);

    return (
        <Modal
            title={<Title level={4}>My Profile</Title>}
            visible={visible}
            onCancel={onCancel}
            footer={null}
            width={600}
        >
            {adminProfile ? (
                <>
                    {apiStatus.message && (
                        <Alert
                            message={apiStatus.message}
                            type={apiStatus.success ? 'success' : 'error'}
                            showIcon
                            style={{ marginBottom: 24 }}
                        />
                    )}
                    <Row gutter={16} style={{ marginBottom: 24 }}>
                        <Col span={6}>
                            <Avatar 
                                size={80}
                                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(adminProfile.name)}&background=random`}
                                icon={<UserOutlined />}
                            />
                        </Col>
                        <Col span={18}>
                            <Title level={4}>{adminProfile.name}</Title>
                            <Text type="secondary">{adminProfile.email}</Text>
                            <br />
                            <Tag color="blue">{adminProfile.designation}</Tag>
                        </Col>
                    </Row>

                    <Divider orientation="left">Profile Information</Divider>

                    <Form
                        form={profileForm}
                        layout="vertical"
                        onFinish={updateAdminProfile}
                    >
                        <Form.Item
                            label="Full Name"
                            name="name"
                            rules={[{ required: true, message: 'Please input your name!' }]}
                        >
                            <Input 
                                prefix={<UserOutlined />} 
                                placeholder="Your full name" 
                                size="large" 
                            />
                        </Form.Item>

                        <Form.Item
                            label="Email"
                            name="email"
                            rules={[
                                { required: true, message: 'Please input your email!' },
                                { type: 'email', message: 'Please enter a valid email!' }
                            ]}
                        >
                            <Input 
                                prefix={<MailOutlined />} 
                                placeholder="Your email address" 
                                size="large" 
                            />
                        </Form.Item>

                        <Form.Item
                            label="Designation"
                            name="designation"
                            rules={[{ required: true, message: 'Please input your designation!' }]}
                        >
                            <Input 
                                placeholder="Your designation" 
                                size="large" 
                            />
                        </Form.Item>

                        <Divider />

                        <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
                            <Space>
                                <Button 
                                    onClick={onCancel}
                                    size="large"
                                >
                                    Cancel
                                </Button>
                                <Button 
                                    type="primary" 
                                    htmlType="submit" 
                                    loading={loading}
                                    size="large"
                                >
                                    Update Profile
                                </Button>
                            </Space>
                        </Form.Item>
                    </Form>
                </>
            ) : (
                <Spin spinning={loading} tip="Loading profile...">
                    <div style={{ minHeight: '200px' }} />
                </Spin>
            )}
        </Modal>
    );
};

export default AdminProfile;