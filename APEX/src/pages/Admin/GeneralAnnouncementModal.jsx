import { useState, useEffect } from 'react';
import { Modal, Form, Input, Radio, message } from 'antd';
import { 
  CheckCircleOutlined,
  FileTextOutlined,
  ExclamationCircleOutlined 
} from '@ant-design/icons';
import PropTypes from 'prop-types';

const GeneralAnnouncementModal = ({ visible, onCancel, onSuccess, editingAnnouncement }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editingAnnouncement) {
      form.setFieldsValue({
        announce_title: editingAnnouncement.announce_title,
        message: editingAnnouncement.message,
        status: editingAnnouncement.status
      });
    } else {
      form.resetFields();
    }
  }, [editingAnnouncement, form]);

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      // Determine if we're creating or updating
      const isEditing = !!editingAnnouncement;
      const apiUrl = isEditing 
        ? 'https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/Announce_update.php'
        : 'https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/All_announce_insert.php';
      
      // Prepare payload
      const payload = {
        announce_title: values.announce_title.trim(),
        message: values.message.trim(),
        status: values.status
      };

      // Add ID if editing
      if (isEditing) {
        payload.id = editingAnnouncement.id;
      }

      // Debug payload
      console.log('Submitting:', payload);

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Essential for session cookies
        body: JSON.stringify(payload),
      });

      // Handle raw response first
      const responseText = await response.text();
      let data;
      
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        throw new Error(`Invalid JSON response: ${responseText}`);
      }

      // Handle session expiration
      if (response.status === 401) {
        message.error('Session expired. Please login again.');
        // Redirect to login or show login modal
        window.location.href = '/login';
        return;
      }

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      if (data.status === 'success') {
        message.success(
          isEditing 
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
      console.error('Submission error:', error);
      message.error(error.message || `Failed to ${editingAnnouncement ? 'update' : 'create'} announcement`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={editingAnnouncement ? 'Edit Announcement' : 'Create Announcement'}
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
          name="message"
          label="Message"
          rules={[{ required: true, message: 'Please enter message' }]}
        >
          <Input.TextArea rows={6} placeholder="Enter announcement message" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

GeneralAnnouncementModal.propTypes = {
  visible: PropTypes.bool.isRequired,
  onCancel: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
  editingAnnouncement: PropTypes.object,
};

export default GeneralAnnouncementModal;