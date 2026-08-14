import { useState, useEffect, useRef } from "react";
import { Table, Typography, Row, Col, Spin, Button, message, Empty, Popconfirm, Card, Modal, Space, Tag, Tooltip } from "antd";
import axios from "axios";
import { ScheduleOutlined, EditOutlined, DeleteOutlined, PrinterOutlined, DeleteFilled, TeamOutlined, BookOutlined, CalendarOutlined } from '@ant-design/icons';
import ScheduleModal from "./ScheduleModal";
import './Timetable.css';
import { useNavigate } from "react-router-dom";

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
    const printRef = useRef();

    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [isBulkDeleteModalVisible, setIsBulkDeleteModalVisible] = useState(false);
    const [bulkDeleteLoading, setBulkDeleteLoading] = useState(false);

    const publicApi = axios.create({
        baseURL: 'https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/',
        withCredentials: false,
        headers: { 'Content-Type': 'application/json' }
    });

    const authApi = axios.create({
        baseURL: 'https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/',
        withCredentials: true,
        headers: { 'Content-Type': 'application/json' }
    });

    useEffect(() => {
        const fetchSections = async () => {
            try {
                const response = await publicApi.get("Sec_Read.php");
                setSections(response.data || []);
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
            fetchDataForSection(selectedSection);
        }
    }, [selectedSection]);

    // NOTE: endpoint names/response shapes below match the backend
    // (GetAdTimetable.php returns { status: 'success', timetable: [...] },
    // not a bare array) — this was the source of the failed requests.
    const fetchDataForSection = async (sectionId) => {
        try {
            setLoadingSectionData(true);
            setLoadingTimetable(true);

            const filterResponse = await publicApi.get(`FilterAd.php?section_id=${sectionId}`);
            setSectionData(filterResponse.data || []);
            setLoadingSectionData(false);

            const timetableResponse = await publicApi.get(`GetAdTimetable.php?section_id=${sectionId}`);

            if (timetableResponse.data?.status === 'success') {
                const entries = timetableResponse.data.timetable || [];
                setTimetableData(entries);
                groupTimetableData(entries);
            } else {
                setTimetableData([]);
                setGroupedTimetableData({});
            }
            setLoadingTimetable(false);
        } catch (err) {
            console.error("Error fetching data:", err);
            if (err.response?.status === 401) {
                navigate('/admin-signin');
                return;
            }
            if (err.response?.status === 404) {
                // No timetable created yet for this section — not a real error
                setTimetableData([]);
                setGroupedTimetableData({});
            } else {
                message.error("Failed to load section details");
            }
            setLoadingSectionData(false);
            setLoadingTimetable(false);
        }
    };

    const groupTimetableData = (data) => {
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const grouped = {};
        days.forEach(day => { grouped[day] = []; });
        data.forEach(item => {
            if (grouped[item.day]) {
                grouped[item.day].push(item);
            }
        });

        Object.keys(grouped).forEach(day => {
            grouped[day].sort((a, b) => a.start_time.localeCompare(b.start_time));
        });

        setGroupedTimetableData(grouped);
    };

    const handleSectionSelect = (sectionId) => {
        setSelectedSection(sectionId);
        setSelectedRowKeys([]);
    };

    const showModal = (record) => {
        setSelectedRecord(record);
        setIsModalVisible(true);
    };

    const showTimetableModal = () => {
        setIsTimetableModalVisible(true);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
        setSelectedRecord(null);
    };

    const handleTimetableModalCancel = () => {
        setIsTimetableModalVisible(false);
        setSelectedRowKeys([]);
    };

    const handleSubmit = async (scheduleData) => {
        try {
            const dataToSend = {
                ...scheduleData,
                teacher_id: selectedRecord?.teacher_id,
                subject_id: selectedRecord?.subject_id,
                section_id: selectedSection
            };
            const response = await authApi.post('timetable.php', dataToSend);
            if (response.data?.success) {
                message.success('Schedule created successfully!');
                setIsModalVisible(false);
                fetchDataForSection(selectedSection);
            } else {
                message.error(response.data?.error || response.data?.message || 'Failed to create schedule');
            }
        } catch (err) {
            if (err.response?.status === 401) {
                navigate('/admin-signin');
                return;
            }
            message.error(err.response?.data?.error || err.response?.data?.message || 'Error submitting schedule');
        }
    };

    const handleEditSubmit = async (scheduleData) => {
        try {
            const dataToSend = {
                ...scheduleData,
                id: selectedTimetableEntry.id,
                teacher_id: selectedTimetableEntry?.teacher_id,
                subject_id: selectedTimetableEntry?.subject_id,
                section_id: selectedSection
            };
            const response = await authApi.put('timetableupdate.php', dataToSend);
            if (response.data?.success) {
                message.success('Schedule updated successfully!');
                setIsEditModalVisible(false);
                setSelectedTimetableEntry(null);
                fetchDataForSection(selectedSection);
            } else {
                message.error(response.data?.error || response.data?.message || 'Failed to update schedule');
            }
        } catch (err) {
            if (err.response?.status === 401) {
                navigate('/admin-signin');
                return;
            }
            message.error(err.response?.data?.error || 'Error updating schedule');
        }
    };

    const handleEditClick = (record) => {
        setSelectedTimetableEntry(record);
        setIsEditModalVisible(true);
    };

    const handleEditCancel = () => {
        setIsEditModalVisible(false);
        setSelectedTimetableEntry(null);
    };

    const handleDeleteClick = async (id) => {
        try {
            const response = await authApi.delete(`timetabledelete.php?id=${id}`);
            if (response.data?.success) {
                message.success(response.data?.message || 'Entry deleted successfully!');
                fetchDataForSection(selectedSection);
            } else {
                message.error(response.data?.error || response.data?.message || 'Failed to delete entry');
            }
        } catch (err) {
            if (err.response?.status === 401) {
                navigate('/admin-signin');
                return;
            }
            message.error(err.response?.data?.error || 'Error deleting entry');
        }
    };

    const handleBulkDelete = () => {
        if (selectedRowKeys.length === 0) {
            message.warning('Please select entries to delete');
            return;
        }
        setIsBulkDeleteModalVisible(true);
    };

    const confirmBulkDelete = async () => {
        setBulkDeleteLoading(true);
        try {
            const idsParam = selectedRowKeys.join(',');
            const response = await authApi.delete(`timetabledelete.php?ids=${idsParam}`);
            if (response.data?.success) {
                message.success(response.data?.message || `Successfully deleted ${selectedRowKeys.length} entries!`);
                setSelectedRowKeys([]);
                setIsBulkDeleteModalVisible(false);
                fetchDataForSection(selectedSection);
            } else {
                message.error(response.data?.error || response.data?.message || 'Failed to delete entries');
            }
        } catch (err) {
            if (err.response?.status === 401) {
                navigate('/admin-signin');
                return;
            }
            message.error(err.response?.data?.error || 'Error deleting entries');
        } finally {
            setBulkDeleteLoading(false);
        }
    };

    const formatTimeDisplay = (time24) => {
        if (!time24) return '';
        const [hours, minutes] = time24.split(':');
        const period = parseInt(hours) >= 12 ? 'PM' : 'AM';
        const hours12 = parseInt(hours) % 12 || 12;
        return `${hours12}:${minutes} ${period}`;
    };

    const handlePrint = () => {
        const printWindow = window.open('', '_blank');
        const selectedSecName = sections.find(s => s.id === selectedSection)?.name;
        printWindow.document.write(`
            <html>
                <head>
                    <title>Timetable - Section ${selectedSecName}</title>
                    <style>
                        body { font-family: Arial, sans-serif; padding: 20px; }
                        h2 { color: #0b1b3d; border-bottom: 2px solid #d4af37; padding-bottom: 10px; }
                        table { width: 100%; border-collapse: collapse; margin-top: 15px; }
                        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                        th { background-color: #f8fafc; color: #0b1b3d; }
                    </style>
                </head>
                <body>
                    <h2>APEX COLLEGE - TIMETABLE (${selectedSecName})</h2>
                    ${document.getElementById('printable-timetable')?.innerHTML || ''}
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        printWindow.close();
    };

    const columns = [
        {
            title: 'Teacher Name',
            dataIndex: 'teach_name',
            key: 'teach_name',
            render: (name) => <Text strong style={{ color: '#0b1b3d' }}>{name}</Text>
        },
        {
            title: 'Subject',
            dataIndex: 'subject_name',
            key: 'subject_name',
            render: (sub) => <Tag color="purple" style={{ borderRadius: 12 }}>{sub}</Tag>
        },
        {
            title: 'Section',
            dataIndex: 'section_name',
            key: 'section_name',
            render: (sec) => <Tag color="gold" style={{ borderRadius: 12 }}>{sec}</Tag>
        },
        {
            title: 'Action',
            key: 'action',
            align: 'center',
            render: (_, record) => (
                <Button type="primary" size="small" icon={<ScheduleOutlined />} onClick={() => showModal(record)} className="apex-btn-gold">
                    Schedule Slot
                </Button>
            )
        }
    ];

    const getTimetableColumns = () => [
        { title: 'Day', dataIndex: 'day', key: 'day', render: (day) => <Tag color="blue" style={{ borderRadius: 12, fontWeight: 700 }}>{day}</Tag> },
        { title: 'Subject', dataIndex: 'subject_name', key: 'subject_name', render: (sub) => <Text strong style={{ color: '#0f172a' }}>{sub}</Text> },
        { title: 'Teacher', dataIndex: 'teacher_name', key: 'teacher_name' },
        {
            title: 'Time Slot',
            key: 'time',
            render: (_, record) => `${formatTimeDisplay(record.start_time)} - ${formatTimeDisplay(record.end_time)}`
        },
        { title: 'Room', dataIndex: 'room_number', key: 'room_number', render: (room) => <Tag color="cyan">{room || 'N/A'}</Tag> },
        {
            title: 'Actions',
            key: 'actions',
            align: 'center',
            render: (_, record) => (
                <Space size="small">
                    <Button type="primary" icon={<EditOutlined />} onClick={() => handleEditClick(record)} size="small" style={{ background: '#1e3a8a', borderRadius: 6 }} />
                    <Popconfirm title="Delete Entry" onConfirm={() => handleDeleteClick(record.id)} okText="Yes" cancelText="No" okButtonProps={{ danger: true }}>
                        <Button type="primary" danger icon={<DeleteOutlined />} size="small" style={{ borderRadius: 6 }} />
                    </Popconfirm>
                </Space>
            )
        }
    ];

    const rowSelection = {
        selectedRowKeys,
        onChange: (keys) => setSelectedRowKeys(keys)
    };

    if (loading) return <Spin size="large" fullscreen />;
    if (error) return <div className="error-message">Error: {error}</div>;

    return (
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
            <Card
                className="apex-card"
                title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 38, height: 38, borderRadius: 10, background: 'linear-gradient(135deg, #0b1b3d 0%, #1e3a8a 100%)', color: '#d4af37', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
                            <ScheduleOutlined />
                        </div>
                        <div>
                            <Title level={4} style={{ margin: 0, color: '#0b1b3d', fontWeight: 700 }}>
                                Weekly Class Timetable & Schedule Setup
                            </Title>
                            <Text style={{ color: '#64748b', fontSize: 12 }}>Assign faculty slots, classroom numbers, and timetable routines</Text>
                        </div>
                    </div>
                }
            >
                <Text strong style={{ color: '#0b1b3d', display: 'block', marginBottom: 12, fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Select Section to Schedule:
                </Text>

                <Row gutter={[10, 10]} style={{ marginBottom: 24 }}>
                    {sections.map((section) => {
                        const isSelected = selectedSection === section.id;
                        return (
                            <Col key={section.id}>
                                <Button
                                    type={isSelected ? 'primary' : 'default'}
                                    onClick={() => handleSectionSelect(section.id)}
                                    icon={<TeamOutlined />}
                                    className={isSelected ? 'apex-btn-gold' : ''}
                                    style={{ borderRadius: 8, fontWeight: 600, borderColor: isSelected ? '#d4af37' : '#cbd5e1' }}
                                >
                                    Section {section.name}
                                </Button>
                            </Col>
                        );
                    })}
                </Row>

                {selectedSection && (
                    <>
                        <Card size="small" style={{ borderRadius: 12, marginBottom: 20 }}>
                            <Table
                                dataSource={sectionData}
                                columns={columns}
                                rowKey="id"
                                loading={loadingSectionData}
                                pagination={false}
                                scroll={{ x: 'max-content' }}
                                locale={{
                                    emptyText: (
                                        <Empty description="No teachers assigned to this section" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                                    )
                                }}
                            />
                            <div style={{ marginTop: 16, display: 'flex', gap: 12 }}>
                                <Button type="primary" icon={<ScheduleOutlined />} onClick={showTimetableModal} className="apex-btn-gold">
                                    View Full Timetable Matrix
                                </Button>
                                <Button type="default" icon={<PrinterOutlined />} onClick={handlePrint} disabled={timetableData.length === 0} style={{ borderRadius: 8 }}>
                                    Print Timetable Sheet
                                </Button>
                            </div>
                        </Card>

                        {/* Grouped Days Display */}
                        {timetableData.length > 0 && (
                            <div id="printable-timetable">
                                <Title level={4} style={{ color: '#0b1b3d', marginBottom: 16 }}>
                                    Schedule Overview: Section {sections.find(s => s.id === selectedSection)?.name}
                                </Title>
                                <Row gutter={[16, 16]}>
                                    {Object.keys(groupedTimetableData).map(day => {
                                        const entries = groupedTimetableData[day];
                                        if (entries.length === 0) return null;
                                        return (
                                            <Col xs={24} sm={12} md={8} key={day}>
                                                <Card size="small" className="apex-card" title={<Text strong style={{ color: '#0b1b3d' }}>{day}</Text>} style={{ height: '100%' }}>
                                                    {entries.map(e => (
                                                        <div key={e.id} style={{ padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                                                            <Text strong style={{ color: '#1e3a8a', display: 'block' }}>{e.subject_name}</Text>
                                                            <Text style={{ fontSize: 12, color: '#64748b' }}>{formatTimeDisplay(e.start_time)} - {formatTimeDisplay(e.end_time)} | Room {e.room_number || 'N/A'}</Text>
                                                        </div>
                                                    ))}
                                                </Card>
                                            </Col>
                                        );
                                    })}
                                </Row>
                            </div>
                        )}
                    </>
                )}
            </Card>

            {/* Timetable Modal */}
            <Modal
                title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <ScheduleOutlined style={{ color: '#d4af37' }} />
                        <span>Timetable Entries: Section {sections.find(s => s.id === selectedSection)?.name}</span>
                    </div>
                }
                open={isTimetableModalVisible}
                onCancel={handleTimetableModalCancel}
                footer={[
                    <Button key="close" onClick={handleTimetableModalCancel} style={{ borderRadius: 8 }}>
                        Close
                    </Button>
                ]}
                width={850}
                centered
            >
                {selectedRowKeys.length > 0 && (
                    <Button danger icon={<DeleteFilled />} onClick={handleBulkDelete} loading={bulkDeleteLoading} style={{ marginBottom: 12, borderRadius: 8 }}>
                        Delete Selected ({selectedRowKeys.length})
                    </Button>
                )}
                <Table
                    dataSource={timetableData}
                    columns={getTimetableColumns()}
                    rowKey="id"
                    rowSelection={rowSelection}
                    loading={loadingTimetable}
                    scroll={{ x: 'max-content' }}
                    pagination={{ pageSize: 10 }}
                    locale={{
                        emptyText: (
                            <Empty description="No timetable entries found" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                        )
                    }}
                />
            </Modal>

            <ScheduleModal
                visible={isModalVisible}
                onCancel={handleCancel}
                selectedRecord={selectedRecord}
                onSubmit={handleSubmit}
                mode="create"
            />

            <ScheduleModal
                visible={isEditModalVisible}
                onCancel={handleEditCancel}
                selectedRecord={selectedTimetableEntry}
                onSubmit={handleEditSubmit}
                mode="edit"
            />

            {/* Bulk Delete Confirmation Modal */}
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
                <p>Are you sure you want to delete <strong>{selectedRowKeys.length}</strong> selected schedule entries?</p>
            </Modal>
        </div>
    );
};

export default Timetable;