// src/pages/Students/ProfileEditForm.jsx
import React, { useEffect, useState } from 'react';
import { Form, Input, Button, Row, Col, Select, message, Typography, Space } from 'antd';
import { SaveOutlined, CloseOutlined } from '@ant-design/icons';

const { Option } = Select;
const { Text } = Typography;

const ProfileEditForm = ({ initialValues, onSubmit, onCancel }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    form.setFieldsValue(initialValues);
  }, [form, initialValues]);

  const onFinish = async (values) => {
    try {
      setLoading(true);
      await onSubmit(values);
    } catch (error) {
      message.error(error.message || 'Failed to submit profile updates');
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
      style={{ paddingTop: 8 }}
    >
      <Row gutter={[16, 0]}>
        <Col xs={24} sm={12}>
          <Form.Item
            name="name"
            label={<Text strong style={{ color: '#0b1b3d' }}>Full Student Name</Text>}
            rules={[{ required: true, message: 'Please enter your full name' }]}
          >
            <Input placeholder="Enter your full name" size="large" style={{ borderRadius: 8 }} />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12}>
          <Form.Item
            name="father_name"
            label={<Text strong style={{ color: '#0b1b3d' }}>Father's Name</Text>}
            rules={[{ required: true, message: "Please enter father's name" }]}
          >
            <Input placeholder="Enter father's name" size="large" style={{ borderRadius: 8 }} />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={[16, 0]}>
        <Col xs={24} sm={12}>
          <Form.Item
            name="class_no"
            label={<Text strong style={{ color: '#0b1b3d' }}>Class Grade</Text>}
            rules={[{ required: true, message: 'Please select class' }]}
          >
            <Select placeholder="Select class" size="large" style={{ borderRadius: 8 }}>
              {[...Array(12).keys()].map(i => (
                <Option key={i+1} value={i+1}>Class {i+1}</Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col xs={24} sm={12}>
          <Form.Item
            name="guardian_contact"
            label={<Text strong style={{ color: '#0b1b3d' }}>Guardian Contact Number</Text>}
            rules={[
              { required: true, message: 'Please enter contact number' },
              { pattern: /^[0-9+ -]{9,18}$/, message: 'Please enter valid phone number' }
            ]}
          >
            <Input placeholder="e.g. 0300-1234567" size="large" style={{ borderRadius: 8 }} />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item
        name="admission_status"
        label={<Text strong style={{ color: '#0b1b3d' }}>Admission Status</Text>}
        rules={[{ required: true, message: 'Please select status' }]}
      >
        <Select placeholder="Select status" size="large" style={{ borderRadius: 8 }}>
          <Option value="Active">Active</Option>
          <Option value="Inactive">Inactive</Option>
          <Option value="Graduated">Graduated</Option>
        </Select>
      </Form.Item>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 24 }}>
        <Button onClick={onCancel} style={{ borderRadius: 8 }} icon={<CloseOutlined />}>
          Cancel
        </Button>
        <Button 
          type="primary" 
          htmlType="submit" 
          loading={loading}
          className="apex-btn-gold"
          style={{ borderRadius: 8 }}
          icon={<SaveOutlined />}
        >
          Save Changes
        </Button>
      </div>
    </Form>
  );
};

export default ProfileEditForm;