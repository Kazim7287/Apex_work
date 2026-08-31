// src/pages/Students/Assignment.jsx
import React, { useState, useEffect } from "react";
import {
  Form,
  Input,
  Select,
  Button,
  message,
  Card,
  Typography,
  Row,
  Col,
  Tabs,
  Table,
  Descriptions,
  Tag,
  Modal,
  Spin,
  Space,
  Alert,
  Tooltip,
  Popconfirm
} from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  SyncOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  PlusOutlined,
  FileTextOutlined,
  ReloadOutlined,
  SendOutlined,
  SearchOutlined
} from "@ant-design/icons";

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;
const { TabPane } = Tabs;

const StudentApplications = () => {
  const [form] = Form.useForm();
  const [sections, setSections] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [fetchingSections, setFetchingSections] = useState(false);
  const [fetchingTeachers, setFetchingTeachers] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [applicationType, setApplicationType] = useState("");
  const [activeTab, setActiveTab] = useState("1");
  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [loadingApps, setLoadingApps] = useState(false);
  const [currentApplication, setCurrentApplication] = useState(null);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [loadingApplication, setLoadingApplication] = useState(false);
  const [studentSection, setStudentSection] = useState(null);

  const studentId = localStorage.getItem("student_id");
  const API_BASE_URL = "https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX";

  useEffect(() => {
    fetchStudentSections();
    fetchApplications();
  }, []);

  const fetchStudentSections = async () => {
    setFetchingSections(true);
    try {
      if (!studentId) return;

      const response = await fetch(`${API_BASE_URL}/sec_readsd.php`, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (Array.isArray(data)) {
        setSections(data);
        if (data.length > 0) {
          setStudentSection(data[0]);
          form.setFieldsValue({ section_id: data[0].id });
        }
      } else {
        setSections([]);
      }
    } catch (error) {
      console.error("Error fetching student sections:", error);
      setSections([]);
    } finally {
      setFetchingSections(false);
    }
  };

  const fetchTeachersBySection = async (sectionId) => {
    if (!sectionId) return;
    setFetchingTeachers(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/Filterstd.php?section_id=${encodeURIComponent(sectionId)}`,
        {
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success && Array.isArray(data.data)) {
        const formattedTeachers = data.data.map((teacher) => ({
          id: teacher.teacher_id,
          name: teacher.teacher_name || "Teacher",
        }));
        setTeachers(formattedTeachers);
      } else {
        setTeachers([]);
      }
    } catch (error) {
      console.error("Error fetching teachers:", error);
      setTeachers([]);
    } finally {
      setFetchingTeachers(false);
    }
  };

  const fetchApplications = async () => {
    setLoadingApps(true);
    try {
      if (!studentId) {
        setLoadingApps(false);
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/read_std_application.php?student_id=${encodeURIComponent(studentId)}`,
        { credentials: "include" }
      );
      const data = await response.json();

      if (data.success) {
        const apps = data.data || [];
        setApplications(apps);
        setFilteredApplications(apps);
      } else {
        setApplications([]);
        setFilteredApplications([]);
      }
    } catch (error) {
      console.error("Error fetching applications:", error);
      message.error("Failed to load applications");
    } finally {
      setLoadingApps(false);
    }
  };

  const handleSearch = (value) => {
    setSearchText(value);
    if (!value.trim()) {
      setFilteredApplications(applications);
    } else {
      const q = value.toLowerCase();
      setFilteredApplications(
        applications.filter(
          (app) =>
            (app.title && app.title.toLowerCase().includes(q)) ||
            (app.type && app.type.toLowerCase().includes(q)) ||
            (app.status && app.status.toLowerCase().includes(q)) ||
            (app.description && app.description.toLowerCase().includes(q))
        )
      );
    }
  };

  const handleSectionChange = (sectionId) => {
    if (applicationType === "leave") {
      fetchTeachersBySection(sectionId);
    }
  };

  const handleTypeChange = (type) => {
    setApplicationType(type);
    form.setFieldsValue({ teacher_id: undefined });
    setTeachers([]);

    if (type === "leave" && studentSection) {
      fetchTeachersBySection(studentSection.id);
    }
  };

  const handleSubmit = async (values) => {
    setSubmitting(true);
    try {
      if (!studentId) {
        throw new Error("Student authentication required. Please login again.");
      }

      const submissionData = {
        student_id: parseInt(studentId),
        section_id: values.section_id,
        type: values.type,
        title: values.title,
        description: values.description,
        status: "pending",
        submission_date: new Date().toISOString().slice(0, 19).replace("T", " "),
      };

      if (values.type === "leave" && values.teacher_id) {
        submissionData.teacher_id = values.teacher_id;
      }

      const response = await fetch(`${API_BASE_URL}/std_application.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submissionData),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to submit application");
      }

      message.success("Application submitted successfully!");
      form.resetFields();
      setTeachers([]);
      setApplicationType("");
      fetchApplications();
      setActiveTab("2");
    } catch (error) {
      console.error("Submission error:", error);
      message.error(error.message || "Failed to submit application");
    } finally {
      setSubmitting(false);
    }
  };

  const handleViewApplication = async (application) => {
    setLoadingApplication(true);
    setViewModalVisible(true);
    try {
      if (!studentId) return;

      const response = await fetch(
        `${API_BASE_URL}/read_std_application.php?student_id=${encodeURIComponent(studentId)}`
      );
      const data = await response.json();

      if (data.success && Array.isArray(data.data)) {
        const updatedApp = data.data.find((app) => app.id === application.id);
        if (updatedApp) {
          setCurrentApplication({
            ...updatedApp,
            submission_date: updatedApp.submission_date ? new Date(updatedApp.submission_date) : new Date(),
            response_date: updatedApp.updated_at ? new Date(updatedApp.updated_at) : null,
          });
        } else {
          setCurrentApplication(application);
        }
      } else {
        setCurrentApplication(application);
      }
    } catch (error) {
      console.error("Error fetching application details:", error);
      setCurrentApplication(application);
    } finally {
      setLoadingApplication(false);
    }
  };

  const handleEditApplication = () => {
    if (hasTeacherResponse(currentApplication)) {
      message.warning("Cannot edit application after an instructor or admin has responded.");
      return;
    }
    setViewModalVisible(false);
    form.setFieldsValue({
      type: currentApplication.type,
      section_id: currentApplication.section_id,
      teacher_id: currentApplication.teacher_id,
      title: currentApplication.title,
      description: currentApplication.description,
    });
    setApplicationType(currentApplication.type);
    if (currentApplication.type === "leave" && currentApplication.section_id) {
      fetchTeachersBySection(currentApplication.section_id);
    }
    setActiveTab("1");
  };

  const handleDeleteApplication = async () => {
    if (hasTeacherResponse(currentApplication)) {
      message.warning("Cannot withdraw application after it has been reviewed.");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/delete_std_application.php`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: currentApplication.id }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to delete application");
      }

      message.success("Application withdrawn successfully!");
      setViewModalVisible(false);
      fetchApplications();
    } catch (error) {
      console.error("Delete error:", error);
      message.error(error.message || "Failed to delete application");
    }
  };

  const hasTeacherResponse = (application) => {
    return (
      application &&
      application.response &&
      application.response.trim() !== "" &&
      ["processing", "approved", "rejected"].includes(String(application.status || "").toLowerCase())
    );
  };

  const getStatusTag = (status) => {
    const s = String(status || "pending").toLowerCase();
    if (s === "approved") {
      return (
        <Tag icon={<CheckCircleOutlined />} color="success" style={{ borderRadius: 12, padding: "2px 10px", fontWeight: 600 }}>
          APPROVED
        </Tag>
      );
    }
    if (s === "rejected") {
      return (
        <Tag icon={<CloseCircleOutlined />} color="error" style={{ borderRadius: 12, padding: "2px 10px", fontWeight: 600 }}>
          REJECTED
        </Tag>
      );
    }
    if (s === "processing") {
      return (
        <Tag icon={<SyncOutlined spin />} color="processing" style={{ borderRadius: 12, padding: "2px 10px", fontWeight: 600 }}>
          PROCESSING
        </Tag>
      );
    }
    return (
      <Tag icon={<ClockCircleOutlined />} color="warning" style={{ borderRadius: 12, padding: "2px 10px", fontWeight: 600 }}>
        PENDING
      </Tag>
    );
  };

  const getTypeTag = (type) => {
    const t = String(type || "general").toLowerCase();
    const typeMap = {
      leave: { color: "gold", label: "Leave Request" },
      academic: { color: "blue", label: "Academic Concern" },
      technical: { color: "purple", label: "Technical Issue" },
      general: { color: "cyan", label: "General Inquiry" },
      other: { color: "default", label: "Other" },
    };
    const info = typeMap[t] || { color: "default", label: t.toUpperCase() };
    return <Tag color={info.color} style={{ borderRadius: 6, fontWeight: 600 }}>{info.label}</Tag>;
  };

  const columns = [
    {
      title: "Title & Subject",
      dataIndex: "title",
      key: "title",
      render: (title, record) => (
        <div>
          <Text strong style={{ color: "#0b1b3d", fontSize: 14 }}>
            {title}
          </Text>
          <div style={{ marginTop: 2 }}>
            {getTypeTag(record.type)}
          </div>
        </div>
      ),
    },
    {
      title: "Section / Teacher",
      key: "section_teacher",
      responsive: ["md"],
      render: (_, record) => (
        <Text style={{ color: "#64748b", fontSize: 13 }}>
          {record.section_name || record.section?.name || "Enrolled Section"}
          {record.teacher_name || record.teacher?.name ? ` • ${record.teacher_name || record.teacher?.name}` : ""}
        </Text>
      ),
    },
    {
      title: "Submitted On",
      dataIndex: "submission_date",
      key: "submission_date",
      width: 150,
      render: (date) => (
        <Text style={{ color: "#64748b", fontSize: 13 }}>
          {date ? new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "N/A"}
        </Text>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 140,
      align: "center",
      render: (status) => getStatusTag(status),
    },
    {
      title: "Action",
      key: "action",
      width: 120,
      align: "center",
      render: (_, record) => (
        <Button
          type="primary"
          icon={<EyeOutlined />}
          size="small"
          onClick={() => handleViewApplication(record)}
          style={{ background: "#1e3a8a", borderRadius: 6 }}
        >
          View Details
        </Button>
      ),
    },
  ];

  return (
    <div style={{ maxWidth: 1400, margin: "0 auto" }}>
      {/* Header Banner Card */}
      <Card
        className="apex-card"
        style={{ marginBottom: 24 }}
        bodyStyle={{ padding: "20px 24px" }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: "linear-gradient(135deg, #0b1b3d 0%, #1e3a8a 100%)",
                color: "#d4af37",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 22,
                boxShadow: "0 4px 12px rgba(11, 27, 61, 0.2)",
              }}
            >
              <FileTextOutlined />
            </div>
            <div>
              <Title level={4} style={{ margin: 0, color: "#0b1b3d", fontWeight: 800 }}>
                Student Applications & Inquiries
              </Title>
              <Text style={{ color: "#64748b", fontSize: 13 }}>
                Submit formal leave notices, academic requests, and track administrative responses
              </Text>
            </div>
          </div>

          <Space wrap>
            <Button
              type={activeTab === "1" ? "primary" : "default"}
              icon={<PlusOutlined />}
              onClick={() => setActiveTab("1")}
              className={activeTab === "1" ? "apex-btn-gold" : ""}
              style={{ borderRadius: 8 }}
            >
              New Application
            </Button>
            <Button
              type={activeTab === "2" ? "primary" : "default"}
              icon={<FileTextOutlined />}
              onClick={() => {
                setActiveTab("2");
                fetchApplications();
              }}
              style={{ borderRadius: 8 }}
            >
              My Applications ({applications.length})
            </Button>
          </Space>
        </div>
      </Card>

      {/* Main Tabs Container */}
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        type="card"
        className="apex-custom-tabs"
      >
        {/* TAB 1: CREATE APPLICATION */}
        <TabPane tab={<Space><PlusOutlined /> Submit New Application</Space>} key="1">
          <Card className="apex-card" style={{ maxWidth: 900, margin: "0 auto" }}>
            <Form form={form} layout="vertical" onFinish={handleSubmit}>
              <Row gutter={[20, 16]}>
                <Col xs={24} md={12}>
                  <Form.Item
                    label={<Text strong style={{ color: "#0b1b3d" }}>Application Category</Text>}
                    name="type"
                    rules={[{ required: true, message: "Please select an application type" }]}
                  >
                    <Select
                      placeholder="Select request category"
                      onChange={handleTypeChange}
                      size="large"
                      style={{ borderRadius: 8 }}
                    >
                      <Option value="general">General Inquiry</Option>
                      <Option value="leave">Leave of Absence</Option>
                      <Option value="academic">Academic / Exam Concern</Option>
                      <Option value="technical">Technical Support</Option>
                      <Option value="other">Other Special Request</Option>
                    </Select>
                  </Form.Item>
                </Col>

                <Col xs={24} md={12}>
                  <Form.Item
                    label={<Text strong style={{ color: "#0b1b3d" }}>Enrolled Section</Text>}
                    name="section_id"
                    rules={[{ required: true, message: "Please select a section" }]}
                  >
                    <Select
                      placeholder="Select your section"
                      loading={fetchingSections}
                      onChange={handleSectionChange}
                      size="large"
                      style={{ borderRadius: 8 }}
                    >
                      {sections.map((sec) => (
                        <Option key={sec.id} value={sec.id}>
                          {sec.name}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              {applicationType === "leave" && (
                <Form.Item
                  label={<Text strong style={{ color: "#0b1b3d" }}>Assign to Specific Instructor</Text>}
                  name="teacher_id"
                  rules={[{ required: true, message: "Please select the instructor for leave approval" }]}
                >
                  <Select
                    placeholder="Select instructor"
                    loading={fetchingTeachers}
                    disabled={!teachers.length}
                    size="large"
                    style={{ borderRadius: 8 }}
                  >
                    {teachers.map((teach) => (
                      <Option key={teach.id} value={teach.id}>
                        {teach.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              )}

              <Form.Item
                label={<Text strong style={{ color: "#0b1b3d" }}>Application Title</Text>}
                name="title"
                rules={[{ required: true, message: "Please enter a descriptive application title" }]}
              >
                <Input
                  placeholder="e.g. Leave of Absence for Family Event, Clarification on Midterm Syllabus"
                  size="large"
                  style={{ borderRadius: 8 }}
                />
              </Form.Item>

              <Form.Item
                label={<Text strong style={{ color: "#0b1b3d" }}>Detailed Description / Reason</Text>}
                name="description"
                rules={[
                  { required: true, message: "Please provide detailed description" },
                  { min: 15, message: "Description must contain at least 15 characters" },
                ]}
              >
                <TextArea
                  rows={5}
                  placeholder="Provide comprehensive details, dates, and necessary explanations..."
                  showCount
                  maxLength={600}
                  style={{ borderRadius: 8 }}
                />
              </Form.Item>

              <Form.Item style={{ marginTop: 24, marginBottom: 0 }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<SendOutlined />}
                  loading={submitting}
                  className="apex-btn-gold"
                  size="large"
                  block
                  style={{ height: 48, fontSize: 16 }}
                >
                  {submitting ? "Submitting Application..." : "Submit Application"}
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </TabPane>

        {/* TAB 2: VIEW MY APPLICATIONS */}
        <TabPane tab={<Space><FileTextOutlined /> View Applications ({applications.length})</Space>} key="2">
          <Card
            className="apex-card"
            title={
              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "4px 0" }}>
                <div style={{ width: 34, height: 34, borderRadius: 8, background: "rgba(212, 175, 55, 0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "#d4af37", fontSize: 16 }}>
                  <FileTextOutlined />
                </div>
                <div>
                  <Title level={5} style={{ margin: 0, color: "#0b1b3d", fontWeight: 700 }}>
                    Application History & Status
                  </Title>
                  <Text style={{ color: "#64748b", fontSize: 11 }}>Review past requests and faculty responses</Text>
                </div>
              </div>
            }
            extra={
              <Space wrap>
                <Input
                  placeholder="Search applications..."
                  prefix={<SearchOutlined style={{ color: "#94a3b8" }} />}
                  value={searchText}
                  onChange={(e) => handleSearch(e.target.value)}
                  allowClear
                  style={{ width: 220, borderRadius: 8 }}
                />
                <Button
                  type="text"
                  icon={<ReloadOutlined />}
                  onClick={fetchApplications}
                  loading={loadingApps}
                  style={{ borderRadius: 8 }}
                />
              </Space>
            }
          >
            <Table
              columns={columns}
              dataSource={filteredApplications}
              rowKey="id"
              loading={loadingApps}
              scroll={{ x: "max-content" }}
              pagination={{
                pageSize: 8,
                showSizeChanger: true,
                pageSizeOptions: ["8", "15", "30"],
                showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} applications`,
              }}
            />
          </Card>
        </TabPane>
      </Tabs>

      {/* APPLICATION DETAILS MODAL */}
      <Modal
        title={
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: "#0b1b3d", color: "#d4af37", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <FileTextOutlined />
            </div>
            <span>Application #{currentApplication?.id} Details</span>
          </div>
        }
        open={viewModalVisible}
        onCancel={() => setViewModalVisible(false)}
        width={720}
        centered
        destroyOnClose
        footer={[
          <Button
            key="edit"
            icon={<EditOutlined />}
            onClick={handleEditApplication}
            disabled={hasTeacherResponse(currentApplication)}
            style={{ borderRadius: 6 }}
          >
            Edit Request
          </Button>,
          <Popconfirm
            key="delete"
            title="Withdraw Application"
            description="Are you sure you want to withdraw this application?"
            onConfirm={handleDeleteApplication}
            okText="Yes, Withdraw"
            cancelText="Cancel"
            okButtonProps={{ danger: true }}
            disabled={hasTeacherResponse(currentApplication)}
          >
            <Button
              danger
              icon={<DeleteOutlined />}
              disabled={hasTeacherResponse(currentApplication)}
              style={{ borderRadius: 6 }}
            >
              Withdraw
            </Button>
          </Popconfirm>,
          <Button
            key="close"
            type="primary"
            onClick={() => setViewModalVisible(false)}
            style={{ background: "#0b1b3d", borderRadius: 6 }}
          >
            Close
          </Button>,
        ]}
      >
        {loadingApplication ? (
          <div style={{ textAlign: "center", padding: 32 }}>
            <Spin size="large" tip="Loading application record..." />
          </div>
        ) : currentApplication ? (
          <div style={{ paddingTop: 8 }}>
            <Descriptions bordered column={1} size="small" labelStyle={{ width: 170, fontWeight: 600, color: "#0b1b3d", background: "#f8fafc" }}>
              <Descriptions.Item label="Application Title">
                <Text strong style={{ color: "#0b1b3d" }}>{currentApplication.title}</Text>
              </Descriptions.Item>

              <Descriptions.Item label="Request Type">
                {getTypeTag(currentApplication.type)}
              </Descriptions.Item>

              <Descriptions.Item label="Current Status">
                {getStatusTag(currentApplication.status)}
              </Descriptions.Item>

              <Descriptions.Item label="Submission Date">
                {currentApplication.submission_date ? currentApplication.submission_date.toLocaleString() : "N/A"}
              </Descriptions.Item>

              <Descriptions.Item label="Student Description">
                <div style={{ padding: "10px 14px", background: "#f8fafc", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 13, lineHeight: 1.6 }}>
                  {currentApplication.description || "No description provided."}
                </div>
              </Descriptions.Item>

              <Descriptions.Item label="Faculty / Admin Response">
                {currentApplication.response ? (
                  <div style={{ padding: "12px 14px", background: "#f0fdf4", borderRadius: 8, border: "1px solid #bbf7d0" }}>
                    <Text strong style={{ color: "#166534", display: "block", marginBottom: 4 }}>
                      Response from {currentApplication.teacher?.name || currentApplication.teacher_name || "Instructor / Administrator"}:
                    </Text>
                    <Text style={{ color: "#15803d", fontSize: 13 }}>{currentApplication.response}</Text>
                    {currentApplication.response_date && (
                      <Text type="secondary" style={{ display: "block", marginTop: 6, fontSize: 11 }}>
                        Reviewed on: {currentApplication.response_date.toLocaleString()}
                      </Text>
                    )}
                  </div>
                ) : (
                  <Text type="secondary" style={{ fontStyle: "italic" }}>
                    No response has been submitted yet. The application is awaiting administrative review.
                  </Text>
                )}
              </Descriptions.Item>
            </Descriptions>
          </div>
        ) : null}
      </Modal>
    </div>
  );
};

export default StudentApplications;