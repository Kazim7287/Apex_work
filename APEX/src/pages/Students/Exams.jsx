/* eslint-disable react/display-name */
import React, { useState, useEffect, useRef } from 'react';
import { 
  Layout, 
  Card, 
  Table, 
  Tag, 
  Statistic, 
  Progress, 
  Typography, 
  Spin, 
  message,
  Grid,
  Drawer,
  Button,
  Alert,
  Tooltip
} from 'antd';
import { 
  DollarOutlined, 
  CheckCircleOutlined, 
  ClockCircleOutlined, 
  CloseCircleOutlined,
  MenuOutlined,
  ReloadOutlined,
  PrinterOutlined,
  UserOutlined
} from '@ant-design/icons';
import Sidebar from './Sidebar';
import styled from 'styled-components';

const { Header, Content } = Layout;
const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

// Styled components for responsive design
const MainContent = styled(Content)`
  margin-left: ${({ sidebarOpen, isMobile }) => 
    isMobile ? '0' : (sidebarOpen ? '250px' : '80px')};
  transition: margin-left 0.3s ease;
  min-height: 100vh;
  padding: ${({ isMobile }) => isMobile ? '16px' : '24px'};
`;

const StyledCard = styled(Card)`
  margin-bottom: ${({ isMobile }) => isMobile ? '16px' : '24px'};
`;

const StatsContainer = styled.div`
  display: flex;
  margin-bottom: 24px;
  gap: 16px;
  flex-direction: ${({ isMobile }) => isMobile ? 'column' : 'row'};
`;

const MobileHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding: 0 8px;
  background: #fff;
  position: sticky;
  top: 0;
  z-index: 1;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const ResponsiveTitle = styled(Title)`
  font-size: ${({ isMobile }) => isMobile ? '20px' : '24px'} !important;
  margin-bottom: ${({ isMobile }) => isMobile ? '12px' : '16px'} !important;
  margin-left: ${({ isMobile }) => isMobile ? '16px' : '0'} !important;
`;

const HamburgerButton = styled(Button)`
  border: none;
  box-shadow: none;
  background: transparent !important;
`;

const RetryButton = styled(Button)`
  margin-top: 16px;
`;

const PrintButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-bottom: 16px;
`;

const StudentInfoHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  padding: 16px;
  background: #f0f5ff;
  border-radius: 8px;
  
  .student-icon {
    font-size: 24px;
    margin-right: 12px;
    color: #1890ff;
  }
  
  .student-details {
    flex: 1;
    
    .student-name {
      font-size: 18px;
      font-weight: bold;
      margin-bottom: 4px;
    }
    
    .student-id {
      color: #666;
    }
  }
`;

// Styled components for printable report
const PrintableReport = styled.div`
  padding: 24px;
  font-family: Arial, sans-serif;
  
  @media print {
    body, html {
      margin: 0;
      padding: 0;
      width: 100%;
    }
    
    .no-print {
      display: none !important;
    }
    
    .page-break {
      page-break-after: always;
    }
    
    * {
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
  }
`;

const ReportHeader = styled.div`
  text-align: center;
  margin-bottom: 24px;
  border-bottom: 2px solid #ddd;
  padding-bottom: 16px;
`;

const ReportSection = styled.div`
  margin-bottom: 24px;
  page-break-inside: avoid;
`;

const ReportTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 16px;
  
  th, td {
    border: 1px solid #ddd;
    padding: 8px;
    text-align: left;
  }
  
  th {
    background-color: #f0f0f0;
    font-weight: bold;
  }
  
  tr:nth-child(even) {
    background-color: #f9f9f9;
  }
`;

const StatusBadge = styled.span`
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
  text-align: center;
  
  ${props => {
    switch(props.status) {
      case 'paid':
        return `background-color: #f6ffed; border: 1px solid #b7eb8f; color: #52c41a;`;
      case 'pending':
      case 'due':
        return `background-color: #fffbe6; border: 1px solid #ffe58f; color: #faad14;`;
      case 'cancelled':
      case 'canceled':
        return `background-color: #fff2f0; border: 1px solid #ffccc7; color: #ff4d4f;`;
      case 'partial':
        return `background-color: #e6f7ff; border: 1px solid #91d5ff; color: #1890ff;`;
      default:
        return `background-color: #fafafa; border: 1px solid #d9d9d9; color: #000000;`;
    }
  }}
`;

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
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarVisible, setMobileSidebarVisible] = useState(false);
  const [error, setError] = useState(null);
  
  const printRef = useRef();
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  useEffect(() => {
    fetchDuesData();
  }, []);

  const fetchDuesData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Try different possible keys for student ID
      const studentId = localStorage.getItem('studentId') || 
                        localStorage.getItem('student_id') || 
                        localStorage.getItem('user_id') || 
                        1; // fallback for testing
      
      console.log('Fetching data for student ID:', studentId);
      
      // Try different API endpoints - adjust based on your actual setup
      const apiUrls = [
        `https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/get_stds_deus.php?studentId=${studentId}`,
        `https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/get_stds_deus.php?studentId=${studentId}`,
        `./get_stds_deus.php?studentId=${studentId}`
      ];
      
      let response;
      let data;
      
      // Try each API URL until one works
      for (const url of apiUrls) {
        try {
          console.log('Trying URL:', url);
          response = await fetch(url, {
            credentials: 'include' // Important for CORS with credentials
          });
          
          if (response.ok) {
            data = await response.json();
            console.log('API Response from', url, ':', data);
            break;
          }
        } catch (err) {
          console.log('Failed with URL:', url, err);
          continue;
        }
      }
      
      if (!response || !response.ok) {
        throw new Error(`Failed to fetch data from all endpoints`);
      }
      
      if (data.success && data.data) {
        console.log('Raw API data:', data.data);
        
        // Extract student info if available in API response
        if (data.student_info) {
          setStudentInfo({
            name: data.student_info.name || '',
            id: data.student_info.id || studentId,
            className: data.student_info.class || data.student_info.className || '',
            section: data.student_info.section || ''
          });
          
          // Also store in localStorage for future use
          if (data.student_info.name) {
            localStorage.setItem('studentName', data.student_info.name);
          }
        } else {
          // Fallback to localStorage if API doesn't provide student info
          const studentName = localStorage.getItem('studentName') || 
                             localStorage.getItem('user_name') || 
                             '';
          setStudentInfo({
            name: studentName,
            id: studentId,
            className: localStorage.getItem('studentClass') || '',
            section: localStorage.getItem('studentSection') || ''
          });
        }
        
        // Check if data.data is an array (for dues)
        if (Array.isArray(data.data)) {
          // Transform the data to match the expected structure
          const transformedDues = data.data.map((due, index) => ({
            key: due.id || `due-${index}`,
            id: due.id || index,
            name: due.due_type || due.name || 'Unknown Due',
            amount: parseFloat(due.amount) || 0,
            dueDate: due.due_date || due.dueDate || null,
            status: String(due.status || 'pending').toLowerCase().trim(),
            category: due.description || due.due_type || due.category || 'General',
            issuedDate: due.issued_date || due.issuedDate || null,
            paidDate: due.paid_date || due.paidDate || null,
            amountPaid: parseFloat(due.amount_paid || due.amountPaid || 0),
            balance: parseFloat(due.balance || (parseFloat(due.amount || 0) - parseFloat(due.amount_paid || 0)))
          }));

          console.log('Transformed dues:', transformedDues);

          // Calculate totals
          const totalDue = transformedDues
            .filter(d => d.status === 'pending' || d.balance > 0)
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
          // Handle case where data.data is not an array
          console.error('API data is not in expected format:', data.data);
          setError('Invalid data format received from server');
          setDuesData({
            dues: [],
            totalDue: 0,
            totalPaid: 0,
            totalCancelled: 0
          });
        }
      } else {
        const errorMsg = data.error || 'No dues data found or invalid response format';
        console.error('API error:', errorMsg, data);
        setError(errorMsg);
        message.error(errorMsg);
        
        setDuesData({
          dues: [],
          totalDue: 0,
          totalPaid: 0,
          totalCancelled: 0
        });
      }
    } catch (error) {
      console.error('Fetch error details:', error);
      const errorMsg = error.message || 'Failed to connect to server. Check console for details.';
      setError(errorMsg);
      message.error(errorMsg);
      
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

  const columns = [
    {
      title: 'Due Name',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <div>
          <Text strong>{text}</Text>
          <br />
          <Text type="secondary">{record.category}</Text>
        </div>
      ),
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: amount => (
        <Text strong>Rs. {amount?.toLocaleString() || '0'}</Text>
      ),
    },
    {
      title: 'Paid Amount',
      dataIndex: 'amountPaid',
      key: 'amountPaid',
      render: amountPaid => (
        <Text type="success">Rs. {amountPaid?.toLocaleString() || '0'}</Text>
      ),
      responsive: ['md']
    },
    {
      title: 'Balance',
      dataIndex: 'balance',
      key: 'balance',
      render: balance => (
        <Text type={balance > 0 ? 'danger' : 'success'}>
          Rs. {Math.abs(balance || 0).toLocaleString()}
        </Text>
      ),
      responsive: ['md']
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        if (!status) return <Tag color="default">Unknown</Tag>;
        
        let color = 'default';
        let icon = null;
        let label = status.charAt(0).toUpperCase() + status.slice(1);

        if (status === 'paid') {
          color = 'success';
          icon = <CheckCircleOutlined />;
        } else if (status === 'pending' || status === 'due') {
          color = 'warning';
          icon = <ClockCircleOutlined />;
          label = 'Pending';
        } else if (status === 'cancelled' || status === 'canceled') {
          color = 'error';
          icon = <CloseCircleOutlined />;
        } else if (status === 'partial') {
          color = 'blue';
          icon = <ClockCircleOutlined />;
          label = 'Partial';
        }

        return <Tag icon={icon} color={color}>{label}</Tag>;
      },
    }
  ];

  const pendingDues = duesData.dues.filter(due => 
    due.status === 'pending' || due.status === 'due' || due.balance > 0
  );
  const paidDues = duesData.dues.filter(due => due.status === 'paid');
  const cancelledDues = duesData.dues.filter(due => 
    due.status === 'cancelled' || due.status === 'canceled'
  );
  const partialDues = duesData.dues.filter(due => due.status === 'partial');

  const totalAmount = duesData.dues.reduce((sum, due) => sum + (due.amount || 0), 0);
  const pendingPercent = totalAmount > 0 ? Math.round((duesData.totalDue / totalAmount) * 100) : 0;
  const paidPercent = totalAmount > 0 ? Math.round((duesData.totalPaid / totalAmount) * 100) : 0;
  const cancelledPercent = totalAmount > 0 ? Math.round((duesData.totalCancelled / totalAmount) * 100) : 0;

  const handleSidebarToggle = (isOpen) => {
    setSidebarOpen(isOpen);
  };

  const toggleMobileSidebar = () => {
    setMobileSidebarVisible(!mobileSidebarVisible);
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return isNaN(date) ? 'Invalid Date' : date.toLocaleDateString();
    } catch (e) {
      return 'Invalid Date';
    }
  };

  // Print function using window.print()
  const handlePrint = () => {
    const printContent = printRef.current;
    const printWindow = window.open('', '_blank');
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Student Dues Report</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 20px;
              color: #333;
            }
            .report-header {
              text-align: center;
              margin-bottom: 24px;
              border-bottom: 2px solid #ddd;
              padding-bottom: 16px;
            }
            .report-section {
              margin-bottom: 24px;
              page-break-inside: avoid;
            }
            .report-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 16px;
            }
            .report-table th, .report-table td {
              border: 1px solid #ddd;
              padding: 8px;
              text-align: left;
            }
            .report-table th {
              background-color: #f0f0f0;
              font-weight: bold;
            }
            .report-table tr:nth-child(even) {
              background-color: #f9f9f9;
            }
            .status-badge {
              display: inline-block;
              padding: 4px 8px;
              border-radius: 4px;
              font-size: 12px;
              font-weight: bold;
              text-align: center;
            }
            .status-paid {
              background-color: #f6ffed;
              border: 1px solid #b7eb8f;
              color: #52c41a;
            }
            .status-pending {
              background-color: #fffbe6;
              border: 1px solid #ffe58f;
              color: #faad14;
            }
            .status-cancelled {
              background-color: #fff2f0;
              border: 1px solid #ffccc7;
              color: #ff4d4f;
            }
            .status-partial {
              background-color: #e6f7ff;
              border: 1px solid #91d5ff;
              color: #1890ff;
            }
            @media print {
              body {
                margin: 0;
                padding: 15px;
              }
              .no-print {
                display: none !important;
              }
              .page-break {
                page-break-after: always;
              }
            }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);
    
    printWindow.document.close();
    
    // Wait for content to load then print
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  // Printable report component
  const PrintableDuesReport = React.forwardRef((props, ref) => {
    return (
      <PrintableReport ref={ref}>
        <ReportHeader>
          <h1>Student Dues Report</h1>
          <p><strong>Student Name:</strong> {studentInfo.name} | <strong>Student ID:</strong> {studentInfo.id}</p>
          {studentInfo.className && <p><strong>Class:</strong> {studentInfo.className} {studentInfo.section ? `- ${studentInfo.section}` : ''}</p>}
          <p><strong>Report Date:</strong> {new Date().toLocaleDateString()}</p>
        </ReportHeader>
        
        <ReportSection>
          <h2>Summary</h2>
          <p><strong>Total Amount:</strong> Rs. {totalAmount.toLocaleString()}</p>
          <p><strong>Total Paid:</strong> Rs. {duesData.totalPaid.toLocaleString()}</p>
          <p><strong>Total Pending:</strong> Rs. {duesData.totalDue.toLocaleString()}</p>
          <p><strong>Total Cancelled:</strong> Rs. {duesData.totalCancelled.toLocaleString()}</p>
        </ReportSection>
        
        {pendingDues.length > 0 && (
          <ReportSection>
            <h2>Pending Dues ({pendingDues.length})</h2>
            <ReportTable>
              <thead>
                <tr>
                  <th>Due Name</th>
                  <th>Category</th>
                  <th>Amount (Rs.)</th>
                  <th>Paid (Rs.)</th>
                  <th>Balance (Rs.)</th>
                  <th>Due Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {pendingDues.map(due => (
                  <tr key={due.key}>
                    <td>{due.name}</td>
                    <td>{due.category}</td>
                    <td>{due.amount?.toLocaleString() || '0'}</td>
                    <td>{due.amountPaid?.toLocaleString() || '0'}</td>
                    <td>{due.balance?.toLocaleString() || '0'}</td>
                    <td>{formatDate(due.dueDate)}</td>
                    <td>
                      <StatusBadge status={due.status}>
                        {due.status === 'pending' || due.status === 'due' ? 'Pending' : 
                         due.status.charAt(0).toUpperCase() + due.status.slice(1)}
                      </StatusBadge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </ReportTable>
          </ReportSection>
        )}
        
        {partialDues.length > 0 && (
          <ReportSection>
            <h2>Partial Payments ({partialDues.length})</h2>
            <ReportTable>
              <thead>
                <tr>
                  <th>Due Name</th>
                  <th>Category</th>
                  <th>Amount (Rs.)</th>
                  <th>Paid (Rs.)</th>
                  <th>Balance (Rs.)</th>
                  <th>Due Date</th>
                  <th>Paid Date</th>
                </tr>
              </thead>
              <tbody>
                {partialDues.map(due => (
                  <tr key={due.key}>
                    <td>{due.name}</td>
                    <td>{due.category}</td>
                    <td>{due.amount?.toLocaleString() || '0'}</td>
                    <td>{due.amountPaid?.toLocaleString() || '0'}</td>
                    <td>{due.balance?.toLocaleString() || '0'}</td>
                    <td>{formatDate(due.dueDate)}</td>
                    <td>{formatDate(due.paidDate)}</td>
                  </tr>
                ))}
              </tbody>
            </ReportTable>
          </ReportSection>
        )}
        
        {paidDues.length > 0 && (
          <ReportSection>
            <h2>Payment History ({paidDues.length})</h2>
            <ReportTable>
              <thead>
                <tr>
                  <th>Due Name</th>
                  <th>Category</th>
                  <th>Amount (Rs.)</th>
                  <th>Paid Date</th>
                </tr>
              </thead>
              <tbody>
                {paidDues.map(due => (
                  <tr key={due.key}>
                    <td>{due.name}</td>
                    <td>{due.category}</td>
                    <td>{due.amount?.toLocaleString() || '0'}</td>
                    <td>{formatDate(due.paidDate)}</td>
                  </tr>
                ))}
              </tbody>
            </ReportTable>
          </ReportSection>
        )}
        
        {cancelledDues.length > 0 && (
          <ReportSection>
            <h2>Cancelled Dues ({cancelledDues.length})</h2>
            <ReportTable>
              <thead>
                <tr>
                  <th>Due Name</th>
                  <th>Category</th>
                  <th>Amount (Rs.)</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {cancelledDues.map(due => (
                  <tr key={due.key}>
                    <td>{due.name}</td>
                    <td>{due.category}</td>
                    <td>{due.amount?.toLocaleString() || '0'}</td>
                    <td>
                      <StatusBadge status={due.status}>
                        Cancelled
                      </StatusBadge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </ReportTable>
          </ReportSection>
        )}
        
        <ReportSection>
          <p style={{ textAlign: 'center', marginTop: '30px', fontStyle: 'italic' }}>
            This is an computer-generated report. No signature is required.
          </p>
        </ReportSection>
      </PrintableReport>
    );
  });

  if (loading) {
    return (
      <Layout style={{ minHeight: '100vh' }}>
        {/* Desktop Sidebar */}
        {!isMobile && (
          <Sidebar 
            onToggle={handleSidebarToggle} 
            collapsed={!sidebarOpen}
          />
        )}
        
        <Layout>
          <MainContent sidebarOpen={sidebarOpen} isMobile={isMobile}>
            {isMobile && (
              <MobileHeader>
                <HamburgerButton
                  icon={<MenuOutlined />}
                  onClick={toggleMobileSidebar}
                />
                <ResponsiveTitle level={4} isMobile={isMobile}>
                  Student Dues
                </ResponsiveTitle>
                <div style={{ width: 32 }} />
              </MobileHeader>
            )}
            
            {!isMobile && (
              <ResponsiveTitle level={4} isMobile={isMobile}>
                Student Dues
              </ResponsiveTitle>
            )}
            
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
              <Spin size="large" tip="Loading dues data..." />
            </div>
          </MainContent>
        </Layout>
      </Layout>
    );
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* Desktop Sidebar */}
      {!isMobile && (
        <Sidebar 
          onToggle={handleSidebarToggle} 
          collapsed={!sidebarOpen}
        />
      )}
      
      {/* Mobile Sidebar Drawer */}
      {isMobile && (
        <Drawer
          placement="left"
          onClose={toggleMobileSidebar}
          visible={mobileSidebarVisible}
          bodyStyle={{ padding: 0 }}
          width={250}
        >
          <Sidebar 
            onToggle={handleSidebarToggle} 
            collapsed={false}
            isMobile={true}
          />
        </Drawer>
      )}
      
      <Layout>
        <MainContent sidebarOpen={sidebarOpen} isMobile={isMobile}>
          {isMobile && (
            <MobileHeader>
              <HamburgerButton
                icon={<MenuOutlined />}
                onClick={toggleMobileSidebar}
              />
              <ResponsiveTitle level={4} isMobile={isMobile}>
                Student Dues
              </ResponsiveTitle>
              <Button
                icon={<ReloadOutlined />}
                onClick={fetchDuesData}
                size="small"
              >
                Refresh
              </Button>
            </MobileHeader>
          )}
          
          {!isMobile && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <ResponsiveTitle level={4} isMobile={isMobile}>
                Student Dues
              </ResponsiveTitle>
              <div>
                <Tooltip title="Print Dues Report">
                  <Button
                    icon={<PrinterOutlined />}
                    style={{ marginRight: 8 }}
                    onClick={handlePrint}
                  >
                    Print Report
                  </Button>
                </Tooltip>
                <Button
                  icon={<ReloadOutlined />}
                  onClick={fetchDuesData}
                >
                  Refresh Data
                </Button>
              </div>
            </div>
          )}

          {/* Student Information Header */}
          {studentInfo.name && (
            <StudentInfoHeader>
              <UserOutlined className="student-icon" />
              <div className="student-details">
                <div className="student-name">{studentInfo.name}</div>
                <div className="student-id">ID: {studentInfo.id}</div>
                {studentInfo.className && (
                  <div className="student-class">Class: {studentInfo.className} {studentInfo.section ? `- ${studentInfo.section}` : ''}</div>
                )}
              </div>
            </StudentInfoHeader>
          )}

          {error && (
            <Alert
              message="Error Loading Data"
              description={
                <div>
                  <p>{error}</p>
                  <RetryButton
                    type="primary"
                    icon={<ReloadOutlined />}
                    onClick={fetchDuesData}
                  >
                    Try Again
                  </RetryButton>
                  <p style={{ marginTop: 8, fontSize: '12px', color: '#666' }}>
                    Check browser console for detailed error information
                  </p>
                </div>
              }
              type="error"
              showIcon
              style={{ marginBottom: 16 }}
            />
          )}

          {/* Print button for mobile */}
          {isMobile && (
            <PrintButtonContainer>
              <Tooltip title="Print Dues Report">
                <Button
                  icon={<PrinterOutlined />}
                  type="primary"
                  onClick={handlePrint}
                >
                  Print Report
                </Button>
              </Tooltip>
            </PrintButtonContainer>
          )}

          {duesData.dues.length === 0 && !error ? (
            <Alert
              message="No Dues Found"
              description="There are no dues records for this student."
              type="info"
              showIcon
              action={
                <Button size="small" onClick={fetchDuesData}>
                  Check Again
                </Button>
              }
            />
          ) : (
            <>
              <div style={{ display: 'none' }}>
                <PrintableDuesReport ref={printRef} />
              </div>
              
              <StatsContainer isMobile={isMobile}>
                <StyledCard isMobile={isMobile} style={{ flex: 1 }}>
                  <Statistic
                    title="Total Pending Dues"
                    value={duesData.totalDue}
                    prefix={<DollarOutlined />}
                    suffix="PKR"
                    precision={2}
                  />
                  <Progress 
                    percent={pendingPercent} 
                    status="active" 
                    strokeColor="#faad14"
                  />
                </StyledCard>
                <StyledCard isMobile={isMobile} style={{ flex: 1 }}>
                  <Statistic
                    title="Total Paid"
                    value={duesData.totalPaid}
                    prefix={<DollarOutlined />}
                    suffix="PKR"
                    precision={2}
                  />
                  <Progress 
                    percent={paidPercent} 
                    status="success" 
                  />
                </StyledCard>
                <StyledCard isMobile={isMobile} style={{ flex: 1 }}>
                  <Statistic
                    title="Total Cancelled"
                    value={duesData.totalCancelled}
                    prefix={<DollarOutlined />}
                    suffix="PKR"
                    precision={2}
                  />
                  <Progress 
                    percent={cancelledPercent} 
                    status="exception" 
                    strokeColor="#ff4d4f"
                  />
                </StyledCard>
              </StatsContainer>

              {pendingDues.length > 0 && (
                <StyledCard 
                  title={`Pending Dues (${pendingDues.length})`} 
                  bordered={false}
                  isMobile={isMobile}
                  extra={<Text strong>Balance: Rs. {duesData.totalDue.toLocaleString()}</Text>}
                >
                  <Table
                    columns={columns}
                    dataSource={pendingDues}
                    rowKey="key"
                    pagination={pendingDues.length > 5 ? { pageSize: 5 } : false}
                    size={isMobile ? "small" : "middle"}
                    scroll={{ x: true }}
                  />
                </StyledCard>
              )}

              {partialDues.length > 0 && (
                <StyledCard 
                  title={`Partial Payments (${partialDues.length})`} 
                  bordered={false}
                  isMobile={isMobile}
                >
                  <Table
                    columns={columns}
                    dataSource={partialDues}
                    rowKey="key"
                    pagination={partialDues.length > 5 ? { pageSize: 5 } : false}
                    size={isMobile ? "small" : "middle"}
                    scroll={{ x: true }}
                  />
                </StyledCard>
              )}

              {paidDues.length > 0 && (
                <StyledCard 
                  title={`Payment History (${paidDues.length})`} 
                  bordered={false}
                  isMobile={isMobile}
                  extra={<Text strong>Total: Rs. {duesData.totalPaid.toLocaleString()}</Text>}
                >
                  <Table
                    columns={columns}
                    dataSource={paidDues}
                    rowKey="key"
                    pagination={paidDues.length > 5 ? { pageSize: 5 } : false}
                    size={isMobile ? "small" : "middle"}
                    scroll={{ x: true }}
                  />
                </StyledCard>
              )}

              {cancelledDues.length > 0 && (
                <StyledCard 
                  title={`Cancelled Dues (${cancelledDues.length})`} 
                  bordered={false}
                  isMobile={isMobile}
                  extra={<Text strong>Total: Rs. {duesData.totalCancelled.toLocaleString()}</Text>}
                >
                  <Table
                    columns={columns}
                    dataSource={cancelledDues}
                    rowKey="key"
                    pagination={cancelledDues.length > 5 ? { pageSize: 5 } : false}
                    size={isMobile ? "small" : "middle"}
                    scroll={{ x: true }}
                  />
                </StyledCard>
              )}
            </>
          )}
        </MainContent>
      </Layout>
    </Layout>
  );
};

export default DuesSection;