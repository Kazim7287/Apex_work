/* eslint-disable react/jsx-key */
import { useState, useEffect } from 'react';
import { List, Card, Button, Popconfirm, message, Space, Typography, Tag } from 'antd';
import { 
  CalendarOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  FileTextOutlined,
  EditOutlined,
  DeleteOutlined
} from '@ant-design/icons';
import moment from 'moment';
import GeneralAnnouncementModal from './GeneralAnnouncementModal';

const { Text, Paragraph } = Typography;

const GeneralAnnouncementList = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/All_announcement_read.php', {
        credentials: 'include' // Essential for session cookies
      });
      
      // Handle unauthorized (401) responses
      if (response.status === 401) {
        message.error('Session expired. Please login again.');
        window.location.href = '/login';
        return;
      }
      
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const data = await response.json();
      
      if (data.status === 'success') {
        setAnnouncements(data.data);
      } else {
        throw new Error(data.message || 'Failed to fetch announcements');
      }
    } catch (error) {
      console.error('Error:', error);
      message.error(error.message || 'Failed to load announcements. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch('https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/All_announce_Delete.php', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include session cookies
        body: JSON.stringify({ id }),
      });

      // Handle unauthorized (401) responses
      if (response.status === 401) {
        message.error('Session expired. Please login again.');
        window.location.href = '/login';
        return;
      }

      const data = await response.json();
      
      if (data.status === 'success') {
        message.success('Announcement deleted successfully');
        fetchAnnouncements();
      } else {
        throw new Error(data.message || 'Failed to delete announcement');
      }
    } catch (error) {
      console.error('Error:', error);
      message.error(error.message || 'Network error. Please try again.');
    }
  };

  const getStatusTag = (status) => {
    const statusConfig = {
      urgent: { icon: <ExclamationCircleOutlined />, color: 'red', text: 'Urgent' },
      academic: { icon: <CheckCircleOutlined />, color: 'blue', text: 'Academic' },
      general: { icon: <FileTextOutlined />, color: 'green', text: 'General' }
    };
    
    const config = statusConfig[status?.toLowerCase()] || statusConfig.general;
    return <Tag icon={config.icon} color={config.color}>{config.text}</Tag>;
  };

  const formatDate = (dateString) => moment(dateString).format('MMMM Do YYYY, h:mm a');

  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      <Button 
        type="primary" 
        onClick={() => { setEditingAnnouncement(null); setModalVisible(true); }}
        style={{ marginBottom: 16 }}
      >
        Create New Announcement
      </Button>

      <Card loading={loading} bodyStyle={{ padding: 0 }}>
        <List
          itemLayout="vertical"
          size="large"
          dataSource={announcements}
          renderItem={(item) => (
            <List.Item
              key={item.id}
              actions={[
                <Button 
                  icon={<EditOutlined />} 
                  onClick={() => { setEditingAnnouncement(item); setModalVisible(true); }}
                />,
                <Popconfirm
                  title="Are you sure to delete this announcement?"
                  onConfirm={() => handleDelete(item.id)}
                  okText="Yes"
                  cancelText="No"
                >
                  <Button icon={<DeleteOutlined />} danger />
                </Popconfirm>
              ]}
              extra={<Tag icon={<CalendarOutlined />}>{formatDate(item.created_at || item.date)}</Tag>}
            >
              <List.Item.Meta
                title={
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    {getStatusTag(item.status)}
                    <Text strong style={{ marginLeft: 8, fontSize: '1.1rem' }}>
                      {item.announce_title}
                    </Text>
                  </div>
                }
              />
              <Paragraph style={{ 
                marginTop: 8,
                padding: 12,
                backgroundColor: '#f9f9f9',
                borderRadius: 4,
                whiteSpace: 'pre-wrap'
              }}>
                {item.message}
              </Paragraph>
            </List.Item>
          )}
        />
      </Card>

      <GeneralAnnouncementModal
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        onSuccess={fetchAnnouncements}
        editingAnnouncement={editingAnnouncement}
      />
    </Space>
  );
};

export default GeneralAnnouncementList;