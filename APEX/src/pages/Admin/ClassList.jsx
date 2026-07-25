import { useState, useEffect } from 'react';
import { 
  Input, 
  Button, 
  List, 
  Card, 
  notification, 
  Modal, 
  Row, 
  Col, 
  Space, 
  Typography,
  Empty,
  Spin,
  Tooltip
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  SearchOutlined,
  ExclamationCircleOutlined 
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { Search } = Input;
const { confirm } = Modal;

const BookList = () => {
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [newBookName, setNewBookName] = useState('');
  const [editingBook, setEditingBook] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [updatedBookName, setUpdatedBookName] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  // Fetch books from the API
  const fetchBooks = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/Book_read.php', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      if (result.success && Array.isArray(result.data)) {
        setBooks(result.data);
        setFilteredBooks(result.data);
      } else {
        notification.error({
          message: 'Error',
          description: result.error || 'No books found.',
        });
      }
    } catch (error) {
      console.error('Error:', error);
      notification.error({
        message: 'Error',
        description: 'An error occurred while fetching the books.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  // Filter books based on search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredBooks(books);
    } else {
      const filtered = books.filter(book =>
        book.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredBooks(filtered);
    }
  }, [searchQuery, books]);

  // Function to add a new book via API
  const addBook = async () => {
    if (!newBookName.trim()) {
      notification.error({
        message: 'Error',
        description: 'Please enter a book name',
      });
      return;
    }

    setIsAdding(true);
    try {
      const response = await fetch('https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/Book_reg.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newBookName }),
      });

      const result = await response.json();
      if (result.success) {
        notification.success({
          message: 'Success',
          description: result.message,
        });
        setNewBookName('');
        fetchBooks();
      } else {
        notification.error({
          message: 'Error',
          description: result.error || 'Failed to add book.',
        });
      }
    } catch (error) {
      console.error('Error:', error);
      notification.error({
        message: 'Error',
        description: 'An error occurred while adding the book.',
      });
    } finally {
      setIsAdding(false);
    }
  };

  // Function to handle updating a book
  const updateBook = async () => {
    if (!updatedBookName.trim()) {
      notification.error({
        message: 'Error',
        description: 'Please enter a book name to update',
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/Book_update.php?id=${editingBook.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: updatedBookName,
        }),
      });

      const result = await response.json();
      if (result.success) {
        notification.success({
          message: 'Success',
          description: result.message,
        });
        setIsModalVisible(false);
        setEditingBook(null);
        setUpdatedBookName('');
        fetchBooks();
      } else {
        notification.error({
          message: 'Error',
          description: result.error || 'Failed to update book.',
        });
      }
    } catch (error) {
      console.error('Error:', error);
      notification.error({
        message: 'Error',
        description: 'An error occurred while updating the book.',
      });
    } finally {
      setLoading(false);
    }
  };

  // Function to delete a book via API
  const deleteBook = async (id, name) => {
    confirm({
      title: 'Are you sure you want to delete this book?',
      icon: <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />,
      content: `Book: ${name}`,
      okText: 'Yes, Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        setLoading(true);
        try {
          const response = await fetch(`https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/Book_Delete.php?id=${id}`, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
            },
          });

          const result = await response.json();
          if (result.success) {
            notification.success({
              message: 'Success',
              description: result.message,
            });
            fetchBooks();
          } else {
            notification.error({
              message: 'Error',
              description: result.error || 'Failed to delete book.',
            });
          }
        } catch (error) {
          console.error('Error:', error);
          notification.error({
            message: 'Error',
            description: 'An error occurred while deleting the book.',
          });
        } finally {
          setLoading(false);
        }
      },
    });
  };

  // Show modal for editing a book
  const showEditModal = (book) => {
    setEditingBook(book);
    setUpdatedBookName(book.name);
    setIsModalVisible(true);
  };

  // Handle modal cancel
  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingBook(null);
    setUpdatedBookName('');
  };

  // Container styles
  const containerStyle = {
    padding: '24px',
    maxWidth: '1200px',
    margin: '0 auto',
    minHeight: '100vh',
    backgroundColor: '#f5f5f5'
  };

  // Header styles
  const headerStyle = {
    background: '#fff',
    padding: '24px',
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    marginBottom: '24px'
  };

  // Card styles
  const cardStyle = {
    borderRadius: 8,
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    transition: 'box-shadow 0.3s, transform 0.3s'
  };

  const cardHoverStyle = {
    boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)',
    transform: 'translateY(-4px)'
  };

  return (
    <div style={containerStyle}>
      {/* Header Section */}
      <div style={headerStyle}>
        <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
          <Col>
            <Title level={2} style={{ margin: 0, color: '#1890ff' }}>Book Management</Title>
            <Text type="secondary">Manage your book collection efficiently</Text>
          </Col>
          <Col>
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={fetchBooks}
              loading={loading}
            >
              Refresh Books
            </Button>
          </Col>
        </Row>
      </div>

      {/* Search and Add Book Section */}
      <Card 
        style={{ 
          borderRadius: 8, 
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          marginBottom: 24 
        }}
        bodyStyle={{ padding: 24 }}
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={12} lg={12}>
            <Search
              placeholder="Search books by name"
              allowClear
              enterButton={<Button type="primary" icon={<SearchOutlined />}>Search</Button>}
              size="large"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: '100%' }}
            />
          </Col>
          <Col xs={24} sm={12} md={12} lg={12}>
            <Space.Compact style={{ width: '100%' }}>
              <Input
                value={newBookName}
                onChange={(e) => setNewBookName(e.target.value)}
                placeholder="Enter book name"
                size="large"
                onPressEnter={addBook}
              />
              <Button 
                type="primary" 
                icon={<PlusOutlined />} 
                onClick={addBook}
                size="large"
                loading={isAdding}
                style={{ minWidth: 110 }}
              >
                Add Book
              </Button>
            </Space.Compact>
          </Col>
        </Row>
      </Card>

      {/* Book List Section */}
      <Card 
        style={{ 
          borderRadius: 8, 
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          minHeight: 400 
        }}
        bodyStyle={{ padding: 24 }}
      >
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <Spin size="large" />
            <div style={{ marginTop: 16 }}>Loading books...</div>
          </div>
        ) : filteredBooks.length > 0 ? (
          <List
            grid={{
              gutter: 16,
              xs: 1,
              sm: 2,
              md: 2,
              lg: 3,
              xl: 3,
              xxl: 4,
            }}
            dataSource={filteredBooks}
            renderItem={(book) => (
              <List.Item key={book.id}>
                <Card
                  hoverable
                  style={cardStyle}
                  bodyStyle={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '16px'
                  }}
                  className="book-card"
                >
                  <Title 
                    level={4} 
                    style={{ 
                      marginBottom: 12, 
                      minHeight: 64,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}
                  >
                    {book.name}
                  </Title>
                  <div style={{ marginTop: 'auto' }}>
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <Button
                        block
                        type="default"
                        icon={<EditOutlined />}
                        onClick={() => showEditModal(book)}
                      >
                        Edit
                      </Button>
                      <Button
                        block
                        type="primary"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => deleteBook(book.id, book.name)}
                      >
                        Delete
                      </Button>
                    </Space>
                  </div>
                </Card>
              </List.Item>
            )}
          />
        ) : (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <Text type="secondary">
                {searchQuery ? 'No books match your search' : 'No books available. Add some books to get started.'}
              </Text>
            }
          >
            {!searchQuery && (
              <Button type="primary" onClick={addBook}>
                Add Your First Book
              </Button>
            )}
          </Empty>
        )}
      </Card>

      {/* Edit Book Modal */}
      <Modal
        title={<><EditOutlined /> Edit Book: {editingBook?.name || ''}</>}
        open={isModalVisible}
        onCancel={handleCancel}
        footer={[
          <Button key="cancel" onClick={handleCancel}>
            Cancel
          </Button>,
          <Button 
            key="submit" 
            type="primary" 
            onClick={updateBook}
            loading={loading}
            icon={<EditOutlined />}
          >
            Update Book
          </Button>,
        ]}
        destroyOnClose
      >
        <Input
          value={updatedBookName}
          onChange={(e) => setUpdatedBookName(e.target.value)}
          placeholder="Enter new book name"
          size="large"
          onPressEnter={updateBook}
          style={{ marginTop: 16 }}
        />
      </Modal>

      {/* Global Styles */}
      <style>
        {`
          .book-card:hover {
            box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2) !important;
            transform: translateY(-4px) !important;
          }
          @media (max-width: 576px) {
            .ant-list-grid .ant-col > .ant-list-item {
              margin-bottom: 16px;
            }
          }
        `}
      </style>
    </div>
  );
};

export default BookList;