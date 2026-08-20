import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { 
  Button, 
  Table, 
  Card,
  Row,
  Col,
  Typography,
  Spin,
  message,
  Modal,
  Progress,
  Divider,
  Tag,
  Descriptions,
  Statistic,
  Avatar,
  Tabs,
  Grid,
  Space,
  Popconfirm,
  Tooltip
} from 'antd';
import {
  UserOutlined,
  ClockCircleOutlined,
  BookOutlined,
  CheckCircleOutlined,
  TeamOutlined,
  CalendarOutlined,
  PrinterOutlined,
  DeleteOutlined,
  DeleteFilled,
  EyeOutlined,
  FileTextOutlined,
  StarOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { useBreakpoint } = Grid;

const StudentReports = () => {
    const [reports, setReports] = useState([]);
    const [sections, setSections] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedSection, setSelectedSection] = useState(null);
    const [selectedReport, setSelectedReport] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [activeTab, setActiveTab] = useState('performance');
    
    // State for bulk selection and deletion
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [isBulkDeleteModalVisible, setIsBulkDeleteModalVisible] = useState(false);
    const [bulkDeleteLoading, setBulkDeleteLoading] = useState(false);
    
    const screens = useBreakpoint();
    const isMobile = !screens.md;
    const isSmallMobile = !screens.sm;
    const reportRef = useRef();

    // Create axios instances
    const publicApi = axios.create({
        baseURL: 'https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/',
        withCredentials: false,
        headers: {
            'Content-Type': 'application/json'
        }
    });

    const authApi = axios.create({
        baseURL: 'https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/',
        withCredentials: true,
        headers: {
            'Content-Type': 'application/json'
        }
    });

    useEffect(() => {
        fetchSections();
    }, []);

    const fetchSections = async () => {
        setLoading(true);
        try {
            const response = await publicApi.get('Sec_Read.php');
            setSections(response.data);
        } catch (error) {
            if (error.response && error.response.status === 401) {
                message.error("Please log in as admin to access this page");
            } else {
                message.error("Error fetching sections");
            }
            console.error("Error:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchReportsBySection = async (sectionId) => {
        setLoading(true);
        setSelectedSection(sectionId);
        setSelectedRowKeys([]);
        try {
            const response = await publicApi.get(`adstdreports_read.php?section_id=${sectionId}`);
            setReports(response.data.data || []);
        } catch (error) {
            message.error("Error fetching reports");
            console.error("Error:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSingleDelete = async (reportId) => {
        try {
            const response = await authApi.delete(`admin_std_reports_delete.php`, {
                data: { ids: [reportId] }
            });

            if (response.data.status === 'success') {
                message.success('Report deleted successfully');
                fetchReportsBySection(selectedSection);
            } else {
                message.error(response.data.message || 'Failed to delete report');
            }
        } catch (error) {
            message.error('Error deleting report');
            console.error("Error:", error);
        }
    };

    const handleBulkDelete = () => {
        if (selectedRowKeys.length === 0) {
            message.warning('Please select at least one report to delete');
            return;
        }
        setIsBulkDeleteModalVisible(true);
    };

    const confirmBulkDelete = async () => {
        setBulkDeleteLoading(true);
        try {
            const response = await authApi.delete(`adstdreports_bulk_delete.php`, {
                data: { ids: selectedRowKeys }
            });

            if (response.data.status === 'success') {
                message.success(`Successfully deleted ${selectedRowKeys.length} report(s)`);
                setSelectedRowKeys([]);
                setIsBulkDeleteModalVisible(false);
                fetchReportsBySection(selectedSection);
            } else {
                message.error(response.data.message || 'Failed to delete reports');
            }
        } catch (error) {
            message.error('Error deleting reports');
            console.error("Error:", error);
        } finally {
            setBulkDeleteLoading(false);
        }
    };

    const handleViewReport = (report) => {
        setSelectedReport(report);
        setModalVisible(true);
    };

    const handlePrint = () => {
        const printContent = document.getElementById('report-print-content');
        const WinPrint = window.open('', '', 'left=0,top=0,width=800,height=900,toolbar=0,scrollbars=0,status=0');
        WinPrint.document.write(`
            <html>
                <head>
                    <title>Student Report - ${selectedReport?.student?.name}</title>
                    <style>
                        body { font-family: Arial, sans-serif; padding: 20px; color: #333; }
                        h1 { color: #0b1b3d; border-bottom: 2px solid #d4af37; padding-bottom: 10px; }
                        .metric { margin-bottom: 15px; }
                        .label { font-weight: bold; }
                        .score { color: #1e3a8a; font-weight: bold; }
                        .remarks { background: #f8fafc; padding: 15px; border-left: 4px solid #d4af37; margin-top: 20px; }
                    </style>
                </head>
                <body>
                    <h1>APEX COLLEGE - STUDENT PERFORMANCE REPORT</h1>
                    <p><strong>Student Name:</strong> ${selectedReport?.student?.name}</p>
                    <p><strong>Section:</strong> ${selectedReport?.section?.name}</p>
                    <p><strong>Subject:</strong> ${selectedReport?.subject?.name}</p>
                    <p><strong>Date:</strong> ${new Date(selectedReport?.report_date).toLocaleDateString()}</p>
                    <hr/>
                    <h3>Performance Metrics</h3>
                    <div class="metric"><span class="label">Academic Performance:</span> <span class="score">${selectedReport?.performance_metrics?.academic_performance}/5.0</span></div>
                    <div class="metric"><span class="label">Punctuality:</span> <span class="score">${selectedReport?.performance_metrics?.punctuality}/5.0</span></div>
                    <div class="metric"><span class="label">Homework Completion:</span> <span class="score">${selectedReport?.performance_metrics?.homework_completion}/5.0</span></div>
                    <div class="remarks">
                        <h3>Overall Remarks</h3>
                        <p>${selectedReport?.overall_remarks}</p>
                    </div>
                </body>
            </html>
        `);
        WinPrint.document.close();
        WinPrint.focus();
        WinPrint.print();
        WinPrint.close();
    };

    const getProgressColor = (score) => {
        if (score >= 4.0) return '#10b981';
        if (score >= 3.0) return '#3b82f6';
        if (score >= 2.0) return '#f59e0b';
        return '#ef4444';
    };

    const columns = [
        {
            title: 'Student Name',
            dataIndex: ['student', 'name'],
            key: 'student_name',
            sorter: (a, b) => a.student.name.localeCompare(b.student.name),
            render: (text) => (
                <Space>
                    <Avatar style={{ background: '#0b1b3d', color: '#d4af37', fontWeight: 700 }} icon={<UserOutlined />} />
                    <Text strong style={{ color: '#0f172a' }}>{text}</Text>
                </Space>
            )
        },
        {
            title: 'Subject',
            dataIndex: ['subject', 'name'],
            key: 'subject_name',
            render: (text) => (
                <Tag icon={<BookOutlined />} color="processing" style={{ borderRadius: 12, padding: '2px 10px' }}>
                    {text}
                </Tag>
            )
        },
        {
            title: 'Academic Score',
            dataIndex: ['performance_metrics', 'academic_performance'],
            key: 'academic_performance',
            sorter: (a, b) => a.performance_metrics.academic_performance - b.performance_metrics.academic_performance,
            render: (score) => (
                <Progress 
                    percent={(score / 5) * 100} 
                    format={() => `${score}/5`}
                    strokeColor={getProgressColor(score)}
                    size="small"
                    style={{ minWidth: 120 }}
                />
            )
        },
        {
            title: 'Punctuality',
            dataIndex: ['performance_metrics', 'punctuality'],
            key: 'punctuality',
            responsive: ['md'],
            render: (score) => (
                <Text style={{ fontWeight: 600, color: getProgressColor(score) }}>
                    {score} / 5.0
                </Text>
            )
        },
        {
            title: 'Report Date',
            dataIndex: 'report_date',
            key: 'report_date',
            responsive: ['lg'],
            render: (date) => new Date(date).toLocaleDateString()
        },
        {
            title: 'Actions',
            key: 'actions',
            align: 'center',
            width: 140,
            render: (_, record) => (
                <Space size="small">
                    <Tooltip title="View Report Details">
                        <Button 
                            type="primary" 
                            icon={<EyeOutlined />} 
                            onClick={() => handleViewReport(record)}
                            size="small"
                            style={{ background: '#0b1b3d', borderRadius: 6 }}
                        />
                    </Tooltip>
                    <Popconfirm
                        title="Delete Report"
                        description="Are you sure to delete this report?"
                        onConfirm={() => handleSingleDelete(record.id)}
                        okText="Yes"
                        cancelText="No"
                        okButtonProps={{ danger: true }}
                    >
                        <Tooltip title="Delete Report">
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

    const rowSelection = {
        selectedRowKeys,
        onChange: (keys) => setSelectedRowKeys(keys)
    };

    return (
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
            <Card
                className="apex-card"
                title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 38, height: 38, borderRadius: 10, background: 'linear-gradient(135deg, #0b1b3d 0%, #1e3a8a 100%)', color: '#d4af37', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
                            <FileTextOutlined />
                        </div>
                        <div>
                            <Title level={4} style={{ margin: 0, color: '#0b1b3d', fontWeight: 700 }}>
                                Student Performance Reports
                            </Title>
                            <Text style={{ color: '#64748b', fontSize: 12 }}>Filter performance evaluation reports by section</Text>
                        </div>
                    </div>
                }
                extra={
                    selectedRowKeys.length > 0 && (
                        <Button 
                            danger
                            icon={<DeleteFilled />}
                            onClick={handleBulkDelete}
                            loading={bulkDeleteLoading}
                            style={{ borderRadius: 8 }}
                        >
                            Delete Selected ({selectedRowKeys.length})
                        </Button>
                    )
                }
            >
                {/* Section Buttons */}
                <div style={{ marginBottom: 20 }}>
                    <Text strong style={{ color: '#0b1b3d', display: 'block', marginBottom: 10, fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Select Section:
                    </Text>
                    <Row gutter={[10, 10]}>
                        {sections.map(section => {
                            const isSelected = selectedSection === section.id;
                            return (
                                <Col key={section.id}>
                                    <Button
                                        type={isSelected ? 'primary' : 'default'}
                                        onClick={() => fetchReportsBySection(section.id)}
                                        icon={<TeamOutlined />}
                                        className={isSelected ? 'apex-btn-gold' : ''}
                                        style={{ 
                                            borderRadius: 8,
                                            fontWeight: 600,
                                            borderColor: isSelected ? '#d4af37' : '#cbd5e1'
                                        }}
                                    >
                                        Section {section.name}
                                    </Button>
                                </Col>
                            );
                        })}
                    </Row>
                </div>

                {/* Table Content */}
                {selectedSection ? (
                    <Table 
                        columns={columns} 
                        dataSource={reports} 
                        rowKey="id"
                        rowSelection={rowSelection}
                        loading={loading}
                        scroll={{ x: 'max-content' }}
                        pagination={{
                            pageSize: 10,
                            showTotal: (total) => `Total ${total} student reports`
                        }}
                    />
                ) : (
                    <div style={{ padding: '40px 0', textAlign: 'center', background: '#f8fafc', borderRadius: 12, border: '1px dashed #cbd5e1' }}>
                        <TeamOutlined style={{ fontSize: 36, color: '#94a3b8', marginBottom: 12 }} />
                        <Title level={5} style={{ color: '#64748b', margin: 0 }}>Please select a section above to view reports</Title>
                    </div>
                )}
            </Card>

            {/* Bulk Delete Modal */}
            <Modal
                title="Confirm Bulk Deletion"
                open={isBulkDeleteModalVisible}
                onOk={confirmBulkDelete}
                onCancel={() => setIsBulkDeleteModalVisible(false)}
                okText="Yes, Delete All"
                cancelText="Cancel"
                okButtonProps={{ danger: true, loading: bulkDeleteLoading }}
                centered
            >
                <p>Are you sure you want to delete <strong>{selectedRowKeys.length}</strong> selected student report(s)?</p>
                <p style={{ color: '#ef4444', fontWeight: 600 }}>This action cannot be undone.</p>
            </Modal>

            {/* View Details Modal */}
            <Modal
                title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <Avatar size="large" style={{ background: '#0b1b3d', color: '#d4af37', fontWeight: 700 }} icon={<UserOutlined />} />
                        <div>
                            <div style={{ fontSize: 16, fontWeight: 'bold', color: '#0b1b3d' }}>
                                {selectedReport?.student?.name || 'Student Report'}
                            </div>
                            <div style={{ fontSize: 12, color: '#64748b' }}>
                                Section: {selectedReport?.section?.name} • Subject: {selectedReport?.subject?.name}
                            </div>
                        </div>
                    </div>
                }
                open={modalVisible}
                onCancel={() => setModalVisible(false)}
                footer={[
                    <Button key="print" icon={<PrinterOutlined />} onClick={handlePrint} className="apex-btn-gold">
                        Print Report
                    </Button>,
                    <Button key="close" onClick={() => setModalVisible(false)} style={{ borderRadius: 8 }}>
                        Close
                    </Button>
                ]}
                width={750}
                centered
            >
                {selectedReport && (
                    <div id="report-print-content" style={{ paddingTop: 12 }}>
                        <Descriptions title="Student Report Overview" bordered size="small" column={{ xs: 1, sm: 2 }}>
                            <Descriptions.Item label="Student Name">{selectedReport.student.name}</Descriptions.Item>
                            <Descriptions.Item label="Section">{selectedReport.section.name}</Descriptions.Item>
                            <Descriptions.Item label="Subject">{selectedReport.subject.name}</Descriptions.Item>
                            <Descriptions.Item label="Report Date">{new Date(selectedReport.report_date).toLocaleDateString()}</Descriptions.Item>
                        </Descriptions>

                        <Divider style={{ margin: '16px 0' }} />
                        <Title level={5} style={{ color: '#0b1b3d' }}>Performance Breakdown</Title>
                        
                        <Row gutter={[16, 16]}>
                            <Col xs={24} sm={8}>
                                <Card size="small" style={{ background: '#f8fafc', borderRadius: 8, textAlign: 'center' }}>
                                    <Statistic title="Academic" value={selectedReport.performance_metrics.academic_performance} suffix="/ 5" valueStyle={{ color: getProgressColor(selectedReport.performance_metrics.academic_performance) }} />
                                </Card>
                            </Col>
                            <Col xs={24} sm={8}>
                                <Card size="small" style={{ background: '#f8fafc', borderRadius: 8, textAlign: 'center' }}>
                                    <Statistic title="Punctuality" value={selectedReport.performance_metrics.punctuality} suffix="/ 5" valueStyle={{ color: getProgressColor(selectedReport.performance_metrics.punctuality) }} />
                                </Card>
                            </Col>
                            <Col xs={24} sm={8}>
                                <Card size="small" style={{ background: '#f8fafc', borderRadius: 8, textAlign: 'center' }}>
                                    <Statistic title="Homework" value={selectedReport.performance_metrics.homework_completion} suffix="/ 5" valueStyle={{ color: getProgressColor(selectedReport.performance_metrics.homework_completion) }} />
                                </Card>
                            </Col>
                        </Row>

                        <Divider style={{ margin: '16px 0' }} />
                        <Title level={5} style={{ color: '#0b1b3d' }}>Teacher Remarks</Title>
                        <Card size="small" style={{ background: '#f8fafc', borderLeft: '4px solid #d4af37', borderRadius: '0 8px 8px 0' }}>
                            <Text style={{ fontSize: 14 }}>{selectedReport.overall_remarks || 'No remarks provided.'}</Text>
                        </Card>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default StudentReports;