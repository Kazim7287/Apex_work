import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { 
  Table, 
  Input, 
  Select, 
  message, 
  Spin,
  Card,
  Row,
  Col,
  Layout,
  Typography,
  Button,
  Upload,
  Tag,
  Modal,
  Form,
  Space,
  Popconfirm,
  Grid,
  Drawer,
  Checkbox,
  Result
} from 'antd';
import { 
  SearchOutlined, 
  UploadOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  FilterOutlined,
  PrinterOutlined,
  DeleteFilled
} from '@ant-design/icons';
import PermissionGuard from '../../components/PermissionGuard';
import { usePermissions } from '../../contexts/PermissionContext';

const { Content } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;
const { useBreakpoint } = Grid;

// Main Content Component
const StudentManagementContent = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [importLoading, setImportLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchField, setSearchField] = useState('name');
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0
    });
    const [sortField, setSortField] = useState('id');
    const [sortOrder, setSortOrder] = useState('asc');
    const [sections, setSections] = useState([]);
    const [importErrors, setImportErrors] = useState([]);
    const [isErrorModalVisible, setIsErrorModalVisible] = useState(false);
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [isInsertModalVisible, setIsInsertModalVisible] = useState(false);
    const [currentStudent, setCurrentStudent] = useState(null);
    const [showMobileFilters, setShowMobileFilters] = useState(false);
    const [form] = Form.useForm();
    const [insertForm] = Form.useForm();
    const printRef = useRef(null);

    // State for bulk selection
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [isBulkDeleteModalVisible, setIsBulkDeleteModalVisible] = useState(false);

    // Permissions
    const { hasPermission, isSuperAdmin } = usePermissions();
    const canViewStudents = hasPermission('students_view') || isSuperAdmin;
    const canManageStudents = hasPermission('students_manage') || isSuperAdmin;
    const canDeleteStudents = hasPermission('students_delete') || isSuperAdmin;

    const screens = useBreakpoint();

    // API Base URL
    const API_BASE = 'https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/';

    // Create axios instance WITHOUT credentials
    const api = axios.create({
        baseURL: API_BASE,
        headers: {
            'Content-Type': 'application/json'
        },
        withCredentials: true
    });

    // Fetch sections data - NO CREDENTIALS
    const fetchSections = async () => {
        try {
            const response = await api.get('Sec_Read.php');
            if (Array.isArray(response.data)) {
                setSections(response.data);
            } else if (response.data.success && Array.isArray(response.data.data)) {
                setSections(response.data.data);
            } else {
                throw new Error('Invalid sections data format');
            }
        } catch (error) {
            message.error("Error fetching sections data");
            console.error("Error:", error);
        }
    };

    // Fetch students data - NO CREDENTIALS
    const fetchStudents = async () => {
        if (!canViewStudents) {
            message.error('You do not have permission to view students');
            return;
        }
        
        setLoading(true);
        try {
            const { current, pageSize } = pagination;
            const params = {
                page: current,
                per_page: pageSize,
                search: searchTerm,
                search_field: searchField,
                sort: sortField,
                order: sortOrder
            };
            const response = await api.get('excel_students.php', { params });

            if (response.data.success) {
                setStudents(response.data.data || []);
                setPagination({
                    ...pagination,
                    total: response.data.pagination?.total || 0,
                    totalPages: response.data.pagination?.total_pages || 0
                });
                // Clear selection when data changes
                setSelectedRowKeys([]);
            } else {
                throw new Error(response.data.error || 'Failed to fetch students');
            }
        } catch (error) {
            message.error(error.response?.data?.error || 'Error fetching students');
            console.error('Error:', error);
            setStudents([]);
        } finally {
            setLoading(false);
        }
    };

    // Handle Excel file import - NO CREDENTIALS
    const handleExcelImport = async (file) => {
        if (!canManageStudents) {
            message.error('You do not have permission to import students');
            return false;
        }
        
        setImportLoading(true);
        try {
            const data = await new Promise((resolve, reject) =>{
                const reader = new FileReader();
                reader.onload = (e) => resolve(e.target.result);
                reader.onerror = (e) => reject(e);
                reader.readAsArrayBuffer(file);
            });

            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(firstSheet);
            
            // Create section mapping with multiple variations
            const sectionMap = {};
            sections.forEach(section => {
                const normalizedKey = section.name.trim().toLowerCase();
                sectionMap[normalizedKey] = section.id;
                const variations = [
                    section.name.trim().toLowerCase().replace(/\s+/g, ''),
                    section.name.trim().toLowerCase().replace(/\s+/g, '_'),
                    section.name.trim().toLowerCase().replace('section', '').trim(),
                    section.name.trim().toLowerCase().replace('sec', '').trim()
                ];
                variations.forEach(variation => {
                    if (variation && variation !== normalizedKey) {
                        sectionMap[variation] = section.id;
                    }
                });
            });

            const invalidSections = new Set();
            const invalidRows = [];
            const validationErrors = [];
            
            const importedStudents = jsonData.map((row, index) => {
                const sectionName = row['Section']?.toString()?.trim() || '';
                const normalizedSectionName = sectionName.toLowerCase().trim();
                let sectionId = sectionMap[normalizedSectionName] || 
                               sectionMap[normalizedSectionName.replace(/\s+/g, '')] ||
                               sectionMap[normalizedSectionName.replace(/\s+/g, '_')] ||
                               sectionMap[normalizedSectionName.replace('section', '').trim()] ||
                               sectionMap[normalizedSectionName.replace('sec', '').trim()];
                // Validate required fields
                const missingFields = [];
                if (!row['Name']?.toString()?.trim()) missingFields.push('Name');
                if (!row["Father's Name"]?.toString()?.trim()) missingFields.push("Father's Name");
                if (!row['Class No']?.toString()?.trim()) missingFields.push('Class No');
                if (missingFields.length > 0) {
                    validationErrors.push(`Row ${index + 2}: Missing fields - ${missingFields.join(', ')}`);
                    invalidRows.push(index + 2);
                    return null;
                }
                if (sectionName && !sectionId) {
                    invalidSections.add(sectionName);
                    invalidRows.push(index + 2);
                    validationErrors.push(`Row ${index + 2}: Invalid section - ${sectionName}`);
                    return null;
                }
                return {
                    class_number: row['Class No']?.toString()?.trim() || '',
                    section_id: sectionId,
                    name: row['Name']?.toString()?.trim() || '',
                    father_name: row["Father's Name"]?.toString()?.trim() || '',
                    discipline: row['Discipline']?.toString()?.trim() || '',
                    guardian_contact: row['Guardian Contact']?.toString()?.trim() || '',
                    admission_status: (row['Admission Status']?.toString()?.trim() || 'Pending').replace(/\s+/g, ' ')
                };
            }).filter(student => student !== null);

            const validStudents = importedStudents.filter(student => student.section_id);

            const allErrors = [
                ...Array.from(invalidSections).map(section => `Invalid section: "${section}"`),
                ...validationErrors
            ];

            if (allErrors.length > 0) {
                setImportErrors(allErrors);
                setIsErrorModalVisible(true);
                if (validStudents.length === 0) {
                    message.error('No valid students to import. Please check the errors.');
                    setImportLoading(false);
                    return false;
                }
            }

            if (validStudents.length > 0) {
                const success = await importStudents(validStudents);
                if (success) {
                    await fetchStudents();
                    message.success(`Successfully imported ${validStudents.length} students`);
                }
            } else {
                message.error('No valid students to import');
            }
            
            return false;
        } catch (error) {
            message.error('Error processing Excel file: ' + error.message);
            console.error('Excel import error:', error);
            return false;
        } finally {
            setImportLoading(false);
        }
    };

    // Import students to database - NO CREDENTIALS
    const importStudents = async (studentsData) => {
        try {
            const response = await api.post('Import_students.php', {
                students: studentsData
            });

            if (response.data.success) {
                message.success(response.data.message);
                return true;
            } else {
                throw new Error(response.data.error || 'Import failed');
            }
        } catch (error) {
            message.error(error.response?.data?.error || error.message || 'Error importing students');
            console.error('Import error:', error);
            return false;
        }
    };

    // Handle manual student insertion - NO CREDENTIALS
    const handleInsert = () => {
        if (!canManageStudents) {
            message.error('You do not have permission to add students');
            return;
        }
        insertForm.resetFields();
        setIsInsertModalVisible(true);
    };

    // Submit manual insertion form - NO CREDENTIALS
    const handleInsertSubmit = async () => {
        try {
            const values = await insertForm.validateFields();
            setLoading(true);
            const insertData = {
                Class_No: values.class_number,
                Section_id: values.section_id,
                Name: values.name,
                Fathers_Name: values.father_name,
                Admission_Status: values.admission_status,
                Guardian_Contact: values.guardian_contact,
                Discipline: values.discipline
            };
            const response = await api.post('std_insert.php', insertData);

            if (response.data.success) {
                message.success('Student added successfully');
                setIsInsertModalVisible(false);
                fetchStudents();
            } else {
                throw new Error(response.data.error || 'Insertion failed');
            }
        } catch (error) {
            message.error(error.response?.data?.error || error.message || 'Error adding student');
            console.error('Insert error:', error);
        } finally {
            setLoading(false);
        }
    };

    // Handle student edit - NO CREDENTIALS
    const handleEdit = (student) => {
        if (!canManageStudents) {
            message.error('You do not have permission to edit students');
            return;
        }
        setCurrentStudent(student);
        form.setFieldsValue({
            id: student.id,
            name: student.name,
            father_name: student.father_name,
            class_number: student.class_number,
            section_id: student.section_id,
            discipline: student.discipline,
            guardian_contact: student.guardian_contact,
            admission_status: student.admission_status
        });
        setIsEditModalVisible(true);
    };

    // Handle student update - NO CREDENTIALS
    const handleUpdate = async () => {
        try {
            const values = await form.validateFields();
            setLoading(true);
            const updateData = {
                id: values.id,
                Name: values.name,
                Fathers_Name: values.father_name,
                Class_No: values.class_number,
                Section_id: values.section_id,
                Discipline: values.discipline,
                Guardian_Contact: values.guardian_contact,
                Admission_Status: values.admission_status
            };

            const response = await api.put('student_update.php', updateData);

            if (response.data.success) {
                message.success('Student updated successfully');
                setIsEditModalVisible(false);
                fetchStudents();
            } else {
                throw new Error(response.data.error || 'Update failed');
            }
        } catch (error) {
            message.error(error.response?.data?.error || error.message || 'Error updating student');
            console.error('Update error:', error);
        } finally {
            setLoading(false);
        }
    };

    // Handle single student deletion
    const handleDelete = async (id) => {
        if (!canDeleteStudents) {
            message.error('You do not have permission to delete students');
            return;
        }
        
        try {
            setLoading(true);
            const response = await api.delete(`student_delete.php`, {
                params: { id: id }
            });

            if (response.data.success) {
                message.success(response.data.message);
                fetchStudents();
            } else {
                throw new Error(response.data.error || 'Delete failed');
            }
        } catch (error) {
            message.error(error.response?.data?.error || error.message || 'Error deleting student');
            console.error('Delete error:', error);
        } finally {
            setLoading(false);
        }
    };

    // Handle bulk delete
    const handleBulkDelete = async () => {
        if (!canDeleteStudents) {
            message.error('You do not have permission to delete students');
            return;
        }
        
        if (selectedRowKeys.length === 0) {
            message.warning('Please select at least one student to delete');
            return;
        }

        setIsBulkDeleteModalVisible(true);
    };

    const confirmBulkDelete = async () => {
        try {
            setLoading(true);
            setIsBulkDeleteModalVisible(false);
            
            const response = await api.delete(`student_delete.php`, {
                data: { ids: selectedRowKeys },
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.data.success) {
                message.success(response.data.message);
                setSelectedRowKeys([]);
                fetchStudents();
            } else {
                throw new Error(response.data.error || 'Bulk delete failed');
            }
        } catch (error) {
            message.error(error.response?.data?.error || error.message || 'Error performing bulk delete');
            console.error('Bulk delete error:', error);
        } finally {
            setLoading(false);
        }
    };

    // Validation function for guardian contact (email or phone)
    const validateGuardianContact = (_, value) => {
        if (!value) {
            return Promise.reject(new Error('Please input guardian contact!'));
        }
        
        // Email regex pattern
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        // Phone regex pattern (allows numbers, +, -, and spaces)
        const phonePattern = /^[\d\s+\-()]+$/;
        
        if (emailPattern.test(value) || phonePattern.test(value)) {
            return Promise.resolve();
        }
        
        return Promise.reject(new Error('Please enter a valid email or phone number!'));
    };

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
        getCheckboxProps: (record) => ({
            disabled: !canDeleteStudents,
        }),
    };

    // Responsive table columns configuration
    const getColumns = () => {
        const baseColumns = [
            {
                title: 'ID',
                dataIndex: 'id',
                key: 'id',
                sorter: true,
                width: 60,
                sortOrder: sortField === 'id' && (sortOrder === 'asc' ? 'ascend' : 'descend'),
                responsive: ['sm']
            },
            {
                title: 'Student Name',
                dataIndex: 'name',
                key: 'name',
                sorter: true,
                sortOrder: sortField === 'name' && (sortOrder === 'asc' ? 'ascend' : 'descend'),
                ellipsis: true
            },
            {
                title: "Father's Name",
                dataIndex: 'father_name',
                key: 'father_name',
                sorter: true,
                sortOrder: sortField === 'father_name' && (sortOrder === 'asc' ? 'ascend' : 'descend'),
                responsive: ['md'],
                ellipsis: true
            },
            {
                title: 'Class',
                dataIndex: 'class_number',
                key: 'class_number',
                sorter: true,
                width: 80,
                sortOrder: sortField === 'class_number' && (sortOrder === 'asc' ? 'ascend' : 'descend')
            },
            {
                title: 'Section',
                dataIndex: 'section_name',
                key: 'section_name',
                width: 120,
                render: (section) => <Tag color="blue" style={{ maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{section || 'N/A'}</Tag>,
                sorter: true,
                sortOrder: sortField === 'section_name' && (sortOrder === 'asc' ? 'ascend' : 'descend'),
                responsive: ['sm']
            },
            {
                title: 'Discipline',
                dataIndex: 'discipline',
                key: 'discipline',
                sorter: true,
                sortOrder: sortField === 'discipline' && (sortOrder === 'asc' ? 'ascend' : 'descend'),
                responsive: ['lg'],
                ellipsis: true
            },
            {
                title: 'Guardian Contact',
                dataIndex: 'guardian_contact',
                key: 'guardian_contact',
                sorter: true,
                sortOrder: sortField === 'guardian_contact' && (sortOrder === 'asc' ? 'ascend' : 'descend'),
                responsive: ['lg'],
                render: (contact) => {
                    if (!contact) return 'N/A';
                    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact);
                    return isEmail ? (
                        <a href={`mailto:${contact}`}>{contact}</a>
                    ) : (
                        <a href={`tel:${contact}`}>{contact}</a>
                    );
                }
            },
            {
                title: 'Status',
                dataIndex: 'admission_status',
                key: 'admission_status',
                width: 150,
                render: (status) => {
                    let color = 'default';
                    if (status === 'Half scholershiped') color = 'green';
                    if (status === 'Full scholershiped') color = 'green';
                    if (status === 'Disabled') color = 'blue';
                    if (status === 'Struck Off') color = 'red';
                    if (status === 'Pending') color = 'orange';
                    return <Tag color={color}>{status || 'Pending'}</Tag>;
                },
                sorter: true,
                sortOrder: sortField === 'admission_status' && (sortOrder === 'asc' ? 'ascend' : 'descend')
            },
            {
                title: 'Actions',
                key: 'actions',
                width: 100,
                fixed: screens.xs ? false : 'right',
                render: (_, record) => (
                    <Space size="small" direction={screens.xs ? "vertical" : "horizontal"}>
                        <Button 
                            size="small"
                            type="link" 
                            icon={<EditOutlined />} 
                            onClick={() => handleEdit(record)}
                            disabled={!canManageStudents}
                        />
                        <Popconfirm
                            title="Are you sure to delete this student?"
                            onConfirm={() => handleDelete(record.id)}
                            okText="Yes"
                            cancelText="No"
                            disabled={!canDeleteStudents}
                        >
                            <Button 
                                size="small"
                                type="link" 
                                icon={<DeleteOutlined />} 
                                danger
                                disabled={!canDeleteStudents}
                            />
                        </Popconfirm>
                    </Space>
                ),
            }
        ];
        if (screens.xs) {
            return [
                {
                    title: 'Student Info',
                    key: 'mobileView',
                    render: (_, record) => (
                        <div>
                            <div><strong>{record.name}</strong> (ID: {record.id})</div>
                            <div>Class: {record.class_number} - {record.section_name}</div>
                            <div>Contact: {record.guardian_contact}</div>
                            <div>Status: <Tag color={record.admission_status === 'Rejected' ? 'red' : 'blue'}>{record.admission_status}</Tag></div>
                            <Space size="small" style={{ marginTop: '8px' }}>
                                <Button 
                                    size="small"
                                    type="link" 
                                    icon={<EditOutlined />} 
                                    onClick={() => handleEdit(record)}
                                    disabled={!canManageStudents}
                                />
                                <Popconfirm
                                    title="Are you sure to delete this student?"
                                    onConfirm={() => handleDelete(record.id)}
                                    okText="Yes"
                                    cancelText="No"
                                    disabled={!canDeleteStudents}
                                >
                                    <Button 
                                        size="small"
                                        type="link" 
                                        icon={<DeleteOutlined />} 
                                        danger
                                        disabled={!canDeleteStudents}
                                    />
                                </Popconfirm>
                            </Space>
                        </div>
                    ),
                }
            ];
        }
        return baseColumns;
    };

    // Initial data fetch
    useEffect(() => {
        if (canViewStudents) {
            fetchSections();
        }
    }, [canViewStudents]);

    // Fetch students when filters change
    useEffect(() => {
        if (canViewStudents) {
            fetchStudents();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pagination.current, pagination.pageSize, searchTerm, searchField, sortField, sortOrder, canViewStudents]);

    // Handle table changes (pagination, sorting)
    const handleTableChange = (pagination, filters, sorter) => {
        setSortField(sorter.field || sortField);
        setSortOrder(sorter.order ? (sorter.order === 'ascend' ? 'asc' : 'desc') : sortOrder);
        setPagination({
            ...pagination,
            current: pagination.current,
            pageSize: pagination.pageSize
        });
    };

    // Handle search
    const handleSearch = (value) => {
        setSearchTerm(value);
        setPagination(p => ({ ...p, current: 1 }));
    };

    // Upload props for Excel import
    const uploadProps = {
        beforeUpload: (file) => {
            handleExcelImport(file);
            return false;
        },
        accept: '.xlsx, .xls',
        showUploadList: false,
        disabled: importLoading || !canManageStudents
    };

    // Print students table
    const handlePrint = () => {
        const printContents = printRef.current.innerHTML;
        const win = window.open('', 'Print', 'width=900,height=700');
        win.document.write(`
            <html>
            <head>
                <title>Student List</title>
                <style>
                    body { font-family: Arial, sans-serif; }
                    table { width: 100%; border-collapse: collapse; }
                    th, td { border: 1px solid #888; padding: 8px; text-align: left; }
                    th { background: #f0f0f0; }
                </style>
            </head>
            <body>
                <h2>Student List</h2>
                ${printContents}
            </body>
            </html>
        `);
        win.document.close();
        win.focus();
        setTimeout(() => {
            win.print();
            win.close();
        }, 500);
    };

    // Check if user has permission to view students
    if (!canViewStudents) {
        return (
            <Result
                status="403"
                title="403"
                subTitle="Sorry, you do not have permission to view student records."
                extra={
                    <Button type="primary" onClick={() => window.location.href = '/admin/dashboard'}>
                        Go to Dashboard
                    </Button>
                }
            />
        );
    }

    // Search and filter component
    const renderSearchFilter = () => (
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
            <Col xs={24} sm={8} md={6}>
                <Select
                    style={{ width: '100%' }}
                    value={searchField}
                    onChange={setSearchField}
                    suffixIcon={screens.xs ? <FilterOutlined /> : null}
                >
                    <Option value="id">ID</Option>
                    <Option value="name">Name</Option>
                    <Option value="father_name">Father Name</Option>
                    <Option value="class_number">Class</Option>
                    <Option value="section_name">Section</Option>
                    <Option value="discipline">Discipline</Option>
                    <Option value="guardian_contact">Guardian Contact</Option>
                    <Option value="admission_status">Status</Option>
                </Select>
            </Col>
            <Col xs={24} sm={16} md={18}>
                <Input
                    placeholder={`Search by ${searchField.replace('_', ' ')}`}
                    prefix={<SearchOutlined />}
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    allowClear
                />
            </Col>
        </Row>
    );

    // Print table markup
    const renderPrintableTable = () => (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Student Name</th>
                    <th>Father's Name</th>
                    <th>Class</th>
                    <th>Section</th>
                    <th>Discipline</th>
                    <th>Guardian Contact</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
                {students.map(s => (
                    <tr key={s.id}>
                        <td>{s.id}</td>
                        <td>{s.name}</td>
                        <td>{s.father_name}</td>
                        <td>{s.class_number}</td>
                        <td>{s.section_name}</td>
                        <td>{s.discipline}</td>
                        <td>{s.guardian_contact}</td>
                        <td>{s.admission_status}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Content style={{ padding: screens.xs ? '12px' : '24px' }}>
                <Card
                    title={
                        <Title level={screens.xs ? 4 : 2} style={{ margin: 0 }}>
                            Student Management
                        </Title>
                    }
                    extra={
                        <Space direction={screens.xs ? "vertical" : "horizontal"} style={{ width: screens.xs ? '100%' : 'auto' }}>
                            {selectedRowKeys.length > 0 && canDeleteStudents && (
                                <Button 
                                    danger
                                    icon={<DeleteFilled />}
                                    onClick={handleBulkDelete}
                                    loading={loading}
                                    size={screens.xs ? "small" : "middle"}
                                    block={screens.xs}
                                >
                                    Delete Selected ({selectedRowKeys.length})
                                </Button>
                            )}
                            {canManageStudents && (
                                <Button 
                                    type="primary" 
                                    icon={<PlusOutlined />}
                                    onClick={handleInsert}
                                    loading={loading}
                                    size={screens.xs ? "small" : "middle"}
                                    block={screens.xs}
                                >
                                    {screens.xs ? 'Add' : 'Add Student'}
                                </Button>
                            )}
                            {canManageStudents && (
                                <Upload {...uploadProps}>
                                    <Button 
                                        icon={<UploadOutlined />}
                                        loading={importLoading}
                                        size={screens.xs ? "small" : "middle"}
                                        block={screens.xs}
                                        disabled={!canManageStudents}
                                    >
                                        {screens.xs ? 'Import' : 'Import Excel'}
                                    </Button>
                                </Upload>
                            )}
                            <Button
                                icon={<PrinterOutlined />}
                                onClick={handlePrint}
                                size={screens.xs ? "small" : "middle"}
                                block={screens.xs}
                            >
                                {screens.xs ? 'Print' : 'Print List'}
                            </Button>
                        </Space>
                    }
                    bodyStyle={{ padding: screens.xs ? '12px' : '24px' }}
                >
                    {/* Search */}
                    {renderSearchFilter()}
                    
                    {/* Selected count indicator */}
                    {selectedRowKeys.length > 0 && (
                        <div style={{ marginBottom: 16, padding: '8px 12px', background: '#e6f7ff', borderRadius: 4 }}>
                            <Text>
                                Selected <strong>{selectedRowKeys.length}</strong> student(s)
                            </Text>
                        </div>
                    )}
                    
                    <Spin spinning={loading || importLoading}>
                        <div ref={printRef}>
                            <Table 
                                columns={getColumns()} 
                                dataSource={students} 
                                rowKey="id"
                                rowSelection={canDeleteStudents ? rowSelection : undefined}
                                bordered
                                size={screens.xs ? "small" : "middle"}
                                pagination={{
                                    ...pagination,
                                    showSizeChanger: true,
                                    pageSizeOptions: ['5', '10', '20', '50'],
                                    showTotal: (total) => `Total ${total} students`,
                                    size: screens.xs ? 'small' : 'default'
                                }}
                                onChange={handleTableChange}
                                scroll={{ x: screens.xs ? false : 1000 }}
                                locale={{ emptyText: 'No students found' }}
                            />
                        </div>
                    </Spin>
                </Card>

                {/* Hidden printable markup for print dialog */}
                <div style={{ display: 'none' }}>
                    <div ref={printRef}>{renderPrintableTable()}</div>
                </div>

                {/* Mobile filters drawer */}
                <Drawer
                    title="Search"
                    placement="right"
                    onClose={() => setShowMobileFilters(false)}
                    open={showMobileFilters}
                    width={300}
                >
                    {renderSearchFilter()}
                </Drawer>

                {/* Import Errors Modal */}
                <Modal
                    title="Import Errors"
                    open={isErrorModalVisible}
                    onCancel={() => setIsErrorModalVisible(false)}
                    footer={[
                        <Button key="close" onClick={() => setIsErrorModalVisible(false)}>
                            Close
                        </Button>
                    ]}
                    width={screens.xs ? '90%' : 800}
                >
                    <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                        {importErrors.map((error, index) => (
                            <p key={index} style={{ margin: '8px 0', color: '#ff4d4f' }}>
                                {error}
                            </p>
                        ))}
                    </div>
                </Modal>

                {/* Bulk Delete Confirmation Modal */}
                <Modal
                    title="Confirm Bulk Delete"
                    open={isBulkDeleteModalVisible}
                    onOk={confirmBulkDelete}
                    onCancel={() => setIsBulkDeleteModalVisible(false)}
                    okText="Yes, Delete All"
                    cancelText="Cancel"
                    okButtonProps={{ danger: true, loading: loading }}
                >
                    <p>
                        Are you sure you want to delete <strong>{selectedRowKeys.length}</strong> selected student(s)?
                    </p>
                    <p style={{ color: '#ff4d4f' }}>
                        This action cannot be undone.
                    </p>
                    <div style={{ marginTop: 16, maxHeight: 200, overflowY: 'auto' }}>
                        {students
                            .filter(s => selectedRowKeys.includes(s.id))
                            .map(s => (
                                <div key={s.id} style={{ padding: '4px 0', borderBottom: '1px solid #f0f0f0' }}>
                                    <Text>ID: {s.id} - {s.name}</Text>
                                </div>
                            ))
                        }
                    </div>
                </Modal>

                {/* Edit Student Modal */}
                <Modal
                    title="Edit Student"
                    open={isEditModalVisible}
                    onOk={handleUpdate}
                    onCancel={() => setIsEditModalVisible(false)}
                    confirmLoading={loading}
                    width={screens.xs ? '90%' : 600}
                    bodyStyle={{ maxHeight: '70vh', overflowY: 'auto' }}
                >
                    <Form form={form} layout="vertical">
                        <Form.Item name="id" label="Student ID">
                            <Input disabled />
                        </Form.Item>
                        <Form.Item 
                            name="name" 
                            label="Student Name"
                            rules={[{ required: true, message: 'Please input student name!' }]}
                        >
                            <Input />
                        </Form.Item>
                        <Form.Item 
                            name="father_name" 
                            label="Father's Name"
                            rules={[{ required: true, message: "Please input father's name!" }]}
                        >
                            <Input />
                        </Form.Item>
                        <Row gutter={16}>
                            <Col xs={24} sm={12}>
                                <Form.Item 
                                    name="class_number" 
                                    label="Class Number"
                                    rules={[{ required: true, message: 'Please input class number!' }]}
                                >
                                    <Input />
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={12}>
                                <Form.Item 
                                    name="section_id" 
                                    label="Section"
                                    rules={[{ required: true, message: 'Please select a section!' }]}
                                >
                                    <Select
                                        showSearch
                                        optionFilterProp="children"
                                        filterOption={(input, option) =>
                                            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                        }
                                    >
                                        {sections.map(section => (
                                            <Option key={section.id} value={section.id}>
                                                {section.name}
                                            </Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                            </Col>
                        </Row>
                        <Form.Item 
                            name="discipline" 
                            label="Discipline"
                            rules={[{ required: true, message: 'Please input discipline!' }]}
                        >
                            <Input />
                        </Form.Item>
                        <Form.Item 
                            name="guardian_contact" 
                            label="Guardian Contact"
                            rules={[
                                { validator: validateGuardianContact }
                            ]}
                        >
                            <Input placeholder="Email or phone number" />
                        </Form.Item>
                        <Form.Item 
                            name="admission_status" 
                            label="Admission Status"
                            rules={[{ required: true, message: 'Please select admission status!' }]}
                        >
                            <Select>
                                <Option value="Pending">Pending</Option>
                                <Option value="Full scholershiped">Full Scholershiped</Option>
                                <Option value="Half scholershiped">Half Scholershiped</Option>
                                <Option value="Self">Self</Option>
                                <Option value="Hafiz">Hafiz</Option>
                                <Option value="Disabled">Disabled</Option>
                            </Select>
                        </Form.Item>
                    </Form>
                </Modal>

                {/* Insert Student Modal */}
                <Modal
                    title="Add New Student"
                    open={isInsertModalVisible}
                    onOk={handleInsertSubmit}
                    onCancel={() => setIsInsertModalVisible(false)}
                    confirmLoading={loading}
                    width={screens.xs ? '90%' : 600}
                    bodyStyle={{ maxHeight: '70vh', overflowY: 'auto' }}
                >
                    <Form form={insertForm} layout="vertical">
                        <Form.Item 
                            name="name" 
                            label="Student Name"
                            rules={[{ required: true, message: "Please input student name!" }]}
                        >
                            <Input />
                        </Form.Item>
                        <Form.Item 
                            name="father_name" 
                            label="Father's Name"
                            rules={[{ required: true, message: "Please input father's name!" }]}
                        >
                            <Input />
                        </Form.Item>
                        <Row gutter={16}>
                            <Col xs={24} sm={12}>
                                <Form.Item 
                                    name="class_number" 
                                    label="Class Number"
                                    rules={[{ required: true, message: 'Please input class number!' }]}
                                >
                                    <Input />
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={12}>
                                <Form.Item 
                                    name="section_id" 
                                    label="Section"
                                    rules={[{ required: true, message: 'Please select a section!' }]}
                                >
                                    <Select
                                        showSearch
                                        optionFilterProp="children"
                                        filterOption={(input, option) =>
                                            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                        }
                                    >
                                        {sections.map(section => (
                                            <Option key={section.id} value={section.id}>
                                                {section.name}
                                            </Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                            </Col>
                        </Row>
                        <Form.Item 
                            name="discipline" 
                            label="Discipline"
                            rules={[{ required: true, message: 'Please input discipline!' }]}
                        >
                            <Input />
                        </Form.Item>
                        <Form.Item 
                            name="guardian_contact" 
                            label="Guardian Contact"
                            rules={[
                                { validator: validateGuardianContact }
                            ]}
                        >
                            <Input placeholder="Email or phone number" />
                        </Form.Item>
                        <Form.Item 
                            name="admission_status" 
                            label="Admission Status"
                            rules={[{ required: true, message: 'Please select admission status!' }]}
                        >
                            <Select>
                                <Option value="Pending">Pending</Option>
                                <Option value="Full scholershiped">Full Scholershiped</Option>
                                <Option value="Half scholershiped">Half Scholershiped</Option>
                                <Option value="Self">Self</Option>
                                <Option value="Hafiz">Hafiz</Option>
                                <Option value="Disabled">Disabled</Option>
                            </Select>
                        </Form.Item>
                    </Form>
                </Modal>
            </Content>
        </Layout>
    );
};

// Export with Permission Guard
const StudentManagement = () => {
    return (
        <PermissionGuard requiredPermission="students_view">
            <StudentManagementContent />
        </PermissionGuard>
    );
};

export default StudentManagement;