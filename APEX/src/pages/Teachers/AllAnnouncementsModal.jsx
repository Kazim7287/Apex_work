import { useState, useEffect } from 'react';
import { 
  Modal, 
  List, 
  Spin, 
  message, 
  Typography, 
  Space, 
  Tag, 
  Avatar 
} from 'antd';
import { 
  ClockCircleOutlined, 
  ExclamationCircleOutlined, 
  NotificationOutlined,
  UserOutlined
} from '@ant-design/icons';

const { Text } = Typography;

// eslint-disable-next-line react/prop-types
const AllAnnouncementsModal = ({ visible, onCancel }) => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAllAnnouncements = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/All_announcement_readT.php');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.status === 'success') {
        setAnnouncements(data.data || []);
      } else {
        throw new Error(data.message || 'Failed to fetch all announcements');
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
      fetchAllAnnouncements();
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
      title="All Announcements"
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={800}
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
                <Space>
                  <ClockCircleOutlined />
                  <Text type="secondary">
                    {formatDate(announcement.created_at)}
                  </Text>
                </Space>
              }
            >
              <List.Item.Meta
                avatar={<Avatar icon={<UserOutlined />} />}
                title={
                  <Space>
                    {getStatusTag(announcement.status)}
                    <Text strong>{announcement.announce_title || 'Untitled Announcement'}</Text>
                  </Space>
                }
                description={
                  <Text style={{ whiteSpace: 'pre-line' }}>
                    {announcement.message || 'No content'}
                  </Text>
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

export default AllAnnouncementsModal;