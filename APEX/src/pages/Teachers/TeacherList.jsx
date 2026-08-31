import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Card, 
  Typography, 
  Button, 
  Space, 
  Alert, 
  Avatar, 
  Grid, 
  Dropdown, 
  Tag,
  ConfigProvider,
  theme,
  Tooltip,
  Layout,
  Input,
  Row,
  Col,
  Statistic,
  Drawer
} from 'antd';
import { Link } from 'react-router-dom';
import { 
  UserOutlined, 
  MailOutlined, 
  PhoneOutlined, 
  ArrowLeftOutlined,
  MoreOutlined,
  TeamOutlined,
  ReloadOutlined,
  SearchOutlined,
  MenuOutlined,
  ExportOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import styled from 'styled-components';
import Sidebar from './Sidebar';

const { Title, Text } = Typography;
const { Content } = Layout;
const { useBreakpoint } = Grid;

const OuterLayout = styled(Layout)`
  min-height: 100vh;
  background-color: #f8fafc !important;
`;

const ContentCanvas = styled(Content)`
  padding: 24px;
  background-color: #f8fafc;
  min-height: 100vh;
  box-sizing: border-box;

  @media (max-width: 576px) {
    padding: 12px;
  }
`;

const MainHeaderCard = styled.div`
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 20px 24px;
  margin-bottom: 20px;
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.03);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    padding: 16px;
  }
`;

const HeaderTitleWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;

  .title-icon-badge {
    width: 44px;
    height: 44px;
    border-radius: 10px;
    background: linear-gradient(135deg, #fefce8 0%, #fef3c7 100%);
    border: 1px solid rgba(212, 175, 55, 0.3);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 22px;
    color: #d4af37;
    box-shadow: 0 2px 8px rgba(212, 175, 55, 0.15);
    flex-shrink: 0;
  }
`;

const StatCard = styled(Card)`
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  box-shadow: 0 2px 6px rgba(15, 23, 42, 0.02);
  background: #ffffff;
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(15, 23, 42, 0.06);
  }

  .ant-card-body {
    padding: 18px 20px;
  }
`;

const FilterBarCard = styled(Card)`
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  background: #ffffff;
  margin-bottom: 20px;
  box-shadow: 0 2px 6px rgba(15, 23, 42, 0.02);

  .ant-card-body {
    padding: 16px 20px;
  }
`;

const StyledTableCard = styled(Card)`
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.03);
  background: #ffffff;

  .ant-card-body {
    padding: 20px;

    @media (max-width: 576px) {
      padding: 12px;
    }
  }

  .ant-table-wrapper {
    .ant-table-thead > tr > th {
      background: #f8fafc;
      color: #475569;
      font-weight: 600;
      border-bottom: 1px solid #e2e8f0;
    }

    .ant-table-tbody > tr > td {
      border-bottom: 1px solid #f1f5f9;
      padding: 14px 16px;
    }

    .ant-table-tbody > tr:hover > td {
      background: #fafafa;
    }
  }
`;

const StyledDrawer = styled(Drawer)`
  .ant-drawer-content {
    background-color: #061129 !important;
  }
  .ant-drawer-body {
    padding: 0 !important;
    overflow: hidden;
  }
  .ant-drawer-header {
    background-color: #061129 !important;
    border-bottom: 1px solid rgba(212, 175, 55, 0.15) !important;
    .ant-drawer-title,
    .ant-drawer-close {
      color: #ffffff !important;
    }
  }
`;

const TeacherList = () => {
  const [teachers, setTeachers] = useState([]);
  const [filteredTeachers, setFilteredTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profilePictures, setProfilePictures] = useState({});
  
  // Search State
  const [searchText, setSearchText] = useState('');

  // Sidebar Layout State
  const [mobileSidebarVisible, setMobileSidebarVisible] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const screens = useBreakpoint();
  const isMobile = !screens.md;

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/teach_read.php');
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
      if (!data.success) throw new Error(data.error || 'Failed to fetch teachers');

      const formattedTeachers = Array.isArray(data.data) ? data.data.map(teacher => ({
        id: teacher.id,
        name: teacher.teach_name,
        email: teacher.teach_email || 'N/A',
        phone: teacher.teach_no || 'N/A',
      })) : [];

      setTeachers(formattedTeachers);
      setFilteredTeachers(formattedTeachers);
      
      if (formattedTeachers.length > 0) {
        fetchProfilePictures(formattedTeachers);
      }
    } catch (err) {
      console.error('Error fetching teachers:', err);
      setError(err.message || 'Failed to load teacher data');
    } finally {
      setLoading(false);
    }
  };

  const fetchProfilePictures = async (teachersList) => {
    const pictures = {};
    const promises = teachersList.map(teacher => {
      return fetch(`https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/get_profilepicture.php?teacher_id=${teacher.id}`)
        .then(response => response.json())
        .then(data => {
          pictures[teacher.id] = data.success && data.file_url ? data.file_url : null;
        })
        .catch(() => {
          pictures[teacher.id] = null;
        });
    });

    await Promise.all(promises);
    setProfilePictures(pictures);
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  // Filter Handler
  useEffect(() => {
    let result = [...teachers];

    if (searchText) {
      const lowerSearch = searchText.toLowerCase();
      result = result.filter(t => 
        t.name.toLowerCase().includes(lowerSearch) || 
        t.id.toString().includes(lowerSearch) ||
        t.email.toLowerCase().includes(lowerSearch) ||
        t.phone.toLowerCase().includes(lowerSearch)
      );
    }

    setFilteredTeachers(result);
  }, [searchText, teachers]);

  const columns = [
    {
      title: 'Profile',
      dataIndex: 'id',
      key: 'profile',
      width: 70,
      render: (id) => (
        <Avatar
          src={profilePictures[id]}
          size="default"
          icon={!profilePictures[id] && <UserOutlined />}
          style={{
            backgroundColor: profilePictures[id] ? 'transparent' : '#091838',
            color: '#d4af37',
            border: '1.5px solid #d4af37'
          }}
        />
      ),
    },
    {
      title: 'Faculty ID',
      dataIndex: 'id',
      key: 'id',
      width: 110,
      render: (id) => <Tag color="gold" style={{ fontWeight: 600 }}>#{id}</Tag>,
    },
    {
      title: 'Teacher Name',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <Text strong style={{ color: '#0f172a', fontSize: 14 }}>{text}</Text>,
    },
    {
      title: 'Email Address',
      dataIndex: 'email',
      key: 'email',
      render: (text) => text !== 'N/A' ? (
        <a href={`mailto:${text}`} style={{ color: '#2563eb' }}>
          <MailOutlined style={{ marginRight: 6 }} />
          {text}
        </a>
      ) : <Text type="secondary">N/A</Text>,
      responsive: ['md'],
    },
    {
      title: 'Phone Number',
      dataIndex: 'phone',
      key: 'phone',
      render: (text) => text !== 'N/A' ? (
        <a href={`tel:${text}`} style={{ color: '#475569' }}>
          <PhoneOutlined style={{ marginRight: 6, color: '#d4af37' }} />
          {text}
        </a>
      ) : <Text type="secondary">N/A</Text>,
      responsive: ['sm'],
    },
    {
      title: 'Action',
      key: 'action',
      width: 80,
      render: (_, record) => (
        <Dropdown
          menu={{
            items: [
              {
                key: 'email',
                icon: <MailOutlined style={{ color: '#d4af37' }} />,
                label: <a href={`mailto:${record.email}`}>Send Email</a>,
              },
              {
                key: 'phone',
                icon: <PhoneOutlined style={{ color: '#d4af37' }} />,
                label: <a href={`tel:${record.phone}`}>Call Contact</a>,
              },
            ]
          }}
          trigger={['click']}
        >
          <Button type="text" icon={<MoreOutlined style={{ fontSize: 18 }} />} />
        </Dropdown>
      ),
    },
  ];

  return (
    <ConfigProvider
      theme={{
        algorithm: theme.defaultAlgorithm,
        token: {
          colorPrimary: '#d4af37',
          colorBgBase: '#ffffff',
          colorBgContainer: '#ffffff',
          colorTextBase: '#0f172a',
          colorBorder: '#e2e8f0',
          borderRadius: 8,
        },
      }}
    >
      <OuterLayout style={{ flexDirection: 'row' }}>
        {/* MOBILE SIDEBAR DRAWER */}
        {isMobile ? (
          <StyledDrawer
            title="APEX COLLEGE"
            placement="left"
            closable={true}
            onClose={() => setMobileSidebarVisible(false)}
            visible={mobileSidebarVisible}
            width={250}
          >
            <Sidebar collapsed={false} onItemClick={() => setMobileSidebarVisible(false)} />
          </StyledDrawer>
        ) : (
          <Sidebar collapsed={sidebarCollapsed} onCollapse={setSidebarCollapsed} />
        )}

        {/* MAIN PAGE CANVAS */}
        <Layout style={{ background: '#f8fafc', minHeight: '100vh' }}>
          <ContentCanvas>
            {/* TOP HEADER CARD */}
            <MainHeaderCard>
              <HeaderTitleWrapper>
                {isMobile && (
                  <Button
                    type="default"
                    icon={<MenuOutlined style={{ color: '#0f172a' }} />}
                    onClick={() => setMobileSidebarVisible(true)}
                    style={{ borderColor: '#cbd5e1', background: '#ffffff' }}
                  />
                )}
                <Link to="/teacher/dashboard">
                  <Button
                    type="default"
                    icon={<ArrowLeftOutlined style={{ color: '#0f172a' }} />}
                    style={{ borderColor: '#cbd5e1', background: '#ffffff' }}
                  />
                </Link>
                <div className="title-icon-badge">
                  <TeamOutlined />
                </div>
                <div>
                  <Title level={isMobile ? 4 : 3} style={{ margin: 0, color: '#0f172a', fontWeight: 700 }}>
                    Faculty Directory
                  </Title>
                  <Text style={{ color: '#64748b', fontSize: isMobile ? 11 : 13 }}>
                    Overview of all registered institution teachers
                  </Text>
                </div>
              </HeaderTitleWrapper>

              <Space wrap>
                <Button icon={<ExportOutlined />}>Export</Button>
                <Tooltip title="Refresh Directory">
                  <Button
                    icon={<ReloadOutlined />}
                    onClick={fetchTeachers}
                    loading={loading}
                    style={{ borderColor: '#cbd5e1', color: '#475569' }}
                  />
                </Tooltip>
              </Space>
            </MainHeaderCard>

            {/* SUMMARY STATS ROW */}
            <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
              <Col xs={24} sm={12}>
                <StatCard>
                  <Statistic
                    title={<Text type="secondary" style={{ fontSize: 13 }}>Total Registered Faculty</Text>}
                    value={teachers.length}
                    prefix={<TeamOutlined style={{ color: '#d4af37', marginRight: 8 }} />}
                  />
                </StatCard>
              </Col>
              <Col xs={24} sm={12}>
                <StatCard>
                  <Statistic
                    title={<Text type="secondary" style={{ fontSize: 13 }}>Matching Search Results</Text>}
                    value={filteredTeachers.length}
                    valueStyle={{ color: '#16a34a' }}
                    prefix={<CheckCircleOutlined style={{ marginRight: 8 }} />}
                  />
                </StatCard>
              </Col>
            </Row>

            {/* SEARCH CONTROLS BAR */}
            <FilterBarCard>
              <Row gutter={[16, 12]} align="middle">
                <Col xs={24}>
                  <Input
                    placeholder="Search by teacher name, ID, email, or phone number..."
                    prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    allowClear
                    size="large"
                  />
                </Col>
              </Row>
            </FilterBarCard>

            {/* MAIN DATA TABLE CARD */}
            {error ? (
              <Alert
                message="Failed to load faculty"
                description={error}
                type="error"
                showIcon
                action={<Button size="small" danger onClick={fetchTeachers}>Retry</Button>}
                style={{ borderRadius: 10 }}
              />
            ) : (
              <StyledTableCard>
                <Table
                  columns={columns}
                  dataSource={filteredTeachers}
                  rowKey="id"
                  loading={loading}
                  pagination={{
                    pageSize: 8,
                    showSizeChanger: true,
                    pageSizeOptions: ['8', '16', '32'],
                    showTotal: (total) => `Showing ${total} faculty members`
                  }}
                  scroll={{ x: 'max-content' }}
                  locale={{ emptyText: 'No faculty members found' }}
                />
              </StyledTableCard>
            )}
          </ContentCanvas>
        </Layout>
      </OuterLayout>
    </ConfigProvider>
  );
};

export default TeacherList;