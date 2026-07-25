/* eslint-disable react/jsx-key */
import { useState, useEffect } from 'react';
import { Card, Avatar, Descriptions, Spin, message, Typography, Row, Col, Button, Modal } from 'antd';
import { UserOutlined, EditOutlined } from '@ant-design/icons';
import ProfilePictureUploader from './ProfilePictureUploader';
import ProfileEditForm from './ProfileEditForm';

const { Title, Text } = Typography;

const StudentProfile = () => {
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState(null);
  const [error, setError] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [profilePicture, setProfilePicture] = useState(null);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);

  // Get student_id from localStorage
  const studentId = localStorage.getItem('student_id');

  // Fetch profile details
  useEffect(() => {
    const fetchProfileDetails = async () => {
      try {
        setLoading(true);
        
        if (!studentId) {
          throw new Error('Student ID not found');
        }

        // Fetch basic profile data with credentials
        const profileResponse = await fetch(
          `https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/Std_profileDetail.php?student_id=${studentId}`,
          {
            credentials: 'include' // Important for session cookies
          }
        );

        if (!profileResponse.ok) {
          throw new Error(`HTTP error! status: ${profileResponse.status}`);
        }

        const profileData = await profileResponse.json();

        if (profileData.success) {
          setProfileData(profileData);
        } else {
          throw new Error(profileData.error || 'Failed to fetch profile data');
        }

        // Fetch profile picture with credentials
        const pictureResponse = await fetch(
          `https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/fetchPicture.php?student_id=${studentId}`,
          {
            credentials: 'include' // Important for session cookies
          }
        );

        if (pictureResponse.ok) {
          const pictureData = await pictureResponse.json();
          if (pictureData.success) {
            setProfilePicture(pictureData.full_url);
          }
        }
      } catch (error) {
        console.error('Error fetching profile details:', error);
        setError(error.message);
        message.error('Failed to load profile details');
      } finally {
        setLoading(false);
      }
    };

    fetchProfileDetails();
  }, [studentId, refreshTrigger]);

  const handleUploadSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
    message.success('Profile picture updated successfully');
  };

  const handleEditProfile = () => {
    setIsEditModalVisible(true);
  };

  const handleEditSubmit = async (values) => {
    try {
      const response = await fetch(
        `https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/updateProfile.php?student_id=${studentId}`,
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
        message.success('Profile updated successfully');
        setRefreshTrigger(prev => prev + 1);
        setIsEditModalVisible(false);
      } else {
        throw new Error(result.error || 'Failed to update profile');
      }
    } catch (error) {
      message.error(error.message);
    }
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
      <div style={{ padding: '24px' }}>
        <Text type="danger">{error}</Text>
        <Button 
          type="primary" 
          onClick={() => setRefreshTrigger(prev => prev + 1)}
          style={{ marginTop: 16 }}
        >
          Retry
        </Button>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div style={{ padding: '24px' }}>
        <Text>No profile data available</Text>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <Row gutter={[24, 24]}>
        <Col xs={24} md={8}>
          <Card
            style={{ textAlign: 'center' }}
            actions={[
              <Button 
                type="primary" 
                icon={<EditOutlined />}
                onClick={handleEditProfile}
              >
                Edit Profile
              </Button>
            ]}
          >
            <ProfilePictureUploader 
              onUploadSuccess={handleUploadSuccess} 
              initialPicture={profilePicture}
              studentId={studentId}
            />
            <Title level={4} style={{ marginTop: 16 }}>
              {profileData.student.name}
            </Title>
            <Text type="secondary">Student ID: {profileData.student.id}</Text>
          </Card>
        </Col>
        
        <Col xs={24} md={16}>
          <Card title="Profile Details">
            <Descriptions bordered column={1}>
              <Descriptions.Item label="Father's Name">
                {profileData.student.father_name || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Class">
                {profileData.student.class_no}
              </Descriptions.Item>
              <Descriptions.Item label="Section">
                {profileData.sections?.name || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Admission Status">
                <Text
                  type={
                    profileData.student.admission_status === 'Active'
                      ? 'success'
                      : 'warning'
                  }
                >
                  {profileData.student.admission_status}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="Discipline">
                {profileData.student.discipline || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Guardian Contact">
                {profileData.student.guardian_contact || 'N/A'}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
      </Row>

      {/* Edit Profile Modal */}
      <Modal
        title="Edit Profile"
        visible={isEditModalVisible}
        onCancel={() => setIsEditModalVisible(false)}
        footer={null}
        width={800}
      >
        <ProfileEditForm 
          initialValues={profileData.student}
          onSubmit={handleEditSubmit}
          onCancel={() => setIsEditModalVisible(false)}
        />
      </Modal>
    </div>
  );
};

export default StudentProfile;