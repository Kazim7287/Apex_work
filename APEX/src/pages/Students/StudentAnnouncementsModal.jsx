/* eslint-disable react/prop-types */
import { useState, useEffect } from 'react';
import { Modal, List, Typography, Tag, Avatar, Badge, Space, Spin, Button, message } from 'antd';
import { NotificationOutlined, ClockCircleOutlined } from '@ant-design/icons';

const { Text } = Typography;

const StudentAnnouncementsModal = ({ visible, onCancel }) => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchStudentAnnouncements = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/all_students_announce_get.php');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.status === 'success') {
        setAnnouncements(data.data);
      } else {
        throw new Error(data.message || 'Failed to fetch student announcements');
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
      fetchStudentAnnouncements();
    }
  }, [visible]);

  return (
    <Modal
      title="Student Announcements"
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
              onClick={fetchStudentAnnouncements}
            >
              Retry
            </Button>
          </div>
        </div>
      ) : (
        <List
          itemLayout="horizontal"
          dataSource={announcements}
          locale={{ emptyText: 'No student announcements found' }}
          renderItem={(item) => (
            <List.Item>
              <List.Item.Meta
                avatar={
                  <Avatar 
                    icon={<NotificationOutlined />} 
                    style={{ 
                      backgroundColor: item.status === 'urgent' ? '#ff4d4f' : '#1890ff' 
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
                    <Text style={{ whiteSpace: 'pre-line' }}>{item.message || item.content}</Text>
                    <div style={{ marginTop: 8 }}>
                      <Tag icon={<ClockCircleOutlined />} color="default">
                        {item.created_at || item.date}
                      </Tag>
                      <Tag color="blue">STUDENT</Tag>
                      {item.department && (
                        <Tag color="geekblue">{item.department.toUpperCase()}</Tag>
                      )}
                    </div>
                  </>
                }
              />
            </List.Item>
          )}
        />
      )}
    </Modal>
  );
};

export default StudentAnnouncementsModal;