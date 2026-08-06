import { useState, useEffect, useRef } from "react";
import { Layout, Table, Typography, Row, Col, Spin, Button, message, Drawer, Empty, Popconfirm, Card, Modal, Space } from "antd";
import Sidebar from "./Sidebar";
import axios from "axios";
import { ScheduleOutlined, MenuOutlined, EditOutlined, DeleteOutlined, PrinterOutlined, DeleteFilled } from '@ant-design/icons';
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

    // State for bulk selection and deletion
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [isBulkDeleteModalVisible, setIsBulkDeleteModalVisible] = useState(false);
    const [bulkDeleteLoading, setBulkDeleteLoading] = useState(false);

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
                const response = await publicApi.get("Sec_Read.php");
                
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
                    
                    const filterResponse = await publicApi.get(
                        `FilterAd.php?section_id=${selectedSection}`
                    );
                    
                    if (filterResponse.status === 401) {
                        navigate('/admin-signin');
                        return;
                    }
                    
                    const transformedData = filterResponse.data.map(item => ({
                        ...item,
                        tech_name: item.teach_name,
                        section_name: item.section_name
                    }));
                    
                    setSectionData(transformedData);
                    
                    const timetableResponse = await publicApi.get(
                        `GetAdTimetable.php?section_id=${selectedSection}`
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
        
        dayOrder.forEach(day => {
            grouped[day] = [];
        });
        
        data.forEach(entry => {
            if (grouped[entry.day]) {
                grouped[entry.day].push(entry);
            } else {
                grouped[entry.day] = [entry];
            }
        });
        
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
            const response = await publicApi.get(
                `GetAdTimetable.php?section_id=${selectedSection}`
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
        setSelectedRowKeys([]);
    };

    const handleSectionSelect = (sectionId) => {
        if (selectedSection !== sectionId) {
            setSelectedSection(sectionId);
            setActiveButtonId(null);
            setSelectedRowKeys([]);
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

            const response = await authApi.post('timetable.php', requestData);

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

            const response = await authApi.put('timetableupdate.php', requestData);

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

    // Handle single delete
    const handleDelete = async (id) => {
        try {
            const response = await authApi.delete(`timetabledelete.php?id=${id}`);
            
            if (response.status === 401) {
                navigate('/admin-signin');
                return;
            }

            if (response.data.success) {
                message.success(response.data.message || 'Timetable entry deleted successfully');
                setSelectedRowKeys(selectedRowKeys.filter(key => key !== id));
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

    // Handle bulk delete
    const handleBulkDelete = () => {
        if (selectedRowKeys.length === 0) {
            message.warning('Please select at least one entry to delete');
            return;
        }
        setIsBulkDeleteModalVisible(true);
    };

    const confirmBulkDelete = async () => {
        try {
            setBulkDeleteLoading(true);
            setIsBulkDeleteModalVisible(false);
            
            const idsParam = selectedRowKeys.join(',');
            const response = await authApi.delete(`timetabledelete.php?ids=${idsParam}`);

            if (response.data.success) {
                message.success(response.data.message);
                setSelectedRowKeys([]);
                refreshTimetableData();
            } else {
                throw new Error(response.data.error || 'Bulk delete failed');
            }
        } catch (error) {
            message.error(error.response?.data?.error || error.message || 'Error performing bulk delete');
            console.error('Bulk delete error:', error);
        } finally {
            setBulkDeleteLoading(false);
        }
    };

    const refreshTimetableData = async () => {
        try {
            setLoadingTimetable(true);
            const response = await publicApi.get(
                `GetAdTimetable.php?section_id=${selectedSection}`
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

    // Professional Print Layout - Days as columns, Time as rows
    const handlePrint = () => {
        if (!timetableData || timetableData.length === 0) {
            message.warning('No timetable data to print');
            return;
        }

        const sectionName = sections.find(s => s.id === selectedSection)?.name || 'Selected Section';
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        
        // Get unique time slots
        const timeSlots = [];
        const timeSet = new Set();
        timetableData.forEach(item => {
            const key = `${item.start_time}-${item.end_time}`;
            if (!timeSet.has(key)) {
                timeSet.add(key);
                timeSlots.push({
                    start: item.start_time,
                    end: item.end_time,
                    key: key
                });
            }
        });
        timeSlots.sort((a, b) => a.start.localeCompare(b.start));

        const printWindow = window.open('', '_blank');
        
        const printContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Timetable - ${sectionName}</title>
                <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body { 
                        font-family: 'Segoe UI', Arial, sans-serif; 
                        padding: 20px;
                        background: #fff;
                    }
                    .print-header {
                        text-align: center;
                        margin-bottom: 25px;
                        padding-bottom: 20px;
                        border-bottom: 3px solid #1890ff;
                    }
                    .print-header h1 {
                        font-size: 28px;
                        color: #1890ff;
                        margin: 0;
                        font-weight: 700;
                        letter-spacing: 1px;
                    }
                    .print-header .subtitle {
                        font-size: 16px;
                        color: #666;
                        margin-top: 8px;
                    }
                    .print-header .meta {
                        font-size: 13px;
                        color: #888;
                        margin-top: 5px;
                    }
                    .print-table {
                        width: 100%;
                        border-collapse: collapse;
                        font-size: 13px;
                        margin-top: 10px;
                    }
                    .print-table th {
                        background: linear-gradient(135deg, #1890ff, #096dd9);
                        color: #fff;
                        font-weight: 600;
                        padding: 12px 10px;
                        text-align: center;
                        border: 1px solid #096dd9;
                        text-transform: uppercase;
                        font-size: 12px;
                        letter-spacing: 0.5px;
                    }
                    .print-table td {
                        padding: 10px 8px;
                        border: 1px solid #d9d9d9;
                        text-align: center;
                        vertical-align: middle;
                        min-height: 50px;
                    }
                    .print-table .time-cell {
                        background: #f0f5ff;
                        font-weight: 600;
                        color: #1890ff;
                        min-width: 100px;
                        font-size: 12px;
                    }
                    .print-table .class-cell {
                        min-height: 50px;
                    }
                    .print-table .class-cell .subject {
                        font-weight: 600;
                        font-size: 14px;
                        color: #262626;
                    }
                    .print-table .class-cell .teacher {
                        font-size: 12px;
                        color: #666;
                        margin-top: 3px;
                    }
                    .print-table .empty-cell {
                        color: #bfbfbf;
                        font-size: 12px;
                    }
                    .print-footer {
                        margin-top: 30px;
                        padding-top: 15px;
                        border-top: 2px solid #e8e8e8;
                        text-align: center;
                        font-size: 12px;
                        color: #999;
                    }
                    .print-footer .footer-left {
                        float: left;
                    }
                    .print-footer .footer-right {
                        float: right;
                    }
                    .print-table .break-row td {
                        background: #fafafa;
                        padding: 4px;
                    }
                    @media print {
                        body { padding: 10px; }
                        .print-table th {
                            background: #1890ff !important;
                            -webkit-print-color-adjust: exact !important;
                            print-color-adjust: exact !important;
                        }
                        .print-table .time-cell {
                            background: #f0f5ff !important;
                            -webkit-print-color-adjust: exact !important;
                            print-color-adjust: exact !important;
                        }
                    }
                </style>
            </head>
            <body>
                <div class="print-header">
                    <h1>📚 Class Timetable</h1>
                    <div class="subtitle">${sectionName}</div>
                    <div class="meta">
                        Generated on: ${new Date().toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                        })} at ${new Date().toLocaleTimeString()}
                    </div>
                </div>

                <table class="print-table">
                    <thead>
                        <tr>
                            <th style="width: 120px;">Time</th>
                            ${days.map(day => `<th>${day}</th>`).join('')}
                        </tr>
                    </thead>
                    <tbody>
                        ${timeSlots.map((slot, index) => {
                            const startTime = formatTimeDisplay(slot.start);
                            const endTime = formatTimeDisplay(slot.end);
                            
                            return `
                                <tr>
                                    <td class="time-cell">
                                        ${startTime} - ${endTime}
                                    </td>
                                    ${days.map(day => {
                                        const classInfo = timetableData.find(
                                            item => item.day === day && 
                                                    item.start_time === slot.start && 
                                                    item.end_time === slot.end
                                        );
                                        
                                        if (classInfo) {
                                            return `
                                                <td class="class-cell">
                                                    <div class="subject">${classInfo.subject_name}</div>
                                                    <div class="teacher">👨‍🏫 ${classInfo.teacher_name}</div>
                                                </td>
                                            `;
                                        } else {
                                            return `
                                                <td class="empty-cell">
                                                    <span style="color: #d9d9d9;">—</span>
                                                </td>
                                            `;
                                        }
                                    }).join('')}
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>

                <div class="print-footer">
                    <span class="footer-left">Apex Education System</span>
                    <span class="footer-right">Printed on ${new Date().toLocaleDateString()}</span>
                    <div style="clear: both;"></div>
                </div>

                <script>
                    window.onload = function() {
                        window.print();
                        setTimeout(function() {
                            window.close();
                        }, 1000);
                    }
                </script>
            </body>
            </html>
        `;

        printWindow.document.write(printContent);
        printWindow.document.close();
    };

    // Row selection configuration for timetable modal
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
    const getTimetableColumns = () => {
        const baseColumns = [
            {
                title: 'Day',
                dataIndex: 'day',
                key: 'day',
                width: 120,
                fixed: windowWidth < 768 ? 'left' : false,
                sorter: (a, b) => {
                    const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
                    return dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day);
                }
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
                sorter: (a, b) => a.start_time.localeCompare(b.start_time)
            },
            {
                title: 'Subject',
                dataIndex: 'subject_name',
                key: 'subject',
                sorter: (a, b) => a.subject_name.localeCompare(b.subject_name)
            },
            {
                title: 'Teacher',
                dataIndex: 'teacher_name',
                key: 'teacher',
                responsive: ['md'],
                sorter: (a, b) => a.teacher_name.localeCompare(b.teacher_name)
            },
            {
                title: 'Section',
                dataIndex: 'section_name',
                key: 'section',
                responsive: ['md']
            },
            {
                title: 'Actions',
                key: 'actions',
                width: 120,
                render: (_, record) => (
                    <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
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
        return baseColumns;
    };

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
                    open={mobileMenuVisible}
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

                            {/* Timetable Modal with Bulk Delete */}
                            <Modal
                                title={
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                                        <span>
                                            <ScheduleOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                                            <Text strong style={{ fontSize: windowWidth < 768 ? '16px' : '18px' }}>
                                                Timetable - {sections.find(s => s.id === selectedSection)?.name}
                                            </Text>
                                        </span>
                                        <Space>
                                            {selectedRowKeys.length > 0 && (
                                                <Button 
                                                    danger
                                                    icon={<DeleteFilled />}
                                                    onClick={handleBulkDelete}
                                                    loading={bulkDeleteLoading}
                                                    size={windowWidth < 768 ? "small" : "middle"}
                                                >
                                                    Delete Selected ({selectedRowKeys.length})
                                                </Button>
                                            )}
                                            <Button onClick={handleTimetableModalCancel}>
                                                Close
                                            </Button>
                                        </Space>
                                    </div>
                                }
                                open={isTimetableModalVisible}
                                onCancel={handleTimetableModalCancel}
                                footer={null}
                                width={windowWidth < 768 ? '95%' : '90%'}
                                bodyStyle={{
                                    padding: windowWidth < 768 ? '12px' : '24px',
                                    maxHeight: '70vh',
                                    overflowY: 'auto'
                                }}
                                destroyOnClose
                            >
                                <Spin spinning={loadingTimetable}>
                                    {timetableData && timetableData.length > 0 ? (
                                        <>
                                            {selectedRowKeys.length > 0 && (
                                                <div style={{ marginBottom: 16, padding: '8px 12px', background: '#e6f7ff', borderRadius: 4 }}>
                                                    <Text>
                                                        Selected <strong>{selectedRowKeys.length}</strong> entry(ies)
                                                    </Text>
                                                </div>
                                            )}
                                            <Table
                                                dataSource={timetableData}
                                                columns={getTimetableColumns()}
                                                rowKey="id"
                                                rowSelection={rowSelection}
                                                pagination={{
                                                    pageSize: 10,
                                                    showSizeChanger: true,
                                                    pageSizeOptions: ['5', '10', '20', '50'],
                                                    showTotal: (total) => `Total ${total} entries`,
                                                    size: windowWidth < 768 ? 'small' : 'default'
                                                }}
                                                scroll={{ x: true }}
                                                size={windowWidth < 768 ? 'small' : 'middle'}
                                                bordered
                                            />
                                        </>
                                    ) : (
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '200px' }}>
                                            <Empty
                                                description="No timetable entries found"
                                                image={Empty.PRESENTED_IMAGE_SIMPLE}
                                            />
                                        </div>
                                    )}
                                </Spin>
                            </Modal>

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

            {/* Bulk Delete Confirmation Modal */}
            <Modal
                title="Confirm Bulk Delete"
                open={isBulkDeleteModalVisible}
                onOk={confirmBulkDelete}
                onCancel={() => setIsBulkDeleteModalVisible(false)}
                okText="Yes, Delete All"
                cancelText="Cancel"
                okButtonProps={{ danger: true, loading: bulkDeleteLoading }}
                width={windowWidth < 768 ? '95%' : 600}
            >
                <p>
                    Are you sure you want to delete <strong>{selectedRowKeys.length}</strong> selected timetable entry(ies)?
                </p>
                <p style={{ color: '#ff4d4f' }}>
                    This action cannot be undone.
                </p>
                <div style={{ marginTop: 16, maxHeight: 200, overflowY: 'auto' }}>
                    {timetableData
                        .filter(t => selectedRowKeys.includes(t.id))
                        .map(t => (
                            <div key={t.id} style={{ padding: '4px 0', borderBottom: '1px solid #f0f0f0' }}>
                                <Text>
                                    {t.day} - {t.subject_name} ({formatTimeDisplay(t.start_time)} - {formatTimeDisplay(t.end_time)})
                                </Text>
                            </div>
                        ))
                    }
                </div>
            </Modal>
        </Layout>
    );
};

export default Timetable;