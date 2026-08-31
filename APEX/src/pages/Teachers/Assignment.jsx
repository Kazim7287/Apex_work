/* eslint-disable no-unused-vars */
import { useState } from "react";
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
import Sidebar from "./Sidebar";
import ReportList from "./ReportList";
import ReportFormModal from "./ReportFormModal";
import {
  PlusOutlined,
  FileTextOutlined,
  MenuOutlined,
  ReloadOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import styled from "styled-components";

const { Content } = Layout;
const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

const OuterLayout = styled(Layout)`
  min-height: 100vh;
  background-color: #f8fafc !important; /* Forces light canvas globally */
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

const ActionGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;

  @media (max-width: 768px) {
    width: 100%;
    justify-content: flex-end;
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

const StudentReportSection = () => {
  const [refreshReports, setRefreshReports] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const teacherId = localStorage.getItem("teacher_id");
  const screens = useBreakpoint();
  const isMobile = !screens.md;

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
      <OuterLayout style={{ flexDirection: "row" }}>
        {/* SIDEBAR COMPONENT */}
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
          <Sidebar
            collapsed={sidebarCollapsed}
            onCollapse={setSidebarCollapsed}
          />
        )}

        {/* MAIN PAGE CANVAS */}
        <Layout style={{ background: "#f8fafc", minHeight: "100vh" }}>
          <ContentCanvas>
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
                  <FileTextOutlined />
                </div>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Title
                      level={isMobile ? 4 : 3}
                      style={{ margin: 0, color: "#0f172a", fontWeight: 700 }}
                    >
                      Student Evaluation Reports
                    </Title>
                    <Tooltip title="Evaluation records submitted for your assigned classes">
                      <InfoCircleOutlined
                        style={{ color: "#94a3b8", fontSize: 14 }}
                      />
                    </Tooltip>
                  </div>
                  <Text style={{ color: "#64748b", fontSize: isMobile ? 11 : 13 }}>
                    Review, filter, and record student performance assessments
                  </Text>
                </div>
              </HeaderTitleWrapper>

              <ActionGroup>
                <Tooltip title="Refresh data">
                  <Button
                    icon={<ReloadOutlined />}
                    onClick={handleRefresh}
                    style={{
                      borderColor: "#cbd5e1",
                      color: "#475569",
                      borderRadius: 8,
                    }}
                  />
                </Tooltip>

                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleCreateReport}
                  size={isMobile ? "middle" : "large"}
                  style={{
                    background:
                      "linear-gradient(135deg, #091838 0%, #061129 100%)",
                    borderColor: "#061129",
                    color: "#ffffff",
                    fontWeight: 600,
                    borderRadius: 8,
                    boxShadow: "0 4px 12px rgba(6, 17, 41, 0.18)",
                  }}
                >
                  {isMobile ? "New Report" : "Create New Report"}
                </Button>
              </ActionGroup>
            </MainHeaderCard>

            <ReportList
              teacherId={teacherId}
              refresh={refreshReports}
              isMobile={isMobile}
            />

            <ReportFormModal
              visible={isModalVisible}
              onCancel={() => setIsModalVisible(false)}
              onSuccess={handleReportSubmitted}
              teacherId={teacherId}
              isMobile={isMobile}
            />
          </ContentCanvas>
        </Layout>
      </OuterLayout>
    </ConfigProvider>
  );
};

export default StudentReportSection;