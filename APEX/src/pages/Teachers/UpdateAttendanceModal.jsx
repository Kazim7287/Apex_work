/* eslint-disable react/prop-types */
import React, { useState } from 'react';
import { Modal, DatePicker, Button, Table, Space, Tag, message, Radio, Typography } from 'antd';
import { EditOutlined, CalendarOutlined, CheckCircleOutlined, CloseCircleOutlined, ExclamationCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import moment from 'moment';

const { Text } = Typography;

// Attendance status enums
const ATTENDANCE_STATUS = {
  PRESENT: 'Present',
  ABSENT: 'Absent',
  LEAVE: 'Leave',
  LATE_COMER: 'Late Comer',
  HALF_LEAVE: 'Half Leave'
};

// Shared portal palette (matches the navy/gold header used across
// Attendance Management and the rest of the teacher portal).
const THEME = {
  navyDark: '#1B2A4A',
  navyDarker: '#141F38',
  gold: '#F0B429',
  goldSoft: '#FBE8B5'
};

// eslint-disable-next-line react/prop-types
const UpdateAttendanceModal = ({
  visible,
  onCancel,
  sectionId,
  teacherId,
  sectionName,
  screenSize,
  students
}) => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);

  const getAttendanceTag = (status) => {
    switch (status) {
      case ATTENDANCE_STATUS.PRESENT:
        return <Tag icon={<CheckCircleOutlined />} color="success" style={{ borderRadius: 20, padding: '2px 10px' }}>Present</Tag>;
      case ATTENDANCE_STATUS.LEAVE:
        return <Tag icon={<ExclamationCircleOutlined />} color="warning" style={{ borderRadius: 20, padding: '2px 10px' }}>Leave</Tag>;
      case ATTENDANCE_STATUS.HALF_LEAVE:
        return <Tag icon={<ExclamationCircleOutlined />} color="warning" style={{ borderRadius: 20, padding: '2px 10px' }}>Half Leave</Tag>;
      case ATTENDANCE_STATUS.LATE_COMER:
        return <Tag icon={<ClockCircleOutlined />} color="blue" style={{ borderRadius: 20, padding: '2px 10px' }}>Late Comer</Tag>;
      case ATTENDANCE_STATUS.ABSENT:
      default:
        return <Tag icon={<CloseCircleOutlined />} color="error" style={{ borderRadius: 20, padding: '2px 10px' }}>Absent</Tag>;
    }
  };

  const fetchAttendanceByDate = async () => {
    if (!selectedDate) {
      message.error('Please select a date');
      return;
    }

    setLoading(true);

    try {
      const params = new URLSearchParams({
        section_id: sectionId,
        created_at: selectedDate
      });

      const response = await fetch(
        `https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/GetAttendance.php?${params.toString()}`,
        { credentials: 'include' }
      );

      if (response.status === 401) {
        message.error('Session expired. Please login again.');
        window.location.href = '/login';
        return;
      }

      const text = await response.text();

      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.error('JSON parse error:', e, 'Text:', text);
        throw new Error('Invalid JSON response from server');
      }

      if (data.status === 'success' && data.data) {
        const recordsWithNames = data.data.map(record => {
          const student = students.find(s => s.id === record.student_id);
          return {
            ...record,
            key: record.id,
            student_name: student?.Name || record.student_name,
            roll_no: student?.Class_No || record.roll_no,
            editableStatus: record.attendance
          };
        });
        setAttendanceRecords(recordsWithNames);
      } else {
        message.warning(data.message || 'No records found');
        setAttendanceRecords([]);
      }
    } catch (error) {
      console.error('Fetch error:', error);
      message.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (recordId, newStatus) => {
    setAttendanceRecords(prev => prev.map(record =>
      record.id === recordId ? {
        ...record,
        editableStatus: newStatus,
        attendance: newStatus
      } : record
    ));
  };

  const updateAttendance = async () => {
    if (attendanceRecords.length === 0) {
      message.warning('No attendance records to update');
      return;
    }

    setUpdating(true);

    try {
      const updates = attendanceRecords.map(record => ({
        id: record.id,
        student_id: record.student_id,
        section_id: sectionId,
        attendance: record.editableStatus,
        date: record.date || selectedDate
      }));

      const response = await fetch(
        'https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/attendanceupdate.php',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates),
          credentials: 'include'
        }
      );

      if (response.status === 401) {
        message.error('Session expired. Please login again.');
        window.location.href = '/login';
        throw new Error('Unauthorized');
      }

      const data = await response.json();
      if (data.status === 'success') {
        message.success(data.message);
        onCancel();
        setAttendanceRecords([]);
        setSelectedDate(null);
      } else if (data.status === 'warning') {
        message.warning(data.message);
        onCancel();
      } else {
        throw new Error(data.message || 'Failed to update attendance');
      }
    } catch (error) {
      console.error('Error updating attendance:', error);
      if (!error.message.includes('Unauthorized')) {
        message.error(error.message || 'Error updating attendance');
      }
    } finally {
      setUpdating(false);
    }
  };

  const columns = [
    {
      title: 'Student',
      dataIndex: 'student_name',
      key: 'student',
      fixed: 'left',
      width: screenSize.xs ? 150 : 200,
      render: (text, record) => (
        <Space direction="vertical" size={0}>
          <span style={{ fontSize: screenSize.xs ? '12px' : '14px', fontWeight: 600, color: THEME.navyDark }}>
            {text}
          </span>
          <span style={{ fontSize: screenSize.xs ? '10px' : '12px', color: '#8c93a6' }}>
            Roll: {record.roll_no}
          </span>
        </Space>
      )
    },
    {
      title: 'Current Status',
      dataIndex: 'attendance',
      key: 'status',
      width: screenSize.xs ? 100 : 120,
      render: (status) => getAttendanceTag(status)
    },
    {
      title: 'New Status',
      key: 'new_status',
      width: screenSize.xs ? 220 : 280,
      render: (_, record) => (
        <Radio.Group
          value={record.editableStatus}
          onChange={(e) => handleStatusChange(record.id, e.target.value)}
          buttonStyle="solid"
          size={screenSize.xs ? 'small' : 'middle'}
          className="apc-radio-group"
        >
          <Radio.Button value={ATTENDANCE_STATUS.PRESENT}>Present</Radio.Button>
          <Radio.Button value={ATTENDANCE_STATUS.ABSENT}>Absent</Radio.Button>
          <Radio.Button value={ATTENDANCE_STATUS.LEAVE}>Leave</Radio.Button>
          <Radio.Button value={ATTENDANCE_STATUS.LATE_COMER}>Late</Radio.Button>
          <Radio.Button value={ATTENDANCE_STATUS.HALF_LEAVE}>Half Leave</Radio.Button>
        </Radio.Group>
      )
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      width: screenSize.xs ? 100 : 120,
      render: (date) => (
        <span style={{ fontSize: screenSize.xs ? '12px' : '14px', color: '#555' }}>
          {date ? moment(date).format('MMM D, YYYY') : 'N/A'}
        </span>
      )
    }
  ];

  return (
    <Modal
      open={visible}
      onCancel={onCancel}
      width={screenSize.xs ? '95%' : 820}
      closeIcon={<span style={{ color: '#fff', fontSize: 16 }}>✕</span>}
      styles={{
        content: { padding: 0, borderRadius: 16, overflow: 'hidden' },
        body: { padding: 0 }
      }}
      footer={null}
    >
      {/* Navy header banner — matches the Attendance Management hero */}
      <div
        style={{
          background: `linear-gradient(135deg, ${THEME.navyDark} 0%, ${THEME.navyDarker} 100%)`,
          padding: screenSize.xs ? '20px 20px 18px' : '28px 32px 24px',
        }}
      >
        <Space size={8} align="center" style={{ marginBottom: 10 }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: 'rgba(255,255,255,0.08)',
              border: `1px solid ${THEME.gold}55`,
              color: THEME.gold,
              borderRadius: 20,
              padding: '4px 12px',
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: 0.3
            }}
          >
            <EditOutlined /> UPDATE ATTENDANCE
          </span>
        </Space>
        <div style={{ color: '#fff', fontSize: screenSize.xs ? 20 : 24, fontWeight: 700, lineHeight: 1.25 }}>
          {sectionName || 'Selected Class'}
        </div>
        <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>
          Pick a date to pull that day&apos;s records, then adjust and save.
        </Text>
      </div>

      {/* Body */}
      <div style={{ padding: screenSize.xs ? '16px' : '24px' }}>
        <Space
          style={{ marginBottom: 18, width: '100%' }}
          direction={screenSize.xs ? 'vertical' : 'horizontal'}
        >
          <DatePicker
            onChange={(date, dateString) => {
              setSelectedDate(dateString);
              setAttendanceRecords([]);
            }}
            style={{ width: screenSize.xs ? '100%' : 200, borderRadius: 8 }}
            placeholder="Select date"
            format="YYYY-MM-DD"
            suffixIcon={<CalendarOutlined style={{ color: THEME.navyDark }} />}
            disabledDate={(current) => current && current > moment().endOf('day')}
            size={screenSize.xs ? 'small' : 'middle'}
          />
          <Button
            onClick={fetchAttendanceByDate}
            loading={loading}
            disabled={!selectedDate}
            icon={<EditOutlined />}
            size={screenSize.xs ? 'small' : 'middle'}
            style={{
              background: THEME.navyDark,
              borderColor: THEME.navyDark,
              color: '#fff',
              borderRadius: 8,
              fontWeight: 500
            }}
          >
            Load Records
          </Button>
        </Space>

        <Table
          columns={columns}
          dataSource={attendanceRecords}
          loading={loading}
          rowKey="id"
          pagination={false}
          scroll={{ x: screenSize.xs ? 560 : true }}
          size={screenSize.xs ? 'small' : 'middle'}
          className="apc-table"
          locale={{
            emptyText: selectedDate
              ? 'No attendance records found for the selected date'
              : 'Please select a date and click "Load Records"'
          }}
        />

        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 10,
            marginTop: 22,
            paddingTop: 16,
            borderTop: '1px solid #eef0f4'
          }}
        >
          <Button
            onClick={onCancel}
            size={screenSize.xs ? 'small' : 'middle'}
            style={{ borderRadius: 8 }}
          >
            Cancel
          </Button>
          <Button
            loading={updating}
            onClick={updateAttendance}
            disabled={attendanceRecords.length === 0}
            size={screenSize.xs ? 'small' : 'middle'}
            style={{
              background: THEME.gold,
              borderColor: THEME.gold,
              color: THEME.navyDarker,
              borderRadius: 8,
              fontWeight: 600
            }}
          >
            Update Attendance
          </Button>
        </div>
      </div>

      <style>{`
        .apc-table .ant-table-thead > tr > th {
          background: #F7F8FB;
          color: ${THEME.navyDark};
          font-weight: 600;
          border-bottom: 1px solid #eef0f4;
        }
        .apc-table .ant-table-tbody > tr > td {
          border-bottom: 1px solid #f2f3f6;
        }
        .apc-radio-group .ant-radio-button-wrapper-checked:not(.ant-radio-button-wrapper-disabled) {
          background: ${THEME.navyDark} !important;
          border-color: ${THEME.navyDark} !important;
          box-shadow: none !important;
        }
        .apc-radio-group .ant-radio-button-wrapper-checked:not(.ant-radio-button-wrapper-disabled)::before {
          background-color: ${THEME.navyDark} !important;
        }
      `}</style>
    </Modal>
  );
};

export default UpdateAttendanceModal;