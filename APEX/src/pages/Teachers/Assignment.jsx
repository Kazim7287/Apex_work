/* eslint-disable no-unused-vars */
import { useState, } from "react";
import { 
  Layout, 
  Button, 
  Row, 
  Col, 
  Typography, 
  Grid,

  Drawer,
  notification
} from "antd";
import Sidebar from "./Sidebar";
import ReportList from "./ReportList";
import ReportFormModal from "./ReportFormModal";
import { MenuOutlined } from '@ant-design/icons';

const { Content } = Layout;
const { Title } = Typography;
const { useBreakpoint } = Grid;

const StudentReportSection = () => {
  const [refreshReports, setRefreshReports] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const teacherId = localStorage.getItem('teacher_id');
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  const handleCreateReport = () => {
    setIsModalVisible(true);
    if (isMobile && isDrawerVisible) {
      setIsDrawerVisible(false);
    }
  };

  const handleReportSubmitted = () => {
    setRefreshReports(prev => !prev);
    setIsModalVisible(false);
    notification.success({
      message: 'Success',
      description: 'Report submitted successfully!'
    });
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <Layout style={{ minHeight: "100vh", overflowX: "hidden" }}>
      {isMobile ? (
        <Drawer
          title="Menu"
          placement="left"
          closable={true}
          onClose={() => setIsDrawerVisible(false)}
          visible={isDrawerVisible}
          width={200}
        >
          <Sidebar collapsed={false} isMobile={true} />
        </Drawer>
      ) : (
        <Sidebar collapsed={sidebarCollapsed} isMobile={false} />
      )}
      
      <Layout 
        style={{ 
          marginLeft: isMobile ? 0 : sidebarCollapsed ? 80 : 200,
          transition: 'all 0.2s'
        }}
      >
        <Content style={{ 
          padding: isMobile ? '12px' : '24px',
          maxWidth: '100vw',
          overflowX: 'hidden'
        }}>
          <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
            <Col>
              {isMobile && (
                <Button 
                  type="text" 
                  icon={<MenuOutlined />} 
                  onClick={() => setIsDrawerVisible(true)}
                  style={{ marginRight: 8 }}
                />
              )}
              <Title 
                level={isMobile ? 4 : 2} 
                style={{ margin: 0 }}
              >
                Student Evaluation Reports
              </Title>
            </Col>
            <Col>
              <Button 
                type="primary" 
                onClick={handleCreateReport}
                size={isMobile ? "middle" : "large"}
              >
                {isMobile ? 'New Report' : 'Create New Report'}
              </Button>
            </Col>
          </Row>

          <ReportList 
            teacherId={teacherId} 
            refresh={refreshReports} 
            isMobile={isMobile}
          />
        </Content>
      </Layout>

      <ReportFormModal
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onSuccess={handleReportSubmitted}
        teacherId={teacherId}
        isMobile={isMobile}
      />
    </Layout>
  );
};

export default StudentReportSection;