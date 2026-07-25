import { Card, Button, Typography, Row, Col, Layout } from 'antd';
import { UserOutlined, SolutionOutlined, TeamOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';

const { Title, Text } = Typography;
const { Footer } = Layout;

const ChooseUser = () => {
  return (
    <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flex: 1,
        padding: '24px'
      }}>
        <div style={{ maxWidth: '1000px', width: '100%' }}>
          <Title level={2} style={{ textAlign: 'center', marginBottom: '40px' }}>
            Select Your Login Portal
          </Title>
          
          <Row gutter={[24, 24]} justify="center">
            <Col xs={24} sm={12} md={8}>
              <Card
                hoverable
                style={{ borderRadius: '8px', height: '100%' }}
                bodyStyle={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: '24px',
                  height: '100%'
                }}
              >
                <SolutionOutlined style={{ fontSize: '48px', color: '#1890ff', marginBottom: '16px' }} />
                <Title level={4} style={{ marginBottom: '8px' }}>Admin</Title>
                <Text type="secondary" style={{ textAlign: 'center', marginBottom: '24px' }}>
                  Access administrative functions and system management
                </Text>
                <Link to="/admin-signIn">
                  <Button type="primary" size="large" block>
                    Login as Admin
                  </Button>
                </Link>
              </Card>
            </Col>
            
            <Col xs={24} sm={12} md={8}>
              <Card
                hoverable
                style={{ borderRadius: '8px', height: '100%' }}
                bodyStyle={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: '24px',
                  height: '100%'
                }}
              >
                <UserOutlined style={{ fontSize: '48px', color: '#52c41a', marginBottom: '16px' }} />
                <Title level={4} style={{ marginBottom: '8px' }}>Teacher</Title>
                <Text type="secondary" style={{ textAlign: 'center', marginBottom: '24px' }}>
                  Access course materials, student records, and grading
                </Text>
                <Link to="/teacher-signIn">
                  <Button type="primary" size="large" block>
                    Login as Teacher
                  </Button>
                </Link>
              </Card>
            </Col>
            
            <Col xs={24} sm={12} md={8}>
              <Card
                hoverable
                style={{ borderRadius: '8px', height: '100%' }}
                bodyStyle={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: '24px',
                  height: '100%'
                }}
              >
                <TeamOutlined style={{ fontSize: '48px', color: '#722ed1', marginBottom: '16px' }} />
                <Title level={4} style={{ marginBottom: '8px' }}>Student</Title>
                <Text type="secondary" style={{ textAlign: 'center', marginBottom: '24px' }}>
                  Access your courses, assignments, and grades
                </Text>
                <Link to="/student-signIn">
                  <Button type="primary" size="large" block>
                    Login as Student
                  </Button>
                </Link>
              </Card>
            </Col>
          </Row>
        </div>
      </div>
      
      <Footer style={{ 
        textAlign: 'center',
        padding: '16px 50px',
        backgroundColor: '#f0f2f5'
      }}>
        <Text type="secondary">Powered by MUHAMMAD KAZIM AHMAD AND YOUSAF SHAH</Text>
      </Footer>
    </Layout>
  );
};

export default ChooseUser;