import { useState, useEffect } from "react";
import {
  Form,
  Input,
  Select,
  DatePicker,
  Rate,
  Modal,
  notification,
  Button,
  Grid,
  ConfigProvider,
  theme,
} from "antd";
import {
  UserOutlined,
  BookOutlined,
  CalendarOutlined,
  StarOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  CloseOutlined,
  TeamOutlined,
  MessageOutlined,
  SmileOutlined,
} from "@ant-design/icons";
import styled from "styled-components";

const { Option } = Select;
const { useBreakpoint } = Grid;

// Styled Modal Wrapper with Dark Navy & Gold Theme
const StyledModal = styled(Modal)`
  .ant-modal-content {
    background: #081028 !important;
    border: 1px solid rgba(212, 175, 55, 0.25) !important;
    border-radius: 16px !important;
    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6) !important;
    overflow: hidden;
    padding: 0 !important;
  }

  .ant-modal-header {
    background: linear-gradient(180deg, #091838 0%, #081028 100%) !important;
    border-bottom: 1px solid rgba(212, 175, 55, 0.15) !important;
    padding: 20px 24px !important;
    margin: 0 !important;
  }

  .ant-modal-title {
    color: #ffffff !important;
    font-size: 18px !important;
    font-weight: 700 !important;
    letter-spacing: 0.5px;
    display: flex;
    align-items: center;
    gap: 10px;

    .title-icon {
      color: #d4af37;
      font-size: 20px;
    }
  }

  .ant-modal-close {
    color: #94a3b8 !important;
    top: 20px !important;
    right: 20px !important;
    &:hover {
      color: #d4af37 !important;
      background: rgba(212, 175, 55, 0.1) !important;
    }
  }

  .ant-modal-body {
    padding: 24px !important;
    max-height: calc(88vh - 80px);
    overflow-y: auto;

    &::-webkit-scrollbar {
      width: 5px;
    }
    &::-webkit-scrollbar-thumb {
      background: rgba(212, 175, 55, 0.25);
      border-radius: 10px;
    }
  }

  @media (max-width: 576px) {
    .ant-modal-header {
      padding: 16px !important;
    }
    .ant-modal-body {
      padding: 16px !important;
      max-height: calc(92vh - 70px);
    }
  }
`;

const SectionCard = styled.div`
  background: rgba(13, 24, 46, 0.7);
  border: 1px solid rgba(212, 175, 55, 0.12);
  border-radius: 12px;
  padding: 18px;
  margin-bottom: 18px;

  .section-title {
    color: #d4af37;
    font-size: 13px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: 14px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(${(props) => props.cols || 3}, 1fr);
  gap: 16px;

  @media (max-width: 992px) {
    grid-template-columns: repeat(${(props) => Math.min(props.cols || 3, 2)}, 1fr);
  }

  @media (max-width: 576px) {
    grid-template-columns: 1fr;
    gap: 12px;
  }
`;

const RatingWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;

  .ant-rate {
    font-size: 18px;
    color: #d4af37;
  }
`;

const ActionFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
  padding-top: 18px;
  border-top: 1px solid rgba(212, 175, 55, 0.12);

  @media (max-width: 576px) {
    flex-direction: column-reverse;
    gap: 10px;

    button {
      width: 100%;
      height: 42px;
    }
  }
`;

// eslint-disable-next-line react/prop-types
const ReportFormModal = ({ visible, onCancel, onSuccess, teacherId }) => {
  const [form] = Form.useForm();
  const [sections, setSections] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingStudents, setFetchingStudents] = useState(false);
  
  const screens = useBreakpoint();
  const isMobile = !screens.sm;

  const ratingOptions = [
    { value: 1, label: "Needs Improvement" },
    { value: 2, label: "Below Average" },
    { value: 3, label: "Average" },
    { value: 4, label: "Good" },
    { value: 5, label: "Excellent" },
  ];

  const dropdownOptions = {
    attendance: [
      { value: "excellent", label: "Excellent (90-100%)" },
      { value: "good", label: "Good (75-89%)" },
      { value: "average", label: "Average (60-74%)" },
      { value: "poor", label: "Poor (Below 60%)" },
    ],
    behavior: [
      { value: "excellent", label: "Always well-behaved" },
      { value: "good", label: "Generally well-behaved" },
      { value: "average", label: "Occasional issues" },
      { value: "poor", label: "Frequent behavior issues" },
    ],
    participation: [
      { value: "excellent", label: "Always participates actively" },
      { value: "good", label: "Frequently participates" },
      { value: "average", label: "Participates when called upon" },
      { value: "poor", label: "Rarely participates" },
    ],
    grooming: [
      { value: "excellent", label: "Always neat and tidy" },
      { value: "good", label: "Usually neat and tidy" },
      { value: "average", label: "Sometimes needs improvement" },
      { value: "poor", label: "Often needs improvement" },
    ],
    communication: [
      { value: "excellent", label: "Exceptional communication skills" },
      { value: "good", label: "Good communication skills" },
      { value: "average", label: "Average communication skills" },
      { value: "poor", label: "Needs improvement in communication" },
    ],
  };

  useEffect(() => {
    if (teacherId && visible) {
      fetchTeacherAssignments();
    }
  }, [teacherId, visible]);

  const fetchTeacherAssignments = async () => {
    try {
      const response = await fetch(
        `https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/Filter.php?teacher_id=${teacherId}`,
        { credentials: "include" }
      );

      if (!response.ok) {
        if (response.status === 401) {
          notification.error({
            message: "Session Expired",
            description: "Please login again",
          });
          return;
        }
        throw new Error("Network response was not ok");
      }

      const data = await response.json();

      if (Array.isArray(data)) {
        const uniqueSections = [];
        const uniqueSubjects = [];
        const sectionIds = new Set();
        const subjectIds = new Set();

        data.forEach((item) => {
          if (!sectionIds.has(item.section_id)) {
            sectionIds.add(item.section_id);
            uniqueSections.push({
              id: item.section_id,
              name: item.section_name,
            });
          }

          if (!subjectIds.has(item.subject_id)) {
            subjectIds.add(item.subject_id);
            uniqueSubjects.push({
              id: item.subject_id,
              name: item.subject_name,
            });
          }
        });

        setSections(uniqueSections);
        setSubjects(uniqueSubjects);
      }
    } catch (error) {
      notification.error({
        message: "Error",
        description: error.message,
      });
    }
  };

  const fetchStudents = async (sectionId) => {
    if (!sectionId) return;

    setFetchingStudents(true);
    try {
      const response = await fetch(
        "https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/SecStudents.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ section_id: sectionId }),
          credentials: "include",
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Session expired. Please login again.");
        }
        throw new Error("Failed to fetch students");
      }

      const data = await response.json();

      if (data.success) {
        setStudents(data.section_students || []);
      } else {
        throw new Error(data.error || "No students found");
      }
    } catch (error) {
      notification.error({
        message: "Error",
        description: error.message,
        duration: 4,
      });
      setStudents([]);
      if (error.message.includes("Session expired")) {
        window.location.href = "/login";
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
        report_date: values.report_date.format("YYYY-MM-DD"),
      };

      const response = await fetch(
        "https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/std_reportInsert.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();
      if (data.status === "success") {
        notification.success({
          message: "Success",
          description: "Report submitted successfully!",
        });
        form.resetFields();
        onSuccess();
      } else {
        throw new Error(data.message || "Failed to submit report");
      }
    } catch (error) {
      notification.error({
        message: "Error",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorPrimary: "#d4af37",
          colorBgContainer: "#0d182e",
          colorBgElevated: "#0d182e",
          colorBorder: "rgba(212, 175, 55, 0.25)",
          colorText: "#e2e8f0",
          colorTextHeading: "#ffffff",
          colorTextPlaceholder: "#64748b",
          borderRadius: 8,
        },
      }}
    >
      <StyledModal
        title={
          <>
            <FileTextOutlined className="title-icon" />
            <span>Create Student Performance Report</span>
          </>
        }
        visible={visible}
        onCancel={onCancel}
        footer={null}
        width={960}
        centered
        destroyOnClose
        closeIcon={<CloseOutlined />}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            academic_performance: 3,
            homework_completion: 3,
            punctuality: 3,
          }}
        >
          {/* SECTION 1: BASIC INFORMATION */}
          <SectionCard>
            <div className="section-title">
              <TeamOutlined /> Basic Information
            </div>
            <FormGrid cols={4}>
              <Form.Item
                label="Section"
                name="section_id"
                rules={[{ required: true, message: "Please select section" }]}
              >
                <Select
                  placeholder="Select Section"
                  onChange={handleSectionChange}
                  showSearch
                  optionFilterProp="children"
                  loading={sections.length === 0}
                  suffixIcon={<TeamOutlined style={{ color: "#d4af37" }} />}
                >
                  {sections.map((section) => (
                    <Option key={section.id} value={section.id}>
                      {section.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                label="Subject"
                name="subject_id"
                rules={[{ required: true, message: "Please select subject" }]}
              >
                <Select
                  placeholder="Select Subject"
                  showSearch
                  optionFilterProp="children"
                  loading={subjects.length === 0}
                  suffixIcon={<BookOutlined style={{ color: "#d4af37" }} />}
                >
                  {subjects.map((subject) => (
                    <Option key={subject.id} value={subject.id}>
                      {subject.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                label="Student"
                name="student_id"
                rules={[{ required: true, message: "Please select student" }]}
              >
                <Select
                  placeholder={
                    !form.getFieldValue("section_id")
                      ? "Select Section First"
                      : "Select Student"
                  }
                  showSearch
                  optionFilterProp="children"
                  disabled={!form.getFieldValue("section_id")}
                  loading={fetchingStudents}
                  suffixIcon={<UserOutlined style={{ color: "#d4af37" }} />}
                >
                  {students.map((student) => (
                    <Option key={student.id} value={student.id}>
                      {student.std_name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                label="Report Date"
                name="report_date"
                rules={[{ required: true, message: "Select report date" }]}
              >
                <DatePicker
                  style={{ width: "100%" }}
                  suffixIcon={<CalendarOutlined style={{ color: "#d4af37" }} />}
                />
              </Form.Item>
            </FormGrid>
          </SectionCard>

          {/* SECTION 2: ACADEMIC & RATING ASSESSMENTS */}
          <SectionCard>
            <div className="section-title">
              <StarOutlined /> Academic & Discipline Ratings
            </div>
            <FormGrid cols={3}>
              <Form.Item
                label="Academic Performance"
                name="academic_performance"
                rules={[{ required: true, message: "Rate academic performance" }]}
              >
                <RatingWrapper>
                  <Rate tooltips={ratingOptions.map((opt) => opt.label)} />
                </RatingWrapper>
              </Form.Item>

              <Form.Item
                label="Homework Completion"
                name="homework_completion"
                rules={[{ required: true, message: "Rate homework completion" }]}
              >
                <RatingWrapper>
                  <Rate tooltips={ratingOptions.map((opt) => opt.label)} />
                </RatingWrapper>
              </Form.Item>

              <Form.Item
                label="Punctuality"
                name="punctuality"
                rules={[{ required: true, message: "Rate punctuality" }]}
              >
                <RatingWrapper>
                  <Rate tooltips={ratingOptions.map((opt) => opt.label)} />
                </RatingWrapper>
              </Form.Item>
            </FormGrid>
          </SectionCard>

          {/* SECTION 3: BEHAVIORAL & DEVELOPMENT EVALUATION */}
          <SectionCard>
            <div className="section-title">
              <SmileOutlined /> Behavioral & Soft Skills Evaluation
            </div>
            <FormGrid cols={3}>
              <Form.Item
                label="Attendance Record"
                name="attendance"
                rules={[{ required: true, message: "Select attendance status" }]}
              >
                <Select placeholder="Select rating">
                  {dropdownOptions.attendance.map((opt) => (
                    <Option key={opt.value} value={opt.value}>
                      {opt.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                label="Classroom Behavior"
                name="behavior"
                rules={[{ required: true, message: "Select behavior rating" }]}
              >
                <Select placeholder="Select rating">
                  {dropdownOptions.behavior.map((opt) => (
                    <Option key={opt.value} value={opt.value}>
                      {opt.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                label="Class Participation"
                name="class_participation"
                rules={[{ required: true, message: "Select participation status" }]}
              >
                <Select placeholder="Select rating">
                  {dropdownOptions.participation.map((opt) => (
                    <Option key={opt.value} value={opt.value}>
                      {opt.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                label="Communication Skills"
                name="communication_skills"
                rules={[{ required: true, message: "Select communication rating" }]}
              >
                <Select placeholder="Select rating">
                  {dropdownOptions.communication.map((opt) => (
                    <Option key={opt.value} value={opt.value}>
                      {opt.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                label="Grooming & Uniform"
                name="grooming"
                rules={[{ required: true, message: "Select grooming status" }]}
              >
                <Select placeholder="Select rating">
                  {dropdownOptions.grooming.map((opt) => (
                    <Option key={opt.value} value={opt.value}>
                      {opt.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </FormGrid>
          </SectionCard>

          {/* SECTION 4: REMARKS */}
          <SectionCard style={{ marginBottom: 0 }}>
            <div className="section-title">
              <MessageOutlined /> Teacher Remarks
            </div>
            <Form.Item
              name="overall_remarks"
              rules={[
                {
                  required: true,
                  message: "Please enter overall remarks",
                  whitespace: true,
                },
              ]}
              style={{ marginBottom: 0 }}
            >
              <Input.TextArea
                rows={3}
                placeholder="Enter detailed feedback on the student's progress and areas for improvement..."
                showCount
                maxLength={500}
                style={{ background: "#061129", color: "#ffffff" }}
              />
            </Form.Item>
          </SectionCard>

          {/* FOOTER ACTIONS */}
          <ActionFooter>
            <Button
              size={isMobile ? "middle" : "large"}
              onClick={() => {
                form.resetFields();
                onCancel();
              }}
              style={{
                borderColor: "rgba(212, 175, 55, 0.3)",
                color: "#cbd5e1",
                background: "transparent",
              }}
            >
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              size={isMobile ? "middle" : "large"}
              icon={<CheckCircleOutlined />}
              style={{
                background: "linear-gradient(135deg, #d4af37 0%, #b89228 100%)",
                borderColor: "#d4af37",
                color: "#ffffff",
                fontWeight: 700,
              }}
            >
              Submit Report
            </Button>
          </ActionFooter>
        </Form>
      </StyledModal>
    </ConfigProvider>
  );
};

export default ReportFormModal;