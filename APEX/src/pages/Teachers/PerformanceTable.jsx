/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React, { useRef, useState } from 'react';
import { Table, Tag, Space, Button, Popconfirm, Input, Grid } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import Highlighter from 'react-highlight-words';

const { useBreakpoint } = Grid;

const PerformanceTable = ({ data, onUpdate, onDelete, loading }) => {
  const screens = useBreakpoint();
  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  const searchInput = useRef(null);

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
          <Button onClick={() => handleReset(clearFilters)} size="small" style={{ width: 90 }}>
            Reset
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered) => <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />,
    onFilter: (value, record) =>
      record[dataIndex]
        ? record[dataIndex].toString().toLowerCase().includes(value.toLowerCase())
        : '',
    onFilterDropdownVisibleChange: (visible) => {
      if (visible) {
        setTimeout(() => searchInput.current.select(), 100);
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

  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleReset = (clearFilters) => {
    clearFilters();
    setSearchText('');
  };

  const columns = [
    {
      title: 'Subject',
      dataIndex: 'subject_name',
      key: 'subject_name',
      ...getColumnSearchProps('subject_name'),
      fixed: screens.md ? 'left' : false,
      width: screens.md ? 180 : 120,
    },
    {
      title: 'Student',
      dataIndex: 'student_name',
      key: 'student_name',
      ...getColumnSearchProps('student_name'),
      width: screens.md ? 180 : 120,
    },
    {
      title: 'Section',
      dataIndex: 'section_name',
      key: 'section_name',
      ...getColumnSearchProps('section_name'),
      responsive: ['md'],
    },
    {
      title: 'Exam',
      dataIndex: 'exam_name',
      key: 'exam_name',
      ...getColumnSearchProps('exam_name'),
      responsive: ['md'],
    },
    {
      title: 'Total',
      dataIndex: 'total_marks',
      key: 'total_marks',
      align: 'center',
      width: 100,
      sorter: (a, b) => a.total_marks - b.total_marks,
    },
    {
      title: 'Obtained',
      dataIndex: 'obtained_marks',
      key: 'obtained_marks',
      align: 'center',
      width: 120,
      render: (marks) => (marks === null ? <Tag color="orange">Not Marked</Tag> : marks),
      sorter: (a, b) => (a.obtained_marks || 0) - (b.obtained_marks || 0),
    },
    {
      title: '%',
      key: 'percentage',
      align: 'center',
      width: 100,
      render: (_, record) => {
        if (record.obtained_marks === null) return <Tag color="orange">N/A</Tag>;
        return ((record.obtained_marks / record.total_marks) * 100).toFixed(2) + '%';
      },
      sorter: (a, b) => {
        const aPct = a.obtained_marks ? (a.obtained_marks / a.total_marks) * 100 : 0;
        const bPct = b.obtained_marks ? (b.obtained_marks / b.total_marks) * 100 : 0;
        return aPct - bPct;
      },
    },
    {
      title: 'Action',
      key: 'action',
      align: 'center',
      width: screens.md ? 150 : 120,
      fixed: screens.md ? 'right' : false,
      render: (_, record) => (
        <Space size="middle" direction={screens.md ? 'horizontal' : 'vertical'}>
          <Button 
            type="link" 
            onClick={() => onUpdate(record)} 
            size="small"
            style={{ padding: 0 }}
          >
            Update
          </Button>
          <Popconfirm
            title="Delete this record?"
            onConfirm={() => onDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="link" danger size="small" style={{ padding: 0 }}>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ overflowX: 'auto', padding: screens.xs ? '0 8px' : 0 }}>
      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        bordered
        loading={loading}
        scroll={{ 
          x: screens.xs ? 800 : true,
          y: screens.md ? 'calc(100vh - 360px)' : undefined
        }}
        style={{
          marginTop: 16,
          borderRadius: 8,
          minWidth: screens.xs ? 'max-content' : '100%',
        }}
        size={screens.xs ? 'small' : 'middle'}
        pagination={{
          pageSizeOptions: ['10', '20', '50'],
          showSizeChanger: true,
          responsive: true,
          size: screens.xs ? 'small' : 'default',
        }}
      />
    </div>
  );
};

export default PerformanceTable;