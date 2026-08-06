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
  const [inputValue, setInputValue] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [updatedDue, setUpdatedDue] = useState(null);
  const navigate = useNavigate();
  const printRef = useRef();

  // Configure axios to include credentials
  axios.defaults.withCredentials = true;

  useEffect(() => {
    if (visible && due) {
      // Reset state when modal opens with new due
      setUpdatedDue(null);
      loadDueData(due);
    }
  }, [visible, due]);

  const loadDueData = async (dueData) => {
    setLoading(true);
    try {
      // Calculate payment progress
      calculatePaymentProgress(dueData);
      
      // Set initial payment amount to remaining balance
      const remaining = (dueData.amount || 0) - (dueData.amount_paid || 0);
      const initialAmount = remaining > 0 ? remaining : 0;
      setManualAmount(initialAmount);
      setInputValue(initialAmount.toString());
      form.setFieldsValue({
        payment_method: 'Cash'
      });
      
      // Fetch payment history
      await fetchPaymentHistory(dueData.id);
    } catch (error) {
      console.error('Error loading due data:', error);
      message.error('Failed to load payment details');
    } finally {
      setLoading(false);
    }
  };

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
        
        // Reset form
        form.resetFields();
        
        // Call success callback with payment data
        if (onPaymentSuccess) {
          onPaymentSuccess(response.data);
        }
        
        // Refresh dues list if provided
        if (refreshDues) {
          await refreshDues();
        }
        
        // Refresh the modal data with updated due information
        await refreshModalData();
        
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

  const refreshModalData = async () => {
    setRefreshing(true);
    try {
      // Fetch updated due information
      const response = await axios.get('https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/get_deus.php', {
        params: { studentId: due.student_id },
        withCredentials: true
      });
      
      const updatedDueData = response.data.find(d => d.id === due.id);
      if (updatedDueData) {
        setUpdatedDue(updatedDueData);
        // Update the due object with fresh data
        Object.assign(due, updatedDueData);
        
        // Recalculate payment progress
        calculatePaymentProgress(updatedDueData);
        
        // Update remaining amount in input
        const remaining = (updatedDueData.amount || 0) - (updatedDueData.amount_paid || 0);
        const initialAmount = remaining > 0 ? remaining : 0;
        setManualAmount(initialAmount);
        setInputValue(initialAmount.toString());
        
        // Refresh payment history
        await fetchPaymentHistory(due.id);
        
        message.success('Payment details refreshed');
      }
    } catch (error) {
      console.error('Error refreshing modal data:', error);
      message.error('Failed to refresh payment details');
    } finally {
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    if (!due?.id) return;
    await refreshModalData();
  };

  const handleManualAmountChange = (value) => {
    const numValue = value !== null && value !== undefined && !isNaN(value) ? value : 0;
    setManualAmount(numValue);
    setInputValue(numValue.toString());
  };

  const handleInputChange = (e) => {
    const rawValue = e.target.value;
    const cleanedValue = rawValue.replace(/[^0-9.]/g, '');
    setInputValue(cleanedValue);
    
    const numValue = parseFloat(cleanedValue);
    if (!isNaN(numValue) && numValue >= 0) {
      setManualAmount(numValue);
    } else if (cleanedValue === '' || cleanedValue === '.') {
      setManualAmount(0);
    }
  };

  const handleInputBlur = () => {
    if (manualAmount > 0) {
      setInputValue(manualAmount.toString());
    }
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

  // Use updatedDue if available, otherwise use due
  const currentDue = updatedDue || due;
  const remainingAmount = (currentDue?.amount || 0) - (currentDue?.amount_paid || 0);
  const isFullyPaid = remainingAmount <= 0;

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
              loading={refreshing || loading}
              disabled={refreshing || loading}
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
      <Spin spinning={loading || refreshing} tip="Loading...">
        <div ref={printRef}>
          <Divider />
          
          {/* Due Information Section */}
          <div style={{ marginBottom: 24 }}>
            <Row gutter={16}>
              <Col span={12}>
                <Text strong>Student: </Text>
                <Text>{currentDue.student_name || 'N/A'}</Text>
              </Col>
              <Col span={12}>
                <Text strong>Due Type: </Text>
                <Text>{currentDue.due_type || 'N/A'}</Text>
              </Col>
            </Row>
            
            <Row gutter={16} style={{ marginTop: 12 }}>
              <Col span={12}>
                <Text strong>Father's Name: </Text>
                <Text>{currentDue.fathers_name || 'N/A'}</Text>
              </Col>
              <Col span={12}>
                <Text strong>Section: </Text>
                <Text>{currentDue.section_name || 'N/A'}</Text>
              </Col>
            </Row>
            
            <Row gutter={16} style={{ marginTop: 12 }}>
              <Col span={12}>
                <Text strong>Total Amount: </Text>
                <Text>Rs. {(currentDue.amount || 0).toLocaleString()}</Text>
              </Col>
              <Col span={12}>
                <Text strong>Status: </Text>
                <Text 
                  style={{ 
                    color: currentDue.status === 'Paid' ? '#52c41a' : 
                           currentDue.status === 'Partial' ? '#fa8c16' : '#ff4d4f',
                    fontWeight: 'bold'
                  }}
                >
                  {currentDue.status || 'Pending'}
                </Text>
              </Col>
            </Row>
            
            {currentDue.due_date && (
              <Row gutter={16} style={{ marginTop: 12 }}>
                <Col span={12}>
                  <Text strong>Due Date: </Text>
                  <Text>{new Date(currentDue.due_date).toLocaleDateString()}</Text>
                </Col>
                <Col span={12}>
                  <Text strong>Issued Date: </Text>
                  <Text>{currentDue.issued_date ? new Date(currentDue.issued_date).toLocaleDateString() : 'N/A'}</Text>
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
                <div style={{ position: 'relative' }}>
                  <span style={{ 
                    position: 'absolute', 
                    left: '12px', 
                    top: '50%', 
                    transform: 'translateY(-50%)',
                    zIndex: 1,
                    fontWeight: 'bold',
                    color: '#666'
                  }}>
                    Rs.
                  </span>
                  <Input
                    type="text"
                    value={inputValue}
                    onChange={handleInputChange}
                    onBlur={handleInputBlur}
                    placeholder="Enter payment amount"
                    disabled={submitting || loading || refreshing}
                    style={{ 
                      width: '100%', 
                      paddingLeft: '50px',
                      height: '40px',
                      fontSize: '16px'
                    }}
                    maxLength={15}
                  />
                </div>
                <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
                  Maximum allowed: Rs. {remainingAmount.toLocaleString()}
                </div>
                <div style={{ marginTop: 4, fontSize: 12, color: '#999' }}>
                  Enter only numbers (e.g., 2000)
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
                  disabled={submitting || loading || refreshing}
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
                  disabled={submitting || loading || refreshing}
                />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={submitting}
                  disabled={submitting || loading || refreshing || manualAmount <= 0 || manualAmount > remainingAmount}
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
                This due has been fully paid. Total paid: Rs. {(currentDue.amount_paid || 0).toLocaleString()}
              </Text>
              {currentDue.paid_date && (
                <Text style={{ color: '#666', display: 'block', marginBottom: 16 }}>
                  Paid on: {new Date(currentDue.paid_date).toLocaleDateString()}
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
      </Spin>
    </Modal>
  );
};

export default PaymentModal;