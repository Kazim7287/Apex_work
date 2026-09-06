import { Avatar } from 'antd';
import { UserOutlined } from '@ant-design/icons';

// Profile picture fetching has been removed (the fetchpicture.php endpoint
// was blocked by CORS). This now just renders a plain placeholder avatar
// so existing usages of <StudentPicture /> across the app keep working
// without changes.
const StudentPicture = ({ size = 64 }) => {
  return (
    <Avatar
      size={size}
      icon={<UserOutlined />}
      style={{ fontSize: size / 2 }}
    />
  );
};

export default StudentPicture;