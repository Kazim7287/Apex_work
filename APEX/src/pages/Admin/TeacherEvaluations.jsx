import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { BsPrinter } from 'react-icons/bs';
import { 
  DeleteOutlined, 
  DeleteFilled, 
  CheckCircleOutlined, 
  ClockCircleOutlined,
  ReloadOutlined,
  StarOutlined,
  UserOutlined,
  TeamOutlined
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
  Progress,
  Avatar
} from 'antd';

const { Title, Text, Paragraph } = Typography;

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
  const API_BASE = 'https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/';

  const api = axios.create({
    baseURL: API_BASE,
    withCredentials: false,
    headers: {
      'Content-Type': 'application/json'
    }
  });

  useEffect(() => {
    fetchTeachers();
  }, []);

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

  const fetchEvaluations = async (id) => {
    if (!id) return;
    
    setLoading(true);
    setError('');
    setSelectedRowKeys([]);
    
    try {
      const response = await api.get('fetch_evaluations.php', {
        params: {
          teacher_id: id,
          limit: 100,
          offset: 0
        }
      });
      
      if (response.data.success) {
        setEvaluations(response.data.data || []);
        setTeacherInfo(response.data.teacher_info || null);
        setAverageRatings(response.data.average_ratings || {});
      } else {
        setError(response.data.error || 'Failed to fetch evaluations');
        setEvaluations([]);
        setTeacherInfo(null);
        setAverageRatings({});
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Network error. Please try again.');
      setEvaluations([]);
      setTeacherInfo(null);
      setAverageRatings({});
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTeacher = (teacher) => {
    setSelectedTeacher(teacher);
    fetchEvaluations(teacher.id);
  };

  const handleDeleteEvaluation = async (evaluationId) => {
    try {
      const response = await api.delete(`delete_evaluation.php?id=${evaluationId}`);
      
      if (response.data.success) {
        message.success('Evaluation deleted successfully');
        fetchEvaluations(selectedTeacher?.id);
        fetchTeachers();
      } else {
        message.error(response.data.error || 'Failed to delete evaluation');
      }
    } catch (err) {
      message.error(err.response?.data?.error || 'Network error. Please try again.');
    }
  };

  const handleBulkDelete = () => {
    if (selectedRowKeys.length === 0) {
      message.warning('Please select at least one evaluation to delete');
      return;
    }
    setIsBulkDeleteModalVisible(true);
  };

  const confirmBulkDelete = async () => {
    setBulkDeleteLoading(true);
    try {
      const idsParam = selectedRowKeys.join(',');
      const response = await api.delete(`delete_evaluation.php?ids=${idsParam}`);

      if (response.data.success) {
        message.success(`Successfully deleted ${selectedRowKeys.length} evaluation(s)`);
        setSelectedRowKeys([]);
        setIsBulkDeleteModalVisible(false);
        fetchEvaluations(selectedTeacher?.id);
        fetchTeachers();
      } else {
        message.error(response.data.error || 'Failed to delete evaluations');
      }
    } catch (err) {
      message.error(err.response?.data?.error || 'Error deleting evaluations');
    } finally {
      setBulkDeleteLoading(false);
    }
  };

  const handlePrint = () => {
    if (evaluations.length === 0) return;
    setIsPrinting(true);
    const win = window.open('', '', 'width=800,height=900');
    win.document.write(`
      <html>
        <head>
          <title>Teacher Evaluation Report - ${teacherInfo?.teach_name}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; color: #333; }
            h1 { color: #0b1b3d; border-bottom: 2px solid #d4af37; padding-bottom: 10px; }
            .bar { background: #f1f5f9; border-radius: 4px; height: 16px; margin-top: 4px; }
            .fill { background: #d4af37; height: 100%; border-radius: 4px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background: #f8fafc; color: #0b1b3d; }
          </style>
        </head>
        <body>
          <h1>APEX COLLEGE - FACULTY EVALUATION REPORT</h1>
          <p><strong>Faculty Name:</strong> ${teacherInfo?.teach_name}</p>
          <p><strong>Total Submissions:</strong> ${evaluations.length}</p>
          <hr/>
          <h3>Average Dimension Ratings</h3>
          <p>Clarity: ${averageRatings?.avg_clarity || 0} / 5</p>
          <p>Knowledge: ${averageRatings?.avg_knowledge || 0} / 5</p>
          <p>Communication: ${averageRatings?.avg_communication || 0} / 5</p>
          <p>Overall: ${averageRatings?.avg_overall || 0} / 5</p>
        </body>
      </html>
    `);
    win.document.close();
    win.focus();
    win.print();
    win.close();
    setIsPrinting(false);
  };

  const RatingBar = ({ value, label }) => (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <Text strong style={{ color: '#0b1b3d' }}>{label}</Text>
        <Text style={{ fontWeight: 700, color: '#1e3a8a' }}>{Number(value).toFixed(1)} / 5.0</Text>
      </div>
      <Progress percent={(Number(value) / 5) * 100} strokeColor="#d4af37" format={() => `${Number(value).toFixed(1)}`} />
    </div>
  );

  const evaluationColumns = [
    {
      title: 'Student / Section',
      key: 'student',
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Text strong style={{ color: '#0f172a' }}>{record.anonymous ? 'Anonymous Student' : record.student_name}</Text>
          <Text style={{ fontSize: 11, color: '#64748b' }}>Section: {record.section_name || 'N/A'}</Text>
        </Space>
      )
    },
    {
      title: 'Clarity',
      dataIndex: 'clarity',
      key: 'clarity',
      align: 'center',
      render: (r) => <Tag color="blue">{r}/5</Tag>
    },
    {
      title: 'Knowledge',
      dataIndex: 'knowledge',
      key: 'knowledge',
      align: 'center',
      render: (r) => <Tag color="cyan">{r}/5</Tag>
    },
    {
      title: 'Communication',
      dataIndex: 'communication',
      key: 'communication',
      align: 'center',
      render: (r) => <Tag color="purple">{r}/5</Tag>
    },
    {
      title: 'Overall Rating',
      dataIndex: 'overall',
      key: 'overall',
      align: 'center',
      render: (r) => <Tag color="gold" style={{ fontWeight: 700 }}>{r}/5.0</Tag>
    },
    {
      title: 'Feedback Comments',
      dataIndex: 'comments',
      key: 'comments',
      render: (text) => text || '-'
    },
    {
      title: 'Actions',
      key: 'actions',
      align: 'center',
      width: 100,
      render: (_, record) => (
        <Popconfirm
          title="Delete Evaluation"
          description="Are you sure to delete this evaluation?"
          onConfirm={() => handleDeleteEvaluation(record.evaluation_id)}
          okText="Yes"
          cancelText="No"
          okButtonProps={{ danger: true }}
        >
          <Button type="primary" danger icon={<DeleteOutlined />} size="small" style={{ borderRadius: 6 }} />
        </Popconfirm>
      )
    }
  ];

  const rowSelection = {
    selectedRowKeys,
    onChange: (keys) => setSelectedRowKeys(keys)
  };

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto' }}>
      <Card
        className="apex-card"
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: 'linear-gradient(135deg, #0b1b3d 0%, #1e3a8a 100%)', color: '#d4af37', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
              <StarOutlined />
            </div>
            <div>
              <Title level={4} style={{ margin: 0, color: '#0b1b3d', fontWeight: 700 }}>
                Faculty Performance & Student Evaluations
              </Title>
              <Text style={{ color: '#64748b', fontSize: 12 }}>Review student evaluation reports and rating feedback for teachers</Text>
            </div>
          </div>
        }
        extra={
          <Space>
            <Badge count={evaluatedTeachers.length} overflowCount={999} style={{ backgroundColor: '#10b981' }}>
              <Tag color="success" style={{ borderRadius: 12, padding: '4px 10px' }}>Evaluated ({evaluatedTeachers.length})</Tag>
            </Badge>
            <Badge count={notEvaluatedTeachers.length} overflowCount={999} style={{ backgroundColor: '#f59e0b' }}>
              <Tag color="warning" style={{ borderRadius: 12, padding: '4px 10px' }}>Pending ({notEvaluatedTeachers.length})</Tag>
            </Badge>
          </Space>
        }
      >
        <Text strong style={{ color: '#0b1b3d', display: 'block', marginBottom: 12, fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Select Faculty Member:
        </Text>

        {loadingTeachers ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <Spin size="large" />
            <Text style={{ display: 'block', marginTop: 12, color: '#64748b' }}>Loading teachers...</Text>
          </div>
        ) : (
          <Row gutter={[14, 14]} style={{ marginBottom: 24 }}>
            {teachers.map((teacher) => {
              const isSelected = selectedTeacher?.id === teacher.id;
              const isEvaluated = teacher.evaluation_status === 'Evaluated';

              return (
                <Col key={teacher.id} xs={24} sm={12} md={8} lg={6}>
                  <Card
                    hoverable
                    onClick={() => handleSelectTeacher(teacher)}
                    className="apex-card"
                    bodyStyle={{ padding: 14 }}
                    style={{
                      border: isSelected ? '2px solid #d4af37' : '1px solid #e2e8f0',
                      background: isSelected ? 'rgba(212, 175, 55, 0.06)' : '#ffffff',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Avatar style={{ background: '#0b1b3d', color: '#d4af37', fontWeight: 700 }} icon={<UserOutlined />}>
                        {teacher.teach_name?.charAt(0)?.toUpperCase()}
                      </Avatar>
                      <div style={{ flex: 1, overflow: 'hidden' }}>
                        <Text strong style={{ color: '#0b1b3d', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {teacher.teach_name}
                        </Text>
                        <Tag color={isEvaluated ? 'success' : 'warning'} style={{ borderRadius: 10, fontSize: 10, padding: '0 6px', marginTop: 2 }}>
                          {isEvaluated ? 'Evaluated' : 'Pending'}
                        </Tag>
                      </div>
                    </div>
                  </Card>
                </Col>
              );
            })}
          </Row>
        )}

        {/* Selected Teacher Evaluation Details */}
        {teacherInfo && (
          <Card size="small" style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, marginBottom: 24, padding: 12 }}>
            <Row justify="space-between" align="middle" gutter={[16, 16]}>
              <Col>
                <Title level={4} style={{ margin: 0, color: '#0b1b3d' }}>
                  Evaluations for {teacherInfo.teach_name}
                </Title>
                <Text style={{ color: '#64748b', fontSize: 12 }}>
                  Total Submissions: {evaluations.length}
                </Text>
              </Col>
              <Col>
                <Space wrap>
                  {selectedRowKeys.length > 0 && (
                    <Button danger icon={<DeleteFilled />} onClick={handleBulkDelete} loading={bulkDeleteLoading} style={{ borderRadius: 8 }}>
                      Delete Selected ({selectedRowKeys.length})
                    </Button>
                  )}
                  <Button icon={<ReloadOutlined />} onClick={() => fetchEvaluations(selectedTeacher?.id)} loading={loading} style={{ borderRadius: 8 }}>
                    Refresh
                  </Button>
                  <Button type="primary" icon={<BsPrinter />} onClick={handlePrint} disabled={evaluations.length === 0} className="apex-btn-gold">
                    Print Evaluation Report
                  </Button>
                </Space>
              </Col>
            </Row>

            {/* Average Ratings */}
            {averageRatings && Object.keys(averageRatings).length > 0 && (
              <Row gutter={[16, 16]} style={{ marginTop: 20 }}>
                <Col xs={24} md={12}>
                  <Card size="small" style={{ borderRadius: 8 }}>
                    <RatingBar value={averageRatings.avg_clarity || 0} label="Clarity & Teaching Method" />
                    <RatingBar value={averageRatings.avg_knowledge || 0} label="Subject Knowledge" />
                    <RatingBar value={averageRatings.avg_communication || 0} label="Communication Skills" />
                  </Card>
                </Col>
                <Col xs={24} md={12}>
                  <Card size="small" style={{ borderRadius: 8 }}>
                    <RatingBar value={averageRatings.avg_availability || 0} label="Student Availability" />
                    <RatingBar value={averageRatings.avg_fairness || 0} label="Fairness & Grading" />
                    <RatingBar value={averageRatings.avg_overall || 0} label="Overall Score" />
                  </Card>
                </Col>
              </Row>
            )}
          </Card>
        )}

        {/* Evaluations Table */}
        {teacherInfo && (
          <Table
            columns={evaluationColumns}
            dataSource={evaluations.map(e => ({ ...e, key: e.evaluation_id }))}
            rowKey="evaluation_id"
            rowSelection={rowSelection}
            loading={loading}
            scroll={{ x: 'max-content' }}
            pagination={{ pageSize: 10 }}
          />
        )}
      </Card>

      {/* Bulk Delete Modal */}
      <Modal
        title="Confirm Bulk Deletion"
        open={isBulkDeleteModalVisible}
        onOk={confirmBulkDelete}
        onCancel={() => setIsBulkDeleteModalVisible(false)}
        okText="Yes, Delete All"
        cancelText="Cancel"
        okButtonProps={{ danger: true, loading: bulkDeleteLoading }}
        centered
      >
        <p>Are you sure you want to delete <strong>{selectedRowKeys.length}</strong> selected evaluation(s)?</p>
      </Modal>
    </div>
  );
};

export default TeacherEvaluations;