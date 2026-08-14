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
  Typography,
  Space,
  Avatar,
  Tag,
  Popconfirm,
  Tooltip,
  Divider
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
  TeamOutlined,
  SearchOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import axios from 'axios';

const { Title, Text } = Typography;
const { Option } = Select;

// Set Axios defaults to include credentials
axios.defaults.withCredentials = true;

const Teachers = () => {
    const [teachers, setTeachers] = useState([]);
    const [filteredTeachers, setFilteredTeachers] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [sections, setSections] = useState([]);
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [isAddModalVisible, setIsAddModalVisible] = useState(false);
    const [currentTeacher, setCurrentTeacher] = useState(null);
    const [form] = Form.useForm();
    const [addForm] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [submitLoading, setSubmitLoading] = useState(false);

    useEffect(() => {
        fetchSections();
    }, []);

    useEffect(() => {
        if (sections.length > 0) {
            fetchTeachers();
        }
    }, [sections]);

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
                    section_name: sections.find(sec => String(sec.id) === String(teacher.teach_sec))?.name || `Section ${teacher.teach_sec}`,
                    designation: teacher.Designation,
                    qualification: teacher.Qaulification
                }));
                setTeachers(formattedTeachers);
                setFilteredTeachers(formattedTeachers);
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

    const fetchSections = async () => {
        try {
            const response = await axios.get('https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/Sec_Read.php');
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

    const handleSearch = (value) => {
        setSearchText(value);
        if (!value.trim()) {
            setFilteredTeachers(teachers);
        } else {
            const query = value.toLowerCase();
            setFilteredTeachers(teachers.filter(t => 
                t.name?.toLowerCase().includes(query) ||
                t.email?.toLowerCase().includes(query) ||
                t.teacher_no?.toLowerCase().includes(query) ||
                t.designation?.toLowerCase().includes(query)
            ));
        }
    };

    const handleAdd = async (values) => {
        setSubmitLoading(true);
        try {
            const payload = {
                teach_name: values.name,
                teach_email: values.email,
                teach_no: values.teacher_no,
                teach_sec: values.section_id,
                Designation: values.designation,
                Qaulification: values.qualification,
                teach_pass: values.password
            };
            const response = await axios.post('https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/teach_reg.php', payload);
            if (response.data && response.data.success) {
                message.success('Teacher added successfully');
                addForm.resetFields();
                setIsAddModalVisible(false);
                fetchTeachers();
            } else {
                message.error(response.data.message || 'Failed to add teacher');
            }
        } catch (error) {
            console.error("Error adding teacher:", error);
            message.error('An error occurred while adding teacher');
        } finally {
            setSubmitLoading(false);
        }
    };

    const handleUpdate = async (values) => {
        setSubmitLoading(true);
        try {
            const payload = {
                id: currentTeacher.id,
                teach_name: values.name,
                teach_email: values.email,
                teach_no: values.teacher_no,
                teach_sec: values.section_id,
                Designation: values.designation,
                Qaulification: values.qualification,
                teach_pass: values.password
            };

            const response = await axios.put('https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/teach_update.php', payload);

            if (response.data && response.data.success) {
                message.success('Teacher updated successfully');
                setIsEditModalVisible(false);
                setCurrentTeacher(null);
                form.resetFields();
                fetchTeachers();
            } else {
                message.error(response.data.message || 'Failed to update teacher');
            }
        } catch (error) {
            console.error("Error updating teacher:", error);
            message.error('An error occurred while updating teacher');
        } finally {
            setSubmitLoading(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            const response = await axios.delete(`https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/teach_del.php?id=${id}`);
            if (response.data && response.data.success) {
                message.success('Teacher deleted successfully');
                fetchTeachers();
            } else {
                message.error(response.data.message || 'Failed to delete teacher');
            }
        } catch (error) {
            console.error("Error deleting teacher:", error);
            message.error('An error occurred while deleting teacher');
        }
    };

    const showEditModal = (teacher) => {
        setCurrentTeacher(teacher);
        form.setFieldsValue({
            name: teacher.name,
            email: teacher.email,
            teacher_no: teacher.teacher_no,
            section_id: teacher.section_id,
            designation: teacher.designation,
            qualification: teacher.qualification,
            password: ''
        });
        setIsEditModalVisible(true);
    };

    const columns = [
        {
            title: 'Teacher',
            dataIndex: 'name',
            key: 'name',
            sorter: (a, b) => a.name.localeCompare(b.name),
            render: (name, record) => (
                <Space>
                    <Avatar style={{ background: 'linear-gradient(135deg, #0b1b3d 0%, #1e3a8a 100%)', color: '#d4af37', fontWeight: 700 }}>
                        {name?.charAt(0)?.toUpperCase() || 'T'}
                    </Avatar>
                    <div>
                        <Text strong style={{ color: '#0f172a', display: 'block', lineHeight: 1.2 }}>{name}</Text>
                        <Text style={{ fontSize: 11, color: '#64748b' }}>#{record.teacher_no}</Text>
                    </div>
                </Space>
            )
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
            render: (email) => (
                <Text style={{ color: '#334155' }}>
                    <MailOutlined style={{ marginRight: 6, color: '#1e3a8a' }} />
                    {email}
                </Text>
            )
        },
        {
            title: 'Section',
            dataIndex: 'section_name',
            key: 'section_name',
            render: (sec) => (
                <Tag icon={<TeamOutlined />} color="gold" style={{ background: '#fefce8', color: '#b8860b', border: '1px solid rgba(212, 175, 55, 0.3)', borderRadius: 12, padding: '2px 10px' }}>
                    {sec}
                </Tag>
            )
        },
        {
            title: 'Designation',
            dataIndex: 'designation',
            key: 'designation',
            responsive: ['md'],
            render: (text) => (
                <Tag color="blue" style={{ borderRadius: 12 }}>
                    {text}
                </Tag>
            )
        },
        {
            title: 'Qualification',
            dataIndex: 'qualification',
            key: 'qualification',
            responsive: ['lg'],
            render: (text) => text || 'N/A'
        },
        {
            title: 'Actions',
            key: 'actions',
            align: 'center',
            width: 140,
            render: (_, record) => (
                <Space size="small">
                    <Tooltip title="Edit Teacher">
                        <Button 
                            type="primary" 
                            icon={<EditOutlined />} 
                            onClick={() => showEditModal(record)}
                            size="small"
                            style={{ borderRadius: 6, background: '#1e3a8a' }}
                        />
                    </Tooltip>
                    <Popconfirm
                        title="Delete Teacher"
                        description="Are you sure you want to delete this teacher?"
                        onConfirm={() => handleDelete(record.id)}
                        okText="Yes, Delete"
                        cancelText="Cancel"
                        okButtonProps={{ danger: true }}
                    >
                        <Tooltip title="Delete Teacher">
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
            )
        }
    ];

    return (
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
            <Card
                className="apex-card"
                title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 38, height: 38, borderRadius: 10, background: 'linear-gradient(135deg, #d4af37 0%, #b8860b 100%)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
                            <TeamOutlined />
                        </div>
                        <div>
                            <Title level={4} style={{ margin: 0, color: '#0b1b3d', fontWeight: 700 }}>
                                Teacher Directory & Faculty Management
                            </Title>
                            <Text style={{ color: '#64748b', fontSize: 12 }}>Manage faculty profiles, section assignments, and credentials</Text>
                        </div>
                    </div>
                }
                extra={
                    <Space wrap>
                        <Input
                            placeholder="Search teacher..."
                            prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
                            value={searchText}
                            onChange={(e) => handleSearch(e.target.value)}
                            allowClear
                            style={{ width: 220, borderRadius: 8 }}
                        />
                        <Button 
                            type="text" 
                            icon={<ReloadOutlined />} 
                            onClick={fetchTeachers}
                            loading={loading}
                            style={{ borderRadius: 8 }}
                        />
                        <Button 
                            type="primary" 
                            icon={<PlusOutlined />} 
                            onClick={() => setIsAddModalVisible(true)}
                            className="apex-btn-gold"
                        >
                            Add New Teacher
                        </Button>
                    </Space>
                }
            >
                <Table
                    columns={columns}
                    dataSource={filteredTeachers}
                    rowKey="id"
                    loading={loading}
                    scroll={{ x: 'max-content' }}
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showTotal: (total) => `Total ${total} teachers`
                    }}
                />
            </Card>

            {/* Add Teacher Modal */}
            <Modal
                title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Avatar style={{ background: '#0b1b3d', color: '#d4af37' }} icon={<PlusOutlined />} />
                        <span>Add New Faculty Member</span>
                    </div>
                }
                open={isAddModalVisible}
                onCancel={() => {
                    setIsAddModalVisible(false);
                    addForm.resetFields();
                }}
                footer={null}
                width={650}
                centered
                destroyOnClose
            >
                <Form form={addForm} layout="vertical" onFinish={handleAdd} style={{ paddingTop: 12 }}>
                    <Row gutter={[16, 8]}>
                        <Col xs={24} sm={12}>
                            <Form.Item name="name" label="Full Name" rules={[{ required: true, message: 'Please enter teacher name' }]}>
                                <Input placeholder="Teacher Name" prefix={<UserOutlined />} style={{ borderRadius: 8 }} />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12}>
                            <Form.Item name="email" label="Email Address" rules={[{ required: true, type: 'email', message: 'Please enter valid email' }]}>
                                <Input placeholder="teacher@apex.edu" prefix={<MailOutlined />} style={{ borderRadius: 8 }} />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12}>
                            <Form.Item name="teacher_no" label="Teacher Reg No." rules={[{ required: true, message: 'Please enter teacher number' }]}>
                                <Input placeholder="T-2026-01" prefix={<IdcardOutlined />} style={{ borderRadius: 8 }} />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12}>
                            <Form.Item name="section_id" label="Assigned Section" rules={[{ required: true, message: 'Please select section' }]}>
                                <Select placeholder="Select Section" style={{ borderRadius: 8 }}>
                                    {sections.map(sec => (
                                        <Option key={sec.id} value={sec.id}>{sec.name}</Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12}>
                            <Form.Item name="designation" label="Designation" rules={[{ required: true, message: 'Please enter designation' }]}>
                                <Input placeholder="Lecturer / Assistant Prof" prefix={<TrophyOutlined />} style={{ borderRadius: 8 }} />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12}>
                            <Form.Item name="qualification" label="Qualification" rules={[{ required: true, message: 'Please enter qualification' }]}>
                                <Input placeholder="M.Sc / Ph.D" prefix={<BookOutlined />} style={{ borderRadius: 8 }} />
                            </Form.Item>
                        </Col>
                        <Col xs={24}>
                            <Form.Item name="password" label="Account Password" rules={[{ required: true, message: 'Please set password' }]}>
                                <Input.Password placeholder="Enter login password" prefix={<SafetyCertificateOutlined />} style={{ borderRadius: 8 }} />
                            </Form.Item>
                        </Col>
                        <Col xs={24}>
                            <Button type="primary" htmlType="submit" loading={submitLoading} block className="apex-btn-gold" style={{ height: 40, marginTop: 8 }}>
                                Register Faculty Member
                            </Button>
                        </Col>
                    </Row>
                </Form>
            </Modal>

            {/* Update Teacher Modal */}
            <Modal
                title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Avatar style={{ background: '#0b1b3d', color: '#d4af37' }} icon={<UserOutlined />} />
                        <span>Update Faculty Information</span>
                    </div>
                }
                open={isEditModalVisible}
                onCancel={() => {
                    setIsEditModalVisible(false);
                    setCurrentTeacher(null);
                    form.resetFields();
                }}
                footer={null}
                width={650}
                centered
                destroyOnClose
            >
                <Form form={form} layout="vertical" onFinish={handleUpdate} style={{ paddingTop: 12 }}>
                    <Row gutter={[16, 8]}>
                        <Col xs={24} sm={12}>
                            <Form.Item name="name" label="Full Name" rules={[{ required: true }]}>
                                <Input placeholder="Teacher Name" prefix={<UserOutlined />} style={{ borderRadius: 8 }} />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12}>
                            <Form.Item name="email" label="Email Address" rules={[{ required: true, type: 'email' }]}>
                                <Input placeholder="Teacher Email" prefix={<MailOutlined />} style={{ borderRadius: 8 }} />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12}>
                            <Form.Item name="teacher_no" label="Teacher Reg No." rules={[{ required: true }]}>
                                <Input placeholder="Teacher Number" prefix={<IdcardOutlined />} style={{ borderRadius: 8 }} />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12}>
                            <Form.Item name="section_id" label="Assigned Section" rules={[{ required: true }]}>
                                <Select placeholder="Select Section" style={{ borderRadius: 8 }}>
                                    {sections.map(sec => (
                                        <Option key={sec.id} value={sec.id}>{sec.name}</Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12}>
                            <Form.Item name="designation" label="Designation" rules={[{ required: true }]}>
                                <Input placeholder="Designation" prefix={<TrophyOutlined />} style={{ borderRadius: 8 }} />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12}>
                            <Form.Item name="qualification" label="Qualification" rules={[{ required: true }]}>
                                <Input placeholder="Qualification" prefix={<BookOutlined />} style={{ borderRadius: 8 }} />
                            </Form.Item>
                        </Col>
                        <Col xs={24}>
                            <Form.Item name="password" label="Update Password (Optional)" rules={[{ required: true, message: 'Password is required for update' }]}>
                                <Input.Password placeholder="Enter new or existing password" prefix={<SafetyCertificateOutlined />} style={{ borderRadius: 8 }} />
                            </Form.Item>
                        </Col>
                        <Col xs={24}>
                            <Button type="primary" htmlType="submit" loading={submitLoading} block className="apex-btn-gold" style={{ height: 40, marginTop: 8 }}>
                                Update Faculty Record
                            </Button>
                        </Col>
                    </Row>
                </Form>
            </Modal>
        </div>
    );
};

export default Teachers;