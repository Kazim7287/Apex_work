import { useState, useEffect } from 'react';
import { 
  Card, 
  Button, 
  Modal, 
  Spin, 
  Alert, 
  Tag, 
  Divider,
  Grid,
  Typography,
  Space,
  List,
  Badge
} from 'antd';
import { 
  ClockCircleOutlined, 
  CloseOutlined,
  UserOutlined,
  CalendarOutlined
} from '@ant-design/icons';

const { useBreakpoint } = Grid;
const { Title, Text } = Typography;

const ClassList = () => {
  // State management
  const [teacherSections, setTeacherSections] = useState([]);
  const [selectedSection, setSelectedSection] = useState(null);
  const [timetable, setTimetable] = useState([]);
  const [loading, setLoading] = useState({ 
    sections: false, 
    timetable: false 
  });
  const [error, setError] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const screens = useBreakpoint();

  // Enhanced fetch function with session support
  const fetchData = async (url, type = 'sections') => {
    setLoading(prev => ({ ...prev, [type]: true }));
    setError(null);
    
    try {
      const response = await fetch(url, {
        credentials: 'include' // Include cookies for session
      });
      
      if (response.status === 401) {
        // Handle session expiration
        window.location.href = '/login';
        throw new Error('Session expired - Please login again');
      }

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data = await response.json();
      return data;

    } catch (err) {
      console.error(`${type} fetch failed:`, err);
      setError(`Failed to load ${type}: ${err.message}`);
      throw err;
    } finally {
      setLoading(prev => ({ ...prev, [type]: false }));
    }
  };

  // Fetch teacher sections
  useEffect(() => {
    const fetchTeacherSections = async () => {
      try {
        const data = await fetchData(
          `https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/Filter.php`,
          'sections'
        );

        // Handle multiple possible response formats
        const sections = data?.sections || data?.data || (Array.isArray(data) ? data : []);
        
        if (sections.length === 0) {
          throw new Error('No sections assigned to this teacher');
        }

        // Ensure we have the correct ID field from the API
        const normalizedSections = sections.map(section => ({
          ...section,
          correctId: section.section_id || section.id
        }));

        setTeacherSections(normalizedSections);
        
      } catch (err) {
        console.error('Section fetch failed:', err);
      }
    };

    fetchTeacherSections();
  }, []);

  // Fetch timetable with session verification
  const fetchTimetable = async (sectionId) => {
    try {
      const data = await fetchData(
        `https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/getTimetableT.php?section_id=${sectionId}`,
        'timetable'
      );

      if (data.status === 'success' && data.timetable) {
        setTimetable(data.timetable);
      } else {
        throw new Error(data.message || 'Invalid timetable data structure');
      }
    } catch (err) {
      console.error('Timetable fetch failed:', err);
    }
  };

  // Handlers
  const handleSectionClick = async (section) => {
    setSelectedSection(section);
    setIsModalVisible(true);
    await fetchTimetable(section.correctId);
  };

  const closeModal = () => {
    setIsModalVisible(false);
    setSelectedSection(null);
    setTimetable([]);
  };

  // Process timetable data
  const groupedTimetable = timetable.reduce((acc, entry) => {
    const day = entry.day;
    if (!acc[day]) acc[day] = [];
    
    const [hours, minutes] = entry.start_time.split(':').map(Number);
    const startMinutes = hours * 60 + minutes;
    
    acc[day].push({ ...entry, startMinutes });
    return acc;
  }, {});

  // Sort timetable entries
  Object.values(groupedTimetable).forEach(entries => {
    entries.sort((a, b) => a.startMinutes - b.startMinutes);
  });

  const daysOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  return (
    <div style={{ padding: screens.xs ? '16px' : '24px', overflowY: 'auto' }}>
      {loading.sections ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <Spin size="large" tip="Loading your classes..." />
        </div>
      ) : error ? (
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
          action={
            <Button size="small" onClick={() => window.location.reload()}>
              Refresh
            </Button>
          }
        />
      ) : teacherSections.length > 0 ? (
        <div style={{ marginTop: '16px' }}>
          <Title level={4} style={{ marginBottom: '24px' }}>Your Sections</Title>
          <Space 
            direction={screens.xs ? 'vertical' : 'horizontal'} 
            size="middle" 
            style={{ width: '100%' }}
          >
            {teacherSections.map((section) => (
              <Badge.Ribbon 
                text={section.class_name} 
                color="blue"
                key={`${section.correctId}-${section.class_name}`}
              >
                <Card
                  hoverable
                  onClick={() => handleSectionClick(section)}
                  style={{ 
                    width: screens.xs ? '100%' : 300,
                    cursor: 'pointer',
                    transition: 'all 0.3s'
                  }}
                  bodyStyle={{ padding: '16px' }}
                >
                  <Title level={5} style={{ marginBottom: '8px' }}>
                    {section.section_name || 'Unnamed Section'}
                  </Title>
                  <Button 
                    type="link" 
                    icon={<CalendarOutlined />}
                    style={{ 
                      padding: 0,
                      color: '#1890ff',
                      transition: 'all 0.2s'
                    }}
                  >
                    View Timetable
                  </Button>
                </Card>
              </Badge.Ribbon>
            ))}
          </Space>
        </div>
      ) : (
        <Card style={{ textAlign: 'center', marginTop: '24px' }}>
          <Title level={4} style={{ color: '#666' }}>No Sections Assigned</Title>
          <Text type="secondary">
            Please contact administration if this is incorrect.
          </Text>
          <div style={{ marginTop: '16px' }}>
            <Button 
              type="default" 
              onClick={() => window.location.reload()}
            >
              Refresh Data
            </Button>
          </div>
        </Card>
      )}

      {/* Timetable Modal */}
      <Modal
        title={
          <div>
            <Title level={4} style={{ margin: 0 }}>
              Section {selectedSection?.section_name}
            </Title>
            <Text type="secondary">{selectedSection?.class_name}</Text>
          </div>
        }
        visible={isModalVisible}
        onCancel={closeModal}
        footer={null}
        width={screens.xs ? '90%' : '80%'}
        style={{ top: 20 }}
        bodyStyle={{ padding: screens.xs ? '16px' : '24px' }}
        closeIcon={<CloseOutlined style={{ fontSize: '18px' }} />}
      >
        {loading.timetable ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <Spin size="large" tip="Loading timetable..." />
          </div>
        ) : error ? (
          <Alert
            message="Error"
            description={error}
            type="error"
            showIcon
          />
        ) : (
          <div>
            {timetable.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <Text type="secondary">No timetable entries found for this section</Text>
              </div>
            ) : (
              <List
                itemLayout="vertical"
                dataSource={daysOrder}
                renderItem={day => (
                  groupedTimetable[day] && (
                    <div key={day} style={{ marginBottom: '24px' }}>
                      <Divider orientation="left">
                        <Title level={5} style={{ margin: 0 }}>
                          {day}
                        </Title>
                      </Divider>
                      <List
                        grid={{
                          gutter: 16,
                          xs: 1,
                          sm: 2,
                          md: 2,
                          lg: 3,
                          xl: 3,
                          xxl: 4
                        }}
                        dataSource={groupedTimetable[day]}
                        renderItem={(entry, idx) => (
                          <List.Item key={`${day}-${idx}`}>
                            <Card
                              hoverable
                              style={{
                                borderLeft: entry.subject_name === selectedSection?.subject_name ? 
                                  '4px solid #1890ff' : '4px solid #f0f0f0'
                              }}
                            >
                              <Space direction="vertical" size="small" style={{ width: '100%' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                  <Text strong>{entry.subject_name}</Text>
                                  {entry.subject_name === selectedSection?.subject_name && (
                                    <Tag color="blue">Your Class</Tag>
                                  )}
                                </div>
                                <div>
                                  <ClockCircleOutlined style={{ marginRight: '8px' }} />
                                  <Text type="secondary">
                                    {entry.start_time} - {entry.end_time}
                                  </Text>
                                </div>
                                <div>
                                  <UserOutlined style={{ marginRight: '8px' }} />
                                  <Text type="secondary">{entry.teacher_name}</Text>
                                </div>
                              </Space>
                            </Card>
                          </List.Item>
                        )}
                      />
                    </div>
                  )
                )}
              />
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ClassList;