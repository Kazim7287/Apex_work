// AdminDashboardStyles.js
import styled from 'styled-components';

export const AdminDashboardContainer = styled.div`
  display: flex;
`;

export const Content = styled.div`
  flex: 1;
  padding: 20px;
  margin-left: ${({ isOpen }) => (isOpen ? '250px' : '80px')}; /* Adjust margin based on sidebar state */
  transition: margin-left 0.3s ease;
`;

export const TopContent = styled.div`
  display: flex;
  gap: 20px;
  flex: 1; /* Take remaining space */
`;

export const BottomContent = styled.div`
  margin-top: 20px;
  display: flex; /* Make the content side by side */
  gap: 20px; /* Add gap between the components */
`;

export const Section = styled.section`
  margin-bottom: 40px;
  flex: 1; /* Make the sections expand to fill the available space */
`;

export const SectionTitle = styled.h2`
  font-size: 24px;
  margin-bottom: 20px;
  color: #333333; /* Darker text color */
`;

export const CardContainer = styled.div`
  display: flex;
  gap: 20px;
;
@media (max-width: 768px) {
  flex-direction: column;
};`

export const Card = styled.div`
  background-color: #ffffff;
  padding: 20px;
  width:200px;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease-in-out;
  cursor: pointer;
  flex: 1;
  max-width: 1250px;
  &:hover {
    transform: translateY(-5px);
  }
`;

export const CardTitle = styled.h3`
  font-size: 18px;
  margin-bottom: 10px;
  color: #007bff; 
`;

export const CardContent = styled.p`
  font-size: 16px;
  color: #555555;
`;

export const StudentDashboardContainer = styled.div`
  display: flex;
  padding-left: 240px;
`;


export const TeacherDashboardContainer = styled.div`
  display: flex;
  padding-left: 240px;
`;
// Add these to your existing DashboardStyles.js
export const EventList = styled.div`
    margin-top: 1rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
`;

export const EventItem = styled.div`
    background: #f8f9fa;
    padding: 1rem;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    
    p {
        margin: 0.5rem 0 0;
        color: #6c757d;
    }
`;

export const EventTime = styled.div`
    color: #6c757d;
    font-size: 0.9rem;
    margin: 0.25rem 0;
`;

// Removed duplicate CountdownTimer declaration to avoid redeclaration errors.

export const LoadingSpinner = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    height: 200px;
    font-size: 1.2rem;
    color: #6c757d;
`;

export const ErrorMessage = styled.div`
  color: #dc3545;
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  padding: 1rem;
  border-radius: 4px;
  margin: 1rem 0;
`;
export const CountdownTimer = styled.div`
  font-size: 1.2rem;
  font-weight: bold;
  color: #0d6efd;
  padding: 0.75rem 1rem;
  background-color: #f8f9fa;
  border-radius: 8px;
  display: inline-block;
  margin-top: 0.5rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

import { Drawer, Button } from 'antd';

export const MobileMenuButton = styled(Button)`
  position: fixed;
  top: 16px;
  left: 16px;
  z-index: 1000;
  display: none;
  
  @media (max-width: 768px) {
    display: block;
  }
`;

export const MobileSidebarDrawer = styled(Drawer)`
  .ant-drawer-body {
    padding: 0;
  }
`;

export const DashboardContent = styled.div`
  margin-left: ${props => props.$isMobile ? '0' : '50px'};
  padding: ${props => props.$isMobile ? '16px' : '24px'};
  transition: all 0.3s ease;
`;

// Update your CardContainer to be responsive
