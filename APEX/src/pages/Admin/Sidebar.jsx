// src/pages/Admin/Sidebar.jsx
import React, { useState } from "react";
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
  UserOutlined,
  TeamOutlined,
  BookOutlined,
  CalendarOutlined,
  SettingOutlined,
  StarOutlined,
  ScheduleOutlined,
  FileTextOutlined,
  DollarOutlined,
  BellOutlined,
  MessageOutlined,
  InfoCircleOutlined,
  LockOutlined,
  KeyOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  LockFilled,
  CrownOutlined,
  HomeOutlined,
  FileAddOutlined,
  LineChartOutlined,
  AppstoreAddOutlined,
} from "@ant-design/icons";

import { usePermissions } from "../../contexts/PermissionContext";
import logo from "../../assets/images.png";

const { Sider } = Layout;
const { Text, Title } = Typography;

const Sidebar = ({
  collapsed: propCollapsed,
  onCollapse: propOnCollapse,
  onItemClick,
}) => {
  const [internalCollapsed, setInternalCollapsed] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const {
    adminData,
    loading,
    isSuperAdmin,
    hasPermission,
  } = usePermissions();

  const collapsed =
    propCollapsed !== undefined ? propCollapsed : internalCollapsed;

  const setCollapsed =
    propOnCollapse || setInternalCollapsed;

  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  const allMenuItems = [
    {
      key: "/admin/dashboard",
      icon: <DashboardOutlined />,
      label: "Dashboard",
      permission: "dashboard_view",
      description: "View dashboard statistics",
    },
    {
      key: "/admin/students",
      icon: <UserOutlined />,
      label: "Students",
      permission: "students_view",
      description: "Manage student records",
    },
    {
      key: "/admin/teachers",
      icon: <TeamOutlined />,
      label: "Teachers",
      permission: "teachers_view",
      description: "Manage teacher records",
    },
    {
      key: "/admin/classes",
      icon: <BookOutlined />,
      label: "Classes",
      permission: "classes_view",
      description: "Manage classes and subjects",
    },
    {
      key: "/admin/exams",
      icon: <FileTextOutlined />,
      label: "Exams",
      permission: "exams_view",
      description: "Manage exams and results",
    },
    {
      key: "/admin/attendance",
      icon: <CalendarOutlined />,
      label: "Attendance",
      permission: "attendance_view",
      description: "View and manage attendance",
    },
    {
      key: "/admin/teacher-evaluations",
      icon: <StarOutlined />,
      label: "Teacher Evaluations",
      permission: "evaluations_view",
      description: "Evaluate teacher performance",
    },
    {
      key: "/admin/communication",
      icon: <ScheduleOutlined />,
      label: "Time Table",
      permission: "timetable_view",
      description: "Manage class schedules",
    },
    {
      key: "/admin/library",
      icon: <DollarOutlined />,
      label: "Dues",
      permission: "dues_view",
      description: "Manage fee dues",
    },
    {
      key: "/admin/events",
      icon: <BellOutlined />,
      label: "Events",
      permission: "events_view",
      description: "Manage events and calendar",
    },
    {
      key: "/admin/feedback-management",
      icon: <MessageOutlined />,
      label: "Feedback",
      permission: "feedback_view",
      description: "Manage feedback",
    },
    {
      key: "/admin/about-management",
      icon: <InfoCircleOutlined />,
      label: "About",
      permission: "about_view",
      description: "Manage about content",
    },
    {
      key: "/admin/assignments",
      icon: <FileAddOutlined />,
      label: "Assignments",
      permission: "assignments_view",
      description: "Manage assignments",
    },
    {
      key: "/admin/performance",
      icon: <LineChartOutlined />,
      label: "Performance",
      permission: "performance_view",
      description: "View performance metrics",
    },
    {
      key: "/admin/applications",
      icon: <AppstoreAddOutlined />,
      label: "Applications",
      permission: "applications_view",
      description: "Manage student applications",
    },
    {
      key: "/admin/admin-management",
      icon: <LockOutlined />,
      label: "Admin Management",
      permission: "admins_manage",
      description: "Manage admin users",
    },
    {
      key: "/admin/permission-management",
      icon: <KeyOutlined />,
      label: "Permission Management",
      permission: "permissions_manage",
      description: "Manage permissions",
    },
    {
      key: "/admin/settings",
      icon: <SettingOutlined />,
      label: "Settings",
      permission: "settings_view",
      description: "System settings",
    },
  ];

  const getMenuItemsWithStatus = () => {
    return allMenuItems.map((item) => ({
      ...item,
      hasAccess:
        isSuperAdmin || hasPermission(item.permission),
    }));
  };

  const totalItems = allMenuItems.length;

  const activeItems = allMenuItems.filter(
    (item) =>
      isSuperAdmin || hasPermission(item.permission)
  ).length;

  const handleNavigation = (item) => {
    if (!item.hasAccess) return;

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
          borderRight:
            "1px solid rgba(212, 175, 55, 0.15)",
          boxSizing: "border-box",
        }}
      >
        <Spin size="large" />

        {!collapsed && (
          <Text
            style={{
              color: "#cbd5e1",
              marginTop: 12,
              fontSize: 13,
            }}
          >
            Loading permissions...
          </Text>
        )}
      </div>
    );
  }

  const itemsWithStatus = getMenuItemsWithStatus();

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
        borderRight:
          "1px solid rgba(212, 175, 55, 0.18)",
        zIndex: 1000,
        overflow: "hidden",
        flexShrink: 0,
        boxSizing: "border-box",
        boxShadow:
          "4px 0 20px rgba(6, 17, 41, 0.30)",
      }}
    >
      {/* =====================================================
          FULL SIDEBAR CONTAINER
      ====================================================== */}

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
        {/* =====================================================
            BRAND HEADER
        ====================================================== */}

        <div
          style={{
            flexShrink: 0,
            minHeight: 72,
            padding: collapsed
              ? "16px 8px"
              : "16px 14px",
            borderBottom:
              "1px solid rgba(212, 175, 55, 0.15)",
            display: "flex",
            alignItems: "center",
            justifyContent: collapsed
              ? "center"
              : "space-between",
            gap: 8,
            background:
              "linear-gradient(180deg, #091838 0%, #061129 100%)",
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
              onClick={() =>
                navigate("/admin/dashboard")
              }
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

              <div
                style={{
                  minWidth: 0,
                  overflow: "hidden",
                }}
              >
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
                  APEX{" "}
                  <span style={{ color: "#d4af37" }}>
                    COLLEGE
                  </span>
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
                  Admin Portal
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
              onClick={() =>
                navigate("/admin/dashboard")
              }
            />
          )}

          <Button
            type="text"
            icon={
              collapsed ? (
                <MenuUnfoldOutlined
                  style={{ color: "#d4af37" }}
                />
              ) : (
                <MenuFoldOutlined
                  style={{ color: "#d4af37" }}
                />
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
              background:
                "rgba(212, 175, 55, 0.08)",
            }}
          />
        </div>

        {/* =====================================================
            ADMIN PROFILE
        ====================================================== */}

        <div
          style={{
            flexShrink: 0,
            padding: collapsed
              ? "14px 8px"
              : "15px 12px",
            borderBottom:
              "1px solid rgba(212, 175, 55, 0.12)",
            background:
              "rgba(255, 255, 255, 0.02)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <div
            style={{
              position: "relative",
            }}
          >
            <Avatar
              size={collapsed ? 38 : 50}
              style={{
                background:
                  "linear-gradient(135deg, #d4af37 0%, #1e3a8a 100%)",
                color: "#ffffff",
                fontSize: collapsed ? 16 : 21,
                fontWeight: 700,
                cursor: "pointer",
                border: "2px solid #d4af37",
                boxShadow:
                  "0 4px 14px rgba(212, 175, 55, 0.25)",
              }}
              onClick={() =>
                navigate("/admin/settings")
              }
            >
              {adminData?.name
                ?.charAt(0)
                ?.toUpperCase() || "A"}
            </Avatar>

            {isSuperAdmin && (
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
            )}
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
                {adminData?.name || "Administrator"}
              </Text>

              <Text
                style={{
                  color: "#94a3b8",
                  fontSize: 11,
                  display: "block",
                  marginTop: 1,
                }}
              >
                {adminData?.designation ||
                  "System Admin"}
              </Text>

              <div style={{ marginTop: 6 }}>
                <span
                  style={{
                    background: isSuperAdmin
                      ? "rgba(212, 175, 55, 0.15)"
                      : "rgba(37, 99, 235, 0.15)",
                    color: isSuperAdmin
                      ? "#d4af37"
                      : "#60a5fa",
                    border: `1px solid ${
                      isSuperAdmin
                        ? "rgba(212, 175, 55, 0.3)"
                        : "rgba(96, 165, 250, 0.3)"
                    }`,
                    padding: "2px 8px",
                    borderRadius: 12,
                    fontSize: 10,
                    fontWeight: 600,
                  }}
                >
                  {isSuperAdmin
                    ? "👑 Super Admin"
                    : `${activeItems}/${totalItems} Permissions`}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* =====================================================
            SCROLLABLE NAVIGATION
        ====================================================== */}

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
          {itemsWithStatus.map((item) => {
            const isSelected =
              location.pathname === item.key;

            const isActive = item.hasAccess;

            return (
              <Tooltip
                key={item.key}
                title={
                  collapsed
                    ? item.label +
                      (!isActive
                        ? " (Locked)"
                        : "")
                    : !isActive
                    ? `🔒 Requires permission: ${item.permission}`
                    : item.description
                }
                placement="right"
                mouseEnterDelay={0.3}
              >
                <div
                  onClick={() =>
                    handleNavigation(item)
                  }
                  style={{
                    flexShrink: 0,
                    minHeight: 42,
                    padding: collapsed
                      ? "10px 0"
                      : "10px 12px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: collapsed
                      ? "center"
                      : "space-between",
                    borderRadius: 8,
                    cursor: isActive
                      ? "pointer"
                      : "not-allowed",
                    backgroundColor: isSelected
                      ? "rgba(212, 175, 55, 0.14)"
                      : "transparent",
                    borderLeft: isSelected
                      ? "3px solid #d4af37"
                      : "3px solid transparent",
                    opacity: isActive ? 1 : 0.45,
                    transition:
                      "all 0.2s ease",
                    color: isSelected
                      ? "#d4af37"
                      : "#cbd5e1",
                    boxSizing: "border-box",
                  }}
                  onMouseEnter={(e) => {
                    if (isActive && !isSelected) {
                      e.currentTarget.style.backgroundColor =
                        "rgba(255, 255, 255, 0.05)";

                      e.currentTarget.style.color =
                        "#ffffff";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (isActive && !isSelected) {
                      e.currentTarget.style.backgroundColor =
                        "transparent";

                      e.currentTarget.style.color =
                        "#cbd5e1";
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
                        color: isSelected
                          ? "#d4af37"
                          : isActive
                          ? "#94a3b8"
                          : "#64748b",
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
                          fontWeight: isSelected
                            ? 600
                            : 400,
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

                  {!collapsed && (
                    <span
                      style={{
                        flexShrink: 0,
                        marginLeft: 8,
                      }}
                    >
                      {isActive ? (
                        isSelected && (
                          <div
                            style={{
                              width: 6,
                              height: 6,
                              borderRadius: "50%",
                              background:
                                "#d4af37",
                            }}
                          />
                        )
                      ) : (
                        <LockFilled
                          style={{
                            fontSize: 11,
                            color: "#64748b",
                          }}
                        />
                      )}
                    </span>
                  )}
                </div>
              </Tooltip>
            );
          })}
        </div>

        {/* =====================================================
            FIXED BOTTOM FOOTER
        ====================================================== */}

        <div
          style={{
            flexShrink: 0,
            width: "100%",
            padding: collapsed
              ? "10px 8px"
              : "10px 12px",
            borderTop:
              "1px solid rgba(212, 175, 55, 0.12)",
            background:
              "linear-gradient(180deg, #081631 0%, #061129 100%)",
            boxSizing: "border-box",
          }}
        >
          <Button
            type="text"
            icon={
              <HomeOutlined
                style={{
                  color: "#d4af37",
                  fontSize: 15,
                }}
              />
            }
            onClick={() => navigate("/")}
            block
            style={{
              color: "#cbd5e1",
              textAlign: collapsed
                ? "center"
                : "left",
              fontSize: 12,
              display: "flex",
              alignItems: "center",
              justifyContent: collapsed
                ? "center"
                : "flex-start",
              gap: 8,
              padding: collapsed
                ? "7px 0"
                : "7px 8px",
              borderRadius: 7,
              height: 34,
              margin: 0,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor =
                "rgba(212, 175, 55, 0.08)";
              e.currentTarget.style.color =
                "#ffffff";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor =
                "transparent";
              e.currentTarget.style.color =
                "#cbd5e1";
            }}
          >
            {!collapsed && "Visit Public Website"}
          </Button>
        </div>
      </div>

      {/* =====================================================
          SIDEBAR SCROLLBAR STYLING
      ====================================================== */}

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