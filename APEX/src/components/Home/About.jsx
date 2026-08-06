/* eslint-disable react/no-unescaped-entities */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { 
  Row,
  Col,
  Tag,
  Button,
  Modal,
  Spin,
  Typography,
  Card
} from 'antd';
import { 
  PictureOutlined,
  SyncOutlined,
  UserOutlined,
  MailOutlined,
  CloseOutlined,
  RightOutlined,
  CrownOutlined,
  SafetyCertificateOutlined
} from '@ant-design/icons';
import styled, { keyframes } from 'styled-components';
import principalImage from '/src/assets/clg4.png';
import './About.css';

const { Paragraph } = Typography;

// ==================== STYLED COMPONENTS ====================
const AboutWrapper = styled.div`
  width: 100%;
  font-family: 'Plus Jakarta Sans', sans-serif;
`;

const SectionHeaderWrapper = styled.div`
  text-align: center;
  max-width: 700px;
  margin: 0 auto 50px;
`;

const SectionBadge = styled(Tag)`
  background: rgba(212, 175, 55, 0.15);
  border: 1px solid #d4af37;
  color: #b8860b;
  font-weight: 700;
  padding: 4px 14px;
  border-radius: 20px;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  font-size: 0.8rem;
  margin-bottom: 12px;
`;

const SectionTitle = styled.h2`
  font-family: 'Cinzel', serif;
  font-size: clamp(1.8rem, 3vw, 2.6rem);
  color: #0b1b3d;
  font-weight: 700;
  margin: 0 0 12px;
`;

const SectionSubtitle = styled.p`
  color: #64748b;
  font-size: 1rem;
  line-height: 1.6;
`;

// Hero / Heritage Card
const HeroCard = styled.div`
  background: #ffffff;
  border-radius: 16px;
  padding: 48px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 10px 30px rgba(11, 27, 61, 0.05);

  @media (max-width: 768px) {
    padding: 24px;
  }
`;

const HighlightText = styled.span`
  color: #d4af37;
  font-family: 'Cinzel', serif;
`;

const StatBox = styled.div`
  display: flex;
  align-items: center;
  gap: 24px;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #e2e8f0;

  .stat-item {
    display: flex;
    flex-direction: column;
  }

  .stat-number {
    font-family: 'Cinzel', serif;
    font-size: 2rem;
    font-weight: 800;
    color: #0b1b3d;
    line-height: 1;
  }

  .stat-label {
    font-size: 0.85rem;
    color: #64748b;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-top: 4px;
  }

  .stat-divider {
    width: 1px;
    height: 40px;
    background: #e2e8f0;
  }
`;

// ==================== PROMINENT PRINCIPAL CARD ====================
const LeadershipCard = styled.div`
  background: #ffffff;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 16px 36px rgba(11, 27, 61, 0.12);
  border: 2px solid #d4af37;
  display: flex;
  flex-direction: column;
`;

const LeadershipImageContainer = styled.div`
  width: 100%;
  height: 420px;
  position: relative;
  background: #0b1b3d;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center 8%; /* Shifts the image UP so face is clear */
    transition: transform 0.5s ease;
  }

  &:hover img {
    transform: scale(1.03);
  }
`;

const PrincipalBadgeTag = styled.div`
  position: absolute;
  top: 16px;
  left: 16px;
  background: rgba(11, 27, 61, 0.88);
  border: 1px solid #d4af37;
  color: #fef08a;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 1px;
  text-transform: uppercase;
  backdrop-filter: blur(4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  gap: 6px;
`;

const LeadershipDetails = styled.div`
  padding: 24px;
  background: #0b1b3d;
  color: #ffffff;
`;

const PrincipalName = styled.h3`
  font-family: 'Cinzel', serif;
  font-size: 1.35rem;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 4px;
`;

const PrincipalTitle = styled.div`
  color: #d4af37;
  font-size: 0.88rem;
  font-weight: 600;
  letter-spacing: 1px;
  text-transform: uppercase;
  margin-bottom: 14px;
`;

const QuoteBox = styled.blockquote`
  margin: 0 0 16px;
  font-size: 0.92rem;
  font-style: italic;
  color: #cbd5e1;
  border-left: 3px solid #d4af37;
  padding-left: 12px;
  line-height: 1.5;
`;

const ContactBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.85rem;
  color: #94a3b8;
  padding-top: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);

  .icon {
    color: #d4af37;
  }
`;

// Faculty Cards
const FacultyCard = styled(Card)`
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  text-align: center;
  transition: all 0.35s ease;
  height: 100%;

  &:hover {
    transform: translateY(-6px);
    border-color: #d4af37;
    box-shadow: 0 16px 32px rgba(11, 27, 61, 0.08);
  }

  .ant-card-body {
    padding: 28px 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
`;

const FacultyAvatarWrapper = styled.div`
  width: 90px;
  height: 90px;
  border-radius: 50%;
  padding: 4px;
  background: linear-gradient(135deg, #d4af37 0%, #b8860b 100%);
  margin-bottom: 16px;

  img, .avatar-fallback {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    object-fit: cover;
    background: #0b1b3d;
    color: #d4af37;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 32px;
  }
`;

const FacultyName = styled.h3`
  font-family: 'Cinzel', serif;
  font-size: 1.15rem;
  font-weight: 700;
  color: #0b1b3d;
  margin: 0 0 4px;
`;

const FacultyDesignation = styled(Tag)`
  background: #f1f5f9;
  color: #0b1b3d;
  border: none;
  font-weight: 600;
  font-size: 0.8rem;
  margin-bottom: 8px;
`;

const FacultyQualification = styled.span`
  color: #b8860b;
  font-size: 0.85rem;
  font-weight: 600;
  margin-bottom: 12px;
`;

// Blog Cards
const BlogCard = styled(Card)`
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.35s ease;
  height: 100%;

  &:hover {
    transform: translateY(-6px);
    border-color: #d4af37;
    box-shadow: 0 16px 32px rgba(11, 27, 61, 0.08);

    .blog-img-zoom {
      transform: scale(1.06);
    }
  }

  .ant-card-body {
    padding: 20px;
  }
`;

const BlogImageContainer = styled.div`
  width: 100%;
  height: 210px;
  position: relative;
  overflow: hidden;
  background: #0b1b3d;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.5s ease;
  }

  .count-badge {
    position: absolute;
    top: 12px;
    right: 12px;
    background: rgba(11, 27, 61, 0.85);
    color: #fef08a;
    border: 1px solid #d4af37;
    font-size: 0.78rem;
    font-weight: 600;
    padding: 3px 10px;
    border-radius: 12px;
    backdrop-filter: blur(4px);
  }
`;

const BlogTitle = styled.h3`
  font-family: 'Cinzel', serif;
  font-size: 1.1rem;
  font-weight: 700;
  color: #0b1b3d;
  margin: 0 0 10px;
  line-height: 1.35;
`;

const BlogExcerpt = styled.p`
  color: #64748b;
  font-size: 0.9rem;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-bottom: 16px;
`;

// ==================== MAIN COMPONENT ====================
const About = () => {
  const [visible, setVisible] = useState(false);
  const [currentSection, setCurrentSection] = useState(null);
  const [sectionsWithImages, setSectionsWithImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [faculty, setFaculty] = useState([]);
  const [facultyLoading, setFacultyLoading] = useState(true);
  const [facultyError, setFacultyError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Fetch faculty data
  useEffect(() => {
    const fetchFaculty = async () => {
      try {
        setFacultyLoading(true);
        const response = await fetch('https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/faculty.php');
        if (!response.ok) throw new Error('Failed to fetch faculty data');
        const data = await response.json();
        if (data.success) {
          setFaculty(data.data);
        } else {
          throw new Error(data.error || 'Failed to fetch faculty data');
        }
      } catch (err) {
        setFacultyError(err.message);
      } finally {
        setFacultyLoading(false);
      }
    };

    fetchFaculty();
  }, [refreshKey]);

  // Fetch about sections data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const sectionsResponse = await fetch('https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/get_about_sections.php');
        if (!sectionsResponse.ok) throw new Error('Failed to fetch about sections');
        const sectionsData = await sectionsResponse.json();

        const sectionsWithImagesData = await Promise.all(
          sectionsData.data.map(async (section) => {
            try {
              const imagesResponse = await fetch(
                `https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/imagesread.php?section_id=${section.id}`
              );
              if (!imagesResponse.ok) return { ...section, images: [] };
              const imagesData = await imagesResponse.json();
              return { 
                ...section, 
                images: imagesData.data || [],
                content: section.content || section.description || 'No description available'
              };
            } catch (err) {
              return { 
                ...section, 
                images: [],
                content: section.content || section.description || 'No description available'
              };
            }
          })
        );

        setSectionsWithImages(sectionsWithImagesData);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const showSectionModal = (section) => {
    setCurrentSection(section);
    setVisible(true);
  };

  if (loading || facultyLoading) {
    return (
      <div style={{ padding: '80px 0', textAlign: 'center' }}>
        <Spin size="large" tip="Loading Campus Information..." />
      </div>
    );
  }

  return (
    <AboutWrapper>
      {/* ========== HERO / ABOUT HERITAGE SECTION ========== */}
      <div style={{ marginBottom: 80 }}>
        <HeroCard>
          <Row gutter={[48, 48]} align="middle">
            <Col xs={24} lg={14}>
              <SectionBadge>ABOUT OUR INSTITUTION</SectionBadge>
              <h1 style={{ 
                fontFamily: 'Cinzel, serif', 
                fontSize: 'clamp(2rem, 3.5vw, 3rem)', 
                color: '#0b1b3d', 
                fontWeight: 700, 
                lineHeight: 1.2,
                marginBottom: 20
              }}>
                About Apex College <HighlightText>Harichand</HighlightText>
              </h1>
              <Paragraph style={{ fontSize: '1.05rem', lineHeight: 1.8, color: '#475569', marginBottom: 16 }}>
                Apex College Harichand is a premier higher secondary education institution in Pakistan, established in 2021. 
                Founded with a mission to nurture academic brilliance and moral leadership, it serves as a transformative hub 
                for students across the region.
              </Paragraph>
              <Paragraph style={{ fontSize: '1.05rem', lineHeight: 1.8, color: '#475569' }}>
                Renowned for its rigorous academic curriculum, distinguished faculty, and modern laboratory infrastructure, 
                Apex College prepares students to excel in competitive board examinations and top university admissions.
              </Paragraph>
              
              <StatBox>
                <div className="stat-item">
                  <span className="stat-number">2021</span>
                  <span className="stat-label">Established</span>
                </div>
                <div className="stat-divider" />
                <div className="stat-item">
                  <span className="stat-number">10+</span>
                  <span className="stat-label">Academic Programs</span>
                </div>
                <div className="stat-divider" />
                <div className="stat-item">
                  <span className="stat-number">1,000+</span>
                  <span className="stat-label">Graduated Alumni</span>
                </div>
              </StatBox>
            </Col>

            {/* ========== UN-OBSCURED PRINCIPAL PICTURE CARD ========== */}
            <Col xs={24} lg={10}>
              <LeadershipCard>
                <LeadershipImageContainer>
                  <PrincipalBadgeTag>
                    <CrownOutlined /> Leadership
                  </PrincipalBadgeTag>
                  <img 
                    src={principalImage} 
                    alt="Eng. Naveed Ahmad, MD Apex College Harichand" 
                  />
                </LeadershipImageContainer>
                
                <LeadershipDetails>
                  <PrincipalName>Eng. Naveed Ahmad</PrincipalName>
                  <PrincipalTitle>Managing Director (MD)</PrincipalTitle>
                  <QuoteBox>
                    "Shaping future academic leaders through quality education, discipline, and moral integrity."
                  </QuoteBox>
                  <ContactBadge>
                    <MailOutlined className="icon" />
                    <span>principal@apexcollege.edu.pk</span>
                  </ContactBadge>
                </LeadershipDetails>
              </LeadershipCard>
            </Col>
          </Row>
        </HeroCard>
      </div>

      {/* ========== FACULTY SECTION ========== */}
      <div style={{ marginBottom: 80 }}>
        <SectionHeaderWrapper>
          <SectionBadge>DISTINGUISHED EDUCATORS</SectionBadge>
          <SectionTitle>Meet Our Faculty</SectionTitle>
          <SectionSubtitle>
            Dedicated academic experts committed to excellence in teaching, research, and student mentorship.
          </SectionSubtitle>
        </SectionHeaderWrapper>

        <Row gutter={[24, 24]}>
          {faculty.map((teacher, index) => (
            <Col xs={24} sm={12} lg={6} key={index}>
              <FacultyCard>
                <FacultyAvatarWrapper>
                  {teacher.image ? (
                    <img src={teacher.image} alt={teacher.name} />
                  ) : (
                    <div className="avatar-fallback"><UserOutlined /></div>
                  )}
                </FacultyAvatarWrapper>
                <FacultyName>{teacher.name}</FacultyName>
                <FacultyDesignation>{teacher.designation || 'Lecturer'}</FacultyDesignation>
                <FacultyQualification>{teacher.qualification || 'M.Sc / M.Phil'}</FacultyQualification>
                {teacher.description && (
                  <p style={{ color: '#64748b', fontSize: '0.88rem', lineHeight: 1.5, margin: 0 }}>
                    {teacher.description}
                  </p>
                )}
              </FacultyCard>
            </Col>
          ))}
        </Row>

        <div style={{ textAlign: 'center', marginTop: 32 }}>
          <Button 
            type="outlined" 
            icon={<SyncOutlined />} 
            style={{ borderColor: '#0b1b3d', color: '#0b1b3d', borderRadius: 6 }}
            onClick={() => setRefreshKey(prev => prev + 1)}
          >
            Refresh Faculty List
          </Button>
        </div>
      </div>

      {/* ========== BLOG / CAMPUS LIFE SECTION ========== */}
      <div id="blog-section">
        <SectionHeaderWrapper>
          <SectionBadge>CAMPUS UPDATES & BLOG</SectionBadge>
          <SectionTitle>Latest News & Highlights</SectionTitle>
          <SectionSubtitle>
            Explore recent events, academic achievements, and campus activities at Apex College.
          </SectionSubtitle>
        </SectionHeaderWrapper>

        <Row gutter={[24, 24]}>
          {sectionsWithImages.map((section) => (
            <Col xs={24} sm={12} lg={8} key={section.id}>
              <BlogCard onClick={() => showSectionModal(section)}>
                <BlogImageContainer>
                  {section.images?.length > 0 ? (
                    <img 
                      className="blog-img-zoom"
                      src={`https://white-trout-460511.hostingersite.com/APEX/${section.images[0].image_path}`}
                      alt={section.title}
                    />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d4af37', fontSize: 36 }}>
                      <PictureOutlined />
                    </div>
                  )}
                  {section.images?.length > 0 && (
                    <span className="count-badge">
                      <PictureOutlined /> {section.images.length} Photos
                    </span>
                  )}
                </BlogImageContainer>

                <BlogTitle>{section.title}</BlogTitle>
                <BlogExcerpt>{section.content}</BlogExcerpt>
                
                <div style={{ display: 'flex', alignItems: 'center', color: '#b8860b', fontWeight: 700, fontSize: '0.9rem' }}>
                  <span>Read Full Article</span>
                  <RightOutlined style={{ marginLeft: 6, fontSize: 12 }} />
                </div>
              </BlogCard>
            </Col>
          ))}
        </Row>
      </div>

      {/* ========== IMAGE & DETAILS MODAL ========== */}
      <Modal
        open={visible}
        onCancel={() => setVisible(false)}
        footer={null}
        closable={true}
        closeIcon={<CloseOutlined style={{ color: '#fff', fontSize: 18 }} />}
        width={850}
        centered
        styles={{
          header: { background: '#0b1b3d', padding: '16px 24px', borderBottom: '2px solid #d4af37' },
          body: { padding: '24px', maxHeight: '80vh', overflowY: 'auto' }
        }}
        destroyOnClose
      >
        {currentSection && (
          <div>
            <div style={{ marginBottom: 24, borderBottom: '1px solid #e2e8f0', paddingBottom: 16 }}>
              <h2 style={{ fontFamily: 'Cinzel, serif', fontSize: '1.6rem', color: '#0b1b3d', margin: '0 0 8px', fontWeight: 700 }}>
                {currentSection.title}
              </h2>
              <p style={{ fontSize: '1rem', color: '#475569', lineHeight: 1.6, margin: 0 }}>
                {currentSection.content}
              </p>
            </div>

            {currentSection.images?.length > 0 ? (
              <Row gutter={[16, 16]}>
                {currentSection.images.map((image, index) => (
                  <Col span={24} key={index}>
                    <div style={{ background: '#f8fafc', borderRadius: 8, padding: 12, border: '1px solid #e2e8f0' }}>
                      <img 
                        src={`https://white-trout-460511.hostingersite.com/APEX/${image.image_path}`}
                        alt={image.title || currentSection.title}
                        style={{ width: '100%', height: 'auto', borderRadius: 6, display: 'block' }}
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/800x500/0b1b3d/ffffff?text=Image+Unavailable';
                        }}
                      />
                      {(image.title || image.description) && (
                        <div style={{ marginTop: 12, padding: '8px 4px' }}>
                          {image.title && <h4 style={{ color: '#0b1b3d', margin: '0 0 4px', fontWeight: 700 }}>{image.title}</h4>}
                          {image.description && <p style={{ color: '#64748b', margin: 0, fontSize: '0.9rem' }}>{image.description}</p>}
                        </div>
                      )}
                    </div>
                  </Col>
                ))}
              </Row>
            ) : (
              <div style={{ padding: '40px 0', textAlign: 'center', color: '#94a3b8' }}>
                <PictureOutlined style={{ fontSize: 40, marginBottom: 12 }} />
                <p>No images available for this section.</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </AboutWrapper>
  );
};

export default About;