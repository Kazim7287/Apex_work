// src/components/Layout.jsx
import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { 
  Layout as AntLayout, 
  Drawer, 
  Button, 
  Typography, 
  Avatar, 
  Badge, 
  Dropdown, 
  Space, 
  ConfigProvider, 
  Tooltip,
  Breadcrumb
} from 'antd';
import { 
  MenuOutlined, 
  UserOutlined, 
  SettingOutlined, 
  LogoutOutlined, 
  CrownOutlined, 
  HomeOutlined,
  BellOutlined,
  KeyOutlined
} from '@ant-design/icons';
import Sidebar from '../pages/Admin/Sidebar';
import { PermissionProvider, usePermissions } from '../contexts/PermissionContext';
import logo from '../assets/images.png';

const { Content, Header } = AntLayout;
const { Text, Title } = Typography;

const pageTitlesMap = {
  '/admin/dashboard': 'Admin Dashboard',
  '/admin/students': 'Student Management',
  '/admin/applications': 'Student Applications',
  '/admin/student-list': 'Student Directory',
  '/admin/teachers': 'Teacher Management',
  '/admin/teacher-list': 'Teacher Directory',
  '/admin/classes': 'Classes & Subjects',
  '/admin/class-list': 'Class Directory',
  '/admin/exams': 'Exams & Grading',
  '/admin/attendance': 'Attendance Records',
  '/admin/teacher-evaluations': 'Teacher Performance Evaluations',
  '/admin/communication': 'Time Table & Schedules',
  '/admin/library': 'Fee Dues & Records',
  '/admin/events': 'Events & Academic Calendar',
  '/admin/feedback-management': 'Feedback Management',
  '/admin/about-management': 'About Page Management',
  '/admin/admin-management': 'Admin User Management',
  '/admin/permission-management': 'Role & Permission Management',
  '/admin/settings': 'System & Profile Settings',
  '/admin/assignments': 'Assignments Overview',
  '/admin/performance': 'Performance Analytics'
};

const AdminLayoutInner = () => {
  const [mobileDrawerVisible, setMobileDrawerVisible] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth > 992);
  const location = useLocation();
  const navigate = useNavigate();
  const { adminData, isSuperAdmin } = usePermissions();

  useEffect(() => {
    const handleResize = () => {
      const desktop = window.innerWidth > 992;
      setIsDesktop(desktop);
      if (desktop) {
        setMobileDrawerVisible(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const pageTitle = pageTitlesMap[location.pathname] || 'Admin Portal';

  const userMenuItems = [
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Profile Settings',
      onClick: () => navigate('/admin/settings')
    },
    {
      key: 'permissions',
      icon: <KeyOutlined />,
      label: 'Permissions',
      onClick: () => navigate('/admin/permission-management')
    },
    {
      key: 'website',
      icon: <HomeOutlined />,
      label: 'Public Website',
      onClick: () => navigate('/')
    },
    {
      type: 'divider'
    },
    {
      key: 'logout',
      icon: <LogoutOutlined style={{ color: '#ef4444' }} />,
      label: <span style={{ color: '#ef4444', fontWeight: 600 }}>Switch User</span>,
      onClick: () => navigate('/choose-user')
    }
  ];

  return (
    <AntLayout style={{ minHeight: '100vh', background: '#f8fafc' }}>
      {/* Desktop Sidebar */}
      {isDesktop && (
        <Sidebar 
          collapsed={collapsed} 
          onCollapse={setCollapsed} 
        />
      )}

      {/* Mobile Drawer Sidebar */}
      <Drawer
        placement="left"
        closable={false}
        onClose={() => setMobileDrawerVisible(false)}
        open={mobileDrawerVisible}
        width={260}
        styles={{ body: { padding: 0, overflow: 'hidden', background: '#061129' } }}
      >
        <Sidebar 
          collapsed={false} 
          onItemClick={() => setMobileDrawerVisible(false)}
        />
      </Drawer>

      {/* Main Container */}
      <AntLayout style={{ minHeight: '100vh', transition: 'all 0.2s' }}>
        {/* Top Navbar */}
        <Header style={{ 
          background: '#ffffff',
          padding: isDesktop ? '0 28px' : '0 16px',
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #e2e8f0',
          boxShadow: '0 2px 10px rgba(11, 27, 61, 0.03)',
          sticky: 'top',
          position: 'sticky',
          top: 0,
          zIndex: 99
        }}>
          {/* Left Header Info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {!isDesktop && (
              <Button 
                type="text"
                icon={<MenuOutlined style={{ fontSize: 18, color: '#0b1b3d' }} />}
                onClick={() => setMobileDrawerVisible(true)}
                style={{
                  width: 40,
                  height: 40,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: '#f1f5f9',
                  borderRadius: 8
                }}
              />
            )}

            <div>
              <Breadcrumb style={{ fontSize: 11, marginBottom: 1 }} items={[
                { title: <span style={{ cursor: 'pointer' }} onClick={() => navigate('/admin/dashboard')}>APEX</span> },
                { title: 'Admin' },
                { title: pageTitle }
              ]} />
              <Title level={4} style={{ margin: 0, color: '#0b1b3d', fontWeight: 700, fontSize: isDesktop ? '1.15rem' : '1rem' }}>
                {pageTitle}
              </Title>
            </div>
          </div>

          {/* Right Header User Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: isDesktop ? 16 : 8 }}>
            {isSuperAdmin && (
              <span style={{
                background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.15) 0%, rgba(184, 134, 11, 0.15) 100%)',
                color: '#b8860b',
                border: '1px solid rgba(212, 175, 55, 0.3)',
                padding: '4px 10px',
                borderRadius: 20,
                fontSize: 12,
                fontWeight: 700,
                display: isDesktop ? 'inline-flex' : 'none',
                alignItems: 'center',
                gap: 6
              }}>
                <CrownOutlined /> Super Admin
              </span>
            )}

            <Tooltip title="View Website">
              <Button 
                type="text" 
                icon={<HomeOutlined style={{ fontSize: 16, color: '#0b1b3d' }} />}
                onClick={() => navigate('/')}
                style={{ background: '#f8fafc', borderRadius: 8 }}
              />
            </Tooltip>

            {/* Profile Dropdown */}
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" arrow>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 10, 
                cursor: 'pointer',
                padding: '4px 8px',
                borderRadius: 8,
                transition: 'background 0.2s',
                background: '#f8fafc',
                border: '1px solid #e2e8f0'
              }}>
                <Avatar 
                  size={34}
                  style={{ 
                    background: 'linear-gradient(135deg, #0b1b3d 0%, #1e3a8a 100%)',
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: 14
                  }}
                >
                  {adminData?.name?.charAt(0)?.toUpperCase() || 'A'}
                </Avatar>
                {isDesktop && (
                  <div style={{ textAlign: 'left' }}>
                    <Text strong style={{ fontSize: 13, color: '#0b1b3d', display: 'block', lineHeight: 1.2 }}>
                      {adminData?.name || 'Admin'}
                    </Text>
                    <Text style={{ fontSize: 11, color: '#64748b', display: 'block', lineHeight: 1.1 }}>
                      {adminData?.designation || 'Administrator'}
                    </Text>
                  </div>
                )}
              </div>
            </Dropdown>
          </div>
        </Header>

        {/* Page Content Holder */}
        <Content style={{ 
          padding: isDesktop ? '24px 28px' : '16px 12px',
          minHeight: 'calc(100vh - 64px)',
          background: '#f8fafc'
        }}>
          <Outlet />
        </Content>
      </AntLayout>
    </AntLayout>
  );
};

const themeConfig = {
  token: {
    colorPrimary: '#0b1b3d',
    colorInfo: '#1e3a8a',
    colorSuccess: '#10b981',
    colorWarning: '#f59e0b',
    colorError: '#ef4444',
    fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif",
    borderRadius: 10,
    colorBgContainer: '#ffffff',
    colorBgLayout: '#f8fafc',
  },
  components: {
    Button: {
      colorPrimary: '#0b1b3d',
      algorithm: true,
      fontWeight: 600,
      borderRadius: 8
    },
    Card: {
      borderRadiusLG: 14,
      boxShadowSecondary: '0 4px 20px -2px rgba(11, 27, 61, 0.05)'
    },
    Table: {
      headerBg: '#f8fafc',
      headerColor: '#0b1b3d',
      borderRadiusLG: 12
    },
    Modal: {
      borderRadiusLG: 16
    }
  }
};

const Layout = () => {
  return (
    <ConfigProvider theme={themeConfig}>
      <PermissionProvider>
        <AdminLayoutInner />
      </PermissionProvider>
    </ConfigProvider>
  );
};

export default Layout;