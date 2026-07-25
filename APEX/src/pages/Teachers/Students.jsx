import { useState, useEffect } from "react";
import { Layout, Card, Button, Table, message, Row, Col, Typography, Avatar } from "antd";
import Sidebar from "./Sidebar";

const { Content } = Layout;
const { Title } = Typography;

const List = () => {
  const [students, setStudents] = useState([]);
  const [sectionId, setSectionId] = useState(null);
  const [subjectId, setSubjectId] = useState(null);
  const [, setTeacherId] = useState(null);
  const [sections, setSections] = useState([]);
  const [filteredSubjects, setFilteredSubjects] = useState(new Map());
  const [loading, setLoading] = useState(false);
  const [profilePictures, setProfilePictures] = useState({});

  useEffect(() => {
    const teacherData = localStorage.getItem("teacher");
    if (teacherData) {
      const parsedData = JSON.parse(teacherData);
      setTeacherId(parsedData.teacher_id);

      fetch(`https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/Filter.php?teacher_id=${parsedData.teacher_id}`)
        .then((response) => response.json())
        .then((data) => {
          if (data && data.length > 0) {
            const sectionMap = new Map();
            const subjectMap = new Map();

            data.forEach((item) => {
              sectionMap.set(item.section_id, item.section_name);
              if (!subjectMap.has(item.section_id)) {
                subjectMap.set(item.section_id, []);
              }
              subjectMap.get(item.section_id).push({ id: item.subject_id, name: item.subject_name });
            });

            setSections([...sectionMap.entries()].map(([id, name]) => ({ id, name })));
            setFilteredSubjects(subjectMap);
          } else {
            message.error("No assigned sections or subjects found for this teacher");
          }
        })
        .catch(() => message.error("Error fetching teacher assignments"));
    }
  }, []);

  useEffect(() => {
    if (sectionId && subjectId) {
      setLoading(true);
      fetch("https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/secStudents.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section_id: sectionId, subject_id: subjectId }),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success && data.section_students) {
            setStudents(data.section_students);
            // Fetch profile pictures for all students
            fetchProfilePictures(data.section_students);
          } else {
            message.error(data.message || "No students found");
            setStudents([]);
          }
        })
        .catch(() => {
          message.error("Error fetching students");
          setStudents([]);
        })
        .finally(() => setLoading(false));
    }
  }, [sectionId, subjectId]);

  const fetchProfilePictures = (students) => {
    const pictures = {};
    const promises = students.map(student => {
      return fetch(`https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/fetchpicture.php?student_id=${student.id}`)
        .then(response => response.json())
        .then(data => {
          if (data.success && data.full_url) {
            pictures[student.id] = data.full_url;
          } else {
            // Use a default avatar if no picture found
            pictures[student.id] = null;
          }
        })
        .catch(() => {
          pictures[student.id] = null;
        });
    });

    Promise.all(promises).then(() => {
      setProfilePictures(pictures);
    });
  };

  const columns = [
    { 
      title: "Profile", 
      dataIndex: "id", 
      key: "profile",
      render: (id) => (
        <Avatar
          src={profilePictures[id] || "https://joeschmoe.io/api/v1/random"}
          size="large"
        />
      )
    },
    { title: "Class No", dataIndex: "Class_No", key: "Class_No" },
    { title: "Student ID", dataIndex: "id", key: "id" },
    { title: "Student Name", dataIndex: "std_name", key: "std_name" },
    { title: "Father's Name", dataIndex: "std_father_name", key: "std_father_name" },
    { title: "Discipline", dataIndex: "std_dscipline", key: "std_dscipline" },
    { title: "Admission Status", dataIndex: "Admission_Status", key: "Admission_Status" },
    { title: "Guardian Contact", dataIndex: "std_email", key: "std_email" },
  ];

  return (
    <Layout style={{ minHeight: "100vh", display: "flex" }}>
      <Sidebar style={{ width: 250, flexShrink: 0 }} />

      <Content
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flex: 1,
          padding: "20px",
        }}
      >
        <Row justify="center" style={{ width: "100%" }}>
          <Col xs={24} sm={20} md={16} lg={14}>
            <Card bordered={false} style={{ borderRadius: "12px", boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)" }}>
              <Title level={3} style={{ textAlign: "center", marginBottom: "20px" }}>
                Select Section & Subject
              </Title>

              {/* Section Buttons */}
              <Row justify="center" gutter={[10, 10]}>
                {sections.map((section) => (
                  <Col key={section.id}>
                    <Button
                      type={sectionId === section.id ? "primary" : "default"}
                      shape="round"
                      size="large"
                      onClick={() => setSectionId(section.id)}
                    >
                      {section.name}
                    </Button>
                  </Col>
                ))}
              </Row>

              {/* Subject Buttons */}
              {sectionId && filteredSubjects.has(sectionId) && (
                <>
                  <Title level={4} style={{ textAlign: "center", marginTop: "20px" }}>
                    Select Subject
                  </Title>
                  <Row justify="center" gutter={[10, 10]}>
                    {filteredSubjects.get(sectionId).map((subject) => (
                      <Col key={subject.id}>
                        <Button
                          type={subjectId === subject.id ? "primary" : "default"}
                          shape="round"
                          size="large"
                          onClick={() => setSubjectId(subject.id)}
                        >
                          {subject.name}
                        </Button>
                      </Col>
                    ))}
                  </Row>
                </>
              )}

              {/* Student List Table */}
              <Title level={4} style={{ textAlign: "center", marginTop: "20px" }}>
                Student List
              </Title>
              <Table
                dataSource={students}
                columns={columns}
                rowKey="id"
                bordered
                loading={loading}
                pagination={{ pageSize: 5 }}
                style={{ marginTop: "10px" }}
                locale={{
                  emptyText: students.length === 0 && !loading ? 
                    'No students found for selected section and subject' : 
                    'Select a section and subject to view students'
                }}
              />
            </Card>
          </Col>
        </Row>
      </Content>
    </Layout>
  );
};

export default List;