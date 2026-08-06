// src/pages/Admin/Sidebar.jsx
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Layout, Menu, Avatar, Typography, Spin, Badge, Button, Tooltip, Divider } from 'antd';
import {
  DashboardOutlined,
  UserOutlined,
  TeamOutlined,
  BookOutlined,
  CalendarOutlined,
  SettingOutlined,
  StarOutlined,
  ScheduleOutlined,
  FileTextOutlined,
  DollarOutlined,
  BellOutlined,
  MessageOutlined,
  InfoCircleOutlined,
  LockOutlined,
  KeyOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  LockFilled,
  CheckCircleOutlined
} from '@ant-design/icons';
import { usePermissions } from '../../contexts/PermissionContext';

const { Sider } = Layout;
const { Text } = Typography;

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { adminData, loading, isSuperAdmin, hasPermission, permissions } = usePermissions();

  console.log('🔍 Sidebar Debug:');
  console.log('  - isSuperAdmin:', isSuperAdmin);
  console.log('  - permissions:', permissions);
  console.log('  - loading:', loading);

  // Toggle sidebar
  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  // Define all menu items with their required permissions
  const allMenuItems = [
    {
      key: '/admin/dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
      permission: 'dashboard_view',
      description: 'View dashboard statistics'
    },
    {
      key: '/admin/students',
      icon: <UserOutlined />,
      label: 'Students',
      permission: 'students_view',
      description: 'Manage student records'
    },
    {
      key: '/admin/teachers',
      icon: <TeamOutlined />,
      label: 'Teachers',
      permission: 'teachers_view',
      description: 'Manage teacher records'
    },
    {
      key: '/admin/classes',
      icon: <BookOutlined />,
      label: 'Classes',
      permission: 'classes_view',
      description: 'Manage classes and subjects'
    },
    {
      key: '/admin/exams',
      icon: <FileTextOutlined />,
      label: 'Exams',
      permission: 'exams_view',
      description: 'Manage exams and results'
    },
    {
      key: '/admin/attendance',
      icon: <CalendarOutlined />,
      label: 'Attendance',
      permission: 'attendance_view',
      description: 'View and manage attendance'
    },
    {
      key: '/admin/teacher-evaluations',
      icon: <StarOutlined />,
      label: 'Teacher Evaluations',
      permission: 'evaluations_view',
      description: 'Evaluate teacher performance'
    },
    {
      key: '/admin/communication',
      icon: <ScheduleOutlined />,
      label: 'Time Table',
      permission: 'timetable_view',
      description: 'Manage class schedules'
    },
    {
      key: '/admin/library',
      icon: <DollarOutlined />,
      label: 'Dues',
      permission: 'dues_view',
      description: 'Manage fee dues'
    },
    {
      key: '/admin/events',
      icon: <BellOutlined />,
      label: 'Events',
      permission: 'events_view',
      description: 'Manage events and calendar'
    },
    {
      key: '/admin/feedback-management',
      icon: <MessageOutlined />,
      label: 'Feedback',
      permission: 'feedback_view',
      description: 'Manage feedback'
    },
    {
      key: '/admin/about-management',
      icon: <InfoCircleOutlined />,
      label: 'About',
      permission: 'about_view',
      description: 'Manage about content'
    },
    {
      key: '/admin/admin-management',
      icon: <LockOutlined />,
      label: 'Admin Management',
      permission: 'admins_manage',
      description: 'Manage admin users'
    },
    {
      key: '/admin/permission-management',
      icon: <KeyOutlined />,
      label: 'Permission Management',
      permission: 'permissions_manage',
      description: 'Manage permissions'
    },
    {
      key: '/admin/settings',
      icon: <SettingOutlined />,
      label: 'Settings',
      permission: 'settings_view',
      description: 'System settings'
    }
  ];

  // Get menu items with their status (active or inactive)
  const getMenuItemsWithStatus = () => {
    return allMenuItems.map(item => {
      const hasAccess = isSuperAdmin || hasPermission(item.permission);
      return {
        ...item,
        hasAccess
      };
    });
  };

  // Count active and total items
  const totalItems = allMenuItems.length;
  const activeItems = allMenuItems.filter(item => isSuperAdmin || hasPermission(item.permission)).length;
  const inactiveItems = totalItems - activeItems;

  // Custom menu item renderer
  const renderMenuItem = (item) => {
    const isActive = item.hasAccess;
    const isSelected = location.pathname === item.key;

    return (
      <div
        key={item.key}
        onClick={() => {
          if (isActive) {
            navigate(item.key);
          }
        }}
        style={{
          padding: '0 16px',
          height: 40,
          display: 'flex',
          alignItems: 'center',
          cursor: isActive ? 'pointer' : 'not-allowed',
          backgroundColor: isSelected ? '#e6f7ff' : 'transparent',
          borderRight: isSelected ? '3px solid #1890ff' : 'none',
          opacity: isActive ? 1 : 0.5,
          transition: 'all 0.2s ease',
          marginBottom: 2,
          position: 'relative'
        }}
        className={isActive ? 'menu-item-active' : 'menu-item-disabled'}
        onMouseEnter={(e) => {
          if (isActive) {
            e.currentTarget.style.backgroundColor = '#f5f5f5';
          }
        }}
        onMouseLeave={(e) => {
          if (isActive) {
            e.currentTarget.style.backgroundColor = isSelected ? '#e6f7ff' : 'transparent';
          }
        }}
      >
        <Tooltip 
          title={
            !isActive 
              ? `🔒 You don't have permission to access ${item.label}` 
              : item.description
          }
          placement="right"
          mouseEnterDelay={0.5}
        >
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            width: '100%'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ 
                fontSize: 16,
                color: isActive ? (isSelected ? '#1890ff' : '#595959') : '#d9d9d9'
              }}>
                {item.icon}
              </span>
              {!collapsed && (
                <span style={{ 
                  fontSize: 14,
                  color: isActive ? (isSelected ? '#1890ff' : '#595959') : '#bfbfbf'
                }}>
                  {item.label}
                </span>
              )}
            </div>
            {!collapsed && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {isActive ? (
                  <CheckCircleOutlined 
                    style={{ 
                      fontSize: 12, 
                      color: '#52c41a'
                    }} 
                  />
                ) : (
                  <LockFilled 
                    style={{ 
                      fontSize: 12, 
                      color: '#d9d9d9'
                    }} 
                  />
                )}
              </div>
            )}
          </div>
        </Tooltip>
      </div>
    );
  };

  if (loading) {
    return (
      <Sider 
        width={200} 
        collapsed={collapsed}
        collapsible
        trigger={null}
        style={{ 
          background: '#fff', 
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          borderRight: '1px solid #f0f0f0',
          zIndex: 100,
          overflow: 'auto'
        }}
      >
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          flexDirection: 'column',
          gap: '16px'
        }}>
          <Spin size="large" />
          <Text type="secondary">Loading permissions...</Text>
        </div>
      </Sider>
    );
  }

  const itemsWithStatus = getMenuItemsWithStatus();

  return (
    <Sider 
      collapsible 
      collapsed={collapsed} 
      onCollapse={setCollapsed}
      trigger={null}
      width={200}
      style={{ 
        background: '#fff', 
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        borderRight: '1px solid #f0f0f0',
        zIndex: 100,
        overflow: 'auto',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Toggle Button - Centered */}
      <div style={{ 
        padding: '12px 16px', 
        borderBottom: '1px solid #f0f0f0',
        display: 'flex',
        justifyContent: 'right',
        alignItems: 'center',
        flexShrink: 0
      }}>
        <Button 
          type="text" 
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={toggleCollapsed}
          style={{
            fontSize: '16px',
            width: 32,
            height: 32,
            color: '#666',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        />
      </div>

      {/* Profile Section - Centered */}
      <div style={{ 
        padding: collapsed ? '12px 8px' : '20px 16px', 
        textAlign: 'center',
        borderBottom: '1px solid #f0f0f0',
        transition: 'all 0.2s',
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Avatar 
          size={collapsed ? 40 : 64}
          style={{ 
            backgroundColor: '#1890ff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: collapsed ? 18 : 28,
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'all 0.2s',
            boxShadow: '0 2px 8px rgba(24, 144, 255, 0.3)'
          }}
          onClick={() => navigate('/admin/settings')}
        >
          {adminData?.name?.charAt(0)?.toUpperCase() || 'A'}
        </Avatar>
        
        {!collapsed && (
          <div style={{ marginTop: 12, width: '100%' }}>
            <Text strong style={{ fontSize: 14, display: 'block' }}>
              {adminData?.name || 'Admin'}
            </Text>
            <Text type="secondary" style={{ fontSize: 12, display: 'block', marginTop: 2 }}>
              {adminData?.designation || 'Administrator'}
            </Text>
            <div style={{ marginTop: 6 }}>
              <Badge 
                status={isSuperAdmin ? 'success' : 'processing'} 
                text={
                  <Text type="secondary" style={{ fontSize: 10 }}>
                    {isSuperAdmin ? '🔑 Super Admin' : `${activeItems}/${totalItems} permissions`}
                  </Text>
                }
              />
            </div>
          </div>
        )}
      </div>

      {/* Permission Summary Bar (when expanded) */}
      {!collapsed && !isSuperAdmin && (
        <div style={{ 
          padding: '8px 16px',
          borderBottom: '1px solid #f0f0f0',
          backgroundColor: '#fafafa'
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            fontSize: 11,
            color: '#666'
          }}>
            <span>✅ Active: {activeItems}</span>
            <span>🔒 Inactive: {inactiveItems}</span>
          </div>
          <div style={{ 
            width: '100%', 
            height: 3, 
            backgroundColor: '#f0f0f0',
            marginTop: 4,
            borderRadius: 2,
            overflow: 'hidden'
          }}>
            <div style={{ 
              width: `${(activeItems / totalItems) * 100}%`, 
              height: '100%', 
              backgroundColor: '#52c41a',
              transition: 'width 0.3s ease',
              borderRadius: 2
            }} />
          </div>
        </div>
      )}
      
      {/* Custom Menu with all items - active and inactive */}
      <div style={{ 
        flex: 1,
        overflowY: 'auto',
        padding: '8px 0'
      }}>
        {itemsWithStatus.map(item => renderMenuItem(item))}
      </div>

      {/* Show message if no permissions */}
      {!collapsed && activeItems === 0 && !isSuperAdmin && (
        <div style={{ padding: '16px', textAlign: 'center', flexShrink: 0 }}>
          <LockFilled style={{ fontSize: 24, color: '#d9d9d9', display: 'block', marginBottom: 8 }} />
          <Text type="secondary" style={{ fontSize: 12 }}>
            No permissions assigned
          </Text>
          <br />
          <Text type="secondary" style={{ fontSize: 11 }}>
            Contact your administrator
          </Text>
        </div>
      )}

      {/* Legend */}
      {!collapsed && (
        <div style={{ 
          padding: '8px 16px', 
          borderTop: '1px solid #f0f0f0',
          fontSize: 11,
          color: '#999',
          flexShrink: 0,
          backgroundColor: '#fafafa'
        }}>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <span>
              <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 10 }} /> Active
            </span>
            <span>
              <LockFilled style={{ fontSize: 10, color: '#d9d9d9' }} /> Inactive
            </span>
          </div>
        </div>
      )}
    </Sider>
  );
};

export default Sidebar;