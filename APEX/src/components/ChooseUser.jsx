import React from 'react';
import { Card, Button, Typography, Row, Col, Layout, Tag, Space } from 'antd';
import { 
  UserOutlined, 
  SolutionOutlined, 
  TeamOutlined, 
  ArrowLeftOutlined,
  CrownOutlined,
  BookOutlined,
  RightOutlined,
  SafetyCertificateOutlined
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import styled, { createGlobalStyle, keyframes } from 'styled-components';
import logo from '/src/assets/images.png';

const { Title, Text, Paragraph } = Typography;
const { Header, Content, Footer } = Layout;

// ==================== GLOBAL STYLES ====================
const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
  
  body {
    font-family: 'Plus Jakarta Sans', sans-serif;
    background-color: #061129;
  }
`;

// ==================== KEYFRAMES ====================
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(15px); }
  to { opacity: 1; transform: translateY(0); }
`;

// ==================== STYLED COMPONENTS ====================
const PortalLayout = styled(Layout)`
  min-height: 100vh;
  background: linear-gradient(135deg, #0b1b3d 0%, #061129 100%);
  color: #fff;
`;

const PortalHeader = styled(Header)`
  background: rgba(11, 27, 61, 0.8) !important;
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  height: 76px;
  line-height: 76px;
  padding: 0 24px;
`;

const HeaderContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const BrandWrapper = styled(Link)`
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;

  .brand-logo {
    width: 42px;
    height: 42px;
    border-radius: 8px;
    background: #fff;
    padding: 3px;
  }

  .brand-name {
    font-family: 'Cinzel', serif;
    font-size: 1.2rem;
    font-weight: 700;
    color: #fff;
  }
`;

const BackButton = styled(Button)`
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #cbd5e1;
  border-radius: 6px;
  font-weight: 500;

  &:hover {
    background: #d4af37 !important;
    color: #0b1b3d !important;
    border-color: #d4af37 !important;
  }
`;

const MainContent = styled(Content)`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px 24px;
  animation: ${fadeIn} 0.6s ease-out;
`;

const Container = styled.div`
  max-width: 1100px;
  width: 100%;
`;

const HeaderBlock = styled.div`
  text-align: center;
  margin-bottom: 50px;
`;

const GatewayBadge = styled(Tag)`
  background: rgba(212, 175, 55, 0.18);
  border: 1px solid #d4af37;
  color: #fef08a;
  padding: 4px 14px;
  border-radius: 20px;
  font-weight: 700;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  font-size: 0.8rem;
  margin-bottom: 14px;
`;

const MainTitle = styled.h1`
  font-family: 'Cinzel', serif;
  font-size: clamp(2rem, 3.5vw, 3rem);
  color: #ffffff;
  font-weight: 700;
  margin: 0 0 12px;
`;

const Subtitle = styled.p`
  color: #94a3b8;
  font-size: 1.05rem;
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;
`;

// Portal Cards
const PortalCard = styled(Card)`
  background: rgba(11, 27, 61, 0.65) !important;
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.12) !important;
  border-radius: 16px !important;
  height: 100%;
  transition: all 0.35s ease !important;

  &:hover {
    transform: translateY(-8px);
    border-color: #d4af37 !important;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4), 0 0 20px rgba(212, 175, 55, 0.2);

    .portal-icon-bg {
      background: linear-gradient(135deg, #d4af37 0%, #b8860b 100%);
      color: #0b1b3d;
      transform: scale(1.08);
    }
  }

  .ant-card-body {
    padding: 36px 28px;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    height: 100%;
  }
`;

const IconCircle = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(212, 175, 55, 0.3);
  color: #d4af37;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36px;
  margin-bottom: 24px;
  transition: all 0.35s ease;
`;

const CardRoleTitle = styled.h3`
  font-family: 'Cinzel', serif;
  font-size: 1.4rem;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 8px;
`;

const CardDescription = styled.p`
  color: #94a3b8;
  font-size: 0.92rem;
  line-height: 1.6;
  margin-bottom: 28px;
  flex: 1;
`;

const PortalButton = styled(Button)`
  width: 100%;
  height: 46px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.95rem;
  background: linear-gradient(135deg, #d4af37 0%, #b8860b 100%);
  border: none;
  color: #0b1b3d;
  box-shadow: 0 4px 14px rgba(212, 175, 55, 0.3);

  &:hover {
    background: linear-gradient(135deg, #f39c12 0%, #d4af37 100%) !important;
    color: #0b1b3d !important;
  }
`;

const PortalFooter = styled(Footer)`
  text-align: center;
  background: #040c1e;
  color: #64748b;
  padding: 24px 50px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  font-size: 0.88rem;

  .developer-credit {
    color: #cbd5e1;
    font-weight: 600;
    margin-top: 4px;
    display: block;
  }
`;

// ==================== MAIN COMPONENT ====================
const ChooseUser = () => {
  return (
    <>
      <GlobalStyle />
      <PortalLayout>
        {/* Header */}
        <PortalHeader>
          <HeaderContainer>
            <BrandWrapper to="/">
              <img src={logo} alt="Apex College Logo" className="brand-logo" />
              <span className="brand-name">Apex College Harichand</span>
            </BrandWrapper>
            
            <Link to="/">
              <BackButton icon={<ArrowLeftOutlined />}>
                Back to Website
              </BackButton>
            </Link>
          </HeaderContainer>
        </PortalHeader>

        {/* Content */}
        <MainContent>
          <Container>
            <HeaderBlock>
              <GatewayBadge>
                <SafetyCertificateOutlined /> SECURE PORTAL ACCESS
              </GatewayBadge>
              <MainTitle>Select Your Login Portal</MainTitle>
              <Subtitle>
                Welcome to Apex College digital management system. Choose your designated user role below to access your portal.
              </Subtitle>
            </HeaderBlock>

            <Row gutter={[28, 28]} justify="center">
              {/* ADMIN CARD */}
              <Col xs={24} sm={12} md={8}>
                <PortalCard hoverable>
                  <IconCircle className="portal-icon-bg">
                    <CrownOutlined />
                  </IconCircle>
                  <CardRoleTitle>Administration</CardRoleTitle>
                  <CardDescription>
                    Access college administrative controls, student enrollment, finance, and system operations.
                  </CardDescription>
                  <Link to="/admin-signIn" style={{ width: '100%' }}>
                    <PortalButton icon={<RightOutlined />}>
                      Login as Admin
                    </PortalButton>
                  </Link>
                </PortalCard>
              </Col>

              {/* TEACHER CARD */}
              <Col xs={24} sm={12} md={8}>
                <PortalCard hoverable>
                  <IconCircle className="portal-icon-bg">
                    <BookOutlined />
                  </IconCircle>
                  <CardRoleTitle>Faculty & Teachers</CardRoleTitle>
                  <CardDescription>
                    Access course management, student attendance, assignment submissions, and examination grading.
                  </CardDescription>
                  <Link to="/teacher-signIn" style={{ width: '100%' }}>
                    <PortalButton icon={<RightOutlined />}>
                      Login as Teacher
                    </PortalButton>
                  </Link>
                </PortalCard>
              </Col>

              {/* STUDENT CARD */}
              <Col xs={24} sm={12} md={8}>
                <PortalCard hoverable>
                  <IconCircle className="portal-icon-bg">
                    <TeamOutlined />
                  </IconCircle>
                  <CardRoleTitle>Student Portal</CardRoleTitle>
                  <CardDescription>
                    View enrolled courses, class schedules, fee history, academic results, and study resources.
                  </CardDescription>
                  <Link to="/student-signIn" style={{ width: '100%' }}>
                    <PortalButton icon={<RightOutlined />}>
                      Login as Student
                    </PortalButton>
                  </Link>
                </PortalCard>
              </Col>
            </Row>
          </Container>
        </MainContent>

        {/* Footer */}
        <PortalFooter>
          <div>© {new Date().getFullYear()} Apex College Harichand. All rights reserved.</div>
          <span className="developer-credit">
            Powered by MUHAMMAD KAZIM AHMAD AND YOUSAF SHAH
          </span>
        </PortalFooter>
      </PortalLayout>
    </>
  );
};

export default ChooseUser;