import { useState, useEffect } from 'react';
import { Card, Avatar, Descriptions, Spin, message, Typography, Row, Col, Button, Upload } from 'antd';
import { UserOutlined, UploadOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const StudentProfile = () => {
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState(null);
  const [error, setError] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [profilePicture, setProfilePicture] = useState(null);
  const [pictureLoading, setPictureLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Get student_id from localStorage
  const studentId = localStorage.getItem('student_id');

  // Base URL configuration
  const API_BASE_URL = 'https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/';
  const DEFAULT_PROFILE_IMAGE = 'https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/images/default-profile.png';

  // Fetch profile details
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        
        if (!studentId) {
          throw new Error('Student ID not found. Please login again.');
        }

        const profileResponse = await fetch(
          `${API_BASE_URL}/Std_profileDetail.php?student_id=${studentId}`,
          { credentials: 'include' }
        );

        if (!profileResponse.ok) {
          const errorText = await profileResponse.text();
          throw new Error(`Failed to load profile: ${errorText}`);
        }

        const responseData = await profileResponse.json();
        
        if (!responseData?.success) {
          throw new Error(responseData?.error || 'Failed to fetch profile data');
        }

        // Transform the data to match the expected structure
        const transformedData = {
          student: {
            id: responseData.student.id,
            Name: responseData.student.name,
            Fathers_Name: responseData.student.father_name,
            Class_No: responseData.student.class_no,
            Admission_Status: responseData.student.admission_status,
            Guardian_Contact: responseData.student.guardian_contact,
            Discipline: responseData.student.discipline,
            Section_id: responseData.student.section_id
          },
          section: responseData.section
        };

        setProfileData(transformedData);
      } catch (error) {
        console.error('Profile data error:', error);
        setError(error.message);
        message.error('Failed to load profile: ' + error.message);
      } finally {
        setLoading(false);
      }
    };

    const fetchProfilePicture = async () => {
      try {
        setPictureLoading(true);
        
        if (!studentId) {
          setProfilePicture(null);
          return;
        }

        const response = await fetch(
          `${API_BASE_URL}/fetchStudentPicture.php?student_id=${studentId}`,
          { credentials: 'include' }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.success && data.exists && data.url) {
          // Clean URL and verify it
          const cleanUrl = data.url.replace(/\\\//g, '/');
          try {
            new URL(cleanUrl); // Validate URL format
            setProfilePicture(cleanUrl);
          } catch (e) {
            console.error('Invalid image URL:', cleanUrl);
            setProfilePicture(null);
          }
        } else {
          setProfilePicture(null);
        }
      } catch (error) {
        console.error('Picture fetch failed:', error);
        setProfilePicture(null);
        if (!error.message.includes('No profile picture found')) {
          message.error('Failed to load profile picture: ' + error.message);
        }
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
    } catch (error) {
      console.error('Upload error:', error);
      message.error(error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleRetry = () => {
    setError(null);
    setRefreshTrigger(prev => prev + 1);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '24px' }}>
        <Spin size="large" tip="Loading profile..." />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <Text type="danger" style={{ fontSize: '16px', marginBottom: '16px' }}>
          {error}
        </Text>
        <br />
        <Button 
          type="primary" 
          onClick={handleRetry}
          style={{ marginTop: '16px' }}
        >
          Retry
        </Button>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <Text>No profile data available</Text>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <Row gutter={[24, 24]}>
        <Col xs={24} md={8}>
          <Card style={{ textAlign: 'center' }}>
            {pictureLoading ? (
              <Spin size="large" style={{ margin: '40px 0' }} />
            ) : profilePicture ? (
              <div style={{
                width: 128,
                height: 128,
                margin: '0 auto',
                borderRadius: '50%',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#f0f0f0'
              }}>
                <img 
                  src={profilePicture} 
                  alt="Profile" 
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = DEFAULT_PROFILE_IMAGE;
                  }}
                />
              </div>
            ) : (
              <Avatar
                size={128}
                icon={<UserOutlined />}
                style={{ margin: '0 auto', display: 'block' }}
              />
            )}
            
            <Upload
              customRequest={handleUpload}
              showUploadList={false}
              accept="image/jpeg,image/png,image/gif"
              disabled={pictureLoading || uploading}
              beforeUpload={(file) => {
                const isImage = ['image/jpeg', 'image/png', 'image/gif'].includes(file.type);
                if (!isImage) {
                  message.error('You can only upload JPG/PNG/GIF files!');
                  return Upload.LIST_IGNORE;
                }
                const isLt2M = file.size / 1024 / 1024 < 2;
                if (!isLt2M) {
                  message.error('Image must be smaller than 2MB!');
                  return Upload.LIST_IGNORE;
                }
                return true;
              }}
            >
              <Button 
                icon={<UploadOutlined />} 
                style={{ marginTop: '16px' }}
                loading={uploading}
                disabled={pictureLoading || uploading}
              >
                {uploading ? 'Uploading...' : 'Upload Profile Picture'}
              </Button>
            </Upload>
            
            <Title level={4} style={{ marginTop: 16 }}>
              {profileData.student.Name || 'N/A'}
            </Title>
            <Text type="secondary">Student ID: {profileData.student.id || 'N/A'}</Text>
          </Card>
        </Col>
        
        <Col xs={24} md={16}>
          <Card title="Profile Details">
            <Descriptions bordered column={1}>
              <Descriptions.Item label="Father's Name">
                {profileData.student.Fathers_Name || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Class">
                {profileData.student.Class_No || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Section">
                {profileData.section?.name || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Admission Status">
                <Text
                  type={
                    profileData.student.Admission_Status === 'Active'
                      ? 'success'
                      : 'warning'
                  }
                >
                  {profileData.student.Admission_Status || 'N/A'}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="Discipline">
                {profileData.student.Discipline || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Guardian Contact">
                {profileData.student.Guardian_Contact || 'N/A'}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default StudentProfile;