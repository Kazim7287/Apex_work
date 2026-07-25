import React, { useState } from 'react';
import { 
  Layout,
  Form,
  Input,
  Button,
  Typography,
  Row,
  Col,
  message,
  Modal
} from 'antd';
import { 
  MailOutlined,
  UserOutlined,
  CloseOutlined,
  CheckOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const { Content } = Layout;
const { Title, Text } = Typography;
const { TextArea } = Input;
const { confirm } = Modal;

// Styled components
const StyledForm = styled(Form)`
  max-width: 600px;
  margin: 0 auto;
  padding: 24px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  
  .ant-form-item-label label {
    font-weight: 500;
  }
`;

const ContactHeader = styled.div`
  text-align: center;
  margin-bottom: 32px;
  
  h2 {
    color: #1890ff;
    margin-bottom: 8px;
  }
  
  p {
    color: rgba(0, 0, 0, 0.65);
  }
`;

const Contact = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const showConfirm = (values) => {
    confirm({
      title: 'Are you sure you want to submit this feedback?',
      icon: <ExclamationCircleOutlined />,
      content: 'Your feedback will be sent to our team for review.',
      okText: 'Yes, submit it',
      okType: 'primary',
      cancelText: 'No, go back',
      onOk() {
        return handleSubmit(values);
      },
      onCancel() {
        console.log('Submission cancelled');
      },
    });
  };

  const handleSubmit = async (values) => {
    setSubmitting(true);
    try {
      const response = await fetch('https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/feedbacksub.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit feedback');
      }
      
      message.success(data.message || 'Thank you for your feedback! We will contact you soon.');
      form.resetFields();
    } catch (error) {
      console.error('Error submitting feedback:', error);
      message.error(error.message || 'There was an error submitting your feedback. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const onFinish = (values) => {
    showConfirm(values);
  };

  const handleCancel = () => {
    form.resetFields();
    navigate('/');
  };

  return (
    <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      <Content style={{ padding: '24px 50px', marginTop: '64px' }}>
        <Row justify="center">
          <Col xs={24} lg={16}>
            <StyledForm
              form={form}
              name="contact_form"
              onFinish={onFinish}
              layout="vertical"
            >
              <ContactHeader>
                <Title level={2}>Contact Us</Title>
                <Text>Have questions or feedback? We'd love to hear from you!</Text>
              </ContactHeader>

              <Form.Item
                name="name"
                label="Your Name"
                rules={[
                  { required: true, message: 'Please input your name!' },
                  { min: 2, message: 'Name must be at least 2 characters' }
                ]}
              >
                <Input 
                  prefix={<UserOutlined />} 
                  placeholder="Enter your name" 
                  size="large"
                />
              </Form.Item>

              <Form.Item
                name="email"
                label="Email Address"
                rules={[
                  { required: true, message: 'Please input your email!' },
                  { type: 'email', message: 'Please enter a valid email' }
                ]}
              >
                <Input 
                  prefix={<MailOutlined />} 
                  placeholder="Enter your email" 
                  size="large"
                />
              </Form.Item>

              <Form.Item
                name="feedback"
                label="Your Feedback"
                rules={[
                  { required: true, message: 'Please input your feedback!' },
                  { min: 10, message: 'Feedback must be at least 10 characters' }
                ]}
              >
                <TextArea 
                  rows={6} 
                  placeholder="Enter your message or feedback here..."
                  showCount 
                  maxLength={500}
                />
              </Form.Item>

              <Form.Item style={{ marginTop: '32px' }}>
                <Row gutter={16}>
                  <Col xs={24} sm={12}>
                    <Button
                      type="default"
                      htmlType="button"
                      onClick={handleCancel}
                      block
                      size="large"
                      icon={<CloseOutlined />}
                    >
                      Cancel
                    </Button>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Button
                      type="primary"
                      htmlType="submit"
                      block
                      size="large"
                      icon={<CheckOutlined />}
                      loading={submitting}
                    >
                      Submit
                    </Button>
                  </Col>
                </Row>
              </Form.Item>
            </StyledForm>
          </Col>
        </Row>
      </Content>
    </Layout>
  );
};

export default Contact;