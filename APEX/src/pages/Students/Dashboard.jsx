// src/pages/Students/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import { 
  Card, 
  Typography, 
  List, 
  Space, 
  Spin, 
  Alert, 
  Button, 
  Badge, 
  Row, 
  Col, 
  Tag,
  Tooltip
} from 'antd';
import {
  ClockCircleOutlined,
  NotificationOutlined,
  LineChartOutlined,
  CalendarOutlined,
  FileTextOutlined,
  DollarOutlined,
  StarOutlined,
  ArrowRightOutlined,
  ScheduleOutlined,
  ReloadOutlined
} from '@ant-design/icons';

dayjs.extend(duration);

const { Title, Text } = Typography;

const StudentDashboard = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentTime, setCurrentTime] = useState(dayjs());
  const [nextEvent, setNextEvent] = useState(null);

  const studentId = localStorage.getItem('student_id');
  const API_BASE_URL = 'https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX';

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}/get_events.php`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to load events');
      }

      const eventsData = Array.isArray(data.data) ? data.data : (Array.isArray(data) ? data : [data.data]);
      
      const formattedEvents = eventsData
        .filter(event => event && event.event_date && event.event_time)
        .map(event => ({
          ...event,
          dateTime: dayjs(`${event.event_date} ${event.event_time}`),
          formattedDate: dayjs(event.event_date).format('MMMM D, YYYY'),
          formattedTime: dayjs(event.event_time, 'HH:mm:ss').format('h:mm A')
        }));
      
      setEvents(formattedEvents);
    } catch (err) {
      console.error('Error fetching events:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // Update current time every second for countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(dayjs());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Calculate next upcoming event
  useEffect(() => {
    if (events.length > 0) {
      const now = dayjs();
      const upcoming = events
        .filter(event => event.dateTime.isAfter(now))
        .sort((a, b) => a.dateTime.diff(b.dateTime))[0];
      setNextEvent(upcoming || null);
    }
  }, [events, currentTime]);

  const formatCountdown = () => {
    if (!nextEvent) return "No upcoming events scheduled";
    
    const diff = dayjs.duration(nextEvent.dateTime.diff(currentTime));
    if (diff.asSeconds() <= 0) return `${nextEvent.event_name} is happening now!`;
    
    const days = Math.floor(diff.asDays());
    const hours = diff.hours();
    const minutes = diff.minutes();
    const seconds = diff.seconds();

    return `${days > 0 ? `${days}d ` : ''}${hours}h ${minutes}m ${seconds}s until ${nextEvent.event_name}`;
  };

  // Filter upcoming events (next 7 days)
  const upcomingEvents = events.filter(event => 
    event.dateTime.isAfter(currentTime) && 
    event.dateTime.isBefore(currentTime.add(7, 'day'))
  ).slice(0, 4);

  // Filter recent events (past 7 days)
  const recentEvents = events.filter(event => 
    event.dateTime.isBefore(currentTime) && 
    event.dateTime.isAfter(currentTime.subtract(7, 'day'))
  ).slice(0, 4);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Spin size="large" tip="Loading student dashboard..." />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto' }}>
      {error && (
        <Alert
          message="Notice"
          description={error}
          type="warning"
          showIcon
          closable
          style={{ marginBottom: 24, borderRadius: 12 }}
          action={
            <Button size="small" type="primary" onClick={fetchEvents}>
              Retry
            </Button>
          }
        />
      )}

      {/* Top Quick Stats Grid */}
      <Row gutter={[20, 20]} style={{ marginBottom: 28 }}>
        {/* Applications Card */}
        <Col xs={24} sm={12} lg={6}>
          <Card 
            hoverable 
            className="apex-card apex-card-gold-header"
            style={{ height: '100%' }}
            bodyStyle={{ padding: 24 }}
          >
            <Link to="/student/assignments" style={{ textDecoration: 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <Text style={{ color: '#64748b', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Student Requests
                  </Text>
                  <Title level={3} style={{ margin: '6px 0 0 0', color: '#0b1b3d', fontWeight: 800 }}>
                    Applications
                  </Title>
                  <Text style={{ color: '#3b82f6', fontSize: 12, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 8 }}>
                    Submit Request <ArrowRightOutlined />
                  </Text>
                </div>
                <div className="apex-stat-icon" style={{ background: 'linear-gradient(135deg, #0b1b3d 0%, #1e3a8a 100%)', color: '#d4af37', boxShadow: '0 8px 16px rgba(11, 27, 61, 0.2)' }}>
                  <FileTextOutlined />
                </div>
              </div>
            </Link>
          </Card>
        </Col>

        {/* Performance Card */}
        <Col xs={24} sm={12} lg={6}>
          <Card 
            hoverable 
            className="apex-card apex-card-gold-header"
            style={{ height: '100%' }}
            bodyStyle={{ padding: 24 }}
          >
            <Link to="/student/performance" style={{ textDecoration: 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <Text style={{ color: '#64748b', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Academics
                  </Text>
                  <Title level={3} style={{ margin: '6px 0 0 0', color: '#0b1b3d', fontWeight: 800 }}>
                    Performance
                  </Title>
                  <Text style={{ color: '#10b981', fontSize: 12, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 8 }}>
                    View Analytics <ArrowRightOutlined />
                  </Text>
                </div>
                <div className="apex-stat-icon" style={{ background: 'linear-gradient(135deg, #10b981 0%, #047857 100%)', color: '#ffffff', boxShadow: '0 8px 16px rgba(16, 185, 129, 0.25)' }}>
                  <LineChartOutlined />
                </div>
              </div>
            </Link>
          </Card>
        </Col>

        {/* Fee Dues Card */}
        <Col xs={24} sm={12} lg={6}>
          <Card 
            hoverable 
            className="apex-card apex-card-gold-header"
            style={{ height: '100%' }}
            bodyStyle={{ padding: 24 }}
          >
            <Link to="/student/exams" style={{ textDecoration: 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <Text style={{ color: '#64748b', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Financials
                  </Text>
                  <Title level={3} style={{ margin: '6px 0 0 0', color: '#0b1b3d', fontWeight: 800 }}>
                    Fee Dues
                  </Title>
                  <Text style={{ color: '#d4af37', fontSize: 12, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 8 }}>
                    View Ledger <ArrowRightOutlined />
                  </Text>
                </div>
                <div className="apex-stat-icon" style={{ background: 'linear-gradient(135deg, #d4af37 0%, #b8860b 100%)', color: '#ffffff', boxShadow: '0 8px 16px rgba(212, 175, 55, 0.25)' }}>
                  <DollarOutlined />
                </div>
              </div>
            </Link>
          </Card>
        </Col>

        {/* Attendance Card */}
        <Col xs={24} sm={12} lg={6}>
          <Card 
            hoverable 
            className="apex-card apex-card-gold-header"
            style={{ height: '100%' }}
            bodyStyle={{ padding: 24 }}
          >
            <Link to="/student/attendance" style={{ textDecoration: 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <Text style={{ color: '#64748b', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Presence
                  </Text>
                  <Title level={3} style={{ margin: '6px 0 0 0', color: '#0b1b3d', fontWeight: 800 }}>
                    Attendance
                  </Title>
                  <Text style={{ color: '#8b5cf6', fontSize: 12, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 8 }}>
                    Check Summary <ArrowRightOutlined />
                  </Text>
                </div>
                <div className="apex-stat-icon" style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)', color: '#ffffff', boxShadow: '0 8px 16px rgba(139, 92, 246, 0.25)' }}>
                  <CalendarOutlined />
                </div>
              </div>
            </Link>
          </Card>
        </Col>
      </Row>

      {/* Countdown Ribbon Section */}
      <Card 
        className="apex-card" 
        style={{ marginBottom: 28, overflow: 'hidden' }}
        bodyStyle={{ padding: 0 }}
      >
        <div style={{ 
          background: 'linear-gradient(135deg, #061129 0%, #0b1b3d 50%, #1e3a8a 100%)', 
          padding: '24px 28px',
          color: '#ffffff',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ 
              width: 50, 
              height: 50, 
              borderRadius: 14, 
              background: 'rgba(212, 175, 55, 0.15)', 
              border: '1px solid rgba(212, 175, 55, 0.3)',
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              color: '#d4af37',
              fontSize: 24,
              flexShrink: 0
            }}>
              <ClockCircleOutlined />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Text style={{ color: '#d4af37', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>
                  Next Campus Event
                </Text>
                <Tag color="gold" style={{ borderRadius: 10, fontSize: 10, padding: '0 8px', fontWeight: 700 }}>
                  LIVE COUNTDOWN
                </Tag>
              </div>
              <Title level={4} style={{ color: '#ffffff', margin: '4px 0 0 0', fontWeight: 700 }}>
                {nextEvent ? nextEvent.event_name : 'No scheduled events right now'}
              </Title>
            </div>
          </div>

          <div style={{ 
            background: 'rgba(255, 255, 255, 0.08)', 
            padding: '10px 20px', 
            borderRadius: 12, 
            border: '1px solid rgba(212, 175, 55, 0.25)',
            backdropFilter: 'blur(8px)'
          }}>
            <Text strong style={{ color: '#ffffff', fontSize: 16, letterSpacing: '0.5px' }}>
              {formatCountdown()}
            </Text>
          </div>
        </div>
      </Card>

      {/* Events Section: Upcoming & Recent */}
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={12}>
          <Card 
            className="apex-card"
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 0' }}>
                <div style={{ width: 34, height: 34, borderRadius: 8, background: 'rgba(212, 175, 55, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d4af37', fontSize: 16 }}>
                  <CalendarOutlined />
                </div>
                <div>
                  <Title level={5} style={{ margin: 0, color: '#0b1b3d', fontWeight: 700 }}>
                    Upcoming Events (Next 7 Days)
                  </Title>
                  <Text style={{ color: '#64748b', fontSize: 11 }}>Campus activities & lectures</Text>
                </div>
              </div>
            }
            extra={
              <Button type="text" icon={<ReloadOutlined />} onClick={fetchEvents} size="small" />
            }
          >
            <List
              itemLayout="horizontal"
              dataSource={upcomingEvents}
              locale={{ emptyText: 'No upcoming events in the next week' }}
              renderItem={(event) => (
                <List.Item style={{ padding: '14px 0', borderBottom: '1px solid #f1f5f9' }}>
                  <List.Item.Meta
                    avatar={
                      <div style={{
                        width: 44,
                        height: 44,
                        borderRadius: 10,
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#0b1b3d',
                        fontWeight: 700,
                        fontSize: 12
                      }}>
                        <span style={{ fontSize: 9, color: '#64748b', textTransform: 'uppercase' }}>
                          {dayjs(event.dateTime).format('MMM')}
                        </span>
                        <span>{dayjs(event.dateTime).format('DD')}</span>
                      </div>
                    }
                    title={
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Text strong style={{ color: '#0f172a', fontSize: 14 }}>
                          {event.event_name}
                        </Text>
                        <Tag color="blue" style={{ borderRadius: 6, fontSize: 10 }}>
                          {event.formattedTime}
                        </Tag>
                      </div>
                    }
                    description={
                      <Text style={{ color: '#64748b', fontSize: 12, display: 'block', marginTop: 2 }}>
                        {event.event_description || 'No description provided.'}
                      </Text>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card 
            className="apex-card"
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 0' }}>
                <div style={{ width: 34, height: 34, borderRadius: 8, background: 'rgba(59, 130, 246, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6', fontSize: 16 }}>
                  <NotificationOutlined />
                </div>
                <div>
                  <Title level={5} style={{ margin: 0, color: '#0b1b3d', fontWeight: 700 }}>
                    Recent Events (Past 7 Days)
                  </Title>
                  <Text style={{ color: '#64748b', fontSize: 11 }}>Recently completed milestones</Text>
                </div>
              </div>
            }
          >
            <List
              itemLayout="horizontal"
              dataSource={recentEvents}
              locale={{ emptyText: 'No recent events recorded' }}
              renderItem={(event) => (
                <List.Item style={{ padding: '14px 0', borderBottom: '1px solid #f1f5f9' }}>
                  <List.Item.Meta
                    avatar={
                      <div style={{
                        width: 44,
                        height: 44,
                        borderRadius: 10,
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#64748b',
                        fontWeight: 700,
                        fontSize: 12
                      }}>
                        <span style={{ fontSize: 9, color: '#94a3b8', textTransform: 'uppercase' }}>
                          {dayjs(event.dateTime).format('MMM')}
                        </span>
                        <span>{dayjs(event.dateTime).format('DD')}</span>
                      </div>
                    }
                    title={
                      <Text strong style={{ color: '#334155', fontSize: 14 }}>
                        {event.event_name}
                      </Text>
                    }
                    description={
                      <Text style={{ color: '#94a3b8', fontSize: 12, display: 'block', marginTop: 2 }}>
                        {event.formattedDate} • {event.formattedTime}
                      </Text>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default StudentDashboard;