// src/pages/Admin/PermissionManagement.jsx
import React, { useState, useEffect } from 'react';
import {
  Table, Button, Modal, message, Card, Typography, Tag, Space,
  Row, Col, Spin, Alert, Select, Popconfirm, Form,
  Statistic, Badge, Grid, Tooltip, Input, Checkbox, Divider
} from 'antd';
import {
  KeyOutlined, ReloadOutlined, UserOutlined,
  SearchOutlined, DeleteOutlined,
  ApiOutlined, CrownOutlined, TeamOutlined, UserAddOutlined,
  CheckCircleOutlined, CloseCircleOutlined,
  BookOutlined, NotificationOutlined, FileTextOutlined,
  EditOutlined, SaveOutlined, CloseOutlined
} from '@ant-design/icons';
import { usePermissions } from '../../contexts/PermissionContext';
import PermissionGuard from '../../components/PermissionGuard';

const { Title, Text } = Typography;
const { Option } = Select;
const { useBreakpoint } = Grid;

const API_BASE_URL = 'https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/';

const PermissionManagementContent = () => {
  const screens = useBreakpoint();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [isAssignModalVisible, setIsAssignModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editForm] = Form.useForm();
  const [assignForm] = Form.useForm();
  const [assignLoading, setAssignLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const { isSuperAdmin } = usePermissions();

  // Permission options based on Sidebar menu items and Dashboard features
  const permissionOptions = [
    // Dashboard & Core Views
    { label: 'Dashboard View', value: 'dashboard_view', icon: <KeyOutlined />, category: 'Dashboard & Core' },
    { label: 'Students View', value: 'students_view', icon: <TeamOutlined />, category: 'Dashboard & Core' },
    { label: 'Teachers View', value: 'teachers_view', icon: <UserOutlined />, category: 'Dashboard & Core' },
    { label: 'Classes View', value: 'classes_view', icon: <BookOutlined />, category: 'Dashboard & Core' },
    
    // Announcements
    { label: 'Announcements View', value: 'announcements_view', icon: <NotificationOutlined />, category: 'Announcements' },
    { label: 'Announcements Manage', value: 'announcements_manage', icon: <NotificationOutlined />, category: 'Announcements' },
    
    // Exams
    { label: 'Exams View', value: 'exams_view', icon: <FileTextOutlined />, category: 'Exams' },
    { label: 'Exams Manage', value: 'exams_manage', icon: <FileTextOutlined />, category: 'Exams' },
    
    // Books
    { label: 'Books View', value: 'books_view', icon: <BookOutlined />, category: 'Books' },
    { label: 'Books Manage', value: 'books_manage', icon: <BookOutlined />, category: 'Books' },
    { label: 'Books Delete', value: 'books_delete', icon: <DeleteOutlined />, category: 'Books' },
    
    // Students Management
    { label: 'Students Manage', value: 'students_manage', icon: <TeamOutlined />, category: 'Students Management' },
    { label: 'Students Delete', value: 'students_delete', icon: <DeleteOutlined />, category: 'Students Management' },
    
    // Other Features
    { label: 'Assignments View', value: 'assignments_view', icon: <KeyOutlined />, category: 'Other Features' },
    { label: 'Performance View', value: 'performance_view', icon: <KeyOutlined />, category: 'Other Features' },
    { label: 'Attendance View', value: 'attendance_view', icon: <KeyOutlined />, category: 'Other Features' },
    { label: 'Teacher Evaluations View', value: 'evaluations_view', icon: <KeyOutlined />, category: 'Other Features' },
    { label: 'Dues View', value: 'dues_view', icon: <KeyOutlined />, category: 'Other Features' },
    { label: 'Time Table View', value: 'timetable_view', icon: <KeyOutlined />, category: 'Other Features' },
    { label: 'Events & Calendar View', value: 'events_view', icon: <KeyOutlined />, category: 'Other Features' },
    { label: 'Student Applications View', value: 'applications_view', icon: <KeyOutlined />, category: 'Other Features' },
    { label: 'Feedback Management View', value: 'feedback_view', icon: <KeyOutlined />, category: 'Other Features' },
    { label: 'About Management View', value: 'about_view', icon: <KeyOutlined />, category: 'Other Features' },
    
    // Admin & Settings
    { label: 'Admin Management', value: 'admins_manage', icon: <KeyOutlined />, category: 'Admin & Settings' },
    { label: 'Permission Management', value: 'permissions_manage', icon: <KeyOutlined />, category: 'Admin & Settings' },
    { label: 'Settings & Profile View', value: 'settings_view', icon: <KeyOutlined />, category: 'Admin & Settings' }
  ];

  // Group permissions by category
  const getPermissionsByCategory = () => {
    const groups = {};
    permissionOptions.forEach(perm => {
      if (!groups[perm.category]) {
        groups[perm.category] = [];
      }
      groups[perm.category].push(perm);
    });
    return groups;
  };

  // Get all admins with their permissions
  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}read_admin.php`, {
        credentials: 'include'
      });
      const data = await response.json();
      if (data.status === 'success' || data.success) {
        // Fetch permissions for each admin
        const adminsWithPermissions = await Promise.all(
          (data.data || []).map(async (admin) => {
            try {
              const permResponse = await fetch(`${API_BASE_URL}get_admin_permissions.php?admin_id=${admin.id}`, {
                credentials: 'include'
              });
              const permData = await permResponse.json();
              return {
                ...admin,
                permissions: permData.success ? permData.data.map(p => p.permission_key) : []
              };
            } catch {
              return { ...admin, permissions: [] };
            }
          })
        );
        setAdmins(adminsWithPermissions);
      }
    } catch (error) {
      message.error('Failed to fetch admins');
    } finally {
      setLoading(false);
    }
  };

  // Handle assign single permission
  const handleAssignPermission = async (values) => {
    setAssignLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}insert_admin_permission.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          admin_id: values.admin_id,
          permission_key: values.permission_key,
          permission_value: 1
        })
      });

      const data = await response.json();

      if (data.success) {
        const adminName = admins.find(a => a.id === values.admin_id)?.name || 'Admin';
        const permLabel = permissionOptions.find(p => p.value === values.permission_key)?.label || values.permission_key;
        message.success(`✅ "${permLabel}" assigned to ${adminName}`);
        setIsAssignModalVisible(false);
        assignForm.resetFields();
        fetchAdmins();
      } else {
        throw new Error(data.message || 'Failed to assign permission');
      }
    } catch (error) {
      message.error(error.message);
    } finally {
      setAssignLoading(false);
    }
  };

  // Remove permission from admin (delete)
  const removePermission = async (adminId, permissionKey) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}delete_admin_permission.php`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          admin_id: adminId,
          permission_key: permissionKey
        })
      });

      const data = await response.json();
      if (data.success) {
        const adminName = admins.find(a => a.id === adminId)?.name || 'Admin';
        const permLabel = permissionOptions.find(p => p.value === permissionKey)?.label || permissionKey;
        message.success(`🗑️ "${permLabel}" removed from ${adminName}`);
        fetchAdmins();
      } else {
        throw new Error(data.message || 'Failed to remove permission');
      }
    } catch (error) {
      message.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle bulk permission update for an admin
  const handleBulkUpdate = async () => {
    if (!selectedAdmin) return;
    
    setEditLoading(true);
    try {
      const adminId = selectedAdmin.id;
      const permissions = selectedPermissions;
      
      // Get existing permissions
      const existingPerms = admins.find(a => a.id === adminId)?.permissions || [];
      
      // Delete permissions that are no longer selected
      const permsToDelete = existingPerms.filter(p => !permissions.includes(p));
      for (const perm of permsToDelete) {
        await fetch(`${API_BASE_URL}delete_admin_permission.php`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            admin_id: adminId,
            permission_key: perm
          })
        });
      }
      
      // Add new permissions
      const permsToAdd = permissions.filter(p => !existingPerms.includes(p));
      for (const perm of permsToAdd) {
        await fetch(`${API_BASE_URL}insert_admin_permission.php`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            admin_id: adminId,
            permission_key: perm,
            permission_value: 1
          })
        });
      }
      
      message.success(`✅ Permissions updated successfully for ${selectedAdmin?.name}`);
      setIsEditModalVisible(false);
      setSelectedAdmin(null);
      setSelectedPermissions([]);
      editForm.resetFields();
      fetchAdmins();
    } catch (error) {
      message.error('Failed to update permissions: ' + error.message);
    } finally {
      setEditLoading(false);
    }
  };

  // Open edit modal for admin
  const openEditModal = (admin) => {
    setSelectedAdmin(admin);
    const currentPermissions = admin.permissions || [];
    setSelectedPermissions(currentPermissions);
    editForm.setFieldsValue({
      permissions: currentPermissions
    });
    setIsEditModalVisible(true);
  };

  // Handle permission toggle in edit modal
  const handlePermissionToggle = (permissionValue, checked) => {
    if (checked) {
      setSelectedPermissions([...selectedPermissions, permissionValue]);
    } else {
      setSelectedPermissions(selectedPermissions.filter(p => p !== permissionValue));
    }
  };

  // Handle select all permissions in a category
  const handleSelectAllCategory = (category, checked) => {
    const categoryPerms = permissionOptions.filter(p => p.category === category);
    const categoryValues = categoryPerms.map(p => p.value);
    
    if (checked) {
      const newPerms = [...selectedPermissions];
      categoryValues.forEach(val => {
        if (!newPerms.includes(val)) {
          newPerms.push(val);
        }
      });
      setSelectedPermissions(newPerms);
    } else {
      setSelectedPermissions(selectedPermissions.filter(p => !categoryValues.includes(p)));
    }
  };

  // Check if all permissions in a category are selected
  const isCategoryFullySelected = (category) => {
    const categoryPerms = permissionOptions.filter(p => p.category === category);
    return categoryPerms.every(p => selectedPermissions.includes(p.value));
  };

  // Check if any permission in a category is selected
  const isCategoryPartiallySelected = (category) => {
    const categoryPerms = permissionOptions.filter(p => p.category === category);
    const selectedCount = categoryPerms.filter(p => selectedPermissions.includes(p.value)).length;
    return selectedCount > 0 && selectedCount < categoryPerms.length;
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  // Get filtered admins
  const filteredAdmins = admins.filter(admin =>
    admin.name?.toLowerCase().includes(searchText.toLowerCase()) ||
    admin.email?.toLowerCase().includes(searchText.toLowerCase())
  );

  // Get role display
  const getRoleDisplay = (role) => {
    const roles = {
      super_admin: { label: 'Super Admin', color: 'gold', icon: <CrownOutlined /> },
      admin: { label: 'Administrator', color: 'blue', icon: <TeamOutlined /> },
      sub_admin: { label: 'Sub Admin', color: 'cyan', icon: <UserAddOutlined /> }
    };
    return roles[role] || roles.admin;
  };

  // Admin columns
  const adminColumns = [
    {
      title: 'Admin',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Space>
          <UserOutlined style={{ color: '#7265e6' }} />
          <div>
            <Text strong>{text}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: 12 }}>{record.email}</Text>
          </div>
        </Space>
      )
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role) => {
        const roleInfo = getRoleDisplay(role);
        return <Tag color={roleInfo.color} icon={roleInfo.icon}>{roleInfo.label}</Tag>;
      }
    },
    {
      title: 'Designation',
      dataIndex: 'designation',
      key: 'designation',
      render: (text) => text || '-'
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Badge status={status === 'active' ? 'success' : 'error'} text={status === 'active' ? 'Active' : 'Inactive'} />
      )
    },
    {
      title: 'Assigned Permissions',
      key: 'permissions',
      render: (_, record) => {
        if (record.role === 'super_admin') {
          return <Tag color="gold">All Permissions</Tag>;
        }
        if (!record.permissions || record.permissions.length === 0) {
          return <Text type="secondary">No permissions assigned</Text>;
        }
        return (
          <Space wrap>
            {record.permissions.slice(0, 5).map(perm => {
              const permOption = permissionOptions.find(p => p.value === perm);
              const permLabel = permOption?.label || perm;
              const icon = permOption?.icon || <KeyOutlined />;
              return (
                <Tag 
                  key={perm} 
                  color="blue" 
                  icon={icon}
                  style={{ cursor: 'pointer' }}
                >
                  {permLabel}
                </Tag>
              );
            })}
            {record.permissions.length > 5 && (
              <Tag color="default">+{record.permissions.length - 5} more</Tag>
            )}
          </Space>
        );
      }
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 200,
      render: (_, record) => {
        if (record.role === 'super_admin') {
          return <Tag color="gold">Full Access</Tag>;
        }
        return (
          <Space>
            <Button
              type="primary"
              icon={<EditOutlined />}
              size="small"
              onClick={() => openEditModal(record)}
            >
              Manage
            </Button>
            <Popconfirm
              title="Remove all permissions?"
              description={`Are you sure you want to remove all permissions from ${record.name}?`}
              onConfirm={() => {
                const perms = record.permissions || [];
                perms.forEach(p => removePermission(record.id, p));
              }}
              okText="Yes"
              cancelText="No"
              okButtonProps={{ danger: true }}
            >
              <Button
                danger
                icon={<DeleteOutlined />}
                size="small"
              >
                Clear All
              </Button>
            </Popconfirm>
          </Space>
        );
      }
    }
  ];

  // Stats
  const totalAdmins = admins.length;
  const adminsWithPermissions = admins.filter(a => a.role !== 'super_admin' && a.permissions && a.permissions.length > 0).length;
  const superAdmins = admins.filter(a => a.role === 'super_admin').length;

  // Get all unique permissions assigned
  const allAssignedPermissions = new Set();
  admins.forEach(admin => {
    if (admin.permissions) {
      admin.permissions.forEach(p => allAssignedPermissions.add(p));
    }
  });

  // Render permission groups in modal
  const renderPermissionGroups = () => {
    const groups = getPermissionsByCategory();
    return Object.keys(groups).map(category => {
      const categoryPerms = groups[category];
      const fullySelected = isCategoryFullySelected(category);
      const partiallySelected = isCategoryPartiallySelected(category);
      
      return (
        <div key={category} style={{ marginBottom: 16, border: '1px solid #f0f0f0', borderRadius: 8, padding: '12px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
            <Checkbox
              checked={fullySelected}
              indeterminate={partiallySelected}
              onChange={(e) => handleSelectAllCategory(category, e.target.checked)}
            >
              <Text strong style={{ fontSize: 14 }}>{category}</Text>
            </Checkbox>
            <Text type="secondary" style={{ fontSize: 12, marginLeft: 8 }}>
              ({categoryPerms.filter(p => selectedPermissions.includes(p.value)).length}/{categoryPerms.length})
            </Text>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, paddingLeft: 24 }}>
            {categoryPerms.map(perm => (
              <Checkbox
                key={perm.value}
                checked={selectedPermissions.includes(perm.value)}
                onChange={(e) => handlePermissionToggle(perm.value, e.target.checked)}
                style={{ marginRight: 8 }}
              >
                <Space>
                  {perm.icon}
                  <span style={{ fontSize: 13 }}>{perm.label}</span>
                </Space>
              </Checkbox>
            ))}
          </div>
        </div>
      );
    });
  };

  return (
    <div style={{ padding: screens.xs ? '12px' : '24px', background: '#f5f7fa', minHeight: '100vh' }}>
      
      {/* Stats Cards */}
      <Row gutter={[12, 12]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={6}>
          <Card size="small">
            <Statistic title="Total Admins" value={totalAdmins} prefix={<UserOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card size="small">
            <Statistic 
              title="Admins with Permissions" 
              value={adminsWithPermissions} 
              prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />} 
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card size="small">
            <Statistic 
              title="Super Admins" 
              value={superAdmins} 
              prefix={<CrownOutlined style={{ color: '#faad14' }} />} 
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card size="small">
            <Statistic 
              title="Total Permissions Assigned" 
              value={allAssignedPermissions.size} 
              prefix={<KeyOutlined style={{ color: '#7265e6' }} />} 
            />
          </Card>
        </Col>
      </Row>

      {/* Main Card */}
      <Card
        title={
          <Row justify="space-between" align="middle">
            <Col>
              <Title level={4} style={{ margin: 0 }}>
                <KeyOutlined style={{ marginRight: 8, color: '#7265e6' }} />
                Permissionized Admins
              </Title>
            </Col>
            <Col>
              <Space>
                <Input
                  placeholder="Search admins..."
                  prefix={<SearchOutlined />}
                  allowClear
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  style={{ width: 200 }}
                  size="small"
                />
                <Button 
                  type="primary" 
                  icon={<ApiOutlined />} 
                  onClick={() => {
                    assignForm.resetFields();
                    setIsAssignModalVisible(true);
                  }}
                  size="small"
                  style={{ background: '#52c41a', borderColor: '#52c41a' }}
                >
                  Assign Permission
                </Button>
                <Button icon={<ReloadOutlined />} onClick={fetchAdmins} loading={loading} size="small">
                  Refresh
                </Button>
              </Space>
            </Col>
          </Row>
        }
        bordered={false}
        style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.09)', borderRadius: 8 }}
      >
        <Table
          columns={adminColumns}
          dataSource={filteredAdmins}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      {/* Assign Permission Modal */}
      <Modal
        title={
          <Space>
            <ApiOutlined style={{ color: '#52c41a' }} />
            <Text strong>Assign Permission to Admin</Text>
          </Space>
        }
        open={isAssignModalVisible}
        onCancel={() => {
          setIsAssignModalVisible(false);
          assignForm.resetFields();
        }}
        footer={[
          <Button key="cancel" onClick={() => {
            setIsAssignModalVisible(false);
            assignForm.resetFields();
          }}>
            Cancel
          </Button>,
          <Button 
            key="submit" 
            type="primary" 
            icon={<ApiOutlined />}
            loading={assignLoading} 
            onClick={() => assignForm.submit()}
            style={{ background: '#52c41a', borderColor: '#52c41a' }}
          >
            Assign Permission
          </Button>,
        ]}
        width={600}
        centered
        destroyOnClose
      >
        <Alert
          message="Assign Access to Admin"
          description="Select an admin and choose which access/permission to assign."
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />

        <Form
          form={assignForm}
          layout="vertical"
          onFinish={handleAssignPermission}
        >
          <Form.Item 
            name="admin_id" 
            label="Select Admin"
            rules={[{ required: true, message: 'Please select an admin!' }]}
          >
            <Select 
              placeholder="Select an admin" 
              size="large"
              loading={loading}
              showSearch
              optionFilterProp="children"
            >
              {admins.map(admin => (
                <Option key={admin.id} value={admin.id}>
                  <Space>
                    <UserOutlined />
                    {admin.name} ({admin.email})
                    <Tag color={admin.role === 'super_admin' ? 'gold' : 'blue'}>
                      {admin.role === 'super_admin' ? 'Super Admin' : admin.role || 'Admin'}
                    </Tag>
                  </Space>
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item 
            name="permission_key" 
            label="Select Access/Permission"
            rules={[{ required: true, message: 'Please select a permission!' }]}
          >
            <Select 
              placeholder="Select access" 
              size="large"
              showSearch
              optionFilterProp="children"
            >
              {permissionOptions.map(perm => (
                <Option key={perm.value} value={perm.value}>
                  <Space>
                    {perm.icon || <KeyOutlined style={{ color: '#7265e6' }} />}
                    {perm.label}
                  </Space>
                </Option>
              ))}
            </Select>
          </Form.Item>

          <div style={{ 
            background: '#f5f7fa', 
            padding: '12px 16px', 
            borderRadius: 4,
            marginTop: 8
          }}>
            <Text type="secondary" style={{ fontSize: 12 }}>
              <strong>📌 This will insert:</strong><br />
              INSERT INTO admin_permissions (admin_id, permission_key, permission_value) 
              VALUES (selected_admin, selected_permission, 1)
            </Text>
          </div>
        </Form>
      </Modal>

      {/* Edit Permissions Modal */}
      <Modal
        title={
          <Space>
            <EditOutlined style={{ color: '#1890ff' }} />
            <Text strong>Manage Permissions: {selectedAdmin?.name}</Text>
          </Space>
        }
        open={isEditModalVisible}
        onCancel={() => {
          setIsEditModalVisible(false);
          setSelectedAdmin(null);
          setSelectedPermissions([]);
          editForm.resetFields();
        }}
        width={800}
        centered
        destroyOnClose
        footer={[
          <Button 
            key="cancel" 
            icon={<CloseOutlined />}
            onClick={() => {
              setIsEditModalVisible(false);
              setSelectedAdmin(null);
              setSelectedPermissions([]);
              editForm.resetFields();
            }}
          >
            Cancel
          </Button>,
          <Button 
            key="submit" 
            type="primary" 
            icon={<SaveOutlined />}
            loading={editLoading} 
            onClick={handleBulkUpdate}
          >
            Save Changes
          </Button>,
        ]}
        styles={{
          body: { 
            padding: '24px',
            maxHeight: '70vh',
            overflowY: 'auto'
          }
        }}
      >
        <Alert
          message={`Managing permissions for ${selectedAdmin?.name}`}
          description="Select the permissions you want to assign to this admin. Unselected permissions will be removed."
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />

        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: 16,
          padding: '8px 12px',
          background: '#fafafa',
          borderRadius: 4
        }}>
          <Text strong>Selected: {selectedPermissions.length} permissions</Text>
          <Button 
            size="small" 
            onClick={() => {
              const allValues = permissionOptions.map(p => p.value);
              setSelectedPermissions(allValues);
            }}
          >
            Select All
          </Button>
        </div>

        <Form
          form={editForm}
          layout="vertical"
        >
          <Form.Item 
            name="permissions" 
            label="Assigned Permissions"
            style={{ display: 'none' }}
          >
            <Input />
          </Form.Item>
        </Form>

        {/* Permission Groups */}
        {renderPermissionGroups()}

        <Divider />

        <div style={{ 
          padding: '12px 16px', 
          background: '#fff7e6', 
          borderRadius: 4,
          border: '1px solid #ffd591'
        }}>
          <Text type="warning" style={{ fontSize: 12 }}>
            <strong>⚠️ Note:</strong> Changes will be applied immediately. 
            Permissions not selected will be removed from this admin.
          </Text>
        </div>

        <div style={{ 
          marginTop: 12,
          padding: '12px 16px', 
          background: '#f5f7fa', 
          borderRadius: 4
        }}>
          <Text type="secondary" style={{ fontSize: 12 }}>
            <strong>📌 Current permissions for {selectedAdmin?.name}:</strong>
            <br />
            <div style={{ marginTop: 8 }}>
              {selectedAdmin?.permissions?.length > 0 ? (
                <Space wrap>
                  {selectedAdmin.permissions.map(p => {
                    const label = permissionOptions.find(opt => opt.value === p)?.label || p;
                    return <Tag key={p} color="blue">{label}</Tag>;
                  })}
                </Space>
              ) : (
                <Text type="secondary">No permissions assigned</Text>
              )}
            </div>
          </Text>
        </div>
      </Modal>
    </div>
  );
};

const PermissionManagement = () => {
  return (
    <PermissionGuard requiredPermission="permissions_manage">
      <PermissionManagementContent />
    </PermissionGuard>
  );
};

export default PermissionManagement;