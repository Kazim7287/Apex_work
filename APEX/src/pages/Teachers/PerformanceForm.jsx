/* eslint-disable react/prop-types */
import React from 'react';
import { Modal, Form, Input, Select, Spin, Typography } from 'antd';

const { Option } = Select;
const { Title } = Typography;

const PerformanceForm = ({
  visible,
  onOk,
  onCancel,
  loading,
  form,
  subjects = [],
  exams = [],
  students = [],
  isUpdate = false,
  selectedStudent = { std_name: 'Student' }, // Default value
}) => {
  return (
    <Modal
      title={isUpdate ? 'Update Performance Record' : 'Add Performance Records'}
      visible={visible}
      onOk={onOk}
      onCancel={onCancel}
      okText={isUpdate ? 'Update' : 'Submit'}
      cancelText="Cancel"
      width={800}
      style={{ borderRadius: 8 }}
      destroyOnClose
    >
      <Spin spinning={loading}>
        <Form form={form} layout="vertical">
          {!isUpdate ? (
            <>
              <Form.Item
                name="subject_name"
                label="Subject Name"
                rules={[{ required: true, message: 'Please select a subject' }]}
              >
                <Select placeholder="Select a subject">
                  {subjects.map((subject) => (
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
                <Select placeholder="Select an exam">
                  {exams.map((exam) => (
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
                  { required: true, message: 'Please enter total marks' },
                  { pattern: /^[1-9]\d*$/, message: 'Please enter a valid positive number' },
                ]}
              >
                <Input type="number" placeholder="Enter total marks" min={1} />
              </Form.Item>
              <Title level={5}>Student Marks</Title>
              {students.map((student) => (
                <Form.Item
                  key={student.id}
                  name={`student_${student.id}_marks`}
                  label={`Marks for ${student.std_name || 'Student'}`}
                  rules={[
                    {
                      validator: (_, value) => {
                        if (value === undefined || value === '') return Promise.resolve();
                        if (isNaN(value) || value < 0) {
                          return Promise.reject('Please enter a valid non-negative number');
                        }
                        return Promise.resolve();
                      },
                    },
                  ]}
                >
                  <Input type="number" placeholder="Leave empty if not marked" min={0} />
                </Form.Item>
              ))}
            </>
          ) : (
            <Form.Item
              name="obtained_marks"
              label={`Marks for ${selectedStudent.std_name || 'Student'}`}
              rules={[
                { required: true, message: 'Please enter obtained marks' },
                { pattern: /^\d+$/, message: 'Please enter a valid number' },
              ]}
            >
              <Input type="number" placeholder="Enter obtained marks" min={0} />
            </Form.Item>
          )}
        </Form>
      </Spin>
    </Modal>
  );
};

export default PerformanceForm;