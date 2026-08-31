// src/pages/Students/Sidebar.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Layout,
  Avatar,
  Typography,
  Spin,
  Button,
  Tooltip,
} from "antd";
import {
  DashboardOutlined,
  FileTextOutlined,
  DollarOutlined,
  LineChartOutlined,
  CalendarOutlined,
  StarOutlined,
  NotificationOutlined,
  ScheduleOutlined,
  UserOutlined,
  CrownOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  HomeOutlined,
} from "@ant-design/icons";

import logo from "../../assets/images.png";

const { Sider } = Layout;
const { Text, Title } = Typography;

const Sidebar = ({
  collapsed: propCollapsed,
  onCollapse: propOnCollapse,
  onItemClick,
}) => {
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const [profilePicture, setProfilePicture] = useState(null);
  const [studentName, setStudentName] = useState("Student");
  const [studentClass, setStudentClass] = useState("");
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const location = useLocation();

  const collapsed =
    propCollapsed !== undefined ? propCollapsed : internalCollapsed;

  const setCollapsed = propOnCollapse || setInternalCollapsed;

  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  useEffect(() => {
    let cancelled = false;

    const fetchStudentProfile = async () => {
      try {
        const studentId = localStorage.getItem("student_id");
        if (!studentId) {
          setLoading(false);
          return;
        }

        const API_BASE_URL = "https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX";

        // Fetch basic details
        const profileResponse = await fetch(
          `${API_BASE_URL}/Std_profileDetail.php?student_id=${encodeURIComponent(studentId)}`,
          {
            credentials: "include",
            headers: { Accept: "application/json" },
          }
        );

        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          if (!cancelled && profileData.success && profileData.student) {
            setStudentName(profileData.student.name || profileData.student.Name || "Student");
            const classInfo = [
              profileData.student.class_no || profileData.student.Class_No ? `Class ${profileData.student.class_no || profileData.student.Class_No}` : "",
              profileData.section?.name ? `(${profileData.section.name})` : "",
            ]
              .filter(Boolean)
              .join(" ");
            setStudentClass(classInfo || "Enrolled Student");
          }
        }

        // Fetch picture
        try {
          const pictureResponse = await fetch(
            `${API_BASE_URL}/fetchStudentPicture.php?student_id=${encodeURIComponent(studentId)}`,
            {
              credentials: "include",
              headers: { Accept: "application/json" },
            }
          );
          if (pictureResponse.ok) {
            const pictureData = await pictureResponse.json();
            if (!cancelled && pictureData.success && pictureData.exists) {
              const imgUrl = pictureData.url || pictureData.full_url;
              if (imgUrl) {
                setProfilePicture(imgUrl.replace(/\\\//g, "/"));
              }
            }
          }
        } catch (error) {
          console.warn("Could not fetch student profile picture:", error);
        }
      } catch (error) {
        console.error("Error fetching student profile:", error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchStudentProfile();
    return () => {
      cancelled = true;
    };
  }, []);

  const studentMenuItems = [
    {
      key: "/student/dashboard",
      icon: <DashboardOutlined />,
      label: "Dashboard",
      description: "Overview & upcoming events",
    },
    {
      key: "/student/assignments",
      icon: <FileTextOutlined />,
      label: "Applications",
      description: "Submit & track student requests",
    },
    {
      key: "/student/exams",
      icon: <DollarOutlined />,
      label: "Fee Dues",
      description: "View fee balances & payment history",
    },
    {
      key: "/student/performance",
      icon: <LineChartOutlined />,
      label: "Performance",
      description: "Academic results & analytics",
    },
    {
      key: "/student/attendance",
      icon: <CalendarOutlined />,
      label: "Attendance",
      description: "Daily & subject attendance summary",
    },
    {
      key: "/student/teacher-evaluation",
      icon: <StarOutlined />,
      label: "Teacher Evaluation",
      description: "Faculty review & feedback",
    },
    {
      key: "/student/announcement",
      icon: <NotificationOutlined />,
      label: "Announcements",
      description: "Notices, timetable & campus alerts",
    },
    {
      key: "/student/term/list",
      icon: <ScheduleOutlined />,
      label: "Exam Schedule",
      description: "Term exam dates & time slots",
    },
    {
      key: "/student/profile",
      icon: <UserOutlined />,
      label: "My Profile",
      description: "Personal student credentials",
    },
  ];

  const getInitials = (name) =>
    String(name || "Student")
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

  const handleNavigation = (item) => {
    navigate(item.key);
    if (onItemClick) {
      onItemClick();
    }
  };

  if (loading) {
    return (
      <div
        style={{
          width: collapsed ? 76 : 250,
          height: "100vh",
          minHeight: "100vh",
          background: "#061129",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          borderRight: "1px solid rgba(212, 175, 55, 0.15)",
          boxSizing: "border-box",
        }}
      >
        <Spin size="large" />
        {!collapsed && (
          <Text style={{ color: "#cbd5e1", marginTop: 12, fontSize: 13 }}>
            Loading student portal...
          </Text>
        )}
      </div>
    );
  }

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      onCollapse={setCollapsed}
      trigger={null}
      width={250}
      collapsedWidth={76}
      style={{
        background: "#061129",
        height: "100vh",
        minHeight: "100vh",
        position: "sticky",
        top: 0,
        alignSelf: "flex-start",
        borderRight: "1px solid rgba(212, 175, 55, 0.18)",
        zIndex: 1000,
        overflow: "hidden",
        flexShrink: 0,
        boxSizing: "border-box",
        boxShadow: "4px 0 20px rgba(6, 17, 41, 0.30)",
      }}
    >
      <div
        style={{
          height: "100vh",
          minHeight: "100vh",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          background: "#061129",
          overflow: "hidden",
        }}
      >
        {/* BRAND HEADER */}
        <div
          style={{
            flexShrink: 0,
            minHeight: 72,
            padding: collapsed ? "16px 8px" : "16px 14px",
            borderBottom: "1px solid rgba(212, 175, 55, 0.15)",
            display: "flex",
            alignItems: "center",
            justifyContent: collapsed ? "center" : "space-between",
            gap: 8,
            background: "linear-gradient(180deg, #091838 0%, #061129 100%)",
            boxSizing: "border-box",
          }}
        >
          {!collapsed ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                cursor: "pointer",
                minWidth: 0,
              }}
              onClick={() => navigate("/student/dashboard")}
            >
              <img
                src={logo}
                alt="APEX Logo"
                style={{
                  height: 36,
                  width: 36,
                  borderRadius: 6,
                  objectFit: "contain",
                  flexShrink: 0,
                }}
              />

              <div style={{ minWidth: 0, overflow: "hidden" }}>
                <Title
                  level={5}
                  style={{
                    color: "#ffffff",
                    margin: 0,
                    fontFamily: "Cinzel, serif",
                    fontSize: "1.05rem",
                    letterSpacing: "0.5px",
                    whiteSpace: "nowrap",
                  }}
                >
                  APEX <span style={{ color: "#d4af37" }}>COLLEGE</span>
                </Title>

                <Text
                  style={{
                    color: "#94a3b8",
                    fontSize: 10,
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                    display: "block",
                    marginTop: -2,
                    whiteSpace: "nowrap",
                  }}
                >
                  Student Portal
                </Text>
              </div>
            </div>
          ) : (
            <img
              src={logo}
              alt="APEX"
              style={{
                height: 34,
                width: 34,
                borderRadius: 6,
                cursor: "pointer",
                objectFit: "contain",
              }}
              onClick={() => navigate("/student/dashboard")}
            />
          )}

          <Button
            type="text"
            icon={
              collapsed ? (
                <MenuUnfoldOutlined style={{ color: "#d4af37" }} />
              ) : (
                <MenuFoldOutlined style={{ color: "#d4af37" }} />
              )
            }
            onClick={toggleCollapsed}
            style={{
              flexShrink: 0,
              fontSize: 16,
              width: 32,
              height: 32,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 6,
              background: "rgba(212, 175, 55, 0.08)",
            }}
          />
        </div>

        {/* STUDENT PROFILE SECTION */}
        <div
          style={{
            flexShrink: 0,
            padding: collapsed ? "14px 8px" : "15px 12px",
            borderBottom: "1px solid rgba(212, 175, 55, 0.12)",
            background: "rgba(255, 255, 255, 0.02)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <div style={{ position: "relative" }}>
            <Avatar
              size={collapsed ? 38 : 50}
              src={profilePicture || undefined}
              style={{
                background:
                  "linear-gradient(135deg, #d4af37 0%, #1e3a8a 100%)",
                color: "#ffffff",
                fontSize: collapsed ? 16 : 21,
                fontWeight: 700,
                cursor: "pointer",
                border: "2px solid #d4af37",
                boxShadow: "0 4px 14px rgba(212, 175, 55, 0.25)",
              }}
              onClick={() => navigate("/student/profile")}
            >
              {!profilePicture && getInitials(studentName)}
            </Avatar>

            <CrownOutlined
              style={{
                position: "absolute",
                bottom: -2,
                right: -4,
                color: "#d4af37",
                fontSize: 14,
                background: "#061129",
                borderRadius: "50%",
                padding: 2,
              }}
            />
          </div>

          {!collapsed && (
            <div
              style={{
                marginTop: 9,
                textAlign: "center",
                width: "100%",
              }}
            >
              <Text
                strong
                style={{
                  color: "#ffffff",
                  fontSize: 13,
                  display: "block",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {studentName}
              </Text>

              <Text
                style={{
                  color: "#94a3b8",
                  fontSize: 11,
                  display: "block",
                  marginTop: 1,
                }}
              >
                {studentClass || "Student"}
              </Text>

              <div style={{ marginTop: 6 }}>
                <span
                  style={{
                    background: "rgba(212, 175, 55, 0.15)",
                    color: "#d4af37",
                    border: "1px solid rgba(212, 175, 55, 0.3)",
                    padding: "2px 8px",
                    borderRadius: 12,
                    fontSize: 10,
                    fontWeight: 600,
                  }}
                >
                  👑 Student Access
                </span>
              </div>
            </div>
          )}
        </div>

        {/* SCROLLABLE NAVIGATION */}
        <div
          style={{
            flex: "1 1 auto",
            minHeight: 0,
            overflowY: "auto",
            overflowX: "hidden",
            padding: "10px 8px",
            display: "flex",
            flexDirection: "column",
            gap: 3,
            boxSizing: "border-box",
          }}
          className="apex-sidebar-nav"
        >
          {studentMenuItems.map((item) => {
            const isSelected =
              location.pathname === item.key ||
              (item.key === "/student/dashboard" && location.pathname === "/student") ||
              (item.key === "/student/announcement" && location.pathname === "/student/assignment/list") ||
              (item.key === "/student/performance" && location.pathname === "/student/performance/list");

            return (
              <Tooltip
                key={item.key}
                title={collapsed ? item.label : item.description}
                placement="right"
                mouseEnterDelay={0.3}
              >
                <div
                  onClick={() => handleNavigation(item)}
                  style={{
                    flexShrink: 0,
                    minHeight: 42,
                    padding: collapsed ? "10px 0" : "10px 12px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: collapsed ? "center" : "space-between",
                    borderRadius: 8,
                    cursor: "pointer",
                    backgroundColor: isSelected
                      ? "rgba(212, 175, 55, 0.14)"
                      : "transparent",
                    borderLeft: isSelected
                      ? "3px solid #d4af37"
                      : "3px solid transparent",
                    transition: "all 0.2s ease",
                    color: isSelected ? "#d4af37" : "#cbd5e1",
                    boxSizing: "border-box",
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.backgroundColor =
                        "rgba(255, 255, 255, 0.05)";
                      e.currentTarget.style.color = "#ffffff";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.backgroundColor = "transparent";
                      e.currentTarget.style.color = "#cbd5e1";
                    }
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      minWidth: 0,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 16,
                        color: isSelected ? "#d4af37" : "#94a3b8",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      {item.icon}
                    </span>

                    {!collapsed && (
                      <span
                        style={{
                          fontSize: 13,
                          fontWeight: isSelected ? 600 : 400,
                          letterSpacing: "0.2px",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {item.label}
                      </span>
                    )}
                  </div>

                  {!collapsed && isSelected && (
                    <div
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        background: "#d4af37",
                        flexShrink: 0,
                        marginLeft: 8,
                      }}
                    />
                  )}
                </div>
              </Tooltip>
            );
          })}
        </div>

        {/* FIXED FOOTER */}
        <div
          style={{
            flexShrink: 0,
            width: "100%",
            padding: collapsed ? "10px 8px" : "10px 12px",
            borderTop: "1px solid rgba(212, 175, 55, 0.12)",
            background: "linear-gradient(180deg, #081631 0%, #061129 100%)",
            boxSizing: "border-box",
          }}
        >
          <Button
            type="text"
            icon={<HomeOutlined style={{ color: "#d4af37", fontSize: 15 }} />}
            onClick={() => navigate("/")}
            block
            style={{
              color: "#cbd5e1",
              textAlign: collapsed ? "center" : "left",
              fontSize: 12,
              display: "flex",
              alignItems: "center",
              justifyContent: collapsed ? "center" : "flex-start",
              gap: 8,
              padding: collapsed ? "7px 0" : "7px 8px",
              borderRadius: 7,
              height: 34,
              margin: 0,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor =
                "rgba(212, 175, 55, 0.08)";
              e.currentTarget.style.color = "#ffffff";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.color = "#cbd5e1";
            }}
          >
            {!collapsed && "Visit Public Website"}
          </Button>
        </div>
      </div>

      <style>
        {`
          .apex-sidebar-nav {
            scrollbar-width: thin;
            scrollbar-color: rgba(212, 175, 55, 0.25) transparent;
          }

          .apex-sidebar-nav::-webkit-scrollbar {
            width: 5px;
          }

          .apex-sidebar-nav::-webkit-scrollbar-track {
            background: transparent;
          }

          .apex-sidebar-nav::-webkit-scrollbar-thumb {
            background: rgba(212, 175, 55, 0.25);
            border-radius: 10px;
          }

          .apex-sidebar-nav::-webkit-scrollbar-thumb:hover {
            background: rgba(212, 175, 55, 0.45);
          }

          .ant-layout-sider-children {
            height: 100%;
            min-height: 100%;
            overflow: hidden;
          }
        `}
      </style>
    </Sider>
  );
};

export default Sidebar;