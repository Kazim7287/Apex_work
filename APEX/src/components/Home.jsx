/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef } from 'react';
import { 
  Layout, 
  Menu, 
  Button, 
  Typography, 
  Row, 
  Col, 
  Image,
  Divider,
  Space,
  Grid,
  Spin,
  Carousel,
  Tag,
  Card,
  Drawer
} from 'antd';
import { 
  LoginOutlined, 
  UserOutlined,
  HomeOutlined,
  InfoCircleOutlined,
  ContactsOutlined,
  EnvironmentOutlined,
  HistoryOutlined,
  CrownOutlined,
  TrophyOutlined,
  BookOutlined,
  TeamOutlined,
  FacebookOutlined,
  InstagramOutlined,
  TwitterOutlined,
  PhoneOutlined,
  MailOutlined,
  EnvironmentFilled,
  PictureOutlined,
  MenuOutlined,
  RightOutlined,
  LeftOutlined,
  ExperimentOutlined,
  SafetyCertificateOutlined,
  CalendarOutlined,
  ReadOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes, createGlobalStyle } from 'styled-components';
import logo from '../assets/images.png';

// Import the About and Contact components
import About from './Home/About';
import Contact from './Home/FeedBack';

const { Title, Paragraph } = Typography;
const { Header, Content, Footer } = Layout;
const { useBreakpoint } = Grid;

// ==================== GLOBAL STYLES ====================
const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@500;600;700;800&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');
  
  html {
  scroll-behavior: smooth;
  width: 100%;
}

body {
  font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
  color: #1e293b;
  background-color: #0b1b3d;
  margin: 0;
  padding: 0;
  width: 100%;
  -webkit-tap-highlight-color: transparent;
}

  * {
    box-sizing: border-box;
  }

  /* Mobile Navigation Drawer Custom Styling */
  .apex-drawer .ant-drawer-content {
    background-color: #0b1b3d !important;
    color: #ffffff !important;
  }

  .apex-drawer .ant-drawer-header {
    background-color: #061129 !important;
    border-bottom: 1px solid rgba(212, 175, 55, 0.2) !important;
    padding: 16px 20px !important;
  }

  .apex-drawer .ant-drawer-title {
    color: #ffffff !important;
    font-family: 'Cinzel', serif !important;
    font-size: 1.1rem !important;
    font-weight: 700 !important;
    letter-spacing: 0.5px !important;
  }

  .apex-drawer .ant-drawer-close {
    color: #cbd5e1 !important;
    font-size: 18px !important;
    &:hover {
      color: #d4af37 !important;
    }
  }

  .apex-drawer .ant-drawer-body {
    background-color: #0b1b3d !important;
    padding: 12px 0 !important;
  }

  .apex-drawer-menu {
    background: transparent !important;
    border-right: none !important;

    .ant-menu-item {
      color: #e2e8f0 !important;
      font-size: 0.95rem !important;
      font-weight: 500 !important;
      height: 48px !important;
      line-height: 48px !important;
      margin: 4px 12px !important;
      width: calc(100% - 24px) !important;
      border-radius: 6px !important;

      &:hover, &.ant-menu-item-selected {
        color: #d4af37 !important;
        background: rgba(212, 175, 55, 0.12) !important;
      }

      .anticon {
        font-size: 1.1rem !important;
        margin-right: 12px !important;
      }
    }
  }
`;

// ==================== ANIMATIONS ====================
const zoomSlow = keyframes`
  0% { transform: scale(1); }
  100% { transform: scale(1.05); }
`;

// ==================== STYLED COMPONENTS ====================
const StyledLayout = styled(Layout)`
  min-height: 100vh;
  background: #f8fafc;
  width:100%
`;

// Top Bar
const TopBar = styled.div`
  background: #061129;
  color: #cbd5e1;
  font-size: 13px;
  padding: 6px 0;
  border-bottom: 1px solid rgba(212, 175, 55, 0.2);
  width: 100%;
  box-sizing: border-box;
`;

const TopBarContainer = styled.div`
  width: 100%;
  padding: 0 clamp(12px, 2.5vw, 24px);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px 16px;
  box-sizing: border-box;

  @media (max-width: 768px) {
    justify-content: center;
  }

  @media (max-width: 480px) {
    flex-direction: column;
    gap: 6px;
  }
`;

const TopAnnouncement = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;

  .announcement-text {
    font-size: clamp(11px, 1.4vw, 13px);
    color: #cbd5e1;
    white-space: nowrap;

    @media (max-width: 640px) {
      white-space: normal;
      text-align: center;
    }
  }

  @media (max-width: 768px) {
    justify-content: center;
  }
`;

const TopContactInfo = styled.div`
  display: flex;
  gap: clamp(10px, 1.5vw, 20px);
  align-items: center;
  flex-wrap: wrap;

  a, span {
    color: #cbd5e1;
    font-size: clamp(11px, 1.4vw, 13px);
    white-space: nowrap;
    transition: color 0.3s;
    display: inline-flex;
    align-items: center;
    gap: 6px;

    &:hover { color: #d4af37; }
  }

  @media (max-width: 768px) {
    justify-content: center;
  }

  @media (max-width: 380px) {
    gap: 6px 10px;
  }
`;

// Header

const StyledHeader = styled(Header)`
  position: sticky;
  top: 0;
  z-index: 1000;

  width: 100%;
  height: 76px;

  line-height: normal;

  background: rgba(11, 27, 61, 0.94) !important;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);

  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);

  padding: 0;

  display: flex;
  align-items: center;

  box-sizing: border-box;

  @media (max-width: 576px) {
    height: 66px;
  }
`;

const HeaderContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 0 clamp(12px, 2.5vw, 24px);
  box-sizing: border-box;
  gap: 12px;
  min-width: 0;
`;

const BrandWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: clamp(8px, 1.5vw, 14px);
  cursor: pointer;
  flex-shrink: 0;
  min-width: 0;
`;

const LogoImageWrapper = styled.div`
  flex-shrink: 0;
  width: clamp(38px, 4.5vw, 48px);
  height: clamp(38px, 4.5vw, 48px);
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  border-radius: 8px;
  padding: 3px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
`;

const BrandTitle = styled.div`
  display: flex;
  flex-direction: column;
  flex-shrink: 1;
  min-width: 0;
  justify-content: center;

  .name {
    font-family: 'Cinzel', serif;
    font-size: clamp(0.95rem, 2.2vw, 1.25rem);
    font-weight: 700;
    color: #ffffff;
    letter-spacing: 0.5px;
    line-height: 1.15;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .tagline {
    font-size: clamp(0.55rem, 1.2vw, 0.72rem);
    color: #d4af37;
    letter-spacing: clamp(0.5px, 0.2vw, 1.5px);
    text-transform: uppercase;
    font-weight: 600;
    line-height: 1.2;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  @media (max-width: 360px) {
    .tagline {
      display: none;
    }
  }
`;

const StyledMenu = styled(Menu)`
  background: transparent !important;
  border-bottom: none !important;
  flex: 1;
  justify-content: flex-end;
  margin-right: clamp(8px, 1.5vw, 20px);
  min-width: 0;
  display: flex;
  align-items: center;

  .ant-menu-item {
    color: #e2e8f0 !important;
    font-weight: 500;
    font-size: clamp(0.85rem, 1.1vw, 0.95rem);
    padding: 0 clamp(8px, 1.2vw, 16px) !important;
    white-space: nowrap !important;
    display: inline-flex !important;
    align-items: center !important;
    flex-shrink: 0;

    &:hover, &.ant-menu-item-selected {
      color: #d4af37 !important;
      background: transparent !important;
      &::after {
        border-bottom-color: #d4af37 !important;
        border-bottom-width: 3px !important;
      }
    }
  }

  @media (max-width: 992px) {
    display: none !important;
  }
`;

const ActionsGroup = styled.div`
  display: flex;
  align-items: center;
  gap: clamp(8px, 1.5vw, 14px);
  flex-shrink: 0;
`;

const SignInButton = styled(Button)`
  height: clamp(36px, 4vw, 42px);
  padding: 0 clamp(12px, 2vw, 24px);
  font-weight: 600;
  border-radius: 6px;
  background: linear-gradient(135deg, #d4af37 0%, #b8860b 100%);
  border: none;
  color: #0b1b3d;
  box-shadow: 0 4px 14px rgba(212, 175, 55, 0.35);
  flex-shrink: 0;
  white-space: nowrap;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: clamp(0.8rem, 1.1vw, 0.9rem);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    background: linear-gradient(135deg, #f39c12 0%, #d4af37 100%) !important;
    color: #0b1b3d !important;
  }
`;

const MenuToggleButton = styled(Button)`
  display: flex;
  align-items: center;
  justify-content: center;
  height: clamp(36px, 4vw, 42px);
  width: clamp(36px, 4vw, 42px);
  padding: 0;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.08) !important;
  border: 1px solid rgba(255, 255, 255, 0.15) !important;
  color: #ffffff !important;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(212, 175, 55, 0.2) !important;
    border-color: #d4af37 !important;
    color: #d4af37 !important;
  }

  @media (min-width: 993px) {
    display: none !important;
  }
`;

// ==================== CLEAN PICTURE HERO SECTION ====================
const HeroSection = styled.section`
  position: relative;
  background: #061129;
  width: 100%;
  min-height: 480px;
  height: clamp(480px, 75vh, 720px);
  overflow: hidden;
`;

const ArrowButton = styled.div`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 35;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba(11, 27, 61, 0.65);
  border: 1px solid rgba(212, 175, 55, 0.4);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  cursor: pointer;
  backdrop-filter: blur(8px);
  transition: all 0.3s ease;

  &:hover {
    background: #d4af37;
    color: #0b1b3d;
    border-color: #d4af37;
    box-shadow: 0 0 15px rgba(212, 175, 55, 0.5);
  }

  &.prev-arrow { left: 24px; }
  &.next-arrow { right: 24px; }

  @media (max-width: 768px) {
    width: 40px;
    height: 40px;
    font-size: 14px;
    &.prev-arrow { left: 10px; }
    &.next-arrow { right: 10px; }
  }
`;

const StyledCarousel = styled(Carousel)`
  height: 100%;
  
  .slick-list, .slick-track {
    height: 100%;
  }

  .slick-slide {
    height: clamp(480px, 75vh, 720px);
    position: relative;
  }

  .slick-dots {
    bottom: 24px;
    z-index: 30;

    li button {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.5) !important;
      transition: all 0.3s ease;
    }

    li.slick-active button {
      width: 36px;
      border-radius: 6px;
      background: #d4af37 !important;
      box-shadow: 0 0 10px rgba(212, 175, 55, 0.8);
    }
  }
`;

const SlideWrapper = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
`;

const SlideImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center 30%;
  animation: ${zoomSlow} 12s ease-in-out infinite alternate;
  display: block;
`;

// Quick Highlight Banner below Hero
const HeroHighlightBar = styled.div`
  background: #061129;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  padding: 16px 0;
  color: #cbd5e1;
`;

const HighlightItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 0.92rem;
  font-weight: 600;

  .icon {
    color: #d4af37;
    font-size: 20px;
  }
`;

// Welcome & Content Sections
const WelcomeSection = styled.section`
  padding: 80px 0 60px;
  background: #ffffff;
  border-bottom: 1px solid #e2e8f0;
`;

const WelcomeContainer = styled.div`
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 24px;
  text-align: center;
`;

const SectionSubhead = styled.span`
  font-size: 0.85rem;
  font-weight: 700;
  color: #b8860b;
  text-transform: uppercase;
  letter-spacing: 2px;
  display: block;
  margin-bottom: 8px;
`;

const AcademicTitle = styled(Title)`
  font-family: 'Cinzel', serif !important;
  font-size: clamp(2rem, 3.5vw, 3.2rem) !important;
  color: #0b1b3d !important;
  font-weight: 700 !important;
  margin-bottom: 20px !important;
`;

const AcademicParagraph = styled(Paragraph)`
  font-size: 1.1rem;
  line-height: 1.85;
  color: #475569;
  max-width: 860px;
  margin: 0 auto 32px;
`;

const PillarsSection = styled.section`
  padding: 80px 0;
  background: #f8fafc;
`;

const PillarCard = styled(Card)`
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  height: 100%;
  transition: all 0.35s ease;

  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 16px 32px rgba(11, 27, 61, 0.1);
    border-color: #d4af37;
  }

  .ant-card-body {
    padding: 32px 24px;
  }

  .pillar-icon {
    width: 54px;
    height: 54px;
    border-radius: 12px;
    background: linear-gradient(135deg, #0b1b3d 0%, #1e3a8a 100%);
    color: #d4af37;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    margin-bottom: 20px;
  }

  .pillar-title {
    font-family: 'Cinzel', serif;
    font-size: 1.2rem;
    font-weight: 700;
    color: #0b1b3d;
    margin-bottom: 10px;
  }

  .pillar-desc {
    color: #64748b;
    font-size: 0.95rem;
    line-height: 1.6;
    margin: 0;
  }
`;

const StatsSection = styled.section`
  background: linear-gradient(135deg, #0b1b3d 0%, #061129 100%);
  color: #fff;
  padding: 70px 0;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 3px;
    background: linear-gradient(90deg, transparent, #d4af37, transparent);
  }
`;

const StatCard = styled.div`
  text-align: center;
  padding: 16px;

  .stat-icon {
    font-size: 2.2rem;
    color: #d4af37;
    margin-bottom: 12px;
  }

  .stat-number {
    font-family: 'Cinzel', serif;
    font-size: 2.8rem;
    font-weight: 800;
    color: #ffffff;
    line-height: 1;
    margin-bottom: 8px;
  }

  .stat-label {
    font-size: 0.88rem;
    color: #94a3b8;
    text-transform: uppercase;
    letter-spacing: 1.5px;
    font-weight: 600;
  }
`;

const ContentSection = styled.section`
  padding: 80px 0;
  background: ${props => props.bg || '#ffffff'};
`;

const StyledFooter = styled(Footer)`
  background: #040c1e;
  color: #94a3b8;
  padding: 70px 0 30px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
`;

const FooterContainer = styled.div`
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 24px;
`;

const FooterColTitle = styled.h4`
  font-family: 'Cinzel', serif;
  color: #ffffff;
  font-size: 1.1rem;
  font-weight: 700;
  margin-bottom: 24px;
  position: relative;
  padding-bottom: 10px;

  &::after {
    content: '';
    position: absolute;
    bottom: 0; left: 0;
    width: 36px; height: 2px;
    background: #d4af37;
  }
`;

const FooterLink = styled.a`
  color: #94a3b8;
  display: block;
  margin-bottom: 12px;
  transition: all 0.3s ease;

  &:hover {
    color: #d4af37;
    padding-left: 6px;
  }
`;

const SocialIconBox = styled.a`
  width: 40px; height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.06);
  color: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  margin-right: 12px;
  transition: all 0.3s ease;

  &:hover {
    background: #d4af37;
    color: #0b1b3d;
  }
`;

// ==================== MAIN COMPONENT ====================
const Home = () => {
  const navigate = useNavigate();
  const screens = useBreakpoint();
  const carouselRef = useRef(null);

  const [mobileDrawerVisible, setMobileDrawerVisible] = useState(false);
  const [blogImages, setBlogImages] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch blog images from API
  useEffect(() => {
    const fetchBlogImages = async () => {
      try {
        const response = await fetch('https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/get_about_sections.php');
        if (!response.ok) throw new Error('Failed to fetch blog data');
        const data = await response.json();
        
        if (data.data && data.data.length > 0) {
          const images = [];
          for (const section of data.data) {
            try {
              const imagesResponse = await fetch(
                `https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/imagesread.php?section_id=${section.id}`
              );
              if (imagesResponse.ok) {
                const imagesData = await imagesResponse.json();
                if (imagesData.data && imagesData.data.length > 0) {
                  images.push({
                    image: `https://white-trout-460511.hostingersite.com/APEX/${imagesData.data[0].image_path}`,
                    title: section.title
                  });
                }
              }
            } catch (err) {
              console.error(`Error fetching section ${section.id}:`, err);
            }
          }
          setBlogImages(images);
        }
        setLoading(false);
      } catch (err) {
        console.error('Error fetching blog images:', err);
        setLoading(false);
      }
    };

    fetchBlogImages();
  }, []);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (mobileDrawerVisible) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileDrawerVisible]);

  const handleLoginClick = () => {
    navigate('/choose-user');
  };

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileDrawerVisible(false);
  };

  const carouselSettings = {
    dots: true,
    infinite: true,
    speed: 900,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5500,
    pauseOnHover: true,
    arrows: false,
    fade: true
  };

  return (
    <>
      <GlobalStyle />
      <StyledLayout>
      {/* ==================== FIXED HEADER CONTAINER ==================== */}

  {/* TOP ANNOUNCEMENT BAR */}
  <TopBar>
    <TopBarContainer>
      <TopAnnouncement>
        <Tag color="#d4af37" style={{ color: '#0b1b3d', fontWeight: 700, borderRadius: 4, margin: 0 }}>
          ADMISSIONS 2026
        </Tag>
        <span className="announcement-text">
          <CalendarOutlined style={{ marginRight: 6 }} /> 
          Admissions are open for F.Sc, ICS & FA Programs
        </span>
      </TopAnnouncement>
      <TopContactInfo>
        <a href="tel:+921234567890"><PhoneOutlined /> +92 123 4567890</a>
        <a href="mailto:info@apexcollege.edu.pk"><MailOutlined /> info@apexcollege.edu.pk</a>
        <span style={{ cursor: 'pointer', color: '#d4af37' }} onClick={handleLoginClick}>
          <UserOutlined /> Student & Faculty Portal
        </span>
      </TopContactInfo>
    </TopBarContainer>
  </TopBar>

  {/* MAIN HEADER */}
  <StyledHeader>
    <HeaderContainer>
      <BrandWrapper onClick={() => scrollToSection('home')}>
        <LogoImageWrapper>
          <img src={logo} alt="Apex Logo" />
        </LogoImageWrapper>
        <BrandTitle>
          <span className="name">Apex College</span>
          <span className="tagline">Harichand • Higher Education</span>
        </BrandTitle>
      </BrandWrapper>

      {screens.lg ? (
        <StyledMenu mode="horizontal" defaultSelectedKeys={['1']}>
          <Menu.Item key="1" icon={<HomeOutlined />} onClick={() => scrollToSection('home')}>
            Home
          </Menu.Item>
          <Menu.Item key="2" icon={<InfoCircleOutlined />} onClick={() => scrollToSection('about')}>
            About Apex
          </Menu.Item>
          <Menu.Item key="3" icon={<PictureOutlined />} onClick={() => scrollToSection('about')}>
            Campus Life
          </Menu.Item>
          <Menu.Item key="4" icon={<ContactsOutlined />} onClick={() => scrollToSection('contact')}>
            Contact
          </Menu.Item>
        </StyledMenu>
      ) : null}

      <ActionsGroup>
        <SignInButton icon={<LoginOutlined />} onClick={handleLoginClick}>
          Portal Login
        </SignInButton>

        {!screens.lg && (
          <MenuToggleButton 
            type="text" 
            icon={<MenuOutlined style={{ fontSize: '20px' }} />}
            onClick={() => setMobileDrawerVisible(true)}
            aria-label="Toggle navigation menu"
          />
        )}
      </ActionsGroup>
    </HeaderContainer>
  </StyledHeader>

        {/* ==================== MOBILE NAVIGATION DRAWER ==================== */}
        <Drawer
          title="Apex College"
          placement="right"
          onClose={() => setMobileDrawerVisible(false)}
          open={mobileDrawerVisible}
          className="apex-drawer"
          width={280}
        >
          <Menu mode="inline" className="apex-drawer-menu" defaultSelectedKeys={['1']}>
            <Menu.Item key="1" icon={<HomeOutlined />} onClick={() => scrollToSection('home')}>
              Home
            </Menu.Item>
            <Menu.Item key="2" icon={<InfoCircleOutlined />} onClick={() => scrollToSection('about')}>
              About Apex
            </Menu.Item>
            <Menu.Item key="3" icon={<PictureOutlined />} onClick={() => scrollToSection('about')}>
              Campus Life
            </Menu.Item>
            <Menu.Item key="4" icon={<ContactsOutlined />} onClick={() => scrollToSection('contact')}>
              Contact Us
            </Menu.Item>
            <Menu.Item key="5" icon={<UserOutlined />} onClick={() => { setMobileDrawerVisible(false); handleLoginClick(); }} style={{ color: '#d4af37' }}>
              Student & Faculty Portal
            </Menu.Item>
          </Menu>
        </Drawer>

        <Content>
          {/* ==================== CLEAN PICTURE HERO SLIDESHOW ==================== */}
          <HeroSection id="home">
            {/* Custom Carousel Arrows */}
            <ArrowButton className="prev-arrow" onClick={() => carouselRef.current?.prev()}>
              <LeftOutlined />
            </ArrowButton>
            <ArrowButton className="next-arrow" onClick={() => carouselRef.current?.next()}>
              <RightOutlined />
            </ArrowButton>

            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <Spin size="large" tip="Loading Campus Showcase..." />
              </div>
            ) : blogImages.length > 0 ? (
              <StyledCarousel ref={carouselRef} {...carouselSettings}>
                {blogImages.map((item, index) => (
                  <div key={index}>
                    <SlideWrapper>
                      <SlideImage src={item.image} alt={item.title || 'Apex Campus Slide'} />
                    </SlideWrapper>
                  </div>
                ))}
              </StyledCarousel>
            ) : (
              <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '100%',
                background: 'linear-gradient(135deg, #0b1b3d 0%, #061129 100%)',
                color: '#fff'
              }}>
                <Spin size="large" />
              </div>
            )}
          </HeroSection>

          {/* ==================== HERO HIGHLIGHT BAR ==================== */}
          <HeroHighlightBar>
            <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px' }}>
              <Row gutter={[24, 16]} justify="space-around" align="middle">
                <Col xs={24} sm={8}>
                  <HighlightItem>
                    <SafetyCertificateOutlined className="icon" />
                    <span>Board & BISE Recognized Institution</span>
                  </HighlightItem>
                </Col>
                <Col xs={24} sm={8}>
                  <HighlightItem>
                    <ExperimentOutlined className="icon" />
                    <span>State-of-the-Art Science & IT Labs</span>
                  </HighlightItem>
                </Col>
                <Col xs={24} sm={8}>
                  <HighlightItem>
                    <ReadOutlined className="icon" />
                    <span>100% Qualified Professional Faculty</span>
                  </HighlightItem>
                </Col>
              </Row>
            </div>
          </HeroHighlightBar>

          {/* ==================== WELCOME & MISSION SECTION ==================== */}
          <WelcomeSection>
            <WelcomeContainer>
              <SectionSubhead>Premier Educational Institution</SectionSubhead>
              <AcademicTitle level={2}>Welcome to Apex College Harichand</AcademicTitle>
              <AcademicParagraph>
                Established in 2021, Apex College Harichand stands as a beacon of academic distinction and personal growth. 
                Our college combines rigorous curriculum standards with modern educational infrastructure to foster 
                intellectual curiosity, moral leadership, and professional competence in every student.
              </AcademicParagraph>
              
              <Space size="large" wrap justify="center">
                <Button 
                  type="primary" 
                  size="large"
                  style={{ background: '#0b1b3d', borderColor: '#0b1b3d', height: 48, borderRadius: 6, padding: '0 32px' }}
                  icon={<HistoryOutlined />}
                  onClick={() => scrollToSection('about')}
                >
                  Our Heritage
                </Button>
                <Button 
                  size="large"
                  style={{ borderColor: '#0b1b3d', color: '#0b1b3d', height: 48, borderRadius: 6, padding: '0 32px' }}
                  icon={<RightOutlined />}
                  onClick={() => scrollToSection('contact')}
                >
                  Admissions Inquiry
                </Button>
              </Space>
            </WelcomeContainer>
          </WelcomeSection>

          {/* ==================== ACADEMIC PILLARS SECTION ==================== */}
          <PillarsSection>
            <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px' }}>
              <div style={{ textAlign: 'center', marginBottom: 48 }}>
                <SectionSubhead>Why Choose Apex</SectionSubhead>
                <AcademicTitle level={2} style={{ fontSize: '2.2rem' }}>Pillars of Academic Excellence</AcademicTitle>
              </div>

              <Row gutter={[24, 24]}>
                <Col xs={24} sm={12} lg={6}>
                  <PillarCard>
                    <div className="pillar-icon"><BookOutlined /></div>
                    <div className="pillar-title">Rigorous Curriculum</div>
                    <p className="pillar-desc">
                      Comprehensive academic tracks in Pre-Medical, Pre-Engineering, Computer Science, and General Science.
                    </p>
                  </PillarCard>
                </Col>

                <Col xs={24} sm={12} lg={6}>
                  <PillarCard>
                    <div className="pillar-icon"><ExperimentOutlined /></div>
                    <div className="pillar-title">Modern Science Labs</div>
                    <p className="pillar-desc">
                      Fully-equipped physics, chemistry, biology, and computer science facilities designed for hands-on experimentation.
                    </p>
                  </PillarCard>
                </Col>

                <Col xs={24} sm={12} lg={6}>
                  <PillarCard>
                    <div className="pillar-icon"><TeamOutlined /></div>
                    <div className="pillar-title">Distinguished Faculty</div>
                    <p className="pillar-desc">
                      Learn from highly qualified educators committed to individual mentoring and academic growth.
                    </p>
                  </PillarCard>
                </Col>

                <Col xs={24} sm={12} lg={6}>
                  <PillarCard>
                    <div className="pillar-icon"><TrophyOutlined /></div>
                    <div className="pillar-title">Proven Board Results</div>
                    <p className="pillar-desc">
                      Consistently achieving top merit positions in board examinations with high university placement rates.
                    </p>
                  </PillarCard>
                </Col>
              </Row>
            </div>
          </PillarsSection>

          {/* ==================== STATISTICS COUNTER SECTION ==================== */}
          <StatsSection>
            <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px' }}>
              <Row gutter={[32, 32]} justify="space-around">
                <Col xs={12} sm={6}>
                  <StatCard>
                    <CrownOutlined className="stat-icon" />
                    <div className="stat-number">4+</div>
                    <div className="stat-label">Years of Distinction</div>
                  </StatCard>
                </Col>
                <Col xs={12} sm={6}>
                  <StatCard>
                    <BookOutlined className="stat-icon" />
                    <div className="stat-number">10+</div>
                    <div className="stat-label">Academic Programs</div>
                  </StatCard>
                </Col>
                <Col xs={12} sm={6}>
                  <StatCard>
                    <TeamOutlined className="stat-icon" />
                    <div className="stat-number">1,000+</div>
                    <div className="stat-label">Graduated Alumni</div>
                  </StatCard>
                </Col>
                <Col xs={12} sm={6}>
                  <StatCard>
                    <SafetyCertificateOutlined className="stat-icon" />
                    <div className="stat-number">100%</div>
                    <div className="stat-label">Board Accreditation</div>
                  </StatCard>
                </Col>
              </Row>
            </div>
          </StatsSection>

          {/* ==================== ABOUT SECTION ==================== */}
          <ContentSection id="about" bg="#ffffff">
            <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px' }}>
              <About />
            </div>
          </ContentSection>

          {/* ==================== CONTACT SECTION ==================== */}
          <ContentSection id="contact" bg="#f8fafc">
            <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px' }}>
              <Contact />
            </div>
          </ContentSection>
        </Content>

        {/* ==================== FOOTER ==================== */}
        <StyledFooter>
          <FooterContainer>
            <Row gutter={[40, 40]}>
              <Col xs={24} sm={12} lg={8}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                  <img src={logo} alt="Logo" style={{ width: 40, height: 40, background: '#fff', padding: 2, borderRadius: 6 }} />
                  <span style={{ fontFamily: 'Cinzel, serif', color: '#fff', fontSize: '1.3rem', fontWeight: 700 }}>
                    Apex College
                  </span>
                </div>
                <p style={{ color: '#94a3b8', lineHeight: 1.7, fontSize: '0.92rem' }}>
                  Apex College Harichand is dedicated to fostering academic rigor, moral integrity, and modern technological competency for tomorrow's leaders.
                </p>
                <div style={{ marginTop: 20 }}>
                  <SocialIconBox href="#" aria-label="Facebook"><FacebookOutlined /></SocialIconBox>
                  <SocialIconBox href="#" aria-label="Instagram"><InstagramOutlined /></SocialIconBox>
                  <SocialIconBox href="#" aria-label="Twitter"><TwitterOutlined /></SocialIconBox>
                </div>
              </Col>

              <Col xs={24} sm={12} lg={5}>
                <FooterColTitle>Quick Navigation</FooterColTitle>
                <FooterLink onClick={() => scrollToSection('home')}>Home Page</FooterLink>
                <FooterLink onClick={() => scrollToSection('about')}>About Institution</FooterLink>
                <FooterLink onClick={() => scrollToSection('about')}>Campus Life & Blog</FooterLink>
                <FooterLink onClick={() => scrollToSection('contact')}>Contact & Admissions</FooterLink>
                <FooterLink onClick={handleLoginClick}>Portal Sign In</FooterLink>
              </Col>

              <Col xs={24} sm={12} lg={5}>
                <FooterColTitle>Academics</FooterColTitle>
                <FooterLink href="#">F.Sc Pre-Medical</FooterLink>
                <FooterLink href="#">F.Sc Pre-Engineering</FooterLink>
                <FooterLink href="#">ICS (Computer Science)</FooterLink>
                <FooterLink href="#">F.A. General Science</FooterLink>
                <FooterLink href="#">Scholarship Programs</FooterLink>
              </Col>

              <Col xs={24} sm={12} lg={6}>
                <FooterColTitle>Contact Information</FooterColTitle>
                <p style={{ color: '#cbd5e1', marginBottom: 12, fontSize: '0.92rem' }}>
                  <EnvironmentFilled style={{ color: '#d4af37', marginRight: 10 }} />
                  Near Harichand Bazar, Peshawar Road, Pakistan
                </p>
                <p style={{ color: '#cbd5e1', marginBottom: 12, fontSize: '0.92rem' }}>
                  <PhoneOutlined style={{ color: '#d4af37', marginRight: 10 }} />
                  +92 123 4567890
                </p>
                <p style={{ color: '#cbd5e1', marginBottom: 12, fontSize: '0.92rem' }}>
                  <MailOutlined style={{ color: '#d4af37', marginRight: 10 }} />
                  info@apexcollege.edu.pk
                </p>
              </Col>
            </Row>

            <Divider style={{ borderColor: 'rgba(255, 255, 255, 0.1)', margin: '40px 0 24px' }} />

            <Row justify="space-between" align="middle">
              <Col xs={24} sm={12}>
                <p style={{ color: '#64748b', fontSize: '0.85rem', margin: 0 }}>
                  © {new Date().getFullYear()} Apex College Harichand. All rights reserved.
                </p>
              </Col>
              <Col xs={24} sm={12} style={{ textAlign: screens.sm ? 'right' : 'left', marginTop: screens.sm ? 0 : 12 }}>
                <span style={{ color: '#64748b', fontSize: '0.85rem' }}>
                  Recognized Educational Board Affiliate
                </span>
              </Col>
            </Row>
          </FooterContainer>
        </StyledFooter>
      </StyledLayout>
    </>
  );
};

export default Home;