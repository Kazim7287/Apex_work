import  { useRef, useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { Table, Button, Popconfirm, Space, Input, Typography } from 'antd';
import Highlighter from 'react-highlight-words';
import { SearchOutlined } from '@ant-design/icons';

const { Text } = Typography;

const PerformanceList = ({ 
  performanceData, 
  handleUpdate, 
  handleDelete 
}) => {
  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  const searchInput = useRef(null);

  // Calculate aggregated totals
  const aggregatedData = useMemo(() => {
    const studentMap = {};
    
    performanceData.forEach(item => {
      if (!studentMap[item.student_id]) {
        studentMap[item.student_id] = {
          student_id: item.student_id,
          student_name: item.student_name,
          total_marks: 0,
          obtained_marks: 0,
          exams: 0,
          details: []
        };
      }
      
      studentMap[item.student_id].total_marks += item.total_marks;
      studentMap[item.student_id].obtained_marks += item.obtained_marks;
      studentMap[item.student_id].exams += 1;
      studentMap[item.student_id].details.push(item);
    });

    return Object.values(studentMap).map(student => ({
      ...student,
      overall_percentage: (student.obtained_marks / student.total_marks) * 100
    }));
  }, [performanceData]);

  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleReset = (clearFilters) => {
    clearFilters();
    setSearchText('');
  };

  const getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
      <div style={{ padding: 8 }}>
        <Input
          ref={searchInput}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{ marginBottom: 8, display: 'block' }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            Search
          </Button>
          <Button
            onClick={() => handleReset(clearFilters)}
            size="small"
            style={{ width: 90 }}
          >
            Reset
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered) => (
      <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
    ),
    onFilter: (value, record) =>
      record[dataIndex]
        ? record[dataIndex].toString().toLowerCase().includes(value.toLowerCase())
        : '',
    onFilterDropdownVisibleChange: (visible) => {
      if (visible) {
        setTimeout(() => searchInput.current?.select(), 100);
      }
    },
    render: (text) =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ''}
        />
      ) : (
        text
      ),
  });

  const expandedRowRender = (record) => {
    const columns = [
      {
        title: 'Subject',
        dataIndex: 'subject_name',
        key: 'subject_name',
      },
      {
        title: 'Exam',
        dataIndex: 'exam_name',
        key: 'exam_name',
      },
      {
        title: 'Total Marks',
        dataIndex: 'total_marks',
        key: 'total_marks',
        align: 'center'
      },
      {
        title: 'Obtained Marks',
        dataIndex: 'obtained_marks',
        key: 'obtained_marks',
        align: 'center'
      },
      {
        title: 'Percentage',
        key: 'percentage',
        align: 'center',
        render: (_, item) => (
          <Text strong style={{
            color: (item.obtained_marks / item.total_marks) >= 0.5 ? '#52c41a' : '#f5222d'
          }}>
            {((item.obtained_marks / item.total_marks) * 100).toFixed(2)}%
          </Text>
        )
      }
    ];

    return (
      <Table
        columns={columns}
        dataSource={record.details}
        rowKey="id"
        size="small"
        pagination={false}
      />
    );
  };

  const performanceColumns = [
    { 
      title: 'Student Name', 
      dataIndex: 'student_name', 
      key: 'student_name', 
      ...getColumnSearchProps('student_name'),
      width: '15%'
    },
    { 
      title: 'Total Exams', 
      dataIndex: 'exams', 
      key: 'exams',
      width: '10%',
      align: 'center'
    },
    { 
      title: 'Total Marks', 
      dataIndex: 'total_marks', 
      key: 'total_marks',
      width: '10%',
      align: 'center'
    },
    { 
      title: 'Obtained Marks', 
      dataIndex: 'obtained_marks', 
      key: 'obtained_marks',
      width: '10%',
      align: 'center'
    },
    { 
      title: 'Overall Percentage', 
      key: 'overall_percentage',
      width: '15%',
      align: 'center',
      render: (_, record) => (
        <Text strong style={{
          color: record.overall_percentage >= 50 ? '#52c41a' : '#f5222d',
          fontSize: '16px'
        }}>
          {record.overall_percentage.toFixed(2)}%
        </Text>
      ),
      sorter: (a, b) => a.overall_percentage - b.overall_percentage
    },
    {
      title: 'Action',
      key: 'action',
      width: '20%',
      fixed: 'right',
      render: (_, record) => (
        <Space size="middle">
          <Button 
            type="link" 
            onClick={() => handleUpdate(record.details[0])} // Update first record as sample
            style={{ padding: '0 4px' }}
          >
            Update
          </Button>
          <Popconfirm
            title="Are you sure you want to delete all records for this student?"
            onConfirm={() => handleDelete(record.student_id)}
            okText="Yes"
            cancelText="No"
            placement="leftTop"
          >
            <Button 
              type="link" 
              danger
              style={{ padding: '0 4px' }}
            >
              Delete All
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Table
      columns={performanceColumns}
      dataSource={aggregatedData}
      rowKey="student_id"
      bordered
      size="middle"
      scroll={{ x: 'max-content' }}
      style={{ 
        marginTop: 16,
        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 1px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px 0 rgba(0, 0, 0, 0.02)',
        borderRadius: 8
      }}
      expandable={{
        expandedRowRender,
        rowExpandable: (record) => record.details.length > 0,
      }}
      pagination={{
        pageSize: 10,
        showSizeChanger: true,
        pageSizeOptions: ['10', '20', '50', '100'],
        showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} students`,
        position: ['bottomRight']
      }}
    />
  );
};

PerformanceList.propTypes = {
  performanceData: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      student_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      student_name: PropTypes.string.isRequired,
      subject_name: PropTypes.string.isRequired,
      teacher_name: PropTypes.string.isRequired,
      section_name: PropTypes.string.isRequired,
      exam_name: PropTypes.string.isRequired,
      total_marks: PropTypes.number.isRequired,
      obtained_marks: PropTypes.number.isRequired,
    })
  ).isRequired,
  handleUpdate: PropTypes.func.isRequired,
  handleDelete: PropTypes.func.isRequired,
};

export default PerformanceList;