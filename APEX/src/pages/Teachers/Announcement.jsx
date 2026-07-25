import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import AllAnnouncementsModal from './AllAnnouncementsModal';
import AllTeachersAnnouncementsModal from './AllTeachersAnnouncementsModal';
import { 
  Layout,
  Card,
  List,
  Spin, 
  message,
  Typography,
  Space,
  Tag,
  Divider,
  Avatar,
  Button,
  Dropdown,
  Menu,
  Grid,
  Drawer
} from 'antd';
import { 
  ClockCircleOutlined, 
  ExclamationCircleOutlined, 
  NotificationOutlined,
  UserOutlined,
  GlobalOutlined,
  TeamOutlined,
  DownOutlined,
  MenuOutlined
} from '@ant-design/icons';

const { Text, Title } = Typography;
const { Content } = Layout;
const { useBreakpoint } = Grid;

const CheckAnnouncementSection = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [teacherId, setTeacherId] = useState(null);
  const [showAllAnnouncements, setShowAllAnnouncements] = useState(false);
  const [showAllTeachersAnnouncements, setShowAllTeachersAnnouncements] = useState(false);
  const [mobileSidebarVisible, setMobileSidebarVisible] = useState(false);
  
  const screens = useBreakpoint();

  useEffect(() => {
    const storedTeacherId = localStorage.getItem('teacher_id');
    if (storedTeacherId) {
      setTeacherId(storedTeacherId);
    } else {
      setError('Teacher ID not found in localStorage');
      setLoading(false);
      message.error('Teacher ID not found. Please login again.');
    }
  }, []);

  const fetchAnnouncements = async () => {
    if (!teacherId) return;
    
    setLoading(true);
    try {
      const response = await fetch(`https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/single_teach_announce_read.php?teacher_id=${teacherId}`);
      const data = await response.json();
      
      if (data.status === 'success') {
        setAnnouncements(data.data);
      } else {
        setError(data.message || 'Failed to fetch announcements');
        message.error(data.message || 'Failed to fetch announcements');
      }
    } catch (error) {
      setError('Network error. Please try again.');
      message.error('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (teacherId) {
      fetchAnnouncements();
    }
  }, [teacherId]);

  const getStatusTag = (status) => {
    switch(status.toLowerCase()) {
      case 'urgent':
        return <Tag icon={<ExclamationCircleOutlined />} color="red">Urgent</Tag>;
      case 'academic':
        return <Tag icon={<NotificationOutlined />} color="blue">Academic</Tag>;
      default:
        return <Tag icon={<NotificationOutlined />} color="green">General</Tag>;
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const viewAnnouncementsMenu = (
    <Menu>
      <Menu.Item 
        key="all" 
        icon={<GlobalOutlined />}
        onClick={() => setShowAllAnnouncements(true)}
      >
        General Announcements
      </Menu.Item>
      <Menu.Item 
        key="teachers" 
        icon={<TeamOutlined />}
        onClick={() => setShowAllTeachersAnnouncements(true)}
      >
        All Teachers Announcements
      </Menu.Item>
    </Menu>
  );

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* Mobile Sidebar Drawer */}
      {!screens.md && (
        <Drawer
          title="Menu"
          placement="left"
          closable={true}
          onClose={() => setMobileSidebarVisible(false)}
          visible={mobileSidebarVisible}
          width={250}
        >
          <Sidebar />
        </Drawer>
      )}
      
      {/* Desktop Sidebar */}
      {screens.md && (
        <Sidebar />
      )}
      
      <Layout>
        <Content 
          style={{ 
            marginLeft: screens.md ? 250 : 0,
            padding: screens.xs ? '16px' : '24px',
            transition: 'all 0.2s'
          }}
        >
          <Card>
            <Space 
              style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                flexDirection: screens.xs ? 'column' : 'row',
                gap: screens.xs ? 16 : 0
              }}
            >
              <Space>
                {!screens.md && (
                  <Button 
                    icon={<MenuOutlined />} 
                    onClick={() => setMobileSidebarVisible(true)}
                    style={{ marginRight: 16 }}
                  />
                )}
                <Title level={2} style={{ marginBottom: 0 }}>Your Announcements</Title>
              </Space>
              
              <Dropdown overlay={viewAnnouncementsMenu} placement="bottomRight">
                <Button type="primary">
                  <Space>
                    View Announcements
                    <DownOutlined />
                  </Space>
                </Button>
              </Dropdown>
            </Space>
            
            <Text type="secondary" style={{ display: 'block', marginTop: screens.xs ? 8 : 0 }}>
              Showing announcements for teacher ID: {teacherId}
            </Text>
            
            <Divider />
            
            {loading ? (
              <div style={{ textAlign: 'center', padding: '50px' }}>
                <Spin size="large" />
              </div>
            ) : error ? (
              <Card>
                <Text type="danger">{error}</Text>
                <Button 
                  style={{ marginTop: 16 }} 
                  onClick={fetchAnnouncements}
                >
                  Retry
                </Button>
              </Card>
            ) : (
              <List
                itemLayout="vertical"
                size="large"
                dataSource={announcements}
                renderItem={(announcement) => (
                  <List.Item
                    key={announcement.id}
                    extra={
                      !screens.xs && (
                        <Space>
                          <ClockCircleOutlined />
                          <Text type="secondary">
                            {formatDate(announcement.date)}
                          </Text>
                        </Space>
                      )
                    }
                  >
                    <List.Item.Meta
                      avatar={<Avatar icon={<UserOutlined />} />}
                      title={
                        <Space direction={screens.xs ? 'vertical' : 'horizontal'} align={screens.xs ? 'start' : 'center'}>
                          {getStatusTag(announcement.status)}
                          <Text strong>{announcement.announce_title}</Text>
                        </Space>
                      }
                      description={
                        <>
                          <Text style={{ whiteSpace: 'pre-line' }}>
                            {announcement.description}
                          </Text>
                          {screens.xs && (
                            <div style={{ marginTop: 8 }}>
                              <ClockCircleOutlined style={{ marginRight: 8 }} />
                              <Text type="secondary">
                                {formatDate(announcement.date)}
                              </Text>
                            </div>
                          )}
                        </>
                      }
                    />
                  </List.Item>
                )}
                locale={{ emptyText: 'No announcements found' }}
              />
            )}
          </Card>

          {/* General Announcements Modal */}
          <AllAnnouncementsModal 
            visible={showAllAnnouncements} 
            onCancel={() => setShowAllAnnouncements(false)} 
          />
          
          {/* All Teachers Announcements Modal */}
          <AllTeachersAnnouncementsModal 
            visible={showAllTeachersAnnouncements} 
            onCancel={() => setShowAllTeachersAnnouncements(false)} 
          />
        </Content>
      </Layout>
    </Layout>
  );
};

export default CheckAnnouncementSection;