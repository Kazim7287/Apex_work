import { useState, useEffect } from "react";
import {
  Form,
  Input,
  Select,
  Button,
  message,
  Card,
  Typography,
  Layout,
  Row,
  Col,
  Tabs,
  Table,
  Descriptions,
  Tag,
  Modal,
  Spin,
  Grid,
  Drawer,
  Alert
} from "antd";
import {
  CheckOutlined,
  CloseOutlined,
  ClockCircleOutlined,
  FileDoneOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  MenuOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import Sidebar from "./Sidebar";
import styled from "styled-components";

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;
const { Content } = Layout;
const { TabPane } = Tabs;
const { useBreakpoint } = Grid;

// Styled components for responsive design
const MainContent = styled(Content)`
  margin-left: ${({ sidebarOpen, isMobile }) => 
    isMobile ? '0' : (sidebarOpen ? '250px' : '80px')};
  transition: margin-left 0.3s ease;
  min-height: 100vh;
  padding: ${({ isMobile }) => isMobile ? '16px' : '24px'};
`;

const StyledCard = styled(Card)`
  margin-bottom: ${({ isMobile }) => isMobile ? '16px' : '24px'};
`;

const MobileHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding: 0 8px;
  background: #fff;
  position: sticky;
  top: 0;
  z-index: 1;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const ResponsiveTitle = styled(Title)`
  font-size: ${({ isMobile }) => isMobile ? '20px' : '24px'} !important;
  margin-bottom: ${({ isMobile }) => isMobile ? '12px' : '16px'} !important;
  margin-left: ${({ isMobile }) => isMobile ? '16px' : '0'} !important;
`;

const HamburgerButton = styled(Button)`
  border: none;
  box-shadow: none;
  background: transparent !important;
`;

const ViewApplications = ({ onViewApplication, hasTeacherResponse, isMobile }) => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const student_id = localStorage.getItem("student_id");
      if (!student_id) {
        throw new Error("Student not authenticated");
      }
      
      const response = await fetch(
        `https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/read_std_application.php?student_id=${student_id}`
      );
      const data = await response.json();
      
      if (data.success) {
        setApplications(data.data || []);
      } else {
        throw new Error(data.message || "Failed to fetch applications");
      }
    } catch (error) {
      console.error("Error fetching applications:", error);
      message.error(error.message || "Failed to load applications");
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: type => type.charAt(0).toUpperCase() + type.slice(1),
      responsive: ['md']
    },
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      responsive: ['xs']
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: status => {
        let color = '';
        switch (status.toLowerCase()) {
          case 'pending': color = 'orange'; break;
          case 'approved': color = 'green'; break;
          case 'rejected': color = 'red'; break;
          case 'processing': color = 'blue'; break;
          default: color = 'gray';
        }
        return <Tag color={color}>{status.toUpperCase()}</Tag>;
      },
      responsive: ['xs']
    },
    {
      title: 'Date',
      dataIndex: 'submission_date',
      key: 'submission_date',
      render: date => new Date(date).toLocaleDateString(),
      responsive: ['sm']
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Button
          icon={<EyeOutlined />}
          onClick={() => onViewApplication(record)}
          size={isMobile ? "small" : "middle"}
        >
          {isMobile ? '' : 'View Details'}
        </Button>
      )
    }
  ];

  return (
    <Table
      columns={columns}
      dataSource={applications}
      rowKey="id"
      loading={loading}
      pagination={{ pageSize: 10 }}
      scroll={{ x: true }}
      size={isMobile ? "small" : "middle"}
    />
  );
};

const StudentApplications = () => {
  const [form] = Form.useForm();
  const [sections, setSections] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [fetchingSections, setFetchingSections] = useState(false);
  const [fetchingTeachers, setFetchingTeachers] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [applicationType, setApplicationType] = useState("");
  const [activeTab, setActiveTab] = useState("1");
  const [refreshKey, setRefreshKey] = useState(0);
  const [currentApplication, setCurrentApplication] = useState(null);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [loadingApplication, setLoadingApplication] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarVisible, setMobileSidebarVisible] = useState(false);
  const [studentInfo, setStudentInfo] = useState(null);
  const [studentSection, setStudentSection] = useState(null);
  
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  useEffect(() => {
    checkStudentAuthentication();
    fetchStudentSections();
  }, []);

  const checkStudentAuthentication = () => {
    const studentId = localStorage.getItem("student_id");
    if (!studentId) {
      message.error("Student not authenticated. Please log in again.");
      // Redirect to login or show login form
    }
  };

  const fetchStudentSections = async () => {
    setFetchingSections(true);
    try {
      const studentId = localStorage.getItem("student_id");
      if (!studentId) {
        throw new Error("Student not authenticated");
      }

      const response = await fetch("https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/sec_readsd.php", {
        credentials: 'include' // Important for sending session cookies
      });
      
      if (response.status === 401) {
        throw new Error("Unauthorized - Please log in again");
      }
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (Array.isArray(data)) {
        setSections(data);
        if (data.length > 0) {
          // Set the first section as default (student is enrolled in at least one section)
          setStudentSection(data[0]);
          form.setFieldsValue({ section_id: data[0].id });
        }
      } else {
        setSections([]);
        message.warning("You are not enrolled in any sections");
      }
    } catch (error) {
      console.error("Error fetching student sections:", error);
      if (error.message.includes("Unauthorized")) {
        message.error("Session expired. Please log in again.");
        // Redirect to login
      } else {
        message.error(error.message || "Failed to fetch your sections.");
      }
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
        `https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/Filterstd.php?section_id=${sectionId}`,
        {
          method: "GET",
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to fetch teachers");
      }

      const formattedTeachers = data.data.map(teacher => ({
        id: teacher.teacher_id,
        name: teacher.teacher_name || "Teacher"
      }));

      setTeachers(formattedTeachers);
    } catch (error) {
      console.error("Error fetching teachers:", error);
      message.error(error.message || "Failed to fetch teachers.");
      setTeachers([]);
    } finally {
      setFetchingTeachers(false);
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
    
    // If it's a leave application and we have a section, fetch teachers
    if (type === "leave" && studentSection) {
      fetchTeachersBySection(studentSection.id);
    }
  };

  const handleSubmit = async (values) => {
    setSubmitting(true);
    try {
      const student_id = localStorage.getItem("student_id");
      if (!student_id) {
        throw new Error("Student not authenticated. Please log in again.");
      }

      const submissionData = {
        student_id: parseInt(student_id),
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

      const response = await fetch(
        "https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/std_application.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(submissionData),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to submit application");
      }

      message.success("Application submitted successfully!");
      form.resetFields();
      setTeachers([]);
      setApplicationType("");
      setRefreshKey(prev => prev + 1);
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
    try {
      const student_id = localStorage.getItem("student_id");
      if (!student_id) {
        throw new Error("Student not authenticated");
      }
      
      const response = await fetch(
        `https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/read_std_application.php?student_id=${student_id}`
      );
      const data = await response.json();
      
      if (data.success && Array.isArray(data.data)) {
        const updatedApp = data.data.find(app => app.id === application.id);
        if (updatedApp) {
          setCurrentApplication({
            ...updatedApp,
            submission_date: new Date(updatedApp.submission_date),
            response_date: updatedApp.updated_at ? new Date(updatedApp.updated_at) : null
          });
          setViewModalVisible(true);
        } else {
          message.warning("Application details not found");
        }
      } else {
        throw new Error(data.message || "Failed to fetch application details");
      }
    } catch (error) {
      console.error("Error fetching application:", error);
      message.error(error.message || "Failed to load application details");
    } finally {
      setLoadingApplication(false);
    }
  };

  const handleEditApplication = () => {
    if (hasTeacherResponse(currentApplication)) {
      message.warning("Cannot edit application after teacher has responded");
      return;
    }
    setViewModalVisible(false);
    form.setFieldsValue({
      type: currentApplication.type,
      section_id: currentApplication.section_id,
      teacher_id: currentApplication.teacher_id,
      title: currentApplication.title,
      description: currentApplication.description
    });
    setApplicationType(currentApplication.type);
    setActiveTab("1");
  };

  const handleDeleteApplication = async () => {
    if (hasTeacherResponse(currentApplication)) {
      message.warning("Cannot delete application after teacher has responded");
      return;
    }
    
    try {
      const response = await fetch(
        `https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/delete_std_application.php`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id: currentApplication.id }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to delete application");
      }

      message.success("Application deleted successfully!");
      setViewModalVisible(false);
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      console.error("Delete error:", error);
      message.error(error.message || "Failed to delete application");
    }
  };

  const handleTabChange = (key) => {
    setActiveTab(key);
    if (key === "2") {
      setRefreshKey(prev => prev + 1);
    }
  };

  const getStatusTag = (status) => {
    let color = '';
    let icon = null;
    
    switch (status.toLowerCase()) {
      case 'approved':
        color = 'green';
        icon = <CheckOutlined />;
        break;
      case 'rejected':
        color = 'red';
        icon = <CloseOutlined />;
        break;
      case 'pending':
        color = 'orange';
        icon = <ClockCircleOutlined />;
        break;
      case 'processing':
        color = 'blue';
        icon = <FileDoneOutlined />;
        break;
      default:
        color = 'gray';
    }

    return (
      <Tag icon={icon} color={color}>
        {status.toUpperCase()}
      </Tag>
    );
  };

  const hasTeacherResponse = (application) => {
    return application && application.response && application.response.trim() !== '' && 
           ['processing', 'approved', 'rejected'].includes(application.status.toLowerCase());
  };

  const handleSidebarToggle = (isOpen) => {
    setSidebarOpen(isOpen);
  };

  const toggleMobileSidebar = () => {
    setMobileSidebarVisible(!mobileSidebarVisible);
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {/* Desktop Sidebar */}
      {!isMobile && (
        <Sidebar 
          onToggle={handleSidebarToggle} 
          collapsed={!sidebarOpen}
        />
      )}
      
      {/* Mobile Sidebar Drawer */}
      {isMobile && (
        <Drawer
          title="Menu"
          placement="left"
          closable={true}
          onClose={() => setMobileSidebarVisible(false)}
          open={mobileSidebarVisible}
          width={250}
          bodyStyle={{ padding: 0 }}
        >
          <Sidebar 
            onToggle={handleSidebarToggle} 
            mobileMode={true}
            onMobileClose={() => setMobileSidebarVisible(false)}
          />
        </Drawer>
      )}

      <Layout>
        <MainContent sidebarOpen={sidebarOpen} isMobile={isMobile}>
          {isMobile && (
            <MobileHeader>
              <HamburgerButton
                icon={<MenuOutlined />}
                onClick={toggleMobileSidebar}
              />
              <ResponsiveTitle level={2} isMobile={isMobile}>
                Student Applications
              </ResponsiveTitle>
              <div style={{ width: 32 }} /> {/* Spacer for alignment */}
            </MobileHeader>
          )}
          
          {!isMobile && (
            <ResponsiveTitle level={2} isMobile={isMobile}>
              Student Applications
            </ResponsiveTitle>
          )}
          
          {sections.length === 0 && !fetchingSections ? (
            <Alert
              message="No Sections Found"
              description="You are not enrolled in any sections. Please contact your administrator."
              type="warning"
              showIcon
            />
          ) : (
            <Tabs 
              defaultActiveKey="1" 
              activeKey={activeTab} 
              onChange={handleTabChange}
              tabPosition={isMobile ? "top" : "top"}
              size={isMobile ? "small" : "middle"}
            >
              <TabPane tab="Create Application" key="1">
                <StyledCard title="Submit New Application" isMobile={isMobile}>
                  <Form form={form} layout="vertical" onFinish={handleSubmit}>
                    <Row gutter={[16, 16]}>
                      <Col xs={24} md={12}>
                        <Form.Item
                          label="Application Type"
                          name="type"
                          rules={[
                            { required: true, message: "Please select application type" },
                          ]}
                        >
                          <Select
                            placeholder="Select type"
                            onChange={handleTypeChange}
                            size={isMobile ? "small" : "middle"}
                          >
                            <Option value="general">General Inquiry</Option>
                            <Option value="leave">Leave Application</Option>
                            <Option value="academic">Academic Concern</Option>
                            <Option value="technical">Technical Issue</Option>
                            <Option value="other">Other</Option>
                          </Select>
                        </Form.Item>
                      </Col>
                    </Row>

                    <Row gutter={[16, 16]}>
                      <Col xs={24} md={12}>
                        <Form.Item
                          label="Section"
                          name="section_id"
                          rules={[
                            { required: true, message: "Please select a section" },
                          ]}
                        >
                          <Select
                            placeholder="Select section"
                            loading={fetchingSections}
                            onChange={handleSectionChange}
                            size={isMobile ? "small" : "middle"}
                            disabled={sections.length <= 1} // Disable if only one section
                          >
                            {sections.map((section) => (
                              <Option key={section.id} value={section.id}>
                                {section.name}
                              </Option>
                            ))}
                          </Select>
                        </Form.Item>
                      </Col>

                      {applicationType === "leave" && (
                        <Col xs={24} md={12}>
                          <Form.Item
                            label="Teacher"
                            name="teacher_id"
                            rules={[
                              {
                                required: applicationType === "leave",
                                message: "Please select a teacher",
                              },
                            ]}
                          >
                            <Select
                              placeholder="Select teacher"
                              loading={fetchingTeachers}
                              disabled={!teachers.length}
                              size={isMobile ? "small" : "middle"}
                            >
                              {teachers.map((teacher) => (
                                <Option key={teacher.id} value={teacher.id}>
                                  {teacher.name}
                                </Option>
                              ))}
                            </Select>
                          </Form.Item>
                        </Col>
                      )}
                    </Row>

                    <Form.Item
                      label="Application Title"
                      name="title"
                      rules={[
                        { required: true, message: "Please enter application title" },
                      ]}
                    >
                      <Input 
                        placeholder="Enter a descriptive title" 
                        size={isMobile ? "small" : "middle"}
                      />
                    </Form.Item>

                    <Form.Item
                      label="Description"
                      name="description"
                      rules={[
                        { required: true, message: "Please enter description" },
                        { min: 20, message: "Description should be at least 20 characters" }
                      ]}
                    >
                      <TextArea 
                        rows={isMobile ? 3 : 4} 
                        placeholder="Provide detailed information about your application"
                        showCount 
                        maxLength={500}
                        size={isMobile ? "small" : "middle"}
                      />
                    </Form.Item>

                    <Form.Item>
                      <Button
                        type="primary"
                        htmlType="submit"
                        loading={submitting}
                        disabled={submitting}
                        size={isMobile ? "small" : "large"}
                        block={isMobile}
                      >
                        {submitting ? "Submitting..." : "Submit Application"}
                      </Button>
                    </Form.Item>
                  </Form>
                </StyledCard>
              </TabPane>
              <TabPane tab="View Applications" key="2">
                <ViewApplications 
                  key={refreshKey} 
                  onViewApplication={handleViewApplication}
                  hasTeacherResponse={hasTeacherResponse}
                  isMobile={isMobile}
                />
              </TabPane>
            </Tabs>
          )}

          {/* Application Details Modal */}
          <Modal
            title="Application Details"
            open={viewModalVisible}
            onCancel={() => setViewModalVisible(false)}
            width={isMobile ? "90%" : 700}
            footer={[
              <Button 
                key="edit" 
                icon={<EditOutlined />}
                onClick={handleEditApplication}
                disabled={hasTeacherResponse(currentApplication)}
                size={isMobile ? "small" : "middle"}
              >
                {isMobile ? '' : 'Edit'}
              </Button>,
              <Button 
                key="delete" 
                icon={<DeleteOutlined />}
                danger
                onClick={handleDeleteApplication}
                disabled={hasTeacherResponse(currentApplication)}
                size={isMobile ? "small" : "middle"}
              >
                {isMobile ? '' : 'Delete'}
              </Button>
            ]}
          >
            {loadingApplication ? (
              <div style={{ textAlign: 'center', padding: isMobile ? '16px' : '24px' }}>
                <Spin size="large" />
              </div>
            ) : currentApplication ? (
              <>
                <Descriptions 
                  bordered 
                  column={1}
                  size={isMobile ? "small" : "middle"}
                >
                  <Descriptions.Item label="Application Type">
                    <Text strong>{currentApplication.type}</Text>
                  </Descriptions.Item>
                  <Descriptions.Item label="Title">
                    {currentApplication.title}
                  </Descriptions.Item>
                  <Descriptions.Item label="Status">
                    {getStatusTag(currentApplication.status)}
                  </Descriptions.Item>
                  <Descriptions.Item label="Submission Date">
                    {currentApplication.submission_date.toLocaleString()}
                  </Descriptions.Item>
                  {currentApplication.response_date && (
                    <Descriptions.Item label="Response Date">
                      {currentApplication.response_date.toLocaleString()}
                    </Descriptions.Item>
                  )}
                  <Descriptions.Item label="Your Description">
                    <div style={{ 
                      padding: isMobile ? 8 : 10, 
                      background: '#f9f9f9', 
                      borderRadius: 4,
                      fontSize: isMobile ? '14px' : 'inherit'
                    }}>
                      {currentApplication.description || 'No description provided'}
                    </div>
                  </Descriptions.Item>
                  <Descriptions.Item label="Teacher Response">
                    <div style={{ 
                      padding: isMobile ? 8 : 10, 
                      background: '#f9f9f9',
                      borderRadius: 4,
                      minHeight: isMobile ? 60 : 80,
                      fontSize: isMobile ? '14px' : 'inherit'
                    }}>
                      {currentApplication.response ? (
                        <>
                          <Text strong style={{ display: 'block', marginBottom: 8 }}>
                            {currentApplication.teacher?.name || 'Teacher'} responded:
                          </Text>
                          {currentApplication.response}
                          {currentApplication.response_date && (
                            <Text type="secondary" style={{ display: 'block', marginTop: 8 }}>
                              On: {currentApplication.response_date.toLocaleString()}
                            </Text>
                          )}
                        </>
                      ) : (
                        <Text type="secondary">No response yet</Text>
                      )}
                    </div>
                  </Descriptions.Item>
                </Descriptions>
              </>
            ) : (
              <Text type="secondary">No application data available</Text>
            )}
          </Modal>
        </MainContent>
      </Layout>
    </Layout>
  );
};

export default StudentApplications;