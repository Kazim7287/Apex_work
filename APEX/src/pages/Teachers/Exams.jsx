import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import {
  Layout,
  Card,
  Button,
  List,
  message,
  Typography,
  Row,
  Col,
  Tag,
  Alert,
  Tabs,
  Collapse,
  Descriptions,
  Grid,
  Drawer,
  ConfigProvider,
  theme,
  Tooltip,
} from "antd";
import {
  CalendarOutlined,
  ClockCircleOutlined,
  TeamOutlined,
  BookOutlined,
  SolutionOutlined,
  FileTextOutlined,
  UserOutlined,
  EnvironmentOutlined,
  MenuOutlined,
  ReloadOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import styled from "styled-components";

const { Content } = Layout;
const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { Panel } = Collapse;
const { useBreakpoint } = Grid;

const OuterLayout = styled(Layout)`
  min-height: 100vh;
  background-color: #f8fafc !important;
`;

const ContentCanvas = styled(Content)`
  padding: 24px;
  background-color: #f8fafc;
  min-height: 100vh;
  box-sizing: border-box;

  @media (max-width: 576px) {
    padding: 12px;
  }
`;

const MainHeaderCard = styled.div`
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 20px 24px;
  margin-bottom: 20px;
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.03);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    padding: 16px;
  }
`;

const HeaderTitleWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;

  .title-icon-badge {
    width: 44px;
    height: 44px;
    border-radius: 10px;
    background: linear-gradient(135deg, #fefce8 0%, #fef3c7 100%);
    border: 1px solid rgba(212, 175, 55, 0.3);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 22px;
    color: #d4af37;
    box-shadow: 0 2px 8px rgba(212, 175, 55, 0.15);
    flex-shrink: 0;
  }

  @media (max-width: 576px) {
    .title-icon-badge {
      width: 38px;
      height: 38px;
      font-size: 18px;
    }
  }
`;

const StyledCard = styled(Card)`
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.03);
  background: #ffffff;
  margin-bottom: 20px;

  .ant-card-head {
    border-bottom: 1px solid #f1f5f9;
    padding: 16px 20px;
  }

  .ant-card-body {
    padding: 20px;
  }
`;

const StyledDrawer = styled(Drawer)`
  .ant-drawer-content {
    background-color: #061129 !important;
  }
  .ant-drawer-body {
    padding: 0 !important;
    overflow: hidden;
  }
  .ant-drawer-header {
    background-color: #061129 !important;
    border-bottom: 1px solid rgba(212, 175, 55, 0.15) !important;
    .ant-drawer-title,
    .ant-drawer-close {
      color: #ffffff !important;
    }
  }
`;

const CheckExamSection = () => {
  const [teacherId, setTeacherId] = useState(null);
  const [teacherName, setTeacherName] = useState("");
  const [sections, setSections] = useState([]);
  const [selectedSection, setSelectedSection] = useState(null);
  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState(null);
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const screens = useBreakpoint();
  const isMobile = !screens.md;

  useEffect(() => {
    checkSessionAndFetchData();
  }, []);

  const checkSessionAndFetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        "https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/Filter.php",
        {
          credentials: "include",
        }
      );

      if (response.status === 401) {
        handleSessionExpired();
        return;
      }

      const data = await response.json();

      if (response.ok) {
        if (data.length > 0) {
          const firstTeacher = data[0];
          setTeacherId(firstTeacher.teacher_id);
          setTeacherName(firstTeacher.teach_name);
          setSections(data);

          if (data.length > 0) {
            setSelectedSection(data[0].section_id);
            fetchExams(data[0].section_id);
          }
        } else {
          throw new Error("No sections assigned to this teacher");
        }
      } else {
        throw new Error(data.error || "Failed to verify session");
      }
    } catch (error) {
      setError(error.message);
      message.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSessionExpired = () => {
    message.error("Session expired. Please login again.");
  };

  const fetchExams = async (sectionId) => {
    if (!sectionId) return;

    setLoading(true);
    try {
      const response = await fetch(
        `https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/exam_read.php?section_id=${sectionId}`,
        {
          credentials: "include",
        }
      );

      if (response.status === 401) {
        handleSessionExpired();
        return;
      }

      const data = await response.json();

      if (data.status === "success") {
        setExams(data.data);
        setSelectedExam(null);
        setSchedule([]);
      } else {
        throw new Error(data.message || "Failed to fetch exams");
      }
    } catch (error) {
      setError(error.message);
      message.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchSchedule = async (examId) => {
    if (!selectedSection || !examId) return;

    setLoading(true);
    try {
      const response = await fetch(
        `https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/SectionTerms.php?exam_id=${examId}&section_id=${selectedSection}`,
        {
          credentials: "include",
        }
      );

      if (response.status === 401) {
        handleSessionExpired();
        return;
      }

      const data = await response.json();

      if (data.status === "success") {
        setSchedule(data.data);
      } else {
        throw new Error(data.message || "Failed to fetch schedule");
      }
    } catch (error) {
      setError(error.message);
      message.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSectionChange = (sectionId) => {
    setSelectedSection(sectionId);
    fetchExams(sectionId);
  };

  const handleExamClick = (exam) => {
    setSelectedExam(exam);
    fetchSchedule(exam.id);
  };

  return (
    <ConfigProvider
      theme={{
        algorithm: theme.defaultAlgorithm,
        token: {
          colorPrimary: "#d4af37",
          colorBgBase: "#ffffff",
          colorBgContainer: "#ffffff",
          colorTextBase: "#0f172a",
          colorBorder: "#e2e8f0",
          borderRadius: 8,
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
        },
      }}
    >
      <OuterLayout style={{ flexDirection: "row" }}>
        {/* MOBILE DRAWER SIDEBAR */}
        {isMobile ? (
          <StyledDrawer
            title="APEX COLLEGE"
            placement="left"
            closable={true}
            onClose={() => setIsDrawerVisible(false)}
            visible={isDrawerVisible}
            width={250}
          >
            <Sidebar
              collapsed={false}
              onItemClick={() => setIsDrawerVisible(false)}
            />
          </StyledDrawer>
        ) : (
          /* DESKTOP SIDEBAR */
          <Sidebar
            collapsed={sidebarCollapsed}
            onCollapse={setSidebarCollapsed}
          />
        )}

        {/* MAIN PAGE CONTENT */}
        <Layout style={{ background: "#f8fafc", minHeight: "100vh" }}>
          <ContentCanvas>
            {/* TOP HEADER CARD */}
            <MainHeaderCard>
              <HeaderTitleWrapper>
                {isMobile && (
                  <Button
                    type="default"
                    icon={<MenuOutlined style={{ color: "#0f172a" }} />}
                    onClick={() => setIsDrawerVisible(true)}
                    style={{
                      borderColor: "#cbd5e1",
                      background: "#ffffff",
                    }}
                  />
                )}
                <div className="title-icon-badge">
                  <SolutionOutlined />
                </div>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Title
                      level={isMobile ? 4 : 3}
                      style={{ margin: 0, color: "#0f172a", fontWeight: 700 }}
                    >
                      Exam Schedules & Timetables
                    </Title>
                    <Tooltip title="View section exam timetables and papers">
                      <InfoCircleOutlined
                        style={{ color: "#94a3b8", fontSize: 14 }}
                      />
                    </Tooltip>
                  </div>
                  <Text style={{ color: "#64748b", fontSize: isMobile ? 11 : 13 }}>
                    Browse section assignments, schedules, and exam details
                  </Text>
                </div>
              </HeaderTitleWrapper>

              <Tooltip title="Refresh examination data">
                <Button
                  icon={<ReloadOutlined />}
                  onClick={checkSessionAndFetchData}
                  loading={loading}
                  style={{
                    borderColor: "#cbd5e1",
                    color: "#475569",
                    borderRadius: 8,
                  }}
                />
              </Tooltip>
            </MainHeaderCard>

            {error && (
              <Alert
                message="Error"
                description={error}
                type="error"
                style={{ marginBottom: 20, borderRadius: 8 }}
                closable
                onClose={() => setError(null)}
              />
            )}

            {/* SECTION SELECTOR CARD */}
            <StyledCard title={<Text strong>Assignee & Section Selection</Text>}>
              <Descriptions
                bordered
                size="small"
                column={1}
                style={{ marginBottom: 16 }}
              >
                <Descriptions.Item label="Assigned Teacher">
                  <UserOutlined style={{ color: "#d4af37", marginRight: 6 }} />
                  <Text strong>{teacherName || "Loading..."}</Text>
                  {teacherId && (
                    <Tag style={{ marginLeft: 8 }} color="gold">
                      ID: {teacherId}
                    </Tag>
                  )}
                </Descriptions.Item>
              </Descriptions>

              {sections.length > 0 ? (
                <Tabs
                  activeKey={selectedSection?.toString()}
                  onChange={handleSectionChange}
                  type="card"
                >
                  {sections.map((section) => (
                    <TabPane
                      key={section.section_id.toString()}
                      tab={
                        <span>
                          <TeamOutlined /> {section.section_name}
                        </span>
                      }
                    />
                  ))}
                </Tabs>
              ) : (
                <Alert
                  message="No sections assigned to this account"
                  type="info"
                  showIcon
                />
              )}
            </StyledCard>

            {/* EXAM SELECTION */}
            {selectedSection && (
              <StyledCard title={<Text strong>Available Examinations</Text>}>
                {exams.length > 0 ? (
                  <Row gutter={[12, 12]}>
                    {exams.map((exam) => (
                      <Col key={exam.id}>
                        <Button
                          type={
                            selectedExam?.id === exam.id ? "primary" : "default"
                          }
                          size="large"
                          icon={<BookOutlined />}
                          onClick={() => handleExamClick(exam)}
                          style={{
                            borderRadius: 8,
                            ...(selectedExam?.id === exam.id
                              ? {
                                  background:
                                    "linear-gradient(135deg, #091838 0%, #061129 100%)",
                                  borderColor: "#061129",
                                  color: "#ffffff",
                                  fontWeight: 600,
                                }
                              : {
                                  borderColor: "#cbd5e1",
                                  color: "#334155",
                                }),
                          }}
                        >
                          {exam.exam_name}
                        </Button>
                      </Col>
                    ))}
                  </Row>
                ) : (
                  <Alert
                    message="No exams scheduled for this section"
                    type="info"
                    showIcon
                  />
                )}
              </StyledCard>
            )}

            {/* TIMETABLE SCHEDULE LIST */}
            {selectedExam && (
              <StyledCard
                title={
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <SolutionOutlined style={{ color: "#d4af37" }} />
                    <span>Timetable for:</span>
                    <Tag color="gold" style={{ fontSize: 13, padding: "2px 8px" }}>
                      {selectedExam.exam_name}
                    </Tag>
                  </div>
                }
              >
                {schedule.length > 0 ? (
                  <List
                    itemLayout="vertical"
                    size="large"
                    dataSource={schedule}
                    renderItem={(item) => (
                      <List.Item
                        key={`${item.exam_id}`}
                        style={{
                          background: "#ffffff",
                          border: "1px solid #e2e8f0",
                          borderRadius: 10,
                          padding: 16,
                          marginBottom: 16,
                        }}
                        extra={
                          <div
                            style={{
                              textAlign: "right",
                              minWidth: 140,
                              display: "flex",
                              flexDirection: "column",
                              gap: 6,
                            }}
                          >
                            <Tag icon={<CalendarOutlined />} color="blue">
                              {item.formatted_date}
                            </Tag>
                            <Tag icon={<ClockCircleOutlined />} color="green">
                              {item.formatted_time}
                            </Tag>
                          </div>
                        }
                      >
                        <List.Item.Meta
                          avatar={
                            <TeamOutlined
                              style={{ fontSize: 24, color: "#d4af37" }}
                            />
                          }
                          title={
                            <div>
                              <Text strong style={{ fontSize: 16 }}>
                                {item.section_name}
                              </Text>
                              <br />
                              <Text style={{ color: "#475569" }}>
                                <BookOutlined style={{ marginRight: 6 }} />
                                {item.subject_name}
                              </Text>
                            </div>
                          }
                          description={
                            <div style={{ marginTop: 6 }}>
                              <Text style={{ color: "#64748b" }}>
                                <EnvironmentOutlined
                                  style={{ marginRight: 6, color: "#e11d48" }}
                                />
                                Room: {item.room_number || "Not specified"}
                              </Text>
                              <br />
                              <Text style={{ color: "#94a3b8", fontSize: 12 }}>
                                Created: {item.formatted_created_at}
                              </Text>
                            </div>
                          }
                        />

                        {/* EXAM PAPERS SUB-LIST */}
                        {item.papers && item.papers.length > 0 && (
                          <div style={{ marginTop: 12 }}>
                            <Collapse
                              bordered={false}
                              defaultActiveKey={["papers"]}
                              style={{ background: "#f8fafc", borderRadius: 8 }}
                            >
                              <Panel
                                header={
                                  <span
                                    style={{
                                      fontWeight: 600,
                                      color: "#334155",
                                    }}
                                  >
                                    <FileTextOutlined
                                      style={{ marginRight: 6 }}
                                    />
                                    Exam Papers ({item.papers.length})
                                  </span>
                                }
                                key="papers"
                              >
                                <List
                                  size="small"
                                  dataSource={item.papers}
                                  renderItem={(paper) => (
                                    <List.Item>
                                      <Descriptions
                                        bordered
                                        size="small"
                                        column={2}
                                        style={{ width: "100%" }}
                                      >
                                        <Descriptions.Item
                                          label="Paper Name"
                                          span={2}
                                        >
                                          <Text strong>{paper.paper_name}</Text>
                                        </Descriptions.Item>
                                        <Descriptions.Item label="Paper Code">
                                          {paper.paper_code || "N/A"}
                                        </Descriptions.Item>
                                        <Descriptions.Item label="Duration">
                                          {paper.duration || "N/A"}
                                        </Descriptions.Item>
                                        {paper.instructions && (
                                          <Descriptions.Item
                                            label="Instructions"
                                            span={2}
                                          >
                                            {paper.instructions}
                                          </Descriptions.Item>
                                        )}
                                      </Descriptions>
                                    </List.Item>
                                  )}
                                />
                              </Panel>
                            </Collapse>
                          </div>
                        )}
                      </List.Item>
                    )}
                  />
                ) : (
                  <Card style={{ background: "#f8fafc", textAlign: "center" }}>
                    <Text type="secondary">
                      No timetable found for this exam schedule.
                    </Text>
                  </Card>
                )}
              </StyledCard>
            )}
          </ContentCanvas>
        </Layout>
      </OuterLayout>
    </ConfigProvider>
  );
};

export default CheckExamSection;