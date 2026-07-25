import { useState, useEffect } from 'react';
import {
  Table,
  Button,
  message,
  Spin,
  Modal,
  Form,
  Input,
  Select,
  Tag,
  Descriptions,
  Badge,
  Layout,
  Card,
  Typography,
  Avatar,
  Image,
  Grid,
  Space,
  Dropdown,
  Menu,
  Drawer
} from 'antd';
import {
  CheckOutlined,
  CloseOutlined,
  EyeOutlined,
  LoadingOutlined,
  ClockCircleOutlined,
  UserOutlined,
  MoreOutlined,
  FilterOutlined,
  MenuOutlined
} from '@ant-design/icons';
import Sidebar from './Sidebar';

const { Content: AntContent } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;
const { useBreakpoint } = Grid;

const StudentApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [currentApplication, setCurrentApplication] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedSection, setSelectedSection] = useState('all');
  const [sections, setSections] = useState([]);
  const [actionLoading, setActionLoading] = useState(false);
  const [responseText, setResponseText] = useState('');
  const [teacherId, setTeacherId] = useState(null);
  const [studentPicture, setStudentPicture] = useState(null);
  const [pictureLoading, setPictureLoading] = useState(false);
  const [mobileFilterVisible, setMobileFilterVisible] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarVisible, setMobileSidebarVisible] = useState(false);
  
  const screens = useBreakpoint();

  useEffect(() => {
    // Get teacher_id from session (assuming it's stored in localStorage after login)
    const storedTeacherId = localStorage.getItem('teacher_id');
    if (storedTeacherId) {
      setTeacherId(parseInt(storedTeacherId));
    } else {
      message.error('Teacher ID not found. Please login again.');
      // Redirect to login if needed
    }
  }, []);

  useEffect(() => {
    if (teacherId) {
      fetchData();
    }
  }, [teacherId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/read_leave_application.php`,
        {
          credentials: 'include' // Required for session cookies
        }
      );
  
      if (response.status === 401) {
        // Handle session expiration
        message.error('Session expired. Please login again.');
        // Redirect to login page
        window.location.href = '/login';
        return;
      }
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch applications');
      }
  
      if (Array.isArray(data)) {
        // Process data as before
        const uniqueSections = [];
        const sectionMap = new Map();
  
        data.forEach(app => {
          if (!sectionMap.has(app.section_id)) {
            sectionMap.set(app.section_id, true);
            uniqueSections.push({ id: app.section_id, name: app.section_name });
          }
        });
  
        setSections(uniqueSections);
        setApplications(data);
      } else if (data.message) {
        message.info(data.message);
        setApplications([]);
        setSections([]);
      }
    } catch (error) {
      console.error('Fetch error:', error);
      message.error(error.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };
  const fetchStudentPicture = async (studentId) => {
    if (!studentId) return;
    
    setPictureLoading(true);
    try {
      const response = await fetch(
        `https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/fetchpicture.php?student_id=${studentId}`,
        {
          credentials: 'include' // Important for session cookies
        }
      );

      // Handle unauthorized (401) responses
      if (response.status === 401) {
        throw new Error('Session expired. Please login again.');
      }

      const data = await response.json();

      if (data.success) {
        setStudentPicture(data.full_url);
      } else {
        setStudentPicture(null);
        if (data.error) {
          console.error('Picture fetch error:', data.error);
        }
      }
    } catch (error) {
      console.error('Error fetching student picture:', error);
      setStudentPicture(null);
    } finally {
      setPictureLoading(false);
    }
  };

  const handleStatusChange = async (status) => {
    if (!currentApplication || !teacherId) return;
    
    setActionLoading(true);
    try {
      const payload = {
        id: currentApplication.id,
        status: status,
        teacher_id: teacherId,
        response_discription: responseText.trim() || null
      };

      const res = await fetch('https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/teach_update_application.php', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload),
        credentials: 'include' // Important for session cookies
      });

      // Handle unauthorized (401) responses
      if (res.status === 401) {
        throw new Error('Session expired. Please login again.');
      }

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || 'Failed to update application');
      }

      message.success(result.message || 'Status updated successfully');
      setApplications(prev =>
        prev.map(app =>
          app.id === currentApplication.id 
            ? { 
                ...app, 
                status: status, 
                response_discription: responseText.trim() || app.response_discription 
              } 
            : app
        )
      );
      setViewModalVisible(false);
    } catch (error) {
      console.error('Status change error:', error);
      message.error(error.message || 'Failed to update application status');
      
      // Redirect to login if session expired
      if (error.message.includes('Session expired')) {
        // Implement your redirect logic here
      }
    } finally {
      setActionLoading(false);
    }
  };

  const showApplicationDetails = (record) => {
    setCurrentApplication(record);
    setResponseText(record.response_discription || '');
    setViewModalVisible(true);
    fetchStudentPicture(record.student_id);
  };

  const filteredApplications = applications.filter(app => {
    const statusMatch = filterStatus === 'all' || app.status === filterStatus;
    const sectionMatch = selectedSection === 'all' || app.section_id == selectedSection;
    return statusMatch && sectionMatch;
  });

  const getColumns = () => {
    const baseColumns = [
      {
        title: 'Student',
        dataIndex: 'student_name',
        key: 'student_name',
        responsive: ['sm'],
        render: (text) => (
          <Text style={{ fontSize: '12px' }} ellipsis>
            {text}
          </Text>
        ),
        width: 120
      },
      {
        title: 'Title',
        dataIndex: 'title',
        key: 'title',
        render: (text) => (
          <Text style={{ fontSize: '12px' }} ellipsis>
            {text}
          </Text>
        ),
        width: 150
      },
      {
        title: 'Status',
        dataIndex: 'status',
        key: 'status',
        render: status => {
          let color = '';
          switch (status.toLowerCase()) {
            case 'pending': color = 'orange'; break;
            case 'approved': color = 'green'; break;
            case 'rejected': color = 'red'; break;
            case 'processing': color = 'blue'; break;
            default: color = 'gray';
          }
          return (
            <Tag color={color} style={{ fontSize: '12px' }}>
              {status.toUpperCase()}
            </Tag>
          );
        },
        width: 100
      },
      {
        title: 'Actions',
        key: 'actions',
        width: 60,
        render: (_, record) => (
          <Button
            icon={<EyeOutlined />}
            onClick={() => showApplicationDetails(record)}
            size="small"
            type="text"
          />
        )
      }
    ];

    const expandedColumns = [
      {
        title: 'Section',
        dataIndex: 'section_name',
        key: 'section_name',
        responsive: ['md'],
        render: (text) => (
          <Text style={{ fontSize: '12px' }} ellipsis>
            {text}
          </Text>
        ),
        width: 100
      },
      {
        title: 'Type',
        dataIndex: 'type',
        key: 'type',
        responsive: ['sm'],
        render: (text) => (
          <Text style={{ fontSize: '12px' }} ellipsis>
            {text}
          </Text>
        ),
        width: 100
      },
      {
        title: 'Date',
        dataIndex: 'submission_date',
        key: 'submission_date',
        responsive: ['sm'],
        render: date => (
          <Text style={{ fontSize: '12px' }}>
            {new Date(date).toLocaleDateString()}
          </Text>
        ),
        width: 100
      }
    ];

    return screens.md ? [...baseColumns, ...expandedColumns] : baseColumns;
  };

  const renderFilters = () => (
    <Space 
      size="middle" 
      direction={screens.xs ? "vertical" : "horizontal"} 
      style={screens.xs ? { width: '100%' } : {}}
    >
      <Select
        defaultValue="all"
        style={{ width: screens.xs ? '100%' : 150 }}
        onChange={value => setFilterStatus(value)}
        size="small"
      >
        <Option value="all">All Statuses</Option>
        <Option value="Pending">Pending</Option>
        <Option value="Approved">Approved</Option>
        <Option value="Rejected">Rejected</Option>
        <Option value="Processing">Processing</Option>
      </Select>
      <Select
        defaultValue="all"
        style={{ width: screens.xs ? '100%' : 150 }}
        onChange={value => setSelectedSection(value)}
        loading={loading}
        size="small"
      >
        <Option value="all">All Sections</Option>
        {sections.map(section => (
          <Option key={section.id} value={section.id}>
            {section.name}
          </Option>
        ))}
      </Select>
    </Space>
  );

  return (
    <Layout style={{ minHeight: '100vh', overflowX: 'hidden' }}>
      {/* Mobile Sidebar Drawer */}
      {!screens.md && (
        <Drawer
          title="Menu"
          placement="left"
          closable={true}
          onClose={() => setMobileSidebarVisible(false)}
          visible={mobileSidebarVisible}
          width={250}
          bodyStyle={{ padding: 0 }}
        >
          <Sidebar collapsed={false} />
        </Drawer>
      )}

      {/* Desktop Sidebar */}
      {screens.md && (
        <Sidebar 
          collapsed={sidebarCollapsed} 
          onCollapse={(collapsed) => setSidebarCollapsed(collapsed)}
        />
      )}

      <Layout 
        style={{ 
          marginLeft: screens.md ? (sidebarCollapsed ? 80 : 200) : 0,
          transition: 'all 0.2s',
          overflowX: 'hidden'
        }}
      >
        <AntContent style={{ 
          padding: screens.xs ? '8px' : '16px',
          minHeight: '100vh',
          overflowX: 'hidden'
        }}>
          {/* Mobile Header */}
          {!screens.md && (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              marginBottom: 12,
              padding: '8px 0'
            }}>
              <Button 
                icon={<MenuOutlined />} 
                onClick={() => setMobileSidebarVisible(true)}
                style={{ marginRight: 12 }}
                size="small"
              />
              <Title 
                level={5} 
                style={{ margin: 0 }}
              >
                Student Applications
              </Title>
            </div>
          )}

          <Card
            title={
              screens.md && (
                <Title 
                  level={4} 
                  style={{ 
                    margin: 0,
                    fontSize: '16px'
                  }}
                >
                  Student Applications
                </Title>
              )
            }
            bordered={false}
            style={{ 
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
              borderRadius: 8
            }}
            bodyStyle={{ 
              padding: '8px',
              overflowX: 'hidden'
            }}
            extra={
              screens.md ? (
                renderFilters()
              ) : (
                <Dropdown
                  overlay={
                    <Menu style={{ padding: '12px' }}>
                      <Menu.Item key="filters">
                        {renderFilters()}
                      </Menu.Item>
                    </Menu>
                  }
                  trigger={['click']}
                  visible={mobileFilterVisible}
                  onVisibleChange={setMobileFilterVisible}
                  placement="bottomRight"
                >
                  <Button 
                    icon={<FilterOutlined />} 
                    size="small"
                  />
                </Dropdown>
              )
            }
          >
            {loading ? (
              <div style={{ 
                textAlign: 'center', 
                padding: '16px' 
              }}>
                <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />
              </div>
            ) : (
              <div style={{ overflowX: 'auto', width: '100%' }}>
                <Table
                  columns={getColumns()}
                  dataSource={filteredApplications}
                  rowKey="id"
                  pagination={{ 
                    pageSize: 10,
                    showSizeChanger: false,
                    simple: !screens.md,
                    size: "small"
                  }}
                  size="small"
                  style={{ 
                    fontSize: '12px',
                    width: '100%'
                  }}
                  loading={loading}
                />
              </div>
            )}
          </Card>

          {/* Modal for viewing and updating application */}
          <Modal
            title="Application Details"
            open={viewModalVisible}
            onCancel={() => setViewModalVisible(false)}
            footer={[
              <Button 
                key="close" 
                onClick={() => setViewModalVisible(false)}
                size="small"
              >
                Close
              </Button>,
              screens.xs ? (
                <Dropdown
                  overlay={
                    <Menu>
                      <Menu.Item 
                        key="pending" 
                        onClick={() => handleStatusChange('Pending')}
                        icon={<ClockCircleOutlined />}
                      >
                        Mark Pending
                      </Menu.Item>
                      <Menu.Item 
                        key="approve" 
                        onClick={() => handleStatusChange('Approved')}
                        icon={<CheckOutlined />}
                      >
                        Approve
                      </Menu.Item>
                      <Menu.Item 
                        key="reject" 
                        onClick={() => handleStatusChange('Rejected')}
                        icon={<CloseOutlined />}
                      >
                        Reject
                      </Menu.Item>
                    </Menu>
                  }
                  placement="topRight"
                >
                  <Button 
                    type="primary" 
                    loading={actionLoading}
                    size="small"
                  >
                    <MoreOutlined /> Actions
                  </Button>
                </Dropdown>
              ) : (
                <>
                  <Button
                    key="pending"
                    icon={<ClockCircleOutlined />}
                    onClick={() => handleStatusChange('Pending')}
                    loading={actionLoading}
                    size="small"
                  >
                    Mark Pending
                  </Button>
                  <Button
                    key="approve"
                    icon={<CheckOutlined />}
                    type="primary"
                    onClick={() => handleStatusChange('Approved')}
                    loading={actionLoading}
                    size="small"
                  >
                    Approve
                  </Button>
                  <Button
                    key="reject"
                    icon={<CloseOutlined />}
                    danger
                    onClick={() => handleStatusChange('Rejected')}
                    loading={actionLoading}
                    size="small"
                  >
                    Reject
                  </Button>
                </>
              )
            ]}
            width={screens.xs ? '95%' : 700}
            style={{ top: 16 }}
            bodyStyle={{ 
              padding: '16px',
              maxHeight: 'calc(100vh - 200px)',
              overflowY: 'auto'
            }}
          >
            {currentApplication && (
              <>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  marginBottom: 12,
                  flexDirection: screens.xs ? 'column' : 'row',
                  textAlign: screens.xs ? 'center' : 'left'
                }}>
                  {pictureLoading ? (
                    <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />
                  ) : studentPicture ? (
                    <Image
                      width={48}
                      height={48}
                      src={studentPicture}
                      style={{ borderRadius: '50%' }}
                      alt="Student Profile"
                      fallback={<Avatar size={48} icon={<UserOutlined />} />}
                    />
                  ) : (
                    <Avatar size={48} icon={<UserOutlined />} />
                  )}
                  <div style={{ 
                    marginLeft: screens.xs ? 0 : 16,
                    marginTop: screens.xs ? 8 : 0
                  }}>
                    <Title 
                      level={5} 
                      style={{ 
                        margin: 0,
                        fontSize: '16px'
                      }}
                    >
                      {currentApplication.student_name}
                    </Title>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      {currentApplication.section_name}
                    </Text>
                  </div>
                </div>

                <Descriptions 
                  bordered 
                  column={1}
                  size="small"
                >
                  <Descriptions.Item label="Title">
                    <Text style={{ fontSize: '12px' }}>
                      {currentApplication.title}
                    </Text>
                  </Descriptions.Item>
                  <Descriptions.Item label="Status">
                    <Badge
                      status={
                        currentApplication.status.toLowerCase() === 'approved'
                          ? 'success'
                          : currentApplication.status.toLowerCase() === 'rejected'
                          ? 'error'
                          : 'processing'
                      }
                      text={
                        <Text style={{ fontSize: '12px' }}>
                          {currentApplication.status}
                        </Text>
                      }
                    />
                  </Descriptions.Item>
                  <Descriptions.Item label="Description">
                    <div style={{ 
                      padding: 8, 
                      background: '#f9f9f9',
                      borderRadius: 4
                    }}>
                      <Text style={{ fontSize: '12px' }}>
                        {currentApplication.description || 'No description'}
                      </Text>
                    </div>
                  </Descriptions.Item>
                  <Descriptions.Item label="Teacher Response">
                    <div style={{ 
                      padding: 8, 
                      background: '#f9f9f9',
                      borderRadius: 4
                    }}>
                      <Text style={{ fontSize: '12px' }}>
                        {currentApplication.response_discription || 'No response'}
                      </Text>
                    </div>
                  </Descriptions.Item>
                  <Descriptions.Item label="Submission Date">
                    <Text style={{ fontSize: '12px' }}>
                      {new Date(currentApplication.submission_date).toLocaleString()}
                    </Text>
                  </Descriptions.Item>
                  <Descriptions.Item label="Leave Dates">
                    <div style={{ 
                      padding: 8, 
                      background: '#f9f9f9',
                      borderRadius: 4
                    }}>
                      <Text style={{ fontSize: '12px' }}>
                        From: {new Date(currentApplication.start_date).toLocaleDateString()}
                        {' '}to{' '}
                        {new Date(currentApplication.end_date).toLocaleDateString()}
                      </Text>
                    </div>
                  </Descriptions.Item>
                </Descriptions>

                <Form layout="vertical" style={{ marginTop: screens.xs ? 16 : 24 }}>
                  <Form.Item label="Response (optional)">
                    <Input.TextArea
                      rows={screens.xs ? 3 : 4}
                      value={responseText}
                      onChange={e => setResponseText(e.target.value)}
                      placeholder="Write your response here..."
                      style={{ fontSize: screens.xs ? '12px' : '14px' }}
                    />
                  </Form.Item>
                </Form>
              </>
            )}
          </Modal>
        </AntContent>
      </Layout>
    </Layout>
  );
};

export default StudentApplications;