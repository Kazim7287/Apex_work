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
  Grid
} from 'antd';
import { UserOutlined, EditOutlined, SaveOutlined, CloseOutlined, DeleteOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

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
  const screens = useBreakpoint();

  // Format image URL with cache busting
  const formatImageUrl = (path) => {
    if (!path) return null;
    return `https://white-trout-460511.hostingersite.com/APEX/${path}?t=${Date.now()}`;
  };

  // Fetch teacher data
  const fetchTeacherData = async () => {
    try {
      const teacherId = localStorage.getItem('teacher_id');
      if (!teacherId) {
        message.error('Teacher ID not found in localStorage');
        return;
      }

      // Fetch profile data and picture in parallel
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
    } catch (error) {
      message.error('Error fetching teacher data');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchTeacherData();
  }, []);

  // Delete profile picture
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
      
      // Update state after successful deletion
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

  // Upload new profile picture (first time)
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
      
      // Update state with new picture
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

  // Update existing profile picture
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
      
      // Update state with new picture
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

  // Handle profile picture change
  const handleProfilePictureChange = async (file) => {
    if (!file) return;
    
    // Show preview while uploading
    const reader = new FileReader();
    reader.onload = (event) => {
      setEditData(prev => ({
        ...prev,
        profilePicture: event.target.result
      }));
    };
    reader.readAsDataURL(file);

    // Handle the actual upload
    try {
      if (hasExistingProfilePicture) {
        await updateProfilePicture(file);
      } else {
        await uploadNewProfilePicture(file);
      }
    } catch (error) {
      console.error('Upload failed:', error);
      // Revert to previous picture if upload fails
      setEditData(prev => ({
        ...prev,
        profilePicture: teacherInfo.profilePicture
      }));
    }
  };

  // Handle file selection
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    e.target.value = null; // Reset file input

    // Validate file
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

  // Save profile changes
  const handleSave = async () => {
    try {
      await form.validateFields();
      setUpdating(true);
      
      const teacherId = localStorage.getItem('teacher_id');
      if (!teacherId) {
        message.error('Teacher ID not found');
        return;
      }

      // Update profile information
      const response = await fetch('https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/teach_profileUpdate.php', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: teacherId,
          teach_name: editData.name,
          teach_email: editData.email,
          teach_no: editData.phone
        })
      });

      const data = await response.json();
      
      if (data.success) {
        // Refresh all data after successful update
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

  // Cancel editing
  const handleCancel = () => {
    setEditData(teacherInfo);
    setIsEditing(false);
    form.resetFields();
  };

  // Generate initials for avatar
  const getInitials = (name) => {
    if (!name) return '';
    const names = name.split(' ');
    let initials = names[0].substring(0, 1).toUpperCase();
    
    if (names.length > 1) {
      initials += names[names.length - 1].substring(0, 1).toUpperCase();
    }
    
    return initials;
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  // Responsive avatar size
  const avatarSize = screens.xs ? 96 : 128;

  return (
    <Row gutter={[16, 16]} style={{ margin: 0 }}>
      {/* Sidebar - only show on larger screens */}
      {screens.sm && (
        <Col xs={0} sm={6} md={5} lg={4}>
          <Sidebar />
        </Col>
      )}
      
      <Col xs={24} sm={18} md={19} lg={20}>
        <Card
          title={<Title level={4} style={{ margin: 0 }}>Profile Details</Title>}
          extra={
            !isEditing ? (
              <Button 
                type="primary" 
                icon={<EditOutlined />}
                onClick={() => setIsEditing(true)}
                size={screens.xs ? 'small' : 'middle'}
              >
                {screens.xs ? 'Edit' : 'Edit Profile'}
              </Button>
            ) : null
          }
          bodyStyle={{ padding: screens.xs ? '16px 8px' : '24px' }}
        >
          <Row gutter={[24, 16]} justify="center">
            <Col xs={24} md={8} style={{ 
              textAlign: 'center',
              padding: screens.xs ? '0 8px' : '0 16px'
            }}>
              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                <div style={{ position: 'relative', display: 'inline-block' }}>
                  <Avatar
                    size={avatarSize}
                    src={editData.profilePicture}
                    icon={!editData.profilePicture && <UserOutlined />}
                    style={{
                      backgroundColor: editData.profilePicture ? 'transparent' : '#1890ff',
                      fontSize: editData.profilePicture ? 'inherit' : '48px',
                      cursor: isEditing ? 'pointer' : 'default',
                      border: '1px solid #f0f0f0'
                    }}
                    onClick={() => isEditing && fileInputRef.current.click()}
                  >
                    {!editData.profilePicture && getInitials(editData.name)}
                  </Avatar>
                  
                  {isEditing && editData.profilePicture && (
                    <Button
                      danger
                      type="primary"
                      shape="circle"
                      icon={<DeleteOutlined />}
                      size={screens.xs ? 'small' : 'middle'}
                      style={{
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        transform: 'translate(50%, -50%)'
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
                </div>
                
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  style={{ display: 'none' }}
                />
                
                {isEditing && (
                  <Text type="secondary" style={{ display: 'block' }}>
                    {uploadingPicture 
                      ? 'Uploading...' 
                      : deleting
                        ? 'Deleting...'
                        : 'Click to change profile picture'}
                  </Text>
                )}
              </Space>
            </Col>
            
            <Col xs={24} md={16}>
              <Form 
                form={form} 
                layout="vertical" 
                initialValues={teacherInfo}
                style={{ maxWidth: '600px', margin: '0 auto' }}
              >
                <Form.Item 
                  label="Name" 
                  name="name"
                  rules={[{ required: true, message: 'Please input your name!' }]}
                >
                  {isEditing ? (
                    <Input 
                      value={editData.name}
                      onChange={(e) => setEditData({...editData, name: e.target.value})}
                      size={screens.xs ? 'small' : 'middle'}
                    />
                  ) : (
                    <Text style={{ fontSize: screens.xs ? '14px' : '16px' }}>{teacherInfo.name}</Text>
                  )}
                </Form.Item>
                
                <Form.Item 
                  label="Email"
                  name="email"
                  rules={[
                    { required: true, message: 'Please input your email!' },
                    { type: 'email', message: 'Please enter a valid email!' }
                  ]}
                >
                  {isEditing ? (
                    <Input 
                      value={editData.email}
                      onChange={(e) => setEditData({...editData, email: e.target.value})}
                      size={screens.xs ? 'small' : 'middle'}
                    />
                  ) : (
                    <Text style={{ fontSize: screens.xs ? '14px' : '16px' }}>{teacherInfo.email}</Text>
                  )}
                </Form.Item>
                
                <Form.Item 
                  label="Phone" 
                  name="phone"
                  rules={[{ required: true, message: 'Please input your phone number!' }]}
                >
                  {isEditing ? (
                    <Input 
                      value={editData.phone}
                      onChange={(e) => setEditData({...editData, phone: e.target.value})}
                      size={screens.xs ? 'small' : 'middle'}
                    />
                  ) : (
                    <Text style={{ fontSize: screens.xs ? '14px' : '16px' }}>{teacherInfo.phone}</Text>
                  )}
                </Form.Item>
                
                {isEditing && (
                  <Form.Item style={{ marginTop: '24px' }}>
                    <Space>
                      <Button 
                        type="primary" 
                        icon={<SaveOutlined />}
                        onClick={handleSave}
                        loading={updating}
                        disabled={uploadingPicture || deleting}
                        size={screens.xs ? 'small' : 'middle'}
                      >
                        Save Changes
                      </Button>
                      <Button 
                        icon={<CloseOutlined />}
                        onClick={handleCancel}
                        disabled={updating || uploadingPicture || deleting}
                        size={screens.xs ? 'small' : 'middle'}
                      >
                        Cancel
                      </Button>
                    </Space>
                  </Form.Item>
                )}
              </Form>
            </Col>
          </Row>
        </Card>
      </Col>
    </Row>
  );
};

export default TeacherProfileSection;