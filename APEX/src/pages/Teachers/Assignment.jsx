/* eslint-disable no-unused-vars */
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Layout,
  Button,
  Typography,
  Grid,
  Drawer,
  notification,
  ConfigProvider,
  theme,
  Tooltip,
} from "antd";
import { useMediaQuery } from "react-responsive";
import Sidebar from "./Sidebar";
import ReportList from "./ReportList";
import ReportFormModal from "./ReportFormModal";
import {
  PlusOutlined,
  FileTextOutlined,
  MenuOutlined,
  ReloadOutlined,
  InfoCircleOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import styled from "styled-components";

const { Content } = Layout;
const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

/* ============================== THEME ============================== */
const THEME = {
  bg: "#f8fafc",
  cardBg: "#ffffff",
  primary: "#1e3a8a",
  accent: "#d4af37",
  border: "#e2e8f0",
  textMain: "#0f172a",
  textMuted: "#64748b",
  shadowSm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
  shadowMd: "0 4px 12px rgba(15, 23, 42, 0.03)",
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

const ContentCanvas = styled(Content)`
  padding: clamp(12px, 2.5vw, 24px) clamp(10px, 3vw, 28px) clamp(24px, 4vw, 40px);
  background-color: ${THEME.bg};
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

const MainHeaderCard = styled.div`
  background: #ffffff;
  border: 1px solid ${THEME.border};
  border-radius: 14px;
  padding: clamp(14px, 2vw, 20px) clamp(14px, 2.5vw, 24px);
  margin-bottom: clamp(14px, 2vw, 20px);
  box-shadow: ${THEME.shadowMd};
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
    gap: 14px;
  }
`;

const HeaderTitleWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: clamp(10px, 1.8vw, 14px);
  min-width: 0;

  .title-icon-badge {
    width: clamp(38px, 4.5vw, 44px);
    height: clamp(38px, 4.5vw, 44px);
    border-radius: 10px;
    background: linear-gradient(135deg, #fefce8 0%, #fef3c7 100%);
    border: 1px solid rgba(212, 175, 55, 0.3);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: clamp(18px, 2.2vw, 22px);
    color: #d4af37;
    box-shadow: 0 2px 8px rgba(212, 175, 55, 0.15);
    flex-shrink: 0;
  }

  .title-text-group {
    min-width: 0;
    display: flex;
    flex-direction: column;
  }

  .title-heading-row {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }

  .title-heading {
    margin: 0 !important;
    color: ${THEME.textMain} !important;
    font-weight: 700 !important;
    font-size: clamp(16px, 2vw, 20px) !important;
    line-height: 1.3 !important;
  }

  .subtitle-text {
    color: ${THEME.textMuted} !important;
    font-size: clamp(11px, 1.2vw, 13px) !important;
    line-height: 1.4 !important;
  }
`;

const ActionGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;

  @media (max-width: 768px) {
    width: 100%;
    justify-content: space-between;
  }

  @media (max-width: 480px) {
    gap: 8px;
  }
`;

const StyledDrawer = styled(Drawer)`
  .ant-drawer-content {
    background-color: #061129 !important;
  }
  .ant-drawer-body {
    padding: 0 !important;
    overflow: hidden;
    background-color: #061129 !important;
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

/* =============================== MAIN COMPONENT =============================== */
const StudentReportSection = () => {
  const [refreshReports, setRefreshReports] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const teacherId = localStorage.getItem("teacher_id");
  const screens = useBreakpoint();

  const isMobile = useMediaQuery({ maxWidth: 992 });
  const isSmallMobile = useMediaQuery({ maxWidth: 576 });

  const handleCreateReport = () => {
    setIsModalVisible(true);
    if (isMobile && isDrawerVisible) {
      setIsDrawerVisible(false);
    }
  };

  const handleReportSubmitted = () => {
    setRefreshReports((prev) => !prev);
    setIsModalVisible(false);
    notification.success({
      message: "Report Submitted",
      description: "Student evaluation report has been created successfully.",
    });
  };

  const handleRefresh = () => {
    setRefreshReports((prev) => !prev);
    notification.info({
      message: "Refreshing Reports",
      description: "Fetching latest student records...",
      duration: 2,
    });
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
        },
      }}
    >
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
          <StyledDrawer
            title="APEX COLLEGE"
            placement="left"
            closable={true}
            onClose={() => setIsDrawerVisible(false)}
            open={isDrawerVisible}
            visible={isDrawerVisible}
            width={260}
            styles={{
              body: { padding: 0, overflow: "hidden", background: "#061129" },
              header: {
                background: "#061129",
                borderBottom: "1px solid rgba(212, 175, 55, 0.15)",
                color: "#ffffff",
              },
            }}
          >
            <Sidebar
              collapsed={false}
              onItemClick={() => setIsDrawerVisible(false)}
            />
          </StyledDrawer>
        )}

        {/* MAIN CONTENT LAYOUT */}
        <ContentLayout>
          {/* MOBILE TOP BAR (<= 992px) */}
          {isMobile && (
            <MobileNavBar>
              <NavLeftGroup>
                <Button
                  type="text"
                  icon={<MenuOutlined style={{ fontSize: 18 }} />}
                  onClick={() => setIsDrawerVisible(true)}
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
                  <Text
                    style={{
                      fontSize: 10,
                      color: THEME.textMuted,
                      display: "block",
                      letterSpacing: "0.05em",
                      fontWeight: 600,
                    }}
                  >
                    TEACHER PORTAL
                  </Text>
                  <Text
                    strong
                    style={{
                      fontSize: 14,
                      color: THEME.textMain,
                      display: "block",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    Student Reports
                  </Text>
                </div>
              </NavLeftGroup>

              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Tooltip title="Refresh data">
                  <Button
                    type="default"
                    shape="circle"
                    icon={<ReloadOutlined />}
                    onClick={handleRefresh}
                    size="middle"
                  />
                </Tooltip>
                <Button
                  type="primary"
                  shape="circle"
                  icon={<PlusOutlined />}
                  onClick={handleCreateReport}
                  size="middle"
                  style={{
                    background:
                      "linear-gradient(135deg, #091838 0%, #061129 100%)",
                    borderColor: "#061129",
                    color: "#ffffff",
                  }}
                />
              </div>
            </MobileNavBar>
          )}

          <ContentCanvas>
            {/* MAIN HEADER CARD */}
            <MainHeaderCard>
              <HeaderTitleWrapper>
                <div className="title-icon-badge">
                  <FileTextOutlined />
                </div>
                <div className="title-text-group">
                  <div className="title-heading-row">
                    <Title
                      level={isSmallMobile ? 4 : 3}
                      className="title-heading"
                    >
                      Student Evaluation Reports
                    </Title>
                    <Tooltip title="Evaluation records submitted for your assigned classes">
                      <InfoCircleOutlined
                        style={{
                          color: "#94a3b8",
                          fontSize: 14,
                          cursor: "pointer",
                        }}
                      />
                    </Tooltip>
                  </div>
                  <Text className="subtitle-text">
                    Review, filter, and record student performance assessments
                  </Text>
                </div>
              </HeaderTitleWrapper>

              <ActionGroup>
                <Tooltip title="Refresh data">
                  <Button
                    icon={<ReloadOutlined />}
                    onClick={handleRefresh}
                    size={isSmallMobile ? "middle" : "large"}
                    style={{
                      borderColor: "#cbd5e1",
                      color: "#475569",
                      borderRadius: 8,
                      height: isSmallMobile ? 38 : 40,
                    }}
                  >
                    {!isSmallMobile && "Refresh"}
                  </Button>
                </Tooltip>

                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleCreateReport}
                  size={isSmallMobile ? "middle" : "large"}
                  style={{
                    background:
                      "linear-gradient(135deg, #091838 0%, #061129 100%)",
                    borderColor: "#061129",
                    color: "#ffffff",
                    fontWeight: 600,
                    borderRadius: 8,
                    boxShadow: "0 4px 12px rgba(6, 17, 41, 0.18)",
                    flex: isMobile ? 1 : "initial",
                    height: isSmallMobile ? 38 : 40,
                  }}
                >
                  {isSmallMobile ? "New Report" : "Create New Report"}
                </Button>
              </ActionGroup>
            </MainHeaderCard>

            {/* EVALUATION REPORT LIST */}
            <ReportList
              teacherId={teacherId}
              refresh={refreshReports}
              isMobile={isMobile}
            />

            {/* MODAL: CREATE REPORT */}
            <ReportFormModal
              visible={isModalVisible}
              onCancel={() => setIsModalVisible(false)}
              onSuccess={handleReportSubmitted}
              teacherId={teacherId}
              isMobile={isMobile}
            />
          </ContentCanvas>
        </ContentLayout>
      </PageContainer>
    </ConfigProvider>
  );
};

export default StudentReportSection;