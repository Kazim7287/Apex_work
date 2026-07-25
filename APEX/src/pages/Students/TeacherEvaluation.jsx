/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React, { useState, useEffect } from 'react';
import { Card, Form, Input, Button, Rate, Checkbox, Alert, Divider, Row, Col, Spin, message, Modal, Tag } from 'antd';
import { UserOutlined, MailOutlined, BookOutlined, TeamOutlined, ArrowLeftOutlined, ExclamationCircleOutlined, CheckCircleOutlined } from '@ant-design/icons';
import './TeacherEvaluation.css';

const { TextArea } = Input;
const { confirm } = Modal;

const TeacherEvaluation = () => {
  const [form] = Form.useForm();
  const [submitted, setSubmitted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [teachers, setTeachers] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [loading, setLoading] = useState(true);
  const [alreadyEvaluated, setAlreadyEvaluated] = useState({});
  const [viewMode, setViewMode] = useState(false); // New state for view-only mode

  // Get student data from localStorage
  const studentId = localStorage.getItem('student_id');
  const sectionId = localStorage.getItem('section_id');
  const studentName = localStorage.getItem('student_name');

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        setLoading(true);
        
        if (!sectionId) {
          message.error('Section ID not found. Please contact administrator.');
          setLoading(false);
          return;
        }

        // Fetch teachers for the student's section
        const response = await fetch(`https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/Filterstd.php?section_id=${sectionId}`, {
          credentials: 'include',
          headers: {
            'Accept': 'application/json',
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.success) {
          const teachersData = data.data || [];
          setTeachers(teachersData);
          
          // Check if student has already evaluated any teachers
          await checkExistingEvaluations(teachersData);
        } else {
          message.error(data.error || 'Failed to fetch teachers');
          setTeachers([]);
        }
      } catch (error) {
        console.error('Error fetching teachers:', error);
        message.error('Failed to load teachers. Please try again later.');
        setTeachers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTeachers();
  }, [sectionId]);

  // Function to check existing evaluations
  const checkExistingEvaluations = async (teachersList) => {
    try {
      if (!studentId) return;
      
      const evaluatedMap = {};
      
      for (const teacher of teachersList) {
        const response = await fetch(
          `https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/checkEvaluation.php?student_id=${studentId}&teacher_id=${teacher.teacher_id}&section_id=${sectionId}`,
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

      // Validate ratings
      const ratings = ['clarity', 'knowledge', 'communication', 'availability', 'fairness', 'overall'];
      for (const rating of ratings) {
        if (!values[rating] || values[rating] < 1) {
          message.error(`Please provide a rating for ${rating.replace(/_/g, ' ')}`);
          setLoading(false);
          return;
        }
      }

      // Submit evaluation to backend
      const response = await fetch('https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/submitEvaluation.php', {
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
        
        // Update the alreadyEvaluated state
        setAlreadyEvaluated(prev => ({
          ...prev,
          [selectedTeacher.teacher_id]: true
        }));
      } else {
        message.error(data.error || 'Failed to submit evaluation');
      }
    } catch (error) {
      console.error('Error submitting evaluation:', error);
      message.error('Failed to submit evaluation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleTeacherSelect = (teacher) => {
    if (alreadyEvaluated[teacher.teacher_id]) {
      // Show view-only mode for already evaluated teachers
      setSelectedTeacher(teacher);
      setViewMode(true);
    } else {
      setSelectedTeacher(teacher);
      setViewMode(false);
    }
  };

  const handleBackToTeachers = () => {
    setSelectedTeacher(null);
    setViewMode(false);
  };

  if (submitted) {
    return (
      <div className="evaluation-container-3d">
        <div className="submission-success-3d">
          <Alert
            message="Evaluation Submitted Successfully!"
            description="Thank you for providing your feedback. Your evaluation has been recorded."
            type="success"
            showIcon
            className="success-alert-3d"
          />
          <Button 
            type="primary" 
            onClick={() => {
              setSubmitted(false);
              setSelectedTeacher(null);
              setViewMode(false);
              form.resetFields();
            }}
            className="submit-another-btn-3d"
            size="large"
          >
            Back to Teacher List
          </Button>
        </div>
      </div>
    );
  }

  // Teacher selection screen
  if (!selectedTeacher) {
    return (
      <div className="teacher-selection-container">
        <Card title="Select a Teacher to Evaluate" className="teacher-selection-card">
          <div className="student-info">
            <p><strong>Student:</strong> {studentName}</p>
            {/* <p><strong>Section:</strong> {sectionId}</p> */}
          </div>
          
          {loading ? (
            <div className="loading-container">
              <Spin size="large" />
              <p>Loading teachers...</p>
            </div>
          ) : teachers.length > 0 ? (
            <div className="teacher-list">
              {teachers.map(teacher => (
                <Card 
                  key={teacher.teacher_id} 
                  className={`teacher-card ${alreadyEvaluated[teacher.teacher_id] ? 'evaluated' : ''}`}
                  hoverable
                  onClick={() => handleTeacherSelect(teacher)}
                >
                  <div className="teacher-info">
                    <UserOutlined style={{ fontSize: '48px', color: '#1890ff', marginRight: '15px' }} />
                    <div className="teacher-details">
                      <h3>{teacher.teacher_name}</h3>
                      {/* <p>Teacher ID: {teacher.teacher_id}</p> */}
                      {alreadyEvaluated[teacher.teacher_id] && (
                        <Tag icon={<CheckCircleOutlined />} color="green" className="evaluated-tag">
                          Already Evaluated
                        </Tag>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="no-teachers">
              <p>No teachers available for evaluation in your section.</p>
              <p>Please contact your administrator if this is incorrect.</p>
            </div>
          )}
        </Card>
      </div>
    );
  }

  // Evaluation form screen (view mode for already evaluated teachers)
  if (viewMode) {
    return (
      <div className="evaluation-container-3d">
        <div className="evaluation-card-3d">
          <Card 
            title={
              <div className="card-title-3d">
                <UserOutlined /> Evaluation Details
              </div>
            }
            className="ant-card-3d"
            extra={
              <Button 
                type="default" 
                onClick={handleBackToTeachers}
                icon={<ArrowLeftOutlined />}
              >
                Back to Teachers
              </Button>
            }
          >
            <div className="teacher-info-3d">
              <h2>
                <UserOutlined className="info-icon" /> 
                {selectedTeacher.teacher_name}
              </h2>
              <p>Teacher ID: {selectedTeacher.teacher_id}</p>
              <p>Your Section ID: {sectionId}</p>
              <Alert 
                message="You have already evaluated this teacher. Evaluation can only be submitted once per teacher."
                type="info" 
                showIcon 
                className="evaluation-warning"
              />
            </div>

            <Divider className="divider-3d" />

            <div className="evaluation-completed-message">
              <CheckCircleOutlined style={{ fontSize: '48px', color: '#52c41a', marginBottom: '16px' }} />
              <h3>Evaluation Completed</h3>
              <p>Thank you for evaluating this teacher. Your feedback has been recorded.</p>
              <Button 
                type="primary" 
                onClick={handleBackToTeachers}
                className="back-to-teachers-btn"
              >
                Back to Teacher List
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // Evaluation form screen (edit mode for new evaluations)
  return (
    <div className="evaluation-container-3d">
      <div 
        className={`evaluation-card-3d ${isHovered ? 'hovered' : ''}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Card 
          title={
            <div className="card-title-3d">
              <UserOutlined /> Teacher Evaluation Form
            </div>
          }
          className="ant-card-3d"
          extra={
            <Button 
              type="default" 
              onClick={handleBackToTeachers}
              icon={<ArrowLeftOutlined />}
            >
              Back to Teachers
            </Button>
          }
        >
          <div className="teacher-info-3d">
            <h2>
              <UserOutlined className="info-icon" /> 
              {selectedTeacher.teacher_name}
            </h2>
            <p>Teacher ID: {selectedTeacher.teacher_id}</p>
            <p>Your Section ID: {sectionId}</p>
          </div>

          <Divider className="divider-3d" />

          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            className="evaluation-form-3d"
            initialValues={{
              clarity: 3,
              knowledge: 3,
              communication: 3,
              availability: 3,
              fairness: 3,
              overall: 3,
              anonymous: false
            }}
          >
            <Row gutter={[16, 0]}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="clarity"
                  label="Clarity of Explanations"
                  rules={[{ required: true, message: 'Please rate clarity of explanations' }]}
                >
                  <Rate className="rating-stars-3d" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="knowledge"
                  label="Knowledge of Subject"
                  rules={[{ required: true, message: 'Please rate knowledge of subject' }]}
                >
                  <Rate className="rating-stars-3d" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={[16, 0]}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="communication"
                  label="Communication Skills"
                  rules={[{ required: true, message: 'Please rate communication skills' }]}
                >
                  <Rate className="rating-stars-3d" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="availability"
                  label="Availability for Help"
                  rules={[{ required: true, message: 'Please rate availability for help' }]}
                >
                  <Rate className="rating-stars-3d" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={[16, 0]}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="fairness"
                  label="Fairness in Evaluation"
                  rules={[{ required: true, message: 'Please rate fairness in evaluation' }]}
                >
                  <Rate className="rating-stars-3d" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="overall"
                  label="Overall Rating"
                  rules={[{ required: true, message: 'Please provide an overall rating' }]}
                >
                  <Rate className="rating-stars-3d" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="comments"
              label="What did you like about this teacher's approach?"
            >
              <TextArea 
                rows={4} 
                placeholder="Please share what you appreciated about the teaching style, methods, or approach..."
                className="textarea-3d"
                maxLength={500}
                showCount
              />
            </Form.Item>

            <Form.Item
              name="suggestions"
              label="Suggestions for improvement:"
            >
              <TextArea 
                rows={4} 
                placeholder="Please provide constructive suggestions for improvement..."
                className="textarea-3d"
                maxLength={500}
                showCount
              />
            </Form.Item>

            <Form.Item
              name="anonymous"
              valuePropName="checked"
              className="checkbox-3d"
            >
              <Checkbox>
                Submit evaluation anonymously
              </Checkbox>
            </Form.Item>

            <Form.Item>
              <Button 
                type="primary" 
                htmlType="submit" 
                className="submit-button-3d"
                size="large"
                icon={<TeamOutlined />}
                loading={loading}
              >
                Submit Evaluation
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </div>
  );
};

export default TeacherEvaluation;