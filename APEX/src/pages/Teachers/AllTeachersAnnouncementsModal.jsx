import React, { useState, useEffect } from 'react';
import { 
  Modal, 
  List, 
  Spin, 
  message, 
  Typography, 
  Space, 
  Tag, 
  Avatar,
  Grid,
  ConfigProvider,
  theme,
  Button
} from 'antd';
import { 
  ClockCircleOutlined, 
  ExclamationCircleOutlined, 
  NotificationOutlined,
  UserOutlined,
  TeamOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import styled from 'styled-components';

const { Text } = Typography;
const { useBreakpoint } = Grid;

const StyledModal = styled(Modal)`
  .ant-modal-content {
    border-radius: 14px;
    padding: 0;
    overflow: hidden;
    border: 1px solid #e2e8f0;
    box-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.1);
  }

  .ant-modal-header {
    background: #061129;
    padding: 18px 24px;
    margin: 0;
    border-bottom: 1px solid rgba(212, 175, 55, 0.2);

    .ant-modal-title {
      color: #ffffff;
      font-size: 18px;
      font-weight: 600;
    }
  }

  .ant-modal-close {
    color: #94a3b8;
    top: 18px;
    right: 20px;

    &:hover {
      color: #ffffff;
      background: rgba(255, 255, 255, 0.1);
    }
  }

  .ant-modal-body {
    padding: 20px 24px;
    background: #f8fafc;
    max-height: 75vh;
    overflow-y: auto;

    @media (max-width: 576px) {
      padding: 16px;
    }
  }
`;

const ListItemWrapper = styled(List.Item)`
  background: #ffffff;
  border: 1px solid #e2e8f0 !important;
  border-radius: 10px;
  padding: 16px !important;
  margin-bottom: 12px;
  transition: all 0.2s ease;

  &:hover {
    border-color: rgba(212, 175, 55, 0.4) !important;
    box-shadow: 0 4px 12px rgba(15, 23, 42, 0.03);
  }
`;

const AllTeachersAnnouncementsModal = ({ visible, onCancel }) => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const screens = useBreakpoint();

  const fetchAllTeachersAnnouncements = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/All_teacher_announce_read.php');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.status === 'success') {
        setAnnouncements(data.data || []);
      } else {
        throw new Error(data.message || 'Failed to fetch all teachers announcements');
      }
    } catch (err) {
      const errorMsg = err.message || 'Network error. Please try again.';
      setError(errorMsg);
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (visible) {
      fetchAllTeachersAnnouncements();
    }
  }, [visible]);

  const getStatusTag = (status) => {
    if (!status) return <Tag icon={<NotificationOutlined />} color="success">General</Tag>;
    
    switch(status.toLowerCase()) {
      case 'urgent':
        return <Tag icon={<ExclamationCircleOutlined />} color="error">Urgent</Tag>;
      case 'academic':
        return <Tag icon={<NotificationOutlined />} color="processing">Academic</Tag>;
      default:
        return <Tag icon={<NotificationOutlined />} color="success">General</Tag>;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No date';
    
    try {
      const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
      return new Date(dateString).toLocaleDateString(undefined, options);
    } catch (err) {
      return 'Invalid date';
    }
  };

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
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
        },
      }}
    >
      <StyledModal
        title={
          <Space size="middle">
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: 'rgba(212, 175, 55, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#d4af37'
              }}
            >
              <TeamOutlined />
            </div>
            <span style={{ color: '#ffffff' }}>All Faculty Announcements</span>
          </Space>
        }
        open={visible}
        onCancel={onCancel}
        footer={null}
        width={screens.xs ? '92%' : 800}
      >
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <Spin size="large" />
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <Text type="danger" style={{ display: 'block', marginBottom: 16 }}>
              {error}
            </Text>
            <Button
              icon={<ReloadOutlined />}
              onClick={fetchAllTeachersAnnouncements}
              style={{
                background: 'linear-gradient(135deg, #091838 0%, #061129 100%)',
                borderColor: '#061129',
                color: '#ffffff'
              }}
            >
              Try Again
            </Button>
          </div>
        ) : (
          <List
            itemLayout="vertical"
            size="large"
            dataSource={announcements}
            renderItem={(announcement) => (
              <ListItemWrapper
                key={announcement.id}
                extra={
                  !screens.xs && (
                    <Space style={{ color: '#64748b' }}>
                      <ClockCircleOutlined />
                      <Text style={{ color: '#64748b', fontSize: 13 }}>
                        {formatDate(announcement.date || announcement.created_at)}
                      </Text>
                    </Space>
                  )
                }
              >
                <List.Item.Meta
                  avatar={
                    <Avatar
                      icon={<UserOutlined />}
                      style={{
                        backgroundColor: '#fef3c7',
                        color: '#d4af37',
                        border: '1px solid rgba(212, 175, 55, 0.3)'
                      }}
                    />
                  }
                  title={
                    <Space
                      direction={screens.xs ? 'vertical' : 'horizontal'}
                      align={screens.xs ? 'start' : 'center'}
                      wrap
                    >
                      {getStatusTag(announcement.status)}
                      <Text strong style={{ fontSize: 15, color: '#0f172a' }}>
                        {announcement.announce_title || announcement.title || 'Untitled Announcement'}
                      </Text>
                      {announcement.teacher_id && (
                        <Tag style={{ background: '#f1f5f9', borderColor: '#cbd5e1', color: '#475569' }}>
                          Teacher ID: {announcement.teacher_id}
                        </Tag>
                      )}
                    </Space>
                  }
                  description={
                    <div style={{ marginTop: 8 }}>
                      <Text style={{ whiteSpace: 'pre-line', color: '#334155', lineHeight: '1.6' }}>
                        {announcement.description || announcement.message || 'No content available'}
                      </Text>
                      {screens.xs && (
                        <div style={{ marginTop: 10, color: '#64748b' }}>
                          <ClockCircleOutlined style={{ marginRight: 6 }} />
                          <Text style={{ color: '#64748b', fontSize: 12 }}>
                            {formatDate(announcement.date || announcement.created_at)}
                          </Text>
                        </div>
                      )}
                    </div>
                  }
                />
              </ListItemWrapper>
            )}
            locale={{ emptyText: 'No faculty announcements found.' }}
          />
        )}
      </StyledModal>
    </ConfigProvider>
  );
};

export default AllTeachersAnnouncementsModal;