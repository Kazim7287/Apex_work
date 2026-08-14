/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */

import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Button,
  Card,
  Col,
  DatePicker,
  Input,
  Modal,
  Row,
  Select,
  Space,
  Table,
  Tag,
  TimePicker,
  Tooltip,
  Typography,
  message,
} from "antd";
import dayjs from "dayjs";
import {
  BookOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  DownloadOutlined,
  EyeOutlined,
  HomeOutlined,
  PrinterOutlined,
  ScheduleOutlined,
  TeamOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;
const { RangePicker } = TimePicker;

const SECTIONS_API =
  "https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/Sec_Read.php";
const SUBJECTS_API =
  "https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/FilterAd.php";
const EXAM_READ_API =
  "https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/exam_read.php";
const EXAM_TIMETABLE_READ_API =
  "https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/ExamTimetableFetch.php";
const EXAM_TIMETABLE_INSERT_API =
  "https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/examtimetableinsert.php";

const DAY_OPTIONS = [
  { value: "Monday", label: "Monday" },
  { value: "Tuesday", label: "Tuesday" },
  { value: "Wednesday", label: "Wednesday" },
  { value: "Thursday", label: "Thursday" },
  { value: "Friday", label: "Friday" },
  { value: "Saturday", label: "Saturday" },
  { value: "Sunday", label: "Sunday" },
];

const emptyForm = (subject) => ({
  subject_id: subject.id,
  subject_name: subject.name,
  exam_date: null,
  time_range: null,
  day: "",
  room: "",
});

const getArray = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (payload?.data && typeof payload.data === "object") return [payload.data];
  if (payload?.result && Array.isArray(payload.result)) return payload.result;
  return [];
};

const getExamTitle = (exam) => {
  if (typeof exam === "string") return exam;
  return exam?.exam_name || exam?.name || exam?.title || "";
};

const getSubjectId = (subject) => subject?.id ?? subject?.subject_id;
const getSubjectName = (subject) =>
  subject?.name || subject?.subject_name || subject?.subject || "Unnamed Subject";

const getDayFromDate = (date) => (date ? date.format("dddd") : "");

const ExamTimetable = () => {
  const [sections, setSections] = useState([]);
  const [examNames, setExamNames] = useState([]);
  const [sectionSubjects, setSectionSubjects] = useState([]);
  const [subjectForms, setSubjectForms] = useState({});
  const [sectionTimetable, setSectionTimetable] = useState([]);

  const [selectedSection, setSelectedSection] = useState(null);
  const [selectedExam, setSelectedExam] = useState(null);

  const [loadingSections, setLoadingSections] = useState(false);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [loadingExams, setLoadingExams] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const printRef = useRef(null);

  const fetchWithAuth = async (url, options = {}) => {
    try {
      const response = await fetch(url, {
        credentials: "include",
        ...options,
        headers: {
          Accept: "application/json",
          ...(options.body ? { "Content-Type": "application/json" } : {}),
          ...(options.headers || {}),
        },
      });

      if (response.status === 401 || response.status === 403) {
        message.error("Your session has expired. Please log in again.");
        return null;
      }

      return response;
    } catch (error) {
      console.error("API error:", error);
      message.error("Network error. Please check your connection.");
      return null;
    }
  };

  useEffect(() => {
    fetchSections();
    fetchExamNames();
  }, []);

  const fetchSections = async () => {
    setLoadingSections(true);
    try {
      const response = await fetchWithAuth(SECTIONS_API);

      if (!response) return;

      if (!response.ok) {
        throw new Error(`Sections API returned ${response.status}`);
      }

      const result = await response.json();
      setSections(getArray(result));
    } catch (error) {
      console.error("Failed to load sections:", error);
      message.error("Failed to load sections.");
      setSections([]);
    } finally {
      setLoadingSections(false);
    }
  };

  const fetchExamNames = async () => {
    try {
      const response = await fetchWithAuth(EXAM_READ_API);

      if (!response) return;

      if (!response.ok) {
        throw new Error(`Exam API returned ${response.status}`);
      }

      const result = await response.json();
      setExamNames(getArray(result));
    } catch (error) {
      console.error("Failed to load exam names:", error);
      setExamNames([]);
      message.error("Failed to load exam types.");
    }
  };

  const fetchSubjectsForSection = async (sectionId) => {
    setLoadingSubjects(true);
    setSectionSubjects([]);
    setSubjectForms({});

    try {
      const response = await fetchWithAuth(
        `${SUBJECTS_API}?section_id=${encodeURIComponent(sectionId)}`
      );

      if (!response) return;

      if (!response.ok) {
        throw new Error(`Subjects API returned ${response.status}`);
      }

      const result = await response.json();
      const subjects = getArray(result);

      setSectionSubjects(subjects);

      const initialForms = {};
      subjects.forEach((subject) => {
        const id = getSubjectId(subject);
        initialForms[id] = emptyForm({
          id,
          name: getSubjectName(subject),
        });
      });

      setSubjectForms(initialForms);
    } catch (error) {
      console.error("Failed to load subjects:", error);
      message.error("Failed to load subjects for this section.");
    } finally {
      setLoadingSubjects(false);
    }
  };

  const handleSectionSelect = (section) => {
    setSelectedSection(section);
    setSelectedExam(null);
    setSectionTimetable([]);
    setIsModalVisible(false);
    fetchSubjectsForSection(section.id);
  };

  const handleExamSelect = (examName) => {
    setSelectedExam(examName);
  };

  const handleFormChange = (subjectId, field, value) => {
    setSubjectForms((prev) => ({
      ...prev,
      [subjectId]: {
        ...prev[subjectId],
        [field]: value,
        ...(field === "exam_date"
          ? { day: getDayFromDate(value) }
          : {}),
      },
    }));
  };

  const validateForms = () => {
    const forms = Object.values(subjectForms);

    if (!forms.length) {
      message.warning("No subjects were found for this section.");
      return false;
    }

    const invalid = forms.filter(
      (form) =>
        !form.exam_date ||
        !form.time_range ||
        form.time_range.length !== 2 ||
        !form.room.trim()
    );

    if (invalid.length) {
      message.warning(
        `Please complete Date, Room and Time for all ${invalid.length} remaining subject(s).`
      );
      return false;
    }

    for (const form of forms) {
      if (form.time_range[0].isSame(form.time_range[1])) {
        message.warning(`Start and end time cannot be the same for ${form.subject_name}.`);
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!selectedSection || !selectedExam) {
      message.warning("Please select both a Section and an Exam Type.");
      return;
    }

    if (!validateForms()) return;

    setIsSubmitting(true);

    try {
      /*
       * The original working backend contract is preserved:
       * section_id, exam_name, subject_id, exam_date, start_time,
       * end_time, total_marks and passing_marks remain unchanged.
       *
       * day and room are included as optional fields. A PHP endpoint
       * that ignores unknown JSON keys will continue working normally.
       * If the database endpoint already supports room/day columns,
       * those values will also be available to it.
       */
      const timetableData = Object.values(subjectForms).map((item) => ({
        section_id: selectedSection.id,
        exam_name: selectedExam,
        subject_id: item.subject_id,
        exam_date: item.exam_date.format("YYYY-MM-DD"),
        day: item.day || item.exam_date.format("dddd"),
        start_time: item.time_range[0].format("HH:mm:ss"),
        end_time: item.time_range[1].format("HH:mm:ss"),
        room: item.room.trim(),
      }));

      const response = await fetchWithAuth(EXAM_TIMETABLE_INSERT_API, {
        method: "POST",
        body: JSON.stringify({ timetable: timetableData }),
      });

      if (!response) return;

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          result?.message || `Server returned ${response.status}`
        );
      }

      if (!result?.success) {
        message.error(
          result?.message || "The server rejected the exam timetable."
        );
        return;
      }

      message.success("Exam timetable scheduled successfully.");
      await handleViewTimetable();
    } catch (error) {
      console.error("Error submitting exam timetable:", error);
      message.error(
        error?.message || "Error submitting exam timetable. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewTimetable = async () => {
    if (!selectedSection || !selectedExam) {
      message.warning("Select both Section and Exam Type to view timetable.");
      return;
    }

    setLoadingExams(true);

    try {
      const response = await fetchWithAuth(
        `${EXAM_TIMETABLE_READ_API}?section_id=${encodeURIComponent(
          selectedSection.id
        )}&exam_name=${encodeURIComponent(selectedExam)}`
      );

      if (!response) return;

      if (!response.ok) {
        throw new Error(`Timetable API returned ${response.status}`);
      }

      const result = await response.json();
      const rows = getArray(result);

      setSectionTimetable(rows);
      setIsModalVisible(true);
    } catch (error) {
      console.error("Failed to load timetable:", error);
      message.error("Failed to load saved timetable.");
    } finally {
      setLoadingExams(false);
    }
  };

  const handlePrint = () => {
    if (!printRef.current) return;

    const printWindow = window.open(
      "",
      `ExamTimetablePrint${Date.now()}`,
      "left=50,top=50,width=1000,height=900"
    );

    if (!printWindow) {
      message.error("Please allow pop-ups to print the timetable.");
      return;
    }

    const content = printRef.current.innerHTML;

    printWindow.document.write(`
      <!doctype html>
      <html>
        <head>
          <title>APEX College - Exam Timetable</title>
          <style>
            * { box-sizing: border-box; }
            body {
              font-family: Arial, sans-serif;
              padding: 28px;
              color: #0b1b3d;
            }
            h1 {
              margin: 0 0 6px;
              font-size: 24px;
            }
            p { margin: 5px 0; color: #475569; }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 24px;
            }
            th, td {
              border: 1px solid #d9dee8;
              padding: 9px;
              text-align: left;
              font-size: 12px;
            }
            th {
              background: #f7f8fb;
              color: #0b1b3d;
            }
            .ant-tag {
              border: 0;
              background: #eef4ff;
              padding: 2px 8px;
              border-radius: 12px;
            }
          </style>
        </head>
        <body>
          <h1>APEX COLLEGE — EXAM TIMETABLE</h1>
          <p><strong>Section:</strong> ${selectedSection?.name || ""}</p>
          <p><strong>Exam:</strong> ${selectedExam || ""}</p>
          ${content}
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();

    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  const exportAsText = () => {
    const lines = [
      "APEX COLLEGE - EXAM TIMETABLE",
      `Section: ${selectedSection?.name || ""}`,
      `Exam: ${selectedExam || ""}`,
      "",
    ];

    sectionTimetable.forEach((item, index) => {
      lines.push(
        `${index + 1}. ${item.subject_name || item.name || "Subject"}`,
        `Date: ${item.exam_date || "-"}`,
        `Day: ${item.day || (item.exam_date ? dayjs(item.exam_date).format("dddd") : "-")}`,
        `Room: ${item.room || item.room_number || "-"}`,
        `Time: ${item.start_time || "-"} - ${item.end_time || "-"}`,
        "----------------------------------------"
      );
    });

    const blob = new Blob([lines.join("\n")], {
      type: "text/plain;charset=utf-8",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `Timetable_${selectedSection?.name || "Section"}_${selectedExam || "Exam"}.txt`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const examColumns = [
    {
      title: "Subject Name",
      dataIndex: "subject_name",
      key: "subject_name",
      render: (name, record) => (
        <Space>
          <BookOutlined style={{ color: "#1e3a8a" }} />
          <Text strong style={{ color: "#0f172a" }}>
            {name || record?.name || "Subject"}
          </Text>
        </Space>
      ),
    },
    {
      title: "Day",
      key: "day",
      render: (_, record) => (
        <Tag color="blue">
          {record.day ||
            (record.exam_date
              ? dayjs(record.exam_date).format("dddd")
              : "-")}
        </Tag>
      ),
    },
    {
      title: "Exam Date",
      dataIndex: "exam_date",
      key: "exam_date",
      render: (date) => (
        <Tag icon={<CalendarOutlined />} color="processing">
          {date || "-"}
        </Tag>
      ),
    },
    {
      title: "Room",
      key: "room",
      render: (_, record) => (
        <Space size={5}>
          <HomeOutlined style={{ color: "#d4af37" }} />
          <Text>{record.room || record.room_number || "-"}</Text>
        </Space>
      ),
    },
    {
      title: "Timing",
      key: "timing",
      render: (_, record) => (
        <Text style={{ fontSize: 13, color: "#334155" }}>
          <ClockCircleOutlined
            style={{ marginRight: 6, color: "#d4af37" }}
          />
          {record.start_time || "-"} - {record.end_time || "-"}
        </Text>
      ),
    },
  ];

  return (
    <div
      style={{
        width: "100%",
        maxWidth: 1400,
        margin: "0 auto",
        paddingBottom: 24,
      }}
    >
      <Card
        className="apex-card"
        bordered={false}
        title={
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              flexWrap: "wrap",
            }}
          >
            <div
              style={{
                width: 38,
                height: 38,
                minWidth: 38,
                borderRadius: 10,
                background:
                  "linear-gradient(135deg, #0b1b3d 0%, #1e3a8a 100%)",
                color: "#d4af37",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 18,
              }}
            >
              <ScheduleOutlined />
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
                Exams & Grading
              </Title>
              <Text style={{ color: "#64748b", fontSize: 12 }}>
                Configure examination date, room and timing
              </Text>
            </div>
          </div>
        }
        extra={
          selectedSection &&
          selectedExam && (
            <Button
              type="primary"
              onClick={handleViewTimetable}
              loading={loadingExams}
              icon={<EyeOutlined />}
              className="apex-btn-gold"
            >
              View Saved Timetable
            </Button>
          )
        }
        style={{
          borderRadius: 14,
          overflow: "hidden",
        }}
      >
        {/* STEP 1 */}
        <div style={{ marginBottom: 24 }}>
          <Text
            strong
            style={{
              color: "#0b1b3d",
              display: "block",
              marginBottom: 12,
              fontSize: 13,
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            1. Select Class Section
          </Text>

          <Row gutter={[10, 10]}>
            {sections.map((section) => {
              const isSelected =
                String(selectedSection?.id) === String(section.id);

              return (
                <Col key={section.id}>
                  <Button
                    type={isSelected ? "primary" : "default"}
                    loading={loadingSections}
                    onClick={() => handleSectionSelect(section)}
                    icon={<TeamOutlined />}
                    className={isSelected ? "apex-btn-gold" : ""}
                    style={{
                      borderRadius: 8,
                      fontWeight: 600,
                      borderColor: isSelected ? "#d4af37" : "#cbd5e1",
                    }}
                  >
                    Section {section.name}
                  </Button>
                </Col>
              );
            })}
          </Row>
        </div>

        {/* STEP 2 */}
        {selectedSection && (
          <div style={{ marginBottom: 24 }}>
            <Text
              strong
              style={{
                color: "#0b1b3d",
                display: "block",
                marginBottom: 12,
                fontSize: 13,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              2. Select Exam Type
            </Text>

            <Row gutter={[10, 10]}>
              {examNames.map((exam) => {
                const examTitle = getExamTitle(exam);
                if (!examTitle) return null;

                const isSelected = selectedExam === examTitle;

                return (
                  <Col key={exam?.id || examTitle}>
                    <Button
                      type={isSelected ? "primary" : "default"}
                      onClick={() => handleExamSelect(examTitle)}
                      icon={<ScheduleOutlined />}
                      style={{
                        borderRadius: 8,
                        fontWeight: 600,
                        background: isSelected
                          ? "linear-gradient(135deg, #0b1b3d 0%, #1e3a8a 100%)"
                          : "#fff",
                        color: isSelected ? "#fff" : "#0b1b3d",
                        borderColor: isSelected ? "#0b1b3d" : "#cbd5e1",
                      }}
                    >
                      {examTitle}
                    </Button>
                  </Col>
                );
              })}
            </Row>
          </div>
        )}

        {/* STEP 3 */}
        {selectedSection && selectedExam && (
          <Card
            size="small"
            style={{
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              borderRadius: 12,
            }}
            title={
              <Space
                wrap
                style={{
                  color: "#0b1b3d",
                  fontWeight: 700,
                }}
              >
                <BookOutlined style={{ color: "#d4af37" }} />
                <span>
                  Configure Schedule for Section {selectedSection.name} —{" "}
                  {selectedExam}
                </span>
              </Space>
            }
          >
            <Alert
              message="Complete the exam details for every subject"
              description="Date automatically sets the day. Room and time are required before publishing."
              type="info"
              showIcon
              style={{
                marginBottom: 20,
                borderRadius: 8,
              }}
            />

            {loadingSubjects ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "35px 0",
                  color: "#64748b",
                }}
              >
                Loading subjects...
              </div>
            ) : sectionSubjects.length === 0 ? (
              <Alert
                type="warning"
                showIcon
                message="No subjects found for this section."
              />
            ) : (
              sectionSubjects.map((subject, idx) => {
                const subjectId = getSubjectId(subject);
                const subjectName = getSubjectName(subject);
                const form = subjectForms[subjectId] || emptyForm({
                  id: subjectId,
                  name: subjectName,
                });

                return (
                  <Card
                    key={subjectId}
                    size="small"
                    style={{
                      marginBottom: 14,
                      borderRadius: 10,
                      border: "1px solid #e2e8f0",
                    }}
                    bodyStyle={{ padding: "16px" }}
                  >
                    <Row gutter={[12, 12]} align="middle">
                      {/* Subject */}
                      <Col xs={24} sm={24} md={4} lg={3}>
                        <Text
                          strong
                          style={{
                            color: "#0b1b3d",
                            fontSize: 14,
                            display: "block",
                          }}
                        >
                          {idx + 1}. {subjectName}
                        </Text>

                        <Text
                          style={{
                            fontSize: 11,
                            color: "#64748b",
                          }}
                        >
                          Code: #{subjectId}
                        </Text>
                      </Col>

                      {/* Exam Name */}
                      <Col xs={24} sm={12} md={5} lg={4}>
                        <Text
                          type="secondary"
                          style={{ display: "block", fontSize: 11, marginBottom: 4 }}
                        >
                          Exam Name
                        </Text>
                        <Input
                          prefix={<ScheduleOutlined />}
                          value={selectedExam}
                          disabled
                          style={{ borderRadius: 8 }}
                        />
                      </Col>

                      {/* Day */}
                      <Col xs={12} sm={12} md={4} lg={3}>
                        <Text
                          type="secondary"
                          style={{ display: "block", fontSize: 11, marginBottom: 4 }}
                        >
                          Day
                        </Text>
                        <Select
                          value={form.day || undefined}
                          placeholder="Select day"
                          disabled
                          style={{ width: "100%" }}
                          options={DAY_OPTIONS}
                        />
                      </Col>

                      {/* Date */}
                      <Col xs={12} sm={12} md={5} lg={4}>
                        <Text
                          type="secondary"
                          style={{ display: "block", fontSize: 11, marginBottom: 4 }}
                        >
                          Exam Date
                        </Text>
                        <DatePicker
                          placeholder="Select date"
                          style={{ width: "100%", borderRadius: 8 }}
                          value={form.exam_date}
                          onChange={(date) =>
                            handleFormChange(subjectId, "exam_date", date)
                          }
                        />
                      </Col>

                      {/* Room */}
                      <Col xs={12} sm={12} md={4} lg={3}>
                        <Text
                          type="secondary"
                          style={{ display: "block", fontSize: 11, marginBottom: 4 }}
                        >
                          Room
                        </Text>
                        <Input
                          prefix={<HomeOutlined />}
                          placeholder="Room number"
                          value={form.room}
                          onChange={(e) =>
                            handleFormChange(
                              subjectId,
                              "room",
                              e.target.value
                            )
                          }
                          style={{ borderRadius: 8 }}
                        />
                      </Col>

                      {/* Time */}
                      <Col xs={24} sm={24} md={7} lg={5}>
                        <Text
                          type="secondary"
                          style={{ display: "block", fontSize: 11, marginBottom: 4 }}
                        >
                          Time
                        </Text>
                        <RangePicker
                          format="HH:mm"
                          placeholder={["Start time", "End time"]}
                          style={{ width: "100%", borderRadius: 8 }}
                          value={form.time_range}
                          onChange={(times) =>
                            handleFormChange(
                              subjectId,
                              "time_range",
                              times
                            )
                          }
                        />
                      </Col>




                    </Row>
                  </Card>
                );
              })
            )}

            {sectionSubjects.length > 0 && (
              <Button
                type="primary"
                size="large"
                block
                onClick={handleSubmit}
                loading={isSubmitting}
                icon={<CheckCircleOutlined />}
                className="apex-btn-gold"
                style={{
                  marginTop: 12,
                  height: 46,
                  borderRadius: 9,
                  fontWeight: 600,
                }}
              >
                Save & Publish Exam Timetable
              </Button>
            )}
          </Card>
        )}
      </Card>

      {/* SAVED TIMETABLE */}
      <Modal
        title={
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <CalendarOutlined style={{ color: "#d4af37", fontSize: 18 }} />
            <span>
              Timetable: Section {selectedSection?.name} ({selectedExam})
            </span>
          </div>
        }
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={[
          <Button
            key="close"
            onClick={() => setIsModalVisible(false)}
            style={{ borderRadius: 8 }}
          >
            Close
          </Button>,
          <Button
            key="export"
            icon={<DownloadOutlined />}
            onClick={exportAsText}
            style={{ borderRadius: 8 }}
          >
            Export Text
          </Button>,
          <Button
            key="print"
            type="primary"
            icon={<PrinterOutlined />}
            onClick={handlePrint}
            className="apex-btn-gold"
          >
            Print Timetable
          </Button>,
        ]}
        width={1000}
        centered
      >
        <div ref={printRef} style={{ paddingTop: 12 }}>
          <Table
            columns={examColumns}
            dataSource={sectionTimetable}
            rowKey={(record, index) =>
              record.id || `${record.subject_id || record.subject_name}-${index}`
            }
            loading={loadingExams}
            pagination={false}
            scroll={{ x: 950 }}
            locale={{
              emptyText: "No saved timetable found for this section and exam.",
            }}
          />
        </div>
      </Modal>
    </div>
  );
};

export default ExamTimetable;
