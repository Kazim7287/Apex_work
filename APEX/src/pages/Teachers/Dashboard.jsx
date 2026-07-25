import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from './Sidebar';
import { 
  MenuOutlined,
  TeamOutlined,
  UserOutlined,
  BookOutlined,
  CalendarOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import { 
  Layout, 
  Card, 
  Typography, 
  Row, 
  Col, 
  List, 
  Space, 
  Button, 
  Badge, 
  Divider,
  Spin,
  Alert,
  Drawer
} from 'antd';
import { useMediaQuery } from 'react-responsive';

const { Header, Content, Sider } = Layout;
const { Title, Text } = Typography;

const TeacherDashboard = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [nextEvent, setNextEvent] = useState(null);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileSidebarVisible, setMobileSidebarVisible] = useState(false);
  
  const stats = {
    students: 500,
    teachers: 50,
    classes: 50
  };
  
  const isMobile = useMediaQuery({ maxWidth: 768 });

  // Fetch events from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch events from your API
        const eventsResponse = await fetch('https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/get_events.php');
        
        if (!eventsResponse.ok) {
          throw new Error(`HTTP error! status: ${eventsResponse.status}`);
        }
        
        const eventsData = await eventsResponse.json();
        
        // Validate events response
        if (!eventsData || typeof eventsData !== 'object') {
          throw new Error('Invalid events data received from server');
        }
        
        // Handle different response structures
        let eventsArray = [];
        if (Array.isArray(eventsData)) {
          eventsArray = eventsData;
        } else if (Array.isArray(eventsData.events)) {
          eventsArray = eventsData.events;
        } else if (eventsData.data && Array.isArray(eventsData.data)) {
          eventsArray = eventsData.data;
        } else {
          throw new Error('Events data is not in expected format');
        }
        
        const formattedEvents = eventsArray.map(event => ({
          id: event.id || Math.random().toString(36).substr(2, 9),
          event_name: event.event_name || 'Unnamed Event',
          event_description: event.event_description || '',
          event_manager: event.event_manager || 'Not specified',
          event_date: event.event_date || new Date().toISOString().split('T')[0],
          event_time: event.event_time || '00:00:00',
          dateTime: new Date(`${event.event_date}T${event.event_time}`),
          formattedDate: new Date(event.event_date).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric' 
          }),
          formattedTime: new Date(`1970-01-01T${event.event_time}`).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
          })
        }));
        
        setEvents(formattedEvents);

      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Determine next upcoming event
  useEffect(() => {
    if (events.length > 0) {
      const now = new Date();
      const upcomingEvents = events.filter(event => event.dateTime > now);
      
      if (upcomingEvents.length > 0) {
        const closestEvent = upcomingEvents.reduce((prev, current) => 
          prev.dateTime < current.dateTime ? prev : current
        );
        setNextEvent(closestEvent);
      } else {
        setNextEvent(null);
      }
    }
  }, [events, currentTime]);

  // Format countdown timer
  const formatCountdown = () => {
    if (!nextEvent) return "No upcoming events scheduled";
    
    const diff = nextEvent.dateTime - currentTime;
    
    if (diff <= 0) return `${nextEvent.event_name} is happening now!`;
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    return (
      <Space>
        <Text strong>{nextEvent.event_name}</Text>
        <Divider type="vertical" />
        {days > 0 && <Text>{days}d</Text>}
        {(hours > 0 || days > 0) && <Text>{hours}h</Text>}
        <Text>{minutes}m {seconds}s</Text>
      </Space>
    );
  };

  if (loading) {
    return (
      <Layout style={{ minHeight: '100vh' }}>
        <Content style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Spin size="large" tip="Loading dashboard..." />
        </Content>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout style={{ minHeight: '100vh' }}>
        <Content style={{ padding: '24px' }}>
          <Alert
            message="Error Loading Dashboard"
            description={error}
            type="error"
            showIcon
            action={
              <Button size="small" onClick={() => window.location.reload()}>
                Retry
              </Button>
            }
          />
        </Content>
      </Layout>
    );
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* Desktop Sidebar */}
      {!isMobile && (
        <Sider 
          collapsible 
          collapsed={collapsed} 
          onCollapse={setCollapsed}
          width={250}
          theme="light"
          breakpoint="lg"
        >
          <Sidebar />
        </Sider>
      )}

      <Layout>
        {/* Mobile Header */}
        {isMobile && (
          <Header style={{ padding: 0, background: '#fff', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
            <Button 
              type="text"
              icon={<MenuOutlined />}
              onClick={() => setMobileSidebarVisible(true)}
              style={{ width: 64, height: 64 }}
            />
          </Header>
        )}

        <Content style={{ 
          padding: isMobile ? '16px' : '24px',
          margin: 0,
          minHeight: 280,
        }}>
          {/* Overview Cards */}
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={24} sm={12} md={8}>
              <Card hoverable>
                <Space direction="vertical" align="center" style={{ width: '100%' }}>
                  <Badge count={stats.students} overflowCount={999} style={{ backgroundColor: '#52c41a' }}>
                    <TeamOutlined style={{ fontSize: 32, color: '#52c41a' }} />
                  </Badge>
                  <Title level={4} style={{ margin: 0 }}>
                    <Link to="/teacher/register">Total Students</Link>
                  </Title>
                </Space>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Card hoverable>
                <Space direction="vertical" align="center" style={{ width: '100%' }}>
                  <Badge count={stats.teachers} overflowCount={999} style={{ backgroundColor: '#1890ff' }}>
                    <UserOutlined style={{ fontSize: 32, color: '#1890ff' }} />
                  </Badge>
                  <Title level={4} style={{ margin: 0 }}>
                    <Link to="/teacher/list">Total Teachers</Link>
                  </Title>
                </Space>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Card hoverable>
                <Space direction="vertical" align="center" style={{ width: '100%' }}>
                  <Badge count={stats.classes} overflowCount={999} style={{ backgroundColor: '#722ed1' }}>
                    <BookOutlined style={{ fontSize: 32, color: '#722ed1' }} />
                  </Badge>
                  <Title level={4} style={{ margin: 0 }}>
                    <Link to="/teacher/class/list">Total Classes</Link>
                  </Title>
                </Space>
              </Card>
            </Col>
          </Row>

          {/* Next Event Countdown */}
          <Card 
            title={
              <Space>
                <ClockCircleOutlined />
                <Text strong>Next Event Countdown</Text>
              </Space>
            }
            style={{ marginBottom: 24 }}
          >
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              {formatCountdown()}
            </div>
          </Card>

          {/* Upcoming Events */}
          <Card
            title={
              <Space>
                <CalendarOutlined />
                <Text strong>Upcoming Events</Text>
              </Space>
            }
            style={{ marginBottom: 24 }}
          >
            <List
              itemLayout="horizontal"
              dataSource={events.filter(event => event.dateTime > currentTime)}
              renderItem={event => (
                <List.Item>
                  <List.Item.Meta
                    title={<Text strong>{event.event_name}</Text>}
                    description={
                      <Space direction="vertical" size={4}>
                        <Text>
                          {event.formattedDate} at {event.formattedTime}
                        </Text>
                        <Text type="secondary">{event.event_description}</Text>
                        <Text type="secondary">Managed by: {event.event_manager}</Text>
                      </Space>
                    }
                  />
                </List.Item>
              )}
              locale={{ emptyText: 'No upcoming events found' }}
            />
          </Card>

          {/* Recent Activity */}
          <Card
            title={
              <Space>
                <UserOutlined />
                <Text strong>Recent Activity</Text>
              </Space>
            }
          >
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <Text type="secondary">No recent activity to display</Text>
            </div>
          </Card>
        </Content>
      </Layout>

      {/* Mobile Sidebar Drawer - Modified to show original sidebar */}
      <Drawer
        placement="left"
        closable={false}
        onClose={() => setMobileSidebarVisible(false)}
        open={mobileSidebarVisible}
        width={250}
        bodyStyle={{ padding: 0 }}
        headerStyle={{ display: 'none' }}
        style={{ backgroundColor: '#f0f2f5' }}
      >
        <Sidebar mobile onClose={() => setMobileSidebarVisible(false)} />
      </Drawer>
    </Layout>
  );
};

export default TeacherDashboard;