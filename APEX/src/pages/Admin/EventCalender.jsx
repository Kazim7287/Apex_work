import { useState, useEffect } from "react";
import { 
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
  Tag,
  Popconfirm,
  Tooltip
} from 'antd';
import { 
  DeleteOutlined, 
  EditOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  UserOutlined,
  PlusOutlined,
  BellOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import 'dayjs/locale/en';

dayjs.extend(duration);

const { Title, Text } = Typography;
const { TextArea } = Input;

const EventCalendar = () => {
    const [events, setEvents] = useState([]);
    const [currentTime, setCurrentTime] = useState(dayjs());
    const [error, setError] = useState('');
    const [form] = Form.useForm();
    const [addForm] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [api, contextHolder] = notification.useNotification();
    const [nextEvent, setNextEvent] = useState(null);
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [editingEvent, setEditingEvent] = useState(null);

    // API endpoints
    const API_BASE = 'https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/';
    const GET_EVENTS_API = `${API_BASE}/get_eventsad.php`;
    const ADD_EVENT_API = `${API_BASE}/Add_event.php`;
    const UPDATE_EVENT_API = `${API_BASE}/update_event.php`;
    const DELETE_EVENT_API = `${API_BASE}/Event_delete.php`;

    useEffect(() => {
        fetchEvents();
        const timer = setInterval(() => {
            setCurrentTime(dayjs());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        if (events.length > 0) {
            updateNextEventCountdown();
        }
    }, [currentTime, events]);

    const fetchEvents = async () => {
        try {
            setLoading(true);
            const response = await fetch(GET_EVENTS_API, {
                credentials: 'include'
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            if (Array.isArray(data)) {
                setEvents(data);
                setError('');
            } else {
                setError(data.error || 'Failed to fetch events');
            }
        } catch (err) {
            setError(err.message || 'Failed to fetch events');
        } finally {
            setLoading(false);
        }
    };

    const updateNextEventCountdown = () => {
        const upcomingEvents = events.filter(e => {
            const dateStr = `${e.event_date} ${e.event_time || '00:00:00'}`;
            return dayjs(dateStr).isAfter(currentTime);
        });

        if (upcomingEvents.length > 0) {
            upcomingEvents.sort((a, b) => {
                const dateA = dayjs(`${a.event_date} ${a.event_time || '00:00:00'}`);
                const dateB = dayjs(`${b.event_date} ${b.event_time || '00:00:00'}`);
                return dateA.diff(dateB);
            });
            setNextEvent(upcomingEvents[0]);
        } else {
            setNextEvent(null);
        }
    };

    const handleAddEvent = async (values) => {
        try {
            setLoading(true);
            const eventData = {
                event_name: values.event_name,
                event_description: values.event_description || '',
                event_date: values.event_date.format('YYYY-MM-DD'),
                event_time: values.event_time ? values.event_time.format('HH:mm:ss') : '00:00:00',
                event_manager: values.event_manager
            };

            const response = await fetch(ADD_EVENT_API, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(eventData)
            });

            const data = await response.json();
            if (data.status === 'success' || data.success) {
                api.success({
                    message: 'Event Created',
                    description: 'The event has been successfully added to the calendar.',
                    icon: <CheckCircleOutlined style={{ color: '#10b981' }} />
                });
                addForm.resetFields();
                fetchEvents();
            } else {
                throw new Error(data.message || data.error || 'Failed to add event');
            }
        } catch (err) {
            api.error({ message: 'Error', description: err.message });
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (values) => {
        try {
            setLoading(true);
            const eventData = {
                id: editingEvent.id,
                event_name: values.event_name,
                event_description: values.event_description || '',
                event_date: values.event_date.format('YYYY-MM-DD'),
                event_time: values.event_time ? values.event_time.format('HH:mm:ss') : '00:00:00',
                event_manager: values.event_manager
            };

            const response = await fetch(UPDATE_EVENT_API, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(eventData)
            });

            const data = await response.json();
            if (data.status === 'success' || data.success) {
                api.success({ message: 'Event Updated', description: 'Event modified successfully.' });
                setIsEditModalVisible(false);
                setEditingEvent(null);
                fetchEvents();
            } else {
                throw new Error(data.message || 'Failed to update event');
            }
        } catch (err) {
            api.error({ message: 'Error', description: err.message });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            setLoading(true);
            const response = await fetch(`${DELETE_EVENT_API}?id=${id}`, {
                method: 'DELETE',
                credentials: 'include'
            });
            const data = await response.json();
            if (data.status === 'success' || data.success) {
                api.success({ message: 'Event Deleted' });
                fetchEvents();
            } else {
                throw new Error(data.message || 'Failed to delete event');
            }
        } catch (err) {
            api.error({ message: 'Error', description: err.message });
        } finally {
            setLoading(false);
        }
    };

    const openEditModal = (event) => {
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

    const formatCountdown = (event) => {
        if (!event) return null;
        const target = dayjs(`${event.event_date} ${event.event_time || '00:00:00'}`);
        const diff = dayjs.duration(target.diff(currentTime));
        return `${diff.days()}d ${diff.hours()}h ${diff.minutes()}m ${diff.seconds()}s`;
    };

    return (
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
            {contextHolder}
            
            {/* Header Countdown Banner */}
            {nextEvent && (
                <Alert
                    type="info"
                    style={{ 
                        marginBottom: 24, 
                        borderRadius: 12, 
                        background: 'linear-gradient(135deg, #0b1b3d 0%, #1e3a8a 100%)', 
                        color: '#ffffff',
                        border: '1px solid rgba(212, 175, 55, 0.3)',
                        padding: '16px 20px'
                    }}
                    message={
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <BellOutlined style={{ color: '#d4af37', fontSize: 24 }} />
                                <div>
                                    <Text strong style={{ color: '#ffffff', fontSize: 16 }}>Upcoming Event: {nextEvent.event_name}</Text>
                                    <Text style={{ color: '#cbd5e1', fontSize: 12, display: 'block' }}>
                                        Scheduled for {nextEvent.event_date} at {nextEvent.event_time}
                                    </Text>
                                </div>
                            </div>
                            <Tag color="gold" style={{ background: '#d4af37', color: '#0b1b3d', fontSize: 14, fontWeight: 700, padding: '4px 14px', borderRadius: 20 }}>
                                Countdown: {formatCountdown(nextEvent)}
                            </Tag>
                        </div>
                    }
                />
            )}

            <Row gutter={[20, 20]}>
                {/* Left Side: Events List & Calendar */}
                <Col xs={24} lg={16}>
                    <Card
                        className="apex-card"
                        title={
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(212, 175, 55, 0.15)', color: '#d4af37', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
                                    <CalendarOutlined />
                                </div>
                                <Title level={4} style={{ margin: 0, color: '#0b1b3d', fontWeight: 700 }}>Academic Events & Calendar</Title>
                            </div>
                        }
                    >
                        <List
                            loading={loading}
                            dataSource={events}
                            renderItem={(item) => (
                                <List.Item
                                    style={{ padding: '16px 0', borderBottom: '1px solid #f1f5f9' }}
                                    actions={[
                                        <Tooltip key="edit" title="Edit Event">
                                            <Button type="text" icon={<EditOutlined style={{ color: '#1e3a8a' }} />} onClick={() => openEditModal(item)} style={{ borderRadius: 6, background: '#f1f5f9' }} />
                                        </Tooltip>,
                                        <Popconfirm
                                            key="delete"
                                            title="Delete Event"
                                            description="Are you sure to delete this event?"
                                            onConfirm={() => handleDelete(item.id)}
                                            okText="Yes"
                                            cancelText="No"
                                            okButtonProps={{ danger: true }}
                                        >
                                            <Tooltip title="Delete Event">
                                                <Button type="text" danger icon={<DeleteOutlined />} style={{ borderRadius: 6, background: '#fef2f2' }} />
                                            </Tooltip>
                                        </Popconfirm>
                                    ]}
                                >
                                    <List.Item.Meta
                                        avatar={
                                            <div style={{ width: 44, height: 44, borderRadius: 10, background: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                                <CalendarOutlined style={{ color: '#d4af37', fontSize: 18 }} />
                                            </div>
                                        }
                                        title={
                                            <Text strong style={{ color: '#0b1b3d', fontSize: 15 }}>{item.event_name}</Text>
                                        }
                                        description={
                                            <Space direction="vertical" size={2}>
                                                <Text style={{ color: '#64748b', fontSize: 13 }}>{item.event_description || 'No description provided.'}</Text>
                                                <Space size="large" style={{ fontSize: 12, color: '#475569', marginTop: 4 }}>
                                                    <span><CalendarOutlined style={{ marginRight: 4, color: '#1e3a8a' }} />{item.event_date}</span>
                                                    <span><ClockCircleOutlined style={{ marginRight: 4, color: '#1e3a8a' }} />{item.event_time}</span>
                                                    <span><UserOutlined style={{ marginRight: 4, color: '#1e3a8a' }} />Organizer: {item.event_manager}</span>
                                                </Space>
                                            </Space>
                                        }
                                    />
                                </List.Item>
                            )}
                        />
                    </Card>
                </Col>

                {/* Right Side: Add Event Form */}
                <Col xs={24} lg={8}>
                    <Card
                        className="apex-card"
                        title={
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <div style={{ width: 36, height: 36, borderRadius: 8, background: '#0b1b3d', color: '#d4af37', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
                                    <PlusOutlined />
                                </div>
                                <Title level={4} style={{ margin: 0, color: '#0b1b3d', fontWeight: 700 }}>Add New Event</Title>
                            </div>
                        }
                    >
                        <Form form={addForm} layout="vertical" onFinish={handleAddEvent}>
                            <Form.Item name="event_name" label={<Text strong>Event Title</Text>} rules={[{ required: true, message: 'Please enter event title' }]}>
                                <Input placeholder="Annual Sports Day, Science Fair" style={{ borderRadius: 8 }} />
                            </Form.Item>

                            <Form.Item name="event_description" label={<Text strong>Description</Text>}>
                                <TextArea rows={3} placeholder="Event details and instructions" style={{ borderRadius: 8 }} />
                            </Form.Item>

                            <Row gutter={12}>
                                <Col span={12}>
                                    <Form.Item name="event_date" label={<Text strong>Date</Text>} rules={[{ required: true, message: 'Select date' }]}>
                                        <DatePicker style={{ width: '100%', borderRadius: 8 }} />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item name="event_time" label={<Text strong>Time</Text>}>
                                        <TimePicker use12Hours format="h:mm a" style={{ width: '100%', borderRadius: 8 }} />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Form.Item name="event_manager" label={<Text strong>Event Manager / Organizer</Text>} rules={[{ required: true, message: 'Enter organizer name' }]}>
                                <Input placeholder="Principal / Sports Committee" style={{ borderRadius: 8 }} />
                            </Form.Item>

                            <Button type="primary" htmlType="submit" loading={loading} block className="apex-btn-gold" style={{ height: 40, marginTop: 8 }}>
                                Create Event
                            </Button>
                        </Form>
                    </Card>
                </Col>
            </Row>

            {/* Edit Event Modal */}
            <Modal
                title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <EditOutlined style={{ color: '#d4af37' }} />
                        <span>Edit Event Details</span>
                    </div>
                }
                open={isEditModalVisible}
                onCancel={() => {
                    setIsEditModalVisible(false);
                    setEditingEvent(null);
                }}
                footer={null}
                width={550}
                centered
            >
                <Form form={form} layout="vertical" onFinish={handleUpdate} style={{ paddingTop: 12 }}>
                    <Form.Item name="event_name" label={<Text strong>Event Title</Text>} rules={[{ required: true }]}>
                        <Input style={{ borderRadius: 8 }} />
                    </Form.Item>

                    <Form.Item name="event_description" label={<Text strong>Description</Text>}>
                        <TextArea rows={3} style={{ borderRadius: 8 }} />
                    </Form.Item>

                    <Row gutter={12}>
                        <Col span={12}>
                            <Form.Item name="event_date" label={<Text strong>Date</Text>} rules={[{ required: true }]}>
                                <DatePicker style={{ width: '100%', borderRadius: 8 }} />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="event_time" label={<Text strong>Time</Text>}>
                                <TimePicker use12Hours format="h:mm a" style={{ width: '100%', borderRadius: 8 }} />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item name="event_manager" label={<Text strong>Event Manager</Text>} rules={[{ required: true }]}>
                        <Input style={{ borderRadius: 8 }} />
                    </Form.Item>

                    <Button type="primary" htmlType="submit" loading={loading} block className="apex-btn-gold" style={{ height: 40, marginTop: 8 }}>
                        Update Event Record
                    </Button>
                </Form>
            </Modal>
        </div>
    );
};

export default EventCalendar;