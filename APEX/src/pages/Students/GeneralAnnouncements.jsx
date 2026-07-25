/* eslint-disable react/prop-types */
import { Modal, List, Typography, Tag, Avatar, Badge } from 'antd';
import { NotificationOutlined, ClockCircleOutlined } from '@ant-design/icons';

const { Text } = Typography;

const GeneralAnnouncementsModal = ({ visible, onCancel, announcements }) => {
  const filteredAnnouncements = announcements.filter(
    item => item.type === 'general' || !item.type
  );

  return (
    <Modal
      title="General Announcements"
      visible={visible}
      onCancel={onCancel}
      footer={null}
      width={800}
    >
      <List
        itemLayout="horizontal"
        dataSource={filteredAnnouncements}
        renderItem={(item) => (
          <List.Item>
            <List.Item.Meta
              avatar={
                <Avatar 
                  icon={<NotificationOutlined />} 
                  style={{ backgroundColor: '#1890ff' }} 
                />
              }
              title={
                <>
                  <Text strong>{item.announce_title || item.title}</Text>
                  {item.status === 'urgent' && (
                    <Badge 
                      count="URGENT" 
                      style={{ 
                        backgroundColor: '#ff4d4f',
                        marginLeft: 8,
                        fontSize: 10
                      }} 
                    />
                  )}
                </>
              }
              description={
                <>
                  <Text>{item.message || item.content}</Text>
                  <div style={{ marginTop: 8 }}>
                    <Tag icon={<ClockCircleOutlined />} color="default">
                      {item.created_at || item.date}
                    </Tag>
                  </div>
                </>
              }
            />
          </List.Item>
        )}
      />
    </Modal>
  );
};

export default GeneralAnnouncementsModal;