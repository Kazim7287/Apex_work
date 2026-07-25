/* eslint-disable react/jsx-key */
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from './Sidebar';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import { 
  Layout, 
  Card, 
  Typography, 
  List, 
  Space, 
  Spin, 
  Alert, 
  Button,
  Divider,
  Badge,
  Drawer,
  Row,
  Col,
  Avatar,
  message
} from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  ClockCircleOutlined,
  NotificationOutlined,
  BarChartOutlined,
  CalendarOutlined,
  UserOutlined
} from '@ant-design/icons';

dayjs.extend(duration);

const { Header, Content } = Layout;
const { Title, Text } = Typography;

const StudentDashboard = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentTime, setCurrentTime] = useState(dayjs());
  const [nextEvent, setNextEvent] = useState(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [profilePicture, setProfilePicture] = useState(null);
  const [pictureLoading, setPictureLoading] = useState(true);

  const isMobile = windowWidth < 768;
  const studentId = localStorage.getItem('student_id');
  const API_BASE_URL = 'https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/';
  const DEFAULT_PROFILE_IMAGE = 'http://localhost/Apex/images/default-profile.png';

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      if (window.innerWidth >= 768) {
        setDrawerVisible(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch student profile picture
  useEffect(() => {
    const fetchProfilePicture = async () => {
      try {
        setPictureLoading(true);
        
        if (!studentId) {
          throw new Error('Student ID not found. Please login again.');
        }

        const response = await fetch(
          `${API_BASE_URL}/fetchStudentPicture.php?student_id=${studentId}`,
          { 
            credentials: 'include',
            headers: {
              'Accept': 'application/json',
            }
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.success && data.exists) {
          // Use the URL directly from the API response
          const imageUrl = data.url || data.full_url;
          
          if (!imageUrl) {
            throw new Error('No valid image URL provided');
          }

          // Clean URL and verify it
          const cleanUrl = imageUrl.replace(/\\\//g, '/');
          try {
            new URL(cleanUrl); // Validate URL format
            
            // Verify the image exists
            const img = new Image();
            img.src = cleanUrl;
            img.onerror = () => {
              console.warn('Image not found at:', cleanUrl);
              setProfilePicture(null);
            };
            img.onload = () => {
              setProfilePicture(cleanUrl);
            };
          } catch (e) {
            console.error('Invalid image URL:', cleanUrl);
            setProfilePicture(null);
          }
        } else {
          setProfilePicture(null);
        }
      } catch (error) {
        console.error('Picture fetch failed:', error);
        setProfilePicture(null);
        message.error('Failed to load profile picture');
      } finally {
        setPictureLoading(false);
      }
    };

    fetchProfilePicture();
  }, [studentId]);

  // Fetch events from API
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const response = await fetch('https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/get_events.php');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        
        if (!data.success) {
          throw new Error(data.message || 'Failed to load events');
        }

        const eventsData = Array.isArray(data.data) ? data.data : [data.data];
        
        const formattedEvents = eventsData
          .filter(event => event && event.event_date && event.event_time)
          .map(event => ({
            ...event,
            dateTime: dayjs(`${event.event_date} ${event.event_time}`),
            formattedDate: dayjs(event.event_date).format('MMMM D, YYYY'),
            formattedTime: dayjs(event.event_time, 'HH:mm:ss').format('h:mm A')
          }));
        
        setEvents(formattedEvents);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching events:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(dayjs());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Calculate next upcoming event
  useEffect(() => {
    if (events.length > 0) {
      const now = dayjs();
      const upcoming = events
        .filter(event => event.dateTime.isAfter(now))
        .sort((a, b) => a.dateTime.diff(b.dateTime))[0];
      setNextEvent(upcoming || null);
    }
  }, [events, currentTime]);

  // Format countdown timer
  const formatCountdown = () => {
    if (!nextEvent) return "No upcoming events";
    
    const diff = dayjs.duration(nextEvent.dateTime.diff(currentTime));
    if (diff.asSeconds() <= 0) return `Event ${nextEvent.event_name} is happening now!`;
    
    return `${diff.hours()}h ${diff.minutes()}m ${diff.seconds()}s until ${nextEvent.event_name}`;
  };

  // Filter upcoming events (next 7 days)
  const upcomingEvents = events.filter(event => 
    event.dateTime.isAfter(currentTime) && 
    event.dateTime.isBefore(currentTime.add(7, 'day'))
  ).slice(0, 3);

  // Filter recent events (past 7 days)
  const recentEvents = events.filter(event => 
    event.dateTime.isBefore(currentTime) && 
    event.dateTime.isAfter(currentTime.subtract(7, 'day'))
  ).slice(0, 3);

  const toggleDrawer = () => {
    setDrawerVisible(!drawerVisible);
  };

  if (loading) {
    return (
      <Layout style={{ minHeight: '100vh' }}>
        <Header style={{ 
          background: '#fff',
          padding: '0 24px',
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 1px 4px rgba(0,21,41,.08)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {isMobile && (
              <Button 
                type="text"
                icon={drawerVisible ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                onClick={toggleDrawer}
                style={{ marginRight: 16 }}
              />
            )}
            <Title level={4} style={{ margin: 0 }}>Student Dashboard</Title>
          </div>
          {pictureLoading ? (
            <Spin size="small" />
          ) : profilePicture ? (
            <Avatar src={profilePicture} />
          ) : (
            <Avatar icon={<UserOutlined />} />
          )}
        </Header>
        <Content style={{ 
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: 'calc(100vh - 64px)'
        }}>
          <Spin size="large" tip="Loading dashboard..." />
        </Content>
        {isMobile && (
          <Drawer
            title="Menu"
            placement="left"
            closable={true}
            onClose={() => setDrawerVisible(false)}
            visible={drawerVisible}
            bodyStyle={{ padding: 0 }}
            width={250}
          >
            <Sidebar />
          </Drawer>
        )}
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout style={{ minHeight: '100vh' }}>
        <Header style={{ 
          background: '#fff',
          padding: '0 24px',
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 1px 4px rgba(0,21,41,.08)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {isMobile && (
              <Button 
                type="text"
                icon={drawerVisible ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                onClick={toggleDrawer}
                style={{ marginRight: 16 }}
              />
            )}
            <Title level={4} style={{ margin: 0 }}>Student Dashboard</Title>
          </div>
          {pictureLoading ? (
            <Spin size="small" />
          ) : profilePicture ? (
            <Avatar src={profilePicture} />
          ) : (
            <Avatar icon={<UserOutlined />} />
          )}
        </Header>
        <Content style={{ 
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '24px'
        }}>
          <Alert
            message="Error Loading Dashboard"
            description={error}
            type="error"
            showIcon
            action={
              <Button size="small" type="primary" onClick={() => window.location.reload()}>
                Retry
              </Button>
            }
          />
        </Content>
        {isMobile && (
          <Drawer
            title="Menu"
            placement="left"
            closable={true}
            onClose={() => setDrawerVisible(false)}
            visible={drawerVisible}
            bodyStyle={{ padding: 0 }}
            width={250}
          >
            <Sidebar />
          </Drawer>
        )}
      </Layout>
    );
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* Desktop Sidebar (always visible) */}
      {!isMobile && (
        <div style={{
          width: 250,
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          background: '#fff',
          boxShadow: '2px 0 8px 0 rgba(29,35,41,0.05)'
        }}>
          <Sidebar />
        </div>
      )}

      {/* Header with User Avatar */}
      <Header style={{ 
        background: '#fff',
        padding: '0 24px',
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 1px 4px rgba(0,21,41,.08)',
        position: 'sticky',
        top: 0,
        zIndex: 1,
        marginLeft: !isMobile ? 250 : 0
      }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {isMobile && (
            <Button 
              type="text"
              icon={drawerVisible ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={toggleDrawer}
              style={{ marginRight: 16 }}
            />
          )}
          <Title level={4} style={{ margin: 0 }}>Student Dashboard</Title>
        </div>
        {pictureLoading ? (
          <Spin size="small" />
        ) : profilePicture ? (
          <Avatar src={profilePicture} />
        ) : (
          <Avatar icon={<UserOutlined />} />
        )}
      </Header>

      {/* Main Content - Centered */}
      <Content style={{ 
        marginLeft: !isMobile ? 250 : 0,
        padding: '24px',
        minHeight: 'calc(100vh - 64px)',
        background: '#f5f7fa'
      }}>
        <div style={{ 
          maxWidth: 1200,
          margin: '0 auto'
        }}>
          {/* Overview Cards */}
          <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
            <Col xs={24} sm={12} md={8}>
              <Card
                hoverable
                actions={[
                  <Link to="/student/assignment/list">View All</Link>
                ]}
              >
                <Card.Meta
                  avatar={<NotificationOutlined style={{ fontSize: '24px' }} />}
                  title="Announcements"
                  description={<Text strong style={{ fontSize: '24px' }}>5</Text>}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Card
                hoverable
                actions={[
                  <Link to="/student/performance">View Performance</Link>
                ]}
              >
                <Card.Meta
                  avatar={<BarChartOutlined style={{ fontSize: '24px' }} />}
                  title="Performance"
                  description={<Text strong style={{ fontSize: '24px' }}>530</Text>}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Card
                hoverable
                actions={[
                  <Link to="/student/term/list">View Term</Link>
                ]}
              >
                <Card.Meta
                  avatar={<CalendarOutlined style={{ fontSize: '24px' }} />}
                  title="Term"
                  description={<Text strong style={{ fontSize: '24px' }}>1</Text>}
                />
              </Card>
            </Col>
          </Row>

          {/* Countdown Section */}
          <Card style={{ marginBottom: 24 }}>
            <Title level={5} style={{ marginBottom: 16 }}>Next Event Countdown</Title>
            <Badge.Ribbon text="Live" color="red">
              <div style={{ padding: '16px 24px' }}>
                <Space>
                  <ClockCircleOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
                  <Text strong style={{ fontSize: '18px' }}>{formatCountdown()}</Text>
                </Space>
              </div>
            </Badge.Ribbon>
          </Card>

          {/* Events Sections */}
          <Row gutter={[24, 24]}>
            <Col xs={24} md={12}>
              <Card>
                <Title level={5}>Upcoming Events (Next 7 Days)</Title>
                <Divider />
                <List
                  itemLayout="horizontal"
                  dataSource={upcomingEvents}
                  locale={{ emptyText: 'No upcoming events in the next week' }}
                  renderItem={event => (
                    <List.Item>
                      <List.Item.Meta
                        title={event.event_name}
                        description={
                          <Space direction="vertical" size={0}>
                            <Text type="secondary">
                              {event.formattedDate} at {event.formattedTime}
                            </Text>
                            <Text>{event.event_description}</Text>
                          </Space>
                        }
                      />
                    </List.Item>
                  )}
                />
              </Card>
            </Col>
            <Col xs={24} md={12}>
              <Card>
                <Title level={5}>Recent Events (Past 7 Days)</Title>
                <Divider />
                <List
                  itemLayout="horizontal"
                  dataSource={recentEvents}
                  locale={{ emptyText: 'No recent events' }}
                  renderItem={event => (
                    <List.Item>
                      <List.Item.Meta
                        title={event.event_name}
                        description={
                          <Space direction="vertical" size={0}>
                            <Text type="secondary">
                              {event.formattedDate} at {event.formattedTime}
                            </Text>
                            <Text>{event.event_description}</Text>
                          </Space>
                        }
                      />
                    </List.Item>
                  )}
                />
              </Card>
            </Col>
          </Row>
        </div>
      </Content>

      {/* Mobile Drawer */}
      {isMobile && (
        <Drawer
          title="Menu"
          placement="left"
          closable={true}
          onClose={() => setDrawerVisible(false)}
          visible={drawerVisible}
          bodyStyle={{ padding: 0 }}
          width={250}
        >
          <Sidebar />
        </Drawer>
      )}
    </Layout>
  );
};

export default StudentDashboard;