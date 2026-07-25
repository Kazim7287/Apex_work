import { useState, useEffect } from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";
import {
    BsGraphUp,
    BsPerson,
    BsFileText,
    BsBook,
    BsGraphDown,
    BsCalendar,
    BsPeople,
    BsGear,
    BsChatDots,
} from 'react-icons/bs';

export const SidebarContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: ${({ isOpen }) => (isOpen ? '200px' : '60px')};
  height: 100%;
  background-color: white;  /* Changed to white */
  color: #2c3e50;  /* Dark text color for contrast */
  overflow-y: auto;
  padding-top: 60px;
  transition: width 0.3s ease;
  z-index: 100;
  border-right: 1px solid #e0e0e0;  /* Added border for better separation */
`;

export const SidebarHeader = styled.div`
  padding: 15px;
  font-size: 20px;
  font-weight: bold;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export const SidebarNav = styled.ul`
  list-style: none;
  padding: 0;
`;

export const SidebarNavItem = styled.li`
  display: flex;
  align-items: center;
  padding: 10px 15px;
  font-size: 16px;
  border-bottom: 1px solid #f0f0f0;  /* Lighter border color */
  transition: background-color 0.3s ease;
  &:hover {
    background-color: #f5f5f5;  /* Light gray hover */
  }
`;

export const StyledLink = styled(Link)`
  text-decoration: none;
  color: #2c3e50;  /* Dark text color */
  margin-left: 8px;
  font-size: 14px;
`;

export const SidebarIcon = styled.div`
  margin-right: 8px;
  font-size: 18px;
  color: #2c3e50;  /* Dark icon color */
`;

export const ProfilePicture = styled.img`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #e0e0e0;  /* Light gray border */
  margin-bottom: 10px;
`;

export const TeacherName = styled.div`
  font-size: 14px;
  margin-top: 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
  color: #2c3e50;  /* Dark text color */
`;

export const ToggleButton = styled.div`
  position: absolute;
  top: 15px;
  right: 0;
  width: 25px;
  height: 25px;
  background-color: #f0f0f0;  /* Light gray background */
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  &:hover {
    background-color: #e0e0e0;  /* Slightly darker on hover */
  }
`;

export const ToggleIcon = styled.span`
  color: #2c3e50;  /* Dark icon color */
  font-size: 16px;
  transform: ${({ isOpen }) => (isOpen ? 'rotate(180deg)' : 'rotate(0deg)')};
  transition: transform 0.3s ease;
`;

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [profilePicture, setProfilePicture] = useState(null);
  const [teacherName, setTeacherName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeacherProfile = async () => {
      try {
        const teacherId = localStorage.getItem('teacher_id');
        if (!teacherId) {
          console.error('Teacher ID not found in localStorage');
          return;
        }

        // Fetch teacher name
        const profileResponse = await fetch(`https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/teach_profile.php?id=${teacherId}`);
        const profileData = await profileResponse.json();

        if (profileData.success) {
          setTeacherName(profileData.data.teach_name || '');
          
          // First try to get the profile picture path from the API
          try {
            const pictureResponse = await fetch(`https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/get_profilePicture.php?teacher_id=${teacherId}`);
            const pictureData = await pictureResponse.json();
            
            if (pictureData.success && pictureData.file_path) {
              // Use the correct path format with cache busting
              const pictureUrl = `https://white-trout-460511.hostingersite.com/APEX/${pictureData.file_path}?t=${Date.now()}`;
              setProfilePicture(pictureUrl);
              return;
            }
          } catch (error) {
            console.log('Could not fetch profile picture path from API', error);
          }

          // Fallback to checking if image exists directly
          const pictureUrl = `https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/teacher_profile_images/teacher_${teacherId}.jpg`;
          
          // Check if image exists
          const imgCheck = new Image();
          imgCheck.src = pictureUrl;
          imgCheck.onload = () => {
            setProfilePicture(`${pictureUrl}?t=${Date.now()}`);
          };
          imgCheck.onerror = () => {
            setProfilePicture(null);
          };
        }
      } catch (error) {
        console.error('Error fetching teacher profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeacherProfile();
  }, []);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <SidebarContainer isOpen={isOpen}>
      <SidebarHeader>
        {!loading && (
          <>
            {profilePicture ? (
              <ProfilePicture 
                src={profilePicture}
                alt="Teacher Profile"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '';
                  setProfilePicture(null);
                }}
              />
            ) : (
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                backgroundColor: '#f0f0f0',  /* Light gray background */
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '10px'
              }}>
                <BsPerson size={30} color="#2c3e50" />  {/* Dark icon color */}
              </div>
            )}
            {isOpen && teacherName && <TeacherName>{teacherName}</TeacherName>}
          </>
        )}
      </SidebarHeader>
      <SidebarNav>
        <SidebarNavItem>
          <SidebarIcon><BsGraphUp /></SidebarIcon>
          {isOpen && <StyledLink to="/teacher/dashboard">Dashboard</StyledLink>}
        </SidebarNavItem>
        {/*<SidebarNavItem>
          /* <SidebarIcon><BsPeople /></SidebarIcon>
          {isOpen && <StyledLink to="/teacher/classes">Applications</StyledLink>}
        </SidebarNavItem> */}
        <SidebarNavItem>
          <SidebarIcon><BsFileText /></SidebarIcon>
          {isOpen && <StyledLink to="/teacher/assignments">Student Reports</StyledLink>}
        </SidebarNavItem>
        <SidebarNavItem>
          <SidebarIcon><BsBook /></SidebarIcon>
          {isOpen && <StyledLink to="/teacher/exams">Exams</StyledLink>}
        </SidebarNavItem>
        <SidebarNavItem>
          <SidebarIcon><BsGraphDown /></SidebarIcon>
          {isOpen && <StyledLink to="/teacher/performance">Performance</StyledLink>}
        </SidebarNavItem>
        <SidebarNavItem>
          <SidebarIcon><BsCalendar /></SidebarIcon>
          {isOpen && <StyledLink to="/teacher/attendance">Attendance</StyledLink>}
        </SidebarNavItem>
        <SidebarNavItem>
          <SidebarIcon><BsChatDots /></SidebarIcon>
          {isOpen && <StyledLink to="/teacher/communication">Announcements</StyledLink>}
        </SidebarNavItem>
        <SidebarNavItem>
          <SidebarIcon><BsGear /></SidebarIcon>
          {isOpen && <StyledLink to="/teacher/settings">Settings</StyledLink>}
        </SidebarNavItem>
      </SidebarNav>
      <ToggleButton onClick={toggleSidebar}>
        <ToggleIcon isOpen={isOpen}>{isOpen ? '◄' : '►'}</ToggleIcon>
      </ToggleButton>
    </SidebarContainer>
  );
};

export default Sidebar;