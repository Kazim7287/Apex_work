import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Button, 
  Modal, 
  Form, 
  Input, 
  message, 
  Space, 
  Popconfirm, 
  Card, 
  Typography, 
  Tag, 
  Avatar, 
  Tooltip, 
  Row, 
  Col, 
  Badge, 
  Select, 
  Statistic, 
  Switch 
} from 'antd';
import { 
  EditOutlined, 
  DeleteOutlined, 
  PlusOutlined, 
  UserOutlined, 
  MailOutlined, 
  LockOutlined, 
  TeamOutlined, 
  SearchOutlined, 
  ReloadOutlined, 
  EyeOutlined, 
  CheckCircleOutlined, 
  CrownOutlined 
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;
const API_BASE_URL = 'https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/';

const AdminManagement = () => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [currentAdmin, setCurrentAdmin] = useState(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [filteredAdmins, setFilteredAdmins] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    fetchAdmins();
  }, []);

  useEffect(() => {
    filterAdmins();
  }, [searchText, statusFilter, admins]);

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}read_admin.php`, {
        credentials: 'include',
        headers: { 'Accept': 'application/json' }
      });
      
      if (!response.ok) throw new Error('Failed to fetch admins');
      const data = await response.json();
      
      if (data.status === 'success' || data.success) {
        const adminsWithStatus = (data.data || []).map(admin => ({
          ...admin,
          status: admin.status || 'active'
        }));
        setAdmins(adminsWithStatus);
        setFilteredAdmins(adminsWithStatus);
      } else {
        throw new Error(data.message || 'Failed to load admins');
      }
    } catch (error) {
      message.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const filterAdmins = () => {
    let result = [...admins];
    if (searchText) {
      const query = searchText.toLowerCase();
      result = result.filter(a => 
        a.name?.toLowerCase().includes(query) || 
        a.email?.toLowerCase().includes(query) || 
        a.designation?.toLowerCase().includes(query)
      );
    }
    if (statusFilter !== 'all') {
      result = result.filter(a => a.status === statusFilter);
    }
    setFilteredAdmins(result);
  };

  const handleSubmit = async (values) => {
    setSubmitLoading(true);
    try {
      const endpoint = isEditing ? 'admindataupdate.php' : 'AddAdmin.php';
      const payload = isEditing ? { ...values, id: currentAdmin.id } : values;
      
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      });
      
      const data = await response.json();
      if (data.status === 'success' || data.success) {
        message.success(isEditing ? 'Admin updated successfully' : 'Admin created successfully');
        setIsModalVisible(false);
        form.resetFields();
        fetchAdmins();
      } else {
        throw new Error(data.message || 'Action failed');
      }
    } catch (error) {
      message.error(error.message);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}adminsdelete.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ id })
      });
      const data = await response.json();
      if (data.status === 'success' || data.success) {
        message.success('Admin deleted successfully');
        fetchAdmins();
      } else {
        throw new Error(data.message || 'Failed to delete admin');
      }
    } catch (error) {
      message.error(error.message);
    }
  };

  const openCreateModal = () => {
    setIsEditing(false);
    setCurrentAdmin(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const openEditModal = (admin) => {
    setIsEditing(true);
    setCurrentAdmin(admin);
    form.setFieldsValue({
      name: admin.name,
      email: admin.email,
      designation: admin.designation,
      is_super_admin: admin.is_super_admin === 1 || admin.is_super_admin === '1',
      status: admin.status || 'active'
    });
    setIsModalVisible(true);
  };

  const openViewModal = (admin) => {
    setCurrentAdmin(admin);
    setIsViewModalVisible(true);
  };

  const columns = [
    {
      title: 'Administrator',
      dataIndex: 'name',
      key: 'name',
      render: (name, record) => (
        <Space>
          <Avatar style={{ background: 'linear-gradient(135deg, #0b1b3d 0%, #1e3a8a 100%)', color: '#d4af37', fontWeight: 700 }}>
            {name?.charAt(0)?.toUpperCase() || 'A'}
          </Avatar>
          <div>
            <Text strong style={{ color: '#0f172a', display: 'block', lineHeight: 1.2 }}>
              {name} {record.is_super_admin === 1 && <CrownOutlined style={{ color: '#d4af37', marginLeft: 4 }} />}
            </Text>
            <Text style={{ fontSize: 11, color: '#64748b' }}>{record.designation || 'System Admin'}</Text>
          </div>
        </Space>
      )
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      render: (email) => (
        <Text style={{ color: '#334155' }}>
          <MailOutlined style={{ marginRight: 6, color: '#1e3a8a' }} />
          {email}
        </Text>
      )
    },
    {
      title: 'Role',
      dataIndex: 'is_super_admin',
      key: 'role',
      align: 'center',
      render: (isSuper) => (
        isSuper === 1 || isSuper === '1' ? (
          <Tag color="gold" style={{ background: '#fefce8', color: '#b8860b', border: '1px solid rgba(212, 175, 55, 0.3)', borderRadius: 12, fontWeight: 700 }}>
            👑 Super Admin
          </Tag>
        ) : (
          <Tag color="blue" style={{ borderRadius: 12 }}>Sub Admin</Tag>
        )
      )
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      align: 'center',
      render: (status) => (
        status === 'active' ? (
          <Tag icon={<CheckCircleOutlined />} color="success" style={{ borderRadius: 12, padding: '2px 10px' }}>Active</Tag>
        ) : (
          <Tag color="error" style={{ borderRadius: 12 }}>Inactive</Tag>
        )
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      align: 'center',
      width: 150,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="View Details">
            <Button type="primary" icon={<EyeOutlined />} onClick={() => openViewModal(record)} size="small" style={{ background: '#0b1b3d', borderRadius: 6 }} />
          </Tooltip>
          <Tooltip title="Edit Admin">
            <Button type="primary" icon={<EditOutlined />} onClick={() => openEditModal(record)} size="small" style={{ background: '#1e3a8a', borderRadius: 6 }} />
          </Tooltip>
          <Popconfirm title="Delete Admin" description="Are you sure to delete this admin user?" onConfirm={() => handleDelete(record.id)} okText="Yes" cancelText="No" okButtonProps={{ danger: true }}>
            <Tooltip title="Delete Admin">
              <Button type="primary" danger icon={<DeleteOutlined />} size="small" style={{ borderRadius: 6 }} />
            </Tooltip>
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto' }}>
      {/* Stat Cards Row */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <Card size="small" className="apex-card" bodyStyle={{ padding: 16 }}>
            <Statistic title="Total Administrators" value={admins.length} prefix={<TeamOutlined style={{ color: '#0b1b3d' }} />} valueStyle={{ color: '#0b1b3d', fontWeight: 800 }} />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card size="small" className="apex-card" bodyStyle={{ padding: 16 }}>
            <Statistic title="Super Administrators" value={admins.filter(a => a.is_super_admin === 1 || a.is_super_admin === '1').length} prefix={<CrownOutlined style={{ color: '#d4af37' }} />} valueStyle={{ color: '#b8860b', fontWeight: 800 }} />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card size="small" className="apex-card" bodyStyle={{ padding: 16 }}>
            <Statistic title="Active Admin Accounts" value={admins.filter(a => a.status === 'active').length} prefix={<CheckCircleOutlined style={{ color: '#10b981' }} />} valueStyle={{ color: '#10b981', fontWeight: 800 }} />
          </Card>
        </Col>
      </Row>

      {/* Main Admin Management Card */}
      <Card
        className="apex-card"
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: 'linear-gradient(135deg, #0b1b3d 0%, #1e3a8a 100%)', color: '#d4af37', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
              <LockOutlined />
            </div>
            <div>
              <Title level={4} style={{ margin: 0, color: '#0b1b3d', fontWeight: 700 }}>
                System Admin Users & Roles
              </Title>
              <Text style={{ color: '#64748b', fontSize: 12 }}>Manage administrative accounts, role levels, and account access</Text>
            </div>
          </div>
        }
        extra={
          <Space wrap>
            <Input placeholder="Search admin..." prefix={<SearchOutlined style={{ color: '#94a3b8' }} />} value={searchText} onChange={(e) => setSearchText(e.target.value)} allowClear style={{ width: 200, borderRadius: 8 }} />
            <Button type="text" icon={<ReloadOutlined />} onClick={fetchAdmins} loading={loading} style={{ borderRadius: 8 }} />
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal} className="apex-btn-gold">
              Add New Admin
            </Button>
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={filteredAdmins}
          rowKey="id"
          loading={loading}
          scroll={{ x: 'max-content' }}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      {/* Create / Edit Admin Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <LockOutlined style={{ color: '#d4af37' }} />
            <span>{isEditing ? `Edit Admin #${currentAdmin?.id}` : 'Create System Admin'}</span>
          </div>
        }
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={600}
        centered
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit} style={{ paddingTop: 12 }}>
          <Row gutter={[16, 8]}>
            <Col xs={24} sm={12}>
              <Form.Item name="name" label={<Text strong>Full Name</Text>} rules={[{ required: true, message: 'Please enter name' }]}>
                <Input placeholder="John Doe" prefix={<UserOutlined />} style={{ borderRadius: 8 }} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="email" label={<Text strong>Email Address</Text>} rules={[{ required: true, type: 'email', message: 'Please enter email' }]}>
                <Input placeholder="admin@apex.edu" prefix={<MailOutlined />} style={{ borderRadius: 8 }} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="designation" label={<Text strong>Designation</Text>} rules={[{ required: true, message: 'Please enter designation' }]}>
                <Input placeholder="IT Manager / System Director" style={{ borderRadius: 8 }} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="password" label={<Text strong>{isEditing ? 'Password (Leave blank to keep)' : 'Password'}</Text>} rules={[{ required: !isEditing, message: 'Please set password' }]}>
                <Input.Password placeholder="Set account password" prefix={<LockOutlined />} style={{ borderRadius: 8 }} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="is_super_admin" label={<Text strong>Super Admin Rights</Text>} valuePropName="checked">
                <Switch checkedChildren="Super Admin" unCheckedChildren="Standard Admin" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="status" label={<Text strong>Account Status</Text>} initialValue="active">
                <Select style={{ borderRadius: 8 }}>
                  <Option value="active">Active</Option>
                  <Option value="inactive">Inactive</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24}>
              <Button type="primary" htmlType="submit" loading={submitLoading} block className="apex-btn-gold" style={{ height: 40, marginTop: 8 }}>
                {isEditing ? 'Save Admin Details' : 'Create Admin Account'}
              </Button>
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* View Admin Details Modal */}
      <Modal
        title="Admin User Account Details"
        open={isViewModalVisible}
        onCancel={() => setIsViewModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsViewModalVisible(false)} style={{ borderRadius: 8 }}>
            Close
          </Button>
        ]}
        centered
      >
        {currentAdmin && (
          <div style={{ paddingTop: 12 }}>
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <Avatar size={64} style={{ background: '#0b1b3d', color: '#d4af37', fontSize: 28, fontWeight: 700 }}>
                {currentAdmin.name?.charAt(0)?.toUpperCase()}
              </Avatar>
              <Title level={4} style={{ margin: '8px 0 0 0', color: '#0b1b3d' }}>{currentAdmin.name}</Title>
              <Text style={{ color: '#64748b' }}>{currentAdmin.designation || 'System Admin'}</Text>
            </div>
            <div style={{ background: '#f8fafc', padding: 16, borderRadius: 12, border: '1px solid #e2e8f0' }}>
              <p><strong>Admin ID:</strong> #{currentAdmin.id}</p>
              <p><strong>Email:</strong> {currentAdmin.email}</p>
              <p><strong>Super Admin Status:</strong> {currentAdmin.is_super_admin === 1 ? '👑 Super Admin' : 'Standard Admin'}</p>
              <p><strong>Account Status:</strong> {currentAdmin.status || 'active'}</p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminManagement;