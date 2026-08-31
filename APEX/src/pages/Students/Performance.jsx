// src/pages/Students/Performance.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { 
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
  Space,
  Tag
} from 'antd';
import { 
  LineChartOutlined, 
  FilterOutlined, 
  UserOutlined, 
  BookOutlined,
  PercentageOutlined,
  RiseOutlined,
  TrophyOutlined,
  ReloadOutlined
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

const { Title, Text } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

const PerformanceSection = () => {
  const [performanceData, setPerformanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedExamType, setSelectedExamType] = useState('All');
  const [activePaperTab, setActivePaperTab] = useState(null);

  const API_BASE_URL = 'https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX';

  const fetchPerformanceData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_BASE_URL}/fetchPerformance.php`, {
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
      backgroundColor: 'rgba(212, 175, 55, 0.15)',
      borderColor: '#d4af37',
      borderWidth: 3,
      tension: 0.35,
      fill: true,
      pointBackgroundColor: '#0b1b3d',
      pointBorderColor: '#d4af37',
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
          padding: 20,
          font: { family: "'Plus Jakarta Sans', sans-serif", weight: '600' }
        }
      },
      tooltip: { 
        mode: 'index', 
        intersect: false,
        backgroundColor: '#061129',
        titleFont: { size: 14, family: "'Plus Jakarta Sans', sans-serif", weight: 'bold' },
        bodyFont: { size: 13, family: "'Plus Jakarta Sans', sans-serif" },
        padding: 12,
        borderColor: '#d4af37',
        borderWidth: 1,
        callbacks: {
          label: (context) => {
            const dataItem = filteredData[context.dataIndex];
            return [
              `Subject: ${dataItem.subject_name || 'Unknown'}`,
              `Score: ${dataItem.obtained_marks}/${dataItem.total_marks}`,
              `Percentage: ${dataItem.percentage.toFixed(2)}%`,
              dataItem.teacher_name ? `Teacher: ${dataItem.teacher_name}` : ''
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
          color: 'rgba(226, 232, 240, 0.6)'
        },
        ticks: {
          callback: (value) => value + '%',
          font: { family: "'Plus Jakarta Sans', sans-serif" }
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: { family: "'Plus Jakarta Sans', sans-serif", weight: '500' }
        }
      }
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Spin size="large" tip="Loading academic performance..." />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto' }}>
      {/* Header Banner */}
      <Card
        className="apex-card"
        style={{ marginBottom: 24 }}
        bodyStyle={{ padding: '20px 24px' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: 'linear-gradient(135deg, #0b1b3d 0%, #1e3a8a 100%)',
                color: '#d4af37',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 22,
                boxShadow: '0 4px 12px rgba(11, 27, 61, 0.2)',
              }}
            >
              <LineChartOutlined />
            </div>
            <div>
              <Title level={4} style={{ margin: 0, color: '#0b1b3d', fontWeight: 800 }}>
                Academic Performance Analytics
              </Title>
              <Text style={{ color: '#64748b', fontSize: 13 }}>
                Monitor term exam scores, subject-wise trends, and overall academic standing
              </Text>
            </div>
          </div>

          <Button
            icon={<ReloadOutlined />}
            onClick={fetchPerformanceData}
            loading={loading}
            style={{ borderRadius: 8 }}
          >
            Refresh Data
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

      {/* 4 Statistics Cards */}
      <Row gutter={[20, 20]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="apex-card apex-card-gold-header" bodyStyle={{ padding: 20 }}>
            <Statistic
              title={<Text style={{ color: '#64748b', fontSize: 12, fontWeight: 700, textTransform: 'uppercase' }}>Exam Papers</Text>}
              value={totalPapers}
              prefix={<BookOutlined style={{ color: '#0b1b3d' }} />}
              valueStyle={{ color: '#0b1b3d', fontWeight: 800, fontSize: 22 }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="apex-card apex-card-gold-header" bodyStyle={{ padding: 20 }}>
            <Statistic
              title={<Text style={{ color: '#64748b', fontSize: 12, fontWeight: 700, textTransform: 'uppercase' }}>Marks Obtained</Text>}
              value={totalMarks}
              prefix={<RiseOutlined style={{ color: '#10b981' }} />}
              valueStyle={{ color: '#10b981', fontWeight: 800, fontSize: 22 }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="apex-card apex-card-gold-header" bodyStyle={{ padding: 20 }}>
            <Statistic
              title={<Text style={{ color: '#64748b', fontSize: 12, fontWeight: 700, textTransform: 'uppercase' }}>Average Score</Text>}
              value={averagePercentage}
              suffix="%"
              prefix={<PercentageOutlined style={{ color: '#f59e0b' }} />}
              valueStyle={{ color: '#f59e0b', fontWeight: 800, fontSize: 22 }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="apex-card apex-card-gold-header" bodyStyle={{ padding: 20 }}>
            <Statistic
              title={<Text style={{ color: '#64748b', fontSize: 12, fontWeight: 700, textTransform: 'uppercase' }}>Top Performing Subject</Text>}
              value={topSubject ? topSubject.percentage.toFixed(1) : 0}
              suffix={topSubject ? '%' : ''}
              prefix={<TrophyOutlined style={{ color: '#d4af37' }} />}
              valueStyle={{ color: '#d4af37', fontWeight: 800, fontSize: 22 }}
            />
            {topSubject && (
              <Text style={{ fontSize: 12, color: '#64748b', fontWeight: 600, display: 'block', marginTop: 2 }}>
                {topSubject.subject_name}
              </Text>
            )}
          </Card>
        </Col>
      </Row>

      {/* Main Performance Card with Tabs and Charts */}
      <Card
        className="apex-card"
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 0' }}>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: 'rgba(212, 175, 55, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d4af37', fontSize: 16 }}>
              <LineChartOutlined />
            </div>
            <div>
              <Title level={5} style={{ margin: 0, color: '#0b1b3d', fontWeight: 700 }}>
                Exam Assessment Breakdown
              </Title>
              <Text style={{ color: '#64748b', fontSize: 11 }}>Visual percentage curves and subject scores</Text>
            </div>
          </div>
        }
        extra={
          <Space wrap>
            <Text style={{ color: '#64748b', fontSize: 12 }}>Filter Category:</Text>
            <Select
              defaultValue="All"
              style={{ width: 180 }}
              onChange={setSelectedExamType}
              suffixIcon={<FilterOutlined />}
            >
              {examTypes.map((type, idx) => (
                <Option key={idx} value={type}>
                  {type}
                </Option>
              ))}
            </Select>
          </Space>
        }
      >
        {papers.length > 0 ? (
          <Tabs
            activeKey={activePaperTab || (papers[0] ?? '')}
            onChange={setActivePaperTab}
            type="card"
          >
            {papers.map((paper) => (
              <TabPane 
                tab={
                  <Space>
                    <BookOutlined />
                    {paper}
                  </Space>
                } 
                key={paper}
              >
                {/* Chart Container */}
                <div style={{ 
                  background: '#ffffff', 
                  borderRadius: 12, 
                  padding: '20px 24px', 
                  border: '1px solid #e2e8f0',
                  marginBottom: 24 
                }}>
                  <Title level={5} style={{ color: '#0b1b3d', marginBottom: 16 }}>
                    Score Trajectory — {paper}
                  </Title>
                  <div style={{ height: 280, position: 'relative' }}>
                    <Line data={lineChartData} options={lineChartOptions} />
                  </div>
                </div>

                {/* Subject-Wise Detailed Score Cards */}
                <Title level={5} style={{ color: '#0b1b3d', marginBottom: 16 }}>
                  Individual Subject Scores — {paper}
                </Title>
                <Row gutter={[16, 16]}>
                  {filteredData.map((item, index) => (
                    <Col xs={24} sm={12} lg={8} key={index}>
                      <Card 
                        hoverable 
                        className="apex-card" 
                        bodyStyle={{ padding: 18 }}
                      >
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                          <div>
                            <Text strong style={{ color: '#0b1b3d', fontSize: 15, display: 'block' }}>
                              {item.subject_name || 'Subject'}
                            </Text>
                            {item.teacher_name && (
                              <Text style={{ color: '#64748b', fontSize: 12 }}>
                                <UserOutlined /> {item.teacher_name}
                              </Text>
                            )}
                          </div>
                          <Tag 
                            color={item.percentage >= 80 ? 'green' : item.percentage >= 50 ? 'orange' : 'red'}
                            style={{ borderRadius: 10, fontWeight: 700, padding: '2px 8px' }}
                          >
                            {item.percentage.toFixed(1)}%
                          </Tag>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #f1f5f9', paddingTop: 10 }}>
                          <Text style={{ color: '#64748b', fontSize: 12 }}>Score Obtained</Text>
                          <Text strong style={{ color: '#0b1b3d', fontSize: 14 }}>
                            {item.obtained_marks} / {item.total_marks}
                          </Text>
                        </div>
                      </Card>
                    </Col>
                  ))}
                </Row>
              </TabPane>
            ))}
          </Tabs>
        ) : (
          <Empty 
            description="No examination records found for selected category" 
            style={{ padding: 40 }}
          />
        )}
      </Card>
    </div>
  );
};

export default PerformanceSection;