import React, { useState, useEffect } from 'react';
import { 
  Modal, 
  List, 
  Spin, 
  message, 
  Typography, 
  Space, 
  Tag, 
  Avatar,
  Grid
} from 'antd';
import { 
  ClockCircleOutlined, 
  ExclamationCircleOutlined, 
  NotificationOutlined,
  UserOutlined,
  TeamOutlined
} from '@ant-design/icons';

const { Text } = Typography;
const { useBreakpoint } = Grid;

const AllTeachersAnnouncementsModal = ({ visible, onCancel }) => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const screens = useBreakpoint();

  const fetchAllTeachersAnnouncements = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/All_teacher_announce_read.php');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.status === 'success') {
        setAnnouncements(data.data || []);
      } else {
        throw new Error(data.message || 'Failed to fetch all teachers announcements');
      }
    } catch (error) {
      const errorMsg = error.message || 'Network error. Please try again.';
      setError(errorMsg);
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (visible) {
      fetchAllTeachersAnnouncements();
    }
  }, [visible]);

  const getStatusTag = (status) => {
    if (!status) return <Tag icon={<NotificationOutlined />} color="green">General</Tag>;
    
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
    if (!dateString) return 'No date';
    
    try {
      const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
      return new Date(dateString).toLocaleDateString(undefined, options);
    } catch (error) {
      return 'Invalid date';
    }
  };

  return (
    <Modal
      title={
        <Space>
          <TeamOutlined />
          <span>All Teachers Announcements</span>
        </Space>
      }
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={screens.xs ? '90%' : 800}
      bodyStyle={{ padding: screens.xs ? '16px' : '24px' }}
    >
      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <Spin size="large" />
        </div>
      ) : error ? (
        <div style={{ textAlign: 'center' }}>
          <Text type="danger">{error}</Text>
        </div>
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
                      {formatDate(announcement.date || announcement.created_at)}
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
                    <Text strong>{announcement.announce_title || announcement.title || 'Untitled Announcement'}</Text>
                    {announcement.teacher_id && (
                      <Tag>Teacher ID: {announcement.teacher_id}</Tag>
                    )}
                  </Space>
                }
                description={
                  <>
                    <Text style={{ whiteSpace: 'pre-line' }}>
                      {announcement.description || announcement.message || 'No content available'}
                    </Text>
                    {screens.xs && (
                      <div style={{ marginTop: 8 }}>
                        <ClockCircleOutlined style={{ marginRight: 8 }} />
                        <Text type="secondary">
                          {formatDate(announcement.date || announcement.created_at)}
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
    </Modal>
  );
};

export default AllTeachersAnnouncementsModal;