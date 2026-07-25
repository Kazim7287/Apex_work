/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import { useState, useEffect } from 'react';
import { Form, Input, Button, Row, Col, Select, message, Typography } from 'antd';

const { Option } = Select;
const { Text } = Typography;

const ProfileEditForm = ({ initialValues, onSubmit, onCancel }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // Static data for sections and disciplines
  const sections = [
    { id: 1, name: 'A' },
    { id: 2, name: 'B' },
    { id: 3, name: 'C' }
  ];

  const disciplines = [
    'Science',
    'Arts',
    'Commerce'
  ];

  useEffect(() => {
    form.setFieldsValue(initialValues);
  }, [form, initialValues]);

  const onFinish = async (values) => {
    try {
      setLoading(true);
      await onSubmit(values);
    } catch (error) {
      message.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      initialValues={initialValues}
    >
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="name"
            label="Full Name"
            rules={[{ required: true, message: 'Please enter your name' }]}
          >
            <Input placeholder="Enter your full name" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="father_name"
            label="Father's Name"
            rules={[{ required: true, message: "Please enter father's name" }]}
          >
            <Input placeholder="Enter father's name" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="class_no"
            label="Class"
            rules={[{ required: true, message: 'Please select class' }]}
          >
            <Select placeholder="Select class">
              {[...Array(12).keys()].map(i => (
                <Option key={i+1} value={i+1}>{i+1}</Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="section_id"
            label="Section"
          >
            <Text strong>{initialValues?.section_name || 'N/A'}</Text>
          </Form.Item>
        </Col>
      </Row>

      <Form.Item
        name="discipline"
        label="Discipline"
      >
        <Text strong>{initialValues?.discipline || 'N/A'}</Text>
      </Form.Item>

      <Form.Item
        name="guardian_contact"
        label="Guardian Contact"
        rules={[
          { required: true, message: 'Please enter contact number' },
          { pattern: /^[0-9]{10,15}$/, message: 'Please enter valid phone number (10-15 digits)' }
        ]}
      >
        <Input placeholder="Enter guardian contact number" />
      </Form.Item>

      <Form.Item
        name="admission_status"
        label="Admission Status"
        rules={[{ required: true, message: 'Please select status' }]}
      >
        <Select placeholder="Select admission status">
          <Option value="Active">Active</Option>
          <Option value="Inactive">Inactive</Option>
          <Option value="Graduated">Graduated</Option>
        </Select>
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading}>
          Save Changes
        </Button>
        <Button style={{ marginLeft: 8 }} onClick={onCancel}>
          Cancel
        </Button>
      </Form.Item>
    </Form>
  );
};

export default ProfileEditForm;