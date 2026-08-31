// src/pages/Students/GeneralAnnouncements.jsx
import React from 'react';
import { Modal, List, Typography, Tag, Avatar, Badge, Empty } from 'antd';
import { NotificationOutlined, ClockCircleOutlined, GlobalOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const GeneralAnnouncementsModal = ({ visible, onCancel, announcements = [] }) => {
  const filteredAnnouncements = announcements.filter(
    item => item.type === 'general' || !item.type || item.status === 'general'
  );

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: '#0b1b3d', color: '#d4af37', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <GlobalOutlined />
          </div>
          <span style={{ color: '#0b1b3d', fontWeight: 700 }}>General Campus Announcements</span>
        </div>
      }
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={750}
      centered
      destroyOnClose
    >
      {filteredAnnouncements.length === 0 ? (
        <Empty description="No general announcements found" style={{ padding: 30 }} />
      ) : (
        <List
          itemLayout="horizontal"
          dataSource={filteredAnnouncements}
          renderItem={(item) => (
            <List.Item style={{ padding: '14px 0', borderBottom: '1px solid #f1f5f9' }}>
              <List.Item.Meta
                avatar={
                  <Avatar 
                    icon={<NotificationOutlined />} 
                    style={{ backgroundColor: '#0b1b3d', color: '#d4af37' }} 
                  />
                }
                title={
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <Text strong style={{ color: '#0b1b3d', fontSize: 14 }}>
                      {item.announce_title || item.title}
                    </Text>
                    {item.status === 'urgent' && (
                      <Badge 
                        count="URGENT" 
                        style={{ backgroundColor: '#ef4444', fontSize: 10, fontWeight: 700 }} 
                      />
                    )}
                  </div>
                }
                description={
                  <div style={{ marginTop: 4 }}>
                    <Text style={{ color: '#475569', fontSize: 13, lineHeight: 1.5, display: 'block' }}>
                      {item.message || item.content || item.description}
                    </Text>
                    <div style={{ marginTop: 6 }}>
                      <Tag icon={<ClockCircleOutlined />} color="default" style={{ borderRadius: 6, fontSize: 11 }}>
                        {item.created_at || item.date || 'Recent'}
                      </Tag>
                      <Tag color="blue" style={{ borderRadius: 6, fontSize: 11 }}>PUBLIC</Tag>
                    </div>
                  </div>
                }
              />
            </List.Item>
          )}
        />
      )}
    </Modal>
  );
};

export default GeneralAnnouncementsModal;