import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Layout,
  Button,
  Modal,
  Spin,
  Tag,
  Typography,
  Grid,
  Empty,
  message,
  Input,
  Drawer,
  Segmented,
  Tooltip,
} from "antd";
import styled from "styled-components";
import {
  ClockCircleOutlined,
  CloseOutlined,
  UserOutlined,
  CalendarOutlined,
  AppstoreOutlined,
  ReloadOutlined,
  MenuOutlined,
  ArrowLeftOutlined,
  SearchOutlined,
  BookOutlined,
  CheckCircleOutlined,
  EyeOutlined,
  ClearOutlined,
} from "@ant-design/icons";
import { useMediaQuery } from "react-responsive";
import Sidebar from "./Sidebar";

const { Content } = Layout;
const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

const API_BASE =
  "https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX";

/* ============================== THEME ============================== */
const THEME = {
  bg: "#f8fafc",
  cardBg: "#ffffff",
  primary: "#1e3a8a",
  primaryHover: "#1d4ed8",
  primaryLight: "#eff6ff",
  accent: "#d4af37",
  accentLight: "#fefce8",
  emerald: "#059669",
  emeraldLight: "#ecfdf5",
  textMain: "#0f172a",
  textMuted: "#64748b",
  border: "#e2e8f0",
  shadowSm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
  shadowMd: "0 4px 6px -1px rgba(0, 0, 0, 0.08), 0 2px 4px -1px rgba(0, 0, 0, 0.04)",
};

/* ============================ STYLED (responsive) ============================ */
const PageContainer = styled(Layout)`
  min-height: 100vh;
  background-color: ${THEME.bg} !important;
  display: flex !important;
  flex-direction: row !important;
  width: 100%;

  @media (min-width: 993px) {
    height: 100vh;
    max-height: 100vh;
    overflow: hidden;
  }

  @media (max-width: 992px) {
    flex-direction: column !important;
    min-height: 100vh;
  }
`;

const DesktopSidebarWrapper = styled.div`
  height: 100vh;
  flex-shrink: 0;
  z-index: 1000;
  align-self: flex-start;
  position: sticky;
  top: 0;
  overflow: hidden;

  @media (max-width: 992px) {
    display: none;
  }
`;

const ContentLayout = styled(Layout)`
  flex: 1;
  background-color: ${THEME.bg} !important;
  min-width: 0;
  display: flex;
  flex-direction: column;

  @media (min-width: 993px) {
    height: 100vh;
    max-height: 100vh;
    overflow-y: auto;
    overflow-x: hidden;
  }

  @media (max-width: 992px) {
    min-height: 100vh;
    overflow-x: hidden;
  }
`;

const ContentWrapper = styled(Content)`
  background-color: ${THEME.bg};
  padding: clamp(12px, 2.5vw, 24px) clamp(10px, 3.5vw, 32px) clamp(24px, 4vw, 48px);
  width: 100%;
  max-width: 1600px;
  margin: 0 auto;
  box-sizing: border-box;
  min-width: 0;
`;

/* Mobile Top App Bar (visible on screens <= 992px) */
const MobileNavBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 10px 14px;
  background: #ffffff;
  border-bottom: 1px solid ${THEME.border};
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: ${THEME.shadowSm};

  @media (min-width: 993px) {
    display: none;
  }
`;

const NavLeftGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
`;

/* Hero Banner */
const HeroBanner = styled.div`
  background: linear-gradient(135deg, #0b132b 0%, #1c2a4a 50%, #1e3a8a 100%);
  border-radius: clamp(12px, 2vw, 18px);
  padding: clamp(16px, 3vw, 28px) clamp(14px, 3.5vw, 32px);
  margin-bottom: clamp(14px, 2.5vw, 22px);
  color: #fff;
  position: relative;
  overflow: hidden;
  box-shadow: 0 10px 25px -5px rgba(11, 19, 43, 0.25);

  &::before {
    content: "";
    position: absolute;
    top: -60px;
    right: -40px;
    width: 240px;
    height: 240px;
    background: radial-gradient(circle, rgba(212, 175, 55, 0.22) 0%, rgba(255, 255, 255, 0) 70%);
    border-radius: 50%;
    pointer-events: none;
  }

  &::after {
    content: "";
    position: absolute;
    bottom: -50px;
    left: 20%;
    width: 200px;
    height: 200px;
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
  gap: 14px;
`;

const HeroBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 9999px;
  font-size: clamp(10px, 1.1vw, 11px);
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: #fde68a;
  margin-bottom: 8px;
`;

const HeroActions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
`;

/* Summary Stats */
const StatsRow = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: clamp(8px, 1.8vw, 14px);
  margin-bottom: clamp(14px, 2.5vw, 20px);

  @media (max-width: 900px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 480px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
  }
`;

const StatCard = styled.div`
  background: #ffffff;
  border-radius: 14px;
  border: 1px solid ${THEME.border};
  padding: clamp(10px, 1.8vw, 16px);
  box-shadow: ${THEME.shadowSm};
  display: flex;
  align-items: center;
  gap: clamp(8px, 1.5vw, 14px);
  min-width: 0;

  .stat-icon {
    width: clamp(34px, 4vw, 42px);
    height: clamp(34px, 4vw, 42px);
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: clamp(15px, 2vw, 19px);
    flex-shrink: 0;
  }

  .stat-body {
    min-width: 0;
    overflow: hidden;
  }

  .stat-value {
    font-size: clamp(16px, 2.2vw, 22px);
    font-weight: 800;
    color: ${THEME.textMain};
    line-height: 1.15;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .stat-label {
    font-size: clamp(10px, 1.1vw, 12px);
    color: ${THEME.textMuted};
    font-weight: 500;
    margin-top: 2px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

/* Main Content Card & Toolbar */
const MainCard = styled.div`
  background: #ffffff;
  border-radius: 16px;
  border: 1px solid ${THEME.border};
  box-shadow: ${THEME.shadowSm};
  overflow: hidden;
  min-height: 400px;
`;

const CardToolbar = styled.div`
  padding: clamp(12px, 2vw, 18px) clamp(12px, 2.5vw, 20px);
  border-bottom: 1px solid ${THEME.border};
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
`;

const ToolbarHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;

  .toolbar-icon {
    background-color: #eff6ff;
    color: #1e3a8a;
    padding: 8px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    font-size: 18px;
    flex-shrink: 0;
  }
`;

const ToolbarControls = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  width: 100%;

  @media (min-width: 768px) {
    width: auto;
  }
`;

const SearchBox = styled(Input)`
  && {
    width: 100%;
    border-radius: 10px;
    background: #f8fafc;
    border-color: ${THEME.border};
    font-size: 13px;

    @media (min-width: 768px) {
      width: clamp(200px, 25vw, 300px);
    }
  }
`;

/* Section Cards Grid */
const SectionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: clamp(12px, 2vw, 18px);
  padding: clamp(12px, 2.5vw, 20px);

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    padding: 12px;
    gap: 12px;
  }
`;

const StyledSectionCard = styled.div`
  background: #ffffff;
  border-radius: 16px;
  border: 1px solid ${THEME.border};
  box-shadow: ${THEME.shadowSm};
  padding: clamp(14px, 2vw, 20px);
  transition: all 0.25s ease;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 16px;

  &:hover {
    border-color: ${THEME.primary};
    box-shadow: ${THEME.shadowMd};
    transform: translateY(-2px);
  }

  .card-header-row {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 8px;
  }

  .class-tag {
    border-radius: 12px;
    font-weight: 600;
    font-size: 12px;
    padding: 2px 10px;
    margin: 0;
  }

  .section-title {
    font-size: clamp(16px, 1.8vw, 18px);
    font-weight: 700;
    color: ${THEME.textMain};
    line-height: 1.3;
    margin-top: 6px;
  }

  .card-footer-action {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-top: 12px;
    border-top: 1px solid #f1f5f9;
    color: ${THEME.primary};
    font-weight: 600;
    font-size: 13px;
  }
`;

/* Timetable Inside Modal */
const DayBlock = styled.div`
  background: #ffffff;
  padding: clamp(12px, 2vw, 18px);
  border-radius: 14px;
  border: 1px solid ${THEME.border};
  box-shadow: ${THEME.shadowSm};
`;

const DayHeader = styled.div`
  background: #eff6ff;
  color: ${THEME.primary};
  padding: 6px 14px;
  border-radius: 8px;
  font-weight: 700;
  font-size: 14px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 12px;
`;

const PeriodCardsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 10px;

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 8px;
  }
`;

const PeriodCard = styled.div`
  border-radius: 12px;
  padding: 12px;
  border: 1px solid ${(p) => (p.$isYours ? THEME.primary : "#e2e8f0")};
  border-left: 4px solid ${(p) => (p.$isYours ? THEME.primary : "#cbd5e1")};
  background: ${(p) => (p.$isYours ? "#f8fafc" : "#ffffff")};
  display: flex;
  flex-direction: column;
  gap: 6px;
  transition: all 0.2s ease;

  &:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  }

  .period-top {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 6px;
  }

  .subject-name {
    font-weight: 700;
    font-size: 14px;
    color: ${THEME.textMain};
    line-height: 1.3;
  }

  .time-slot {
    color: ${THEME.textMuted};
    font-size: 12px;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .teacher-name {
    color: ${THEME.textMuted};
    font-size: 12px;
    display: flex;
    align-items: center;
    gap: 6px;
  }
`;

/* =============================== MAIN COMPONENT =============================== */
const ClassList = () => {
  const [teacherSections, setTeacherSections] = useState([]);
  const [selectedSection, setSelectedSection] = useState(null);
  const [timetable, setTimetable] = useState([]);
  const [loading, setLoading] = useState({ sections: false, timetable: false });
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDayFilter, setSelectedDayFilter] = useState("all");
  const [mobileSidebarVisible, setMobileSidebarVisible] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const screens = useBreakpoint();
  const navigate = useNavigate();

  const isMobile = useMediaQuery({ maxWidth: 992 });
  const isSmallMobile = useMediaQuery({ maxWidth: 576 });

  // Fetch function with session & error support
  const fetchData = async (url, type = "sections") => {
    setLoading((prev) => ({ ...prev, [type]: true }));
    try {
      const response = await fetch(url, { credentials: "include" });

      if (response.status === 401) {
        message.error("Session expired - Please login again");
        navigate("/teacher-signIn");
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
      const sections =
        data?.sections || data?.data || (Array.isArray(data) ? data : []);

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

  // Fetch timetable for a selected section
  const fetchTimetable = async (sectionId) => {
    try {
      const data = await fetchData(
        `${API_BASE}/getTimetableT.php?section_id=${sectionId}`,
        "timetable"
      );

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
    setSelectedDayFilter("all");
    setIsModalVisible(true);
    await fetchTimetable(section.correctId);
  };

  const closeModal = () => {
    setIsModalVisible(false);
    setTimeout(() => {
      setSelectedSection(null);
      setTimetable([]);
      setSelectedDayFilter("all");
    }, 250);
  };

  // Filter sections by search
  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) return teacherSections;
    const query = searchQuery.trim().toLowerCase();
    return teacherSections.filter((sec) => {
      const name = (sec.section_name || "").toLowerCase();
      const className = (sec.class_name || "").toLowerCase();
      const subject = (sec.subject_name || "").toLowerCase();
      return (
        name.includes(query) ||
        className.includes(query) ||
        subject.includes(query)
      );
    });
  }, [teacherSections, searchQuery]);

  // Unique Classes count
  const uniqueClassesCount = useMemo(() => {
    const set = new Set();
    teacherSections.forEach((s) => {
      if (s.class_name) set.add(s.class_name);
    });
    return set.size;
  }, [teacherSections]);

  // Process and group timetable data
  const groupedTimetable = useMemo(() => {
    const acc = {};
    timetable.forEach((entry) => {
      const day = entry.day;
      if (!acc[day]) acc[day] = [];

      const parts = (entry.start_time || "00:00").split(":").map(Number);
      const startMinutes = (parts[0] || 0) * 60 + (parts[1] || 0);

      acc[day].push({ ...entry, startMinutes });
    });

    Object.values(acc).forEach((entries) => {
      entries.sort((a, b) => a.startMinutes - b.startMinutes);
    });

    return acc;
  }, [timetable]);

  const daysOrder = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  // Days present in the timetable
  const availableDays = useMemo(() => {
    return daysOrder.filter((day) => groupedTimetable[day]?.length > 0);
  }, [groupedTimetable]);

  return (
    <PageContainer hasSider={!isMobile}>
      {/* DESKTOP PINNED SIDEBAR (> 992px) */}
      {!isMobile && (
        <DesktopSidebarWrapper>
          <Sidebar
            collapsed={sidebarCollapsed}
            onCollapse={setSidebarCollapsed}
          />
        </DesktopSidebarWrapper>
      )}

      {/* MOBILE DRAWER SIDEBAR (<= 992px) */}
      {isMobile && (
        <Drawer
          placement="left"
          closable={true}
          onClose={() => setMobileSidebarVisible(false)}
          open={mobileSidebarVisible}
          width={260}
          styles={{ body: { padding: 0, overflow: "hidden", background: "#061129" } }}
        >
          <Sidebar
            collapsed={false}
            onItemClick={() => setMobileSidebarVisible(false)}
          />
        </Drawer>
      )}

      <ContentLayout>
        {/* MOBILE TOP BAR (<= 992px) */}
        {isMobile && (
          <MobileNavBar>
            <NavLeftGroup>
              <Button
                type="text"
                icon={<MenuOutlined style={{ fontSize: 18 }} />}
                onClick={() => setMobileSidebarVisible(true)}
                aria-label="Open menu"
                style={{ width: 38, height: 38 }}
              />
              <Link to="/teacher/dashboard">
                <Button
                  type="text"
                  icon={<ArrowLeftOutlined />}
                  style={{ width: 36, height: 36 }}
                />
              </Link>
              <div style={{ minWidth: 0 }}>
                <Text style={{ fontSize: 10, color: THEME.textMuted, display: "block" }}>
                  TEACHER PORTAL
                </Text>
                <Text strong style={{ fontSize: 14, color: THEME.textMain, display: "block" }}>
                  Class Timetables
                </Text>
              </div>
            </NavLeftGroup>

            <Tooltip title="Refresh Classes">
              <Button
                type="default"
                icon={<ReloadOutlined spin={loading.sections} />}
                onClick={fetchTeacherSections}
                shape="circle"
                size="middle"
              />
            </Tooltip>
          </MobileNavBar>
        )}

        <ContentWrapper>
          {/* HERO BANNER */}
          <HeroBanner>
            <HeroContent>
              <div style={{ flex: 1, minWidth: 200 }}>
                <HeroBadge>
                  <CalendarOutlined /> TEACHER PORTAL • TIMETABLES
                </HeroBadge>
                <Title
                  level={2}
                  style={{
                    color: "#fff",
                    margin: 0,
                    fontWeight: 800,
                    letterSpacing: "-0.02em",
                    fontSize: "clamp(20px, 3.2vw, 30px)",
                    lineHeight: 1.25,
                  }}
                >
                  Class Timetables
                </Title>
                <Text
                  style={{
                    color: "#cbd5e1",
                    display: "block",
                    marginTop: 6,
                    fontSize: "clamp(12px, 1.4vw, 14px)",
                    maxWidth: 620,
                  }}
                >
                  View your assigned sections, inspect weekly class schedules, and track class timing.
                </Text>
              </div>

              <HeroActions>
                <Link to="/teacher/dashboard">
                  <Button
                    icon={<ArrowLeftOutlined />}
                    style={{
                      backgroundColor: "rgba(255, 255, 255, 0.12)",
                      color: "#fff",
                      border: "1px solid rgba(255, 255, 255, 0.25)",
                      borderRadius: 10,
                      height: 40,
                    }}
                  >
                    Dashboard
                  </Button>
                </Link>
                <Tooltip title="Refresh Data">
                  <Button
                    icon={<ReloadOutlined spin={loading.sections} />}
                    onClick={fetchTeacherSections}
                    style={{
                      backgroundColor: "rgba(255, 255, 255, 0.12)",
                      color: "#fff",
                      border: "1px solid rgba(255, 255, 255, 0.25)",
                      borderRadius: 10,
                      height: 40,
                      width: 40,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  />
                </Tooltip>
              </HeroActions>
            </HeroContent>
          </HeroBanner>

          {/* STATS ROW */}
          <StatsRow>
            <StatCard>
              <div className="stat-icon" style={{ backgroundColor: "#eff6ff", color: "#1e3a8a" }}>
                <AppstoreOutlined />
              </div>
              <div className="stat-body">
                <div className="stat-value">{teacherSections.length}</div>
                <div className="stat-label">Assigned Sections</div>
              </div>
            </StatCard>

            <StatCard>
              <div className="stat-icon" style={{ backgroundColor: "#ecfdf5", color: "#059669" }}>
                <BookOutlined />
              </div>
              <div className="stat-body">
                <div className="stat-value">{uniqueClassesCount}</div>
                <div className="stat-label">Grades / Classes</div>
              </div>
            </StatCard>

            <StatCard>
              <div className="stat-icon" style={{ backgroundColor: "#fefce8", color: "#d4af37" }}>
                <CalendarOutlined />
              </div>
              <div className="stat-body">
                <div className="stat-value">Mon - Sat</div>
                <div className="stat-label">Academic Week</div>
              </div>
            </StatCard>

            <StatCard>
              <div className="stat-icon" style={{ backgroundColor: "#f0fdf4", color: "#16a34a" }}>
                <CheckCircleOutlined />
              </div>
              <div className="stat-body">
                <div className="stat-value">{filteredSections.length}</div>
                <div className="stat-label">Matching Sections</div>
              </div>
            </StatCard>
          </StatsRow>

          {/* MAIN CONTENT CARD */}
          <MainCard>
            <CardToolbar>
              <ToolbarHeader>
                <div className="toolbar-icon">
                  <AppstoreOutlined />
                </div>
                <div>
                  <Title level={5} style={{ margin: 0, fontWeight: 700, color: THEME.textMain, fontSize: 15 }}>
                    Assigned Class Sections
                  </Title>
                  <Text style={{ color: THEME.textMuted, fontSize: 12 }}>
                    Click any section card to inspect its weekly timetable
                  </Text>
                </div>
              </ToolbarHeader>

              <ToolbarControls>
                <SearchBox
                  placeholder="Search class or section..."
                  prefix={<SearchOutlined style={{ color: THEME.textMuted }} />}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  allowClear
                />
              </ToolbarControls>
            </CardToolbar>

            {/* Active search banner */}
            {searchQuery && (
              <div
                style={{
                  padding: "8px 16px",
                  background: "#f0fdf4",
                  borderBottom: `1px solid ${THEME.border}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  fontSize: 12,
                  flexWrap: "wrap",
                  gap: 8,
                }}
              >
                <span>
                  Filtering by: <strong>&quot;{searchQuery}&quot;</strong> — Found {filteredSections.length} sections
                </span>
                <Button
                  type="link"
                  size="small"
                  icon={<ClearOutlined />}
                  onClick={() => setSearchQuery("")}
                  style={{ padding: 0, height: "auto" }}
                >
                  Clear Search
                </Button>
              </div>
            )}

            {/* SECTIONS GRID OR EMPTY / LOADING */}
            {loading.sections ? (
              <div style={{ textAlign: "center", padding: "80px 20px" }}>
                <Spin size="large" />
                <div style={{ marginTop: 16, color: THEME.textMuted, fontSize: 14 }}>
                  Loading your assigned sections...
                </div>
              </div>
            ) : filteredSections.length > 0 ? (
              <SectionGrid>
                {filteredSections.map((section) => (
                  <StyledSectionCard
                    key={`${section.correctId}-${section.class_name}`}
                    onClick={() => handleSectionClick(section)}
                  >
                    <div>
                      <div className="card-header-row">
                        <Tag color="blue" className="class-tag">
                          {section.class_name || "Class"}
                        </Tag>
                        <Tag color="default" style={{ borderRadius: 10, fontSize: 11, margin: 0 }}>
                          ID: #{section.correctId}
                        </Tag>
                      </div>

                      <div className="section-title">
                        {section.section_name || "Unnamed Section"}
                      </div>
                      <Text style={{ fontSize: 12, color: THEME.textMuted, display: "block", marginTop: 4 }}>
                        Academic Section
                      </Text>
                    </div>

                    <div className="card-footer-action">
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                        <CalendarOutlined /> View Schedule
                      </span>
                      <Button
                        type="primary"
                        ghost
                        size="small"
                        icon={<EyeOutlined />}
                        style={{ borderRadius: 6 }}
                      >
                        Timetable
                      </Button>
                    </div>
                  </StyledSectionCard>
                ))}
              </SectionGrid>
            ) : (
              <div style={{ padding: "60px 20px" }}>
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={
                    <Text type="secondary" style={{ fontSize: 14 }}>
                      {searchQuery
                        ? "No sections match your search criteria"
                        : "No sections assigned to your account at the moment."}
                    </Text>
                  }
                >
                  {searchQuery ? (
                    <Button
                      type="primary"
                      ghost
                      size="small"
                      onClick={() => setSearchQuery("")}
                      style={{ marginTop: 8 }}
                    >
                      Clear Search
                    </Button>
                  ) : (
                    <Button
                      type="primary"
                      style={{ borderRadius: 8, background: THEME.primary, marginTop: 8 }}
                      onClick={fetchTeacherSections}
                    >
                      Refresh
                    </Button>
                  )}
                </Empty>
              </div>
            )}
          </MainCard>
        </ContentWrapper>
      </ContentLayout>

      {/* TIMETABLE MODAL (Fully Responsive across phones, tablets, desktops) */}
      <Modal
        title={
          <div style={{ paddingRight: 24 }}>
            <Title level={4} style={{ margin: 0, color: THEME.textMain, fontSize: "clamp(16px, 2vw, 19px)" }}>
              Timetable: {selectedSection?.section_name}
            </Title>
            <Text type="secondary" style={{ fontSize: 13 }}>
              {selectedSection?.class_name || "Assigned Section"}
            </Text>
          </div>
        }
        open={isModalVisible}
        onCancel={closeModal}
        footer={null}
        width={screens.lg ? 920 : screens.md ? 720 : "95%"}
        style={{ top: isSmallMobile ? 12 : 24 }}
        styles={{
          body: {
            padding: isSmallMobile ? "12px 10px" : "18px 20px",
            backgroundColor: THEME.bg,
            maxHeight: "78vh",
            overflowY: "auto",
          },
        }}
        closeIcon={<CloseOutlined style={{ fontSize: 16 }} />}
      >
        {loading.timetable ? (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <Spin size="large" />
            <div style={{ marginTop: 16, color: THEME.textMuted, fontSize: 14 }}>
              Fetching class schedule...
            </div>
          </div>
        ) : timetable.length === 0 ? (
          <div style={{ padding: "40px 10px" }}>
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="No timetable entries found for this section."
            />
          </div>
        ) : (
          <div>
            {/* Quick Day Filter Tabs for Convenient Mobile & Desktop Navigation */}
            {availableDays.length > 1 && (
              <div style={{ marginBottom: 16, overflowX: "auto", paddingBottom: 4 }}>
                <Segmented
                  size="middle"
                  value={selectedDayFilter}
                  onChange={(val) => setSelectedDayFilter(val)}
                  options={[
                    { label: "All Days", value: "all" },
                    ...availableDays.map((d) => ({ label: d, value: d })),
                  ]}
                  style={{ backgroundColor: "#ffffff", border: `1px solid ${THEME.border}` }}
                />
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {daysOrder
                .filter((day) => selectedDayFilter === "all" || selectedDayFilter === day)
                .map(
                  (day) =>
                    groupedTimetable[day] && (
                      <DayBlock key={day}>
                        <DayHeader>
                          <CalendarOutlined /> {day} ({groupedTimetable[day].length} Classes)
                        </DayHeader>

                        <PeriodCardsGrid>
                          {groupedTimetable[day].map((entry, idx) => {
                            const isYours =
                              entry.subject_name === selectedSection?.subject_name;

                            return (
                              <PeriodCard
                                key={`${day}-${idx}`}
                                $isYours={isYours}
                              >
                                <div className="period-top">
                                  <span className="subject-name">{entry.subject_name}</span>
                                  {isYours && (
                                    <Tag color="blue" style={{ margin: 0, borderRadius: 10, fontSize: 11 }}>
                                      Yours
                                    </Tag>
                                  )}
                                </div>

                                <div className="time-slot">
                                  <ClockCircleOutlined style={{ color: THEME.primary }} />
                                  <span>
                                    {entry.start_time} - {entry.end_time}
                                  </span>
                                </div>

                                <div className="teacher-name">
                                  <UserOutlined />
                                  <span>{entry.teacher_name || "Faculty Member"}</span>
                                </div>
                              </PeriodCard>
                            );
                          })}
                        </PeriodCardsGrid>
                      </DayBlock>
                    )
                )}
            </div>
          </div>
        )}
      </Modal>
    </PageContainer>
  );
};

export default ClassList;