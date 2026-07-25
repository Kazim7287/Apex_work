/* eslint-disable no-unused-vars */
import { useState, useEffect } from 'react';
import { Card, Row, Col, Spin, Alert, Typography, Divider, Button } from 'antd';

const { Title, Text } = Typography;

const ExamList = () => {
  const [allExams, setAllExams] = useState([]);
  const [filteredExams, setFilteredExams] = useState([]);
  const [selectedExamName, setSelectedExamName] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [examLoading, setExamLoading] = useState(false);

  // Fetch all exams data
  useEffect(() => {
    const fetchAllExams = async () => {
      try {
        setExamLoading(true);
        setError('');
        const sectionId = localStorage.getItem('section_id');
        
        if (!sectionId) {
          throw new Error('Section ID not found. Please log in again.');
        }

        const response = await fetch(
          `https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/Sectionstdterm.php?section_id=${sectionId}`,
          {
            method: 'GET',
            credentials: 'include', // Crucial for sending cookies
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            }
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch exams');
        }

        const data = await response.json();
        
        if (data.status === 'success') {
          setAllExams(data.data);
        } else {
          throw new Error(data.message || 'No exams found');
        }
      } catch (err) {
        setError(err.message);
        console.error('Fetch error:', err);
      } finally {
        setExamLoading(false);
      }
    };

    fetchAllExams();
  }, []);

  // Filter exams by selected exam name
  useEffect(() => {
    if (selectedExamName) {
      const filtered = allExams.filter(exam => exam.exam_name === selectedExamName);
      setFilteredExams(filtered);
    } else {
      setFilteredExams([]);
    }
  }, [selectedExamName, allExams]);

  // Group filtered exams by date
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

  // Get unique exam names for buttons
  const examNames = [...new Set(allExams.map(exam => exam.exam_name))];

  if (examLoading) return <Spin size="large" style={{ display: 'block', margin: '20px auto' }} />;
  if (error) return <Alert message="Error" description={error} type="error" showIcon />;

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2} style={{ marginBottom: '24px' }}>Exam Schedule</Title>
      
      {/* Exam Selection Buttons */}
      <div style={{ marginBottom: '24px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        {examNames.map(name => (
          <Button
            key={name}
            type={selectedExamName === name ? 'primary' : 'default'}
            onClick={() => setSelectedExamName(name)}
          >
            {name}
          </Button>
        ))}
      </div>

      {/* Exam Schedule - Only shown when an exam is selected */}
      {selectedExamName && (
        <>
          {Object.keys(groupedExams).length > 0 ? (
            <Row gutter={[16, 16]}>
              {Object.values(groupedExams).map((group) => (
                <Col xs={24} sm={12} md={8} lg={6} key={group.exam_date}>
                  <Card 
                    title={
                      <Text type="secondary">
                        {new Date(group.exam_date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </Text>
                    }
                    bordered={true}
                    style={{ height: '100%' }}
                    headStyle={{ borderBottom: '1px solid #f0f0f0' }}
                  >
                    {group.exams.map((exam, index) => (
                      <div key={`${exam.exam_id}-${exam.subject_name}`}>
                        <div style={{ marginBottom: '12px' }}>
                          <Text strong>{exam.subject_name}</Text>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Text type="secondary">{exam.start_time} - {exam.end_time}</Text>
                            <Text>Room: {exam.room_number}</Text>
                          </div>
                          {exam.teacher_name && (
                            <Text type="secondary">Supervisor: {exam.teacher_name}</Text>
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
            <Alert 
              message="No Schedule Available" 
              description={`There are currently no schedules for ${selectedExamName}.`} 
              type="info" 
              showIcon 
              style={{ marginTop: '20px' }}
            />
          )}
        </>
      )}
    </div>
  );
};

export default ExamList;