import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import { 
  Layout,
  Card,
  Button,
  List,
  Spin,
  message,
  Typography,
  Divider,
  Row,
  Col,
  Tag,
  Alert,
  Tabs,
  Collapse,
  Descriptions
} from 'antd';
import { 
  CalendarOutlined,
  ClockCircleOutlined,
  TeamOutlined,
  BookOutlined,
  SolutionOutlined,
  FileTextOutlined,
  UserOutlined,
  EnvironmentOutlined
} from '@ant-design/icons';

const { Content } = Layout;
const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { Panel } = Collapse;

const CheckExamSection = () => {
  const [teacherId, setTeacherId] = useState(null);
  const [teacherName, setTeacherName] = useState('');
  const [sections, setSections] = useState([]);
  const [selectedSection, setSelectedSection] = useState(null);
  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState(null);
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    checkSessionAndFetchData();
  }, []);

  const checkSessionAndFetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/Filter.php', {
        credentials: 'include'
      });
      
      if (response.status === 401) {
        handleSessionExpired();
        return;
      }
      
      const data = await response.json();
      
      if (response.ok) {
        if (data.length > 0) {
          const firstTeacher = data[0];
          setTeacherId(firstTeacher.teacher_id);
          setTeacherName(firstTeacher.teach_name);
          setSections(data);
          
          if (data.length > 0) {
            setSelectedSection(data[0].section_id);
            fetchExams(data[0].section_id);
          }
        } else {
          throw new Error('No sections assigned to this teacher');
        }
      } else {
        throw new Error(data.error || 'Failed to verify session');
      }
    } catch (error) {
      setError(error.message);
      message.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSessionExpired = () => {
    message.error('Session expired. Please login again.');
    window.location.href = '/login';
  };

  const fetchExams = async (sectionId) => {
    if (!sectionId) return;
    
    setLoading(true);
    try {
      const response = await fetch(`https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/exam_read.php?section_id=${sectionId}`, {
        credentials: 'include'
      });
      
      if (response.status === 401) {
        handleSessionExpired();
        return;
      }
      
      const data = await response.json();
      
      if (data.status === 'success') {
        setExams(data.data);
        setSelectedExam(null);
        setSchedule([]);
      } else {
        throw new Error(data.message || 'Failed to fetch exams');
      }
    } catch (error) {
      setError(error.message);
      message.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchSchedule = async (examId) => {
    if (!selectedSection || !examId) return;
    
    setLoading(true);
    try {
      const response = await fetch(
        `https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/SectionTerms.php?exam_id=${examId}&section_id=${selectedSection}`, 
        {
          credentials: 'include'
        }
      );
      
      if (response.status === 401) {
        handleSessionExpired();
        return;
      }
      
      const data = await response.json();
      
      if (data.status === 'success') {
        // No need to parse papers as it's already an array from the API
        setSchedule(data.data);
      } else {
        throw new Error(data.message || 'Failed to fetch schedule');
      }
    } catch (error) {
      setError(error.message);
      message.error(error.message);
    } finally {
      setLoading(false);
    }
  }
  const handleSectionChange = (sectionId) => {
    setSelectedSection(sectionId);
    fetchExams(sectionId);
  };

  const handleExamClick = (exam) => {
    setSelectedExam(exam);
    fetchSchedule(exam.id);
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    const time = timeString.split(':');
    return `${time[0]}:${time[1]}`; // Returns HH:MM format
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sidebar />
      <Layout style={{ marginLeft: 200 }}>
        <Content style={{ 
          margin: '24px 16px', 
          padding: 24,
          background: '#fff',
          minHeight: 'calc(100vh - 48px)',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <Card
            title={<Title level={2}>Exam Schedules</Title>}
            loading={loading}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'auto'
            }}
            bodyStyle={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'auto'
            }}
          >
            {error && (
              <Alert
                message="Error"
                description={error}
                type="error"
                style={{ marginBottom: 24 }}
                closable
                onClose={() => setError(null)}
              />
            )}

            <div style={{ marginBottom: 24 }}>
              <Title level={4}>Select Section</Title>
              <Descriptions bordered size="small" column={1}>
                <Descriptions.Item label="Teacher">
                  <UserOutlined /> {teacherName} (ID: {teacherId})
                </Descriptions.Item>
              </Descriptions>
              <Divider />
              
              {sections.length > 0 ? (
                <Tabs 
                  activeKey={selectedSection?.toString()} 
                  onChange={handleSectionChange}
                  type="card"
                >
                  {sections.map((section) => (
                    <TabPane 
                      key={section.section_id.toString()}
                      tab={
                        <span>
                          <TeamOutlined /> {section.section_name}
                        </span>
                      }
                    />
                  ))}
                </Tabs>
              ) : (
                <Alert 
                  message="No sections assigned" 
                  type="info" 
                  showIcon 
                />
              )}
            </div>

            {selectedSection && (
              <div style={{ marginBottom: 24 }}>
                <Title level={4}>Select Exam</Title>
                <Divider />
                {exams.length > 0 ? (
                  <Row gutter={[16, 16]}>
                    {exams.map((exam) => (
                      <Col key={exam.id}>
                        <Button
                          type={selectedExam?.id === exam.id ? 'primary' : 'default'}
                          size="large"
                          icon={<BookOutlined />}
                          onClick={() => handleExamClick(exam)}
                        >
                          {exam.exam_name}
                        </Button>
                      </Col>
                    ))}
                  </Row>
                ) : (
                  <Alert 
                    message="No exams scheduled for this section" 
                    type="info" 
                    showIcon 
                  />
                )}
              </div>
            )}

{selectedExam && (
  <div style={{ flex: 1, overflow: 'auto' }}>
    <Title level={4}>
      <SolutionOutlined /> Timetable for: <Tag color="blue">{selectedExam.exam_name}</Tag>
    </Title>
    <Divider />
    
    {schedule.length > 0 ? (
      <List
        itemLayout="vertical"
        size="large"
        dataSource={schedule}
        renderItem={(item) => (
          <List.Item
            key={`${item.exam_id}`}
            extra={
              <div style={{ textAlign: 'right', minWidth: 150 }}>
                <Tag icon={<CalendarOutlined />} color="blue">
                  {item.formatted_date}
                </Tag>
                <br />
                <Tag icon={<ClockCircleOutlined />} color="green">
                  {item.formatted_time}
                </Tag>
              </div>
            }
          >
            <List.Item.Meta
              avatar={<TeamOutlined style={{ fontSize: 24 }} />}
              title={
                <div>
                  <Text strong>{item.section_name}</Text>
                  <br />
                  <Text type="secondary">
                    <BookOutlined /> {item.subject_name}
                  </Text>
                </div>
              }
              description={
                <div>
                  <Text>
                    <EnvironmentOutlined /> Room: {item.room_number || 'Not specified'}
                  </Text>
                  <br />
                  <Text>
                    Created at: {item.formatted_created_at}
                  </Text>
                </div>
              }
            />
            
            {/* Papers section - only show if there are papers */}
            {item.papers && item.papers.length > 0 ? (
              <div style={{ marginTop: 16 }}>
                <Collapse bordered={false} defaultActiveKey={['papers']}>
                  <Panel 
                    header={
                      <span>
                        <FileTextOutlined /> Exam Papers ({item.papers.length})
                      </span>
                    } 
                    key="papers"
                  >
                    <List
                      size="small"
                      dataSource={item.papers}
                      renderItem={(paper) => (
                        <List.Item>
                          <Descriptions bordered size="small" column={2}>
                            <Descriptions.Item label="Paper Name" span={2}>
                              <Text strong>{paper.paper_name}</Text>
                            </Descriptions.Item>
                            <Descriptions.Item label="Paper Code">
                              {paper.paper_code || 'N/A'}
                            </Descriptions.Item>
                            <Descriptions.Item label="Duration">
                              {paper.duration || 'N/A'}
                            </Descriptions.Item>
                            {paper.instructions && (
                              <Descriptions.Item label="Instructions" span={2}>
                                {paper.instructions}
                              </Descriptions.Item>
                            )}
                          </Descriptions>
                        </List.Item>
                      )}
                    />
                  </Panel>
                </Collapse>
              </div>
            ) : (
              <Alert
                // message="No papers available for this exam"
                // type="info"
                // showIcon
                // style={{ marginTop: 16 }}
              />
            )}
          </List.Item>
        )}
      />
    ) : (
      <Card>
        <Text type="secondary">No timetable found for this exam</Text>
      </Card>
    )}
  </div>
)}
          </Card>
        </Content>
      </Layout>
    </Layout>
  );
};

export default CheckExamSection;