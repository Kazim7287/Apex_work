// ChooseUserStyles.js
import styled from 'styled-components';
import { Link } from 'react-router-dom';

export const ChooseUserContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  height: 100vh;
  background: linear-gradient(135deg, #FFD700 30%, #FFEA00 100%); /* Gradient background for depth */

  @media screen and (min-width: 768px) {
    flex-direction: row;
    justify-content: space-between; /* Spread items evenly horizontally */
    align-items: flex-start;
  }
`;

export const UserSection = styled.div`
  text-align: center; /* Center text */
  padding: 20px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1); /* Soft shadow for depth */
  border-radius: 10px; /* Rounded corners */
  background-color: rgba(255, 255, 255, 0.9); /* Slightly transparent white for contrast */
  transition: transform 0.3s ease, box-shadow 0.3s ease; /* Transition for hover effect */

  &:hover {
    transform: translateY(-5px); /* Lift effect on hover */
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2); /* Deeper shadow on hover */
  }

  @media screen and (min-width: 768px) {
    padding: 40px; /* More padding on larger screens */
    margin: 20px; /* Space between sections */
    text-align: left; /* Align text to the left for larger screens */
  }
`;

export const Title = styled.h2`
  font-size: 28px; /* Increased font size */
  font-weight: bold;
  margin-bottom: 20px;
  color: #FF4500; /* Admin: Orange color */
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.2); /* Text shadow for depth */

  @media screen and (max-width: 768px) {
    font-size: 24px; /* Adjusted for smaller screens */
  }
`;

export const Button = styled(Link)`
  display: inline-block; /* Ensures the button behaves like a block */
  background: linear-gradient(45deg, #90EE90, #7CFC00); /* Gradient background */
  color: white;
  border: none;
  padding: 12px 24px; /* Increased padding */
  margin-top: 10px;
  text-decoration: none;
  cursor: pointer;
  border-radius: 8px; /* More pronounced rounded corners */
  transition: background 0.3s ease, transform 0.3s ease; /* Transition for hover effect */

  &:hover {
    background: linear-gradient(45deg, #7CFC00, #66CDAA); /* Change gradient on hover */
    transform: scale(1.05); /* Slightly enlarge on hover */
  }

  @media screen and (max-width: 768px) {
    padding: 10px 20px; /* Adjust padding for smaller screens */
    font-size: 16px; /* Adjust font size for buttons */
  }
`;


// // ChooseUserStyles.js
// import styled from 'styled-components';
// import { Link } from 'react-router-dom';

// export const ChooseUserContainer = styled.div`
//   display: flex;
//   flex-direction: column;
//   justify-content: flex-start;
//   align-items: center;
//   height: 100vh;
//   background-color: #FFD700; /* Playful yellow background color */

//   @media screen and (min-width: 768px) {
//     flex-direction: row;
//     justify-content: space-between; /* Spread items evenly horizontally */
//     align-items: flex-start;
//   }
// `;

// export const UserSection = styled.div`
//   text-align: center; /* Center text */
//   padding-top: 20px;

//   @media screen and (min-width: 768px) {
//     padding-top: 0;
//     margin: 20px;
//     text-align: left; /* Align text to the left for larger screens */
//   }
// `;

// export const Title = styled.h2`
//   font-size: 24px;
//   font-weight: bold;
//   margin-bottom: 20px;
//   color: #FF4500; /* Admin: Orange color */

//   @media screen and (max-width: 768px) {
//     font-size: 20px;
//   }
// `;

// export const Button = styled(Link)`
//   background-color: #90EE90; /* Student: Light green color */
//   color: white;
//   border: none;
//   padding: 10px 20px;
//   margin-top: 10px;
//   text-decoration: none;
//   cursor: pointer;
//   border-radius: 5px;
//   transition: background-color 0.3s ease;

//   &:hover {
//     background-color: #7CFC00; /* Darker shade of green on hover */
//   }

//   @media screen and (max-width: 768px) {
//     padding: 8px 16px;
//     font-size: 14px;
//   }
// `;
