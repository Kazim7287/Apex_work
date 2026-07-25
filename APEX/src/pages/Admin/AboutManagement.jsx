import React, { useState, useEffect } from 'react';
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
  Divider,
  Typography,
  Space,
  Spin,
  Popconfirm,
  InputNumber
} from 'antd';
import { 
  UploadOutlined, 
  DeleteOutlined, 
  EditOutlined,
  PlusOutlined,
  LoadingOutlined,
  EyeOutlined,
  CloseOutlined,
  CheckOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { TextArea } = Input;

const AboutManagement = () => {
  const [form] = Form.useForm();
  const [sections, setSections] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentSection, setCurrentSection] = useState(null);
  const [fileList, setFileList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [imageLoading, setImageLoading] = useState({});
  const [viewingImage, setViewingImage] = useState(null);
  const [editingImage, setEditingImage] = useState(null);
  const [tempImageUrl, setTempImageUrl] = useState('');

  // Base URL for images
  const BASE_IMAGE_URL = 'https://white-trout-460511.hostingersite.com/APEX/';

  useEffect(() => {
    fetchSections();
  }, []);

  const fetchSections = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/get_about_sections.php');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.status === 'success') {
        const apiSections = data.data || [];
        
        const sectionsWithImages = await Promise.all(
          apiSections.map(async (section) => {
            try {
              const imagesResponse = await fetch(`https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/imagesread.php?section_id=${section.id}`);
              if (imagesResponse.ok) {
                const imagesData = await imagesResponse.json();
                
                // Add full_image_url to each image
                const imagesWithFullUrl = imagesData.status === 'success' 
                  ? imagesData.data.map(img => ({
                      ...img,
                      full_image_url: img.full_image_url || `${BASE_IMAGE_URL}${img.image_path}`
                    }))
                  : [];
                
                return {
                  ...section,
                  images: imagesWithFullUrl
                };
              }
              return section;
            } catch (error) {
              console.error(`Error fetching images for section ${section.id}:`, error);
              return section;
            }
          })
        );
        
        setSections(sectionsWithImages);
      } else {
        message.error(data.message || 'Failed to fetch sections');
        setSections([]);
      }
    } catch (error) {
      console.error('Error fetching sections:', error);
      message.error('Failed to load sections. Please try again later.');
      setSections([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values) => {
    try {
      const url = currentSection 
        ? `https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/updateabout.php?id=${currentSection.id}`
        : 'https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/add_about_section.php';

      const method = currentSection ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: values.title,
          description: values.description
        }),
      });

      const data = await response.json();
      
      if (data.status === 'success') {
        const sectionId = data.id || currentSection?.id;
        
        const newFiles = fileList.filter(file => file.originFileObj);
        if (newFiles.length > 0) {
          setUploading(true);
          const imageFormData = new FormData();
          newFiles.forEach(file => {
            imageFormData.append('images[]', file.originFileObj);
          });
          
          const imageResponse = await fetch(`https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/imagupload.php?section_id=${sectionId}`, {
            method: 'POST',
            body: imageFormData,
          });
          
          const imageData = await imageResponse.json();
          if (imageData.status !== 'success') {
            throw new Error('Section saved but image upload failed');
          }
        }

        message.success(currentSection ? 'Section updated successfully!' : 'Section added successfully!');
        setIsModalVisible(false);
        form.resetFields();
        setFileList([]);
        await fetchSections();
      } else {
        throw new Error(data.message || 'Operation failed');
      }
    } catch (error) {
      console.error('Submission error:', error);
      message.error(`Failed: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (section) => {
    setCurrentSection(section);
    form.setFieldsValue({
      title: section.title,
      description: section.description
    });
    
    const existingImages = section.images?.map((img, index) => ({
      uid: `existing-${index}-${img.id || index}`,
      name: img.image_path.split('/').pop(),
      status: 'done',
      url: img.full_image_url || `${BASE_IMAGE_URL}${img.image_path}`,
      id: img.id
    })) || [];
    
    setFileList(existingImages);
    setIsModalVisible(true);
  };

  const handleDeleteSection = async (id) => {
    try {
      const response = await fetch(`https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/delete_about_section.php?id=${id}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (data.status === 'success') {
        message.success('Section deleted successfully!');
        setSections(sections.filter(section => section.id !== id));
      } else {
        message.error(data.message || 'Failed to delete section');
      }
    } catch (error) {
      console.error('Error deleting section:', error);
      message.error('Network error while deleting section');
    }
  };

  const handleDeleteImage = async (imageId, sectionId) => {
    try {
      setImageLoading(prev => ({ ...prev, [imageId]: true }));
      
      const response = await fetch('https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/imagedelete.php', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image_id: imageId })
      });
      
      const data = await response.json();
      
      if (data.status === 'success') {
        message.success('Image deleted successfully!');
        setSections(sections.map(section => {
          if (section.id === sectionId) {
            return {
              ...section,
              images: section.images.filter(img => img.id !== imageId)
            };
          }
          return section;
        }));
      } else {
        message.error(data.message || 'Failed to delete image');
      }
    } catch (error) {
      console.error('Error deleting image:', error);
      message.error('Network error while deleting image');
    } finally {
      setImageLoading(prev => ({ ...prev, [imageId]: false }));
    }
  };

  const handleUpdateImage = async () => {
    try {
      const response = await fetch('https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/imageupdate.php', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image_id: editingImage.id,
          image_order: editingImage.image_order,
          image_path: tempImageUrl.replace(BASE_IMAGE_URL, '') // Remove base URL before saving
        })
      });
      
      const data = await response.json();
      
      if (data.status === 'success') {
        message.success('Image updated successfully!');
        setSections(sections.map(section => {
          if (section.id === editingImage.section_id) {
            return {
              ...section,
              images: section.images.map(img => 
                img.id === editingImage.id 
                  ? { 
                      ...img, 
                      image_path: tempImageUrl.replace(BASE_IMAGE_URL, ''),
                      full_image_url: tempImageUrl,
                      image_order: editingImage.image_order 
                    }
                  : img
              )
            };
          }
          return section;
        }));
        
        setEditingImage(null);
        setTempImageUrl('');
      } else {
        message.error(data.message || 'Failed to update image');
      }
    } catch (error) {
      console.error('Error updating image:', error);
      message.error('Network error while updating image');
    }
  };

  const beforeUpload = (file) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('You can only upload image files!');
      return Upload.LIST_IGNORE;
    }
    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      message.error('Image must be smaller than 5MB!');
      return Upload.LIST_IGNORE;
    }
    return false;
  };

  const handleUploadChange = ({ fileList: newFileList }) => {
    setFileList(newFileList);
  };

  return (
    <div style={{ padding: '24px' }}>
      <Card
        title={<Title level={4}>About Page Content</Title>}
        extra={
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => {
              setCurrentSection(null);
              setIsModalVisible(true);
              form.resetFields();
              setFileList([]);
            }}
          >
            Add New Section
          </Button>
        }
      >
        {loading ? (
          <div style={{ textAlign: 'center', padding: '24px' }}>
            <Spin size="large" />
          </div>
        ) : (
          <Row gutter={[16, 16]}>
            {sections.length > 0 ? (
              sections.map(section => (
                <Col xs={24} key={section.id}>
                  <Card
                    title={section.title}
                    extra={
                      <Space>
                        <Button 
                          icon={<EditOutlined />} 
                          onClick={() => handleEdit(section)}
                        />
                        <Popconfirm
                          title="Are you sure to delete this section?"
                          onConfirm={() => handleDeleteSection(section.id)}
                          okText="Yes"
                          cancelText="No"
                        >
                          <Button danger icon={<DeleteOutlined />} />
                        </Popconfirm>
                      </Space>
                    }
                  >
                    <Text>{section.description}</Text>
                    {section.images?.length > 0 && (
                      <>
                        <Divider />
                        <Title level={5}>Section Images</Title>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          {section.images.map((img, index) => (
                            <div key={img.id} style={{ position: 'relative' }}>
                              {viewingImage?.id === img.id ? (
                                <div style={{ 
                                  position: 'relative',
                                  width: 300,
                                  height: 200,
                                  border: '1px solid #f0f0f0',
                                  borderRadius: '4px',
                                  padding: '8px',
                                  backgroundColor: '#f9f9f9'
                                }}>
                                  <Image
                                    src={img.full_image_url || `${BASE_IMAGE_URL}${img.image_path}`}
                                    style={{ 
                                      width: '100%',
                                      height: '100%',
                                      objectFit: 'contain'
                                    }}
                                  />
                                  <Button 
                                    type="text"
                                    icon={<CloseOutlined />}
                                    style={{ 
                                      position: 'absolute',
                                      top: 4,
                                      right: 4
                                    }}
                                    onClick={() => setViewingImage(null)}
                                  />
                                </div>
                              ) : (
                                <>
                                  <Image
                                    src={img.full_image_url || `${BASE_IMAGE_URL}${img.image_path}`}
                                    width={100}
                                    height={100}
                                    style={{ 
                                      objectFit: 'cover', 
                                      borderRadius: '4px',
                                      border: '1px solid #f0f0f0'
                                    }}
                                    preview={false}
                                    onClick={() => setViewingImage(img)}
                                  />
                                  
                                  {editingImage?.id === img.id ? (
                                    <div style={{
                                      position: 'absolute',
                                      top: 0,
                                      left: 0,
                                      right: 0,
                                      bottom: 0,
                                      backgroundColor: 'rgba(255,255,255,0.9)',
                                      padding: '8px',
                                      display: 'flex',
                                      flexDirection: 'column',
                                      gap: '8px'
                                    }}>
                                      <Input
                                        value={tempImageUrl}
                                        onChange={(e) => setTempImageUrl(e.target.value)}
                                        placeholder="New image URL"
                                        addonBefore={BASE_IMAGE_URL}
                                      />
                                      <InputNumber
                                        value={editingImage.image_order}
                                        onChange={(value) => setEditingImage({
                                          ...editingImage,
                                          image_order: value
                                        })}
                                        min={1}
                                        placeholder="Order"
                                      />
                                      <Space>
                                        <Button 
                                          type="primary" 
                                          size="small"
                                          icon={<CheckOutlined />}
                                          onClick={handleUpdateImage}
                                        />
                                        <Button 
                                          size="small"
                                          icon={<CloseOutlined />}
                                          onClick={() => {
                                            setEditingImage(null);
                                            setTempImageUrl('');
                                          }}
                                        />
                                      </Space>
                                    </div>
                                  ) : (
                                    <div style={{ 
                                      position: 'absolute', 
                                      top: 4, 
                                      right: 4,
                                      display: 'flex',
                                      gap: '4px'
                                    }}>
                                      <Button 
                                        size="small" 
                                        icon={<EditOutlined />}
                                        onClick={() => {
                                          setEditingImage(img);
                                          setTempImageUrl(img.full_image_url || `${BASE_IMAGE_URL}${img.image_path}`);
                                        }}
                                      />
                                      <Popconfirm
                                        title="Are you sure to delete this image?"
                                        onConfirm={() => handleDeleteImage(img.id, section.id)}
                                        okText="Yes"
                                        cancelText="No"
                                      >
                                        <Button 
                                          danger 
                                          size="small" 
                                          icon={imageLoading[img.id] ? <LoadingOutlined /> : <DeleteOutlined />}
                                          disabled={imageLoading[img.id]}
                                        />
                                      </Popconfirm>
                                    </div>
                                  )}
                                  <div style={{ 
                                    textAlign: 'center',
                                    marginTop: '4px',
                                    fontSize: '12px'
                                  }}>
                                    Order: {img.image_order}
                                  </div>
                                </>
                              )}
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </Card>
                </Col>
              ))
            ) : (
              <Col span={24}>
                <div style={{ textAlign: 'center', padding: '24px' }}>
                  <Text type="secondary">No sections found. Add a new section to get started.</Text>
                </div>
              </Col>
            )}
          </Row>
        )}
      </Card>

      <Modal
        title={currentSection ? 'Edit Section' : 'Add New Section'}
        visible={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
          setFileList([]);
        }}
        footer={null}
        destroyOnClose
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="title"
            label="Title"
            rules={[
              { required: true, message: 'Please input the title!' },
              { min: 3, message: 'Title must be at least 3 characters' }
            ]}
          >
            <Input placeholder="Enter section title" />
          </Form.Item>
          
          <Form.Item
            name="description"
            label="Description"
            rules={[
              { required: true, message: 'Please input the description!' },
              { min: 10, message: 'Description must be at least 10 characters' }
            ]}
          >
            <TextArea rows={4} placeholder="Enter section description" />
          </Form.Item>
          
          <Form.Item label="Images (Optional)">
            <Upload
              listType="picture-card"
              fileList={fileList}
              beforeUpload={beforeUpload}
              onChange={handleUploadChange}
              multiple
              maxCount={5}
              accept="image/*"
            >
              {fileList.length >= 5 ? null : (
                <div>
                  <PlusOutlined />
                  <div style={{ marginTop: 8 }}>Upload</div>
                </div>
              )}
            </Upload>
            <Text type="secondary">Max 5 images (JPEG, PNG, WEBP), 5MB each</Text>
          </Form.Item>
          
          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit"
              loading={uploading}
              disabled={uploading}
            >
              {currentSection ? 'Update' : 'Add'}
            </Button>
            <Button 
              style={{ marginLeft: '8px' }}
              onClick={() => {
                setIsModalVisible(false);
                form.resetFields();
                setFileList([]);
              }}
              disabled={uploading}
            >
              Cancel
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AboutManagement;