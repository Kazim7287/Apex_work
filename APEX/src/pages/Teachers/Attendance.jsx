import React, { useState, useEffect } from 'react';
import Sidebar from '../Admin/Sidebar';
import StudentPicture from './StudentPicture';
import UpdateAttendanceModal from './UpdateAttendanceModal';
import AttendanceSummaryModal from './AttendanceSummaryModal';
import { 
  message, 
  Button, 
  Radio, 
  Modal, 
  DatePicker, 
  Table, 
  Card, 
  Row, 
  Col,
  Drawer,
  Layout,
  Divider,
  Typography,
  Space,
  Tag,
  Grid,
  Alert,
  Spin
} from 'antd';
import { 
  CalendarOutlined, 
  FileTextOutlined, 
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  EditOutlined,
  MenuOutlined,
  ClockCircleOutlined,
  UserOutlined
} from '@ant-design/icons';
import moment from 'moment';

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;
const { Content } = Layout;

// Attendance status enums
const ATTENDANCE_STATUS = {
  PRESENT: 'Present',
  ABSENT: 'Absent',
  LEAVE: 'Leave',
  LATE_COMER: 'Late Comer',
  HALF_LEAVE: 'Half Leave'
};

// Safe date formatting function
const formatDateSafe = (dateString, format = 'MMM D, YYYY') => {
  if (!dateString) return 'N/A';
  try {
    const date = moment(dateString);
    return date.isValid() ? date.format(format) : 'Invalid Date';
  } catch (error) {
    console.error('Date formatting error:', error);
    return 'N/A';
  }
};

const CheckAttendanceSection = () => {
  const [students, setStudents] = useState([]);
  const [sectionId, setSectionId] = useState(null);
  const [subjectId, setSubjectId] = useState(null);
  const [teacherId, setTeacherId] = useState(null);
  const [attendanceData, setAttendanceData] = useState({});
  const [sections, setSections] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isSummaryModalVisible, setIsSummaryModalVisible] = useState(false);
  const [isUpdateModalVisible, setIsUpdateModalVisible] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [teacherAssignments, setTeacherAssignments] = useState([]);

  const [modalStudents, setModalStudents] = useState([]);
  const [modalSummary, setModalSummary] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [sectionName, setSectionName] = useState('');
  const [loading, setLoading] = useState(false);
  const [mobileSidebarVisible, setMobileSidebarVisible] = useState(false);
  const currentDate = new Date().toISOString().split('T')[0];
  const screens = useBreakpoint();

  // Helper function to get attendance status tag
  const getAttendanceTag = (status) => {
    if (!status) {
      return <Tag icon={<CloseCircleOutlined />} color="default">Unknown</Tag>;
    }
    
    switch(status) {
      case ATTENDANCE_STATUS.PRESENT:
        return <Tag icon={<CheckCircleOutlined />} color="success">Present</Tag>;
      case ATTENDANCE_STATUS.LEAVE:
        return <Tag icon={<ExclamationCircleOutlined />} color="warning">Leave</Tag>;
      case ATTENDANCE_STATUS.HALF_LEAVE:
        return <Tag icon={<ExclamationCircleOutlined />} color="warning">Half Leave</Tag>;
      case ATTENDANCE_STATUS.LATE_COMER:
        return <Tag icon={<ClockCircleOutlined />} color="blue">Late Comer</Tag>;
      case ATTENDANCE_STATUS.ABSENT:
        return <Tag icon={<CloseCircleOutlined />} color="error">Absent</Tag>;
      default:
        return <Tag icon={<CloseCircleOutlined />} color="default">{status}</Tag>;
    }
  };

  // Helper function to safely parse JSON responses
  const safeJsonParse = (response) => {
    return response.text().then(text => {
      if (!text) return {};
      try {
        return JSON.parse(text);
      } catch (error) {
        console.error('JSON parsing error:', error, 'Response text:', text);
        // Return a safe fallback object
        return { error: 'Invalid JSON response', rawText: text.substring(0, 100) };
      }
    });
  };

  // Check if teacher is authorized for attendance (has "Attendance Boys" or "Attendance Girls" subject)
  const checkTeacherAuthorization = async (teacherId) => {
    try {
      setLoading(true);
      const response = await fetch(`https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/Filter.php?teacher_id=${teacherId}`, {
        credentials: 'include'
      });

      if (response.status === 401) {
        localStorage.removeItem('teacher');
        window.location.href = '/login';
        throw new Error('Session expired. Please login again.');
      }

      const data = await safeJsonParse(response);
      
      if (Array.isArray(data)) {
        setTeacherAssignments(data);
        
        // Check if teacher has "Attendance Boys" or "Attendance Girls" subject
        const hasAttendancePermission = data.some(assignment => 
          assignment.subject_name === 'Attendance Boys' || 
          assignment.subject_name === 'Attendance Girls'
        );
        
        setIsAuthorized(hasAttendancePermission);
        
        if (hasAttendancePermission) {
          // Get unique sections from assignments
          const uniqueSections = data.reduce((sections, assignment) => {
            if (assignment.section_id && !sections.find(s => s.id === assignment.section_id)) {
              sections.push({
                id: assignment.section_id,
                name: assignment.section_name || `Section ${assignment.section_id}`
              });
            }
            return sections;
          }, []);
          
          setSections(uniqueSections);
          message.success('Attendance access authorized');
        } else {
          message.warning('You are not authorized to take attendance');
        }
      } else {
        console.warn('Invalid response format from Filter API:', data);
        message.error('Failed to verify authorization');
        setIsAuthorized(false);
      }
    } catch (error) {
      console.error('Authorization check error:', error);
      if (!error.message.includes('Session expired')) {
        message.error('Error checking authorization: ' + error.message);
      }
      setIsAuthorized(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const teacherData = localStorage.getItem('teacher');
    if (teacherData) {
      try {
        const parsedData = JSON.parse(teacherData);
        const currentTeacherId = parsedData.teacher_id;
        if (currentTeacherId) {
          setTeacherId(currentTeacherId);
          // Check if teacher is authorized for attendance
          checkTeacherAuthorization(currentTeacherId);
        } else {
          throw new Error('Teacher ID not found in local storage');
        }
      } catch (error) {
        console.error('Error parsing teacher data:', error);
        message.error('Invalid teacher data. Please login again.');
        window.location.href = '/login';
      }
    } else {
      message.error('Teacher data not found. Please login again.');
      window.location.href = '/login';
    }
  }, []);

  // Fetch students when section changes
  useEffect(() => {
    if (sectionId && isAuthorized) {
      setLoading(true);
      fetch('https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/secStudents.php', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ section_id: sectionId }),
        credentials: 'include'
      })
        .then(response => {
          if (response.status === 401) {
            localStorage.removeItem('teacher');
            window.location.href = '/login';
            throw new Error('Session expired. Please login again.');
          }
          return safeJsonParse(response);
        })
        .then(data => {
          // Handle different response formats safely
          if (data && data.section_students && Array.isArray(data.section_students)) {
            const studentsWithNames = data.section_students.map(student => ({
              id: student.id || student.student_id,
              Name: student.std_name || student.Name || 'Unknown Student',
              Class_No: student.Class_No || student.roll_no || 'N/A',
              fullName: `${student.std_name || student.Name || 'Unknown Student'} (${student.Class_No || student.roll_no || 'N/A'})`,
              section_id: student.Section_id || student.section_id,
              father_name: student.std_father_name,
              admission_status: student.Admission_Status,
              email: student.std_email,
              discipline: student.std_dscipline
            }));
            
            setStudents(studentsWithNames);
            
            // Initialize attendance data with PRESENT as default
            const initialAttendance = {};
            studentsWithNames.forEach(student => {
              if (student.id) {
                initialAttendance[student.id] = ATTENDANCE_STATUS.PRESENT;
              }
            });
            setAttendanceData(initialAttendance);
            
            // Set section name safely
            const section = sections.find(s => s.id === sectionId);
            if (section) setSectionName(section.name);
          } else {
            const errorMsg = data?.message || 'No students found in this section';
            message.warning(errorMsg);
            setStudents([]);
          }
        })
        .catch(error => {
          console.error('Error:', error);
          if (!error.message.includes('Session expired')) {
            message.error(error.message || 'Error fetching students');
          }
          setStudents([]);
        })
        .finally(() => setLoading(false));
    } else {
      setStudents([]);
      setAttendanceData({});
    }
  }, [sectionId, sections, isAuthorized]);

  // Handle attendance status change
  const handleAttendanceChange = (studentId, status) => {
    if (studentId && status) {
      setAttendanceData(prev => ({ ...prev, [studentId]: status }));
    }
  };

  // Submit attendance to server
  const submitAttendance = () => {
    if (!sectionId) {
      message.error('Please select a section');
      return;
    }

    if (students.length === 0) {
      message.error('No students found for this section');
      return;
    }

    const attendanceArray = students
      .filter(student => student.id) // Only include students with valid IDs
      .map(student => ({
        student_id: student.id,
        section_id: sectionId,
        attendance: attendanceData[student.id] || ATTENDANCE_STATUS.PRESENT,
        date: currentDate,
        student_name: student.Name,
        roll_no: student.Class_No || 'N/A'
      }));

    if (attendanceArray.length === 0) {
      message.error('No valid students to submit attendance for');
      return;
    }

    setLoading(true);
    fetch('https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/Add_attendance.php', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(attendanceArray),
      credentials: 'include'
    })
      .then(response => {
        if (response.status === 401) {
          localStorage.removeItem('teacher');
          window.location.href = '/login';
          throw new Error('Session expired. Please login again.');
        }
        return safeJsonParse(response);
      })
      .then(data => {
        if (data && data.status === 'success') {
          message.success('Attendance submitted successfully');
        } else {
          throw new Error(data?.message || 'Failed to submit attendance');
        }
      })
      .catch(error => {
        console.error('Error:', error);
        message.error(error.message || 'Error submitting attendance');
      })
      .finally(() => setLoading(false));
  };

  // Fetch previous attendance records
  const fetchPreviousAttendance = () => {
    if (!selectedDate) {
      message.error('Please select a date');
      return;
    }
    if (!sectionId) {
      message.error('Please select a section');
      return;
    }

    setLoading(true);
    const params = new URLSearchParams();
    params.append('section_id', sectionId);
    params.append('created_at', selectedDate);

    fetch(`https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/GetAttendance.php?${params.toString()}`, {
      credentials: 'include'
    })
      .then(response => {
        if (response.status === 401) {
          localStorage.removeItem('teacher');
          window.location.href = '/login';
          throw new Error('Session expired. Please login again.');
        }
        return safeJsonParse(response);
      })
      .then(data => {
        if (data && data.status === 'success' && Array.isArray(data.data)) {
          const attendanceWithNames = data.data.map(record => {
            const currentStudent = students.find(s => s.id === record.student_id);
            return {
              ...record,
              student_name: currentStudent?.Name || record.student_name || `Student (ID: ${record.student_id})`,
              roll_no: currentStudent?.Class_No || record.roll_no || 'N/A',
              attendance_status: record.attendance || 'Unknown',
              date: record.date
            };
          });
          
          setModalStudents(attendanceWithNames);
          if (data.section_name) setSectionName(data.section_name);
        } else {
          message.warning(data?.message || 'No attendance records found for this date');
          setModalStudents([]);
        }
      })
      .catch(error => {
        console.error('Error:', error);
        if (!error.message.includes('Session expired')) {
          message.error(error.message || 'Error fetching previous attendance');
        }
      })
      .finally(() => setLoading(false));
  };

  // Fetch attendance summary
  const fetchAttendanceSummary = () => {
    if (!sectionId) {
      message.error('Please select a section first');
      return;
    }
    
    setLoading(true);
    fetch(`https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/GetTAttendancesummery.php?section_id=${sectionId}`, {
      credentials: 'include'
    })
      .then(response => {
        if (response.status === 401) {
          localStorage.removeItem('teacher');
          window.location.href = '/login';
          throw new Error('Session expired. Please login again.');
        }
        return safeJsonParse(response);
      })
      .then(data => {
        if (data && data.status === 'success' && Array.isArray(data.attendance)) {
          const summaryWithNames = data.attendance.map(summary => {
            const student = students.find(s => s.id === summary.student_id);
            return {
              ...summary,
              student_name: student?.Name || summary.student_name || `Student (ID: ${summary.student_id})`,
              roll_no: student?.Class_No || 'N/A'
            };
          });
          setModalSummary(summaryWithNames);
        } else {
          throw new Error(data?.message || 'Failed to fetch attendance summary');
        }
      })
      .catch(error => {
        console.error('Error:', error);
        if (!error.message.includes('Session expired')) {
          message.error(error.message || 'Error fetching attendance summary');
        }
        setModalSummary([]);
      })
      .finally(() => {
        setLoading(false);
        setIsSummaryModalVisible(true);
      });
  };

  const renderSectionButtons = () => (
    <Space wrap>
      {sections.map(section => (
        <Button 
          key={section.id} 
          type={sectionId === section.id ? 'primary' : 'default'} 
          onClick={() => setSectionId(section.id)}
          size={screens.xs ? 'small' : 'middle'}
          style={{ minWidth: screens.xs ? 80 : 100 }}
          disabled={loading}
        >
          {section.name}
        </Button>
      ))}
    </Space>
  );

  const renderActionButtons = () => (
    <Space wrap>
      <Button 
        type="primary" 
        size={screens.xs ? 'middle' : 'large'} 
        onClick={submitAttendance}
        loading={loading}
        disabled={!sectionId || students.length === 0}
      >
        Submit
      </Button>
      
      <Button 
        icon={<CalendarOutlined />} 
        size={screens.xs ? 'middle' : 'large'}
        onClick={() => setIsModalVisible(true)}
        disabled={!sectionId}
      >
        {screens.xs ? 'History' : 'View Previous'}
      </Button>
      
      <Button 
        icon={<FileTextOutlined />} 
        size={screens.xs ? 'middle' : 'large'}
        onClick={fetchAttendanceSummary}
        disabled={!sectionId}
      >
        {screens.xs ? 'Summary' : 'Attendance Summary'}
      </Button>

      <Button 
        icon={<EditOutlined />} 
        size={screens.xs ? 'middle' : 'large'}
        onClick={() => setIsUpdateModalVisible(true)}
        disabled={!sectionId}
      >
        {screens.xs ? 'Update' : 'Update Attendance'}
      </Button>
    </Space>
  );

  // Render unauthorized message
  const renderUnauthorizedMessage = () => (
    <Card style={{ marginTop: 20 }}>
      <Alert
        message="Access Denied"
        description="You are not authorized to take attendance. Only teachers assigned with 'Attendance Boys' or 'Attendance Girls' subject can access this feature."
        type="warning"
        showIcon
        icon={<UserOutlined />}
      />
      <div style={{ marginTop: 16, textAlign: 'center' }}>
        <Text type="secondary">
          Your current assignments: {teacherAssignments.length > 0 ? 
            teacherAssignments.map(a => a.subject_name).join(', ') : 
            'No assignments found'
          }
        </Text>
      </div>
    </Card>
  );

  return (
    <Layout style={{ minHeight: '100vh', overflowX: 'hidden' }}>
      {/* Mobile Sidebar Drawer */}
      {!screens.md && (
        <Drawer
          title="Menu"
          placement="left"
          closable={true}
          onClose={() => setMobileSidebarVisible(false)}
          visible={mobileSidebarVisible}
          width={200}
          bodyStyle={{ padding: 0 }}
        >
          {/* <Sidebar collapsed={false} /> */}
        </Drawer>
      )}

      {/* Desktop Sidebar */}
      {/* {screens.md && <Sidebar />} */}

      <Layout 
        style={{ 
          marginLeft: screens.md ? 200 : 0,
          transition: 'all 0.2s',
          overflowX: 'hidden'
        }}
      >
        <Content style={{ 
          padding: screens.xs ? '12px' : '24px',
          minHeight: '100vh',
          overflowX: 'hidden'
        }}>
          {/* Mobile Header */}
          {!screens.md && (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              marginBottom: 16,
              padding: '8px 0'
            }}>
              <Button 
                icon={<MenuOutlined />} 
                onClick={() => setMobileSidebarVisible(true)}
                style={{ marginRight: 16 }}
                size="small"
              />
              <Title level={4} style={{ margin: 0 }}>
                Attendance
              </Title>
            </div>
          )}

          {loading && !isAuthorized ? (
            <div style={{ textAlign: 'center', padding: '50px' }}>
              <Spin size="large" />
              <div style={{ marginTop: 16 }}>
                <Text>Checking authorization...</Text>
              </div>
            </div>
          ) : !isAuthorized ? (
            renderUnauthorizedMessage()
          ) : (
            <>
              <Card 
                title="Select Class" 
                style={{ marginBottom: 20 }}
                bodyStyle={{ padding: screens.xs ? '12px' : '16px' }}
              >
                <Row gutter={[16, 16]}>
                  <Col span={24}>
                    <Text strong>Select Class:</Text>
                    <div style={{ marginTop: 8, marginBottom: 16 }}>
                      {renderSectionButtons()}
                    </div>
                  </Col>
                </Row>
              </Card>

              {students.length > 0 && (
                <Card 
                  title={
                    <Text ellipsis>
                      {`Today's Attendance (${formatDateSafe(currentDate)} - ${sectionName || 'Selected Class'})`}
                    </Text>
                  }
                  style={{ marginBottom: 20 }}
                  loading={loading}
                  bodyStyle={{ padding: screens.xs ? '8px' : '16px' }}
                >
                  <Row gutter={[8, 8]}>
                    {students.map(student => (
                      <Col xs={24} sm={12} md={8} lg={6} key={student.id}>
                        <Card 
                          size="small" 
                          title={
                            <Text ellipsis style={{ fontSize: screens.xs ? '12px' : '14px' }}>
                              {student.fullName}
                            </Text>
                          }
                          bodyStyle={{ padding: screens.xs ? '8px' : '12px' }}
                        >
                          <Radio.Group 
                            onChange={(e) => handleAttendanceChange(student.id, e.target.value)}
                            value={attendanceData[student.id] || ATTENDANCE_STATUS.PRESENT}
                            buttonStyle="solid"
                            size={screens.xs ? 'small' : 'middle'}
                            style={{ width: '100%' }}
                          >
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              <Radio.Button 
                                value={ATTENDANCE_STATUS.PRESENT}
                                style={{ textAlign: 'center', fontSize: screens.xs ? '10px' : '12px' }}
                              >
                                Present
                              </Radio.Button>
                              <Radio.Button 
                                value={ATTENDANCE_STATUS.ABSENT}
                                style={{ textAlign: 'center', fontSize: screens.xs ? '10px' : '12px' }}
                              >
                                Absent
                              </Radio.Button>
                              <Radio.Button 
                                value={ATTENDANCE_STATUS.LEAVE}
                                style={{ textAlign: 'center', fontSize: screens.xs ? '10px' : '12px' }}
                              >
                                Leave
                              </Radio.Button>
                              <Radio.Button 
                                value={ATTENDANCE_STATUS.LATE_COMER}
                                style={{ textAlign: 'center', fontSize: screens.xs ? '10px' : '12px' }}
                              >
                                Late Comer
                              </Radio.Button>
                              <Radio.Button 
                                value={ATTENDANCE_STATUS.HALF_LEAVE}
                                style={{ textAlign: 'center', fontSize: screens.xs ? '10px' : '12px' }}
                              >
                                Half Leave
                              </Radio.Button>
                            </div>
                          </Radio.Group>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                  
                  <Divider style={{ margin: '16px 0' }} />
                  
                  {renderActionButtons()}
                </Card>
              )}
            </>
          )}

          {/* Previous Attendance Modal */}
          <Modal 
            title={`Previous Attendance - ${sectionName || 'Selected Class'}`}
            visible={isModalVisible} 
            onCancel={() => setIsModalVisible(false)} 
            footer={null}
            width={screens.xs ? '90%' : 800}
            bodyStyle={{ padding: screens.xs ? '12px' : '24px' }}
          >
            <Space style={{ marginBottom: 16 }}>
              <DatePicker 
                onChange={(date, dateString) => setSelectedDate(dateString)}
                style={{ width: screens.xs ? '60%' : 200 }}
                placeholder="Select date"
                format="YYYY-MM-DD"
                size={screens.xs ? 'small' : 'middle'}
              />
              <Button 
                type="primary" 
                onClick={fetchPreviousAttendance}
                loading={loading}
                disabled={!selectedDate}
                size={screens.xs ? 'small' : 'middle'}
              >
                Fetch
              </Button>
            </Space>
            
            <Table
              dataSource={modalStudents}
              columns={[
                { 
                  title: 'Student', 
                  key: 'student',
                  fixed: 'left',
                  width: screens.xs ? 150 : 250,
                  render: (_, record) => (
                    <Space>
                      <StudentPicture studentId={record.student_id} size={screens.xs ? 32 : 40} />
                      <Space direction="vertical" size={0}>
                        <Text strong style={{ fontSize: screens.xs ? '12px' : '14px' }}>
                          {record.student_name}
                        </Text>
                        <Text type="secondary" style={{ fontSize: screens.xs ? '10px' : '12px' }}>
                          Roll: {record.roll_no}
                        </Text>
                      </Space>
                    </Space>
                  )
                },
                { 
                  title: 'Status', 
                  key: 'status',
                  width: screens.xs ? 100 : 120,
                  render: (_, record) => getAttendanceTag(record.attendance_status)
                },
                { 
                  title: 'Date', 
                  key: 'date',
                  width: screens.xs ? 100 : 120,
                  render: (_, record) => (
                    <Text style={{ fontSize: screens.xs ? '12px' : '14px' }}>
                      {formatDateSafe(record.date)}
                    </Text>
                  )
                }
              ]}
              rowKey="student_id"
              loading={loading}
              locale={{ emptyText: 'No attendance records found' }}
              scroll={{ x: screens.xs ? 300 : true }}
              size={screens.xs ? 'small' : 'middle'}
            />
          </Modal>

          {/* Attendance Summary Modal */}
          <AttendanceSummaryModal
            visible={isSummaryModalVisible}
            onCancel={() => setIsSummaryModalVisible(false)}
            sections={sections}
            subjects={subjects}
            screenSize={screens}
            fetchAttendanceSummary={fetchAttendanceSummary}
            modalSummary={modalSummary}
            loading={loading}
            sectionName={sectionName}
          />

          {/* Update Attendance Modal */}
          <UpdateAttendanceModal
            visible={isUpdateModalVisible}
            onCancel={() => setIsUpdateModalVisible(false)}
            sectionId={sectionId}
            subjectId={subjectId}
            teacherId={teacherId}
            students={students}
            sectionName={sectionName}
            screenSize={screens}
            attendanceStatus={ATTENDANCE_STATUS}
          />
        </Content>
      </Layout>
    </Layout>
  );
};

export default CheckAttendanceSection;