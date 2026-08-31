// src/pages/Students/AssignmentList.jsx
import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Button, 
  Typography, 
  List, 
  Avatar, 
  Tag, 
  Space, 
  Badge, 
  Spin, 
  Alert,
  Row, 
  Col
} from 'antd';
import { 
  CalendarOutlined, 
  NotificationOutlined, 
  ClockCircleOutlined,
  GlobalOutlined,
  TeamOutlined,
  UserOutlined,
  ReloadOutlined,
  ArrowRightOutlined
} from '@ant-design/icons';
import TimetableModal from './TimetableModal';
import GeneralAnnouncementsModal from './GeneralAnnouncements';
import StudentAnnouncementsModal from './StudentAnnouncementsModal';
import PersonalAnnouncementsModal from './PersonalAnnouncementsModal';

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

  const API_BASE_URL = 'https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX';

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}/All_announcement_readT.php`);
      const data = await response.json();
      
      if (data.status === 'success' || data.success) {
        setAnnouncements(data.data || []);
      } else {
        setAnnouncements([]);
      }
    } catch (err) {
      console.error('Error fetching announcements:', err);
      setError('Could not load announcements');
      setAnnouncements([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const getTagColor = (type) => {
    switch(String(type || '').toLowerCase()) {
      case 'urgent': return 'red';
      case 'exam': return 'purple';
      case 'academic': return 'blue';
      case 'holiday': return 'orange';
      default: return 'green';
    }
  };

  const showModal = (type) => {
    setModalVisible(prev => ({ ...prev, [type]: true }));
  };

  const hideModal = (type) => {
    setModalVisible(prev => ({ ...prev, [type]: false }));
  };

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto' }}>
      {/* Header Banner */}
      <Card
        className="apex-card"
        style={{ marginBottom: 24 }}
        bodyStyle={{ padding: '20px 24px' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: 'linear-gradient(135deg, #0b1b3d 0%, #1e3a8a 100%)',
                color: '#d4af37',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 22,
                boxShadow: '0 4px 12px rgba(11, 27, 61, 0.2)',
              }}
            >
              <NotificationOutlined />
            </div>
            <div>
              <Title level={4} style={{ margin: 0, color: '#0b1b3d', fontWeight: 800 }}>
                Campus Announcements Directory
              </Title>
              <Text style={{ color: '#64748b', fontSize: 13 }}>
                All notices, circulars, and schedules published by APEX College
              </Text>
            </div>
          </div>

          <Button
            icon={<ReloadOutlined />}
            onClick={fetchAnnouncements}
            loading={loading}
            style={{ borderRadius: 8 }}
          >
            Refresh
          </Button>
        </div>
      </Card>

      {/* 4 Interactive Category Quick Cards */}
      <Row gutter={[20, 20]} style={{ marginBottom: 28 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable className="apex-card apex-card-gold-header" bodyStyle={{ padding: 22 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
              <div>
                <Text style={{ color: '#64748b', fontSize: 12, fontWeight: 700, textTransform: 'uppercase' }}>Schedule</Text>
                <Title level={4} style={{ margin: '4px 0 0 0', color: '#0b1b3d', fontWeight: 800 }}>Timetable</Title>
              </div>
              <div className="apex-stat-icon" style={{ background: 'linear-gradient(135deg, #0b1b3d 0%, #1e3a8a 100%)', color: '#d4af37' }}>
                <CalendarOutlined />
              </div>
            </div>
            <Text style={{ color: '#64748b', fontSize: 12, display: 'block', marginBottom: 16 }}>Class schedule & room details</Text>
            <TimetableModal />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card hoverable className="apex-card apex-card-gold-header" bodyStyle={{ padding: 22 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
              <div>
                <Text style={{ color: '#64748b', fontSize: 12, fontWeight: 700, textTransform: 'uppercase' }}>Public</Text>
                <Title level={4} style={{ margin: '4px 0 0 0', color: '#0b1b3d', fontWeight: 800 }}>General</Title>
              </div>
              <div className="apex-stat-icon" style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', color: '#ffffff' }}>
                <GlobalOutlined />
              </div>
            </div>
            <Text style={{ color: '#64748b', fontSize: 12, display: 'block', marginBottom: 16 }}>Institutional circulars</Text>
            <Button type="primary" block onClick={() => showModal('general')} style={{ borderRadius: 8, background: '#1e3a8a' }}>
              View General <ArrowRightOutlined />
            </Button>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card hoverable className="apex-card apex-card-gold-header" bodyStyle={{ padding: 22 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
              <div>
                <Text style={{ color: '#64748b', fontSize: 12, fontWeight: 700, textTransform: 'uppercase' }}>Cohort</Text>
                <Title level={4} style={{ margin: '4px 0 0 0', color: '#0b1b3d', fontWeight: 800 }}>Student Notices</Title>
              </div>
              <div className="apex-stat-icon" style={{ background: 'linear-gradient(135deg, #10b981 0%, #047857 100%)', color: '#ffffff' }}>
                <TeamOutlined />
              </div>
            </div>
            <Text style={{ color: '#64748b', fontSize: 12, display: 'block', marginBottom: 16 }}>All student announcements</Text>
            <Button type="primary" block onClick={() => showModal('student')} style={{ borderRadius: 8, background: '#059669' }}>
              View Student <ArrowRightOutlined />
            </Button>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card hoverable className="apex-card apex-card-gold-header" bodyStyle={{ padding: 22 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
              <div>
                <Text style={{ color: '#64748b', fontSize: 12, fontWeight: 700, textTransform: 'uppercase' }}>Direct</Text>
                <Title level={4} style={{ margin: '4px 0 0 0', color: '#0b1b3d', fontWeight: 800 }}>Personal</Title>
              </div>
              <div className="apex-stat-icon" style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)', color: '#ffffff' }}>
                <UserOutlined />
              </div>
            </div>
            <Text style={{ color: '#64748b', fontSize: 12, display: 'block', marginBottom: 16 }}>Personal direct notices</Text>
            <Button type="primary" block onClick={() => showModal('personal')} className="apex-btn-gold" style={{ borderRadius: 8 }}>
              View Personal <ArrowRightOutlined />
            </Button>
          </Card>
        </Col>
      </Row>

      {/* Recent Feed List Card */}
      <Card
        className="apex-card"
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 0' }}>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: 'rgba(212, 175, 55, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d4af37', fontSize: 16 }}>
              <NotificationOutlined />
            </div>
            <div>
              <Title level={5} style={{ margin: 0, color: '#0b1b3d', fontWeight: 700 }}>
                Recent Announcements
              </Title>
              <Text style={{ color: '#64748b', fontSize: 11 }}>Official stream of announcements</Text>
            </div>
          </div>
        }
      >
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <Spin size="large" tip="Loading announcement feed..." />
          </div>
        ) : announcements.length === 0 ? (
          <Alert message="No announcements have been published recently." type="info" showIcon />
        ) : (
          <List
            itemLayout="horizontal"
            dataSource={announcements}
            renderItem={(item) => (
              <List.Item
                style={{ 
                  padding: '16px 20px',
                  borderBottom: '1px solid #f1f5f9',
                  borderRadius: 8
                }}
              >
                <List.Item.Meta
                  avatar={
                    <Avatar 
                      icon={<NotificationOutlined />} 
                      style={{ 
                        backgroundColor: item.status === 'urgent' ? '#ef4444' : '#0b1b3d',
                        color: '#d4af37',
                        marginTop: 4
                      }} 
                    />
                  }
                  title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <Text strong style={{ color: '#0b1b3d', fontSize: 15 }}>
                        {item.announce_title || item.title}
                      </Text>
                      {item.status === 'urgent' && (
                        <Badge 
                          count="URGENT" 
                          style={{ 
                            backgroundColor: '#ef4444',
                            fontSize: 10,
                            fontWeight: 700
                          }} 
                        />
                      )}
                    </div>
                  }
                  description={
                    <div style={{ marginTop: 4 }}>
                      <Text style={{ color: '#475569', fontSize: 13, display: 'block', lineHeight: 1.6 }}>
                        {item.message || item.content || item.description}
                      </Text>
                      <div style={{ marginTop: 8, display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                        <Tag icon={<ClockCircleOutlined />} color="default" style={{ borderRadius: 6, fontSize: 11 }}>
                          {item.created_at || item.date || 'Recent'}
                        </Tag>
                        <Tag color={getTagColor(item.status || item.type)} style={{ borderRadius: 6, fontWeight: 600, fontSize: 11 }}>
                          {String(item.status || item.type || 'GENERAL').toUpperCase()}
                        </Tag>
                      </div>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        )}
      </Card>

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
    </div>
  );
};

export default AnnouncementSection;