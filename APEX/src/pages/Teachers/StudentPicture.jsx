import { Avatar, Image, Spin, Modal, Button, message } from 'antd';
import { LoadingOutlined, UserOutlined, EyeOutlined } from '@ant-design/icons';
import { useState, useEffect } from 'react';

const StudentPicture = ({ studentId, size = 64, showViewButton = true }) => {
  const [pictureUrl, setPictureUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPicture = async () => {
      try {
        if (!studentId) {
          setPictureUrl(null);
          setLoading(false);
          return;
        }

        setLoading(true);
        setError(null);
        
        const response = await fetch(
          `https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/fetchpicture.php?student_id=${studentId}`,
          {
            credentials: 'include' // Important for session cookies
          }
        );

        // Handle unauthorized (401) responses
        if (response.status === 401) {
          throw new Error('Session expired. Please login again.');
        }

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.error || 'Failed to fetch student picture');
        }

        setPictureUrl(data.full_url);
      } catch (error) {
        console.error('Error fetching student picture:', error);
        setError(error.message);
        setPictureUrl(null);
        
        // Show error message if it's an authorization error
        if (error.message.includes('Unauthorized') || error.message.includes('expired')) {
          message.error(error.message);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPicture();
  }, [studentId]);

  if (loading) {
    return <Spin indicator={<LoadingOutlined style={{ fontSize: size / 2 }} spin />} />;
  }

  if (error) {
    return (
      <Avatar 
        size={size} 
        icon={<UserOutlined />} 
        style={{ fontSize: size / 2 }}
      />
    );
  }

  return (
    <>
      <div style={{ position: 'relative', display: 'inline-block' }}>
        {pictureUrl ? (
          <Image
            width={size}
            height={size}
            src={pictureUrl}
            style={{ 
              borderRadius: '50%',
              objectFit: 'cover',
              border: '2px solid #f0f0f0'
            }}
            alt="Student Profile"
            fallback={<Avatar size={size} icon={<UserOutlined />} />}
            preview={false}
          />
        ) : (
          <Avatar 
            size={size} 
            icon={<UserOutlined />} 
            style={{ fontSize: size / 2 }}
          />
        )}
        
        {showViewButton && pictureUrl && (
          <Button
            type="text"
            icon={<EyeOutlined />}
            style={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              backgroundColor: 'rgba(0,0,0,0.5)',
              color: 'white',
              borderRadius: '50%',
              width: size / 2,
              height: size / 2,
              minWidth: 'unset',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onClick={() => setIsModalVisible(true)}
          />
        )}
      </div>

      <Modal
        title="Student Profile Picture"
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={Math.min(800, window.innerWidth - 40)}
      >
        {pictureUrl && (
          <div style={{ textAlign: 'center' }}>
            <Image
              src={pictureUrl}
              style={{ 
                maxWidth: '100%',
                maxHeight: '70vh',
                borderRadius: 8
              }}
              alt="Student Profile"
              preview={false}
            />
            <div style={{ marginTop: 16 }}>
              <Button 
                type="primary" 
                onClick={() => setIsModalVisible(false)}
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
};

export default StudentPicture;