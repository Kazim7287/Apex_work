// TeacherSignInStyles.js
import styled from 'styled-components';
import { Link } from 'react-router-dom';

export const TeacherSignInContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center; /* Center content vertically */
  background: linear-gradient(45deg, #FF69B4, #FFA07A, #90EE90); /* Gradient background */
  min-height: 100vh; /* Full height of the viewport */
  padding: 20px; /* Add padding for better layout */
`;

export const FormContainer = styled.form`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 90%; /* Responsive width */
  max-width: 400px; /* Increased limit for form width */
  padding: 30px; /* More padding for spacious feel */
  border: 1px solid #ddd; /* Slightly lighter border */
  border-radius: 12px; /* More rounded corners */
  background-color: #ffffff; /* White background for contrast */
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); /* Deeper shadow for more depth */
  transition: transform 0.3s ease; /* Transition for hover effect */

  &:hover {
    transform: translateY(-5px); /* Lift effect on hover */
  }
`;

export const InputField = styled.input`
  width: 100%;
  padding: 12px; /* Increased padding for comfort */
  margin: 10px 0;
  border: 1px solid #ccc;
  border-radius: 6px; /* Slightly more rounded corners */
  font-size: 16px; /* Increased font size for better readability */
  transition: border-color 0.3s ease;

  &:focus {
    outline: none; /* Remove default outline */
    border-color: #FF4500; /* Change border color on focus */
    box-shadow: 0 0 5px rgba(255, 69, 0, 0.5); /* Add shadow on focus */
  }
`;

export const SubmitButton = styled(Link)`
  width: 100%;
  padding: 14px; /* Increased padding */
  margin-top: 20px;
  border: none;
  border-radius: 8px;
  background-color: #FF4500; /* Primary color */
  color: white;
  font-size: 20px; /* Increased font size */
  text-decoration: none;
  text-align: center;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.3s ease; /* Added transform transition */

  &:hover {
    background-color: #FF6347; /* Change on hover */
    transform: scale(1.05); /* Slightly enlarge button on hover */
  }

  @media screen and (max-width: 768px) {
    font-size: 18px; /* Adjust font size for smaller screens */
    padding: 12px; /* Adjust padding for smaller screens */
  }
`;

// // TeacherSignInStyles.js
// import styled from 'styled-components';
// import { Link } from 'react-router-dom';

// export const TeacherSignInContainer = styled.div`
//   display: flex;
//   flex-direction: column;
//   align-items: center;
//   background: linear-gradient(45deg, #FF69B4, #FFA07A, #90EE90); /* Gradient background */
//   min-height: 100vh; /* Full height of the viewport */
// `;

// export const FormContainer = styled.form`
//   display: flex;
//   flex-direction: column;
//   align-items: center;
//   width: 80%;
//   max-width: 300px; /* Limit form width */
//   padding: 20px;
//   border: 1px solid #ccc;
//   border-radius: 8px;
//   background-color: #f9f9f9;
//   box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
// `;

// export const InputField = styled.input`
//   width: 100%;
//   padding: 10px;
//   margin: 10px 0;
//   border: 1px solid #ccc;
//   border-radius: 4px;
// `;

// export const SubmitButton = styled(Link)`
//   width: 100%;
//   padding: 12px;
//   margin-top: 20px;
//   border: none;
//   border-radius: 8px;
//   background-color: #FF4500;
//   color: white;
//   font-size: 18px;
//   text-decoration: none;
//   text-align: center;
//   cursor: pointer;
//   transition: background-color 0.3s ease;

//   &:hover {
//     background-color: #FF6347;
//   }

//   @media screen and (max-width: 768px) {
//     font-size: 16px;
//   }
// `;
