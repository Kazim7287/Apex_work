import { useState, useEffect } from 'react';
import { 
  message, 
  Button, 
  Modal, 
  DatePicker, 
  Table, 
  Card, 
  Row, 
  Col, 
  Typography,
  Space,
  Tag,
  Progress,
  Select,
  Tabs,
  Spin,
  Avatar,
  Badge,
  Alert,
  Tooltip
} from 'antd';
import { 
  CalendarOutlined, 
  FileTextOutlined, 
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  TeamOutlined,
  UserOutlined,
  ClockCircleOutlined,
  SearchOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;

const AdminAttendanceView = () => {
  const navigate = useNavigate();
  const [sections, setSections] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);
  const [summaryData, setSummaryData] = useState([]);
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [selectedSection, setSelectedSection] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isSummaryModalVisible, setIsSummaryModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('daily');
  const [currentSectionName, setCurrentSectionName] = useState('');

  useEffect(() => {
    fetchAllSections();
  }, []);

  const fetchWithSession = async (url, options = {}) => {
  try {
    const response = await fetch(url, {
      ...options,
      credentials: 'include',
      headers: {
        Accept: 'application/json',
        ...options.headers,
      },
    });

    if (response.status === 401) {
      message.error('Session expired. Please sign in again.');
      navigate('/admin-signin');
      return null;
    }

    if (!response.ok) {
      throw new Error(`Server returned ${response.status}`);
    }

    const data = await response.json();

    if (data && data.error) {
      message.error(data.error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Fetch error:', error);

    message.error(
      error.message === 'Failed to fetch'
        ? 'Unable to connect to the attendance server.'
        : error.message || 'Error fetching data'
    );

    return null;
  }
};

const fetchAllSections = async () => {
  setLoading(true);

  try {
    const data = await fetchWithSession(
      'https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/Sec_Read.php'
    );

    if (data && Array.isArray(data)) {
      setSections(data);
    } else {
      setSections([]);
      message.warning('No sections found');
    }
  } catch (error) {
    console.error('Error fetching sections:', error);
    setSections([]);
  } finally {
    setLoading(false);
  }
};

const fetchAttendanceByDate = async () => {
  if (!selectedSection || !selectedDate) {
    message.warning('Please select a section and date');
    return;
  }

  setLoading(true);

  try {
    const formattedDate = selectedDate.format('YYYY-MM-DD');

    // IMPORTANT:
    // This is the endpoint from your OLD working file.
    const url =
      `https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/GetadAttendance.php` +
      `?section_id=${encodeURIComponent(selectedSection)}` +
      `&date=${encodeURIComponent(formattedDate)}`;

    console.log('Fetching attendance:', url);

    const data = await fetchWithSession(url);

    console.log('Attendance API response:', data);

    if (!data) {
      setAttendanceData([]);
      return;
    }

    if (data.status === 'success' || data.status === 'empty') {
      setAttendanceData(Array.isArray(data.data) ? data.data : []);

      const currentSection = sections.find(
        section => String(section.id) === String(selectedSection)
      );

      setCurrentSectionName(
        currentSection ? currentSection.name : ''
      );

      setIsModalVisible(true);

      if (data.status === 'empty') {
        message.info('No attendance records found for this date.');
      }
    } else {
      setAttendanceData([]);

      message.warning(
        data.message || 'No attendance records found.'
      );
    }
  } catch (error) {
    console.error('Error fetching attendance:', error);
    setAttendanceData([]);
    message.error('Failed to fetch attendance data.');
  } finally {
    setLoading(false);
  }
};

const fetchAttendanceSummary = async () => {
  if (!selectedSection) {
    message.warning('Please select a section');
    return;
  }

  setLoading(true);

  try {
    // IMPORTANT:
    // This is the endpoint from your OLD working file.
    const url =
      `https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/GetadAttendancesummery.php` +
      `?section_id=${encodeURIComponent(selectedSection)}`;

    console.log('Fetching attendance summary:', url);

    const data = await fetchWithSession(url);

    console.log('Attendance summary API response:', data);

    if (!data) {
      setSummaryData([]);
      return;
    }

    if (data.status === 'success') {
      const students = Array.isArray(data.students)
        ? data.students
        : [];

      const transformedData = students.map(student => {
        const records = Array.isArray(student.records)
          ? student.records
          : [];

        const present = records.filter(
          record => record.attendance === 'Present'
        ).length;

        const absent = records.filter(
          record => record.attendance === 'Absent'
        ).length;

        const leave = records.filter(
          record => record.attendance === 'Leave'
        ).length;

        const lateComer = records.filter(
          record => record.attendance === 'Late Comer'
        ).length;

        const halfLeave = records.filter(
          record => record.attendance === 'Half Leave'
        ).length;

        const total = records.length;

        const weightedPresent =
          present +
          lateComer * 0.75 +
          halfLeave * 0.5;

        const percentage =
          total > 0
            ? Math.round((weightedPresent / total) * 100)
            : 0;

        return {
          student_id: student.student_id,
          student_name: student.student_name,
          present,
          absent,
          leave,
          late_comer: lateComer,
          half_leave: halfLeave,
          total,
          percentage,
        };
      });

      setSummaryData(transformedData);

      const currentSection = sections.find(
        section => String(section.id) === String(selectedSection)
      );

      setCurrentSectionName(
        currentSection ? currentSection.name : ''
      );

      setIsSummaryModalVisible(true);

      if (transformedData.length === 0) {
        message.info('No attendance summary available.');
      }
    } else {
      setSummaryData([]);

      message.info(
        data.message || 'No attendance summary available.'
      );
    }
  } catch (error) {
    console.error('Error fetching attendance summary:', error);
    setSummaryData([]);
    message.error('Failed to fetch attendance summary.');
  } finally {
    setLoading(false);
  }
};

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'present':
      case 'p':
        return <Tag icon={<CheckCircleOutlined />} color="success" style={{ borderRadius: 12, padding: '2px 10px' }}>Present</Tag>;
      case 'absent':
      case 'a':
        return <Tag icon={<CloseCircleOutlined />} color="error" style={{ borderRadius: 12, padding: '2px 10px' }}>Absent</Tag>;
      case 'leave':
      case 'l':
        return <Tag icon={<ExclamationCircleOutlined />} color="warning" style={{ borderRadius: 12, padding: '2px 10px' }}>Leave</Tag>;
      case 'late':
        return <Tag icon={<ClockCircleOutlined />} color="processing" style={{ borderRadius: 12, padding: '2px 10px' }}>Late</Tag>;
      default:
        return <Tag color="default">{status || 'N/A'}</Tag>;
    }
  };

  const attendanceColumns = [
    {
      title: 'Student Name',
      dataIndex: 'student_name',
      key: 'student_name',
      render: (name) => (
        <Space>
          <Avatar style={{ background: '#0b1b3d', color: '#d4af37', fontWeight: 700 }} icon={<UserOutlined />} />
          <Text strong style={{ color: '#0f172a' }}>{name}</Text>
        </Space>
      )
    },
    {
      title: 'Roll / Reg No.',
      dataIndex: 'roll_no',
      key: 'roll_no',
      render: (roll) => roll ? <Tag color="blue">#{roll}</Tag> : 'N/A'
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      align: 'center',
      render: (status) => getStatusBadge(status)
    },
    {
      title: 'Remarks / Notes',
      dataIndex: 'remarks',
      key: 'remarks',
      render: (text) => text || '-'
    }
  ];

  const summaryColumns = [
    {
      title: 'Student Name',
      dataIndex: 'student_name',
      key: 'student_name',
      render: (name) => (
        <Space>
          <Avatar style={{ background: '#0b1b3d', color: '#d4af37', fontWeight: 700 }} icon={<UserOutlined />} />
          <Text strong style={{ color: '#0f172a' }}>{name}</Text>
        </Space>
      )
    },
    {
      title: 'Present Days',
      dataIndex: 'present_days',
      key: 'present_days',
      align: 'center',
      render: (val) => <Tag color="success" style={{ fontWeight: 700 }}>{val || 0}</Tag>
    },
    {
      title: 'Total Classes',
      dataIndex: 'total_days',
      key: 'total_days',
      align: 'center',
      render: (val) => <Tag color="blue">{val || 0}</Tag>
    },
    {
      title: 'Attendance Percentage',
      dataIndex: 'attendance_percentage',
      key: 'attendance_percentage',
      render: (pct) => {
        const value = parseFloat(pct || 0);
        let color = '#10b981';
        if (value < 75) color = '#f59e0b';
        if (value < 50) color = '#ef4444';
        return (
          <Progress 
            percent={value} 
            strokeColor={color} 
            size="small" 
            format={(p) => `${p}%`}
            style={{ minWidth: 140 }}
          />
        );
      }
    }
  ];

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto' }}>
      <Card
        className="apex-card"
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: 'linear-gradient(135deg, #0b1b3d 0%, #1e3a8a 100%)', color: '#d4af37', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
              <TeamOutlined />
            </div>
            <div>
              <Title level={4} style={{ margin: 0, color: '#0b1b3d', fontWeight: 700 }}>
                Attendance Control & Register
              </Title>
              <Text style={{ color: '#64748b', fontSize: 12 }}>Check daily student attendance records and overall summary percentages</Text>
            </div>
          </div>
        }
      >
        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab}
          style={{ marginBottom: 20 }}
        >
          <TabPane 
            tab={
              <span>
                <CalendarOutlined /> Daily Attendance Records
              </span>
            } 
            key="daily"
          >
            <Card size="small" style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: 12 }}>
              <Row gutter={[16, 16]} align="middle">
                <Col xs={24} sm={10}>
                  <Text strong style={{ color: '#0b1b3d', display: 'block', marginBottom: 6 }}>Select Class Section:</Text>
                  <Select
                    placeholder="Choose Section"
                    value={selectedSection}
                    onChange={setSelectedSection}
                    style={{ width: '100%', borderRadius: 8 }}
                  >
                    {sections.map(sec => (
                      <Option key={sec.id} value={sec.id}>Section {sec.name}</Option>
                    ))}
                  </Select>
                </Col>

                <Col xs={24} sm={8}>
                  <Text strong style={{ color: '#0b1b3d', display: 'block', marginBottom: 6 }}>Select Date:</Text>
                  <DatePicker 
                    style={{ width: '100%', borderRadius: 8 }}
                    value={selectedDate}
                    onChange={(date) => setSelectedDate(date || dayjs())}
                    format="YYYY-MM-DD"
                  />
                </Col>

                <Col xs={24} sm={6}>
                  <div style={{ marginTop: 22 }}>
                    <Button 
                      type="primary"
                      icon={<CalendarOutlined />}
                      onClick={fetchAttendanceByDate}
                      loading={loading}
                      block
                      className="apex-btn-gold"
                    >
                      Fetch Attendance
                    </Button>
                  </div>
                </Col>
              </Row>
            </Card>
          </TabPane>

          <TabPane 
            tab={
              <span>
                <FileTextOutlined /> Attendance Summary & Percentage
              </span>
            } 
            key="summary"
          >
            <Card size="small" style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: 12 }}>
              <Row gutter={[16, 16]} align="middle">
                <Col xs={24} sm={16}>
                  <Text strong style={{ color: '#0b1b3d', display: 'block', marginBottom: 6 }}>Select Class Section:</Text>
                  <Select
                    placeholder="Choose Section"
                    value={selectedSection}
                    onChange={setSelectedSection}
                    style={{ width: '100%', borderRadius: 8 }}
                  >
                    {sections.map(sec => (
                      <Option key={sec.id} value={sec.id}>Section {sec.name}</Option>
                    ))}
                  </Select>
                </Col>

                <Col xs={24} sm={8}>
                  <div style={{ marginTop: 22 }}>
                    <Button 
                      type="primary"
                      icon={<FileTextOutlined />}
                      onClick={fetchAttendanceSummary}
                      loading={loading}
                      block
                      className="apex-btn-gold"
                    >
                      View Section Summary
                    </Button>
                  </div>
                </Col>
              </Row>
            </Card>
          </TabPane>
        </Tabs>
      </Card>

      {/* Daily Attendance Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <CalendarOutlined style={{ color: '#d4af37' }} />
            <span>Daily Attendance: Section {currentSectionName} ({selectedDate?.format('YYYY-MM-DD')})</span>
          </div>
        }
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsModalVisible(false)} style={{ borderRadius: 8 }}>
            Close
          </Button>
        ]}
        width={800}
        centered
      >
        <Table 
          columns={attendanceColumns}
          dataSource={attendanceData}
          rowKey="id"
          loading={loading}
          pagination={false}
          scroll={{ x: 'max-content' }}
        />
      </Modal>

      {/* Attendance Summary Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <FileTextOutlined style={{ color: '#d4af37' }} />
            <span>Attendance Summary: Section {currentSectionName}</span>
          </div>
        }
        open={isSummaryModalVisible}
        onCancel={() => setIsSummaryModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsSummaryModalVisible(false)} style={{ borderRadius: 8 }}>
            Close
          </Button>
        ]}
        width={850}
        centered
      >
        <Table 
          columns={summaryColumns}
          dataSource={summaryData}
          rowKey="id"
          loading={loading}
          pagination={false}
          scroll={{ x: 'max-content' }}
        />
      </Modal>
    </div>
  );
};

export default AdminAttendanceView;