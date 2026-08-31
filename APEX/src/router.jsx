import { createBrowserRouter } from "react-router-dom";
import Layout from "../src/components/Layout"; // 👈 Import layout
import StudentLayout from "../src/components/StudentLayout";

// Public components
import AboutManagement from "../src/pages/Admin/AboutManagement";
import FeedbackManagement from "../src/pages/Admin/FeedbackManagement";
import About from "../src/components/Home/About"; 
import Contact from "../src/components/Home/FeedBack";
import Home from "../src/components/Home";
import AdminRegister from "../src/components/AdminRegister";
import ChooseUser from "../src/components/ChooseUser";
import StudentSignin from "../src/components/StudentsSignin";
import TeacherSignin from "../src/components/TeacherSignin";
import AdminSignin from "../src/components/AdminSignin";
import Unauthorized from "../src/components/Unauthorized";

// Admin components
import AdminManagement from "../src/pages/Admin/AdminManagement";
import PermissionManagement from "../src/pages/Admin/PermissionManagement"; // 👈 ADD THIS
import UnassignedApplications from "../src/pages/Admin/StudentsApplications";
import AdminDashboard from "../src/pages/Admin/Dashboard";
import Announcement from "../src/pages/Admin/Announcement";
import Classes from "../src/pages/Admin/Classes";
import Assignment from "../src/pages/Admin/Assignment";
import Exam from "../src/pages/Admin/Exam";
import TeacherEvaluations from "../src/pages/Admin/TeacherEvaluations";
import Attendance from "../src/pages/Admin/Attendance";
import EventCalender from "../src/pages/Admin/EventCalender";
import Library from "../src/pages/Admin/Library";
import Performance from "../src/pages/Admin/Performance";
import SettingProfile from "../src/pages/Admin/SettingProfile";
import Student from "../src/pages/Admin/Student";
import Teachers from "../src/pages/Admin/Teachers";

// Student components
import TeacherEvaluation from "../src/pages/Students/TeacherEvaluation";
import StudentDashboard from "../src/pages/Students/Dashboard";
import ExamSection from "../src/pages/Students/Exams";
import AssignmentSection from "../src/pages/Students/Assignment";
import PerformanceSection from "../src/pages/Students/Performance";
import AttendanceSection from "../src/pages/Students/Attendance";
import LibrarySection from "../src/pages/Students/Library";
import AnnouncementSection from "../src/pages/Students/Announcement";
import ProfileSection from "../src/pages/Students/Profile";

// Teacher components
import TeacherDashboard from "../src/pages/Teachers/Dashboard";
import ClassSection from "../src/pages/Teachers/Classes";
import StudentSection from "../src/pages/Teachers/Students";
import TeacherSection from "../src/pages/Teachers/Teachers";
import CheckPerformanceSection from "../src/pages/Teachers/Performance";
import EventSection from "../src/pages/Teachers/Events";
import TeacherProfileSection from "../src/pages/Teachers/Profile";
import CheckAnnouncementSection from "../src/pages/Teachers/Announcement";
import AssignmentsSection from "../src/pages/Teachers/Assignment";
import CheckAttendanceSection from "../src/pages/Teachers/Attendance";
import CheckExamSection from "../src/pages/Teachers/Exams";

// List components
import List from "../src/pages/Teachers/StudentList";
import TeacherList from "../src/pages/Teachers/TeacherList";
import ClassList from "../src/pages/Teachers/ClassList";
import TeacherList2 from "../src/pages/Admin/TeacherList";
import StudentList2 from "../src/pages/Admin/StudentList";
import BookList from "../src/pages/Admin/ClassList";
import TermList from "./pages/Students/TermList";
import AssignmentList from "./pages/Students/AssignmentList";
import PerformanceList from "./pages/Students/PerformanceList";

export const router = createBrowserRouter([
  // Public routes
  { path: "/", element: <Home /> },
  { path: "/about", element: <About /> },
  { path: "/contact", element: <Contact /> },
  { path: "/choose-user", element: <ChooseUser /> },
  { path: "/unauthorized", element: <Unauthorized /> },

  // Auth routes
  { path: "/admin-signIn", element: <AdminSignin /> },
  { path: "/teacher-signIn", element: <TeacherSignin /> },
  { path: "/student-signIn", element: <StudentSignin /> },
  { path: "/admin/register", element: <AdminRegister /> },

  // Admin section
  {
    path: "/admin",
    element: <Layout />,
    children: [
      { path: "teacher-evaluations", element: <TeacherEvaluations /> },
      { path: "admin-management", element: <AdminManagement /> },
      { path: "permission-management", element: <PermissionManagement /> }, // 👈 ADD THIS
      { path: "dashboard", element: <AdminDashboard /> },
      { path: "applications", element: <UnassignedApplications /> },
      { path: "feedback-management", element: <FeedbackManagement /> },
      { path: "about-management", element: <AboutManagement /> },
      { path: "classes", element: <Classes /> },
      { path: "exams", element: <Exam /> },
      { path: "attendance", element: <Attendance /> },
      { path: "performance", element: <Performance /> },
      { path: "teachers", element: <Teachers /> },
      { path: "students", element: <Student /> },
      { path: "assignments", element: <Assignment /> },
      { path: "library", element: <Library /> },
      { path: "communication", element: <Announcement /> },
      { path: "events", element: <EventCalender /> },
      { path: "settings", element: <SettingProfile /> },
      { path: "teacher-list", element: <TeacherList2 /> },
      { path: "student-list", element: <StudentList2 /> },
      { path: "class-list", element: <BookList /> },
    ],
  },

  // Student section
  {
    path: "/student",
    element: <StudentLayout />,
    children: [
      { path: "dashboard", element: <StudentDashboard /> },
      { path: "exams", element: <ExamSection /> },
      { path: "assignments", element: <AssignmentSection /> },
      { path: "performance", element: <PerformanceSection /> },
      { path: "attendance", element: <AttendanceSection /> },
      { path: "library", element: <LibrarySection /> },
      { path: "announcement", element: <AnnouncementSection /> },
      { path: "profile", element: <ProfileSection /> },
      { path: "term/list", element: <TermList /> },
      { path: "teacher-evaluation", element: <TeacherEvaluation /> },
      { path: "assignment/list", element: <AssignmentList /> },
      { path: "performance/list", element: <PerformanceList /> },
    ],
  },

  // Teacher section
  // Teacher section — do not wrap with the Admin Layout
{
  path: "/teacher",
  children: [
    { path: "dashboard", element: <TeacherDashboard /> },
    { path: "classes", element: <ClassSection /> },
    { path: "students", element: <StudentSection /> },
    { path: "teachers", element: <TeacherSection /> },
    { path: "assignments", element: <AssignmentsSection /> },
    { path: "exams", element: <CheckExamSection /> },
    { path: "performance", element: <CheckPerformanceSection /> },
    { path: "attendance", element: <CheckAttendanceSection /> },
    { path: "communication", element: <CheckAnnouncementSection /> },
    { path: "events", element: <EventSection /> },
    { path: "settings", element: <TeacherProfileSection /> },
    { path: "register", element: <List /> },
    { path: "list", element: <TeacherList /> },
    { path: "class/list", element: <ClassList /> },
  ],
},


  // Fallback route for 404
  {
    path: "*",
    element: <Home />,
  },
], {
  future: {
    v7_startTransition: true,
    v7_fetcherPersist: true,
  }
});