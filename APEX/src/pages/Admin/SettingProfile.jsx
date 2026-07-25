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
  TeamOutlined
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
                setIsModalVisible(false);
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

    // Handle edit profile
    const handleEdit = async () => {
        try {
            const profile = await fetchAdminProfile();
            setIsModalVisible(true);
            form.setFieldsValue({
                name: profile.name,
                email: profile.email,
                designation: profile.designation
            });
            setApiStatus({ success: null, message: '' });
        } catch (error) {
            console.error('Error loading profile:', error);
        }
    };

    useEffect(() => {
        fetchAdminProfile();
    }, []);

    return (
        <div style={{ padding: '24px' }}>
            <Card
                title={
                    <Title level={4} style={{ margin: 0 }}>
                        <UserOutlined style={{ marginRight: 8 }} />
                        My Profile
                    </Title>
                }
                bordered={false}
                style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.09)', borderRadius: 8 }}
                extra={
                    <Button 
                        type="primary" 
                        icon={<EditOutlined />}
                        onClick={handleEdit}
                    >
                        Edit Profile
                    </Button>
                }
            >
                {adminProfile ? (
                    <div>
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

                        <Descriptions column={1}>
                            <Descriptions.Item label="Full Name">
                                <Text strong>{adminProfile.name}</Text>
                            </Descriptions.Item>
                            <Descriptions.Item label="Email">
                                <Text strong>{adminProfile.email}</Text>
                            </Descriptions.Item>
                            <Descriptions.Item label="Designation">
                                <Text strong>{adminProfile.designation}</Text>
                            </Descriptions.Item>
                        </Descriptions>
                    </div>
                ) : (
                    <Spin spinning={loading} tip="Loading profile...">
                        <div style={{ minHeight: '200px' }} />
                    </Spin>
                )}
            </Card>


  <Space>
    <Button 
      type="default" 
      icon={<TeamOutlined />}
      onClick={() => navigate('/admin/admin-management')}
    >
      Manage Admins
    </Button>
    {/* <Button 
      type="primary" 
      icon={<EditOutlined />}
      onClick={handleEdit}
    >
      Edit Profile
    </Button> */}
  </Space>

            {/* Profile Edit Modal */}
            <Modal
                title={<Title level={4}>Edit Profile</Title>}
                visible={isModalVisible}
                onCancel={() => {
                    setIsModalVisible(false);
                    setApiStatus({ success: null, message: '' });
                }}
                footer={null}
                width={600}
            >
                {apiStatus.message && (
                    <Alert
                        message={apiStatus.message}
                        type={apiStatus.success ? 'success' : 'error'}
                        showIcon
                        style={{ marginBottom: 24 }}
                    />
                )}
                <Form
                    form={form}
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
                                onClick={() => setIsModalVisible(false)}
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
            </Modal>
        </div>
    );
};

export default AdminProfile;