
import styled from 'styled-components';
import { Link } from 'react-router-dom';

export const ListContainer = styled.div`
  width: 90%;
  margin: 0 auto;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    margin-top: 20px;
  display: flex;
  flex-direction: column;

`;

export const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin: 20px 0;
`;

export const TableHeader = styled.th`
  padding: 12px 15px;
  background-color: #FF4500;
  color: #fff;
  font-weight: bold;
  text-align: left;
`;

export const TableRow = styled.tr`
  &:nth-child(even) {
    background-color: #f2f2f2;
  }
`;

export const TableData = styled.td`
  padding: 12px 15px;
  border-bottom: 1px solid #ddd;
  text-align: left;

`

export const TeacherListContainer = styled.div`
  padding: 20px;
  max-width: 1000px;
  margin: 0 auto;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

export const BackLink = styled(Link)`
  display: inline-block;
  margin-bottom: 20px;
  color: #FF4500;
  text-decoration: none;
  font-weight: bold;

  &:hover {
    text-decoration: underline;
  }
`;

export const TeacherTable = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

export const TableHead = styled.thead`
  background-color: #FF4500;
  color: white;
`;
export const ClassListContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  background-color: #f4f4f4;
  min-height: 100vh; /* Full height of the viewport */
`;

export const ClassCard = styled.div`
  background-color: #fff;
  width: 90%;
  max-width: 400px;
  margin: 15px 0;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
  }
`;

export const ClassTitle = styled.h3`
  font-size: 24px;
  color: #333;
  margin-bottom: 10px;
`;

export const ClassDetails = styled.p`
  font-size: 16px;
  color: #777;
  margin: 5px 0;
`;
// export const ListContainer = styled.div`
//   display: flex;
//   flex-direction: column;
//   align-items: center;
//   padding: 20px;
//   background-color: #f4f4f4;
//   min-height: 100vh; /* Full height of the viewport */
// `;

export const ListCard = styled.div`
  background-color: #fff;
  width: 90%;
  max-width: 400px;
  margin: 15px 0;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
  }
`;

export const ListTitle = styled.h3`
  font-size: 24px;
  color: #333;
  margin-bottom: 10px;
`;

export const ListDetails = styled.p`
  font-size: 16px;
  color: #777;
  margin: 5px 0;
`;
export const TimetableModal = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 80%;
  max-width: 800px;
  max-height: 80vh;
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.15);
  z-index: 1000;
  overflow-y: auto;
`;

export const TimetableHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
  
  h2 {
    margin: 0;
    color: #333;
  }
`;

export const TimetableCloseButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
  
  &:hover {
    color: #333;
  }
`;

export const TimetableContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

export const TimetableDay = styled.div`
  background: #f8f9fa;
  padding: 15px;
  border-radius: 6px;
  
  h3 {
    margin: 0 0 10px 0;
    color: #444;
  }
`;

export const TimetableEntry = styled.div`
  background: white;
  padding: 10px 15px;
  margin-bottom: 10px;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  
  div:first-child {
    display: flex;
    justify-content: space-between;
    margin-bottom: 5px;
    
    strong {
      color: #0d6efd;
    }
    
    span {
      color: #666;
      font-size: 0.9em;
    }
  }
  
  div:last-child {
    color: #555;
    font-size: 0.9em;
  }
`;

export const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100px;
  color: #666;
`;

export const ErrorMessage = styled.div`
  color: #dc3545;
  background-color: #f8d7da;
  padding: 10px;
  border-radius: 4px;
  text-align: center;
`;
export const Highlight = styled.span`
  color: #28a745;
  font-weight: bold;
  margin-top: 5px;
`;
export const HighlightText = styled.div`
  color: #28a745;
  font-weight: bold;
  margin-top: 5px;
  font-size: 0.9em;
`;

// Add this to your existing TimetableEntry component
