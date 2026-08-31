// src/pages/Students/Library.jsx
import React, { useState, useEffect } from 'react';
import { Card, Table, Typography, Button, Tag, Space, Spin, Alert, Input } from 'antd';
import { BookOutlined, SearchOutlined, ReloadOutlined, CheckCircleOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const LibrarySection = () => {
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchText, setSearchText] = useState('');

  const API_BASE_URL = 'https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX';

  const fetchBooks = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}/Book_read.php`, {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch library resources');
      }

      const data = await response.json();
      if (data.success && Array.isArray(data.data)) {
        setBooks(data.data);
        setFilteredBooks(data.data);
      } else {
        setBooks([]);
        setFilteredBooks([]);
      }
    } catch (err) {
      console.error('Library fetch error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const handleSearch = (value) => {
    setSearchText(value);
    if (!value.trim()) {
      setFilteredBooks(books);
    } else {
      const q = value.toLowerCase();
      setFilteredBooks(books.filter(b => 
        (b.name && b.name.toLowerCase().includes(q)) || 
        String(b.id).includes(q)
      ));
    }
  };

  const columns = [
    {
      title: 'Book ID',
      dataIndex: 'id',
      key: 'id',
      width: 120,
      render: (id) => <Tag color="navy" style={{ background: '#0b1b3d', color: '#d4af37', fontWeight: 700, borderRadius: 6 }}>#{id}</Tag>
    },
    {
      title: 'Book Title & Resource Name',
      dataIndex: 'name',
      key: 'name',
      render: (text) => (
        <Space>
          <BookOutlined style={{ color: '#1e3a8a' }} />
          <Text strong style={{ color: '#0b1b3d', fontSize: 14 }}>{text}</Text>
        </Space>
      ),
    },
    {
      title: 'Access Status',
      key: 'status',
      width: 160,
      align: 'center',
      render: () => (
        <Tag icon={<CheckCircleOutlined />} color="success" style={{ borderRadius: 12, padding: '2px 10px', fontWeight: 600 }}>
          Available in Library
        </Tag>
      ),
    },
  ];

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
              <BookOutlined />
            </div>
            <div>
              <Title level={4} style={{ margin: 0, color: '#0b1b3d', fontWeight: 800 }}>
                Campus Library & Learning Resources
              </Title>
              <Text style={{ color: '#64748b', fontSize: 13 }}>
                Search course curriculum books, prescribed references, and digital library catalogs
              </Text>
            </div>
          </div>

          <Button
            icon={<ReloadOutlined />}
            onClick={fetchBooks}
            loading={loading}
            style={{ borderRadius: 8 }}
          >
            Refresh
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

      {/* Main Table Card */}
      <Card
        className="apex-card"
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 0' }}>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: 'rgba(212, 175, 55, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d4af37', fontSize: 16 }}>
              <BookOutlined />
            </div>
            <div>
              <Title level={5} style={{ margin: 0, color: '#0b1b3d', fontWeight: 700 }}>
                Library Catalog
              </Title>
              <Text style={{ color: '#64748b', fontSize: 11 }}>Registered academic reading materials</Text>
            </div>
          </div>
        }
        extra={
          <Input
            placeholder="Search books..."
            prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
            value={searchText}
            onChange={(e) => handleSearch(e.target.value)}
            allowClear
            style={{ width: 220, borderRadius: 8 }}
          />
        }
      >
        <Table
          columns={columns}
          dataSource={filteredBooks}
          rowKey="id"
          loading={loading}
          scroll={{ x: 'max-content' }}
          pagination={{
            pageSize: 8,
            showSizeChanger: true,
            pageSizeOptions: ['8', '15', '30'],
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} books`
          }}
        />
      </Card>
    </div>
  );
};

export default LibrarySection;