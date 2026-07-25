import { useState, useEffect, useCallback } from "react";
import Sidebar from "./Sidebar";
import {
  Layout,
  Card,
  Button,
  Table,
  Divider,
  Typography,
  Row,
  Col,
} from "antd";
import ExamTimetableAdd from "./Exam"; // Import the add component

const { Header, Content, Sider } = Layout;
const { Title } = Typography;

const ExamTimetableView = () => {
  const [exams, setExams] = useState([]);
  const [timetable, setTimetable] = useState([
    { day: "Monday", subjects: [] },
    { day: "Tuesday", subjects: [] },
    { day: "Wednesday", subjects: [] },
    { day: "Thursday", subjects: [] },
    { day: "Friday", subjects: [] },
    { day: "Saturday", subjects: [] },
  ]);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);

  useEffect(() => {
    fetchExams();
  }, [fetchExams, timetable]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const fetchExams = useCallback(async () => {
    try {
      const response = await fetch("https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/ExamTimetableFetch.php");
      const data = await response.json();
      
      if (data && data.length > 0) {
        setExams(data);
        // Update timetable structure if needed
        updateTimetable(data);
      }
    } catch (error) {
      console.error("Error fetching exams:", error);
    }
  });

  const updateTimetable = (examsData) => {
    const updatedTimetable = [...timetable];
    
    examsData.forEach(exam => {
      const dayIndex = updatedTimetable.findIndex(item => item.day === exam.exam_day);
      if (dayIndex !== -1) {
        updatedTimetable[dayIndex].subjects.push({
          subject: exam.subject_name,
          startTime: exam.time_one,
          endTime: exam.time_two,
          duration: calculateDurationFromStrings(exam.time_one, exam.time_two),
          examName: exam.exam_name,
          classRoom: exam.room_no,
          section: exam.section_name,
        });
      }
    });
    
    setTimetable(updatedTimetable);
  };

  const calculateDurationFromStrings = (startStr, endStr) => {
    const start = startStr.split(':');
    const end = endStr.split(':');
    const startMinutes = parseInt(start[0]) * 60 + parseInt(start[1]);
    const endMinutes = parseInt(end[0]) * 60 + parseInt(end[1]);
    const durationMinutes = endMinutes - startMinutes;
    
    if (durationMinutes <= 0) return "0 min";
    
    const hours = Math.floor(durationMinutes / 60);
    const minutes = durationMinutes % 60;
    
    return hours > 0 
      ? `${hours} hr ${minutes} min` 
      : `${minutes} min`;
  };

  const examColumns = [
    {
      title: "Exam Name",
      dataIndex: "exam_name",
      key: "exam_name",
    },
    {
      title: "Subject",
      dataIndex: "subject_name",
      key: "subject_name",
    },
    {
      title: "Section",
      dataIndex: "section_name",
      key: "section_name",
    },
    {
      title: "Class Room",
      dataIndex: "room_no",
      key: "room_no",
    },
    {
      title: "Day",
      dataIndex: "exam_day",
      key: "exam_day",
    },
    {
      title: "Time",
      key: "time",
      render: (_, record) => `${record.time_one} - ${record.time_two}`,
    },
    {
      title: "Date",
      dataIndex: "exam_date",
      key: "exam_date",
    },
    {
      title: "Duration",
      key: "duration",
      render: (_, record) => calculateDurationFromStrings(record.time_one, record.time_two),
    },
  ];

  const timetableColumns = [
    {
      title: "Day",
      dataIndex: "day",
      key: "day",
    },
    {
      title: "Exam Name",
      dataIndex: "subjects",
      key: "examName",
      render: (subjects) => (
        <ul style={{ margin: 0, paddingLeft: 20 }}>
          {subjects.map((subject, index) => (
            <li key={index}>{subject.examName}</li>
          ))}
        </ul>
      ),
    },
    {
      title: "Subjects",
      dataIndex: "subjects",
      key: "subjects",
      render: (subjects) => (
        <ul style={{ margin: 0, paddingLeft: 20 }}>
          {subjects.map((subject, index) => (
            <li key={index}>{subject.subject}</li>
          ))}
        </ul>
      ),
    },
    {
      title: "Class Room",
      dataIndex: "subjects",
      key: "classRoom",
      render: (subjects) => (
        <ul style={{ margin: 0, paddingLeft: 20 }}>
          {subjects.map((subject, index) => (
            <li key={index}>{subject.classRoom}</li>
          ))}
        </ul>
      ),
    },
    {
      title: "Time",
      dataIndex: "subjects",
      key: "time",
      render: (subjects) => (
        <ul style={{ margin: 0, paddingLeft: 20 }}>
          {subjects.map((subject, index) => (
            <li key={index}>{subject.startTime} - {subject.endTime}</li>
          ))}
        </ul>
      ),
    },
    {
      title: "Duration",
      dataIndex: "subjects",
      key: "duration",
      render: (subjects) => (
        <ul style={{ margin: 0, paddingLeft: 20 }}>
          {subjects.map((subject, index) => (
            <li key={index}>{subject.duration}</li>
          ))}
        </ul>
      ),
    },
  ];

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider width={250} style={{ background: "#fff" }}>
        <Sidebar />
      </Sider>
      <Layout>
        <Header style={{ background: "#fff", padding: 0, paddingLeft: 24 }}>
          <Title level={3} style={{ margin: 0 }}>
            Exam Timetable
          </Title>
        </Header>
        <Content style={{ margin: "24px 16px 0", overflow: "initial" }}>
          <Row gutter={[16, 16]}>
            <Col xs={24}>
              <Button
                type="primary"
                size="large"
                style={{ margin: "16px 0" }}
                onClick={() => setIsAddModalVisible(true)}
                block
              >
                Add Exam
              </Button>
            </Col>
          </Row>

          <Divider />

          <Card title="Exam Details" bordered={false}>
            <Table
              columns={examColumns}
              dataSource={exams}
              rowKey="id"
              pagination={false}
              size="middle"
            />
          </Card>

          <Divider />

          <Card title="Exam Timetable" bordered={false}>
            <Table
              columns={timetableColumns}
              dataSource={timetable}
              rowKey="day"
              pagination={false}
              size="middle"
            />
          </Card>
        </Content>
      </Layout>



<ExamTimetableAdd 
  open={isAddModalVisible}
  onCancel={() => setIsAddModalVisible(false)}
  onSuccess={() => {
    setIsAddModalVisible(false);
    fetchExams();
  }}
/>
    </Layout>
  );
};

export default ExamTimetableView;