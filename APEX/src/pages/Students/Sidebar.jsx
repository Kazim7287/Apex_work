import { useState, useEffect } from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";
import {
    BsGraphUp,
    BsPerson,
    BsBook,
    BsGraphDown,
    BsCalendar,
    BsCashCoin,
    BsClipboardCheck // Added for Teacher Evaluation
} from 'react-icons/bs';
import { Avatar, Spin, message } from 'antd';
import { UserOutlined } from '@ant-design/icons';

const SidebarContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: ${({ isOpen }) => (isOpen ? '200px' : '60px')};
  height: 100%;
  background-color: white;
  color: #2c3e50;
  overflow-y: auto;
  padding-top: 60px;
  transition: width 0.3s ease;
  z-index: 100;
  border-right: 1px solid #e0e0e0;
`;

const SidebarHeader = styled.div`
  padding: 15px;
  font-size: 20px;
  font-weight: bold;
  text-align: center;
  color: #2c3e50;
`;

const SidebarNav = styled.ul`
  list-style: none;
  padding: 0;
`;

const SidebarNavItem = styled.li`
  display: flex;
  align-items: center;
  padding: 10px 15px;
  font-size: 16px;
  border-bottom: 1px solid #f0f0f0;
  transition: background-color 0.3s ease;
  &:hover {
    background-color: #f5f5f5;
  }
`;

const StyledLink = styled(Link)`
  text-decoration: none;
  color: #2c3e50;
  margin-left: 10px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const SidebarIcon = styled.div`
  margin-right: 10px;
  font-size: 18px;
  min-width: 20px;
  color: #2c3e50;
`;

const ToggleButton = styled.div`
  position: absolute;
  top: 20px;
  right: 0;
  width: 25px;
  height: 25px;
  background-color: #f0f0f0;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  &:hover {
    background-color: #e0e0e0;
  }
`;

const ToggleIcon = styled.span`
  color: #2c3e50;
  font-size: 16px;
  transform: ${({ isOpen }) => (isOpen ? 'rotate(180deg)' : 'rotate(0deg)')};
  transition: transform 0.3s ease;
`;

const AvatarContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 15px;
`;

const StudentInfo = styled.div`
  font-size: 14px;
  margin-top: 8px;
  color: #2c3e50;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
`;

const Sidebar = () => {
    const [isOpen, setIsOpen] = useState(true);
    const [profilePicture, setProfilePicture] = useState(null);
    const [studentData, setStudentData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Get student_id from localStorage
    const studentId = localStorage.getItem('student_id');
    const API_BASE_URL = 'https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/';
    const DEFAULT_PROFILE_IMAGE = 'https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/images/default-profile.png';

    useEffect(() => {
        const fetchStudentData = async () => {
            try {
                setLoading(true);
                
                if (!studentId) {
                    throw new Error('Student ID not found. Please login again.');
                }

                // Fetch profile data
                const profileResponse = await fetch(
                    `${API_BASE_URL}/Std_profileDetail.php?student_id=${studentId}`,
                    { 
                        credentials: 'include',
                        headers: {
                            'Accept': 'application/json',
                        }
                    }
                );

                if (!profileResponse.ok) {
                    throw new Error(`HTTP error! status: ${profileResponse.status}`);
                }

                const profileData = await profileResponse.json();
                
                if (!profileData.success) {
                    throw new Error(profileData.error || 'Failed to fetch student data');
                }

                setStudentData(profileData.student);

                // Fetch profile picture
                const pictureResponse = await fetch(
                    `${API_BASE_URL}/fetchStudentPicture.php?student_id=${studentId}`,
                    { 
                        credentials: 'include',
                        headers: {
                            'Accept': 'application/json',
                        }
                    }
                );

                if (!pictureResponse.ok) {
                    throw new Error(`HTTP error! status: ${pictureResponse.status}`);
                }

                const pictureData = await pictureResponse.json();
                
                if (pictureData.success && pictureData.exists) {
                    const imageUrl = pictureData.url || pictureData.full_url;
                    
                    if (imageUrl) {
                        const cleanUrl = imageUrl.replace(/\\\//g, '/');
                        try {
                            new URL(cleanUrl);
                            const img = new Image();
                            img.src = cleanUrl;
                            img.onerror = () => {
                                console.warn('Image not found at:', cleanUrl);
                                setProfilePicture(null);
                            };
                            img.onload = () => {
                                setProfilePicture(cleanUrl);
                            };
                        } catch (e) {
                            console.error('Invalid image URL:', cleanUrl);
                            setProfilePicture(null);
                        }
                    }
                }
            } catch (error) {
                console.error('Fetch failed:', error);
                setError(error.message);
                message.error('Failed to load student data');
            } finally {
                setLoading(false);
            }
        };

        fetchStudentData();
    }, [studentId]);

    const toggleSidebar = () => {
        setIsOpen(!isOpen);
    };

    return (
        <SidebarContainer isOpen={isOpen}>
            <SidebarHeader>
                <AvatarContainer>
                    {loading ? (
                        <Spin size="large" />
                    ) : (
                        <Avatar 
                            size={64}
                            src={profilePicture}
                            icon={<UserOutlined />}
                            onError={() => true}
                            style={{
                                backgroundColor: '#1890ff',
                                cursor: 'pointer'
                            }}
                        />
                    )}
                </AvatarContainer>
                {isOpen && (
                    <StudentInfo>
                        {error ? 'Error loading data' : (studentData?.name || 'Student Profile')}
                    </StudentInfo>
                )}
            </SidebarHeader>
            
            <SidebarNav>
                <SidebarNavItem>
                    <SidebarIcon><BsGraphUp/></SidebarIcon>
                    {isOpen && <StyledLink to="/student/dashboard">Dashboard</StyledLink>}
                </SidebarNavItem>
                <SidebarNavItem>
                    <SidebarIcon><BsBook/></SidebarIcon>
                    {isOpen && <StyledLink to="/student/assignments">Applications</StyledLink>}
                </SidebarNavItem>
                <SidebarNavItem>
                    <SidebarIcon><BsCashCoin/></SidebarIcon>
                    {isOpen && <StyledLink to="/student/exams">Dues</StyledLink>}
                </SidebarNavItem>
                <SidebarNavItem>
                    <SidebarIcon><BsGraphDown/></SidebarIcon>
                    {isOpen && <StyledLink to="/student/performance">Performance</StyledLink>}
                </SidebarNavItem>
                <SidebarNavItem>
                    <SidebarIcon><BsCalendar/></SidebarIcon>
                    {isOpen && <StyledLink to="/student/attendance">Attendance</StyledLink>}
                </SidebarNavItem>
                
                {/* Added Teacher Evaluation Menu Item */}
                <SidebarNavItem>
                    <SidebarIcon><BsClipboardCheck/></SidebarIcon>
                    {isOpen && <StyledLink to="/student/teacher-evaluation">Teacher Evaluation</StyledLink>}
                </SidebarNavItem>
                
                <SidebarNavItem>
                    <SidebarIcon><BsPerson/></SidebarIcon>
                    {isOpen && <StyledLink to="/student/profile">Profile</StyledLink>}
                </SidebarNavItem>
            </SidebarNav>
            
            <ToggleButton onClick={toggleSidebar}>
                <ToggleIcon isOpen={isOpen}>≡</ToggleIcon>
            </ToggleButton>
        </SidebarContainer>
    );
};

export default Sidebar;