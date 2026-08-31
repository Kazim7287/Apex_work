import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Layout, Table, message, Typography, Avatar, Grid, Tag,
  Dropdown, Menu, Button, Tooltip, Empty,
} from "antd";
import styled from "styled-components";
import {
  MenuOutlined, TeamOutlined, ReloadOutlined, IdcardOutlined,
  FilterOutlined, AppstoreOutlined,
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
};

/* ============================ STYLED (responsive) ============================ */
const ContentWrapper = styled(Content)`
  background-color: ${THEME.bg};
  padding: clamp(16px, 3vw, 24px) clamp(12px, 4vw, 32px) clamp(32px, 5vw, 48px);
  width: 100%;
  max-width: 1600px;
  margin: 0 auto; /* Centers the content on ultra-wide screens */
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
  overflow: hidden;
`;

const SectionBlock = styled.div`
  background: #ffffff;
  border-radius: 16px;
  border: 1px solid ${THEME.border};
  box-shadow: ${THEME.shadowSm};
  padding: clamp(16px, 2.5vw, 22px) clamp(16px, 2.5vw, 24px);
  margin-bottom: 20px;
`;

const SectionBlockHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 14px;

  .icon-wrap {
    width: 32px;
    height: 32px;
    border-radius: 9px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 15px;
    flex-shrink: 0;
  }
`;

const PillsRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const Pill = styled.button`
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: ${(p) => (p.$active ? "600" : "500")};
  border: 1px solid ${(p) => (p.$active ? p.$accent || THEME.primary : THEME.border)};
  background: ${(p) => (p.$active ? p.$accent || THEME.primary : "#ffffff")};
  color: ${(p) => (p.$active ? "#ffffff" : THEME.textMuted)};
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;

  &:hover {
    border-color: ${(p) => p.$accent || THEME.primary};
    color: ${(p) => (p.$active ? "#ffffff" : p.$accent || THEME.primary)};
  }
`;

const TableToolbar = styled.div`
  padding: clamp(14px, 2vw, 20px) clamp(14px, 2.5vw, 24px);
  border-bottom: 1px solid ${THEME.border};
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
`;

/* =============================== MAIN =============================== */
const List = () => {
  const [students, setStudents] = useState([]);
  const [sectionId, setSectionId] = useState(null);
  const [subjectId, setSubjectId] = useState(null);
  const [sections, setSections] = useState([]);
  const [filteredSubjects, setFilteredSubjects] = useState(new Map());
  const [loading, setLoading] = useState(false);
  const [profilePictures, setProfilePictures] = useState({});
  const navigate = useNavigate();

  const screens = useBreakpoint();
  // Ensure responsive flags update correctly
  const isMobile = !screens.md && (screens.sm || screens.xs); 
  const isSmallMobile = !screens.sm && screens.xs; 
  const isExtraSmall = !screens.xs; // Very tiny legacy screens

  const handleApiError = (error) => {
    if (error.message.includes("Unauthorized") || error.message.includes("401")) {
      message.error("Session expired. Please login again.");
      // navigate('/teacher/signin');
    } else {
      message.error(error.message || "An error occurred");
    }
  };

  const fetchTeacherAssignments = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/Filter.php`, {
        method: "GET",
        credentials: "include",
      });

      if (response.status === 401) throw new Error("Unauthorized");
      if (!response.ok) throw new Error("Failed to fetch teacher assignments");

      const data = await response.json();

      if (Array.isArray(data) && data.length > 0) {
        const sectionMap = new Map();
        const subjectMap = new Map();

        data.forEach((item) => {
          sectionMap.set(item.section_id, item.section_name);
          if (!subjectMap.has(item.section_id)) subjectMap.set(item.section_id, []);
          subjectMap.get(item.section_id).push({ id: item.subject_id, name: item.subject_name });
        });

        setSections([...sectionMap.entries()].map(([id, name]) => ({ id, name })));
        setFilteredSubjects(subjectMap);

        setSectionId((prev) => prev ?? [...sectionMap.keys()][0] ?? null);
      } else {
        message.info("No assigned sections or subjects found");
      }
    } catch (error) {
      handleApiError(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTeacherAssignments(); }, [fetchTeacherAssignments]);

  useEffect(() => {
    const fetchStudents = async () => {
      if (!sectionId) return;
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE}/secStudents.php`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ section_id: sectionId, ...(subjectId && { subject_id: subjectId }) }),
        });

        if (response.status === 401) throw new Error("Unauthorized");
        const data = await response.json();

        if (data.success && data.section_students) {
          setStudents(data.section_students);
          fetchProfilePictures(data.section_students);
        } else {
          message.info(data.message || "No students found in this section");
          setStudents([]);
        }
      } catch (error) {
        handleApiError(error);
        setStudents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [sectionId, subjectId, navigate]);

  const fetchProfilePictures = async (studentsList) => {
    const pictures = {};
    await Promise.all(studentsList.map(async (student) => {
      try {
        const response = await fetch(`${API_BASE}/fetchpicture.php?student_id=${student.id}`, { credentials: "include" });
        if (response.status === 401) throw new Error("Unauthorized");
        const data = await response.json();
        if (!data.success) console.error(`Failed to fetch picture for student ${student.id}:`, data.error);
        pictures[student.id] = data.success ? data.full_url : null;
      } catch (error) {
        console.error(`Error fetching picture for student ${student.id}:`, error);
        pictures[student.id] = null;
      }
    }));
    setProfilePictures((prev) => ({ ...prev, ...pictures }));
  };

  /* --------------------------- columns --------------------------- */
  const getColumns = () => {
    if (isSmallMobile || isExtraSmall) {
      return [
        {
          title: "Profile", dataIndex: "id", key: "profile",
          render: (id) => <Avatar src={profilePictures[id] || "https://joeschmoe.io/api/v1/random"} size="small" />,
          width: 60,
          fixed: "left",
        },
        {
          title: "Name & Status", dataIndex: "std_name", key: "std_name",
          render: (name, record) => (
            <div>
              <div><Text strong>{name}</Text></div>
              <div style={{ fontSize: 12, marginTop: 4 }}>
                <Tag color={record.Admission_Status === "Active" ? "green" : "red"}>{record.Admission_Status}</Tag>
              </div>
            </div>
          ),
          width: 150,
        },
        {
          title: "Actions", key: "actions",
          render: (_, record) => (
            <Dropdown overlay={
              <Menu>
                <Menu.Item key="1">ID: {record.id}</Menu.Item>
                <Menu.Item key="2">Father: {record.std_father_name}</Menu.Item>
                <Menu.Item key="3">Discipline: {record.std_dscipline}</Menu.Item>
              </Menu>
            } trigger={["click"]}>
              <Button type="text" icon={<MenuOutlined />} size="small" />
            </Dropdown>
          ),
          width: 70,
          align: "center",
        },
      ];
    }
    
    if (isMobile) {
      return [
        {
          title: "Profile", dataIndex: "id", key: "profile",
          render: (id) => <Avatar src={profilePictures[id] || "https://joeschmoe.io/api/v1/random"} size="small" />,
          width: 60,
          fixed: "left",
        },
        { title: "ID", dataIndex: "id", key: "id", width: 70 },
        { title: "Name", dataIndex: "std_name", key: "std_name", width: 140 },
        {
          title: "Status", dataIndex: "Admission_Status", key: "Admission_Status",
          render: (status) => <Tag color={status === "Active" ? "green" : "red"}>{status}</Tag>,
          width: 80,
        },
        {
          title: "More", key: "more",
          render: (_, record) => (
            <Dropdown overlay={
              <Menu>
                <Menu.Item key="1">Class No: {record.Class_No}</Menu.Item>
                <Menu.Item key="2">Father: {record.std_father_name}</Menu.Item>
                <Menu.Item key="3">Discipline: {record.std_dscipline}</Menu.Item>
              </Menu>
            } trigger={["click"]}>
              <Button type="text" icon={<MenuOutlined />} size="small" />
            </Dropdown>
          ),
          width: 60,
          align: "center",
        },
      ];
    }
    
    // Desktop View
    return [
      {
        title: "Profile", dataIndex: "id", key: "profile",
        render: (id) => <Avatar src={profilePictures[id] || "https://joeschmoe.io/api/v1/random"} size="default" />,
        width: 70,
        fixed: "left",
      },
      { title: "ID", dataIndex: "id", key: "id", width: 80 },
      { title: "Class No", dataIndex: "Class_No", key: "Class_No", width: 90 },
      { title: "Name", dataIndex: "std_name", key: "std_name", width: 180 },
      {
        title: "Father's Name", dataIndex: "std_father_name", key: "std_father_name", width: 160,
        render: (name) => <Text ellipsis={{ tooltip: name }}>{name}</Text>,
      },
      { title: "Discipline", dataIndex: "std_dscipline", key: "std_dscipline", width: 140 },
      {
        title: "Status", dataIndex: "Admission_Status", key: "Admission_Status",
        render: (status) => <Tag color={status === "Active" ? "green" : "red"}>{status}</Tag>,
        width: 100,
      },
      {
        title: "Contact", dataIndex: "std_email", key: "std_email", width: 180,
        render: (email) => <Text ellipsis={{ tooltip: email }}>{email}</Text>,
      },
    ];
  };

  /* --------------------------- section / subject pills --------------------------- */
  const renderSectionButtons = () => {
    if (isSmallMobile || isExtraSmall) {
      return (
        <Dropdown
          overlay={
            <Menu>
              {sections.map((section) => (
                <Menu.Item
                  key={section.id}
                  onClick={() => setSectionId(section.id)}
                  style={{ background: sectionId === section.id ? THEME.primary : "", color: sectionId === section.id ? "white" : "" }}
                >
                  {section.name}
                </Menu.Item>
              ))}
            </Menu>
          }
          trigger={["click"]}
        >
          <Button type={sectionId ? "primary" : "default"} shape="round" style={{ background: sectionId ? THEME.primary : undefined, borderColor: sectionId ? THEME.primary : undefined }}>
            {sectionId ? sections.find((s) => s.id === sectionId)?.name : "Select Section"}
          </Button>
        </Dropdown>
      );
    }
    return (
      <PillsRow>
        {sections.map((section) => (
          <Pill key={section.id} $active={sectionId === section.id} $accent={THEME.primary} onClick={() => setSectionId(section.id)}>
            {section.name}
          </Pill>
        ))}
      </PillsRow>
    );
  };

  const renderSubjectButtons = () => {
    if (!sectionId || !filteredSubjects.has(sectionId)) return null;
    const subjects = filteredSubjects.get(sectionId);

    if (isSmallMobile || isExtraSmall) {
      return (
        <Dropdown
          overlay={
            <Menu>
              <Menu.Item key="all" onClick={() => setSubjectId(null)} style={{ background: !subjectId ? "#059669" : "", color: !subjectId ? "white" : "" }}>
                All Subjects
              </Menu.Item>
              {subjects.map((subject) => (
                <Menu.Item
                  key={subject.id}
                  onClick={() => setSubjectId(subject.id)}
                  style={{ background: subjectId === subject.id ? "#059669" : "", color: subjectId === subject.id ? "white" : "" }}
                >
                  {subject.name}
                </Menu.Item>
              ))}
            </Menu>
          }
          trigger={["click"]}
        >
          <Button type={subjectId ? "primary" : "default"} shape="round" style={{ marginTop: 8, background: subjectId ? "#059669" : undefined, borderColor: subjectId ? "#059669" : undefined }}>
            {subjectId ? subjects.find((s) => s.id === subjectId)?.name : "All Subjects"}
          </Button>
        </Dropdown>
      );
    }

    return (
      <PillsRow>
        <Pill $active={!subjectId} $accent="#059669" onClick={() => setSubjectId(null)}>All Subjects</Pill>
        {subjects.map((subject) => (
          <Pill key={subject.id} $active={subjectId === subject.id} $accent="#059669" onClick={() => setSubjectId(subject.id)}>
            {subject.name}
          </Pill>
        ))}
      </PillsRow>
    );
  };

  const currentSectionName = sections.find((s) => s.id === sectionId)?.name;

  return (
    <Layout style={{ minHeight: "100vh", backgroundColor: THEME.bg }}>
      {/* 
        Imported Sidebar component.
        Ensure your Sidebar.jsx handles its own collapsed/responsive states 
        (e.g., using <Layout.Sider breakpoint="lg" collapsedWidth="0">).
      */}
      <Sidebar />

      <Layout style={{ flex: 1, backgroundColor: THEME.bg, overflow: "hidden" }}>
        <ContentWrapper>
          {/* Hero */}
          <HeroBanner>
            <HeroContent>
              <div style={{ flex: 1, minWidth: 200 }}>
                <HeroBadge><TeamOutlined /> TEACHER PORTAL • STUDENT DIRECTORY</HeroBadge>
                <Title level={2} style={{ color: "#fff", margin: 0, fontWeight: 800, letterSpacing: "-0.02em", fontSize: "clamp(20px, 3vw, 30px)" }}>
                  Student Directory
                </Title>
                <Text style={{ color: "#cbd5e1", display: "block", marginTop: 8, fontSize: 14, maxWidth: 640 }}>
                  Browse your assigned sections, filter by subject, and look up student records at a glance.
                </Text>
              </div>

              <Tooltip title="Refresh Data">
                <Button
                  icon={<ReloadOutlined spin={loading} />}
                  onClick={fetchTeacherAssignments}
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.12)", color: "#fff", border: "1px solid rgba(255, 255, 255, 0.25)",
                    borderRadius: 10, height: 42, width: 42, display: "flex", alignItems: "center", justifyContent: "center",
                  }}
                />
              </Tooltip>
            </HeroContent>
          </HeroBanner>

          {/* Section picker */}
          <SectionBlock>
            <SectionBlockHeader>
              <div className="icon-wrap" style={{ backgroundColor: "#eff6ff", color: "#1e3a8a" }}>
                <AppstoreOutlined />
              </div>
              <div>
                <Title level={5} style={{ margin: 0, color: THEME.textMain, fontWeight: 700 }}>Select Section</Title>
                <Text style={{ color: THEME.textMuted, fontSize: 12 }}>Choose a class section to view its roster</Text>
              </div>
            </SectionBlockHeader>
            {renderSectionButtons()}
          </SectionBlock>

          {/* Subject picker */}
          {sectionId && filteredSubjects.has(sectionId) && (
            <SectionBlock>
              <SectionBlockHeader>
                <div className="icon-wrap" style={{ backgroundColor: "#ecfdf5", color: "#059669" }}>
                  <FilterOutlined />
                </div>
                <div>
                  <Title level={5} style={{ margin: 0, color: THEME.textMain, fontWeight: 700 }}>Select Subject (Optional)</Title>
                  <Text style={{ color: THEME.textMuted, fontSize: 12 }}>Narrow the roster down to one subject</Text>
                </div>
              </SectionBlockHeader>
              {renderSubjectButtons()}
            </SectionBlock>
          )}

          {/* Student table */}
          <MainCard>
            <TableToolbar>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ backgroundColor: "#eff6ff", color: "#1e3a8a", padding: 10, borderRadius: 10, display: "flex", alignItems: "center", fontSize: 18 }}>
                  <IdcardOutlined />
                </div>
                <div>
                  <Title level={5} style={{ margin: 0, fontWeight: 700, color: THEME.textMain }}>
                    Student List {subjectId ? "(Filtered)" : "(All Subjects)"}
                  </Title>
                  <Text style={{ color: THEME.textMuted, fontSize: 13 }}>
                    {currentSectionName ? `${currentSectionName} • ${students.length} students` : `${students.length} students`}
                  </Text>
                </div>
              </div>
            </TableToolbar>

            <div style={{ width: "100%", overflowX: "auto" }}>
              <Table
                dataSource={students}
                columns={getColumns()}
                rowKey="id"
                loading={loading}
                pagination={{
                  pageSize: (isSmallMobile || isExtraSmall) ? 5 : isMobile ? 8 : 10,
                  simple: isMobile,
                  showSizeChanger: !isMobile,
                  style: { padding: "16px 24px" },
                }}
                scroll={{ x: 'max-content', y: isMobile ? 450 : undefined }}
                style={{ minWidth: "100%" }}
                size={isMobile ? "small" : "middle"}
                locale={{
                  emptyText: (
                    <Empty
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                      description={
                        <Text type="secondary">
                          {sectionId ? "No students found in this section" : "Select a section"}
                        </Text>
                      }
                    />
                  ),
                }}
              />
            </div>
          </MainCard>
        </ContentWrapper>
      </Layout>
    </Layout>
  );
};

export default List;