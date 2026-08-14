import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Avatar,
    Button,
    Card,
    Descriptions,
    Form,
    Input,
    Modal,
    Popconfirm,
    Select,
    Space,
    Table,
    Tabs,
    Tag,
    Tooltip,
    Typography,
    message,
    Empty,
    Badge,
} from "antd";

import {
    CalendarOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    DeleteFilled,
    DeleteOutlined,
    EyeOutlined,
    MessageOutlined,
    ReloadOutlined,
    SolutionOutlined,
    UserOutlined,
    CloseCircleOutlined,
    SyncOutlined,
} from "@ant-design/icons";

const { TextArea } = Input;
const { Text, Title } = Typography;

const API_BASE =
    "https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/";

const StudentApplications = () => {
    const navigate = useNavigate();
    const [form] = Form.useForm();

    const [applications, setApplications] = useState([]);
    const [filteredApplications, setFilteredApplications] = useState([]);

    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const [selectedApp, setSelectedApp] = useState(null);

    const [detailVisible, setDetailVisible] = useState(false);
    const [responseVisible, setResponseVisible] = useState(false);

    const [activeTab, setActiveTab] = useState("all");

    // Keep the role logic from the working version
    const [userRole, setUserRole] = useState("admin");

    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [bulkDeleteVisible, setBulkDeleteVisible] = useState(false);
    const [bulkDeleteLoading, setBulkDeleteLoading] = useState(false);

    // =========================================================
    // API
    // =========================================================

    const apiFetch = async (endpoint, options = {}) => {
        return fetch(`${API_BASE}${endpoint}`, {
            ...options,
            credentials: "include",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                ...options.headers,
            },
        });
    };

    // =========================================================
    // CHECK ROLE
    // =========================================================

    useEffect(() => {
        const checkRole = async () => {
            try {
                const response = await apiFetch(
                    "read_leave_applications.php"
                );

                if (response.status === 200) {
                    setUserRole("teacher");
                } else {
                    setUserRole("admin");
                }
            } catch (error) {
                console.error("Role check error:", error);
                setUserRole("admin");
            }
        };

        checkRole();
    }, []);

    // =========================================================
    // FETCH APPLICATIONS
    // IMPORTANT: RESTORED WORKING ENDPOINTS
    // =========================================================

    const fetchApplications = async () => {
        setLoading(true);

        try {
            const endpoint =
                userRole === "admin"
                    ? "AdminApplications.php"
                    : "read_leave_applications.php";

            console.log("Fetching applications from:", API_BASE + endpoint);

            const response = await apiFetch(endpoint);

            console.log(
                "Applications response:",
                response.status,
                response.url
            );

            if (response.status === 401) {
                message.error("Session expired. Please sign in again.");

                navigate(
                    userRole === "admin"
                        ? "/admin/login"
                        : "/teacher/login"
                );

                return;
            }

            if (!response.ok) {
                throw new Error(
                    `HTTP ${response.status}: ${response.statusText}`
                );
            }

            const data = await response.json();

            console.log("Applications data:", data);

            let list = [];

            // ADMIN RESPONSE
            if (userRole === "admin") {
                if (data?.success && Array.isArray(data.data)) {
                    list = data.data;
                } else if (Array.isArray(data?.data)) {
                    list = data.data;
                } else if (Array.isArray(data)) {
                    list = data;
                }
            }

            // TEACHER RESPONSE
            else {
                if (Array.isArray(data)) {
                    list = data;
                } else if (Array.isArray(data?.data)) {
                    list = data.data;
                }
            }

            // Make sure IDs are consistent
            const validApplications = list
                .filter(Boolean)
                .map((app) => ({
                    ...app,
                    id: app.id ?? app.application_id,
                }))
                .filter((app) => app.id != null);

            console.log(
                "Valid applications:",
                validApplications
            );

            setApplications(validApplications);
            setSelectedRowKeys([]);

            applyFilter(validApplications, activeTab);

            if (validApplications.length === 0) {
                message.info("No student applications found");
            }
        } catch (error) {
            console.error(
                "Error fetching applications:",
                error
            );

            message.error(
                "Failed to load student applications"
            );

            setApplications([]);
            setFilteredApplications([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchApplications();
    }, [userRole]);

    // =========================================================
    // FILTER
    // =========================================================

    const applyFilter = (data, tab) => {
        if (tab === "all") {
            setFilteredApplications(data);
            return;
        }

        setFilteredApplications(
            data.filter(
                (app) =>
                    String(app.status || "").toLowerCase() ===
                    String(tab).toLowerCase()
            )
        );
    };

    const handleTabChange = (key) => {
        setActiveTab(key);
        applyFilter(applications, key);
        setSelectedRowKeys([]);
    };

    // =========================================================
    // DELETE SINGLE
    // RESTORED: delete_applications.php
    // =========================================================

    const handleSingleDelete = async (id) => {
        try {
            const response = await apiFetch(
                `delete_applications.php?id=${encodeURIComponent(id)}`,
                {
                    method: "DELETE",
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();

            console.log("Delete response:", data);

            if (data.success) {
                message.success(
                    data.message ||
                        "Application deleted successfully"
                );

                setApplications((prev) =>
                    prev.filter((app) => app.id !== id)
                );

                setFilteredApplications((prev) =>
                    prev.filter((app) => app.id !== id)
                );

                setSelectedRowKeys((prev) =>
                    prev.filter((key) => key !== id)
                );
            } else {
                message.error(
                    data.message || "Delete failed"
                );
            }
        } catch (error) {
            console.error("Delete error:", error);
            message.error(
                "Error deleting application"
            );
        }
    };

    // =========================================================
    // BULK DELETE
    // RESTORED: delete_applications.php?ids=
    // =========================================================

    const confirmBulkDelete = async () => {
        if (!selectedRowKeys.length) return;

        setBulkDeleteLoading(true);

        try {
            const ids = selectedRowKeys.join(",");

            const response = await apiFetch(
                `delete_applications.php?ids=${encodeURIComponent(ids)}`,
                {
                    method: "DELETE",
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();

            console.log("Bulk delete response:", data);

            if (data.success) {
                message.success(
                    data.message ||
                        `Successfully deleted ${selectedRowKeys.length} application(s)`
                );

                const deletedIds = [...selectedRowKeys];

                setApplications((prev) =>
                    prev.filter(
                        (app) =>
                            !deletedIds.includes(app.id)
                    )
                );

                setFilteredApplications((prev) =>
                    prev.filter(
                        (app) =>
                            !deletedIds.includes(app.id)
                    )
                );

                setSelectedRowKeys([]);
                setBulkDeleteVisible(false);
            } else {
                message.error(
                    data.message ||
                        "Bulk delete failed"
                );
            }
        } catch (error) {
            console.error(
                "Bulk delete error:",
                error
            );

            message.error(
                "Error performing bulk delete"
            );
        } finally {
            setBulkDeleteLoading(false);
        }
    };

    // =========================================================
    // UPDATE APPLICATION
    // RESTORED: read_leave_applications.php
    // =========================================================

    const handleResponseSubmit = async (values) => {
        if (!selectedApp?.id) {
            message.error(
                "Application ID is missing"
            );
            return;
        }

        setSubmitting(true);

        try {
            const payload =
                userRole === "admin"
                    ? {
                          id: selectedApp.id,
                          status: values.status,
                          response:
                              values.response || "",
                          response_description:
                              values.response_description ||
                              "",
                          teacher_id:
                              values.teacher_id ||
                              null,
                      }
                    : {
                          id: selectedApp.id,
                          status: values.status,
                          response_description:
                              values.response_description ||
                              "",
                      };

            console.log(
                "Updating application:",
                payload
            );

            // This is the endpoint from your working version.
            const response = await apiFetch(
                "read_leave_applications.php",
                {
                    method: "POST",
                    body: JSON.stringify(payload),
                }
            );

            if (response.status === 401) {
                navigate(
                    userRole === "admin"
                        ? "/admin/login"
                        : "/teacher/login"
                );
                return;
            }

            if (!response.ok) {
                throw new Error(
                    `HTTP ${response.status}`
                );
            }

            const data = await response.json();

            console.log(
                "Update response:",
                data
            );

            if (data.success) {
                message.success(
                    "Application updated successfully"
                );

                // Update locally immediately
                setApplications((prev) =>
                    prev.map((app) =>
                        app.id === selectedApp.id
                            ? {
                                  ...app,
                                  status:
                                      values.status,
                                  response:
                                      values.response ||
                                      "",
                                  response_discription:
                                      values.response_description ||
                                      "",
                                  response_description:
                                      values.response_description ||
                                      "",
                                  teacher_id:
                                      values.teacher_id ||
                                      app.teacher_id,
                              }
                            : app
                    )
                );

                setFilteredApplications((prev) =>
                    prev.map((app) =>
                        app.id === selectedApp.id
                            ? {
                                  ...app,
                                  status:
                                      values.status,
                                  response:
                                      values.response ||
                                      "",
                                  response_discription:
                                      values.response_description ||
                                      "",
                                  response_description:
                                      values.response_description ||
                                      "",
                                  teacher_id:
                                      values.teacher_id ||
                                      app.teacher_id,
                              }
                            : app
                    )
                );

                setResponseVisible(false);
                setSelectedApp(null);
                form.resetFields();

                // Refresh from backend
                await fetchApplications();
            } else {
                message.error(
                    data.message ||
                        data.error ||
                        "Failed to update application"
                );
            }
        } catch (error) {
            console.error(
                "Submit error:",
                error
            );

            message.error(
                "Error submitting response"
            );
        } finally {
            setSubmitting(false);
        }
    };

    // =========================================================
    // STATUS
    // =========================================================

    const getStatusTag = (status) => {
        const value =
            String(status || "Pending");

        const normalized =
            value.toLowerCase();

        if (normalized === "approved") {
            return (
                <Tag
                    icon={<CheckCircleOutlined />}
                    color="success"
                    style={{
                        borderRadius: 12,
                        padding: "3px 10px",
                        fontWeight: 600,
                    }}
                >
                    Approved
                </Tag>
            );
        }

        if (normalized === "rejected") {
            return (
                <Tag
                    icon={<CloseCircleOutlined />}
                    color="error"
                    style={{
                        borderRadius: 12,
                        padding: "3px 10px",
                        fontWeight: 600,
                    }}
                >
                    Rejected
                </Tag>
            );
        }

        if (normalized === "processing") {
            return (
                <Tag
                    icon={<SyncOutlined />}
                    color="processing"
                    style={{
                        borderRadius: 12,
                        padding: "3px 10px",
                        fontWeight: 600,
                    }}
                >
                    Processing
                </Tag>
            );
        }

        return (
            <Tag
                icon={<ClockCircleOutlined />}
                color="warning"
                style={{
                    borderRadius: 12,
                    padding: "3px 10px",
                    fontWeight: 600,
                }}
            >
                Pending
            </Tag>
        );
    };

    // =========================================================
    // OPEN RESPONSE
    // =========================================================

    const openResponseModal = (record) => {
        setSelectedApp(record);

        form.setFieldsValue({
            status: record.status || "Pending",

            response:
                record.response || "",

            // IMPORTANT:
            // Your old backend uses response_discription
            response_description:
                record.response_discription ||
                record.response_description ||
                "",

            teacher_id:
                record.teacher_id || "",
        });

        setResponseVisible(true);
    };

    // =========================================================
    // TABLE
    // =========================================================

    const columns = [
        {
            title: "Student",
            dataIndex: "student_name",
            key: "student_name",

            render: (name, record) => (
                <Space>
                    <Avatar
                        icon={<UserOutlined />}
                        style={{
                            background:
                                "#0b1b3d",
                            color: "#d4af37",
                            fontWeight: 700,
                        }}
                    />

                    <div>
                        <Text
                            strong
                            style={{
                                display:
                                    "block",
                                color:
                                    "#0f172a",
                            }}
                        >
                            {name ||
                                "Unknown Student"}
                        </Text>

                        <Text
                            style={{
                                fontSize: 11,
                                color:
                                    "#64748b",
                            }}
                        >
                            Section:{" "}
                            {record.section_name ||
                                "N/A"}
                        </Text>
                    </div>
                </Space>
            ),
        },

        {
            title: "Application",
            key: "application",

            render: (_, record) => (
                <div>
                    <Text
                        strong
                        style={{
                            color: "#1e3a8a",
                            display: "block",
                        }}
                    >
                        {record.title ||
                            record.type ||
                            "Student Application"}
                    </Text>

                    {record.type && (
                        <Text
                            type="secondary"
                            style={{
                                fontSize: 11,
                            }}
                        >
                            {record.type}
                        </Text>
                    )}
                </div>
            ),
        },

        {
            title: "Date",
            key: "date",

            render: (_, record) => (
                <Text
                    style={{
                        fontSize: 13,
                        color: "#334155",
                        whiteSpace:
                            "nowrap",
                    }}
                >
                    <CalendarOutlined
                        style={{
                            marginRight: 6,
                            color: "#d4af37",
                        }}
                    />

                    {record.submission_date
                        ? new Date(
                              record.submission_date
                          ).toLocaleDateString()
                        : "N/A"}
                </Text>
            ),
        },

        {
            title: "Status",
            dataIndex: "status",
            key: "status",
            align: "center",

            render: (status) =>
                getStatusTag(status),
        },

        {
            title: "Actions",
            key: "actions",
            align: "center",
            width: 140,

            render: (_, record) => (
                <Space size="small">
                    <Tooltip title="View Application">
                        <Button
                            type="primary"
                            size="small"
                            icon={
                                <EyeOutlined />
                            }
                            onClick={() => {
                                setSelectedApp(
                                    record
                                );
                                setDetailVisible(
                                    true
                                );
                            }}
                            style={{
                                background:
                                    "#0b1b3d",
                                borderRadius: 6,
                            }}
                        />
                    </Tooltip>

                    <Tooltip title="Update Status">
                        <Button
                            type="primary"
                            size="small"
                            icon={
                                <MessageOutlined />
                            }
                            onClick={() =>
                                openResponseModal(
                                    record
                                )
                            }
                            className="apex-btn-gold"
                            disabled={
                                userRole ===
                                    "teacher" &&
                                record.status !==
                                    "Pending"
                            }
                        />
                    </Tooltip>

                    <Popconfirm
                        title="Delete Application"
                        description="Are you sure you want to delete this application?"
                        onConfirm={() =>
                            handleSingleDelete(
                                record.id
                            )
                        }
                        okText="Yes"
                        cancelText="No"
                        okButtonProps={{
                            danger: true,
                        }}
                    >
                        <Tooltip title="Delete">
                            <Button
                                danger
                                size="small"
                                icon={
                                    <DeleteOutlined />
                                }
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
    // ROW SELECTION
    // =========================================================

    const rowSelection = {
        selectedRowKeys,

        onChange: (keys) => {
            setSelectedRowKeys(keys);
        },
    };

    // =========================================================
    // TABS
    // =========================================================

    const tabItems = [
        {
            key: "all",
            label: "All Applications",
        },
        {
            key: "Pending",
            label: "Pending Review",
        },
        {
            key: "Processing",
            label: "Processing",
        },
        {
            key: "Approved",
            label: "Approved",
        },
        {
            key: "Rejected",
            label: "Rejected",
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
                title={
                    <div
                        style={{
                            display: "flex",
                            alignItems:
                                "center",
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
                                    "linear-gradient(135deg, #0b1b3d, #1e3a8a)",
                                color: "#d4af37",
                                display:
                                    "flex",
                                alignItems:
                                    "center",
                                justifyContent:
                                    "center",
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
                                    color:
                                        "#0b1b3d",
                                    fontWeight:
                                        700,
                                }}
                            >
                                Student Leave
                                Applications
                            </Title>

                            <Text
                                style={{
                                    color:
                                        "#64748b",
                                    fontSize: 12,
                                }}
                            >
                                Review, approve,
                                or reject
                                student leave
                                requests
                            </Text>
                        </div>
                    </div>
                }
                extra={
                    <Space wrap>
                        {selectedRowKeys.length >
                            0 && (
                            <Button
                                danger
                                icon={
                                    <DeleteFilled />
                                }
                                onClick={() =>
                                    setBulkDeleteVisible(
                                        true
                                    )
                                }
                            >
                                Delete Selected (
                                {
                                    selectedRowKeys.length
                                }
                                )
                            </Button>
                        )}

                        <Tooltip title="Refresh">
                            <Button
                                type="text"
                                icon={
                                    <ReloadOutlined />
                                }
                                onClick={
                                    fetchApplications
                                }
                                loading={
                                    loading
                                }
                            />
                        </Tooltip>
                    </Space>
                }
            >
                <Tabs
                    activeKey={activeTab}
                    items={tabItems}
                    onChange={
                        handleTabChange
                    }
                    style={{
                        marginBottom: 16,
                    }}
                />

                <Table
                    columns={columns}
                    dataSource={
                        filteredApplications
                    }
                    rowKey="id"
                    rowSelection={
                        rowSelection
                    }
                    loading={loading}
                    locale={{
                        emptyText: (
                            <Empty
                                description="No student applications found"
                                image={
                                    Empty.PRESENTED_IMAGE_SIMPLE
                                }
                            />
                        ),
                    }}
                    scroll={{
                        x: 900,
                    }}
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (
                            total,
                            range
                        ) =>
                            `${range[0]}-${range[1]} of ${total} applications`,
                    }}
                />
            </Card>

            {/* =====================================================
                DETAILS
            ====================================================== */}

            <Modal
                title={
                    <Space>
                        <UserOutlined />
                        Student Application
                        Details
                    </Space>
                }
                open={detailVisible}
                onCancel={() =>
                    setDetailVisible(false)
                }
                footer={[
                    <Button
                        key="close"
                        onClick={() =>
                            setDetailVisible(
                                false
                            )
                        }
                    >
                        Close
                    </Button>,

                    selectedApp &&
                        (userRole ===
                            "admin" ||
                            selectedApp.status ===
                                "Pending") && (
                            <Button
                                key="respond"
                                type="primary"
                                onClick={() => {
                                    setDetailVisible(
                                        false
                                    );
                                    openResponseModal(
                                        selectedApp
                                    );
                                }}
                            >
                                Update Status
                            </Button>
                        ),
                ]}
                width={700}
                centered
            >
                {selectedApp && (
                    <>
                        <Descriptions
                            bordered
                            column={1}
                            size="small"
                        >
                            <Descriptions.Item label="Student">
                                <Text strong>
                                    {
                                        selectedApp.student_name
                                    }
                                </Text>
                            </Descriptions.Item>

                            <Descriptions.Item label="Section">
                                {selectedApp.section_name ||
                                    "N/A"}
                            </Descriptions.Item>

                            <Descriptions.Item label="Type">
                                {selectedApp.type ||
                                    "N/A"}
                            </Descriptions.Item>

                            <Descriptions.Item label="Title">
                                {selectedApp.title ||
                                    "N/A"}
                            </Descriptions.Item>

                            <Descriptions.Item label="Submission Date">
                                <Space>
                                    <CalendarOutlined />
                                    {selectedApp.submission_date
                                        ? new Date(
                                              selectedApp.submission_date
                                          ).toLocaleDateString()
                                        : "N/A"}
                                </Space>
                            </Descriptions.Item>

                            <Descriptions.Item label="Status">
                                {getStatusTag(
                                    selectedApp.status
                                )}
                            </Descriptions.Item>

                            <Descriptions.Item label="Description">
                                {selectedApp.description ||
                                    "No description provided."}
                            </Descriptions.Item>
                        </Descriptions>

                        {(selectedApp.response ||
                            selectedApp.response_discription) && (
                            <div
                                style={{
                                    marginTop: 16,
                                    padding: 16,
                                    background:
                                        "#f8fafc",
                                    borderRadius: 8,
                                }}
                            >
                                <Text strong>
                                    Response
                                </Text>

                                {selectedApp.response && (
                                    <p>
                                        {
                                            selectedApp.response
                                        }
                                    </p>
                                )}

                                {selectedApp.response_discription && (
                                    <p>
                                        {
                                            selectedApp.response_discription
                                        }
                                    </p>
                                )}
                            </div>
                        )}
                    </>
                )}
            </Modal>

            {/* =====================================================
                RESPONSE
            ====================================================== */}

            <Modal
                title="Update Application Status"
                open={responseVisible}
                onCancel={() => {
                    setResponseVisible(
                        false
                    );
                    form.resetFields();
                }}
                footer={null}
                width={550}
                centered
                destroyOnClose
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={
                        handleResponseSubmit
                    }
                >
                    <Form.Item
                        name="status"
                        label="Decision Status"
                        rules={[
                            {
                                required: true,
                                message:
                                    "Please select a status",
                            },
                        ]}
                    >
                        <Select
                            options={[
                                {
                                    value: "Approved",
                                    label: "Approved",
                                },
                                {
                                    value: "Rejected",
                                    label: "Rejected",
                                },
                                {
                                    value: "Processing",
                                    label: "Processing",
                                },
                                {
                                    value: "Pending",
                                    label: "Pending",
                                },
                            ]}
                        />
                    </Form.Item>

                    {userRole === "admin" && (
                        <>
                            <Form.Item
                                name="teacher_id"
                                label="Assign Teacher (Optional)"
                            >
                                <Input
                                    placeholder="Teacher ID"
                                    prefix={
                                        <UserOutlined />
                                    }
                                />
                            </Form.Item>

                            <Form.Item
                                name="response"
                                label="Response Title"
                            >
                                <Input placeholder="Brief response title" />
                            </Form.Item>
                        </>
                    )}

                    <Form.Item
                        name="response_description"
                        label={
                            userRole ===
                            "teacher"
                                ? "Review Comments"
                                : "Response Details"
                        }
                        rules={[
                            {
                                required: true,
                                message:
                                    "Please enter response details",
                            },
                        ]}
                    >
                        <TextArea
                            rows={4}
                            showCount
                            maxLength={500}
                            placeholder="Enter your response..."
                        />
                    </Form.Item>

                    <Button
                        type="primary"
                        htmlType="submit"
                        block
                        loading={submitting}
                        icon={
                            <CheckCircleOutlined />
                        }
                    >
                        Submit Decision
                    </Button>
                </Form>
            </Modal>

            {/* =====================================================
                BULK DELETE
            ====================================================== */}

            <Modal
                title="Confirm Bulk Deletion"
                open={bulkDeleteVisible}
                onOk={confirmBulkDelete}
                onCancel={() =>
                    setBulkDeleteVisible(false)
                }
                okText="Yes, Delete All"
                cancelText="Cancel"
                okButtonProps={{
                    danger: true,
                    loading:
                        bulkDeleteLoading,
                }}
                centered
            >
                <p>
                    Are you sure you want to
                    delete{" "}
                    <strong>
                        {
                            selectedRowKeys.length
                        }
                    </strong>{" "}
                    selected application(s)?
                </p>

                <p
                    style={{
                        color: "#ff4d4f",
                    }}
                >
                    This action cannot be
                    undone.
                </p>
            </Modal>
        </div>
    );
};

export default StudentApplications;