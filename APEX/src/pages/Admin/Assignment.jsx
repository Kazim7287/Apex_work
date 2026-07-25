import { useState, useEffect } from "react";
import { 
  notification, 
  Select, 
  Table, 
  Button, 
  Modal, 
  Form, 
  Spin, 
  Card,
  Row,
  Col,
  Layout,
  Typography,
  Space,
  Divider,
  Grid,
  Drawer,
  Avatar,
  Tag,
  Popconfirm,
  Tooltip,
  Badge
} from "antd";
import {
  UserOutlined,
  BookOutlined,
  TeamOutlined,
  FilterOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  MenuOutlined,
  SolutionOutlined,
  CheckCircleOutlined,
  SyncOutlined
} from "@ant-design/icons";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const { Content } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;
const { useBreakpoint } = Grid;

// Set Axios defaults to include credentials
axios.defaults.withCredentials = true;

const Assignment = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [fetching, setFetching] = useState(false);
    const [teacherId, setTeacherId] = useState(null);
    const [sections, setSections] = useState([]);
    const [books, setBooks] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [selectedSectionIdCreate, setSelectedSectionIdCreate] = useState(null);
    const [selectedBookIdCreate, setSelectedBookIdCreate] = useState(null);
    const [selectedTeacherIdCreate, setSelectedTeacherIdCreate] = useState(null);
    const [filterType, setFilterType] = useState(null);
    const [filterValue, setFilterValue] = useState(null);
    const [filteredAssignments, setFilteredAssignments] = useState([]);
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [editRecord, setEditRecord] = useState(null);
    const [form] = Form.useForm();
    const [submitLoading, setSubmitLoading] = useState(false);
    const [mobileDrawerVisible, setMobileDrawerVisible] = useState(false);
    
    const screens = useBreakpoint();
    const isMobile = !screens.md;
    const isSmallMobile = !screens.sm;

    // Check authentication and fetch data
    useEffect(() => {
        const fetchData = async () => {
            try {
                // First fetch sections to verify authentication
                const sectionsRes = await axios.get("https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/sec_read.php", {
                    withCredentials: true
                });

                // If we got sections data, we're authenticated
                setSections(sectionsRes.data);
                
                // Now fetch other data
                const [booksRes, teachersRes] = await Promise.all([
                    axios.get("https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/Book_Read.php", { withCredentials: true }),
                    axios.get("https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/teach_read.php", { withCredentials: true }),
                ]);

                setBooks(booksRes.data.data || []);
                setTeachers(teachersRes.data.data || []);

                // Try to get teacher ID from session
                try {
                    const sessionRes = await axios.get("https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/Assignments.php?action=check_session", {
                        withCredentials: true
                    });
                    if (sessionRes.data.user) {
                        setTeacherId(sessionRes.data.user.id);
                        setSelectedTeacherIdCreate(sessionRes.data.user.id);
                    }
                } catch (error) {
                    console.log("Couldn't fetch session data, continuing with default values");
                }
            } catch (error) {
                if (error.response && error.response.status === 401) {
                    notification.error({ message: "Please login first" });
                    navigate("/login");
                } else {
                    notification.error({ message: "Error fetching data" });
                }
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [navigate]);

    // Fetch assignments based on filter
    const fetchFilteredAssignments = async () => {
        setFetching(true);
        try {
            const params = {};
            if (filterType === "section") params.section_id = filterValue;
            if (filterType === "book") params.subject_id = filterValue;
            if (filterType === "teacher") params.teacher_id = filterValue || teacherId;

            if (!filterType) {
                notification.error({ message: "Please select a filter type." });
                return;
            }

            const response = await axios.get("https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/Filterads.php", { 
                params,
                withCredentials: true
            });

            if (response.data) {
                setFilteredAssignments(response.data);
                if (response.data.length > 0) {
                    notification.success({ message: "Assignments fetched successfully!" });
                } else {
                    notification.info({ message: "No assignments found for the selected filters." });
                }
            }
        } catch (error) {
            if (error.response) {
                if (error.response.status === 401) {
                    notification.error({ 
                        message: "Session expired", 
                        description: "Please login again" 
                    });
                    navigate("/login");
                } else {
                    notification.error({ 
                        message: "Error fetching data",
                        description: error.response.data?.error || "Please try again"
                    });
                }
            } else {
                notification.error({ 
                    message: "Network error",
                    description: "Could not connect to the server"
                });
            }
        } finally {
            setFetching(false);
        }
    };

    // Create assignment
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedSectionIdCreate || !selectedBookIdCreate || !selectedTeacherIdCreate) {
            notification.error({ message: "Please select section, subject and teacher" });
            return;
        }
    
        const data = {
            sec_id: selectedSectionIdCreate,
            sub_id: selectedBookIdCreate,
            tech_id: selectedTeacherIdCreate,
            action: "create_assignment"
        };
    
        setSubmitLoading(true);
        try {
            const response = await axios.post("https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/Assignments.php", data, {
                headers: { 'Content-Type': 'application/json' },
                withCredentials: true
            });
            
            if (response.data && response.data.status === "success") {
                notification.success({ message: "Assignment created successfully!" });
                setSelectedSectionIdCreate(null);
                setSelectedBookIdCreate(null);
                fetchFilteredAssignments();
                setMobileDrawerVisible(false);
            }
        } catch (error) {
            if (error.response) {
                if (error.response.status === 401) {
                    notification.error({ message: "Session expired. Please login again" });
                    navigate("/login");
                } else if (error.response.status === 409) {
                    notification.error({ 
                        message: "Assignment already exists",
                        description: "This teacher is already assigned to teach this subject in this section."
                    });
                } else {
                    notification.error({ 
                        message: "Error creating assignment",
                        description: error.response.data?.message || error.message
                    });
                }
            } else {
                notification.error({ 
                    message: "Network error",
                    description: "Could not connect to the server"
                });
            }
        } finally {
            setSubmitLoading(false);
        }
    };

    // Delete assignment
    const handleDelete = async (id) => {
        try {
            const response = await axios.delete(`https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/Asign_delete.php`, {
                params: { assignment_id: id, teacher_id: teacherId },
                withCredentials: true
            });

            if (response.data && response.data.success) {
                notification.success({ message: response.data?.message || "Assignment deleted successfully" });
                setFilteredAssignments(prev => prev.filter(assignment => assignment.id !== id));
            } else {
                notification.error({ message: response.data?.error || "Error deleting assignment." });
            }
        } catch (error) {
            if (error.response && error.response.status === 401) {
                notification.error({ message: "Session expired. Please login again" });
                navigate("/login");
            } else {
                notification.error({
                    message: error.response?.data?.error || "Error deleting assignment.",
                });
            }
        }
    };

    // Edit assignment
    const handleEdit = (record) => {
        setEditRecord(record);
        form.setFieldsValue({
            section_id: record.section_id || record.sec_id,
            book_id: record.book_id || record.sub_id,
            teacher_id: record.teacher_id || record.teach_id,
        });
        setIsEditModalVisible(true);
    };

    // Submit assignment edit
    const handleEditSubmit = async () => {
        setSubmitLoading(true);
        try {
            const values = form.getFieldsValue();
            const updatedData = {
                assignment_id: editRecord.id,
                sec_id: values.section_id,
                sub_id: values.book_id,
                tech_id: values.teacher_id,
                action: "update_assignment"
            };
    
            const response = await axios.post("https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/Assignments.php", updatedData, {
                headers: { 'Content-Type': 'application/json' },
                withCredentials: true
            });
    
            // Check for both possible success indicators
            if (response.data && (response.data.status === "success" || response.data.success)) {
                notification.success({ 
                    message: response.data.message || "Assignment updated successfully" 
                });
                setIsEditModalVisible(false);
                fetchFilteredAssignments();
            } else {
                notification.error({ 
                    message: response.data?.error || "Failed to update assignment",
                    description: "Please try again"
                });
            }
        } catch (error) {
            if (error.response && error.response.status === 401) {
                notification.error({ message: "Session expired. Please login again" });
                navigate("/login");
            } else {
                notification.error({ 
                    message: "Error updating assignment",
                    description: error.response?.data?.error || error.message
                });
            }
        } finally {
            setSubmitLoading(false);
        }
    };

    const columns = [
        { 
            title: "Teacher", 
            dataIndex: "teach_name", 
            key: "teach_name",
            fixed: isMobile ? 'left' : false,
            width: isMobile ? 120 : undefined,
            render: (text, record) => (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar 
                        size={isSmallMobile ? "small" : "default"}
                        icon={<UserOutlined />}
                        style={{ 
                            backgroundColor: '#1890ff',
                            marginRight: 8,
                            flexShrink: 0
                        }}
                    />
                    <div>
                        <div style={{ 
                            fontWeight: 'bold', 
                            fontSize: isSmallMobile ? '12px' : '14px' 
                        }}>
                            {text || (teachers.find(t => t.id === record.teacher_id)?.teach_name || 'N/A')}
                        </div>
                        <div style={{ 
                            fontSize: isSmallMobile ? '10px' : '12px',
                            color: '#666'
                        }}>
                            Teacher
                        </div>
                    </div>
                </div>
            )
        },
        { 
            title: "Subject", 
            dataIndex: "subject_name", 
            key: "subject_name",
            render: (text, record) => (
                <Tag 
                    icon={<BookOutlined />} 
                    color="blue"
                    style={{ fontSize: isSmallMobile ? '10px' : '12px' }}
                >
                    {text || (books.find(b => b.id === record.sub_id)?.name || 'N/A')}
                </Tag>
            ),
            responsive: ['md'],
        },
        { 
            title: "Section", 
            dataIndex: "section_name", 
            key: "section_name",
            render: (text, record) => (
                <Tag 
                    icon={<TeamOutlined />} 
                    color="green"
                    style={{ fontSize: isSmallMobile ? '10px' : '12px' }}
                >
                    {text || (sections.find(s => s.id === record.sec_id)?.name || 'N/A')}
                </Tag>
            ),
            responsive: ['md'],
        },
        {
            title: "Status",
            key: "status",
            render: () => (
                <Badge 
                    status="success" 
                    text="Active" 
                    style={{ fontSize: isSmallMobile ? '11px' : '13px' }}
                />
            ),
            responsive: ['lg'],
        },
        {
            title: "Actions",
            key: "actions",
            fixed: isMobile ? 'right' : false,
            width: isMobile ? 100 : 120,
            render: (text, record) => (
                <Space size="small">
                    <Tooltip title="Edit">
                        <Button 
                            icon={<EditOutlined />} 
                            size="small"
                            onClick={() => handleEdit(record)}
                        />
                    </Tooltip>
                    <Popconfirm
                        title="Delete Assignment"
                        description="Are you sure you want to delete this assignment?"
                        onConfirm={() => handleDelete(record.id)}
                        okText="Yes"
                        cancelText="No"
                        okType="danger"
                    >
                        <Tooltip title="Delete">
                            <Button 
                                icon={<DeleteOutlined />} 
                                size="small" 
                                danger
                            />
                        </Tooltip>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    const CreateAssignmentForm = () => (
        <Form layout="vertical">
            <Form.Item label="Teacher" required>
                <Select
                    placeholder="Select a Teacher"
                    value={selectedTeacherIdCreate}
                    onChange={(value) => setSelectedTeacherIdCreate(value)}
                    disabled={!teachers.length}
                    suffixIcon={<UserOutlined />}
                    size={isSmallMobile ? 'small' : 'middle'}
                >
                    {teachers.map(teacher => (
                        <Option key={teacher.id} value={teacher.id}>
                            {teacher.teach_name}
                        </Option>
                    ))}
                </Select>
            </Form.Item>
            
            <Form.Item label="Section" required>
                <Select
                    placeholder="Select a Section"
                    value={selectedSectionIdCreate}
                    onChange={(value) => setSelectedSectionIdCreate(value)}
                    disabled={!sections.length}
                    suffixIcon={<TeamOutlined />}
                    size={isSmallMobile ? 'small' : 'middle'}
                >
                    {sections.map(section => (
                        <Option key={section.id} value={section.id}>
                            {section.name}
                        </Option>
                    ))}
                </Select>
            </Form.Item>
            
            <Form.Item label="Subject" required>
                <Select
                    placeholder="Select a Subject"
                    value={selectedBookIdCreate}
                    onChange={(value) => setSelectedBookIdCreate(value)}
                    disabled={!books.length}
                    suffixIcon={<BookOutlined />}
                    size={isSmallMobile ? 'small' : 'middle'}
                >
                    {books.map(book => (
                        <Option key={book.id} value={book.id}>
                            {book.name}
                        </Option>
                    ))}
                </Select>
            </Form.Item>
            
            <Form.Item>
                <Button 
                    type="primary" 
                    onClick={handleSubmit} 
                    loading={submitLoading}
                    icon={<PlusOutlined />}
                    block
                    size={isSmallMobile ? 'small' : 'middle'}
                >
                    Create Assignment
                </Button>
            </Form.Item>
        </Form>
    );

    const FilterSection = () => (
        <div style={{ marginBottom: 16 }}>
            <Form layout="vertical">
                <Form.Item label="Filter By">
                    <Select
                        placeholder="Select Filter Type"
                        value={filterType}
                        onChange={(value) => {
                            setFilterType(value);
                            setFilterValue(null);
                        }}
                        suffixIcon={<FilterOutlined />}
                        size={isSmallMobile ? 'small' : 'middle'}
                    >
                        <Option value="section">Section</Option>
                        <Option value="book">Subject</Option>
                        <Option value="teacher">Teacher</Option>
                    </Select>
                </Form.Item>
                
                {filterType === "section" && (
                    <Form.Item label="Select Section">
                        <Select
                            placeholder="Select Section"
                            value={filterValue}
                            onChange={(value) => setFilterValue(value)}
                            disabled={!sections.length}
                            size={isSmallMobile ? 'small' : 'middle'}
                        >
                            {sections.map(section => (
                                <Option key={section.id} value={section.id}>
                                    {section.name}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>
                )}
                
                {filterType === "book" && (
                    <Form.Item label="Select Subject">
                        <Select
                            placeholder="Select Subject"
                            value={filterValue}
                            onChange={(value) => setFilterValue(value)}
                            disabled={!books.length}
                            size={isSmallMobile ? 'small' : 'middle'}
                        >
                            {books.map(book => (
                                <Option key={book.id} value={book.id}>
                                    {book.name}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>
                )}

                {filterType === "teacher" && (
                    <Form.Item label="Select Teacher">
                        <Select
                            placeholder="Select Teacher"
                            value={filterValue}
                            onChange={(value) => setFilterValue(value)}
                            disabled={!teachers.length}
                            size={isSmallMobile ? 'small' : 'middle'}
                        >
                            {teachers.map(teacher => (
                                <Option key={teacher.id} value={teacher.id}>
                                    {teacher.teach_name}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>
                )}

                <Form.Item>
                    <Button 
                        type="primary" 
                        onClick={fetchFilteredAssignments} 
                        loading={fetching}
                        icon={<SyncOutlined />}
                        disabled={!filterType || (filterType !== "teacher" && !filterValue)}
                        block
                        size={isSmallMobile ? 'small' : 'middle'}
                    >
                        {fetching ? 'Loading...' : 'Show Assignments'}
                    </Button>
                </Form.Item>
            </Form>
        </div>
    );

    if (loading) {
        return (
            <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '100vh',
                background: '#f5f7fa'
            }}>
                <Spin size="large" tip="Loading..." />
            </div>
        );
    }

    return (
        <Layout style={{ minHeight: '100vh', background: '#f5f7fa' }}>
            <Content style={{ 
                padding: isSmallMobile ? '12px' : (isMobile ? '16px' : '24px'),
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
                                />
                            )}
                            <Title level={isSmallMobile ? 4 : 2} style={{ margin: 0 }}>
                                <SolutionOutlined style={{ marginRight: 12, color: '#1890ff' }} />
                                Assignment Management
                            </Title>
                        </div>
                    }
                    bordered={false}
                    style={{ 
                        boxShadow: '0 2px 8px rgba(0,0,0,0.09)',
                        borderRadius: '8px'
                    }}
                    bodyStyle={{ 
                        padding: isSmallMobile ? '12px' : (isMobile ? '16px' : '24px')
                    }}
                    extra={
                        !isMobile && (
                            <Button 
                                type="primary" 
                                icon={<PlusOutlined />}
                                onClick={() => setMobileDrawerVisible(true)}
                                size={isSmallMobile ? 'small' : 'middle'}
                            >
                                New Assignment
                            </Button>
                        )
                    }
                >
                    {isMobile ? (
                        <>
                            <Button 
                                icon={<PlusOutlined />}
                                onClick={() => setMobileDrawerVisible(true)}
                                style={{ marginBottom: 16 }}
                                block
                                type="primary"
                            >
                                Create Assignment
                            </Button>
                            <Drawer
                                title="Create New Assignment"
                                placement="right"
                                onClose={() => setMobileDrawerVisible(false)}
                                open={mobileDrawerVisible}
                                width={300}
                                bodyStyle={{ padding: 16 }}
                            >
                                <CreateAssignmentForm />
                            </Drawer>
                        </>
                    ) : (
                        <Row gutter={[24, 24]}>
                            <Col xs={24} md={8}>
                                <Card 
                                    title="Create Assignment" 
                                    bordered={false}
                                    style={{ height: '100%' }}
                                >
                                    <CreateAssignmentForm />
                                </Card>
                            </Col>
                            <Col xs={24} md={16}>
                                <Card 
                                    title="View Assignments" 
                                    bordered={false}
                                >
                                    <FilterSection />
                                    
                                    <Divider orientation="left">
                                        <Text strong style={{ fontSize: isSmallMobile ? '14px' : '16px' }}>
                                            Assignments ({filteredAssignments.length})
                                        </Text>
                                    </Divider>

                                    <Table 
                                        columns={columns} 
                                        dataSource={filteredAssignments} 
                                        rowKey="id" 
                                        locale={{ emptyText: "No assignments found" }}
                                        loading={fetching}
                                        pagination={{
                                            pageSize: 10,
                                            showSizeChanger: false,
                                            size: isSmallMobile ? 'small' : 'default',
                                            simple: isMobile,
                                            showTotal: (total) => `Total ${total} assignments`
                                        }}
                                        scroll={{ x: isMobile ? 600 : true }}
                                        size={isSmallMobile ? 'small' : (isMobile ? 'middle' : 'default')}
                                    />
                                </Card>
                            </Col>
                        </Row>
                    )}

                    {isMobile && (
                        <>
                            <Divider orientation="left">
                                <Text strong style={{ fontSize: isSmallMobile ? '14px' : '16px' }}>
                                    View Assignments
                                </Text>
                            </Divider>
                            <FilterSection />
                            
                            <Table 
                                columns={columns} 
                                dataSource={filteredAssignments} 
                                rowKey="id" 
                                locale={{ emptyText: "No assignments found" }}
                                loading={fetching}
                                pagination={{
                                    pageSize: 10,
                                    showSizeChanger: false,
                                    size: isSmallMobile ? 'small' : 'default',
                                    simple: isMobile,
                                    showTotal: (total) => `Total ${total} assignments`
                                }}
                                scroll={{ x: isMobile ? 600 : true }}
                                size={isSmallMobile ? 'small' : (isMobile ? 'middle' : 'default')}
                            />
                        </>
                    )}

                    {/* Edit Modal */}
                    <Modal
                        title={
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <Avatar 
                                    icon={<EditOutlined />}
                                    style={{ 
                                        backgroundColor: '#1890ff',
                                        marginRight: 12
                                    }}
                                />
                                <span>Edit Assignment</span>
                            </div>
                        }
                        open={isEditModalVisible}
                        onCancel={() => {
                            setIsEditModalVisible(false);
                            setEditRecord(null);
                            form.resetFields();
                        }}
                        onOk={handleEditSubmit}
                        confirmLoading={submitLoading}
                        okText="Save Changes"
                        cancelText="Cancel"
                        width={isMobile ? '95%' : 600}
                        bodyStyle={{ 
                            padding: isSmallMobile ? '12px' : (isMobile ? '16px' : '24px'),
                        }}
                        centered
                    >
                        <Form form={form} layout="vertical">
                            <Row gutter={[16, 8]}>
                                <Col xs={24} md={12}>
                                    <Form.Item name="teacher_id" label="Teacher" rules={[{ required: true }]}>
                                        <Select 
                                            placeholder="Select Teacher"
                                            suffixIcon={<UserOutlined />}
                                            size={isSmallMobile ? 'small' : 'middle'}
                                        >
                                            {teachers.map(teacher => (
                                                <Option key={teacher.id} value={teacher.id}>
                                                    {teacher.teach_name}
                                                </Option>
                                            ))}
                                        </Select>
                                    </Form.Item>
                                </Col>
                                <Col xs={24} md={12}>
                                    <Form.Item name="section_id" label="Section" rules={[{ required: true }]}>
                                        <Select 
                                            placeholder="Select Section"
                                            suffixIcon={<TeamOutlined />}
                                            size={isSmallMobile ? 'small' : 'middle'}
                                        >
                                            {sections.map(section => (
                                                <Option key={section.id} value={section.id}>
                                                    {section.name}
                                                </Option>
                                            ))}
                                        </Select>
                                    </Form.Item>
                                </Col>
                                <Col xs={24}>
                                    <Form.Item name="book_id" label="Subject" rules={[{ required: true }]}>
                                        <Select 
                                            placeholder="Select Subject"
                                            suffixIcon={<BookOutlined />}
                                            size={isSmallMobile ? 'small' : 'middle'}
                                        >
                                            {books.map(book => (
                                                <Option key={book.id} value={book.id}>
                                                    {book.name}
                                                </Option>
                                            ))}
                                        </Select>
                                    </Form.Item>
                                </Col>
                            </Row>
                        </Form>
                    </Modal>
                </Card>
            </Content>
        </Layout>
    );
};

export default Assignment;