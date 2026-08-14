import { useState, useEffect } from "react";
import {
  Table,
  Card,
  Typography,
  Button,
  Space,
  Tag,
  DatePicker,
  Select,
  Input,
  message,
  Modal,
  Form,
  Row,
  Col,
  Spin,
  Empty,
  Popconfirm,
  Tooltip,
} from "antd";

import moment from "moment";
import axios from "axios";

import {
  SearchOutlined,
  DeleteOutlined,
  DollarOutlined,
  PlusOutlined,
  DeleteFilled,
  CheckCircleOutlined,
  ClockCircleOutlined,
  PrinterOutlined,
} from "@ant-design/icons";

import { useNavigate } from "react-router-dom";
import PaymentModal from "./PaymentModal";

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

const DuesListing = () => {
  const navigate = useNavigate();

  // =========================
  // STATE
  // =========================

  const [loading, setLoading] = useState(false);
  const [dues, setDues] = useState([]);

  const [filters, setFilters] = useState({
    status: null,
    dueType: null,
    dateRange: null,
    search: "",
  });

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

  const [sections, setSections] = useState([]);
  const [students, setStudents] = useState([]);

  const [sectionsLoading, setSectionsLoading] = useState(false);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [amountValue, setAmountValue] = useState("");

  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [isBulkDeleteModalVisible, setIsBulkDeleteModalVisible] =
    useState(false);

  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [selectedDue, setSelectedDue] = useState(null);

  // =========================
  // CONSTANTS
  // =========================

  const dueTypes = [
    "Tuition Fee",
    "Library Fine",
    "Lab Charges",
    "Sports Fee",
    "Transport Fee",
    "Other",
  ];

  // =========================
  // API
  // KEEPING YOUR OLD WORKING
  // BACKEND URL + ENDPOINTS
  // =========================

  const publicApi = axios.create({
    baseURL:
      "https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/",
    withCredentials: false,
    headers: {
      "Content-Type": "application/json",
    },
  });

  const authApi = axios.create({
    baseURL:
      "https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/",
    withCredentials: true,
    headers: {
      "Content-Type": "application/json",
    },
  });

  // =========================
  // FETCH DUES
  // SAME ENDPOINT AS OLD
  // WORKING VERSION
  // =========================

  useEffect(() => {
    fetchDues();
  }, [
    pagination.current,
    pagination.pageSize,
    filters.status,
    filters.dueType,
    filters.dateRange,
    filters.search,
  ]);

  // Fetch sections only once
  useEffect(() => {
    fetchSections();
  }, []);

  const fetchDues = async () => {
    setLoading(true);

    try {
      const params = {
        status: filters.status,
        dueType: filters.dueType,
      };

      // OLD BACKEND EXPECTS studentId
      if (filters.search) {
        params.studentId = filters.search;
      }

      // OLD BACKEND EXPECTS dateFrom/dateTo
      if (
        filters.dateRange &&
        filters.dateRange[0] &&
        filters.dateRange[1]
      ) {
        params.dateFrom =
          filters.dateRange[0].format("YYYY-MM-DD");

        params.dateTo =
          filters.dateRange[1].format("YYYY-MM-DD");
      }

      // IMPORTANT:
      // This is the endpoint used by your old working version.
      const response = await publicApi.get("get_deus.php", {
        params,
      });

      // Old backend returns an ARRAY directly.
      const data = Array.isArray(response.data)
        ? response.data
        : [];

      const formattedDues = data.map((due) => ({
        ...due,

        id: due.id,

        student_name:
          due.student_name || "N/A",

        father_name:
          due.father_name ||
          due.fathers_name ||
          "N/A",

        fathers_name:
          due.fathers_name ||
          due.father_name ||
          "N/A",

        section_name:
          due.section_name || "N/A",

        due_type:
          due.due_type || "Other",

        amount:
          parseFloat(due.amount) || 0,

        due_date:
          due.due_date,

        status:
          due.status || "Pending",
      }));

      setDues(formattedDues);

      setPagination((prev) => ({
        ...prev,
        total: formattedDues.length,
      }));

      setSelectedRowKeys([]);
    } catch (error) {
      console.error("Error fetching dues:", error);

      if (error.response?.status === 401) {
        navigate("/admin-signin");
      } else {
        message.error("Failed to fetch dues");
      }
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // FETCH SECTIONS
  // OLD WORKING ENDPOINT
  // =========================

  const fetchSections = async () => {
    setSectionsLoading(true);

    try {
      const response = await publicApi.get("Sec_Read.php");

      if (response.status === 401) {
        navigate("/admin-signin");
        return;
      }

      setSections(response.data || []);
    } catch (error) {
      console.error("Error fetching sections:", error);

      if (error.response?.status === 401) {
        navigate("/admin-signin");
      } else {
        message.error("Failed to fetch sections");
      }
    } finally {
      setSectionsLoading(false);
    }
  };

  // =========================
  // FETCH STUDENTS
  // OLD WORKING ENDPOINT
  // =========================

  const fetchStudents = async (sectionId) => {
    if (!sectionId) {
      setStudents([]);
      form.setFieldsValue({
        student_id: undefined,
      });
      return;
    }

    setStudentsLoading(true);

    try {
      const response = await publicApi.post(
        "secAdStudents.php",
        {
          section_id: sectionId,
        }
      );

      if (response.status === 401) {
        navigate("/admin-signin");
        return;
      }

      if (response.data.success) {
        setStudents(
          response.data.section_students || []
        );
      } else {
        message.error(
          response.data.error ||
            "Failed to fetch students"
        );

        setStudents([]);
      }
    } catch (error) {
      console.error(
        "Error fetching students:",
        error
      );

      if (error.response?.status === 401) {
        navigate("/admin-signin");
      } else {
        message.error("Failed to fetch students");
      }

      setStudents([]);
    } finally {
      setStudentsLoading(false);
    }
  };

  // =========================
  // TOTALS
  // =========================

  const calculateTotals = () => {
    const totalAmount = dues.reduce(
      (sum, due) =>
        sum + (Number(due.amount) || 0),
      0
    );

    const pendingDues = dues.filter(
      (due) =>
        String(due.status).toLowerCase() ===
        "pending"
    );

    const paidDues = dues.filter(
      (due) =>
        String(due.status).toLowerCase() ===
        "paid"
    );

    const cancelledDues = dues.filter(
      (due) =>
        String(due.status).toLowerCase() ===
        "cancelled"
    );

    return {
      totalAmount,

      pendingAmount: pendingDues.reduce(
        (sum, due) =>
          sum + (Number(due.amount) || 0),
        0
      ),

      paidAmount: paidDues.reduce(
        (sum, due) =>
          sum + (Number(due.amount) || 0),
        0
      ),

      pendingCount: pendingDues.length,
      paidCount: paidDues.length,
      cancelledCount: cancelledDues.length,
    };
  };

  // =========================
  // CREATE DUES
  // OLD WORKING ENDPOINT
  // =========================

  const handleCreateDues = async (values) => {
    setSubmitting(true);

    try {
      const payload = {
        student_id: values.student_id,
        section_id: values.section_id,
        due_type: values.due_type,
        amount: parseFloat(values.amount) || 0,
        due_date: values.due_date.format(
          "YYYY-MM-DD"
        ),
        description:
          values.description || null,
      };

      const response = await authApi.post(
        "inser_deus.php",
        payload
      );

      if (response.status === 401) {
        navigate("/admin-signin");
        return;
      }

      if (response.data.success) {
        message.success(
          response.data.message ||
            "Dues issued successfully!"
        );

        form.resetFields();
        setStudents([]);
        setAmountValue("");
        setIsModalVisible(false);

        fetchDues();
      } else {
        message.error(
          response.data.error ||
            "Failed to issue dues"
        );
      }
    } catch (error) {
      console.error(
        "Error creating dues:",
        error
      );

      if (error.response?.status === 401) {
        navigate("/admin-signin");
      } else {
        const errorData =
          error.response?.data;

        if (errorData?.missing_fields) {
          message.error(
            `Missing fields: ${errorData.missing_fields.join(
              ", "
            )}`
          );
        } else {
          message.error(
            errorData?.error ||
              "An unexpected error occurred"
          );
        }
      }
    } finally {
      setSubmitting(false);
    }
  };

  // =========================
  // DELETE SINGLE DUE
  // OLD WORKING ENDPOINT
  // =========================

  const handleDelete = async (id) => {
    try {
      const response = await authApi.delete(
        "delete_deus.php",
        {
          data: { id },
        }
      );

      if (response.data.success) {
        message.success(
          response.data.message ||
            "Due deleted successfully"
        );

        fetchDues();
      } else {
        message.error(
          response.data.error ||
            "Failed to delete due"
        );
      }
    } catch (error) {
      console.error(
        "Delete error:",
        error
      );

      if (error.response?.status === 401) {
        navigate("/admin-signin");
      } else {
        message.error(
          error.response?.data?.error ||
            "Failed to delete due"
        );
      }
    }
  };

  // =========================
  // BULK DELETE
  // =========================

  const confirmBulkDelete = async () => {
    try {
      setLoading(true);

      const response = await authApi.delete(
        "delete_deus.php",
        {
          data: {
            ids: selectedRowKeys,
          },
        }
      );

      if (response.data.success) {
        message.success(
          response.data.message ||
            `Successfully deleted ${selectedRowKeys.length} records`
        );

        setSelectedRowKeys([]);
        setIsBulkDeleteModalVisible(false);

        fetchDues();
      } else {
        message.error(
          response.data.error ||
            "Failed to delete records"
        );
      }
    } catch (error) {
      console.error(
        "Bulk delete error:",
        error
      );

      message.error(
        error.response?.data?.error ||
          "Error performing bulk delete"
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // STATUS UPDATE
  // OLD WORKING ENDPOINT
  // =========================

  const handleStatusUpdate = async (
    id,
    newStatus
  ) => {
    try {
      const response = await authApi.put(
        "update_deus.php",
        {
          id,
          status: newStatus,
        }
      );

      if (response.data.success) {
        message.success(
          "Status updated successfully"
        );

        fetchDues();
      } else {
        message.error(
          response.data.error ||
            "Failed to update status"
        );
      }
    } catch (error) {
      console.error(
        "Status update error:",
        error
      );

      if (error.response?.status === 401) {
        navigate("/admin-signin");
      } else {
        message.error(
          error.response?.data?.error ||
            "Failed to update status"
        );
      }
    }
  };

  // =========================
  // PAYMENT
  // =========================

  const handleOpenPaymentModal = (due) => {
    setSelectedDue(due);
    setPaymentModalVisible(true);
  };

  const handlePaymentSuccess = () => {
    setPaymentModalVisible(false);
    setSelectedDue(null);

    fetchDues();
  };

  // =========================
  // FORM
  // =========================

  const handleAmountChange = (value) => {
    const cleanValue =
      value.replace(/[^0-9.]/g, "");

    setAmountValue(cleanValue);

    form.setFieldsValue({
      amount: cleanValue,
    });
  };

  const handleCancelModal = () => {
    setIsModalVisible(false);
    form.resetFields();
    setStudents([]);
    setAmountValue("");
  };

  // =========================
  // PRINT
  // =========================

  const handlePrint = () => {
    const totals =
      calculateTotals();

    const printWindow =
      window.open(
        "",
        "_blank"
      );

    if (!printWindow) {
      message.error(
        "Please allow popups to print the report."
      );
      return;
    }

    const rows = dues
      .map(
        (due) => `
        <tr>
          <td>${due.student_name}</td>
          <td>${due.father_name}</td>
          <td>${due.section_name}</td>
          <td>${due.due_type}</td>
          <td>Rs. ${Number(
            due.amount
          ).toLocaleString()}</td>
          <td>${
            due.due_date
              ? moment(
                  due.due_date
                ).format(
                  "DD/MM/YYYY"
                )
              : "N/A"
          }</td>
          <td>${due.status}</td>
        </tr>
      `
      )
      .join("");

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Dues Report</title>

        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 30px;
          }

          h1 {
            text-align: center;
          }

          .summary {
            margin: 20px 0;
            padding: 15px;
            border: 1px solid #ddd;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
          }

          th,
          td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
          }

          th {
            background: #f5f5f5;
          }

          @media print {
            body {
              margin: 10px;
            }
          }
        </style>
      </head>

      <body>

        <h1>Dues Report</h1>

        <p>
          Generated on:
          ${moment().format(
            "MMMM Do YYYY, h:mm:ss a"
          )}
        </p>

        <div class="summary">

          <strong>
            Total:
          </strong>
          Rs. ${totals.totalAmount.toLocaleString()}

          <br />

          <strong>
            Pending:
          </strong>
          Rs. ${totals.pendingAmount.toLocaleString()}

          <br />

          <strong>
            Paid:
          </strong>
          Rs. ${totals.paidAmount.toLocaleString()}

          <br />

          <strong>
            Cancelled:
          </strong>
          ${totals.cancelledCount}

        </div>

        <table>

          <thead>
            <tr>
              <th>Student</th>
              <th>Father</th>
              <th>Section</th>
              <th>Due Type</th>
              <th>Amount</th>
              <th>Due Date</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            ${rows}
          </tbody>

        </table>

        <script>
          window.onload = function() {
            window.print();

            setTimeout(function() {
              window.close();
            }, 500);
          };
        </script>

      </body>
      </html>
    `);

    printWindow.document.close();
  };

  // =========================
  // ROW SELECTION
  // =========================

  const rowSelection = {
    selectedRowKeys,

    onChange: (keys) => {
      setSelectedRowKeys(keys);
    },
  };

  // =========================
  // COLUMNS
  // =========================

  const columns = [
    {
      title: "Student Details",
      key: "student",

      render: (_, record) => (
        <Space
          direction="vertical"
          size={0}
        >
          <Text
            strong
            style={{
              color: "#0f172a",
            }}
          >
            {record.student_name}
          </Text>

          <Text
            style={{
              fontSize: 11,
              color: "#64748b",
            }}
          >
            Father:{" "}
            {record.father_name ||
              record.fathers_name ||
              "N/A"}
          </Text>

          <Tag
            color="blue"
            style={{
              borderRadius: 10,
              fontSize: 10,
            }}
          >
            Section:{" "}
            {record.section_name}
          </Tag>
        </Space>
      ),
    },

    {
      title: "Due Type",
      dataIndex: "due_type",
      key: "due_type",

      render: (type) => (
        <Tag
          color="purple"
          style={{
            borderRadius: 12,
            fontWeight: 600,
          }}
        >
          {type}
        </Tag>
      ),
    },

    {
      title: "Amount (PKR)",
      dataIndex: "amount",
      key: "amount",
      align: "right",

      render: (amount) => (
        <Text
          strong
          style={{
            color: "#0b1b3d",
            fontSize: 14,
          }}
        >
          Rs.{" "}
          {Number(
            amount || 0
          ).toLocaleString()}
        </Text>
      ),
    },

    {
      title: "Due Date",
      dataIndex: "due_date",
      key: "due_date",

      render: (date) =>
        date
          ? moment(date).format(
              "MMM DD, YYYY"
            )
          : "N/A",
    },

    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      align: "center",

      render: (status) => {
        const normalized =
          status
            ? status
                .charAt(0)
                .toUpperCase() +
              status
                .slice(1)
                .toLowerCase()
            : "Pending";

        if (normalized === "Paid") {
          return (
            <Tag
              icon={
                <CheckCircleOutlined />
              }
              color="success"
              style={{
                borderRadius: 12,
                padding: "2px 10px",
              }}
            >
              Paid
            </Tag>
          );
        }

        if (
          normalized === "Pending"
        ) {
          return (
            <Tag
              icon={
                <ClockCircleOutlined />
              }
              color="warning"
              style={{
                borderRadius: 12,
                padding: "2px 10px",
              }}
            >
              Pending
            </Tag>
          );
        }

        return (
          <Tag
            color="error"
            style={{
              borderRadius: 12,
            }}
          >
            Cancelled
          </Tag>
        );
      },
    },

    {
      title: "Actions",
      key: "actions",
      align: "center",
      width: 140,

      render: (_, record) => (
        <Space size="small">

          {record.status !==
            "Paid" && (
            <Tooltip title="Collect Payment">

              <Button
                type="primary"
                icon={
                  <DollarOutlined />
                }
                onClick={() =>
                  handleOpenPaymentModal(
                    record
                  )
                }
                size="small"
                className="apex-btn-gold"
              />

            </Tooltip>
          )}

          <Popconfirm
            title="Delete Dues Record"
            description="Are you sure you want to delete this due record?"
            onConfirm={() =>
              handleDelete(
                record.id
              )
            }
            okText="Yes"
            cancelText="No"
            okButtonProps={{
              danger: true,
            }}
          >

            <Tooltip title="Delete Dues">

              <Button
                danger
                icon={
                  <DeleteOutlined />
                }
                size="small"
                style={{
                  borderRadius: 6,
                }}
              />

            </Tooltip>

          </Popconfirm>

        </Space>
      ),
    },
  ];

  // =========================
  // TOTALS
  // =========================

  const totals =
    calculateTotals();

  // =========================
  // RENDER
  // =========================

  return (
    <div
      style={{
        maxWidth: 1400,
        margin: "0 auto",
      }}
    >

      <Card
        className="apex-card"

        title={
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >

            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                background:
                  "linear-gradient(135deg, #0b1b3d 0%, #1e3a8a 100%)",
                color: "#d4af37",
                display: "flex",
                alignItems:
                  "center",
                justifyContent:
                  "center",
                fontSize: 18,
              }}
            >
              <DollarOutlined />
            </div>

            <div>

              <Title
                level={4}
                style={{
                  margin: 0,
                  color: "#0b1b3d",
                  fontWeight: 700,
                }}
              >
                Fee Dues &
                Financial Accounts
              </Title>

              <Text
                style={{
                  color: "#64748b",
                  fontSize: 12,
                }}
              >
                Issue student fee
                dues, track pending
                payments, and log
                collections
              </Text>

            </div>

          </div>
        }

        extra={
          <Space wrap>

            {selectedRowKeys.length >
              0 && (
              <Button
                danger
                icon={
                  <DeleteFilled />
                }
                onClick={() =>
                  setIsBulkDeleteModalVisible(
                    true
                  )
                }
              >
                Delete Selected (
                {selectedRowKeys.length}
                )
              </Button>
            )}

            <Button
              icon={
                <PrinterOutlined />
              }
              onClick={handlePrint}
            >
              Print Report
            </Button>

            <Button
              type="primary"
              icon={
                <PlusOutlined />
              }
              onClick={() =>
                setIsModalVisible(true)
              }
              className="apex-btn-gold"
            >
              Issue New Dues
            </Button>

          </Space>
        }
      >

        {/* =========================
            SUMMARY
        ========================= */}

        <Row
          gutter={[12, 12]}
          style={{
            marginBottom: 20,
          }}
        >

          <Col
            xs={12}
            sm={6}
          >
            <Card
              size="small"
              style={{
                textAlign: "center",
              }}
            >
              <Text type="secondary">
                Total Dues
              </Text>

              <Title
                level={4}
                style={{
                  margin: "5px 0",
                  color: "#0b1b3d",
                }}
              >
                Rs.{" "}
                {totals.totalAmount.toLocaleString()}
              </Title>

              <Text type="secondary">
                {dues.length} records
              </Text>
            </Card>
          </Col>

          <Col
            xs={12}
            sm={6}
          >
            <Card
              size="small"
              style={{
                textAlign: "center",
              }}
            >
              <Text type="secondary">
                Pending
              </Text>

              <Title
                level={4}
                style={{
                  margin: "5px 0",
                  color: "#fa8c16",
                }}
              >
                Rs.{" "}
                {totals.pendingAmount.toLocaleString()}
              </Title>

              <Text type="secondary">
                {totals.pendingCount}{" "}
                records
              </Text>
            </Card>
          </Col>

          <Col
            xs={12}
            sm={6}
          >
            <Card
              size="small"
              style={{
                textAlign: "center",
              }}
            >
              <Text type="secondary">
                Paid
              </Text>

              <Title
                level={4}
                style={{
                  margin: "5px 0",
                  color: "#52c41a",
                }}
              >
                Rs.{" "}
                {totals.paidAmount.toLocaleString()}
              </Title>

              <Text type="secondary">
                {totals.paidCount}{" "}
                records
              </Text>
            </Card>
          </Col>

          <Col
            xs={12}
            sm={6}
          >
            <Card
              size="small"
              style={{
                textAlign: "center",
              }}
            >
              <Text type="secondary">
                Cancelled
              </Text>

              <Title
                level={4}
                style={{
                  margin: "5px 0",
                  color: "#f5222d",
                }}
              >
                {totals.cancelledCount}
              </Title>

              <Text type="secondary">
                records
              </Text>
            </Card>
          </Col>

        </Row>

        {/* =========================
            FILTERS
        ========================= */}

        <Row
          gutter={[12, 12]}
          style={{
            marginBottom: 20,
          }}
        >

          <Col
            xs={24}
            sm={12}
            md={6}
          >
            <Input
              placeholder="Search student or roll..."
              prefix={
                <SearchOutlined
                  style={{
                    color: "#94a3b8",
                  }}
                />
              }
              value={filters.search}
              onChange={(e) =>
                setFilters(
                  (prev) => ({
                    ...prev,
                    search:
                      e.target.value,
                  })
                )
              }
              allowClear
              style={{
                borderRadius: 8,
              }}
            />
          </Col>

          <Col
            xs={12}
            sm={6}
            md={4}
          >
            <Select
              placeholder="Status"
              value={filters.status}
              onChange={(value) =>
                setFilters(
                  (prev) => ({
                    ...prev,
                    status: value,
                  })
                )
              }
              allowClear
              style={{
                width: "100%",
              }}
            >
              <Option value="Pending">
                Pending
              </Option>

              <Option value="Paid">
                Paid
              </Option>

              <Option value="Cancelled">
                Cancelled
              </Option>
            </Select>
          </Col>

          <Col
            xs={12}
            sm={6}
            md={5}
          >
            <Select
              placeholder="Due Type"
              value={filters.dueType}
              onChange={(value) =>
                setFilters(
                  (prev) => ({
                    ...prev,
                    dueType: value,
                  })
                )
              }
              allowClear
              style={{
                width: "100%",
              }}
            >
              {dueTypes.map(
                (type) => (
                  <Option
                    key={type}
                    value={type}
                  >
                    {type}
                  </Option>
                )
              )}
            </Select>
          </Col>

          <Col
            xs={24}
            sm={12}
            md={7}
          >
            <RangePicker
              value={
                filters.dateRange
              }
              onChange={(dates) =>
                setFilters(
                  (prev) => ({
                    ...prev,
                    dateRange:
                      dates,
                  })
                )
              }
              style={{
                width: "100%",
              }}
            />
          </Col>

        </Row>

        {/* =========================
            TABLE
        ========================= */}

        <Table
          columns={columns}
          dataSource={dues}
          rowKey="id"
          rowSelection={
            rowSelection
          }
          loading={loading}
          scroll={{
            x: "max-content",
          }}
          pagination={{
            current:
              pagination.current,
            pageSize:
              pagination.pageSize,
            total:
              pagination.total,

            onChange: (
              page,
              pageSize
            ) => {
              setPagination(
                (prev) => ({
                  ...prev,
                  current: page,
                  pageSize,
                })
              );
            },

            showTotal: (
              total
            ) =>
              `Total ${total} due records`,
          }}
        />

      </Card>

      {/* =========================
          ISSUE DUES MODAL
      ========================= */}

      <Modal
        title={
          <div
            style={{
              display: "flex",
              alignItems:
                "center",
              gap: 10,
            }}
          >
            <DollarOutlined
              style={{
                color: "#d4af37",
              }}
            />

            <span>
              Issue Student Dues
            </span>
          </div>
        }
        open={isModalVisible}
        onCancel={
          handleCancelModal
        }
        footer={null}
        width={650}
        centered
      >

        <Form
          form={form}
          layout="vertical"
          onFinish={
            handleCreateDues
          }
          style={{
            paddingTop: 12,
          }}
        >

          <Row
            gutter={[
              16,
              8,
            ]}
          >

            {/* SECTION */}

            <Col
              xs={24}
              sm={12}
            >
              <Form.Item
                name="section_id"
                label="Class Section"
                rules={[
                  {
                    required: true,
                    message:
                      "Select section",
                  },
                ]}
              >

                <Select
                  placeholder="Select Section"
                  onChange={
                    fetchStudents
                  }
                  loading={
                    sectionsLoading
                  }
                  showSearch
                  optionFilterProp="children"
                >

                  {sections.map(
                    (section) => (
                      <Option
                        key={
                          section.id
                        }
                        value={
                          section.id
                        }
                      >
                        {section.name}
                      </Option>
                    )
                  )}

                </Select>

              </Form.Item>
            </Col>

            {/* STUDENT */}

            <Col
              xs={24}
              sm={12}
            >
              <Form.Item
                name="student_id"
                label="Student"
                rules={[
                  {
                    required: true,
                    message:
                      "Select student",
                  },
                ]}
              >

                <Select
                  placeholder={
                    studentsLoading
                      ? "Loading students..."
                      : "Select Student"
                  }
                  loading={
                    studentsLoading
                  }
                  disabled={
                    studentsLoading ||
                    !students.length
                  }
                  showSearch
                  optionFilterProp="children"
                  notFoundContent={
                    studentsLoading ? (
                      <Spin size="small" />
                    ) : (
                      <Empty
                        image={
                          Empty.PRESENTED_IMAGE_SIMPLE
                        }
                        description="No students found"
                      />
                    )
                  }
                >

                  {students.map(
                    (student) => (
                      <Option
                        key={
                          student.id
                        }
                        value={
                          student.id
                        }
                      >
                        {
                          student.Name
                        }{" "}
                        (
                        {
                          student.Fathers_Name
                        }
                        )
                      </Option>
                    )
                  )}

                </Select>

              </Form.Item>
            </Col>

            {/* DUE TYPE */}

            <Col
              xs={24}
              sm={12}
            >
              <Form.Item
                name="due_type"
                label="Due Type"
                rules={[
                  {
                    required: true,
                    message:
                      "Select due type",
                  },
                ]}
              >

                <Select
                  placeholder="Select Due Type"
                >
                  {dueTypes.map(
                    (type) => (
                      <Option
                        key={type}
                        value={type}
                      >
                        {type}
                      </Option>
                    )
                  )}
                </Select>

              </Form.Item>
            </Col>

            {/* AMOUNT */}

            <Col
              xs={24}
              sm={12}
            >
              <Form.Item
                name="amount"
                label="Amount (PKR)"
                rules={[
                  {
                    required: true,
                    message:
                      "Enter amount",
                  },
                  {
                    validator:
                      (_, value) => {
                        const number =
                          parseFloat(
                            value
                          );

                        if (
                          isNaN(
                            number
                          ) ||
                          number <=
                            0
                        ) {
                          return Promise.reject(
                            new Error(
                              "Amount must be a positive number"
                            )
                          );
                        }

                        return Promise.resolve();
                      },
                  },
                ]}
              >

                <Input
                  placeholder="e.g. 5000"
                  value={
                    amountValue
                  }
                  onChange={(e) =>
                    handleAmountChange(
                      e.target.value
                    )
                  }
                />

              </Form.Item>
            </Col>

            {/* DATE */}

            <Col
              xs={24}
              sm={12}
            >
              <Form.Item
                name="due_date"
                label="Due Date"
                rules={[
                  {
                    required: true,
                    message:
                      "Select due date",
                  },
                ]}
              >

                <DatePicker
                  style={{
                    width: "100%",
                  }}
                />

              </Form.Item>
            </Col>

            {/* DESCRIPTION */}

            <Col xs={24}>

              <Form.Item
                name="description"
                label="Notes / Description"
              >

                <Input.TextArea
                  rows={3}
                  placeholder="Additional details regarding fee charges"
                />

              </Form.Item>

            </Col>

            {/* SUBMIT */}

            <Col xs={24}>

              <Button
                type="primary"
                htmlType="submit"
                loading={
                  submitting
                }
                block
                className="apex-btn-gold"
                style={{
                  height: 40,
                }}
              >
                Issue Fee Dues
              </Button>

            </Col>

          </Row>

        </Form>

      </Modal>

      {/* =========================
          BULK DELETE MODAL
      ========================= */}

      <Modal
        title="Confirm Bulk Deletion"
        open={
          isBulkDeleteModalVisible
        }
        onOk={
          confirmBulkDelete
        }
        onCancel={() =>
          setIsBulkDeleteModalVisible(
            false
          )
        }
        okText="Yes, Delete All"
        cancelText="Cancel"
        okButtonProps={{
          danger: true,
        }}
        centered
      >

        <p>
          Are you sure you want
          to delete{" "}
          <strong>
            {
              selectedRowKeys.length
            }
          </strong>{" "}
          selected dues records?
        </p>

      </Modal>

      {/* =========================
          PAYMENT MODAL
      ========================= */}

      <PaymentModal
        visible={
          paymentModalVisible
        }
        onCancel={() =>
          setPaymentModalVisible(
            false
          )
        }
        due={selectedDue}
        onPaymentSuccess={
          handlePaymentSuccess
        }
        refreshDues={
          fetchDues
        }
      />

    </div>
  );
};

export default DuesListing;