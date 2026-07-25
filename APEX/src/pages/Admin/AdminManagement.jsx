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
  Divider,
  Tooltip,
  Row,
  Col,
  Badge,
  Grid,
  Select,
  Drawer,
  Statistic,
  Empty,
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
  CloseCircleOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const { Title, Text } = Typography;
const { Option } = Select;
const { useBreakpoint } = Grid;
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
  const screens = useBreakpoint();

  // Fetch all admins
  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}read_admin.php`, {
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch admins');
      
      const data = await response.json();
      
      if (data.status === 'success' || data.success) {
        // Ensure all admins have a status field
        const adminsWithStatus = (data.data || []).map(admin => ({
          ...admin,
          status: admin.status || 'active' // Default to active if status is missing
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

  // Create or update admin
  const handleSubmit = async (values) => {
    setSubmitLoading(true);
    try {
      const url = currentAdmin 
        ? `${API_BASE_URL}admindataupdate.php?id=${currentAdmin.id}`
        : `${API_BASE_URL}AddAdmin.php`;
      
      const method = currentAdmin ? 'PUT' : 'POST';
      
      // Prepare the request body with proper status handling
      const requestBody = {
        ...values,
        status: values.status ? 'active' : 'inactive' // Convert boolean to string
      };
      
      if (currentAdmin) {
        requestBody.id = currentAdmin.id;
      }
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(requestBody)
      });
      
      const data = await response.json();
      
      if (data.status === 'success' || data.success) {
        message.success(data.message || (currentAdmin ? 'Admin updated successfully' : 'Admin created successfully'));
        fetchAdmins();
        setIsModalVisible(false);
        form.resetFields();
        setCurrentAdmin(null);
      } else {
        throw new Error(data.message || (currentAdmin ? 'Failed to update admin' : 'Failed to create admin'));
      }
    } catch (error) {
      message.error(error.message);
    } finally {
      setSubmitLoading(false);
    }
  };

  // Delete admin
  const handleDelete = async (id) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}adminsdelete.php?id=${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      const data = await response.json();
      
      if (data.status === 'success') {
        message.success(data.message || 'Admin deleted successfully');
        fetchAdmins();
      } else {
        throw new Error(data.message || 'Failed to delete admin');
      }
    } catch (error) {
      message.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle filters
  const handleFilter = () => {
    let filtered = admins;

    // Filter by search text
    if (searchText) {
      filtered = filtered.filter(admin => 
        admin.name?.toLowerCase().includes(searchText.toLowerCase()) ||
        admin.email?.toLowerCase().includes(searchText.toLowerCase()) ||
        admin.designation?.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(admin => admin.status === statusFilter);
    }

    setFilteredAdmins(filtered);
  };

  // Handle reset
  const handleReset = () => {
    setSearchText('');
    setStatusFilter('all');
    setFilteredAdmins(admins);
  };

  // Handle view admin details
  const handleView = (admin) => {
    setCurrentAdmin(admin);
    setIsViewModalVisible(true);
  };

  // Handle edit admin
  const handleEdit = (admin) => {
    setCurrentAdmin(admin);
    setIsEditing(true);
    form.setFieldsValue({
      ...admin,
      status: admin.status === 'active', // Convert string to boolean for switch
      password: '' // Clear password field for security
    });
    setIsModalVisible(true);
  };

  // Handle add new admin
  const handleAdd = () => {
    setCurrentAdmin(null);
    setIsEditing(false);
    form.resetFields();
    form.setFieldsValue({
      status: true // Default to active for new admins
    });
    setIsModalVisible(true);
  };

  // Get status display
  const getStatusDisplay = (status) => {
    return status === 'active' ? 'Active' : 'Inactive';
  };

  // Get status color
  const getStatusColor = (status) => {
    return status === 'active' ? 'green' : 'red';
  };

  // Get status badge
  const getStatusBadge = (status) => {
    return status === 'active' ? 'success' : 'error';
  };

  // Responsive columns configuration
  const getColumns = () => {
    const baseColumns = [
      {
        title: 'Admin',
        dataIndex: 'name',
        key: 'name',
        fixed: screens.xs ? false : 'left',
        width: screens.xs ? 'auto' : 200,
        render: (text, record) => (
          <Space>
            <Avatar 
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(record.name)}&background=7265e6&color=fff`}
              icon={<UserOutlined />}
              size={screens.xs ? 'small' : 'default'}
            />
            <div>
              <Text strong style={{ fontSize: screens.xs ? '12px' : '14px' }}>
                {text}
              </Text>
              <br />
              <Text type="secondary" style={{ fontSize: screens.xs ? '10px' : '12px' }}>
                {record.email}
              </Text>
            </div>
          </Space>
        ),
      },
      {
        title: 'Designation',
        dataIndex: 'designation',
        key: 'designation',
        responsive: ['md'],
        render: (text) => text ? (
          <Tag color="blue" style={{ fontSize: screens.xs ? '10px' : '12px' }}>
            {text}
          </Tag>
        ) : '-',
      },
      {
        title: 'Status',
        dataIndex: 'status',
        key: 'status',
        width: screens.xs ? 80 : 100,
        render: (status) => (
          <Badge 
            status={getStatusBadge(status)} 
            text={
              <span style={{ fontSize: screens.xs ? '10px' : '12px' }}>
                {getStatusDisplay(status)}
              </span>
            }
          />
        ),
      },
      {
        title: 'Created',
        dataIndex: 'created_at',
        key: 'created_at',
        responsive: ['lg'],
        width: 120,
        render: (date) => date ? (
          <Tooltip title={dayjs(date).format('DD MMM YYYY, hh:mm A')}>
            <span style={{ fontSize: screens.xs ? '10px' : '12px' }}>
              {dayjs(date).fromNow()}
            </span>
          </Tooltip>
        ) : '-',
      }
    ];

    const actionColumn = {
      title: 'Actions',
      key: 'actions',
      align: 'right',
      width: screens.xs ? 100 : 150,
      fixed: screens.xs ? false : 'right',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="View Details">
            <Button 
              type="text" 
              size="small"
              icon={<EyeOutlined />} 
              onClick={() => handleView(record)}
            />
          </Tooltip>
          <Tooltip title="Edit">
            <Button 
              type="text" 
              size="small"
              icon={<EditOutlined />} 
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Popconfirm
              title="Are you sure to delete this admin?"
              description="This action cannot be undone."
              onConfirm={() => handleDelete(record.id)}
              okText="Yes"
              cancelText="No"
              placement="leftTop"
            >
              <Button 
                type="text" 
                danger 
                size="small"
                icon={<DeleteOutlined />}
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    };

    return [...baseColumns, actionColumn];
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  useEffect(() => {
    handleFilter();
  }, [searchText, statusFilter, admins]);

  const statsData = [
    {
      title: 'Total Admins',
      value: admins.length,
      prefix: <TeamOutlined />,
      valueStyle: { color: '#1890ff' }
    },
    {
      title: 'Active',
      value: admins.filter(a => a.status === 'active').length,
      prefix: <CheckCircleOutlined />,
      valueStyle: { color: '#52c41a' }
    },
    {
      title: 'Inactive',
      value: admins.filter(a => a.status === 'inactive').length,
      prefix: <CloseCircleOutlined />,
      valueStyle: { color: '#ff4d4f' }
    }
  ];

  const renderForm = () => (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
    >
      <Row gutter={16}>
        <Col xs={24} sm={12}>
          <Form.Item
            label="Full Name"
            name="name"
            rules={[{ required: true, message: 'Please input the name!' }]}
          >
            <Input 
              prefix={<UserOutlined />} 
              placeholder="Enter full name" 
              size="large" 
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12}>
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: 'Please input the email!' },
              { type: 'email', message: 'Please enter a valid email!' }
            ]}
          >
            <Input 
              prefix={<MailOutlined />} 
              placeholder="Enter email address" 
              size="large" 
            />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col xs={24} sm={12}>
          {!isEditing && (
            <Form.Item
              label="Password"
              name="password"
              rules={[
                { required: true, message: 'Please input the password!' },
                { min: 6, message: 'Password must be at least 6 characters!' }
              ]}
            >
              <Input.Password 
                prefix={<LockOutlined />} 
                placeholder="Enter password" 
                size="large"
              />
            </Form.Item>
          )}
        </Col>
        <Col xs={24} sm={12}>
          <Form.Item
            label="Designation"
            name="designation"
            rules={[{ required: true, message: 'Please input the designation!' }]}
          >
            <Input 
              placeholder="Enter designation" 
              size="large" 
            />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item
        label="Status"
        name="status"
        valuePropName="checked"
      >
        <Switch 
          checkedChildren="Active" 
          unCheckedChildren="Inactive" 
        />
      </Form.Item>

      <Divider />

      <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
        <Space>
          <Button 
            onClick={() => {
              setIsModalVisible(false);
              form.resetFields();
              setCurrentAdmin(null);
            }}
            size="large"
          >
            Cancel
          </Button>
          <Button 
            type="primary" 
            htmlType="submit" 
            loading={submitLoading}
            size="large"
            icon={isEditing ? <EditOutlined /> : <PlusOutlined />}
          >
            {isEditing ? 'Update Admin' : 'Add Admin'}
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );

  return (
    <div style={{ 
      padding: screens.xs ? '12px' : '24px', 
      background: '#f5f7fa', 
      minHeight: '100vh' 
    }}>
      {/* Statistics Row */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {statsData.map((stat, index) => (
          <Col xs={8} sm={8} md={6} lg={6} xl={6} key={index}>
            <Card size="small" style={{ borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.09)' }}>
              <Statistic
                title={stat.title}
                value={stat.value}
                prefix={stat.prefix}
                valueStyle={stat.valueStyle}
              />
            </Card>
          </Col>
        ))}
      </Row>

      <Card
        title={
          <Row justify="space-between" align="middle" gutter={[16, 16]}>
            <Col>
              <Title level={4} style={{ margin: 0, fontSize: screens.xs ? '16px' : '20px' }}>
                <TeamOutlined style={{ marginRight: 8 }} />
                Admin Management
              </Title>
            </Col>
            <Col>
              <Space wrap size={screens.xs ? 'small' : 'middle'}>
                <Input
                  placeholder="Search admins..."
                  prefix={<SearchOutlined />}
                  allowClear
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  style={{ width: screens.xs ? 150 : 200 }}
                  size={screens.xs ? 'small' : 'middle'}
                />
                <Select
                  placeholder="Status"
                  value={statusFilter}
                  onChange={setStatusFilter}
                  style={{ width: screens.xs ? 100 : 120 }}
                  size={screens.xs ? 'small' : 'middle'}
                  allowClear
                >
                  <Option value="all">All</Option>
                  <Option value="active">Active</Option>
                  <Option value="inactive">Inactive</Option>
                </Select>
                <Button 
                  icon={<ReloadOutlined />} 
                  onClick={handleReset}
                  size={screens.xs ? 'small' : 'middle'}
                >
                  {screens.xs ? '' : 'Reset'}
                </Button>
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />}
                  onClick={handleAdd}
                  size={screens.xs ? 'small' : 'middle'}
                >
                  {screens.xs ? '' : 'Add Admin'}
                </Button>
              </Space>
            </Col>
          </Row>
        }
        bordered={false}
        style={{ 
          boxShadow: '0 2px 8px rgba(0,0,0,0.09)', 
          borderRadius: 8,
          overflow: 'hidden'
        }}
        bodyStyle={{ padding: screens.xs ? '12px' : '16px' }}
      >
        <Table
          columns={getColumns()}
          dataSource={filteredAdmins}
          rowKey="id"
          loading={loading}
          scroll={{ x: 800 }}
          size={screens.xs ? 'small' : 'middle'}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: !screens.xs,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} of ${total} admins`
          }}
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  <Text type="secondary">
                    No admins found
                  </Text>
                }
              >
                <Button type="primary" onClick={handleAdd}>
                  Add First Admin
                </Button>
              </Empty>
            )
          }}
        />
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        title={isEditing ? 'Edit Admin' : 'Add New Admin'}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
          setCurrentAdmin(null);
        }}
        footer={null}
        destroyOnClose
        width={screens.xs ? '90%' : 700}
        style={{ 
          top: 20,
          maxWidth: '95vw'
        }}
        bodyStyle={{
          padding: '20px',
          maxHeight: '80vh',
          overflowY: 'auto'
        }}
      >
        {renderForm()}
      </Modal>

      {/* View Admin Modal */}
      <Modal
        title="Admin Details"
        open={isViewModalVisible}
        onCancel={() => setIsViewModalVisible(false)}
        footer={[
          <Button 
            key="edit" 
            type="primary" 
            onClick={() => {
              setIsViewModalVisible(false);
              handleEdit(currentAdmin);
            }}
          >
            Edit Admin
          </Button>,
          <Button key="close" onClick={() => setIsViewModalVisible(false)}>
            Close
          </Button>
        ]}
        width={600}
      >
        {currentAdmin && (
          <div>
            <Row gutter={16} style={{ marginBottom: 24 }}>
              <Col xs={24} sm={6}>
                <Avatar 
                  size={80}
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(currentAdmin.name)}&background=7265e6&color=fff`}
                  icon={<UserOutlined />}
                />
              </Col>
              <Col xs={24} sm={18}>
                <Title level={4}>{currentAdmin.name}</Title>
                <Text type="secondary">{currentAdmin.email}</Text>
                <br />
                <Tag color={getStatusColor(currentAdmin.status)}>
                  {getStatusDisplay(currentAdmin.status)}
                </Tag>
              </Col>
            </Row>

            <Divider orientation="left">Details</Divider>

            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col xs={24} sm={12}>
                <Text strong>Designation:</Text>
                <br />
                <Text>{currentAdmin.designation || '-'}</Text>
              </Col>
              <Col xs={24} sm={12}>
                <Text strong>Created At:</Text>
                <br />
                <Text>
                  {currentAdmin.created_at 
                    ? dayjs(currentAdmin.created_at).format('DD MMM YYYY, hh:mm A') 
                    : '-'}
                </Text>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Text strong>Last Updated:</Text>
                <br />
                <Text>
                  {currentAdmin.updated_at 
                    ? dayjs(currentAdmin.updated_at).format('DD MMM YYYY, hh:mm A') 
                    : '-'}
                </Text>
              </Col>
            </Row>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminManagement;