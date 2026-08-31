// src/pages/Students/TermList.jsx
import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Spin, Alert, Typography, Divider, Button, Space, Tag } from 'antd';
import { 
  ScheduleOutlined, 
  BookOutlined, 
  ClockCircleOutlined, 
  UserOutlined, 
  EnvironmentOutlined,
  ReloadOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;

const ExamList = () => {
  const [allExams, setAllExams] = useState([]);
  const [filteredExams, setFilteredExams] = useState([]);
  const [selectedExamName, setSelectedExamName] = useState(null);
  const [error, setError] = useState('');
  const [examLoading, setExamLoading] = useState(false);

  const API_BASE_URL = 'https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX';

  const fetchAllExams = async () => {
    try {
      setExamLoading(true);
      setError('');
      const sectionId = localStorage.getItem('section_id') || 1;

      const response = await fetch(
        `${API_BASE_URL}/Sectionstdterm.php?section_id=${sectionId}`,
        {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch exam schedules');
      }

      const data = await response.json();
      
      if (data.status === 'success' || data.success) {
        const exams = data.data || [];
        setAllExams(exams);
        if (exams.length > 0) {
          setSelectedExamName(exams[0].exam_name);
        }
      } else {
        setAllExams([]);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setExamLoading(false);
    }
  };

  useEffect(() => {
    fetchAllExams();
  }, []);

  useEffect(() => {
    if (selectedExamName) {
      const filtered = allExams.filter(exam => exam.exam_name === selectedExamName);
      setFilteredExams(filtered);
    } else {
      setFilteredExams([]);
    }
  }, [selectedExamName, allExams]);

  const groupedExams = filteredExams.reduce((acc, exam) => {
    const key = `${exam.exam_date}`;
    if (!acc[key]) {
      acc[key] = {
        exam_date: exam.exam_date,
        exams: []
      };
    }
    acc[key].exams.push(exam);
    return acc;
  }, {});

  const examNames = [...new Set(allExams.map(exam => exam.exam_name))];

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
              <ScheduleOutlined />
            </div>
            <div>
              <Title level={4} style={{ margin: 0, color: '#0b1b3d', fontWeight: 800 }}>
                Term Examination Schedule
              </Title>
              <Text style={{ color: '#64748b', fontSize: 13 }}>
                Subject timings, room allocations, invigilators, and examination date sheets
              </Text>
            </div>
          </div>

          <Button
            icon={<ReloadOutlined />}
            onClick={fetchAllExams}
            loading={examLoading}
            style={{ borderRadius: 8 }}
          >
            Refresh
          </Button>
        </div>
      </Card>

      {error && (
        <Alert
          message="Notice"
          description={error}
          type="info"
          showIcon
          style={{ marginBottom: 24, borderRadius: 12 }}
        />
      )}

      {/* Exam Term Selection Tabs / Buttons */}
      {examNames.length > 0 && (
        <Card className="apex-card" style={{ marginBottom: 24 }} bodyStyle={{ padding: '16px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <Text strong style={{ color: '#0b1b3d', marginRight: 8 }}>Select Exam Term:</Text>
            {examNames.map(name => (
              <Button
                key={name}
                type={selectedExamName === name ? 'primary' : 'default'}
                onClick={() => setSelectedExamName(name)}
                className={selectedExamName === name ? 'apex-btn-gold' : ''}
                style={{ borderRadius: 20, padding: '0 18px', fontWeight: 600 }}
              >
                {name}
              </Button>
            ))}
          </div>
        </Card>
      )}

      {/* Loading state */}
      {examLoading ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <Spin size="large" tip="Loading exam schedule..." />
        </div>
      ) : selectedExamName ? (
        Object.keys(groupedExams).length > 0 ? (
          <Row gutter={[20, 20]}>
            {Object.values(groupedExams).map((group) => (
              <Col xs={24} sm={12} lg={8} key={group.exam_date}>
                <Card 
                  className="apex-card apex-card-gold-header"
                  title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <ScheduleOutlined style={{ color: '#d4af37' }} />
                      <span style={{ color: '#0b1b3d', fontWeight: 700 }}>
                        {new Date(group.exam_date).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                  }
                  style={{ height: '100%' }}
                >
                  {group.exams.map((exam, index) => (
                    <div key={`${exam.exam_id}-${exam.subject_name}-${index}`}>
                      <div style={{ marginBottom: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                          <Text strong style={{ color: '#0b1b3d', fontSize: 15 }}>
                            {exam.subject_name}
                          </Text>
                          {exam.room_number && (
                            <Tag color="blue" style={{ borderRadius: 6, fontWeight: 600 }}>
                              <EnvironmentOutlined /> Room {exam.room_number}
                            </Tag>
                          )}
                        </div>
                        
                        <Space style={{ color: '#64748b', fontSize: 12, marginBottom: 4 }}>
                          <ClockCircleOutlined />
                          <span>{exam.start_time} - {exam.end_time}</span>
                        </Space>

                        {exam.teacher_name && (
                          <div style={{ color: '#64748b', fontSize: 12, marginTop: 4 }}>
                            <UserOutlined /> Invigilator: <strong style={{ color: '#0b1b3d' }}>{exam.teacher_name}</strong>
                          </div>
                        )}
                      </div>
                      {index < group.exams.length - 1 && <Divider style={{ margin: '12px 0' }} />}
                    </div>
                  ))}
                </Card>
              </Col>
            ))}
          </Row>
        ) : (
          <Card className="apex-card" style={{ textAlign: 'center', padding: '40px 0' }}>
            <ScheduleOutlined style={{ fontSize: 40, color: '#94a3b8', marginBottom: 12 }} />
            <Title level={5} style={{ color: '#0b1b3d' }}>No Schedule Found for {selectedExamName}</Title>
            <Text style={{ color: '#64748b' }}>Examination dates have not been scheduled yet.</Text>
          </Card>
        )
      ) : (
        <Card className="apex-card" style={{ textAlign: 'center', padding: '40px 0' }}>
          <ScheduleOutlined style={{ fontSize: 40, color: '#94a3b8', marginBottom: 12 }} />
          <Title level={5} style={{ color: '#0b1b3d' }}>No Scheduled Exams</Title>
          <Text style={{ color: '#64748b' }}>There are currently no active term exam date sheets.</Text>
        </Card>
      )}
    </div>
  );
};

export default ExamList;