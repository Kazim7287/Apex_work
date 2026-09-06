import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  Table,
  Card,
  Typography,
  Tag,
  Space,
  Badge,
  Rate,
  Divider,
  Select,
  Button,
  Popconfirm,
  Modal,
  Form,
  Input,
  Grid,
  notification,
  Dropdown,
} from "antd";
import moment from "moment";
import {
  ClockCircleOutlined,
  CloseCircleOutlined,
  TeamOutlined,
  SmileOutlined,
  BookOutlined,
  EditOutlined,
  DeleteOutlined,
  MoreOutlined,
} from "@ant-design/icons";
import StudentPicture from "./StudentPicture";

const { Option } = Select;
const { Text, Title } = Typography;
const { TextArea } = Input;
const { useBreakpoint } = Grid;

const ratingColors = {
  1: { color: "red", label: "Needs Improvement" },
  2: { color: "orange", label: "Below Average" },
  3: { color: "gold", label: "Average" },
  4: { color: "lime", label: "Good" },
  5: { color: "green", label: "Excellent" },
};

const behaviorStatus = {
  excellent: { color: "green", icon: <SmileOutlined />, label: "Excellent" },
  good: { color: "lime", icon: <SmileOutlined />, label: "Good" },
  average: { color: "gold", icon: <SmileOutlined />, label: "Average" },
  poor: { color: "red", icon: <CloseCircleOutlined />, label: "Needs Improvement" },
};

const getRatingColor = (rating) =>
  ratingColors[rating] || { color: "default", label: "Not Rated" };
const getBehaviorStatus = (status) =>
  behaviorStatus[status] || {
    color: "default",
    icon: <ClockCircleOutlined />,
    label: "Not Rated",
  };

const ReportList = ({ teacherId, refresh, isMobile: propIsMobile }) => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentReport, setCurrentReport] = useState(null);
  const [form] = Form.useForm();
  const screens = useBreakpoint();

  // Responsive flag: accounts for prop and breakpoint
  const isMobile =
    propIsMobile !== undefined ? propIsMobile : (!screens.md || screens.xs);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/stdreports_read.php?teacher_id=${teacherId}`
        );
        const data = await response.json();
        setReports(data.data || []);
      } catch (error) {
        notification.error({
          message: "Failed to load reports",
          description: error.message,
        });
      } finally {
        setLoading(false);
      }
    };

    if (teacherId) fetchReports();
  }, [teacherId, refresh]);

  const handleEdit = (report) => {
    setCurrentReport(report);
    form.setFieldsValue({
      academic_performance: report.academic_performance,
      homework_completion: report.homework_completion,
      attendance: report.attendance,
      behavior: report.behavior,
      punctuality: report.punctuality,
      class_participation: report.class_participation,
      communication_skills: report.communication_skills,
      grooming: report.grooming,
      overall_remarks: report.overall_remarks,
    });
    setIsModalVisible(true);
  };

  const handleDelete = async (reportId) => {
    try {
      setLoading(true);
      const response = await fetch(
        "https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/stdreport_delete.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: reportId, teacher_id: teacherId, action: "delete" }),
        }
      );

      const result = await response.json();

      if (result.success) {
        notification.success({ message: "Report Deleted" });
        setReports((prev) => prev.filter((report) => report.id !== reportId));
      } else {
        throw new Error(result.message || "Failed to delete report");
      }
    } catch (error) {
      notification.error({ message: "Error", description: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();

      const response = await fetch(
        "https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/stdreports_update.php",
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: currentReport.id,
            ...values,
            student_id: currentReport.student_id,
            section_id: currentReport.section_id,
            subject_id: currentReport.subject_id,
            report_date: currentReport.report_date,
          }),
        }
      );

      const result = await response.json();

      if (result.status === "success") {
        notification.success({ message: "Report Updated" });
        setReports((prev) =>
          prev.map((report) =>
            report.id === currentReport.id
              ? {
                  ...report,
                  ...values,
                  student_name: currentReport.student_name,
                  section_name: currentReport.section_name,
                  subject_name: currentReport.subject_name,
                }
              : report
          )
        );
        setIsModalVisible(false);
      } else {
        throw new Error(result.message || "Failed to update report");
      }
    } catch (error) {
      notification.error({ message: "Error", description: error.message });
    } finally {
      setLoading(false);
    }
  };

  const getDropdownItems = (record) => [
    {
      key: "attendance",
      label: (
        <Tag color={getBehaviorStatus(record.attendance).color} style={{ margin: 0 }}>
          Attendance: {getBehaviorStatus(record.attendance).label}
        </Tag>
      ),
    },
    {
      key: "behavior",
      label: (
        <Tag color={getBehaviorStatus(record.behavior).color} style={{ margin: 0 }}>
          Behavior: {getBehaviorStatus(record.behavior).label}
        </Tag>
      ),
    },
    {
      key: "punctuality",
      label: (
        <Tag color={getRatingColor(record.punctuality).color} style={{ margin: 0 }}>
          Punctuality: {getRatingColor(record.punctuality).label}
        </Tag>
      ),
    },
    {
      key: "participation",
      label: (
        <Tag color={getBehaviorStatus(record.class_participation).color} style={{ margin: 0 }}>
          Participation: {getBehaviorStatus(record.class_participation).label}
        </Tag>
      ),
    },
    {
      key: "communication",
      label: (
        <Tag color={getBehaviorStatus(record.communication_skills).color} style={{ margin: 0 }}>
          Communication: {getBehaviorStatus(record.communication_skills).label}
        </Tag>
      ),
    },
    {
      key: "grooming",
      label: (
        <Tag color={getBehaviorStatus(record.grooming).color} style={{ margin: 0 }}>
          Grooming: {getBehaviorStatus(record.grooming).label}
        </Tag>
      ),
    },
    {
      type: "divider",
    },
    {
      key: "teacher",
      label: <Text type="secondary">Teacher: {record.teacher_name}</Text>,
    },
    {
      key: "date",
      label: (
        <Text type="secondary">
          Date: {moment(record.report_date).format("MMM D, YYYY")}
        </Text>
      ),
    },
  ];

  const getColumns = () => {
    if (isMobile) {
      return [
        {
          title: "Student Report",
          key: "mobileReport",
          render: (_, record) => (
            <div
              style={{
                width: "100%",
                display: "flex",
                flexDirection: "column",
                gap: 8,
                padding: "4px 0",
              }}
            >
              {/* Student Header */}
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 10,
                  minWidth: 0,
                  width: "100%",
                }}
              >
                <div style={{ flexShrink: 0 }}>
                  <StudentPicture studentId={record.student_id} size={38} />
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <Text
                    strong
                    style={{
                      display: "block",
                      fontSize: 14,
                      wordBreak: "break-word",
                      lineHeight: 1.3,
                    }}
                  >
                    {record.student_name}
                  </Text>
                  <Text type="secondary" style={{ fontSize: 11, display: "block" }}>
                    ID: {record.student_id} • {moment(record.report_date).format("MMM D, YYYY")}
                  </Text>
                  <Space size={4} wrap style={{ marginTop: 4 }}>
                    <Tag color="blue" style={{ margin: 0, fontSize: 11 }}>
                      {record.section_name}
                    </Tag>
                    <Tag color="cyan" style={{ margin: 0, fontSize: 11 }}>
                      {record.subject_name}
                    </Tag>
                  </Space>
                </div>
              </div>

              {/* Performance Metrics */}
              <Space size={4} wrap style={{ width: "100%" }}>
                <Tag
                  color={getRatingColor(record.academic_performance).color}
                  style={{ margin: 0, fontSize: 11 }}
                >
                  Perf: {getRatingColor(record.academic_performance).label}
                </Tag>
                <Tag
                  color={getRatingColor(record.homework_completion).color}
                  style={{ margin: 0, fontSize: 11 }}
                >
                  HW: {getRatingColor(record.homework_completion).label}
                </Tag>
              </Space>

              {/* Remarks */}
              <Text
                style={{
                  fontSize: 12,
                  color: "#475569",
                  wordBreak: "break-word",
                  lineHeight: 1.4,
                }}
              >
                {record.overall_remarks || "No remarks provided"}
              </Text>

              {/* Action Buttons */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: 8,
                  paddingTop: 4,
                  borderTop: "1px solid #f1f5f9",
                }}
              >
                <Button
                  size="small"
                  icon={<EditOutlined />}
                  onClick={() => handleEdit(record)}
                >
                  Edit
                </Button>
                <Popconfirm
                  title="Delete this report?"
                  onConfirm={() => handleDelete(record.id)}
                >
                  <Button size="small" danger icon={<DeleteOutlined />} />
                </Popconfirm>
                <Dropdown
                  menu={{ items: getDropdownItems(record) }}
                  trigger={["click"]}
                >
                  <Button type="default" size="small" icon={<MoreOutlined />}>
                    More Details
                  </Button>
                </Dropdown>
              </div>
            </div>
          ),
        },
      ];
    }

    // Desktop & Tablet columns
    return [
      {
        title: "Student",
        fixed: "left",
        width: 200,
        render: (_, record) => (
          <Space>
            <StudentPicture studentId={record.student_id} size={40} />
            <Space direction="vertical" size={0}>
              <Text strong>{record.student_name}</Text>
              <Text type="secondary">ID: {record.student_id}</Text>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {moment(record.report_date).format("MMM D, YYYY")}
              </Text>
            </Space>
          </Space>
        ),
      },
      {
        title: "Class Info",
        width: 150,
        render: (_, record) => (
          <Space direction="vertical" size={2}>
            <Tag color="blue" icon={<TeamOutlined />}>
              {record.section_name}
            </Tag>
            <Tag color="cyan" icon={<BookOutlined />}>
              {record.subject_name}
            </Tag>
          </Space>
        ),
      },
      {
        title: "Academic",
        width: 180,
        render: (_, record) => (
          <Space direction="vertical" size={6}>
            <div>
              <Text strong>Performance: </Text>
              <Tag color={getRatingColor(record.academic_performance).color}>
                {getRatingColor(record.academic_performance).label}
              </Tag>
            </div>
            <div>
              <Text strong>Homework: </Text>
              <Tag color={getRatingColor(record.homework_completion).color}>
                {getRatingColor(record.homework_completion).label}
              </Tag>
            </div>
          </Space>
        ),
      },
      {
        title: "Behavior",
        width: 200,
        render: (_, record) => (
          <Space direction="vertical" size={6}>
            <div>
              <Text strong>Attendance: </Text>
              <Tag color={getBehaviorStatus(record.attendance).color}>
                {getBehaviorStatus(record.attendance).label}
              </Tag>
            </div>
            <div>
              <Text strong>Behavior: </Text>
              <Tag color={getBehaviorStatus(record.behavior).color}>
                {getBehaviorStatus(record.behavior).label}
              </Tag>
            </div>
          </Space>
        ),
      },
      {
        title: "Engagement",
        width: 200,
        render: (_, record) => (
          <Space direction="vertical" size={6}>
            <div>
              <Text strong>Participation: </Text>
              <Tag color={getBehaviorStatus(record.class_participation).color}>
                {getBehaviorStatus(record.class_participation).label}
              </Tag>
            </div>
            <div>
              <Text strong>Communication: </Text>
              <Tag color={getBehaviorStatus(record.communication_skills).color}>
                {getBehaviorStatus(record.communication_skills).label}
              </Tag>
            </div>
          </Space>
        ),
      },
      {
        title: "Remarks",
        width: 250,
        render: (_, record) => (
          <div>
            <Text style={{ fontSize: 14 }}>
              {record.overall_remarks || "No remarks provided"}
            </Text>
            <Divider style={{ margin: "8px 0" }} />
            <Text type="secondary" style={{ fontSize: 12 }}>
              Teacher: {record.teacher_name}
            </Text>
          </div>
        ),
      },
      {
        title: "Actions",
        fixed: "right",
        width: 120,
        render: (_, record) => (
          <Space>
            <Button icon={<EditOutlined />} onClick={() => handleEdit(record)} />
            <Popconfirm
              title="Delete this report?"
              onConfirm={() => handleDelete(record.id)}
            >
              <Button danger icon={<DeleteOutlined />} />
            </Popconfirm>
          </Space>
        ),
      },
    ];
  };

  return (
    <>
      <Card
        title={
          <Space style={{ flexWrap: "wrap" }}>
            <Title level={isMobile ? 5 : 4} style={{ margin: 0 }}>
              Student Evaluation Reports
            </Title>
            <Badge count={reports.length} />
          </Space>
        }
        bordered={false}
        styles={{
          body: {
            padding: isMobile ? "8px 6px" : "16px",
            overflowX: "auto",
          },
        }}
      >
        <Table
          columns={getColumns()}
          dataSource={reports}
          rowKey="id"
          loading={loading}
          size={isMobile ? "small" : "middle"}
          pagination={{
            pageSize: isMobile ? 5 : 10,
            showSizeChanger: !isMobile,
            pageSizeOptions: isMobile ? ["5", "10"] : ["10", "20", "50"],
            showTotal: isMobile ? undefined : (total) => `Total ${total} reports`,
            simple: isMobile,
            style: { margin: isMobile ? "12px 0 4px" : "16px 0" },
          }}
          scroll={{ x: isMobile ? "100%" : 1200 }}
          style={{ width: "100%" }}
        />
      </Card>

      <Modal
        title="Edit Evaluation Report"
        open={isModalVisible}
        onOk={handleUpdate}
        onCancel={() => setIsModalVisible(false)}
        width={isMobile ? "94%" : 800}
        style={{ top: isMobile ? 12 : 24, maxWidth: 800 }}
        styles={{
          body: {
            maxHeight: isMobile ? "75vh" : "70vh",
            overflowY: "auto",
            padding: isMobile ? "14px 10px" : "20px 24px",
          },
        }}
        footer={[
          <Button key="back" onClick={() => setIsModalVisible(false)}>
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={loading}
            onClick={handleUpdate}
          >
            Update Report
          </Button>,
        ]}
      >
        {currentReport && (
          <>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: 16,
                minWidth: 0,
              }}
            >
              <StudentPicture
                studentId={currentReport.student_id}
                size={isMobile ? 44 : 64}
              />
              <div style={{ marginLeft: 12, minWidth: 0, flex: 1 }}>
                <Title
                  level={isMobile ? 5 : 4}
                  style={{ margin: 0, wordBreak: "break-word" }}
                >
                  {currentReport.student_name}
                </Title>
                <Text type="secondary" style={{ fontSize: 12, display: "block" }}>
                  ID: {currentReport.student_id}
                </Text>
                <Text
                  type="secondary"
                  style={{
                    fontSize: 12,
                    display: "block",
                    wordBreak: "break-word",
                  }}
                >
                  {currentReport.section_name} • {currentReport.subject_name}
                </Text>
              </div>
            </div>

            <Form form={form} layout="vertical">
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                  gap: isMobile ? "10px" : "16px",
                }}
              >
                <Form.Item
                  name="academic_performance"
                  label="Academic Performance"
                >
                  <Rate
                    tooltips={[
                      "Needs Improvement",
                      "Below Average",
                      "Average",
                      "Good",
                      "Excellent",
                    ]}
                  />
                </Form.Item>
                <Form.Item
                  name="homework_completion"
                  label="Homework Completion"
                >
                  <Rate
                    tooltips={[
                      "Needs Improvement",
                      "Below Average",
                      "Average",
                      "Good",
                      "Excellent",
                    ]}
                  />
                </Form.Item>
                <Form.Item name="attendance" label="Attendance">
                  <Select>
                    <Option value="excellent">Excellent</Option>
                    <Option value="good">Good</Option>
                    <Option value="average">Average</Option>
                    <Option value="poor">Needs Improvement</Option>
                  </Select>
                </Form.Item>
                <Form.Item name="behavior" label="Behavior">
                  <Select>
                    <Option value="excellent">Excellent</Option>
                    <Option value="good">Good</Option>
                    <Option value="average">Average</Option>
                    <Option value="poor">Needs Improvement</Option>
                  </Select>
                </Form.Item>
                <Form.Item name="punctuality" label="Punctuality">
                  <Rate
                    tooltips={[
                      "Needs Improvement",
                      "Below Average",
                      "Average",
                      "Good",
                      "Excellent",
                    ]}
                  />
                </Form.Item>
                <Form.Item
                  name="class_participation"
                  label="Class Participation"
                >
                  <Select>
                    <Option value="excellent">Excellent</Option>
                    <Option value="good">Good</Option>
                    <Option value="average">Average</Option>
                    <Option value="poor">Needs Improvement</Option>
                  </Select>
                </Form.Item>
                <Form.Item
                  name="communication_skills"
                  label="Communication Skills"
                >
                  <Select>
                    <Option value="excellent">Excellent</Option>
                    <Option value="good">Good</Option>
                    <Option value="average">Average</Option>
                    <Option value="poor">Needs Improvement</Option>
                  </Select>
                </Form.Item>
                <Form.Item name="grooming" label="Grooming">
                  <Select>
                    <Option value="excellent">Excellent</Option>
                    <Option value="good">Good</Option>
                    <Option value="average">Average</Option>
                    <Option value="poor">Needs Improvement</Option>
                  </Select>
                </Form.Item>
              </div>

              <Form.Item name="overall_remarks" label="Overall Remarks">
                <TextArea rows={4} placeholder="Enter detailed remarks..." />
              </Form.Item>
            </Form>
          </>
        )}
      </Modal>
    </>
  );
};

ReportList.propTypes = {
  teacherId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  refresh: PropTypes.any,
  isMobile: PropTypes.bool,
};

export default ReportList;