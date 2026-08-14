import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import {
    Avatar,
    Button,
    Card,
    Col,
    Form,
    Modal,
    Popconfirm,
    Row,
    Select,
    Space,
    Table,
    Tag,
    Tooltip,
    Typography,
    notification,
} from "antd";

import {
    BookOutlined,
    DeleteOutlined,
    EditOutlined,
    PlusOutlined,
    ReloadOutlined,
    SolutionOutlined,
    TeamOutlined,
    UserOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;
const { Option } = Select;

axios.defaults.withCredentials = true;

const API_BASE =
    "https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX";

const Assignment = () => {
    const navigate = useNavigate();
    const [form] = Form.useForm();

    // =========================================================
    // STATE
    // =========================================================

    const [sections, setSections] = useState([]);
    const [books, setBooks] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [assignments, setAssignments] = useState([]);

    const [loading, setLoading] = useState(true);
    const [fetching, setFetching] = useState(false);
    const [submitLoading, setSubmitLoading] = useState(false);

    const [selectedSectionIdCreate, setSelectedSectionIdCreate] =
        useState(null);
    const [selectedBookIdCreate, setSelectedBookIdCreate] =
        useState(null);
    const [selectedTeacherIdCreate, setSelectedTeacherIdCreate] =
        useState(null);

    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [editRecord, setEditRecord] = useState(null);

    // =========================================================
    // INITIAL LOAD
    // =========================================================

    useEffect(() => {
        loadInitialData();
    }, []);

    const loadInitialData = async () => {
        setLoading(true);

        try {
            await Promise.all([
                fetchSections(),
                fetchBooks(),
                fetchTeachers(),
            ]);

            await fetchAssignments();
        } catch (error) {
            handleRequestError(error, "Failed to load initial data");
        } finally {
            setLoading(false);
        }
    };

    // =========================================================
    // FETCH SECTIONS
    // =========================================================

    const fetchSections = async () => {
        const response = await axios.get(
            `${API_BASE}/Sec_Read.php`
        );

        setSections(response.data || []);
    };

    // =========================================================
    // FETCH BOOKS / SUBJECTS
    // =========================================================

    const fetchBooks = async () => {
        const response = await axios.get(
            `${API_BASE}/readbook.php`
        );

        setBooks(response.data || []);
    };

    // =========================================================
    // FETCH TEACHERS
    // =========================================================

    const fetchTeachers = async () => {
        const response = await axios.get(
            `${API_BASE}/teach_read.php`
        );

        if (response.data?.success) {
            setTeachers(response.data.data || []);
        } else {
            setTeachers([]);
        }
    };

    // =========================================================
    // FETCH ASSIGNMENTS
    // =========================================================

    const fetchAssignments = async () => {
        setFetching(true);

        try {
            const response = await axios.get(
                `${API_BASE}/readAssigment.php`
            );

            setAssignments(
                Array.isArray(response.data)
                    ? response.data
                    : []
            );
        } catch (error) {
            console.error("Error fetching assignments:", error);

            notification.error({
                message: "Failed to load assignments",
            });
        } finally {
            setFetching(false);
        }
    };

    // =========================================================
    // ERROR HANDLER
    // =========================================================

    const handleRequestError = (error, message) => {
        if (error.response?.status === 401) {
            navigate("/admin-signIn");
            return;
        }

        console.error(error);

        notification.error({
            message,
        });
    };

    // =========================================================
    // CREATE ASSIGNMENT
    // =========================================================

    const handleCreateAssignment = async () => {
        if (
            !selectedSectionIdCreate ||
            !selectedBookIdCreate ||
            !selectedTeacherIdCreate
        ) {
            notification.warning({
                message: "Please select Section, Subject, and Teacher",
            });

            return;
        }

        setSubmitLoading(true);

        try {
            const payload = {
                sec_id: selectedSectionIdCreate,
                book_id: selectedBookIdCreate,
                teach_id: selectedTeacherIdCreate,
            };

            const response = await axios.post(
                `${API_BASE}/Assignmetpost.php`,
                payload
            );

            const success =
                response.data?.success ||
                response.data?.status === "success";

            if (!success) {
                notification.error({
                    message:
                        response.data?.message ||
                        "Failed to create assignment",
                });

                return;
            }

            notification.success({
                message: "Assignment created successfully!",
            });

            resetCreateForm();
            await fetchAssignments();
        } catch (error) {
            handleRequestError(
                error,
                "An error occurred while creating assignment"
            );
        } finally {
            setSubmitLoading(false);
        }
    };

    // =========================================================
    // RESET CREATE FORM
    // =========================================================

    const resetCreateForm = () => {
        setSelectedSectionIdCreate(null);
        setSelectedBookIdCreate(null);
        setSelectedTeacherIdCreate(null);
    };

    // =========================================================
    // UPDATE ASSIGNMENT
    // =========================================================

    const handleUpdateAssignment = async (values) => {
        if (!editRecord?.id) {
            return;
        }

        setSubmitLoading(true);

        try {
            const payload = {
                id: editRecord.id,
                sec_id: values.sec_id,
                book_id: values.book_id,
                teach_id: values.teach_id,
            };

            const response = await axios.put(
                `${API_BASE}/assignment_update.php`,
                payload
            );

            const success =
                response.data?.success ||
                response.data?.status === "success";

            if (!success) {
                notification.error({
                    message:
                        response.data?.message ||
                        "Failed to update assignment",
                });

                return;
            }

            notification.success({
                message: "Assignment updated successfully!",
            });

            closeEditModal();
            await fetchAssignments();
        } catch (error) {
            handleRequestError(
                error,
                "An error occurred while updating assignment"
            );
        } finally {
            setSubmitLoading(false);
        }
    };

    // =========================================================
    // DELETE ASSIGNMENT
    // =========================================================

    const handleDelete = async (id) => {
        try {
            const response = await axios.delete(
                `${API_BASE}/Assignmentdelete.php?id=${id}`
            );

            const success =
                response.data?.success ||
                response.data?.status === "success";

            if (!success) {
                notification.error({
                    message:
                        response.data?.message ||
                        "Failed to delete assignment",
                });

                return;
            }

            notification.success({
                message: "Assignment deleted successfully!",
            });

            await fetchAssignments();
        } catch (error) {
            handleRequestError(
                error,
                "An error occurred while deleting assignment"
            );
        }
    };

    // =========================================================
    // OPEN EDIT MODAL
    // =========================================================

    const openEditModal = (record) => {
        setEditRecord(record);

        form.setFieldsValue({
            sec_id: record.sec_id,
            book_id: record.book_id,
            teach_id: record.teach_id,
        });

        setIsEditModalVisible(true);
    };

    // =========================================================
    // CLOSE EDIT MODAL
    // =========================================================

    const closeEditModal = () => {
        setIsEditModalVisible(false);
        setEditRecord(null);
        form.resetFields();
    };

    // =========================================================
    // TABLE COLUMNS
    // =========================================================

    const columns = [
        {
            title: "Section",
            dataIndex: "sec_name",
            key: "sec_name",
            render: (section) => (
                <Tag
                    color="gold"
                    style={{
                        borderRadius: 12,
                        fontWeight: 600,
                        padding: "4px 10px",
                    }}
                >
                    <TeamOutlined style={{ marginRight: 5 }} />
                    Section {section}
                </Tag>
            ),
        },

        {
            title: "Subject / Book",
            dataIndex: "book_name",
            key: "book_name",
            render: (book) => (
                <Tag
                    color="purple"
                    style={{
                        borderRadius: 12,
                        padding: "4px 10px",
                    }}
                >
                    <BookOutlined style={{ marginRight: 5 }} />
                    {book}
                </Tag>
            ),
        },

        {
            title: "Assigned Teacher",
            dataIndex: "teach_name",
            key: "teach_name",
            render: (teacher) => (
                <Space>
                    <Avatar
                        icon={<UserOutlined />}
                        style={{
                            background: "#0b1b3d",
                            color: "#d4af37",
                        }}
                    />

                    <Text strong>
                        {teacher}
                    </Text>
                </Space>
            ),
        },

        {
            title: "Actions",
            key: "actions",
            align: "center",
            width: 140,

            render: (_, record) => (
                <Space size="small">
                    <Tooltip title="Edit Assignment">
                        <Button
                            type="primary"
                            size="small"
                            icon={<EditOutlined />}
                            onClick={() =>
                                openEditModal(record)
                            }
                            style={{
                                background: "#1e3a8a",
                                borderRadius: 6,
                            }}
                        />
                    </Tooltip>

                    <Popconfirm
                        title="Delete Assignment"
                        description="Are you sure you want to delete this assignment?"
                        onConfirm={() =>
                            handleDelete(record.id)
                        }
                        okText="Yes"
                        cancelText="No"
                        okButtonProps={{
                            danger: true,
                        }}
                    >
                        <Tooltip title="Delete">
                            <Button
                                type="primary"
                                danger
                                size="small"
                                icon={<DeleteOutlined />}
                                style={{
                                    borderRadius: 6,
                                }}
                            />
                        </Tooltip>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    // =========================================================
    // RENDER
    // =========================================================

    return (
        <div
            style={{
                width: "100%",
                maxWidth: 1400,
                margin: "0 auto",
            }}
        >
            <Card
                className="apex-card"
                loading={loading}
                title={
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 12,
                        }}
                    >
                        <div
                            style={{
                                width: 40,
                                height: 40,
                                minWidth: 40,
                                borderRadius: 10,
                                background:
                                    "linear-gradient(135deg, #0b1b3d 0%, #1e3a8a 100%)",
                                color: "#d4af37",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: 18,
                            }}
                        >
                            <SolutionOutlined />
                        </div>

                        <div>
                            <Title
                                level={4}
                                style={{
                                    margin: 0,
                                    color: "#0b1b3d",
                                    fontWeight: 700,
                                }}
                            >
                                Teacher Course & Section Assignments
                            </Title>

                            <Text
                                style={{
                                    color: "#64748b",
                                    fontSize: 12,
                                }}
                            >
                                Assign faculty members to specific
                                class sections and academic subjects
                            </Text>
                        </div>
                    </div>
                }
                extra={
                    <Tooltip title="Refresh">
                        <Button
                            type="text"
                            icon={<ReloadOutlined />}
                            onClick={fetchAssignments}
                            loading={fetching}
                            style={{
                                borderRadius: 8,
                            }}
                        />
                    </Tooltip>
                }
            >
                {/* =====================================================
                    CREATE ASSIGNMENT
                ====================================================== */}

                <Card
                    size="small"
                    style={{
                        background: "#f8fafc",
                        border: "1px solid #e2e8f0",
                        borderRadius: 12,
                        marginBottom: 24,
                    }}
                >
                    <Text
                        strong
                        style={{
                            display: "block",
                            color: "#0b1b3d",
                            marginBottom: 12,
                            fontSize: 13,
                            textTransform: "uppercase",
                            letterSpacing: "0.5px",
                        }}
                    >
                        Assign Teacher to Subject & Section
                    </Text>

                    <Row gutter={[12, 12]}>
                        {/* Section */}
                        <Col xs={24} sm={24} md={7}>
                            <Select
                                placeholder="Select Section"
                                value={selectedSectionIdCreate}
                                onChange={
                                    setSelectedSectionIdCreate
                                }
                                style={{
                                    width: "100%",
                                }}
                            >
                                {sections.map((section) => (
                                    <Option
                                        key={section.id}
                                        value={section.id}
                                    >
                                        Section {section.name}
                                    </Option>
                                ))}
                            </Select>
                        </Col>

                        {/* Subject */}
                        <Col xs={24} sm={24} md={7}>
                            <Select
                                placeholder="Select Subject"
                                value={selectedBookIdCreate}
                                onChange={setSelectedBookIdCreate}
                                style={{
                                    width: "100%",
                                }}
                            >
                                {books.map((book) => (
                                    <Option
                                        key={book.id}
                                        value={book.id}
                                    >
                                        {book.name}
                                    </Option>
                                ))}
                            </Select>
                        </Col>

                        {/* Teacher */}
                        <Col xs={24} sm={24} md={7}>
                            <Select
                                placeholder="Select Teacher"
                                value={selectedTeacherIdCreate}
                                onChange={
                                    setSelectedTeacherIdCreate
                                }
                                style={{
                                    width: "100%",
                                }}
                            >
                                {teachers.map((teacher) => (
                                    <Option
                                        key={teacher.id}
                                        value={teacher.id}
                                    >
                                        {teacher.teach_name}
                                    </Option>
                                ))}
                            </Select>
                        </Col>

                        {/* Assign Button */}
                        <Col xs={24} sm={24} md={3}>
                            <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                onClick={handleCreateAssignment}
                                loading={submitLoading}
                                block
                                className="apex-btn-gold"
                            >
                                Assign
                            </Button>
                        </Col>
                    </Row>
                </Card>

                {/* =====================================================
                    ASSIGNMENTS TABLE
                ====================================================== */}

                <Table
                    columns={columns}
                    dataSource={assignments}
                    rowKey="id"
                    loading={fetching}
                    scroll={{
                        x: "max-content",
                    }}
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                    }}
                />
            </Card>

            {/* =========================================================
                EDIT ASSIGNMENT MODAL
            ========================================================== */}

            <Modal
                title={
                    <Space>
                        <SolutionOutlined
                            style={{
                                color: "#d4af37",
                            }}
                        />

                        <span>
                            Edit Course Assignment
                        </span>
                    </Space>
                }
                open={isEditModalVisible}
                onCancel={closeEditModal}
                footer={null}
                width={500}
                centered
                destroyOnClose
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleUpdateAssignment}
                    style={{
                        paddingTop: 12,
                    }}
                >
                    {/* Section */}
                    <Form.Item
                        name="sec_id"
                        label={
                            <Text strong>
                                Class Section
                            </Text>
                        }
                        rules={[
                            {
                                required: true,
                                message:
                                    "Please select a section",
                            },
                        ]}
                    >
                        <Select
                            placeholder="Select Section"
                            style={{
                                width: "100%",
                            }}
                        >
                            {sections.map((section) => (
                                <Option
                                    key={section.id}
                                    value={section.id}
                                >
                                    Section {section.name}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    {/* Subject */}
                    <Form.Item
                        name="book_id"
                        label={
                            <Text strong>
                                Subject / Book
                            </Text>
                        }
                        rules={[
                            {
                                required: true,
                                message:
                                    "Please select a subject",
                            },
                        ]}
                    >
                        <Select
                            placeholder="Select Subject"
                            style={{
                                width: "100%",
                            }}
                        >
                            {books.map((book) => (
                                <Option
                                    key={book.id}
                                    value={book.id}
                                >
                                    {book.name}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    {/* Teacher */}
                    <Form.Item
                        name="teach_id"
                        label={
                            <Text strong>
                                Assigned Teacher
                            </Text>
                        }
                        rules={[
                            {
                                required: true,
                                message:
                                    "Please select a teacher",
                            },
                        ]}
                    >
                        <Select
                            placeholder="Select Teacher"
                            style={{
                                width: "100%",
                            }}
                        >
                            {teachers.map((teacher) => (
                                <Option
                                    key={teacher.id}
                                    value={teacher.id}
                                >
                                    {teacher.teach_name}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    {/* Submit */}
                    <Button
                        type="primary"
                        htmlType="submit"
                        loading={submitLoading}
                        block
                        className="apex-btn-gold"
                        style={{
                            height: 40,
                            marginTop: 8,
                        }}
                    >
                        Update Assignment
                    </Button>
                </Form>
            </Modal>
        </div>
    );
};

export default Assignment;