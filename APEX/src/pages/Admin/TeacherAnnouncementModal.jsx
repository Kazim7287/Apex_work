import { useState, useEffect } from 'react';
import { Modal, Form, Input, Radio, message } from 'antd';
import { 
  CheckCircleOutlined,
  FileTextOutlined,
  ExclamationCircleOutlined 
} from '@ant-design/icons';
import PropTypes from 'prop-types';

const TeacherAnnouncementModal = ({ visible, onCancel, onSuccess, editingAnnouncement }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editingAnnouncement) {
      form.setFieldsValue({
        announce_title: editingAnnouncement.announce_title,
        description: editingAnnouncement.description,
        status: editingAnnouncement.status
      });
    } else {
      form.resetFields();
    }
  }, [editingAnnouncement, form]);

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const apiUrl = editingAnnouncement 
        ? 'https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/all_teachers_announce_update.php'
        : 'https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/all_teachers_announcements_insert.php';
      
      const method = editingAnnouncement ? 'PUT' : 'POST';
      
      const payload = {
        ...values,
        ...(editingAnnouncement && { id: editingAnnouncement.id })
      };

      const response = await fetch(apiUrl, {
        method,
        headers: { 
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Essential for session cookies
        body: JSON.stringify(payload),
      });

      // Handle session expiration
      if (response.status === 401) {
        message.error('Session expired. Please login again.');
        window.location.href = '/login';
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.status === 'success') {
        message.success(
          editingAnnouncement 
            ? 'Announcement updated successfully' 
            : 'Announcement created successfully'
        );
        form.resetFields();
        onSuccess();
        onCancel();
      } else {
        throw new Error(data.message || 'Operation failed');
      }
    } catch (error) {
      console.error('Error:', error);
      message.error(error.message || `Failed to ${editingAnnouncement ? 'update' : 'create'} announcement`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={editingAnnouncement ? 'Edit Teacher Announcement' : 'Create Teacher Announcement'}
      open={visible}
      onCancel={() => {
        form.resetFields();
        onCancel();
      }}
      onOk={() => form.submit()}
      confirmLoading={loading}
      width={700}
      destroyOnClose
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item 
          name="status" 
          label="Status" 
          rules={[{ required: true, message: 'Please select status' }]}
        >
          <Radio.Group>
            <Radio.Button value="urgent" style={{ color: '#ff4d4f' }}>
              <ExclamationCircleOutlined /> Urgent
            </Radio.Button>
            <Radio.Button value="general">
              <FileTextOutlined /> General
            </Radio.Button>
            <Radio.Button value="academic" style={{ color: '#1890ff' }}>
              <CheckCircleOutlined /> Academic
            </Radio.Button>
          </Radio.Group>
        </Form.Item>

        <Form.Item 
          name="announce_title" 
          label="Title" 
          rules={[{ required: true, message: 'Please enter title' }]}
        >
          <Input placeholder="Enter announcement title" />
        </Form.Item>

        <Form.Item 
          name="description"
          label="Message"
          rules={[{ required: true, message: 'Please enter message' }]}
        >
          <Input.TextArea rows={6} placeholder="Enter announcement message" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

TeacherAnnouncementModal.propTypes = {
  visible: PropTypes.bool.isRequired,
  onCancel: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
  editingAnnouncement: PropTypes.object,
};

export default TeacherAnnouncementModal;