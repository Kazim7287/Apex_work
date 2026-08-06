import React, { useState } from 'react';
import { 
  Form,
  Input,
  Button,
  Typography,
  Row,
  Col,
  message,
  Modal,
  Tag,
  Card,
  Space
} from 'antd';
import { 
  MailOutlined,
  UserOutlined,
  CloseOutlined,
  SendOutlined,
  ExclamationCircleOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
  ClockCircleOutlined,
  MessageOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { confirm } = Modal;

// ==================== STYLED COMPONENTS ====================
const ContactWrapper = styled.div`
  width: 100%;
  font-family: 'Plus Jakarta Sans', sans-serif;
`;

const SectionHeaderWrapper = styled.div`
  text-align: center;
  max-width: 700px;
  margin: 0 auto 50px;
`;

const SectionBadge = styled(Tag)`
  background: rgba(212, 175, 55, 0.15);
  border: 1px solid #d4af37;
  color: #b8860b;
  font-weight: 700;
  padding: 4px 14px;
  border-radius: 20px;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  font-size: 0.8rem;
  margin-bottom: 12px;
`;

const SectionTitle = styled.h2`
  font-family: 'Cinzel', serif;
  font-size: clamp(1.8rem, 3vw, 2.6rem);
  color: #0b1b3d;
  font-weight: 700;
  margin: 0 0 12px;
`;

const SectionSubtitle = styled.p`
  color: #64748b;
  font-size: 1rem;
  line-height: 1.6;
`;

// Contact Info Card
const InfoCard = styled.div`
  background: linear-gradient(135deg, #0b1b3d 0%, #061129 100%);
  border-radius: 16px;
  padding: 40px;
  color: #ffffff;
  height: 100%;
  box-shadow: 0 16px 36px rgba(11, 27, 61, 0.12);
  border: 1px solid rgba(212, 175, 55, 0.3);
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  @media (max-width: 768px) {
    padding: 28px;
  }
`;

const InfoTitle = styled.h3`
  font-family: 'Cinzel', serif;
  font-size: 1.5rem;
  color: #ffffff;
  font-weight: 700;
  margin: 0 0 12px;
`;

const InfoItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 24px;

  .info-icon {
    width: 44px;
    height: 44px;
    border-radius: 10px;
    background: rgba(212, 175, 55, 0.15);
    border: 1px solid #d4af37;
    color: #d4af37;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    flex-shrink: 0;
  }

  .info-content {
    .label {
      color: #d4af37;
      font-size: 0.82rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 4px;
    }
    .value {
      color: #cbd5e1;
      font-size: 0.98rem;
      line-height: 1.5;
    }
  }
`;

// Form Styling
const FormCard = styled.div`
  background: #ffffff;
  border-radius: 16px;
  padding: 40px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 10px 30px rgba(11, 27, 61, 0.05);

  .ant-form-item-label label {
    font-weight: 600;
    color: #0b1b3d;
  }

  @media (max-width: 768px) {
    padding: 24px;
  }
`;

const StyledInput = styled(Input)`
  height: 46px;
  border-radius: 8px;
  border: 1px solid #cbd5e1;

  .ant-input-prefix {
    color: #0b1b3d;
    margin-right: 10px;
  }

  &:hover, &:focus {
    border-color: #d4af37 !important;
    box-shadow: 0 0 0 2px rgba(212, 175, 55, 0.2) !important;
  }
`;

const StyledTextArea = styled(TextArea)`
  border-radius: 8px;
  border: 1px solid #cbd5e1;

  &:hover, &:focus {
    border-color: #d4af37 !important;
    box-shadow: 0 0 0 2px rgba(212, 175, 55, 0.2) !important;
  }
`;

const SubmitButton = styled(Button)`
  height: 48px;
  border-radius: 8px;
  font-weight: 700;
  font-size: 1rem;
  background: linear-gradient(135deg, #0b1b3d 0%, #1e3a8a 100%);
  border: none;
  color: #fff;
  box-shadow: 0 4px 14px rgba(11, 27, 61, 0.25);

  &:hover {
    background: linear-gradient(135deg, #1e3a8a 0%, #0b1b3d 100%) !important;
    color: #fff !important;
    box-shadow: 0 6px 18px rgba(11, 27, 61, 0.35);
  }
`;

const CancelButton = styled(Button)`
  height: 48px;
  border-radius: 8px;
  font-weight: 600;
  border-color: #cbd5e1;
  color: #64748b;

  &:hover {
    border-color: #0b1b3d;
    color: #0b1b3d;
  }
`;

// ==================== MAIN COMPONENT ====================
const Contact = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const showConfirm = (values) => {
    confirm({
      title: 'Confirm Feedback Submission',
      icon: <ExclamationCircleOutlined style={{ color: '#d4af37' }} />,
      content: 'Are you sure you want to submit this message to Apex College administration?',
      okText: 'Yes, Submit Inquiry',
      okType: 'primary',
      cancelText: 'Go Back',
      onOk() {
        return handleSubmit(values);
      },
      onCancel() {},
      centered: true,
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
      
      message.success(data.message || 'Thank you for your feedback! Our administration will contact you soon.');
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
    <ContactWrapper>
      <SectionHeaderWrapper>
        <SectionBadge>GET IN TOUCH</SectionBadge>
        <SectionTitle>Admissions & Feedback Inquiry</SectionTitle>
        <SectionSubtitle>
          Have questions regarding admissions, academic tracks, or campus facilities? Send us a direct message below.
        </SectionSubtitle>
      </SectionHeaderWrapper>

      <Row gutter={[32, 32]}>
        {/* Left Column: Campus Information */}
        <Col xs={24} lg={10}>
          <InfoCard>
            <div>
              <InfoTitle>Campus Information</InfoTitle>
              <p style={{ color: '#94a3b8', lineHeight: 1.6, marginBottom: 32 }}>
                We welcome visits from prospective students, parents, and academic partners during our official campus office hours.
              </p>

              <InfoItem>
                <div className="info-icon"><EnvironmentOutlined /></div>
                <div className="info-content">
                  <div className="label">Campus Location</div>
                  <div className="value">Near Harichand Bazar, Peshawar Road, Pakistan</div>
                </div>
              </InfoItem>

              <InfoItem>
                <div className="info-icon"><PhoneOutlined /></div>
                <div className="info-content">
                  <div className="label">Direct Line</div>
                  <div className="value">+92 123 4567890</div>
                </div>
              </InfoItem>

              <InfoItem>
                <div className="info-icon"><MailOutlined /></div>
                <div className="info-content">
                  <div className="label">Email Address</div>
                  <div className="value">info@apexcollege.edu.pk</div>
                </div>
              </InfoItem>

              <InfoItem>
                <div className="info-icon"><ClockCircleOutlined /></div>
                <div className="info-content">
                  <div className="label">Office Hours</div>
                  <div className="value">Monday – Saturday: 8:00 AM – 3:00 PM</div>
                </div>
              </InfoItem>
            </div>

            <div style={{ paddingTop: 20, borderTop: '1px solid rgba(255, 255, 255, 0.1)', color: '#d4af37', fontWeight: 600, fontSize: '0.88rem' }}>
              Apex College Harichand • Est. 2021
            </div>
          </InfoCard>
        </Col>

        {/* Right Column: Inquiry Form */}
        <Col xs={24} lg={14}>
          <FormCard>
            <Form
              form={form}
              name="contact_form"
              onFinish={onFinish}
              layout="vertical"
            >
              <Form.Item
                name="name"
                label="Full Name"
                rules={[
                  { required: true, message: 'Please input your name!' },
                  { min: 2, message: 'Name must be at least 2 characters' }
                ]}
              >
                <StyledInput 
                  prefix={<UserOutlined />} 
                  placeholder="Enter your full name" 
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
                <StyledInput 
                  prefix={<MailOutlined />} 
                  placeholder="Enter your official email address" 
                  size="large"
                />
              </Form.Item>

              <Form.Item
                name="feedback"
                label="Your Message or Inquiry"
                rules={[
                  { required: true, message: 'Please input your feedback!' },
                  { min: 10, message: 'Feedback must be at least 10 characters' }
                ]}
              >
                <StyledTextArea 
                  rows={5} 
                  placeholder="Write your inquiry or feedback message here..."
                  showCount 
                  maxLength={500}
                />
              </Form.Item>

              <Form.Item style={{ marginTop: 24, marginBottom: 0 }}>
                <Row gutter={16}>
                  <Col xs={24} sm={12} style={{ marginBottom: 12 }}>
                    <CancelButton
                      type="default"
                      onClick={handleCancel}
                      block
                      size="large"
                      icon={<CloseOutlined />}
                    >
                      Clear Form
                    </CancelButton>
                  </Col>
                  <Col xs={24} sm={12}>
                    <SubmitButton
                      type="primary"
                      htmlType="submit"
                      block
                      size="large"
                      icon={<SendOutlined />}
                      loading={submitting}
                    >
                      Send Message
                    </SubmitButton>
                  </Col>
                </Row>
              </Form.Item>
            </Form>
          </FormCard>
        </Col>
      </Row>
    </ContactWrapper>
  );
};

export default Contact;