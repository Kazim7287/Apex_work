import React, { useState, useEffect } from 'react';
import {
  Table, Button, Modal, message, Card, Typography, Tag, Space,
  Row, Col, Spin, Alert, Select, Popconfirm, Form,
  Statistic, Badge, Tooltip, Input, Checkbox, Divider
} from 'antd';
import {
  KeyOutlined, ReloadOutlined, UserOutlined,
  SearchOutlined, DeleteOutlined,
  CrownOutlined, TeamOutlined, UserAddOutlined,
  CheckCircleOutlined, BookOutlined, NotificationOutlined, FileTextOutlined,
  EditOutlined, SaveOutlined
} from '@ant-design/icons';
import { usePermissions } from '../../contexts/PermissionContext';
import PermissionGuard from '../../components/PermissionGuard';

const { Title, Text } = Typography;
const { Option } = Select;
const API_BASE_URL = 'https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/';

const PermissionManagementContent = () => {
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

  const permissionOptions = [
    { label: 'Dashboard View', value: 'dashboard_view', icon: <KeyOutlined />, category: 'Dashboard & Core' },
    { label: 'Students View', value: 'students_view', icon: <TeamOutlined />, category: 'Dashboard & Core' },
    { label: 'Teachers View', value: 'teachers_view', icon: <UserOutlined />, category: 'Dashboard & Core' },
    { label: 'Classes View', value: 'classes_view', icon: <BookOutlined />, category: 'Dashboard & Core' },
    
    { label: 'Announcements View', value: 'announcements_view', icon: <NotificationOutlined />, category: 'Announcements' },
    { label: 'Announcements Manage', value: 'announcements_manage', icon: <NotificationOutlined />, category: 'Announcements' },
    
    { label: 'Exams View', value: 'exams_view', icon: <FileTextOutlined />, category: 'Exams' },
    { label: 'Exams Manage', value: 'exams_manage', icon: <FileTextOutlined />, category: 'Exams' },
    
    { label: 'Books View', value: 'books_view', icon: <BookOutlined />, category: 'Books' },
    { label: 'Books Manage', value: 'books_manage', icon: <BookOutlined />, category: 'Books' },
    { label: 'Books Delete', value: 'books_delete', icon: <DeleteOutlined />, category: 'Books' },
    
    { label: 'Students Manage', value: 'students_manage', icon: <TeamOutlined />, category: 'Students Management' },
    { label: 'Students Delete', value: 'students_delete', icon: <DeleteOutlined />, category: 'Students Management' },
    
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
    
    { label: 'Admin Management', value: 'admins_manage', icon: <KeyOutlined />, category: 'Admin & Settings' },
    { label: 'Permission Management', value: 'permissions_manage', icon: <KeyOutlined />, category: 'Admin & Settings' },
    { label: 'Settings & Profile View', value: 'settings_view', icon: <KeyOutlined />, category: 'Admin & Settings' }
  ];

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

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}read_admin.php`, { credentials: 'include' });
      if (!response.ok) throw new Error('Failed to fetch admins');
      const data = await response.json();
      
      if (data.status === 'success' || data.success) {
        const adminsData = data.data || [];
        const adminsWithPermissions = await Promise.all(
          adminsData.map(async (admin) => {
            try {
              const permRes = await fetch(`${API_BASE_URL}get_admin_permissions.php?admin_id=${admin.id}`, { credentials: 'include' });
              if (permRes.ok) {
                const permData = await permRes.json();
                return {
                  ...admin,
                  permissions: permData.permissions || []
                };
              }
            } catch (err) {
              console.error(`Failed to fetch permissions for admin ${admin.id}:`, err);
            }
            return { ...admin, permissions: [] };
          })
        );
        setAdmins(adminsWithPermissions);
      }
    } catch (error) {
      message.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditPermissions = (admin) => {
    setSelectedAdmin(admin);
    setSelectedPermissions(admin.permissions || []);
    setIsEditModalVisible(true);
  };

  const handleSavePermissions = async () => {
    if (!selectedAdmin) return;
    setEditLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}update_admin_permissions.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          admin_id: selectedAdmin.id,
          permissions: selectedPermissions
        })
      });
      const data = await response.json();
      if (data.status === 'success' || data.success) {
        message.success(`Permissions updated for ${selectedAdmin.name}`);
        setIsEditModalVisible(false);
        fetchAdmins();
      } else {
        throw new Error(data.message || 'Failed to update permissions');
      }
    } catch (error) {
      message.error(error.message);
    } finally {
      setEditLoading(false);
    }
  };

  const handleTogglePermission = (value) => {
    if (selectedPermissions.includes(value)) {
      setSelectedPermissions(selectedPermissions.filter(p => p !== value));
    } else {
      setSelectedPermissions([...selectedPermissions, value]);
    }
  };

  const handleSelectCategoryAll = (categoryPermissions) => {
    const categoryValues = categoryPermissions.map(p => p.value);
    const allSelected = categoryValues.every(val => selectedPermissions.includes(val));
    if (allSelected) {
      setSelectedPermissions(selectedPermissions.filter(p => !categoryValues.includes(p)));
    } else {
      const newPerms = [...selectedPermissions];
      categoryValues.forEach(val => {
        if (!newPerms.includes(val)) newPerms.push(val);
      });
      setSelectedPermissions(newPerms);
    }
  };

  const renderPermissionGroups = () => {
    const groups = getPermissionsByCategory();
    return Object.keys(groups).map(category => {
      const categoryPerms = groups[category];
      const categoryValues = categoryPerms.map(p => p.value);
      const isAllSelected = categoryValues.every(val => selectedPermissions.includes(val));
      const isSomeSelected = categoryValues.some(val => selectedPermissions.includes(val)) && !isAllSelected;

      return (
        <Card 
          key={category} 
          size="small" 
          style={{ marginBottom: 14, borderRadius: 10, border: '1px solid #e2e8f0' }}
          title={
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text strong style={{ color: '#0b1b3d' }}>{category}</Text>
              <Checkbox 
                checked={isAllSelected}
                indeterminate={isSomeSelected}
                onChange={() => handleSelectCategoryAll(categoryPerms)}
              >
                Select All
              </Checkbox>
            </div>
          }
        >
          <Row gutter={[12, 10]}>
            {categoryPerms.map(perm => {
              const isChecked = selectedPermissions.includes(perm.value);
              return (
                <Col xs={24} sm={12} key={perm.value}>
                  <Checkbox
                    checked={isChecked}
                    onChange={() => handleTogglePermission(perm.value)}
                  >
                    <Space size="small">
                      <span style={{ color: isChecked ? '#1e3a8a' : '#94a3b8' }}>{perm.icon}</span>
                      <Text style={{ fontSize: 13, color: isChecked ? '#0f172a' : '#64748b' }}>{perm.label}</Text>
                    </Space>
                  </Checkbox>
                </Col>
              );
            })}
          </Row>
        </Card>
      );
    });
  };

  const columns = [
    {
      title: 'Administrator',
      dataIndex: 'name',
      key: 'name',
      render: (name, record) => (
        <Space>
          <UserOutlined style={{ color: '#d4af37', fontSize: 18 }} />
          <div>
            <Text strong style={{ color: '#0f172a', display: 'block' }}>
              {name} {record.is_super_admin === 1 && <CrownOutlined style={{ color: '#d4af37', marginLeft: 4 }} />}
            </Text>
            <Text style={{ fontSize: 11, color: '#64748b' }}>{record.email}</Text>
          </div>
        </Space>
      )
    },
    {
      title: 'Account Type',
      dataIndex: 'is_super_admin',
      key: 'role',
      align: 'center',
      render: (isSuper) => (
        isSuper === 1 || isSuper === '1' ? (
          <Tag color="gold" style={{ background: '#fefce8', color: '#b8860b', border: '1px solid rgba(212, 175, 55, 0.3)', borderRadius: 12, fontWeight: 700 }}>
            👑 Super Admin (All Granted)
          </Tag>
        ) : (
          <Tag color="blue" style={{ borderRadius: 12 }}>Sub Admin</Tag>
        )
      )
    },
    {
      title: 'Active Permissions',
      key: 'permissions_count',
      render: (_, record) => {
        if (record.is_super_admin === 1 || record.is_super_admin === '1') {
          return <Tag color="green" style={{ borderRadius: 12 }}>Full Access ({permissionOptions.length}/{permissionOptions.length})</Tag>;
        }
        const count = record.permissions?.length || 0;
        return (
          <Tag color={count > 0 ? 'processing' : 'default'} style={{ borderRadius: 12 }}>
            {count} / {permissionOptions.length} Granted
          </Tag>
        );
      }
    },
    {
      title: 'Actions',
      key: 'actions',
      align: 'center',
      width: 160,
      render: (_, record) => (
        <Button 
          type="primary" 
          icon={<EditOutlined />} 
          onClick={() => handleEditPermissions(record)}
          disabled={record.is_super_admin === 1 || record.is_super_admin === '1'}
          className="apex-btn-gold"
          size="small"
        >
          Manage Permissions
        </Button>
      )
    }
  ];

  const filteredAdminsList = admins.filter(a => 
    a.name?.toLowerCase().includes(searchText.toLowerCase()) || 
    a.email?.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto' }}>
      <Card
        className="apex-card"
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: 'linear-gradient(135deg, #0b1b3d 0%, #1e3a8a 100%)', color: '#d4af37', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
              <KeyOutlined />
            </div>
            <div>
              <Title level={4} style={{ margin: 0, color: '#0b1b3d', fontWeight: 700 }}>
                Role & Feature Access Permissions
              </Title>
              <Text style={{ color: '#64748b', fontSize: 12 }}>Grant granular section and module view/edit rights to sub-administrators</Text>
            </div>
          </div>
        }
        extra={
          <Space wrap>
            <Input 
              placeholder="Search admin user..." 
              prefix={<SearchOutlined style={{ color: '#94a3b8' }} />} 
              value={searchText} 
              onChange={(e) => setSearchText(e.target.value)} 
              allowClear 
              style={{ width: 220, borderRadius: 8 }} 
            />
            <Button type="text" icon={<ReloadOutlined />} onClick={fetchAdmins} loading={loading} style={{ borderRadius: 8 }} />
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={filteredAdminsList}
          rowKey="id"
          loading={loading}
          scroll={{ x: 'max-content' }}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      {/* Edit Permissions Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <KeyOutlined style={{ color: '#d4af37' }} />
            <span>Manage Access Rights for {selectedAdmin?.name}</span>
          </div>
        }
        open={isEditModalVisible}
        onCancel={() => setIsEditModalVisible(false)}
        onOk={handleSavePermissions}
        confirmLoading={editLoading}
        okText="Save Permissions"
        cancelText="Cancel"
        okButtonProps={{ className: 'apex-btn-gold' }}
        width={750}
        centered
      >
        <div style={{ paddingTop: 12 }}>
          <Alert 
            message={`Selected ${selectedPermissions.length} of ${permissionOptions.length} total system permissions`}
            type="info"
            showIcon
            style={{ marginBottom: 16, borderRadius: 8 }}
          />

          {renderPermissionGroups()}
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