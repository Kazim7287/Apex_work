import styled from 'styled-components';

// Removed duplicate declaration of PerformanceContainer

// Removed duplicate declaration of Content

// Removed duplicate declaration of PerformanceContent

// Removed duplicate declaration of PerformanceHeader

export const CollegePerformance = styled.div`
  margin-bottom: 20px;
  margin-left: 20px;
  padding: 20px;
  background-color: #f0f2f5;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

export const IndividualPerformance = styled.div`
  margin-bottom: 20px;
  padding: 20px;
  background-color: #f0f2f5;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

export const SidebarContainer = styled.div`
  flex: 0 0 250px; /* Sidebar width */
  background-color: #001529;
  height: 100vh;
  color: #fff;
  padding: 20px;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
`;

export const PerformanceInfo = styled.div`
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  padding: 20px;
  margin-bottom: 20px;
`;

export const PerformanceGraphContainer = styled.div`
  margin-bottom: 20px;
  padding: 20px;
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

export const TotalMarks = styled.div`
  font-weight: bold;
  font-size: 16px;
  margin-top: 10px;
`;
import { Button, Table, Modal } from 'antd';

export const PerformanceContainer = styled.div`
  display: flex;
  min-height: 100vh;
`;

export const Content = styled.div`
  flex: 1;
  padding: 20px;
`;

export const PerformanceContent = styled.div`
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

export const PerformanceHeader = styled.h2`
  margin-bottom: 20px;
  color: #1890ff;
`;

export const SectionButton = styled(Button)`
  margin: 5px;
  background-color: ${props => props.active ? '#1890ff' : '#f0f0f0'};
  color: ${props => props.active ? 'white' : 'inherit'};
  border-color: ${props => props.active ? '#1890ff' : '#d9d9d9'};

  &:hover {
    background-color: ${props => props.active ? '#40a9ff' : '#f5f5f5'};
    color: ${props => props.active ? 'white' : 'inherit'};
    border-color: ${props => props.active ? '#40a9ff' : '#d9d9d9'};
  }
`;

export const StyledTable = styled(Table)`
  margin-top: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  overflow: hidden;

  .ant-table-thead > tr > th {
    background-color: #fafafa;
    font-weight: 600;
  }
`;

export const PerformanceModal = styled(Modal)`
  .ant-modal-content {
    border-radius: 8px;
  }
`;