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
import TeacherAnnouncementModal from './TeacherAnnouncementModal';

const { Text, Paragraph } = Typography;

const TeacherAnnouncementList = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [modalVisible, setModalVisible] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);

  const fetchAnnouncements = async (params = {}) => {
    setLoading(true);
    try {
      const { current, pageSize } = pagination;
      const offset = (current - 1) * pageSize;
      
      const queryParams = new URLSearchParams({
        limit: pageSize,
        offset: offset,
        ...params
      });

      const response = await fetch(`https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/all_teachers_announce_read.php?${queryParams}`, {
        credentials: 'include' // Important for session cookies
      });
      
      // Handle session expiration
      if (response.status === 401) {
        message.error('Session expired. Please login again.');
        window.location.href = '/login';
        return;
      }

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const data = await response.json();
      if (data.status === 'success') {
        setAnnouncements(data.data);
        setPagination({
          ...pagination,
          total: data.total
        });
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

  useEffect(() => {
    fetchAnnouncements();
  }, [pagination.current, pagination.pageSize]);

  const handleDelete = async (id) => {
    try {
      const response = await fetch('https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/all_teachers_announce_delete.php', {
        method: 'DELETE',
        headers: { 
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Important for session cookies
        body: JSON.stringify({ id }),
      });

      // Handle session expiration
      if (response.status === 401) {
        message.error('Session expired. Please login again.');
        window.location.href = '/login';
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete announcement');
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
      message.error(error.message || 'Failed to delete announcement. Please try again.');
    }
  };

  const handleTableChange = (pagination) => {
    setPagination(pagination);
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
        Create New Teacher Announcement
      </Button>

      <Card loading={loading} bodyStyle={{ padding: 0 }}>
        <List
          itemLayout="vertical"
          size="large"
          dataSource={announcements}
          pagination={{
            ...pagination,
            onChange: handleTableChange,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50', '100'],
            showTotal: (total) => `Total ${total} announcements`
          }}
          renderItem={(item) => (
            <List.Item
              key={item.id}
              actions={[
                <Button 
                  key="edit" 
                  icon={<EditOutlined />} 
                  onClick={() => { setEditingAnnouncement(item); setModalVisible(true); }}
                />,
                <Popconfirm
                  key="delete"
                  title="Are you sure to delete this announcement?"
                  onConfirm={() => handleDelete(item.id)}
                  okText="Yes"
                  cancelText="No"
                >
                  <Button icon={<DeleteOutlined />} danger />
                </Popconfirm>
              ]}
              extra={<Tag icon={<CalendarOutlined />}>{formatDate(item.date)}</Tag>}
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
                {item.description}
              </Paragraph>
            </List.Item>
          )}
        />
      </Card>

      <TeacherAnnouncementModal
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        onSuccess={fetchAnnouncements}
        editingAnnouncement={editingAnnouncement}
      />
    </Space>
  );
};

export default TeacherAnnouncementList;