import { useEffect, useState, useCallback } from 'react';
import { 
  Layout, 
  Card, 
  Select, 
  Row, 
  Col, 
  Statistic, 
  List, 
  Typography, 
  Spin,
  Empty,
  Tabs,
  Alert,
  notification,
  Button,
  Drawer,
  Space
} from 'antd';
import styled from 'styled-components'; 
import { 
  LineChartOutlined, 
  FilterOutlined, 
  UserOutlined, 
  BookOutlined,
  PercentageOutlined,
  RiseOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  TrophyOutlined,
  BarChartOutlined
} from '@ant-design/icons';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title as ChartTitle,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import Sidebar from './Sidebar';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ChartTitle,
  Tooltip,
  Legend,
  Filler
);

const { Header, Content, Sider } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

// Styled components for better organization
const StyledCard = styled(Card)`
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  }
`;

const StatisticCard = styled(StyledCard)`
  .ant-statistic-content {
    font-size: 24px;
    color: #1890ff;
  }
  
  .ant-statistic-title {
    font-size: 14px;
    color: #666;
  }
`;

const PerformanceHeader = styled(Header)`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
  padding: 0 16px !important;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  position: sticky;
  top: 0;
  z-index: 100;
  
  .ant-typography {
    color: white !important;
    margin: 0 !important;
    font-size: 16px !important;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 200px;
  }
`;

const HeaderContent = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
  min-width: 0;
`;

const HeaderTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  flex: 1;
`;

const MainContent = styled(Content)`
  margin: 24px 16px 0;
  transition: padding 0.2s ease;
  background: #f5f7fa;
  min-height: calc(100vh - 112px);
`;

const ChartContainer = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.09);
  margin-bottom: 24px;
`;

const PerformanceSection = () => {
  const [performanceData, setPerformanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedExamType, setSelectedExamType] = useState('All');
  const [activePaperTab, setActivePaperTab] = useState(null);
  const [collapsed, setCollapsed] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  const isMobile = windowWidth < 768;

  const handleResize = useCallback(() => {
    const resizeTimer = setTimeout(() => {
      setWindowWidth(window.innerWidth);
      if (window.innerWidth >= 768) {
        setDrawerVisible(false);
      }
    }, 100);
    return () => clearTimeout(resizeTimer);
  }, []);

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize]);

  useEffect(() => {
    const savedCollapsed = localStorage.getItem('sidebarCollapsed');
    if (savedCollapsed && !isMobile) {
      setCollapsed(JSON.parse(savedCollapsed));
    }
  }, [isMobile]);

  useEffect(() => {
    if (!isMobile) {
      localStorage.setItem('sidebarCollapsed', JSON.stringify(collapsed));
    }
  }, [collapsed, isMobile]);

  useEffect(() => {
    if (!isMobile) {
      setDrawerVisible(false);
    }
  }, [isMobile]);

  const fetchPerformanceData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/fetchPerformance.php', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
        }
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const data = await response.json();
      
      if (!Array.isArray(data.data)) {
        throw new Error('Invalid data format received from server');
      }
  
      const processedData = data.data.map(item => ({
        ...item,
        obtained_marks: parseInt(item.obtained_marks) || 0,
        total_marks: parseInt(item.total_marks) || 100,
        percentage: ((parseInt(item.obtained_marks) / parseInt(item.total_marks)) * 100) || 0
      }));
      
      setPerformanceData(processedData);
      
      if (processedData.length > 0) {
        setActivePaperTab(processedData[0].exam_name);
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setError(err.message);
      notification.error({
        message: 'Error Loading Data',
        description: 'Failed to load performance data. Please try again later.',
        placement: 'topRight'
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPerformanceData();
  }, [fetchPerformanceData]);

  const examTypes = ['All', ...new Set(performanceData.map(item => item.exam_type || 'General'))];
  const filteredByExamType = selectedExamType === 'All' 
    ? performanceData 
    : performanceData.filter(item => (item.exam_type || 'General') === selectedExamType);
  const papers = [...new Set(filteredByExamType.map(item => item.exam_name))];
  const filteredData = activePaperTab 
    ? filteredByExamType.filter(item => item.exam_name === activePaperTab)
    : [];

  // Calculate statistics
  const totalPapers = papers.length;
  const totalMarks = filteredByExamType.reduce((sum, item) => sum + (item.obtained_marks || 0), 0);
  const averagePercentage = filteredByExamType.length > 0 
    ? (filteredByExamType.reduce((sum, item) => sum + item.percentage, 0) / filteredByExamType.length).toFixed(2)
    : 0;

  // Find top performing subject
  const topSubject = filteredData.length > 0 
    ? filteredData.reduce((max, item) => item.percentage > max.percentage ? item : max, filteredData[0])
    : null;

  const lineChartData = {
    labels: filteredData.map(item => item.subject_name || 'Unknown Subject'),
    datasets: [{
      label: 'Marks Percentage',
      data: filteredData.map(item => item.percentage.toFixed(2)),
      backgroundColor: 'rgba(24, 144, 255, 0.2)',
      borderColor: '#1890ff',
      borderWidth: 3,
      tension: 0.4,
      fill: true,
      pointBackgroundColor: '#1890ff',
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      pointRadius: 6,
      pointHoverRadius: 8
    }]
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20
        }
      },
      tooltip: { 
        mode: 'index', 
        intersect: false,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleFont: { size: 14 },
        bodyFont: { size: 13 },
        padding: 12,
        callbacks: {
          label: (context) => {
            const dataItem = filteredData[context.dataIndex];
            return [
              `Subject: ${dataItem.subject_name || 'Unknown'}`,
              `Marks: ${dataItem.obtained_marks}/${dataItem.total_marks}`,
              `Percentage: ${dataItem.percentage.toFixed(2)}%`,
              dataItem.teacher_name && `Teacher: ${dataItem.teacher_name}`
            ].filter(Boolean);
          }
        }
      }
    },
    scales: { 
      y: { 
        beginAtZero: true, 
        max: 100,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        },
        ticks: {
          callback: function(value) {
            return value + '%';
          }
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    }
  };

  const toggleSidebar = () => {
    if (isMobile) {
      setDrawerVisible(prev => !prev);
    } else {
      setCollapsed(prev => !prev);
    }
  };

  if (error) {
    return (
      <Layout style={{ minHeight: '100vh' }}>
        {!isMobile && (
          <Sider 
            width={250} 
            theme="light" 
            collapsible
            collapsed={collapsed}
            onCollapse={setCollapsed}
            breakpoint="lg"
            collapsedWidth={80}
            style={{
              boxShadow: '2px 0 8px rgba(0, 0, 0, 0.15)'
            }}
          >
            <Sidebar />
          </Sider>
        )}
        <Layout>
          <PerformanceHeader>
            <HeaderContent>
              {isMobile && (
                <Button 
                  type="text"
                  icon={drawerVisible ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                  onClick={toggleSidebar}
                  style={{ color: 'white', flexShrink: 0 }}
                />
              )}
              <HeaderTitle>
                <BarChartOutlined />
                <Text strong>Performance Analytics</Text>
              </HeaderTitle>
            </HeaderContent>
          </PerformanceHeader>
          <MainContent style={{ paddingLeft: isMobile ? 0 : (collapsed ? 80 : 250) }}>
            <Alert
              message="Error Loading Data"
              description={error}
              type="error"
              showIcon
              style={{ 
                margin: 24,
                borderRadius: 12
              }}
              action={
                <Button 
                  type="primary" 
                  size="small" 
                  onClick={fetchPerformanceData}
                >
                  Retry
                </Button>
              }
            />
          </MainContent>
        </Layout>

        {isMobile && (
          <Drawer
            title="Navigation Menu"
            placement="left"
            closable={true}
            onClose={() => setDrawerVisible(false)}
            open={drawerVisible}
            bodyStyle={{ padding: 0 }}
            width={280}
          >
            <Sidebar />
          </Drawer>
        )}
      </Layout>
    );
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {!isMobile && (
        <Sider 
          width={280} 
          theme="light" 
          collapsible
          collapsed={collapsed}
          onCollapse={setCollapsed}
          breakpoint="lg"
          collapsedWidth={80}
          style={{
            boxShadow: '2px 0 8px rgba(0, 0, 0, 0.15)'
          }}
        >
          <Sidebar />
        </Sider>
      )}

      <Layout>
        <PerformanceHeader>
          <HeaderContent>
            {isMobile && (
              <Button 
                type="text"
                icon={drawerVisible ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                onClick={toggleSidebar}
                style={{ color: 'white', flexShrink: 0 }}
              />
            )}
            <HeaderTitle>
              <BarChartOutlined />
              <Text strong>Performance Analytics</Text>
            </HeaderTitle>
          </HeaderContent>
        </PerformanceHeader>

        <MainContent style={{ 
          paddingLeft: !isMobile ? (collapsed ? 80 : 280) : 0,
        }}>
          <Spin spinning={loading} tip="Loading your performance data..." size="large">
            {performanceData.length === 0 && !loading ? (
              <Empty 
                description="No performance data available" 
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                style={{ 
                  marginTop: 100,
                  color: '#999'
                }}
              >
                <Button type="primary" onClick={fetchPerformanceData}>
                  Refresh Data
                </Button>
              </Empty>
            ) : (
              <>
                {/* Statistics Cards */}
                <Row gutter={[20, 20]} style={{ marginBottom: 24 }}>
                  <Col xs={24} sm={12} lg={6}>
                    <StatisticCard>
                      <Statistic
                        title="Total Papers"
                        value={totalPapers}
                        prefix={<BookOutlined style={{ color: '#1890ff' }} />}
                        valueStyle={{ color: '#1890ff' }}
                      />
                    </StatisticCard>
                  </Col>
                  <Col xs={24} sm={12} lg={6}>
                    <StatisticCard>
                      <Statistic
                        title="Total Marks"
                        value={totalMarks}
                        prefix={<RiseOutlined style={{ color: '#52c41a' }} />}
                        valueStyle={{ color: '#52c41a' }}
                      />
                    </StatisticCard>
                  </Col>
                  <Col xs={24} sm={12} lg={6}>
                    <StatisticCard>
                      <Statistic
                        title="Average %"
                        value={averagePercentage}
                        suffix="%"
                        prefix={<PercentageOutlined style={{ color: '#faad14' }} />}
                        valueStyle={{ color: '#faad14' }}
                      />
                    </StatisticCard>
                  </Col>
                  <Col xs={24} sm={12} lg={6}>
                    <StatisticCard>
                      <Statistic
                        title="Top Subject"
                        value={topSubject ? topSubject.percentage.toFixed(2) : 0}
                        suffix={topSubject ? '%' : ''}
                        prefix={<TrophyOutlined style={{ color: '#f5222d' }} />}
                        valueStyle={{ color: '#f5222d' }}
                      />
                      {topSubject && (
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {topSubject.subject_name}
                        </Text>
                      )}
                    </StatisticCard>
                  </Col>
                </Row>

                {/* Main Content Area */}
                <StyledCard
                  title={
                    <Space>
                      <LineChartOutlined />
                      Exam Performance Analysis
                    </Space>
                  }
                  extra={
                    <Select
                      defaultValue="All"
                      style={{ width: isMobile ? '100%' : 200, marginTop: isMobile ? 16 : 0 }}
                      onChange={setSelectedExamType}
                      suffixIcon={<FilterOutlined />}
                      loading={loading}
                      size={isMobile ? 'large' : 'middle'}
                    >
                      {examTypes.map((type, index) => (
                        <Option key={index} value={type}>
                          {type}
                        </Option>
                      ))}
                    </Select>
                  }
                >
                  {papers.length > 0 ? (
                    <Tabs
                      activeKey={activePaperTab || (papers[0] ?? '')}
                      onChange={setActivePaperTab}
                      type={isMobile ? "line" : "card"}
                      size={isMobile ? "small" : "middle"}
                    >
                      {papers.map(paper => (
                        <TabPane 
                          tab={
                            <Space>
                              <BookOutlined />
                              {paper}
                            </Space>
                          } 
                          key={paper}
                        >
                          <ChartContainer>
                            <Title level={5} style={{ marginBottom: 24 }}>
                              Performance Trend - {paper}
                            </Title>
                            <div style={{ height: 300 }}>
                              <Line data={lineChartData} options={lineChartOptions} />
                            </div>
                          </ChartContainer>

                          <StyledCard title={`Detailed Results - ${paper}`}>
                            <List
                              itemLayout="horizontal"
                              dataSource={filteredData}
                              renderItem={(item, index) => (
                                <List.Item
                                  style={{
                                    padding: '16px 0',
                                    borderBottom: '1px solid #f0f0f0',
                                    backgroundColor: index % 2 === 0 ? '#fafafa' : 'white'
                                  }}
                                >
                                  <List.Item.Meta
                                    avatar={
                                      <div style={{
                                        width: 40,
                                        height: 40,
                                        borderRadius: '50%',
                                        background: 'linear-gradient(135deg, #1890ff 0%, #52c41a 100%)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'white',
                                        fontWeight: 'bold'
                                      }}>
                                        {index + 1}
                                      </div>
                                    }
                                    title={
                                      <Text strong style={{ fontSize: 16 }}>
                                        {item.subject_name || 'Unknown Subject'}
                                      </Text>
                                    }
                                    description={
                                      item.teacher_name && (
                                        <Text type="secondary">
                                          <UserOutlined /> Taught by: {item.teacher_name}
                                        </Text>
                                      )
                                    }
                                  />
                                  <div style={{ textAlign: 'right' }}>
                                    <Text strong style={{ fontSize: 16, color: '#1890ff' }}>
                                      {item.obtained_marks}/{item.total_marks}
                                    </Text>
                                    <br />
                                    <Text type={item.percentage >= 80 ? 'success' : item.percentage >= 50 ? 'warning' : 'danger'}>
                                      ({item.percentage.toFixed(2)}%)
                                    </Text>
                                  </div>
                                </List.Item>
                              )}
                            />
                          </StyledCard>
                        </TabPane>
                      ))}
                    </Tabs>
                  ) : (
                    <Empty 
                      description={loading ? "Loading exam data..." : "No exams found for selected type"} 
                      style={{ padding: 40 }}
                    />
                  )}
                </StyledCard>
              </>
            )}
          </Spin>
        </MainContent>
      </Layout>

      {isMobile && (
        <Drawer
          title="Navigation Menu"
          placement="left"
          closable={true}
          onClose={() => setDrawerVisible(false)}
          open={drawerVisible}
          bodyStyle={{ padding: 0 }}
          width={280}
        >
          <Sidebar />
        </Drawer>
      )}
    </Layout>
  );
};

export default PerformanceSection;