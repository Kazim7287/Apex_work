// src/pages/Students/StudentAnnouncementsModal.jsx
import React, { useState, useEffect } from 'react';
import { Modal, List, Typography, Tag, Avatar, Badge, Space, Spin, Button, Empty } from 'antd';
import { NotificationOutlined, ClockCircleOutlined, TeamOutlined } from '@ant-design/icons';

const { Text } = Typography;

const StudentAnnouncementsModal = ({ visible, onCancel }) => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const API_BASE_URL = 'https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX';

  const fetchStudentAnnouncements = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}/all_students_announce_get.php`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.status === 'success' || data.success) {
        setAnnouncements(data.data || []);
      } else {
        setAnnouncements([]);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (visible) {
      fetchStudentAnnouncements();
    }
  }, [visible]);

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: '#0b1b3d', color: '#d4af37', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <TeamOutlined />
          </div>
          <span style={{ color: '#0b1b3d', fontWeight: 700 }}>Cohort Student Announcements</span>
        </div>
      }
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={750}
      centered
      destroyOnClose
    >
      {loading ? (
        <div style={{ textAlign: 'center', padding: 32 }}>
          <Spin size="large" tip="Loading student notices..." />
        </div>
      ) : error ? (
        <div style={{ textAlign: 'center', padding: 24 }}>
          <Text type="danger">{error}</Text>
          <div style={{ marginTop: 12 }}>
            <Button type="primary" size="small" onClick={fetchStudentAnnouncements}>
              Retry
            </Button>
          </div>
        </div>
      ) : announcements.length > 0 ? (
        <List
          itemLayout="horizontal"
          dataSource={announcements}
          renderItem={(item) => (
            <List.Item style={{ padding: '14px 0', borderBottom: '1px solid #f1f5f9' }}>
              <List.Item.Meta
                avatar={
                  <Avatar 
                    icon={<NotificationOutlined />} 
                    style={{ backgroundColor: item.status === 'urgent' ? '#ef4444' : '#10b981', color: '#ffffff' }} 
                  />
                }
                title={
                  <Space>
                    <Text strong style={{ color: '#0b1b3d', fontSize: 14 }}>
                      {item.announce_title || item.title}
                    </Text>
                    {item.status === 'urgent' && (
                      <Badge count="URGENT" style={{ backgroundColor: '#ef4444', fontSize: 10 }} />
                    )}
                  </Space>
                }
                description={
                  <div style={{ marginTop: 4 }}>
                    <Text style={{ whiteSpace: 'pre-line', color: '#475569', fontSize: 13, lineHeight: 1.5, display: 'block' }}>
                      {item.message || item.content || item.description}
                    </Text>
                    <div style={{ marginTop: 6, display: 'flex', gap: 6 }}>
                      <Tag icon={<ClockCircleOutlined />} color="default" style={{ borderRadius: 6, fontSize: 11 }}>
                        {item.created_at || item.date || 'Recent'}
                      </Tag>
                      <Tag color="green" style={{ borderRadius: 6, fontSize: 11 }}>STUDENT COHORT</Tag>
                      {item.department && (
                        <Tag color="blue" style={{ borderRadius: 6, fontSize: 11 }}>{item.department.toUpperCase()}</Tag>
                      )}
                    </div>
                  </div>
                }
              />
            </List.Item>
          )}
        />
      ) : (
        <Empty description="No cohort announcements found" style={{ padding: 30 }} />
      )}
    </Modal>
  );
};

export default StudentAnnouncementsModal;