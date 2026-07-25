import { useState, useEffect } from 'react';
import { Modal, Form, Input, Radio, message } from 'antd';
import { 
  CheckCircleOutlined,
  FileTextOutlined,
  ExclamationCircleOutlined 
} from '@ant-design/icons';
import PropTypes from 'prop-types';

const StudentAnnouncementModal = ({ 
  visible, 
  onCancel, 
  onSuccess, 
  editingAnnouncement 
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editingAnnouncement) {
      form.setFieldsValue({
        announce_title: editingAnnouncement.announce_title,
        description: editingAnnouncement.description,
        status: editingAnnouncement.status,
      });
    } else {
      form.resetFields();
    }
  }, [editingAnnouncement, form]);

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const apiUrl = editingAnnouncement 
        ? 'https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/all_students_announce_update.php'
        : 'https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/all_student_announce_insert.php';
      
      const payload = editingAnnouncement
        ? {
            ...values,
            id: editingAnnouncement.id,
            date: new Date().toISOString().split('T')[0] // Add date for PUT
          }
        : {
            ...values,
            date: new Date().toISOString().split('T')[0]
          };

      const response = await fetch(apiUrl, {
        method: editingAnnouncement ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.status === 'success') {
        message.success(
          editingAnnouncement 
            ? 'Announcement updated successfully' 
            : 'Announcement created successfully'
        );
        onSuccess();
        onCancel();
      } else {
        throw new Error(data.message || 'Operation failed');
      }
    } catch (error) {
      console.error('Error:', error);
      message.error(error.message || 'Failed to save announcement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={editingAnnouncement ? 'Edit Announcement' : 'Create Announcement'}
      open={visible}
      onCancel={onCancel}
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
          label="Description"
          rules={[{ required: true, message: 'Please enter description' }]}
        >
          <Input.TextArea rows={6} placeholder="Enter announcement details" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

StudentAnnouncementModal.propTypes = {
  visible: PropTypes.bool.isRequired,
  onCancel: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
  editingAnnouncement: PropTypes.object,
};

export default StudentAnnouncementModal;
