/* eslint-disable react/jsx-key */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Layout,
  Card,
  Typography,
  Form,
  Input,
  DatePicker,
  TimePicker,
  Button,
  List,
  Space,
  Alert,
  Row,
  Col,
  Spin,
  notification,
  Modal,
  Calendar,
  Badge,
  Drawer
} from 'antd';
import { 
  DeleteOutlined, 
  EditOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  UserOutlined,
  MenuOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import 'dayjs/locale/en';
import { useMediaQuery } from 'react-responsive';
import Sidebar from "./Sidebar";

dayjs.extend(duration);

const { Content, Sider } = Layout;
const { Title, Text } = Typography;
const { TextArea } = Input;

const EventCalendar = () => {
    const [events, setEvents] = useState([]);
    const [currentTime, setCurrentTime] = useState(dayjs());
    const [error, setError] = useState('');
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [api, contextHolder] = notification.useNotification();
    const [nextEvent, setNextEvent] = useState(null);
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [editingEvent, setEditingEvent] = useState(null);
    const [selectedDate, setSelectedDate] = useState(dayjs());
    const [mobileSidebarVisible, setMobileSidebarVisible] = useState(false);
    const navigate = useNavigate();
    
    const isMobile = useMediaQuery({ maxWidth: 768 });

    // API endpoints
    const API_BASE =' https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/';
    const GET_EVENTS_API = `${API_BASE}/get_eventsad.php`;
    const ADD_EVENT_API = `${API_BASE}/Add_event.php`;
    const UPDATE_EVENT_API = `${API_BASE}/update_event.php`;
    const DELETE_EVENT_API = `${API_BASE}/Event_delete.php`;

    useEffect(() => {
        const fetchData = async () => {
            try {
                await fetchEvents();
                const timer = setInterval(() => {
                    setCurrentTime(dayjs());
                    updateNextEventCountdown();
                }, 1000);
                
                return () => clearInterval(timer);
            } catch (error) {
                console.error("Initialization error:", error);
            }
        };

        fetchData();
    }, []);

    const fetchEvents = async () => {
        try {
            setLoading(true);
            const response = await fetch(GET_EVENTS_API, {
                credentials: 'include'
            });
            
            if (response.status === 401) {
                navigate('/admin-signin');
                return;
            }
            
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            
            const data = await response.json();
            
            if (data.success === false && data.error_code === "ADMIN_AUTH_REQUIRED") {
                navigate('/admin-signin');
                return;
            }
            
            if (data.success && Array.isArray(data.data)) {
                const formattedEvents = data.data.map(event => ({
                    ...event,
                    id: event.id,
                    formattedDate: dayjs(event.event_date).format('MMMM D, YYYY'),
                    formattedTime: event.event_time ? dayjs(event.event_time, 'HH:mm:ss').format('h:mm A') : 'No time specified',
                    dayName: dayjs(event.event_date).format('dddd'),
                    dateTime: dayjs(`${event.event_date} ${event.event_time || '00:00:00'}`)
                }));
                
                setEvents(formattedEvents);
                calculateNextEvent(formattedEvents);
            } else {
                throw new Error(data.message || 'Invalid data structure');
            }
        } catch (err) {
            setError(err.message);
            api.error({ 
                message: 'Error', 
                description: err.message,
                duration: 3
            });
        } finally {
            setLoading(false);
        }
    };

    const calculateNextEvent = (events) => {
        const now = dayjs();
        const upcomingEvent = events
            .filter(event => event.dateTime.isAfter(now))
            .sort((a, b) => a.dateTime.diff(b.dateTime))[0];
        setNextEvent(upcomingEvent || null);
    };

    const updateNextEventCountdown = () => {
        if (nextEvent && nextEvent.dateTime.isBefore(dayjs())) {
            setNextEvent(null);
        }
    };

    const getCountdownText = () => {
        if (!nextEvent) return "No upcoming events scheduled";
        
        const diff = dayjs.duration(nextEvent.dateTime.diff(dayjs()));
        if (diff.asSeconds() <= 0) return `"${nextEvent.event_name}" has ended`;

        return (
            <Space>
                <ClockCircleOutlined />
                <Text>
                    {diff.hours()}h {diff.minutes()}m {diff.seconds()}s until "{nextEvent.event_name}"
                </Text>
            </Space>
        );
    };

    const handleSubmit = async (values) => {
        try {
            setLoading(true);
            const formattedValues = {
                event_name: values.event_name,
                event_description: values.event_description || '',
                event_date: values.event_date.format('YYYY-MM-DD'),
                event_time: values.event_time?.format('HH:mm:ss') || null,
                event_manager: values.event_manager
            };

            const response = await fetch(ADD_EVENT_API, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formattedValues),
                credentials: 'include'
            });

            if (response.status === 401) {
                navigate('/admin-signin');
                return;
            }

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const data = await response.json();
            if (!data.success) throw new Error(data.message);

            api.success({ 
                message: 'Success', 
                description: 'Event added successfully',
                duration: 2
            });
            form.resetFields();
            await fetchEvents();
        } catch (err) {
            setError(err.message);
            api.error({ 
                message: 'Error', 
                description: err.message,
                duration: 3
            });
        } finally {
            setLoading(false);
        }
    };

    const showEditModal = (event) => {
        setEditingEvent(event);
        form.setFieldsValue({
            event_name: event.event_name,
            event_description: event.event_description,
            event_date: dayjs(event.event_date),
            event_time: event.event_time ? dayjs(event.event_time, 'HH:mm:ss') : null,
            event_manager: event.event_manager
        });
        setIsEditModalVisible(true);
    };

    const handleUpdate = async (values) => {
        try {
            setLoading(true);
            const formattedValues = {
                id: editingEvent.id,
                event_name: values.event_name,
                event_description: values.event_description || '',
                event_date: values.event_date.format('YYYY-MM-DD'),
                event_time: values.event_time?.format('HH:mm:ss') || null,
                event_manager: values.event_manager
            };

            const response = await fetch(UPDATE_EVENT_API, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formattedValues),
                credentials: 'include'
            });

            if (response.status === 401) {
                navigate('/admin-signin');
                return;
            }

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const data = await response.json();
            if (!data.success) throw new Error(data.message);

            api.success({ 
                message: 'Success', 
                description: 'Event updated successfully',
                duration: 2
            });
            setIsEditModalVisible(false);
            setEditingEvent(null);
            form.resetFields();
            await fetchEvents();
        } catch (err) {
            setError(err.message);
            api.error({ 
                message: 'Error', 
                description: err.message,
                duration: 3
            });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            const response = await fetch(DELETE_EVENT_API, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id }),
                credentials: 'include'
            });

            if (response.status === 401) {
                navigate('/admin-signin');
                return;
            }

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const data = await response.json();
            if (!data.success) throw new Error(data.message);

            api.success({ 
                message: 'Success', 
                description: 'Event deleted successfully',
                duration: 2
            });
            await fetchEvents();
        } catch (err) {
            setError(err.message);
            api.error({ 
                message: 'Error', 
                description: err.message,
                duration: 3
            });
        }
    };

    const dateCellRender = (value) => {
        const dateEvents = events.filter(event => 
            dayjs(event.event_date).isSame(value, 'day')
        );
        
        return (
            <div style={{ minHeight: isMobile ? 60 : 80 }}>
                {dateEvents.map(event => (
                    <Badge 
                        key={event.id} 
                        color={event.dateTime.isBefore(dayjs()) ? 'gray' : 'blue'}
                        text={
                            <Text 
                                ellipsis 
                                style={{ 
                                    fontSize: isMobile ? 10 : 12,
                                    color: event.dateTime.isBefore(dayjs()) ? '#999' : '#1890ff'
                                }}
                            >
                                {event.event_name}
                            </Text>
                        }
                    />
                ))}
            </div>
        );
    };

    const getEventsForSelectedDate = () => {
        return events.filter(event => 
            dayjs(event.event_date).isSame(selectedDate, 'day')
        );
    };

    return (
        <>
            {contextHolder}
            <Layout style={{ minHeight: '100vh' }}>
                {isMobile && (
                    <Button 
                        type="text"
                        icon={<MenuOutlined />}
                        onClick={() => setMobileSidebarVisible(true)}
                        style={{ 
                            position: 'fixed',
                            zIndex: 1,
                            top: 16,
                            left: 16,
                            width: 48,
                            height: 48
                        }}
                    />
                )}

                {!isMobile && (
                    <Sider width={200} theme="light">
                        <Sidebar />
                    </Sider>
                )}

                <Layout>
                    <Content style={{ 
                        margin: isMobile ? '16px' : '24px',
                        paddingTop: isMobile ? '64px' : 0
                    }}>
                        <Row gutter={[16, 16]}>
                            <Col span={24}>
                                <Space 
                                    direction={isMobile ? "vertical" : "horizontal"} 
                                    align={isMobile ? "start" : "center"}
                                    size={isMobile ? 8 : 16}
                                >
                                    <Space align="center">
                                        <CalendarOutlined style={{ fontSize: isMobile ? 20 : 24 }} />
                                        <Title level={isMobile ? 3 : 2} style={{ margin: 0 }}>Event Calendar</Title>
                                    </Space>
                                    <Space>
                                        <ClockCircleOutlined />
                                        <Text>
                                            {currentTime.format('MMMM D, YYYY - h:mm:ss A')}
                                        </Text>
                                    </Space>
                                </Space>
                                <div style={{ marginTop: 8 }}>
                                    {getCountdownText()}
                                </div>
                            </Col>
                            
                            <Col span={24}>
                                <Card bordered={false} bodyStyle={{ padding: isMobile ? 0 : 16 }}>
                                    <Calendar 
                                        value={selectedDate}
                                        onSelect={setSelectedDate}
                                        dateCellRender={dateCellRender}
                                        fullscreen={!isMobile}
                                    />
                                </Card>
                            </Col>
                            
                            <Col xs={24} md={12}>
                                <Card 
                                    title={`Events for ${selectedDate.format('MMMM D, YYYY')}`}
                                    bordered={false}
                                    loading={loading}
                                    style={{ marginBottom: isMobile ? 16 : 0 }}
                                >
                                    {getEventsForSelectedDate().length > 0 ? (
                                        <List
                                            itemLayout="horizontal"
                                            dataSource={getEventsForSelectedDate()}
                                            renderItem={(event) => (
                                                <List.Item
                                                    actions={[
                                                        // eslint-disable-next-line react/jsx-key
                                                        <Button 
                                                            icon={<EditOutlined />} 
                                                            onClick={() => showEditModal(event)}
                                                            size={isMobile ? "small" : "middle"}
                                                        />,
                                                        <Button 
                                                            danger 
                                                            icon={<DeleteOutlined />} 
                                                            onClick={() => handleDelete(event.id)}
                                                            size={isMobile ? "small" : "middle"}
                                                        />
                                                    ]}
                                                >
                                                    <List.Item.Meta
                                                        title={<Text strong>{event.event_name}</Text>}
                                                        description={
                                                            <Space direction="vertical" size={4}>
                                                                <Text>{event.event_description}</Text>
                                                                <Space>
                                                                    <ClockCircleOutlined />
                                                                    <Text>{event.formattedTime}</Text>
                                                                </Space>
                                                                <Space>
                                                                    <UserOutlined />
                                                                    <Text>{event.event_manager}</Text>
                                                                </Space>
                                                            </Space>
                                                        }
                                                    />
                                                </List.Item>
                                            )}
                                        />
                                    ) : (
                                        <Text type="secondary">No events for this date</Text>
                                    )}
                                </Card>
                            </Col>
                            
                            <Col xs={24} md={12}>
                                <Card title="Add New Event" bordered={false}>
                                    <Form form={form} layout="vertical" onFinish={handleSubmit}>
                                        <Form.Item
                                            name="event_name"
                                            label="Event Name"
                                            rules={[{ required: true, message: 'Please enter event name' }]}
                                        >
                                            <Input size={isMobile ? "small" : "middle"} />
                                        </Form.Item>
                                        
                                        <Form.Item
                                            name="event_description"
                                            label="Event Description"
                                        >
                                            <TextArea rows={isMobile ? 2 : 3} size={isMobile ? "small" : "middle"} />
                                        </Form.Item>
                                        
                                        <Row gutter={16}>
                                            <Col span={12}>
                                                <Form.Item
                                                    name="event_date"
                                                    label="Date"
                                                    rules={[{ required: true, message: 'Please select date' }]}
                                                >
                                                    <DatePicker 
                                                        style={{ width: '100%' }} 
                                                        size={isMobile ? "small" : "middle"}
                                                    />
                                                </Form.Item>
                                            </Col>
                                            <Col span={12}>
                                                <Form.Item
                                                    name="event_time"
                                                    label="Time"
                                                >
                                                    <TimePicker 
                                                        style={{ width: '100%' }} 
                                                        format="h:mm A"
                                                        size={isMobile ? "small" : "middle"}
                                                    />
                                                </Form.Item>
                                            </Col>
                                        </Row>
                                        
                                        <Form.Item
                                            name="event_manager"
                                            label="Manager"
                                            rules={[{ required: true, message: 'Please enter manager' }]}
                                        >
                                            <Input size={isMobile ? "small" : "middle"} />
                                        </Form.Item>
                                        
                                        <Form.Item>
                                            <Button 
                                                type="primary" 
                                                htmlType="submit" 
                                                block
                                                size={isMobile ? "small" : "middle"}
                                                loading={loading}
                                            >
                                                Add Event
                                            </Button>
                                        </Form.Item>
                                    </Form>
                                </Card>
                            </Col>
                        </Row>
                    </Content>
                </Layout>
            </Layout>

            <Drawer
                placement="left"
                open={mobileSidebarVisible}
                onClose={() => setMobileSidebarVisible(false)}
                width={200}
                bodyStyle={{ padding: 0 }}
                closable={false}
            >
                <Sidebar mobile onClose={() => setMobileSidebarVisible(false)} />
            </Drawer>

            <Modal
                title="Edit Event"
                open={isEditModalVisible}
                onCancel={() => {
                    setIsEditModalVisible(false);
                    setEditingEvent(null);
                }}
                footer={null}
                destroyOnClose
                width={isMobile ? '90%' : '50%'}
            >
                <Form form={form} layout="vertical" onFinish={handleUpdate}>
                    <Form.Item
                        name="event_name"
                        label="Event Name"
                        rules={[{ required: true }]}
                    >
                        <Input size={isMobile ? "small" : "middle"} />
                    </Form.Item>
                    
                    <Form.Item
                        name="event_description"
                        label="Event Description"
                    >
                        <TextArea rows={isMobile ? 2 : 3} size={isMobile ? "small" : "middle"} />
                    </Form.Item>
                    
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="event_date"
                                label="Date"
                                rules={[{ required: true }]}
                            >
                                <DatePicker 
                                    style={{ width: '100%' }} 
                                    size={isMobile ? "small" : "middle"}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="event_time"
                                label="Time"
                            >
                                <TimePicker 
                                    style={{ width: '100%' }} 
                                    format="h:mm A"
                                    size={isMobile ? "small" : "middle"}
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                    
                    <Form.Item
                        name="event_manager"
                        label="Manager"
                        rules={[{ required: true }]}
                    >
                        <Input size={isMobile ? "small" : "middle"} />
                    </Form.Item>
                    
                    <Form.Item>
                        <Button 
                            type="primary" 
                            htmlType="submit" 
                            block
                            loading={loading}
                            size={isMobile ? "small" : "middle"}
                        >
                            Update Event
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
};

export default EventCalendar;