import { useState } from 'react';
import { Form, Input, Button, Select, message, Card, Spin } from 'antd';
import StudentSearch from './SingleStudentAnnouncementModal';
import ModalList from './ModalList';

const { TextArea } = Input;
const { Option } = Select;

const SingleStudentAnnouncementCreator = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showListModal, setShowListModal] = useState(false);

  const onFinish = async (values) => {
    if (!selectedStudent) {
      message.error('Please select a student');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        student_id: selectedStudent.id,
        announce_title: values.title,
        description: values.message,
        status: values.status
      };

      const response = await fetch('https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/single_std_announce.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success) {
        message.success(data.message || 'Announcement created successfully!');
        form.resetFields();
      } else {
        throw new Error(data.message || 'Failed to create announcement');
      }
    } catch (error) {
      console.error('Error:', error);
      message.error(error.message || 'Failed to create announcement');
    } finally {
      setLoading(false);
    }
  };

  const handleStudentSelect = (student) => {
    setSelectedStudent(student);
  };

  const handleViewList = () => {
    if (!selectedStudent) {
      message.error('Please select a student first');
      return;
    }
    setShowListModal(true);
  };

  return (
    <Card 
      title="Create Announcement for Specific Student"
      extra={
        <Button 
          type="link" 
          onClick={handleViewList}
          disabled={!selectedStudent}
        >
          View Announcements
        </Button>
      }
    >
      <Spin spinning={loading}>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          autoComplete="off"
        >
          <Form.Item
            label="Select Student"
            required
          >
            <StudentSearch onSelect={handleStudentSelect} />
            {selectedStudent && (
              <div style={{ marginTop: 8 }}>
                Selected: {selectedStudent.name} (ID: {selectedStudent.id})
              </div>
            )}
          </Form.Item>

          <Form.Item
            name="title"
            label="Title"
            rules={[{ required: true, message: 'Please input a title!' }]}
          >
            <Input placeholder="Announcement title" />
          </Form.Item>

          <Form.Item
            name="status"
            label="Status"
            initialValue="active"
            rules={[{ required: true }]}
          >
            <Select>
              <Option value="active">Active</Option>
              <Option value="general">General</Option>
              <Option value="academic">Academic</Option>
              <Option value="urgent">Urgent</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="message"
            label="Message"
            rules={[{ required: true, message: 'Please input your message!' }]}
          >
            <TextArea rows={4} placeholder="Detailed announcement content" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit">
              Create Announcement
            </Button>
          </Form.Item>
        </Form>
      </Spin>

      <ModalList
        studentId={selectedStudent?.id}
        visible={showListModal}
        onClose={() => setShowListModal(false)}
      />
    </Card>
  );
};

export default SingleStudentAnnouncementCreator;