/* eslint-disable react/prop-types */
import { useState } from 'react';
import { Button, Modal, Tabs, Space, message, Typography } from 'antd';
import StudentAnnouncementsList from './StudentAnnouncementList';
import SingleStudentAnnouncementList from './SingleStudentAnnouncementList';
import GeneralAnnouncementList from './GeneralAnnouncementList';
import TeacherAnnouncementList from './TeacherAnnounceList';
import SingleStudentAnnouncementCreator from './SingleStudentAnnouncementList';
import SingleTeacherAnnouncementList from './SingleTeacherAnnouncementList';
import SingleTeacherAnnouncementCreator from './SingleTeacherAnnouncementList';

const { TabPane } = Tabs;
const { Title } = Typography;

const AnnouncementSystem = ({ 
  isAdminView = true,
  studentId = null,
  studentName = null,
  teacherId = null,
  teacherName = null
}) => {
  const [announcementsVisible, setAnnouncementsVisible] = useState(false);
  const [singleStudentAnnouncementsVisible, setSingleStudentAnnouncementsVisible] = useState(false);
  const [singleTeacherAnnouncementsVisible, setSingleTeacherAnnouncementsVisible] = useState(false);
  const [activeTab, setActiveTab] = useState("1");

  const handleTabChange = (key) => {
    setActiveTab(key);
  };

  const showSingleStudentModal = () => {
    if (!studentId) {
      message.error("Student ID is required to view announcements.");
      return;
    }
    setSingleStudentAnnouncementsVisible(true);
  };

  const showSingleTeacherModal = () => {
    if (!teacherId) {
      message.error("Teacher ID is required to view announcements.");
      return;
    }
    setSingleTeacherAnnouncementsVisible(true);
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <Space direction="horizontal" size="middle" style={{ marginBottom: '24px' }}>
        {/* Button for Admin/Teacher Announcement Management */}
        {isAdminView && (
          <Button 
            type="primary" 
            size="large"
            onClick={() => setAnnouncementsVisible(true)}
            style={{ 
              minWidth: '200px',
              height: '40px',
              fontWeight: '500'
            }}
          >
            Manage Announcements
          </Button>
        )}

        {/* Button for Single Student View */}
        {studentId && (
          <Button 
            type={isAdminView ? "default" : "primary"} 
            size="large"
            onClick={showSingleStudentModal}
            style={{ 
              minWidth: '200px',
              height: '40px',
              fontWeight: '500'
            }}
          >
            {studentName ? `${studentName}'s Announcements` : "My Announcements"}
          </Button>
        )}

        {/* Button for Single Teacher View */}
        {teacherId && (
          <Button 
            type={isAdminView ? "default" : "primary"} 
            size="large"
            onClick={showSingleTeacherModal}
            style={{ 
              minWidth: '200px',
              height: '40px',
              fontWeight: '500'
            }}
          >
            {teacherName ? `${teacherName}'s Announcements` : "My Announcements"}
          </Button>
        )}
      </Space>

      {/* MODAL 1: Admin Announcement Management */}
      <Modal
        title={<Title level={3} style={{ margin: 0 }}>Announcement Management System</Title>}
        visible={announcementsVisible}
        onCancel={() => setAnnouncementsVisible(false)}
        footer={null}
        width="100%"
        style={{ 
          top: 0,
          maxWidth: '100vw',
          padding: 0
        }}
        bodyStyle={{
          padding: '24px 0 0 0'
        }}
        destroyOnClose
      >
        <Tabs 
          defaultActiveKey="1"
          activeKey={activeTab}
          onChange={handleTabChange}
          tabBarStyle={{
            padding: '0 24px'
          }}
        >
          <TabPane tab={<span style={{ fontWeight: '500' }}>Student Announcements</span>} key="1">
            <div style={{ padding: '0 24px' }}>
              <StudentAnnouncementsList />
            </div>
          </TabPane>
          <TabPane tab={<span style={{ fontWeight: '500' }}>Teacher Announcements</span>} key="2">
            <div style={{ padding: '0 24px' }}>
              <TeacherAnnouncementList />
            </div>
          </TabPane>
          <TabPane tab={<span style={{ fontWeight: '500' }}>General Announcements</span>} key="3">
            <div style={{ padding: '0 24px' }}>
              <GeneralAnnouncementList />
            </div>
          </TabPane>
          {isAdminView && (
            <TabPane tab={<span style={{ fontWeight: '500' }}>Single Student Announcements</span>} key="4">
              <div style={{ padding: '0 24px' }}>
                <SingleStudentAnnouncementCreator />
              </div>
            </TabPane>
          )}
          {isAdminView && (
            <TabPane tab={<span style={{ fontWeight: '500' }}>Single Teacher Announcements</span>} key="5">
              <div style={{ padding: '0 24px' }}>
                <SingleTeacherAnnouncementCreator />
              </div>
            </TabPane>
          )}
        </Tabs>
      </Modal>

      {/* MODAL 2: Single Student Announcement View */}
      <Modal
        title={<Title level={3} style={{ margin: 0 }}>
          {studentName ? `${studentName}'s Announcements` : "My Announcements"}
        </Title>}
        visible={singleStudentAnnouncementsVisible}
        onCancel={() => setSingleStudentAnnouncementsVisible(false)}
        footer={null}
        width="100%"
        style={{ 
          top: 0,
          maxWidth: '100vw',
          padding: 0
        }}
        bodyStyle={{
          padding: '24px'
        }}
        destroyOnClose
      >
        <SingleStudentAnnouncementList 
          studentId={studentId} 
          key={studentId}
        />
      </Modal>

      {/* MODAL 3: Single Teacher Announcement View */}
      <Modal
        title={<Title level={3} style={{ margin: 0 }}>
          {teacherName ? `${teacherName}'s Announcements` : "My Announcements"}
        </Title>}
        visible={singleTeacherAnnouncementsVisible}
        onCancel={() => setSingleTeacherAnnouncementsVisible(false)}
        footer={null}
        width="100%"
        style={{ 
          top: 0,
          maxWidth: '100vw',
          padding: 0
        }}
        bodyStyle={{
          padding: '24px'
        }}
        destroyOnClose
      >
        <SingleTeacherAnnouncementList 
          teacherId={teacherId} 
          key={teacherId}
        />
      </Modal>
    </div>
  );
};

export default AnnouncementSystem;