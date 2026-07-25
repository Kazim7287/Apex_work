import { useState, useEffect } from 'react';
import { List, Card, Button, Modal, Tag, message, Spin, Empty, Select, Popconfirm } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import SingleTeacherAnnouncementCreator from './SingleTeacherAnnouncementCreator';

const { Option } = Select;

const SingleTeacherAnnouncementList = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [selectedTeacherId, setSelectedTeacherId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingTeachers, setLoadingTeachers] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);

  // Fetch teachers with proper name handling for your API structure
  const fetchTeachers = async () => {
    setLoadingTeachers(true);
    try {
      const response = await fetch('https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/teach_read.php');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch teachers');
      }

      // Normalize teacher data according to your API structure
      const normalizedTeachers = result.data.map(teacher => ({
        id: teacher.id,
        name: teacher.teach_name,
        email: teacher.teach_email,
        phone: teacher.teach_no,
        section: teacher.teach_sec
      }));

      setTeachers(normalizedTeachers);
      
      if (normalizedTeachers.length === 0) {
        message.warning('No teachers found in the system');
      }
    } catch (error) {
      console.error('Error fetching teachers:', error);
      message.error('Failed to load teachers list');
      setTeachers([]);
    } finally {
      setLoadingTeachers(false);
    }
  };

  // Fetch announcements for selected teacher
  const fetchAnnouncements = async () => {
    if (!selectedTeacherId) {
      setAnnouncements([]);
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch(
        `https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/single_teach_announce_read.php?teacher_id=${selectedTeacherId}`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.status === 'success') {
        setAnnouncements(Array.isArray(result.data) ? result.data : []);
      } else {
        message.warning(result.message || 'No announcements found');
        setAnnouncements([]);
      }
    } catch (error) {
      console.error('API Error:', error);
      message.error('Failed to load announcements. Please try again.');
      setAnnouncements([]);
    } finally {
      setLoading(false);
    }
  };

  // Delete announcement
  const deleteAnnouncement = async (id) => {
    try {
      const response = await fetch(
        `https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/single_teach_announce_delete.php`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ id })
        }
      );

      const result = await response.json();
      
      if (result.status === 'success') {
        message.success('Announcement deleted successfully');
        fetchAnnouncements();
      } else {
        message.error(result.message || 'Failed to delete announcement');
      }
    } catch (error) {
      console.error('Delete Error:', error);
      message.error('Failed to delete announcement');
    }
  };

  // Edit handler
  const handleEdit = (announcement) => {
    setEditingAnnouncement(announcement);
    setIsModalVisible(true);
  };

  // Delete confirmation handler
  const handleDelete = (id) => {
    deleteAnnouncement(id);
  };

  // Fetch teachers on mount
  useEffect(() => {
    fetchTeachers();
  }, []);

  // Fetch announcements when teacher changes
  useEffect(() => {
    fetchAnnouncements();
  }, [selectedTeacherId]);

  // Show modal for new announcement
  const showModal = () => {
    if (!selectedTeacherId) {
      message.warning('Please select a teacher first');
      return;
    }
    setEditingAnnouncement(null);
    setIsModalVisible(true);
  };

  // Modal cancel handler
  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingAnnouncement(null);
  };

  // Success handler after create/update
  const handleCreateSuccess = () => {
    setIsModalVisible(false);
    setEditingAnnouncement(null);
    fetchAnnouncements();
  };

  // Get tag color based on status
  const getStatusColor = (status) => {
    switch (status) {
      case 'Urgent': return 'red';
      case 'Academic': return 'blue';
      default: return 'green';
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      console.error('Invalid date format:', dateString);
      return dateString;
    }
  };

  return (
    <div className="announcement-container" style={{ padding: '20px' }}>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', gap: '16px' }}>
        <Select
          style={{ minWidth: 300, flex: 1 }}
          placeholder={loadingTeachers ? 'Loading teachers...' : 'Select a teacher'}
          loading={loadingTeachers}
          onChange={setSelectedTeacherId}
          value={selectedTeacherId}
          allowClear
          showSearch
          optionFilterProp="children"
          filterOption={(input, option) =>
            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
          }
          notFoundContent={loadingTeachers ? <Spin size="small" /> : 'No teachers found'}
        >
          {teachers.map(teacher => (
            <Option key={teacher.id} value={teacher.id}>
              {teacher.name} {teacher.email && `(${teacher.email})`}
            </Option>
          ))}
        </Select>
        
        <Button 
          type="primary" 
          onClick={showModal}
          disabled={!selectedTeacherId || loadingTeachers}
        >
          Create New Announcement
        </Button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <Spin size="large" tip="Loading announcements..." />
        </div>
      ) : !selectedTeacherId ? (
        <Empty 
          description="Please select a teacher to view announcements" 
          image={Empty.PRESENTED_IMAGE_SIMPLE} 
        />
      ) : announcements.length === 0 ? (
        <Empty 
          description="No announcements available for this teacher" 
          image={Empty.PRESENTED_IMAGE_SIMPLE} 
        />
      ) : (
        <List
          itemLayout="vertical"
          dataSource={announcements}
          renderItem={item => (
            <List.Item key={item.id}>
              <Card
                title={<span style={{ fontWeight: 'bold' }}>{item.announce_title}</span>}
                style={{ marginBottom: 16 }}
                extra={
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Tag color={getStatusColor(item.status)}>{item.status}</Tag>
                    <span style={{ color: '#666' }}>{formatDate(item.date)}</span>
                  </div>
                }
                actions={[
                  <Button 
                    key="edit" 
                    type="text" 
                    icon={<EditOutlined />} 
                    onClick={() => handleEdit(item)}
                  >Edit</Button>,
                  <Popconfirm
                    key="delete"
                    title="Are you sure to delete this announcement?"
                    onConfirm={() => handleDelete(item.id)}
                    okText="Yes"
                    cancelText="No"
                  >
                    <Button 
                      type="text" 
                      danger 
                      icon={<DeleteOutlined />}
                    >Delete</Button>
                  </Popconfirm>
                ]}
              >
                <div style={{ whiteSpace: 'pre-line', marginBottom: 8 }}>{item.description}</div>
                <div style={{ fontSize: 12, color: '#999' }}>ID: {item.id}</div>
              </Card>
            </List.Item>
          )}
        />
      )}

      <Modal
        title={editingAnnouncement ? "Edit Announcement" : "Create New Announcement"}
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        width={800}
        destroyOnClose
      >
        <SingleTeacherAnnouncementCreator 
          teacherId={selectedTeacherId}
          announcementData={editingAnnouncement}
          onSuccess={handleCreateSuccess} 
        />
      </Modal>
    </div>
  );
};

export default SingleTeacherAnnouncementList;