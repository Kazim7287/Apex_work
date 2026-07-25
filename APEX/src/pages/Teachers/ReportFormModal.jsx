import { useState ,useEffect} from "react";
import { 
  Form, 
  Input, 
  Select, 
  DatePicker, 
  Rate, 
  Modal, 
  Row, 
  Col, 
  Space, 
  notification, 
  Button,
  Grid
} from "antd";
// eslint-disable-next-line no-unused-vars
import moment from "moment";

const { Option } = Select;
const { useBreakpoint } = Grid;

// eslint-disable-next-line react/prop-types
const ReportFormModal = ({ visible, onCancel, onSuccess, teacherId, isMobile }) => {
  const [form] = Form.useForm();
  const [sections, setSections] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingStudents, setFetchingStudents] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const screens = useBreakpoint();

  const ratingOptions = [
    { value: 1, label: 'Needs Improvement' },
    { value: 2, label: 'Below Average' },
    { value: 3, label: 'Average' },
    { value: 4, label: 'Good' },
    { value: 5, label: 'Excellent' }
  ];

  const dropdownOptions = {
    attendance: [
      { value: 'excellent', label: 'Excellent (90-100%)' },
      { value: 'good', label: 'Good (75-89%)' },
      { value: 'average', label: 'Average (60-74%)' },
      { value: 'poor', label: 'Poor (Below 60%)' }
    ],
    behavior: [
      { value: 'excellent', label: 'Always well-behaved' },
      { value: 'good', label: 'Generally well-behaved' },
      { value: 'average', label: 'Occasional issues' },
      { value: 'poor', label: 'Frequent behavior issues' }
    ],
    participation: [
      { value: 'excellent', label: 'Always participates actively' },
      { value: 'good', label: 'Frequently participates' },
      { value: 'average', label: 'Participates when called upon' },
      { value: 'poor', label: 'Rarely participates' }
    ],
    grooming: [
      { value: 'excellent', label: 'Always neat and tidy' },
      { value: 'good', label: 'Usually neat and tidy' },
      { value: 'average', label: 'Sometimes needs improvement' },
      { value: 'poor', label: 'Often needs improvement' }
    ],
    communication: [
      { value: 'excellent', label: 'Exceptional communication skills' },
      { value: 'good', label: 'Good communication skills' },
      { value: 'average', label: 'Average communication skills' },
      { value: 'poor', label: 'Needs improvement in communication' }
    ]
  };

  useEffect(() => {
    if (teacherId) {
      fetchTeacherAssignments();
    }
  }, [teacherId]);

  // In your ReportFormModal component, modify the fetchTeacherAssignments function:

const fetchTeacherAssignments = async () => {
  try {
    const response = await fetch(`https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/Filter.php?teacher_id=${teacherId}`, {
      credentials: 'include' // This is crucial for sending cookies/session
    });
    
    if (!response.ok) {
      if (response.status === 401) {
        // Handle unauthorized (session expired)
        notification.error({ 
          message: "Session Expired", 
          description: "Please login again" 
        });
        // You might want to redirect to login here
        return;
      }
      throw new Error('Network response was not ok');
    }
    
    const data = await response.json();
    
    if (Array.isArray(data)) {
      // Process data as before
      const uniqueSections = [];
      const uniqueSubjects = [];
      const sectionIds = new Set();
      const subjectIds = new Set();
      
      data.forEach(item => {
        if (!sectionIds.has(item.section_id)) {
          sectionIds.add(item.section_id);
          uniqueSections.push({
            id: item.section_id,
            name: item.section_name
          });
        }
        
        if (!subjectIds.has(item.subject_id)) {
          subjectIds.add(item.subject_id);
          uniqueSubjects.push({
            id: item.subject_id,
            name: item.subject_name
          });
        }
      });
      
      setSections(uniqueSections);
      setSubjects(uniqueSubjects);
    }
  } catch (error) {
    notification.error({ 
      message: "Error", 
      description: error.message 
    });
  }
};
const fetchStudents = async (sectionId) => {
  if (!sectionId) return;
  
  setFetchingStudents(true);
  try {
    const response = await fetch("https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/SecStudents.php", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ section_id: sectionId }),
      credentials: 'include' // Important for session cookies
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Session expired. Please login again.');
      }
      throw new Error('Failed to fetch students');
    }

    const data = await response.json();
    
    if (data.success) {
      setStudents(data.section_students || []);
    } else {
      throw new Error(data.error || 'No students found');
    }
  } catch (error) {
    notification.error({
      message: "Error",
      description: error.message,
      duration: 4
    });
    setStudents([]);
    if (error.message.includes('Session expired')) {
      // Optionally redirect to login
      window.location.href = '/login';
    }
  } finally {
    setFetchingStudents(false);
  }
};

const handleSectionChange = (sectionId) => {
  form.setFieldsValue({ student_id: undefined });
  fetchStudents(sectionId);
};
  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const payload = {
        ...values,
        teacher_id: teacherId,
        report_date: values.report_date.format("YYYY-MM-DD")
      };

      const response = await fetch("https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/std_reportInsert.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (data.status === "success") {
        notification.success({ 
          message: "Success", 
          description: "Report submitted successfully!" 
        });
        form.resetFields();
        onSuccess();
      } else {
        throw new Error(data.message || "Failed to submit report");
      }
    } catch (error) {
      notification.error({ 
        message: "Error", 
        description: error.message 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Create New Report"
      visible={visible}
      onCancel={onCancel}
      footer={null}
      width={isMobile ? '100%' : 1000}
      style={{ 
        top: isMobile ? 0 : 20,
        maxWidth: '100vw'
      }}
      bodyStyle={{ 
        padding: isMobile ? '16px' : '24px',
        maxHeight: isMobile ? '80vh' : 'none',
        overflowY: 'auto'
      }}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        size={isMobile ? "small" : "middle"}
        initialValues={{
          academic_performance: 3,
          homework_completion: 3,
          punctuality: 3
        }}
      >
        <Row gutter={isMobile ? 8 : 16}>
          <Col span={isMobile ? 24 : 8}>
            <Form.Item 
              label="Section" 
              name="section_id" 
              rules={[{ required: true, message: 'Please select a section' }]}
            >
              <Select
                placeholder="Select Section"
                onChange={handleSectionChange}
                showSearch
                optionFilterProp="children"
                loading={sections.length === 0}
              >
                {sections.map((section) => (
                  <Option key={section.id} value={section.id}>
                    {section.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={isMobile ? 24 : 8}>
            <Form.Item 
              label="Subject" 
              name="subject_id" 
              rules={[{ required: true, message: 'Please select a subject' }]}
            >
              <Select
                placeholder="Select Subject"
                showSearch
                optionFilterProp="children"
                loading={subjects.length === 0}
              >
                {subjects.map((subject) => (
                  <Option key={subject.id} value={subject.id}>
                    {subject.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={isMobile ? 24 : 8}>
            <Form.Item 
              label="Student" 
              name="student_id" 
              rules={[{ required: true, message: 'Please select a student' }]}
            >
              <Select
                placeholder="Select Student"
                showSearch
                optionFilterProp="children"
                disabled={!form.getFieldValue('section_id')}
                loading={students.length === 0}
              >
                {students.map((student) => (
                  <Option key={student.id} value={student.id}>
                    {student.std_name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>
        
        <Row gutter={isMobile ? 8 : 16}>
          <Col span={isMobile ? 24 : 8}>
            <Form.Item 
              label="Report Date" 
              name="report_date" 
              rules={[{ required: true, message: 'Please select a date' }]}
            >
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={isMobile ? 24 : 8}>
            <Form.Item 
              label="Academic Performance" 
              name="academic_performance" 
              rules={[{ required: true, message: 'Please rate academic performance' }]}
            >
              <Rate 
                tooltips={ratingOptions.map(opt => opt.label)} 
                style={{ color: '#1890ff' }} 
              />
            </Form.Item>
          </Col>
          <Col span={isMobile ? 24 : 8}>
            <Form.Item 
              label="Homework Completion" 
              name="homework_completion" 
              rules={[{ required: true, message: 'Please rate homework completion' }]}
            >
              <Rate 
                tooltips={ratingOptions.map(opt => opt.label)} 
                style={{ color: '#1890ff' }} 
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={isMobile ? 8 : 16}>
          <Col span={isMobile ? 24 : 8}>
            <Form.Item 
              label="Attendance" 
              name="attendance" 
              rules={[{ required: true, message: 'Please select attendance rating' }]}
            >
              <Select placeholder="Select attendance rating">
                {dropdownOptions.attendance.map(opt => (
                  <Option key={opt.value} value={opt.value}>
                    {opt.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={isMobile ? 24 : 8}>
            <Form.Item 
              label="Behavior" 
              name="behavior" 
              rules={[{ required: true, message: 'Please select behavior rating' }]}
            >
              <Select placeholder="Select behavior rating">
                {dropdownOptions.behavior.map(opt => (
                  <Option key={opt.value} value={opt.value}>
                    {opt.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={isMobile ? 24 : 8}>
            <Form.Item 
              label="Punctuality" 
              name="punctuality" 
              rules={[{ required: true, message: 'Please rate punctuality' }]}
            >
              <Rate 
                tooltips={ratingOptions.map(opt => opt.label)} 
                style={{ color: '#1890ff' }} 
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={isMobile ? 8 : 16}>
          <Col span={isMobile ? 24 : 8}>
            <Form.Item 
              label="Class Participation" 
              name="class_participation" 
              rules={[{ required: true, message: 'Please select participation rating' }]}
            >
              <Select placeholder="Select participation rating">
                {dropdownOptions.participation.map(opt => (
                  <Option key={opt.value} value={opt.value}>
                    {opt.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={isMobile ? 24 : 8}>
            <Form.Item 
              label="Communication Skills" 
              name="communication_skills" 
              rules={[{ required: true, message: 'Please select communication rating' }]}
            >
              <Select placeholder="Select communication rating">
                {dropdownOptions.communication.map(opt => (
                  <Option key={opt.value} value={opt.value}>
                    {opt.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={isMobile ? 24 : 8}>
            <Form.Item 
              label="Grooming/Uniform" 
              name="grooming" 
              rules={[{ required: true, message: 'Please select grooming rating' }]}
            >
              <Select placeholder="Select grooming rating">
                {dropdownOptions.grooming.map(opt => (
                  <Option key={opt.value} value={opt.value}>
                    {opt.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={isMobile ? 8 : 16}>
          <Col span={24}>
            <Form.Item 
              label="Overall Remarks" 
              name="overall_remarks" 
              rules={[{ 
                required: true, 
                message: 'Please enter overall remarks',
                whitespace: true
              }]}
            >
              <Input.TextArea 
                rows={4} 
                placeholder="Enter detailed overall remarks" 
                showCount 
                maxLength={500}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={isMobile ? 8 : 16}>
          <Col span={24}>
            <Form.Item>
              <Space 
                direction={isMobile ? "vertical" : "horizontal"} 
                style={{ width: '100%' }}
              >
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  loading={loading}
                  size={isMobile ? "middle" : "large"}
                  block={isMobile}
                >
                  Submit Report
                </Button>
                <Button 
                  onClick={() => {
                    form.resetFields();
                    onCancel();
                  }}
                  size={isMobile ? "middle" : "large"}
                  block={isMobile}
                >
                  Cancel
                </Button>
              </Space>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default ReportFormModal;