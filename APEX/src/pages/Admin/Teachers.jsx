import { useState, useEffect } from "react";
import { 
  Form, 
  Input, 
  Button, 
  Select, 
  message, 
  Modal, 
  Table, 
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
  Tooltip
} from 'antd';
import {
  UserOutlined,
  MailOutlined,
  IdcardOutlined,
  BookOutlined,
  TrophyOutlined,
  SafetyCertificateOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  MenuOutlined,
  TeamOutlined
} from '@ant-design/icons';
import axios from 'axios';

const { Content } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;
const { useBreakpoint } = Grid;

// Set Axios defaults to include credentials
axios.defaults.withCredentials = true;

const Teachers = () => {
    const [teachers, setTeachers] = useState([]);
    const [sections, setSections] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [currentTeacher, setCurrentTeacher] = useState(null);
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [mobileDrawerVisible, setMobileDrawerVisible] = useState(false);
    
    const screens = useBreakpoint();
    const isMobile = !screens.md;
    const isSmallMobile = !screens.sm;

    // Fetch teachers data
    const fetchTeachers = async () => {
        setLoading(true);
        try {
            const response = await axios.get('https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/teach_read.php');
            if (response.data && response.data.success) {
                const formattedTeachers = response.data.data.map(teacher => ({
                    id: teacher.id,
                    name: teacher.teach_name,
                    email: teacher.teach_email,
                    teacher_no: teacher.teach_no,
                    section_id: teacher.teach_sec,
                    section_name: sections.find(sec => sec.id === teacher.teach_sec)?.name || `Section ${teacher.teach_sec}`,
                    designation: teacher.Designation,
                    qualification: teacher.Qaulification
                }));
                setTeachers(formattedTeachers);
            } else {
                message.error('Failed to fetch teachers');
            }
        } catch (error) {
            console.error("Error fetching teachers:", error);
            message.error('An error occurred while fetching teachers');
        } finally {
            setLoading(false);
        }
    };

    // Fetch sections data
    const fetchSections = async () => {
        try {
            const response = await axios.get('https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/Sec_read.php');
            if (response.status === 200) {
                setSections(response.data);
            } else {
                message.error('Failed to fetch sections');
            }
        } catch (error) {
            console.error("Error fetching sections:", error);
            message.error('An error occurred while fetching sections');
        }
    };

    // Add Teacher
    const onFinish = async (values) => {
        setSubmitLoading(true);
        try {
            const payload = {
                teach_name: values.name,
                teach_email: values.email,
                teach_pasword: values.password,
                teach_no: values.teacher_no,
                teach_sec: values.section_id,
                Designation: values.designation,
                Qaulification: values.qualification
            };

            const response = await axios.post('https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/teach_reg.php', payload);
            if (response.data.success) {
                message.success(response.data.message || 'Teacher added successfully!');
                fetchTeachers();
                form.resetFields();
                setMobileDrawerVisible(false);
            } else {
                message.error(response.data.error || 'Failed to add teacher');
            }
        } catch (error) {
            console.error("Error adding teacher:", error);
            message.error('An error occurred while adding the teacher');
        } finally {
            setSubmitLoading(false);
        }
    };

    // Delete Teacher
    const handleDelete = async (id) => {
        try {
            const response = await axios.delete(`https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/teach_delete.php?id=${id}`);
            if (response.data.success) {
                message.success(response.data.message || 'Teacher deleted successfully!');
                setTeachers(prevTeachers => prevTeachers.filter(teacher => teacher.id !== id));
            } else {
                message.error(response.data.error || 'Failed to delete teacher');
            }
        } catch (error) {
            console.error("Error deleting teacher:", error);
            message.error('An error occurred while deleting the teacher');
        }
    };

    // Show Update Modal
    const showUpdateModal = (teacher) => {
        setCurrentTeacher(teacher);
        form.setFieldsValue({
            name: teacher.name,
            email: teacher.email,
            teacher_no: teacher.teacher_no,
            section_id: teacher.section_id,
            designation: teacher.designation,
            qualification: teacher.qualification,
            password: '', // Not available from backend, must be re-entered
        });
        setIsModalVisible(true);
    };

    // Update Teacher
    const handleUpdate = async (values) => {
        setSubmitLoading(true);
        try {
            const payload = {
                id: currentTeacher.id,
                teach_name: values.name,
                teach_email: values.email,
                teach_pasword: values.password,
                teach_no: values.teacher_no,
                teach_sec: values.section_id,
                Designation: values.designation,
                Qaulification: values.qualification
            };

            const response = await axios.post(`https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/teach_update.php?id=${currentTeacher.id}`, payload);

            if (response.data.success) {
                message.success(response.data.message || 'Teacher updated successfully!');
                await fetchTeachers();
            } else {
                message.error(response.data.error || 'Failed to update teacher');
            }
        } catch (error) {
            console.error("Error updating teacher:", error);
            message.error('An error occurred while updating the teacher');
        } finally {
            setSubmitLoading(false);
            setIsModalVisible(false);
            setCurrentTeacher(null);
            form.resetFields();
        }
    };

    useEffect(() => {
        const fetchAll = async () => {
            await fetchSections();
        };
        fetchAll();
    }, []);

    useEffect(() => {
        fetchTeachers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sections]);

    // Table columns configuration
    const columns = [
        {
            title: 'Teacher',
            dataIndex: 'name',
            key: 'name',
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
                            {text}
                        </div>
                        <div style={{ 
                            fontSize: isSmallMobile ? '10px' : '12px',
                            color: '#666'
                        }}>
                            ID: {record.id}
                        </div>
                    </div>
                </div>
            ),
            sorter: (a, b) => a.name.localeCompare(b.name),
        },
        {
            title: 'Contact',
            key: 'contact',
            render: (_, record) => (
                <div>
                    <div style={{ fontSize: isSmallMobile ? '11px' : '13px' }}>
                        <MailOutlined style={{ marginRight: 4, color: '#1890ff' }} />
                        {record.email}
                    </div>
                    <div style={{ fontSize: isSmallMobile ? '11px' : '13px', marginTop: 4 }}>
                        <IdcardOutlined style={{ marginRight: 4, color: '#52c41a' }} />
                        #{record.teacher_no}
                    </div>
                </div>
            ),
            responsive: ['md'],
        },
        {
            title: 'Section',
            dataIndex: 'section_name',
            key: 'section',
            render: (text) => (
                <Tag 
                    icon={<TeamOutlined />} 
                    color="blue"
                    style={{ fontSize: isSmallMobile ? '10px' : '12px' }}
                >
                    {text}
                </Tag>
            ),
            responsive: ['md'],
        },
        {
            title: 'Designation',
            dataIndex: 'designation',
            key: 'designation',
            render: (text) => (
                <Tag 
                    icon={<TrophyOutlined />} 
                    color="purple"
                    style={{ fontSize: isSmallMobile ? '10px' : '12px' }}
                >
                    {text}
                </Tag>
            ),
            responsive: ['lg'],
        },
        {
            title: 'Qualification',
            dataIndex: 'qualification',
            key: 'qualification',
            render: (text) => (
                <Tag 
                    icon={<SafetyCertificateOutlined />} 
                    color="green"
                    style={{ fontSize: isSmallMobile ? '10px' : '12px' }}
                >
                    {text}
                </Tag>
            ),
            responsive: ['lg'],
        },
        {
            title: 'Actions',
            key: 'actions',
            fixed: isMobile ? 'right' : false,
            width: isMobile ? 100 : 120,
            render: (_, record) => (
                <Space size="small">
                    <Tooltip title="Edit">
                        <Button 
                            icon={<EditOutlined />} 
                            size="small"
                            onClick={() => showUpdateModal(record)}
                        />
                    </Tooltip>
                    <Popconfirm
                        title="Delete Teacher"
                        description="Are you sure you want to delete this teacher?"
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

    const AddTeacherForm = () => (
        <Form 
            form={form} 
            layout="vertical" 
            onFinish={onFinish}
            style={{ marginBottom: isMobile ? 0 : '20px' }}
        >
            <Row gutter={[16, 8]}>
                <Col xs={24} sm={12}>
                    <Form.Item 
                        name="name" 
                        label="Name"
                        rules={[{ required: true, message: 'Please input the teacher name!' }]}
                    >
                        <Input 
                            placeholder="Teacher Name" 
                            prefix={<UserOutlined />}
                            size={isSmallMobile ? 'small' : 'middle'}
                        />
                    </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                    <Form.Item 
                        name="email" 
                        label="Email"
                        rules={[{ required: true, message: 'Please input a valid email!', type: 'email' }]}
                    >
                        <Input 
                            placeholder="Teacher Email" 
                            prefix={<MailOutlined />}
                            size={isSmallMobile ? 'small' : 'middle'}
                        />
                    </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                    <Form.Item 
                        name="teacher_no" 
                        label="Teacher Number"
                        rules={[{ required: true, message: 'Please input teacher number!' }]}
                    >
                        <Input 
                            placeholder="Teacher Number" 
                            prefix={<IdcardOutlined />}
                            size={isSmallMobile ? 'small' : 'middle'}
                        />
                    </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                    <Form.Item 
                        name="section_id" 
                        label="Section"
                        rules={[{ required: true, message: 'Please select a section!' }]}
                    >
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
                <Col xs={24} sm={12}>
                    <Form.Item 
                        name="designation" 
                        label="Designation"
                        rules={[{ required: true, message: 'Please input designation!' }]}
                    >
                        <Input 
                            placeholder="Designation" 
                            prefix={<TrophyOutlined />}
                            size={isSmallMobile ? 'small' : 'middle'}
                        />
                    </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                    <Form.Item 
                        name="qualification" 
                        label="Qualification"
                        rules={[{ required: true, message: 'Please input qualification!' }]}
                    >
                        <Input 
                            placeholder="Qualification" 
                            prefix={<BookOutlined />}
                            size={isSmallMobile ? 'small' : 'middle'}
                        />
                    </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                    <Form.Item 
                        name="password" 
                        label="Password"
                        rules={[{ required: true, message: 'Please input a password!' }]}
                    >
                        <Input.Password 
                            placeholder="Password" 
                            prefix={<SafetyCertificateOutlined />}
                            size={isSmallMobile ? 'small' : 'middle'}
                        />
                    </Form.Item>
                </Col>
                <Col xs={24}>
                    <Form.Item>
                        <Button 
                            type="primary" 
                            htmlType="submit" 
                            loading={submitLoading}
                            icon={<PlusOutlined />}
                            size={isSmallMobile ? 'small' : 'middle'}
                            block={isMobile}
                        >
                            Add Teacher
                        </Button>
                    </Form.Item>
                </Col>
            </Row>
        </Form>
    );

    return (
        <Layout style={{ minHeight: '100vh', background: '#f5f7fa' }}>
            <Content style={{ 
                padding: isSmallMobile ? '12px' : (isMobile ? '16px' : '24px'),
                marginLeft: 0
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
                                <TeamOutlined style={{ marginRight: 12, color: '#1890ff' }} />
                                Teachers Management
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
                                Add Teacher
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
                                Add New Teacher
                            </Button>
                            <Drawer
                                title="Add New Teacher"
                                placement="right"
                                onClose={() => setMobileDrawerVisible(false)}
                                open={mobileDrawerVisible}
                                width={300}
                                bodyStyle={{ padding: 16 }}
                            >
                                <AddTeacherForm />
                            </Drawer>
                        </>
                    ) : (
                        <AddTeacherForm />
                    )}

                    <Divider orientation="left">
                        <Text strong style={{ fontSize: isSmallMobile ? '14px' : '16px' }}>
                            Teachers List ({teachers.length})
                        </Text>
                    </Divider>

                    <Table
                        columns={columns}
                        dataSource={teachers}
                        rowKey="id"
                        loading={loading}
                        pagination={{
                            pageSize: 10,
                            showSizeChanger: false,
                            size: isSmallMobile ? 'small' : 'default',
                            simple: isMobile,
                            showTotal: (total) => `Total ${total} teachers`
                        }}
                        scroll={{ x: isMobile ? 600 : true }}
                        size={isSmallMobile ? 'small' : (isMobile ? 'middle' : 'default')}
                        locale={{ emptyText: 'No teachers found' }}
                    />
                </Card>

                {/* Update Modal */}
                <Modal
                    title={
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar 
                                icon={<UserOutlined />}
                                style={{ 
                                    backgroundColor: '#1890ff',
                                    marginRight: 12
                                }}
                            />
                            <span>Update Teacher</span>
                        </div>
                    }
                    open={isModalVisible}
                    onCancel={() => {
                        setIsModalVisible(false);
                        setCurrentTeacher(null);
                        form.resetFields();
                    }}
                    footer={null}
                    width={isMobile ? '95%' : 600}
                    bodyStyle={{ 
                        padding: isSmallMobile ? '12px' : (isMobile ? '16px' : '24px'),
                        maxHeight: '70vh',
                        overflowY: 'auto'
                    }}
                    centered
                >
                    <Form form={form} layout="vertical" onFinish={handleUpdate}>
                        <Row gutter={[16, 8]}>
                            <Col xs={24} sm={12}>
                                <Form.Item name="name" label="Name" rules={[{ required: true }]}>
                                    <Input 
                                        placeholder="Teacher Name" 
                                        prefix={<UserOutlined />}
                                        size={isSmallMobile ? 'small' : 'middle'}
                                    />
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={12}>
                                <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
                                    <Input 
                                        placeholder="Teacher Email" 
                                        prefix={<MailOutlined />}
                                        size={isSmallMobile ? 'small' : 'middle'}
                                    />
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={12}>
                                <Form.Item name="teacher_no" label="Teacher Number" rules={[{ required: true }]}>
                                    <Input 
                                        placeholder="Teacher Number" 
                                        prefix={<IdcardOutlined />}
                                        size={isSmallMobile ? 'small' : 'middle'}
                                    />
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={12}>
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
                            <Col xs={24} sm={12}>
                                <Form.Item name="designation" label="Designation" rules={[{ required: true }]}>
                                    <Input 
                                        placeholder="Designation" 
                                        prefix={<TrophyOutlined />}
                                        size={isSmallMobile ? 'small' : 'middle'}
                                    />
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={12}>
                                <Form.Item name="qualification" label="Qualification" rules={[{ required: true }]}>
                                    <Input 
                                        placeholder="Qualification" 
                                        prefix={<BookOutlined />}
                                        size={isSmallMobile ? 'small' : 'middle'}
                                    />
                                </Form.Item>
                            </Col>
                            <Col xs={24}>
                                <Form.Item name="password" label="Password" rules={[{ required: true }]}>
                                    <Input.Password 
                                        placeholder="Password" 
                                        prefix={<SafetyCertificateOutlined />}
                                        size={isSmallMobile ? 'small' : 'middle'}
                                    />
                                </Form.Item>
                            </Col>
                            <Col xs={24}>
                                <Form.Item>
                                    <Button 
                                        type="primary" 
                                        htmlType="submit" 
                                        loading={submitLoading}
                                        block
                                        size={isSmallMobile ? 'small' : 'middle'}
                                    >
                                        Update Teacher
                                    </Button>
                                </Form.Item>
                            </Col>
                        </Row>
                    </Form>
                </Modal>
            </Content>
        </Layout>
    );
};

export default Teachers;