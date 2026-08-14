/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import { useState, useEffect, useRef } from "react";
import {
  Card,
  Button,
  Table,
  Typography,
  Input,
  Select,
  DatePicker,
  TimePicker,
  Row,
  Col,
  message,
  Space,
  Modal,
  Tag,
  Alert,
  Dropdown,
  Tooltip
} from "antd";
import dayjs from "dayjs";
import {
  CalendarOutlined,
  ClockCircleOutlined,
  BookOutlined,
  TeamOutlined,
  EyeOutlined,
  PlusOutlined,
  ScheduleOutlined,
  PrinterOutlined,
  DownloadOutlined,
  FilePdfOutlined,
  FileTextOutlined,
  CheckCircleOutlined
} from "@ant-design/icons";

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = TimePicker;

const ExamTimetable = () => {
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
  const printRef = useRef();

  // Form state for scheduling
  const [subjectForms, setSubjectForms] = useState({});

  // API endpoints
  const SECTIONS_API = "https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/Sec_Read.php";
  const SUBJECTS_API = "https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/FilterAd.php";
  const EXAM_READ_API = `https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/exam_read.php`;
  const EXAM_TIMETABLE_READ_API = `https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/ExamTimetableFetch.php`;
  const EXAM_TIMETABLE_INSERT_API = `https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/examtimetableinsert.php`;

  const fetchWithAuth = async (url, options = {}) => {
    try {
      const response = await fetch(url, {
        ...options,
        credentials: 'include',
        headers: {
          ...options.headers,
          'Content-Type': 'application/json',
        }
      });
      if (response.status === 401) {
        message.error("Session expired. Please log in again.");
        return null;
      }
      return response;
    } catch (error) {
      console.error("API error:", error);
      message.error("Network error. Please try again.");
      return null;
    }
  };

  useEffect(() => {
    fetchSections();
    fetchExamNames();
  }, []);

  const fetchSections = async () => {
    setLoadingSections(true);
    try {
      const response = await fetchWithAuth(SECTIONS_API);
      if (response && response.ok) {
        const data = await response.json();
        setSections(data);
      }
    } catch (error) {
      message.error("Failed to load sections");
    } finally {
      setLoadingSections(false);
    }
  };

  const fetchExamNames = async () => {
  try {
    const response = await fetchWithAuth(EXAM_READ_API);

    if (response && response.ok) {
      const result = await response.json();

      console.log("EXAM API RESPONSE:", result);

      const exams = Array.isArray(result.data)
        ? result.data
        : result.data
          ? [result.data]
          : [];

      setExamNames(exams);
    }
  } catch (error) {
    console.error("Failed to load exam names:", error);
    setExamNames([]);
  }
};

  const fetchSubjectsForSection = async (sectionId) => {
    setLoadingSubjects(true);
    try {
      const response = await fetchWithAuth(`${SUBJECTS_API}?section_id=${sectionId}`);
      if (response && response.ok) {
        const data = await response.json();
        setSectionSubjects(data);
        const initialForms = {};
        data.forEach(subject => {
          initialForms[subject.id] = {
            subject_id: subject.id,
            subject_name: subject.name,
            exam_date: null,
            time_range: null,
            total_marks: '',
            passing_marks: ''
          };
        });
        setSubjectForms(initialForms);
      }
    } catch (error) {
      message.error("Failed to load subjects for this section");
    } finally {
      setLoadingSubjects(false);
    }
  };

  const handleSectionSelect = (section) => {
    setSelectedSection(section);
    setSelectedExam(null);
    setSectionSubjects([]);
    fetchSubjectsForSection(section.id);
  };

  const handleExamSelect = (examName) => {
    setSelectedExam(examName);
  };

  const handleFormChange = (subjectId, field, value) => {
    setSubjectForms(prev => ({
      ...prev,
      [subjectId]: {
        ...prev[subjectId],
        [field]: value
      }
    }));
  };

  const handleSubmit = async () => {
    if (!selectedSection || !selectedExam) {
      message.warning("Please select both a Section and an Exam Type.");
      return;
    }

    const unconfigured = Object.values(subjectForms).filter(
      form => !form.exam_date || !form.time_range || !form.total_marks || !form.passing_marks
    );

    if (unconfigured.length > 0) {
      message.warning(`Please complete exam schedule details for all ${unconfigured.length} remaining subjects.`);
      return;
    }

    setIsSubmitting(true);
    try {
      const timetableData = Object.values(subjectForms).map(item => ({
        section_id: selectedSection.id,
        exam_name: selectedExam,
        subject_id: item.subject_id,
        exam_date: item.exam_date.format("YYYY-MM-DD"),
        start_time: item.time_range[0].format("HH:mm:ss"),
        end_time: item.time_range[1].format("HH:mm:ss"),
        total_marks: parseInt(item.total_marks),
        passing_marks: parseInt(item.passing_marks)
      }));

      const response = await fetchWithAuth(EXAM_TIMETABLE_INSERT_API, {
        method: "POST",
        body: JSON.stringify({ timetable: timetableData })
      });

      if (response && response.ok) {
        const result = await response.json();
        if (result.success) {
          message.success("Exam timetable scheduled successfully!");
          handleViewTimetable();
        } else {
          message.error(result.message || "Failed to schedule exam timetable");
        }
      }
    } catch (error) {
      message.error("Error submitting exam timetable");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewTimetable = async () => {
    if (!selectedSection || !selectedExam) {
      message.warning("Select both Section and Exam Type to view timetable.");
      return;
    }

    setLoadingExams(true);
    try {
      const response = await fetchWithAuth(
        `${EXAM_TIMETABLE_READ_API}?section_id=${selectedSection.id}&exam_name=${encodeURIComponent(selectedExam)}`
      );
      if (response && response.ok) {
        const data = await response.json();
        setSectionTimetable(Array.isArray(data) ? data : []);
        setIsModalVisible(true);
      }
    } catch (error) {
      message.error("Failed to load timetable");
    } finally {
      setLoadingExams(false);
    }
  };

  const handlePrint = () => {
    const printContent = printRef.current;
    const windowUrl = 'about:blank';
    const uniqueName = new Date().getTime();
    const windowName = 'Print' + uniqueName;
    const printWindow = window.open(windowUrl, windowName, 'left=50,top=50,width=800,height=900');

    printWindow.document.write(`
      <html>
        <head>
          <title>Exam Timetable - ${selectedSection?.name} (${selectedExam})</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h2 { color: #0b1b3d; border-bottom: 2px solid #d4af37; padding-bottom: 10px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
            th { background-color: #f8fafc; color: #0b1b3d; }
          </style>
        </head>
        <body>
          <h2>APEX COLLEGE - EXAM TIMETABLE</h2>
          <p><strong>Section:</strong> ${selectedSection?.name}</p>
          <p><strong>Exam:</strong> ${selectedExam}</p>
          ${printContent.innerHTML}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  const exportAsPDF = () => {
    handlePrint();
  };

  const exportAsText = () => {
    let textContent = `EXAM TIMETABLE\nSection: ${selectedSection?.name}\nExam: ${selectedExam}\n\n`;
    sectionTimetable.forEach(item => {
      textContent += `Subject: ${item.subject_name}\nDate: ${item.exam_date}\nTime: ${item.start_time} - ${item.end_time}\nTotal Marks: ${item.total_marks} | Passing: ${item.passing_marks}\n-------------------------------\n`;
    });
    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Timetable_${selectedSection?.name}_${selectedExam}.txt`;
    link.click();
  };

  const examColumns = [
    {
      title: 'Subject Name',
      dataIndex: 'subject_name',
      key: 'subject_name',
      render: (name) => (
        <Space>
          <BookOutlined style={{ color: '#1e3a8a' }} />
          <Text strong style={{ color: '#0f172a' }}>{name}</Text>
        </Space>
      )
    },
    {
      title: 'Exam Date',
      dataIndex: 'exam_date',
      key: 'exam_date',
      render: (date) => (
        <Tag icon={<CalendarOutlined />} color="processing" style={{ borderRadius: 12 }}>
          {date}
        </Tag>
      )
    },
    {
      title: 'Timing',
      key: 'timing',
      render: (_, record) => (
        <Text style={{ fontSize: 13, color: '#334155' }}>
          <ClockCircleOutlined style={{ marginRight: 6, color: '#d4af37' }} />
          {record.start_time} - {record.end_time}
        </Text>
      )
    },
    {
      title: 'Total Marks',
      dataIndex: 'total_marks',
      key: 'total_marks',
      align: 'center',
      render: (marks) => <Tag color="blue">{marks}</Tag>
    },
    {
      title: 'Passing Marks',
      dataIndex: 'passing_marks',
      key: 'passing_marks',
      align: 'center',
      render: (marks) => <Tag color="green">{marks}</Tag>
    }
  ];

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto' }}>
      <Card
        className="apex-card"
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: 'linear-gradient(135deg, #0b1b3d 0%, #1e3a8a 100%)', color: '#d4af37', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
              <ScheduleOutlined />
            </div>
            <div>
              <Title level={4} style={{ margin: 0, color: '#0b1b3d', fontWeight: 700 }}>
                Exam Schedule & Timetable Planner
              </Title>
              <Text style={{ color: '#64748b', fontSize: 12 }}>Configure examination dates, timing, and marks distribution by section</Text>
            </div>
          </div>
        }
        extra={
          selectedSection && selectedExam && (
            <Button 
              type="primary" 
              onClick={handleViewTimetable}
              loading={loadingExams}
              icon={<EyeOutlined />}
              className="apex-btn-gold"
            >
              View Saved Timetable
            </Button>
          )
        }
      >
        {/* Step 1: Select Section */}
        <div style={{ marginBottom: 24 }}>
          <Text strong style={{ color: '#0b1b3d', display: 'block', marginBottom: 12, fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            1. Select Class Section:
          </Text>
          <Row gutter={[10, 10]}>
            {sections.map(section => {
              const isSelected = selectedSection?.id === section.id;
              return (
                <Col key={section.id}>
                  <Button
                    type={isSelected ? 'primary' : 'default'}
                    onClick={() => handleSectionSelect(section)}
                    icon={<TeamOutlined />}
                    className={isSelected ? 'apex-btn-gold' : ''}
                    style={{ borderRadius: 8, fontWeight: 600, borderColor: isSelected ? '#d4af37' : '#cbd5e1' }}
                  >
                    Section {section.name}
                  </Button>
                </Col>
              );
            })}
          </Row>
        </div>

        {/* Step 2: Select Exam Type */}
        {selectedSection && (
          <div style={{ marginBottom: 24 }}>
            <Text strong style={{ color: '#0b1b3d', display: 'block', marginBottom: 12, fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              2. Select Exam Category:
            </Text>
            <Row gutter={[10, 10]}>
              {examNames.map(exam => {
                const examTitle = exam.exam_name || exam.name || exam;
                const isSelected = selectedExam === examTitle;
                return (
                  <Col key={exam.id || examTitle}>
                    <Button
                      type={isSelected ? 'primary' : 'default'}
                      onClick={() => handleExamSelect(examTitle)}
                      icon={<ScheduleOutlined />}
                      style={{ 
                        borderRadius: 8, 
                        fontWeight: 600,
                        background: isSelected ? 'linear-gradient(135deg, #0b1b3d 0%, #1e3a8a 100%)' : '#ffffff',
                        color: isSelected ? '#ffffff' : '#0b1b3d',
                        borderColor: isSelected ? '#0b1b3d' : '#cbd5e1'
                      }}
                    >
                      {examTitle}
                    </Button>
                  </Col>
                );
              })}
            </Row>
          </div>
        )}

        {/* Step 3: Subject Scheduling Forms */}
        {selectedSection && selectedExam && (
          <Card 
            size="small" 
            style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12 }}
            title={
              <Space style={{ color: '#0b1b3d', fontWeight: 700 }}>
                <BookOutlined style={{ color: '#d4af37' }} />
                <span>Configure Schedule for Section {selectedSection.name} — {selectedExam}</span>
              </Space>
            }
          >
            <Alert
              message="Set Exam Date, Timing, and Marks for all subjects below"
              type="info"
              showIcon
              style={{ marginBottom: 20, borderRadius: 8 }}
            />

            {sectionSubjects.map((subject, idx) => {
              const form = subjectForms[subject.id] || {};
              return (
                <Card 
                  key={subject.id} 
                  size="small" 
                  style={{ marginBottom: 14, borderRadius: 10, border: '1px solid #e2e8f0' }}
                >
                  <Row gutter={[16, 12]} align="middle">
                    <Col xs={24} sm={6}>
                      <Text strong style={{ color: '#0b1b3d', fontSize: 14, display: 'block' }}>
                        {idx + 1}. {subject.name}
                      </Text>
                      <Text style={{ fontSize: 11, color: '#64748b' }}>Code: #{subject.id}</Text>
                    </Col>
                    <Col xs={24} sm={5}>
                      <DatePicker 
                        placeholder="Exam Date" 
                        style={{ width: '100%', borderRadius: 8 }}
                        value={form.exam_date}
                        onChange={(date) => handleFormChange(subject.id, 'exam_date', date)}
                      />
                    </Col>
                    <Col xs={24} sm={5}>
                      <RangePicker 
                        format="HH:mm"
                        style={{ width: '100%', borderRadius: 8 }}
                        value={form.time_range}
                        onChange={(times) => handleFormChange(subject.id, 'time_range', times)}
                      />
                    </Col>
                    <Col xs={12} sm={4}>
                      <Input 
                        placeholder="Total Marks" 
                        type="number"
                        value={form.total_marks}
                        onChange={(e) => handleFormChange(subject.id, 'total_marks', e.target.value)}
                        style={{ borderRadius: 8 }}
                      />
                    </Col>
                    <Col xs={12} sm={4}>
                      <Input 
                        placeholder="Pass Marks" 
                        type="number"
                        value={form.passing_marks}
                        onChange={(e) => handleFormChange(subject.id, 'passing_marks', e.target.value)}
                        style={{ borderRadius: 8 }}
                      />
                    </Col>
                  </Row>
                </Card>
              );
            })}

            <Button 
              type="primary" 
              size="large"
              onClick={handleSubmit}
              loading={isSubmitting}
              icon={<CheckCircleOutlined />}
              block
              className="apex-btn-gold"
              style={{ marginTop: 12, height: 44 }}
            >
              Save & Publish Exam Timetable
            </Button>
          </Card>
        )}
      </Card>

      {/* Timetable Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <CalendarOutlined style={{ color: '#d4af37', fontSize: 18 }} />
            <span>Timetable: Section {selectedSection?.name} ({selectedExam})</span>
          </div>
        }
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsModalVisible(false)} style={{ borderRadius: 8 }}>
            Close
          </Button>,
          <Button key="export" icon={<DownloadOutlined />} onClick={exportAsText} style={{ borderRadius: 8 }}>
            Export Text
          </Button>,
          <Button key="print" type="primary" icon={<PrinterOutlined />} onClick={handlePrint} className="apex-btn-gold">
            Print Timetable
          </Button>
        ]}
        width={850}
        centered
      >
        <div ref={printRef} style={{ paddingTop: 12 }}>
          <Table
            columns={examColumns}
            dataSource={sectionTimetable}
            rowKey="id"
            loading={loadingExams}
            pagination={false}
            scroll={{ x: 'max-content' }}
          />
        </div>
      </Modal>
    </div>
  );
};

export default ExamTimetable;