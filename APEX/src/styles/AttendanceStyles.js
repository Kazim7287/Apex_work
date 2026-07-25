import styled from 'styled-components';

export const AttendanceContainer = styled.div`
  display: flex;
  min-height: 100vh;
  padding-left: 240px;
  background-color: #f4f7fc;

  @media screen and (max-width: 768px) {
    flex-direction: column;
    padding-left: 0;
  }
`;

export const Content = styled.div`
  flex: 1;
  padding: 20px;
  display: flex;
  flex-direction: column;
  background-color: #ffffff;
  border-radius: 10px;
  box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.1);
`;

export const AttendanceHeader = styled.h2`
  font-size: 2rem;
  margin-bottom: 20px;
  color: #34495e;
  text-align: center;
`;

export const AttendanceList = styled.ul`
  list-style: none;
  padding: 0;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr; /* Adjust for larger screens */
  gap: 15px;

  @media screen and (max-width: 1024px) {
    grid-template-columns: 1fr 1fr; /* For tablets */
  }

  @media screen and (max-width: 768px) {
    grid-template-columns: 1fr; /* For mobile */
  }
`;

export const AttendanceItem = styled.li`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  border-radius: 8px;
  background-color: #f9fbfd;
  box-shadow: 0px 2px 8px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

export const AttendanceDate = styled.span`
  font-weight: bold;
  color: #2c3e50;
  font-size: 1.1rem;
`;

export const AttendanceStatus = styled.span`
  font-size: 1rem;
  padding: 5px 10px;
  border-radius: 20px;
  text-transform: uppercase;
  font-weight: bold;
  background-color: ${({ present }) => (present ? '#27ae60' : '#e74c3c')};
  color: #fff;
`;

export const SidebarContainer = styled.div`
  // flex: 0 0 250px;
  // background-color: #2c3e50;
  // padding: 20px;
  // color: white;
  // min-height: 100vh;

  // @media screen and (max-width: 768px) {
  //   flex: 1;
  //   padding: 15px;
  //   min-height: auto;
  // }
`;

export const StudentName = styled.span`
  flex: 1;
  font-size: 1rem;
  color: #34495e;
`;

export const CheckboxLabel = styled.label`
  margin-right: 10px;
  font-size: 0.9rem;
  color: #34495e;
`;

export const Divider = styled.hr`
  margin-top: 5px;
  border: 0;
  border-top: 1px solid #ccc;
`;

export const SubmitButton = styled.button`
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #0056b3;
  }
`;

// // AttendanceStyles.js
// import styled from 'styled-components';

// export const AttendanceContainer = styled.div`
//   display: flex;
//   padding-left: 240px;

//   @media screen and (max-width: 768px) {
//     flex-direction: column;
//     padding-left: 0;
//   }
// `;

// export const Content = styled.div`
//   flex: 1;
// `;

// export const AttendanceContent = styled.div`
//   padding: 20px;
// `;

// export const AttendanceHeader = styled.h2`
//   font-size: 24px;
//   margin-bottom: 20px;
// `;

// export const AttendanceList = styled.ul`
//   list-style: none;
//   padding: 0;
// `;

// export const AttendanceItem = styled.li`
//   display: flex;
//   align-items: center;
//   margin-bottom: 20px;
// `;

// export const StudentName = styled.span`
//   flex: 1;
// `;

// export const CheckboxLabel = styled.label`
//   margin-right: 10px;
// `;

// export const Divider = styled.hr`
//   margin-top: 5px;
//   border: 0;
//   border-top: 1px solid #ccc;
// `;

// export const SubmitButton = styled.button`
//   padding: 8px 16px;
//   background-color: #007bff;
//   color: #fff;
//   border: none;
//   border-radius: 4px;
//   cursor: pointer;
// `;


// export const SidebarContainer = styled.div`
//   flex: 0 0 250px; /* Sidebar width */
// `;

// export const AttendanceDate = styled.span`
//   font-weight: bold;
// `;

// export const AttendanceStatus = styled.span`
//   margin-left: 10px;
//   color: ${({ present }) => (present ? 'green' : 'red')};
// `;
