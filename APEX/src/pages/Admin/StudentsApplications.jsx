import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Table, 
  Card, 
  Tag, 
  Spin, 
  message, 
  Modal, 
  Form, 
  Input, 
  Button, 
  Select, 
  Descriptions,
  Space,
  Typography,
  Row,
  Col,
  Badge,
  Divider,
  Tooltip,
  Tabs,
  Popconfirm,
  Empty
} from 'antd';
import {
  EyeOutlined,
  MessageOutlined,
  UserOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  SyncOutlined,
  ClockCircleOutlined,
  TeamOutlined,
  SolutionOutlined,
  DeleteOutlined,
  DeleteFilled
} from '@ant-design/icons';

const { Option } = Select;
const { TextArea } = Input;
const { Text, Title } = Typography;
const { TabPane } = Tabs;

const StudentApplications = () => {
    const [applications, setApplications] = useState([]);
    const [filteredApplications, setFilteredApplications] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [selectedApp, setSelectedApp] = useState(null);
    const [detailVisible, setDetailVisible] = useState(false);
    const [responseVisible, setResponseVisible] = useState(false);
    const [activeTab, setActiveTab] = useState('all');
    const [userRole, setUserRole] = useState('admin');
    const [form] = Form.useForm();
    const navigate = useNavigate();

    // State for bulk selection and deletion
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [isBulkDeleteModalVisible, setIsBulkDeleteModalVisible] = useState(false);
    const [bulkDeleteLoading, setBulkDeleteLoading] = useState(false);

    // API Base URL
    const API_BASE = 'https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/';

    // Create axios-like fetch wrapper
    const apiFetch = async (endpoint, options = {}) => {
        const response = await fetch(`${API_BASE}${endpoint}`, {
            ...options,
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            }
        });
        return response;
    };

    // Determine user role (admin or teacher)
    useEffect(() => {
        const checkUserRole = async () => {
            try {
                const response = await apiFetch('read_leave_applications.php');
                
                if (response.status === 200) {
                    setUserRole('teacher');
                } else {
                    setUserRole('admin');
                }
            } catch (error) {
                console.error("Error checking user role:", error);
                setUserRole('admin');
            }
        };
        
        checkUserRole();
    }, []);

    const fetchApplications = async () => {
        setLoading(true);
        try {
            const endpoint = userRole === 'admin' 
                ? 'AdminApplications.php'
                : 'read_leave_applications.php';
            
            const response = await apiFetch(endpoint);

            if (response.status === 401) {
                navigate(userRole === 'admin' ? '/admin/login' : '/teacher/login');
                return;
            }

            const data = await response.json();
            
            let applicationsData = [];
            
            if (userRole === 'admin') {
                if (data.success && Array.isArray(data.data)) {
                    applicationsData = data.data;
                }
            } else {
                if (Array.isArray(data)) {
                    applicationsData = data;
                } else if (data.data && Array.isArray(data.data)) {
                    applicationsData = data.data;
                }
            }

            const validApplications = applicationsData.filter(app => 
                app && (app.student_name !== null && app.student_name !== undefined)
            );

            setApplications(validApplications);
            setFilteredApplications(validApplications);
            setSelectedRowKeys([]);
            
            if (validApplications.length === 0) {
                message.info(userRole === 'admin' 
                    ? "No applications found" 
                    : "No applications found for your students"
                );
            }
            
        } catch (error) {
            console.error("Fetch error:", error);
            message.error("Network error while fetching applications");
            setApplications([]);
            setFilteredApplications([]);
        } finally {
            setLoading(false);
        }
    };

    // Handle single delete
    const handleDelete = async (id) => {
        try {
            const response = await apiFetch(`delete_applications.php?id=${id}`, {
                method: 'DELETE'
            });

            const data = await response.json();
            
            if (data.success) {
                message.success(data.message || 'Application deleted successfully');
                
                // Remove from local state
                setApplications(prev => prev.filter(app => app.id !== id));
                setFilteredApplications(prev => prev.filter(app => app.id !== id));
                setSelectedRowKeys(prev => prev.filter(key => key !== id));
            } else {
                message.error(data.message || 'Delete failed');
            }
        } catch (error) {
            message.error('Error deleting application');
            console.error('Delete error:', error);
        }
    };

    // Handle bulk delete
    const handleBulkDelete = () => {
        if (selectedRowKeys.length === 0) {
            message.warning('Please select at least one application to delete');
            return;
        }
        setIsBulkDeleteModalVisible(true);
    };

    const confirmBulkDelete = async () => {
        try {
            setBulkDeleteLoading(true);
            setIsBulkDeleteModalVisible(false);
            
            const idsParam = selectedRowKeys.join(',');
            const response = await apiFetch(`delete_applications.php?ids=${idsParam}`, {
                method: 'DELETE'
            });

            const data = await response.json();
            
            if (data.success) {
                message.success(data.message);
                
                // Remove selected applications from local state
                setApplications(prev => prev.filter(app => !selectedRowKeys.includes(app.id)));
                setFilteredApplications(prev => prev.filter(app => !selectedRowKeys.includes(app.id)));
                setSelectedRowKeys([]);
            } else {
                message.error(data.message || 'Bulk delete failed');
            }
        } catch (error) {
            message.error('Error performing bulk delete');
            console.error('Bulk delete error:', error);
        } finally {
            setBulkDeleteLoading(false);
        }
    };

    const handleResponseSubmit = async (values) => {
        setSubmitting(true);
        try {
            let payload = {};
            const endpoint = 'read_leave_applications.php';
            
            if (userRole === 'admin') {
                payload = {
                    id: selectedApp.id,
                    status: values.status,
                    response: values.response || '',
                    response_description: values.response_description || '',
                    teacher_id: values.teacher_id || null
                };
            } else {
                payload = {
                    id: selectedApp.id,
                    status: values.status,
                    response_description: values.response_description || ''
                };
            }

            const response = await apiFetch(endpoint, {
                method: 'POST',
                body: JSON.stringify(payload)
            });

            if (response.status === 401) {
                navigate(userRole === 'admin' ? '/admin/login' : '/teacher/login');
                return;
            }

            const data = await response.json();
            
            if (data.success) {
                message.success("Application updated successfully");
                
                setApplications(prev => prev.map(app => 
                    app.id === selectedApp.id ? { ...app, ...data.data } : app
                ));
                setFilteredApplications(prev => prev.map(app => 
                    app.id === selectedApp.id ? { ...app, ...data.data } : app
                ));
                
                setResponseVisible(false);
                form.resetFields();
            } else {
                message.error(data.message || data.error || "Failed to update application");
            }
        } catch (error) {
            message.error("Error submitting response");
            console.error("Submit error:", error);
        } finally {
            setSubmitting(false);
        }
    };

    const handleTabChange = (key) => {
        setActiveTab(key);
        if (key === 'all') {
            setFilteredApplications(applications);
        } else {
            setFilteredApplications(applications.filter(app => app.status === key));
        }
        setSelectedRowKeys([]);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Approved': return 'green';
            case 'Rejected': return 'red';
            case 'Processing': return 'blue';
            case 'Pending': return 'orange';
            default: return 'default';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Approved': return <CheckCircleOutlined />;
            case 'Rejected': return <CloseCircleOutlined />;
            case 'Processing': return <SyncOutlined spin />;
            case 'Pending': return <ClockCircleOutlined />;
            default: return null;
        }
    };

    useEffect(() => {
        fetchApplications();
    }, [userRole]);

    // Row selection configuration
    const rowSelection = {
        selectedRowKeys,
        onChange: (selectedKeys) => {
            setSelectedRowKeys(selectedKeys);
        },
        selections: [
            Table.SELECTION_ALL,
            Table.SELECTION_INVERT,
            Table.SELECTION_NONE,
        ],
    };

    const columns = [
        {
            title: 'Student',
            dataIndex: 'student_name',
            key: 'student_name',
            fixed: 'left',
            width: 150,
            render: (text, record) => (
                <Button 
                    type="link" 
                    onClick={() => {
                        setSelectedApp(record);
                        setDetailVisible(true);
                    }}
                    style={{ padding: 0, fontWeight: 500 }}
                >
                    <UserOutlined style={{ marginRight: 8 }} />
                    {text}
                </Button>
            )
        },
        {
            title: 'Section',
            dataIndex: 'section_name',
            key: 'section_name',
            width: 120,
            responsive: ['md'],
        },
        {
            title: 'Type',
            dataIndex: 'type',
            key: 'type',
            width: 120,
            responsive: ['md'],
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            width: 120,
            render: (status) => (
                <Badge 
                    color={getStatusColor(status)} 
                    text={status || 'Pending'} 
                    style={{ fontWeight: 500 }}
                />
            )
        },
        {
            title: 'Submission Date',
            dataIndex: 'submission_date',
            key: 'submission_date',
            width: 140,
            responsive: ['lg'],
            render: (date) => date ? new Date(date).toLocaleDateString() : 'N/A'
        },
        {
            title: 'Actions',
            key: 'actions',
            width: 140,
            fixed: 'right',
            render: (_, record) => (
                <Space>
                    <Tooltip title="View Details">
                        <Button 
                            icon={<EyeOutlined />} 
                            onClick={() => {
                                setSelectedApp(record);
                                setDetailVisible(true);
                            }}
                        />
                    </Tooltip>
                    <Tooltip title="Respond">
                        <Button 
                            type="primary" 
                            icon={<MessageOutlined />}
                            onClick={() => {
                                setSelectedApp(record);
                                form.setFieldsValue({
                                    status: record.status || 'Pending',
                                    response: record.response || '',
                                    response_description: record.response_discription || '',
                                    teacher_id: record.teacher_id || ''
                                });
                                setResponseVisible(true);
                            }}
                            disabled={userRole === 'teacher' && record.status !== 'Pending'}
                        >
                            {userRole === 'teacher' ? 'Review' : 'Respond'}
                        </Button>
                    </Tooltip>
                    <Popconfirm
                        title="Are you sure to delete this application?"
                        onConfirm={() => handleDelete(record.id)}
                        okText="Yes"
                        cancelText="No"
                        placement="left"
                    >
                        <Button
                            danger
                            icon={<DeleteOutlined />}
                            size="middle"
                        />
                    </Popconfirm>
                </Space>
            )
        }
    ];

    return (
        <div style={{ padding: '16px', background: '#f0f2f5', minHeight: '100vh' }}>
            <Card 
                title={
                    <Space>
                        {userRole === 'admin' ? (
                            <SolutionOutlined style={{ fontSize: '24px' }} />
                        ) : (
                            <TeamOutlined style={{ fontSize: '24px' }} />
                        )}
                        <Title level={4} style={{ margin: 0 }}>
                            {userRole === 'admin' ? 'Student Applications Management' : 'My Students Applications'}
                        </Title>
                        <Badge count={filteredApplications.length} showZero />
                    </Space>
                } 
                bordered={false}
                style={{ 
                    margin: '16px', 
                    borderRadius: '8px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}
                extra={
                    <Space>
                        {selectedRowKeys.length > 0 && (
                            <Button 
                                danger
                                icon={<DeleteFilled />}
                                onClick={handleBulkDelete}
                                loading={bulkDeleteLoading}
                            >
                                Delete Selected ({selectedRowKeys.length})
                            </Button>
                        )}
                        <Button 
                            icon={<SyncOutlined />} 
                            onClick={fetchApplications}
                            loading={loading}
                        >
                            Refresh
                        </Button>
                    </Space>
                }
            >
                {selectedRowKeys.length > 0 && (
                    <div style={{ marginBottom: 16, padding: '8px 12px', background: '#e6f7ff', borderRadius: 4 }}>
                        <Text>
                            Selected <strong>{selectedRowKeys.length}</strong> application(s)
                        </Text>
                    </div>
                )}

                <Tabs 
                    activeKey={activeTab} 
                    onChange={handleTabChange}
                    style={{ marginBottom: '16px' }}
                >
                    <TabPane tab="All Applications" key="all" />
                    <TabPane 
                        tab={
                            <span>
                                <ClockCircleOutlined />
                                Pending
                            </span>
                        } 
                        key="Pending" 
                    />
                    <TabPane 
                        tab={
                            <span>
                                <SyncOutlined />
                                Processing
                            </span>
                        } 
                        key="Processing" 
                    />
                    <TabPane 
                        tab={
                            <span>
                                <CheckCircleOutlined />
                                Approved
                            </span>
                        } 
                        key="Approved" 
                    />
                    <TabPane 
                        tab={
                            <span>
                                <CloseCircleOutlined />
                                Rejected
                            </span>
                        } 
                        key="Rejected" 
                    />
                </Tabs>

                <Spin spinning={loading} tip="Loading applications...">
                    <Table 
                        columns={columns} 
                        dataSource={filteredApplications} 
                        rowKey="id"
                        rowSelection={rowSelection}
                        bordered
                        pagination={{ 
                            pageSize: 10, 
                            showSizeChanger: true,
                            showQuickJumper: true,
                            showTotal: (total, range) => 
                                `${range[0]}-${range[1]} of ${total} applications`
                        }}
                        scroll={{ x: 900 }}
                        size="middle"
                        locale={{
                            emptyText: (
                                <Empty
                                    description="No student applications found"
                                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                                />
                            )
                        }}
                    />
                </Spin>

                {/* Bulk Delete Confirmation Modal */}
                <Modal
                    title="Confirm Bulk Delete"
                    open={isBulkDeleteModalVisible}
                    onOk={confirmBulkDelete}
                    onCancel={() => setIsBulkDeleteModalVisible(false)}
                    okText="Yes, Delete All"
                    cancelText="Cancel"
                    okButtonProps={{ danger: true, loading: bulkDeleteLoading }}
                >
                    <p>
                        Are you sure you want to delete <strong>{selectedRowKeys.length}</strong> selected application(s)?
                    </p>
                    <p style={{ color: '#ff4d4f' }}>
                        This action cannot be undone.
                    </p>
                    <div style={{ marginTop: 16, maxHeight: 200, overflowY: 'auto' }}>
                        {applications
                            .filter(app => selectedRowKeys.includes(app.id))
                            .map(app => (
                                <div key={app.id} style={{ padding: '4px 0', borderBottom: '1px solid #f0f0f0' }}>
                                    <Text>
                                        {app.student_name} - {app.type} ({app.status || 'Pending'})
                                    </Text>
                                </div>
                            ))
                        }
                    </div>
                </Modal>

                {/* Application Detail Modal */}
                <Modal
                    title={
                        <Space>
                            <UserOutlined />
                            Application Details
                        </Space>
                    }
                    open={detailVisible}
                    onCancel={() => setDetailVisible(false)}
                    footer={[
                        <Button key="close" onClick={() => setDetailVisible(false)}>
                            Close
                        </Button>,
                        userRole === 'admin' || (userRole === 'teacher' && selectedApp?.status === 'Pending') ? (
                            <Button 
                                key="respond" 
                                type="primary" 
                                onClick={() => {
                                    setDetailVisible(false);
                                    form.setFieldsValue({
                                        status: selectedApp?.status || 'Pending',
                                        response: selectedApp?.response || '',
                                        response_description: selectedApp?.response_discription || '',
                                        teacher_id: selectedApp?.teacher_id || ''
                                    });
                                    setResponseVisible(true);
                                }}
                            >
                                {userRole === 'teacher' ? 'Review Application' : 'Respond to Application'}
                            </Button>
                        ) : null
                    ]}
                    width={700}
                    centered
                >
                    {selectedApp && (
                        <div>
                            <Divider orientation="left" orientationMargin="0">
                                Student Information
                            </Divider>
                            <Descriptions bordered column={1} size="small">
                                <Descriptions.Item label="Student Name">
                                    <Text strong>{selectedApp.student_name}</Text>
                                </Descriptions.Item>
                                <Descriptions.Item label="Section">
                                    {selectedApp.section_name || 'N/A'}
                                </Descriptions.Item>
                                <Descriptions.Item label="Application Type">
                                    {selectedApp.type}
                                </Descriptions.Item>
                                {userRole === 'teacher' && selectedApp.teacher_name && (
                                    <Descriptions.Item label="Assigned Teacher">
                                        {selectedApp.teacher_name}
                                    </Descriptions.Item>
                                )}
                            </Descriptions>

                            <Divider orientation="left" orientationMargin="0">
                                Application Details
                            </Divider>
                            <Descriptions bordered column={1} size="small">
                                <Descriptions.Item label="Title">
                                    {selectedApp.title || 'N/A'}
                                </Descriptions.Item>
                                <Descriptions.Item label="Description">
                                    <Text>{selectedApp.description || 'No description provided'}</Text>
                                </Descriptions.Item>
                                <Descriptions.Item label="Submission Date">
                                    <Space>
                                        <CalendarOutlined />
                                        {selectedApp.submission_date ? 
                                            new Date(selectedApp.submission_date).toLocaleDateString() : 'N/A'}
                                    </Space>
                                </Descriptions.Item>
                                <Descriptions.Item label="Status">
                                    <Tag 
                                        color={getStatusColor(selectedApp.status)} 
                                        icon={getStatusIcon(selectedApp.status)}
                                        style={{ fontWeight: 500 }}
                                    >
                                        {selectedApp.status || 'Pending'}
                                    </Tag>
                                </Descriptions.Item>
                            </Descriptions>

                            {(selectedApp.response || selectedApp.response_discription) && (
                                <>
                                    <Divider orientation="left" orientationMargin="0">
                                        Response Details
                                    </Divider>
                                    <Descriptions bordered column={1} size="small">
                                        {selectedApp.response && (
                                            <Descriptions.Item label="Response">
                                                {selectedApp.response}
                                            </Descriptions.Item>
                                        )}
                                        {selectedApp.response_discription && (
                                            <Descriptions.Item label="Response Details">
                                                {selectedApp.response_discription}
                                            </Descriptions.Item>
                                        )}
                                        {selectedApp.processed_by && (
                                            <Descriptions.Item label="Processed By">
                                                Admin ID: {selectedApp.processed_by}
                                            </Descriptions.Item>
                                        )}
                                    </Descriptions>
                                </>
                            )}
                        </div>
                    )}
                </Modal>

                {/* Response Modal */}
                <Modal
                    title={
                        <Space>
                            <MessageOutlined />
                            {userRole === 'teacher' ? 'Review Application' : 'Update Application'}
                            {selectedApp && ` - ${selectedApp.student_name}`}
                        </Space>
                    }
                    open={responseVisible}
                    onCancel={() => {
                        setResponseVisible(false);
                        form.resetFields();
                    }}
                    footer={null}
                    width={600}
                    centered
                    destroyOnClose
                >
                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={handleResponseSubmit}
                    >
                        <Row gutter={16}>
                            <Col xs={24} sm={12}>
                                <Form.Item
                                    name="status"
                                    label="Status"
                                    rules={[{ required: true, message: 'Please select status' }]}
                                >
                                    <Select 
                                        placeholder="Select status"
                                        optionFilterProp="children"
                                    >
                                        <Option value="Approved">
                                            <Tag color="green">Approved</Tag>
                                        </Option>
                                        <Option value="Rejected">
                                            <Tag color="red">Rejected</Tag>
                                        </Option>
                                        <Option value="Processing">
                                            <Tag color="blue">Processing</Tag>
                                        </Option>
                                        <Option value="Pending">
                                            <Tag color="orange">Pending</Tag>
                                        </Option>
                                    </Select>
                                </Form.Item>
                            </Col>
                            {userRole === 'admin' && (
                                <Col xs={24} sm={12}>
                                    <Form.Item
                                        name="teacher_id"
                                        label="Assign Teacher (Optional)"
                                    >
                                        <Input 
                                            placeholder="Teacher ID" 
                                            prefix={<UserOutlined />}
                                        />
                                    </Form.Item>
                                </Col>
                            )}
                        </Row>

                        {userRole === 'admin' && (
                            <Form.Item
                                name="response"
                                label="Response Title"
                            >
                                <Input placeholder="Brief response title" />
                            </Form.Item>
                        )}

                        <Form.Item
                            name="response_description"
                            label={userRole === 'teacher' ? 'Review Comments' : 'Response Details'}
                            rules={[{ required: true, message: 'Please enter response details' }]}
                        >
                            <TextArea 
                                rows={4} 
                                placeholder={userRole === 'teacher' ? 'Please provide your review comments...' : 'Please provide detailed response...'} 
                                showCount 
                                maxLength={500}
                            />
                        </Form.Item>

                        <Form.Item>
                            <Button 
                                type="primary" 
                                htmlType="submit" 
                                block 
                                size="large"
                                loading={submitting}
                                icon={<CheckCircleOutlined />}
                            >
                                {userRole === 'teacher' ? 'Submit Review' : 'Submit Response'}
                            </Button>
                        </Form.Item>
                    </Form>
                </Modal>
            </Card>
        </div>
    );
};

export default StudentApplications;