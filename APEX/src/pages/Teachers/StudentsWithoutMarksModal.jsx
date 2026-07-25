import React, { useState, useEffect } from 'react';
import { Modal, Table, Button, Input, Form, message, Space, Typography, Spin, Tag } from 'antd';

const { Text, Title } = Typography;

const StudentsWithoutMarksModal = ({ isVisible, onClose, refreshParent }) => {
  const [students, setStudents] = useState([]);
  const [editingStudent, setEditingStudent] = useState(null);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (isVisible) {
      fetchStudents();
    }
  }, [isVisible]);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/studentsWithoutmarks.php');
      if (!response.ok) throw new Error('Network response was not ok');
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      const processedStudents = (data.students_without_marks || []).map(student => ({
        ...student,
        key: student.performance_id,
        performance_id: student.performance_id,
        student_name: student.student_name,
        section_name: student.section_name || `Class ${student.class}`,
        subject_name: student.subject_name,
        exam_name: student.exam_name,
        total_marks: student.total_marks,
        obtained_marks: student.obtained_marks
      }));
      
      setStudents(processedStudents);
    } catch (error) {
      console.error('Fetch error:', error);
      message.error(`Failed to fetch students: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (student) => {
    setEditingStudent(student);
    form.setFieldsValue({ 
      obtained_marks: student.obtained_marks === 0 || student.obtained_marks === null ? '' : student.obtained_marks 
    });
  };

  const handleUpdate = async (values) => {
    setUpdating(true);
    try {
      const marks = parseFloat(values.obtained_marks);
      
      if (isNaN(marks)) {
        throw new Error('Please enter valid marks');
      }

      if (marks < 0 || marks > editingStudent.total_marks) {
        throw new Error(`Marks must be between 0 and ${editingStudent.total_marks}`);
      }

      const response = await fetch('https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/studentsWithoutmarks.php', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          performance_id: editingStudent.performance_id,
          obtained_marks: marks
        })
      });

      if (!response.ok) throw new Error('Network response was not ok');
      
      const data = await response.json();
      if (data.error) throw new Error(data.error);

      message.success(`Successfully updated marks for ${editingStudent.student_name}`);
      setEditingStudent(null);
      form.resetFields();
      fetchStudents();
      if (refreshParent) refreshParent();
    } catch (error) {
      console.error('Update error:', error);
      message.error(error.message);
    } finally {
      setUpdating(false);
    }
  };

  const columns = [
    {
      title: 'Student ID',
      dataIndex: 'student_id',
      key: 'student_id',
      width: 100,
      sorter: (a, b) => a.student_id - b.student_id
    },
    {
      title: 'Student Name',
      dataIndex: 'student_name',
      key: 'student_name',
      render: (text) => <Text strong>{text}</Text>
    },
    {
      title: 'Class/Section',
      dataIndex: 'section_name',
      key: 'section_name',
      render: (text) => <Tag color="blue">{text}</Tag>
    },
    {
      title: 'Subject',
      dataIndex: 'subject_name',
      key: 'subject_name'
    },
    {
      title: 'Exam',
      dataIndex: 'exam_name',
      key: 'exam_name'
    },
    {
      title: 'Total Marks',
      dataIndex: 'total_marks',
      key: 'total_marks',
      width: 120,
      sorter: (a, b) => a.total_marks - b.total_marks,
      render: (text) => <Text strong>{text}</Text>
    },
    {
      title: 'Obtained Marks',
      dataIndex: 'obtained_marks',
      key: 'obtained_marks',
      width: 150,
      render: (marks, record) => (
        <Text type={marks === null || marks === 0 ? 'danger' : 'success'}>
          {marks === null || marks === 0 ? 'Not Marked' : marks}
        </Text>
      )
    },
    {
      title: 'Actions',
      key: 'action',
      width: 200,
      render: (_, record) => (
        <Space>
          <Button 
            type="primary" 
            size="small"
            onClick={() => handleEdit(record)}
          >
            {record.obtained_marks === null || record.obtained_marks === 0 ? 'Add Marks' : 'Edit Marks'}
          </Button>
          {record.obtained_marks !== null && record.obtained_marks !== 0 && (
            <Button 
              size="small"
              danger
              onClick={() => handleEdit({ ...record, obtained_marks: 0 })}
            >
              Reset
            </Button>
          )}
        </Space>
      )
    }
  ];

  return (
    <Modal
      title={<Title level={4} style={{ margin: 0 }}>Students Without Marks</Title>}
      open={isVisible}
      onCancel={() => {
        setEditingStudent(null);
        form.resetFields();
        onClose();
      }}
      footer={null}
      width={1200}
      destroyOnClose
    >
      {editingStudent ? (
        <Spin spinning={updating}>
          <Form form={form} layout="vertical" onFinish={handleUpdate}>
            <div style={{ 
              marginBottom: 16, 
              background: '#f0f5ff', 
              padding: '16px', 
              borderRadius: '4px',
              borderLeft: '4px solid #1890ff'
            }}>
              <div style={{ marginBottom: 8 }}>
                <Text strong>Student: </Text>
                <Text>{editingStudent.student_name} (ID: {editingStudent.student_id})</Text>
              </div>
              <div style={{ marginBottom: 8 }}>
                <Text strong>Class/Section: </Text>
                <Text>{editingStudent.section_name}</Text>
              </div>
              <div style={{ marginBottom: 8 }}>
                <Text strong>Subject: </Text>
                <Text>{editingStudent.subject_name}</Text>
              </div>
              <div>
                <Text strong>Exam: </Text>
                <Text>{editingStudent.exam_name} (Total: {editingStudent.total_marks} marks)</Text>
              </div>
            </div>
            
            <Form.Item
              name="obtained_marks"
              label="Enter Obtained Marks"
              rules={[
                { required: true, message: 'Please enter marks' },
                () => ({
                  validator(_, value) {
                    const num = parseFloat(value);
                    if (isNaN(num)) return Promise.reject('Please enter a valid number');
                    if (num < 0) return Promise.reject('Marks cannot be negative');
                    if (num > editingStudent.total_marks) {
                      return Promise.reject(`Cannot exceed total marks (${editingStudent.total_marks})`);
                    }
                    return Promise.resolve();
                  }
                })
              ]}
            >
              <Input 
                type="number" 
                placeholder="0.00" 
                step="0.01"
                min="0"
                max={editingStudent.total_marks}
                style={{ width: 200 }}
                autoFocus
              />
            </Form.Item>
            
            <Space>
              <Button type="primary" htmlType="submit" loading={updating}>
                {editingStudent.obtained_marks === null || editingStudent.obtained_marks === 0 ? 
                  'Submit Marks' : 'Update Marks'}
              </Button>
              <Button onClick={() => setEditingStudent(null)} disabled={updating}>
                Cancel
              </Button>
            </Space>
          </Form>
        </Spin>
      ) : (
        <Table
          columns={columns}
          dataSource={students}
          loading={loading}
          pagination={{ 
            pageSize: 10,
            showSizeChanger: true,
            pageSizeOptions: ['5', '10', '20', '50'],
            showTotal: (total) => `Total ${total} unmarked students` 
          }}
          scroll={{ x: true }}
          size="middle"
          bordered
          locale={{
            emptyText: 'All students have been marked - great job!'
          }}
          style={{ marginTop: 16 }}
        />
      )}
    </Modal>
  );
};

export default StudentsWithoutMarksModal;