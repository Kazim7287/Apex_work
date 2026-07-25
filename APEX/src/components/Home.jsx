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
  Alert
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
  ReloadOutlined
} from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import logo from '../assets/images.png';
// import backgroundImage from '../assets/img3.jpg';
import clgImage from '../assets/clg.png'; // Import the principal college image

const { Text, Title, Paragraph } = Typography;
const { Header, Content, Footer } = Layout;
const { useBreakpoint } = Grid;

// Animations
const slideInFromBottom = keyframes`
  from {
    transform: translateY(30px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`;

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const gradientBackground = keyframes`
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
`;

// Enhanced Typing Animation with Erasing
const typing = keyframes`
  from { width: 0 }
  to { width: 100% }
`;

const erasing = keyframes`
  from { width: 100% }
  to { width: 0% }
`;

const blinkCaret = keyframes`
  from, to { border-color: transparent }
  50% { border-color: #1890ff }
`;

// Slide in animations for student images
const slideInFromLeft = keyframes`
  from {
    transform: translateX(-100px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`;

const slideInFromRight = keyframes`
  from {
    transform: translateX(100px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`;

// Styled Components
const StyledLayout = styled(Layout)`
  min-height: 100vh;
  background: linear-gradient(rgba(255, 255, 255, 0.92), rgba(255, 255, 255, 0.95)), 
              // 
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-attachment: fixed;
`;

const StyledHeader = styled(Header)`
  position: sticky;
  top: 0;
  z-index: 1000;
  width: 100%;
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.95) !important;
  backdrop-filter: blur(8px);
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.08);
  padding: 0;
  transition: all 0.3s ease;

  @media (max-width: 768px) {
    padding: 0 16px;
  }
`;

const HeaderContainer = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;

  @media (max-width: 768px) {
    padding: 0 16px;
  }
`;

const LogoImage = styled(Image)`
  margin-right: 24px;
  object-fit: contain;
  transition: transform 0.3s ease;

  &:hover {
    transform: scale(1.05);
  }

  @media (max-width: 768px) {
    width: 48px !important;
    margin-right: 12px;
  }
`;

const StyledMenu = styled(Menu)`
  flex: 1;
  border-bottom: none !important;
  line-height: 64px;
  background: transparent !important;

  .ant-menu-item {
    padding: 0 12px;
    margin: 0 4px !important;
    border-radius: 6px;
    transition: all 0.3s ease;

    &:hover {
      background: rgba(24, 144, 255, 0.1) !important;
    }
  }

  .ant-menu-item-selected {
    background: rgba(24, 144, 255, 0.1) !important;
    color: #1890ff !important;
  }

  @media (max-width: 768px) {
    display: none;
  }
`;

const MobileMenuButton = styled(Button)`
  display: none;
  margin-left: auto;

  @media (max-width: 768px) {
    display: block;
  }
`;

const StyledContent = styled(Content)`
  width: 100%;
  margin: 0 auto;
`;

const HeroSection = styled.div`
  width: 100%;
  padding: 60px 0;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 90vh;

  @media (max-width: 992px) {
    padding: 40px 0;
    min-height: auto;
  }
`;

const HeroContainer = styled.div`
  max-width: 1200px;
  width: 100%;
  padding: 0 24px;
  margin: 0 auto;

  @media (max-width: 768px) {
    padding: 0 16px;
  }
`;

const CircularImage = styled(Image)`
  border-radius: 50%;
  width: 100%;
  max-width: 400px;
  height: 400px;
  object-fit: cover;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.12);
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  animation: ${slideInFromBottom} 0.8s ease-out forwards;
  margin-left: auto;
  display: block;
  
  &:hover {
    transform: scale(1.05) rotate(2deg);
    box-shadow: 0 16px 40px rgba(0, 0, 0, 0.18);
  }

  @media (max-width: 992px) {
    max-width: 320px;
    height: 320px;
  }

  @media (max-width: 768px) {
    max-width: 280px;
    height: 280px;
    margin: 32px auto 0;
  }
`;

const ImageContainer = styled(Col)`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  
  @media (max-width: 768px) {
    justify-content: center;
  }
`;

const TypingContainer = styled.div`
  position: relative;
  min-height: 120px;
  margin-bottom: 24px;
  width: 100%;
  overflow: visible;
`;

const MainTitle = styled(Title)`
  font-size: 2.8rem !important;
  font-weight: 800 !important;
  margin-bottom: 16px !important;
  color: #1a1a1a !important;
  line-height: 1.2 !important;
  background: linear-gradient(-45deg, #1890ff, #722ed1, #13c2c2);
  background-size: 300% 300%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: ${gradientBackground} 8s ease infinite;
  overflow: visible;
  white-space: nowrap;
  border-right: 0.15em solid #1890ff;
  width: 0;
  
  &.typing {
    animation: 
      ${gradientBackground} 8s ease infinite,
      ${typing} 1.5s steps(30, end) forwards,
      ${blinkCaret} 0.75s step-end infinite;
  }

  &.erasing {
    animation: 
      ${gradientBackground} 8s ease infinite,
      ${erasing} 1s steps(30, end) forwards,
      ${blinkCaret} 0.75s step-end infinite;
  }

  @media (max-width: 992px) {
    font-size: 2.4rem !important;
  }

  @media (max-width: 768px) {
    font-size: 2rem !important;
    white-space: normal;
    border-right: none;
  }
`;

const SubTitle = styled(Title)`
  font-size: 1.5rem !important;
  font-weight: 500 !important;
  color: #4a4a4a !important;
  overflow: visible;
  white-space: nowrap;
  border-right: 0.15em solid #1890ff;
  width: 0;
  
  &.typing {
    animation: 
      ${typing} 2s steps(40, end) forwards,
      ${blinkCaret} 0.75s step-end infinite;
  }

  &.erasing {
    animation: 
      ${erasing} 1.5s steps(40, end) forwards,
      ${blinkCaret} 0.75s step-end infinite;
  }

  @media (max-width: 992px) {
    font-size: 1.3rem !important;
  }

  @media (max-width: 768px) {
    font-size: 1.1rem !important;
    white-space: normal;
    border-right: none;
  }
`;

const HeroParagraph = styled(Paragraph)`
  font-size: 1.1rem;
  line-height: 1.8;
  margin-bottom: 24px;
  color: #4a4a4a;
  text-align: justify;
  width: 100%;

  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const StyledButton = styled(Button)`
  height: 48px;
  padding: 0 24px;
  font-weight: 500;
  border-radius: 8px;
  transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);

  &.primary-btn {
    background: linear-gradient(45deg, #1890ff, #096dd9);
    border: none;
    color: white;
    box-shadow: 0 4px 12px rgba(24, 144, 255, 0.3);

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 16px rgba(24, 144, 255, 0.4);
      background: linear-gradient(45deg, #1890ff, #1890ff);
    }
  }

  &.secondary-btn {
    border-color: #1890ff;
    color: #1890ff;

    &:hover {
      color: white;
      background: #1890ff;
      transform: translateY(-2px);
      box-shadow: 0 8px 16px rgba(24, 144, 255, 0.2);
    }
  }
`;

const StyledFooter = styled(Footer)`
  text-align: center;
  background: #000;
  color: white;
  padding: 48px 0;
`;

const FooterContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
`;

const FooterSection = styled.div`
  margin-bottom: 24px;
`;

const SocialIcons = styled.div`
  display: flex;
  justify-content: center;
  gap: 20px;
  margin: 20px 0;
  font-size: 24px;
`;

const ContactInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin: 20px 0;
`;

const ContactItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
`;

const MobileMenu = styled.div`
  display: none;
  width: 100%;
  background: white;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-radius: 0 0 8px 8px;
  animation: ${fadeIn} 0.3s ease-out;
  position: absolute;
  top: 100%;
  left: 0;
  z-index: 999;

  @media (max-width: 768px) {
    display: ${props => (props.visible ? 'block' : 'none')};
  }
`;

const WelcomeText = styled.div`
  position: relative;
  padding-left: 24px;
  border-left: 3px solid #1890ff;
  margin-bottom: 32px;
  width: 100%;
  animation: ${fadeIn} 0.8s ease-out forwards;
  opacity: 0;
  animation-delay: 0.5s;

  &::before {
    content: "❝";
    position: absolute;
    left: -10px;
    top: -20px;
    font-size: 48px;
    color: rgba(24, 144, 255, 0.2);
  }

  @media (max-width: 768px) {
    width: 100%;
    padding-left: 16px;
  }
`;

const StatsSection = styled.div`
  width: 100%;
  padding: 80px 0;
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(12px);
`;

const StatsContainer = styled.div`
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  padding: 0 24px;

  @media (max-width: 768px) {
    padding: 0 16px;
  }
`;

const StatCard = styled(Col)`
  text-align: center;
  padding: 24px;
  
  .stat-icon {
    font-size: 2.5rem;
    margin-bottom: 16px;
    color: #1890ff;
  }
  
  .stat-number {
    font-size: 2.5rem;
    font-weight: 700;
    color: #1890ff;
    margin-bottom: 8px;
  }
  
  .stat-label {
    font-size: 1rem;
    color: #595959;
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  @media (max-width: 768px) {
    padding: 16px;
    
    .stat-icon {
      font-size: 2rem;
    }
    
    .stat-number {
      font-size: 2rem;
    }
  }
`;

const ContentSection = styled.div`
  width: 100%;
  padding: 40px 0;
  animation: ${fadeIn} 0.8s ease-out forwards;
  opacity: 0;
  animation-delay: 0.7s;
`;

// Student Gallery Section




const StudentImageWrapper = styled.div`
  position: relative;
  width: 250px;
  height: 300px;
  overflow: hidden;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  transition: all 0.4s ease;
  opacity: 0;
  transform: ${props => props.side === 'left' ? 'translateX(-100px)' : 'translateX(100px)'};
  
  &.visible {
    opacity: 1;
    transform: translateX(0);
    animation: ${props => props.side === 'left' ? slideInFromLeft : slideInFromRight} 0.8s ease-out forwards;
  }
  
  &:hover {
    transform: translateY(-8px) scale(1.03);
    box-shadow: 0 16px 32px rgba(0, 0, 0, 0.2);
  }
`;



const Home = () => {
  const navigate = useNavigate();
  const screens = useBreakpoint();
  const [mobileMenuVisible, setMobileMenuVisible] = useState(false);
  const [typingComplete, setTypingComplete] = useState(false);
  const [currentTitle, setCurrentTitle] = useState("Welcome to Apex College");
  const [currentSubtitle, setCurrentSubtitle] = useState("Where dreams touch reality");
  const [showContent, setShowContent] = useState(false);
  const [, setVisibleImages] = useState([]);
  const [imagesLoading, setImagesLoading] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [studentImages, setStudentImages] = useState([]);
  
  const studentImagesRef = useRef(null);
  
  // College and student images
  const collegeMainImage = {
    src: clgImage, // Use the imported clg.png image
    title: "Apex College Campus",
    description: "Beautiful campus of Apex College Harichand",
    credit: "College Administration",
    creditLink: "#"
  };

  // Initialize student images with placeholders
  useEffect(() => {
    const initialStudentImages = [
      {
        src: "https://via.placeholder.com/400x500/1890ff/ffffff?text=Academic+Excellence",
        title: "Academic Excellence",
        description: "Students achieving academic success",
        credit: "College Administration",
        creditLink: "#"
      },
      {
        src: "https://via.placeholder.com/400x500/722ed1/ffffff?text=Science+Laboratory",
        title: "Science Laboratory",
        description: "Students conducting experiments",
        credit: "College Administration",
        creditLink: "#"
      },
      {
        src: "https://via.placeholder.com/400x500/13c2c2/ffffff?text=Student+Life",
        title: "Student Life",
        description: "Vibrant campus community activities",
        credit: "College Administration",
        creditLink: "#"
      },
      {
        src: "https://via.placeholder.com/400x500/52c41a/ffffff?text=College+Sports",
        title: "College Sports",
        description: "Athletic achievements and competitions",
        credit: "College Administration",
        creditLink: "#"
      }
    ];
    setStudentImages(initialStudentImages);
  }, []);

  // Function to refresh images (just a simple rotation of images)
  

  useEffect(() => {
    let currentIndex = 0;
    const totalTitles = titles.length;

    // Initial typing animation
    const initialTyping = setTimeout(() => {
      const mainTitle = document.querySelector('.main-title');
      if (mainTitle) mainTitle.classList.add('typing');
    }, 500);

    const initialSubtitleTyping = setTimeout(() => {
      const subTitle = document.querySelector('.sub-title');
      if (subTitle) subTitle.classList.add('typing');
    }, 2000);

    const showAllContent = setTimeout(() => {
      setTypingComplete(true);
      setShowContent(true);
    }, 4000);

    // Cycle through titles and subtitles
    const cycleInterval = setInterval(() => {
      const mainTitle = document.querySelector('.main-title');
      const subTitle = document.querySelector('.sub-title');
      
      if (mainTitle && subTitle) {
        // First erase current text
        mainTitle.classList.remove('typing');
        mainTitle.classList.add('erasing');
        subTitle.classList.remove('typing');
        subTitle.classList.add('erasing');

        // After erasing, update text and type again
        setTimeout(() => {
          currentIndex = (currentIndex + 1) % totalTitles;
          setCurrentTitle(titles[currentIndex]);
          setCurrentSubtitle(subtitles[currentIndex]);

          mainTitle.classList.remove('erasing');
          subTitle.classList.remove('erasing');

          setTimeout(() => {
            mainTitle.classList.add('typing');
            setTimeout(() => {
              subTitle.classList.add('typing');
            }, 1000);
          }, 500);
        }, 1500);
      }
    }, 8000); // Change every 8 seconds

    // Intersection Observer for student images animation
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = parseInt(entry.target.dataset.index);
            setTimeout(() => {
              setVisibleImages(prev => [...prev, index]);
            }, index * 200); // Stagger the animation
          }
        });
      },
      { threshold: 0.3 }
    );

    // Observe student images container
    if (studentImagesRef.current) {
      const imageWrappers = studentImagesRef.current.querySelectorAll('.student-image-wrapper');
      imageWrappers.forEach(wrapper => {
        observer.observe(wrapper);
      });
    }

    return () => {
      clearTimeout(initialTyping);
      clearTimeout(initialSubtitleTyping);
      clearTimeout(showAllContent);
      clearInterval(cycleInterval);
      observer.disconnect();
    };
  }, []);

  const titles = [
    "Welcome to Apex College",
    "A Legacy of Excellence",
    "Since 2021",
    "Center of Academic Excellence"
  ];

  const subtitles = [
    "Where Tradition Meets Innovation",
    "Shaping Future Leaders",
    "Nurturing Minds, Building Character",
    "Pioneering Education in Pakistan"
  ];

  const handleLoginClick = () => {
    navigate('/choose-user');
  };

  const toggleMobileMenu = () => {
    setMobileMenuVisible(!mobileMenuVisible);
  };

  return (
    <StyledLayout>
      <StyledHeader>
        <HeaderContainer>
          <LogoImage
            width={60}
            src={logo}
            preview={false}
          />
          
          {screens.md ? (
            <StyledMenu
              theme="light"
              mode="horizontal"
              defaultSelectedKeys={['1']}
            >
              <Menu.Item key="1" icon={<HomeOutlined />}>
                <Link to="/">Home</Link>
              </Menu.Item>
              <Menu.Item key="2" icon={<InfoCircleOutlined />}>
                <Link to="/about">Blog</Link>
              </Menu.Item>
              <Menu.Item key="3" icon={<ContactsOutlined />}>
                <Link to="/contact">Feedback</Link>
              </Menu.Item>
            </StyledMenu>
          ) : (
            <MobileMenuButton 
              icon={<UserOutlined />} 
              onClick={toggleMobileMenu}
            />
          )}

          <Space>
            <StyledButton 
              type="primary" 
              icon={<LoginOutlined />}
              onClick={handleLoginClick}
              className="primary-btn"
              style={{ marginLeft: '16px' }}
            >
              {screens.sm ? 'Sign In' : <LoginOutlined />}
            </StyledButton>
          </Space>
        </HeaderContainer>
      </StyledHeader>

      <MobileMenu visible={mobileMenuVisible}>
        <Menu
          mode="vertical"
          style={{ borderRight: 'none' }}
        >
          <Menu.Item key="1" icon={<HomeOutlined />}>
            <Link to="/" onClick={() => setMobileMenuVisible(false)}>Home</Link>
          </Menu.Item>
          <Menu.Item key="2" icon={<InfoCircleOutlined />}>
            <Link to="/about" onClick={() => setMobileMenuVisible(false)}>Blog</Link>
          </Menu.Item>
          <Menu.Item key="3" icon={<ContactsOutlined />}>
            <Link to="/contact" onClick={() => setMobileMenuVisible(false)}>Feedback</Link>
          </Menu.Item>
        </Menu>
      </MobileMenu>

      <StyledContent>
        <HeroSection>
          <HeroContainer>
            <Row gutter={[48, 48]} align="middle">
              <Col xs={24} md={14}>
                <TypingContainer>
                  <MainTitle level={1} className="main-title">
                    {currentTitle}
                  </MainTitle>
                  <SubTitle level={2} className="sub-title">
                    {currentSubtitle}
                  </SubTitle>
                </TypingContainer>
                
                {showContent && (
                  <ContentSection>
                    <WelcomeText>
                      <HeroParagraph>
                        Established in 2021, Apex College Harichand stands as a beacon of knowledge and tradition. Our institution has shaped generations of leaders, thinkers, and innovators who have made significant contributions to society.
                      </HeroParagraph>
                      <HeroParagraph>
                        With our rich heritage, state-of-the-art facilities, and commitment to academic excellence, we provide an environment where students can thrive intellectually, socially, and spiritually.
                      </HeroParagraph>
                    </WelcomeText>
                    
                    <Divider />
                    <Space size="middle">
                      <StyledButton 
                        type="primary" 
                        className="primary-btn"
                        icon={<HistoryOutlined />}
                      >
                        <Link to="/about">Explore History</Link>
                      </StyledButton>
                      <StyledButton 
                        className="secondary-btn"
                        icon={<EnvironmentOutlined />}
                      >
                        <Link to="/contact">Visit Us</Link>
                      </StyledButton>
                    </Space>
                  </ContentSection>
                )}
              </Col>
              
              <ImageContainer xs={24} md={10}>
                <CircularImage
                  src={collegeMainImage.src}
                  preview={false}
                  alt={collegeMainImage.description}
                />
              </ImageContainer>
            </Row>
          </HeroContainer>
        </HeroSection>

        {/* Statistics Section */}
        <StatsSection>
          <StatsContainer>
            <Row gutter={[24, 24]} justify="space-around">
              <StatCard xs={12} sm={6}>
                <CrownOutlined className="stat-icon" />
                <div className="stat-number">4+</div>
                <div className="stat-label">Years of Excellence</div>
              </StatCard>
              <StatCard xs={12} sm={6}>
                <BookOutlined className="stat-icon" />
                <div className="stat-number">10+</div>
                <div className="stat-label">Programs</div>
              </StatCard>
              <StatCard xs={12} sm={6}>
                <TeamOutlined className="stat-icon" />
                <div className="stat-number">1000+</div>
                <div className="stat-label">Alumni</div>
              </StatCard>
              <StatCard xs={12} sm={6}>
                <TrophyOutlined className="stat-icon" />
                <div className="stat-number">100+</div>
                <div className="stat-label">Awards</div>
              </StatCard>
            </Row>
          </StatsContainer>
        </StatsSection>

        {/* Student Gallery Section */}
        {/* <StudentGallerySection> */}
      </StyledContent>

      <StyledFooter>
        <FooterContent>
          <Row gutter={[24, 24]}>
            <Col xs={24} md={8}>
              <FooterSection>
                <Title level={4} style={{ color: 'white' }}>Apex College Harichand</Title>
                <Paragraph style={{ color: '#ccc' }}>
                  Committed to excellence in education since 2021. Shaping the future leaders of tomorrow.
                </Paragraph>
              </FooterSection>
            </Col>
            <Col xs={24} md={8}>
              <FooterSection>
                <Title level={4} style={{ color: 'white' }}>Quick Links</Title>
                <Menu theme="dark" mode="vertical" style={{ background: 'transparent', border: 'none' }}>
                  <Menu.Item key="1">
                    <Link to="/" style={{ color: '#ccc' }}>Home</Link>
                  </Menu.Item>
                  <Menu.Item key="2">
                    <Link to="/about" style={{ color: '#ccc' }}>Blog</Link>
                  </Menu.Item>
                  <Menu.Item key="3">
                    <Link to="/contact" style={{ color: '#ccc' }}>Feedback</Link>
                  </Menu.Item>
                </Menu>
              </FooterSection>
            </Col>
            <Col xs={24} md={8}>
              <FooterSection>
                <Title level={4} style={{ color: 'white' }}>Contact Us</Title>
                <ContactInfo>
                  <ContactItem>
                    <EnvironmentFilled style={{ color: '#1890ff' }} />
                    <Text style={{ color: '#ccc' }}>Harichand, KP, Pakistan</Text>
                  </ContactItem>
                  <ContactItem>
                    <PhoneOutlined style={{ color: '#1890ff' }} />
                    <Text style={{ color: '#ccc' }}>+92 346 9717399</Text>
                  </ContactItem>
                  <ContactItem>
                    <MailOutlined style={{ color: '#1890ff' }} />
                    <Text style={{ color: '#ccc' }}>info@apexcollege.edu.pk</Text>
                  </ContactItem>
                </ContactInfo>
              </FooterSection>
            </Col>
          </Row>
          
          <Divider style={{ borderColor: '#333' }} />
          
          <SocialIcons>
            <a href="#" style={{ color: 'white' }}>
              <FacebookOutlined />
            </a>
            <a href="#" style={{ color: 'white' }}>
              <InstagramOutlined />
            </a>
            <a href="#" style={{ color: 'white' }}>
              <TwitterOutlined />
            </a>
          </SocialIcons>
          
          <Paragraph style={{ color: '#999', margin: 0 }}>
            © 2025 Apex College Harichand. All rights reserved.
          </Paragraph>
        </FooterContent>
      </StyledFooter>
    </StyledLayout>
  );
};

export default Home;