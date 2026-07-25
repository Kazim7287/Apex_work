import styled from 'styled-components';

// Main container for the classes page
export const ClassesContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background-color: #f4f7fc; /* Soft background color */
  
  @media screen and (max-width: 768px) {
    flex-direction: column; /* Stack content and sidebar on mobile */
  }
`;

// Content area
export const Content = styled.div`
  flex: 1;
  padding: 20px;
  transition: margin-left 0.3s ease; /* Smooth transition for sidebar toggle */
  margin-left: ${(props) => (props.sidebarOpen ? '250px' : '0')}; /* Adjust content space based on sidebar visibility */
  
  @media screen and (max-width: 768px) {
    margin-left: 0; /* Full width on mobile */
    padding-left: 15px;
  }
`;

// Main content box with a white background, border radius, and shadow
export const ClassesContent = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  padding: 20px;
  min-height: 80vh;
  margin-top: 20px;
  transition: margin-left 0.3s ease;
`;

// Header for the classes page
export const ClassesHeader = styled.h2`
  font-size: 28px;
  color: #333;
  margin-bottom: 20px;
  font-weight: 600;
`;

// Style for the list of classes (sections)
export const ClassList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

// Each class item (section) in the list
export const ClassItem = styled.li`
  background-color: #ffffff;
  border-radius: 8px;
  padding: 15px 20px;
  margin-bottom: 15px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 6px 10px rgba(0, 0, 0, 0.1);
  }
`;

// Form to add a new class (section)
export const AddClassForm = styled.form`
  display: flex;
  align-items: center;
  margin-bottom: 30px;
`;

// Input field to enter a new class name
export const AddClassInput = styled.input`
  padding: 12px;
  margin-right: 15px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 16px;
  width: 250px;
  max-width: 100%;
  box-sizing: border-box;
  transition: border-color 0.3s ease;

  &:focus {
    border-color: #007bff;
    outline: none;
  }
`;

// Button to submit the form and add the new class
export const AddClassButton = styled.button`
  padding: 12px 24px;
  background-color: #007bff;
  color: #fff;
  font-size: 16px;
  font-weight: 600;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #0056b3;
  }

  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
`;

// Container for the class page (content and sidebar)
export const ClassContainer = styled.div`
  display: flex;
  width: 100%;
  min-height: 100vh;
  flex-direction: row;
`;

// Sidebar container
export const SidebarContainer = styled.div`
  flex: 0 0 250px; /* Sidebar width */
  background-color: #2c3e50;
  color: #fff;
  padding-top: 20px;
  padding-left: 15px;
  height: 100vh;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
  transition: width 0.3s ease;

  @media screen and (max-width: 768px) {
    position: fixed;
    top: 0;
    left: 0;
    width: ${(props) => (props.isSidebarOpen ? '250px' : '0')}; /* Toggle sidebar width on mobile */
    height: 100%;
    z-index: 1000;
    display: block;
    overflow: hidden; /* Prevent content from overflowing when sidebar is hidden */
    transition: width 0.3s ease;
  }
`;

// Header for the class page
export const ClassHeader = styled.h1`
  font-size: 30px;
  margin-bottom: 20px;
  color: #333;
`;

// Header for each grade section
export const GradeHeader = styled.h3`
  font-size: 20px;
  margin-bottom: 15px;
  color: #444;
  font-weight: 600;
`;

