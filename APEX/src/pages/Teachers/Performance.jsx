import React, { useState, useEffect } from 'react';
import { 
  Button, 
  message, 
  Card, 
  Typography, 
  Alert, 
  Row, 
  Drawer, 
  Col, 
  Layout, 
  Grid, 
  Form,
  Spin
} from 'antd';
import Sidebar from './Sidebar';
import PerformanceTable from './PerformanceTable';
import PerformanceForm from './PerformanceForm';
import StudentsWithoutMarksModal from './StudentsWithoutMarksModal';
import { MenuOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const { Content } = Layout;
const { useBreakpoint } = Grid;

const CheckPerformanceSection = () => {
  const screens = useBreakpoint();
  const [assignments, setAssignments] = useState([]);
  const [selectedSection, setSelectedSection] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [exams, setExams] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isUpdateModalVisible, setIsUpdateModalVisible] = useState(false);
  const [performanceData, setPerformanceData] = useState([]);
  const [filteredPerformanceData, setFilteredPerformanceData] = useState([]);
  const [selectedExamFilter, setSelectedExamFilter] = useState(null);
  const [selectedPerformance, setSelectedPerformance] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState({ std_name: 'Student' });
  const [unmarkedStudents, setUnmarkedStudents] = useState([]);
  const [isStudentsWithoutMarksModalVisible, setIsStudentsWithoutMarksModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [sessionChecked, setSessionChecked] = useState(false);

  const [form] = Form.useForm();
  const [updateForm] = Form.useForm();

  useEffect(() => {
    checkSessionAndFetchData();
  }, []);

  const checkSessionAndFetchData = async () => {
    setLoading(true);
    try {
      // Verify session first
      const sessionResponse = await fetch('https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/Filter.php', {
        credentials: 'include'
      });
      
      if (sessionResponse.status === 401) {
        handleSessionExpired();
        return;
      }
      
      const sessionData = await sessionResponse.json();
      
      if (Array.isArray(sessionData)) {
        setAssignments(sessionData);
        if (sessionData.length > 0) {
          setSelectedSection(sessionData[0].section_id);
        }
        setSessionChecked(true);
        fetchPerformanceData();
      } else {
        throw new Error(sessionData.error || 'Failed to verify session');
      }
    } catch (error) {
      message.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSessionExpired = () => {
    message.error('Session expired. Please login again.');
    window.location.href = '/login';
  };

  const fetchPerformanceData = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/teachPerformance.php', {
        credentials: 'include'
      });
      
      if (response.status === 401) {
        handleSessionExpired();
        return;
      }
      
      const data = await response.json();
      
      if (data.error) {
        message.error(data.error);
        setPerformanceData([]);
        setFilteredPerformanceData([]);
      } else {
        setPerformanceData(data);
        setFilteredPerformanceData(data);
        identifyUnmarkedStudents(data);
      }
    } catch (error) {
      message.error('Failed to fetch performance data');
      setPerformanceData([]);
      setFilteredPerformanceData([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchExamsForSection = async (sectionId) => {
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
      } else {
        message.error(data.message || 'Failed to fetch exams');
      }
    } catch (error) {
      message.error('Failed to fetch exams');
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentsBySection = async (sectionId) => {
    if (!sectionId) return;
    
    setLoading(true);
    try {
      const response = await fetch('https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/SecStudents.php', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ section_id: sectionId }),
        credentials: 'include'
      });
      
      if (response.status === 401) {
        handleSessionExpired();
        return;
      }
      
      const data = await response.json();
      
      if (data.error) {
        message.error(data.error);
      } else if (data.message) {
        message.info(data.message);
        setStudents([]);
      } else {
        setStudents(data.section_students);
      }
    } catch (error) {
      message.error('Failed to fetch students');
    } finally {
      setLoading(false);
    }
  };

  const identifyUnmarkedStudents = (data) => {
    const unmarked = data
      .filter(student => student.obtained_marks === null || student.obtained_marks === 0)
      .map(student => student.student_name);
    setUnmarkedStudents(unmarked);
  };

  const handleSectionChange = (sectionId) => {
    setSelectedSection(sectionId);
    const filteredSubjects = assignments.filter(a => a.section_id === sectionId);
    setSubjects(filteredSubjects);
    fetchStudentsBySection(sectionId);
    fetchExamsForSection(sectionId);
    setIsModalVisible(true);
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const subject = subjects.find(sub => sub.subject_name === values.subject_name);
      const exam = exams.find(ex => ex.exam_name === values.exam_name);

      if (!subject || !exam) {
        message.error('Invalid subject or exam selection');
        return;
      }

      const data = {
        exam_info: {
          subject_id: subject.subject_id,
          section_id: selectedSection,
          exam_id: exam.id,
          exam_name: exam.exam_name,
          total_marks: values.total_marks
        },
        student_performance: students.map(student => ({
          student_id: student.id,
          obtained_marks: values[`student_${student.id}_marks`] || 0
        }))
      };

      setLoading(true);
      const response = await fetch('https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/Performance.php', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        credentials: 'include'
      });
      
      if (response.status === 401) {
        handleSessionExpired();
        return;
      }

      const responseData = await response.json();
      
      if (responseData.error) {
        message.error(responseData.error);
      } else {
        message.success(responseData.message);
        setIsModalVisible(false);
        form.resetFields();
        fetchPerformanceData();
      }
    } catch (error) {
      console.log('Validate Failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (performanceId) => {
    setLoading(true);
    try {
      const response = await fetch('https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/PerformanceDelete.php', {
        method: 'DELETE',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ performance_id: performanceId }),
        credentials: 'include'
      });
      
      if (response.status === 401) {
        handleSessionExpired();
        return;
      }

      const data = await response.json();
      
      if (data.error) {
        message.error(data.error);
      } else {
        message.success(data.message);
        fetchPerformanceData();
      }
    } catch (error) {
      message.error('Failed to delete performance');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = (record) => {
    if (!record) {
      message.error('Invalid student record');
      return;
    }
    
    setSelectedPerformance(record);
    setSelectedStudent({ 
      std_name: record.student_name || 'Student',
      id: record.student_id 
    });
    
    updateForm.setFieldsValue({
      obtained_marks: record.obtained_marks || 0,
    });
    
    setIsUpdateModalVisible(true);
  };

  const handleUpdateOk = async () => {
    try {
      const values = await updateForm.validateFields();
      const data = {
        performance_id: selectedPerformance.id,
        obtained_marks: values.obtained_marks
      };

      setLoading(true);
      const response = await fetch('https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/Performanceupdate.php', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        credentials: 'include'
      });
      
      if (response.status === 401) {
        handleSessionExpired();
        return;
      }

      const responseData = await response.json();
      
      if (responseData.error) {
        message.error(responseData.error);
      } else {
        message.success(responseData.message);
        setIsUpdateModalVisible(false);
        updateForm.resetFields();
        fetchPerformanceData();
      }
    } catch (error) {
      console.log('Validate Failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterByExam = (examName) => {
    if (examName === 'All') {
      setFilteredPerformanceData(performanceData);
      setSelectedExamFilter(null);
    } else {
      const filtered = performanceData.filter(item => item.exam_name === examName);
      setFilteredPerformanceData(filtered);
      setSelectedExamFilter(examName);
    }
  };

  const getUniqueExamNames = () => {
    const examNames = performanceData.map(item => item.exam_name);
    return ['All', ...new Set(examNames.filter(name => name))];
  };

  if (!sessionChecked) {
    return (
      <Layout style={{ minHeight: '100vh' }}>
        <Content style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Spin size="large" />
        </Content>
      </Layout>
    );
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* Mobile Sidebar Drawer */}
      {!screens.md && (
        <>
          <Button
            type="text"
            icon={<MenuOutlined />}
            onClick={() => setIsDrawerVisible(true)}
            style={{
              position: 'fixed',
              top: 16,
              left: 16,
              zIndex: 1000,
              backgroundColor: 'white',
              borderRadius: 4,
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
            }}
          />
          <Drawer
            placement="left"
            closable
            onClose={() => setIsDrawerVisible(false)}
            visible={isDrawerVisible}
            bodyStyle={{ padding: 0 }}
          >
            <Sidebar collapsed={false} />
          </Drawer>
        </>
      )}

      {/* Desktop Sidebar */}
      {screens.md && <Sidebar collapsed={!screens.md} />}

      <Layout style={{ marginLeft: screens.md ? 200 : 0 }}>
        <Content
          style={{
            margin: screens.md ? '24px 16px' : '16px',
            padding: screens.md ? 24 : 16,
            background: '#fff',
            minHeight: 'calc(100vh - 48px)',
          }}
        >
          <Card
            title={
              <Title level={3} style={{ margin: 0 }}>
                Performance Management
              </Title>
            }
            style={{
              borderRadius: 8,
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            }}
            bodyStyle={{ padding: screens.md ? 24 : 16 }}
          >
            <Alert
              message="Manage Students Without Marks"
              description="Click the button below to manage students who have not been marked yet."
              type="info"
              showIcon
              style={{ marginBottom: 20 }}
            />
            <Button
              type="primary"
              onClick={() => setIsStudentsWithoutMarksModalVisible(true)}
              style={{ marginBottom: 24 }}
              size={screens.md ? 'middle' : 'small'}
            >
              Students Without Marks
            </Button>

            <Title level={4} style={{ marginBottom: 16 }}>
              Your Assigned Sections
            </Title>
            <Row gutter={[16, 16]}>
              {assignments.map((assignment) => (
                <Col key={assignment.section_id} xs={24} sm={12} md={8} lg={6}>
                  <Button
                    type="primary"
                    onClick={() => handleSectionChange(assignment.section_id)}
                    style={{
                      width: '100%',
                      height: screens.md ? 80 : 60,
                      fontSize: screens.md ? 16 : 14,
                      fontWeight: 500,
                      borderRadius: 8,
                      whiteSpace: 'normal',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    {assignment.section_name}
                    <div style={{ fontSize: screens.md ? 12 : 10, opacity: 0.8 }}>
                      {assignment.subject_name}
                    </div>
                  </Button>
                </Col>
              ))}
            </Row>

            {performanceData.length > 0 && (
              <>
                <Title level={4} style={{ marginTop: 24, marginBottom: 16 }}>
                  Filter by Exam
                </Title>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
                  {getUniqueExamNames().map((examName) => (
                    <Button
                      key={examName}
                      type={
                        selectedExamFilter === examName || (examName === 'All' && !selectedExamFilter)
                          ? 'primary'
                          : 'default'
                      }
                      onClick={() => filterByExam(examName)}
                      size={screens.md ? 'middle' : 'small'}
                    >
                      {examName}
                    </Button>
                  ))}
                </div>
              </>
            )}

            <Title level={4} style={{ marginBottom: 16 }}>
              Performance Data
            </Title>
            <PerformanceTable
              data={filteredPerformanceData}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
              loading={loading}
            />
          </Card>
        </Content>
      </Layout>

      <PerformanceForm
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={() => setIsModalVisible(false)}
        loading={loading}
        form={form}
        subjects={subjects}
        exams={exams}
        students={students}
      />

      <PerformanceForm
        visible={isUpdateModalVisible}
        onOk={handleUpdateOk}
        onCancel={() => setIsUpdateModalVisible(false)}
        loading={loading}
        form={updateForm}
        isUpdate={true}
        selectedStudent={selectedStudent}
      />

      <StudentsWithoutMarksModal
        isVisible={isStudentsWithoutMarksModalVisible}
        onClose={() => setIsStudentsWithoutMarksModalVisible(false)}
        unmarkedStudents={unmarkedStudents}
      />
    </Layout>
  );
};

export default CheckPerformanceSection;