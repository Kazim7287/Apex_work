// src/pages/Students/Exams.jsx
import React, { useState, useEffect, useRef } from 'react';
import { 
  Card, 
  Table, 
  Tag, 
  Statistic, 
  Progress, 
  Typography, 
  Spin, 
  message,
  Button,
  Alert,
  Tooltip,
  Row,
  Col,
  Space,
  Input
} from 'antd';
import { 
  DollarOutlined, 
  CheckCircleOutlined, 
  ClockCircleOutlined, 
  CloseCircleOutlined,
  ReloadOutlined,
  PrinterOutlined,
  SearchOutlined,
  FileDoneOutlined,
  SafetyCertificateOutlined,
  WarningOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;

const DuesSection = () => {
  const [loading, setLoading] = useState(true);
  const [duesData, setDuesData] = useState({
    dues: [],
    totalDue: 0,
    totalPaid: 0,
    totalCancelled: 0
  });
  const [studentInfo, setStudentInfo] = useState({
    name: '',
    id: '',
    className: '',
    section: ''
  });
  const [error, setError] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  
  const printRef = useRef();

  useEffect(() => {
    fetchDuesData();
  }, []);

  const fetchDuesData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const studentId = localStorage.getItem('studentId') || 
                        localStorage.getItem('student_id') || 
                        localStorage.getItem('user_id') || 
                        1;
      
      const url = `https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/get_stds_deus.php?studentId=${studentId}`;
      
      const response = await fetch(url, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success && data.data) {
        if (data.student_info) {
          setStudentInfo({
            name: data.student_info.name || '',
            id: data.student_info.id || studentId,
            className: data.student_info.class || data.student_info.className || '',
            section: data.student_info.section || ''
          });
          if (data.student_info.name) {
            localStorage.setItem('studentName', data.student_info.name);
          }
        } else {
          setStudentInfo({
            name: localStorage.getItem('studentName') || localStorage.getItem('user_name') || 'Student',
            id: studentId,
            className: localStorage.getItem('studentClass') || '',
            section: localStorage.getItem('studentSection') || ''
          });
        }
        
        if (Array.isArray(data.data)) {
          const transformedDues = data.data.map((due, index) => ({
            key: due.id || `due-${index}`,
            id: due.id || index,
            name: due.due_type || due.name || 'Tuition / Exam Due',
            amount: parseFloat(due.amount) || 0,
            dueDate: due.due_date || due.dueDate || null,
            status: String(due.status || 'pending').toLowerCase().trim(),
            category: due.description || due.due_type || due.category || 'General Fee',
            issuedDate: due.issued_date || due.issuedDate || null,
            paidDate: due.paid_date || due.paidDate || null,
            amountPaid: parseFloat(due.amount_paid || due.amountPaid || 0),
            balance: parseFloat(due.balance || (parseFloat(due.amount || 0) - parseFloat(due.amount_paid || 0)))
          }));

          const totalDue = transformedDues
            .filter(d => d.status === 'pending' || d.status === 'due' || d.balance > 0)
            .reduce((sum, d) => sum + d.balance, 0);
          
          const totalPaid = transformedDues
            .filter(d => d.status === 'paid' || d.amountPaid > 0)
            .reduce((sum, d) => sum + d.amountPaid, 0);
          
          const totalCancelled = transformedDues
            .filter(d => d.status === 'cancelled' || d.status === 'canceled')
            .reduce((sum, d) => sum + d.amount, 0);

          setDuesData({
            dues: transformedDues,
            totalDue,
            totalPaid,
            totalCancelled
          });
        } else {
          setDuesData({
            dues: [],
            totalDue: 0,
            totalPaid: 0,
            totalCancelled: 0
          });
        }
      } else {
        const errorMsg = data.error || 'No fee records found';
        setError(errorMsg);
        setDuesData({
          dues: [],
          totalDue: 0,
          totalPaid: 0,
          totalCancelled: 0
        });
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err.message || 'Failed to connect to fee server');
      setDuesData({
        dues: [],
        totalDue: 0,
        totalPaid: 0,
        totalCancelled: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusTag = (status, balance) => {
    const s = String(status || 'pending').toLowerCase();
    if (s === 'paid' || (balance !== undefined && balance <= 0)) {
      return (
        <Tag icon={<CheckCircleOutlined />} color="success" style={{ borderRadius: 12, padding: '2px 10px', fontWeight: 600 }}>
          PAID
        </Tag>
      );
    }
    if (s === 'partial') {
      return (
        <Tag icon={<ClockCircleOutlined />} color="processing" style={{ borderRadius: 12, padding: '2px 10px', fontWeight: 600 }}>
          PARTIAL
        </Tag>
      );
    }
    if (s === 'cancelled' || s === 'canceled') {
      return (
        <Tag icon={<CloseCircleOutlined />} color="error" style={{ borderRadius: 12, padding: '2px 10px', fontWeight: 600 }}>
          CANCELLED
        </Tag>
      );
    }
    return (
      <Tag icon={<ClockCircleOutlined />} color="warning" style={{ borderRadius: 12, padding: '2px 10px', fontWeight: 600 }}>
        PENDING
      </Tag>
    );
  };

  const columns = [
    {
      title: 'Fee Particulars',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <div>
          <Text strong style={{ color: '#0b1b3d', fontSize: 14 }}>
            {text}
          </Text>
          <div style={{ marginTop: 2 }}>
            <Tag color="cyan" style={{ borderRadius: 6, fontSize: 11 }}>{record.category}</Tag>
          </div>
        </div>
      ),
    },
    {
      title: 'Total Amount',
      dataIndex: 'amount',
      key: 'amount',
      align: 'right',
      render: (amount) => (
        <Text strong style={{ color: '#0b1b3d', fontSize: 14 }}>
          Rs. {amount?.toLocaleString() || '0'}
        </Text>
      ),
    },
    {
      title: 'Paid Amount',
      dataIndex: 'amountPaid',
      key: 'amountPaid',
      align: 'right',
      responsive: ['md'],
      render: (amountPaid) => (
        <Text strong style={{ color: '#10b981', fontSize: 14 }}>
          Rs. {amountPaid?.toLocaleString() || '0'}
        </Text>
      ),
    },
    {
      title: 'Balance Remaining',
      dataIndex: 'balance',
      key: 'balance',
      align: 'right',
      render: (balance) => (
        <Text strong style={{ color: balance > 0 ? '#ef4444' : '#10b981', fontSize: 14 }}>
          Rs. {Math.abs(balance || 0).toLocaleString()}
        </Text>
      ),
    },
    {
      title: 'Due Date',
      dataIndex: 'dueDate',
      key: 'dueDate',
      responsive: ['lg'],
      render: (date) => (
        <Text style={{ color: '#64748b', fontSize: 13 }}>
          {date ? new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
        </Text>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      align: 'center',
      render: (status, record) => getStatusTag(status, record.balance),
    }
  ];

  const totalAmount = duesData.dues.reduce((sum, due) => sum + (due.amount || 0), 0);
  const paidPercent = totalAmount > 0 ? Math.min(100, Math.round((duesData.totalPaid / totalAmount) * 100)) : 0;

  const filteredDues = duesData.dues.filter((due) => {
    const matchesSearch = !searchText.trim() || 
      due.name.toLowerCase().includes(searchText.toLowerCase()) || 
      due.category.toLowerCase().includes(searchText.toLowerCase());

    if (!matchesSearch) return false;

    if (activeFilter === 'all') return true;
    if (activeFilter === 'pending') return due.status === 'pending' || due.status === 'due' || due.balance > 0;
    if (activeFilter === 'paid') return due.status === 'paid';
    if (activeFilter === 'partial') return due.status === 'partial';
    if (activeFilter === 'cancelled') return due.status === 'cancelled' || due.status === 'canceled';
    return true;
  });

  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>APEX College - Student Fee Statement</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 28px; color: #0f172a; }
            .header { text-align: center; border-bottom: 2px solid #d4af37; padding-bottom: 16px; margin-bottom: 20px; }
            .header h1 { margin: 0; color: #0b1b3d; font-size: 24px; text-transform: uppercase; letter-spacing: 1px; }
            .header p { margin: 4px 0; color: #64748b; font-size: 13px; }
            .info-grid { display: flex; justify-content: space-between; background: #f8fafc; padding: 12px 16px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #e2e8f0; }
            .info-item { font-size: 13px; }
            .info-item strong { color: #0b1b3d; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th { background-color: #0b1b3d; color: #ffffff; padding: 10px 12px; font-size: 12px; text-align: left; text-transform: uppercase; }
            td { border-bottom: 1px solid #e2e8f0; padding: 10px 12px; font-size: 13px; }
            tr:nth-child(even) { background-color: #f8fafc; }
            .totals { display: flex; justify-content: flex-end; margin-top: 16px; }
            .totals-box { width: 280px; background: #f8fafc; border: 1px solid #d4af37; border-radius: 8px; padding: 12px 16px; font-size: 13px; }
            .totals-row { display: flex; justify-content: space-between; margin-bottom: 6px; }
            .totals-row strong { color: #0b1b3d; }
            .footer { margin-top: 40px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 12px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>APEX COLLEGE HARICHAND</h1>
            <p>Official Student Fee Ledger & Dues Statement</p>
          </div>
          <div class="info-grid">
            <div class="info-item"><strong>Student:</strong> ${studentInfo.name || 'Student'}</div>
            <div class="info-item"><strong>Student ID:</strong> ${studentInfo.id || 'N/A'}</div>
            <div class="info-item"><strong>Date Generated:</strong> ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Fee Particulars</th>
                <th>Category</th>
                <th>Due Date</th>
                <th style="text-align:right">Total (Rs.)</th>
                <th style="text-align:right">Paid (Rs.)</th>
                <th style="text-align:right">Balance (Rs.)</th>
                <th style="text-align:center">Status</th>
              </tr>
            </thead>
            <tbody>
              ${duesData.dues.map(d => `
                <tr>
                  <td><strong>${d.name}</strong></td>
                  <td>${d.category}</td>
                  <td>${d.dueDate || 'N/A'}</td>
                  <td style="text-align:right">Rs. ${(d.amount || 0).toLocaleString()}</td>
                  <td style="text-align:right">Rs. ${(d.amountPaid || 0).toLocaleString()}</td>
                  <td style="text-align:right; font-weight:bold; color:${d.balance > 0 ? '#b91c1c' : '#15803d'}">Rs. ${(d.balance || 0).toLocaleString()}</td>
                  <td style="text-align:center; font-weight:bold">${d.status.toUpperCase()}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="totals">
            <div class="totals-box">
              <div class="totals-row"><span>Total Invoiced:</span><strong>Rs. ${totalAmount.toLocaleString()}</strong></div>
              <div class="totals-row"><span>Total Paid:</span><strong style="color:#15803d">Rs. ${duesData.totalPaid.toLocaleString()}</strong></div>
              <div class="totals-row" style="border-top:1px solid #cbd5e1; padding-top:6px; font-size:14px"><span>Outstanding Due:</span><strong style="color:#b91c1c">Rs. ${duesData.totalDue.toLocaleString()}</strong></div>
            </div>
          </div>
          <div class="footer">
            <p>This is a computer-generated statement issued by APEX College Accounts Portal. No signature required.</p>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 300);
  };

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
              <DollarOutlined />
            </div>
            <div>
              <Title level={4} style={{ margin: 0, color: '#0b1b3d', fontWeight: 800 }}>
                Student Fee Ledger & Dues
              </Title>
              <Text style={{ color: '#64748b', fontSize: 13 }}>
                Review fee installments, payment history, outstanding dues, and generate official receipts
              </Text>
            </div>
          </div>

          <Space wrap>
            <Button
              type="primary"
              icon={<PrinterOutlined />}
              onClick={handlePrint}
              className="apex-btn-gold"
              style={{ borderRadius: 8 }}
            >
              Print Fee Statement
            </Button>
            <Button
              icon={<ReloadOutlined />}
              onClick={fetchDuesData}
              loading={loading}
              style={{ borderRadius: 8 }}
            >
              Refresh
            </Button>
          </Space>
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

      {/* 4 Financial Stat Cards */}
      <Row gutter={[20, 20]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="apex-card apex-card-gold-header" bodyStyle={{ padding: 20 }}>
            <Statistic
              title={<Text style={{ color: '#64748b', fontSize: 12, fontWeight: 700, textTransform: 'uppercase' }}>Total Invoiced Fee</Text>}
              value={totalAmount}
              prefix={<DollarOutlined style={{ color: '#0b1b3d' }} />}
              formatter={(val) => `Rs. ${Number(val).toLocaleString()}`}
              valueStyle={{ color: '#0b1b3d', fontWeight: 800, fontSize: 22 }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="apex-card apex-card-gold-header" bodyStyle={{ padding: 20 }}>
            <Statistic
              title={<Text style={{ color: '#64748b', fontSize: 12, fontWeight: 700, textTransform: 'uppercase' }}>Total Amount Paid</Text>}
              value={duesData.totalPaid}
              prefix={<CheckCircleOutlined style={{ color: '#10b981' }} />}
              formatter={(val) => `Rs. ${Number(val).toLocaleString()}`}
              valueStyle={{ color: '#10b981', fontWeight: 800, fontSize: 22 }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="apex-card apex-card-gold-header" bodyStyle={{ padding: 20 }}>
            <Statistic
              title={<Text style={{ color: '#64748b', fontSize: 12, fontWeight: 700, textTransform: 'uppercase' }}>Remaining Due / Balance</Text>}
              value={duesData.totalDue}
              prefix={<ClockCircleOutlined style={{ color: '#f59e0b' }} />}
              formatter={(val) => `Rs. ${Number(val).toLocaleString()}`}
              valueStyle={{ color: duesData.totalDue > 0 ? '#ef4444' : '#10b981', fontWeight: 800, fontSize: 22 }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="apex-card apex-card-gold-header" bodyStyle={{ padding: 20 }}>
            <Statistic
              title={<Text style={{ color: '#64748b', fontSize: 12, fontWeight: 700, textTransform: 'uppercase' }}>Waived / Cancelled</Text>}
              value={duesData.totalCancelled}
              prefix={<SafetyCertificateOutlined style={{ color: '#8b5cf6' }} />}
              formatter={(val) => `Rs. ${Number(val).toLocaleString()}`}
              valueStyle={{ color: '#8b5cf6', fontWeight: 800, fontSize: 22 }}
            />
          </Card>
        </Col>
      </Row>

      {/* Payment Completion Progress Bar Card */}
      <Card className="apex-card" style={{ marginBottom: 24 }} bodyStyle={{ padding: '18px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, flexWrap: 'wrap', gap: 8 }}>
          <div>
            <Text strong style={{ color: '#0b1b3d', fontSize: 14 }}>Fee Clearance Progress</Text>
            <Text style={{ color: '#64748b', fontSize: 12, marginLeft: 8 }}>({paidPercent}% Cleared)</Text>
          </div>
          <Text style={{ color: '#64748b', fontSize: 12 }}>
            Outstanding Balance: <strong style={{ color: '#ef4444' }}>Rs. {duesData.totalDue.toLocaleString()}</strong>
          </Text>
        </div>
        <Progress 
          percent={paidPercent} 
          status={paidPercent >= 100 ? 'success' : 'active'}
          strokeColor={{ '0%': '#10b981', '100%': '#d4af37' }}
          strokeWidth={10}
        />
      </Card>

      {/* Main Dues Table Card */}
      <Card
        className="apex-card"
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 0' }}>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: 'rgba(212, 175, 55, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d4af37', fontSize: 16 }}>
              <FileDoneOutlined />
            </div>
            <div>
              <Title level={5} style={{ margin: 0, color: '#0b1b3d', fontWeight: 700 }}>
                Fee Schedule & Payment Records
              </Title>
              <Text style={{ color: '#64748b', fontSize: 11 }}>Comprehensive ledger of all fee vouchers</Text>
            </div>
          </div>
        }
        extra={
          <Space wrap>
            <Input
              placeholder="Search dues..."
              prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
              style={{ width: 180, borderRadius: 8 }}
            />
            <Button 
              type={activeFilter === 'all' ? 'primary' : 'default'} 
              size="small"
              onClick={() => setActiveFilter('all')}
              style={{ borderRadius: 6 }}
            >
              All ({duesData.dues.length})
            </Button>
            <Button 
              type={activeFilter === 'pending' ? 'primary' : 'default'} 
              size="small"
              onClick={() => setActiveFilter('pending')}
              style={{ borderRadius: 6 }}
            >
              Pending
            </Button>
            <Button 
              type={activeFilter === 'paid' ? 'primary' : 'default'} 
              size="small"
              onClick={() => setActiveFilter('paid')}
              style={{ borderRadius: 6 }}
            >
              Paid
            </Button>
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={filteredDues}
          rowKey="key"
          loading={loading}
          scroll={{ x: 'max-content' }}
          pagination={{
            pageSize: 8,
            showSizeChanger: true,
            pageSizeOptions: ['8', '15', '30'],
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} records`
          }}
        />
      </Card>

      {/* Hidden printable content ref */}
      <div style={{ display: 'none' }} ref={printRef} />
    </div>
  );
};

export default DuesSection;