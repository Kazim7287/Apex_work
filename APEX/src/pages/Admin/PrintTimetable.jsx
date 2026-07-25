/* eslint-disable react/prop-types */
/* eslint-disable react/display-name */
import React, { useState, useEffect } from 'react';
import { Typography, Grid, Spin, message } from "antd";
import axios from 'axios';

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const PrintTimetable = React.forwardRef(({ section }, ref) => {
    const screens = useBreakpoint();
    const isMobile = !screens.md;
    const [timetableData, setTimetableData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchTimetable = async () => {
            if (!section?.id) return;
            
            try {
                setLoading(true);
                const response = await axios.get(
                    `https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/GetTimetable.php?section_id=${section.id}`
                );
                
                if (response.data.status === 'success') {
                    setTimetableData(response.data.timetable);
                } else {
                    setTimetableData([]);
                    message.warning('No timetable data available for this section');
                }
            } catch (err) {
                setError(err.message);
                message.error('Failed to fetch timetable data');
            } finally {
                setLoading(false);
            }
        };

        fetchTimetable();
    }, [section]);

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

    const groupedTimetable = timetableData.reduce((acc, item) => {
        if (!acc[item.day]) {
            acc[item.day] = [];
        }
        acc[item.day].push(item);
        return acc;
    }, {});

    // Responsive styles
    const styles = {
        container: {
            padding: isMobile ? '16px' : '24px',
            fontFamily: "'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
        },
        header: {
            textAlign: 'center',
            marginBottom: isMobile ? '16px' : '24px'
        },
        table: {
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: isMobile ? '12px' : '14px'
        },
        th: {
            padding: isMobile ? '8px 4px' : '12px 8px',
            backgroundColor: '#fafafa',
            fontWeight: 500,
            border: '1px solid #e8e8e8',
            textAlign: 'center'
        },
        td: {
            padding: isMobile ? '8px 4px' : '12px 8px',
            border: '1px solid #e8e8e8',
            textAlign: 'center',
            verticalAlign: 'middle'
        },
        timeCell: {
            fontWeight: 500,
            backgroundColor: '#f9f9f9'
        },
        classInfo: {
            minHeight: isMobile ? '40px' : '60px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
        },
        subjectName: {
            fontWeight: 500,
            marginBottom: isMobile ? '2px' : '4px',
            fontSize: isMobile ? '0.9em' : '1em'
        },
        teacherName: {
            fontSize: isMobile ? '0.8em' : '0.9em',
            color: '#666'
        },
        timeSlot: {
            fontSize: isMobile ? '0.7em' : '0.8em',
            color: '#888'
        },
        loadingContainer: {
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '200px'
        },
        errorContainer: {
            color: 'red',
            textAlign: 'center',
            padding: '20px'
        }
    };

    const timeSlots = [
        '08:00-09:00',
        '09:00-10:00',
        '10:00-11:00',
        '11:00-12:00',
        '12:00-13:00',
        '13:00-14:00',
        '14:00-15:00',
        '15:00-16:00'
    ];
    const displayTimes = [
        '08:00 - 09:00',
        '09:00 - 10:00',
        '10:00 - 11:00',
        '11:00 - 12:00',
        '12:00 - 13:00',
        '13:00 - 14:00',
        '14:00 - 15:00',
        '15:00 - 16:00'
    ];

    if (loading) {
        return (
            <div ref={ref} style={styles.container}>
                <div style={styles.loadingContainer}>
                    <Spin size="large" />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div ref={ref} style={styles.container}>
                <div style={styles.errorContainer}>
                    <Title level={4}>Error Loading Timetable</Title>
                    <Text>{error}</Text>
                </div>
            </div>
        );
    }

    return (
        <div ref={ref} style={styles.container}>
            <div style={styles.header}>
                <Title level={3} style={{ marginBottom: '8px' }}>
                    Timetable for {section?.name}
                </Title>
                <Text type="secondary">
                    Generated on {new Date().toLocaleDateString()}
                </Text>
            </div>

            <table style={styles.table}>
                <thead>
                    <tr>
                        <th style={styles.th}>Time/Day</th>
                        {days.map(day => (
                            <th key={day} style={styles.th}>{day}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {timeSlots.map((_, timeIndex) => (
                        <tr key={timeIndex}>
                            <td style={{ ...styles.td, ...styles.timeCell }}>
                                {displayTimes[timeIndex]}
                            </td>
                            {days.map(day => {
                                const daySchedule = groupedTimetable[day] || [];
                                const classInfo = daySchedule.find(
                                    item => `${item.start_time}-${item.end_time}` === timeSlots[timeIndex]
                                );

                                return (
                                    <td key={`${day}-${timeIndex}`} style={styles.td}>
                                        {classInfo ? (
                                            <div style={styles.classInfo}>
                                                <div style={styles.subjectName}>{classInfo.subject_name}</div>
                                                <div style={styles.teacherName}>{classInfo.teacher_name}</div>
                                                <div style={styles.timeSlot}>
                                                    {formatTimeDisplay(classInfo.start_time)} - {formatTimeDisplay(classInfo.end_time)}
                                                </div>
                                            </div>
                                        ) : '-'}
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
});

export default PrintTimetable;