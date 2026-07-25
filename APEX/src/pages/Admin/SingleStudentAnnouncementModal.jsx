import { useState, useEffect } from 'react';
import { Select, Spin, message, Button, Space, Divider, Tag } from 'antd';
import debounce from 'lodash/debounce';
import PropTypes from 'prop-types';

const { Option } = Select;

const StudentSearch = ({ onSelect }) => {
  const [students, setStudents] = useState([]);
  const [searching, setSearching] = useState(false);
  const [sections, setSections] = useState([]);
  const [selectedSection, setSelectedSection] = useState(null);
  const [loadingSections, setLoadingSections] = useState(false);
  const [sectionStudents, setSectionStudents] = useState([]);
  const [loadingSectionStudents, setLoadingSectionStudents] = useState(false);

  // Fetch available sections on component mount
  useEffect(() => {
    const fetchSections = async () => {
      setLoadingSections(true);
      try {
        const response = await fetch('https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/Sec_read.php', {
          credentials: 'include' // Include session cookies
        });
        
        // Handle session expiration
        if (response.status === 401) {
          message.error('Session expired. Please login again.');
          window.location.href = '/login';
          return;
        }

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (Array.isArray(data)) {
          setSections(data);
        } else {
          throw new Error('Unexpected data format from sections API');
        }
      } catch (error) {
        console.error('Error fetching sections:', error);
        message.error('Failed to load sections');
      } finally {
        setLoadingSections(false);
      }
    };

    fetchSections();
  }, []);

  // Fetch students by section when section is selected
  useEffect(() => {
    const fetchStudentsBySection = async () => {
      if (!selectedSection) {
        setSectionStudents([]);
        return;
      }

      setLoadingSectionStudents(true);
      try {
        const response = await fetch('https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/secAdpStudents.php', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include', // Include session cookies
          body: JSON.stringify({
            section_id: selectedSection
          })
        });

        // Handle session expiration
        if (response.status === 401) {
          message.error('Session expired. Please login again.');
          window.location.href = '/login';
          return;
        }

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.status === 'success') {
          setSectionStudents(data.data);
        } else if (data.message) {
          message.info(data.message);
          setSectionStudents([]);
        } else {
          throw new Error('Unexpected data format from students API');
        }
      } catch (error) {
        console.error('Error fetching section students:', error);
        message.error('Failed to load students for this section');
      } finally {
        setLoadingSectionStudents(false);
      }
    };

    fetchStudentsBySection();
  }, [selectedSection]);

  const searchStudents = debounce(async (value) => {
    if (!value) {
      setStudents([]);
      return;
    }

    setSearching(true);
    try {
      let url = `http://localhost/students/search.php?query=${encodeURIComponent(value)}`;
      if (selectedSection) {
        url += `&section_id=${selectedSection}`;
      }

      const response = await fetch(url, {
        credentials: 'include' // Include session cookies
      });
      
      // Handle session expiration
      if (response.status === 401) {
        message.error('Session expired. Please login again.');
        window.location.href = '/login';
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.status === 'success') {
        setStudents(data.data);
      } else {
        throw new Error(data.message || 'Failed to search students');
      }
    } catch (error) {
      console.error('Error:', error);
      message.error('Failed to search students');
    } finally {
      setSearching(false);
    }
  }, 500);

  const handleSelect = (value, option) => {
    onSelect({
      id: value,
      name: option.children,
      section: option.section
    });
  };

  const handleSectionClick = (sectionId) => {
    setSelectedSection(prev => prev === sectionId ? null : sectionId);
    setStudents([]);
  };

  return (
    <div>
      {/* Section Filter Header */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ marginBottom: 8, fontWeight: 500 }}>Filter by Section:</div>
        
        <Space wrap>
          <Button 
            type={!selectedSection ? 'primary' : 'default'}
            onClick={() => handleSectionClick(null)}
            size="small"
          >
            All Students
          </Button>
          
          {loadingSections ? (
            <Spin size="small" />
          ) : (
            sections.map(section => (
              <Button
                key={section.id}
                type={selectedSection === section.id ? 'primary' : 'default'}
                onClick={() => handleSectionClick(section.id)}
                size="small"
                loading={selectedSection === section.id && loadingSectionStudents}
              >
                {section.name}
              </Button>
            ))
          )}
        </Space>

        {selectedSection && (
          <div style={{ marginTop: 8 }}>
            <Tag color="blue">
              Showing: {sections.find(s => s.id === selectedSection)?.name}
            </Tag>
            <Button 
              type="link" 
              size="small" 
              onClick={() => handleSectionClick(null)}
              style={{ padding: 0, marginLeft: 8 }}
            >
              Clear filter
            </Button>
          </div>
        )}
      </div>

      <Divider style={{ margin: '12px 0' }} />

      {/* Student Search */}
      <div style={{ marginBottom: 8, fontWeight: 500 }}>
        {selectedSection ? 'Students in this section:' : 'Search Students:'}
      </div>
      <Select
        showSearch={!selectedSection}
        placeholder={selectedSection ? "Select a student" : "Type student name or ID..."}
        defaultActiveFirstOption={false}
        showArrow={true}
        filterOption={false}
        onSearch={selectedSection ? undefined : searchStudents}
        onChange={handleSelect}
        notFoundContent={
          loadingSectionStudents ? 
            <Spin size="small" /> : 
            (selectedSection ? 'No students in this section' : searching ? 'Searching...' : 'No students found')
        }
        style={{ width: '100%' }}
        loading={searching || loadingSectionStudents}
      >
        {(selectedSection ? sectionStudents : students).map(student => (
          <Option 
            key={student.id} 
            value={student.id}
            section={student.Section_id}
          >
            {student.Name} (Father: {student.Fathers_Name || 'N/A'}) - Class No: {student.Class_No}
            {student.section_name && ` - ${student.section_name}`}
          </Option>
        ))}
      </Select>
    </div>
  );
};

StudentSearch.propTypes = {
  onSelect: PropTypes.func.isRequired,
};

export default StudentSearch;