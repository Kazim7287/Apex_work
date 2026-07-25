import { useState, useEffect } from 'react';
import { 
  Table, 
  Card, 
  Typography, 
  Button, 
  Space, 
  Spin, 
  Alert, 
  Avatar, 
  Grid, 
  Dropdown, 
  Menu, 
  Tag,
  Row,
  Col
} from 'antd';
import { Link } from 'react-router-dom';
import { 
  UserOutlined, 
  MailOutlined, 
  PhoneOutlined, 
  ArrowLeftOutlined,
  MoreOutlined,
  IdcardOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

const TeacherList = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profilePictures, setProfilePictures] = useState({});
  
  const screens = useBreakpoint();
  const isMobile = !screens.md;
  const isSmallMobile = !screens.sm;
  const isExtraSmall = !screens.xs;

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/teach_read.php');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        if (!data.success) {
          throw new Error(data.error || 'Failed to fetch teachers');
        }

        // Transform the API data
        const formattedTeachers = Array.isArray(data.data) ? data.data.map(teacher => ({
          id: teacher.id,
          name: teacher.teach_name,
          email: teacher.teach_email,
          phone: teacher.teach_no
        })) : [];

        setTeachers(formattedTeachers);
        
        // Fetch profile pictures for all teachers
        if (formattedTeachers.length > 0) {
          fetchProfilePictures(formattedTeachers);
        }
        
      } catch (err) {
        console.error('Error fetching teachers:', err);
        setError(err.message || 'Failed to load teacher data');
      } finally {
        setLoading(false);
      }
    };

    const fetchProfilePictures = async (teachers) => {
      const pictures = {};
      const promises = teachers.map(teacher => {
        return fetch(`https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/get_profilepicture.php?teacher_id=${teacher.id}`)
          .then(response => response.json())
          .then(data => {
            if (data.success && data.file_url) {
              pictures[teacher.id] = data.file_url;
            } else {
              // Use a default avatar if no picture found
              pictures[teacher.id] = null;
            }
          })
          .catch(() => {
            pictures[teacher.id] = null;
          });
      });

      await Promise.all(promises);
      setProfilePictures(pictures);
    };

    fetchTeachers();
  }, []);

  const getColumns = () => {
    if (isExtraSmall) {
      return [
        {
          title: 'Teacher',
          dataIndex: 'id',
          key: 'mobile',
          render: (id, record) => (
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Avatar
                src={profilePictures[id] || <UserOutlined />}
                size="small"
                icon={!profilePictures[id] ? <UserOutlined /> : null}
                style={{ marginRight: 8 }}
              />
              <div>
                <div><Text strong>{record.name}</Text></div>
                <Tag icon={<IdcardOutlined />} style={{ marginTop: 4 }}>{id}</Tag>
              </div>
            </div>
          ),
          width: 150
        },
        {
          title: 'Actions',
          key: 'actions',
          render: (_, record) => (
            <Dropdown
              overlay={
                <Menu>
                  <Menu.Item key="email">
                    <MailOutlined /> <a href={`mailto:${record.email}`}>{record.email || 'N/A'}</a>
                  </Menu.Item>
                  <Menu.Item key="phone">
                    <PhoneOutlined /> <a href={`tel:${record.phone}`}>{record.phone || 'N/A'}</a>
                  </Menu.Item>
                </Menu>
              }
              trigger={['click']}
            >
              <Button type="text" icon={<MoreOutlined />} size="small" />
            </Dropdown>
          ),
          width: 50
        }
      ];
    } else if (isSmallMobile) {
      return [
        {
          title: 'Profile',
          dataIndex: 'id',
          key: 'profile',
          render: (id) => (
            <Avatar
              src={profilePictures[id] || <UserOutlined />}
              size="small"
              icon={!profilePictures[id] ? <UserOutlined /> : null}
            />
          ),
          width: 50
        },
        {
          title: 'Name',
          dataIndex: 'name',
          key: 'name',
          render: (text, record) => (
            <div>
              <Text strong>{text}</Text>
              <div style={{ fontSize: 12 }}>ID: {record.id}</div>
            </div>
          ),
          width: 120
        },
        {
          title: 'Contact',
          key: 'contact',
          render: (_, record) => (
            <Dropdown
              overlay={
                <Menu>
                  <Menu.Item key="email">
                    <MailOutlined /> <a href={`mailto:${record.email}`}>{record.email || 'N/A'}</a>
                  </Menu.Item>
                  <Menu.Item key="phone">
                    <PhoneOutlined /> <a href={`tel:${record.phone}`}>{record.phone || 'N/A'}</a>
                  </Menu.Item>
                </Menu>
              }
              trigger={['click']}
            >
              <Button type="text" icon={<MoreOutlined />} size="small" />
            </Dropdown>
          ),
          width: 50
        }
      ];
    } else if (isMobile) {
      return [
        {
          title: 'Profile',
          dataIndex: 'id',
          key: 'profile',
          render: (id) => (
            <Avatar
              src={profilePictures[id] || <UserOutlined />}
              size="small"
              icon={!profilePictures[id] ? <UserOutlined /> : null}
            />
          ),
          width: 50
        },
        {
          title: 'ID',
          dataIndex: 'id',
          key: 'id',
          width: 70
        },
        {
          title: 'Name',
          dataIndex: 'name',
          key: 'name',
          render: (text) => <Text strong>{text}</Text>,
          width: 120
        },
        {
          title: 'Email',
          dataIndex: 'email',
          key: 'email',
          render: (text) => text ? (
            <a href={`mailto:${text}`}>
              <MailOutlined /> {text.length > 10 ? `${text.substring(0, 10)}...` : text}
            </a>
          ) : 'N/A',
          width: 150
        }
      ];
    } else {
      return [
        {
          title: 'Profile',
          dataIndex: 'id',
          key: 'profile',
          render: (id) => (
            <Avatar
              src={profilePictures[id] || <UserOutlined />}
              size="default"
              icon={!profilePictures[id] ? <UserOutlined /> : null}
            />
          ),
          width: 70
        },
        {
          title: 'ID',
          dataIndex: 'id',
          key: 'id',
          width: 80
        },
        {
          title: 'Name',
          dataIndex: 'name',
          key: 'name',
          render: (text) => <Text strong>{text}</Text>,
          width: 150
        },
        {
          title: 'Email',
          dataIndex: 'email',
          key: 'email',
          render: (text) => text ? (
            <a href={`mailto:${text}`}>
              <MailOutlined /> {text}
            </a>
          ) : 'N/A',
          width: 200
        },
        {
          title: 'Phone',
          dataIndex: 'phone',
          key: 'phone',
          render: (text) => text ? (
            <a href={`tel:${text}`}>
              <PhoneOutlined /> {text}
            </a>
          ) : 'N/A',
          width: 150
        }
      ];
    }
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        padding: isMobile ? '16px' : '24px'
      }}>
        <Spin size="large" tip="Loading teachers..." />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: isMobile ? '16px' : '24px' }}>
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
          action={
            <Button size="small" danger onClick={() => window.location.reload()}>
              Retry
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div style={{ 
      padding: isMobile ? '16px' : '24px',
      maxWidth: '100vw',
      overflowX: 'hidden'
    }}>
      <Card
        title={
          <Space>
            <Link to="/teacher/dashboard">
              <Button type="text" icon={<ArrowLeftOutlined />} />
            </Link>
            <Title level={isMobile ? 5 : 4} style={{ margin: 0 }}>All Teachers</Title>
          </Space>
        }
        bordered={false}
        style={{ 
          boxShadow: '0 2px 8px rgba(0,0,0,0.09)',
          borderRadius: '8px'
        }}
        bodyStyle={{
          padding: isMobile ? '12px' : '16px'
        }}
      >
        <Table
          columns={getColumns()}
          dataSource={teachers}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: isExtraSmall ? 5 : isSmallMobile ? 8 : 10,
            simple: isMobile,
            showSizeChanger: !isMobile,
            pageSizeOptions: ['5', '10', '20', '50'],
            showTotal: (total) => `Total ${total} teachers`
          }}
          scroll={{
            x: isMobile ? 'max-content' : true
          }}
          size={isMobile ? 'small' : 'middle'}
          locale={{
            emptyText: 'No teachers found'
          }}
          style={{
            width: '100%'
          }}
        />
      </Card>
    </div>
  );
};

export default TeacherList;