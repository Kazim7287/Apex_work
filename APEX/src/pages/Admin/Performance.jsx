import { useEffect, useState } from "react";
import { Button, Layout, Row, Col, Typography, Table, Modal, Space, message, Card, Spin, Select, Divider, Statistic, Grid } from 'antd';
import Sidebar from "./Sidebar";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { PrinterOutlined, DownloadOutlined, StarFilled, StarOutlined, FilterOutlined } from '@ant-design/icons';
import './Performance.css';
import { useNavigate } from 'react-router-dom';

const { useBreakpoint } = Grid;
const { Content } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;

// Color palette for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const Performance = () => {
    const [sections, setSections] = useState([]);
    const [performances, setPerformances] = useState([]);
    const [selectedSection, setSelectedSection] = useState(null);
    const [selectedSectionName, setSelectedSectionName] = useState('');
    const [columns, setColumns] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [studentDetails, setStudentDetails] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('table'); // 'table' or 'graph'
    const [sortConfig, setSortConfig] = useState({ key: 'total_marks', direction: 'desc' });
    const [filteredSubjects, setFilteredSubjects] = useState([]);
    const navigate = useNavigate();

    const screens = useBreakpoint();
    const isMobile = !screens.md;
    const isSmallMobile = !screens.sm;

    // Get current academic session (current year - next year)
    const getAcademicSession = () => {
        const currentYear = new Date().getFullYear();
        const nextYear = currentYear + 1;
        return `${currentYear}-${nextYear}`;
    };

    // College logo path - corrected to use the absolute path from assets
    const collegeLogo = '../assets/images.png';

    const fetchWithAuth = async (url, options = {}) => {
        try {
            setLoading(true);
            const response = await fetch(url, {
                ...options,
                credentials: 'include',
                headers: {
                    ...options.headers,
                    'Content-Type': 'application/json',
                },
            });
    
            if (url.includes('Sec_Read.php') && response.status === 401) {
                message.error('Admin access required. Please login as admin.');
                navigate('/admin-signIn');
                return null;
            }
    
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
    
            return await response.json();
        } catch (error) {
            console.error('Fetch error:', error);
            message.error('Failed to fetch data');
            return null;
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const fetchSections = async () => {
            const data = await fetchWithAuth("https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/Sec_Read.php");
            if (data) {
                setSections(data);
                // Set default section if available
                if (data.length > 0) {
                    fetchPerformanceData(data[0].id, data[0].name);
                }
            }
        };
        fetchSections();
    }, []);

    const fetchPerformanceData = async (sectionId, sectionName) => {
        setPerformances([]);
        setColumns([]);
        setFilteredSubjects([]);

        const data = await fetchWithAuth(`https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/Clg_performance.php?section_id=${sectionId}`);
        if (data && Array.isArray(data)) {
            const subjects = {};
            data.forEach(item => {
                const subjectKey = `${item.subject_name} (${item.exam_name})`;
                if (!subjects[subjectKey]) {
                    subjects[subjectKey] = [];
                }
                subjects[subjectKey].push(item);
            });

            // Set filtered subjects (all subjects initially)
            setFilteredSubjects(Object.keys(subjects));

            const columns = [
                {
                    title: 'Student Name',
                    dataIndex: 'student_name',
                    key: 'student_name',
                    fixed: isMobile ? 'left' : false,
                    width: isMobile ? 120 : undefined,
                    sorter: (a, b) => a.student_name.localeCompare(b.student_name),
                    sortDirections: ['ascend', 'descend'],
                    render: (text) => (
                        <Text style={{ fontSize: isSmallMobile ? '12px' : '14px' }}>
                            {text}
                        </Text>
                    ),
                },
                ...Object.keys(subjects).map(subject => ({
                    title: (
                        <div style={{ 
                            fontSize: isSmallMobile ? '10px' : (isMobile ? '11px' : '14px'),
                            lineHeight: '1.2',
                            textAlign: 'center'
                        }}>
                            {subject}
                        </div>
                    ),
                    dataIndex: subject,
                    key: subject,
                    width: isSmallMobile ? 80 : (isMobile ? 100 : 120),
                    render: (value, record) => (
                        <div style={{ textAlign: 'center' }}>
                            <Text style={{ fontSize: isSmallMobile ? '11px' : '13px' }}>
                                {value ?? '-'}
                            </Text>
                            {value && value >= (record[`${subject}_total`] * 0.9) ? (
                                <StarFilled style={{ color: 'gold', marginLeft: 2, fontSize: isSmallMobile ? 10 : 12 }} />
                            ) : null}
                        </div>
                    ),
                    sorter: (a, b) => (a[subject] || 0) - (b[subject] || 0),
                    sortDirections: ['ascend', 'descend'],
                })),
                {
                    title: 'Total',
                    dataIndex: 'total_marks',
                    key: 'total_marks',
                    fixed: isMobile ? 'right' : false,
                    width: isMobile ? 70 : 90,
                    sorter: (a, b) => a.total_marks - b.total_marks,
                    sortDirections: ['ascend', 'descend'],
                    render: (text) => (
                        <Text strong style={{ fontSize: isSmallMobile ? '12px' : '14px' }}>
                            {text}
                        </Text>
                    ),
                },
                {
                    title: 'Action',
                    key: 'action',
                    fixed: isMobile ? 'right' : false,
                    width: isMobile ? 80 : 100,
                    render: (_, record) => (
                        <Button 
                            type="link" 
                            onClick={() => showStudentDetails(record.student_name, data)}
                            size={isSmallMobile ? 'small' : (isMobile ? 'middle' : 'middle')}
                            loading={loading}
                            style={{ 
                                padding: isSmallMobile ? '4px 0' : '4px 8px',
                                fontSize: isSmallMobile ? '11px' : '13px'
                            }}
                        >
                            View DMC
                        </Button>
                    ),
                },
            ];

            const rows = Array.from(new Set(data.map(item => item.student_name))).map(student_name => {
                let total = 0;
                const rowData = { key: student_name, student_name };

                Object.keys(subjects).forEach(subject => {
                    const subjectData = subjects[subject].find(i => i.student_name === student_name);
                    if (subjectData) {
                        rowData[subject] = subjectData.obtained_marks;
                        rowData[`${subject}_total`] = subjectData.total_marks;
                        total += parseFloat(subjectData.obtained_marks);
                    } else {
                        rowData[subject] = '-';
                    }
                });

                rowData.total_marks = total;
                return rowData;
            });

            setColumns(columns);
            setPerformances(rows);
            setSelectedSection(sectionId);
            setSelectedSectionName(sectionName);
        } else if (data) {
            console.error("Unexpected API response:", data);
        }
    };

    const showStudentDetails = (studentName, allData) => {
        const details = allData.filter(item => item.student_name === studentName);
        setSelectedStudent(studentName);
        setStudentDetails(details);
        setIsModalVisible(true);
    };

    const handlePrint = () => {
        const printContent = document.getElementById('dmc-print-content');
        if (!printContent) {
            message.error('Print content not found');
            return;
        }

        const printWindow = window.open('', '_blank', 'width=1000,height=800');
        const currentDate = new Date().toLocaleDateString();
        const currentTime = new Date().toLocaleTimeString();

        // Get the absolute URL for the logo for printing
        const logoUrl = window.location.origin + collegeLogo;

        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>DMC - ${selectedStudent}</title>
                <style>
                    body { 
                        font-family: 'Arial', sans-serif; 
                        margin: 0; 
                        padding: 20px; 
                        background: white;
                        color: black;
                    }
                    .print-header { 
                        text-align: center; 
                        margin-bottom: 30px;
                        border-bottom: 2px solid #000;
                        padding-bottom: 20px;
                    }
                    .college-logo {
                        height: 80px;
                        margin-bottom: 10px;
                    }
                    .college-name {
                        font-size: 24px;
                        font-weight: bold;
                        margin: 10px 0 5px 0;
                    }
                    .dmc-title {
                        font-size: 18px;
                        font-weight: bold;
                        margin: 5px 0;
                    }
                    .academic-session {
                        font-size: 14px;
                        color: #666;
                    }
                    .student-info {
                        margin: 20px 0;
                        padding: 15px;
                        background: #f9f9f9;
                        border-radius: 5px;
                    }
                    .info-row {
                        display: flex;
                        justify-content: space-between;
                        margin-bottom: 8px;
                    }
                    .info-label {
                        font-weight: bold;
                        min-width: 120px;
                    }
                    table {
                        width: 100%;
                        border-collapse: collapse;
                        margin: 20px 0;
                        font-size: 12px;
                    }
                    th, td {
                        border: 1px solid #ddd;
                        padding: 8px;
                        text-align: left;
                    }
                    th {
                        background-color: #f2f2f2;
                        font-weight: bold;
                    }
                    .summary-row {
                        background-color: #e8f4fd !important;
                        font-weight: bold;
                    }
                    .footer {
                        margin-top: 30px;
                        padding-top: 20px;
                        border-top: 1px solid #000;
                    }
                    .footer-content {
                        display: flex;
                        justify-content: space-between;
                        align-items: flex-start;
                    }
                    .grading-system {
                        flex: 1;
                    }
                    .signature {
                        text-align: right;
                        flex: 1;
                    }
                    .signature-line {
                        border-top: 1px solid #000;
                        width: 200px;
                        margin-top: 60px;
                        margin-left: auto;
                    }
                    .print-date {
                        text-align: right;
                        margin-bottom: 20px;
                        font-size: 12px;
                        color: #666;
                    }
                    @media print {
                        body { margin: 0; padding: 15px; }
                        .no-print { display: none; }
                        table { page-break-inside: auto; }
                        tr { page-break-inside: avoid; page-break-after: auto; }
                        @page { margin: 1cm; }
                    }
                </style>
            </head>
            <body>
                <div class="print-date">
                    Printed on: ${currentDate} at ${currentTime}
                </div>
                ${printContent.innerHTML.replace(/src="\/assets\/images.png"/g, `src="${logoUrl}"`)}
            </body>
            </html>
        `);
        
        printWindow.document.close();
        
        // Wait for images to load before printing
        printWindow.onload = function() {
            setTimeout(() => {
                printWindow.focus();
                printWindow.print();
                printWindow.onafterprint = function() {
                    printWindow.close();
                };
            }, 1000);
        };
    };

    const handleDownloadPDF = () => {
        message.info('PDF download functionality would be implemented here');
        // For actual PDF generation, you would use libraries like:
        // jsPDF, html2canvas, or @react-pdf/renderer
    };

    const handleCancel = () => {
        setIsModalVisible(false);
    };

    const handleSubjectFilter = (selectedSubjects) => {
        setFilteredSubjects(selectedSubjects);
    };

    const handleSort = (key, direction) => {
        setSortConfig({ key, direction });
    };

    const sortedPerformances = [...performances].sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
            return sortConfig.direction === 'ascend' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
            return sortConfig.direction === 'ascend' ? 1 : -1;
        }
        return 0;
    });

    const getGrade = (percentage) => {
        if (percentage >= 90) return 'A+';
        if (percentage >= 80) return 'A';
        if (percentage >= 70) return 'B';
        if (percentage >= 60) return 'C';
        if (percentage >= 50) return 'D';
        return 'F';
    };

    const getGradeColor = (percentage) => {
        if (percentage >= 90) return '#52c41a';
        if (percentage >= 80) return '#389e0d';
        if (percentage >= 70) return '#d4b106';
        if (percentage >= 60) return '#d48806';
        if (percentage >= 50) return '#d46b08';
        return '#cf1322';
    };

    const calculateStatistics = () => {
        if (performances.length === 0) return null;
        
        const totals = performances.map(p => p.total_marks);
        const max = Math.max(...totals);
        const min = Math.min(...totals);
        const avg = totals.reduce((a, b) => a + b, 0) / totals.length;
        
        return { max, min, avg };
    };

    const stats = calculateStatistics();
    const modalWidth = isSmallMobile ? '95%' : isMobile ? '90%' : '80%';

    // Prepare data for pie chart (grade distribution)
    const gradeData = [
        { name: 'A+ (90-100%)', value: 0 },
        { name: 'A (80-89%)', value: 0 },
        { name: 'B (70-79%)', value: 0 },
        { name: 'C (60-69%)', value: 0 },
        { name: 'D (50-59%)', value: 0 },
        { name: 'F (Below 50%)', value: 0 },
    ];

    if (performances.length > 0 && studentDetails.length > 0) {
        performances.forEach(performance => {
            const totalPossible = studentDetails.reduce((sum, item) => sum + parseFloat(item.total_marks), 0);
            const percentage = totalPossible > 0 ? (performance.total_marks / totalPossible) * 100 : 0;
            const grade = getGrade(percentage);
            
            switch(grade) {
                case 'A+': gradeData[0].value++; break;
                case 'A': gradeData[1].value++; break;
                case 'B': gradeData[2].value++; break;
                case 'C': gradeData[3].value++; break;
                case 'D': gradeData[4].value++; break;
                case 'F': gradeData[5].value++; break;
                default: break;
            }
        });
    }

    // Calculate overall result for DMC
    const calculateOverallResult = () => {
        if (studentDetails.length === 0) return { totalObtained: 0, totalPossible: 0, percentage: 0 };
        
        const totalObtained = studentDetails.reduce((sum, item) => sum + parseFloat(item.obtained_marks || 0), 0);
        const totalPossible = studentDetails.reduce((sum, item) => sum + parseFloat(item.total_marks || 0), 0);
        const percentage = totalPossible > 0 ? (totalObtained / totalPossible * 100) : 0;
        
        return { totalObtained, totalPossible, percentage: percentage.toFixed(2) };
    };

    const overallResult = calculateOverallResult();

    return (
        <Layout className="performance-layout">
            <Sidebar />
            <Layout style={{ marginLeft: isMobile ? 80 : 200 }}>
                <Content style={{ 
                    padding: isSmallMobile ? '8px' : (isMobile ? '12px' : '24px'), 
                    minHeight: '100vh',
                    background: '#f5f7fa'
                }}>
                    <Card 
                        title={
                            <div style={{ 
                                display: 'flex', 
                                flexDirection: isMobile ? 'column' : 'row', 
                                alignItems: isMobile ? 'flex-start' : 'center',
                                gap: isMobile ? '8px' : '16px'
                            }}>
                                <span style={{ fontSize: isSmallMobile ? '16px' : (isMobile ? '18px' : '20px') }}>
                                    Performance Dashboard
                                </span>
                                {selectedSectionName && (
                                    <Text type="secondary" style={{ fontSize: isSmallMobile ? '12px' : '14px' }}>
                                        Section: {selectedSectionName}
                                    </Text>
                                )}
                            </div>
                        }
                        bordered={false}
                        extra={
                            <Select
                                defaultValue={selectedSectionName || undefined}
                                style={{ width: isMobile ? '100%' : 200, marginTop: isMobile ? '8px' : 0 }}
                                onChange={(value, option) => fetchPerformanceData(value, option.children)}
                                loading={loading}
                                size={isSmallMobile ? 'small' : 'middle'}
                                suffixIcon={<FilterOutlined />}
                            >
                                {sections.map(section => (
                                    <Option key={section.id} value={section.id}>{section.name}</Option>
                                ))}
                            </Select>
                        }
                        style={{ marginBottom: 16 }}
                    >
                        {selectedSection && (
                            <>
                                {stats && (
                                    <div className="performance-stats" style={{ marginBottom: 16 }}>
                                        <Row gutter={[8, 8]}>
                                            <Col xs={8} sm={8}>
                                                <Statistic 
                                                    title="Highest Score" 
                                                    value={stats.max} 
                                                    valueStyle={{ fontSize: isSmallMobile ? '14px' : '16px' }}
                                                />
                                            </Col>
                                            <Col xs={8} sm={8}>
                                                <Statistic 
                                                    title="Average Score" 
                                                    value={stats.avg.toFixed(1)} 
                                                    valueStyle={{ fontSize: isSmallMobile ? '14px' : '16px' }}
                                                />
                                            </Col>
                                            <Col xs={8} sm={8}>
                                                <Statistic 
                                                    title="Lowest Score" 
                                                    value={stats.min} 
                                                    valueStyle={{ fontSize: isSmallMobile ? '14px' : '16px' }}
                                                />
                                            </Col>
                                        </Row>
                                    </div>
                                )}

                                <Divider style={{ margin: '16px 0' }} />

                                <div className="performance-tabs" style={{ marginBottom: 16 }}>
                                    <Button 
                                        type={activeTab === 'table' ? 'primary' : 'default'} 
                                        onClick={() => setActiveTab('table')}
                                        size={isSmallMobile ? 'small' : 'middle'}
                                        style={{ marginRight: 8 }}
                                    >
                                        Tabular View
                                    </Button>
                                    <Button 
                                        type={activeTab === 'graph' ? 'primary' : 'default'} 
                                        onClick={() => setActiveTab('graph')}
                                        size={isSmallMobile ? 'small' : 'middle'}
                                    >
                                        Graphical View
                                    </Button>
                                </div>

                                {activeTab === 'table' ? (
                                    <div className="performance-table-container">
                                        <div className="table-controls">
                                            <Select
                                                mode="multiple"
                                                placeholder="Filter Subjects"
                                                value={filteredSubjects}
                                                onChange={handleSubjectFilter}
                                                style={{ width: '100%', marginBottom: 16 }}
                                                allowClear
                                                size={isSmallMobile ? 'small' : 'middle'}
                                                maxTagCount={isMobile ? 1 : undefined}
                                                maxTagTextLength={isMobile ? 10 : undefined}
                                            >
                                                {columns
                                                    .filter(col => col.key !== 'student_name' && col.key !== 'total_marks' && col.key !== 'action')
                                                    .map(col => (
                                                        <Option key={col.key} value={col.key}>
                                                            {col.title.props?.children || col.title}
                                                        </Option>
                                                    ))}
                                            </Select>
                                        </div>
                                        <Spin spinning={loading}>
                                            <Table
                                                columns={columns.filter(col => 
                                                    col.key === 'student_name' || 
                                                    col.key === 'total_marks' || 
                                                    col.key === 'action' ||
                                                    filteredSubjects.includes(col.key)
                                                )}
                                                dataSource={sortedPerformances}
                                                bordered
                                                pagination={{ 
                                                    pageSize: 10, 
                                                    size: isSmallMobile ? 'small' : 'default',
                                                    showSizeChanger: false
                                                }}
                                                scroll={{ x: true }}
                                                size={isSmallMobile ? 'small' : (isMobile ? 'middle' : 'default')}
                                                loading={loading}
                                                onChange={(pagination, filters, sorter) => {
                                                    if (sorter.field) {
                                                        handleSort(sorter.field, sorter.order);
                                                    }
                                                }}
                                            />
                                        </Spin>
                                    </div>
                                ) : (
                                    <div className="performance-graphs">
                                        <Row gutter={[16, 16]}>
                                            <Col xs={24} lg={12}>
                                                <Card 
                                                    title="Total Marks Distribution" 
                                                    bordered={false}
                                                    bodyStyle={{ padding: isSmallMobile ? 8 : 16 }}
                                                >
                                                    <div style={{ height: isSmallMobile ? 300 : 400 }}>
                                                        <ResponsiveContainer width="100%" height="100%">
                                                            <BarChart 
                                                                data={performances}
                                                                margin={{ 
                                                                    top: 20, 
                                                                    right: isSmallMobile ? 10 : 30, 
                                                                    left: isSmallMobile ? 10 : 20, 
                                                                    bottom: isSmallMobile ? 40 : 60 
                                                                }}
                                                            >
                                                                <CartesianGrid strokeDasharray="3 3" />
                                                                <XAxis 
                                                                    dataKey="student_name" 
                                                                    angle={-45} 
                                                                    textAnchor="end" 
                                                                    height={isSmallMobile ? 60 : 70}
                                                                    tick={{ fontSize: isSmallMobile ? 10 : 12 }}
                                                                />
                                                                <YAxis 
                                                                    label={{ 
                                                                        value: 'Total Marks', 
                                                                        angle: -90, 
                                                                        position: 'insideLeft',
                                                                        style: { fontSize: isSmallMobile ? 10 : 12 }
                                                                    }} 
                                                                    tick={{ fontSize: isSmallMobile ? 10 : 12 }}
                                                                />
                                                                <Tooltip />
                                                                <Legend />
                                                                <Bar 
                                                                    dataKey="total_marks" 
                                                                    name="Total Marks" 
                                                                    fill="#1890ff" 
                                                                    animationDuration={1500}
                                                                />
                                                            </BarChart>
                                                        </ResponsiveContainer>
                                                    </div>
                                                </Card>
                                            </Col>
                                            <Col xs={24} lg={12}>
                                                <Card 
                                                    title="Grade Distribution" 
                                                    bordered={false}
                                                    bodyStyle={{ padding: isSmallMobile ? 8 : 16 }}
                                                >
                                                    <div style={{ height: isSmallMobile ? 300 : 400 }}>
                                                        <ResponsiveContainer width="100%" height="100%">
                                                            <PieChart>
                                                                <Pie
                                                                    data={gradeData.filter(g => g.value > 0)}
                                                                    cx="50%"
                                                                    cy="50%"
                                                                    labelLine={false}
                                                                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                                                    outerRadius={isSmallMobile ? 80 : 120}
                                                                    fill="#8884d8"
                                                                    dataKey="value"
                                                                    animationDuration={1500}
                                                                >
                                                                    {gradeData.map((entry, index) => (
                                                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                                    ))}
                                                                </Pie>
                                                                <Tooltip />
                                                                <Legend 
                                                                    wrapperStyle={{ 
                                                                        fontSize: isSmallMobile ? 10 : 12,
                                                                        paddingTop: isSmallMobile ? 5 : 10
                                                                    }}
                                                                />
                                                            </PieChart>
                                                        </ResponsiveContainer>
                                                    </div>
                                                </Card>
                                            </Col>
                                        </Row>
                                    </div>
                                )}
                            </>
                        )}
                    </Card>

                    {/* DMC Modal */}
                    <Modal
                        title={
                            <div style={{ 
                                display: 'flex', 
                                flexDirection: isMobile ? 'column' : 'row', 
                                justifyContent: 'space-between', 
                                alignItems: isMobile ? 'flex-start' : 'center',
                                gap: isMobile ? '8px' : '0'
                            }}>
                                <span style={{ fontSize: isSmallMobile ? '14px' : (isMobile ? '16px' : '18px') }}>
                                    Detailed Marks Certificate - {selectedStudent}
                                </span>
                                <Space size={isSmallMobile ? 'small' : 'middle'}>
                                    <Button 
                                        icon={<DownloadOutlined />} 
                                        onClick={handleDownloadPDF}
                                        size={isSmallMobile ? 'small' : 'middle'}
                                    >
                                        {isMobile ? 'PDF' : 'Download PDF'}
                                    </Button>
                                    <Button 
                                        icon={<PrinterOutlined />} 
                                        onClick={handlePrint} 
                                        type="primary"
                                        size={isSmallMobile ? 'small' : 'middle'}
                                    >
                                        {isMobile ? 'Print' : 'Print DMC'}
                                    </Button>
                                </Space>
                            </div>
                        }
                        open={isModalVisible}
                        onCancel={handleCancel}
                        footer={null}
                        width={modalWidth}
                        bodyStyle={{ padding: isSmallMobile ? '8px' : (isMobile ? '12px' : '20px') }}
                        className="dmc-modal"
                    >
                        <Spin spinning={loading}>
                            <div className="dmc-container">
                                {/* Print-specific content */}
                                <div id="dmc-print-content" style={{ display: 'none' }}>
                                    <div className="print-header">
                                        {/* <img src={collegeLogo} alt="College Logo" className="college-logo" /> */}
                                        <div className="college-name">APEX MODEL COLLEGE HARICHAND</div>
                                        <div className="dmc-title">DETAILED MARKS CERTIFICATE</div>
                                        <div className="academic-session">Academic Session {getAcademicSession()}</div>
                                    </div>

                                    <div className="student-info">
                                        <div className="info-row">
                                            <span className="info-label">Student Name:</span>
                                            <span>{selectedStudent}</span>
                                        </div>
                                        <div className="info-row">
                                            <span className="info-label">Section:</span>
                                            <span>{selectedSectionName}</span>
                                        </div>
                                        <div className="info-row">
                                            <span className="info-label">Issue Date:</span>
                                            <span>{new Date().toLocaleDateString()}</span>
                                        </div>
                                    </div>

                                    <table>
                                        <thead>
                                            <tr>
                                                <th>Subject</th>
                                                <th>Exam</th>
                                                <th>Obtained</th>
                                                <th>Total</th>
                                                <th>Percentage</th>
                                                <th>Grade</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {studentDetails.map((record, index) => {
                                                const percentage = (record.obtained_marks / record.total_marks * 100).toFixed(2);
                                                const grade = getGrade(percentage);
                                                return (
                                                    <tr key={index}>
                                                        <td>{record.subject_name}</td>
                                                        <td>{record.exam_name}</td>
                                                        <td>{record.obtained_marks}</td>
                                                        <td>{record.total_marks}</td>
                                                        <td>{percentage}%</td>
                                                        <td style={{ color: getGradeColor(percentage) }}>{grade}</td>
                                                    </tr>
                                                );
                                            })}
                                            <tr className="summary-row">
                                                <td colSpan="2"><strong>Overall Result</strong></td>
                                                <td><strong>{overallResult.totalObtained}</strong></td>
                                                <td><strong>{overallResult.totalPossible}</strong></td>
                                                <td style={{ color: overallResult.percentage >= 50 ? 'green' : 'red' }}>
                                                    <strong>{overallResult.percentage}%</strong>
                                                </td>
                                                <td style={{ color: getGradeColor(overallResult.percentage) }}>
                                                    <strong>{getGrade(overallResult.percentage)}</strong>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>

                                    <div className="footer">
                                        <div className="footer-content">
                                            <div className="grading-system">
                                                <strong>Grading System:</strong>
                                                <ul style={{ margin: '5px 0 0 0', paddingLeft: '20px', fontSize: '11px' }}>
                                                    <li>A+ (90-100%) - Outstanding</li>
                                                    <li>A (80-89%) - Excellent</li>
                                                    <li>B (70-79%) - Good</li>
                                                    <li>C (60-69%) - Average</li>
                                                    <li>D (50-59%) - Below Average</li>
                                                    <li>F (Below 50%) - Fail</li>
                                                </ul>
                                            </div>
                                            <div className="signature">
                                                <div>Issued on: {new Date().toLocaleDateString()}</div>
                                                <div className="signature-line"></div>
                                                <div>Principal's Signature</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Screen display content */}
                                <div className="dmc-header" style={{ 
                                    display: 'flex', 
                                    flexDirection: isMobile ? 'column' : 'row', 
                                    alignItems: 'center',
                                    textAlign: isMobile ? 'center' : 'left',
                                    marginBottom: isMobile ? '12px' : '20px'
                                }}>
                                    <img 
                                        src={collegeLogo} 
                                        alt="College Logo" 
                                        style={{ 
                                            height: isSmallMobile ? 60 : 80, 
                                            marginRight: isMobile ? 0 : 20,
                                            marginBottom: isMobile ? '8px' : 0
                                        }} 
                                        onError={(e) => {
                                            e.target.src = 'https://via.placeholder.com/80/1890ff/ffffff?text=APEX';
                                            e.target.style.backgroundColor = '#f0f0f0';
                                            e.target.style.padding = '10px';
                                        }}
                                    />
                                    <div style={{ textAlign: isMobile ? 'center' : 'left', flexGrow: 1 }}>
                                        <Title level={isSmallMobile ? 4 : (isMobile ? 3 : 3)} style={{ marginBottom: 4 }}>
                                            APEX MODEL COLLEGE HARICHAND
                                        </Title>
                                        <Text strong style={{ fontSize: isSmallMobile ? '12px' : '14px' }}>
                                            Detailed Marks Certificate
                                        </Text>
                                        <div style={{ marginTop: 4 }}>
                                            <Text type="secondary" style={{ fontSize: isSmallMobile ? '11px' : '13px' }}>
                                                Academic Session {getAcademicSession()}
                                            </Text>
                                        </div>
                                    </div>
                                </div>

                                <Divider style={{ margin: '12px 0' }} />

                                <div className="dmc-student-info" style={{ marginBottom: '16px' }}>
                                    <Row gutter={[8, 8]}>
                                        <Col xs={24} sm={12}>
                                            <Text strong style={{ fontSize: isSmallMobile ? '12px' : '14px' }}>
                                                Student Name: 
                                            </Text> 
                                            <span style={{ fontSize: isSmallMobile ? '12px' : '14px', marginLeft: 4 }}>
                                                {selectedStudent}
                                            </span>
                                        </Col>
                                        <Col xs={24} sm={12}>
                                            <Text strong style={{ fontSize: isSmallMobile ? '12px' : '14px' }}>
                                                Section: 
                                            </Text> 
                                            <span style={{ fontSize: isSmallMobile ? '12px' : '14px', marginLeft: 4 }}>
                                                {selectedSectionName}
                                            </span>
                                        </Col>
                                    </Row>
                                </div>

                                <Divider style={{ margin: '12px 0' }} />

                                <div className="dmc-marks-table">
                                    <Table 
                                        dataSource={studentDetails}
                                        columns={[
                                            {
                                                title: 'Subject',
                                                dataIndex: 'subject_name',
                                                key: 'subject_name',
                                                render: (text) => (
                                                    <Text strong style={{ fontSize: isSmallMobile ? '11px' : '13px' }}>
                                                        {text}
                                                    </Text>
                                                ),
                                                width: isSmallMobile ? 100 : undefined,
                                            },
                                            {
                                                title: 'Exam',
                                                dataIndex: 'exam_name',
                                                key: 'exam_name',
                                                render: (text) => (
                                                    <Text style={{ fontSize: isSmallMobile ? '11px' : '13px' }}>
                                                        {text}
                                                    </Text>
                                                ),
                                                width: isSmallMobile ? 80 : undefined,
                                            },
                                            {
                                                title: 'Obtained',
                                                dataIndex: 'obtained_marks',
                                                key: 'obtained_marks',
                                                render: (text, record) => (
                                                    <Text 
                                                        strong 
                                                        type={text / record.total_marks >= 0.5 ? 'success' : 'danger'}
                                                        style={{ fontSize: isSmallMobile ? '11px' : '13px' }}
                                                    >
                                                        {text}
                                                    </Text>
                                                ),
                                                width: isSmallMobile ? 70 : undefined,
                                            },
                                            {
                                                title: 'Total',
                                                dataIndex: 'total_marks',
                                                key: 'total_marks',
                                                render: (text) => (
                                                    <Text style={{ fontSize: isSmallMobile ? '11px' : '13px' }}>
                                                        {text}
                                                    </Text>
                                                ),
                                                width: isSmallMobile ? 60 : undefined,
                                            },
                                            {
                                                title: 'Percentage',
                                                key: 'percentage',
                                                render: (_, record) => {
                                                    const percentage = (record.obtained_marks / record.total_marks * 100).toFixed(2);
                                                    return (
                                                        <Text 
                                                            strong 
                                                            type={percentage >= 50 ? 'success' : 'danger'}
                                                            style={{ fontSize: isSmallMobile ? '11px' : '13px' }}
                                                        >
                                                            {percentage}%
                                                        </Text>
                                                    );
                                                },
                                                width: isSmallMobile ? 80 : undefined,
                                            },
                                            {
                                                title: 'Grade',
                                                key: 'grade',
                                                render: (_, record) => {
                                                    const percentage = (record.obtained_marks / record.total_marks * 100);
                                                    return (
                                                        <Text 
                                                            strong 
                                                            style={{ 
                                                                color: getGradeColor(percentage),
                                                                fontSize: isSmallMobile ? '11px' : '13px'
                                                            }}
                                                        >
                                                            {getGrade(percentage)}
                                                        </Text>
                                                    );
                                                },
                                                width: isSmallMobile ? 60 : undefined,
                                            },
                                        ]}
                                        bordered
                                        pagination={false}
                                        size={isSmallMobile ? 'small' : (isMobile ? 'middle' : 'default')}
                                        scroll={isMobile ? { x: true } : undefined}
                                        summary={() => {
                                            return (
                                                <Table.Summary.Row style={{ background: '#fafafa' }}>
                                                    <Table.Summary.Cell index={0} colSpan={2}>
                                                        <Text strong style={{ fontSize: isSmallMobile ? '12px' : '14px' }}>
                                                            Overall Result
                                                        </Text>
                                                    </Table.Summary.Cell>
                                                    <Table.Summary.Cell index={1}>
                                                        <Text strong style={{ fontSize: isSmallMobile ? '12px' : '14px' }}>
                                                            {overallResult.totalObtained}
                                                        </Text>
                                                    </Table.Summary.Cell>
                                                    <Table.Summary.Cell index={2}>
                                                        <Text strong style={{ fontSize: isSmallMobile ? '12px' : '14px' }}>
                                                            {overallResult.totalPossible}
                                                        </Text>
                                                    </Table.Summary.Cell>
                                                    <Table.Summary.Cell index={3}>
                                                        <Text strong 
                                                            type={overallResult.percentage >= 50 ? 'success' : 'danger'} 
                                                            style={{ fontSize: isSmallMobile ? '12px' : '14px' }}
                                                        >
                                                            {overallResult.percentage}%
                                                        </Text>
                                                    </Table.Summary.Cell>
                                                    <Table.Summary.Cell index={4}>
                                                        <Text 
                                                            strong 
                                                            style={{ 
                                                                color: getGradeColor(overallResult.percentage),
                                                                fontSize: isSmallMobile ? '12px' : '14px'
                                                            }}
                                                        >
                                                            {getGrade(overallResult.percentage)}
                                                        </Text>
                                                    </Table.Summary.Cell>
                                                </Table.Summary.Row>
                                            );
                                        }}
                                    />
                                </div>

                                <Divider style={{ margin: '16px 0' }} />

                                <div className="dmc-footer">
                                    <Row gutter={[16, 16]}>
                                        <Col xs={24} md={12}>
                                            <div className="grading-system">
                                                <Text strong style={{ fontSize: isSmallMobile ? '12px' : '14px' }}>
                                                    Grading System:
                                                </Text>
                                                <ul style={{ 
                                                    marginTop: 8, 
                                                    marginBottom: 0, 
                                                    paddingLeft: 16,
                                                    fontSize: isSmallMobile ? '11px' : '13px'
                                                }}>
                                                    <li>A+ (90-100%) - Outstanding</li>
                                                    <li>A (80-89%) - Excellent</li>
                                                    <li>B (70-79%) - Good</li>
                                                    <li>C (60-69%) - Average</li>
                                                    <li>D (50-59%) - Below Average</li>
                                                    <li>F (Below 50%) - Fail</li>
                                                </ul>
                                            </div>
                                        </Col>
                                        <Col xs={24} md={12}>
                                            <div style={{ textAlign: isMobile ? 'left' : 'right' }}>
                                                <Text strong style={{ fontSize: isSmallMobile ? '12px' : '14px' }}>
                                                    Issued on: {new Date().toLocaleDateString()}
                                                </Text>
                                                <div style={{ marginTop: 30 }}>
                                                    <div style={{ 
                                                        borderTop: '1px solid #000', 
                                                        width: isMobile ? '150px' : '200px',
                                                        marginLeft: isMobile ? 0 : 'auto'
                                                    }}></div>
                                                    <Text style={{ fontSize: isSmallMobile ? '11px' : '13px' }}>
                                                        Principal's Signature
                                                    </Text>
                                                </div>
                                            </div>
                                        </Col>
                                    </Row>
                                </div>
                            </div>
                        </Spin>
                    </Modal>
                </Content>
            </Layout>
        </Layout>
    );
}

export default Performance;