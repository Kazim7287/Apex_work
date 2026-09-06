/* eslint-disable react/prop-types */
import { Modal, Form, Select, TimePicker, Button } from "antd";
const { Option } = Select;

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const ScheduleModal = ({ visible, onCancel, selectedRecord, windowWidth, onSubmit }) => {
    const [form] = Form.useForm();

    const handleFinish = (values) => {
        const [start, end] = values.time_range;
        onSubmit({
            day: values.day,
            start_time: start.format('HH:mm:ss'),
            end_time: end.format('HH:mm:ss'),
        });
    };

    return (
        <Modal
            title={`Schedule Time for ${selectedRecord?.teach_name} - ${selectedRecord?.subject_name}`}
            visible={visible}
            onCancel={onCancel}
            footer={null}
            className={`schedule-modal ${windowWidth < 768 ? 'mobile' : ''}`}
            width={windowWidth < 768 ? '95%' : windowWidth < 992 ? '80%' : '50%'}
            bodyStyle={{ 
                padding: windowWidth < 768 ? '12px' : '24px',
                maxHeight: '70vh',
                overflowY: 'auto'
            }}
        >
            <Form 
                form={form} 
                layout="vertical" 
                onFinish={handleFinish}
                className="schedule-form"
            >
                <Form.Item
                    name="day"
                    label={<span className="form-label">Day</span>}
                    rules={[{ required: true, message: 'Please select a day' }]}
                >
                    <Select 
                        placeholder="Select day"
                        className="day-select"
                        size={windowWidth < 768 ? "large" : "middle"}
                    >
                        {days.map(day => (
                            <Option key={day} value={day}>{day}</Option>
                        ))}
                    </Select>
                </Form.Item>

                <Form.Item
                    name="time_range"
                    label={<span className="form-label">Time Slot</span>}
                    rules={[{ required: true, message: 'Please select time slot' }]}
                >
                    <TimePicker.RangePicker 
                        format="HH:mm"
                        minuteStep={1}
                        className="time-range-picker"
                        size={windowWidth < 768 ? "large" : "middle"}
                        style={{ width: '100%' }}
                        popupStyle={{
                            width: windowWidth < 768 ? '90vw' : 'auto'
                        }}
                    />
                </Form.Item>

                <Form.Item className="form-submit-item">
                    <Button 
                        type="primary" 
                        htmlType="submit" 
                        block 
                        className="save-btn"
                        size={windowWidth < 768 ? "large" : "middle"}
                    >
                        Save Schedule
                    </Button>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default ScheduleModal;