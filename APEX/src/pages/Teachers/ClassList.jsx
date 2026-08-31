import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Layout, Card, Button, Modal, Spin, Tag, Typography, 
  Space, List, Grid, Empty, message
} from "antd";
import styled from "styled-components";
import {
  ClockCircleOutlined, CloseOutlined, UserOutlined, 
  CalendarOutlined, AppstoreOutlined, ReloadOutlined
} from "@ant-design/icons";
import Sidebar from "./Sidebar"; // <-- Imported Sidebar

const { Content } = Layout;
const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

const API_BASE = "https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX";

/* ============================== THEME ============================== */
const THEME = {
  bg: "#f8fafc",
  primary: "#1e3a8a",
  primaryHover: "#1d4ed8",
  textMain: "#0f172a",
  textMuted: "#64748b",
  border: "#e2e8f0",
  shadowSm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
  shadowMd: "0 4px 6px -1px rgba(0, 0, 0, 0.07)",
};

/* ============================ STYLED (responsive) ============================ */
const ContentWrapper = styled(Content)`
  background-color: ${THEME.bg};
  padding: clamp(16px, 3vw, 24px) clamp(12px, 4vw, 32px) clamp(32px, 5vw, 48px);
  width: 100%;
  max-width: 1600px;
  margin: 0 auto;
  overflow-x: hidden;
`;

const HeroBanner = styled.div`
  background: linear-gradient(135deg, #0b132b 0%, #1c2a4a 50%, #1e3a8a 100%);
  border-radius: clamp(14px, 2vw, 20px);
  padding: clamp(20px, 4vw, 32px) clamp(18px, 4vw, 36px);
  margin-bottom: clamp(20px, 3vw, 28px);
  color: #fff;
  position: relative;
  overflow: hidden;
  box-shadow: 0 10px 25px -5px rgba(11, 19, 43, 0.25);

  &::before {
    content: "";
    position: absolute;
    top: -60px; right: -40px;
    width: 240px; height: 240px;
    background: radial-gradient(circle, rgba(217, 119, 6, 0.2) 0%, rgba(255, 255, 255, 0) 70%);
    border-radius: 50%;
    pointer-events: none;
  }
  &::after {
    content: "";
    position: absolute;
    bottom: -50px; left: 20%;
    width: 200px; height: 200px;
    background: radial-gradient(circle, rgba(79, 70, 229, 0.25) 0%, rgba(255, 255, 255, 0) 70%);
    border-radius: 50%;
    pointer-events: none;
  }
`;

const HeroContent = styled.div`
  position: relative;
  z-index: 2;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: clamp(14px, 2vw, 20px);
`;

const HeroBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 9999px;
  font-size: clamp(10px, 1vw, 12px);
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: #fde68a;
  margin-bottom: 12px;
`;

const MainCard = styled.div`
  background: #ffffff;
  border-radius: 18px;
  border: 1px solid ${THEME.border};
  box-shadow: ${THEME.shadowSm};
  padding: clamp(16px, 2.5vw, 24px);
  min-height: 400px;
`;

const SectionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  margin-top: 20px;
`;

const StyledSectionCard = styled(Card)`
  border-radius: 16px;
  border: 1px solid ${THEME.border};
  box-shadow: ${THEME.shadowSm};
  transition: all 0.3s ease;
  overflow: hidden;

  .ant-card-body {
    padding: 20px;
  }

  &:hover {
    border-color: ${THEME.primary};
    box-shadow: ${THEME.shadowMd};
    transform: translateY(-2px);
  }
`;

const DayHeader = styled.div`
  background: #eff6ff;
  color: ${THEME.primary};
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: 700;
  font-size: 16px;
  margin-bottom: 16px;
  display: inline-block;
`;

/* =============================== MAIN =============================== */
const ClassList = () => {
  const [teacherSections, setTeacherSections] = useState([]);
  const [selectedSection, setSelectedSection] = useState(null);
  const [timetable, setTimetable] = useState([]);
  const [loading, setLoading] = useState({ sections: false, timetable: false });
  const [isModalVisible, setIsModalVisible] = useState(false);
  
  const screens = useBreakpoint();
  const navigate = useNavigate();

  // Enhanced fetch function with session support
  const fetchData = async (url, type = "sections") => {
    setLoading((prev) => ({ ...prev, [type]: true }));
    try {
      const response = await fetch(url, { credentials: "include" });

      if (response.status === 401) {
        message.error("Session expired - Please login again");
        navigate("/login");
        throw new Error("Unauthorized");
      }
      if (!response.ok) throw new Error(`Server returned ${response.status}`);

      return await response.json();
    } catch (err) {
      if (err.message !== "Unauthorized") {
        message.error(`Failed to load ${type}. Please try again.`);
      }
      throw err;
    } finally {
      setLoading((prev) => ({ ...prev, [type]: false }));
    }
  };

  // Fetch teacher sections
  const fetchTeacherSections = useCallback(async () => {
    try {
      const data = await fetchData(`${API_BASE}/Filter.php`, "sections");
      const sections = data?.sections || data?.data || (Array.isArray(data) ? data : []);

      const normalizedSections = sections.map((section) => ({
        ...section,
        correctId: section.section_id || section.id,
      }));

      setTeacherSections(normalizedSections);
    } catch (err) {
      console.error("Section fetch failed:", err);
    }
  }, [navigate]);

  useEffect(() => {
    fetchTeacherSections();
  }, [fetchTeacherSections]);

  // Fetch timetable
  const fetchTimetable = async (sectionId) => {
    try {
      const data = await fetchData(`${API_BASE}/getTimetableT.php?section_id=${sectionId}`, "timetable");

      if (data.status === "success" && data.timetable) {
        setTimetable(data.timetable);
      } else {
        setTimetable([]);
        message.info(data.message || "No timetable entries found");
      }
    } catch (err) {
      setTimetable([]);
      console.error("Timetable fetch failed:", err);
    }
  };

  // Handlers
  const handleSectionClick = async (section) => {
    setSelectedSection(section);
    setIsModalVisible(true);
    await fetchTimetable(section.correctId);
  };

  const closeModal = () => {
    setIsModalVisible(false);
    setTimeout(() => {
      setSelectedSection(null);
      setTimetable([]);
    }, 300); // slight delay for smooth animation out
  };

  // Process timetable data
  const groupedTimetable = timetable.reduce((acc, entry) => {
    const day = entry.day;
    if (!acc[day]) acc[day] = [];

    const [hours, minutes] = entry.start_time.split(":").map(Number);
    const startMinutes = hours * 60 + minutes;

    acc[day].push({ ...entry, startMinutes });
    return acc;
  }, {});

  Object.values(groupedTimetable).forEach((entries) => {
    entries.sort((a, b) => a.startMinutes - b.startMinutes);
  });

  const daysOrder = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  return (
    <Layout style={{ minHeight: "100vh", backgroundColor: THEME.bg }}>
      <Sidebar />

      <Layout style={{ flex: 1, backgroundColor: THEME.bg, overflow: "hidden" }}>
        <ContentWrapper>
          
          {/* Hero Banner */}
          <HeroBanner>
            <HeroContent>
              <div style={{ flex: 1, minWidth: 200 }}>
                <HeroBadge><CalendarOutlined /> TEACHER PORTAL • TIMETABLE</HeroBadge>
                <Title level={2} style={{ color: "#fff", margin: 0, fontWeight: 800, letterSpacing: "-0.02em", fontSize: "clamp(20px, 3vw, 30px)" }}>
                  Class Timetables
                </Title>
                <Text style={{ color: "#cbd5e1", display: "block", marginTop: 8, fontSize: 14, maxWidth: 640 }}>
                  View your assigned sections and easily track your daily teaching schedule.
                </Text>
              </div>

              <Button
                icon={<ReloadOutlined spin={loading.sections} />}
                onClick={fetchTeacherSections}
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.12)", color: "#fff", border: "1px solid rgba(255, 255, 255, 0.25)",
                  borderRadius: 10, height: 42, width: 42, display: "flex", alignItems: "center", justifyContent: "center",
                }}
              />
            </HeroContent>
          </HeroBanner>

          {/* Main Content Area */}
          <MainCard>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
              <div style={{ backgroundColor: "#eff6ff", color: THEME.primary, padding: 10, borderRadius: 10, display: "flex", alignItems: "center", fontSize: 18 }}>
                <AppstoreOutlined />
              </div>
              <div>
                <Title level={5} style={{ margin: 0, fontWeight: 700, color: THEME.textMain }}>
                  Assigned Sections
                </Title>
                <Text style={{ color: THEME.textMuted, fontSize: 13 }}>
                  Select a section to view its detailed timetable
                </Text>
              </div>
            </div>

            {loading.sections ? (
              <div style={{ textAlign: "center", padding: "60px 0" }}>
                <Spin size="large" />
                <div style={{ marginTop: 16, color: THEME.textMuted }}>Loading your classes...</div>
              </div>
            ) : teacherSections.length > 0 ? (
              <SectionGrid>
                {teacherSections.map((section) => (
                  <StyledSectionCard
                    key={`${section.correctId}-${section.class_name}`}
                    hoverable
                    onClick={() => handleSectionClick(section)}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                      <Tag color="blue" style={{ borderRadius: 12, margin: 0 }}>
                        {section.class_name}
                      </Tag>
                    </div>
                    <Title level={4} style={{ margin: "0 0 16px 0", color: THEME.textMain }}>
                      {section.section_name || "Unnamed Section"}
                    </Title>
                    <div style={{ display: "flex", alignItems: "center", color: THEME.primary, fontWeight: 600, fontSize: 14 }}>
                      <CalendarOutlined style={{ marginRight: 8 }} />
                      View Schedule
                    </div>
                  </StyledSectionCard>
                ))}
              </SectionGrid>
            ) : (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={<Text type="secondary">No sections assigned to you at the moment.</Text>}
                style={{ padding: "60px 0" }}
              >
                <Button type="primary" style={{ borderRadius: 8, background: THEME.primary }} onClick={fetchTeacherSections}>
                  Refresh
                </Button>
              </Empty>
            )}
          </MainCard>
        </ContentWrapper>
      </Layout>

      {/* Timetable Modal */}
      <Modal
        title={
          <div>
            <Title level={4} style={{ margin: 0, color: THEME.textMain }}>
              Timetable: {selectedSection?.section_name}
            </Title>
            <Text type="secondary">{selectedSection?.class_name}</Text>
          </div>
        }
        open={isModalVisible}
        onCancel={closeModal}
        footer={null}
        width={screens.lg ? 900 : screens.md ? 700 : '95%'}
        style={{ top: 20 }}
        bodyStyle={{ padding: screens.xs ? '16px' : '24px', backgroundColor: THEME.bg }}
        closeIcon={<CloseOutlined style={{ fontSize: '16px' }} />}
      >
        {loading.timetable ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <Spin size="large" />
            <div style={{ marginTop: 16, color: THEME.textMuted }}>Fetching schedule...</div>
          </div>
        ) : timetable.length === 0 ? (
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No timetable entries found for this section." />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {daysOrder.map((day) => 
              groupedTimetable[day] && (
                <div key={day} style={{ background: "#fff", padding: "20px", borderRadius: 16, border: `1px solid ${THEME.border}` }}>
                  <DayHeader>{day}</DayHeader>
                  <List
                    grid={{ gutter: 16, xs: 1, sm: 2, md: 2, lg: 3 }}
                    dataSource={groupedTimetable[day]}
                    renderItem={(entry, idx) => (
                      <List.Item key={`${day}-${idx}`} style={{ marginBottom: 16 }}>
                        <Card
                          size="small"
                          style={{
                            borderRadius: 12,
                            borderLeft: entry.subject_name === selectedSection?.subject_name ? `4px solid ${THEME.primary}` : `4px solid #e2e8f0`,
                            background: entry.subject_name === selectedSection?.subject_name ? '#f8fafc' : '#fff'
                          }}
                        >
                          <Space direction="vertical" size="small" style={{ width: '100%' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: "center" }}>
                              <Text strong style={{ fontSize: 15, color: THEME.textMain }}>{entry.subject_name}</Text>
                              {entry.subject_name === selectedSection?.subject_name && (
                                <Tag color="blue" style={{ margin: 0, borderRadius: 10 }}>Yours</Tag>
                              )}
                            </div>
                            <div style={{ color: THEME.textMuted, fontSize: 13, marginTop: 4 }}>
                              <ClockCircleOutlined style={{ marginRight: '6px' }} />
                              {entry.start_time} - {entry.end_time}
                            </div>
                            <div style={{ color: THEME.textMuted, fontSize: 13 }}>
                              <UserOutlined style={{ marginRight: '6px' }} />
                              {entry.teacher_name}
                            </div>
                          </Space>
                        </Card>
                      </List.Item>
                    )}
                  />
                </div>
              )
            )}
          </div>
        )}
      </Modal>
    </Layout>
  );
};

export default ClassList;