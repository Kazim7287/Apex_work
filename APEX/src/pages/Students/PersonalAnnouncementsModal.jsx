// src/pages/Students/PersonalAnnouncementsModal.jsx
import React, { useState, useEffect } from 'react';
import { Modal, List, Typography, Tag, Avatar, Badge, Spin, Button, message, Space, Empty } from 'antd';
import { NotificationOutlined, ClockCircleOutlined, UserOutlined, ReloadOutlined } from '@ant-design/icons';

const { Text } = Typography;

const PersonalAnnouncementsModal = ({ visible, onCancel }) => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const studentId = localStorage.getItem('student_id');
  const API_BASE_URL = 'https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX';

  const fetchPersonalAnnouncements = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!studentId) {
        throw new Error('Student ID not found in localStorage');
      }

      const response = await fetch(`${API_BASE_URL}/get_student_announce.php?student_id=${studentId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
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
      fetchPersonalAnnouncements();
    }
  }, [visible]);

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: '#0b1b3d', color: '#d4af37', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <UserOutlined />
          </div>
          <span style={{ color: '#0b1b3d', fontWeight: 700 }}>Personal Student Announcements</span>
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
          <Spin size="large" tip="Loading personal notices..." />
        </div>
      ) : error ? (
        <div style={{ textAlign: 'center', padding: 24 }}>
          <Text type="danger">{error}</Text>
          <div style={{ marginTop: 12 }}>
            <Button type="primary" size="small" onClick={fetchPersonalAnnouncements}>
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
                    style={{ backgroundColor: item.status === 'urgent' ? '#ef4444' : '#8b5cf6', color: '#ffffff' }} 
                  />
                }
                title={
                  <Space>
                    <Text strong style={{ color: '#0b1b3d', fontSize: 14 }}>{item.announce_title}</Text>
                    {item.status === 'urgent' && (
                      <Badge count="URGENT" style={{ backgroundColor: '#ef4444', fontSize: 10 }} />
                    )}
                  </Space>
                }
                description={
                  <div style={{ marginTop: 4 }}>
                    <Text style={{ whiteSpace: 'pre-line', color: '#475569', fontSize: 13, lineHeight: 1.5, display: 'block' }}>
                      {item.description || item.message}
                    </Text>
                    <div style={{ marginTop: 6, display: 'flex', gap: 6 }}>
                      <Tag icon={<ClockCircleOutlined />} color="default" style={{ borderRadius: 6, fontSize: 11 }}>
                        {item.created_at || 'Recent'}
                      </Tag>
                      <Tag color="purple" style={{ borderRadius: 6, fontSize: 11 }}>PERSONAL</Tag>
                      {item.student_name && (
                        <Tag color="geekblue" style={{ borderRadius: 6, fontSize: 11 }}>For: {item.student_name}</Tag>
                      )}
                    </div>
                  </div>
                }
              />
            </List.Item>
          )}
        />
      ) : (
        <Empty description="No personal announcements found for your account" style={{ padding: 30 }} />
      )}
    </Modal>
  );
};

export default PersonalAnnouncementsModal;