/* eslint-disable react/prop-types */
import React, { useState } from 'react';
import {
  Modal,
  Table,
  Space,
  Tag,
  Progress,
  Dropdown,
  Menu,
  Button,
  Row,
  Col,
  Typography,
  message,
  Tooltip
} from 'antd';
import {
  FilterOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import StudentPicture from './StudentPicture';

const { Text } = Typography;

const AttendanceSummaryModal = ({
  visible,
  onCancel,
  sections,
  screenSize,
  fetchAttendanceSummary,
  modalSummary,
  loading,
  sectionName
}) => {
  const [mobileFilterVisible, setMobileFilterVisible] = useState(false);

  // Calculate correct attendance percentage
  const calculateAttendancePercentage = (record) => {
    // Total days should be the sum of all attendance records
    const totalDays = record.present + record.absent + record.leave + 
                     record.late_comer + record.half_leave;
    
    if (totalDays === 0) return 0;
    
    // Count present + half of late comer and half leave
    const effectivePresent = record.present + 
                            (record.late_comer * 0.5) + 
                            (record.half_leave * 0.5);
    
    const percentage = Math.round((effectivePresent / totalDays) * 100);
    return Math.min(100, Math.max(0, percentage)); // Ensure between 0-100
  };

  return (
    <Modal 
      title={
        <Space>
          <span>Attendance Summary - {sectionName}</span>
          <Tooltip title="Percentage calculation: Present + 50% of Late Comer + 50% of Half Leave">
            <InfoCircleOutlined style={{ color: '#1890ff' }} />
          </Tooltip>
        </Space>
      } 
      visible={visible} 
      onCancel={onCancel} 
      footer={null}
      width={screenSize.xs ? '95%' : 1000}
      bodyStyle={{ padding: screenSize.xs ? '12px' : '24px' }}
    >
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col span={24}>
          <Text strong>Select Section:</Text>
          <div style={{ marginTop: 8 }}>
            {sections.length > 0 ? (
              <Dropdown
                overlay={
                  <Menu>
                    {sections.map(section => (
                      <Menu.Item 
                        key={section.id} 
                        onClick={() => fetchAttendanceSummary(section.id)}
                      >
                        {section.name}
                      </Menu.Item>
                    ))}
                  </Menu>
                }
                trigger={['click']}
                visible={mobileFilterVisible}
                onVisibleChange={setMobileFilterVisible}
              >
                <Button 
                  icon={<FilterOutlined />} 
                  size={screenSize.xs ? 'small' : 'middle'}
                  style={{ marginTop: 8 }}
                >
                  Select Section
                </Button>
              </Dropdown>
            ) : (
              <Text type="secondary">No sections found</Text>
            )}
          </div>
        </Col>
      </Row>
      
      <Table
        dataSource={modalSummary}
        columns={[
          { 
            title: 'Student', 
            key: 'student',
            fixed: 'left',
            width: screenSize.xs ? 150 : 200,
            render: (_, record) => (
              <Space>
                <StudentPicture studentId={record.student_id} size={screenSize.xs ? 32 : 40} />
                <Space direction="vertical" size={0}>
                  <Text strong style={{ fontSize: screenSize.xs ? '12px' : '14px' }}>
                    {record.student_name}
                  </Text>
                  <Text type="secondary" style={{ fontSize: screenSize.xs ? '10px' : '12px' }}>
                    ID: {record.student_id}
                  </Text>
                </Space>
              </Space>
            )
          },
          { 
            title: 'Present', 
            dataIndex: 'present', 
            key: 'present',
            width: screenSize.xs ? 80 : 100,
            render: (count) => <Tag color="green" style={{ fontSize: screenSize.xs ? '10px' : '12px' }}>{count}</Tag>
          },
          { 
            title: 'Absent', 
            dataIndex: 'absent', 
            key: 'absent',
            width: screenSize.xs ? 80 : 100,
            render: (count) => <Tag color="red" style={{ fontSize: screenSize.xs ? '10px' : '12px' }}>{count}</Tag>
          },
          { 
            title: 'Leave', 
            dataIndex: 'leave', 
            key: 'leave',
            width: screenSize.xs ? 80 : 100,
            render: (count) => <Tag color="orange" style={{ fontSize: screenSize.xs ? '10px' : '12px' }}>{count}</Tag>
          },
          { 
            title: 'Late', 
            dataIndex: 'late_comer', 
            key: 'late_comer',
            width: screenSize.xs ? 80 : 100,
            render: (count) => <Tag color="blue" style={{ fontSize: screenSize.xs ? '10px' : '12px' }}>{count}</Tag>
          },
          { 
            title: 'Half Leave', 
            dataIndex: 'half_leave', 
            key: 'half_leave',
            width: screenSize.xs ? 80 : 100,
            render: (count) => <Tag color="purple" style={{ fontSize: screenSize.xs ? '10px' : '12px' }}>{count}</Tag>
          },
          { 
            title: 'Total Days', 
            key: 'total',
            width: screenSize.xs ? 80 : 100,
            render: (_, record) => {
              const total = record.present + record.absent + record.leave + 
                           record.late_comer + record.half_leave;
              return <Tag style={{ fontSize: screenSize.xs ? '10px' : '12px' }}>{total}</Tag>;
            }
          },
          { 
            title: 'Percentage', 
            key: 'percentage',
            width: screenSize.xs ? 100 : 150,
            render: (_, record) => {
              const percentage = calculateAttendancePercentage(record);
              const totalDays = record.present + record.absent + record.leave + 
                               record.late_comer + record.half_leave;
              
              return (
                <Tooltip title={`${percentage}% attendance out of ${totalDays} total days`}>
                  <Progress 
                    percent={percentage}
                    status={percentage >= 75 ? 'success' : percentage >= 50 ? 'normal' : 'exception'}
                    format={() => `${percentage}%`}
                    size={screenSize.xs ? 'small' : 'default'}
                  />
                </Tooltip>
              );
            }
          },
        ]}
        rowKey="student_id"
        loading={loading}
        scroll={{ x: screenSize.xs ? 600 : true }}
        size={screenSize.xs ? 'small' : 'middle'}
        locale={{ emptyText: 'No attendance summary available' }}
        summary={() => (
          modalSummary.length > 0 ? (
            <Table.Summary fixed>
              <Table.Summary.Row>
                <Table.Summary.Cell index={0} colSpan={7}>
                  <Text strong>Class Average</Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={1}>
                  <Text strong>
                    {Math.round(modalSummary.reduce((sum, record) => sum + calculateAttendancePercentage(record), 0) / modalSummary.length)}%
                  </Text>
                </Table.Summary.Cell>
              </Table.Summary.Row>
            </Table.Summary>
          ) : null
        )}
      />
    </Modal>
  );
};

export default AttendanceSummaryModal;