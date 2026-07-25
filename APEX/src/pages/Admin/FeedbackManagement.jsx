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
  Divider,
  Input,
  Select,
  Avatar
} from 'antd';
import {
  EyeOutlined,
  SearchOutlined,
  SyncOutlined,
  MailOutlined,
  UserOutlined,
  EditOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;

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

  const handleViewFeedback = (feedback) => {
    setSelectedFeedback(feedback);
    setIsViewModalVisible(true);
  };

  const handleStatusUpdateClick = (feedback) => {
    setSelectedFeedback(feedback);
    setCurrentStatus(feedback.status);
    setIsStatusModalVisible(true);
  };

  const updateFeedbackStatus = async () => {
    if (!selectedFeedback || !currentStatus) return;
    
    setUpdatingStatus(true);
    try {
      const response = await fetch('https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/adminresponse.php', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: selectedFeedback.id,
          status: currentStatus
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to update status');
      }

      message.success('Status updated successfully');
      fetchFeedback();
      setIsStatusModalVisible(false);
    } catch (error) {
      console.error('Error updating status:', error);
      message.error(error.message || 'Failed to update status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleTableChange = (newPagination, newFilters) => {
    setPagination(prev => ({
      ...prev,
      current: newPagination.current,
      pageSize: newPagination.pageSize,
    }));

    setFilters(prev => ({
      ...prev,
      status: newFilters.status?.[0] || null,
    }));
  };

  const handleSearch = (value) => {
    setFilters(prev => ({ ...prev, search: value }));
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  const handleStatusFilterChange = (value) => {
    setFilters(prev => ({ ...prev, status: value }));
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  const handleRefresh = () => {
    fetchFeedback();
  };

  const getStatusTag = (status) => {
    const statusMap = {
      'pending': { color: 'orange', text: 'Pending' },
      'resolved': { color: 'green', text: 'Resolved' },
      'reviewed': { color: 'blue', text: 'Reviewed' },
      'archived': { color: 'gray', text: 'Archived' },
      'rejected': { color: 'red', text: 'Rejected' },
    };

    const normalizedStatus = status?.toLowerCase();
    const statusInfo = statusMap[normalizedStatus] || { color: 'default', text: status };

    return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>;
  };

  const statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'reviewed', label: 'Reviewed' },
    { value: 'resolved', label: 'Resolved' },
    { value: 'archived', label: 'Archived' },
    { value: 'rejected', label: 'Rejected' },
  ];

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: true,
      render: (name, record) => (
        <Space>
          <Avatar style={{ backgroundColor: '#1890ff' }}>{getInitial(name)}</Avatar>
          <span>{name}</span>
        </Space>
      ),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      sorter: true,
      render: (email) => (
        <a href={`mailto:${email}`} style={{ display: 'flex', alignItems: 'center' }}>
          <MailOutlined style={{ marginRight: 8 }} />
          {email}
        </a>
      ),
    },
    {
      title: 'Feedback',
      dataIndex: 'feedback',
      key: 'feedback',
      ellipsis: true,
      render: (text) => (
        <div style={{
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          maxWidth: '300px'
        }}>
          {text}
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      filters: statusOptions.map(opt => ({
        text: opt.label,
        value: opt.value
      })),
      render: getStatusTag,
      sorter: true,
    },
    {
      title: 'Date',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => new Date(date).toLocaleDateString(),
      sorter: true,
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 180,
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => handleViewFeedback(record)}
          >
            View
          </Button>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleStatusUpdateClick(record)}
          >
            Update Status
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card
        title={
          <Space style={{ width: '100%', justifyContent: 'space-between' }}>
            <Title level={4} style={{ margin: 0 }}>Feedback Management</Title>
            <Space>
              <Select
                placeholder="Filter by status"
                style={{ width: 180 }}
                allowClear
                options={statusOptions}
                onChange={handleStatusFilterChange}
                value={filters.status}
              />
              <Input.Search
                placeholder="Search feedback..."
                allowClear
                enterButton={<SearchOutlined />}
                style={{ width: 300 }}
                onSearch={handleSearch}
              />
              <Button
                icon={<SyncOutlined />}
                onClick={handleRefresh}
                loading={loading}
              >
                Refresh
              </Button>
            </Space>
          </Space>
        }
        bordered={false}
      >
        <Table
          columns={columns}
          dataSource={feedbackList}
          rowKey="id"
          pagination={{
            ...pagination,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50', '100'],
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
          }}
          onChange={handleTableChange}
          loading={loading}
          scroll={{ x: 'max-content' }}
        />
      </Card>

      <Modal
        title="Feedback Details"
        open={isViewModalVisible}
        onCancel={() => setIsViewModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsViewModalVisible(false)}>
            Close
          </Button>,
        ]}
        width={800}
        centered
      >
        {selectedFeedback && (
          <div style={{ padding: '16px 0' }}>
            <Space style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: 16
            }}>
              <div>
                <Text strong>From: </Text>
                <Space>
                  <Avatar size="large" style={{ backgroundColor: '#1890ff' }}>
                    {getInitial(selectedFeedback.name)}
                  </Avatar>
                  <div>
                    <div>{selectedFeedback.name}</div>
                    <a href={`mailto:${selectedFeedback.email}`} style={{ display: 'flex', alignItems: 'center' }}>
                      <MailOutlined style={{ marginRight: 8 }} />
                      {selectedFeedback.email}
                    </a>
                  </div>
                </Space>
              </div>
              <div>
                <Text strong>Status: </Text>
                {getStatusTag(selectedFeedback.status)}
              </div>
            </Space>

            <Space style={{ display: 'flex', gap: 32, marginBottom: 16 }}>
              <div>
                <Text strong>Submitted: </Text>
                <Text>{new Date(selectedFeedback.created_at).toLocaleString()}</Text>
              </div>
              {selectedFeedback.updated_at && (
                <div>
                  <Text strong>Last Updated: </Text>
                  <Text>{new Date(selectedFeedback.updated_at).toLocaleString()}</Text>
                </div>
              )}
            </Space>

            <Divider />

            <div style={{ marginBottom: 24 }}>
              <Text strong style={{ display: 'block', marginBottom: 8 }}>Feedback:</Text>
              <div style={{
                padding: 16,
                background: '#f9f9f9',
                borderRadius: 4,
                borderLeft: '4px solid #1890ff'
              }}>
                {selectedFeedback.feedback}
              </div>
            </div>

            {selectedFeedback.response && (
              <>
                <Divider />
                <div style={{ marginBottom: 16 }}>
                  <Text strong style={{ display: 'block', marginBottom: 8 }}>Admin Response:</Text>
                  <div style={{
                    padding: 16,
                    background: '#f0f9ff',
                    borderRadius: 4,
                    borderLeft: '4px solid #52c41a'
                  }}>
                    {selectedFeedback.response}
                  </div>
                </div>
                {selectedFeedback.response_at && (
                  <div style={{ textAlign: 'right' }}>
                    <Text type="secondary">
                      Responded on: {new Date(selectedFeedback.response_at).toLocaleString()}
                    </Text>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </Modal>

      <Modal
        title="Update Feedback Status"
        open={isStatusModalVisible}
        onCancel={() => setIsStatusModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setIsStatusModalVisible(false)}>
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={updatingStatus}
            onClick={updateFeedbackStatus}
          >
            Update Status
          </Button>,
        ]}
        centered
      >
        {selectedFeedback && (
          <div style={{ padding: '16px 0' }}>
            <div style={{ marginBottom: 24 }}>
              <Text strong style={{ display: 'block', marginBottom: 8 }}>Current Status:</Text>
              {getStatusTag(selectedFeedback.status)}
            </div>

            <div>
              <Text strong style={{ display: 'block', marginBottom: 8 }}>New Status:</Text>
              <Select
                style={{ width: '100%' }}
                value={currentStatus}
                onChange={setCurrentStatus}
                options={statusOptions}
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default FeedbackManagement;