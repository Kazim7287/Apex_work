/* eslint-disable react/no-unescaped-entities */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { 
  Layout,
  Typography,
  Row,
  Alert,
  Col,
  Image,
  Card,
  Divider,
  List,
  Avatar,
  Space,
  Button,
  Modal,
  message,
  Spin
} from 'antd';
import { 
  TeamOutlined,
  BookOutlined,
  TrophyOutlined,
  EnvironmentOutlined,
  ClockCircleOutlined,
  PictureOutlined,
  SyncOutlined,
  UserOutlined,
  MailOutlined,
  CodeOutlined,
  LaptopOutlined,
  FacebookOutlined,
  InstagramOutlined,
  TwitterOutlined,
  PhoneOutlined,
  EnvironmentFilled
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

// import drAliAbbasImage from '/Users/farooqahmad/Desktop/gitDemo/Projectonly/managment_sytem_frontend/src/assets/Abs.jpg';
// import developerImage from '/Users/farooqahmad/Desktop/gitDemo/Projectonly/managment_sytem_frontend/src/assets/mypic.jpeg';
// import advisorImage from '/Users/farooqahmad/Desktop/gitDemo/Projectonly/managment_sytem_frontend/src/assets/file.jpg';
import principalImage from '/src/assets/clg.png';

// Styled components
const AboutCard = styled(Card)`
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  height: 100%;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  }
`;

const PrincipalImageContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const PrincipalImage = styled(Image)`
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  width: 100%;
  height: 400px;
  object-fit: cover;
  flex: 1;
`;

const SectionThumbnail = styled(Image)`
  border-radius: 8px;
  height: 200px;
  object-fit: cover;
  transition: all 0.3s ease;
  cursor: pointer;
  
  &:hover {
    transform: scale(1.03);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  }
`;

const SectionCard = styled(Card)`
  border-radius: 8px;
  border: none;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
  }
  
  .ant-card-body {
    padding: 16px 0;
  }
`;

const FullScreenModal = styled(Modal)`
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100% !important;
  height: 100vh;
  max-width: 100%;
  margin: 0;
  padding: 0;
  
  .ant-modal-content {
    height: 100%;
    display: flex;
    flex-direction: column;
  }
  
  .ant-modal-body {
    flex: 1;
    padding: 0;
    overflow: hidden;
  }
`;

const ModalContent = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const ModalHeader = styled.div`
  padding: 24px;
  border-bottom: 1px solid #f0f0f0;
`;

const ModalImageContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const ModalImage = styled(Image)`
  max-width: 100%;
  max-height: none;
  object-fit: contain;
  border-radius: 8px;
  margin-bottom: 16px;
`;

const Footer = styled.div`
  text-align: center;
  padding: 48px 0;
  background-color: #000;
  color: white;
  margin-top: 48px;
`;

const FooterContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
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

const TeamRow = styled(Row)`
  margin-top: 32px;
`;

const TeamMemberCard = styled(Card)`
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  height: 100%;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
  }
`;

const TeamMemberImage = styled(Image)`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  margin: 0 auto 16px;
  display: block;
`;

const TeamMemberInfo = styled.div`
  text-align: center;
`;

const TeamMemberContact = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 8px;
  color: #1890ff;
`;

const PrincipalInfoCard = styled(Card)`
  margin-top: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const { Content } = Layout;
const { Title, Paragraph, Text } = Typography;

const aboutData = [
  {
    title: 'Our Mission',
    content: 'To provide quality education that transforms students into responsible global citizens.',
    icon: <TrophyOutlined />
  },
  {
    title: 'Our Vision',
    content: 'To be a premier institution recognized for academic excellence and innovation.',
    icon: <BookOutlined />
  },
  {
    title: 'Our Values',
    content: 'Integrity, Excellence, Diversity, and Community Engagement.',
    icon: <TeamOutlined />
  }
];

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
        if (!response.ok) {
          throw new Error('Failed to fetch faculty data');
        }
        const data = await response.json();
        if (data.success) {
          setFaculty(data.data);
        } else {
          throw new Error(data.error || 'Failed to fetch faculty data');
        }
      } catch (err) {
        setFacultyError(err.message);
        message.error('Failed to load faculty data: ' + err.message);
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
        
        // Fetch about sections
        const sectionsResponse = await fetch('https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/get_about_sections.php');
        if (!sectionsResponse.ok) {
          throw new Error('Failed to fetch about sections');
        }
        const sectionsData = await sectionsResponse.json();

        // Fetch images for each section
        const sectionsWithImagesData = await Promise.all(
          sectionsData.data.map(async (section) => {
            try {
              const imagesResponse = await fetch(
                `https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/imagesread.php?section_id=${section.id}`
              );
              if (!imagesResponse.ok) {
                console.error(`Failed to fetch images for section ${section.id}`);
                return { ...section, images: [] };
              }
              const imagesData = await imagesResponse.json();
              return { 
                ...section, 
                images: imagesData.data || [],
                content: section.content || section.description || 'No description available'
              };
            } catch (err) {
              console.error(`Error fetching images for section ${section.id}:`, err);
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
        message.error('Failed to load data: ' + err.message);
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
      <Layout style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Spin size="large" />
      </Layout>
    );
  }

  if (error || facultyError) {
    return (
      <Layout style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Alert message="Error" description={error || facultyError} type="error" showIcon />
      </Layout>
    );
  }

  return (
    <Layout style={{ minHeight: '100vh', background: '#fff' }}>
      <Content style={{ 
        padding: '0 50px',
        maxWidth: '1200px',
        width: '100%',
        margin: '0 auto'
      }}>
        {/* Hero Section - Now perfectly aligned */}
        <Row 
          gutter={[48, 48]} 
          align="stretch"  
          style={{ margin: '48px 0' }}
        >
          <Col xs={24} md={12}>
            <AboutCard bordered={false}>
              <Title level={2} style={{ color: '#1890ff' }}>
                About Apex College Harichand
              </Title>
              <Paragraph style={{ fontSize: '16px', lineHeight: '1.8' }}>
                Apex College Harichand is a prestigious institution in Pakistan, established in 2021. It is one of the  higher education institutions in the country. The college,  played a significant role  in adjoining tribal areas. It is offering a wide range of  programs.
              </Paragraph>
              <Paragraph style={{ fontSize: '16px', lineHeight: '1.8' }}>
                The college is renowned for its academic excellence, distinguished faculty, and vibrant student life. It has produced numerous notable alumni who have contributed to various fields, including politics, education, and science.
              </Paragraph>
              <Divider />
              <Space size="large">
                <Text strong><ClockCircleOutlined /> Established: 2021</Text>
                <Text strong><EnvironmentOutlined /> Location: Near Harichand Bazar Peshawar Road</Text>
              </Space>
            </AboutCard>
          </Col>
          
          <Col xs={24} md={12}>
            <PrincipalImageContainer>
              <PrincipalImage
                src={principalImage}
                preview={false}
                alt="MD Apex College Harichand"
              />
              <PrincipalInfoCard>
                <Title level={4}>MD Message</Title>
                <Paragraph style={{ fontSize: '16px', lineHeight: '1.8' }}>
                  "Apex College Harichand has a rich legacy of academic excellence and character building. As the Director, I am committed to upholding our tradition of providing quality education while fostering innovation and research. Our institution stands as a beacon of knowledge, shaping future leaders who will contribute positively to society."
                  <br /><br />
                  <Text strong>- Eng. Naveed Ahmad , MD</Text>
                  <br />
                  <TeamMemberContact>
                    <MailOutlined style={{ marginRight: 8 }} />
                    <Text>Email: principalicp@icp.edu.pk</Text>
                  </TeamMemberContact>
                </Paragraph>
              </PrincipalInfoCard>
            </PrincipalImageContainer>
          </Col>
        </Row>

        {/* Faculty Section */}
        <Row style={{ marginBottom: '48px' }}>
          <Col span={24}>
            <AboutCard>
              <Title level={3} style={{ textAlign: 'center', marginBottom: '24px' }}>
                Meet Our Faculty
                <Button 
                  type="text" 
                  icon={<SyncOutlined />} 
                  onClick={() => setRefreshKey(prev => prev + 1)}
                  style={{ marginLeft: 16 }}
                />
              </Title>
              <List
                itemLayout="horizontal"
                dataSource={faculty}
                renderItem={(teacher) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={
                        teacher.image ? (
                          <Avatar 
                            size="large" 
                            src={<img src={teacher.image} alt={teacher.name} style={{ width: '100%' }} />}
                          />
                        ) : (
                          <Avatar size="large" icon={<UserOutlined />} />
                        )
                      }
                      title={<Text strong>{teacher.name}</Text>}
                      description={
                        <>
                          <Text>{teacher.designation}</Text><br />
                          <Text type="secondary">{teacher.qualification}</Text>
                          {teacher.description && (
                            <>
                              <br />
                              <Text type="secondary">{teacher.description}</Text>
                            </>
                          )}
                        </>
                      }
                    />
                  </List.Item>
                )}
              />
            </AboutCard>
          </Col>
        </Row>

        {/* Sections with Thumbnails */}
        <Row gutter={[24, 24]} style={{ marginBottom: '48px' }}>
          {sectionsWithImages.map((section) => (
            <Col xs={24} sm={12} md={8} key={section.id}>
              <SectionCard 
                hoverable
                onClick={() => showSectionModal(section)}
              >
                {section.images?.length > 0 ? (
                  <SectionThumbnail
                    src={`https://white-trout-460511.hostingersite.com/APEX/${section.images[0].image_path}`}
                    alt={section.title}
                    preview={false}
                  />
                ) : (
                  <div style={{
                    height: '200px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#f0f0f0',
                    borderRadius: '8px'
                  }}>
                    <PictureOutlined style={{ fontSize: '48px', color: '#999' }} />
                  </div>
                )}
                <Card.Meta
                  title={section.title}
                  description={
                    <Text ellipsis={{ tooltip: section.content }}>
                      {section.content}
                    </Text>
                  }
                  style={{ padding: '16px' }}
                />
                {section.images?.length > 0 && (
                  <div style={{ padding: '0 16px 16px', color: '#1890ff' }}>
                    <Text type="secondary">
                      {section.images.length} {section.images.length === 1 ? 'photo' : 'photos'}
                    </Text>
                  </div>
                )}
              </SectionCard>
            </Col>
          ))}
        </Row>

        {/* Section Images Modal */}
        <FullScreenModal
          visible={visible}
          onCancel={() => setVisible(false)}
          footer={null}
          closable={true}
          bodyStyle={{ 
            padding: 0,
            height: '100%'
          }}
        >
          {currentSection && (
            <ModalContent>
              <ModalHeader>
                <Title level={3}>{currentSection.title}</Title>
                <Paragraph>{currentSection.content}</Paragraph>
              </ModalHeader>
              
              <ModalImageContainer>
                {currentSection.images?.length > 0 ? (
                  currentSection.images.map((image, index) => (
                    <React.Fragment key={index}>
                      <ModalImage
                        src={`https://white-trout-460511.hostingersite.com/APEX/${image.image_path}`}
                        alt={image.title || currentSection.title}
                        preview={false}
                      />
                      {(image.title || image.description) && (
                        <div style={{ 
                          width: '100%', 
                          maxWidth: '800px',
                          padding: '0 16px 16px',
                          textAlign: 'center'
                        }}>
                          {image.title && <Title level={5}>{image.title}</Title>}
                          {image.description && <Paragraph>{image.description}</Paragraph>}
                        </div>
                      )}
                    </React.Fragment>
                  ))
                ) : (
                    <div style={{ 
                    flex: 1,
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    padding: '24px'
                  }}>
                    <Text type="secondary">No images available for this section</Text>
                  </div>
                )}
              </ModalImageContainer>
            </ModalContent>
          )}
        </FullScreenModal>
      </Content>

      {/* Footer with Contact Information */}
      <Footer>
        <FooterContent>
          <FooterSection>
            <Title level={3} style={{ color: 'white' }}>Apex College Harichand</Title>
            <Paragraph style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              Providing quality education since 2021
            </Paragraph>
          </FooterSection>

          <SocialIcons>
            <a href="#" style={{ color: 'white' }}><FacebookOutlined /></a>
            <a href="#" style={{ color: 'white' }}><InstagramOutlined /></a>
            <a href="#" style={{ color: 'white' }}><TwitterOutlined /></a>
          </SocialIcons>

          <ContactInfo>
            <ContactItem>
              <PhoneOutlined style={{ color: 'white' }} />
              <span style={{ color: 'white' }}>+92 123 4567890</span>
            </ContactItem>
            <ContactItem>
              <MailOutlined style={{ color: 'white' }} />
              {/* <span style={{ color: 'white' }}>info@apexcollege.edu.pk</span> */}
            </ContactItem>
            <ContactItem>
              <EnvironmentFilled style={{ color: 'white' }} />
              <span style={{ color: 'white' }}>Near Harichand Bazar Peshawar Road, Pakistan</span>
            </ContactItem>
          </ContactInfo>

          <Divider style={{ borderColor: 'rgba(255, 255, 255, 0.3)' }} />

          <Paragraph style={{ color: 'rgba(255, 255, 255, 0.5)' }}>
            © {new Date().getFullYear()} Apex College Harichand. All rights reserved.
          </Paragraph>
        </FooterContent>
      </Footer>
    </Layout>
  );
};

export default About;