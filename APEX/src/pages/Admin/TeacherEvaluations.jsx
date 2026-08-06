/* eslint-disable no-unused-vars */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable react/prop-types */
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { BsPrinter } from 'react-icons/bs';
import { 
  DeleteOutlined, 
  DeleteFilled, 
  CheckCircleOutlined, 
  ClockCircleOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import { 
  Modal, 
  Popconfirm, 
  message, 
  Table, 
  Tag, 
  Space, 
  Button, 
  Badge, 
  Empty, 
  Card,
  Row,
  Col,
  Typography,
  Spin,
  Alert,
  Tooltip,
  Grid
} from 'antd';

const { Title, Text, Paragraph } = Typography;
const { useBreakpoint } = Grid;

const TeacherEvaluations = () => {
  const [teachers, setTeachers] = useState([]);
  const [evaluatedTeachers, setEvaluatedTeachers] = useState([]);
  const [notEvaluatedTeachers, setNotEvaluatedTeachers] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [evaluations, setEvaluations] = useState([]);
  const [teacherInfo, setTeacherInfo] = useState(null);
  const [averageRatings, setAverageRatings] = useState({});
  const [loading, setLoading] = useState(false);
  const [loadingTeachers, setLoadingTeachers] = useState(false);
  const [error, setError] = useState('');
  const [isPrinting, setIsPrinting] = useState(false);

  // State for bulk selection and deletion
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [isBulkDeleteModalVisible, setIsBulkDeleteModalVisible] = useState(false);
  const [bulkDeleteLoading, setBulkDeleteLoading] = useState(false);

  const printRef = useRef();
  const screens = useBreakpoint();

  // API Base URL
  const API_BASE = 'https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/';

  // Create axios instance
  const api = axios.create({
    baseURL: API_BASE,
    withCredentials: false,
    headers: {
      'Content-Type': 'application/json'
    }
  });

  // Fetch teachers with evaluation status
  useEffect(() => {
    const fetchTeachers = async () => {
      setLoadingTeachers(true);
      try {
        const response = await api.get('teach_with_evaluation_status.php');
        
        if (response.data.success) {
          setTeachers(response.data.data || []);
          setEvaluatedTeachers(response.data.evaluated || []);
          setNotEvaluatedTeachers(response.data.not_evaluated || []);
        } else {
          setError(response.data.error || 'Failed to fetch teachers');
        }
      } catch (err) {
        setError(err.response?.data?.error || 'Network error. Please try again.');
      } finally {
        setLoadingTeachers(false);
      }
    };

    fetchTeachers();
  }, []);

  const fetchEvaluations = async (id) => {
    if (!id) return;
    
    setLoading(true);
    setError('');
    
    try {
      const response = await api.get(`fetch_evaluations.php`, {
        params: {
          teacher_id: id,
          limit: 100,
          offset: 0
        }
      });
      
      console.log('=== FETCH EVALUATIONS RESPONSE ===');
      console.log('Full response:', response.data);
      console.log('==================================');
      
      if (response.data.success) {
        // Extract data from response
        const evaluationsData = response.data.data || [];
        const teacherInfoData = response.data.teacher_info;
        const averageRatingsData = response.data.average_ratings || {};
        
        console.log('Evaluations data length:', evaluationsData.length);
        console.log('Teacher info:', teacherInfoData);
        console.log('Average ratings:', averageRatingsData);
        
        // Update all states
        setEvaluations(evaluationsData);
        setTeacherInfo(teacherInfoData);
        setAverageRatings(averageRatingsData);
        setSelectedRowKeys([]);
        
        message.success(`Loaded ${evaluationsData.length} evaluations for ${teacherInfoData?.teach_name || 'teacher'}`);
      } else {
        setError(response.data.error || 'Failed to fetch evaluations');
        setEvaluations([]);
        message.warning('No evaluations found for this teacher');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Network error. Please try again.');
      setEvaluations([]);
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTeacherSelect = (teacher) => {
    console.log('Selected teacher:', teacher);
    setSelectedTeacher(teacher);
    setSelectedRowKeys([]);
    setEvaluations([]);
    setAverageRatings({});
    setTeacherInfo(null);
    fetchEvaluations(teacher.id);
  };

  // Handle single delete
  const handleDelete = async (id) => {
    try {
      const response = await api.delete(`delete_evaluation.php?id=${id}`);
      
      if (response.data.success) {
        message.success(response.data.message || 'Evaluation deleted successfully');
        
        setEvaluations(prev => {
          const newEvaluations = prev.filter(evaluation => evaluation.evaluation_id !== id);
          console.log('After delete - evaluations count:', newEvaluations.length);
          return newEvaluations;
        });
        setSelectedRowKeys(prev => prev.filter(key => key !== id));
        
        refreshTeacherStatus();
      } else {
        message.error(response.data.message || 'Delete failed');
      }
    } catch (error) {
      message.error('Error deleting evaluation');
      console.error('Delete error:', error);
    }
  };

  // Handle bulk delete
  const handleBulkDelete = () => {
    if (selectedRowKeys.length === 0) {
      message.warning('Please select at least one evaluation to delete');
      return;
    }
    setIsBulkDeleteModalVisible(true);
  };

  const confirmBulkDelete = async () => {
    try {
      setBulkDeleteLoading(true);
      setIsBulkDeleteModalVisible(false);
      
      const idsParam = selectedRowKeys.join(',');
      const response = await api.delete(`delete_evaluation.php?ids=${idsParam}`);

      if (response.data.success) {
        message.success(response.data.message);
        
        setEvaluations(prev => {
          const newEvaluations = prev.filter(evaluation => !selectedRowKeys.includes(evaluation.evaluation_id));
          console.log('After bulk delete - evaluations count:', newEvaluations.length);
          return newEvaluations;
        });
        
        setSelectedRowKeys([]);
        refreshTeacherStatus();
      } else {
        message.error(response.data.message || 'Bulk delete failed');
      }
    } catch (error) {
      message.error('Error performing bulk delete');
      console.error('Bulk delete error:', error);
    } finally {
      setBulkDeleteLoading(false);
    }
  };

  const refreshTeacherStatus = async () => {
    try {
      const response = await api.get('teach_with_evaluation_status.php');
      if (response.data.success) {
        setTeachers(response.data.data || []);
        setEvaluatedTeachers(response.data.evaluated || []);
        setNotEvaluatedTeachers(response.data.not_evaluated || []);
      }
    } catch (error) {
      console.error('Error refreshing teacher status:', error);
    }
  };

  const handlePrint = () => {
    const currentEvaluations = evaluations;
    const currentTeacherInfo = teacherInfo;
    const currentAverageRatings = averageRatings;
    
    console.log('=== PRINT DEBUG ===');
    console.log('Evaluations count:', currentEvaluations.length);
    console.log('Teacher Info:', currentTeacherInfo);
    console.log('===================');
    
    if (!currentTeacherInfo) {
      message.warning('Teacher information is not available');
      return;
    }
    
    if (currentEvaluations.length === 0) {
      message.warning('No evaluations available to print');
      return;
    }
    
    setIsPrinting(true);
    
    const printContent = generatePrintContent(currentTeacherInfo, currentEvaluations, currentAverageRatings);
    
    setTimeout(() => {
      const printWindow = window.open('', '_blank', 'width=1200,height=800');
      if (!printWindow) {
        message.error('Please allow popups to print');
        setIsPrinting(false);
        return;
      }
      
      printWindow.document.write(`
        <html>
          <head>
            <title>Teacher Evaluation Report - ${currentTeacherInfo.teach_name}</title>
            <style>
              * { margin: 0; padding: 0; box-sizing: border-box; }
              body { font-family: Arial, sans-serif; margin: 20px; color: #333; background: #fff; }
              .print-container { max-width: 1100px; margin: 0 auto; padding: 20px; }
              .print-header { text-align: center; margin-bottom: 25px; padding-bottom: 20px; border-bottom: 3px solid #1890ff; }
              .print-header h1 { margin: 0 0 5px 0; color: #1890ff; font-size: 28px; }
              .print-header h2 { margin: 5px 0; color: #333; font-size: 22px; }
              .print-header .meta { color: #666; font-size: 14px; margin-top: 5px; }
              .print-section { margin-bottom: 25px; }
              .print-section h3 { background: #f0f5ff; padding: 10px 15px; border-radius: 4px; margin-bottom: 15px; color: #1890ff; font-size: 18px; border-left: 4px solid #1890ff; }
              .teacher-info-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; padding: 15px; background: #f9f9f9; border-radius: 8px; margin-bottom: 20px; }
              .teacher-info-item { display: flex; flex-direction: column; }
              .teacher-info-item .label { font-weight: bold; color: #666; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
              .teacher-info-item .value { font-size: 16px; margin-top: 2px; }
              .ratings-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 20px; }
              .rating-item { background: #f9f9f9; padding: 12px; border-radius: 6px; text-align: center; }
              .rating-item .rating-label { font-weight: bold; color: #555; font-size: 13px; }
              .rating-item .rating-value { font-size: 24px; font-weight: bold; color: #1890ff; display: block; margin-top: 5px; }
              .rating-item .rating-max { font-size: 14px; color: #999; }
              .evaluation-card { border: 1px solid #e8e8e8; border-radius: 8px; padding: 15px; margin-bottom: 15px; page-break-inside: avoid; }
              .evaluation-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; padding-bottom: 10px; border-bottom: 1px solid #f0f0f0; flex-wrap: wrap; gap: 10px; }
              .evaluation-header .student-name { font-weight: bold; font-size: 16px; }
              .evaluation-header .section { color: #666; font-size: 14px; }
              .evaluation-header .date { color: #888; font-size: 13px; }
              .evaluation-ratings { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 10px; }
              .eval-rating-item { display: flex; justify-content: space-between; padding: 4px 8px; background: #f9f9f9; border-radius: 4px; font-size: 13px; }
              .eval-rating-item .label { color: #555; }
              .eval-rating-item .value { font-weight: bold; }
              .eval-comments { margin-top: 8px; padding: 8px 12px; background: #f9f9f9; border-radius: 4px; font-size: 13px; }
              .eval-comments .label { font-weight: bold; color: #555; }
              .print-footer { margin-top: 30px; padding-top: 15px; border-top: 2px solid #e8e8e8; text-align: center; font-size: 12px; color: #999; }
              @media print { body { margin: 0.3in; } .evaluation-card { page-break-inside: avoid; } }
            </style>
          </head>
          <body>
            <div class="print-container">
              ${printContent}
            </div>
          </body>
        </html>
      `);
      
      printWindow.document.close();
      
      setTimeout(() => {
        printWindow.focus();
        printWindow.print();
        printWindow.close();
        setIsPrinting(false);
      }, 500);
    }, 150);
  };

  const generatePrintContent = (teacherInfo, evaluations, averageRatings) => {
    const formatDate = (dateString) => {
      if (!dateString) return 'N/A';
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    };

    let html = `
      <div class="print-header">
        <h1>📊 Teacher Evaluation Report</h1>
        <h2>${teacherInfo.teach_name || 'N/A'}</h2>
        <div class="meta">
          Report Generated on: ${new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })} at ${new Date().toLocaleTimeString()}
        </div>
      </div>
      
      <div class="print-section">
        <h3>Teacher Information</h3>
        <div class="teacher-info-grid">
          <div class="teacher-info-item">
            <span class="label">Teacher ID</span>
            <span class="value">${teacherInfo.id || 'N/A'}</span>
          </div>
          <div class="teacher-info-item">
            <span class="label">Name</span>
            <span class="value">${teacherInfo.teach_name || 'N/A'}</span>
          </div>
          <div class="teacher-info-item">
            <span class="label">Total Evaluations</span>
            <span class="value">${evaluations ? evaluations.length : 0}</span>
          </div>
        </div>
      </div>
    `;

    if (averageRatings && Object.keys(averageRatings).length > 0) {
      html += `
        <div class="print-section">
          <h3>Average Ratings</h3>
          <div class="ratings-grid">
      `;
      
      const ratingLabels = {
        avg_clarity: 'Clarity',
        avg_knowledge: 'Knowledge',
        avg_communication: 'Communication',
        avg_availability: 'Availability',
        avg_fairness: 'Fairness',
        avg_overall: 'Overall'
      };
      
      Object.keys(ratingLabels).forEach(key => {
        if (averageRatings[key] !== undefined && averageRatings[key] !== null) {
          html += `
            <div class="rating-item">
              <span class="rating-label">${ratingLabels[key]}</span>
              <span class="rating-value">${parseFloat(averageRatings[key]).toFixed(2)}<span class="rating-max">/5</span></span>
            </div>
          `;
        }
      });
      
      html += `
          </div>
        </div>
      `;
    }

    if (evaluations && evaluations.length > 0) {
      html += `
        <div class="print-section">
          <h3>Individual Evaluations (${evaluations.length})</h3>
      `;
      
      evaluations.forEach((evaluation) => {
        html += `
          <div class="evaluation-card">
            <div class="evaluation-header">
              <span class="student-name">${evaluation.anonymous ? 'Anonymous Student' : (evaluation.student_name || 'N/A')}</span>
              <span class="section">${evaluation.section_name || 'N/A'}</span>
              <span class="date">${formatDate(evaluation.submission_date)}</span>
            </div>
            <div class="evaluation-ratings">
              <div class="eval-rating-item">
                <span class="label">Clarity:</span>
                <span class="value">${evaluation.clarity || 0}/5</span>
              </div>
              <div class="eval-rating-item">
                <span class="label">Knowledge:</span>
                <span class="value">${evaluation.knowledge || 0}/5</span>
              </div>
              <div class="eval-rating-item">
                <span class="label">Communication:</span>
                <span class="value">${evaluation.communication || 0}/5</span>
              </div>
              <div class="eval-rating-item">
                <span class="label">Availability:</span>
                <span class="value">${evaluation.availability || 0}/5</span>
              </div>
              <div class="eval-rating-item">
                <span class="label">Fairness:</span>
                <span class="value">${evaluation.fairness || 0}/5</span>
              </div>
              <div class="eval-rating-item">
                <span class="label">Overall:</span>
                <span class="value">${evaluation.overall || 0}/5</span>
              </div>
            </div>
        `;
        
        if (evaluation.comments) {
          html += `
            <div class="eval-comments">
              <span class="label">Comments:</span> ${evaluation.comments}
            </div>
          `;
        }
        
        if (evaluation.suggestions) {
          html += `
            <div class="eval-comments" style="margin-top: 5px;">
              <span class="label">Suggestions:</span> ${evaluation.suggestions}
            </div>
          `;
        }
        
        html += `</div>`;
      });
      
      html += `</div>`;
    }

    html += `
      <div class="print-footer">
        <p>Generated by Apex School Management System</p>
        <p>Page 1 of 1</p>
      </div>
    `;

    return html;
  };

  const RatingBar = ({ value, max = 5, label }) => {
    const percentage = (value / max) * 100;
    
    return (
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
        <Text strong style={{ width: 120, flexShrink: 0 }}>{label}:</Text>
        <div style={{ 
          flexGrow: 1, 
          height: 20, 
          backgroundColor: '#e0e0e0', 
          borderRadius: 10, 
          overflow: 'hidden',
          margin: '0 10px'
        }}>
          <div style={{ 
            height: '100%', 
            width: `${percentage}%`,
            background: 'linear-gradient(90deg, #ff9800, #f57c00)',
            transition: 'width 0.3s ease'
          }} />
        </div>
        <Text strong style={{ width: 50, textAlign: 'right', flexShrink: 0 }}>
          {value.toFixed(2)}
        </Text>
      </div>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Evaluation table columns
  const evaluationColumns = [
    {
      title: 'Student',
      dataIndex: 'student_name',
      key: 'student_name',
      render: (text, record) => record.anonymous ? 'Anonymous' : (text || 'N/A')
    },
    {
      title: 'Section',
      dataIndex: 'section_name',
      key: 'section_name',
      render: (text) => text || 'N/A'
    },
    {
      title: 'Overall Rating',
      dataIndex: 'overall',
      key: 'overall',
      render: (value) => (
        <Badge 
          count={value || 0} 
          style={{ 
            backgroundColor: value >= 4 ? '#52c41a' : value >= 3 ? '#faad14' : '#f5222d',
            fontSize: 14,
            padding: '0 8px'
          }} 
        />
      )
    },
    {
      title: 'Date',
      dataIndex: 'submission_date',
      key: 'submission_date',
      render: (date) => formatDate(date)
    },
    {
      title: 'Action',
      key: 'action',
      width: 120,
      fixed: 'right',
      render: (_, record) => (
        <Popconfirm
          title="Delete this evaluation?"
          description={`Are you sure you want to delete evaluation from ${record.anonymous ? 'Anonymous' : (record.student_name || 'Unknown')}?`}
          onConfirm={() => handleDelete(record.evaluation_id)}
          okText="Yes"
          cancelText="No"
          placement="left"
          okButtonProps={{ danger: true }}
        >
          <Button 
            danger 
            icon={<DeleteOutlined />} 
            size="small"
            type="primary"
          >
            Delete
          </Button>
        </Popconfirm>
      )
    }
  ];

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

  // Teacher card component
  const TeacherCard = ({ teacher }) => (
    <Card
      hoverable
      style={{ 
        borderLeft: `4px solid ${teacher.evaluation_status === 'Evaluated' ? '#52c41a' : '#faad14'}`,
        backgroundColor: selectedTeacher?.id === teacher.id ? '#e6f7ff' : 'white',
        cursor: 'pointer',
        height: '100%'
      }}
      onClick={() => handleTeacherSelect(teacher)}
    >
      <Text strong style={{ fontSize: 16, display: 'block', marginBottom: 8 }}>
        {teacher.teach_name}
      </Text>
      <Space direction="vertical" size={2} style={{ width: '100%' }}>
        <Text type="secondary">{teacher.designation || 'N/A'}</Text>
        <Text type="secondary">Section: {teacher.teach_sec}</Text>
        <div>
          {teacher.evaluation_status === 'Evaluated' ? (
            <Tag color="green" icon={<CheckCircleOutlined />}>Evaluated</Tag>
          ) : (
            <Tag color="orange" icon={<ClockCircleOutlined />}>Not Evaluated</Tag>
          )}
        </div>
        {teacher.total_evaluations > 0 && (
          <Text type="secondary" style={{ fontSize: 12 }}>
            {teacher.total_evaluations} eval(s) - Avg: {teacher.avg_overall_rating ? teacher.avg_overall_rating.toFixed(2) : 'N/A'}/5
          </Text>
        )}
      </Space>
    </Card>
  );

  return (
    <div style={{ padding: screens.xs ? 12 : 20, maxWidth: 1400, margin: '0 auto' }}>
      <Title level={1}>Teacher Evaluation Dashboard</Title>
      
      {/* Teacher Selection Section */}
      <Card style={{ marginBottom: 30 }}>
        <Row justify="space-between" align="middle" style={{ marginBottom: 15 }}>
          <Col>
            <Title level={2} style={{ margin: 0 }}>Select a Teacher</Title>
          </Col>
          <Col>
            <Space>
              <Badge count={evaluatedTeachers.length} style={{ backgroundColor: '#52c41a' }}>
                <Text>✅ Evaluated</Text>
              </Badge>
              <Badge count={notEvaluatedTeachers.length} style={{ backgroundColor: '#faad14' }}>
                <Text>⏳ Not Evaluated</Text>
              </Badge>
            </Space>
          </Col>
        </Row>
        
        {loadingTeachers ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <Spin size="large" />
            <Text style={{ display: 'block', marginTop: 16 }}>Loading teachers...</Text>
          </div>
        ) : (
          <Row gutter={[16, 16]}>
            {teachers.map((teacher) => (
              <Col key={teacher.id} xs={24} sm={12} md={8} lg={6}>
                <TeacherCard teacher={teacher} />
              </Col>
            ))}
          </Row>
        )}
      </Card>
      
      {error && (
        <Alert 
          message="Error" 
          description={error} 
          type="error" 
          showIcon 
          style={{ marginBottom: 20 }}
          closable
          onClose={() => setError('')}
        />
      )}
      
      {/* Teacher Evaluations Section */}
      {teacherInfo && (
        <Card style={{ marginBottom: 20 }}>
          <Row justify="space-between" align="middle" gutter={[16, 16]}>
            <Col>
              <Title level={2} style={{ margin: 0 }}>Evaluations for {teacherInfo.teach_name}</Title>
              <Text type="secondary">Teacher ID: {teacherInfo.id} | Total Evaluations: {evaluations.length}</Text>
            </Col>
            <Col>
              <Space wrap>
                {selectedRowKeys.length > 0 && (
                  <Button 
                    danger
                    icon={<DeleteFilled />}
                    onClick={handleBulkDelete}
                    loading={bulkDeleteLoading}
                  >
                    Delete Selected ({selectedRowKeys.length})
                  </Button>
                )}
                <Button
                  icon={<ReloadOutlined />}
                  onClick={() => fetchEvaluations(selectedTeacher?.id)}
                  loading={loading}
                >
                  Refresh
                </Button>
                <Tooltip title={evaluations.length === 0 ? "No evaluations available to print" : "Print evaluation report"}>
                  <Button
                    type="primary"
                    icon={<BsPrinter />}
                    onClick={handlePrint}
                    disabled={isPrinting || evaluations.length === 0}
                    style={{ 
                      backgroundColor: evaluations.length === 0 ? '#d9d9d9' : '#2c3e50',
                      borderColor: evaluations.length === 0 ? '#d9d9d9' : '#2c3e50',
                      color: evaluations.length === 0 ? 'rgba(0,0,0,0.25)' : 'white'
                    }}
                  >
                    {isPrinting ? 'Preparing Report...' : 'Print Report'}
                  </Button>
                </Tooltip>
              </Space>
            </Col>
          </Row>
        </Card>
      )}
      
      {/* Average Ratings */}
      {averageRatings && Object.keys(averageRatings).length > 0 && (
        <Card title="Average Ratings" style={{ marginBottom: 20 }}>
          <RatingBar value={averageRatings.avg_clarity || 0} label="Clarity" />
          <RatingBar value={averageRatings.avg_knowledge || 0} label="Knowledge" />
          <RatingBar value={averageRatings.avg_communication || 0} label="Communication" />
          <RatingBar value={averageRatings.avg_availability || 0} label="Availability" />
          <RatingBar value={averageRatings.avg_fairness || 0} label="Fairness" />
          <RatingBar value={averageRatings.avg_overall || 0} label="Overall" />
        </Card>
      )}
      
      {/* Evaluations Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 40 }}>
          <Spin size="large" />
          <Text style={{ display: 'block', marginTop: 16 }}>Loading evaluations...</Text>
        </div>
      ) : evaluations.length > 0 ? (
        <Card 
          title={`Individual Evaluations (${evaluations.length} total)`}
          extra={
            selectedRowKeys.length > 0 && (
              <Text style={{ color: '#1890ff' }}>
                Selected {selectedRowKeys.length} evaluation(s)
              </Text>
            )
          }
        >
          <Table
            columns={evaluationColumns}
            dataSource={evaluations.map(e => ({ ...e, key: e.evaluation_id }))}
            rowKey="evaluation_id"
            rowSelection={rowSelection}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              pageSizeOptions: ['5', '10', '20', '50'],
              showTotal: (total) => `Total ${total} entries`,
            }}
            size="middle"
            bordered
            scroll={{ x: 800 }}
          />
        </Card>
      ) : teacherInfo && !loading ? (
        <Card>
          <Empty 
            description="No evaluations found for this teacher" 
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        </Card>
      ) : null}

      {/* Bulk Delete Confirmation Modal */}
      <Modal
        title="Confirm Bulk Delete"
        open={isBulkDeleteModalVisible}
        onOk={confirmBulkDelete}
        onCancel={() => setIsBulkDeleteModalVisible(false)}
        okText="Yes, Delete All"
        cancelText="Cancel"
        okButtonProps={{ danger: true, loading: bulkDeleteLoading }}
        width={600}
      >
        <Paragraph>
          Are you sure you want to delete <strong>{selectedRowKeys.length}</strong> selected evaluation(s)?
        </Paragraph>
        <Paragraph style={{ color: '#ff4d4f' }}>
          This action cannot be undone.
        </Paragraph>
        <div style={{ marginTop: 16, maxHeight: 250, overflowY: 'auto' }}>
          {evaluations
            .filter(e => selectedRowKeys.includes(e.evaluation_id))
            .map(e => (
              <div key={e.evaluation_id} style={{ padding: '6px 0', borderBottom: '1px solid #f0f0f0' }}>
                <Text>
                  <strong>{e.anonymous ? 'Anonymous' : e.student_name}</strong> - {e.section_name} 
                  <Tag color="blue" style={{ marginLeft: 8 }}>Overall: {e.overall}/5</Tag>
                </Text>
              </div>
            ))
          }
        </div>
      </Modal>
    </div>
  );
};

export default TeacherEvaluations;