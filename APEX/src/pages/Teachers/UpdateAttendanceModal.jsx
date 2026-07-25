/* eslint-disable react/prop-types */
import React, { useState } from 'react';
import { Modal, DatePicker, Button, Table, Space, Tag, message, Radio } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import moment from 'moment';

// Attendance status enums
const ATTENDANCE_STATUS = {
  PRESENT: 'Present',
  ABSENT: 'Absent',
  LEAVE: 'Leave',
  LATE_COMER: 'Late Comer',
  HALF_LEAVE: 'Half Leave'
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
    switch(status) {
      case ATTENDANCE_STATUS.PRESENT:
        return <Tag color="success">Present</Tag>;
      case ATTENDANCE_STATUS.LEAVE:
        return <Tag color="warning">Leave</Tag>;
      case ATTENDANCE_STATUS.HALF_LEAVE:
        return <Tag color="warning">Half Leave</Tag>;
      case ATTENDANCE_STATUS.LATE_COMER:
        return <Tag color="blue">Late Comer</Tag>;
      case ATTENDANCE_STATUS.ABSENT:
      default:
        return <Tag color="error">Absent</Tag>;
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

    const response = await fetch(`https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/GetAttendance.php?${params.toString()}`, {
      credentials: 'include'
    });

    console.log('Response status:', response.status);
    
    if (response.status === 401) {
      message.error('Session expired. Please login again.');
      window.location.href = '/login';
      return;
    }

    const text = await response.text();
    console.log('Raw response:', text);
    
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      console.error('JSON parse error:', e, 'Text:', text);
      throw new Error('Invalid JSON response from server');
    }

    console.log('Parsed data:', data);
    
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
  
      const response = await fetch('https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/attendanceupdate.php', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
        credentials: 'include'
      });

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
          <span style={{ fontSize: screenSize.xs ? '12px' : '14px' }}>{text}</span>
          <span style={{ fontSize: screenSize.xs ? '10px' : '12px', color: '#666' }}>
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
      width: screenSize.xs ? 200 : 250,
      render: (_, record) => (
        <Radio.Group
          value={record.editableStatus}
          onChange={(e) => handleStatusChange(record.id, e.target.value)}
          buttonStyle="solid"
          size={screenSize.xs ? 'small' : 'middle'}
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
        <span style={{ fontSize: screenSize.xs ? '12px' : '14px' }}>
          {date ? moment(date).format('MMM D, YYYY') : 'N/A'}
        </span>
      )
    }
  ];

  return (
    <Modal
      title={`Update Attendance - ${sectionName}`}
      visible={visible}
      onCancel={onCancel}
      width={screenSize.xs ? '95%' : 800}
      bodyStyle={{ padding: screenSize.xs ? '12px' : '24px' }}
      footer={[
        <Button key="cancel" onClick={onCancel} size={screenSize.xs ? 'small' : 'middle'}>
          Cancel
        </Button>,
        <Button
          key="update"
          type="primary"
          loading={updating}
          onClick={updateAttendance}
          disabled={attendanceRecords.length === 0}
          size={screenSize.xs ? 'small' : 'middle'}
        >
          Update Attendance
        </Button>
      ]}
    >
      <Space style={{ marginBottom: 20 }} direction={screenSize.xs ? 'vertical' : 'horizontal'}>
        <DatePicker
          onChange={(date, dateString) => {
            setSelectedDate(dateString);
            setAttendanceRecords([]);
          }}
          style={{ width: screenSize.xs ? '100%' : 200 }}
          placeholder="Select date"
          format="YYYY-MM-DD"
          disabledDate={(current) => current && current > moment().endOf('day')}
          size={screenSize.xs ? 'small' : 'middle'}
        />
        <Button
          type="primary"
          onClick={fetchAttendanceByDate}
          loading={loading}
          disabled={!selectedDate}
          icon={<EditOutlined />}
          size={screenSize.xs ? 'small' : 'middle'}
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
        scroll={{ x: screenSize.xs ? 500 : true }}
        size={screenSize.xs ? 'small' : 'middle'}
        locale={{ 
          emptyText: selectedDate 
            ? 'No attendance records found for the selected date' 
            : 'Please select a date and click "Load Records"'
        }}
      />
    </Modal>
  );
};

export default UpdateAttendanceModal;