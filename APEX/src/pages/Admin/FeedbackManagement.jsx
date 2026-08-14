import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  Table,
  Tag,
  Button,
  Modal,
  message,
  Typography,
  Space,
  Input,
  Select,
  Avatar,
  Tooltip
} from 'antd';
import {
  EyeOutlined,
  SearchOutlined,
  SyncOutlined,
  MailOutlined,
  UserOutlined,
  EditOutlined,
  MessageOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;

const FeedbackManagement = () => {
  const [feedbackList, setFeedbackList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [isStatusModalVisible, setIsStatusModalVisible] = useState(false);
  const [currentStatus, setCurrentStatus] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [filters, setFilters] = useState({
    status: null,
    search: '',
  });

  const getInitial = (name) => {
    if (!name) return '';
    return name.charAt(0).toUpperCase();
  };

  const fetchFeedback = useCallback(async () => {
    setLoading(true);
    try {
      const { current: page, pageSize: limit } = pagination;
      const { status, search } = filters;

      const params = new URLSearchParams();
      params.append('page', page);
      params.append('limit', limit);
      if (status) params.append('status', status);
      if (search) params.append('search', search);

      const response = await fetch(`https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/GetAdminFeed.php?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch feedback');
      }

      const data = await response.json();

      if (data.status !== 'success') {
        throw new Error(data.message || 'Invalid response from server');
      }

      const { feedback, pagination: paginationData } = data.data;

      setFeedbackList(feedback);
      setPagination(prev => ({
        ...prev,
        total: paginationData.total,
      }));

    } catch (error) {
      console.error('Error fetching feedback:', error);
      message.error(error.message || 'Failed to load feedback');
      setFeedbackList([]);
    } finally {
      setLoading(false);
    }
  }, [pagination.current, pagination.pageSize, filters]);

  useEffect(() => {
    fetchFeedback();
  }, [fetchFeedback]);

  const handleUpdateStatus = async () => {
    if (!selectedFeedback || !currentStatus) return;

    setUpdatingStatus(true);
    try {
      const response = await fetch('https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/UpdateFeed.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          feedback_id: selectedFeedback.id,
          status: currentStatus,
        }),
      });

      const data = await response.json();

      if (data.status !== 'success') {
        throw new Error(data.message || 'Failed to update status');
      }

      message.success(data.message || 'Status updated successfully');
      setIsStatusModalVisible(false);
      fetchFeedback();

    } catch (error) {
      console.error('Error updating status:', error);
      message.error(error.message || 'Failed to update status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const openViewModal = (record) => {
    setSelectedFeedback(record);
    setIsViewModalVisible(true);
  };

  const openStatusModal = (record) => {
    setSelectedFeedback(record);
    setCurrentStatus(record.status);
    setIsStatusModalVisible(true);
  };

  const columns = [
    {
      title: 'Sender',
      dataIndex: 'name',
      key: 'name',
      render: (name, record) => (
        <Space>
          <Avatar style={{ background: '#0b1b3d', color: '#d4af37', fontWeight: 700 }}>
            {getInitial(name)}
          </Avatar>
          <div>
            <Text strong style={{ color: '#0f172a', display: 'block', lineHeight: 1.2 }}>{name}</Text>
            <Text style={{ fontSize: 11, color: '#64748b' }}>{record.email}</Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Subject',
      dataIndex: 'subject',
      key: 'subject',
      render: (subject) => <Text strong style={{ color: '#1e3a8a' }}>{subject}</Text>
    },
    {
      title: 'Date Received',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => date ? new Date(date).toLocaleString() : 'N/A'
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      align: 'center',
      render: (status) => {
        let color = 'gold';
        if (status === 'resolved') color = 'green';
        if (status === 'in_progress') color = 'blue';
        return <Tag color={color} style={{ borderRadius: 12, textTransform: 'capitalize', padding: '2px 10px' }}>{status}</Tag>;
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      align: 'center',
      width: 140,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="View Message">
            <Button
              type="primary"
              icon={<EyeOutlined />}
              onClick={() => openViewModal(record)}
              size="small"
              style={{ background: '#0b1b3d', borderRadius: 6 }}
            />
          </Tooltip>
          <Tooltip title="Update Status">
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => openStatusModal(record)}
              size="small"
              className="apex-btn-gold"
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto' }}>
      <Card
        className="apex-card"
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: 'linear-gradient(135deg, #0b1b3d 0%, #1e3a8a 100%)', color: '#d4af37', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
              <MessageOutlined />
            </div>
            <div>
              <Title level={4} style={{ margin: 0, color: '#0b1b3d', fontWeight: 700 }}>
                Public Website Enquiries & Feedback
              </Title>
              <Text style={{ color: '#64748b', fontSize: 12 }}>Review messages submitted through the public website contact form</Text>
            </div>
          </div>
        }
        extra={
          <Space wrap>
            <Input
              placeholder="Search sender or subject..."
              prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              allowClear
              style={{ width: 220, borderRadius: 8 }}
            />
            <Select
              placeholder="Filter Status"
              value={filters.status}
              onChange={(val) => setFilters(prev => ({ ...prev, status: val }))}
              allowClear
              style={{ width: 140, borderRadius: 8 }}
            >
              <Option value="new">New</Option>
              <Option value="in_progress">In Progress</Option>
              <Option value="resolved">Resolved</Option>
            </Select>
            <Button type="text" icon={<SyncOutlined />} onClick={fetchFeedback} loading={loading} style={{ borderRadius: 8 }} />
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={feedbackList}
          rowKey="id"
          loading={loading}
          scroll={{ x: 'max-content' }}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            onChange: (page, pageSize) => setPagination(prev => ({ ...prev, current: page, pageSize })),
            showTotal: (total) => `Total ${total} feedback messages`
          }}
        />
      </Card>

      {/* View Message Modal */}
      <Modal
  title={
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <Avatar
        style={{
          background: '#0b1b3d',
          color: '#d4af37',
          fontWeight: 700
        }}
      >
        {getInitial(selectedFeedback?.name)}
      </Avatar>

      <div>
        <div
          style={{
            fontSize: 16,
            fontWeight: 700,
            color: '#0b1b3d'
          }}
        >
          {selectedFeedback?.name || 'Unknown User'}
        </div>

        <div
          style={{
            fontSize: 12,
            color: '#64748b'
          }}
        >
          {selectedFeedback?.email || 'No email available'}
        </div>
      </div>
    </div>
  }
  open={isViewModalVisible}
  onCancel={() => setIsViewModalVisible(false)}
  footer={[
    <Button
      key="close"
      onClick={() => setIsViewModalVisible(false)}
      style={{ borderRadius: 8 }}
    >
      Close
    </Button>
  ]}
  width={600}
  centered
>
  {selectedFeedback && (
    <div style={{ paddingTop: 16 }}>

      {/* SUBJECT */}
      <div style={{ marginBottom: 18 }}>
        <Text
          strong
          style={{
            display: 'block',
            color: '#64748b',
            fontSize: 12,
            marginBottom: 6,
            textTransform: 'uppercase',
            letterSpacing: 0.5
          }}
        >
          Subject
        </Text>

        <div
          style={{
            padding: '12px 14px',
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: 8,
            color: '#0b1b3d',
            fontSize: 15,
            fontWeight: 600
          }}
        >
          {selectedFeedback.subject ||
            selectedFeedback.title ||
            'No subject provided'}
        </div>
      </div>

      {/* ACTUAL USER MESSAGE */}
      <div>
        <Text
          strong
          style={{
            display: 'block',
            color: '#64748b',
            fontSize: 12,
            marginBottom: 6,
            textTransform: 'uppercase',
            letterSpacing: 0.5
          }}
        >
          Message
        </Text>

        <Card
          size="small"
          style={{
            background: '#ffffff',
            borderRadius: 8,
            border: '1px solid #e2e8f0'
          }}
        >
          <div
            style={{
              color: '#334155',
              fontSize: 14,
              lineHeight: 1.7,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word'
            }}
          >
            {selectedFeedback.message ||
              selectedFeedback.feedback ||
              selectedFeedback.description ||
              selectedFeedback.content ||
              'No message provided.'}
          </div>
        </Card>
      </div>

    </div>
  )}
</Modal>
      {/* Update Status Modal */}
      <Modal
        title="Update Feedback Status"
        open={isStatusModalVisible}
        onOk={handleUpdateStatus}
        onCancel={() => setIsStatusModalVisible(false)}
        confirmLoading={updatingStatus}
        okText="Update Status"
        okButtonProps={{ className: 'apex-btn-gold' }}
        centered
      >
        <div style={{ paddingTop: 12 }}>
          <Text strong style={{ display: 'block', marginBottom: 8 }}>Select New Status:</Text>
          <Select
            value={currentStatus}
            onChange={setCurrentStatus}
            style={{ width: '100%', borderRadius: 8 }}
          >
            <Option value="new">New</Option>
            <Option value="in_progress">In Progress</Option>
            <Option value="resolved">Resolved</Option>
          </Select>
        </div>
      </Modal>
    </div>
  );
};

export default FeedbackManagement;