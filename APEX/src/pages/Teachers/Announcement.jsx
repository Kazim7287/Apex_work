import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import AllAnnouncementsModal from "./AllAnnouncementsModal";
import AllTeachersAnnouncementsModal from "./AllTeachersAnnouncementsModal";
import {
  Layout,
  Card,
  List,
  Spin,
  message,
  Typography,
  Space,
  Tag,
  Avatar,
  Button,
  Dropdown,
  Menu,
  Grid,
  Drawer,
  ConfigProvider,
  theme,
  Tooltip,
} from "antd";
import {
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  NotificationOutlined,
  UserOutlined,
  GlobalOutlined,
  TeamOutlined,
  DownOutlined,
  MenuOutlined,
  ReloadOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import styled from "styled-components";

const { Text, Title } = Typography;
const { Content } = Layout;
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

const CheckAnnouncementSection = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [teacherId, setTeacherId] = useState(null);
  const [showAllAnnouncements, setShowAllAnnouncements] = useState(false);
  const [showAllTeachersAnnouncements, setShowAllTeachersAnnouncements] = useState(false);
  const [mobileSidebarVisible, setMobileSidebarVisible] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const screens = useBreakpoint();
  const isMobile = !screens.md;

  useEffect(() => {
    const storedTeacherId = localStorage.getItem("teacher_id");
    if (storedTeacherId) {
      setTeacherId(storedTeacherId);
    } else {
      setError("Teacher ID not found in localStorage");
      setLoading(false);
      message.error("Teacher ID not found. Please login again.");
    }
  }, []);

  const fetchAnnouncements = async () => {
    if (!teacherId) return;

    setLoading(true);
    try {
      const response = await fetch(
        `https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/single_teach_announce_read.php?teacher_id=${teacherId}`
      );
      const data = await response.json();

      if (data.status === "success") {
        setAnnouncements(data.data);
      } else {
        setError(data.message || "Failed to fetch announcements");
        message.error(data.message || "Failed to fetch announcements");
      }
    } catch (err) {
      setError("Network error. Please try again.");
      message.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (teacherId) {
      fetchAnnouncements();
    }
  }, [teacherId]);

  const getStatusTag = (status) => {
    if (!status) return <Tag icon={<NotificationOutlined />} color="default">General</Tag>;
    switch (status.toLowerCase()) {
      case "urgent":
        return (
          <Tag icon={<ExclamationCircleOutlined />} color="error">
            Urgent
          </Tag>
        );
      case "academic":
        return (
          <Tag icon={<NotificationOutlined />} color="processing">
            Academic
          </Tag>
        );
      default:
        return (
          <Tag icon={<NotificationOutlined />} color="success">
            General
          </Tag>
        );
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const viewAnnouncementsMenu = (
    <Menu
      items={[
        {
          key: "all",
          icon: <GlobalOutlined style={{ color: "#d4af37" }} />,
          label: "General Announcements",
          onClick: () => setShowAllAnnouncements(true),
        },
        {
          key: "teachers",
          icon: <TeamOutlined style={{ color: "#d4af37" }} />,
          label: "All Teachers Announcements",
          onClick: () => setShowAllTeachersAnnouncements(true),
        },
      ]}
    />
  );

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
            onClose={() => setMobileSidebarVisible(false)}
            visible={mobileSidebarVisible}
            width={250}
          >
            <Sidebar
              collapsed={false}
              onItemClick={() => setMobileSidebarVisible(false)}
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
                    onClick={() => setMobileSidebarVisible(true)}
                    style={{
                      borderColor: "#cbd5e1",
                      background: "#ffffff",
                    }}
                  />
                )}
                <div className="title-icon-badge">
                  <NotificationOutlined />
                </div>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Title
                      level={isMobile ? 4 : 3}
                      style={{ margin: 0, color: "#0f172a", fontWeight: 700 }}
                    >
                      Announcements & Notices
                    </Title>
                    <Tooltip title="View personal and institutional announcements">
                      <InfoCircleOutlined
                        style={{ color: "#94a3b8", fontSize: 14 }}
                      />
                    </Tooltip>
                  </div>
                  <Text style={{ color: "#64748b", fontSize: isMobile ? 11 : 13 }}>
                    Showing announcements assigned to Teacher ID: {teacherId || "N/A"}
                  </Text>
                </div>
              </HeaderTitleWrapper>

              <Space wrap>
                <Dropdown overlay={viewAnnouncementsMenu} placement="bottomRight">
                  <Button
                    style={{
                      background: "linear-gradient(135deg, #091838 0%, #061129 100%)",
                      borderColor: "#061129",
                      color: "#ffffff",
                      fontWeight: 600,
                      borderRadius: 8,
                    }}
                  >
                    <Space>
                      View All Bulletins
                      <DownOutlined />
                    </Space>
                  </Button>
                </Dropdown>

                <Tooltip title="Refresh announcements">
                  <Button
                    icon={<ReloadOutlined />}
                    onClick={fetchAnnouncements}
                    loading={loading}
                    style={{
                      borderColor: "#cbd5e1",
                      color: "#475569",
                      borderRadius: 8,
                    }}
                  />
                </Tooltip>
              </Space>
            </MainHeaderCard>

            {/* ANNOUNCEMENTS LIST */}
            <StyledCard title={<Text strong>Your Personal Feed</Text>}>
              {loading ? (
                <div style={{ textAlign: "center", padding: "60px 0" }}>
                  <Spin size="large" />
                </div>
              ) : error ? (
                <div style={{ textAlign: "center", padding: "24px 0" }}>
                  <Text type="danger" style={{ display: "block", marginBottom: 16 }}>
                    {error}
                  </Text>
                  <Button
                    type="primary"
                    onClick={fetchAnnouncements}
                    style={{
                      background: "linear-gradient(135deg, #091838 0%, #061129 100%)",
                      borderColor: "#061129",
                    }}
                  >
                    Try Again
                  </Button>
                </div>
              ) : (
                <List
                  itemLayout="vertical"
                  size="large"
                  dataSource={announcements}
                  renderItem={(announcement) => (
                    <List.Item
                      key={announcement.id}
                      style={{
                        background: "#ffffff",
                        border: "1px solid #e2e8f0",
                        borderRadius: 10,
                        padding: 16,
                        marginBottom: 16,
                      }}
                      extra={
                        !screens.xs && (
                          <Space style={{ color: "#64748b" }}>
                            <ClockCircleOutlined />
                            <Text style={{ color: "#64748b", fontSize: 13 }}>
                              {formatDate(announcement.date)}
                            </Text>
                          </Space>
                        )
                      }
                    >
                      <List.Item.Meta
                        avatar={
                          <Avatar
                            icon={<UserOutlined />}
                            style={{
                              backgroundColor: "#fef3c7",
                              color: "#d4af37",
                              border: "1px solid rgba(212, 175, 55, 0.3)",
                            }}
                          />
                        }
                        title={
                          <Space
                            direction={screens.xs ? "vertical" : "horizontal"}
                            align={screens.xs ? "start" : "center"}
                          >
                            {getStatusTag(announcement.status)}
                            <Text strong style={{ fontSize: 16, color: "#0f172a" }}>
                              {announcement.announce_title}
                            </Text>
                          </Space>
                        }
                        description={
                          <div style={{ marginTop: 8 }}>
                            <Text
                              style={{
                                whiteSpace: "pre-line",
                                color: "#334155",
                                lineHeight: "1.6",
                              }}
                            >
                              {announcement.description}
                            </Text>
                            {screens.xs && (
                              <div style={{ marginTop: 12, color: "#64748b" }}>
                                <ClockCircleOutlined style={{ marginRight: 6 }} />
                                <Text style={{ color: "#64748b", fontSize: 12 }}>
                                  {formatDate(announcement.date)}
                                </Text>
                              </div>
                            )}
                          </div>
                        }
                      />
                    </List.Item>
                  )}
                  locale={{ emptyText: "No personal announcements found." }}
                />
              )}
            </StyledCard>

            {/* General Announcements Modal */}
            <AllAnnouncementsModal
              visible={showAllAnnouncements}
              onCancel={() => setShowAllAnnouncements(false)}
            />

            {/* All Teachers Announcements Modal */}
            <AllTeachersAnnouncementsModal
              visible={showAllTeachersAnnouncements}
              onCancel={() => setShowAllTeachersAnnouncements(false)}
            />
          </ContentCanvas>
        </Layout>
      </OuterLayout>
    </ConfigProvider>
  );
};

export default CheckAnnouncementSection;