/* eslint-disable react/prop-types */
import { useState, useEffect } from 'react';
import { Modal, List, Typography, Tag, Avatar, Badge, Spin, Button, message, Space } from 'antd';
import { NotificationOutlined, ClockCircleOutlined } from '@ant-design/icons';

const { Text } = Typography;

const PersonalAnnouncementsModal = ({ visible, onCancel }) => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPersonalAnnouncements = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get student_id from localStorage
      const student_id = localStorage.getItem('student_id');
      if (!student_id) {
        throw new Error('Student ID not found in localStorage');
      }

      const response = await fetch(`https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/get_student_announce.php?student_id=${student_id}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setAnnouncements(data.data);
      } else {
        throw new Error(data.message || 'Failed to fetch personal announcements');
      }
    } catch (error) {
      setError(error.message);
      message.error(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (visible) {
      fetchPersonalAnnouncements();
    }
  }, [visible]);

  return (
    <Modal
      title="Personal Announcements"
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={800}
      destroyOnClose
    >
      {loading ? (
        <div style={{ textAlign: 'center', padding: '24px' }}>
          <Spin size="large" />
        </div>
      ) : error ? (
        <div style={{ textAlign: 'center', padding: '24px' }}>
          <Text type="danger">{error}</Text>
          <div style={{ marginTop: 16 }}>
            <Button 
              type="primary" 
              onClick={fetchPersonalAnnouncements}
            >
              Retry
            </Button>
          </div>
        </div>
      ) : announcements.length > 0 ? (
        <List
          itemLayout="horizontal"
          dataSource={announcements}
          renderItem={(item) => (
            <List.Item>
              <List.Item.Meta
                avatar={
                  <Avatar 
                    icon={<NotificationOutlined />} 
                    style={{ 
                      backgroundColor: item.status === 'urgent' ? '#ff4d4f' : '#722ed1' 
                    }} 
                  />
                }
                title={
                  <Space>
                    <Text strong>{item.announce_title}</Text>
                    {item.status === 'urgent' && (
                      <Badge 
                        count="URGENT" 
                        style={{ 
                          backgroundColor: '#ff4d4f',
                          marginLeft: 8,
                          fontSize: 10
                        }} 
                      />
                    )}
                  </Space>
                }
                description={
                  <>
                    <Text style={{ whiteSpace: 'pre-line' }}>{item.description}</Text>
                    <div style={{ marginTop: 8 }}>
                      <Tag icon={<ClockCircleOutlined />} color="default">
                        {item.created_at}
                      </Tag>
                      <Tag color="purple">PERSONAL</Tag>
                      {item.student_name && (
                        <Tag color="geekblue">For: {item.student_name}</Tag>
                      )}
                    </div>
                  </>
                }
              />
            </List.Item>
          )}
        />
      ) : (
        <Text>No personal announcements found.</Text>
      )}
    </Modal>
  );
};

export default PersonalAnnouncementsModal;