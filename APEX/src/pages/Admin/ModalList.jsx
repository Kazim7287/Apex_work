import { useState, useEffect } from 'react';
import { Modal, Table, Tag, Button, Spin, Typography, message, Popconfirm, Form, Input, Select } from 'antd';

const { Text } = Typography;
const { Option } = Select;

// eslint-disable-next-line react/prop-types
const ModalList = ({ studentId, visible, onClose }) => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [studentName, setStudentName] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    if (visible && studentId) {
      fetchAnnouncements();
      fetchStudentName();
    }
  }, [visible, studentId]);

  const fetchStudentName = async () => {
    try {
      const response = await fetch(
        `https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/get_student_name.php?student_id=${studentId}`
      );
      const data = await response.json();
      
      if (data.success) {
        setStudentName(data.student_name);
      }
    } catch (error) {
      console.error('Error fetching student name:', error);
    }
  };

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/get_student_announce.php?student_id=${studentId}`
      );
      const data = await response.json();
      
      if (data.success) {
        setAnnouncements(data.data);
      } else {
        throw new Error(data.message || 'Failed to fetch announcements');
      }
    } catch (error) {
      console.error('Error:', error);
      message.error(error.message || 'Failed to load announcements');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      setLoading(true);
      const response = await fetch('https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/single_announce_delete.php', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        message.success('Announcement deleted successfully');
        fetchAnnouncements();
      } else {
        throw new Error(data.message || 'Failed to delete announcement');
      }
    } catch (error) {
      console.error('Error:', error);
      message.error(error.message || 'Failed to delete announcement');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (record) => {
    setEditingId(record.id);
    form.setFieldsValue({
      announce_title: record.announce_title,
      description: record.description,
      status: record.status,
    });
  };

  const handleUpdate = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      
      const response = await fetch('https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/single_announce_update.php', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: editingId,
          ...values,
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        message.success('Announcement updated successfully');
        setEditingId(null);
        fetchAnnouncements();
      } else {
        throw new Error(data.message || 'Failed to update announcement');
      }
    } catch (error) {
      console.error('Error:', error);
      message.error(error.message || 'Failed to update announcement');
    } finally {
      setLoading(false);
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const columns = [
    {
      title: 'Title',
      dataIndex: 'announce_title',
      key: 'title',
      render: (text, record) => (
        editingId === record.id ? (
          <Form.Item name="announce_title" rules={[{ required: true, message: 'Please input title!' }]}>
            <Input />
          </Form.Item>
        ) : (
          <Text strong>{text}</Text>
        )
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status, record) => (
        editingId === record.id ? (
          <Form.Item name="status" rules={[{ required: true, message: 'Please select status!' }]}>
            <Select>
              <Option value="urgent">Urgent</Option>
              <Option value="academic">Academic</Option>
              <Option value="general">General</Option>
            </Select>
          </Form.Item>
        ) : (
          <Tag color={
            status === 'urgent' ? 'red' : 
            status === 'academic' ? 'blue' : 
            status === 'general' ? 'green' : 'gray'
          }>
            {status}
          </Tag>
        )
      ),
    },
    {
      title: 'Date',
      dataIndex: 'created_at',
      key: 'date',
      render: (date) => new Date(date).toLocaleString(),
    },
    {
      title: 'Message',
      dataIndex: 'description',
      key: 'message',
      render: (text, record) => (
        editingId === record.id ? (
          <Form.Item name="description" rules={[{ required: true, message: 'Please input description!' }]}>
            <Input.TextArea />
          </Form.Item>
        ) : (
          <Text>{text}</Text>
        )
      ),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        editingId === record.id ? (
          <span>
            <Button type="link" onClick={handleUpdate}>Save</Button>
            <Button type="link" onClick={cancelEdit}>Cancel</Button>
          </span>
        ) : (
          <span>
            <Button type="link" onClick={() => handleEdit(record)}>Edit</Button>
            <Popconfirm
              title="Are you sure to delete this announcement?"
              onConfirm={() => handleDelete(record.id)}
              okText="Yes"
              cancelText="No"
            >
              <Button type="link" danger>Delete</Button>
            </Popconfirm>
          </span>
        )
      ),
    },
  ];

  return (
    <Modal
      title={`Announcements for ${studentName || 'Student'}`}
      visible={visible}
      onCancel={onClose}
      footer={[
        <Button key="close" onClick={onClose}>
          Close
        </Button>,
      ]}
      width={1000}
    >
      <Spin spinning={loading}>
        <Form form={form} component={false}>
          <Table
            columns={columns}
            dataSource={announcements}
            rowKey="id"
            pagination={{ pageSize: 5 }}
            scroll={{ x: true }}
          />
        </Form>
      </Spin>
    </Modal>
  );
};

export default ModalList;