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
  Empty,
  Space,
  Tag,
  Popconfirm,
  Tooltip
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  LoadingOutlined,
  BookOutlined,
  TeamOutlined,
  ReloadOutlined,
  SearchOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;

const Classes = () => {
  const [sections, setSections] = useState([]);
  const [filteredSections, setFilteredSections] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [updateModalVisible, setUpdateModalVisible] = useState(false);
  const [currentSection, setCurrentSection] = useState(null);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [addForm] = Form.useForm();

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
        setFilteredSections([]);
      } else {
        const secs = Array.isArray(data) ? data : [];
        setSections(secs);
        setFilteredSections(secs);
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

  const handleSearch = (value) => {
    setSearchText(value);
    if (!value.trim()) {
      setFilteredSections(sections);
    } else {
      const query = value.toLowerCase();
      setFilteredSections(sections.filter(s => 
        s.name.toLowerCase().includes(query) || 
        String(s.id).includes(query)
      ));
    }
  };

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
        message.success(result.message || 'Section added successfully');
        addForm.resetFields();
        fetchSections();
      }
    } catch (error) {
      message.error('Failed to add section');
    } finally {
      setSubmitLoading(false);
    }
  };

  // Delete a section with credentials
  const handleDelete = async (id) => {
    try {
      const response = await fetch('https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/sec_del.php', {
        method: 'DELETE',
        headers: { 
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ id }),
      });
      
      const result = await response.json();

      if (result.error) {
        message.error(result.error);
      } else {
        message.success(result.message || 'Section deleted successfully');
        fetchSections();
      }
    } catch (error) {
      message.error('Failed to delete section');
    }
  };

  // Update section name
  const handleUpdate = async () => {
    if (!currentSection || !currentSection.name.trim()) {
      message.error('Section name cannot be empty');
      return;
    }

    try {
      setUpdateLoading(true);
      const response = await fetch('https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/sec_update.php', {
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
        message.success(result.message || 'Section updated successfully');
        setUpdateModalVisible(false);
        fetchSections();
      }
    } catch (error) {
      message.error('Failed to update section');
    } finally {
      setUpdateLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto' }}>
      <Card
        className="apex-card"
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: 'linear-gradient(135deg, #0b1b3d 0%, #1e3a8a 100%)', color: '#d4af37', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
              <BookOutlined />
            </div>
            <div>
              <Title level={4} style={{ margin: 0, color: '#0b1b3d', fontWeight: 700 }}>
                Class Sections & Academic Wings
              </Title>
              <Text style={{ color: '#64748b', fontSize: 12 }}>Create and manage student section groups</Text>
            </div>
          </div>
        }
        extra={
          <Space wrap>
            <Input
              placeholder="Search section..."
              prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
              value={searchText}
              onChange={(e) => handleSearch(e.target.value)}
              allowClear
              style={{ width: 200, borderRadius: 8 }}
            />
            <Button 
              type="text" 
              icon={<ReloadOutlined />} 
              onClick={fetchSections}
              loading={loading}
              style={{ borderRadius: 8 }}
            />
          </Space>
        }
      >
        {/* Add Section Form Bar */}
        <Card size="small" style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, marginBottom: 24 }}>
          <Form
            form={addForm}
            layout="inline"
            onFinish={handleSubmit}
            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12 }}
          >
            <Form.Item
              name="sectionName"
              rules={[{ required: true, message: 'Please input section name!' }]}
              style={{ flex: 1, margin: 0 }}
            >
              <Input
                placeholder="Enter new Section Name (e.g. Pre-Engineering A, Computer Science B)"
                prefix={<TeamOutlined style={{ color: '#1e3a8a' }} />}
                style={{ borderRadius: 8 }}
              />
            </Form.Item>
            <Form.Item style={{ margin: 0 }}>
              <Button
                type="primary"
                htmlType="submit"
                loading={submitLoading}
                icon={<PlusOutlined />}
                className="apex-btn-gold"
                style={{ display: 'flex', alignItems: 'center' }}
              >
                Add Section
              </Button>
            </Form.Item>
          </Form>
        </Card>

        {/* Section Cards Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <Spin indicator={<LoadingOutlined style={{ fontSize: 36, color: '#0b1b3d' }} spin />} />
            <div style={{ marginTop: 16 }}>
              <Text style={{ color: '#64748b' }}>Loading class sections...</Text>
            </div>
          </div>
        ) : filteredSections.length === 0 ? (
          <Empty 
            description="No class sections found" 
            style={{ margin: '40px 0' }}
          >
            <Button type="primary" onClick={() => addForm.submit()} icon={<PlusOutlined />} className="apex-btn-gold">
              Add First Section
            </Button>
          </Empty>
        ) : (
          <Row gutter={[16, 16]}>
            {filteredSections.map((section) => (
              <Col xs={24} sm={12} md={8} lg={6} key={section.id}>
                <Card
                  hoverable
                  className="apex-card"
                  bodyStyle={{ padding: 18 }}
                  style={{ borderTop: '3px solid #d4af37', height: '100%' }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                    <Tag color="navy" style={{ background: '#0b1b3d', color: '#d4af37', border: '1px solid rgba(212, 175, 55, 0.3)', borderRadius: 6, fontWeight: 700 }}>
                      ID #{section.id}
                    </Tag>
                    <Space size="small">
                      <Tooltip title="Edit Section">
                        <Button 
                          type="text" 
                          icon={<EditOutlined style={{ color: '#1e3a8a' }} />} 
                          onClick={() => {
                            setCurrentSection(section);
                            setUpdateModalVisible(true);
                          }}
                          style={{ borderRadius: 6, background: '#f1f5f9' }}
                        />
                      </Tooltip>
                      <Popconfirm
                        title="Delete Section"
                        description="Are you sure to delete this section?"
                        onConfirm={() => handleDelete(section.id)}
                        okText="Yes, Delete"
                        cancelText="Cancel"
                        okButtonProps={{ danger: true }}
                      >
                        <Tooltip title="Delete Section">
                          <Button 
                            type="text" 
                            danger 
                            icon={<DeleteOutlined />} 
                            style={{ borderRadius: 6, background: '#fef2f2' }}
                          />
                        </Tooltip>
                      </Popconfirm>
                    </Space>
                  </div>

                  <Title level={4} style={{ margin: 0, color: '#0b1b3d', fontWeight: 700 }}>
                    Section {section.name}
                  </Title>
                  <Text style={{ color: '#64748b', fontSize: 12, display: 'block', marginTop: 4 }}>
                    Academic Wing / Group
                  </Text>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Card>

      {/* Edit Section Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <BookOutlined style={{ color: '#d4af37' }} />
            <span>Update Section Name</span>
          </div>
        }
        open={updateModalVisible}
        onOk={handleUpdate}
        onCancel={() => setUpdateModalVisible(false)}
        confirmLoading={updateLoading}
        okText="Update Section"
        cancelText="Cancel"
        okButtonProps={{ className: 'apex-btn-gold' }}
        centered
      >
        <Form layout="vertical" style={{ paddingTop: 12 }}>
          <Form.Item label={<Text strong style={{ color: '#0b1b3d' }}>Section Name</Text>}>
            <Input
              value={currentSection?.name || ''}
              onChange={(e) =>
                setCurrentSection(prev => ({ ...prev, name: e.target.value }))
              }
              placeholder="Enter section name"
              size="large"
              style={{ borderRadius: 8 }}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Classes;