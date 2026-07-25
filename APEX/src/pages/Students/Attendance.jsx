import { useState, useEffect } from "react";
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
  Layout,
  Grid,
  Drawer,
  Typography,
  Progress
} from "antd";
import {
  MenuOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  UserOutlined,
  FileTextOutlined,
  ExclamationCircleOutlined,
  PieChartOutlined
} from '@ant-design/icons';
import Sidebar from "./Sidebar";
import dayjs from "dayjs";
import styled from "styled-components";

const { RangePicker } = DatePicker;
const { Option } = Select;
const { TabPane } = Tabs;
const { Content } = Layout;
const { useBreakpoint } = Grid;
const { Title, Text } = Typography;

// Styled components for responsive design
const MainContent = styled(Content)`
  margin-left: ${({ sidebarOpen, isMobile }) => 
    isMobile ? '0' : (sidebarOpen ? '250px' : '80px')};
  transition: margin-left 0.3s ease;
  min-height: 100vh;
  padding: ${({ isMobile }) => isMobile ? '16px' : '24px'};
`;

const StyledCard = styled(Card)`
  margin-bottom: ${({ isMobile }) => isMobile ? '16px' : '24px'};
`;

const StatsContainer = styled(Row)`
  margin-bottom: 24px;
  gap: 16px;
  flex-direction: ${({ isMobile }) => isMobile ? 'column' : 'row'};
  
  .ant-col {
    width: ${({ isMobile }) => isMobile ? '100%' : 'auto'};
    padding: ${({ isMobile }) => isMobile ? '0 0 16px 0' : '0 8px'};
  }
`;

const MobileHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding: 0 8px;
  background: #fff;
  position: sticky;
  top: 0;
  z-index: 1;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const ResponsiveTitle = styled(Title)`
  font-size: ${({ isMobile }) => isMobile ? '20px' : '24px'} !important;
  margin-bottom: ${({ isMobile }) => isMobile ? '12px' : '16px'} !important;
  margin-left: ${({ isMobile }) => isMobile ? '16px' : '0'} !important;
`;

const HamburgerButton = styled(Button)`
  border: none;
  box-shadow: none;
  background: transparent !important;
`;

const FilterContainer = styled(Space)`
  margin-bottom: 16px;
  flex-direction: ${({ isMobile }) => isMobile ? 'column' : 'row'};
  align-items: ${({ isMobile }) => isMobile ? 'flex-start' : 'center'};
  width: 100%;
  
  .ant-picker, .ant-select {
    width: ${({ isMobile }) => isMobile ? '100%' : 'auto'};
  }
`;

const StatusTag = styled(Tag)`
  margin: 4px;
  padding: 4px 8px;
  border-radius: 12px;
  font-weight: 500;
`;

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
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarVisible, setMobileSidebarVisible] = useState(false);
  const [books, setBooks] = useState([]);
  const [booksLoading, setBooksLoading] = useState(false);
  
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  // Get student ID from local storage
  const studentId = localStorage.getItem("student_id");

  // Fetch attendance data
  useEffect(() => {
    const fetchAttendanceData = async () => {
      try {
        setLoading(true);
        
        // Fetch attendance data from the new API
        const response = await fetch(
          `https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/getdstd_attendancesummery.php?student_id=${studentId}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch attendance data");
        }

        const data = await response.json();
        console.log("API Response:", data);

        if (data.success) {
          setAttendanceData({
            attendance_records: data.data.attendance_records || [],
            subject_summary: data.data.subject_summary || [],
            overall_summary: data.data.overall_summary || {},
            streaks: data.data.streaks || {}
          });
          
          // Format daily attendance data for the table
          const formattedDailyData = data.data.day_summary
            ? data.data.day_summary.map((item) => ({
                ...item,
                date: dayjs(item.date).format("YYYY-MM-DD"),
                dateObj: new Date(item.date),
                weekday: dayjs(item.date).format("dddd"),
              }))
            : [];
          
          setFilteredAttendance(formattedDailyData);
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

    if (studentId) {
      fetchAttendanceData();
    } else {
      setError("Student ID not found in local storage");
      setLoading(false);
    }
  }, [studentId]);

  // Fetch books data
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setBooksLoading(true);
        const response = await fetch("https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/Book_read.php");
        
        if (!response.ok) {
          throw new Error("Failed to fetch books data");
        }

        const data = await response.json();
        
        if (data.success) {
          setBooks(data.data);
        } else {
          throw new Error(data.error || "No books found");
        }
      } catch (err) {
        console.error("Books fetch error:", err);
      } finally {
        setBooksLoading(false);
      }
    };

    fetchBooks();
  }, []);

  const handleFilter = () => {
    let filteredData = [...attendanceData.attendance_records];

    // Date range filter
    if (dateRange && dateRange.length === 2) {
      const startDate = dayjs(dateRange[0]).startOf('day');
      const endDate = dayjs(dateRange[1]).endOf('day');
      
      filteredData = filteredData.filter((record) => {
        const recordDate = dayjs(record.date);
        return recordDate.isAfter(startDate) && recordDate.isBefore(endDate);
      });
    }

    // Subject filter
    if (subjectFilter) {
      filteredData = filteredData.filter((record) => 
        record.subject_name === subjectFilter
      );
    }

    setFilteredAttendance(filteredData);
  };

  const handleSidebarToggle = (isOpen) => {
    setSidebarOpen(isOpen);
  };

  const toggleMobileSidebar = () => {
    setMobileSidebarVisible(!mobileSidebarVisible);
  };

  const getAttendanceTag = (status) => {
    switch(status) {
      case 'Present':
        return <StatusTag color="green"><CheckCircleOutlined /> Present</StatusTag>;
      case 'Absent':
        return <StatusTag color="red"><CloseCircleOutlined /> Absent</StatusTag>;
      case 'Leave':
        return <StatusTag color="blue"><UserOutlined /> Leave</StatusTag>;
      case 'Late Comer':
        return <StatusTag color="orange"><ClockCircleOutlined /> Late</StatusTag>;
      case 'Half Leave':
        return <StatusTag color="cyan"><ExclamationCircleOutlined /> Half Leave</StatusTag>;
      default:
        return <StatusTag>{status}</StatusTag>;
    }
  };

  const detailedAttendanceColumns = [
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      render: (date) => (
        <div>
          <div><strong>{dayjs(date).format("YYYY-MM-DD")}</strong></div>
          <div style={{ fontSize: 12, color: '#888' }}>{dayjs(date).format("dddd")}</div>
        </div>
      ),
      sorter: (a, b) => new Date(a.date) - new Date(b.date),
    },
    {
      title: "Section",
      dataIndex: "section_name",
      key: "section_name",
      responsive: ['md']
    },
    {
      title: "Subject",
      dataIndex: "subject_name",
      key: "subject_name",
      sorter: (a, b) => a.subject_name.localeCompare(b.subject_name),
    },
    {
      title: "Status",
      dataIndex: "attendance",
      key: "attendance",
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
      title: "Created At",
      dataIndex: "created_at",
      key: "created_at",
      render: (date) => dayjs(date).format("YYYY-MM-DD HH:mm"),
      responsive: ['lg']
    },
  ];

  const subjectSummaryColumns = [
    {
      title: "Subject",
      dataIndex: "subject_name",
      key: "subject_name",
      sorter: (a, b) => a.subject_name.localeCompare(b.subject_name),
    },
    {
      title: "Total Classes",
      dataIndex: "total_classes",
      key: "total_classes",
      sorter: (a, b) => a.total_classes - b.total_classes,
    },
    {
      title: "Present",
      dataIndex: "present_count",
      key: "present_count",
      render: (count) => (
        <StatusTag color="green">
          <CheckCircleOutlined /> {count}
        </StatusTag>
      ),
      sorter: (a, b) => a.present_count - b.present_count,
    },
    {
      title: "Absent",
      dataIndex: "absent_count",
      key: "absent_count",
      render: (count) => (
        <StatusTag color="red">
          <CloseCircleOutlined /> {count}
        </StatusTag>
      ),
      sorter: (a, b) => a.absent_count - b.absent_count,
    },
    {
      title: "Leave",
      dataIndex: "leave_count",
      key: "leave_count",
      render: (count) => (
        <StatusTag color="blue">
          <UserOutlined /> {count}
        </StatusTag>
      ),
      sorter: (a, b) => a.leave_count - b.leave_count,
      responsive: ['md']
    },
    {
      title: "Late",
      dataIndex: "late_comer_count",
      key: "late_comer_count",
      render: (count) => (
        <StatusTag color="orange">
          <ClockCircleOutlined /> {count}
        </StatusTag>
      ),
      sorter: (a, b) => a.late_comer_count - b.late_comer_count,
      responsive: ['md']
    },
    {
      title: "Half Leave",
      dataIndex: "half_leave_count",
      key: "half_leave_count",
      render: (count) => (
        <StatusTag color="cyan">
          <ExclamationCircleOutlined /> {count}
        </StatusTag>
      ),
      sorter: (a, b) => a.half_leave_count - b.half_leave_count,
      responsive: ['md']
    },
    {
      title: "Attendance %",
      dataIndex: "attendance_percentage",
      key: "attendance_percentage",
      render: (percentage) => (
        <Progress
          type="circle"
          percent={percentage}
          size={50}
          strokeColor={
            percentage >= 75 ? '#52c41a' :
            percentage >= 50 ? '#faad14' : '#f5222d'
          }
          format={percent => `${percent}%`}
        />
      ),
      sorter: (a, b) => a.attendance_percentage - b.attendance_percentage,
    },
  ];

  const booksColumns = [
    {
      title: "Book ID",
      dataIndex: "id",
      key: "id",
      responsive: ['md']
    },
    {
      title: "Book Name",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Button 
          type="primary" 
          icon={<FileTextOutlined />}
          onClick={() => console.log("Reading book:", record.name)}
        >
          Read
        </Button>
      ),
    },
  ];

  if (loading && attendanceData.attendance_records.length === 0) {
    return (
      <Layout style={{ minHeight: '100vh' }}>
        {/* Desktop Sidebar */}
        {!isMobile && (
          <Sidebar 
            onToggle={handleSidebarToggle} 
            collapsed={!sidebarOpen}
          />
        )}
        
        {/* Mobile Sidebar Drawer */}
        {isMobile && (
          <Drawer
            title="Menu"
            placement="left"
            closable={true}
            onClose={() => setMobileSidebarVisible(false)}
            open={mobileSidebarVisible}
            width={250}
            bodyStyle={{ padding: 0 }}
          >
            <Sidebar 
              onToggle={handleSidebarToggle} 
              mobileMode={true}
              onMobileClose={() => setMobileSidebarVisible(false)}
            />
          </Drawer>
        )}

        <Layout>
          <MainContent sidebarOpen={sidebarOpen} isMobile={isMobile}>
            {isMobile && (
              <MobileHeader>
                <HamburgerButton
                  icon={<MenuOutlined />}
                  onClick={toggleMobileSidebar}
                />
                <ResponsiveTitle level={4} isMobile={isMobile}>
                  Student Attendance
                </ResponsiveTitle>
                <div style={{ width: 32 }} />
              </MobileHeader>
            )}
            
            {!isMobile && (
              <ResponsiveTitle level={4} isMobile={isMobile}>
                Student Attendance
              </ResponsiveTitle>
            )}
            
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
              <Spin size="large" />
            </div>
          </MainContent>
        </Layout>
      </Layout>
    );
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* Desktop Sidebar */}
      {!isMobile && (
        <Sidebar 
          onToggle={handleSidebarToggle} 
          collapsed={!sidebarOpen}
        />
      )}
      
      {/* Mobile Sidebar Drawer */}
      {isMobile && (
        <Drawer
          title="Menu"
          placement="left"
          closable={true}
          onClose={() => setMobileSidebarVisible(false)}
          open={mobileSidebarVisible}
          width={250}
          bodyStyle={{ padding: 0 }}
        >
          <Sidebar 
            onToggle={handleSidebarToggle} 
            mobileMode={true}
            onMobileClose={() => setMobileSidebarVisible(false)}
          />
        </Drawer>
      )}

      <Layout>
        <MainContent sidebarOpen={sidebarOpen} isMobile={isMobile}>
          {isMobile && (
            <MobileHeader>
              <HamburgerButton
                icon={<MenuOutlined />}
                onClick={toggleMobileSidebar}
              />
              <ResponsiveTitle level={4} isMobile={isMobile}>
                Student Attendance
              </ResponsiveTitle>
              <div style={{ width: 32 }} />
            </MobileHeader>
          )}
          
          {!isMobile && (
            <ResponsiveTitle level={4} isMobile={isMobile}>
              Student Attendance
            </ResponsiveTitle>
          )}

          {/* Overall Statistics Cards */}
          {attendanceData.overall_summary ? (
            <>
              <StatsContainer isMobile={isMobile}>
                <Col span={isMobile ? 24 : 6}>
                  <StyledCard isMobile={isMobile}>
                    <Statistic
                      title="Total Classes"
                      value={attendanceData.overall_summary.total_classes || 0}
                      prefix={<FileTextOutlined />}
                    />
                  </StyledCard>
                </Col>
                <Col span={isMobile ? 24 : 6}>
                  <StyledCard isMobile={isMobile}>
                    <Statistic
                      title="Present"
                      value={attendanceData.overall_summary.total_present || 0}
                      valueStyle={{ color: 'green' }}
                      prefix={<CheckCircleOutlined />}
                    />
                  </StyledCard>
                </Col>
                <Col span={isMobile ? 24 : 6}>
                  <StyledCard isMobile={isMobile}>
                    <Statistic
                      title="Absent"
                      value={attendanceData.overall_summary.total_absent || 0}
                      valueStyle={{ color: 'red' }}
                      prefix={<CloseCircleOutlined />}
                    />
                  </StyledCard>
                </Col>
                <Col span={isMobile ? 24 : 6}>
                  <StyledCard isMobile={isMobile}>
                    <Statistic
                      title="Overall Attendance %"
                      value={attendanceData.overall_summary.overall_attendance_percentage || 0}
                      suffix="%"
                      valueStyle={{
                        color: (attendanceData.overall_summary.overall_attendance_percentage || 0) >= 75 
                          ? 'green' 
                          : (attendanceData.overall_summary.overall_attendance_percentage || 0) >= 50 
                            ? 'orange' 
                            : 'red'
                      }}
                      prefix={<PieChartOutlined />}
                    />
                  </StyledCard>
                </Col>
              </StatsContainer>

              {/* Detailed Statistics Row */}
              <StatsContainer isMobile={isMobile}>
                <Col span={isMobile ? 24 : 6}>
                  <StyledCard isMobile={isMobile}>
                    <Statistic
                      title="Leave Count"
                      value={attendanceData.overall_summary.total_leave || 0}
                      valueStyle={{ color: 'blue' }}
                      prefix={<UserOutlined />}
                    />
                  </StyledCard>
                </Col>
                <Col span={isMobile ? 24 : 6}>
                  <StyledCard isMobile={isMobile}>
                    <Statistic
                      title="Late Count"
                      value={attendanceData.overall_summary.total_late_comer || 0}
                      valueStyle={{ color: 'orange' }}
                      prefix={<ClockCircleOutlined />}
                    />
                  </StyledCard>
                </Col>
                <Col span={isMobile ? 24 : 6}>
                  <StyledCard isMobile={isMobile}>
                    <Statistic
                      title="Half Leave Count"
                      value={attendanceData.overall_summary.total_half_leave || 0}
                      valueStyle={{ color: 'cyan' }}
                      prefix={<ExclamationCircleOutlined />}
                    />
                  </StyledCard>
                </Col>
                <Col span={isMobile ? 24 : 6}>
                  <StyledCard isMobile={isMobile}>
                    <Statistic
                      title="Current Streak"
                      value={attendanceData.streaks.current_streak || 0}
                      suffix="days"
                      valueStyle={{ color: 'purple' }}
                      prefix={<CheckCircleOutlined />}
                    />
                  </StyledCard>
                </Col>
              </StatsContainer>
            </>
          ) : error ? (
            <Alert message={error} type="error" showIcon />
          ) : null}

          <Tabs 
            activeKey={activeTab} 
            onChange={setActiveTab}
            tabPosition={isMobile ? "top" : "top"}
            size={isMobile ? "small" : "middle"}
          >
            <TabPane tab="Detailed Records" key="1">
              <FilterContainer isMobile={isMobile}>
                <RangePicker
                  onChange={(dates) => setDateRange(dates)}
                  placeholder={['Start Date', 'End Date']}
                  style={{ width: isMobile ? '100%' : 250 }}
                />
                
                <Select
                  placeholder="Filter by Subject"
                  value={subjectFilter}
                  onChange={setSubjectFilter}
                  style={{ width: isMobile ? '100%' : 200 }}
                  allowClear
                >
                  {attendanceData.subject_summary.map((subject) => (
                    <Option key={subject.subject_name} value={subject.subject_name}>
                      {subject.subject_name}
                    </Option>
                  ))}
                </Select>
                
                <Button type="primary" onClick={handleFilter}>
                  Apply Filters
                </Button>
                
                <Button onClick={() => {
                  setDateRange(null);
                  setSubjectFilter(null);
                  setFilteredAttendance(attendanceData.attendance_records);
                }}>
                  Reset Filters
                </Button>
              </FilterContainer>
              {loading ? (
                <Spin tip="Loading attendance records..." size="large" />
              ) : error ? (
                <Alert message={error} type="error" showIcon />
              ) : filteredAttendance.length === 0 ? (
                <Alert message="No records found matching your filters" type="info" showIcon />
              ) : (
                <Table
                  columns={detailedAttendanceColumns}
                  dataSource={filteredAttendance}
                  rowKey="id"
                  pagination={{ 
                    pageSize: 10,
                    showSizeChanger: true,
                    pageSizeOptions: ['10', '20', '50', '100']
                  }}
                  scroll={{ x: true }}
                  size={isMobile ? "small" : "middle"}
                />
              )}
            </TabPane>

            <TabPane tab="Subject Summary" key="2">
              {loading ? (
                <Spin tip="Loading subject summary..." size="large" />
              ) : error ? (
                <Alert message={error} type="error" showIcon />
              ) : attendanceData.subject_summary.length === 0 ? (
                <Alert message="No subject summary available" type="info" showIcon />
              ) : (
                <Table
                  columns={subjectSummaryColumns}
                  dataSource={attendanceData.subject_summary}
                  rowKey="subject_name"
                  pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    pageSizeOptions: ['10', '20', '50', '100']
                  }}
                  scroll={{ x: true }}
                  size={isMobile ? "small" : "middle"}
                />
              )}
            </TabPane>

            <TabPane tab="Reading Materials" key="3">
              {booksLoading ? (
                <Spin tip="Loading books..." size="large" />
              ) : books.length === 0 ? (
                <Alert message="No books available" type="info" showIcon />
              ) : (
                <Table
                  columns={booksColumns}
                  dataSource={books}
                  rowKey="id"
                  pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    pageSizeOptions: ['10', '20', '50', '100']
                  }}
                  scroll={{ x: true }}
                  size={isMobile ? "small" : "middle"}
                />
              )}
            </TabPane>
          </Tabs>
        </MainContent>
      </Layout>
    </Layout>
  );
};

export default AttendanceSection;