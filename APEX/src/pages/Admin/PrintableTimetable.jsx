import React from 'react';
import { Typography, Spin } from 'antd';

const { Title, Text } = Typography;

const PrintableTimetable = React.forwardRef(({ sectionName, timetableData, isModal = false }, ref) => {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    const groupedTimetable = timetableData.reduce((acc, item) => {
        if (!acc[item.day]) {
            acc[item.day] = [];
        }
        acc[item.day].push(item);
        return acc;
    }, {});

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

    return (
        <div ref={ref} style={isModal ? { overflowX: 'auto' } : {}}>
            {!isModal && (
                <div className="print-header">
                    <Title level={3}>Timetable for {sectionName}</Title>
                    <Text>Generated on {new Date().toLocaleDateString()}</Text>
                </div>
            )}

            {timetableData.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 16 }}>
                    No timetable data available for this section
                </div>
            ) : (
                <table className={isModal ? '' : 'print-table'} style={isModal ? { 
                    width: '100%', 
                    borderCollapse: 'collapse',
                    margin: '0 auto'
                } : {}}>
                    <thead>
                        <tr>
                            <th style={isModal ? { 
                                border: '1px solid #ddd', 
                                padding: 8, 
                                backgroundColor: '#f2f2f2' 
                            } : {}}>Time/Day</th>
                            {days.map(day => (
                                <th key={day} style={isModal ? { 
                                    border: '1px solid #ddd', 
                                    padding: 8, 
                                    backgroundColor: '#f2f2f2' 
                                } : {}}>{day}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {Array.from({ length: 8 }).map((_, timeIndex) => {
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
                            
                            return (
                                <tr key={timeIndex}>
                                    <td style={isModal ? { 
                                        border: '1px solid #ddd', 
                                        padding: 8, 
                                        fontWeight: 'bold', 
                                        backgroundColor: '#f9f9f9' 
                                    } : {}}>
                                        {displayTimes[timeIndex]}
                                    </td>
                                    {days.map(day => {
                                        const daySchedule = groupedTimetable[day] || [];
                                        const classInfo = daySchedule.find(
                                            item => `${item.start_time}-${item.end_time}` === timeSlots[timeIndex]
                                        );

                                        return (
                                            <td key={`${day}-${timeIndex}`} style={isModal ? { 
                                                border: '1px solid #ddd', 
                                                padding: 8 
                                            } : {}}>
                                                {classInfo ? (
                                                    <div className={isModal ? '' : 'class-info'}>
                                                        <div style={isModal ? { 
                                                            fontWeight: 'bold' 
                                                        } : {}}>{classInfo.subject_name}</div>
                                                        <div>{classInfo.teacher_name}</div>
                                                        <div style={isModal ? { 
                                                            fontSize: '0.8em', 
                                                            color: '#666' 
                                                        } : {}}>
                                                            {formatTimeDisplay(classInfo.start_time)} - {formatTimeDisplay(classInfo.end_time)}
                                                        </div>
                                                    </div>
                                                ) : '-'}
                                            </td>
                                        );
                                    })}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            )}
        </div>
    );
});

export default PrintableTimetable;