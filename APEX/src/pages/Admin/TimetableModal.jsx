/* eslint-disable react/prop-types */
import { Modal, Spin, Typography, Empty, Button, Popconfirm, Checkbox, Space } from "antd";
import { EditOutlined, DeleteOutlined, DeleteFilled } from '@ant-design/icons';

const { Title } = Typography;

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// Time formatting function
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

const TimetableModal = ({ 
    visible, 
    onCancel, 
    loading, 
    timetableData = [], 
    section, 
    windowWidth,
    noDataMessage = "No timetable scheduled yet for this section",
    onEdit,
    onDelete,
    selectedRowKeys = [],
    onSelectChange,
    onBulkDelete,
    bulkDeleteLoading = false
}) => {
    const modalStyles = {
        header: {
            padding: windowWidth < 768 ? '12px 16px' : '16px 24px',
            borderBottom: '1px solid #f0f0f0',
            fontSize: windowWidth < 768 ? '18px' : '20px',
            fontWeight: 500
        },
        body: {
            padding: windowWidth < 768 ? '8px' : '16px',
            maxHeight: '70vh',
            overflowY: 'auto'
        },
        table: {
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: windowWidth < 768 ? '12px' : '14px'
        },
        th: {
            padding: windowWidth < 768 ? '8px 4px' : '12px 8px',
            backgroundColor: '#fafafa',
            fontWeight: 500,
            border: '1px solid #e8e8e8',
            textAlign: 'center'
        },
        td: {
            padding: windowWidth < 768 ? '8px 4px' : '12px 8px',
            border: '1px solid #e8e8e8',
            textAlign: 'center',
            verticalAlign: 'middle'
        },
        timeCell: {
            fontWeight: 500,
            backgroundColor: '#f9f9f9'
        },
        classCell: {
            minHeight: windowWidth < 768 ? '40px' : '60px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
        },
        subjectName: {
            fontWeight: 500,
            marginBottom: windowWidth < 768 ? '2px' : '4px'
        },
        teacherName: {
            fontSize: windowWidth < 768 ? '0.8em' : '0.9em',
            color: '#666'
        },
        timeSlot: {
            fontSize: windowWidth < 768 ? '0.7em' : '0.8em',
            color: '#888'
        },
        actionCell: {
            display: 'flex',
            gap: '8px',
            justifyContent: 'center'
        },
        noDataCell: {
            padding: '16px',
            textAlign: 'center',
            color: 'rgba(0, 0, 0, 0.25)'
        },
        emptyContainer: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '200px'
        }
    };

    // Safely get and sort time slots
    const getSortedTimeSlots = () => {
        try {
            if (!Array.isArray(timetableData) || timetableData.length === 0) {
                return [];
            }
            
            // Get unique time slots
            const slots = new Set();
            timetableData.forEach(item => {
                if (item.start_time && item.end_time) {
                    slots.add(`${item.start_time}-${item.end_time}`);
                }
            });
            
            // Convert to array and sort
            return Array.from(slots).sort((a, b) => {
                const [aStart] = a.split('-');
                const [bStart] = b.split('-');
                return aStart.localeCompare(bStart);
            });
        } catch (error) {
            console.error('Error processing time slots:', error);
            return [];
        }
    };

    const timeSlots = getSortedTimeSlots();

    // Handle checkbox change for a specific entry
    const handleCheckboxChange = (entryId, checked) => {
        if (onSelectChange) {
            if (checked) {
                onSelectChange([...selectedRowKeys, entryId]);
            } else {
                onSelectChange(selectedRowKeys.filter(id => id !== entryId));
            }
        }
    };

    // Handle select all
    const handleSelectAll = (checked) => {
        if (onSelectChange) {
            if (checked) {
                const allIds = timetableData.map(item => item.id);
                onSelectChange(allIds);
            } else {
                onSelectChange([]);
            }
        }
    };

    // Get all entry IDs for select all
    const allIds = timetableData.map(item => item.id);
    const allSelected = allIds.length > 0 && allIds.every(id => selectedRowKeys.includes(id));
    const someSelected = selectedRowKeys.length > 0 && !allSelected;

    return (
        <Modal
            title={
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
                    <span>
                        Timetable for {section?.name || 'Selected Section'}
                    </span>
                    {selectedRowKeys.length > 0 && (
                        <Button 
                            danger
                            icon={<DeleteFilled />}
                            onClick={onBulkDelete}
                            loading={bulkDeleteLoading}
                            size={windowWidth < 768 ? "small" : "middle"}
                        >
                            Delete Selected ({selectedRowKeys.length})
                        </Button>
                    )}
                </div>
            }
            open={visible}
            onCancel={onCancel}
            footer={null}
            width={windowWidth < 992 ? (windowWidth < 768 ? '95%' : '90%') : 1200}
            bodyStyle={modalStyles.body}
        >
            {loading ? (
                <div style={{ textAlign: 'center', padding: '24px' }}>
                    <Spin size="large" />
                </div>
            ) : (
                <div style={{ overflowX: 'auto' }}>
                    {timetableData.length > 0 && (
                        <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <Checkbox
                                checked={allSelected}
                                indeterminate={someSelected}
                                onChange={(e) => handleSelectAll(e.target.checked)}
                            >
                                Select All
                            </Checkbox>
                            {selectedRowKeys.length > 0 && (
                                <span style={{ color: '#1890ff' }}>
                                    {selectedRowKeys.length} selected
                                </span>
                            )}
                        </div>
                    )}
                    
                    {timeSlots.length > 0 ? (
                        <table style={modalStyles.table}>
                            <thead>
                                <tr>
                                    <th style={{ ...modalStyles.th, width: '40px' }}>
                                        <Checkbox
                                            checked={allSelected}
                                            indeterminate={someSelected}
                                            onChange={(e) => handleSelectAll(e.target.checked)}
                                        />
                                    </th>
                                    <th style={modalStyles.th}>Time/Day</th>
                                    {days.map(day => (
                                        <th key={day} style={modalStyles.th}>
                                            {windowWidth < 768 ? day.substring(0, 3) : day}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {timeSlots.map((timeSlot, index) => {
                                    const [startTime, endTime] = timeSlot.split('-');
                                    return (
                                        <tr key={index}>
                                            <td style={{ ...modalStyles.td, ...modalStyles.timeCell, width: '40px' }}>
                                                {/* Checkbox placeholder - no checkbox here, it's in the class cell */}
                                            </td>
                                            <td style={{ ...modalStyles.td, ...modalStyles.timeCell }}>
                                                {formatTimeDisplay(startTime)} - {formatTimeDisplay(endTime)}
                                            </td>
                                            {days.map(day => {
                                                const classInfo = timetableData.find(
                                                    item =>
                                                        item.day === day &&
                                                        item.start_time === startTime &&
                                                        item.end_time === endTime
                                                );
                                                return (
                                                    <td key={`${day}-${index}`} style={modalStyles.td}>
                                                        {classInfo ? (
                                                            <div style={modalStyles.classCell}>
                                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                                                    <Checkbox
                                        checked={selectedRowKeys.includes(classInfo.id)}
                                        onChange={(e) => handleCheckboxChange(classInfo.id, e.target.checked)}
                                    />
                                                                    <div>
                                                                        <div style={modalStyles.subjectName}>
                                                                            {classInfo.subject_name}
                                                                        </div>
                                                                        <div style={modalStyles.teacherName}>
                                                                            {classInfo.teacher_name}
                                                                        </div>
                                                                        {windowWidth >= 768 && (
                                                                            <div style={modalStyles.timeSlot}>
                                                                                {formatTimeDisplay(classInfo.start_time)} - {formatTimeDisplay(classInfo.end_time)}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                <div style={modalStyles.actionCell}>
                                                                    <Button
                                                                        type="text"
                                                                        icon={<EditOutlined />}
                                                                        onClick={() => onEdit(classInfo)}
                                                                        size="small"
                                                                    />
                                                                    <Popconfirm
                                                                        title="Are you sure to delete this entry?"
                                                                        onConfirm={() => onDelete(classInfo.id)}
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
                                                            </div>
                                                        ) : (
                                                            '-'
                                                        )}
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    ) : (
                        <div style={modalStyles.emptyContainer}>
                            <Empty
                                description={noDataMessage}
                                image={Empty.PRESENTED_IMAGE_SIMPLE}
                            />
                        </div>
                    )}
                </div>
            )}
        </Modal>
    );
};

export default TimetableModal;