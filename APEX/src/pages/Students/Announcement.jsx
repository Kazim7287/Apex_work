import { useState, useEffect } from 'react';
import { 
  Card, 
  Button, 
  Typography, 
  Divider, 
  List, 
  Avatar, 
  Tag,
  Space,
  Badge,
  Spin,
  message,
  Layout,
  Row,
  Col
} from 'antd';
import { 
  CalendarOutlined, 
  NotificationOutlined, 
  // FileTextOutlined,
  ClockCircleOutlined 
} from '@ant-design/icons';
import Sidebar from './Sidebar';
import TimetableModal from './TimetableModal';
import GeneralAnnouncementsModal from './GeneralAnnouncements';
import StudentAnnouncementsModal from './StudentAnnouncementsModal';
import PersonalAnnouncementsModal from './PersonalAnnouncementsModal';

const { Content, Sider } = Layout;
const { Title, Text } = Typography;

const AnnouncementSection = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalVisible, setModalVisible] = useState({
    general: false,
    student: false,
    personal: false
  });

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/All_announcement_readT.php');
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
    fetchAnnouncements();
  }, []);

  const getTagColor = (type) => {
    switch(type.toLowerCase()) {
      case 'exam': return 'red';
      case 'academic': return 'blue';
      case 'urgent': return 'red';
      default: return 'green';
    }
  };

  const showModal = (type) => {
    setModalVisible({ ...modalVisible, [type]: true });
  };

  const hideModal = (type) => {
    setModalVisible({ ...modalVisible, [type]: false });
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider 
        width={250} 
        style={{ 
          background: '#001529',
          boxShadow: '2px 0 8px 0 rgba(29,35,41,0.05)'
        }}
      >
        <Sidebar />
      </Sider>
      
      <Layout>
        <Content style={{ padding: '24px', background: '#f0f2f5' }}>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Title level={4} style={{ marginBottom: 0 }}>
              <NotificationOutlined style={{ marginRight: 12 }} />
              Announcements
            </Title>

            {/* First Row of Cards */}
            <Row gutter={[24, 24]}>
              <Col xs={24} sm={24} md={12} lg={8}>
                <Card
                  title={
                    <Space>
                      <CalendarOutlined />
                      <Text strong>Timetable</Text>
                    </Space>
                  }
                  extra={<Button type="link">View All</Button>}
                  hoverable
                  headStyle={{ borderBottom: 0 }}
                >
                  <Text type="secondary">Access your class schedule and timetable</Text>
                  <Divider style={{ margin: '16px 0' }} />
                  <TimetableModal />
                </Card>
              </Col>
              
              {/* <Col xs={24} sm={24} md={12} lg={8}>
                <Card
                  title={
                    <Space>
                      <FileTextOutlined />
                      <Text strong>Exams Timetable</Text>
                    </Space>
                  }
                  extra={<Button type="link">View All</Button>}
                  hoverable
                  headStyle={{ borderBottom: 0 }}
                >
                  <Text type="secondary">Check your upcoming exam schedule</Text>
                  <Divider style={{ margin: '16px 0' }} />
                  <Button type="primary" block>
                    View Exams
                  </Button>
                </Card>
              </Col> */}
              
              <Col xs={24} sm={24} md={12} lg={8}>
                <Card
                  title={
                    <Space>
                      <NotificationOutlined />
                      <Text strong>General Announcements</Text>
                    </Space>
                  }
                  extra={<Button type="link">View All</Button>}
                  hoverable
                  headStyle={{ borderBottom: 0 }}
                >
                  <Text type="secondary">Important updates and notices</Text>
                  <Divider style={{ margin: '16px 0' }} />
                  <Button 
                    type="primary" 
                    block
                    onClick={() => showModal('general')}
                  >
                    View Announcements
                  </Button>
                </Card>
              </Col>
            </Row>

            {/* Second Row of Cards */}
            <Row gutter={[24, 24]}>
              <Col xs={24} sm={24} md={12} lg={8}>
                <Card
                  title={
                    <Space>
                      <NotificationOutlined />
                      <Text strong>Student Announcements</Text>
                    </Space>
                  }
                  extra={<Button type="link">View All</Button>}
                  hoverable
                  headStyle={{ borderBottom: 0 }}
                >
                  <Text type="secondary">Announcements for all students</Text>
                  <Divider style={{ margin: '16px 0' }} />
                  <Button 
                    type="primary" 
                    block
                    onClick={() => showModal('student')}
                  >
                    View Announcements
                  </Button>
                </Card>
              </Col>
              
              <Col xs={24} sm={24} md={12} lg={8}>
                <Card
                  title={
                    <Space>
                      <NotificationOutlined />
                      <Text strong>Announcements for You</Text>
                    </Space>
                  }
                  extra={<Button type="link">View All</Button>}
                  hoverable
                  headStyle={{ borderBottom: 0 }}
                >
                  <Text type="secondary">Personal announcements</Text>
                  <Divider style={{ margin: '16px 0' }} />
                  <Button 
                    type="primary" 
                    block
                    onClick={() => showModal('personal')}
                  >
                    View Announcements
                  </Button>
                </Card>
              </Col>
            </Row>

            {/* Announcements List */}
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
              <Card
                title="Recent Announcements"
                style={{ marginTop: 24 }}
                bodyStyle={{ padding: 0 }}
              >
                <List
                  itemLayout="horizontal"
                  dataSource={announcements}
                  renderItem={(item) => (
                    <List.Item
                      style={{ 
                        padding: '16px 24px',
                        borderBottom: '1px solid #f0f0f0',
                        transition: 'all 0.3s'
                      }}
                    >
                      <List.Item.Meta
                        avatar={
                          <Avatar 
                            icon={<NotificationOutlined />} 
                            style={{ 
                              backgroundColor: item.status === 'urgent' ? '#ff4d4f' : '#1890ff',
                              verticalAlign: 'middle'
                            }} 
                          />
                        }
                        title={
                          <Space>
                            <Text strong>{item.announce_title || item.title}</Text>
                            {item.status === 'urgent' && (
                              <Badge 
                                count="URGENT" 
                                style={{ 
                                  backgroundColor: '#ff4d4f',
                                  fontSize: 10
                                }} 
                              />
                            )}
                          </Space>
                        }
                        description={
                          <>
                            <Text style={{ color: '#595959' }}>{item.message || item.content}</Text>
                            <div style={{ marginTop: 8 }}>
                              <Tag icon={<ClockCircleOutlined />} color="default">
                                {item.created_at || item.date}
                              </Tag>
                              <Tag color={getTagColor(item.status || item.type)}>
                                {(item.status || item.type || 'general').toUpperCase()}
                              </Tag>
                            </div>
                          </>
                        }
                      />
                    </List.Item>
                  )}
                />
              </Card>
            )}
          </Space>

          {/* Modals */}
          <GeneralAnnouncementsModal
            visible={modalVisible.general}
            onCancel={() => hideModal('general')}
            announcements={announcements}
          />
          <StudentAnnouncementsModal
            visible={modalVisible.student}
            onCancel={() => hideModal('student')}
            announcements={announcements}
          />
          <PersonalAnnouncementsModal
            visible={modalVisible.personal}
            onCancel={() => hideModal('personal')}
            announcements={announcements}
          />
        </Content>
      </Layout>
    </Layout>
  );
};

export default AnnouncementSection;