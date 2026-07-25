import { useState, useEffect } from "react";
import styled, { css } from "styled-components";
import { useNavigate } from "react-router-dom";
import {
    BsGraphUp,
    BsPerson,
    BsFileText,
    BsBook,
    BsCashCoin,
    BsGraphDown,
    BsCalendar,
    BsPeople,
    BsGear,
    BsCalendar3,
    BsCalendarEvent,
    BsClipboard,
    BsChevronLeft,
    BsChevronRight,
    BsChatSquareText,
    BsInfoCircle,
    BsChevronDown,
    BsChevronUp,
    BsStar, // Added for teacher evaluation icon
    BsClipboardCheck // Alternative icon option
} from 'react-icons/bs';
import { Avatar, Spin } from 'antd';

export const SidebarContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: ${({ isOpen }) => (isOpen ? '220px' : '60px')};
  height: 100%;
  background-color: white;
  color: #2c3e50;
  overflow-y: auto;
  padding-top: 60px;
  transition: width 0.3s ease;
  z-index: 100;
  border-right: 1px solid #e0e0e0;
`;

export const SidebarHeader = styled.div`
  padding: 20px;
  font-size: 24px;
  font-weight: bold;
  text-align: center;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
`;

export const SidebarNav = styled.ul`
  list-style: none;
  padding: 0;
  margin-top: 20px;
`;

export const SidebarNavItem = styled.li`
  display: flex;
  align-items: center;
  padding: 12px 20px;
  font-size: 16px;
  border-bottom: 1px solid #f0f0f0;
  transition: all 0.3s ease;
  cursor: pointer;
  
  &:hover {
    background-color: #f5f5f5;
  }
  
  span {
    margin-left: ${({ isOpen }) => (isOpen ? '10px' : '0')};
    opacity: ${({ isOpen }) => (isOpen ? '1' : '0')};
    transition: opacity 0.3s ease, margin-left 0.3s ease;
    white-space: nowrap;
    overflow: hidden;
  }
`;

export const SidebarIcon = styled.div`
  min-width: 20px;
  display: flex;
  justify-content: center;
  color: #2c3e50;
`;

export const AdminInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  transition: all 0.3s ease;
  opacity: ${({ isOpen }) => (isOpen ? '1' : '0')};
  height: ${({ isOpen }) => (isOpen ? 'auto' : '0')};
  overflow: hidden;
`;

export const AdminName = styled.div`
  font-weight: 600;
  font-size: 14px;
  white-space: nowrap;
`;

export const AdminRole = styled.div`
  font-size: 12px;
  color: #666;
`;

export const ToggleButton = styled.div`
  position: absolute;
  top: 20px;
  right: -15px;
  width: 30px;
  height: 30px;
  background-color: #f0f0f0;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 5px rgba(0,0,0,0.1);
  z-index: 101;
  color: #2c3e50;
  
  &:hover {
    background-color: #e0e0e0;
  }
`;

export const DropdownHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  font-size: 16px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: #f5f5f5;
  }
  
  div {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  
  span {
    opacity: ${({ isOpen }) => (isOpen ? '1' : '0')};
    transition: opacity 0.3s ease;
    white-space: nowrap;
    overflow: hidden;
  }
`;

export const DropdownMenu = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  max-height: ${({ isOpen }) => (isOpen ? '500px' : '0')};
  overflow: hidden;
  transition: max-height 0.3s ease;
`;

export const DropdownItem = styled.li`
  display: flex;
  align-items: center;
  padding: 10px 20px 10px 40px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: #f5f5f5;
  }
  
  span {
    margin-left: 10px;
    opacity: ${({ isOpen }) => (isOpen ? '1' : '0')};
    transition: opacity 0.3s ease;
    white-space: nowrap;
    overflow: hidden;
  }
`;

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [adminData, setAdminData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openDropdowns, setOpenDropdowns] = useState({
    academic: true,
    management: true,
    system: true
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const response = await fetch('https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/Admindata.php', {
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch admin data');
        }
        
        const data = await response.json();
        
        if (data.success) {
          setAdminData(data.data);
        } else {
          throw new Error(data.error || 'Failed to fetch admin data');
        }
      } catch (error) {
        console.error('Error fetching admin data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, []);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const toggleDropdown = (dropdown) => {
    setOpenDropdowns(prev => ({
      ...prev,
      [dropdown]: !prev[dropdown]
    }));
  };

  const handleNavigation = (path) => {
    navigate(path);
  };

  const getInitial = (name) => {
    return name ? name.charAt(0).toUpperCase() : 'A';
  };

  return (
    <SidebarContainer isOpen={isOpen}>
      <SidebarHeader>
        {loading ? (
          <Spin size="small" />
        ) : (
          <>
            <Avatar 
              size={40} 
              style={{ 
                backgroundColor: '#1890ff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
                fontWeight: 'bold'
              }}
            >
              {adminData ? getInitial(adminData.name) : 'A'}
            </Avatar>
            
            <AdminInfo isOpen={isOpen}>
              {adminData && (
                <>
                  <AdminName>{adminData.name}</AdminName>
                  <AdminRole>{adminData.designation}</AdminRole>
                </>
              )}
            </AdminInfo>
          </>
        )}
        
        <ToggleButton onClick={toggleSidebar}>
          {isOpen ? <BsChevronLeft /> : <BsChevronRight />}
        </ToggleButton>
      </SidebarHeader>
      
      <SidebarNav>
        <SidebarNavItem isOpen={isOpen} onClick={() => handleNavigation("/admin/dashboard")}>
          <SidebarIcon><BsGraphUp /></SidebarIcon>
          <span>Dashboard</span>
        </SidebarNavItem>
        
        {/* Academic Management Dropdown */}
        <li>
          <DropdownHeader 
            isOpen={isOpen} 
            onClick={() => toggleDropdown('academic')}
          >
            <div>
              <SidebarIcon><BsBook /></SidebarIcon>
              <span>Academic</span>
            </div>
            {isOpen && (openDropdowns.academic ? <BsChevronUp size={12} /> : <BsChevronDown size={12} />)}
          </DropdownHeader>
          <DropdownMenu isOpen={openDropdowns.academic && isOpen}>
            <DropdownItem isOpen={isOpen} onClick={() => handleNavigation("/admin/classes")}>
              <SidebarIcon><BsPeople /></SidebarIcon>
              <span>Class</span>
            </DropdownItem>
            <DropdownItem isOpen={isOpen} onClick={() => handleNavigation("/admin/students")}>
              <SidebarIcon><BsPerson /></SidebarIcon>
              <span>Student Reports</span>
            </DropdownItem>
            <DropdownItem isOpen={isOpen} onClick={() => handleNavigation("/admin/teachers")}>
              <SidebarIcon><BsPerson /></SidebarIcon>
              <span>Teacher</span>
            </DropdownItem>
            <DropdownItem isOpen={isOpen} onClick={() => handleNavigation("/admin/assignments")}>
              <SidebarIcon><BsFileText /></SidebarIcon>
              <span>Assignments</span>
            </DropdownItem>
            <DropdownItem isOpen={isOpen} onClick={() => handleNavigation("/admin/exams")}>
              <SidebarIcon><BsBook /></SidebarIcon>
              <span>Exams</span>
            </DropdownItem>
            <DropdownItem isOpen={isOpen} onClick={() => handleNavigation("/admin/performance")}>
              <SidebarIcon><BsGraphDown /></SidebarIcon>
              <span>Performance</span>
            </DropdownItem>
            <DropdownItem isOpen={isOpen} onClick={() => handleNavigation("/admin/attendance")}>
              <SidebarIcon><BsCalendar /></SidebarIcon>
              <span>Attendance</span>
            </DropdownItem>
          </DropdownMenu>
        </li>
        
        {/* School Management Dropdown */}
        <li>
          <DropdownHeader 
            isOpen={isOpen} 
            onClick={() => toggleDropdown('management')}
          >
            <div>
              <SidebarIcon><BsClipboard /></SidebarIcon>
              <span>Management</span>
            </div>
            {isOpen && (openDropdowns.management ? <BsChevronUp size={12} /> : <BsChevronDown size={12} />)}
          </DropdownHeader>
          <DropdownMenu isOpen={openDropdowns.management && isOpen}>
            <DropdownItem isOpen={isOpen} onClick={() => handleNavigation("/admin/teacher-evaluations")}>
              <SidebarIcon><BsStar /></SidebarIcon>
              <span>Teacher Evaluations</span>
            </DropdownItem>
            <DropdownItem isOpen={isOpen} onClick={() => handleNavigation("/admin/library")}>
              <SidebarIcon><BsCashCoin /></SidebarIcon>
              <span>Dues</span>
            </DropdownItem>
            <DropdownItem isOpen={isOpen} onClick={() => handleNavigation("/admin/communication")}>
              <SidebarIcon><BsCalendar3 /></SidebarIcon>
              <span>Time Table</span>
            </DropdownItem>
            <DropdownItem isOpen={isOpen} onClick={() => handleNavigation("/admin/events")}>
              <SidebarIcon><BsCalendarEvent /></SidebarIcon>
              <span>Events & Calendar</span>
            </DropdownItem>
            <DropdownItem isOpen={isOpen} onClick={() => handleNavigation("/admin/applications")}>
              <SidebarIcon><BsClipboard /></SidebarIcon>
              <span>Student Applications</span>
            </DropdownItem>
          </DropdownMenu>
        </li>
        
        {/* System & Settings Dropdown */}
        <li>
          <DropdownHeader 
            isOpen={isOpen} 
            onClick={() => toggleDropdown('system')}
          >
            <div>
              <SidebarIcon><BsGear /></SidebarIcon>
              <span>System</span>
            </div>
            {isOpen && (openDropdowns.system ? <BsChevronUp size={12} /> : <BsChevronDown size={12} />)}
          </DropdownHeader>
          <DropdownMenu isOpen={openDropdowns.system && isOpen}>
            <DropdownItem isOpen={isOpen} onClick={() => handleNavigation("/admin/feedback-management")}>
              <SidebarIcon><BsChatSquareText /></SidebarIcon>
              <span>Feedback Management</span>
            </DropdownItem>
            <DropdownItem isOpen={isOpen} onClick={() => handleNavigation("/admin/about-management")}>
              <SidebarIcon><BsInfoCircle /></SidebarIcon>
              <span>About Management</span>
            </DropdownItem>
            <DropdownItem isOpen={isOpen} onClick={() => handleNavigation("/admin/settings")}>
              <SidebarIcon><BsGear /></SidebarIcon>
              <span>Settings & Profile</span>
            </DropdownItem>
          </DropdownMenu>
        </li>
      </SidebarNav>
    </SidebarContainer>
  );
};

export default Sidebar;