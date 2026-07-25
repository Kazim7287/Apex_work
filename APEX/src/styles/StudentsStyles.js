import styled from 'styled-components';
import { Modal } from 'antd';

// Styled Button (Action Button)
export const ActionButton = styled.button`
    background-color: ${(props) => (props.delete ? '#ff4d4f' : '#4CAF50')}; /* Red for delete, green for update */
    color: white;
    border: none;
    border-radius: 5px;
    padding: 10px 20px;
    margin: 5px;
    cursor: pointer;
    transition: background-color 0.3s, transform 0.2s; /* Added transform for hover effect */

    &:hover {
        background-color: ${(props) => (props.delete ? '#d43f3a' : '#45a049')}; /* Darken on hover */
        transform: scale(1.05); /* Slightly increase size on hover */
    }
`;

// Modal styling
export const StyledModal = styled(Modal)`
    .ant-modal-content {
        background: rgba(255, 255, 255, 0.95); /* Slightly less transparent for clarity */
        border-radius: 10px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2); /* Soft shadow for depth */
    }
    
    .ant-modal-header {
        background: #4CAF50;
        color: white; /* Header text color */
        border-bottom: none;
        border-top-left-radius: 10px;
        border-top-right-radius: 10px;
    }

    .ant-modal-title {
        color: white; /* Title color */
    }

    .ant-input {
        border: 1px solid #ccc;
        border-radius: 5px;
        padding: 10px;
        font-size: 16px;
        transition: border-color 0.3s;

        &:focus {
            border-color: #4CAF50; /* Match modal header color */
            box-shadow: 0 0 5px rgba(76, 175, 80, 0.5);
        }
    }
`;

// Input field styling
export const InputField = styled.input`
    width: 100%;
    padding: 10px;
    margin: 15px 0; /* Increased margin for more space */
    border: 1px solid #ddd;
    border-radius: 5px;
    transition: border-color 0.3s;

    &:focus {
        border-color: #4CAF50; /* Match theme */
        outline: none;
        box-shadow: 0 0 5px rgba(76, 175, 80, 0.5);
    }
`;

// Search bar styling
export const SearchBar = styled.div`
    margin: 20px 0;
    text-align: right;

    input {
        padding: 10px;
        width: 250px;
        border: 1px solid #ccc;
        border-radius: 5px;
        font-size: 16px;
        transition: border-color 0.3s;

        &:focus {
            border-color: #4CAF50;
            box-shadow: 0 0 5px rgba(76, 175, 80, 0.5);
            outline: none;
        }
    }
`;

// Container for students section
export const StudentsContainer = styled.div`
    display: flex;
    flex-direction: row;
    min-height: 100vh;
`;

// Main content container
export const Content = styled.div`
    flex: 1;
    padding: 20px;
    background-color: #f5f5f5;
`;

// Student list content box
export const StudentsContent = styled.div`
    background: white;
    border-radius: 10px;
    padding: 40px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
    border: 1px solid #ddd; /* Add border for overall container */
`;

// Header for the student section
export const StudentsHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px; /* Increased margin for header spacing */
`;

// Unordered list to hold the student items
export const StudentList = styled.ul`
    list-style-type: none;
    padding: 0;
    max-height: 400px;
    overflow-y: auto;
    border: 1px solid #ddd; /* Border for the list */
    border-radius: 10px;
    background-color: #fafafa;
    padding: 15px; /* Increased padding for better spacing */
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1); /* Slight shadow for depth */
`;

// Individual student item styling
export const StudentItem = styled.li`
    background-color: #ffffff;
    border: 1px solid #e0e0e0; /* Slightly lighter border for better contrast */
    border-radius: 8px; /* Slightly more rounded corners */
    padding: 20px; /* Increased padding for each item */
    margin-bottom: 20px; /* Increased margin between items for better spacing */
    display: flex;
    justify-content: space-between;
    align-items: center;
    transition: background-color 0.3s ease-in-out, box-shadow 0.3s ease-in-out, transform 0.2s; /* Added transform for hover effect */
    
    &:hover {
        background-color: #e9ffe9; /* Light green background on hover */
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2); /* Enhanced shadow effect */
        transform: scale(1.02); /* Slightly increase size on hover */
    }
`;

// Form to add a new student
export const AddStudentForm = styled.div`
    display: flex;
    justify-content: flex-end;
    margin-bottom: 30px; /* Increased margin for form spacing */

    button {
        background-color: #4CAF50;
        color: white;
        padding: 10px 20px;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        transition: background-color 0.3s, transform 0.2s; /* Added transform for hover effect */

        &:hover {
            background-color: #45a049;
            transform: scale(1.05); /* Slightly increase size on hover */
        }
    }
`;

// Input field in add student form
export const AddStudentInput = styled.input`
    padding: 10px; /* Increased padding for input */
    margin-right: 15px; /* Increased margin for spacing */
    border: 1px solid #ccc; /* Add border to input */
    border-radius: 4px;
    transition: border-color 0.3s;

    &:focus {
        border-color: #4CAF50; /* Match theme */
        outline: none;
        box-shadow: 0 0 5px rgba(76, 175, 80, 0.5);
    }
`;

// Add new student button
export const AddStudentButton = styled.button`
    padding: 10px 20px; /* Increased padding for button */
    background-color: #007bff;
    color: #fff;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.3s, transform 0.2s; /* Added transform for hover effect */

    &:hover {
        background-color: #0056b3;
        transform: scale(1.05); /* Slightly increase size on hover */
    }
`;
export const TableBody = styled.tbody`
    tr {
        transition: background-color 0.3s ease;
        
        &:hover {
            background-color: #f1f1f1; /* Light gray background on hover */
        }
    }

    td {
        padding: 15px; /* Increased padding for cells */
        border-bottom: 1px solid #ddd; /* Light border for separation */
        text-align: left; /* Align text to the left */
    }
`;
