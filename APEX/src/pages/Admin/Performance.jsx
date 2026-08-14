import { useEffect, useMemo, useState } from "react";
import {
  Button,
  Layout,
  Row,
  Col,
  Typography,
  Table,
  Modal,
  Space,
  message,
  Card,
  Spin,
  Select,
  Divider,
  Grid,
  Tag,
  Empty,
} from "antd";

import Sidebar from "./Sidebar";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

import {
  PrinterOutlined,
  DownloadOutlined,
  StarFilled,
  FilterOutlined,
  BarChartOutlined,
  TableOutlined,
  TrophyOutlined,
  RiseOutlined,
  FallOutlined,
  TeamOutlined,
  FileTextOutlined,
  UserOutlined,
  CalendarOutlined,
  ReloadOutlined,
  EyeOutlined,
} from "@ant-design/icons";

import { useNavigate } from "react-router-dom";
import "./Performance.css";

const { Content } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;
const { useBreakpoint } = Grid;

const CHART_COLORS = [
  "#1677ff",
  "#52c41a",
  "#faad14",
  "#ff7a45",
  "#722ed1",
  "#eb2f96",
];

const Performance = () => {
  const screens = useBreakpoint();
  const navigate = useNavigate();

  const isMobile = !screens.md;
  const isSmallMobile = !screens.sm;

  const [sections, setSections] = useState([]);
  const [performances, setPerformances] = useState([]);
  const [selectedSection, setSelectedSection] = useState(null);
  const [selectedSectionName, setSelectedSectionName] = useState("");

  const [columns, setColumns] = useState([]);
  const [filteredSubjects, setFilteredSubjects] = useState([]);

  const [loading, setLoading] = useState(false);

  const [activeTab, setActiveTab] = useState("table");

  const [sortConfig, setSortConfig] = useState({
    key: "total_marks",
    direction: "desc",
  });

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentDetails, setStudentDetails] = useState([]);

  const getAcademicSession = () => {
    const currentYear = new Date().getFullYear();
    return `${currentYear}-${currentYear + 1}`;
  };

  const collegeLogo = "../assets/images.png";

  /* =========================================================
     AUTHENTICATED API REQUEST
     ========================================================= */

  const fetchWithAuth = async (url, options = {}) => {
    try {
      setLoading(true);

      const response = await fetch(url, {
        ...options,
        credentials: "include",
        headers: {
          ...options.headers,
          "Content-Type": "application/json",
        },
      });

      if (
        url.includes("Sec_Read.php") &&
        response.status === 401
      ) {
        message.error(
          "Admin access required. Please login as admin."
        );

        navigate("/admin-signIn");
        return null;
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Fetch error:", error);
      message.error("Failed to fetch data");
      return null;
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     FETCH SECTIONS
     ========================================================= */

  useEffect(() => {
  const fetchSections = async () => {
    const data = await fetchWithAuth(
      "https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/Sec_Read.php"
    );

    if (!data || !Array.isArray(data) || data.length === 0) {
      setSections([]);
      return;
    }

    setSections(data);

    // Check if a previously selected section was saved
    const savedSectionId = localStorage.getItem(
      "performance_selected_section"
    );

    const savedSection = savedSectionId
      ? data.find(
          (section) =>
            String(section.id) === String(savedSectionId)
        )
      : null;

    // Use saved section if available, otherwise use first section
    const sectionToLoad = savedSection || data[0];

    setSelectedSection(sectionToLoad.id);
    setSelectedSectionName(sectionToLoad.name);

    fetchPerformanceData(
      sectionToLoad.id,
      sectionToLoad.name
    );
  };

  fetchSections();
}, []);

  /* =========================================================
     FETCH PERFORMANCE DATA
     ========================================================= */

  const fetchPerformanceData = async (
    sectionId,
    sectionName
  ) => {
    setPerformances([]);
    setColumns([]);
    setFilteredSubjects([]);

    const data = await fetchWithAuth(
      `https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/Clg_performance.php?section_id=${sectionId}`
    );

    if (!data || !Array.isArray(data)) {
      console.error("Unexpected API response:", data);
      return;
    }

    const subjects = {};

    data.forEach((item) => {
      const subjectKey = `${item.subject_name} (${item.exam_name})`;

      if (!subjects[subjectKey]) {
        subjects[subjectKey] = [];
      }

      subjects[subjectKey].push(item);
    });

    const subjectNames = Object.keys(subjects);

    setFilteredSubjects(subjectNames);

    const tableColumns = [
      {
        title: "Student",
        dataIndex: "student_name",
        key: "student_name",
        fixed: isMobile ? "left" : false,
        width: isMobile ? 170 : 220,
        sorter: (a, b) =>
          a.student_name.localeCompare(b.student_name),
        render: (text) => (
          <div className="student-cell">
            <div className="student-avatar">
              <UserOutlined />
            </div>

            <div>
              <div className="student-name">
                {text}
              </div>

              <div className="student-label">
                Student
              </div>
            </div>
          </div>
        ),
      },

      ...subjectNames.map((subject) => ({
        title: (
          <div className="subject-column-title">
            {subject}
          </div>
        ),

        dataIndex: subject,
        key: subject,

        width: isSmallMobile
          ? 105
          : isMobile
          ? 120
          : 145,

        sorter: (a, b) =>
          (a[subject] || 0) - (b[subject] || 0),

        render: (value, record) => {
          if (value === "-" || value === undefined) {
            return (
              <span className="empty-mark">
                —
              </span>
            );
          }

          const total =
            Number(record[`${subject}_total`]) || 0;

          const percentage =
            total > 0
              ? (Number(value) / total) * 100
              : 0;

          return (
            <div className="marks-cell">
              <span>{value}</span>

              {percentage >= 90 && (
                <StarFilled className="top-score-icon" />
              )}
            </div>
          );
        },
      })),

      {
        title: "Total",
        dataIndex: "total_marks",
        key: "total_marks",
        fixed: isMobile ? "right" : false,
        width: 110,

        sorter: (a, b) =>
          a.total_marks - b.total_marks,

        render: (value) => (
          <div className="total-score">
            {value}
          </div>
        ),
      },

      {
        title: "Action",
        key: "action",
        fixed: isMobile ? "right" : false,
        width: 110,

        render: (_, record) => (
          <Button
            type="text"
            className="view-dmc-btn"
            icon={<EyeOutlined />}
            onClick={() =>
              showStudentDetails(
                record.student_name,
                data
              )
            }
          >
            {!isSmallMobile && "View"}
          </Button>
        ),
      },
    ];

    const rows = Array.from(
      new Set(data.map((item) => item.student_name))
    ).map((student_name) => {
      let total = 0;

      const rowData = {
        key: student_name,
        student_name,
      };

      subjectNames.forEach((subject) => {
        const subjectData = subjects[subject].find(
          (item) =>
            item.student_name === student_name
        );

        if (subjectData) {
          rowData[subject] =
            subjectData.obtained_marks;

          rowData[`${subject}_total`] =
            subjectData.total_marks;

          total += parseFloat(
            subjectData.obtained_marks || 0
          );
        } else {
          rowData[subject] = "-";
        }
      });

      rowData.total_marks = total;

      return rowData;
    });

    setColumns(tableColumns);
setPerformances(rows);
setSelectedSection(sectionId);
setSelectedSectionName(sectionName);

localStorage.setItem(
  "performance_selected_section",
  sectionId
);
  };

  /* =========================================================
     STUDENT DETAILS
     ========================================================= */

  const showStudentDetails = (
    studentName,
    allData
  ) => {
    const details = allData.filter(
      (item) =>
        item.student_name === studentName
    );

    setSelectedStudent(studentName);
    setStudentDetails(details);
    setIsModalVisible(true);
  };

  /* =========================================================
     PRINT DMC
     ========================================================= */

  const handlePrint = () => {
    const printContent =
      document.getElementById(
        "dmc-print-content"
      );

    if (!printContent) {
      message.error("Print content not found");
      return;
    }

    const printWindow = window.open(
      "",
      "_blank",
      "width=1000,height=800"
    );

    const currentDate =
      new Date().toLocaleDateString();

    const currentTime =
      new Date().toLocaleTimeString();

    const logoUrl =
      window.location.origin + collegeLogo;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>DMC - ${selectedStudent}</title>

        <style>
          * {
            box-sizing: border-box;
          }

          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 30px;
            color: #111827;
            background: white;
          }

          .print-header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #111827;
            padding-bottom: 20px;
          }

          .college-name {
            font-size: 25px;
            font-weight: 800;
            margin-bottom: 8px;
          }

          .dmc-title {
            font-size: 18px;
            font-weight: 700;
          }

          .academic-session {
            margin-top: 6px;
            color: #6b7280;
          }

          .student-info {
            background: #f8fafc;
            border: 1px solid #e5e7eb;
            border-radius: 10px;
            padding: 18px;
            margin-bottom: 25px;
          }

          .info-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
          }

          th,
          td {
            border: 1px solid #d1d5db;
            padding: 10px;
            text-align: left;
          }

          th {
            background: #f1f5f9;
            font-weight: 700;
          }

          .summary-row {
            background: #eff6ff;
            font-weight: bold;
          }

          .footer {
            margin-top: 40px;
            border-top: 1px solid #d1d5db;
            padding-top: 20px;
          }

          .footer-content {
            display: flex;
            justify-content: space-between;
          }

          .signature {
            text-align: right;
          }

          .signature-line {
            border-top: 1px solid #111827;
            width: 200px;
            margin-top: 60px;
            margin-left: auto;
          }

          .print-date {
            text-align: right;
            color: #6b7280;
            font-size: 12px;
            margin-bottom: 15px;
          }

          @media print {
            body {
              padding: 15px;
            }

            @page {
              margin: 1cm;
            }
          }
        </style>
      </head>

      <body>

        <div class="print-date">
          Printed on:
          ${currentDate}
          at
          ${currentTime}
        </div>

        ${printContent.innerHTML.replace(
          /src="\/assets\/images.png"/g,
          `src="${logoUrl}"`
        )}

      </body>
      </html>
    `);

    printWindow.document.close();

    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.focus();
        printWindow.print();

        printWindow.onafterprint = () => {
          printWindow.close();
        };
      }, 1000);
    };
  };

  /* =========================================================
     PDF
     ========================================================= */

  const handleDownloadPDF = () => {
    message.info(
      "PDF download functionality would be implemented here"
    );
  };

  /* =========================================================
     FILTER
     ========================================================= */

  const handleSubjectFilter = (
    selectedSubjects
  ) => {
    setFilteredSubjects(selectedSubjects);
  };

  /* =========================================================
     SORT
     ========================================================= */

  const handleSort = (
    key,
    direction
  ) => {
    setSortConfig({
      key,
      direction,
    });
  };

  const sortedPerformances = useMemo(() => {
    return [...performances].sort(
      (a, b) => {
        if (
          a[sortConfig.key] <
          b[sortConfig.key]
        ) {
          return sortConfig.direction ===
            "ascend"
            ? -1
            : 1;
        }

        if (
          a[sortConfig.key] >
          b[sortConfig.key]
        ) {
          return sortConfig.direction ===
            "ascend"
            ? 1
            : -1;
        }

        return 0;
      }
    );
  }, [
    performances,
    sortConfig,
  ]);

  /* =========================================================
     GRADES
     ========================================================= */

  const getGrade = (percentage) => {
    if (percentage >= 90) return "A+";
    if (percentage >= 80) return "A";
    if (percentage >= 70) return "B";
    if (percentage >= 60) return "C";
    if (percentage >= 50) return "D";
    return "F";
  };

  const getGradeColor = (percentage) => {
    if (percentage >= 90) return "#16a34a";
    if (percentage >= 80) return "#22c55e";
    if (percentage >= 70) return "#eab308";
    if (percentage >= 60) return "#f59e0b";
    if (percentage >= 50) return "#f97316";
    return "#dc2626";
  };

  /* =========================================================
     STATISTICS
     ========================================================= */

  const stats = useMemo(() => {
    if (!performances.length) {
      return {
        max: 0,
        min: 0,
        avg: 0,
      };
    }

    const totals = performances.map(
      (item) =>
        Number(item.total_marks) || 0
    );

    const max = Math.max(...totals);
    const min = Math.min(...totals);

    const avg =
      totals.reduce(
        (sum, value) =>
          sum + value,
        0
      ) / totals.length;

    return {
      max,
      min,
      avg,
    };
  }, [performances]);

  /* =========================================================
     GRADE DISTRIBUTION
     ========================================================= */

  const gradeData = useMemo(() => {
    const distribution = {
      "A+": 0,
      A: 0,
      B: 0,
      C: 0,
      D: 0,
      F: 0,
    };

    performances.forEach(
      (performance) => {
        let totalPossible = 0;

        Object.keys(performance).forEach(
          (key) => {
            if (key.endsWith("_total")) {
              totalPossible +=
                Number(
                  performance[key]
                ) || 0;
            }
          }
        );

        const percentage =
          totalPossible > 0
            ? (Number(
                performance.total_marks
              ) /
                totalPossible) *
              100
            : 0;

        const grade =
          getGrade(percentage);

        distribution[grade]++;
      }
    );

    return [
      {
        name: "A+",
        value: distribution["A+"],
      },
      {
        name: "A",
        value: distribution.A,
      },
      {
        name: "B",
        value: distribution.B,
      },
      {
        name: "C",
        value: distribution.C,
      },
      {
        name: "D",
        value: distribution.D,
      },
      {
        name: "F",
        value: distribution.F,
      },
    ].filter(
      (item) => item.value > 0
    );
  }, [performances]);

  /* =========================================================
     OVERALL DMC RESULT
     ========================================================= */

  const overallResult = useMemo(() => {
    if (!studentDetails.length) {
      return {
        totalObtained: 0,
        totalPossible: 0,
        percentage: 0,
      };
    }

    const totalObtained =
      studentDetails.reduce(
        (sum, item) =>
          sum +
          parseFloat(
            item.obtained_marks || 0
          ),
        0
      );

    const totalPossible =
      studentDetails.reduce(
        (sum, item) =>
          sum +
          parseFloat(
            item.total_marks || 0
          ),
        0
      );

    const percentage =
      totalPossible > 0
        ? (totalObtained /
            totalPossible) *
          100
        : 0;

    return {
      totalObtained,
      totalPossible,
      percentage:
        Number(percentage).toFixed(2),
    };
  }, [studentDetails]);

  const modalWidth = isSmallMobile
    ? "96%"
    : isMobile
    ? "92%"
    : 1050;

  const visibleColumns =
    columns.filter(
      (column) =>
        column.key ===
          "student_name" ||
        column.key ===
          "total_marks" ||
        column.key === "action" ||
        filteredSubjects.includes(
          column.key
        )
    );

  /* =========================================================
     RENDER
     ========================================================= */

  return (
    <Layout className="performance-page">

     

      <Layout className="performance-main-layout">

        <Content className="performance-content">

          {/* =================================================
              PAGE HEADER
             ================================================= */}

          <div className="performance-header">

            <div className="header-left">

              {/* <div className="page-icon">
                <TrophyOutlined />
              </div> */}
                
              <div>
                <Text className="eyebrow">
                  ACADEMIC MANAGEMENT
                </Text>

                <Title
                  level={2}
                  className="page-title"
                >
                  Performance
                </Title>

                <Text className="page-subtitle">
                  Monitor student results,
                  marks and academic
                  performance.
                </Text>
              </div>

            </div>

            <div className="header-actions">

              <Button
                icon={<ReloadOutlined />}
                className="refresh-btn"
                onClick={() => {
                  if (selectedSection) {
                    fetchPerformanceData(
                      selectedSection,
                      selectedSectionName
                    );
                  }
                }}
              >
                {!isMobile &&
                  "Refresh"}
              </Button>

              <Select
  value={selectedSection || undefined}
  placeholder="Select Section"
  className="section-select"
  suffixIcon={<FilterOutlined />}
  loading={loading}
  onChange={(value) => {
    const selected = sections.find(
      (section) =>
        String(section.id) === String(value)
    );

    if (!selected) return;

    // Update selected section immediately
    setSelectedSection(selected.id);
    setSelectedSectionName(selected.name);

    // Remember selected section
    localStorage.setItem(
      "performance_selected_section",
      selected.id
    );

    // Load its performance data
    fetchPerformanceData(
      selected.id,
      selected.name
    );
  }}
>
  {sections.map((section) => (
    <Option
      key={section.id}
      value={section.id}
    >
      {section.name}
    </Option>
  ))}
</Select>

            </div>

          </div>

          {/* =================================================
              OVERVIEW CARDS
             ================================================= */}

          {selectedSection && (
            <Row
              gutter={[
                16,
                16,
              ]}
              className="overview-row"
            >

              <Col
                xs={24}
                sm={12}
                lg={6}
              >
                <Card className="overview-card">
                  <div className="overview-card-top">
                    <div className="overview-icon blue">
                      <TeamOutlined />
                    </div>

                    <Tag className="overview-tag">
                      Students
                    </Tag>
                  </div>

                  <div className="overview-value">
                    {performances.length}
                  </div>

                  <Text className="overview-label">
                    Total Students
                  </Text>
                </Card>
              </Col>

              <Col
                xs={24}
                sm={12}
                lg={6}
              >
                <Card className="overview-card">
                  <div className="overview-card-top">
                    <div className="overview-icon green">
                      <TrophyOutlined />
                    </div>

                    <Tag className="overview-tag success">
                      Highest
                    </Tag>
                  </div>

                  <div className="overview-value">
                    {stats.max}
                  </div>

                  <Text className="overview-label">
                    Highest Score
                  </Text>
                </Card>
              </Col>

              <Col
                xs={24}
                sm={12}
                lg={6}
              >
                <Card className="overview-card">
                  <div className="overview-card-top">
                    <div className="overview-icon orange">
                      <RiseOutlined />
                    </div>

                    <Tag className="overview-tag warning">
                      Average
                    </Tag>
                  </div>

                  <div className="overview-value">
                    {stats.avg.toFixed(1)}
                  </div>

                  <Text className="overview-label">
                    Average Score
                  </Text>
                </Card>
              </Col>

              <Col
                xs={24}
                sm={12}
                lg={6}
              >
                <Card className="overview-card">
                  <div className="overview-card-top">
                    <div className="overview-icon red">
                      <FallOutlined />
                    </div>

                    <Tag className="overview-tag danger">
                      Lowest
                    </Tag>
                  </div>

                  <div className="overview-value">
                    {stats.min}
                  </div>

                  <Text className="overview-label">
                    Lowest Score
                  </Text>
                </Card>
              </Col>

            </Row>
          )}

          {/* =================================================
              MAIN PERFORMANCE CARD
             ================================================= */}

          <Card
            className="performance-card"
            bordered={false}
          >

            <div className="performance-card-header">

              <div>
                <div className="section-heading">
                  Performance Overview
                </div>

                <div className="section-description">
                  {selectedSectionName
                    ? `Results for ${selectedSectionName}`
                    : "Select a section to view performance"}
                </div>
              </div>

              {selectedSection && (
                <div className="session-badge">
                  <CalendarOutlined />

                  <span>
                    {getAcademicSession()}
                  </span>
                </div>
              )}

            </div>

            <Divider />

            {!selectedSection ? (
              <div className="empty-performance">
                <Empty
                  description="Select a section to view student performance"
                />
              </div>
            ) : (
              <>

                {/* =========================================
                    VIEW CONTROLS
                   ========================================= */}

                <div className="performance-toolbar">

                  <div className="view-switcher">

                    <Button
                      className={
                        activeTab === "table"
                          ? "view-switch active"
                          : "view-switch"
                      }
                      icon={
                        <TableOutlined />
                      }
                      onClick={() =>
                        setActiveTab(
                          "table"
                        )
                      }
                    >
                      {!isSmallMobile &&
                        "Table"}
                    </Button>

                    <Button
                      className={
                        activeTab === "graph"
                          ? "view-switch active"
                          : "view-switch"
                      }
                      icon={
                        <BarChartOutlined />
                      }
                      onClick={() =>
                        setActiveTab(
                          "graph"
                        )
                      }
                    >
                      {!isSmallMobile &&
                        "Analytics"}
                    </Button>

                  </div>

                  {activeTab === "table" && (
                    <Select
                      mode="multiple"
                      className="subject-filter"
                      placeholder="Filter subjects"
                      value={
                        filteredSubjects
                      }
                      onChange={
                        handleSubjectFilter
                      }
                      allowClear
                      maxTagCount={
                        isMobile
                          ? 1
                          : 3
                      }
                      suffixIcon={
                        <FilterOutlined />
                      }
                    >
                      {columns
                        .filter(
                          (column) =>
                            column.key !==
                              "student_name" &&
                            column.key !==
                              "total_marks" &&
                            column.key !==
                              "action"
                        )
                        .map(
                          (column) => (
                            <Option
                              key={
                                column.key
                              }
                              value={
                                column.key
                              }
                            >
                              {column.title
                                ?.props
                                ?.children ||
                                column.title}
                            </Option>
                          )
                        )}
                    </Select>
                  )}

                </div>

                {/* =========================================
                    TABLE
                   ========================================= */}

                {activeTab === "table" ? (
                  <div className="modern-table-wrapper">

                    <Spin
                      spinning={loading}
                    >
                      <Table
                        className="modern-performance-table"
                        columns={
                          visibleColumns
                        }
                        dataSource={
                          sortedPerformances
                        }
                        bordered={false}
                        pagination={{
                          pageSize: 10,
                          showSizeChanger:
                            false,
                          showTotal:
                            (total) =>
                              `${total} students`,
                        }}
                        scroll={{
                          x: "max-content",
                        }}
                        onChange={(
                          pagination,
                          filters,
                          sorter
                        ) => {
                          if (
                            sorter.field
                          ) {
                            handleSort(
                              sorter.field,
                              sorter.order
                            );
                          }
                        }}
                      />
                    </Spin>

                  </div>
                ) : (

                  /* =========================================
                     ANALYTICS
                     ========================================= */

                  <div className="analytics-container">

                    <Row
                      gutter={[
                        18,
                        18,
                      ]}
                    >

                      <Col
                        xs={24}
                        xl={15}
                      >

                        <Card
                          className="chart-card"
                          bordered={false}
                        >

                          <div className="chart-header">

                            <div>
                              <div className="chart-title">
                                Student Score
                                Distribution
                              </div>

                              <div className="chart-description">
                                Total marks by
                                student
                              </div>
                            </div>

                            <div className="chart-icon">
                              <BarChartOutlined />
                            </div>

                          </div>

                          <div className="chart-area">

                            <ResponsiveContainer
                              width="100%"
                              height="100%"
                            >
                              <BarChart
                                data={
                                  performances
                                }
                                margin={{
                                  top: 15,
                                  right: 15,
                                  left: 0,
                                  bottom: 55,
                                }}
                              >

                                <CartesianGrid
                                  strokeDasharray="4 4"
                                  vertical={false}
                                  stroke="#edf0f5"
                                />

                                <XAxis
                                  dataKey="student_name"
                                  angle={-40}
                                  textAnchor="end"
                                  height={70}
                                  tick={{
                                    fontSize: 11,
                                    fill: "#6b7280",
                                  }}
                                  axisLine={false}
                                  tickLine={false}
                                />

                                <YAxis
                                  tick={{
                                    fontSize: 11,
                                    fill: "#6b7280",
                                  }}
                                  axisLine={false}
                                  tickLine={false}
                                />

                                <Tooltip />

                                <Bar
                                  dataKey="total_marks"
                                  name="Total Marks"
                                  fill="#1677ff"
                                  radius={[
                                    6,
                                    6,
                                    0,
                                    0,
                                  ]}
                                  animationDuration={
                                    900
                                  }
                                />

                              </BarChart>
                            </ResponsiveContainer>

                          </div>

                        </Card>

                      </Col>

                      <Col
                        xs={24}
                        xl={9}
                      >

                        <Card
                          className="chart-card"
                          bordered={false}
                        >

                          <div className="chart-header">

                            <div>
                              <div className="chart-title">
                                Grade
                                Distribution
                              </div>

                              <div className="chart-description">
                                Overall academic
                                performance
                              </div>
                            </div>

                            <div className="chart-icon purple">
                              <TrophyOutlined />
                            </div>

                          </div>

                          <div className="pie-chart-area">

                            {gradeData.length ===
                            0 ? (
                              <Empty
                                description="No grade data"
                              />
                            ) : (
                              <ResponsiveContainer
                                width="100%"
                                height="100%"
                              >
                                <PieChart>

                                  <Pie
                                    data={
                                      gradeData
                                    }
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={
                                      isSmallMobile
                                        ? 55
                                        : 70
                                    }
                                    outerRadius={
                                      isSmallMobile
                                        ? 90
                                        : 115
                                    }
                                    paddingAngle={3}
                                    dataKey="value"
                                  >
                                    {gradeData.map(
                                      (
                                        entry,
                                        index
                                      ) => (
                                        <Cell
                                          key={
                                            `cell-${index}`
                                          }
                                          fill={
                                            CHART_COLORS[
                                              index %
                                                CHART_COLORS.length
                                            ]
                                          }
                                        />
                                      )
                                    )}
                                  </Pie>

                                  <Tooltip />

                                  <Legend />

                                </PieChart>
                              </ResponsiveContainer>
                            )}

                          </div>

                        </Card>

                      </Col>

                    </Row>

                  </div>
                )}

              </>
            )}

          </Card>

        </Content>
      </Layout>

      {/* =====================================================
          DMC MODAL
         ===================================================== */}

      <Modal
        open={isModalVisible}
        onCancel={() =>
          setIsModalVisible(false)
        }
        footer={null}
        width={modalWidth}
        className="modern-dmc-modal"
        title={
          <div className="dmc-modal-title">

            <div>
              <div className="dmc-modal-heading">
                Detailed Marks Certificate
              </div>

              <div className="dmc-modal-subtitle">
                {selectedStudent}
              </div>
            </div>

            <Space>

              <Button
                icon={
                  <DownloadOutlined />
                }
                onClick={
                  handleDownloadPDF
                }
              >
                {!isMobile &&
                  "Download"}
              </Button>

              <Button
                type="primary"
                icon={
                  <PrinterOutlined />
                }
                onClick={handlePrint}
              >
                {!isMobile &&
                  "Print"}
              </Button>

            </Space>

          </div>
        }
      >

        <Spin spinning={loading}>

          <div className="dmc-container">

            {/* ===========================================
                PRINT VERSION
               =========================================== */}

            <div
              id="dmc-print-content"
              style={{
                display: "none",
              }}
            >

              <div className="print-header">
                <div className="college-name">
                  APEX MODEL COLLEGE
                  HARICHAND
                </div>

                <div className="dmc-title">
                  DETAILED MARKS
                  CERTIFICATE
                </div>

                <div className="academic-session">
                  Academic Session{" "}
                  {getAcademicSession()}
                </div>
              </div>

              <div className="student-info">

                <div className="info-row">
                  <span>
                    <strong>
                      Student Name:
                    </strong>
                  </span>

                  <span>
                    {selectedStudent}
                  </span>
                </div>

                <div className="info-row">
                  <span>
                    <strong>
                      Section:
                    </strong>
                  </span>

                  <span>
                    {selectedSectionName}
                  </span>
                </div>

                <div className="info-row">
                  <span>
                    <strong>
                      Issue Date:
                    </strong>
                  </span>

                  <span>
                    {new Date().toLocaleDateString()}
                  </span>
                </div>

              </div>

              <table>

                <thead>
                  <tr>
                    <th>Subject</th>
                    <th>Exam</th>
                    <th>Obtained</th>
                    <th>Total</th>
                    <th>Percentage</th>
                    <th>Grade</th>
                  </tr>
                </thead>

                <tbody>

                  {studentDetails.map(
                    (
                      record,
                      index
                    ) => {

                      const percentage =
                        (
                          record.obtained_marks /
                          record.total_marks
                        ) *
                        100;

                      return (
                        <tr
                          key={index}
                        >
                          <td>
                            {
                              record.subject_name
                            }
                          </td>

                          <td>
                            {
                              record.exam_name
                            }
                          </td>

                          <td>
                            {
                              record.obtained_marks
                            }
                          </td>

                          <td>
                            {
                              record.total_marks
                            }
                          </td>

                          <td>
                            {percentage.toFixed(
                              2
                            )}
                            %
                          </td>

                          <td>
                            {getGrade(
                              percentage
                            )}
                          </td>
                        </tr>
                      );
                    }
                  )}

                  <tr className="summary-row">

                    <td
                      colSpan="2"
                    >
                      <strong>
                        Overall Result
                      </strong>
                    </td>

                    <td>
                      <strong>
                        {
                          overallResult.totalObtained
                        }
                      </strong>
                    </td>

                    <td>
                      <strong>
                        {
                          overallResult.totalPossible
                        }
                      </strong>
                    </td>

                    <td>
                      <strong>
                        {
                          overallResult.percentage
                        }
                        %
                      </strong>
                    </td>

                    <td>
                      <strong>
                        {getGrade(
                          overallResult.percentage
                        )}
                      </strong>
                    </td>

                  </tr>

                </tbody>

              </table>

              <div className="footer">

                <div className="footer-content">

                  <div>
                    <strong>
                      Grading System:
                    </strong>

                    <ul>
                      <li>
                        A+ (90-100%) -
                        Outstanding
                      </li>

                      <li>
                        A (80-89%) -
                        Excellent
                      </li>

                      <li>
                        B (70-79%) -
                        Good
                      </li>

                      <li>
                        C (60-69%) -
                        Average
                      </li>

                      <li>
                        D (50-59%) -
                        Below Average
                      </li>

                      <li>
                        F (Below 50%) -
                        Fail
                      </li>
                    </ul>
                  </div>

                  <div className="signature">
                    Issued on:{" "}
                    {new Date().toLocaleDateString()}

                    <div className="signature-line" />

                    Principal's Signature
                  </div>

                </div>

              </div>

            </div>

            {/* ===========================================
                SCREEN DMC
               =========================================== */}

            <div className="screen-dmc">

              <div className="dmc-top">

                <div className="dmc-college">

                  <div className="dmc-logo">
                    <img
                      src={collegeLogo}
                      alt="College Logo"
                      onError={(e) => {
                        e.currentTarget.style.display =
                          "none";
                      }}
                    />
                  </div>

                  <div>

                    <div className="dmc-college-name">
                      APEX MODEL COLLEGE
                      HARICHAND
                    </div>

                    <div className="dmc-title-screen">
                      Detailed Marks
                      Certificate
                    </div>

                    <div className="dmc-session">
                      Academic Session{" "}
                      {getAcademicSession()}
                    </div>

                  </div>

                </div>

                <div className="dmc-document-badge">
                  <FileTextOutlined />
                  OFFICIAL RESULT
                </div>

              </div>

              <div className="dmc-student-card">

                <div>
                  <Text className="dmc-label">
                    STUDENT
                  </Text>

                  <div className="dmc-value">
                    {selectedStudent}
                  </div>
                </div>

                <div>
                  <Text className="dmc-label">
                    SECTION
                  </Text>

                  <div className="dmc-value">
                    {selectedSectionName}
                  </div>
                </div>

                <div>
                  <Text className="dmc-label">
                    ISSUE DATE
                  </Text>

                  <div className="dmc-value">
                    {new Date().toLocaleDateString()}
                  </div>
                </div>

              </div>

              <div className="dmc-result-highlight">

                <div>
                  <span>
                    Overall Percentage
                  </span>

                  <strong>
                    {
                      overallResult.percentage
                    }
                    %
                  </strong>
                </div>

                <div className="result-grade">

                  <span>
                    Grade
                  </span>

                  <strong
                    style={{
                      color:
                        getGradeColor(
                          overallResult.percentage
                        ),
                    }}
                  >
                    {getGrade(
                      overallResult.percentage
                    )}
                  </strong>

                </div>

                <div>
                  <span>
                    Marks
                  </span>

                  <strong>
                    {
                      overallResult.totalObtained
                    }
                    /
                    {
                      overallResult.totalPossible
                    }
                  </strong>
                </div>

              </div>

              <div className="dmc-table">

                <Table
                  dataSource={
                    studentDetails
                  }
                  rowKey={(_, index) =>
                    index
                  }
                  pagination={false}
                  scroll={
                    isMobile
                      ? {
                          x: 700,
                        }
                      : undefined
                  }
                  columns={[
                    {
                      title:
                        "Subject",
                      dataIndex:
                        "subject_name",
                      key:
                        "subject_name",
                      render:
                        (text) => (
                          <strong>
                            {text}
                          </strong>
                        ),
                    },

                    {
                      title: "Exam",
                      dataIndex:
                        "exam_name",
                      key:
                        "exam_name",
                    },

                    {
                      title:
                        "Obtained",
                      dataIndex:
                        "obtained_marks",
                      key:
                        "obtained_marks",
                    },

                    {
                      title:
                        "Total",
                      dataIndex:
                        "total_marks",
                      key:
                        "total_marks",
                    },

                    {
                      title:
                        "Percentage",
                      key:
                        "percentage",

                      render:
                        (_, record) => {
                          const percentage =
                            (
                              record.obtained_marks /
                              record.total_marks
                            ) *
                            100;

                          return (
                            <strong
                              style={{
                                color:
                                  percentage >=
                                  50
                                    ? "#16a34a"
                                    : "#dc2626",
                              }}
                            >
                              {percentage.toFixed(
                                2
                              )}
                              %
                            </strong>
                          );
                        },
                    },

                    {
                      title:
                        "Grade",
                      key:
                        "grade",

                      render:
                        (_, record) => {
                          const percentage =
                            (
                              record.obtained_marks /
                              record.total_marks
                            ) *
                            100;

                          return (
                            <Tag
                              className="grade-tag"
                              style={{
                                color:
                                  getGradeColor(
                                    percentage
                                  ),
                                borderColor:
                                  getGradeColor(
                                    percentage
                                  ),
                              }}
                            >
                              {getGrade(
                                percentage
                              )}
                            </Tag>
                          );
                        },
                    },
                  ]}
                  summary={() => (
                    <Table.Summary.Row>

                      <Table.Summary.Cell
                        index={0}
                        colSpan={2}
                      >
                        <strong>
                          Overall Result
                        </strong>
                      </Table.Summary.Cell>

                      <Table.Summary.Cell
                        index={1}
                      >
                        <strong>
                          {
                            overallResult.totalObtained
                          }
                        </strong>
                      </Table.Summary.Cell>

                      <Table.Summary.Cell
                        index={2}
                      >
                        <strong>
                          {
                            overallResult.totalPossible
                          }
                        </strong>
                      </Table.Summary.Cell>

                      <Table.Summary.Cell
                        index={3}
                      >
                        <strong>
                          {
                            overallResult.percentage
                          }
                          %
                        </strong>
                      </Table.Summary.Cell>

                      <Table.Summary.Cell
                        index={4}
                      >
                        <strong
                          style={{
                            color:
                              getGradeColor(
                                overallResult.percentage
                              ),
                          }}
                        >
                          {getGrade(
                            overallResult.percentage
                          )}
                        </strong>
                      </Table.Summary.Cell>

                    </Table.Summary.Row>
                  )}
                />

              </div>

              <div className="dmc-bottom">

                <div>

                  <Text className="dmc-label">
                    GRADING SYSTEM
                  </Text>

                  <div className="grading-tags">

                    <Tag>A+ 90-100</Tag>
                    <Tag>A 80-89</Tag>
                    <Tag>B 70-79</Tag>
                    <Tag>C 60-69</Tag>
                    <Tag>D 50-59</Tag>
                    <Tag>F &lt;50</Tag>

                  </div>

                </div>

                <div className="signature-area">

                  <div className="signature-line-screen" />

                  <Text>
                    Principal's
                    Signature
                  </Text>

                </div>

              </div>

            </div>

          </div>

        </Spin>

      </Modal>

    </Layout>
  );
};

export default Performance;