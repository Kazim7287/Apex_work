import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  Card,
  Typography,
  Row,
  Col,
  Button,
  Modal,
  Input,
  Space,
  message,
  Table,
  Popconfirm,
  Form,
  Tag,
  Tooltip
} from 'antd';
import {
  TeamOutlined,
  NotificationOutlined,
  BookOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  FileTextOutlined,
  SearchOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
  ArrowRightOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;

const AdminDashboard = () => {
    const [form] = Form.useForm();
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const [exams, setExams] = useState([]);
    const [filteredExams, setFilteredExams] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [currentExam, setCurrentExam] = useState(null);
    const [isTableLoading, setIsTableLoading] = useState(false);

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
            
            let formattedExams = [];
            if (data.status === 'success') {
                formattedExams = Array.isArray(data.data) ? 
                    data.data.map(exam => ({
                        exam_id: exam.id || exam.exam_id,
                        exam_name: exam.exam_name
                    })) : [];
            } else if (Array.isArray(data)) {
                formattedExams = data.map(exam => ({
                    exam_id: exam.id || exam.exam_id,
                    exam_name: exam.exam_name
                }));
            } else {
                message.error(data.message || 'Failed to load exams');
            }
            setExams(formattedExams);
            setFilteredExams(formattedExams);
        } catch (error) {
            message.error('Failed to connect to the server: ' + error.message);
        } finally {
            setIsTableLoading(false);
        }
    };

    const handleSearch = (value) => {
        setSearchText(value);
        if (!value.trim()) {
            setFilteredExams(exams);
        } else {
            const query = value.toLowerCase();
            setFilteredExams(exams.filter(e => 
                e.exam_name.toLowerCase().includes(query) || 
                String(e.exam_id).includes(query)
            ));
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
                form.resetFields();
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
                form.resetFields();
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
            width: 120,
            sorter: (a, b) => a.exam_id - b.exam_id,
            render: (id) => (
                <Tag color="navy" style={{ background: '#0b1b3d', color: '#d4af37', border: '1px solid rgba(212, 175, 55, 0.3)', borderRadius: 6, fontWeight: 700 }}>
                    #{id}
                </Tag>
            )
        },
        {
            title: 'Exam Name',
            dataIndex: 'exam_name',
            key: 'exam_name',
            sorter: (a, b) => a.exam_name.localeCompare(b.exam_name),
            render: (text) => (
                <Space>
                    <FileTextOutlined style={{ color: '#1e3a8a' }} />
                    <Text strong style={{ color: '#0f172a', fontSize: 14 }}>{text}</Text>
                </Space>
            )
        },
        {
            title: 'Status',
            key: 'status',
            width: 140,
            render: () => (
                <Tag icon={<CheckCircleOutlined />} color="success" style={{ borderRadius: 12, padding: '2px 10px' }}>
                    Active
                </Tag>
            )
        },
        {
            title: 'Actions',
            key: 'actions',
            width: 160,
            align: 'center',
            render: (_, record) => (
                <Space size="small">
                    <Tooltip title="Edit Exam">
                        <Button 
                            type="primary" 
                            icon={<EditOutlined />} 
                            onClick={() => showModal(record)}
                            size="small"
                            style={{ borderRadius: 6, background: '#1e3a8a' }}
                        />
                    </Tooltip>
                    <Popconfirm
                        title="Delete Exam"
                        description="Are you sure you want to delete this exam?"
                        onConfirm={() => handleDelete(record.exam_id)}
                        okText="Yes, Delete"
                        cancelText="Cancel"
                        okButtonProps={{ danger: true }}
                        placement="topRight"
                    >
                        <Tooltip title="Delete Exam">
                            <Button 
                                type="primary" 
                                danger 
                                icon={<DeleteOutlined />} 
                                size="small"
                                style={{ borderRadius: 6 }}
                            />
                        </Tooltip>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
            {/* Quick Stats Grid */}
            <Row gutter={[20, 20]} style={{ marginBottom: 28 }}>
                {/* Students Stat Card */}
                <Col xs={24} sm={12} lg={8}>
                    <Card 
                        hoverable 
                        className="apex-card apex-card-gold-header"
                        style={{ height: '100%', cursor: 'pointer' }}
                        bodyStyle={{ padding: 24 }}
                    >
                        <Link to="/admin/student-list" style={{ textDecoration: 'none' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div>
                                    <Text style={{ color: '#64748b', fontSize: 13, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                        Student Directory
                                    </Text>
                                    <Title level={3} style={{ margin: '6px 0 0 0', color: '#0b1b3d', fontWeight: 800 }}>
                                        Students Portal
                                    </Title>
                                    <Text style={{ color: '#3b82f6', fontSize: 12, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 8 }}>
                                        Manage Records <ArrowRightOutlined />
                                    </Text>
                                </div>
                                <div className="apex-stat-icon" style={{ background: 'linear-gradient(135deg, #0b1b3d 0%, #1e3a8a 100%)', color: '#d4af37', boxShadow: '0 8px 16px rgba(11, 27, 61, 0.2)' }}>
                                    <TeamOutlined />
                                </div>
                            </div>
                        </Link>
                    </Card>
                </Col>

                {/* Teachers Stat Card */}
                <Col xs={24} sm={12} lg={8}>
                    <Card 
                        hoverable 
                        className="apex-card apex-card-gold-header"
                        style={{ height: '100%', cursor: 'pointer' }}
                        bodyStyle={{ padding: 24 }}
                    >
                        <Link to="/admin/teacher-list" style={{ textDecoration: 'none' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div>
                                    <Text style={{ color: '#64748b', fontSize: 13, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                        Faculty Directory
                                    </Text>
                                    <Title level={3} style={{ margin: '6px 0 0 0', color: '#0b1b3d', fontWeight: 800 }}>
                                        Announcments
                                    </Title>
                                    <Text style={{ color: '#d4af37', fontSize: 12, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 8 }}>
                                        Faculty Management <ArrowRightOutlined />
                                    </Text>
                                </div>
                                <div className="apex-stat-icon" style={{ background: 'linear-gradient(135deg, #d4af37 0%, #b8860b 100%)', color: '#ffffff', boxShadow: '0 8px 16px rgba(212, 175, 55, 0.25)' }}>
                                    <NotificationOutlined />
                                </div>
                            </div>
                        </Link>
                    </Card>
                </Col>

                {/* Classes Stat Card */}
                <Col xs={24} sm={12} lg={8}>
                    <Card 
                        hoverable 
                        className="apex-card apex-card-gold-header"
                        style={{ height: '100%', cursor: 'pointer' }}
                        bodyStyle={{ padding: 24 }}
                    >
                        <Link to="/admin/class-list" style={{ textDecoration: 'none' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div>
                                    <Text style={{ color: '#64748b', fontSize: 13, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                        Academics & Subjects
                                    </Text>
                                    <Title level={3} style={{ margin: '6px 0 0 0', color: '#0b1b3d', fontWeight: 800 }}>
                                        Classes & Subjects
                                    </Title>
                                    <Text style={{ color: '#10b981', fontSize: 12, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 8 }}>
                                        View Curriculum <ArrowRightOutlined />
                                    </Text>
                                </div>
                                <div className="apex-stat-icon" style={{ background: 'linear-gradient(135deg, #10b981 0%, #047857 100%)', color: '#ffffff', boxShadow: '0 8px 16px rgba(16, 185, 129, 0.25)' }}>
                                    <BookOutlined />
                                </div>
                            </div>
                        </Link>
                    </Card>
                </Col>
            </Row>

            {/* Exams Table Section Card */}
            <Card
                className="apex-card"
                title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 0' }}>
                        <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(212, 175, 55, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d4af37', fontSize: 18 }}>
                            <FileTextOutlined />
                        </div>
                        <div>
                            <Title level={4} style={{ margin: 0, color: '#0b1b3d', fontWeight: 700 }}>
                                Exams & Assessment Categories
                            </Title>
                            <Text style={{ color: '#64748b', fontSize: 12 }}>Manage all examination categories and setup schedules</Text>
                        </div>
                    </div>
                }
                extra={
                    <Space wrap>
                        <Input
                            placeholder="Search exam..."
                            prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
                            value={searchText}
                            onChange={(e) => handleSearch(e.target.value)}
                            allowClear
                            style={{ width: 200, borderRadius: 8 }}
                        />
                        <Button 
                            type="text" 
                            icon={<ReloadOutlined />} 
                            onClick={fetchExams}
                            loading={isTableLoading}
                            style={{ borderRadius: 8 }}
                        />
                        <Button 
                            type="primary" 
                            icon={<PlusOutlined />} 
                            onClick={() => showModal()}
                            className="apex-btn-gold"
                            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                        >
                            Create New Exam
                        </Button>
                    </Space>
                }
            >
                <Table
                    columns={columns}
                    dataSource={filteredExams}
                    rowKey="exam_id"
                    loading={isTableLoading}
                    scroll={{ x: 'max-content' }}
                    pagination={{
                        pageSize: 8,
                        showSizeChanger: true,
                        pageSizeOptions: ['8', '15', '30'],
                        showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} exams`
                    }}
                />
            </Card>

            {/* Exam Modal */}
            <Modal
                title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 32, height: 32, borderRadius: 8, background: '#0b1b3d', color: '#d4af37', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {currentExam ? <EditOutlined /> : <PlusOutlined />}
                        </div>
                        <span>{currentExam ? `Edit Exam Category #${currentExam?.exam_id}` : 'Create New Exam Category'}</span>
                    </div>
                }
                open={isModalVisible}
                onOk={handleSubmit}
                onCancel={handleCancel}
                confirmLoading={loading}
                okText={currentExam ? 'Update Exam' : 'Create Exam'}
                cancelText="Cancel"
                okButtonProps={{ className: 'apex-btn-gold' }}
                centered
                destroyOnClose
            >
                <Form form={form} layout="vertical" style={{ paddingTop: 12 }}>
                    <Form.Item 
                        name="exam_name" 
                        label={<Text strong style={{ color: '#0b1b3d' }}>Exam Category Name</Text>}
                        rules={[{ required: true, message: 'Please enter a valid exam name!' }]}
                    >
                        <Input 
                            placeholder="e.g. Mid-Term Examination 2026, Annual Finals" 
                            size="large" 
                            style={{ borderRadius: 8 }}
                        />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default AdminDashboard;