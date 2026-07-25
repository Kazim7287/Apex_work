import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Form, Input, Button, Select, message } from 'antd';

const { Option } = Select;
const { TextArea } = Input;

const SingleTeacherAnnouncementCreator = ({ teacherId, announcementData, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // Set form values when editing
  useEffect(() => {
    if (announcementData) {
      form.setFieldsValue({
        announce_title: announcementData.announce_title,
        description: announcementData.description,
        status: announcementData.status
      });
    } else {
      form.resetFields();
    }
  }, [announcementData, form]);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const url = announcementData 
        ? 'https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/Single_teach_announce_update.php'
        : 'https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/Single_teach_announce_insert.php';
      
      const method = announcementData ? 'PUT' : 'POST';
      
      const body = announcementData
        ? { ...values, id: announcementData.id }
        : { ...values, teacher_id: teacherId };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Important for session cookies
        body: JSON.stringify(body)
      });

      // Handle session expiration
      if (response.status === 401) {
        message.error('Session expired. Please login again.');
        window.location.href = '/login';
        return;
      }

      const result = await response.json();
      
      if (result.status === 'success') {
        message.success(
          announcementData 
            ? 'Announcement updated successfully' 
            : 'Announcement created successfully'
        );
        onSuccess();
      } else {
        message.error(result.message || 'Operation failed');
      }
    } catch (error) {
      console.error('Error:', error);
      message.error('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      initialValues={{
        status: 'General'
      }}
    >
      <Form.Item
        label="Title"
        name="announce_title"
        rules={[{ required: true, message: 'Please input the title!' }]}
      >
        <Input placeholder="Enter announcement title" />
      </Form.Item>

      <Form.Item
        label="Description"
        name="description"
        rules={[{ required: true, message: 'Please input the description!' }]}
      >
        <TextArea rows={4} placeholder="Enter announcement details" />
      </Form.Item>

      <Form.Item
        label="Status"
        name="status"
        rules={[{ required: true, message: 'Please select a status!' }]}
      >
        <Select>
          <Option value="General">General</Option>
          <Option value="Urgent">Urgent</Option>
          <Option value="Academic">Academic</Option>
        </Select>
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading}>
          {announcementData ? 'Update Announcement' : 'Create Announcement'}
        </Button>
      </Form.Item>
    </Form>
  );
};
SingleTeacherAnnouncementCreator.propTypes = {
  teacherId: PropTypes.number.isRequired,
  announcementData: PropTypes.shape({
    announce_title: PropTypes.string,
    description: PropTypes.string,
    status: PropTypes.string,
    id: PropTypes.number,
  }),
  onSuccess: PropTypes.func.isRequired,
};

export default SingleTeacherAnnouncementCreator;
