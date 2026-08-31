// src/pages/Students/TeacherEvaluation.jsx
import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Form, 
  Input, 
  Button, 
  Rate, 
  Checkbox, 
  Alert, 
  Divider, 
  Row, 
  Col, 
  Spin, 
  message, 
  Tag, 
  Typography,
  Space,
  Avatar
} from 'antd';
import { 
  UserOutlined, 
  ArrowLeftOutlined, 
  CheckCircleOutlined, 
  StarOutlined, 
  TeamOutlined, 
  SendOutlined,
  ReloadOutlined,
  CrownOutlined
} from '@ant-design/icons';
import './TeacherEvaluation.css';

const { TextArea } = Input;
const { Title, Text } = Typography;

const TeacherEvaluation = () => {
  const [form] = Form.useForm();
  const [submitted, setSubmitted] = useState(false);
  const [teachers, setTeachers] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [loading, setLoading] = useState(true);
  const [alreadyEvaluated, setAlreadyEvaluated] = useState({});
  const [viewMode, setViewMode] = useState(false);

  const studentId = localStorage.getItem('student_id');
  const sectionId = localStorage.getItem('section_id') || 1;
  const studentName = localStorage.getItem('student_name') || 'Student';
  const API_BASE_URL = 'https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX';

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      
      const response = await fetch(`${API_BASE_URL}/Filterstd.php?section_id=${sectionId}`, {
        credentials: 'include',
        headers: { 'Accept': 'application/json' }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        const teachersData = data.data || [];
        setTeachers(teachersData);
        await checkExistingEvaluations(teachersData);
      } else {
        setTeachers([]);
      }
    } catch (error) {
      console.error('Error fetching teachers:', error);
      setTeachers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, [sectionId]);

  const checkExistingEvaluations = async (teachersList) => {
    try {
      if (!studentId) return;
      const evaluatedMap = {};
      
      for (const teacher of teachersList) {
        const response = await fetch(
          `${API_BASE_URL}/checkEvaluation.php?student_id=${studentId}&teacher_id=${teacher.teacher_id}&section_id=${sectionId}`,
          { credentials: 'include' }
        );
        
        if (response.ok) {
          const data = await response.json();
          evaluatedMap[teacher.teacher_id] = data.already_evaluated;
        }
      }
      
      setAlreadyEvaluated(evaluatedMap);
    } catch (error) {
      console.error('Error checking evaluations:', error);
    }
  };

  const onFinish = async (values) => {
    try {
      setLoading(true);
      
      if (!studentId) {
        message.error('Student ID not found. Please login again.');
        return;
      }

      if (!selectedTeacher) {
        message.error('No teacher selected.');
        return;
      }

      const ratings = ['clarity', 'knowledge', 'communication', 'availability', 'fairness', 'overall'];
      for (const rating of ratings) {
        if (!values[rating] || values[rating] < 1) {
          message.error(`Please provide a rating for ${rating}`);
          setLoading(false);
          return;
        }
      }

      const response = await fetch(`${API_BASE_URL}/submitEvaluation.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          ...values,
          student_id: studentId,
          teacher_id: selectedTeacher.teacher_id,
          section_id: sectionId
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        message.success('Evaluation submitted successfully!');
        setSubmitted(true);
        setAlreadyEvaluated(prev => ({
          ...prev,
          [selectedTeacher.teacher_id]: true
        }));
      } else {
        throw new Error(data.error || 'Failed to submit evaluation');
      }
    } catch (error) {
      console.error('Error submitting evaluation:', error);
      message.error(error.message || 'Failed to submit evaluation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleTeacherSelect = (teacher) => {
    setSelectedTeacher(teacher);
    setViewMode(!!alreadyEvaluated[teacher.teacher_id]);
  };

  const handleBackToTeachers = () => {
    setSelectedTeacher(null);
    setViewMode(false);
    setSubmitted(false);
    form.resetFields();
  };

  if (submitted) {
    return (
      <div style={{ maxWidth: 800, margin: '40px auto' }}>
        <Card className="apex-card" style={{ textAlign: 'center', padding: '30px 20px' }}>
          <div style={{
            width: 70,
            height: 70,
            borderRadius: '50%',
            background: '#f0fdf4',
            color: '#16a34a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 36,
            margin: '0 auto 20px auto'
          }}>
            <CheckCircleOutlined />
          </div>
          <Title level={3} style={{ color: '#0b1b3d', marginBottom: 8 }}>
            Evaluation Submitted Successfully!
          </Title>
          <Text style={{ color: '#64748b', fontSize: 14, display: 'block', marginBottom: 24, maxWidth: 500, margin: '0 auto 24px auto' }}>
            Thank you for providing your feedback. Your evaluation has been securely recorded to maintain academic excellence.
          </Text>
          <Button 
            type="primary" 
            onClick={handleBackToTeachers}
            className="apex-btn-gold"
            size="large"
            style={{ borderRadius: 8, padding: '0 32px' }}
          >
            Back to Faculty List
          </Button>
        </Card>
      </div>
    );
  }

  // Teacher selection screen
  if (!selectedTeacher) {
    return (
      <div style={{ maxWidth: 1400, margin: '0 auto' }}>
        {/* Header Banner */}
        <Card
          className="apex-card"
          style={{ marginBottom: 24 }}
          bodyStyle={{ padding: '20px 24px' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: 'linear-gradient(135deg, #0b1b3d 0%, #1e3a8a 100%)',
                  color: '#d4af37',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 22,
                  boxShadow: '0 4px 12px rgba(11, 27, 61, 0.2)',
                }}
              >
                <StarOutlined />
              </div>
              <div>
                <Title level={4} style={{ margin: 0, color: '#0b1b3d', fontWeight: 800 }}>
                  Faculty Performance Evaluations
                </Title>
                <Text style={{ color: '#64748b', fontSize: 13 }}>
                  Select an instructor below to rate teaching methodology, communication, and course support
                </Text>
              </div>
            </div>

            <Button
              icon={<ReloadOutlined />}
              onClick={fetchTeachers}
              loading={loading}
              style={{ borderRadius: 8 }}
            >
              Refresh List
            </Button>
          </div>
        </Card>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <Spin size="large" tip="Loading faculty directory..." />
          </div>
        ) : teachers.length > 0 ? (
          <Row gutter={[20, 20]}>
            {teachers.map((teacher) => {
              const isEvaluated = alreadyEvaluated[teacher.teacher_id];
              return (
                <Col xs={24} sm={12} lg={8} key={teacher.teacher_id}>
                  <Card 
                    hoverable 
                    className="apex-card"
                    style={{ 
                      cursor: 'pointer',
                      borderTop: isEvaluated ? '3px solid #10b981' : '3px solid #d4af37' 
                    }}
                    onClick={() => handleTeacherSelect(teacher)}
                    bodyStyle={{ padding: 22 }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <Avatar
                        size={52}
                        icon={<UserOutlined />}
                        style={{
                          background: isEvaluated 
                            ? 'linear-gradient(135deg, #10b981 0%, #047857 100%)' 
                            : 'linear-gradient(135deg, #0b1b3d 0%, #1e3a8a 100%)',
                          color: '#ffffff',
                          fontWeight: 700,
                          fontSize: 20,
                          flexShrink: 0
                        }}
                      >
                        {teacher.teacher_name?.charAt(0)?.toUpperCase()}
                      </Avatar>

                      <div style={{ minWidth: 0, flex: 1 }}>
                        <Title level={5} style={{ margin: 0, color: '#0b1b3d', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {teacher.teacher_name}
                        </Title>
                        <Text style={{ color: '#64748b', fontSize: 12, display: 'block', marginTop: 2 }}>
                          Faculty Instructor
                        </Text>
                        <div style={{ marginTop: 8 }}>
                          {isEvaluated ? (
                            <Tag icon={<CheckCircleOutlined />} color="success" style={{ borderRadius: 10, fontWeight: 600, fontSize: 11 }}>
                              Evaluated
                            </Tag>
                          ) : (
                            <Tag icon={<StarOutlined />} color="gold" style={{ borderRadius: 10, fontWeight: 600, fontSize: 11 }}>
                              Pending Evaluation
                            </Tag>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                </Col>
              );
            })}
          </Row>
        ) : (
          <Card className="apex-card" style={{ textAlign: 'center', padding: '40px 0' }}>
            <TeamOutlined style={{ fontSize: 40, color: '#94a3b8', marginBottom: 12 }} />
            <Title level={5} style={{ color: '#0b1b3d' }}>No Instructors Available for Evaluation</Title>
            <Text style={{ color: '#64748b' }}>No faculty members are assigned to your section at this time.</Text>
          </Card>
        )}
      </div>
    );
  }

  // Already evaluated view mode
  if (viewMode) {
    return (
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <Card
          className="apex-card"
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: '#0b1b3d', color: '#d4af37', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CheckCircleOutlined />
              </div>
              <span style={{ color: '#0b1b3d', fontWeight: 700 }}>Evaluation Status</span>
            </div>
          }
          extra={
            <Button icon={<ArrowLeftOutlined />} onClick={handleBackToTeachers} style={{ borderRadius: 8 }}>
              Back to Faculty List
            </Button>
          }
        >
          <div style={{ textAlign: 'center', padding: '24px 12px' }}>
            <Avatar
              size={64}
              icon={<UserOutlined />}
              style={{
                background: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
                color: '#ffffff',
                marginBottom: 16
              }}
            />
            <Title level={4} style={{ color: '#0b1b3d', margin: 0 }}>
              {selectedTeacher.teacher_name}
            </Title>
            <Text style={{ color: '#64748b', fontSize: 13 }}>Faculty Member</Text>

            <Alert
              message="Evaluation Already Completed"
              description="You have already submitted a review for this faculty member. Feedback can only be submitted once per academic term."
              type="success"
              showIcon
              style={{ marginTop: 24, textAlign: 'left', borderRadius: 10 }}
            />

            <Button
              type="primary"
              onClick={handleBackToTeachers}
              style={{ marginTop: 24, borderRadius: 8, background: '#0b1b3d' }}
            >
              Return to Faculty List
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Evaluation Form Screen (New Evaluation)
  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <Card
        className="apex-card"
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: '#0b1b3d', color: '#d4af37', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <StarOutlined />
            </div>
            <div>
              <span style={{ color: '#0b1b3d', fontWeight: 800, fontSize: 16 }}>Teacher Evaluation Form</span>
              <Text style={{ display: 'block', fontSize: 11, color: '#64748b', fontWeight: 'normal' }}>
                Evaluating: <strong style={{ color: '#0b1b3d' }}>{selectedTeacher.teacher_name}</strong>
              </Text>
            </div>
          </div>
        }
        extra={
          <Button icon={<ArrowLeftOutlined />} onClick={handleBackToTeachers} style={{ borderRadius: 8 }}>
            Back to List
          </Button>
        }
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{
            clarity: 4,
            knowledge: 4,
            communication: 4,
            availability: 4,
            fairness: 4,
            overall: 4,
            anonymous: false
          }}
        >
          <div style={{ background: '#f8fafc', padding: '16px 20px', borderRadius: 12, marginBottom: 24, border: '1px solid #e2e8f0' }}>
            <Title level={5} style={{ color: '#0b1b3d', margin: 0, marginBottom: 16 }}>
              Teaching Assessment Criteria (Rate 1 to 5 Stars)
            </Title>

            <Row gutter={[24, 16]}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="clarity"
                  label={<Text strong style={{ color: '#0b1b3d' }}>Clarity of Explanations & Lectures</Text>}
                  rules={[{ required: true, message: 'Please rate clarity' }]}
                >
                  <Rate style={{ color: '#d4af37' }} />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="knowledge"
                  label={<Text strong style={{ color: '#0b1b3d' }}>Subject Knowledge & Expertise</Text>}
                  rules={[{ required: true, message: 'Please rate knowledge' }]}
                >
                  <Rate style={{ color: '#d4af37' }} />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={[24, 16]}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="communication"
                  label={<Text strong style={{ color: '#0b1b3d' }}>Communication & Student Engagement</Text>}
                  rules={[{ required: true, message: 'Please rate communication' }]}
                >
                  <Rate style={{ color: '#d4af37' }} />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="availability"
                  label={<Text strong style={{ color: '#0b1b3d' }}>Availability for Guidance & Help</Text>}
                  rules={[{ required: true, message: 'Please rate availability' }]}
                >
                  <Rate style={{ color: '#d4af37' }} />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={[24, 16]}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="fairness"
                  label={<Text strong style={{ color: '#0b1b3d' }}>Fairness in Grading & Evaluation</Text>}
                  rules={[{ required: true, message: 'Please rate fairness' }]}
                >
                  <Rate style={{ color: '#d4af37' }} />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="overall"
                  label={<Text strong style={{ color: '#0b1b3d' }}>Overall Instructor Satisfaction</Text>}
                  rules={[{ required: true, message: 'Please provide overall rating' }]}
                >
                  <Rate style={{ color: '#d4af37' }} />
                </Form.Item>
              </Col>
            </Row>
          </div>

          <Form.Item
            name="comments"
            label={<Text strong style={{ color: '#0b1b3d' }}>What did you appreciate most about this instructor?</Text>}
          >
            <TextArea 
              rows={4} 
              placeholder="Highlight strengths, clarity of explanations, classroom management..."
              maxLength={500}
              showCount
              style={{ borderRadius: 8 }}
            />
          </Form.Item>

          <Form.Item
            name="suggestions"
            label={<Text strong style={{ color: '#0b1b3d' }}>Constructive Suggestions for Improvement</Text>}
          >
            <TextArea 
              rows={4} 
              placeholder="Provide constructive recommendations on course delivery or study materials..."
              maxLength={500}
              showCount
              style={{ borderRadius: 8 }}
            />
          </Form.Item>

          <Form.Item
            name="anonymous"
            valuePropName="checked"
            style={{ marginBottom: 24 }}
          >
            <Checkbox>
              <Text strong style={{ color: '#0b1b3d' }}>Submit evaluation anonymously</Text>
              <Text style={{ color: '#64748b', fontSize: 12, display: 'block' }}>
                Your identity and student ID will not be shared with the instructor.
              </Text>
            </Checkbox>
          </Form.Item>

          <Form.Item style={{ marginBottom: 0 }}>
            <Button 
              type="primary" 
              htmlType="submit" 
              className="apex-btn-gold"
              size="large"
              icon={<SendOutlined />}
              loading={loading}
              block
              style={{ height: 48, fontSize: 16 }}
            >
              {loading ? 'Submitting Evaluation...' : 'Submit Faculty Evaluation'}
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default TeacherEvaluation;