import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { 
  Button, 
  Table, 
  Card,
  Row,
  Col,
  Layout,
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
  Badge,
  Tabs,
  Grid,
  Dropdown,
  Space,
  Drawer
} from 'antd';
import {
  UserOutlined,
  ClockCircleOutlined,
  BookOutlined,
  CheckCircleOutlined,
  TeamOutlined,
  MessageOutlined,
  SmileOutlined,
  CalendarOutlined,
  PrinterOutlined,
  MenuOutlined,
  DownloadOutlined,
  FilePdfOutlined,
  FileTextOutlined
} from '@ant-design/icons';

const { Content } = Layout;
const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { useBreakpoint } = Grid;

// Set Axios defaults to include credentials
axios.defaults.withCredentials = true;

const StudentReports = () => {
    const [reports, setReports] = useState([]);
    const [sections, setSections] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedSection, setSelectedSection] = useState(null);
    const [selectedReport, setSelectedReport] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [activeTab, setActiveTab] = useState('performance');
    const [mobileDrawerVisible, setMobileDrawerVisible] = useState(false);
    
    const screens = useBreakpoint();
    const isMobile = !screens.md;
    const isSmallMobile = !screens.sm;
    const reportRef = useRef();

    useEffect(() => {
        fetchSections();
    }, []);

    const fetchSections = async () => {
        setLoading(true);
        try {
            const response = await axios.get('https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/Sec_Read.php');
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
        try {
            const response = await axios.get(`https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/adstdreports_read.php?section_id=${sectionId}`);
            setReports(response.data.data || []);
            if (isMobile) {
                setMobileDrawerVisible(false);
            }
        } catch (error) {
            message.error("Error fetching reports");
            console.error("Error:", error);
        } finally {
            setLoading(false);
        }
    };

    const showReportDetails = (report) => {
        setSelectedReport(report);
        setModalVisible(true);
        setActiveTab('performance');
    };

    // Print functionality
    const handlePrint = () => {
        if (!selectedReport) return;
        
        const printWindow = window.open('', '_blank');
        const printContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Student Report - ${selectedReport.student.name}</title>
                <style>
                    body { 
                        font-family: Arial, sans-serif; 
                        margin: 20px; 
                        color: #333;
                    }
                    .header { 
                        text-align: center; 
                        margin-bottom: 30px;
                        border-bottom: 2px solid #1890ff;
                        padding-bottom: 20px;
                    }
                    .student-info { 
                        margin-bottom: 20px; 
                    }
                    .metrics-grid { 
                        display: grid; 
                        grid-template-columns: repeat(3, 1fr); 
                        gap: 20px; 
                        margin-bottom: 30px;
                    }
                    .metric-card { 
                        border: 1px solid #ddd; 
                        padding: 15px; 
                        border-radius: 8px;
                        text-align: center;
                    }
                    .progress-circle {
                        width: 100px;
                        height: 100px;
                        border-radius: 50%;
                        background: conic-gradient(#1890ff 0% ${selectedReport.performance_metrics.academic_performance * 20}%, #f0f0f0 0% 100%);
                        margin: 0 auto 10px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        position: relative;
                    }
                    .progress-value {
                        font-size: 18px;
                        font-weight: bold;
                    }
                    .remarks { 
                        background: #f9f9f9; 
                        padding: 20px; 
                        border-radius: 8px;
                        margin-top: 20px;
                    }
                    .footer { 
                        margin-top: 30px; 
                        text-align: right; 
                        font-size: 12px; 
                        color: #666;
                    }
                    @media print {
                        body { margin: 0; padding: 15px; }
                        .no-print { display: none; }
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>Student Performance Report</h1>
                    <h2>${selectedReport.student.name}</h2>
                    <p>${selectedReport.section.name} • ${selectedReport.subject.name}</p>
                    <p>Report Date: ${new Date(selectedReport.report_date).toLocaleDateString()}</p>
                </div>
                
                <div class="student-info">
                    <h3>Student Information</h3>
                    <p><strong>Name:</strong> ${selectedReport.student.name}</p>
                    <p><strong>Section:</strong> ${selectedReport.section.name}</p>
                    <p><strong>Subject:</strong> ${selectedReport.subject.name}</p>
                    <p><strong>Report Date:</strong> ${new Date(selectedReport.report_date).toLocaleDateString()}</p>
                </div>
                
                <h3>Performance Metrics</h3>
                <div class="metrics-grid">
                    <div class="metric-card">
                        <h4>Academic Performance</h4>
                        <div class="progress-circle">
                            <span class="progress-value">${selectedReport.performance_metrics.academic_performance}/5</span>
                        </div>
                    </div>
                    <div class="metric-card">
                        <h4>Punctuality</h4>
                        <div class="progress-circle">
                            <span class="progress-value">${selectedReport.performance_metrics.punctuality}/5</span>
                        </div>
                    </div>
                    <div class="metric-card">
                        <h4>Homework Completion</h4>
                        <div class="progress-circle">
                            <span class="progress-value">${selectedReport.performance_metrics.homework_completion}/5</span>
                        </div>
                    </div>
                </div>
                
                <div class="remarks">
                    <h3>Overall Remarks</h3>
                    <p>${selectedReport.overall_remarks}</p>
                </div>
                
                <div class="footer">
                    <p>Generated on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</p>
                    <p>Apex School Management System</p>
                </div>
                
                <script>
                    window.onload = function() {
                        window.print();
                        setTimeout(function() {
                            window.close();
                        }, 500);
                    }
                </script>
            </body>
            </html>
        `;
        
        printWindow.document.write(printContent);
        printWindow.document.close();
    };

    const columns = [
        {
            title: 'Student',
            dataIndex: ['student', 'name'],
            key: 'student_name',
            render: (text, record) => (
                <Button 
                    type="link" 
                    onClick={() => showReportDetails(record)}
                    style={{ 
                        padding: 0, 
                        display: 'flex', 
                        alignItems: 'center',
                        height: 'auto'
                    }}
                >
                    <Avatar 
                        size={isSmallMobile ? "small" : "default"}
                        icon={<UserOutlined />} 
                        style={{ 
                            marginRight: 8, 
                            backgroundColor: '#1890ff',
                            flexShrink: 0
                        }} 
                    />
                    <span style={{ 
                        fontSize: isSmallMobile ? '12px' : '14px',
                        textAlign: 'left'
                    }}>
                        {text}
                    </span>
                </Button>
            ),
            fixed: isMobile ? 'left' : false,
            width: isMobile ? 120 : undefined,
        },
        {
            title: 'Section',
            dataIndex: ['section', 'name'],
            key: 'section_name',
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
            title: 'Subject',
            dataIndex: ['subject', 'name'],
            key: 'subject_name',
            render: (text) => (
                <Tag 
                    icon={<BookOutlined />} 
                    color="purple"
                    style={{ fontSize: isSmallMobile ? '10px' : '12px' }}
                >
                    {text}
                </Tag>
            ),
            responsive: ['lg'],
        },
        {
            title: 'Report Date',
            dataIndex: 'report_date',
            key: 'report_date',
            render: (date) => (
                <div style={{ fontSize: isSmallMobile ? '11px' : '13px' }}>
                    <CalendarOutlined style={{ marginRight: 5 }} />
                    {new Date(date).toLocaleDateString()}
                </div>
            ),
            responsive: ['md'],
        },
        {
            title: 'Score',
            key: 'status',
            render: (_, record) => {
                const avgScore = (
                    (record.performance_metrics.academic_performance +
                     record.performance_metrics.punctuality +
                     record.performance_metrics.homework_completion) / 3
                ).toFixed(1);
                
                let color = '';
                if (avgScore >= 4) color = 'green';
                else if (avgScore >= 2.5) color = 'orange';
                else color = 'red';
                
                return (
                    <Badge 
                        count={avgScore} 
                        style={{ 
                            backgroundColor: color,
                            fontSize: isSmallMobile ? '0.8em' : '0.9em',
                            padding: '0 6px',
                            height: 20,
                            lineHeight: '20px'
                        }} 
                    />
                );
            },
            fixed: isMobile ? 'right' : false,
            width: isMobile ? 60 : undefined,
        }
    ];

    const getProgressColor = (value) => {
        if (value >= 4) return '#52c41a';
        if (value >= 2.5) return '#faad14';
        return '#f5222d';
    };

    const getPerformanceTag = (value) => {
        if (value >= 4) return <Tag icon={<CheckCircleOutlined />} color="success">Excellent</Tag>;
        if (value >= 2.5) return <Tag icon={<SmileOutlined />} color="warning">Good</Tag>;
        return <Tag icon={<ClockCircleOutlined />} color="error">Needs Improvement</Tag>;
    };

    const renderMetricCard = (value, title, icon, maxValue = 5) => {
        const percentage = (value / maxValue) * 100;
        return (
            <Card 
                bordered={false} 
                style={{ 
                    boxShadow: '0 4px 12px 0 rgba(0,0,0,0.08)',
                    borderRadius: 8,
                    height: '100%'
                }}
                bodyStyle={{ padding: isSmallMobile ? '12px' : '16px' }}
            >
                <div style={{ textAlign: 'center' }}>
                    <div style={{ 
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: 12,
                        color: '#1890ff'
                    }}>
                        {icon}
                        <Title level={isSmallMobile ? 5 : 4} style={{ margin: '0 0 0 8px' }}>
                            {title}
                        </Title>
                    </div>
                    <Progress
                        type="dashboard"
                        percent={percentage}
                        strokeColor={getProgressColor(value)}
                        strokeWidth={8}
                        format={() => (
                            <div style={{ 
                                fontSize: isSmallMobile ? 18 : 24, 
                                fontWeight: 'bold' 
                            }}>
                                {value.toFixed(1)}<span style={{ fontSize: isSmallMobile ? 12 : 14 }}>/{maxValue}</span>
                            </div>
                        )}
                        width={isSmallMobile ? 100 : 120}
                    />
                    <div style={{ marginTop: 12 }}>
                        {getPerformanceTag(value)}
                    </div>
                </div>
            </Card>
        );
    };

    const renderScoreDisplay = (value, title, icon) => {
        return (
            <Card 
                size="small" 
                title={
                    <span style={{ fontSize: isSmallMobile ? '12px' : '14px' }}>
                        {icon} {title}
                    </span>
                }
                bodyStyle={{ padding: isSmallMobile ? '8px' : '12px' }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text strong style={{ fontSize: isSmallMobile ? '14px' : '16px' }}>
                        {value}/5
                    </Text>
                    {getPerformanceTag(value)}
                </div>
            </Card>
        );
    };

    const renderPerformanceTab = () => (
        <>
            <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
                <Col xs={24} sm={8}>
                    {renderMetricCard(
                        selectedReport.performance_metrics.academic_performance,
                        'Academic',
                        <BookOutlined />
                    )}
                </Col>
                <Col xs={24} sm={8}>
                    {renderMetricCard(
                        selectedReport.performance_metrics.punctuality,
                        'Punctuality',
                        <ClockCircleOutlined />
                    )}
                </Col>
                <Col xs={24} sm={8}>
                    {renderMetricCard(
                        selectedReport.performance_metrics.homework_completion,
                        'Homework',
                        <CheckCircleOutlined />
                    )}
                </Col>
            </Row>

            <Divider orientation="left" style={{ marginTop: 0 }}>Additional Metrics</Divider>
            
            <Row gutter={[12, 12]}>
                <Col xs={24} sm={12}>
                    {renderScoreDisplay(
                        selectedReport.performance_metrics.class_participation,
                        'Class Participation',
                        <TeamOutlined style={{ marginRight: 4 }} />
                    )}
                </Col>
                <Col xs={24} sm={12}>
                    {renderScoreDisplay(
                        selectedReport.performance_metrics.behavior,
                        'Behavior',
                        <SmileOutlined style={{ marginRight: 4 }} />
                    )}
                </Col>
                <Col xs={24} sm={12}>
                    {renderScoreDisplay(
                        selectedReport.performance_metrics.grooming,
                        'Grooming',
                        <UserOutlined style={{ marginRight: 4 }} />
                    )}
                </Col>
                <Col xs={24} sm={12}>
                    {renderScoreDisplay(
                        selectedReport.performance_metrics.communication_skills,
                        'Communication',
                        <MessageOutlined style={{ marginRight: 4 }} />
                    )}
                </Col>
                <Col xs={24}>
                    <Card 
                        size="small" 
                        title={
                            <span>
                                <CalendarOutlined style={{ marginRight: 4 }} />
                                Attendance
                            </span>
                        }
                        bodyStyle={{ padding: isSmallMobile ? '8px' : '12px' }}
                    >
                        <Text strong style={{ fontSize: isSmallMobile ? '14px' : '16px' }}>
                            {selectedReport.performance_metrics.attendance}
                        </Text>
                    </Card>
                </Col>
            </Row>
        </>
    );

    const renderDetailsTab = () => (
        <Descriptions 
            bordered 
            column={1} 
            size="small"
            labelStyle={{ 
                width: 120,
                fontSize: isSmallMobile ? '12px' : '14px'
            }}
            contentStyle={{ fontSize: isSmallMobile ? '12px' : '14px' }}
        >
            <Descriptions.Item label="Student Name">
                <Avatar 
                    size="small" 
                    icon={<UserOutlined />} 
                    style={{ marginRight: 8, backgroundColor: '#1890ff' }} 
                />
                {selectedReport.student.name}
            </Descriptions.Item>
            <Descriptions.Item label="Section">
                <Tag icon={<TeamOutlined />} color="blue">
                    {selectedReport.section.name}
                </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Subject">
                <Tag icon={<BookOutlined />} color="purple">
                    {selectedReport.subject.name}
                </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Report Date">
                <CalendarOutlined style={{ marginRight: 8 }} />
                {new Date(selectedReport.report_date).toLocaleDateString()}
            </Descriptions.Item>
            <Descriptions.Item label="Last Updated">
                <ClockCircleOutlined style={{ marginRight: 8 }} />
                {new Date(selectedReport.updated_at).toLocaleDateString()}
            </Descriptions.Item>
        </Descriptions>
    );

    const renderRemarksTab = () => (
        <Card 
            style={{ 
                background: '#fafafa',
                border: '1px solid #f0f0f0'
            }}
            bodyStyle={{ padding: isSmallMobile ? 16 : 24 }}
        >
            <Text style={{ 
                fontSize: isSmallMobile ? 13 : 15, 
                lineHeight: 1.6,
                display: 'block'
            }}>
                {selectedReport.overall_remarks}
            </Text>
        </Card>
    );

    const SectionButtons = () => (
        <Row gutter={[8, 8]} style={{ marginBottom: 16 }}>
            {sections.map(section => (
                <Col key={section.id}>
                    <Button
                        type={selectedSection === section.id ? 'primary' : 'default'}
                        onClick={() => fetchReportsBySection(section.id)}
                        icon={<TeamOutlined />}
                        size={isSmallMobile ? 'small' : 'middle'}
                        style={{ 
                            minWidth: isSmallMobile ? 80 : 100,
                            fontSize: isSmallMobile ? '12px' : '14px'
                        }}
                    >
                        {section.name}
                    </Button>
                </Col>
            ))}
        </Row>
    );

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Content style={{ 
                padding: isSmallMobile ? '12px' : (isMobile ? '16px' : '24px'),
                background: '#f5f7fa'
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
                                Student Reports
                            </Title>
                        </div>
                    }
                    extra={
                        !isMobile && (
                            <Text type="secondary" style={{ fontSize: isSmallMobile ? '12px' : '14px' }}>
                                {new Date().toLocaleDateString('en-US', { 
                                    weekday: 'long', 
                                    year: 'numeric', 
                                    month: 'long', 
                                    day: 'numeric' 
                                })}
                            </Text>
                        )
                    }
                    bordered={false}
                    style={{ 
                        boxShadow: '0 2px 8px rgba(0,0,0,0.09)',
                        borderRadius: '8px'
                    }}
                    bodyStyle={{ 
                        padding: isSmallMobile ? '12px' : (isMobile ? '16px' : '24px')
                    }}
                >
                    {isMobile ? (
                        <>
                            <Button 
                                icon={<TeamOutlined />}
                                onClick={() => setMobileDrawerVisible(true)}
                                style={{ marginBottom: 16 }}
                                block
                            >
                                Select Section
                            </Button>
                            <Drawer
                                title="Select Section"
                                placement="left"
                                onClose={() => setMobileDrawerVisible(false)}
                                open={mobileDrawerVisible}
                                width={250}
                            >
                                <SectionButtons />
                            </Drawer>
                        </>
                    ) : (
                        <SectionButtons />
                    )}

                    {selectedSection && (
                        <Spin spinning={loading}>
                            <Table 
                                columns={columns} 
                                dataSource={reports} 
                                rowKey="id"
                                bordered
                                size={isSmallMobile ? 'small' : 'middle'}
                                locale={{ emptyText: 'No reports found for this section' }}
                                pagination={{
                                    pageSize: 10,
                                    showSizeChanger: false,
                                    showTotal: (total) => `Total ${total} students`,
                                    simple: isMobile,
                                    size: isSmallMobile ? 'small' : 'default'
                                }}
                                scroll={{ x: isMobile ? 500 : true }}
                            />
                        </Spin>
                    )}
                </Card>

                {/* Report Details Modal */}
                <Modal
                    title={
                        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
                            <Avatar 
                                size={isSmallMobile ? "default" : "large"}
                                icon={<UserOutlined />} 
                                style={{ 
                                    marginRight: 12,
                                    backgroundColor: '#1890ff',
                                    flexShrink: 0
                                }} 
                            />
                            <span>
                                <div style={{ 
                                    fontSize: isSmallMobile ? '14px' : '16px',
                                    fontWeight: 'bold'
                                }}>
                                    {selectedReport?.student?.name || 'Student Report'}
                                </div>
                                <div style={{ 
                                    fontSize: isSmallMobile ? '12px' : '14px', 
                                    fontWeight: 'normal', 
                                    color: '#666' 
                                }}>
                                    {selectedReport?.section?.name} • {selectedReport?.subject?.name}
                                </div>
                            </span>
                        </div>
                    }
                    visible={modalVisible}
                    onCancel={() => setModalVisible(false)}
                    footer={[
                        <Button key="print" icon={<PrinterOutlined />} onClick={handlePrint}>
                            Print Report
                        </Button>,
                        <Button key="close" onClick={() => setModalVisible(false)}>
                            Close
                        </Button>
                    ]}
                    width={isMobile ? '95%' : 800}
                    bodyStyle={{ 
                        padding: isSmallMobile ? '12px' : (isMobile ? '16px' : '24px'),
                        maxHeight: '70vh',
                        overflowY: 'auto'
                    }}
                    centered
                >
                    {selectedReport && (
                        <>
                            <Tabs 
                                activeKey={activeTab} 
                                onChange={setActiveTab}
                                animated
                                size={isSmallMobile ? 'small' : 'default'}
                            >
                                <TabPane tab="Performance" key="performance">
                                    {renderPerformanceTab()}
                                </TabPane>
                                <TabPane tab="Details" key="details">
                                    {renderDetailsTab()}
                                </TabPane>
                                <TabPane tab="Remarks" key="remarks">
                                    {renderRemarksTab()}
                                </TabPane>
                            </Tabs>

                            <Divider style={{ margin: '16px 0' }} />

                            <Row justify="space-between" align="middle">
                                <Col>
                                    <Statistic
                                        title="Overall Score"
                                        value={(
                                            (selectedReport.performance_metrics.academic_performance +
                                             selectedReport.performance_metrics.punctuality +
                                             selectedReport.performance_metrics.homework_completion) / 3
                                        ).toFixed(1)}
                                        suffix="/ 5.0"
                                        valueStyle={{ 
                                            color: getProgressColor((
                                                selectedReport.performance_metrics.academic_performance +
                                                selectedReport.performance_metrics.punctuality +
                                                selectedReport.performance_metrics.homework_completion
                                            ) / 3),
                                            fontSize: isSmallMobile ? '16px' : '20px'
                                        }}
                                    />
                                </Col>
                                <Col>
                                    <Text type="secondary" style={{ fontSize: isSmallMobile ? '11px' : '12px' }}>
                                        Last updated: {new Date(selectedReport.updated_at).toLocaleDateString()}
                                    </Text>
                                </Col>
                            </Row>
                        </>
                    )}
                </Modal>
            </Content>
        </Layout>
    );
};

export default StudentReports;