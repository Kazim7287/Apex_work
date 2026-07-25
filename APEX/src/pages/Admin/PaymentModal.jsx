/* eslint-disable react/prop-types */
import { useState, useEffect, useRef } from "react";
import { 
  Modal, 
  Form, 
  InputNumber, 
  Select, 
  Button, 
  Input, 
  message, 
  Typography, 
  Row, 
  Col, 
  Divider, 
  Spin, 
  Progress,
  Alert,
  List,
  Card,
  Tag
} from "antd";
import { DollarOutlined, ReloadOutlined, PrinterOutlined } from '@ant-design/icons';
import axios from "axios";
import { useNavigate } from "react-router-dom";

const { Text, Title } = Typography;

const PaymentModal = ({ visible, onCancel, due, onPaymentSuccess, refreshDues }) => {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [paymentProgress, setPaymentProgress] = useState({ paid: 0, total: 0, percentage: 0 });
  const [loading, setLoading] = useState(false);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [manualAmount, setManualAmount] = useState(0);
  const navigate = useNavigate();
  const printRef = useRef();

  // Configure axios to include credentials
  axios.defaults.withCredentials = true;

  useEffect(() => {
    if (visible && due) {
      // Calculate payment progress when modal opens
      calculatePaymentProgress(due);
      
      // Set initial payment amount to remaining balance
      const remaining = (due.amount || 0) - (due.amount_paid || 0);
      setManualAmount(remaining > 0 ? remaining : 0);
      form.setFieldsValue({
        amount_paid: remaining > 0 ? remaining : 0,
        payment_method: 'Cash'
      });
      
      // Fetch payment history
      fetchPaymentHistory(due.id);
    }
  }, [visible, due, form]);

  const fetchPaymentHistory = async (dueId) => {
    try {
     const response = await axios.get('https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/get_payment_history.php', {
        params: { due_id: dueId },
        withCredentials: true
      });
      
      if (response.data.success) {
        setPaymentHistory(response.data.payments || []);
      }
    } catch (error) {
      console.error('Error fetching payment history:', error);
      message.error('Failed to load payment history');
    }
  };

  const calculatePaymentProgress = (dueData) => {
    const paid = dueData.amount_paid || 0;
    const total = dueData.amount || 0;
    const percentage = total > 0 ? Math.min(100, (paid / total) * 100) : 0;
    
    setPaymentProgress({ paid, total, percentage });
  };

  const handleSubmit = async (values) => {
    setSubmitting(true);
    try {
      const paymentData = {
        due_id: due.id,
        amount_paid: parseFloat(manualAmount),
        payment_method: values.payment_method || 'Cash',
        payment_date: new Date().toISOString().split('T')[0],
        notes: values.notes || ''
      };

      const response = await axios.post(
        "https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/process_payment.php", 
        paymentData,
        {
          headers: {
            'Content-Type': 'application/json'
          },
          withCredentials: true
        }
      );

      if (response.status === 401) {
        navigate('/admin-signin');
        return;
      }

      if (response.data.success) {
        // Show detailed success message
        const remaining = response.data.remaining_amount || 0;
        if (remaining > 0) {
          message.success(`Payment of Rs. ${response.data.amount_paid.toLocaleString()} processed! Remaining: Rs. ${remaining.toLocaleString()}`);
        } else {
          message.success("Payment completed in full!");
        }
        
        // Reset form and close modal
        form.resetFields();
        
        // Call success callback with payment data
        if (onPaymentSuccess) {
          onPaymentSuccess(response.data);
        }
        
        // Refresh dues list if provided
        if (refreshDues) {
          refreshDues();
        }
        
        // Refresh payment history
        fetchPaymentHistory(due.id);
      } else {
        message.error(response.data.error || "Failed to process payment");
      }
    } catch (error) {
      console.error("Payment error:", error);
      if (error.response?.status === 401) {
        navigate('/admin-signin');
      } else if (error.response?.data?.error) {
        message.error(error.response.data.error);
      } else {
        message.error("An unexpected error occurred. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleRefresh = async () => {
    if (!due?.id) return;
    
    setLoading(true);
    try {
      const response = await axios.get('https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/get_deus.php', {
        params: { studentId: due.student_id },
        withCredentials: true
      });
      
      const updatedDue = response.data.find(d => d.id === due.id);
      if (updatedDue) {
        calculatePaymentProgress(updatedDue);
        fetchPaymentHistory(due.id);
        message.success('Due information refreshed');
      }
    } catch (error) {
      console.error('Error refreshing due:', error);
      message.error('Failed to refresh due information');
    } finally {
      setLoading(false);
    }
  };

  const handleManualAmountChange = (value) => {
    setManualAmount(value || 0);
  };

  const handlePrint = () => {
    const printContent = printRef.current.innerHTML;
    const originalContent = document.body.innerHTML;
    
    document.body.innerHTML = printContent;
    window.print();
    document.body.innerHTML = originalContent;
    
    // Reload the page to restore functionality
    window.location.reload();
  };

  // Payment method options for the Select component
  const paymentMethodOptions = [
    { value: 'Cash', label: 'Cash' },
    { value: 'Bank Transfer', label: 'Bank Transfer' },
    { value: 'Credit Card', label: 'Credit Card' },
    { value: 'Debit Card', label: 'Debit Card' },
    { value: 'Mobile Payment', label: 'Mobile Payment' },
    { value: 'Other', label: 'Other' },
  ];

  const remainingAmount = (due?.amount || 0) - (due?.amount_paid || 0);
  const isFullyPaid = remainingAmount <= 0;
  const hasPartialPayment = (due?.amount_paid || 0) > 0 && !isFullyPaid;

  // Add null check for due prop
  if (!due) {
    return (
      <Modal
        open={visible}
        onCancel={onCancel}
        footer={null}
        width={800}
        maskClosable={false}
      >
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <Spin size="large" />
          <p style={{ marginTop: 16 }}>Loading payment details...</p>
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span>
            <DollarOutlined style={{ color: '#52c41a', marginRight: 8 }} />
            <Text strong>Process Payment</Text>
          </span>
          <div>
            <Button 
              icon={<PrinterOutlined />} 
              size="small" 
              style={{ marginRight: 8 }}
              onClick={handlePrint}
            >
              Print Receipt
            </Button>
            <Button 
              icon={<ReloadOutlined />} 
              size="small" 
              onClick={handleRefresh}
              loading={loading}
              disabled={loading}
            >
              Refresh
            </Button>
          </div>
        </div>
      }
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={800}
      maskClosable={false}
      destroyOnClose
    >
      <div ref={printRef}>
        <Divider />
        
        {/* Due Information Section */}
        <div style={{ marginBottom: 24 }}>
          <Row gutter={16}>
            <Col span={12}>
              <Text strong>Student: </Text>
              <Text>{due.student_name || 'N/A'}</Text>
            </Col>
            <Col span={12}>
              <Text strong>Due Type: </Text>
              <Text>{due.due_type || 'N/A'}</Text>
            </Col>
          </Row>
          
          <Row gutter={16} style={{ marginTop: 12 }}>
            <Col span={12}>
              <Text strong>Father's Name: </Text>
              <Text>{due.fathers_name || 'N/A'}</Text>
            </Col>
            <Col span={12}>
              <Text strong>Section: </Text>
              <Text>{due.section_name || 'N/A'}</Text>
            </Col>
          </Row>
          
          <Row gutter={16} style={{ marginTop: 12 }}>
            <Col span={12}>
              <Text strong>Total Amount: </Text>
              <Text>Rs. {(due.amount || 0).toLocaleString()}</Text>
            </Col>
            <Col span={12}>
              <Text strong>Status: </Text>
              <Text 
                style={{ 
                  color: due.status === 'Paid' ? '#52c41a' : 
                         due.status === 'Partial' ? '#fa8c16' : '#ff4d4f',
                  fontWeight: 'bold'
                }}
              >
                {due.status || 'Pending'}
              </Text>
            </Col>
          </Row>
          
          {due.due_date && (
            <Row gutter={16} style={{ marginTop: 12 }}>
              <Col span={12}>
                <Text strong>Due Date: </Text>
                <Text>{new Date(due.due_date).toLocaleDateString()}</Text>
              </Col>
              <Col span={12}>
                <Text strong>Issued Date: </Text>
                <Text>{due.issued_date ? new Date(due.issued_date).toLocaleDateString() : 'N/A'}</Text>
              </Col>
            </Row>
          )}
          
          {/* Payment Progress */}
          <div style={{ marginTop: 16 }}>
            <Row gutter={16}>
              <Col span={24}>
                <Text strong>Payment Progress: </Text>
                <div style={{ marginTop: 8 }}>
                  <Progress 
                    percent={paymentProgress.percentage}
                    status={
                      paymentProgress.percentage === 100 ? 'success' : 
                      paymentProgress.percentage > 0 ? 'active' : 'normal'
                    }
                    size="small"
                    strokeColor={
                      paymentProgress.percentage === 100 ? '#52c41a' : 
                      paymentProgress.percentage > 0 ? '#1890ff' : '#d9d9d9'
                    }
                  />
                  <div style={{ marginTop: 4, fontSize: 12, color: '#666' }}>
                    Paid: Rs. {paymentProgress.paid.toLocaleString()} / 
                    Total: Rs. {paymentProgress.total.toLocaleString()}
                  </div>
                </div>
              </Col>
            </Row>
          </div>

          {/* Remaining Amount */}
          {!isFullyPaid && (
            <Row gutter={16} style={{ marginTop: 16 }}>
              <Col span={24}>
                <Alert
                  message={
                    <Text strong style={{ color: '#ff4d4f', fontSize: '16px' }}>
                      Remaining Amount: Rs. {remainingAmount.toLocaleString()}
                    </Text>
                  }
                  type="warning"
                  showIcon
                />
              </Col>
            </Row>
          )}
        </div>

        {!isFullyPaid ? (
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{
              payment_method: 'Cash'
            }}
          >
            <Form.Item
              label="Amount to Pay (PKR)"
              required
            >
              <InputNumber
                style={{ width: '100%' }}
                placeholder="Enter payment amount"
                value={manualAmount}
                onChange={handleManualAmountChange}
                min={0.01}
                max={remainingAmount}
                step={100}
                precision={2}
                formatter={value => `Rs. ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={value => value.replace(/Rs\s?|(,*)/g, '')}
                disabled={submitting}
              />
              <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
                Maximum allowed: Rs. {remainingAmount.toLocaleString()}
              </div>
            </Form.Item>

            <Form.Item
              name="payment_method"
              label="Payment Method"
              rules={[{ required: true, message: "Please select a payment method!" }]}
            >
              <Select 
                placeholder="Select payment method"
                options={paymentMethodOptions}
                disabled={submitting}
              />
            </Form.Item>

            <Form.Item
              name="notes"
              label="Payment Notes (Optional)"
            >
              <Input.TextArea 
                rows={3} 
                placeholder="Additional notes about this payment (receipt number, transaction ID, etc.)" 
                maxLength={500}
                showCount
                disabled={submitting}
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={submitting}
                disabled={submitting || manualAmount <= 0}
                icon={<DollarOutlined />}
                style={{ 
                  width: '100%', 
                  height: '48px',
                  fontSize: '16px',
                  fontWeight: 'bold'
                }}
                size="large"
              >
                {submitting ? 'Processing Payment...' : `Pay Rs. ${manualAmount.toLocaleString()}`}
              </Button>
            </Form.Item>
          </Form>
        ) : (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <DollarOutlined style={{ fontSize: 48, color: '#52c41a', marginBottom: 16 }} />
            <Title level={4} style={{ color: '#52c41a', marginBottom: 8 }}>
              Payment Completed
            </Title>
            <Text style={{ fontSize: '16px', display: 'block', marginBottom: 16 }}>
              This due has been fully paid. Total paid: Rs. {(due.amount_paid || 0).toLocaleString()}
            </Text>
            {due.paid_date && (
              <Text style={{ color: '#666', display: 'block', marginBottom: 16 }}>
                Paid on: {new Date(due.paid_date).toLocaleDateString()}
              </Text>
            )}
            <Button 
              type="primary" 
              onClick={onCancel}
              size="large"
            >
              Close
            </Button>
          </div>
        )}

        {/* Payment History Section */}
        {paymentHistory.length > 0 && (
          <div style={{ marginTop: 24 }}>
            <Divider />
            <Title level={5}>Payment History</Title>
            <List
              dataSource={paymentHistory}
              renderItem={(payment) => (
                <List.Item>
                  <Card size="small" style={{ width: '100%' }}>
                    <Row gutter={16} align="middle">
                      <Col span={6}>
                        <Text strong>Date:</Text>
                        <br />
                        <Text>{new Date(payment.payment_date).toLocaleDateString()}</Text>
                      </Col>
                      <Col span={6}>
                        <Text strong>Amount:</Text>
                        <br />
                        <Text>Rs. {parseFloat(payment.amount_paid).toLocaleString()}</Text>
                      </Col>
                      <Col span={6}>
                        <Text strong>Method:</Text>
                        <br />
                        <Tag color="blue">{payment.payment_method}</Tag>
                      </Col>
                      <Col span={6}>
                        <Text strong>Notes:</Text>
                        <br />
                        <Text>{payment.notes || 'N/A'}</Text>
                      </Col>
                    </Row>
                  </Card>
                </List.Item>
              )}
            />
          </div>
        )}
      </div>
    </Modal>
  );
};

export default PaymentModal;