import React, { useState, useEffect, useRef } from 'react';
import Sidebar from './Sidebar';
import { 
  Avatar,
  Button,
  Card,
  Col,
  Form,
  Input,
  Row,
  Space,
  Typography,
  message,
  Spin,
  Modal,
  Grid,
  Layout,
  Drawer,
  ConfigProvider,
  theme,
  Tooltip
} from 'antd';
import { 
  UserOutlined, 
  EditOutlined, 
  SaveOutlined, 
  CloseOutlined, 
  DeleteOutlined,
  MenuOutlined,
  CameraOutlined,
  PhoneOutlined,
  MailOutlined,
  IdcardOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import styled from 'styled-components';

const { Title, Text } = Typography;
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
    padding: 24px;

    @media (max-width: 576px) {
      padding: 16px 12px;
    }
  }
`;

const AvatarWrapper = styled.div`
  position: relative;
  display: inline-block;

  .avatar-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background: rgba(15, 23, 42, 0.45);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #ffffff;
    font-size: 20px;
    opacity: 0;
    transition: opacity 0.2s ease;
    cursor: pointer;
  }

  &:hover .avatar-overlay {
    opacity: ${(props) => (props.$isEditing ? 1 : 0)};
  }
`;

const InfoDisplayItem = styled.div`
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 10px 14px;
  color: #0f172a;
  font-size: 15px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 10px;
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

const TeacherProfileSection = () => {
  const [teacherInfo, setTeacherInfo] = useState({
    name: '',
    email: '',
    phone: '',
    profilePicture: null
  });
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ ...teacherInfo });
  const [form] = Form.useForm();
  const fileInputRef = useRef(null);
  const [updating, setUpdating] = useState(false);
  const [uploadingPicture, setUploadingPicture] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [hasExistingProfilePicture, setHasExistingProfilePicture] = useState(false);
  const [mobileSidebarVisible, setMobileSidebarVisible] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const screens = useBreakpoint();
  const isMobile = !screens.md;

  const formatImageUrl = (path) => {
    if (!path) return null;
    return `https://white-trout-460511.hostingersite.com/APEX/${path}?t=${Date.now()}`;
  };

  const fetchTeacherData = async () => {
    try {
      const teacherId = localStorage.getItem('teacher_id');
      if (!teacherId) {
        message.error('Teacher ID not found in localStorage');
        return;
      }

      const [profileRes, pictureRes] = await Promise.all([
        fetch(`https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/teach_profile.php?id=${teacherId}`),
        fetch(`https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/get_profilePicture.php?teacher_id=${teacherId}`)
      ]);

      const profileData = await profileRes.json();
      const pictureData = await pictureRes.json();

      const hasPicture = pictureData.success && pictureData.file_path;
      setHasExistingProfilePicture(hasPicture);

      const newData = {
        name: profileData.data?.teach_name || '',
        email: profileData.data?.teach_email || '',
        phone: profileData.data?.teach_no || '',
        profilePicture: hasPicture ? formatImageUrl(pictureData.file_path) : null
      };

      setTeacherInfo(newData);
      setEditData(newData);
      form.setFieldsValue(newData);
    } catch (error) {
      message.error('Error fetching teacher data');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeacherData();
  }, []);

  const deleteProfilePicture = async () => {
    const teacherId = localStorage.getItem('teacher_id');
    if (!teacherId) {
      message.error('Teacher ID not found');
      return false;
    }

    try {
      setDeleting(true);
      const response = await fetch('https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/delete_profile_picture.php', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ teacher_id: teacherId })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete profile picture');
      }
      
      setEditData(prev => ({
        ...prev,
        profilePicture: null
      }));
      setHasExistingProfilePicture(false);
      
      message.success('Profile picture deleted successfully');
      return true;
    } catch (error) {
      message.error(error.message);
      return false;
    } finally {
      setDeleting(false);
    }
  };

  const uploadNewProfilePicture = async (file) => {
    const teacherId = localStorage.getItem('teacher_id');
    if (!teacherId) {
      message.error('Teacher ID not found');
      return false;
    }

    const formData = new FormData();
    formData.append('profile_picture', file);
    formData.append('teacher_id', teacherId);

    try {
      setUploadingPicture(true);
      const response = await fetch('https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/teach_profilepicture.php', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload profile picture');
      }
      
      const newImageUrl = formatImageUrl(data.file_path);
      
      setEditData(prev => ({
        ...prev,
        profilePicture: newImageUrl
      }));
      setHasExistingProfilePicture(true);
      
      message.success('Profile picture uploaded successfully!');
      return true;
    } catch (error) {
      message.error(error.message);
      return false;
    } finally {
      setUploadingPicture(false);
    }
  };

  const updateProfilePicture = async (file) => {
    const teacherId = localStorage.getItem('teacher_id');
    if (!teacherId) {
      message.error('Teacher ID not found');
      return false;
    }

    const formData = new FormData();
    formData.append('profile_picture', file);
    formData.append('teacher_id', teacherId);

    try {
      setUploadingPicture(true);
      const response = await fetch('https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/teach_profpicupdate.php', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update profile picture');
      }
      
      const newImageUrl = formatImageUrl(data.file_path);
      
      setEditData(prev => ({
        ...prev,
        profilePicture: newImageUrl
      }));
      
      message.success('Profile picture updated successfully!');
      return true;
    } catch (error) {
      message.error(error.message);
      return false;
    } finally {
      setUploadingPicture(false);
    }
  };

  const handleProfilePictureChange = async (file) => {
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      setEditData(prev => ({
        ...prev,
        profilePicture: event.target.result
      }));
    };
    reader.readAsDataURL(file);

    try {
      if (hasExistingProfilePicture) {
        await updateProfilePicture(file);
      } else {
        await uploadNewProfilePicture(file);
      }
    } catch (error) {
      console.error('Upload failed:', error);
      setEditData(prev => ({
        ...prev,
        profilePicture: teacherInfo.profilePicture
      }));
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    e.target.value = null;

    if (!file.type.startsWith('image/')) {
      message.error('You can only upload image files!');
      return;
    }
    
    if (file.size > 2 * 1024 * 1024) {
      message.error('Image must be smaller than 2MB!');
      return;
    }

    await handleProfilePictureChange(file);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setUpdating(true);
      
      const teacherId = localStorage.getItem('teacher_id');
      if (!teacherId) {
        message.error('Teacher ID not found');
        return;
      }

      const response = await fetch('https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/teach_profileUpdate.php', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: teacherId,
          teach_name: values.name,
          teach_email: values.email,
          teach_no: values.phone
        })
      });

      const data = await response.json();
      
      if (data.success) {
        await fetchTeacherData();
        setIsEditing(false);
        message.success('Profile updated successfully!');
      } else {
        message.error(data.error || 'Failed to update profile');
      }
    } catch (error) {
      message.error('Error updating profile');
      console.error('Error:', error);
    } finally {
      setUpdating(false);
    }
  };

  const handleCancel = () => {
    setEditData(teacherInfo);
    setIsEditing(false);
    form.setFieldsValue(teacherInfo);
  };

  const getInitials = (name) => {
    if (!name) return '';
    const names = name.split(' ');
    let initials = names[0].substring(0, 1).toUpperCase();
    
    if (names.length > 1) {
      initials += names[names.length - 1].substring(0, 1).toUpperCase();
    }
    
    return initials;
  };

  const avatarSize = screens.xs ? 100 : 130;

  return (
    <ConfigProvider
      theme={{
        algorithm: theme.defaultAlgorithm,
        token: {
          colorPrimary: '#d4af37',
          colorBgBase: '#ffffff',
          colorBgContainer: '#ffffff',
          colorTextBase: '#0f172a',
          colorBorder: '#e2e8f0',
          borderRadius: 8,
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
        },
      }}
    >
      <OuterLayout style={{ flexDirection: 'row' }}>
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
          <Sidebar />
        )}

        {/* MAIN PAGE CONTENT */}
        <Layout style={{ background: '#f8fafc', minHeight: '100vh' }}>
          <ContentCanvas>
            {/* TOP HEADER CARD */}
            <MainHeaderCard>
              <HeaderTitleWrapper>
                {isMobile && (
                  <Button
                    type="default"
                    icon={<MenuOutlined style={{ color: '#0f172a' }} />}
                    onClick={() => setMobileSidebarVisible(true)}
                    style={{
                      borderColor: '#cbd5e1',
                      background: '#ffffff',
                    }}
                  />
                )}
                <div className="title-icon-badge">
                  <IdcardOutlined />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Title
                      level={isMobile ? 4 : 3}
                      style={{ margin: 0, color: '#0f172a', fontWeight: 700 }}
                    >
                      Instructor Profile
                    </Title>
                    <Tooltip title="Manage personal profile settings and credentials">
                      <InfoCircleOutlined
                        style={{ color: '#94a3b8', fontSize: 14 }}
                      />
                    </Tooltip>
                  </div>
                  <Text style={{ color: '#64748b', fontSize: isMobile ? 11 : 13 }}>
                    View and update account details and contact information
                  </Text>
                </div>
              </HeaderTitleWrapper>

              {!isEditing && !loading && (
                <Button
                  type="primary"
                  icon={<EditOutlined />}
                  onClick={() => {
                    setEditData(teacherInfo);
                    form.setFieldsValue(teacherInfo);
                    setIsEditing(true);
                  }}
                  style={{
                    background: 'linear-gradient(135deg, #091838 0%, #061129 100%)',
                    borderColor: '#061129',
                    color: '#ffffff',
                    fontWeight: 600,
                    borderRadius: 8,
                  }}
                >
                  Edit Profile
                </Button>
              )}
            </MainHeaderCard>

            {/* MAIN PROFILE CARD */}
            <StyledCard>
              {loading ? (
                <div style={{ textAlign: 'center', padding: '60px 0' }}>
                  <Spin size="large" />
                </div>
              ) : (
                <Row gutter={[32, 24]} align="middle">
                  {/* AVATAR COLUMN */}
                  <Col xs={24} md={8} style={{ textAlign: 'center' }}>
                    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                      <AvatarWrapper $isEditing={isEditing}>
                        <Avatar
                          size={avatarSize}
                          src={editData.profilePicture}
                          icon={!editData.profilePicture && <UserOutlined />}
                          style={{
                            backgroundColor: editData.profilePicture ? 'transparent' : '#091838',
                            color: '#d4af37',
                            fontSize: editData.profilePicture ? 'inherit' : '48px',
                            border: '3px solid #d4af37',
                            boxShadow: '0 4px 12px rgba(9, 24, 56, 0.12)',
                            cursor: isEditing ? 'pointer' : 'default',
                          }}
                          onClick={() => isEditing && fileInputRef.current.click()}
                        >
                          {!editData.profilePicture && getInitials(editData.name)}
                        </Avatar>

                        {isEditing && (
                          <div
                            className="avatar-overlay"
                            onClick={() => fileInputRef.current.click()}
                          >
                            <CameraOutlined />
                          </div>
                        )}

                        {isEditing && editData.profilePicture && (
                          <Button
                            danger
                            type="primary"
                            shape="circle"
                            icon={<DeleteOutlined />}
                            size={isMobile ? 'small' : 'middle'}
                            style={{
                              position: 'absolute',
                              top: 0,
                              right: 0,
                              boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              Modal.confirm({
                                title: 'Delete Profile Picture',
                                content: 'Are you sure you want to delete your profile picture?',
                                okText: 'Delete',
                                okType: 'danger',
                                cancelText: 'Cancel',
                                onOk: deleteProfilePicture
                              });
                            }}
                            loading={deleting}
                          />
                        )}
                      </AvatarWrapper>

                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="image/*"
                        style={{ display: 'none' }}
                      />

                      {isEditing ? (
                        <Text style={{ color: '#d4af37', display: 'block', fontSize: 13, fontWeight: 500 }}>
                          {uploadingPicture
                            ? 'Uploading...'
                            : deleting
                              ? 'Deleting...'
                              : 'Click avatar to upload image'}
                        </Text>
                      ) : (
                        <div>
                          <Title level={4} style={{ margin: '8px 0 0', color: '#0f172a' }}>
                            {teacherInfo.name || 'Faculty Member'}
                          </Title>
                          <Text style={{ color: '#64748b', fontSize: 13 }}>
                            Teaching Staff
                          </Text>
                        </div>
                      )}
                    </Space>
                  </Col>

                  {/* FORM / INFO DETAILS COLUMN */}
                  <Col xs={24} md={16}>
                    <Form
                      form={form}
                      layout="vertical"
                      initialValues={teacherInfo}
                      style={{ maxWidth: '550px' }}
                    >
                      <Form.Item
                        label={<Text strong style={{ color: '#475569' }}>Full Name</Text>}
                        name="name"
                        rules={[{ required: true, message: 'Please input your name!' }]}
                      >
                        {isEditing ? (
                          <Input
                            prefix={<UserOutlined style={{ color: '#94a3b8' }} />}
                            onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                            size="large"
                          />
                        ) : (
                          <InfoDisplayItem>
                            <UserOutlined style={{ color: '#d4af37' }} />
                            <span>{teacherInfo.name || 'Not specified'}</span>
                          </InfoDisplayItem>
                        )}
                      </Form.Item>

                      <Form.Item
                        label={<Text strong style={{ color: '#475569' }}>Email Address</Text>}
                        name="email"
                        rules={[
                          { required: true, message: 'Please input your email!' },
                          { type: 'email', message: 'Please enter a valid email!' }
                        ]}
                      >
                        {isEditing ? (
                          <Input
                            prefix={<MailOutlined style={{ color: '#94a3b8' }} />}
                            onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                            size="large"
                          />
                        ) : (
                          <InfoDisplayItem>
                            <MailOutlined style={{ color: '#d4af37' }} />
                            <span>{teacherInfo.email || 'Not specified'}</span>
                          </InfoDisplayItem>
                        )}
                      </Form.Item>

                      <Form.Item
                        label={<Text strong style={{ color: '#475569' }}>Phone Number</Text>}
                        name="phone"
                        rules={[{ required: true, message: 'Please input your phone number!' }]}
                      >
                        {isEditing ? (
                          <Input
                            prefix={<PhoneOutlined style={{ color: '#94a3b8' }} />}
                            onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                            size="large"
                          />
                        ) : (
                          <InfoDisplayItem>
                            <PhoneOutlined style={{ color: '#d4af37' }} />
                            <span>{teacherInfo.phone || 'Not specified'}</span>
                          </InfoDisplayItem>
                        )}
                      </Form.Item>

                      {isEditing && (
                        <Form.Item style={{ marginTop: '28px', marginBottom: 0 }}>
                          <Space>
                            <Button
                              type="primary"
                              icon={<SaveOutlined />}
                              onClick={handleSave}
                              loading={updating}
                              disabled={uploadingPicture || deleting}
                              style={{
                                background: 'linear-gradient(135deg, #091838 0%, #061129 100%)',
                                borderColor: '#061129',
                                fontWeight: 600,
                              }}
                            >
                              Save Changes
                            </Button>
                            <Button
                              icon={<CloseOutlined />}
                              onClick={handleCancel}
                              disabled={updating || uploadingPicture || deleting}
                            >
                              Cancel
                            </Button>
                          </Space>
                        </Form.Item>
                      )}
                    </Form>
                  </Col>
                </Row>
              )}
            </StyledCard>
          </ContentCanvas>
        </Layout>
      </OuterLayout>
    </ConfigProvider>
  );
};

export default TeacherProfileSection;