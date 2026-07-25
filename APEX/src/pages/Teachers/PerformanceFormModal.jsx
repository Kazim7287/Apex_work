import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Modal, Form, Input, Select, Button, Spin } from 'antd';

const { Option } = Select;

const PerformanceFormModal = ({ 
  isModalVisible, 
  handleOk, 
  handleCancel, 
  form, 
  subjects, 
  students 
}) => {
  const [exams, setExams] = useState([]);
  const [loadingExams, setLoadingExams] = useState(false);
  const [examError, setExamError] = useState(null);

  useEffect(() => {
    if (isModalVisible) {
      fetchExams();
    }
  }, [isModalVisible]);

  const fetchExams = async () => {
    setLoadingExams(true);
    setExamError(null);
    try {
      const response = await fetch('https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/exam_read.php');
      const data = await response.json();
      
      if (data.status === 'success') {
        setExams(data.data);
      } else {
        setExamError(data.message || 'Failed to fetch exams');
      }
    } catch (error) {
      setExamError('Failed to fetch exams. Please try again later.');
      console.error('Error fetching exams:', error);
    } finally {
      setLoadingExams(false);
    }
  };

  return (
    <Modal
      title="Insert Performance"
      visible={isModalVisible}
      onOk={handleOk}
      onCancel={handleCancel}
      okText="Submit"
      cancelText="Cancel"
      width={800}
      bodyStyle={{ padding: '24px' }}
      style={{ top: 20 }}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="subject_name"
          label="Subject Name"
          rules={[{ required: true, message: 'Please select a subject' }]}
        >
          <Select 
            placeholder="Select a subject"
            showSearch
            optionFilterProp="children"
            filterOption={(input, option) =>
              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
          >
            {subjects.map(subject => (
              <Option key={subject.subject_id} value={subject.subject_name}>
                {subject.subject_name}
              </Option>
            ))}
          </Select>
        </Form.Item>
        
        <Form.Item
          name="exam_name"
          label="Exam Name"
          rules={[{ required: true, message: 'Please select an exam' }]}
        >
          <Select
            placeholder="Select an exam"
            showSearch
            optionFilterProp="children"
            filterOption={(input, option) =>
              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
            notFoundContent={
              loadingExams ? (
                <div style={{ textAlign: 'center', padding: '10px' }}>
                  <Spin size="small" />
                </div>
              ) : examError ? (
                <div style={{ color: '#ff4d4f' }}>{examError}</div>
              ) : (
                'No exams found'
              )
            }
          >
            {exams.map(exam => (
              <Option key={exam.id} value={exam.exam_name}>
                {exam.exam_name}
              </Option>
            ))}
          </Select>
        </Form.Item>
        
        <Form.Item
          name="total_marks"
          label="Total Marks"
          rules={[
            { required: true, message: 'Please enter the total marks' },
            { 
              validator: (_, value) => 
                value <= 100 ? Promise.resolve() : Promise.reject('Marks cannot exceed 100') 
            }
          ]}
        >
          <Input type="number" placeholder="Enter total marks" />
        </Form.Item>
        
        <div style={{ maxHeight: '400px', overflowY: 'auto', paddingRight: '8px' }}>
          {students.map(student => (
            <Form.Item
              key={student.id}
              name={`student_${student.id}_marks`}
              label={`Obtained Marks for ${student.std_name}`}
              rules={[
                { required: true, message: 'Please enter the obtained marks' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    const totalMarks = getFieldValue('total_marks');
                    if (!totalMarks || !value || value <= totalMarks) {
                      return Promise.resolve();
                    }
                    return Promise.reject('Obtained marks cannot exceed total marks');
                  },
                }),
              ]}
            >
              <Input 
                type="number" 
                placeholder="Enter obtained marks" 
                style={{ width: '100%' }}
              />
            </Form.Item>
          ))}
        </div>
      </Form>
    </Modal>
  );
};

PerformanceFormModal.propTypes = {
  isModalVisible: PropTypes.bool.isRequired,
  handleOk: PropTypes.func.isRequired,
  handleCancel: PropTypes.func.isRequired,
  form: PropTypes.object.isRequired,
  subjects: PropTypes.arrayOf(
    PropTypes.shape({
      subject_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      subject_name: PropTypes.string.isRequired,
    })
  ).isRequired,
  students: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      std_name: PropTypes.string.isRequired,
    })
  ).isRequired,
};

export default PerformanceFormModal;