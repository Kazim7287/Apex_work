/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import { useState, useEffect, useRef } from "react";
import Sidebar from "./Sidebar";
import {
  Layout,
  Card,
  Button,
  Table,
  Typography,
  Form,
  Input,
  Select,
  DatePicker,
  TimePicker,
  Row,
  Col,
  message,
  Space,
  Modal,
  Grid,
  Drawer,
  Divider,
  Tag,
  Avatar,
  Spin,
  Badge,
  Popconfirm,
  Alert,
  Tabs,
  Dropdown,
  Menu
} from "antd";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import {
  CalendarOutlined,
  ClockCircleOutlined,
  BookOutlined,
  TeamOutlined,
  EyeOutlined,
  PlusOutlined,
  MenuOutlined,
  EditOutlined,
  DeleteOutlined,
  ScheduleOutlined,
  HomeOutlined, 
  AppstoreOutlined,
  UnorderedListOutlined,
  PrinterOutlined,
  DownloadOutlined,
  FilePdfOutlined,
  FileTextOutlined
} from "@ant-design/icons";

const { Content } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = TimePicker;
const { useBreakpoint } = Grid;
const { TabPane } = Tabs;

const ExamTimetable = () => {
  const navigate = useNavigate();
  const [sections, setSections] = useState([]);
  const [examNames, setExamNames] = useState([]);
  const [loadingSections, setLoadingSections] = useState(false);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [loadingExams, setLoadingExams] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedSection, setSelectedSection] = useState(null);
  const [sectionSubjects, setSectionSubjects] = useState([]);
  const [selectedExam, setSelectedExam] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [sectionTimetable, setSectionTimetable] = useState([]);
  const [mobileDrawerVisible, setMobileDrawerVisible] = useState(false);
  const [activeView, setActiveView] = useState('grid');
  const printRef = useRef();
  
  const screens = useBreakpoint();
  const isMobile = !screens.md;
  const isSmallMobile = !screens.sm;
  const isTablet = screens.md && !screens.lg;

  // API endpoints
  const SECTIONS_API = "https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/sec_read.php";
  const SUBJECTS_API = "https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/FilterAd.php";
  const EXAM_READ_API = `https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/exam_read.php`;
  const EXAM_TIMETABLE_READ_API = `https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/ExamTimetableFetch.php`;
  const EXAM_TIMETABLE_INSERT_API = `https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/examtimetableinsert.php`;

  // Secure fetch function with session handling
  const fetchWithAuth = async (url, options = {}) => {
    try {
      const response = await fetch(url, {
        ...options,
        credentials: 'include',
        headers: {
          ...options.headers,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 401) {
        message.error('Session expired. Please login again.');
        navigate('/admin-signin');
        return null;
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Fetch error:', error);
      message.error(error.message || 'Failed to fetch data');
      return null;
    }
  };

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      await fetchSections();
      await fetchExamNames();
    };
    fetchData();
  }, []);

  // API Functions
  const fetchSections = async () => {
    try {
      setLoadingSections(true);
      const data = await fetchWithAuth(SECTIONS_API);
      if (data) {
        setSections(data?.length > 0 ? data : []);
      }
    } catch (error) {
      console.error("Error fetching sections:", error);
    } finally {
      setLoadingSections(false);
    }
  };

  const fetchExamNames = async () => {
    try {
      const data = await fetchWithAuth(EXAM_READ_API);
      if (data?.status === "success" && data?.data?.length > 0) {
        setExamNames(data.data);
      }
    } catch (error) {
      console.error("Error fetching exam names:", error);
    }
  };

  const fetchSubjectsBySection = async (sectionId) => {
    try {
      setLoadingSubjects(true);
      const data = await fetchWithAuth(`${SUBJECTS_API}?section_id=${sectionId}`);
      return data?.length > 0 
        ? data.map(subject => ({
            id: subject.subject_id,
            sec_tech_subject_id: subject.id,
            name: subject.subject_name,
            subject_code: subject.subject_code,
            examName: "",
            day: "",
            date: null,
            timeRange: null,
            classRoom: ""
          }))
        : [];
    } catch (error) {
      console.error("Error fetching subjects:", error);
      return [];
    } finally {
      setLoadingSubjects(false);
    }
  };

  const fetchTimetableBySectionAndExam = async (sectionId, examName) => {
    try {
      setLoadingExams(true);
      let url = `${EXAM_TIMETABLE_READ_API}?section_id=${sectionId}`;
      
      // Add exam_name parameter if provided
      if (examName) {
        url += `&exam_name=${encodeURIComponent(examName)}`;
      }
      
      const data = await fetchWithAuth(url);
      return data?.status === "success" ? data.data : [];
    } catch (error) {
      console.error("Error fetching timetable:", error);
      return [];
    } finally {
      setLoadingExams(false);
    }
  };

  // Event Handlers
  const handleSectionClick = async (section) => {
    setSelectedSection(section);
    setSelectedExam(null);
    
    try {
      const subjects = await fetchSubjectsBySection(section.id);
      setSectionSubjects(subjects);
    } catch (error) {
      console.error("Error loading section subjects:", error);
    }
  };

  const handleViewTimetable = async () => {
    if (!selectedSection) {
      message.warning("Please select a section first");
      return;
    }
    
    try {
      const timetable = await fetchTimetableBySectionAndExam(selectedSection.id, selectedExam);
      setSectionTimetable(timetable);
      setIsModalVisible(true);
    } catch (error) {
      console.error("Error loading timetable:", error);
    }
  };

  const handleExamSelect = (examName) => {
    setSelectedExam(examName);
    setSectionSubjects(prev => prev.map(subject => ({
      ...subject,
      examName
    })));
  };

  const handleInputChange = (subjectId, fieldName, value) => {
    setSectionSubjects(prev => prev.map(subject => 
      subject.id === subjectId ? { ...subject, [fieldName]: value } : subject
    ));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      // Validation
      if (!selectedSection) throw new Error("Please select a section first");
      if (!selectedExam) throw new Error("Please select an exam type");

      const examsToSubmit = sectionSubjects
        .filter(subject => {
          const isValid = (
            subject.examName && 
            subject.day && 
            subject.date && 
            subject.timeRange && 
            subject.classRoom
          );
          
          if (!isValid && Object.values(subject).some(Boolean)) {
            message.warning(`Please fill all fields for subject: ${subject.name}`);
          }
          return isValid;
        })
        .map(subject => {
          const [startTime, endTime] = subject.timeRange;
          return {
            subject_id: subject.id,
            section_id: selectedSection.id,
            room_no: subject.classRoom,
            time_one: startTime.format("HH:mm:ss"),
            time_two: endTime.format("HH:mm:ss"),
            exam_date: subject.date.format("YYYY-MM-DD"),
            exam_day: subject.day,
            exam_name: subject.examName
          };
        });

      if (examsToSubmit.length === 0) {
        throw new Error("Please fill in all required fields for at least one subject");
      }

      // API call
      const response = await fetchWithAuth(EXAM_TIMETABLE_INSERT_API, {
        method: "POST",
        body: JSON.stringify({ exam_timetable: examsToSubmit }),
      });

      if (!response) throw new Error("Failed to save exam timetable");

      message.success("Exams scheduled successfully!");
      resetForm();
    } catch (error) {
      console.error("Error saving exams:", error);
      handleApiError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setSelectedSection(null);
    setSectionSubjects([]);
    setSelectedExam(null);
    setIsModalVisible(false);
  };

  const handleApiError = (error) => {
    if (error.message.includes("Duplicate entry")) {
      message.error("This exam schedule already exists for some subjects");
    } else if (error.message.includes("foreign key constraint fails")) {
      message.error("Invalid subject or exam reference. Please refresh and try again.");
    } else {
      message.error(error.message || "Failed to save exams. Please check all fields.");
    }
  };

  // Printing functionality
  const handlePrint = () => {
    const printContent = printRef.current;
    const originalContents = document.body.innerHTML;
    
    // Create a print-friendly version
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Exam Timetable - ${selectedSection?.name || ''} ${selectedExam ? `- ${selectedExam}` : ''}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 20px;
              color: #000;
            }
            .print-header {
              text-align: center;
              margin-bottom: 20px;
              border-bottom: 2px solid #000;
              padding-bottom: 10px;
            }
            .print-header h1 {
              margin: 0;
              font-size: 24px;
            }
            .print-header h2 {
              margin: 5px 0 0 0;
              font-size: 18px;
              color: #444;
            }
            .print-meta {
              display: flex;
              justify-content: space-between;
              margin-bottom: 15px;
              font-size: 14px;
            }
            .print-table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 15px;
            }
            .print-table th, .print-table td {
              border: 1px solid #ddd;
              padding: 8px;
              text-align: left;
            }
            .print-table th {
              background-color: #f2f2f2;
              font-weight: bold;
            }
            .print-footer {
              margin-top: 30px;
              text-align: right;
              font-size: 12px;
              color: #666;
            }
            @media print {
              body {
                margin: 0;
                padding: 15px;
              }
              .no-print {
                display: none !important;
              }
            }
          </style>
        </head>
        <body>
          <div class="print-header">
            <h1>Exam Timetable</h1>
            <h2>${selectedSection?.name || ''} ${selectedExam ? `- ${selectedExam}` : ''}</h2>
          </div>
          <div class="print-meta">
            <div>Generated on: ${new Date().toLocaleDateString()}</div>
            <div>Total Exams: ${sectionTimetable.length}</div>
          </div>
          <table class="print-table">
            <thead>
              <tr>
                <th>Subject</th>
                <th>Room</th>
                <th>Day</th>
                <th>Time</th>
                <th>Date</th>
                <th>Duration</th>
              </tr>
            </thead>
            <tbody>
              ${sectionTimetable.map(exam => `
                <tr>
                  <td>${exam.subject_name}</td>
                  <td>${exam.room_no}</td>
                  <td>${exam.exam_day}</td>
                  <td>${exam.time_one} - ${exam.time_two}</td>
                  <td>${dayjs(exam.exam_date).format("DD/MM/YYYY")}</td>
                  <td>${calculateDuration(exam.time_one, exam.time_two)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="print-footer">
            Generated by Apex Education System
          </div>
        </body>
      </html>
    `);
    
    printWindow.document.close();
    
    // Wait for content to load then print
    printWindow.onload = function() {
      printWindow.print();
      printWindow.onafterprint = function() {
        printWindow.close();
      };
    };
  };

  const calculateDuration = (startTime, endTime) => {
    if (!startTime || !endTime) return "N/A";
    const [h1, m1] = startTime.split(':').map(Number);
    const [h2, m2] = endTime.split(':').map(Number);
    const minutes = (h2 * 60 + m2) - (h1 * 60 + m1);
    return minutes <= 0 ? "0 min" : `${Math.floor(minutes/60)}h ${minutes%60}m`;
  };

  const exportAsPDF = () => {
    message.info("PDF export functionality would typically connect to a backend service");
    // In a real application, this would generate a PDF version
    // For now, we'll just use the print functionality
    handlePrint();
  };

  const exportAsText = () => {
    let textContent = `Exam Timetable\n`;
    textContent += `Section: ${selectedSection?.name || ''}\n`;
    textContent += `Exam: ${selectedExam || ''}\n`;
    textContent += `Generated on: ${new Date().toLocaleDateString()}\n\n`;
    
    textContent += "Subject\tRoom\tDay\tTime\tDate\tDuration\n";
    textContent += sectionTimetable.map(exam => 
      `${exam.subject_name}\t${exam.room_no}\t${exam.exam_day}\t${exam.time_one}-${exam.time_two}\t${dayjs(exam.exam_date).format("DD/MM/YYYY")}\t${calculateDuration(exam.time_one, exam.time_two)}`
    ).join('\n');
    
    const blob = new Blob([textContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `timetable-${selectedSection?.name || 'section'}-${selectedExam || 'exam'}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    message.success("Timetable exported as text");
  };

  // Responsive table columns
  const examColumns = [
    { 
      title: "Subject", 
      dataIndex: "subject_name", 
      key: "subject_name",
      fixed: isMobile ? 'left' : false,
      width: isMobile ? 120 : undefined,
      render: (text) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <BookOutlined style={{ marginRight: 8, color: '#1890ff' }} />
          <Text strong style={{ fontSize: isSmallMobile ? '12px' : '14px' }}>
            {text}
          </Text>
        </div>
      )
    },
    { 
      title: "Room", 
      dataIndex: "room_no", 
      key: "room_no",
      render: (text) => (
        <Tag icon={<HomeOutlined />} color="blue" style={{ fontSize: isSmallMobile ? '10px' : '12px' }}>
          {text}
        </Tag>
      ),
      responsive: ['sm']
    },
    { 
      title: "Day", 
      dataIndex: "exam_day", 
      key: "exam_day",
      render: (text) => (
        <Text style={{ fontSize: isSmallMobile ? '11px' : '13px' }}>{text}</Text>
      ),
      responsive: ['md']
    },
    { 
      title: "Time", 
      key: "time",
      render: (_, record) => (
        <div style={{ fontSize: isSmallMobile ? '11px' : '13px' }}>
          <ClockCircleOutlined style={{ marginRight: 4 }} />
          {record.time_one} - {record.time_two}
        </div>
      ),
      responsive: ['md']
    },
    { 
      title: "Date", 
      dataIndex: "exam_date", 
      key: "exam_date",
      render: date => (
        <div style={{ fontSize: isSmallMobile ? '11px' : '13px' }}>
          <CalendarOutlined style={{ marginRight: 4 }} />
          {dayjs(date).format("DD/MM/YYYY")}
        </div>
      ),
      responsive: ['lg']
    },
    {
      title: "Duration",
      key: "duration",
      render: (_, record) => {
        const duration = calculateDuration(record.time_one, record.time_two);
        return (
          <Badge 
            count={duration} 
            style={{ 
              backgroundColor: duration.includes('0 min') ? '#f5222d' : '#52c41a',
              fontSize: isSmallMobile ? '10px' : '12px'
            }} 
          />
        );
      },
      responsive: ['lg']
    }
  ];

  // Mobile-friendly components
  const SectionButtons = () => (
    <div style={{ 
      display: 'flex', 
      flexWrap: 'wrap', 
      gap: '8px',
      justifyContent: isMobile ? 'center' : 'flex-start'
    }}>
      {sections.map(section => (
        <Button
          key={section.id}
          type={selectedSection?.id === section.id ? "primary" : "default"}
          onClick={() => handleSectionClick(section)}
          icon={<TeamOutlined />}
          size={isSmallMobile ? 'small' : 'middle'}
          style={{ 
            minWidth: isSmallMobile ? '80px' : '100px',
            flex: isMobile ? '1 1 40%' : 'none',
            maxWidth: isMobile ? '45%' : 'none'
          }}
        >
          {section.name}
        </Button>
      ))}
    </div>
  );

  const ExamTypeButtons = () => (
    <div style={{ 
      display: 'flex', 
      flexWrap: 'wrap', 
      gap: '8px',
      justifyContent: isMobile ? 'center' : 'flex-start'
    }}>
      {examNames.map(exam => (
        <Button
          key={exam.id}
          type={selectedExam === exam.exam_name ? "primary" : "default"}
          onClick={() => handleExamSelect(exam.exam_name)}
          size={isSmallMobile ? 'small' : 'middle'}
          style={{ 
            minWidth: isSmallMobile ? '100px' : '120px',
            flex: isMobile ? '1 1 45%' : 'none',
            maxWidth: isMobile ? '48%' : 'none'
          }}
        >
          {exam.exam_name}
        </Button>
      ))}
    </div>
  );

  const SubjectForm = ({ subject }) => (
    <Card 
      size="small" 
      style={{ marginBottom: 16, borderRadius: 8 }}
      bodyStyle={{ padding: isSmallMobile ? '12px' : '16px' }}
    >
      <Title level={5} style={{ marginBottom: 16, fontSize: isSmallMobile ? '14px' : '16px' }}>
        <BookOutlined style={{ marginRight: 8, color: '#1890ff' }} />
        {subject.name}
        {subject.subject_code && (
          <Text type="secondary" style={{ fontSize: isSmallMobile ? '11px' : '12px', marginLeft: 8 }}>
            ({subject.subject_code})
          </Text>
        )}
      </Title>
      
      <Row gutter={[8, 8]}>
        <Col xs={24} sm={12} md={8}>
          <Form.Item label="Exam Name" required>
            <Input
              value={subject.examName}
              onChange={e => handleInputChange(subject.id, "examName", e.target.value)}
              disabled={!!selectedExam}
              size={isSmallMobile ? 'small' : 'middle'}
              prefix={<ScheduleOutlined />}
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Form.Item label="Day" required>
            <Select
              value={subject.day}
              onChange={value => handleInputChange(subject.id, "day", value)}
              placeholder="Select day"
              size={isSmallMobile ? 'small' : 'middle'}
            >
              {["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"].map(day => (
                <Option key={day} value={day}>{day}</Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Form.Item label="Date" required>
            <DatePicker
              style={{ width: "100%" }}
              value={subject.date}
              onChange={value => handleInputChange(subject.id, "date", value)}
              placeholder="Select date"
              size={isSmallMobile ? 'small' : 'middle'}
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Form.Item label="Room" required>
            <Input
              value={subject.classRoom}
              onChange={e => handleInputChange(subject.id, "classRoom", e.target.value)}
              placeholder="Enter room number"
              size={isSmallMobile ? 'small' : 'middle'}
              prefix={<HomeOutlined />}
            />
          </Form.Item>
        </Col>
        <Col xs={24} md={16}>
          <Form.Item label="Time" required>
            <RangePicker
              format="HH:mm"
              minuteStep={1}
              value={subject.timeRange}
              onChange={value => handleInputChange(subject.id, "timeRange", value)}
              style={{ width: '100%' }}
              size={isSmallMobile ? 'small' : 'middle'}
            />
          </Form.Item>
        </Col>
      </Row>
    </Card>
  );

  // Export menu items
  const exportMenuItems = [
    {
      key: 'print',
      label: 'Print',
      icon: <PrinterOutlined />,
      onClick: handlePrint
    },
    {
      key: 'pdf',
      label: 'Export as PDF',
      icon: <FilePdfOutlined />,
      onClick: exportAsPDF
    },
    {
      key: 'text',
      label: 'Export as Text',
      icon: <FileTextOutlined />,
      onClick: exportAsText
    }
  ];

  return (
    <Layout style={{ minHeight: "100vh", background: '#f5f7fa' }}>
      {/* Mobile Drawer */}
      {isMobile && (
        <Drawer
          title="Navigation"
          placement="left"
          onClose={() => setMobileDrawerVisible(false)}
          open={mobileDrawerVisible}
          width={280}
          bodyStyle={{ padding: 0 }}
        >
          <Sidebar />
        </Drawer>
      )}

      <Content style={{ 
        padding: isSmallMobile ? '8px' : (isMobile ? '12px' : '16px'),
      }}>
        <Card
          title={
            <div style={{ 
              display: 'flex', 
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '8px'
            }}>
              {isMobile && (
                <Button 
                  icon={<MenuOutlined />}
                  type="text"
                  onClick={() => setMobileDrawerVisible(true)}
                  style={{ marginRight: 8 }}
                  size="small"
                />
              )}
              <Title level={isSmallMobile ? 4 : 2} style={{ margin: 0, fontSize: isMobile ? '18px' : '24px' }}>
                <ScheduleOutlined style={{ marginRight: 12, color: '#1890ff' }} />
                Exam Timetable
              </Title>
            </div>
          }
          bordered={false}
          style={{ 
            boxShadow: '0 2px 8px rgba(0,0,0,0.09)',
            borderRadius: '8px'
          }}
          bodyStyle={{ 
            padding: isSmallMobile ? '12px' : (isMobile ? '16px' : '20px')
          }}
          extra={
            selectedSection && (
              <Space>
                <Button 
                  type="primary" 
                  onClick={handleViewTimetable}
                  loading={loadingExams}
                  icon={<EyeOutlined />}
                  size={isSmallMobile ? 'small' : 'middle'}
                  disabled={!selectedExam}
                >
                  {isMobile ? 'View' : 'View Timetable'}
                </Button>
              </Space>
            )
          }
        >
          {/* Sections Selection */}
          <Card 
            title={
              <Text strong style={{ fontSize: isSmallMobile ? '14px' : '16px' }}>
                <TeamOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                Select Section
              </Text>
            }
            loading={loadingSections}
            style={{ marginBottom: 16 }}
            bodyStyle={{ padding: isSmallMobile ? '12px' : '16px' }}
          >
            <SectionButtons />
          </Card>

          {selectedSection && (
            <>
              {/* Exam Type Selection */}
              <Card 
                title={
                  <Text strong style={{ fontSize: isSmallMobile ? '14px' : '16px' }}>
                    <ScheduleOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                    Select Exam Type
                  </Text>
                }
                style={{ marginBottom: 16 }}
                bodyStyle={{ padding: isSmallMobile ? '12px' : '16px' }}
              >
                <ExamTypeButtons />
              </Card>

              {/* Subject Scheduling Form */}
              {selectedExam && (
                <Card 
                  title={
                    <Text strong style={{ fontSize: isSmallMobile ? '14px' : '16px' }}>
                      <TeamOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                      Schedule for {selectedSection.name} - {selectedExam}
                    </Text>
                  }
                  loading={loadingSubjects}
                  style={{ marginBottom: 16 }}
                  bodyStyle={{ padding: isSmallMobile ? '12px' : '16px' }}
                >
                  {sectionSubjects.length > 0 ? (
                    <>
                      <Alert
                        message="Fill exam details for each subject"
                        description="All fields are required for scheduling."
                        type="info"
                        showIcon
                        style={{ marginBottom: 16, fontSize: isSmallMobile ? '12px' : '14px' }}
                      />
                      
                      <div style={{ maxHeight: isMobile ? '400px' : 'none', overflowY: isMobile ? 'auto' : 'visible' }}>
                        {sectionSubjects.map(subject => (
                          <SubjectForm key={subject.id} subject={subject} />
                        ))}
                      </div>
                      
                      <Button 
                        type="primary" 
                        size={isMobile ? "middle" : "large"}
                        onClick={handleSubmit}
                        loading={isSubmitting}
                        icon={<PlusOutlined />}
                        block
                        style={{ marginTop: 16 }}
                      >
                        Submit Schedule
                      </Button>
                    </>
                  ) : (
                    <div style={{ textAlign: 'center', padding: 20 }}>
                      <BookOutlined style={{ fontSize: 36, color: '#ddd', marginBottom: 12 }} />
                      <Text type="secondary" style={{ display: 'block', fontSize: isSmallMobile ? '12px' : '14px' }}>
                        No subjects found for this section
                      </Text>
                    </div>
                  )}
                </Card>
              )}
            </>
          )}

          {/* Timetable Modal */}
          <Modal
            title={
              <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
                <CalendarOutlined style={{ marginRight: 8, color: '#1890ff', fontSize: 18 }} />
                <span style={{ fontSize: isSmallMobile ? '14px' : '16px' }}>
                  Exam Timetable: {selectedSection?.name || ''} 
                  {selectedExam && ` - ${selectedExam}`}
                </span>
              </div>
            }
            open={isModalVisible}
            onCancel={() => setIsModalVisible(false)}
            footer={[
              <Button key="close" onClick={() => setIsModalVisible(false)}>
                Close
              </Button>,
              <Dropdown 
                key="export" 
                menu={{ items: exportMenuItems }} 
                placement="topRight"
              >
                <Button type="primary" icon={<DownloadOutlined />}>
                  Export
                </Button>
              </Dropdown>,
              <Button 
                key="print" 
                type="primary" 
                icon={<PrinterOutlined />}
                onClick={handlePrint}
              >
                Print
              </Button>
            ]}
            width={isMobile ? '95%' : isTablet ? '90%' : 1000}
            bodyStyle={{ 
              padding: isSmallMobile ? '8px' : '12px',
              maxHeight: '60vh',
              overflowY: 'auto'
            }}
            centered
          >
            <div ref={printRef}>
              {sectionTimetable.length > 0 ? (
                <>
                  <div style={{ marginBottom: 12 }}>
                    <Text strong style={{ fontSize: isSmallMobile ? '12px' : '14px' }}>
                      Total Exams: {sectionTimetable.length}
                    </Text>
                  </div>
                  <Table
                    columns={examColumns}
                    dataSource={sectionTimetable}
                    rowKey="id"
                    loading={loadingExams}
                    pagination={false}
                    scroll={{ x: isMobile ? 500 : true }}
                    locale={{ emptyText: "No exams scheduled yet" }}
                    size={isSmallMobile ? 'small' : (isMobile ? 'middle' : 'default')}
                  />
                </>
              ) : (
                <div style={{ textAlign: 'center', padding: 20 }}>
                  <CalendarOutlined style={{ fontSize: 36, color: '#ddd', marginBottom: 12 }} />
                  <Text type="secondary" style={{ display: 'block', fontSize: isSmallMobile ? '12px' : '14px' }}>
                    No exam timetable found for {selectedSection?.name || 'this section'}
                    {selectedExam && ` and ${selectedExam}`}
                  </Text>
                </div>
              )}
            </div>
          </Modal>
        </Card>
      </Content>
    </Layout>
  );
};

export default ExamTimetable;