import styled from 'styled-components';
import { Button, List } from 'antd'; // Import List from Ant Design

// Main container for the teachers page
export const TeachersContainer = styled.div`
  display: flex;
  padding-left: 240px; /* Ensures space for the sidebar */
  background-color: #f4f5f7;
  min-height: 100vh;
`;

// Content area for the teachers page
export const Content = styled.div`
  flex: 1;
  padding: 20px;
  background-color: #ffffff;
`;

// The content wrapper inside the teachers area
export const TeachersContent = styled.div`
  padding: 20px;
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
`;

// Header for the teachers section, using flexbox for layout
export const TeachersHeader = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin-bottom: 20px;

  h2 {
    font-size: 24px;
    color: #333;
    margin-bottom: 20px;
  }
`;

// Styled list item for individual teachers
export const TeacherItem = styled.div`
  background-color: #fafafa;
  padding: 15px;
  border-radius: 8px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: background-color 0.3s;

  &:hover {
    background-color: #f0f0f0;
  }

  p {
    margin: 0;
    font-size: 16px;
    color: #555;
    flex: 1; /* Allow the text to take available space */
  }

  /* Responsive design */
  @media (max-width: 768px) {
    flex-direction: column; /* Stack items vertically on smaller screens */
    align-items: flex-start; /* Align items to start */
  }
`;

// Submit button styling for the form (Add Teacher)
export const AddTeacherButton = styled(Button)`
  background-color: #1890ff;
  border-color: #1890ff;
  color: white;
  border-radius: 4px;
  padding: 8px 16px;
  font-weight: bold;

  &:hover {
    background-color: #40a9ff;
    border-color: #40a9ff;
  }

  &:focus {
    background-color: #40a9ff;
    border-color: #40a9ff;
  }
`;

// Styled button for Update and Delete actions
export const ActionButton = styled(Button)`
  margin-right: 8px; /* Space between buttons */
  border-radius: 4px;
  
  &.ant-btn-primary {
    background-color: #4caf50; /* Green for Update */
    border-color: #4caf50;

    &:hover {
      background-color: #45a049; /* Darker green on hover */
      border-color: #388e3c;
    }
  }

  &.ant-btn-danger {
    background-color: #f44336; /* Red for Delete */
    border-color: #f44336;

    &:hover {
      background-color: #e53935; /* Darker red on hover */
      border-color: #d32f2f;
    }
  }
`;

// Styled list for the teacher entries
export const TeacherList = styled(List)`
  width: 100%; /* Ensure the list takes full width */
  max-width: 800px; /* Limit max width */
  margin: auto; /* Center the list */

  @media (max-width: 768px) {
    width: 100%; /* Full width on small screens */
  }
`;
