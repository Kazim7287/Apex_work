import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  Layout,
  Card,
  Typography,
  Row,
  Col,
  Button,
  Modal,
  Input,
  Space,
  message,
  Drawer,
  Table,
  Popconfirm,
  Form
} from 'antd';
import {
  TeamOutlined,
  NotificationOutlined,
  BookOutlined,
  PlusOutlined,
  MenuOutlined,
  EditOutlined,
  DeleteOutlined
} from '@ant-design/icons';
import Sidebar from "./Sidebar";

const { Content } = Layout;
const { Title, Text } = Typography;

const AdminDashboard = () => {
    const [form] = Form.useForm();
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const [mobileSidebarVisible, setMobileSidebarVisible] = useState(false);
    const [isDesktop, setIsDesktop] = useState(window.innerWidth > 992);
    const [exams, setExams] = useState([]);
    const [currentExam, setCurrentExam] = useState(null);
    const [isTableLoading, setIsTableLoading] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            setIsDesktop(window.innerWidth > 992);
            if (window.innerWidth > 992) {
                setMobileSidebarVisible(false);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        fetchExams();
    }, []);

    const fetchExams = async () => {
        setIsTableLoading(true);
        try {
            const response = await fetch('https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/ExamsName.php');
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            
            if (data.status === 'success') {
                const formattedExams = Array.isArray(data.data) ? 
                    data.data.map(exam => ({
                        exam_id: exam.id || exam.exam_id,
                        exam_name: exam.exam_name
                    })) : [];
                setExams(formattedExams);
            } else if (Array.isArray(data)) {
                const formattedExams = data.map(exam => ({
                    exam_id: exam.id || exam.exam_id,
                    exam_name: exam.exam_name
                }));
                setExams(formattedExams);
            } else {
                message.error(data.message || 'Failed to load exams');
            }
        } catch (error) {
            message.error('Failed to connect to the server: ' + error.message);
        } finally {
            setIsTableLoading(false);
        }
    };

    const showModal = (exam = null) => {
        setCurrentExam(exam);
        form.setFieldsValue({
            exam_id: exam?.exam_id || '',
            exam_name: exam?.exam_name || ''
        });
        setIsModalVisible(true);
    };

    const handleCreateExam = async (values) => {
        try {
            const response = await fetch('https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/ExamsName.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    exam_name: values.exam_name
                })
            });

            const data = await response.json();
    
            if (data.status === 'success') {
                message.success(data.message);
                setIsModalVisible(false);
                fetchExams();
            } else {
                message.error(data.message || 'Failed to create exam');
            }
        } catch (error) {
            message.error('Failed to connect to the server: ' + error.message);
        }
    };

    const handleUpdateExam = async (values) => {
        try {
            const response = await fetch('https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/ExamsNameUpdate.php', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id: currentExam.exam_id,
                    exam_name: values.exam_name
                })
            });

            const data = await response.json();
    
            if (data.status === 'success') {
                message.success(data.message);
                setIsModalVisible(false);
                fetchExams();
            } else {
                message.error(data.message || 'Failed to update exam');
            }
        } catch (error) {
            message.error('Failed to connect to the server: ' + error.message);
        }
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            setLoading(true);
            
            if (currentExam) {
                await handleUpdateExam(values);
            } else {
                await handleCreateExam(values);
            }
        } catch (error) {
            message.error('Validation failed: ' + error.message);
        } finally {
            setLoading(false);
        }
    };
    
    const handleDelete = async (examId) => {
        try {
            const response = await fetch(
                `https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/ExamsNameDelete.php?id=${examId}`, 
                {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                }
            );
    
            const data = await response.json();
    
            if (data.status === 'success') {
                message.success(data.message);
                fetchExams();
            } else {
                message.error(data.message || 'Delete failed');
            }
        } catch (error) {
            message.error('Failed to connect to the server: ' + error.message);
        }
    };

    const handleCancel = () => {
        setIsModalVisible(false);
        form.resetFields();
        setCurrentExam(null);
    };

    const columns = [
        {
            title: 'Exam ID',
            dataIndex: 'exam_id',
            key: 'exam_id',
            width: 100,
            sorter: (a, b) => a.exam_id - b.exam_id,
        },
        {
            title: 'Exam Name',
            dataIndex: 'exam_name',
            key: 'exam_name',
            ellipsis: true,
            sorter: (a, b) => a.exam_name.localeCompare(b.exam_name),
        },
        {
            title: 'Actions',
            key: 'actions',
            width: 150,
            render: (_, record) => (
                <Space size="middle">
                    <Button 
                        type="primary" 
                        icon={<EditOutlined />} 
                        onClick={() => showModal(record)}
                        size="small"
                    />
                    <Popconfirm
                        title="Are you sure to delete this exam?"
                        onConfirm={() => handleDelete(record.exam_id)}
                        okText="Yes"
                        cancelText="No"
                        placement="topRight"
                    >
                        <Button 
                            type="primary" 
                            danger 
                            icon={<DeleteOutlined />} 
                            size="small"
                        />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <Layout style={{ minHeight: '100vh', position: 'relative' }}>
            {/* Desktop Sidebar */}
            {isDesktop && <Sidebar />}
            
            {/* Mobile Sidebar Drawer */}
            <Drawer
                placement="left"
                closable={true}
                onClose={() => setMobileSidebarVisible(false)}
                open={mobileSidebarVisible}
                width={200}
                bodyStyle={{ 
                    padding: 0,
                    overflow: 'hidden'
                }}
            >
                <div>
                    <Sidebar />
                </div>
            </Drawer>

            {/* Main Content */}
            <Layout 
                style={{ 
                    marginLeft: isDesktop ? 250 : 0,
                    transition: 'margin 0.2s ease',
                    minHeight: '100vh',
                    backgroundColor: '#f5f7fa'
                }}
            >
                {/* Mobile Header */}
                {!isDesktop && (
                    <div style={{ 
                        display: 'flex',
                        alignItems: 'center',
                        padding: '16px 24px',
                        background: '#fff',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                        position: 'sticky',
                        top: 0,
                        zIndex: 999,
                        borderBottom: '1px solid #f0f0f0'
                    }}>
                        <Button 
                            icon={<MenuOutlined />}
                            onClick={() => setMobileSidebarVisible(true)}
                            style={{ 
                                marginRight: '16px',
                                border: 'none',
                                boxShadow: 'none'
                            }}
                        />
                        <Title level={4} style={{ margin: 0 }}>Admin Dashboard</Title>
                    </div>
                )}

                <Content style={{ 
                    padding: isDesktop ? '24px' : '16px',
                    minHeight: 'calc(100vh - 64px)',
                }}>
                    {/* Dashboard Header */}
                    {isDesktop && (
                        <div style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center',
                            marginBottom: 24
                        }}>
                            <Title level={2} style={{ margin: 0 }}>Admin Dashboard</Title>
                        </div>
                    )}

                    {/* Stats Cards Section */}
                    <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                        <Col xs={24} sm={12} md={8} lg={8}>
                            <Card 
                                hoverable 
                                style={{ 
                                    height: '100%',
                                    borderRadius: 8,
                                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                                    border: 'none'
                                }}
                                bodyStyle={{ 
                                    padding: '20px',
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'center'
                                }}
                            >
                                <Link to="/admin/student-list" style={{ textDecoration: 'none' }}>
                                    <Space 
                                        direction="vertical" 
                                        align="center" 
                                        style={{ 
                                            width: '100%', 
                                            textAlign: 'center'
                                        }}
                                    >
                                        <div style={{
                                            width: 60,
                                            height: 60,
                                            borderRadius: '50%',
                                            backgroundColor: '#e6f7ff',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            marginBottom: 16
                                        }}>
                                            <TeamOutlined style={{ 
                                                fontSize: 28, 
                                                color: '#1890ff' 
                                            }} />
                                        </div>
                                        <Title level={4} style={{ margin: '8px 0', color: '#1890ff' }}>Students</Title>
                                        <Text strong style={{ fontSize: 20, color: '#595959' }}>
                                            {/* {stats.students} */}
                                        </Text>
                                    </Space>
                                </Link>
                            </Card>
                        </Col>

                        <Col xs={24} sm={12} md={8} lg={8}>
                            <Card 
                                hoverable 
                                style={{ 
                                    height: '100%',
                                    borderRadius: 8,
                                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                                    border: 'none'
                                }}
                                bodyStyle={{ 
                                    padding: '20px',
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'center'
                                }}
                            >
                                <Link to="/admin/teacher-list" style={{ textDecoration: 'none' }}>
                                    <Space 
                                        direction="vertical" 
                                        align="center" 
                                        style={{ 
                                            width: '100%', 
                                            textAlign: 'center'
                                        }}
                                    >
                                        <div style={{
                                            width: 60,
                                            height: 60,
                                            borderRadius: '50%',
                                            backgroundColor: '#fff7e6',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            marginBottom: 16
                                        }}>
                                            <NotificationOutlined style={{ 
                                                fontSize: 28, 
                                                color: '#fa8c16' 
                                            }} />
                                        </div>
                                        <Title level={4} style={{ margin: '8px 0', color: '#fa8c16' }}>Announcements</Title>
                                        <Text strong style={{ fontSize: 20, color: '#595959' }}>
                                            {/* {stats.announcements} */}
                                        </Text>
                                    </Space>
                                </Link>
                            </Card>
                        </Col>

                        <Col xs={24} sm={12} md={8} lg={8}>
                            <Card 
                                hoverable 
                                style={{ 
                                    height: '100%',
                                    borderRadius: 8,
                                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                                    border: 'none'
                                }}
                                bodyStyle={{ 
                                    padding: '20px',
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'center'
                                }}
                            >
                                <Link to="/admin/class-list" style={{ textDecoration: 'none' }}>
                                    <Space 
                                        direction="vertical" 
                                        align="center" 
                                        style={{ 
                                            width: '100%', 
                                            textAlign: 'center'
                                        }}
                                    >
                                        <div style={{
                                            width: 60,
                                            height: 60,
                                            borderRadius: '50%',
                                            backgroundColor: '#f6ffed',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            marginBottom: 16
                                        }}>
                                            <BookOutlined style={{ 
                                                fontSize: 28, 
                                                color: '#52c41a' 
                                            }} />
                                        </div>
                                        <Title level={4} style={{ margin: '8px 0', color: '#52c41a' }}>Subjects</Title>
                                        <Text strong style={{ fontSize: 20, color: '#595959' }}>
                                            {/* {stats.classes} */}
                                        </Text>
                                    </Space>
                                </Link>
                            </Card>
                        </Col>
                    </Row>

                    {/* Exams Table Section */}
                    <Card
                        title={<Title level={4} style={{ margin: 0 }}>Exams Management</Title>}
                        style={{
                            borderRadius: 8,
                            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                            border: 'none'
                        }}
                        headStyle={{
                            borderBottom: '1px solid #f0f0f0',
                            padding: '0 16px'
                        }}
                        bodyStyle={{
                            padding: 0
                        }}
                        extra={
                            <Button 
                                type="primary" 
                                icon={<PlusOutlined />} 
                                onClick={() => showModal()}
                                size={isDesktop ? 'middle' : 'small'}
                            >
                                Add New Exam
                            </Button>
                        }
                    >
                        <Table
                            columns={columns}
                            dataSource={exams}
                            rowKey="exam_id"
                            loading={isTableLoading}
                            scroll={{ x: true }}
                            size={isDesktop ? 'middle' : 'small'}
                            pagination={{
                                pageSize: 10,
                                showSizeChanger: true,
                                pageSizeOptions: ['5', '10', '20', '50'],
                                showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} exams`
                            }}
                            style={{
                                borderTop: '1px solid #f0f0f0'
                            }}
                        />
                    </Card>
                </Content>
            </Layout>

            {/* Exam Modal */}
            <Modal
                title={currentExam ? `Edit Exam (ID: ${currentExam?.exam_id})` : 'Add New Exam'}
                open={isModalVisible}
                onOk={handleSubmit}
                onCancel={handleCancel}
                confirmLoading={loading}
                footer={[
                    <Button key="back" onClick={handleCancel}>
                        Cancel
                    </Button>,
                    <Button 
                        key="submit" 
                        type="primary" 
                        loading={loading} 
                        onClick={handleSubmit}
                    >
                        {currentExam ? 'Update Exam' : 'Create Exam'}
                    </Button>,
                ]}
                width={isDesktop ? 500 : '90%'}
                centered
                destroyOnClose
                bodyStyle={{
                    paddingTop: 24
                }}
            >
                <Form form={form} layout="vertical">
                    <Form.Item 
                        name="exam_name" 
                        label="Exam Name"
                        rules={[{ required: true, message: 'Please enter exam name!' }]}
                    >
                        <Input placeholder="Enter exam name" size="large" />
                    </Form.Item>
                </Form>
            </Modal>
        </Layout>
    );
};

export default AdminDashboard;