// src/pages/Students/ProfilePictureUploader.jsx
import React, { useState } from 'react';
import { Upload, Button, Avatar, message, Spin } from 'antd';
import { UserOutlined, UploadOutlined } from '@ant-design/icons';

const ProfilePictureUploader = ({ onUploadSuccess, initialPicture, studentId }) => {
  const [uploading, setUploading] = useState(false);
  const API_BASE_URL = 'https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX';

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
        message.success('Profile photo uploaded successfully');
        if (onUploadSuccess) onUploadSuccess();
      } else {
        throw new Error(result.error || 'Upload failed');
      }
    } catch (err) {
      console.error('Upload error:', err);
      message.error(err.message || 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ textAlign: 'center', marginBottom: 16 }}>
      <div style={{ marginBottom: 14 }}>
        <Avatar
          size={96}
          src={initialPicture || undefined}
          icon={<UserOutlined />}
          style={{
            background: 'linear-gradient(135deg, #0b1b3d 0%, #1e3a8a 100%)',
            color: '#ffffff',
            border: '2px solid #d4af37',
            boxShadow: '0 4px 14px rgba(212, 175, 55, 0.25)'
          }}
        />
      </div>
      <Upload
        customRequest={handleUpload}
        showUploadList={false}
        accept="image/jpeg,image/png,image/gif"
        disabled={uploading}
        beforeUpload={(file) => {
          const isImg = ['image/jpeg', 'image/png', 'image/gif'].includes(file.type);
          if (!isImg) {
            message.error('Please upload JPG, PNG, or GIF format!');
            return Upload.LIST_IGNORE;
          }
          if (file.size / 1024 / 1024 > 2) {
            message.error('Image must be smaller than 2MB!');
            return Upload.LIST_IGNORE;
          }
          return true;
        }}
      >
        <Button icon={<UploadOutlined />} loading={uploading} size="small" style={{ borderRadius: 6 }}>
          {uploading ? 'Uploading...' : 'Change Photo'}
        </Button>
      </Upload>
    </div>
  );
};

export default ProfilePictureUploader;