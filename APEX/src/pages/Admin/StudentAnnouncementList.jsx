import { useState, useEffect } from 'react';
import { List, Card, Tag, Button, Popconfirm, message, Space } from 'antd';
import { 
  CalendarOutlined,
  TeamOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  FileTextOutlined,
  EditOutlined,
  DeleteOutlined
} from '@ant-design/icons';
import moment from 'moment';
import StudentAnnouncementModal from './StudentAnnoucementModal'; // Corrected import

const StudentAnnouncementList = () => {
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
      const response = await fetch('https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/all_students_announce_get.php');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.status === 'success') {
        setAnnouncements(data.data);
      } else {
        message.error(data.message || 'Failed to fetch announcements');
      }
    } catch (error) {
      console.error('Error:', error);
      message.error('Failed to load announcements. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch('https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/all_students_announce_delete.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      });

      const data = await response.json();

      if (data.status === 'success') {
        message.success('Announcement deleted successfully');
        fetchAnnouncements();
      } else {
        message.error(data.message || 'Failed to delete announcement');
      }
    } catch (error) {
      console.error('Error:', error);
      message.error('Network error. Please try again.');
    }
  };

  const getStatusTag = (status) => {
    switch(status?.toLowerCase()) {
      case 'urgent':
        return <Tag icon={<ExclamationCircleOutlined />} color="red">Urgent</Tag>;
      case 'academic':
        return <Tag icon={<CheckCircleOutlined />} color="blue">Academic</Tag>;
      default:
        return <Tag icon={<FileTextOutlined />} color="green">General</Tag>;
    }
  };

  const formatDate = (dateString) => {
    return moment(dateString).format('MMMM Do YYYY, h:mm a');
  };

  return (
    <div style={{ padding: '20px' }}>
      <Space direction="vertical" style={{ width: '100%' }}>
        <Button 
          type="primary" 
          onClick={() => {
            setEditingAnnouncement(null);
            setModalVisible(true);
          }}
          style={{ marginBottom: 16 }}
        >
          Create New Announcement
        </Button>

        <Card 
          title={
            <span>
              <TeamOutlined style={{ marginRight: 8 }} />
              Student Announcements
            </span>
          }
          loading={loading}
        >
          <List
            itemLayout="vertical"
            size="large"
            dataSource={announcements}
            renderItem={(item) => (
              <List.Item
                key={item.id}
                actions={[
                  // eslint-disable-next-line react/jsx-key
                  <Button 
                    icon={<EditOutlined />} 
                    onClick={() => {
                      setEditingAnnouncement(item);
                      setModalVisible(true);
                    }}
                  />,
                  // eslint-disable-next-line react/jsx-key
                  <Popconfirm
                    title="Are you sure to delete this announcement?"
                    onConfirm={() => handleDelete(item.id)}
                    okText="Yes"
                    cancelText="No"
                  >
                    <Button icon={<DeleteOutlined />} danger />
                  </Popconfirm>
                ]}
                extra={
                  <Tag icon={<CalendarOutlined />}>
                    {formatDate(item.date)}
                  </Tag>
                }
              >
                <List.Item.Meta
                  title={<>
                    {getStatusTag(item.status)}
                    <span style={{ marginLeft: 8 }}>{item.announce_title}</span>
                  </>}
                  description={item.description}
                />
              </List.Item>
            )}
          />
        </Card>
      </Space>

      <StudentAnnouncementModal
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        onSuccess={fetchAnnouncements}
        editingAnnouncement={editingAnnouncement}
      />
    </div>
  );
};

export default StudentAnnouncementList;