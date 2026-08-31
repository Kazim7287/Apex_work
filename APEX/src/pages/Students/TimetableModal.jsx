// src/pages/Students/TimetableModal.jsx
import React, { useState } from 'react';
import { Modal, Button, Table, Tag, Spin, Alert, Typography } from 'antd';
import { CalendarOutlined, ArrowRightOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const TimetableModal = () => {
  const [state, setState] = useState({
    visible: false,
    loading: false,
    timetable: [],
    sectionName: '',
    error: null
  });

  const API_BASE_URL = 'https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX';

  const fetchTimetable = async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const sectionId = localStorage.getItem('section_id') || 1;

      const response = await fetch(`${API_BASE_URL}/GetstdTimetable.php?section_id=${sectionId}`);
      
      if (!response.ok) {
        throw new Error('Failed to load timetable data');
      }

      const data = await response.json();

      if (data.timetable && Array.isArray(data.timetable)) {
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
          sectionName: data.section_name || 'Section Schedule',
          loading: false
        }));
      } else {
        setState(prev => ({ ...prev, timetable: [], loading: false }));
      }
    } catch (error) {
      console.error('Timetable fetch error:', error);
      setState(prev => ({ ...prev, error: error.message, loading: false }));
    }
  };

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const columns = [
    {
      title: 'Time Slot',
      dataIndex: 'time',
      key: 'time',
      fixed: 'left',
      width: 140,
      render: (time) => <Tag color="navy" style={{ background: '#0b1b3d', color: '#d4af37', fontWeight: 700, borderRadius: 6 }}>{time}</Tag>
    },
    ...days.map(day => ({
      title: day,
      dataIndex: day,
      key: day,
      render: (entry) => entry ? (
        <div style={{ padding: '6px 8px', background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
          <Text strong style={{ color: '#0b1b3d', display: 'block', fontSize: 13 }}>{entry.subject}</Text>
          <Text style={{ color: '#64748b', fontSize: 11, display: 'block' }}>{entry.teacher}</Text>
          {entry.room && <Text style={{ color: '#d4af37', fontSize: 10, fontWeight: 600 }}>Room {entry.room}</Text>}
        </div>
      ) : <Text style={{ color: '#cbd5e1' }}>—</Text>
    }))
  ];

  return (
    <>
      <Button
        type="primary"
        block
        onClick={() => {
          setState(prev => ({ ...prev, visible: true }));
          fetchTimetable();
        }}
        style={{ borderRadius: 8, background: '#0b1b3d' }}
      >
        View Timetable <ArrowRightOutlined />
      </Button>

      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: '#0b1b3d', color: '#d4af37', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CalendarOutlined />
            </div>
            <div>
              <span style={{ color: '#0b1b3d', fontWeight: 700 }}>Class Timetable Schedule</span>
              {state.sectionName && (
                <Tag color="gold" style={{ marginLeft: 8, borderRadius: 6, fontWeight: 600 }}>
                  {state.sectionName}
                </Tag>
              )}
            </div>
          </div>
        }
        open={state.visible}
        onCancel={() => setState(prev => ({ ...prev, visible: false }))}
        width={1000}
        footer={null}
        centered
        destroyOnClose
      >
        {state.loading ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <Spin size="large" tip="Loading class schedule..." />
          </div>
        ) : state.error ? (
          <Alert
            type="info"
            message="Notice"
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
          <Alert message="No timetable records have been mapped for your section yet." type="info" showIcon />
        )}
      </Modal>
    </>
  );
};

export default TimetableModal;