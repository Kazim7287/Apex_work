// src/pages/Students/Profile.jsx
import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Avatar, 
  Descriptions, 
  Spin, 
  message, 
  Typography, 
  Row, 
  Col, 
  Button, 
  Upload, 
  Tag, 
  Space, 
  Modal,
  Divider 
} from 'antd';
import { 
  UserOutlined, 
  UploadOutlined, 
  EditOutlined, 
  CheckCircleOutlined, 
  ReloadOutlined,
  IdcardOutlined,
  PhoneOutlined,
  BookOutlined,
  SafetyCertificateOutlined
} from '@ant-design/icons';
import ProfileEditForm from './ProfileEditForm';

const { Title, Text } = Typography;

const StudentProfile = () => {
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState(null);
  const [error, setError] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [profilePicture, setProfilePicture] = useState(null);
  const [pictureLoading, setPictureLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);

  const studentId = localStorage.getItem('student_id');
  const API_BASE_URL = 'https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX';

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        if (!studentId) {
          throw new Error('Student ID not found. Please log in again.');
        }

        const profileResponse = await fetch(
          `${API_BASE_URL}/Std_profileDetail.php?student_id=${encodeURIComponent(studentId)}`,
          { credentials: 'include' }
        );

        if (!profileResponse.ok) {
          throw new Error('Failed to load student profile details');
        }

        const responseData = await profileResponse.json();
        
        if (responseData && (responseData.success || responseData.student)) {
          const rawStudent = responseData.student || {};
          const transformedData = {
            student: {
              id: rawStudent.id || studentId,
              name: rawStudent.name || rawStudent.Name || '',
              father_name: rawStudent.father_name || rawStudent.Fathers_Name || '',
              class_no: rawStudent.class_no || rawStudent.Class_No || '',
              admission_status: rawStudent.admission_status || rawStudent.Admission_Status || 'Active',
              guardian_contact: rawStudent.guardian_contact || rawStudent.Guardian_Contact || '',
              discipline: rawStudent.discipline || rawStudent.Discipline || 'General',
              section_id: rawStudent.section_id || rawStudent.Section_id || ''
            },
            section: responseData.section || responseData.sections || { name: 'A' }
          };
          setProfileData(transformedData);
        } else {
          throw new Error(responseData?.error || 'Failed to fetch profile data');
        }
      } catch (err) {
        console.error('Profile data error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    const fetchProfilePicture = async () => {
      try {
        setPictureLoading(true);
        if (!studentId) return;

        const response = await fetch(
          `${API_BASE_URL}/fetchStudentPicture.php?student_id=${encodeURIComponent(studentId)}`,
          { credentials: 'include' }
        );

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.exists && (data.url || data.full_url)) {
            const cleanUrl = (data.url || data.full_url).replace(/\\\//g, '/');
            setProfilePicture(cleanUrl);
          }
        }
      } catch (err) {
        console.warn('Picture fetch error:', err);
      } finally {
        setPictureLoading(false);
      }
    };

    fetchProfileData();
    fetchProfilePicture();
  }, [studentId, refreshTrigger]);

  const handleUpload = async (options) => {
    const { file } = options;
    setUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('profile_picture', file);
      formData.append('student_id', studentId);

      const response = await fetch(`${API_BASE_URL}/updateprofilepicture.php`, {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });

      const result = await response.json();

      if (result.success) {
        message.success('Profile picture updated successfully');
        setRefreshTrigger(prev => prev + 1);
      } else {
        throw new Error(result.error || 'Failed to update profile picture');
      }
    } catch (err) {
      console.error('Upload error:', err);
      message.error(err.message || 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleEditSubmit = async (values) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/updateProfile.php?student_id=${encodeURIComponent(studentId)}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(values),
          credentials: 'include'
        }
      );

      const result = await response.json();

      if (result.success) {
        message.success('Profile details updated successfully');
        setRefreshTrigger(prev => prev + 1);
        setIsEditModalVisible(false);
      } else {
        throw new Error(result.error || 'Failed to update profile');
      }
    } catch (err) {
      message.error(err.message || 'Failed to update profile');
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Spin size="large" tip="Loading student credentials..." />
      </div>
    );
  }

  const student = profileData?.student || {};
  const section = profileData?.section || {};

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto' }}>
      {/* Header Banner */}
      <Card
        className="apex-card"
        style={{ marginBottom: 24 }}
        bodyStyle={{ padding: '20px 24px' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: 'linear-gradient(135deg, #0b1b3d 0%, #1e3a8a 100%)',
                color: '#d4af37',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 22,
                boxShadow: '0 4px 12px rgba(11, 27, 61, 0.2)',
              }}
            >
              <IdcardOutlined />
            </div>
            <div>
              <Title level={4} style={{ margin: 0, color: '#0b1b3d', fontWeight: 800 }}>
                Student Profile & Credentials
              </Title>
              <Text style={{ color: '#64748b', fontSize: 13 }}>
                Verified student enrollment data, official guardian details, and identity documents
              </Text>
            </div>
          </div>

          <Space wrap>
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => setIsEditModalVisible(true)}
              className="apex-btn-gold"
              style={{ borderRadius: 8 }}
            >
              Edit Profile
            </Button>
            <Button
              icon={<ReloadOutlined />}
              onClick={() => setRefreshTrigger(prev => prev + 1)}
              style={{ borderRadius: 8 }}
            >
              Refresh
            </Button>
          </Space>
        </div>
      </Card>

      <Row gutter={[24, 24]}>
        {/* Left Profile Avatar Card */}
        <Col xs={24} lg={8}>
          <Card 
            className="apex-card apex-card-gold-header"
            style={{ textAlign: 'center' }}
            bodyStyle={{ padding: '32px 24px' }}
          >
            <div style={{ position: 'relative', display: 'inline-block', marginBottom: 20 }}>
              <Avatar
                size={110}
                src={profilePicture || undefined}
                icon={<UserOutlined />}
                style={{
                  background: 'linear-gradient(135deg, #0b1b3d 0%, #1e3a8a 100%)',
                  color: '#ffffff',
                  fontSize: 42,
                  border: '3px solid #d4af37',
                  boxShadow: '0 8px 24px rgba(11, 27, 61, 0.25)'
                }}
              >
                {!profilePicture && (student.name?.charAt(0)?.toUpperCase() || 'S')}
              </Avatar>
            </div>

            <Title level={4} style={{ color: '#0b1b3d', margin: '0 0 4px 0', fontWeight: 800 }}>
              {student.name || 'Student Name'}
            </Title>
            <Text style={{ color: '#64748b', fontSize: 13, display: 'block', marginBottom: 12 }}>
              Student ID: <strong style={{ color: '#0b1b3d' }}>#{student.id || studentId}</strong>
            </Text>

            <Space wrap style={{ justifyContent: 'center', marginBottom: 24 }}>
              {student.class_no && (
                <Tag color="blue" style={{ borderRadius: 12, padding: '2px 10px', fontWeight: 600 }}>
                  Class {student.class_no}
                </Tag>
              )}
              {section.name && (
                <Tag color="cyan" style={{ borderRadius: 12, padding: '2px 10px', fontWeight: 600 }}>
                  Section {section.name}
                </Tag>
              )}
              <Tag color={student.admission_status === 'Active' ? 'green' : 'orange'} style={{ borderRadius: 12, padding: '2px 10px', fontWeight: 600 }}>
                {student.admission_status || 'Active'}
              </Tag>
            </Space>

            <Divider style={{ margin: '16px 0' }} />

            <Upload
              customRequest={handleUpload}
              showUploadList={false}
              accept="image/jpeg,image/png,image/gif"
              disabled={pictureLoading || uploading}
              beforeUpload={(file) => {
                const isImg = ['image/jpeg', 'image/png', 'image/gif'].includes(file.type);
                if (!isImg) {
                  message.error('Please upload JPG, PNG, or GIF format!');
                  return Upload.LIST_IGNORE;
                }
                if (file.size / 1024 / 1024 > 2) {
                  message.error('Image must be under 2MB!');
                  return Upload.LIST_IGNORE;
                }
                return true;
              }}
            >
              <Button 
                icon={<UploadOutlined />} 
                loading={uploading}
                style={{ borderRadius: 8 }}
                block
              >
                {uploading ? 'Uploading Photo...' : 'Upload Profile Photo'}
              </Button>
            </Upload>
          </Card>
        </Col>

        {/* Right Details Card */}
        <Col xs={24} lg={16}>
          <Card 
            className="apex-card"
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 0' }}>
                <div style={{ width: 34, height: 34, borderRadius: 8, background: 'rgba(212, 175, 55, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d4af37', fontSize: 16 }}>
                  <IdcardOutlined />
                </div>
                <div>
                  <Title level={5} style={{ margin: 0, color: '#0b1b3d', fontWeight: 700 }}>
                    Official Enrollment Details
                  </Title>
                  <Text style={{ color: '#64748b', fontSize: 11 }}>Registered academic credentials</Text>
                </div>
              </div>
            }
          >
            <Descriptions 
              bordered 
              column={{ xs: 1, sm: 2 }} 
              size="middle"
              labelStyle={{ fontWeight: 600, color: '#0b1b3d', background: '#f8fafc', width: '35%' }}
            >
              <Descriptions.Item label="Full Name">
                <Text strong style={{ color: '#0b1b3d' }}>{student.name || 'N/A'}</Text>
              </Descriptions.Item>
              
              <Descriptions.Item label="Father's Name">
                {student.father_name || 'N/A'}
              </Descriptions.Item>

              <Descriptions.Item label="Enrolled Class">
                {student.class_no ? `Class ${student.class_no}` : 'N/A'}
              </Descriptions.Item>

              <Descriptions.Item label="Section Assigned">
                {section.name ? `Section ${section.name}` : 'N/A'}
              </Descriptions.Item>

              <Descriptions.Item label="Academic Discipline">
                {student.discipline || 'General Studies'}
              </Descriptions.Item>

              <Descriptions.Item label="Guardian Contact">
                <Space>
                  <PhoneOutlined style={{ color: '#10b981' }} />
                  <span>{student.guardian_contact || 'N/A'}</span>
                </Space>
              </Descriptions.Item>

              <Descriptions.Item label="Enrollment Status" span={2}>
                <Tag color={student.admission_status === 'Active' ? 'success' : 'warning'} style={{ borderRadius: 6, fontWeight: 700 }}>
                  <CheckCircleOutlined /> {student.admission_status || 'Active'}
                </Tag>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
      </Row>

      {/* Edit Profile Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: '#0b1b3d', color: '#d4af37', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <EditOutlined />
            </div>
            <span>Edit Profile Details</span>
          </div>
        }
        open={isEditModalVisible}
        onCancel={() => setIsEditModalVisible(false)}
        footer={null}
        width={750}
        centered
        destroyOnClose
      >
        <ProfileEditForm 
          initialValues={{
            ...student,
            section_name: section.name
          }}
          onSubmit={handleEditSubmit}
          onCancel={() => setIsEditModalVisible(false)}
        />
      </Modal>
    </div>
  );
};

export default StudentProfile;