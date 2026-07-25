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
  Tabs
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
  SolutionOutlined
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

    // Determine user role (admin or teacher)
    useEffect(() => {
        const checkUserRole = async () => {
            try {
                // Try to fetch teacher applications first
                const teacherResponse = await fetch('https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/read_leave_applications.php', {
                    credentials: 'include'
                });
                
                if (teacherResponse.status === 200) {
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
        let apiUrl = userRole === 'admin' 
            ? 'https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/AdminApplications.php'
            : 'https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/read_leave_applications.php';
        
        const response = await fetch(apiUrl, {
            credentials: 'include'
        });

        if (response.status === 401) {
            navigate(userRole === 'admin' ? '/admin/login' : '/teacher/login');
            return;
        }

        const data = await response.json();
        
        let applicationsData = [];
        
        if (userRole === 'admin') {
            // Admin format: {success: true, data: [...]}
            if (data.success && Array.isArray(data.data)) {
                applicationsData = data.data;
            }
        } else {
            // Teacher format: direct array or sometimes {message: ...}
            if (Array.isArray(data)) {
                applicationsData = data;
            } else if (data.data && Array.isArray(data.data)) {
                // Some APIs might wrap array in data property
                applicationsData = data.data;
            }
        }

        // More lenient filtering
        const validApplications = applicationsData.filter(app => 
            app && (app.student_name !== null && app.student_name !== undefined)
        );

        setApplications(validApplications);
        setFilteredApplications(validApplications);
        
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
   const handleResponseSubmit = async (values) => {
    setSubmitting(true);
    try {
        let payload = {};
        let apiUrl = 'https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/read_leave_applications.php'; // Use the same API for both
        
        if (userRole === 'admin') {
            payload = {
                id: selectedApp.id,
                status: values.status,
                response: values.response || '',
                response_description: values.response_description || '',
                teacher_id: values.teacher_id || null
            };
        } else if (userRole === 'teacher') {
            payload = {
                id: selectedApp.id,
                status: values.status,
                response_description: values.response_description || ''
            };
        }

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
            credentials: 'include'
        });

        if (response.status === 401) {
            navigate(userRole === 'admin' ? '/admin/login' : '/teacher/login');
            return;
        }

        const data = await response.json();
        
        if (data.success) {
            message.success("Application updated successfully");
            
            // Update local state with the returned data
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
            width: 120,
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
                    <Button 
                        icon={<SyncOutlined />} 
                        onClick={fetchApplications}
                        loading={loading}
                    >
                        Refresh
                    </Button>
                }
            >
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
                        bordered
                        pagination={{ 
                            pageSize: 10, 
                            showSizeChanger: true,
                            showQuickJumper: true,
                            showTotal: (total, range) => 
                                `${range[0]}-${range[1]} of ${total} applications`
                        }}
                        scroll={{ x: 800 }}
                        size="middle"
                        locale={{
                            emptyText: (
                                <div style={{ padding: '40px 0' }}>
                                    <div style={{ fontSize: '24px', marginBottom: '16px' }}>
                                        📝
                                    </div>
                                    <Text type="secondary">
                                        No student applications found
                                    </Text>
                                </div>
                            )
                        }}
                    />
                </Spin>

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