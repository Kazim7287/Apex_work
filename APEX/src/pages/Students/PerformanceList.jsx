// src/pages/Students/PerformanceList.jsx
import React from 'react';
import { Card, Typography, Row, Col, Progress, Tag } from 'antd';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title as ChartTitle,
  Tooltip,
  Legend,
} from 'chart.js';
import { LineChartOutlined, BookOutlined } from '@ant-design/icons';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ChartTitle,
  Tooltip,
  Legend
);

const { Title, Text } = Typography;

const performanceData = [
  { subject: 'Mathematics', score: 85, total: 100 },
  { subject: 'Physics & Sciences', score: 90, total: 100 },
  { subject: 'English Language', score: 88, total: 100 },
  { subject: 'Computer Science', score: 94, total: 100 },
];

const chartData = {
  labels: performanceData.map(item => item.subject),
  datasets: [
    {
      label: 'Score Percentage (%)',
      data: performanceData.map(item => item.score),
      backgroundColor: ['#0b1b3d', '#d4af37', '#10b981', '#3b82f6'],
      borderRadius: 8,
      borderWidth: 0
    },
  ],
};

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
      labels: {
        font: { family: "'Plus Jakarta Sans', sans-serif", weight: '600' }
      }
    },
    tooltip: {
      backgroundColor: '#061129',
      titleFont: { family: "'Plus Jakarta Sans', sans-serif", weight: 'bold' },
      bodyFont: { family: "'Plus Jakarta Sans', sans-serif" },
      padding: 12,
      borderColor: '#d4af37',
      borderWidth: 1
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      max: 100,
      grid: { color: 'rgba(226, 232, 240, 0.6)' },
      ticks: { callback: (v) => v + '%' }
    },
    x: {
      grid: { display: false }
    }
  }
};

const PerformanceList = () => {
  return (
    <div style={{ maxWidth: 1400, margin: '0 auto' }}>
      {/* Header Banner */}
      <Card
        className="apex-card"
        style={{ marginBottom: 24 }}
        bodyStyle={{ padding: '20px 24px' }}
      >
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
              Performance Analytics Breakdown
            </Title>
            <Text style={{ color: '#64748b', fontSize: 13 }}>
              Subject benchmark distributions and academic progress charts
            </Text>
          </div>
        </div>
      </Card>

      <Row gutter={[24, 24]}>
        {/* Chart Card */}
        <Col xs={24} lg={14}>
          <Card 
            className="apex-card"
            title={
              <Title level={5} style={{ margin: 0, color: '#0b1b3d', fontWeight: 700 }}>
                Subject Score Overview
              </Title>
            }
          >
            <div style={{ height: 320, position: 'relative' }}>
              <Bar data={chartData} options={chartOptions} />
            </div>
          </Card>
        </Col>

        {/* Subject Score Breakdown */}
        <Col xs={24} lg={10}>
          <Card 
            className="apex-card"
            title={
              <Title level={5} style={{ margin: 0, color: '#0b1b3d', fontWeight: 700 }}>
                Subject Proficiency Breakdown
              </Title>
            }
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {performanceData.map((item, index) => (
                <div key={index} style={{ padding: '12px 16px', background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <Text strong style={{ color: '#0b1b3d', fontSize: 14 }}>
                      <BookOutlined style={{ color: '#1e3a8a', marginRight: 6 }} />
                      {item.subject}
                    </Text>
                    <Tag color="gold" style={{ borderRadius: 8, fontWeight: 700 }}>
                      {item.score} / {item.total}
                    </Tag>
                  </div>
                  <Progress 
                    percent={item.score} 
                    strokeColor={{ '0%': '#1e3a8a', '100%': '#d4af37' }}
                    size="small"
                  />
                </div>
              ))}
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default PerformanceList;
