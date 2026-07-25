import React, { useState } from 'react';
import { Modal, Button, Table, Tag, Spin, Alert, message } from 'antd';
import { CalendarOutlined } from '@ant-design/icons';

const TimetableModal = () => {
  const [state, setState] = useState({
    visible: false,
    loading: false,
    timetable: [],
    sectionName: '',
    error: null
  });

  const fetchTimetable = async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      // Get section_id from localStorage
      const sectionId = localStorage.getItem('section_id');
      
      if (!sectionId) {
        throw new Error('Section ID not found in local storage');
      }

      const response = await fetch(`https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/GetstdTimetable.php?section_id=${sectionId}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to load timetable');
      }

      const data = await response.json();

      // Transform timetable data for display
      const formattedTimetable = data.timetable.reduce((acc, item) => {
        const timeSlot = `${item.start_time} - ${item.end_time}`;
        acc[timeSlot] = acc[timeSlot] || {};
        acc[timeSlot][item.day] = {
          subject: item.subject_name,
          teacher: item.teach_name,
          room: item.room_number
        };
        return acc;
      }, {});

      setState(prev => ({
        ...prev,
        timetable: Object.entries(formattedTimetable).map(([time, days]) => ({
          time,
          ...days
        })),
        sectionName: data.section_name,
        loading: false
      }));

    } catch (error) {
      console.error('Timetable fetch error:', error);
      setState(prev => ({ ...prev, error: error.message, loading: false }));
      message.error(error.message);
    }
  };

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const columns = [
    {
      title: 'Time Slot',
      dataIndex: 'time',
      key: 'time',
      fixed: 'left',
      width: 150,
      render: time => <Tag color="blue">{time}</Tag>
    },
    ...days.map(day => ({
      title: day,
      dataIndex: day,
      key: day,
      render: entry => entry ? (
        <div style={{ padding: 8 }}>
          <strong>{entry.subject}</strong><br />
          <span style={{ color: '#666' }}>{entry.teacher}</span><br />
          {entry.room && <span style={{ color: '#666' }}>Room: {entry.room}</span>}
        </div>
      ) : '-'
    }))
  ];

  return (
    <>
      <Button
        type="primary"
        icon={<CalendarOutlined />}
        onClick={() => {
          setState(prev => ({ ...prev, visible: true }));
          fetchTimetable();
        }}
      >
        View Timetable
      </Button>

      <Modal
        title={
          <>
            <CalendarOutlined style={{ marginRight: 8 }} />
            Class Timetable
            {state.sectionName && (
              <Tag color="blue" style={{ marginLeft: 8 }}>
                {state.sectionName}
              </Tag>
            )}
          </>
        }
        open={state.visible}
        onCancel={() => setState(prev => ({ ...prev, visible: false }))}
        width={1000}
        footer={null}
        destroyOnClose
      >
        {state.loading ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <Spin size="large" tip="Loading timetable..." />
          </div>
        ) : state.error ? (
          <Alert
            type="error"
            message="Error"
            description={state.error}
            action={
              <Button size="small" onClick={fetchTimetable}>
                Retry
              </Button>
            }
          />
        ) : state.timetable.length > 0 ? (
          <Table
            columns={columns}
            dataSource={state.timetable}
            bordered
            pagination={false}
            scroll={{ x: 'max-content' }}
            rowKey="time"
          />
        ) : (
          <span style={{ color: '#999' }}>No timetable data available</span>
        )}
      </Modal>
    </>
  );
};

export default TimetableModal;