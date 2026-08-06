import { useState, useEffect } from "react";
import { 
  Table, Card, Typography, Button, Space, Tag, DatePicker, 
  Select, Input, message, Modal, Form, InputNumber, Row, Col, Spin, Empty,
  Grid, Dropdown, Menu, Popconfirm
} from "antd";
import moment from "moment";
import axios from "axios";
import { 
  SearchOutlined, EditOutlined, DeleteOutlined, 
  DollarOutlined, PlusOutlined, FilterOutlined,
  MoreOutlined, PrinterOutlined, DeleteFilled
} from '@ant-design/icons';
import { useNavigate } from "react-router-dom";
import PaymentModal from "./PaymentModal";

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { useBreakpoint } = Grid;

const DuesListing = () => {
  const navigate = useNavigate();
  const screens = useBreakpoint();
  const isMobile = !screens.md;
  const isSmallMobile = !screens.sm;
  
  // State for table and filters
  const [loading, setLoading] = useState(false);
  const [dues, setDues] = useState([]);
  const [filters, setFilters] = useState({
    status: null,
    dueType: null,
    dateRange: null,
    search: ''
  });
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });

  // State for modal and form
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [sections, setSections] = useState([]);
  const [students, setStudents] = useState([]);
  const [sectionsLoading, setSectionsLoading] = useState(false);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [filterVisible, setFilterVisible] = useState(false);
  const [editingStatus, setEditingStatus] = useState({});
  const [amountValue, setAmountValue] = useState('');

  // State for bulk selection
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [isBulkDeleteModalVisible, setIsBulkDeleteModalVisible] = useState(false);

  // Payment modal state
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [selectedDue, setSelectedDue] = useState(null);

  const statusColors = {
    Pending: 'orange',
    Paid: 'green',
    Cancelled: 'red'
  };

  const dueTypes = [
    "Tuition Fee",
    "Library Fine",
    "Lab Charges",
    "Sports Fee",
    "Transport Fee",
    "Other"
  ];

  // Create axios instances
  const publicApi = axios.create({
    baseURL: 'https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/',
    withCredentials: false,
    headers: {
      'Content-Type': 'application/json'
    }
  });

  const authApi = axios.create({
    baseURL: 'https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/',
    withCredentials: true,
    headers: {
      'Content-Type': 'application/json'
    }
  });

  // Fetch initial data
  useEffect(() => {
    fetchDues();
    fetchSections();
  }, [pagination.current, filters]);

  const fetchDues = async () => {
    setLoading(true);
    try {
      const params = {
        status: filters.status,
        dueType: filters.dueType,
      };

      if (filters.search) {
        params.studentId = filters.search;
      }

      if (filters.dateRange && filters.dateRange[0] && filters.dateRange[1]) {
        params.dateFrom = filters.dateRange[0].format('YYYY-MM-DD');
        params.dateTo = filters.dateRange[1].format('YYYY-MM-DD');
      }

      const response = await publicApi.get('get_deus.php', { params });
      
      // Transform the data to match expected format
      const formattedDues = response.data.map(due => ({
        ...due,
        student_name: due.student_name || 'N/A',
        fathers_name: due.fathers_name || 'N/A',
        section_name: due.section_name || 'N/A',
        due_type: due.due_type || 'Other',
        amount: parseFloat(due.amount) || 0,
        due_date: due.due_date,
        status: due.status || 'Pending'
      }));
      
      setDues(formattedDues);
      setPagination({
        ...pagination,
        total: formattedDues.length
      });
      
      // Clear selection when data changes
      setSelectedRowKeys([]);
    } catch (error) {
      if (error.response?.status === 401) {
        navigate('/admin-signin');
      } else {
        message.error('Failed to fetch dues');
        console.error('Error:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchSections = async () => {
    setSectionsLoading(true);
    try {
      const response = await publicApi.get("Sec_Read.php");
      
      if (response.status === 401) {
        navigate('/admin-signin');
        return;
      }
      
      setSections(response.data);
    } catch (error) {
      if (error.response?.status === 401) {
        navigate('/admin-signin');
      } else {
        message.error("Failed to fetch sections");
        console.error("Error fetching sections:", error);
      }
    } finally {
      setSectionsLoading(false);
    }
  };

  const fetchStudents = async (sectionId) => {
    if (!sectionId) {
      setStudents([]);
      form.setFieldsValue({ student_id: undefined });
      return;
    }
    
    setStudentsLoading(true);
    try {
      const response = await publicApi.post(
        "secAdStudents.php",
        { section_id: sectionId }
      );

      if (response.status === 401) {
        navigate('/admin-signin');
        return;
      }

      if (response.data.success) {
        setStudents(response.data.section_students);
      } else {
        message.error(response.data.error || "Failed to fetch students");
        setStudents([]);
      }
    } catch (error) {
      if (error.response?.status === 401) {
        navigate('/admin-signin');
      } else {
        message.error("Failed to fetch students");
        console.error("Error fetching students:", error);
        setStudents([]);
      }
    } finally {
      setStudentsLoading(false);
    }
  };

  // Calculate total amounts
  const calculateTotals = () => {
    const totalAmount = dues.reduce((sum, due) => sum + (due.amount || 0), 0);
    
    const pendingAmount = dues
      .filter(due => due.status && due.status.toLowerCase() === 'pending')
      .reduce((sum, due) => sum + (due.amount || 0), 0);
    
    const paidAmount = dues
      .filter(due => due.status && due.status.toLowerCase() === 'paid')
      .reduce((sum, due) => sum + (due.amount || 0), 0);
    
    return {
      totalAmount,
      pendingAmount,
      paidAmount,
      pendingCount: dues.filter(due => due.status && due.status.toLowerCase() === 'pending').length,
      paidCount: dues.filter(due => due.status && due.status.toLowerCase() === 'paid').length,
      cancelledCount: dues.filter(due => due.status && due.status.toLowerCase() === 'cancelled').length
    };
  };

  // Handle bulk delete
  const handleBulkDelete = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('Please select at least one due to delete');
      return;
    }
    setIsBulkDeleteModalVisible(true);
  };

  const confirmBulkDelete = async () => {
    try {
      setLoading(true);
      setIsBulkDeleteModalVisible(false);
      
      const response = await authApi.delete('delete_deus.php', {
        data: { ids: selectedRowKeys }
      });

      if (response.data.success) {
        message.success(response.data.message);
        setSelectedRowKeys([]);
        fetchDues();
      } else {
        throw new Error(response.data.error || 'Bulk delete failed');
      }
    } catch (error) {
      message.error(error.response?.data?.error || error.message || 'Error performing bulk delete');
      console.error('Bulk delete error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Print functionality
  const handlePrint = () => {
    const totals = calculateTotals();
    const printWindow = window.open('', '_blank');
    
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Dues Report</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 20px; }
          .summary { margin-bottom: 20px; padding: 15px; border: 1px solid #ddd; border-radius: 5px; background-color: #f9f9f9; }
          .summary-row { display: flex; justify-content: space-between; margin-bottom: 10px; }
          .summary-label { font-weight: bold; }
          .table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          .table th, .table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          .table th { background-color: #f2f2f2; }
          .footer { margin-top: 30px; text-align: right; font-size: 12px; }
          .status-pending { color: orange; }
          .status-paid { color: green; }
          .status-cancelled { color: red; }
          @media print {
            body { margin: 0; padding: 15px; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Dues Report</h1>
          <p>Generated on: ${moment().format('MMMM Do YYYY, h:mm:ss a')}</p>
        </div>
        
        <div class="summary">
          <h2>Summary</h2>
          <div class="summary-row">
            <span class="summary-label">Total Dues Amount:</span>
            <span>Rs. ${totals.totalAmount.toLocaleString()}</span>
          </div>
          <div class="summary-row">
            <span class="summary-label">Pending Amount:</span>
            <span>Rs. ${totals.pendingAmount.toLocaleString()} (${totals.pendingCount} dues)</span>
          </div>
          <div class="summary-row">
            <span class="summary-label">Paid Amount:</span>
            <span>Rs. ${totals.paidAmount.toLocaleString()} (${totals.paidCount} dues)</span>
          </div>
          <div class="summary-row">
            <span class="summary-label">Cancelled Dues:</span>
            <span>${totals.cancelledCount} dues</span>
          </div>
        </div>
        
        <h2>Dues Details</h2>
        <table class="table">
          <thead>
            <tr>
              <th>Student Name</th>
              <th>Father's Name</th>
              <th>Section</th>
              <th>Due Type</th>
              <th>Amount</th>
              <th>Due Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${dues.map(due => `
              <tr>
                <td>${due.student_name}</td>
                <td>${due.fathers_name}</td>
                <td>${due.section_name}</td>
                <td>${due.due_type}</td>
                <td>Rs. ${due.amount.toLocaleString()}</td>
                <td>${moment(due.due_date).format('DD/MM/YYYY')}</td>
                <td class="status-${due.status.toLowerCase()}">${due.status}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div class="footer">
          <p>Generated by Apex School Management System</p>
        </div>
        
        <script>
          window.onload = function() {
            window.print();
            setTimeout(function() {
              window.close();
            }, 500);
          }
        </script>
      </body>
      </html>
    `;
    
    printWindow.document.write(printContent);
    printWindow.document.close();
  };

  // Table handlers
  const handleTableChange = (pagination) => {
    setPagination(pagination);
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await authApi.put('update_deus.php', {
        id,
        status: newStatus
      });
      message.success('Status updated successfully');
      setEditingStatus(prev => ({ ...prev, [id]: false }));
      fetchDues();
    } catch (error) {
      if (error.response?.status === 401) {
        navigate('/admin-signin');
      } else {
        message.error('Failed to update status');
        console.error('Error:', error);
      }
    }
  };

  const handleDelete = async (id) => {
    Modal.confirm({
      title: 'Confirm Delete',
      content: 'Are you sure you want to delete this due?',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk: async () => {
        try {
          const response = await authApi.delete('delete_deus.php', {
            data: { id }
          });
          if (response.data.success) {
            message.success(response.data.message);
            fetchDues();
          }
        } catch (error) {
          if (error.response?.status === 401) {
            navigate('/admin-signin');
          } else {
            message.error('Failed to delete due');
            console.error('Error:', error);
          }
        }
      }
    });
  };

  // Payment modal handlers
  const showPaymentModal = (due) => {
    setSelectedDue(due);
    setPaymentModalVisible(true);
  };

  const handlePaymentSuccess = () => {
    fetchDues();
    message.success('Payment processed successfully!');
  };

  // Modal handlers
  const showModal = () => {
    setIsModalVisible(true);
    setAmountValue('');
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
    setStudents([]);
    setAmountValue('');
  };

  const handleAmountChange = (value) => {
    setAmountValue(value);
    form.setFieldsValue({ amount: value });
  };

  const handleSubmit = async (values) => {
    setSubmitting(true);
    try {
      const formattedValues = {
        student_id: values.student_id,
        section_id: values.section_id,
        due_type: values.due_type,
        amount: parseFloat(values.amount) || 0,
        due_date: values.due_date.format('YYYY-MM-DD'),
        description: values.description || null
      };

      const response = await authApi.post("inser_deus.php", formattedValues);

      if (response.status === 401) {
        navigate('/admin-signin');
        return;
      }

      if (response.data.success) {
        message.success(response.data.message || "Dues issued successfully!");
        form.resetFields();
        setStudents([]);
        setIsModalVisible(false);
        setAmountValue('');
        fetchDues();
      } else {
        message.error(response.data.error || "Failed to issue dues");
      }
    } catch (error) {
      if (error.response?.status === 401) {
        navigate('/admin-signin');
      } else {
        const errorData = error.response?.data;
        if (errorData?.missing_fields) {
          message.error(`Missing fields: ${errorData.missing_fields.join(', ')}`);
        } else {
          message.error(errorData?.error || "An unexpected error occurred");
        }
        console.error("Error:", error);
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Format amount for display
  const formatAmount = (value) => {
    if (!value) return '';
    const numberValue = parseFloat(value);
    if (isNaN(numberValue)) return value;
    return `Rs. ${numberValue.toLocaleString()}`;
  };

  // Parse amount from formatted string
  const parseAmount = (value) => {
    if (!value) return '';
    return value.replace(/Rs\s?|(,*)/g, '');
  };

  // Row selection configuration
  const rowSelection = {
    selectedRowKeys,
    onChange: (selectedKeys) => {
      setSelectedRowKeys(selectedKeys);
    },
    selections: [
      Table.SELECTION_ALL,
      Table.SELECTION_INVERT,
      Table.SELECTION_NONE,
    ],
  };

  // Table columns
  const columns = [
    {
      title: 'Student',
      dataIndex: 'student_name',
      key: 'student_name',
      fixed: isMobile ? 'left' : false,
      width: isMobile ? 120 : undefined,
      render: (text, record) => (
        <div>
          <Text strong style={{ fontSize: isSmallMobile ? '12px' : '14px' }}>{text}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: isSmallMobile ? '10px' : '12px' }}>
            Father: {record.fathers_name}
          </Text>
        </div>
      )
    },
    {
      title: 'Section',
      dataIndex: 'section_name',
      key: 'section_name',
      render: (text) => (
        <Text style={{ fontSize: isSmallMobile ? '11px' : '13px' }}>{text}</Text>
      ),
      width: isMobile ? 100 : undefined,
    },
    {
      title: 'Due Type',
      dataIndex: 'due_type',
      key: 'due_type',
      render: (text) => (
        <Text style={{ fontSize: isSmallMobile ? '11px' : '13px' }}>{text}</Text>
      ),
      width: isMobile ? 100 : undefined,
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: amount => (
        <Text strong style={{ fontSize: isSmallMobile ? '11px' : '13px' }}>
          Rs. {amount.toLocaleString()}
        </Text>
      ),
      width: isMobile ? 80 : undefined,
    },
    {
      title: 'Due Date',
      dataIndex: 'due_date',
      key: 'due_date',
      render: date => (
        <Text style={{ fontSize: isSmallMobile ? '11px' : '13px' }}>
          {moment(date).format('DD/MM/YYYY')}
        </Text>
      ),
      width: isMobile ? 90 : undefined,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status, record) => {
        const normalizedStatus = status ? status.charAt(0).toUpperCase() + status.slice(1).toLowerCase() : 'Pending';
        const statusColor = statusColors[normalizedStatus] || 'default';
        
        return (
          <Tag 
            color={statusColor} 
            style={{ 
              fontSize: isSmallMobile ? '10px' : '12px',
              padding: isSmallMobile ? '2px 6px' : '4px 8px',
              cursor: 'pointer'
            }}
            onClick={() => setEditingStatus(prev => ({ ...prev, [record.id]: true }))}
          >
            {normalizedStatus}
          </Tag>
        );
      },
      width: isMobile ? 80 : undefined,
    },
    {
      title: 'Actions',
      key: 'actions',
      fixed: isMobile ? 'right' : false,
      width: isMobile ? 120 : 200,
      render: (_, record) => (
        <Space size="small">
          {editingStatus[record.id] ? (
            <Select
              defaultValue={record.status}
              style={{ width: 100 }}
              onChange={(value) => handleStatusUpdate(record.id, value)}
              size="small"
              autoFocus
              onBlur={() => setEditingStatus(prev => ({ ...prev, [record.id]: false }))}
            >
              <Option value="Pending">Pending</Option>
              <Option value="Paid">Paid</Option>
              <Option value="Cancelled">Cancelled</Option>
            </Select>
          ) : isMobile ? (
            <Dropdown
              overlay={
                <Menu>
                  <Menu.Item 
                    key="pay" 
                    icon={<DollarOutlined />}
                    onClick={() => showPaymentModal(record)}
                    disabled={record.status === 'Paid'}
                  >
                    Make Payment
                  </Menu.Item>
                  <Menu.Item 
                    key="status" 
                    onClick={() => setEditingStatus(prev => ({ ...prev, [record.id]: true }))}
                  >
                    Change Status
                  </Menu.Item>
                  <Menu.Item 
                    key="delete" 
                    icon={<DeleteOutlined />}
                    danger
                    onClick={() => handleDelete(record.id)}
                  >
                    Delete
                  </Menu.Item>
                </Menu>
              }
              trigger={['click']}
              placement="bottomRight"
            >
              <Button 
                type="text" 
                icon={<MoreOutlined />} 
                size="small"
              />
            </Dropdown>
          ) : (
            <>
              <Button 
                type="primary" 
                size="small"
                icon={<DollarOutlined />}
                onClick={() => showPaymentModal(record)}
                disabled={record.status === 'Paid'}
              >
                Pay
              </Button>
              <Button 
                type="default" 
                size="small"
                onClick={() => setEditingStatus(prev => ({ ...prev, [record.id]: true }))}
              >
                Status
              </Button>
              <Button 
                danger 
                icon={<DeleteOutlined />} 
                size="small"
                onClick={() => handleDelete(record.id)}
              />
            </>
          )}
        </Space>
      )
    }
  ];

  const FilterSection = () => (
    <div style={{ 
      display: 'flex', 
      flexDirection: isMobile ? 'column' : 'row', 
      gap: '8px',
      marginBottom: '16px',
      flexWrap: 'wrap'
    }}>
      <Select
        placeholder="Status"
        style={{ width: isMobile ? '100%' : 120 }}
        allowClear
        value={filters.status}
        onChange={value => setFilters({...filters, status: value})}
        size={isSmallMobile ? 'small' : 'middle'}
      >
        <Option value="Pending">Pending</Option>
        <Option value="Paid">Paid</Option>
        <Option value="Cancelled">Cancelled</Option>
      </Select>
      
      <Select
        placeholder="Type"
        style={{ width: isMobile ? '100%' : 140 }}
        allowClear
        value={filters.dueType}
        onChange={value => setFilters({...filters, dueType: value})}
        size={isSmallMobile ? 'small' : 'middle'}
      >
        {dueTypes.map(type => (
          <Option key={type} value={type}>{type}</Option>
        ))}
      </Select>
      
      <RangePicker 
        value={filters.dateRange}
        onChange={dates => setFilters({...filters, dateRange: dates})}
        style={{ width: isMobile ? '100%' : 240 }}
        size={isSmallMobile ? 'small' : 'middle'}
      />
      
      <Input
        placeholder="Search by student ID"
        prefix={<SearchOutlined />}
        value={filters.search}
        onChange={e => setFilters({...filters, search: e.target.value})}
        style={{ width: isMobile ? '100%' : 200 }}
        size={isSmallMobile ? 'small' : 'middle'}
      />
    </div>
  );

  // Calculate totals for display
  const totals = calculateTotals();

  return (
    <div style={{ 
      padding: isSmallMobile ? '12px' : (isMobile ? '16px' : '24px'),
      background: '#f5f7fa',
      minHeight: '100vh'
    }}>
      <Card 
        title={
          <Title level={isSmallMobile ? 5 : (isMobile ? 4 : 4)} style={{ margin: 0 }}>
            Manage Dues
          </Title>
        }
        bordered={false}
        extra={
          <Space wrap>
            {selectedRowKeys.length > 0 && (
              <Button 
                danger
                icon={<DeleteFilled />}
                onClick={handleBulkDelete}
                loading={loading}
                size={isSmallMobile ? 'small' : 'middle'}
              >
                Delete Selected ({selectedRowKeys.length})
              </Button>
            )}
            <Button 
              icon={<PrinterOutlined />}
              onClick={handlePrint}
              size={isSmallMobile ? 'small' : 'middle'}
            >
              {isMobile ? 'Print' : 'Print Report'}
            </Button>
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={showModal}
              size={isSmallMobile ? 'small' : 'middle'}
            >
              {isMobile ? 'New Due' : 'Issue New Dues'}
            </Button>
          </Space>
        }
        style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.09)' }}
      >
        {/* Summary Cards */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={12} sm={8} md={6}>
            <Card size="small" style={{ textAlign: 'center' }}>
              <Title level={5} style={{ margin: 0, color: '#1890ff' }}>
                Total Dues
              </Title>
              <Text strong style={{ fontSize: '18px' }}>
                Rs. {totals.totalAmount.toLocaleString()}
              </Text>
              <div>
                <Text type="secondary">
                  ({dues.length} dues)
                </Text>
              </div>
            </Card>
          </Col>
          <Col xs={12} sm={8} md={6}>
            <Card size="small" style={{ textAlign: 'center' }}>
              <Title level={5} style={{ margin: 0, color: '#fa8c16' }}>
                Pending
              </Title>
              <Text strong style={{ fontSize: '18px' }}>
                Rs. {totals.pendingAmount.toLocaleString()}
              </Text>
              <div>
                <Text type="secondary">
                  ({totals.pendingCount} dues)
                </Text>
              </div>
            </Card>
          </Col>
          <Col xs={12} sm={8} md={6}>
            <Card size="small" style={{ textAlign: 'center' }}>
              <Title level={5} style={{ margin: 0, color: '#52c41a' }}>
                Paid
              </Title>
              <Text strong style={{ fontSize: '18px' }}>
                Rs. {totals.paidAmount.toLocaleString()}
              </Text>
              <div>
                <Text type="secondary">
                  ({totals.paidCount} dues)
                </Text>
              </div>
            </Card>
          </Col>
          <Col xs={12} sm={8} md={6}>
            <Card size="small" style={{ textAlign: 'center' }}>
              <Title level={5} style={{ margin: 0, color: '#f5222d' }}>
                Cancelled
              </Title>
              <Text strong style={{ fontSize: '18px' }}>
                {totals.cancelledCount}
              </Text>
              <div>
                <Text type="secondary">
                  dues
                </Text>
              </div>
            </Card>
          </Col>
        </Row>

        {isMobile ? (
          <>
            <Button 
              icon={<FilterOutlined />}
              onClick={() => setFilterVisible(!filterVisible)}
              style={{ marginBottom: 16 }}
              size="small"
            >
              {filterVisible ? 'Hide Filters' : 'Show Filters'}
            </Button>
            {filterVisible && <FilterSection />}
          </>
        ) : (
          <FilterSection />
        )}
        
        {/* Selected count indicator */}
        {selectedRowKeys.length > 0 && (
          <div style={{ marginBottom: 16, padding: '8px 12px', background: '#e6f7ff', borderRadius: 4 }}>
            <Text>
              Selected <strong>{selectedRowKeys.length}</strong> due(s)
            </Text>
          </div>
        )}
        
        <Table
          columns={columns}
          dataSource={dues}
          rowKey="id"
          rowSelection={rowSelection}
          loading={loading}
          pagination={{
            ...pagination,
            showSizeChanger: false,
            size: isSmallMobile ? 'small' : 'default',
            simple: isMobile,
            showTotal: (total, range) => 
              isMobile ? `${range[0]}-${range[1]} of ${total}` : `Showing ${range[0]}-${range[1]} of ${total} items`
          }}
          onChange={handleTableChange}
          scroll={{ x: true }}
          size={isSmallMobile ? 'small' : (isMobile ? 'middle' : 'default')}
        />
      </Card>

      {/* Bulk Delete Confirmation Modal */}
      <Modal
        title="Confirm Bulk Delete"
        open={isBulkDeleteModalVisible}
        onOk={confirmBulkDelete}
        onCancel={() => setIsBulkDeleteModalVisible(false)}
        okText="Yes, Delete All"
        cancelText="Cancel"
        okButtonProps={{ danger: true, loading: loading }}
      >
        <p>
          Are you sure you want to delete <strong>{selectedRowKeys.length}</strong> selected due(s)?
        </p>
        <p style={{ color: '#ff4d4f' }}>
          This action cannot be undone.
        </p>
        <div style={{ marginTop: 16, maxHeight: 200, overflowY: 'auto' }}>
          {dues
            .filter(d => selectedRowKeys.includes(d.id))
            .map(d => (
              <div key={d.id} style={{ padding: '4px 0', borderBottom: '1px solid #f0f0f0' }}>
                <Text>ID: {d.id} - {d.student_name} (Rs. {d.amount.toLocaleString()})</Text>
              </div>
            ))
          }
        </div>
      </Modal>

      {/* Issue New Dues Modal */}
      <Modal
        title={
          <Space>
            <DollarOutlined style={{ color: '#1890ff' }} />
            <Text strong style={{ fontSize: isSmallMobile ? '16px' : '18px' }}>
              Issue New Dues
            </Text>
          </Space>
        }
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        width={isSmallMobile ? '95%' : (isMobile ? '90%' : 800)}
        bodyStyle={{ 
          padding: isSmallMobile ? '12px' : (isMobile ? '16px' : '24px'),
          maxHeight: '70vh',
          overflowY: 'auto'
        }}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          autoComplete="off"
        >
          <Row gutter={[16, 8]}>
            <Col xs={24} md={12}>
              <Form.Item
                name="section_id"
                label={<Text strong>Select Section</Text>}
                rules={[{ required: true, message: "Please select a section!" }]}
              >
                <Select
                  placeholder="Select section"
                  style={{ width: '100%' }}
                  onChange={fetchStudents}
                  loading={sectionsLoading}
                  showSearch
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                  size={isSmallMobile ? 'small' : 'middle'}
                >
                  {sections.map(section => (
                    <Option key={section.id} value={section.id}>
                      {section.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                name="student_id"
                label={<Text strong>Select Student</Text>}
                rules={[{ required: true, message: "Please select a student!" }]}
              >
                <Select
                  placeholder={studentsLoading ? "Loading students..." : "Select student"}
                  style={{ width: '100%' }}
                  loading={studentsLoading}
                  disabled={studentsLoading || !students.length}
                  notFoundContent={
                    studentsLoading ? (
                      <Spin size="small" />
                    ) : (
                      <Empty 
                        image={Empty.PRESENTED_IMAGE_SIMPLE} 
                        description="No students found" 
                        imageStyle={{ height: isSmallMobile ? 40 : 60 }}
                      />
                    )
                  }
                  showSearch
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                  size={isSmallMobile ? 'small' : 'middle'}
                >
                  {students.map(student => (
                    <Option key={student.id} value={student.id}>
                      {student.Name} (Father: {student.Fathers_Name})
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 8]}>
            <Col xs={24} md={12}>
              <Form.Item
                name="due_type"
                label={<Text strong>Due Type</Text>}
                rules={[{ required: true, message: "Please select due type!" }]}
              >
                <Select 
                  placeholder="Select due type"
                  style={{ width: '100%' }}
                  size={isSmallMobile ? 'small' : 'middle'}
                >
                  {dueTypes.map(type => (
                    <Option key={type} value={type}>{type}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                name="amount"
                label={<Text strong>Amount (PKR)</Text>}
                rules={[
                  { required: true, message: "Please enter the amount!" },
                  { 
                    validator: (_, value) => {
                      const numValue = parseFloat(value);
                      if (isNaN(numValue) || numValue <= 0) {
                        return Promise.reject(new Error('Amount must be a positive number'));
                      }
                      return Promise.resolve();
                    }
                  }
                ]}
              >
                <Input
                  style={{ width: '100%' }}
                  placeholder="Enter amount (e.g., 1500)"
                  value={amountValue}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  size={isSmallMobile ? 'small' : 'middle'}
                  onBlur={(e) => {
                    const value = e.target.value;
                    if (value) {
                      const numValue = parseFloat(value);
                      if (!isNaN(numValue)) {
                        setAmountValue(formatAmount(numValue));
                      }
                    }
                  }}
                  onFocus={(e) => {
                    const value = e.target.value;
                    setAmountValue(parseAmount(value));
                  }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 8]}>
            <Col xs={24} md={12}>
              <Form.Item
                name="due_date"
                label={<Text strong>Due Date</Text>}
                rules={[{ required: true, message: "Please select due date!" }]}
              >
                <DatePicker 
                  style={{ width: '100%' }} 
                  disabledDate={(current) => {
                    return current && current < moment().startOf('day');
                  }}
                  size={isSmallMobile ? 'small' : 'middle'}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="description"
            label={<Text strong>Description (Optional)</Text>}
          >
            <Input.TextArea 
              rows={3} 
              placeholder="Additional notes about these dues" 
              showCount 
              maxLength={200}
              size={isSmallMobile ? 'small' : 'middle'}
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={submitting}
              disabled={submitting}
              icon={<DollarOutlined />}
              size={isSmallMobile ? 'middle' : 'large'}
              style={{ width: isMobile ? '100%' : '200px' }}
              block={isMobile}
            >
              {submitting ? 'Issuing...' : 'Issue Dues'}
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Payment Modal */}
      <PaymentModal
        visible={paymentModalVisible}
        onCancel={() => setPaymentModalVisible(false)}
        due={selectedDue}
        onPaymentSuccess={handlePaymentSuccess}
        refreshDues={fetchDues}
      />
    </div>
  );
};

export default DuesListing;