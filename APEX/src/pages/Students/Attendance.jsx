// src/pages/Students/Attendance.jsx
import React, { useState, useEffect } from "react";
import { 
  Table, 
  Tag, 
  Spin, 
  Alert, 
  DatePicker, 
  Select, 
  Button, 
  Space, 
  Tabs, 
  Card, 
  Statistic, 
  Row, 
  Col,
  Typography,
  Progress,
  Tooltip
} from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  UserOutlined,
  FileTextOutlined,
  ExclamationCircleOutlined,
  CalendarOutlined,
  ReloadOutlined,
  FilterOutlined,
  BookOutlined,
  FireOutlined
} from '@ant-design/icons';
import dayjs from "dayjs";

const { RangePicker } = DatePicker;
const { Option } = Select;
const { TabPane } = Tabs;
const { Title, Text } = Typography;

const AttendanceSection = () => {
  const [attendanceData, setAttendanceData] = useState({
    attendance_records: [],
    subject_summary: [],
    overall_summary: {},
    streaks: {}
  });
  const [filteredAttendance, setFilteredAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState(null);
  const [subjectFilter, setSubjectFilter] = useState(null);
  const [activeTab, setActiveTab] = useState("1");
  const [books, setBooks] = useState([]);
  const [booksLoading, setBooksLoading] = useState(false);
  

  const studentId = localStorage.getItem("student_id");
  const API_BASE_URL = "https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX";

  const fetchAttendanceData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!studentId) {
        throw new Error("Student ID not found. Please log in again.");
      }

      const response = await fetch(
        `${API_BASE_URL}/getdstd_attendancesummery.php?student_id=${studentId}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch attendance data");
      }

      const data = await response.json();

      if (data.success) {
        const rawRecords = data.data.attendance_records || [];
        setAttendanceData({
          attendance_records: rawRecords,
          subject_summary: data.data.subject_summary || [],
          overall_summary: data.data.overall_summary || {},
          streaks: data.data.streaks || {}
        });
        setFilteredAttendance(rawRecords);
      
      } else {
        throw new Error(data.error || "No attendance records found");
      }
    } catch (err) {
      setError(err.message);
      console.error("Attendance fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchBooks = async () => {
    try {
      setBooksLoading(true);
      const response = await fetch(`${API_BASE_URL}/Book_read.php`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch books data");
      }

      const data = await response.json();
      
      if (data.success && Array.isArray(data.data)) {
        setBooks(data.data);
      } else {
        setBooks([]);
      }
    } catch (err) {
      console.error("Books fetch error:", err);
      setBooks([]);
    } finally {
      setBooksLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendanceData();
    fetchBooks();
  }, [studentId]);

  const handleFilter = () => {
    let filteredData = [...(attendanceData.attendance_records || [])];

    if (dateRange && dateRange.length === 2) {
      const startDate = dayjs(dateRange[0]).startOf('day');
      const endDate = dayjs(dateRange[1]).endOf('day');
      
      filteredData = filteredData.filter((record) => {
        const recordDate = dayjs(record.date);
        return (recordDate.isAfter(startDate) || recordDate.isSame(startDate, 'day')) && 
               (recordDate.isBefore(endDate) || recordDate.isSame(endDate, 'day'));
      });
    }

    if (subjectFilter) {
      filteredData = filteredData.filter((record) => 
        record.subject_name === subjectFilter
      );
    }

    setFilteredAttendance(filteredData);
  };

  const handleResetFilters = () => {
    setDateRange(null);
    setSubjectFilter(null);
    setFilteredAttendance(attendanceData.attendance_records || []);
  };

  const getAttendanceTag = (status) => {
    const s = String(status || '').toLowerCase();
    switch(s) {
      case 'present':
        return <Tag icon={<CheckCircleOutlined />} color="success" style={{ borderRadius: 12, padding: '2px 10px', fontWeight: 600 }}>PRESENT</Tag>;
      case 'absent':
        return <Tag icon={<CloseCircleOutlined />} color="error" style={{ borderRadius: 12, padding: '2px 10px', fontWeight: 600 }}>ABSENT</Tag>;
      case 'leave':
        return <Tag icon={<UserOutlined />} color="processing" style={{ borderRadius: 12, padding: '2px 10px', fontWeight: 600 }}>LEAVE</Tag>;
      case 'late comer':
      case 'late':
        return <Tag icon={<ClockCircleOutlined />} color="warning" style={{ borderRadius: 12, padding: '2px 10px', fontWeight: 600 }}>LATE</Tag>;
      case 'half leave':
        return <Tag icon={<ExclamationCircleOutlined />} color="cyan" style={{ borderRadius: 12, padding: '2px 10px', fontWeight: 600 }}>HALF LEAVE</Tag>;
      default:
        return <Tag style={{ borderRadius: 12 }}>{status || 'Unknown'}</Tag>;
    }
  };

  const detailedAttendanceColumns = [
    {
      title: "Date & Day",
      dataIndex: "date",
      key: "date",
      width: 170,
      render: (date) => (
        <div>
          <Text strong style={{ color: '#0b1b3d', fontSize: 13 }}>
            {dayjs(date).format("YYYY-MM-DD")}
          </Text>
          <Text style={{ fontSize: 11, color: '#64748b', display: 'block' }}>
            {dayjs(date).format("dddd")}
          </Text>
        </div>
      ),
      sorter: (a, b) => new Date(a.date) - new Date(b.date),
    },
    {
      title: "Subject",
      dataIndex: "subject_name",
      key: "subject_name",
      render: (text) => (
        <Text strong style={{ color: '#0f172a' }}>{text || 'All Subjects'}</Text>
      ),
      sorter: (a, b) => String(a.subject_name || '').localeCompare(String(b.subject_name || '')),
    },
    {
      title: "Section",
      dataIndex: "section_name",
      key: "section_name",
      responsive: ['md'],
      render: (text) => <Text style={{ color: '#64748b' }}>{text || 'Default'}</Text>
    },
    {
      title: "Status",
      dataIndex: "attendance",
      key: "attendance",
      align: 'center',
      width: 140,
      render: (status) => getAttendanceTag(status),
      filters: [
        { text: 'Present', value: 'Present' },
        { text: 'Absent', value: 'Absent' },
        { text: 'Leave', value: 'Leave' },
        { text: 'Late Comer', value: 'Late Comer' },
        { text: 'Half Leave', value: 'Half Leave' },
      ],
      onFilter: (value, record) => record.attendance === value,
    },
    {
      title: "Recorded At",
      dataIndex: "created_at",
      key: "created_at",
      responsive: ['lg'],
      width: 160,
      render: (date) => (
        <Text style={{ color: '#64748b', fontSize: 12 }}>
          {date ? dayjs(date).format("MMM DD, YYYY HH:mm") : "—"}
        </Text>
      ),
    },
  ];

  const subjectSummaryColumns = [
    {
      title: "Subject Name",
      dataIndex: "subject_name",
      key: "subject_name",
      render: (text) => (
        <Text strong style={{ color: '#0b1b3d', fontSize: 14 }}>{text}</Text>
      ),
      sorter: (a, b) => String(a.subject_name).localeCompare(String(b.subject_name)),
    },
    {
      title: "Total Classes",
      dataIndex: "total_classes",
      key: "total_classes",
      align: 'center',
      sorter: (a, b) => a.total_classes - b.total_classes,
      render: (val) => <Text strong>{val}</Text>
    },
    {
      title: "Present",
      dataIndex: "present_count",
      key: "present_count",
      align: 'center',
      render: (count) => (
        <Tag color="success" style={{ borderRadius: 6, fontWeight: 700 }}>
          {count}
        </Tag>
      ),
      sorter: (a, b) => a.present_count - b.present_count,
    },
    {
      title: "Absent",
      dataIndex: "absent_count",
      key: "absent_count",
      align: 'center',
      render: (count) => (
        <Tag color="error" style={{ borderRadius: 6, fontWeight: 700 }}>
          {count}
        </Tag>
      ),
      sorter: (a, b) => a.absent_count - b.absent_count,
    },
    {
      title: "Leaves",
      dataIndex: "leave_count",
      key: "leave_count",
      align: 'center',
      responsive: ['md'],
      render: (count) => <Text style={{ color: '#3b82f6' }}>{count}</Text>,
    },
    {
      title: "Late",
      dataIndex: "late_comer_count",
      key: "late_comer_count",
      align: 'center',
      responsive: ['md'],
      render: (count) => <Text style={{ color: '#f59e0b' }}>{count}</Text>,
    },
    {
      title: "Ratio",
      dataIndex: "attendance_percentage",
      key: "attendance_percentage",
      align: 'center',
      width: 100,
      render: (percentage) => (
        <Progress
          type="circle"
          percent={percentage || 0}
          size={42}
          strokeColor={
            percentage >= 75 ? '#10b981' :
            percentage >= 50 ? '#f59e0b' : '#ef4444'
          }
          format={(p) => `${p}%`}
        />
      ),
      sorter: (a, b) => (a.attendance_percentage || 0) - (b.attendance_percentage || 0),
    },
  ];

  const booksColumns = [
    {
      title: "Book Ref",
      dataIndex: "id",
      key: "id",
      width: 100,
      render: (id) => <Tag color="navy" style={{ background: '#0b1b3d', color: '#d4af37', borderRadius: 6 }}>#{id}</Tag>
    },
    {
      title: "Material Title",
      dataIndex: "name",
      key: "name",
      render: (text) => (
        <Space>
          <BookOutlined style={{ color: '#1e3a8a' }} />
          <Text strong style={{ color: '#0b1b3d' }}>{text}</Text>
        </Space>
      ),
    },
    {
      title: "Status",
      key: "status",
      render: () => <Tag color="green" style={{ borderRadius: 6 }}>Available</Tag>
    }
  ];

  if (loading && (!attendanceData.attendance_records || attendanceData.attendance_records.length === 0)) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Spin size="large" tip="Loading attendance overview..." />
      </div>
    );
  }

  const overall = attendanceData.overall_summary || {};
  const streaks = attendanceData.streaks || {};

  return (
    <div style={{ maxWidth: 1400, margin: "0 auto" }}>
      {/* Header Banner */}
      <Card
        className="apex-card"
        style={{ marginBottom: 24 }}
        bodyStyle={{ padding: "20px 24px" }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: "linear-gradient(135deg, #0b1b3d 0%, #1e3a8a 100%)",
                color: "#d4af37",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 22,
                boxShadow: "0 4px 12px rgba(11, 27, 61, 0.2)",
              }}
            >
              <CalendarOutlined />
            </div>
            <div>
              <Title level={4} style={{ margin: 0, color: "#0b1b3d", fontWeight: 800 }}>
                Student Attendance Records & Analytics
              </Title>
              <Text style={{ color: "#64748b", fontSize: 13 }}>
                Check daily presence, streak count, subject-wise attendance ratios, and syllabus resources
              </Text>
            </div>
          </div>

          <Button
            icon={<ReloadOutlined />}
            onClick={fetchAttendanceData}
            loading={loading}
            style={{ borderRadius: 8 }}
          >
            Refresh
          </Button>
        </div>
      </Card>

      {error && (
        <Alert
          message="Notice"
          description={error}
          type="info"
          showIcon
          style={{ marginBottom: 24, borderRadius: 12 }}
        />
      )}

      {/* Primary Statistics Grid */}
      <Row gutter={[20, 20]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="apex-card apex-card-gold-header" bodyStyle={{ padding: 20 }}>
            <Statistic
              title={<Text style={{ color: '#64748b', fontSize: 12, fontWeight: 700, textTransform: 'uppercase' }}>Total Classes</Text>}
              value={overall.total_classes || 0}
              prefix={<FileTextOutlined style={{ color: '#0b1b3d' }} />}
              valueStyle={{ color: '#0b1b3d', fontWeight: 800, fontSize: 22 }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="apex-card apex-card-gold-header" bodyStyle={{ padding: 20 }}>
            <Statistic
              title={<Text style={{ color: '#64748b', fontSize: 12, fontWeight: 700, textTransform: 'uppercase' }}>Days Present</Text>}
              value={overall.total_present || 0}
              prefix={<CheckCircleOutlined style={{ color: '#10b981' }} />}
              valueStyle={{ color: '#10b981', fontWeight: 800, fontSize: 22 }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="apex-card apex-card-gold-header" bodyStyle={{ padding: 20 }}>
            <Statistic
              title={<Text style={{ color: '#64748b', fontSize: 12, fontWeight: 700, textTransform: 'uppercase' }}>Days Absent</Text>}
              value={overall.total_absent || 0}
              prefix={<CloseCircleOutlined style={{ color: '#ef4444' }} />}
              valueStyle={{ color: '#ef4444', fontWeight: 800, fontSize: 22 }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="apex-card apex-card-gold-header" bodyStyle={{ padding: 20 }}>
            <Statistic
              title={<Text style={{ color: '#64748b', fontSize: 12, fontWeight: 700, textTransform: 'uppercase' }}>Overall Attendance</Text>}
              value={overall.overall_attendance_percentage || 0}
              suffix="%"
              prefix={<CalendarOutlined style={{ color: '#d4af37' }} />}
              valueStyle={{ 
                color: (overall.overall_attendance_percentage || 0) >= 75 ? '#10b981' : (overall.overall_attendance_percentage || 0) >= 50 ? '#f59e0b' : '#ef4444', 
                fontWeight: 800, 
                fontSize: 22 
              }}
            />
          </Card>
        </Col>
      </Row>

      {/* Secondary Streak & Exceptions Row */}
      <Row gutter={[20, 20]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={6}>
          <Card className="apex-card" bodyStyle={{ padding: '14px 18px', textAlign: 'center' }}>
            <Text style={{ color: '#64748b', fontSize: 11, display: 'block', textTransform: 'uppercase' }}>Approved Leaves</Text>
            <Title level={4} style={{ margin: '4px 0 0 0', color: '#3b82f6', fontWeight: 700 }}>
              {overall.total_leave || 0}
            </Title>
          </Card>
        </Col>

        <Col xs={12} sm={6}>
          <Card className="apex-card" bodyStyle={{ padding: '14px 18px', textAlign: 'center' }}>
            <Text style={{ color: '#64748b', fontSize: 11, display: 'block', textTransform: 'uppercase' }}>Late Arrivals</Text>
            <Title level={4} style={{ margin: '4px 0 0 0', color: '#f59e0b', fontWeight: 700 }}>
              {overall.total_late_comer || 0}
            </Title>
          </Card>
        </Col>

        <Col xs={12} sm={6}>
          <Card className="apex-card" bodyStyle={{ padding: '14px 18px', textAlign: 'center' }}>
            <Text style={{ color: '#64748b', fontSize: 11, display: 'block', textTransform: 'uppercase' }}>Half Leaves</Text>
            <Title level={4} style={{ margin: '4px 0 0 0', color: '#06b6d4', fontWeight: 700 }}>
              {overall.total_half_leave || 0}
            </Title>
          </Card>
        </Col>

        <Col xs={12} sm={6}>
          <Card className="apex-card" bodyStyle={{ padding: '14px 18px', textAlign: 'center', background: 'linear-gradient(135deg, #0b1b3d 0%, #1e3a8a 100%)' }}>
            <Text style={{ color: '#d4af37', fontSize: 11, display: 'block', textTransform: 'uppercase', fontWeight: 700 }}>
              <FireOutlined /> Current Streak
            </Text>
            <Title level={4} style={{ margin: '4px 0 0 0', color: '#ffffff', fontWeight: 800 }}>
              {streaks.current_streak || 0} Days
            </Title>
          </Card>
        </Col>
      </Row>

      {/* Main Tabs Container */}
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        type="card"
      >
        {/* TAB 1: DETAILED RECORDS */}
        <TabPane tab={<Space><CalendarOutlined /> Daily Attendance Records</Space>} key="1">
          <Card
            className="apex-card"
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 0' }}>
                <div style={{ width: 34, height: 34, borderRadius: 8, background: 'rgba(212, 175, 55, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d4af37', fontSize: 16 }}>
                  <CalendarOutlined />
                </div>
                <div>
                  <Title level={5} style={{ margin: 0, color: '#0b1b3d', fontWeight: 700 }}>
                    Detailed Attendance Log
                  </Title>
                  <Text style={{ color: '#64748b', fontSize: 11 }}>Date-wise entry for all conducted class sessions</Text>
                </div>
              </div>
            }
            extra={
              <Space wrap>
                <RangePicker
                  value={dateRange}
                  onChange={(dates) => setDateRange(dates)}
                  placeholder={['Start Date', 'End Date']}
                  style={{ width: 230, borderRadius: 8 }}
                />
                
                <Select
                  placeholder="Filter by Subject"
                  value={subjectFilter}
                  onChange={setSubjectFilter}
                  style={{ width: 170 }}
                  allowClear
                >
                  {(attendanceData.subject_summary || []).map((subj) => (
                    <Option key={subj.subject_name} value={subj.subject_name}>
                      {subj.subject_name}
                    </Option>
                  ))}
                </Select>
                
                <Button type="primary" onClick={handleFilter} className="apex-btn-gold" style={{ borderRadius: 8 }}>
                  Filter
                </Button>
                
                <Button onClick={handleResetFilters} style={{ borderRadius: 8 }}>
                  Reset
                </Button>
              </Space>
            }
          >
            <Table
              columns={detailedAttendanceColumns}
              dataSource={filteredAttendance}
              rowKey={(record) => record.id || record.attendance_id || `${record.date}-${record.subject_name}`}
              loading={loading}
              scroll={{ x: 'max-content' }}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                pageSizeOptions: ['10', '25', '50', '100'],
                showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} records`
              }}
            />
          </Card>
        </TabPane>

        {/* TAB 2: SUBJECT SUMMARY */}
        <TabPane tab={<Space><FileTextOutlined /> Subject Attendance Ratios</Space>} key="2">
          <Card
            className="apex-card"
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 0' }}>
                <div style={{ width: 34, height: 34, borderRadius: 8, background: 'rgba(212, 175, 55, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d4af37', fontSize: 16 }}>
                  <FileTextOutlined />
                </div>
                <div>
                  <Title level={5} style={{ margin: 0, color: '#0b1b3d', fontWeight: 700 }}>
                    Subject-Wise Breakdown
                  </Title>
                  <Text style={{ color: '#64748b', fontSize: 11 }}>Aggregated attendance statistics by course</Text>
                </div>
              </div>
            }
          >
            <Table
              columns={subjectSummaryColumns}
              dataSource={attendanceData.subject_summary || []}
              rowKey="subject_name"
              scroll={{ x: 'max-content' }}
              pagination={{
                pageSize: 8,
                showSizeChanger: true,
                pageSizeOptions: ['8', '15', '30'],
              }}
            />
          </Card>
        </TabPane>

        {/* TAB 3: READING MATERIALS */}
        <TabPane tab={<Space><BookOutlined /> Course Materials ({books.length})</Space>} key="3">
          <Card
            className="apex-card"
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 0' }}>
                <div style={{ width: 34, height: 34, borderRadius: 8, background: 'rgba(212, 175, 55, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d4af37', fontSize: 16 }}>
                  <BookOutlined />
                </div>
                <div>
                  <Title level={5} style={{ margin: 0, color: '#0b1b3d', fontWeight: 700 }}>
                    Prescribed Reading Materials
                  </Title>
                  <Text style={{ color: '#64748b', fontSize: 11 }}>Official textbooks and references</Text>
                </div>
              </div>
            }
          >
            <Table
              columns={booksColumns}
              dataSource={books}
              rowKey="id"
              loading={booksLoading}
              pagination={{ pageSize: 8 }}
            />
          </Card>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default AttendanceSection;