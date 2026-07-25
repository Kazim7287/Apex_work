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
  Divider,
  Typography,
  Space,
  Tag,
  Progress,
  Select,
  Tabs,
  Spin,
  Grid,
  Drawer,
  Avatar,
  Badge,
  Layout,
  Alert,
  Tooltip
} from 'antd';
import { 
  CalendarOutlined, 
  FileTextOutlined, 
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  MenuOutlined,
  TeamOutlined,
  BookOutlined,
  UserOutlined,
  InfoCircleOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;
const { useBreakpoint } = Grid;
const { Content } = Layout;

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
  const [mobileDrawerVisible, setMobileDrawerVisible] = useState(false);
  
  const screens = useBreakpoint();
  const isMobile = !screens.md;
  const isSmallMobile = !screens.sm;
  const isTablet = screens.md && !screens.lg;

  // Fetch all sections
  useEffect(() => {
    fetchAllSections();
  }, []);

  const fetchWithSession = async (url, options = {}) => {
    try {
      const response = await fetch(url, {
        ...options,
        credentials: 'include',
        headers: {
          ...options.headers,
          'Content-Type': 'application/json',
        }
      });

      if (response.status === 401) {
        navigate('/admin-signin');
        return null;
      }

      const data = await response.json();
      
      if (data && data.error) {
        message.error(data.error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Fetch error:', error);
      message.error('Error fetching data');
      return null;
    }
  };

  const fetchAllSections = async () => {
    setLoading(true);
    try {
      const data = await fetchWithSession('https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/Sec_read.php');
      if (data && Array.isArray(data)) {
        setSections(data);
      } else if (!data) {
        // Error already handled
      } else {
        message.error('No sections found');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendanceByDate = async () => {
    if (!selectedDate || !selectedSection) {
      message.error('Please select date and section');
      return;
    }
  
    setLoading(true);
    try {
      // Format date to YYYY-MM-DD
      const formattedDate = selectedDate.format('YYYY-MM-DD');
    
      // Build URL with only required parameters
      const url = `https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/GetadAttendance.php?section_id=${selectedSection}&date=${formattedDate}`;
      
      const data = await fetchWithSession(url);
      
      if (data && (data.status === 'success' || data.status === 'empty')) {
        setAttendanceData(data.data || []);
        setCurrentSectionName(sections.find(s => s.id === selectedSection)?.name || '');
        setIsModalVisible(true);
        
        if (data.status === 'empty') {
          message.warning('No attendance records found');
        }
      } else {
        message.warning(data?.message || 'No attendance records found');
        setAttendanceData([]);
      }
    } catch (error) {
      console.error('Error fetching attendance:', error);
      message.error('Failed to fetch attendance data');
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendanceSummary = async () => {
    if (!selectedSection) {
      message.error('Please select a section');
      return;
    }
  
    setLoading(true);
    try {
      const url = `https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/GetadAttendancesummery.php?section_id=${selectedSection}`;
      
      const data = await fetchWithSession(url);
      
      if (data && data.status === 'success') {
        // Process the data from the new API format with updated attendance types
        const students = data.students || [];
        
        const transformedData = students.map(student => {
          // Calculate totals from all records with new attendance types
          const present = student.records?.filter(
            r => r.attendance === 'Present'
          ).length || 0;
          
          const absent = student.records?.filter(
            r => r.attendance === 'Absent'
          ).length || 0;
          
          const leave = student.records?.filter(
            r => r.attendance === 'Leave'
          ).length || 0;
          
          const lateComer = student.records?.filter(
            r => r.attendance === 'Late Comer'
          ).length || 0;
          
          const halfLeave = student.records?.filter(
            r => r.attendance === 'Half Leave'
          ).length || 0;
          
          const total = student.records?.length || 0;
          
          // Calculate weighted attendance percentage
          const weightedPresent = present + (lateComer * 0.75) + (halfLeave * 0.5);
          const percentage = total > 0 ? Math.round((weightedPresent / total) * 100) : 0;
          
          return {
            student_id: student.student_id,
            student_name: student.student_name,
            present,
            absent,
            leave,
            late_comer: lateComer,
            half_leave: halfLeave,
            total,
            percentage
          };
        });
        
        setSummaryData(transformedData);
        setCurrentSectionName(sections.find(s => s.id === selectedSection)?.name || '');
        setIsSummaryModalVisible(true);
      } else if (data && data.message) {
        message.info(data.message);
        setSummaryData([]);
      } else {
        message.error('Error fetching attendance summary');
        setSummaryData([]);
      }
    } catch (error) {
      console.error('Error:', error);
      message.error('Failed to fetch attendance summary');
      setSummaryData([]);
    } finally {
      setLoading(false);
    }
  };

  const getAttendanceTag = (status) => {
    switch(status) {
      case 'Present':
        return <Tag icon={<CheckCircleOutlined />} color="success" style={{ fontSize: isSmallMobile ? '10px' : '12px' }}>Present</Tag>;
      case 'Leave':
        return <Tag icon={<ExclamationCircleOutlined />} color="blue" style={{ fontSize: isSmallMobile ? '10px' : '12px' }}>Leave</Tag>;
      case 'Late Comer':
        return <Tag icon={<ClockCircleOutlined />} color="orange" style={{ fontSize: isSmallMobile ? '10px' : '12px' }}>Late</Tag>;
      case 'Half Leave':
        return <Tag icon={<ExclamationCircleOutlined />} color="cyan" style={{ fontSize: isSmallMobile ? '10px' : '12px' }}>Half Leave</Tag>;
      case 'Absent':
      default:
        return <Tag icon={<CloseCircleOutlined />} color="error" style={{ fontSize: isSmallMobile ? '10px' : '12px' }}>Absent</Tag>;
    }
  };

  const attendanceColumns = [
    { 
      title: 'Student', 
      dataIndex: 'student_name', 
      key: 'student_name',
      fixed: isMobile ? 'left' : false,
      width: isMobile ? 120 : undefined,
      render: (text) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Avatar 
            size={isSmallMobile ? "small" : "default"}
            icon={<UserOutlined />}
            style={{ 
              backgroundColor: '#1890ff',
              marginRight: 8,
              flexShrink: 0
            }}
          />
          <Text strong style={{ fontSize: isSmallMobile ? '12px' : '14px' }}>
            {text}
          </Text>
        </div>
      )
    },
    { 
      title: 'Status', 
      dataIndex: 'attendance', 
      key: 'attendance',
      render: (status) => getAttendanceTag(status)
    },
    { 
      title: 'Subject', 
      dataIndex: 'subject_name', 
      key: 'subject_name',
      responsive: ['md'],
      render: (text) => (
        <Tag color="blue" style={{ fontSize: isSmallMobile ? '10px' : '12px' }}>
          {text}
        </Tag>
      )
    },
    { 
      title: 'Date', 
      dataIndex: 'date', 
      key: 'date',
      responsive: ['md'],
      render: (date) => (
        <Text style={{ fontSize: isSmallMobile ? '10px' : '12px' }}>
          {date}
        </Text>
      )
    },
  ];

  // Enhanced summary columns for better mobile display
  const summaryColumns = [
    { 
      title: 'Student', 
      dataIndex: 'student_name', 
      key: 'student_name',
      fixed: isMobile ? 'left' : false,
      width: isMobile ? 120 : undefined,
      render: (text) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Avatar 
            size={isSmallMobile ? "small" : "default"}
            icon={<UserOutlined />}
            style={{ 
              backgroundColor: '#1890ff',
              marginRight: 8,
              flexShrink: 0
            }}
          />
          <Text strong style={{ fontSize: isSmallMobile ? '12px' : '14px' }}>
            {text}
          </Text>
        </div>
      )
    },
    { 
      title: 'Present', 
      dataIndex: 'present', 
      key: 'present',
      render: (count) => (
        <Tooltip title="Present days">
          <Tag color="green" style={{ fontSize: isSmallMobile ? '10px' : '12px' }}>
            {count}
          </Tag>
        </Tooltip>
      )
    },
    { 
      title: 'Absent', 
      dataIndex: 'absent', 
      key: 'absent',
      render: (count) => (
        <Tooltip title="Absent days">
          <Tag color="red" style={{ fontSize: isSmallMobile ? '10px' : '12px' }}>
            {count}
          </Tag>
        </Tooltip>
      )
    },
    { 
      title: 'Leave', 
      dataIndex: 'leave', 
      key: 'leave',
      render: (count) => (
        <Tooltip title="Leave days">
          <Tag color="blue" style={{ fontSize: isSmallMobile ? '10px' : '12px' }}>
            {count}
          </Tag>
        </Tooltip>
      ),
      responsive: ['sm']
    },
    { 
      title: 'Late', 
      dataIndex: 'late_comer', 
      key: 'late_comer',
      render: (count) => (
        <Tooltip title="Late comer days">
          <Tag color="orange" style={{ fontSize: isSmallMobile ? '10px' : '12px' }}>
            {count}
          </Tag>
        </Tooltip>
      ),
      responsive: ['sm']
    },
    { 
      title: 'Half Leave', 
      dataIndex: 'half_leave', 
      key: 'half_leave',
      render: (count) => (
        <Tooltip title="Half leave days">
          <Tag color="cyan" style={{ fontSize: isSmallMobile ? '10px' : '12px' }}>
            {count}
          </Tag>
        </Tooltip>
      ),
      responsive: ['sm']
    },
    { 
      title: 'Total', 
      dataIndex: 'total', 
      key: 'total',
      render: (count) => (
        <Tooltip title="Total days">
          <Tag style={{ fontSize: isSmallMobile ? '10px' : '12px' }}>
            {count}
          </Tag>
        </Tooltip>
      ),
      responsive: ['sm']
    },
    { 
      title: 'Percentage', 
      dataIndex: 'percentage', 
      key: 'percentage',
      render: (percentage) => (
        <Tooltip title={`Attendance percentage: ${percentage}%`}>
          <div style={{ minWidth: 80 }}>
            <Progress 
              percent={percentage}
              status={percentage >= 75 ? 'success' : percentage >= 50 ? 'normal' : 'exception'}
              format={() => (
                <Text style={{ fontSize: isSmallMobile ? '10px' : '12px' }}>
                  {percentage}%
                </Text>
              )}
              size={isSmallMobile ? 'small' : 'default'}
              showInfo={true}
            />
          </div>
        </Tooltip>
      )
    },
  ];

  // Mobile-optimized summary columns
  const mobileSummaryColumns = [
    { 
      title: 'Student', 
      dataIndex: 'student_name', 
      key: 'student_name',
      fixed: 'left',
      width: 100,
      render: (text) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Avatar 
            size="small"
            icon={<UserOutlined />}
            style={{ 
              backgroundColor: '#1890ff',
              marginRight: 4,
              flexShrink: 0
            }}
          />
          <Text strong style={{ fontSize: '11px' }}>
            {text}
          </Text>
        </div>
      )
    },
    { 
      title: 'P', 
      dataIndex: 'present', 
      key: 'present',
      width: 50,
      render: (count) => (
        <Tooltip title="Present days">
          <Badge count={count} style={{ backgroundColor: '#52c41a' }} />
        </Tooltip>
      )
    },
    { 
      title: 'A', 
      dataIndex: 'absent', 
      key: 'absent',
      width: 50,
      render: (count) => (
        <Tooltip title="Absent days">
          <Badge count={count} style={{ backgroundColor: '#f5222d' }} />
        </Tooltip>
      )
    },
    { 
      title: 'L', 
      dataIndex: 'leave', 
      key: 'leave',
      width: 50,
      render: (count) => (
        <Tooltip title="Leave days">
          <Badge count={count} style={{ backgroundColor: '#1890ff' }} />
        </Tooltip>
      )
    },
    { 
      title: 'LC', 
      dataIndex: 'late_comer', 
      key: 'late_comer',
      width: 50,
      render: (count) => (
        <Tooltip title="Late comer days">
          <Badge count={count} style={{ backgroundColor: '#fa8c16' }} />
        </Tooltip>
      )
    },
    { 
      title: 'HL', 
      dataIndex: 'half_leave', 
      key: 'half_leave',
      width: 50,
      render: (count) => (
        <Tooltip title="Half leave days">
          <Badge count={count} style={{ backgroundColor: '#13c2c2' }} />
        </Tooltip>
      )
    },
    { 
      title: '%', 
      dataIndex: 'percentage', 
      key: 'percentage',
      width: 80,
      render: (percentage) => (
        <Tooltip title={`Attendance: ${percentage}%`}>
          <div style={{ width: 60 }}>
            <Progress 
              percent={percentage}
              status={percentage >= 75 ? 'success' : percentage >= 50 ? 'normal' : 'exception'}
              size="small"
              showInfo={false}
            />
            <Text style={{ fontSize: '10px', display: 'block', textAlign: 'center' }}>
              {percentage}%
            </Text>
          </div>
        </Tooltip>
      )
    },
  ];

  const renderAttendanceTable = () => (
    <>
      <div style={{ marginBottom: 16 }}>
        <Text strong style={{ fontSize: isSmallMobile ? '12px' : '14px' }}>Section: </Text>
        <Text style={{ fontSize: isSmallMobile ? '12px' : '14px' }}>{currentSectionName}</Text>
        <Divider type="vertical" />
        <Text strong style={{ fontSize: isSmallMobile ? '12px' : '14px' }}>Date: </Text>
        <Text style={{ fontSize: isSmallMobile ? '12px' : '14px' }}>
          {selectedDate ? selectedDate.format('YYYY-MM-DD') : 'No date selected'}
        </Text>
      </div>
      <Table
        dataSource={attendanceData}
        columns={attendanceColumns}
        rowKey="id"
        loading={loading}
        pagination={{ 
          pageSize: 10,
          size: isSmallMobile ? 'small' : 'default',
          simple: isMobile
        }}
        scroll={{ x: isMobile ? 300 : true }}
        size={isSmallMobile ? 'small' : (isMobile ? 'middle' : 'default')}
        locale={{ emptyText: 'No attendance records found' }}
      />
    </>
  );

  const renderSummaryTable = () => (
    <>
      <div style={{ marginBottom: 16 }}>
        <Text strong style={{ fontSize: isSmallMobile ? '12px' : '14px' }}>Section: </Text>
        <Text style={{ fontSize: isSmallMobile ? '12px' : '14px' }}>{currentSectionName}</Text>
      </div>
      
      {isMobile ? (
        <Alert
          message="Mobile View"
          description="Swipe left/right to see all attendance details"
          type="info"
          showIcon
          style={{ marginBottom: 12 }}
        />
      ) : null}
      
      <Table
        dataSource={summaryData}
        columns={isMobile ? mobileSummaryColumns : summaryColumns}
        rowKey="student_id"
        loading={loading}
        scroll={{ x: isMobile ? 500 : true }}
        pagination={{ 
          pageSize: 10,
          size: isSmallMobile ? 'small' : 'default',
          simple: isMobile
        }}
        size={isSmallMobile ? 'small' : (isMobile ? 'middle' : 'default')}
        locale={{ emptyText: 'No attendance summary available' }}
      />
    </>
  );

  const FilterSection = ({ type }) => {
    const [dropdownOpen, setDropdownOpen] = useState({
      section: false,
      date: false
    });

    const handleDropdownChange = (key, value) => {
      setDropdownOpen(prev => ({ ...prev, [key]: value }));
    };

    return (
      <Card 
        title={
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {type === 'daily' ? (
              <CalendarOutlined style={{ marginRight: 8, color: '#1890ff' }} />
            ) : (
              <FileTextOutlined style={{ marginRight: 8, color: '#1890ff' }} />
            )}
            <Text strong style={{ fontSize: isSmallMobile ? '14px' : '16px' }}>
              {type === 'daily' ? 'Daily Attendance' : 'Attendance Summary'}
            </Text>
          </div>
        }
        style={{ marginBottom: 20 }}
        bodyStyle={{ padding: isSmallMobile ? '12px' : '16px' }}
      >
        <Row gutter={[16, 16]}>
          <Col xs={24}>
            <Space 
              direction={isMobile ? "vertical" : "horizontal"} 
              size="middle" 
              style={{ width: '100%' }}
              align={isMobile ? "start" : "end"}
            >
              {/* Section Dropdown */}
              <div style={{ width: isMobile ? '100%' : 250 }}>
                <Text strong style={{ display: 'block', marginBottom: 4, fontSize: isSmallMobile ? '12px' : '14px' }}>
                  Select Section:
                </Text>
                <Select
                  style={{ width: '100%' }}
                  placeholder="Select section"
                  value={selectedSection}
                  onChange={(value) => {
                    setSelectedSection(value);
                    handleDropdownChange('section', false);
                  }}
                  loading={loading}
                  size={isSmallMobile ? 'small' : 'middle'}
                  suffixIcon={<TeamOutlined />}
                  open={dropdownOpen.section}
                  onDropdownVisibleChange={(open) => handleDropdownChange('section', open)}
                  dropdownStyle={{ 
                    minWidth: isMobile ? '100%' : 250,
                    zIndex: 9999 
                  }}
                  getPopupContainer={trigger => trigger.parentNode}
                >
                  {sections.map(section => (
                    <Option key={section.id} value={section.id}>
                      {section.name}
                    </Option>
                  ))}
                </Select>
              </div>

              {/* Date Picker - Only for daily view */}
              {type === 'daily' && selectedSection && (
                <div style={{ width: isMobile ? '100%' : 250 }}>
                  <Text strong style={{ display: 'block', marginBottom: 4, fontSize: isSmallMobile ? '12px' : '14px' }}>
                    Select Date:
                  </Text>
                  <DatePicker 
                    style={{ width: '100%' }}
                    value={selectedDate}
                    onChange={(date) => {
                      setSelectedDate(date || dayjs());
                      handleDropdownChange('date', false);
                    }}
                    size={isSmallMobile ? 'small' : 'middle'}
                    open={dropdownOpen.date}
                    onOpenChange={(open) => handleDropdownChange('date', open)}
                    getPopupContainer={trigger => trigger.parentNode}
                    format="YYYY-MM-DD"
                  />
                </div>
              )}

              {/* Action Button */}
              <div style={{ width: isMobile ? '100%' : 'auto', marginTop: isMobile ? 8 : 0 }}>
                <Button 
                  type="primary" 
                  icon={type === 'daily' ? <CalendarOutlined /> : <FileTextOutlined />}
                  onClick={type === 'daily' ? fetchAttendanceByDate : fetchAttendanceSummary}
                  disabled={!selectedSection || (type === 'daily' && !selectedDate)}
                  loading={loading}
                  size={isSmallMobile ? 'small' : 'middle'}
                  block={isMobile}
                  style={{ minWidth: isMobile ? '100%' : 150 }}
                >
                  {type === 'daily' ? 'View Attendance' : 'View Summary'}
                </Button>
              </div>
            </Space>
          </Col>
        </Row>
      </Card>
    );
  };

  return (
    <Layout style={{ minHeight: '100vh', background: '#f5f7fa' }}>
      <Content style={{ 
        padding: isSmallMobile ? '8px' : (isMobile ? '12px' : '16px'),
      }}>
        <Card
          title={
            <div style={{ 
              display: 'flex', 
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '8px'
            }}>
              {isMobile && (
                <Button 
                  icon={<MenuOutlined />}
                  type="text"
                  onClick={() => setMobileDrawerVisible(true)}
                  style={{ marginRight: 8 }}
                  size="small"
                />
              )}
              <Title level={isSmallMobile ? 4 : 2} style={{ margin: 0 }}>
                <TeamOutlined style={{ marginRight: 12, color: '#1890ff' }} />
                Attendance Management
              </Title>
            </div>
          }
          bordered={false}
          style={{ 
            boxShadow: '0 2px 8px rgba(0,0,0,0.09)',
            borderRadius: '8px'
          }}
          bodyStyle={{ 
            padding: isSmallMobile ? '12px' : (isMobile ? '16px' : '20px')
          }}
        >
          {/* Mobile Drawer */}
          {isMobile && (
            <Drawer
              title="Navigation"
              placement="left"
              onClose={() => setMobileDrawerVisible(false)}
              open={mobileDrawerVisible}
              width={280}
              bodyStyle={{ padding: 0 }}
            >
              {/* Add your sidebar component here if needed */}
            </Drawer>
          )}

          <Tabs 
            activeKey={activeTab} 
            onChange={setActiveTab}
            type={isMobile ? "card" : "line"}
            size={isSmallMobile ? "small" : "middle"}
          >
            <TabPane 
              tab={
                <span>
                  <CalendarOutlined />
                  {isMobile ? 'Daily' : 'Daily Attendance'}
                </span>
              } 
              key="daily"
            >
              <FilterSection type="daily" />
            </TabPane>

            <TabPane 
              tab={
                <span>
                  <FileTextOutlined />
                  {isMobile ? 'Summary' : 'Attendance Summary'}
                </span>
              } 
              key="summary"
            >
              <FilterSection type="summary" />
            </TabPane>
          </Tabs>

          {/* Modal for Daily Attendance */}
          <Modal 
            title={
              <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
                <CalendarOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                <span style={{ fontSize: isSmallMobile ? '14px' : '16px' }}>
                  Daily Attendance - {currentSectionName}
                </span>
              </div>
            }
            open={isModalVisible} 
            onCancel={() => setIsModalVisible(false)} 
            footer={null}
            width={isMobile ? '95' : isTablet ? '90%' : 800}
            bodyStyle={{ 
              padding: isSmallMobile ? '8px' : '12px',
              maxHeight: '60vh',
              overflowY: 'auto'
            }}
            centered
            destroyOnClose
          >
            {loading ? <Spin size="large" /> : renderAttendanceTable()}
          </Modal>

          {/* Modal for Attendance Summary */}
          <Modal 
            title={
              <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
                <FileTextOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                <span style={{ fontSize: isSmallMobile ? '14px' : '16px' }}>
                  Attendance Summary - {currentSectionName}
                </span>
              </div>
            }
            open={isSummaryModalVisible} 
            onCancel={() => setIsSummaryModalVisible(false)} 
            footer={null}
            width={isMobile ? '95%' : isTablet ? '95%' : 1000}
            bodyStyle={{ 
              padding: isSmallMobile ? '8px' : '12px',
              maxHeight: '60vh',
              overflowY: 'auto'
            }}
            centered
            destroyOnClose
          >
            {loading ? <Spin size="large" /> : renderSummaryTable()}
          </Modal>
        </Card>
      </Content>
    </Layout>
  );
};

export default AdminAttendanceView;