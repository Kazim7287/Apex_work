import { useState, useEffect, useRef } from "react";
import { Layout, Table, Typography, Row, Col, Spin, Button, message, Drawer, Empty, Popconfirm, Card } from "antd";
import Sidebar from "./Sidebar";
import axios from "axios";
import { ScheduleOutlined, MenuOutlined, EditOutlined, DeleteOutlined, PrinterOutlined } from '@ant-design/icons';
import TimetableModal from "./TimetableModal";
import ScheduleModal from "./ScheduleModal";
import './Timetable.css';
import { useNavigate } from "react-router-dom";

const { Content, Sider } = Layout;
const { Title, Text } = Typography;

const Timetable = () => {
    const navigate = useNavigate();
    const [sections, setSections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedSection, setSelectedSection] = useState(null);
    const [sectionData, setSectionData] = useState([]);
    const [timetableData, setTimetableData] = useState([]);
    const [groupedTimetableData, setGroupedTimetableData] = useState({});
    const [loadingSectionData, setLoadingSectionData] = useState(false);
    const [loadingTimetable, setLoadingTimetable] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isTimetableModalVisible, setIsTimetableModalVisible] = useState(false);
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [selectedTimetableEntry, setSelectedTimetableEntry] = useState(null);
    const [activeButtonId, setActiveButtonId] = useState(null);
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const [mobileMenuVisible, setMobileMenuVisible] = useState(false);
    const printRef = useRef();

    // Configure axios to include credentials
    axios.defaults.withCredentials = true;

    useEffect(() => {
        const handleResize = () => {
            setWindowWidth(window.innerWidth);
            if (window.innerWidth > 768 && mobileMenuVisible) {
                setMobileMenuVisible(false);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [mobileMenuVisible]);

    useEffect(() => {
        const fetchSections = async () => {
            try {
                const response = await axios.get("https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/Sec_Read.php", {
                    withCredentials: true
                });
                
                if (response.status === 401) {
                    navigate('/admin-signin');
                    return;
                }
                
                setSections(response.data);
                setLoading(false);
            } catch (err) {
                if (err.response?.status === 401) {
                    navigate('/admin-signin');
                } else {
                    setError(err.message);
                    setLoading(false);
                }
            }
        };

        fetchSections();
    }, [navigate]);

    useEffect(() => {
        if (selectedSection) {
            const fetchData = async () => {
                try {
                    setLoadingSectionData(true);
                    setLoadingTimetable(true);
                    
                    const filterResponse = await axios.get(
                        `https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/FilterAd.php?section_id=${selectedSection}`,
                        { withCredentials: true }
                    );
                    
                    if (filterResponse.status === 401) {
                        navigate('/admin-signin');
                        return;
                    }
                    
                    // Transform the data to include all necessary fields
                    const transformedData = filterResponse.data.map(item => ({
                        ...item,
                        tech_name: item.teach_name, // Ensure consistent naming
                        section_name: item.section_name
                    }));
                    
                    setSectionData(transformedData);
                    
                    const timetableResponse = await axios.get(
                        `https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/GetAdTimetable.php?section_id=${selectedSection}`,
                        { withCredentials: true }
                    );
                    
                    if (timetableResponse.status === 401) {
                        navigate('/admin-signin');
                        return;
                    }
                    
                    if (timetableResponse.data.status === 'success') {
                        setTimetableData(timetableResponse.data.timetable || []);
                        groupTimetableByDay(timetableResponse.data.timetable || []);
                    } else {
                        setTimetableData([]);
                        setGroupedTimetableData({});
                    }
                    
                    setLoadingSectionData(false);
                    setLoadingTimetable(false);
                } catch (err) {
                    if (err.response?.status === 401) {
                        navigate('/admin-signin');
                    } else if (err.response?.status === 404) {
                        setTimetableData([]);
                        setGroupedTimetableData({});
                    } else {
                        setError(err.message);
                    }
                    setLoadingSectionData(false);
                    setLoadingTimetable(false);
                }
            };

            fetchData();
        }
    }, [selectedSection, navigate]);

    const groupTimetableByDay = (data) => {
        const grouped = {};
        const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        
        // Initialize empty arrays for each day
        dayOrder.forEach(day => {
            grouped[day] = [];
        });
        
        // Group entries by day
        data.forEach(entry => {
            if (grouped[entry.day]) {
                grouped[entry.day].push(entry);
            } else {
                grouped[entry.day] = [entry];
            }
        });
        
        // Sort entries by start time within each day
        dayOrder.forEach(day => {
            if (grouped[day].length > 0) {
                grouped[day].sort((a, b) => {
                    const timeA = new Date(`1970-01-01T${a.start_time}`);
                    const timeB = new Date(`1970-01-01T${b.start_time}`);
                    return timeA - timeB;
                });
            }
        });
        
        setGroupedTimetableData(grouped);
    };

    const showModal = (record) => {
        setSelectedRecord(record);
        setIsModalVisible(true);
        setActiveButtonId(record.id);
    };

    const showEditModal = (record) => {
        setSelectedTimetableEntry(record);
        setIsEditModalVisible(true);
    };

    const showTimetableModal = async () => {
        try {
            setLoadingTimetable(true);
            const response = await axios.get(
                `https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/GetAdTimetable.php?section_id=${selectedSection}`,
                { withCredentials: true }
            );
            
            if (response.status === 401) {
                navigate('/admin/login');
                return;
            }
            
            if (response.data.status === 'success') {
                setTimetableData(response.data.timetable || []);
                groupTimetableByDay(response.data.timetable || []);
                setIsTimetableModalVisible(true);
            } else {
                setTimetableData([]);
                setGroupedTimetableData({});
                setIsTimetableModalVisible(true);
            }
        } catch (err) {
            if (err.response?.status === 401) {
                navigate('/admin/login');
            } else if (err.response?.status === 404) {
                setTimetableData([]);
                setGroupedTimetableData({});
                setIsTimetableModalVisible(true);
            } else {
                message.error('Failed to fetch timetable data');
                console.error(err);
            }
        } finally {
            setLoadingTimetable(false);
        }
    };

    const handleCancel = () => {
        setIsModalVisible(false);
        setActiveButtonId(null);
    };

    const handleEditCancel = () => {
        setIsEditModalVisible(false);
        setSelectedTimetableEntry(null);
    };

    const handleTimetableModalCancel = () => {
        setIsTimetableModalVisible(false);
    };

    const handleSectionSelect = (sectionId) => {
        if (selectedSection !== sectionId) {
            setSelectedSection(sectionId);
            setActiveButtonId(null);
        }
        if (windowWidth <= 768) {
            setMobileMenuVisible(false);
        }
    };

    const handleSubmit = async (values) => {
        try {
            if (!selectedRecord || !selectedSection) {
                throw new Error("No teacher/subject/section selected");
            }

            const requestData = {
                teacher_id: selectedRecord.teacher_id,
                subject_id: selectedRecord.subject_id,
                section_id: selectedRecord.section_id,
                day: values.day,
                start_time: values.time_range[0].format('HH:mm:ss'),
                end_time: values.time_range[1].format('HH:mm:ss')
            };

            const response = await axios.post(
                'https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/timetable.php',
                requestData,
                { 
                    headers: { 'Content-Type': 'application/json' },
                    withCredentials: true 
                }
            );

            if (response.status === 401) {
                navigate('/admin-signin');
                return;
            }

            if (response.data.success) {
                message.success('Timetable entry added successfully');
                setIsModalVisible(false);
                setActiveButtonId(null);
                refreshTimetableData();
            }
        } catch (error) {
            if (error.response?.status === 401) {
                navigate('/admin-signin');
            } else {
                message.error(error.response?.data?.error || error.message || 'Failed to add timetable entry');
            }
        }
    };

    const handleEditSubmit = async (values) => {
        try {
            if (!selectedTimetableEntry) {
                throw new Error("No timetable entry selected");
            }

            const requestData = {
                id: selectedTimetableEntry.id,
                teacher_id: selectedTimetableEntry.teacher_id,
                subject_id: selectedTimetableEntry.subject_id,
                section_id: selectedTimetableEntry.section_id,
                day: values.day,
                start_time: values.time_range[0].format('HH:mm:ss'),
                end_time: values.time_range[1].format('HH:mm:ss')
            };

            const response = await axios.put(
                'https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/timetableupdate.php',
                requestData,
                { 
                    headers: { 'Content-Type': 'application/json' },
                    withCredentials: true 
                }
            );

            if (response.status === 401) {
                navigate('/admin/login');
                return;
            }

            if (response.data.success) {
                message.success('Timetable entry updated successfully');
                setIsEditModalVisible(false);
                setSelectedTimetableEntry(null);
                refreshTimetableData();
            }
        } catch (error) {
            if (error.response?.status === 401) {
                navigate('/admin-signin');
            } else {
                message.error(error.response?.data?.error || error.message || 'Failed to update timetable entry');
            }
        }
    };

    const handleDelete = async (id) => {
        try {
            const response = await axios.delete(
                `https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/timetabledelete.php?id=${id}`,
                { withCredentials: true }
            );
            
            if (response.status === 401) {
                navigate('/admin-signin');
                return;
            }

            if (response.data.success) {
                message.success('Timetable entry deleted successfully');
                refreshTimetableData();
            }
        } catch (error) {
            if (error.response?.status === 401) {
                navigate('/admin/login');
            } else {
                message.error(error.response?.data?.error || error.message || 'Failed to delete timetable entry');
            }
        }
    };

    const refreshTimetableData = async () => {
        try {
            setLoadingTimetable(true);
            const response = await axios.get(
                `https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/GetAdTimetable.php?section_id=${selectedSection}`,
                { withCredentials: true }
            );
            
            if (response.status === 401) {
                navigate('/admin-signin');
                return;
            }

            if (response.data.status === 'success') {
                setTimetableData(response.data.timetable || []);
                groupTimetableByDay(response.data.timetable || []);
            }
        } catch (error) {
            if (error.response?.status === 401) {
                navigate('/admin-signin');
            } else {
                console.error('Error refreshing timetable:', error);
            }
        } finally {
            setLoadingTimetable(false);
        }
    };

    const formatTimeDisplay = (timeString) => {
        if (!timeString) return '';
        
        try {
            const [hours, minutes] = timeString.split(':');
            const hour = parseInt(hours, 10);
            const ampm = hour >= 12 ? 'PM' : 'AM';
            const displayHour = hour % 12 || 12;
            const displayMinutes = minutes.length > 2 ? minutes.substring(0, 2) : minutes;
            
            return `${displayHour}:${displayMinutes} ${ampm}`;
        } catch (e) {
            console.error('Error formatting time:', timeString, e);
            return timeString;
        }
    };

    // Function to handle printing
    const handlePrint = () => {
        if (!timetableData || timetableData.length === 0) {
            message.warning('No timetable data to print');
            return;
        }

        const printWindow = window.open('', '_blank');
        const sectionName = sections.find(s => s.id === selectedSection)?.name || 'Selected Section';
        
        const printContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Timetable - ${sectionName}</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    .print-header { text-align: center; margin-bottom: 20px; }
                    .print-header h1 { margin: 0; color: #1890ff; }
                    .print-header p { margin: 5px 0; }
                    .day-section { margin-bottom: 20px; page-break-inside: avoid; }
                    .day-title { background-color: #f0f0f0; padding: 8px; font-weight: bold; border-radius: 4px; }
                    .class-card { margin: 8px 0; padding: 12px; border: 1px solid #ddd; border-radius: 4px; }
                    .class-time { font-weight: bold; color: #1890ff; }
                    .class-details { margin-top: 5px; }
                    .print-footer { margin-top: 30px; text-align: right; font-size: 12px; color: #666; }
                    @media print {
                        body { margin: 0; }
                        .print-header { margin-bottom: 15px; }
                        .day-section { page-break-inside: avoid; }
                    }
                </style>
            </head>
            <body>
                <div class="print-header">
                    <h1>Class Timetable</h1>
                    <p><strong>Section:</strong> ${sectionName}</p>
                    <p><strong>Generated on:</strong> ${new Date().toLocaleDateString()}</p>
                </div>
                
                ${Object.entries(groupedTimetableData).map(([day, classes]) => {
                    if (classes.length === 0) return '';
                    
                    return `
                        <div class="day-section">
                            <div class="day-title">${day}</div>
                            ${classes.map(cls => `
                                <div class="class-card">
                                    <div class="class-time">
                                        ${formatTimeDisplay(cls.start_time)} - ${formatTimeDisplay(cls.end_time)}
                                    </div>
                                    <div class="class-details">
                                        <strong>${cls.subject_name}</strong> with ${cls.teacher_name}
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    `;
                }).join('')}
                
                <div class="print-footer">
                    Printed from Apex Education System
                </div>
            </body>
            </html>
        `;

        printWindow.document.write(printContent);
        printWindow.document.close();
        
        // Wait for content to load before printing
        printWindow.onload = function() {
            printWindow.focus();
            printWindow.print();
            // printWindow.close(); // Uncomment if you want to automatically close after printing
        };
    };

    // Define columns for the teachers/subjects table
    const columns = [
        { 
            title: "Teacher", 
            dataIndex: "teach_name", 
            key: "teacher",
            responsive: ['md'],
            render: (text, record) => (
                <div className="teacher-cell">
                    <strong>{text}</strong>
                    <div className="subject-text">{record.subject_name}</div>
                </div>
            )
        },
        { 
            title: "Subject", 
            dataIndex: "subject_name", 
            key: "subject",
            render: (text) => <strong>{text}</strong>
        },
        { 
            title: "Section", 
            dataIndex: "section_name", 
            key: "section",
            responsive: ['md'],
            render: (text) => <strong>{text}</strong>
        },
        { 
            title: "Actions", 
            key: "actions",
            render: (_, record) => (
                <Button 
                    type={activeButtonId === record.id ? "primary" : "default"}
                    onClick={() => showModal(record)}
                    className={`schedule-btn ${activeButtonId === record.id ? 'active' : ''}`}
                    size={windowWidth < 768 ? "small" : "middle"}
                >
                    {windowWidth < 768 ? 'Schedule' : 'Schedule Time'}
                </Button>
            )
        }
    ];

    // Define columns for the timetable modal
    const timetableColumns = [
        {
            title: 'Day',
            dataIndex: 'day',
            key: 'day',
            width: 120,
            fixed: windowWidth < 768 ? 'left' : false,
        },
        {
            title: 'Time',
            dataIndex: 'start_time',
            key: 'time',
            render: (_, record) => (
                <span>
                    {formatTimeDisplay(record.start_time)} - {formatTimeDisplay(record.end_time)}
                </span>
            ),
            width: 150,
        },
        {
            title: 'Subject',
            dataIndex: 'subject_name',
            key: 'subject',
        },
        {
            title: 'Teacher',
            dataIndex: 'teacher_name',
            key: 'teacher',
            responsive: ['md'],
        },
        {
            title: 'Section',
            dataIndex: 'section_name',
            key: 'section',
            responsive: ['md'],
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <div style={{ display: 'flex', gap: '8px' }}>
                    <Button
                        type="text"
                        icon={<EditOutlined />}
                        onClick={() => showEditModal(record)}
                        size="small"
                    />
                    <Popconfirm
                        title="Are you sure to delete this entry?"
                        onConfirm={() => handleDelete(record.id)}
                        okText="Yes"
                        cancelText="No"
                    >
                        <Button
                            type="text"
                            icon={<DeleteOutlined />}
                            danger
                            size="small"
                        />
                    </Popconfirm>
                </div>
            ),
        },
    ];

    // Render the grouped timetable view
    const renderGroupedTimetable = () => {
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        
        return (
            <div className="timetable-view">
                {days.map(day => (
                    groupedTimetableData[day] && groupedTimetableData[day].length > 0 ? (
                        <Card 
                            key={day} 
                            title={day} 
                            size="small" 
                            style={{ marginBottom: 16 }}
                            className="timetable-day-card"
                        >
                            {groupedTimetableData[day].map((entry, index) => (
                                <Card.Grid 
                                    key={index} 
                                    style={{ 
                                        width: '100%', 
                                        boxShadow: 'none',
                                        cursor: 'pointer'
                                    }}
                                    hoverable
                                    onClick={() => showEditModal(entry)}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <Text strong style={{ fontSize: '16px' }}>
                                                {formatTimeDisplay(entry.start_time)} - {formatTimeDisplay(entry.end_time)}
                                            </Text>
                                            <div>
                                                <Text strong>{entry.subject_name}</Text> with {entry.teacher_name}
                                            </div>
                                        </div>
                                        <div>
                                            <Button
                                                type="text"
                                                icon={<EditOutlined />}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    showEditModal(entry);
                                                }}
                                                size="small"
                                            />
                                            <Popconfirm
                                                title="Are you sure to delete this entry?"
                                                onConfirm={(e) => {
                                                    e?.stopPropagation();
                                                    handleDelete(entry.id);
                                                }}
                                                okText="Yes"
                                                cancelText="No"
                                            >
                                                <Button
                                                    type="text"
                                                    icon={<DeleteOutlined />}
                                                    danger
                                                    size="small"
                                                    onClick={(e) => e.stopPropagation()}
                                                />
                                            </Popconfirm>
                                        </div>
                                    </div>
                                </Card.Grid>
                            ))}
                        </Card>
                    ) : null
                ))}
            </div>
        );
    };

    if (loading) return <Spin size="large" fullscreen />;
    if (error) return <div className="error-message">Error: {error}</div>;

    return (
        <Layout style={{ minHeight: '100vh' }} className="timetable-container">
            {/* Mobile menu button */}
            {windowWidth <= 768 && (
                <Button 
                    type="primary" 
                    icon={<MenuOutlined />} 
                    onClick={() => setMobileMenuVisible(true)}
                    style={{
                        position: 'fixed',
                        top: 16,
                        left: 16,
                        zIndex: 1000
                    }}
                />
            )}

            {/* Desktop Sidebar */}
            {windowWidth > 768 && (
                <Sider width={190} className="site-layout-background">
                    <Sidebar />
                </Sider>
            )}

            {/* Mobile Sidebar Drawer */}
            {windowWidth <= 768 && (
                <Drawer
                    title="Menu"
                    placement="left"
                    closable={true}
                    onClose={() => setMobileMenuVisible(false)}
                    visible={mobileMenuVisible}
                    width={200}
                    bodyStyle={{ padding: 0 }}
                >
                    <Sidebar />
                </Drawer>
            )}

            <Layout>
                <Content className="timetable-content" style={{ padding: windowWidth <= 768 ? '16px' : '24px' }}>
                    <Title level={2} className="timetable-title" style={{ fontSize: windowWidth <= 768 ? '20px' : '24px' }}>
                        Timetable Setup
                    </Title>

                    <div className="section-selector">
                        <Title level={4} className="section-title" style={{ fontSize: windowWidth <= 768 ? '16px' : '18px' }}>
                            Select Section
                        </Title>
                        <Row gutter={[8, 8]} justify={windowWidth < 768 ? "start" : "start"}>
                            {sections.map((section) => (
                                <Col key={section.id} xs={12} sm={8} md={6} lg={4} xl={3}>
                                    <Button
                                        type={selectedSection === section.id ? "primary" : "default"}
                                        onClick={() => handleSectionSelect(section.id)}
                                        className={`section-button ${selectedSection === section.id ? 'active' : ''}`}
                                        size={windowWidth < 768 ? "small" : "middle"}
                                        style={{ width: '100%' }}
                                    >
                                        {section.name}
                                    </Button>
                                </Col>
                            ))}
                        </Row>
                    </div>

                    {loadingSectionData && <Spin size="large" fullscreen />}

                    {selectedSection && (
                        <>
                            <div className="table-container" style={{ marginTop: '16px' }}>
                                <Table 
                                    dataSource={sectionData} 
                                    columns={columns} 
                                    rowKey="id"
                                    title={() => (
                                        <div style={{ fontSize: windowWidth <= 768 ? '14px' : '16px' }}>
                                            Teachers and Subjects for {sections.find(s => s.id === selectedSection)?.name}
                                        </div>
                                    )}
                                    bordered
                                    pagination={false}
                                    scroll={windowWidth < 768 ? { x: true } : undefined}
                                    size={windowWidth < 768 ? "small" : "middle"}
                                    className="teachers-table"
                                    locale={{
                                        emptyText: (
                                            <Empty
                                                description="No teachers assigned to this section"
                                                image={Empty.PRESENTED_IMAGE_SIMPLE}
                                            />
                                        )
                                    }}
                                />
                            </div>
                            
                            <div className="action-buttons" style={{ 
                                marginTop: '16px',
                                display: 'flex',
                                gap: '8px',
                                justifyContent: windowWidth <= 768 ? 'space-between' : 'flex-start'
                            }}>
                                <Button 
                                    type="primary" 
                                    icon={<ScheduleOutlined />} 
                                    onClick={showTimetableModal}
                                    className="view-timetable-btn"
                                    loading={loadingTimetable}
                                    size={windowWidth < 768 ? "small" : "middle"}
                                >
                                    {windowWidth < 768 ? 'View' : 'View Timetable'}
                                </Button>
                                
                                <Button 
                                    type="default" 
                                    icon={<PrinterOutlined />} 
                                    onClick={handlePrint}
                                    className="print-timetable-btn"
                                    disabled={timetableData.length === 0}
                                    size={windowWidth < 768 ? "small" : "middle"}
                                >
                                    {windowWidth < 768 ? 'Print' : 'Print Timetable'}
                                </Button>
                            </div>

                            {/* Grouped Timetable View */}
                            {timetableData.length > 0 && (
                                <div style={{ marginTop: '24px' }}>
                                    <Title level={4} style={{ fontSize: windowWidth <= 768 ? '16px' : '18px' }}>
                                        Timetable for {sections.find(s => s.id === selectedSection)?.name}
                                    </Title>
                                    {renderGroupedTimetable()}
                                </div>
                            )}

                            <TimetableModal
                                visible={isTimetableModalVisible}
                                onCancel={handleTimetableModalCancel}
                                loading={loadingTimetable}
                                timetableData={timetableData}
                                section={sections.find(s => s.id === selectedSection)}
                                windowWidth={windowWidth}
                                noDataMessage="No timetable scheduled yet for this section"
                                onEdit={showEditModal}
                                onDelete={handleDelete}
                                columns={timetableColumns}
                            />

                            <ScheduleModal
                                visible={isModalVisible}
                                onCancel={handleCancel}
                                selectedRecord={selectedRecord}
                                windowWidth={windowWidth}
                                onSubmit={handleSubmit}
                                mode="create"
                            />

                            <ScheduleModal
                                visible={isEditModalVisible}
                                onCancel={handleEditCancel}
                                selectedRecord={selectedTimetableEntry}
                                windowWidth={windowWidth}
                                onSubmit={handleEditSubmit}
                                mode="edit"
                            />
                        </>
                    )}
                </Content>
            </Layout>
        </Layout>
    );
};

export default Timetable;