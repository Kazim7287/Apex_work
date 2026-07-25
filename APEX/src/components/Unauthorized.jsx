// src/components/Unauthorized.jsx
import { Result, Button } from 'antd';
import { Link } from 'react-router-dom';

const Unauthorized = () => {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <Result
        status="403"
        title="403"
        subTitle="Sorry, you are not authorized to access this page."
        extra={
          <Link to="/">
            <Button type="primary">Back Home</Button>
          </Link>
        }
      />
    </div>
  );
};

export default Unauthorized;