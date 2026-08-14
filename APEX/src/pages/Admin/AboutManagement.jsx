import React, { useEffect, useState } from 'react';
import {
  Card,
  Button,
  Form,
  Input,
  Upload,
  message,
  Row,
  Col,
  Image,
  Modal,
  Typography,
  Space,
  Spin,
  Popconfirm,
  Tooltip,
} from 'antd';
import {
  UploadOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  EyeOutlined,
  InfoCircleOutlined,
  ReloadOutlined,
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const API_BASE_URL =
  'https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX';

const BASE_IMAGE_URL =
  'https://white-trout-460511.hostingersite.com/APEX/';

const AboutManagement = () => {
  const [form] = Form.useForm();

  const [sections, setSections] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentSection, setCurrentSection] = useState(null);
  const [fileList, setFileList] = useState([]);

  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const [editingImage, setEditingImage] = useState(null);
  const [tempImageUrl, setTempImageUrl] = useState('');

  // --------------------------------------------------
  // Fetch sections
  // --------------------------------------------------

  useEffect(() => {
    fetchSections();
  }, []);

  const fetchSections = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        `${API_BASE_URL}/get_about_sections.php`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.status !== 'success') {
        message.error(data.message || 'Failed to fetch sections');
        setSections([]);
        return;
      }

      const apiSections = data.data || [];

      const sectionsWithImages = await Promise.all(
        apiSections.map(async (section) => {
          try {
            const imagesResponse = await fetch(
              `${API_BASE_URL}/imagesread.php?section_id=${section.id}`
            );

            if (!imagesResponse.ok) {
              return {
                ...section,
                images: [],
              };
            }

            const imagesData = await imagesResponse.json();

            const images =
              imagesData.status === 'success'
                ? (imagesData.data || []).map((img) => ({
                    ...img,
                    full_image_url:
                      img.full_image_url ||
                      `${BASE_IMAGE_URL}${img.image_path}`,
                  }))
                : [];

            return {
              ...section,
              images,
            };
          } catch (error) {
            console.error(
              `Error fetching images for section ${section.id}:`,
              error
            );

            return {
              ...section,
              images: [],
            };
          }
        })
      );

      setSections(sectionsWithImages);
    } catch (error) {
      console.error('Error fetching sections:', error);
      message.error('Failed to connect to the server');
      setSections([]);
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------
  // Create / Update section
  // --------------------------------------------------

  const handleCreateOrUpdateSection = async (values) => {
    try {
      setUploading(true);

      const formData = new FormData();

      if (currentSection) {
        formData.append('id', currentSection.id);
        formData.append('action', 'update');
      } else {
        formData.append('action', 'create');
      }

      formData.append('title', values.title);
      formData.append('content', values.content || '');

      if (
        fileList.length > 0 &&
        fileList[0].originFileObj
      ) {
        formData.append(
          'image',
          fileList[0].originFileObj
        );
      }

      const response = await fetch(
        `${API_BASE_URL}/aboutuspost.php`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error(
          `HTTP error! status: ${response.status}`
        );
      }

      const data = await response.json();

      if (data.status === 'success') {
        message.success(
          data.message ||
            (currentSection
              ? 'Section updated successfully'
              : 'Section created successfully')
        );

        closeModal();
        fetchSections();
      } else {
        message.error(
          data.message || 'Failed to save section'
        );
      }
    } catch (error) {
      console.error('Error saving section:', error);
      message.error(
        'An error occurred while saving the section'
      );
    } finally {
      setUploading(false);
    }
  };

  // --------------------------------------------------
  // Delete section
  // --------------------------------------------------

  const handleDeleteSection = async (id) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/delete_about_section.php?id=${id}`,
        {
          method: 'DELETE',
        }
      );

      const data = await response.json();

      if (data.status === 'success') {
        message.success(
          'Section deleted successfully'
        );

        fetchSections();
      } else {
        message.error(
          data.message || 'Failed to delete section'
        );
      }
    } catch (error) {
      console.error(
        'Error deleting section:',
        error
      );

      message.error(
        'An error occurred while deleting the section'
      );
    }
  };

  // --------------------------------------------------
  // Delete image
  // --------------------------------------------------

  const handleDeleteImage = async (imageId) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/delete_section_image.php?id=${imageId}`,
        {
          method: 'DELETE',
        }
      );

      const data = await response.json();

      if (data.status === 'success') {
        message.success('Image deleted successfully');
        fetchSections();
      } else {
        message.error(
          data.message || 'Failed to delete image'
        );
      }
    } catch (error) {
      console.error(
        'Error deleting image:',
        error
      );

      message.error(
        'Error deleting image'
      );
    }
  };

  // --------------------------------------------------
  // Update image URL
  // --------------------------------------------------

  const handleUpdateImage = async () => {
    if (
      !editingImage ||
      !tempImageUrl.trim()
    ) {
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/update_section_image.php`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: editingImage.id,
            image_path: tempImageUrl.trim(),
          }),
        }
      );

      const data = await response.json();

      if (data.status === 'success') {
        message.success(
          'Image URL updated successfully'
        );

        setEditingImage(null);
        setTempImageUrl('');

        fetchSections();
      } else {
        message.error(
          data.message ||
            'Failed to update image'
        );
      }
    } catch (error) {
      console.error(
        'Error updating image:',
        error
      );

      message.error(
        'Error updating image'
      );
    }
  };

  // --------------------------------------------------
  // Modal controls
  // --------------------------------------------------

  const openCreateModal = () => {
    setCurrentSection(null);
    form.resetFields();
    setFileList([]);
    setIsModalVisible(true);
  };

  const openEditModal = (section) => {
    setCurrentSection(section);

    form.setFieldsValue({
      title: section.title,
      content: section.content,
    });

    setFileList([]);
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setIsModalVisible(false);
    setCurrentSection(null);
    setFileList([]);
    form.resetFields();
  };

  // --------------------------------------------------
  // Render
  // --------------------------------------------------

  return (
    <div
      style={{
        maxWidth: 1400,
        margin: '0 auto',
        width: '100%',
      }}
    >
      <Card
        className="apex-card"
        title={
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <div
              style={{
                width: 38,
                height: 38,
                minWidth: 38,
                borderRadius: 10,
                background:
                  'linear-gradient(135deg, #0b1b3d 0%, #1e3a8a 100%)',
                color: '#d4af37',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 18,
              }}
            >
              <InfoCircleOutlined />
            </div>

            <div>
              <Title
                level={4}
                style={{
                  margin: 0,
                  color: '#0b1b3d',
                  fontWeight: 700,
                }}
              >
                Public Website "About Us" Content Management
              </Title>

              <Text
                style={{
                  color: '#64748b',
                  fontSize: 12,
                }}
              >
                Manage institute profile sections,
                history, mission, and media gallery
              </Text>
            </div>
          </div>
        }
        extra={
          <Space wrap>
            <Button
              type="text"
              icon={<ReloadOutlined />}
              onClick={fetchSections}
              loading={loading}
              style={{
                borderRadius: 8,
              }}
            />

            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={openCreateModal}
              className="apex-btn-gold"
            >
              Add New Section
            </Button>
          </Space>
        }
      >
        {loading ? (
          <div
            style={{
              textAlign: 'center',
              padding: '60px 0',
            }}
          >
            <Spin size="large" />

            <Text
              style={{
                display: 'block',
                marginTop: 12,
                color: '#64748b',
              }}
            >
              Loading about content sections...
            </Text>
          </div>
        ) : sections.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '60px 20px',
            }}
          >
            <Text type="secondary">
              No About Us sections found.
            </Text>

            <br />

            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={openCreateModal}
              style={{ marginTop: 16 }}
            >
              Create First Section
            </Button>
          </div>
        ) : (
          <Row gutter={[20, 20]}>
            {sections.map((section) => (
              <Col
                key={section.id}
                xs={24}
                md={12}
              >
                <Card
                  hoverable
                  className="apex-card"
                  title={
                    <Title
                      level={5}
                      style={{
                        margin: 0,
                        color: '#0b1b3d',
                      }}
                    >
                      {section.title}
                    </Title>
                  }
                  extra={
                    <Space size="small">
                      <Tooltip title="Edit Section">
                        <Button
                          type="text"
                          icon={
                            <EditOutlined
                              style={{
                                color: '#1e3a8a',
                              }}
                            />
                          }
                          onClick={() =>
                            openEditModal(section)
                          }
                          style={{
                            borderRadius: 6,
                            background: '#f1f5f9',
                          }}
                        />
                      </Tooltip>

                      <Popconfirm
                        title="Delete Section"
                        description="Are you sure you want to delete this section?"
                        onConfirm={() =>
                          handleDeleteSection(
                            section.id
                          )
                        }
                        okText="Yes"
                        cancelText="No"
                        okButtonProps={{
                          danger: true,
                        }}
                      >
                        <Tooltip title="Delete Section">
                          <Button
                            type="text"
                            danger
                            icon={
                              <DeleteOutlined />
                            }
                            style={{
                              borderRadius: 6,
                              background: '#fef2f2',
                            }}
                          />
                        </Tooltip>
                      </Popconfirm>
                    </Space>
                  }
                >
                  <Paragraph
                    style={{
                      color: '#334155',
                      minHeight: 60,
                      marginBottom: 0,
                    }}
                  >
                    {section.content ||
                      'No text content.'}
                  </Paragraph>

                  {section.images &&
                    section.images.length > 0 && (
                      <div
                        style={{
                          marginTop: 16,
                        }}
                      >
                        <Text
                          strong
                          style={{
                            color: '#0b1b3d',
                            display: 'block',
                            marginBottom: 8,
                            fontSize: 12,
                          }}
                        >
                          Section Images (
                          {section.images.length})
                        </Text>

                        <Row gutter={[8, 8]}>
                          {section.images.map(
                            (img) => (
                              <Col
                                key={img.id}
                                xs={12}
                                sm={8}
                              >
                                <div
                                  style={{
                                    position:
                                      'relative',
                                    borderRadius: 8,
                                    overflow:
                                      'hidden',
                                    border:
                                      '1px solid #cbd5e1',
                                  }}
                                >
                                  <Image
                                    src={
                                      img.full_image_url
                                    }
                                    alt="Section"
                                    style={{
                                      width: '100%',
                                      height: 90,
                                      objectFit:
                                        'cover',
                                    }}
                                    preview={{
                                      mask: (
                                        <EyeOutlined />
                                      ),
                                    }}
                                  />

                                  <div
                                    style={{
                                      position:
                                        'absolute',
                                      top: 4,
                                      right: 4,
                                      background:
                                        'rgba(0,0,0,0.6)',
                                      borderRadius: 4,
                                      padding: 4,
                                    }}
                                  >
                                    <Popconfirm
                                      title="Delete Image"
                                      description="Are you sure you want to delete this image?"
                                      onConfirm={() =>
                                        handleDeleteImage(
                                          img.id
                                        )
                                      }
                                      okText="Delete"
                                      cancelText="Cancel"
                                      okButtonProps={{
                                        danger: true,
                                      }}
                                    >
                                      <DeleteOutlined
                                        style={{
                                          color:
                                            '#ef4444',
                                          cursor:
                                            'pointer',
                                          fontSize: 12,
                                        }}
                                      />
                                    </Popconfirm>
                                  </div>
                                </div>
                              </Col>
                            )
                          )}
                        </Row>
                      </div>
                    )}
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Card>

      {/* Create / Edit Modal */}

      <Modal
        title={
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <InfoCircleOutlined
              style={{
                color: '#d4af37',
              }}
            />

            <span>
              {currentSection
                ? `Edit Section #${currentSection.id}`
                : 'Create About Section'}
            </span>
          </div>
        }
        open={isModalVisible}
        onCancel={closeModal}
        footer={null}
        width={600}
        centered
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateOrUpdateSection}
          style={{
            paddingTop: 12,
          }}
        >
          <Form.Item
            name="title"
            label={
              <Text strong>
                Section Title
              </Text>
            }
            rules={[
              {
                required: true,
                message:
                  'Enter section title',
              },
            ]}
          >
            <Input
              placeholder="e.g. Our Legacy & History"
              style={{
                borderRadius: 8,
              }}
            />
          </Form.Item>

          <Form.Item
            name="content"
            label={
              <Text strong>
                Section Content
              </Text>
            }
          >
            <TextArea
              rows={4}
              placeholder="Enter section body text"
              style={{
                borderRadius: 8,
              }}
            />
          </Form.Item>

          <Form.Item
            label={
              <Text strong>
                Section Image (Optional)
              </Text>
            }
          >
            <Upload
              beforeUpload={() => false}
              fileList={fileList}
              onChange={({ fileList: newFileList }) =>
                setFileList(newFileList)
              }
              maxCount={1}
              accept="image/*"
            >
              <Button
                icon={<UploadOutlined />}
                style={{
                  borderRadius: 8,
                }}
              >
                Select Image File
              </Button>
            </Upload>
          </Form.Item>

          <Button
            type="primary"
            htmlType="submit"
            loading={uploading}
            block
            className="apex-btn-gold"
            style={{
              height: 40,
              marginTop: 8,
            }}
          >
            {currentSection
              ? 'Save Changes'
              : 'Create Section'}
          </Button>
        </Form>
      </Modal>

      {/* Image URL editor */}
      <Modal
        title="Update Image URL"
        open={!!editingImage}
        onCancel={() => {
          setEditingImage(null);
          setTempImageUrl('');
        }}
        onOk={handleUpdateImage}
        okText="Update"
      >
        <Input
          value={tempImageUrl}
          onChange={(e) =>
            setTempImageUrl(e.target.value)
          }
          placeholder="Enter image URL"
        />
      </Modal>
    </div>
  );
};

export default AboutManagement;