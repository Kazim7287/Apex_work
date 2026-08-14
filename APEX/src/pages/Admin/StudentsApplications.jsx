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
} from "@ant-design/icons";

const { TextArea } = Input;
const { Text, Title } = Typography;

const API_BASE =
    "https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/";

const StudentApplications = () => {
    const navigate = useNavigate();
    const [form] = Form.useForm();

    // =========================================================
    // STATE
    // =========================================================

    const [applications, setApplications] = useState([]);
    const [filteredApplications, setFilteredApplications] =
        useState([]);

    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const [selectedApp, setSelectedApp] = useState(null);

    const [detailVisible, setDetailVisible] = useState(false);
    const [responseVisible, setResponseVisible] = useState(false);

    const [activeTab, setActiveTab] = useState("all");

    const [userRole, setUserRole] = useState("admin");

    const [selectedRowKeys, setSelectedRowKeys] = useState([]);

    const [bulkDeleteVisible, setBulkDeleteVisible] =
        useState(false);

    const [bulkDeleteLoading, setBulkDeleteLoading] =
        useState(false);

    // =========================================================
    // API HELPER
    // =========================================================

    const apiFetch = async (endpoint, options = {}) => {
        return fetch(`${API_BASE}${endpoint}`, {
            ...options,
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                ...options.headers,
            },
        });
    };

    // =========================================================
    // CHECK USER ROLE
    // =========================================================

    useEffect(() => {
        const checkUserRole = async () => {
            try {
                const response = await apiFetch(
                    "read_leave_applications.php"
                );

                setUserRole(
                    response.status === 200
                        ? "teacher"
                        : "admin"
                );
            } catch {
                setUserRole("admin");
            }
        };

        checkUserRole();
    }, []);

    // =========================================================
    // FETCH APPLICATIONS
    // =========================================================

    const fetchApplications = async () => {
        setLoading(true);

        try {
            const endpoint =
                userRole === "teacher"
                    ? "read_leave_applications.php"
                    : "adRead_leave_applications.php";

            const response = await apiFetch(endpoint);

            if (response.status === 401) {
                message.error(
                    "Session expired. Please sign in again."
                );

                navigate("/admin-signIn");
                return;
            }

            if (!response.ok) {
                throw new Error(
                    "Failed to fetch applications"
                );
            }

            const data = await response.json();

            if (data.status === "success" || data.success) {
                const list = Array.isArray(data.data)
                    ? data.data
                    : [];

                setApplications(list);
                applyFilter(list, activeTab);
            } else {
                setApplications([]);
                setFilteredApplications([]);
            }
        } catch (error) {
            console.error(
                "Error fetching applications:",
                error
            );

            message.error(
                "Failed to load student applications"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchApplications();
    }, [userRole]);

    // =========================================================
    // FILTER APPLICATIONS
    // =========================================================

    const applyFilter = (data, tab) => {
        if (tab === "all") {
            setFilteredApplications(data);
            return;
        }

        const filtered = data.filter(
            (application) =>
                application.status?.toLowerCase() ===
                tab.toLowerCase()
        );

        setFilteredApplications(filtered);
    };

    const handleTabChange = (key) => {
        setActiveTab(key);
        applyFilter(applications, key);
    };

    // =========================================================
    // DELETE SINGLE APPLICATION
    // =========================================================

    const handleSingleDelete = async (id) => {
        try {
            const response = await apiFetch(
                `delete_leave_application.php?id=${id}`,
                {
                    method: "DELETE",
                }
            );

            const data = await response.json();

            if (data.status === "success") {
                message.success(
                    "Application deleted successfully"
                );

                await fetchApplications();
            } else {
                message.error(
                    data.message ||
                        "Failed to delete application"
                );
            }
        } catch (error) {
            console.error(error);

            message.error(
                "Error deleting application"
            );
        }
    };

    // =========================================================
    // BULK DELETE
    // =========================================================

    const handleBulkDelete = () => {
        if (selectedRowKeys.length === 0) {
            message.warning(
                "Select at least one application to delete"
            );

            return;
        }

        setBulkDeleteVisible(true);
    };

    const confirmBulkDelete = async () => {
        setBulkDeleteLoading(true);

        try {
            const response = await apiFetch(
                "bulk_delete_leave_applications.php",
                {
                    method: "POST",
                    body: JSON.stringify({
                        ids: selectedRowKeys,
                    }),
                }
            );

            const data = await response.json();

            if (data.status === "success") {
                message.success(
                    `Successfully deleted ${selectedRowKeys.length} application(s)`
                );

                setSelectedRowKeys([]);
                setBulkDeleteVisible(false);

                await fetchApplications();
            } else {
                message.error(
                    data.message ||
                        "Failed to delete applications"
                );
            }
        } catch (error) {
            console.error(error);

            message.error(
                "Error deleting applications"
            );
        } finally {
            setBulkDeleteLoading(false);
        }
    };

    // =========================================================
    // UPDATE APPLICATION
    // =========================================================

    const handleResponseSubmit = async (values) => {
        if (!selectedApp?.id) {
            return;
        }

        setSubmitting(true);

        try {
            let endpoint;
            let payload;

            if (userRole === "teacher") {
                endpoint =
                    "teacher_update_leave_application.php";

                payload = {
                    id: selectedApp.id,
                    status: values.status,
                    review_comments:
                        values.response_description,
                };
            } else {
                endpoint =
                    "update_leave_application.php";

                payload = {
                    id: selectedApp.id,
                    status: values.status,
                    response: values.response || "",
                    response_description:
                        values.response_description,
                    teacher_id:
                        values.teacher_id ||
                        selectedApp.teacher_id ||
                        "",
                };
            }

            const response = await apiFetch(endpoint, {
                method: "POST",
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (data.status === "success" || data.success) {
                message.success(
                    "Application updated successfully"
                );

                closeResponseModal();

                await fetchApplications();
            } else {
                message.error(
                    data.message ||
                        "Failed to update application"
                );
            }
        } catch (error) {
            console.error(error);

            message.error(
                "Error submitting response"
            );
        } finally {
            setSubmitting(false);
        }
    };

    // =========================================================
    // OPEN RESPONSE MODAL
    // =========================================================

    const openResponseModal = (record) => {
        setSelectedApp(record);

        form.setFieldsValue({
            status: record.status || "Pending",
            response: record.response || "",
            response_description:
                record.response_description ||
                record.review_comments ||
                "",
            teacher_id: record.teacher_id || "",
        });

        setResponseVisible(true);
    };

    const closeResponseModal = () => {
        setResponseVisible(false);
        setSelectedApp(null);
        form.resetFields();
    };

    // =========================================================
    // DETAILS MODAL
    // =========================================================

    const openDetailModal = (record) => {
        setSelectedApp(record);
        setDetailVisible(true);
    };

    const closeDetailModal = () => {
        setDetailVisible(false);
        setSelectedApp(null);
    };

    // =========================================================
    // STATUS TAG
    // =========================================================

    const getStatusTag = (status) => {
        switch (status?.toLowerCase()) {
            case "approved":
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

            case "rejected":
                return (
                    <Tag
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

            case "processing":
                return (
                    <Tag
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

            default:
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
        }
    };

    // =========================================================
    // TABLE COLUMNS
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
                            background: "#0b1b3d",
                            color: "#d4af37",
                            fontWeight: 700,
                        }}
                    />

                    <div>
                        <Text
                            strong
                            style={{
                                display: "block",
                                color: "#0f172a",
                            }}
                        >
                            {name || "Unknown Student"}
                        </Text>

                        <Text
                            style={{
                                fontSize: 11,
                                color: "#64748b",
                            }}
                        >
                            Section:{" "}
                            {record.section_name || "N/A"}
                        </Text>
                    </div>
                </Space>
            ),
        },

        {
            title: "Application",
            dataIndex: "leave_title",
            key: "leave_title",

            render: (title) => (
                <Text
                    strong
                    style={{
                        color: "#1e3a8a",
                    }}
                >
                    {title || "Untitled Application"}
                </Text>
            ),
        },

        {
            title: "Date",
            key: "dates",

            render: (_, record) => (
                <Text
                    style={{
                        fontSize: 13,
                        color: "#334155",
                        whiteSpace: "nowrap",
                    }}
                >
                    <CalendarOutlined
                        style={{
                            marginRight: 6,
                            color: "#d4af37",
                        }}
                    />

                    {record.start_date || "N/A"}{" "}
                    → {record.end_date || "N/A"}
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
                            icon={<EyeOutlined />}
                            onClick={() =>
                                openDetailModal(record)
                            }
                            style={{
                                background: "#0b1b3d",
                                borderRadius: 6,
                            }}
                        />
                    </Tooltip>

                    <Tooltip title="Update Status">
                        <Button
                            type="primary"
                            size="small"
                            icon={<MessageOutlined />}
                            onClick={() =>
                                openResponseModal(record)
                            }
                            className="apex-btn-gold"
                        />
                    </Tooltip>

                    <Popconfirm
                        title="Delete Application"
                        description="Are you sure you want to delete this application?"
                        onConfirm={() =>
                            handleSingleDelete(record.id)
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
    // ROW SELECTION
    // =========================================================

    const rowSelection = {
        selectedRowKeys,

        onChange: (keys) => {
            setSelectedRowKeys(keys);
        },
    };

    // =========================================================
    // TAB ITEMS
    // =========================================================

    const tabItems = [
        {
            key: "all",
            label: "All Applications",
        },
        {
            key: "pending",
            label: "Pending Review",
        },
        {
            key: "approved",
            label: "Approved",
        },
        {
            key: "rejected",
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
                                    "linear-gradient(135deg, #0b1b3d, #1e3a8a)",
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
                                Student Leave Applications
                            </Title>

                            <Text
                                style={{
                                    color: "#64748b",
                                    fontSize: 12,
                                }}
                            >
                                Review, approve, or reject
                                student leave requests
                            </Text>
                        </div>
                    </div>
                }
                extra={
                    <Space wrap>
                        {selectedRowKeys.length > 0 && (
                            <Button
                                danger
                                icon={<DeleteFilled />}
                                onClick={
                                    handleBulkDelete
                                }
                                style={{
                                    borderRadius: 8,
                                }}
                            >
                                Delete Selected (
                                {selectedRowKeys.length})
                            </Button>
                        )}

                        <Tooltip title="Refresh">
                            <Button
                                type="text"
                                icon={<ReloadOutlined />}
                                onClick={
                                    fetchApplications
                                }
                                loading={loading}
                                style={{
                                    borderRadius: 8,
                                }}
                            />
                        </Tooltip>
                    </Space>
                }
            >
                <Tabs
                    activeKey={activeTab}
                    items={tabItems}
                    onChange={handleTabChange}
                    style={{
                        marginBottom: 16,
                    }}
                />

                <Table
                    columns={columns}
                    dataSource={filteredApplications}
                    rowKey="id"
                    rowSelection={rowSelection}
                    loading={loading}
                    scroll={{
                        x: "max-content",
                    }}
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        responsive: true,
                    }}
                />
            </Card>

            {/* =====================================================
                VIEW DETAILS MODAL
            ====================================================== */}

            <Modal
                title="Student Application Details"
                open={detailVisible}
                onCancel={closeDetailModal}
                footer={[
                    <Button
                        key="close"
                        onClick={closeDetailModal}
                        style={{
                            borderRadius: 8,
                        }}
                    >
                        Close
                    </Button>,
                ]}
                width={650}
                centered
            >
                {selectedApp && (
                    <div style={{ paddingTop: 12 }}>
                        <Descriptions
                            bordered
                            column={2}
                            size="small"
                            responsive
                        >
                            <Descriptions.Item label="Student">
                                {selectedApp.student_name ||
                                    "N/A"}
                            </Descriptions.Item>

                            <Descriptions.Item label="Section">
                                {selectedApp.section_name ||
                                    "N/A"}
                            </Descriptions.Item>

                            <Descriptions.Item label="Duration">
                                {selectedApp.start_date ||
                                    "N/A"}{" "}
                                →{" "}
                                {selectedApp.end_date ||
                                    "N/A"}
                            </Descriptions.Item>

                            <Descriptions.Item label="Status">
                                {getStatusTag(
                                    selectedApp.status
                                )}
                            </Descriptions.Item>
                        </Descriptions>

                        <div
                            style={{
                                marginTop: 16,
                                background: "#f8fafc",
                                padding: 16,
                                borderRadius: 8,
                                border: "1px solid #e2e8f0",
                            }}
                        >
                            <Text
                                strong
                                style={{
                                    display: "block",
                                    color: "#0b1b3d",
                                    marginBottom: 8,
                                }}
                            >
                                Reason for Leave
                            </Text>

                            <Text>
                                {selectedApp.leave_description ||
                                    "No description provided."}
                            </Text>
                        </div>
                    </div>
                )}
            </Modal>

            {/* =====================================================
                UPDATE STATUS MODAL
            ====================================================== */}

            <Modal
                title="Update Application Status"
                open={responseVisible}
                onCancel={closeResponseModal}
                footer={null}
                width={550}
                centered
                destroyOnClose
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleResponseSubmit}
                    style={{
                        paddingTop: 12,
                    }}
                >
                    <Form.Item
                        name="status"
                        label={
                            <Text strong>
                                Decision Status
                            </Text>
                        }
                        rules={[
                            {
                                required: true,
                                message:
                                    "Please select a status",
                            },
                        ]}
                    >
                        <Select
                            style={{
                                width: "100%",
                                borderRadius: 8,
                            }}
                            placeholder="Select status"
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

                    <Form.Item
                        name="response_description"
                        label={
                            <Text strong>
                                Review Comments / Notes
                            </Text>
                        }
                        rules={[
                            {
                                required: true,
                                message:
                                    "Please enter review comments",
                            },
                        ]}
                    >
                        <TextArea
                            rows={4}
                            placeholder="Enter decision explanation or instructions"
                            style={{
                                borderRadius: 8,
                            }}
                        />
                    </Form.Item>

                    <Button
                        type="primary"
                        htmlType="submit"
                        loading={submitting}
                        block
                        className="apex-btn-gold"
                        style={{
                            height: 40,
                            marginTop: 8,
                        }}
                    >
                        Submit Decision
                    </Button>
                </Form>
            </Modal>

            {/* =====================================================
                BULK DELETE MODAL
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
                    loading: bulkDeleteLoading,
                }}
                centered
            >
                <p>
                    Are you sure you want to delete{" "}
                    <strong>
                        {selectedRowKeys.length}
                    </strong>{" "}
                    selected application
                    {selectedRowKeys.length !== 1
                        ? "s"
                        : ""}
                    ?
                </p>
            </Modal>
        </div>
    );
};

export default StudentApplications;