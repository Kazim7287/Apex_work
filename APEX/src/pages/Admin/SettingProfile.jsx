import React, { useState, useEffect } from "react";
import { 
  Card, 
  Typography,
  Space,
  Button,
  Modal,
  Form,
  Input,
  Avatar,
  Alert,
  Spin,
  Descriptions,
  Tag,
  Divider,
  Row,
  Col,
  message
} from "antd";
import { 
  UserOutlined,
  MailOutlined,
  EditOutlined,
  CrownOutlined,
  SettingOutlined,
  SafetyCertificateOutlined
} from '@ant-design/icons';
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;
const API_BASE_URL = 'https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/';

const AdminProfile = () => {
    const [adminProfile, setAdminProfile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [form] = Form.useForm();
    const [apiStatus, setApiStatus] = useState({ success: null, message: '' });
    const navigate = useNavigate();

    const fetchAdminProfile = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_BASE_URL}Admindata.php`, {
                credentials: 'include',
                headers: { 'Accept': 'application/json' }
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
        } finally {
            setLoading(false);
        }
    };

    const updateAdminProfile = async (values) => {
        try {
            setLoading(true);
            setApiStatus({ success: null, message: '' });
            
            const response = await fetch(`${API_BASE_URL}Admindata.php`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(values)
            });
            
            const data = await response.json();
            
            if (data.success) {
                setApiStatus({ success: true, message: data.message || 'Profile updated successfully' });
                message.success('Profile updated successfully');
                await fetchAdminProfile();
                setIsModalVisible(false);
            } else {
                throw new Error(data.error || 'Failed to update profile');
            }
        } catch (error) {
            console.error('Profile update error:', error);
            setApiStatus({ success: false, message: error.message });
            message.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAdminProfile();
    }, []);

    const showEditModal = () => {
        if (adminProfile) {
            form.setFieldsValue({
                name: adminProfile.name,
                email: adminProfile.email,
                designation: adminProfile.designation,
                password: ''
            });
        }
        setIsModalVisible(true);
    };

    if (loading && !adminProfile) {
        return (
            <div style={{ textAlign: 'center', padding: '80px 0' }}>
                <Spin size="large" />
                <Text style={{ display: 'block', marginTop: 16, color: '#64748b' }}>Loading Profile Information...</Text>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
            {apiStatus.message && (
                <Alert
                    message={apiStatus.success ? "Success" : "Error"}
                    description={apiStatus.message}
                    type={apiStatus.success ? "success" : "error"}
                    showIcon
                    closable
                    style={{ marginBottom: 20, borderRadius: 10 }}
                />
            )}

            {/* Profile Hero Header Card */}
            <Card
                className="apex-card"
                bodyStyle={{ padding: 0 }}
                style={{ overflow: 'hidden', marginBottom: 24 }}
            >
                <div style={{ 
                    background: 'linear-gradient(135deg, #061129 0%, #0b1b3d 50%, #1e3a8a 100%)', 
                    padding: '36px 32px',
                    color: '#ffffff',
                    position: 'relative'
                }}>
                    <Row align="middle" gutter={[24, 24]}>
                        <Col>
                            <Avatar
                                size={84}
                                style={{ 
                                    background: 'linear-gradient(135deg, #d4af37 0%, #b8860b 100%)',
                                    color: '#ffffff',
                                    fontSize: 36,
                                    fontWeight: 700,
                                    border: '3px solid #ffffff',
                                    boxShadow: '0 8px 24px rgba(0,0,0,0.3)'
                                }}
                            >
                                {adminProfile?.name?.charAt(0)?.toUpperCase() || 'A'}
                            </Avatar>
                        </Col>
                        <Col flex="1">
                            <Title level={2} style={{ color: '#ffffff', margin: 0, fontWeight: 800 }}>
                                {adminProfile?.name || 'Administrator'}
                            </Title>
                            <Text style={{ color: '#d4af37', fontSize: 15, fontWeight: 600, display: 'block', marginTop: 2 }}>
                                {adminProfile?.designation || 'System Administrator'}
                            </Text>
                            <Space style={{ marginTop: 10 }}>
                                <Tag color="gold" style={{ borderRadius: 12, padding: '2px 10px', fontWeight: 700 }}>
                                    <CrownOutlined /> Verified Administrator
                                </Tag>
                                <Tag color="blue" style={{ borderRadius: 12, padding: '2px 10px' }}>
                                    ID #{adminProfile?.id || '1'}
                                </Tag>
                            </Space>
                        </Col>
                        <Col>
                            <Button 
                                type="primary"
                                icon={<EditOutlined />}
                                onClick={showEditModal}
                                className="apex-btn-gold"
                                size="large"
                            >
                                Edit Profile
                            </Button>
                        </Col>
                    </Row>
                </div>
            </Card>

            {/* Profile Overview Details */}
            <Card
                className="apex-card"
                title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <SettingOutlined style={{ color: '#d4af37' }} />
                        <Title level={4} style={{ margin: 0, color: '#0b1b3d', fontWeight: 700 }}>
                            Account Information & Credentials
                        </Title>
                    </div>
                }
            >
                <Descriptions bordered column={{ xs: 1, sm: 2 }} size="middle">
                    <Descriptions.Item label={<Text strong><UserOutlined style={{ marginRight: 6, color: '#1e3a8a' }} /> Full Name</Text>}>
                        {adminProfile?.name}
                    </Descriptions.Item>
                    <Descriptions.Item label={<Text strong><MailOutlined style={{ marginRight: 6, color: '#1e3a8a' }} /> Email Address</Text>}>
                        {adminProfile?.email}
                    </Descriptions.Item>
                    <Descriptions.Item label={<Text strong><SafetyCertificateOutlined style={{ marginRight: 6, color: '#1e3a8a' }} /> Designation</Text>}>
                        {adminProfile?.designation}
                    </Descriptions.Item>
                    <Descriptions.Item label={<Text strong><CrownOutlined style={{ marginRight: 6, color: '#d4af37' }} /> Access Level</Text>}>
                        <Tag color="gold" style={{ borderRadius: 12, fontWeight: 700 }}>Super Administrator</Tag>
                    </Descriptions.Item>
                </Descriptions>
            </Card>

            {/* Edit Profile Modal */}
            <Modal
                title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <EditOutlined style={{ color: '#d4af37' }} />
                        <span>Update Admin Profile Settings</span>
                    </div>
                }
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                footer={null}
                width={550}
                centered
                destroyOnClose
            >
                <Form form={form} layout="vertical" onFinish={updateAdminProfile} style={{ paddingTop: 12 }}>
                    <Form.Item name="name" label={<Text strong>Full Name</Text>} rules={[{ required: true, message: 'Please enter name' }]}>
                        <Input prefix={<UserOutlined />} style={{ borderRadius: 8 }} />
                    </Form.Item>

                    <Form.Item name="email" label={<Text strong>Email Address</Text>} rules={[{ required: true, type: 'email', message: 'Please enter valid email' }]}>
                        <Input prefix={<MailOutlined />} style={{ borderRadius: 8 }} />
                    </Form.Item>

                    <Form.Item name="designation" label={<Text strong>Designation</Text>} rules={[{ required: true, message: 'Please enter designation' }]}>
                        <Input style={{ borderRadius: 8 }} />
                    </Form.Item>

                    <Form.Item name="password" label={<Text strong>Password (Leave empty if unchanged)</Text>}>
                        <Input.Password placeholder="Enter new password" style={{ borderRadius: 8 }} />
                    </Form.Item>

                    <Button type="primary" htmlType="submit" loading={loading} block className="apex-btn-gold" style={{ height: 40, marginTop: 8 }}>
                        Save Profile Changes
                    </Button>
                </Form>
            </Modal>
        </div>
    );
};

export default AdminProfile;