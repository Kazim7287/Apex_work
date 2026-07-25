
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Layout, Card, Button, Table, message, Row, Col, Typography, Avatar, Grid, Tag, Dropdown, Menu } from "antd";
import { MenuOutlined } from "@ant-design/icons";

const { Content } = Layout;
const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

const List = () => {
  const [students, setStudents] = useState([]);
  const [sectionId, setSectionId] = useState(null);
  const [subjectId, setSubjectId] = useState(null);
  const [sections, setSections] = useState([]);
  const [filteredSubjects, setFilteredSubjects] = useState(new Map());
  const [loading, setLoading] = useState(false);
  const [profilePictures, setProfilePictures] = useState({});
  const navigate = useNavigate();
  
  const screens = useBreakpoint();
  const isMobile = !screens.md;
  const isSmallMobile = !screens.sm;
  const isExtraSmall = !screens.xs;

  const handleApiError = (error) => {
    if (error.message.includes('Unauthorized') || error.message.includes('401')) {
      message.error('Session expired. Please login again.');
      navigate('/teacher/signin');
    } else {
      message.error(error.message || "An error occurred");
    }
  };

  // Fetch teacher's assigned sections and subjects
  useEffect(() => {
    const fetchTeacherAssignments = async () => {
      try {
        setLoading(true);
        const response = await fetch('https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/Filter.php', {
          method: 'GET',
          credentials: 'include'
        });

        if (response.status === 401) {
          throw new Error('Unauthorized');
        }

        if (!response.ok) {
          throw new Error('Failed to fetch teacher assignments');
        }

        const data = await response.json();

        if (Array.isArray(data) && data.length > 0) {
          const sectionMap = new Map();
          const subjectMap = new Map();

          data.forEach((item) => {
            sectionMap.set(item.section_id, item.section_name);
            if (!subjectMap.has(item.section_id)) {
              subjectMap.set(item.section_id, []);
            }
            subjectMap.get(item.section_id).push({ 
              id: item.subject_id, 
              name: item.subject_name 
            });
          });

          setSections([...sectionMap.entries()].map(([id, name]) => ({ id, name })));
          setFilteredSubjects(subjectMap);
          
          // Auto-select first section if none selected
          if (!sectionId && sectionMap.size > 0) {
            const firstSection = [...sectionMap.keys()][0];
            setSectionId(firstSection);
          }
        } else {
          message.info("No assigned sections or subjects found");
        }
      } catch (error) {
        handleApiError(error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeacherAssignments();
  }, [navigate]);

  // Fetch students when section or subject changes
  useEffect(() => {
    const fetchStudents = async () => {
      if (sectionId) {
        try {
          setLoading(true);
          const response = await fetch("https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/secStudents.php", {
            method: "POST",
            headers: { 
              "Content-Type": "application/json",
            },
            credentials: 'include',
            body: JSON.stringify({ 
              section_id: sectionId,
              ...(subjectId && { subject_id: subjectId }) // Optional subject filter
            }),
          });

          if (response.status === 401) {
            throw new Error('Unauthorized');
          }

          const data = await response.json();

          if (data.success && data.section_students) {
            setStudents(data.section_students);
            fetchProfilePictures(data.section_students);
          } else {
            message.info(data.message || "No students found in this section");
            setStudents([]);
          }
        } catch (error) {
          handleApiError(error);
          setStudents([]);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchStudents();
  }, [sectionId, subjectId, navigate]);

  // Fetch profile pictures for students
  const fetchProfilePictures = async (students) => {
    const pictures = {};
    const promises = students.map(async student => {
        try {
            const response = await fetch(
                `https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/fetchpicture.php?student_id=${student.id}`,
                { credentials: 'include' }
            );
            
            if (response.status === 401) {
                throw new Error('Unauthorized');
            }

            const data = await response.json();
            if (!data.success) {
                console.error(`Failed to fetch picture for student ${student.id}:`, data.error);
            }
            pictures[student.id] = data.success ? data.full_url : null;
        } catch (error) {
            console.error(`Error fetching picture for student ${student.id}:`, error);
            pictures[student.id] = null;
        }
    });

    await Promise.all(promises);
    setProfilePictures(pictures);
};

  const getColumns = () => {
    if (isExtraSmall) {
      return [
        { 
          title: "Student", 
          dataIndex: "id", 
          key: "mobile",
          render: (id, record) => (
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Avatar
                src={profilePictures[id] || "https://joeschmoe.io/api/v1/random"}
                size="small"
                style={{ marginRight: 8 }}
              />
              <div>
                <div><Text strong>{record.Class_No}. {record.std_name}</Text></div>
                <div style={{ fontSize: 12 }}>
                  <Tag color={record.Admission_Status === 'Active' ? 'green' : 'red'}>
                    {record.Admission_Status}
                  </Tag>
                </div>
              </div>
            </div>
          ),
          fixed: 'left',
          width: 180
        },
        {
          title: "Actions",
          key: "actions",
          render: (_, record) => (
            <Dropdown
              overlay={
                <Menu>
                  {/* <Menu.Item key="1">ID: {record.id}</Menu.Item> */}
                  <Menu.Item key="2">Father: {record.std_father_name}</Menu.Item>
                  <Menu.Item key="3">Discipline: {record.std_dscipline}</Menu.Item>
                  {/* <Menu.Item key="4">Contact: {record.std_email}</Menu.Item> */}
                </Menu>
              }
              trigger={['click']}
            >
              <Button type="text" icon={<MenuOutlined />} size="small" />
            </Dropdown>
          ),
          width: 50
        }
      ];
    } else if (isSmallMobile) {
      return [
        { 
          title: "Profile", 
          dataIndex: "id", 
          key: "profile",
          render: (id) => (
            <Avatar
              src={profilePictures[id] || "https://joeschmoe.io/api/v1/random"}
              size="small"
            />
          ),
          width: 50
        },
        { 
          title: "ID", 
          dataIndex: "id", 
          key: "id",
          width: 70
        },
        { 
          title: "Name", 
          dataIndex: "std_name", 
          key: "std_name",
          render: (name, record) => (
            <div>
              <div>{name}</div>
              <div style={{ fontSize: 12 }}>
                <Tag color={record.Admission_Status === 'Active' ? 'green' : 'red'}>
                  {record.Admission_Status}
                </Tag>
              </div>
            </div>
          ),
          width: 120
        },
        {
          title: "More",
          key: "more",
          render: (_, record) => (
            <Dropdown
              overlay={
                <Menu>
                  <Menu.Item key="1">Father: {record.std_father_name}</Menu.Item>
                  <Menu.Item key="2">Discipline: {record.std_dscipline}</Menu.Item>
                  {/* <Menu.Item key="3">Contact: {record.std_email}</Menu.Item> */}
                </Menu>
              }
              trigger={['click']}
            >
              <Button type="text" icon={<MenuOutlined />} size="small" />
            </Dropdown>
          ),
          width: 50
        }
      ];
    } else if (isMobile) {
      return [
        { 
          title: "Profile", 
          dataIndex: "id", 
          key: "profile",
          render: (id) => (
            <Avatar
              src={profilePictures[id] || "https://joeschmoe.io/api/v1/random"}
              size="small"
            />
          ),
          width: 50
        },
        { 
          title: "ID", 
          dataIndex: "id", 
          key: "id",
          width: 70
        },
        { 
          title: "Class No", 
          dataIndex: "Class_No", 
          key: "Class_No",
          width: 70
        },
        { 
          title: "Name", 
          dataIndex: "std_name", 
          key: "std_name",
          width: 120
        },
        { 
          title: "Status", 
          dataIndex: "Admission_Status", 
          key: "Admission_Status",
          render: status => (
            <Tag color={status === 'Active' ? 'green' : 'red'}>
              {status}
            </Tag>
          ),
          width: 80
        },
        {
          title: "More",
          key: "more",
          render: (_, record) => (
            <Dropdown
              overlay={
                <Menu>
                  <Menu.Item key="1">Father: {record.std_father_name}</Menu.Item>
                  <Menu.Item key="2">Discipline: {record.std_dscipline}</Menu.Item>
                  {/* <Menu.Item key="3">Contact: {record.std_email}</Menu.Item> */}
                </Menu>
              }
              trigger={['click']}
            >
              <Button type="text" icon={<MenuOutlined />} size="small" />
            </Dropdown>
          ),
          width: 50
        }
      ];
    } else {
      return [
        { 
          title: "Profile", 
          dataIndex: "id", 
          key: "profile",
          render: (id) => (
            <Avatar
              src={profilePictures[id] || "https://joeschmoe.io/api/v1/random"}
              size="default"
            />
          ),
          width: 70
        },
        { 
          title: "ID", 
          dataIndex: "id", 
          key: "id",
          width: 80
        },
        { 
          title: "Class No", 
          dataIndex: "Class_No", 
          key: "Class_No",
          width: 90
        },
        { 
          title: "Name", 
          dataIndex: "std_name", 
          key: "std_name",
          width: 150
        },
        { 
          title: "Father's Name", 
          dataIndex: "std_father_name", 
          key: "std_father_name",
          width: 150,
          render: (name) => <Text ellipsis={{ tooltip: name }}>{name}</Text>
        },
        { 
          title: "Discipline", 
          dataIndex: "std_dscipline", 
          key: "std_dscipline",
          width: 120
        },
        { 
          title: "Status", 
          dataIndex: "Admission_Status", 
          key: "Admission_Status",
          render: status => (
            <Tag color={status === 'Active' ? 'green' : 'red'}>
              {status}
            </Tag>
          ),
          width: 100
        },
        { 
          title: "Contact", 
          dataIndex: "std_email", 
          key: "std_email",
          render: email => <Text ellipsis={{ tooltip: email }}>{email}</Text>,
          width: 180
        },
      ];
    }
  };

  const renderSectionButtons = () => {
    if (isExtraSmall) {
      return (
        <Dropdown
          overlay={
            <Menu>
              {sections.map(section => (
                <Menu.Item 
                  key={section.id} 
                  onClick={() => setSectionId(section.id)}
                  style={{ 
                    background: sectionId === section.id ? '#1890ff' : '', 
                    color: sectionId === section.id ? 'white' : '' 
                  }}
                >
                  {section.name}
                </Menu.Item>
              ))}
            </Menu>
          }
          trigger={['click']}
        >
          <Button type={sectionId ? "primary" : "default"} shape="round">
            {sectionId ? sections.find(s => s.id === sectionId)?.name : 'Select Section'}
          </Button>
        </Dropdown>
      );
    }
    return sections.map((section) => (
      <Col key={section.id}>
        <Button
          type={sectionId === section.id ? "primary" : "default"}
          shape="round"
          size={isMobile ? "middle" : "large"}
          onClick={() => setSectionId(section.id)}
          style={{ minWidth: isMobile ? 80 : 100 }}
        >
          {isMobile ? section.name.substring(0, 3) : section.name}
        </Button>
      </Col>
    ));
  };

  const renderSubjectButtons = () => {
    if (!sectionId || !filteredSubjects.has(sectionId)) return null;

    const subjects = filteredSubjects.get(sectionId);

    if (isExtraSmall) {
      return (
        <Dropdown
          overlay={
            <Menu>
              <Menu.Item 
                key="all"
                onClick={() => setSubjectId(null)}
                style={{ 
                  background: !subjectId ? '#1890ff' : '', 
                  color: !subjectId ? 'white' : '' 
                }}
              >
                All Subjects
              </Menu.Item>
              {subjects.map(subject => (
                <Menu.Item 
                  key={subject.id} 
                  onClick={() => setSubjectId(subject.id)}
                  style={{ 
                    background: subjectId === subject.id ? '#1890ff' : '', 
                    color: subjectId === subject.id ? 'white' : '' 
                  }}
                >
                  {subject.name}
                </Menu.Item>
              ))}
            </Menu>
          }
          trigger={['click']}
        >
          <Button 
            type={subjectId ? "primary" : "default"} 
            shape="round" 
            style={{ marginTop: 8 }}
          >
            {subjectId ? subjects.find(s => s.id === subjectId)?.name : 'All Subjects'}
          </Button>
        </Dropdown>
      );
    }

    return [
      <Col key="all">
        <Button
          type={!subjectId ? "primary" : "default"}
          shape="round"
          size={isMobile ? "middle" : "large"}
          onClick={() => setSubjectId(null)}
          style={{ minWidth: isMobile ? 80 : 120 }}
        >
          All Subjects
        </Button>
      </Col>,
      ...subjects.map((subject) => (
        <Col key={subject.id}>
          <Button
            type={subjectId === subject.id ? "primary" : "default"}
            shape="round"
            size={isMobile ? "middle" : "large"}
            onClick={() => setSubjectId(subject.id)}
            style={{ minWidth: isMobile ? 80 : 120 }}
          >
            {isMobile ? subject.name.substring(0, 3) : subject.name}
          </Button>
        </Col>
      ))
    ];
  };

  return (
    <Layout style={{ minHeight: "100vh", overflowX: "hidden" }}>
      <Content
        style={{
          padding: isMobile ? "12px" : "24px",
          marginLeft: isMobile ? 0 : 250,
          transition: "all 0.2s",
          maxWidth: "100vw"
        }}
      >
        <Row justify="center" gutter={[16, 16]}>
          <Col span={24} style={{ maxWidth: "1200px" }}>
            <Card 
              bordered={false} 
              style={{ 
                borderRadius: "12px", 
                boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
                padding: isMobile ? "16px" : "24px",
                width: "100%",
                overflow: "hidden"
              }}
            >
              <Title level={isMobile ? 4 : 3} style={{ textAlign: "center", marginBottom: "20px" }}>
                Select Section & Subject
              </Title>

              <Row justify="center" gutter={[8, 8]} style={{ marginBottom: isMobile ? 12 : 24 }}>
                {renderSectionButtons()}
              </Row>

              {sectionId && filteredSubjects.has(sectionId) && (
                <>
                  <Title level={isMobile ? 5 : 4} style={{ textAlign: "center", margin: "16px 0" }}>
                    Select Subject (Optional)
                  </Title>
                  <Row justify="center" gutter={[8, 8]}>
                    {renderSubjectButtons()}
                  </Row>
                </>
              )}

              <Title level={isMobile ? 5 : 4} style={{ textAlign: "center", margin: "24px 0 16px" }}>
                Student List {subjectId ? `(Filtered)` : `(All Subjects)`}
              </Title>
              
              <div style={{ width: "100%", overflowX: "auto" }}>
                <Table
                  dataSource={students}
                  columns={getColumns()}
                  rowKey="id"
                  bordered
                  loading={loading}
                  pagination={{ 
                    pageSize: isExtraSmall ? 3 : isSmallMobile ? 5 : 10,
                    simple: isMobile,
                    showSizeChanger: !isMobile
                  }}
                  scroll={{ 
                    x: isMobile ? "max-content" : true,
                    y: isMobile ? 400 : undefined
                  }}
                  style={{ 
                    marginTop: "16px",
                    minWidth: "100%"
                  }}
                  size={isMobile ? "small" : "middle"}
                  locale={{
                    emptyText: students.length === 0 && !loading ? 
                      <Text type="secondary">
                        {sectionId ? 'No students found in this section' : 'Select a section'}
                      </Text> : 
                      null
                  }}
                />
              </div>
            </Card>
          </Col>
        </Row>
      </Content>
    </Layout>
  );
};

export default List;