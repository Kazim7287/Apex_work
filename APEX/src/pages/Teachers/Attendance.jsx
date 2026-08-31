import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from '../Admin/Sidebar';
import StudentPicture from './StudentPicture';
import UpdateAttendanceModal from './UpdateAttendanceModal';
import AttendanceSummaryModal from './AttendanceSummaryModal';
import { 
  message, Button, Radio, Modal, DatePicker, Table, 
  Card, Row, Col, Drawer, Layout, Divider, 
  Typography, Space, Tag, Grid, Alert, Spin
} from 'antd';
import { 
  CalendarOutlined, FileTextOutlined, CheckCircleOutlined,
  CloseCircleOutlined, ExclamationCircleOutlined, EditOutlined,
  MenuOutlined, ClockCircleOutlined, UserOutlined
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
  const screens = useBreakpoint();
  const currentDate = new Date().toISOString().split('T')[0];

  // Application State
  const [loading, setLoading] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [teacherId, setTeacherId] = useState(null);
  const [teacherAssignments, setTeacherAssignments] = useState([]);
  
  // Data State
  const [sections, setSections] = useState([]);
  const [sectionId, setSectionId] = useState(null);
  const [sectionName, setSectionName] = useState('');
  const [subjects, setSubjects] = useState([]); // Kept for modal compatibility
  const [subjectId, setSubjectId] = useState(null);
  const [students, setStudents] = useState([]);
  const [attendanceData, setAttendanceData] = useState({});
  const [selectedDate, setSelectedDate] = useState(null);
  
  // Modal State
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isSummaryModalVisible, setIsSummaryModalVisible] = useState(false);
  const [isUpdateModalVisible, setIsUpdateModalVisible] = useState(false);
  const [mobileSidebarVisible, setMobileSidebarVisible] = useState(false);
  const [modalStudents, setModalStudents] = useState([]);
  const [modalSummary, setModalSummary] = useState([]);

  const getAttendanceTag = useCallback((status) => {
    if (!status) return <Tag icon={<CloseCircleOutlined />} color="default">Unknown</Tag>;
    
    const tags = {
      [ATTENDANCE_STATUS.PRESENT]: <Tag icon={<CheckCircleOutlined />} color="success">Present</Tag>,
      [ATTENDANCE_STATUS.LEAVE]: <Tag icon={<ExclamationCircleOutlined />} color="warning">Leave</Tag>,
      [ATTENDANCE_STATUS.HALF_LEAVE]: <Tag icon={<ExclamationCircleOutlined />} color="warning">Half Leave</Tag>,
      [ATTENDANCE_STATUS.LATE_COMER]: <Tag icon={<ClockCircleOutlined />} color="blue">Late Comer</Tag>,
      [ATTENDANCE_STATUS.ABSENT]: <Tag icon={<CloseCircleOutlined />} color="error">Absent</Tag>
    };
    return tags[status] || <Tag icon={<CloseCircleOutlined />} color="default">{status}</Tag>;
  }, []);

  const safeJsonParse = async (response) => {
    const text = await response.text();
    if (!text) return {};
    try {
      return JSON.parse(text);
    } catch (error) {
      console.error('JSON parsing error:', error, 'Response text:', text);
      return { error: 'Invalid JSON response', rawText: text.substring(0, 100) };
    }
  };

  const checkTeacherAuthorization = useCallback(async (currentTeacherId) => {
    try {
      setLoading(true);
      const response = await fetch(`https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/Filter.php?teacher_id=${currentTeacherId}`, {
        credentials: 'include'
      });

      if (response.status === 401) throw new Error('Session expired. Please login again.');

      const data = await safeJsonParse(response);
      
      if (Array.isArray(data)) {
        setTeacherAssignments(data);
        const hasPermission = data.some(a => ['Attendance Boys', 'Attendance Girls'].includes(a.subject_name));
        setIsAuthorized(hasPermission);
        
        if (hasPermission) {
          const uniqueSections = [...new Map(data.filter(a => a.section_id).map(a => 
            [a.section_id, { id: a.section_id, name: a.section_name || `Section ${a.section_id}` }]
          )).values()];
          
          setSections(uniqueSections);
          message.success('Attendance access authorized');
        } else {
          message.warning('You are not authorized to take attendance');
        }
      }
    } catch (error) {
      console.error('Authorization error:', error);
      if (error.message.includes('Session expired')) {
        localStorage.removeItem('teacher');
        window.location.href = '/login';
      } else {
        message.error(`Authorization error: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const teacherData = localStorage.getItem('teacher');
    if (teacherData) {
      try {
        const { teacher_id } = JSON.parse(teacherData);
        if (teacher_id) {
          setTeacherId(teacher_id);
          checkTeacherAuthorization(teacher_id);
        } else throw new Error('Teacher ID missing');
      } catch (error) {
        message.error('Invalid session. Please login again.');
        window.location.href = '/login';
      }
    } else {
      window.location.href = '/login';
    }
  }, [checkTeacherAuthorization]);

  useEffect(() => {
    if (!sectionId || !isAuthorized) {
      setStudents([]);
      setAttendanceData({});
      return;
    }

    const fetchStudents = async () => {
      setLoading(true);
      try {
        const response = await fetch('https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/secStudents.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify({ section_id: sectionId }),
          credentials: 'include'
        });

        if (response.status === 401) throw new Error('Session expired');
        
        const data = await safeJsonParse(response);
        
        if (data?.section_students?.length > 0) {
          const formattedStudents = data.section_students.map(student => ({
            id: student.id || student.student_id,
            Name: student.std_name || student.Name || 'Unknown Student',
            Class_No: student.Class_No || student.roll_no || 'N/A',
            fullName: `${student.std_name || student.Name || 'Unknown'} (${student.Class_No || student.roll_no || 'N/A'})`,
            section_id: student.Section_id || student.section_id,
          }));
          
          setStudents(formattedStudents);
          setAttendanceData(
            formattedStudents.reduce((acc, curr) => ({ ...acc, [curr.id]: ATTENDANCE_STATUS.PRESENT }), {})
          );
          
          const section = sections.find(s => s.id === sectionId);
          if (section) setSectionName(section.name);
        } else {
          message.warning(data?.message || 'No students found');
          setStudents([]);
        }
      } catch (error) {
        if (error.message === 'Session expired') window.location.href = '/login';
        else message.error('Error fetching students');
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [sectionId, sections, isAuthorized]);

  const handleAttendanceChange = useCallback((studentId, status) => {
    setAttendanceData(prev => ({ ...prev, [studentId]: status }));
  }, []);

  const submitAttendance = async () => {
    if (!sectionId || students.length === 0) return message.error('Invalid submission data');

    const payload = students.filter(s => s.id).map(student => ({
      student_id: student.id,
      section_id: sectionId,
      attendance: attendanceData[student.id] || ATTENDANCE_STATUS.PRESENT,
      date: currentDate,
      student_name: student.Name,
      roll_no: student.Class_No || 'N/A'
    }));

    setLoading(true);
    try {
      const response = await fetch('https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/Add_attendance.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include'
      });

      if (response.status === 401) throw new Error('Session expired');
      const data = await safeJsonParse(response);
      
      if (data?.status === 'success') message.success('Attendance submitted successfully');
      else throw new Error(data?.message || 'Failed to submit');
    } catch (error) {
      message.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchPreviousAttendance = async () => {
    if (!selectedDate || !sectionId) return message.error('Select a date and section');
    
    setLoading(true);
    try {
      const params = new URLSearchParams({ section_id: sectionId, created_at: selectedDate });
      const response = await fetch(`https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/GetAttendance.php?${params}`, { credentials: 'include' });
      
      const data = await safeJsonParse(response);
      if (data?.status === 'success' && Array.isArray(data.data)) {
        const mappedRecords = data.data.map(record => {
          const student = students.find(s => s.id === record.student_id);
          return {
            ...record,
            student_name: student?.Name || record.student_name,
            roll_no: student?.Class_No || record.roll_no,
            attendance_status: record.attendance || 'Unknown'
          };
        });
        setModalStudents(mappedRecords);
      } else {
        message.warning('No records found for this date');
        setModalStudents([]);
      }
    } catch (error) {
      message.error('Failed to fetch previous records');
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendanceSummary = async () => {
    if (!sectionId) return message.error('Select a section first');
    
    setLoading(true);
    try {
      const response = await fetch(`https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/GetTAttendancesummery.php?section_id=${sectionId}`, { credentials: 'include' });
      const data = await safeJsonParse(response);
      
      if (data?.status === 'success' && Array.isArray(data.attendance)) {
        setModalSummary(data.attendance.map(summary => {
          const student = students.find(s => s.id === summary.student_id);
          return { ...summary, student_name: student?.Name || summary.student_name, roll_no: student?.Class_No || 'N/A' };
        }));
        setIsSummaryModalVisible(true);
      } else throw new Error();
    } catch (error) {
      message.error('Failed to fetch summary');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout className="min-h-screen bg-slate-950 text-slate-200">
      {!screens.md && (
        <Drawer
          title="Menu"
          placement="left"
          onClose={() => setMobileSidebarVisible(false)}
          visible={mobileSidebarVisible}
          width={240}
          bodyStyle={{ padding: 0, backgroundColor: '#0f172a' }}
          headerStyle={{ backgroundColor: '#0f172a', borderBottom: '1px solid #1e293b' }}
        >
          {/* <Sidebar collapsed={false} /> */}
        </Drawer>
      )}

      <Layout className="transition-all duration-300 bg-transparent" style={{ marginLeft: screens.md ? 200 : 0 }}>
        <Content className="p-4 md:p-8 min-h-screen">
          {!screens.md && (
            <div className="flex items-center mb-6 py-2">
              <Button 
                type="text"
                icon={<MenuOutlined className="text-slate-200" />} 
                onClick={() => setMobileSidebarVisible(true)}
                className="mr-4 hover:bg-slate-800"
              />
              <Title level={4} className="!m-0 !text-slate-100">Attendance</Title>
            </div>
          )}

          {loading && !isAuthorized ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Spin size="large" />
              <Text className="mt-4 text-slate-400">Checking authorization...</Text>
            </div>
          ) : !isAuthorized ? (
            <Card className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-2xl shadow-xl mt-5">
              <Alert
                message="Access Denied"
                description="You are not authorized to take attendance. Required assignment: 'Attendance Boys' or 'Attendance Girls'."
                type="warning"
                showIcon
                icon={<UserOutlined />}
                className="bg-orange-950/30 border-orange-900/50 text-orange-200"
              />
            </Card>
          ) : (
            <Space direction="vertical" size="large" className="w-full">
              {/* Bento Grid: Class Selector Card */}
              <Card 
                className="bg-slate-900/60 backdrop-blur-lg border-slate-700/40 rounded-2xl shadow-lg"
                bodyStyle={{ padding: screens.xs ? '16px' : '24px' }}
              >
                <Text className="text-slate-300 font-semibold block mb-4">Select Class / Section:</Text>
                <Space wrap gap="small">
                  {sections.map(section => (
                    <Button 
                      key={section.id} 
                      type={sectionId === section.id ? 'primary' : 'default'} 
                      onClick={() => setSectionId(section.id)}
                      disabled={loading}
                      className={sectionId === section.id 
                        ? 'bg-blue-600 hover:bg-blue-500 border-none shadow-md shadow-blue-900/20 rounded-lg' 
                        : 'bg-slate-800/80 text-slate-300 border-slate-600 hover:text-white hover:border-slate-500 rounded-lg'
                      }
                    >
                      {section.name}
                    </Button>
                  ))}
                </Space>
              </Card>

              {/* Bento Grid: Students Roster */}
              {students.length > 0 && (
                <Card 
                  title={
                    <Text className="text-slate-100 font-medium">
                      Today's Attendance: {formatDateSafe(currentDate)} — {sectionName}
                    </Text>
                  }
                  className="bg-slate-900/60 backdrop-blur-lg border-slate-700/40 rounded-2xl shadow-lg"
                  headStyle={{ borderBottom: '1px solid rgba(51, 65, 85, 0.5)' }}
                >
                  <Row gutter={[16, 16]}>
                    {students.map(student => (
                      <Col xs={24} sm={12} lg={8} xl={6} key={student.id}>
                        <Card 
                          size="small" 
                          title={<Text ellipsis className="text-slate-200 text-sm">{student.fullName}</Text>}
                          className="bg-slate-800/50 border-slate-700/50 rounded-xl hover:border-slate-500 transition-colors"
                        >
                          <Radio.Group 
                            onChange={(e) => handleAttendanceChange(student.id, e.target.value)}
                            value={attendanceData[student.id] || ATTENDANCE_STATUS.PRESENT}
                            buttonStyle="solid"
                            className="w-full flex flex-col gap-1"
                          >
                            {Object.values(ATTENDANCE_STATUS).map(status => (
                              <Radio.Button 
                                key={status}
                                value={status}
                                className={`text-center rounded-md border-0 bg-slate-800 text-slate-300
                                  ${attendanceData[student.id] === status ? '!bg-blue-600 !text-white' : 'hover:!text-blue-400'}
                                `}
                              >
                                {status}
                              </Radio.Button>
                            ))}
                          </Radio.Group>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                  
                  <Divider className="border-slate-700/50 my-6" />
                  
                  <Space wrap className="w-full justify-end">
                    <Button icon={<CalendarOutlined />} onClick={() => setIsModalVisible(true)} className="bg-slate-800 text-slate-200 border-slate-600 rounded-lg">
                      History
                    </Button>
                    <Button icon={<FileTextOutlined />} onClick={fetchAttendanceSummary} className="bg-slate-800 text-slate-200 border-slate-600 rounded-lg">
                      Summary
                    </Button>
                    <Button icon={<EditOutlined />} onClick={() => setIsUpdateModalVisible(true)} className="bg-slate-800 text-slate-200 border-slate-600 rounded-lg">
                      Update
                    </Button>
                    <Button type="primary" onClick={submitAttendance} loading={loading} className="bg-blue-600 rounded-lg shadow-lg shadow-blue-900/30">
                      Submit Attendance
                    </Button>
                  </Space>
                </Card>
              )}
            </Space>
          )}

          {/* Modals inherit glass styles globally if configured, but inline content adapts */}
          <Modal 
            title={<span className="text-slate-100">Previous Attendance - {sectionName}</span>}
            visible={isModalVisible} 
            onCancel={() => setIsModalVisible(false)} 
            footer={null}
            width={800}
            className="dark-modal" // Assume global CSS handles AntD modal dark mode overrides
          >
            <Space className="mb-4">
              <DatePicker onChange={(d, dateStr) => setSelectedDate(dateStr)} />
              <Button type="primary" onClick={fetchPreviousAttendance} disabled={!selectedDate} loading={loading}>
                Fetch
              </Button>
            </Space>
            <Table
              dataSource={modalStudents}
              rowKey="student_id"
              loading={loading}
              columns={[
                { 
                  title: 'Student', 
                  key: 'student', 
                  render: (_, r) => (
                    <Space>
                      <StudentPicture studentId={r.student_id} size={40} />
                      <div><Text strong>{r.student_name}</Text><br/><Text type="secondary" className="text-xs">Roll: {r.roll_no}</Text></div>
                    </Space>
                  )
                },
                { title: 'Status', key: 'status', render: (_, r) => getAttendanceTag(r.attendance_status) },
                { title: 'Date', key: 'date', render: (_, r) => formatDateSafe(r.date) }
              ]}
              scroll={{ x: true }}
            />
          </Modal>

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