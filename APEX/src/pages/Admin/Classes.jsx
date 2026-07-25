import { useState, useEffect } from 'react';
import { 
  Input, 
  Button, 
  message, 
  Spin, 
  Modal, 
  Form, 
  Row, 
  Col, 
  Card,
  Typography,
  Layout,
  Empty,
  Grid,
  Drawer,
  Space,
  Divider
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  LoadingOutlined,
  MenuOutlined,
  CloseOutlined
} from '@ant-design/icons';
import Sidebar from './Sidebar';

const { Content: AntContent } = Layout;
const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

const Classes = () => {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [updateModalVisible, setUpdateModalVisible] = useState(false);
  const [currentSection, setCurrentSection] = useState(null);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [addForm] = Form.useForm();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarVisible, setMobileSidebarVisible] = useState(false);
  
  const screens = useBreakpoint();
  const isMobile = !screens.md;
  const isSmallMobile = !screens.sm;

  // Fetch sections with credentials
  const fetchSections = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/Sec_Read.php', {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      
      const data = await response.json();

      if (data.error) {
        message.error(data.error);
      } else if (data.message) {
        message.info(data.message);
        setSections([]);
      } else {
        setSections(data);
      }
    } catch (error) {
      message.error('Failed to fetch sections');
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSections();
  }, []);

  // Add a section with credentials
  const handleSubmit = async (values) => {
    try {
      setSubmitLoading(true);
      const response = await fetch('https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/Sections.php', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ name: values.sectionName }),
      });
      
      const result = await response.json();

      if (result.error) {
        message.error(result.error);
      } else {
        message.success(result.message);
        addForm.resetFields();
        setSections(prev => [...prev, { id: result.id, name: values.sectionName }]);
      }
    } catch (error) {
      console.error('Submission error:', error);
      message.error('Failed to add section');
    } finally {
      setSubmitLoading(false);
    }
  };

  // Delete a section with credentials
  const handleDelete = async (id) => {
    Modal.confirm({
      title: 'Are you sure you want to delete this section?',
      content: 'This action cannot be undone.',
      okText: 'Yes, Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          const response = await fetch(`https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/Sect_Delet.php?id=${id}`, {
            method: 'DELETE',
            credentials: 'include'
          });
          
          const result = await response.json();

          if (result.error) {
            message.error(result.error);
          } else {
            message.success(result.message);
            setSections(prev => prev.filter(section => section.id !== id));
          }
        } catch (error) {
          console.error('Deletion error:', error);
          message.error('Failed to delete section');
        }
      },
    });
  };

  // Update a section with credentials
  const handleUpdate = async () => {
    try {
      if (!currentSection?.name || !currentSection?.id) {
        message.error('Section name and ID are required');
        return;
      }

      setUpdateLoading(true);
      const response = await fetch('https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/Sec_Update.php', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          id: currentSection.id,
          name: currentSection.name
        }),
      });
      
      const result = await response.json();

      if (result.error) {
        message.error(result.error);
      } else {
        message.success(result.message);
        setUpdateModalVisible(false);
        setSections(prev => 
          prev.map(section => 
            section.id === currentSection.id ? { ...section, name: currentSection.name } : section
          )
        );
      }
    } catch (error) {
      console.error('Update error:', error);
      message.error('Failed to update section');
    } finally {
      setUpdateLoading(false);
    }
  };

  // Mobile sidebar toggle
  const toggleMobileSidebar = () => {
    setMobileSidebarVisible(!mobileSidebarVisible);
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* Desktop Sidebar */}
      {!isMobile && (
        <Sidebar 
          collapsed={sidebarCollapsed} 
          onCollapse={setSidebarCollapsed}
        />
      )}
      
      {/* Mobile Sidebar Drawer */}
      {isMobile && (
        <Drawer
          title="Menu"
          placement="left"
          onClose={() => setMobileSidebarVisible(false)}
          open={mobileSidebarVisible}
          width={250}
          bodyStyle={{ padding: 0 }}
          closeIcon={<CloseOutlined />}
        >
          <Sidebar 
            collapsed={false} 
            onCollapse={() => {}}
            mobileMode={true}
          />
        </Drawer>
      )}
      
      <AntContent 
        style={{ 
          padding: isSmallMobile ? '12px' : (isMobile ? '16px' : '24px'),
          marginLeft: isMobile ? 0 : (sidebarCollapsed ? 80 : 200),
          transition: 'all 0.2s',
          background: '#f5f7fa',
          minHeight: '100vh'
        }}
      >
        {/* Mobile Header */}
        {isMobile && (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            marginBottom: 16,
            padding: '12px 16px',
            background: '#fff',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.09)'
          }}>
            <Button 
              icon={<MenuOutlined />} 
              onClick={toggleMobileSidebar}
              style={{ marginRight: 12 }}
              type="text"
            />
            <Title level={4} style={{ margin: 0, fontSize: isSmallMobile ? '16px' : '18px' }}>
              Class Sections
            </Title>
          </div>
        )}
        
        <Card
          title={!isMobile && <Title level={2} style={{ margin: 0, fontSize: isSmallMobile ? '18px' : '24px' }}>Class Sections</Title>}
          bordered={false}
          style={{ 
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
            borderRadius: '8px'
          }}
          bodyStyle={{ padding: isSmallMobile ? '12px' : (isMobile ? '16px' : '24px') }}
        >
          <Form
            form={addForm}
            layout={isMobile ? "vertical" : "inline"}
            onFinish={handleSubmit}
            style={{ marginBottom: '24px' }}
          >
            <Form.Item
              name="sectionName"
              rules={[{ required: true, message: 'Please input section name!' }]}
              style={isMobile ? { marginBottom: 12 } : { flex: 1, marginRight: 8 }}
            >
              <Input
                placeholder="Enter Section Name"
                style={{ width: '100%' }}
                size={isSmallMobile ? 'small' : 'middle'}
              />
            </Form.Item>
            <Form.Item style={isMobile ? { marginBottom: 0 } : {}}>
              <Button
                type="primary"
                htmlType="submit"
                loading={submitLoading}
                icon={<PlusOutlined />}
                size={isSmallMobile ? 'small' : 'middle'}
                block={isMobile}
              >
                {isMobile ? 'Add' : 'Add Section'}
              </Button>
            </Form.Item>
          </Form>

          <Divider style={{ margin: isMobile ? '16px 0' : '24px 0' }} />

          {loading ? (
            <div style={{ textAlign: 'center', padding: isMobile ? '32px 16px' : '48px 24px' }}>
              <Spin 
                indicator={<LoadingOutlined style={{ fontSize: isMobile ? 24 : 32 }} spin />} 
                size={isMobile ? "default" : "large"}
              />
              <div style={{ marginTop: 16 }}>
                <Text type="secondary">Loading sections...</Text>
              </div>
            </div>
          ) : sections.length === 0 ? (
            <Empty 
              description="No sections found" 
              imageStyle={{ 
                height: isMobile ? 80 : 120,
                marginBottom: isMobile ? 8 : 16
              }}
            >
              <Button 
                type="primary" 
                onClick={() => addForm.submit()}
                icon={<PlusOutlined />}
                size={isSmallMobile ? 'small' : 'middle'}
              >
                Add First Section
              </Button>
            </Empty>
          ) : (
            <Row gutter={[isSmallMobile ? 8 : 16, isSmallMobile ? 8 : 16]}>
              {sections.map((section) => (
                <Col 
                  xs={24} 
                  sm={12} 
                  md={8} 
                  lg={6} 
                  key={section.id}
                >
                  <Card
                    hoverable
                    size="small"
                    style={{ 
                      height: '100%',
                      borderRadius: '8px'
                    }}
                    bodyStyle={{ 
                      padding: isSmallMobile ? '12px' : '16px'
                    }}
                    actions={[
                      <EditOutlined 
                        key="edit" 
                        onClick={() => {
                          setCurrentSection(section);
                          setUpdateModalVisible(true);
                        }} 
                        style={{ fontSize: isSmallMobile ? '14px' : '16px' }}
                      />,
                      <DeleteOutlined 
                        key="delete" 
                        onClick={() => handleDelete(section.id)} 
                        style={{ fontSize: isSmallMobile ? '14px' : '16px', color: '#ff4d4f' }}
                      />,
                    ]}
                  >
                    <Card.Meta
                      title={
                        <Text 
                          strong 
                          style={{ 
                            fontSize: isSmallMobile ? '14px' : '16px',
                            display: 'block',
                            marginBottom: '4px'
                          }}
                        >
                          {section.name}
                        </Text>
                      }
                      description={
                        <Text 
                          type="secondary" 
                          style={{ fontSize: isSmallMobile ? '11px' : '12px' }}
                        >
                          ID: {section.id}
                        </Text>
                      }
                    />
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </Card>

        <Modal
          title="Update Section"
          open={updateModalVisible}
          onOk={handleUpdate}
          onCancel={() => setUpdateModalVisible(false)}
          confirmLoading={updateLoading}
          okText="Update"
          cancelText="Cancel"
          width={isMobile ? '90%' : 520}
          bodyStyle={{ padding: isMobile ? '16px' : '24px' }}
        >
          <Form layout="vertical">
            <Form.Item label="Section Name">
              <Input
                value={currentSection?.name || ''}
                onChange={(e) =>
                  setCurrentSection(prev => ({ ...prev, name: e.target.value }))
                }
                size={isSmallMobile ? 'small' : 'middle'}
                placeholder="Enter section name"
              />
            </Form.Item>
          </Form>
        </Modal>
      </AntContent>
    </Layout>
  );
};

export default Classes;