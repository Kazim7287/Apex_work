import React from 'react';
import { Typography } from 'antd';

const { Title, Text } = Typography;

const PrintableTimetable = React.forwardRef(({ sectionName, timetableData = [], isModal = false }, ref) => {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

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

    // Extract sorted unique time slots
    let uniqueSlots = Array.from(
        new Set(
            timetableData
                .filter(item => item.start_time && item.end_time)
                .map(item => `${item.start_time}_${item.end_time}`)
        )
    ).sort((a, b) => {
        const [aStart] = a.split('_');
        const [bStart] = b.split('_');
        return aStart.localeCompare(bStart);
    });

    if (uniqueSlots.length === 0) {
        uniqueSlots = [
            '08:00:00_09:00:00',
            '09:00:00_10:00:00',
            '10:00:00_11:00:00',
            '11:00:00_12:00:00',
            '12:00:00_13:00:00',
            '13:00:00_14:00:00',
            '14:00:00_15:00:00',
            '15:00:00_16:00:00'
        ];
    }

    // Reference legend
    const subjectMap = {};
    timetableData.forEach(item => {
        if (item.subject_name) {
            const key = `${item.subject_name}_${item.teacher_name || item.teach_name || ''}`;
            if (!subjectMap[key]) {
                subjectMap[key] = {
                    subject: item.subject_name,
                    teacher: item.teacher_name || item.teach_name || 'Faculty Member',
                    room: item.room_number || 'Main Classroom',
                    count: 0
                };
            }
            subjectMap[key].count += 1;
        }
    });
    const legendEntries = Object.values(subjectMap);

    return (
        <div ref={ref} style={{
            fontFamily: "'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
            padding: isModal ? '8px' : '16px 20px',
            backgroundColor: '#ffffff',
            color: '#0b1b3d',
            overflowX: 'auto'
        }}>
            {!isModal && (
                <div style={{
                    textAlign: 'center',
                    borderBottom: '2.5px solid #d4af37',
                    paddingBottom: 10,
                    marginBottom: 14
                }}>
                    <div style={{
                        fontSize: 22,
                        fontWeight: 800,
                        color: '#061129',
                        letterSpacing: '1px',
                        textTransform: 'uppercase'
                    }}>
                        APEX COLLEGE HARICHAND
                    </div>
                    <div style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: '#b8860b',
                        letterSpacing: '0.8px',
                        marginTop: 2,
                        textTransform: 'uppercase'
                    }}>
                        OFFICIAL WEEKLY CLASS TIMETABLE — SESSION 2025–2026
                    </div>

                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        backgroundColor: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        padding: '8px 16px',
                        borderRadius: 6,
                        marginTop: 10,
                        fontSize: 12
                    }}>
                        <div><strong>SECTION:</strong> <span style={{ background: '#0b1b3d', color: '#d4af37', padding: '2px 8px', borderRadius: 4, fontWeight: 700 }}>Section {sectionName || 'All'}</span></div>
                        <div><strong>CAMPUS:</strong> Harichand Campus</div>
                        <div><strong>DATE ISSUED:</strong> {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                        <div><strong>SCHEDULED SLOTS:</strong> {timetableData.length} Weekly Lectures</div>
                    </div>
                </div>
            )}

            {timetableData.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 24, color: '#64748b' }}>
                    No timetable schedule data recorded for this section
                </div>
            ) : (
                <>
                    <table style={{
                        width: '100%',
                        borderCollapse: 'collapse',
                        marginTop: 12,
                        tableLayout: 'fixed'
                    }}>
                        <thead>
                            <tr>
                                <th style={{
                                    backgroundColor: '#0b1b3d',
                                    color: '#ffffff',
                                    border: '1.5px solid #061129',
                                    borderRight: '2px solid #d4af37',
                                    padding: '10px 6px',
                                    fontSize: 12,
                                    fontWeight: 700,
                                    textTransform: 'uppercase',
                                    textAlign: 'center',
                                    width: '13%'
                                }}>
                                    Period / Time
                                </th>
                                {days.map(day => (
                                    <th key={day} style={{
                                        backgroundColor: '#061129',
                                        color: '#ffffff',
                                        border: '1.5px solid #061129',
                                        padding: '10px 6px',
                                        fontSize: 12,
                                        fontWeight: 700,
                                        textTransform: 'uppercase',
                                        textAlign: 'center',
                                        width: '14.5%'
                                    }}>
                                        {day}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {uniqueSlots.map((slot, idx) => {
                                const [startTime, endTime] = slot.split('_');
                                const formattedTime = `${formatTimeDisplay(startTime)} - ${formatTimeDisplay(endTime)}`;

                                return (
                                    <tr key={slot}>
                                        <td style={{
                                            backgroundColor: '#f8fafc',
                                            border: '1px solid #cbd5e1',
                                            borderRight: '2px solid #d4af37',
                                            padding: '8px 4px',
                                            textAlign: 'center',
                                            verticalAlign: 'middle',
                                            height: 52
                                        }}>
                                            <div style={{ fontSize: 11, fontWeight: 800, color: '#0b1b3d', textTransform: 'uppercase' }}>
                                                Period {idx + 1}
                                            </div>
                                            <div style={{ fontSize: 10, color: '#64748b', marginTop: 2, whiteSpace: 'nowrap' }}>
                                                {formattedTime}
                                            </div>
                                        </td>

                                        {days.map(day => {
                                            const classInfo = timetableData.find(item => 
                                                item.day?.toLowerCase() === day.toLowerCase() && 
                                                item.start_time === startTime && 
                                                item.end_time === endTime
                                            );

                                            return (
                                                <td key={`${day}-${slot}`} style={{
                                                    border: '1px solid #cbd5e1',
                                                    padding: '6px 4px',
                                                    textAlign: 'center',
                                                    verticalAlign: 'middle',
                                                    backgroundColor: classInfo ? '#ffffff' : '#fcfcfc',
                                                    height: 52
                                                }}>
                                                    {classInfo ? (
                                                        <div style={{
                                                            backgroundColor: '#ffffff',
                                                            borderLeft: '3px solid #d4af37',
                                                            borderRadius: 4,
                                                            padding: '4px 6px',
                                                            textAlign: 'center',
                                                            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                                                        }}>
                                                            <div style={{
                                                                fontWeight: 800,
                                                                fontSize: 11,
                                                                color: '#061129',
                                                                textTransform: 'uppercase',
                                                                lineHeight: 1.2
                                                            }}>
                                                                {classInfo.subject_name}
                                                            </div>
                                                            <div style={{
                                                                fontSize: 10,
                                                                color: '#475569',
                                                                marginTop: 2,
                                                                lineHeight: 1.1
                                                            }}>
                                                                {classInfo.teacher_name || classInfo.teach_name || 'Faculty'}
                                                            </div>
                                                            {classInfo.room_number && (
                                                                <div style={{
                                                                    display: 'inline-block',
                                                                    fontSize: 9,
                                                                    fontWeight: 700,
                                                                    backgroundColor: '#f1f5f9',
                                                                    color: '#0b1b3d',
                                                                    border: '1px solid #e2e8f0',
                                                                    padding: '1px 5px',
                                                                    borderRadius: 3,
                                                                    marginTop: 2
                                                                }}>
                                                                    Room {classInfo.room_number}
                                                                </div>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <span style={{ color: '#cbd5e1', fontWeight: 'bold' }}>—</span>
                                                    )}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>

                    {!isModal && legendEntries.length > 0 && (
                        <div style={{ marginTop: 16 }}>
                            <div style={{
                                fontSize: 11,
                                fontWeight: 700,
                                color: '#061129',
                                textTransform: 'uppercase',
                                marginBottom: 6,
                                borderBottom: '1px solid #e2e8f0',
                                paddingBottom: 4
                            }}>
                                Faculty & Subject Reference Directory
                            </div>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
                                <thead>
                                    <tr style={{ backgroundColor: '#f1f5f9' }}>
                                        <th style={{ border: '1px solid #cbd5e1', padding: '5px 8px', textAlign: 'center', width: 40 }}>#</th>
                                        <th style={{ border: '1px solid #cbd5e1', padding: '5px 8px', textAlign: 'left' }}>Subject Name</th>
                                        <th style={{ border: '1px solid #cbd5e1', padding: '5px 8px', textAlign: 'left' }}>Instructor / Faculty</th>
                                        <th style={{ border: '1px solid #cbd5e1', padding: '5px 8px', textAlign: 'center', width: 140 }}>Room Allocation</th>
                                        <th style={{ border: '1px solid #cbd5e1', padding: '5px 8px', textAlign: 'center', width: 120 }}>Weekly Frequency</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {legendEntries.map((entry, idx) => (
                                        <tr key={idx} style={{ backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                                            <td style={{ border: '1px solid #e2e8f0', padding: '5px 8px', textAlign: 'center', fontWeight: 'bold' }}>{idx + 1}</td>
                                            <td style={{ border: '1px solid #e2e8f0', padding: '5px 8px', fontWeight: 700, color: '#061129' }}>{entry.subject}</td>
                                            <td style={{ border: '1px solid #e2e8f0', padding: '5px 8px', color: '#475569' }}>{entry.teacher}</td>
                                            <td style={{ border: '1px solid #e2e8f0', padding: '5px 8px', textAlign: 'center' }}>{entry.room}</td>
                                            <td style={{ border: '1px solid #e2e8f0', padding: '5px 8px', textAlign: 'center', fontWeight: 'bold' }}>{entry.count}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {!isModal && (
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            marginTop: 32,
                            paddingTop: 8
                        }}>
                            <div style={{ textAlign: 'center', width: 200 }}>
                                <div style={{ borderTop: '1.5px solid #061129', marginBottom: 4 }} />
                                <div style={{ fontSize: 11, fontWeight: 700, color: '#061129', textTransform: 'uppercase' }}>Prepared By</div>
                                <div style={{ fontSize: 10, color: '#64748b' }}>Timetable Committee</div>
                            </div>
                            <div style={{ textAlign: 'center', width: 200 }}>
                                <div style={{ borderTop: '1.5px solid #061129', marginBottom: 4 }} />
                                <div style={{ fontSize: 11, fontWeight: 700, color: '#061129', textTransform: 'uppercase' }}>Verified By</div>
                                <div style={{ fontSize: 10, color: '#64748b' }}>Academic In-charge</div>
                            </div>
                            <div style={{ textAlign: 'center', width: 200 }}>
                                <div style={{ borderTop: '1.5px solid #061129', marginBottom: 4 }} />
                                <div style={{ fontSize: 11, fontWeight: 700, color: '#061129', textTransform: 'uppercase' }}>Approved By</div>
                                <div style={{ fontSize: 10, color: '#64748b' }}>Principal / Administrator</div>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
});

export default PrintableTimetable;