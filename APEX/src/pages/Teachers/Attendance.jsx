/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  message, Button, Modal, DatePicker, Table,
  Drawer, Layout, Typography, Space, Tag, Grid, Alert, Spin, Empty, Input, Tooltip
} from 'antd';
import {
  CalendarOutlined, FileTextOutlined, CheckCircleOutlined,
  CloseCircleOutlined, ExclamationCircleOutlined, EditOutlined,
  MenuOutlined, ClockCircleOutlined, UserOutlined, ArrowLeftOutlined,
  ReloadOutlined, SearchOutlined, TeamOutlined, SendOutlined, CheckOutlined,
  CloseOutlined, InfoCircleOutlined, CheckSquareOutlined, CloseSquareOutlined
} from '@ant-design/icons';
import { useMediaQuery } from 'react-responsive';
import moment from 'moment';
import styled from 'styled-components';

import Sidebar from './Sidebar';
import StudentPicture from './StudentPicture';
import UpdateAttendanceModal from './UpdateAttendanceModal';
import AttendanceSummaryModal from './AttendanceSummaryModal';

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;
const { Content } = Layout;

const API_BASE = 'https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX';

// Attendance status enums
const ATTENDANCE_STATUS = {
  PRESENT: 'Present',
  ABSENT: 'Absent',
  LEAVE: 'Leave',
  LATE_COMER: 'Late Comer',
  HALF_LEAVE: 'Half Leave'
};

const formatDateSafe = (dateString, format = 'MMM D, YYYY') => {
  if (!dateString) return 'N/A';
  try {
    const date = moment(dateString);
    return date.isValid() ? date.format(format) : 'Invalid Date';
  } catch (error) {
    console.error('Date formatting error:', error);
    return 'N/A';
  }
};

const readResponseBody = async (response) => {
  const text = await response.text();
  if (!text) return { parsed: {}, raw: '' };
  try {
    return { parsed: JSON.parse(text), raw: text };
  } catch (error) {
    return { parsed: null, raw: text };
  }
};

/* ============================== THEME ============================== */
const THEME = {
  bg: "#f8fafc",
  cardBg: "#ffffff",
  primary: "#1e3a8a",
  primaryHover: "#1d4ed8",
  primaryLight: "#eff6ff",
  accent: "#d4af37",
  accentLight: "#fefce8",
  emerald: "#059669",
  emeraldLight: "#ecfdf5",
  ruby: "#dc2626",
  rubyLight: "#fef2f2",
  amber: "#d97706",
  amberLight: "#fffbeb",
  purple: "#7c3aed",
  purpleLight: "#f5f3ff",
  textMain: "#0f172a",
  textMuted: "#64748b",
  border: "#e2e8f0",
  shadowSm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
  shadowMd: "0 4px 6px -1px rgba(0, 0, 0, 0.08), 0 2px 4px -1px rgba(0, 0, 0, 0.04)",
  shadowLg: "0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.04)",
};

/* ============================ STYLED (responsive) ============================ */
const PageContainer = styled(Layout)`
  min-height: 100vh;
  background-color: ${THEME.bg} !important;
  display: flex !important;
  flex-direction: row !important;
  width: 100%;

  @media (min-width: 993px) {
    height: 100vh;
    max-height: 100vh;
    overflow: hidden;
  }

  @media (max-width: 992px) {
    flex-direction: column !important;
    min-height: 100vh;
  }
`;

const DesktopSidebarWrapper = styled.div`
  height: 100vh;
  flex-shrink: 0;
  z-index: 1000;
  align-self: flex-start;
  position: sticky;
  top: 0;
  overflow: hidden;

  @media (max-width: 992px) {
    display: none;
  }
`;

const ContentLayout = styled(Layout)`
  flex: 1;
  background-color: ${THEME.bg} !important;
  min-width: 0;
  display: flex;
  flex-direction: column;

  @media (min-width: 993px) {
    height: 100vh;
    max-height: 100vh;
    overflow-y: auto;
    overflow-x: hidden;
  }

  @media (max-width: 992px) {
    min-height: 100vh;
    overflow-x: hidden;
  }
`;

const ContentWrapper = styled(Content)`
  background-color: ${THEME.bg};
  padding: clamp(12px, 2.5vw, 24px) clamp(10px, 3.5vw, 32px) clamp(24px, 4vw, 48px);
  width: 100%;
  max-width: 1600px;
  margin: 0 auto;
  box-sizing: border-box;
  min-width: 0;

  @media (max-width: 992px) {
    padding-bottom: 90px;
  }
`;

const MobileNavBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 10px 14px;
  background: #ffffff;
  border-bottom: 1px solid ${THEME.border};
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: ${THEME.shadowSm};

  @media (min-width: 993px) {
    display: none;
  }
`;

const NavLeftGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
`;

const StyledDrawer = styled(Drawer)`
  .ant-drawer-content {
    background-color: #061129 !important;
  }
  .ant-drawer-body {
    padding: 0 !important;
    overflow: hidden;
    background-color: #061129 !important;
  }
  .ant-drawer-header {
    background-color: #061129 !important;
    border-bottom: 1px solid rgba(212, 175, 55, 0.15) !important;
    .ant-drawer-title,
    .ant-drawer-close {
      color: #ffffff !important;
    }
  }
`;

const HeroBanner = styled.div`
  background: linear-gradient(135deg, #0b132b 0%, #1c2a4a 50%, #1e3a8a 100%);
  border-radius: clamp(12px, 2vw, 18px);
  padding: clamp(16px, 3vw, 28px) clamp(14px, 3.5vw, 32px);
  margin-bottom: clamp(14px, 2.5vw, 22px);
  color: #fff;
  position: relative;
  overflow: hidden;
  box-shadow: 0 10px 25px -5px rgba(11, 19, 43, 0.25);

  &::before {
    content: "";
    position: absolute;
    top: -60px;
    right: -40px;
    width: 240px;
    height: 240px;
    background: radial-gradient(circle, rgba(212, 175, 55, 0.22) 0%, rgba(255, 255, 255, 0) 70%);
    border-radius: 50%;
    pointer-events: none;
  }

  &::after {
    content: "";
    position: absolute;
    bottom: -50px;
    left: 20%;
    width: 200px;
    height: 200px;
    background: radial-gradient(circle, rgba(79, 70, 229, 0.25) 0%, rgba(255, 255, 255, 0) 70%);
    border-radius: 50%;
    pointer-events: none;
  }
`;

const HeroContent = styled.div`
  position: relative;
  z-index: 2;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 14px;
`;

const HeroBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 9999px;
  font-size: clamp(10px, 1.1vw, 11px);
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: #fde68a;
  margin-bottom: 8px;
`;

const HeroActions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
  flex-wrap: wrap;
`;

const SectionPickerCard = styled.div`
  background: #ffffff;
  border-radius: 16px;
  border: 1px solid ${THEME.border};
  padding: clamp(14px, 2vw, 20px);
  margin-bottom: clamp(14px, 2vw, 20px);
  box-shadow: ${THEME.shadowSm};

  .picker-header {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 12px;
  }

  .picker-badge {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    background: ${THEME.primaryLight};
    color: ${THEME.primary};
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    flex-shrink: 0;
  }
`;

const SectionButtonGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
`;

const SectionButton = styled.button`
  background: ${props => props.$active ? THEME.primary : '#ffffff'};
  color: ${props => props.$active ? '#ffffff' : THEME.textMain};
  border: 1px solid ${props => props.$active ? THEME.primary : THEME.border};
  padding: 9px 18px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  box-shadow: ${props => props.$active ? '0 4px 12px rgba(30, 58, 138, 0.25)' : 'none'};

  &:hover {
    border-color: ${THEME.primary};
    color: ${props => props.$active ? '#ffffff' : THEME.primary};
    background: ${props => props.$active ? THEME.primaryHover : THEME.primaryLight};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const StatsRow = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: clamp(8px, 1.8vw, 14px);
  margin-bottom: clamp(14px, 2vw, 20px);

  @media (max-width: 900px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 480px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
  }
`;

const StatCard = styled.div`
  background: #ffffff;
  border-radius: 14px;
  border: 1px solid ${THEME.border};
  padding: clamp(10px, 1.8vw, 16px);
  box-shadow: ${THEME.shadowSm};
  display: flex;
  align-items: center;
  gap: clamp(8px, 1.5vw, 14px);
  min-width: 0;

  .stat-icon {
    width: clamp(34px, 4vw, 42px);
    height: clamp(34px, 4vw, 42px);
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: clamp(15px, 2vw, 19px);
    flex-shrink: 0;
  }

  .stat-info {
    min-width: 0;
    flex: 1;
  }

  .stat-label {
    font-size: clamp(10px, 1.1vw, 12px);
    color: ${THEME.textMuted};
    margin: 0;
    line-height: 1.2;
    display: block;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .stat-value {
    font-size: clamp(16px, 2.2vw, 22px) !important;
    font-weight: 700 !important;
    margin: 2px 0 0 0 !important;
    color: ${THEME.textMain};
    line-height: 1.2;
  }
`;

const ActionBarCard = styled.div`
  background: #ffffff;
  border-radius: 14px;
  border: 1px solid ${THEME.border};
  padding: clamp(12px, 1.8vw, 16px);
  margin-bottom: clamp(14px, 2vw, 20px);
  box-shadow: ${THEME.shadowSm};
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
`;

const SearchBoxWrapper = styled.div`
  flex: 1;
  min-width: 220px;
  max-width: 420px;

  @media (max-width: 640px) {
    max-width: 100%;
    width: 100%;
    min-width: 100%;
  }
`;

const ActionButtonGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;

  @media (max-width: 640px) {
    width: 100%;
    justify-content: space-between;
  }
`;

const StudentGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: clamp(12px, 2vw, 16px);
  margin-bottom: clamp(16px, 2vw, 24px);

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 10px;
  }
`;

const StudentCard = styled.div`
  background: #ffffff;
  border-radius: 14px;
  border: 1px solid ${THEME.border};
  padding: clamp(12px, 1.8vw, 16px);
  box-shadow: ${THEME.shadowSm};
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 12px;

  &:hover {
    border-color: #cbd5e1;
    box-shadow: ${THEME.shadowMd};
  }

  .card-top-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 10px;
  }

  .student-profile {
    display: flex;
    align-items: center;
    gap: 12px;
    min-width: 0;
    flex: 1;
  }

  .student-meta {
    min-width: 0;
    flex: 1;
  }

  .student-name {
    font-size: 14px;
    color: ${THEME.textMain};
    font-weight: 700;
    display: block;
    line-height: 1.3;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .student-badges {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-top: 4px;
    flex-wrap: wrap;
  }

  .roll-tag {
    background: #f1f5f9;
    color: #475569;
    border-color: #cbd5e1;
    font-size: 11px;
    margin: 0;
    border-radius: 6px;
  }
`;

const AttendanceButtonGroup = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 5px;
  width: 100%;

  @media (max-width: 420px) {
    grid-template-columns: repeat(3, 1fr);
  }
`;

const StatusButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 7px 6px;
  font-size: 11px;
  font-weight: 600;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.18s ease;
  min-height: 36px;
  user-select: none;
  border: 1px solid transparent;

  ${props => props.$status === 'Present' && (
    props.$active 
      ? `background: #059669; color: #ffffff; border-color: #059669; box-shadow: 0 2px 6px rgba(5, 150, 105, 0.35); font-weight: 700;` 
      : `background: #f8fafc; color: #475569; border-color: #e2e8f0; &:hover { background: #ecfdf5; color: #059669; border-color: #a7f3d0; }`
  )}

  ${props => props.$status === 'Absent' && (
    props.$active 
      ? `background: #dc2626; color: #ffffff; border-color: #dc2626; box-shadow: 0 2px 6px rgba(220, 38, 38, 0.35); font-weight: 700;` 
      : `background: #f8fafc; color: #475569; border-color: #e2e8f0; &:hover { background: #fef2f2; color: #dc2626; border-color: #fecaca; }`
  )}

  ${props => props.$status === 'Leave' && (
    props.$active 
      ? `background: #d97706; color: #ffffff; border-color: #d97706; box-shadow: 0 2px 6px rgba(217, 119, 6, 0.35); font-weight: 700;` 
      : `background: #f8fafc; color: #475569; border-color: #e2e8f0; &:hover { background: #fffbeb; color: #d97706; border-color: #fde68a; }`
  )}

  ${props => props.$status === 'Late' && (
    props.$active 
      ? `background: #2563eb; color: #ffffff; border-color: #2563eb; box-shadow: 0 2px 6px rgba(37, 99, 235, 0.35); font-weight: 700;` 
      : `background: #f8fafc; color: #475569; border-color: #e2e8f0; &:hover { background: #eff6ff; color: #2563eb; border-color: #bfdbfe; }`
  )}

  ${props => props.$status === 'Half' && (
    props.$active 
      ? `background: #7c3aed; color: #ffffff; border-color: #7c3aed; box-shadow: 0 2px 6px rgba(124, 58, 237, 0.35); font-weight: 700;` 
      : `background: #f8fafc; color: #475569; border-color: #e2e8f0; &:hover { background: #f5f3ff; color: #7c3aed; border-color: #ddd6fe; }`
  )}
`;

const MobileStickyFooter = styled.div`
  display: none;

  @media (max-width: 992px) {
    display: flex;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: #ffffff;
    border-top: 1px solid ${THEME.border};
    padding: 10px 16px;
    z-index: 999;
    box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.08);
    justify-content: space-between;
    align-items: center;
    gap: 12px;
  }

  .footer-summary {
    display: flex;
    flex-direction: column;
  }
`;

/* =============================== MAIN COMPONENT =============================== */
const CheckAttendanceSection = () => {
  const screens = useBreakpoint();
  const navigate = useNavigate();
  const currentDate = new Date().toISOString().split('T')[0];

  const isMobile = useMediaQuery({ maxWidth: 992 });
  const isSmallMobile = useMediaQuery({ maxWidth: 576 });

  // Application State
  const [loading, setLoading] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [teacherId, setTeacherId] = useState(null);
  const [teacherAssignments, setTeacherAssignments] = useState([]);

  // Data State
  const [sections, setSections] = useState([]);
  const [sectionId, setSectionId] = useState(null);
  const [sectionName, setSectionName] = useState('');
  const [subjects, setSubjects] = useState([]); // Kept for modal compatibility
  const [subjectId, setSubjectId] = useState(null);
  const [students, setStudents] = useState([]);
  const [attendanceData, setAttendanceData] = useState({});
  const [selectedDate, setSelectedDate] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isSummaryModalVisible, setIsSummaryModalVisible] = useState(false);
  const [isUpdateModalVisible, setIsUpdateModalVisible] = useState(false);
  const [mobileSidebarVisible, setMobileSidebarVisible] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [modalStudents, setModalStudents] = useState([]);
  const [modalSummary, setModalSummary] = useState([]);

  const sectionsRef = useRef(sections);
  useEffect(() => {
    sectionsRef.current = sections;
  }, [sections]);

  const getAttendanceTag = useCallback((status) => {
    if (!status) return <Tag icon={<CloseCircleOutlined />} color="default">Unknown</Tag>;

    const tags = {
      [ATTENDANCE_STATUS.PRESENT]: <Tag icon={<CheckCircleOutlined />} color="success">Present</Tag>,
      [ATTENDANCE_STATUS.LEAVE]: <Tag icon={<ExclamationCircleOutlined />} color="warning">Leave</Tag>,
      [ATTENDANCE_STATUS.HALF_LEAVE]: <Tag icon={<ExclamationCircleOutlined />} color="purple">Half Leave</Tag>,
      [ATTENDANCE_STATUS.LATE_COMER]: <Tag icon={<ClockCircleOutlined />} color="blue">Late Comer</Tag>,
      [ATTENDANCE_STATUS.ABSENT]: <Tag icon={<CloseCircleOutlined />} color="error">Absent</Tag>
    };
    return tags[status] || <Tag icon={<CloseCircleOutlined />} color="default">{status}</Tag>;
  }, []);

  const checkTeacherAuthorization = useCallback(async (currentTeacherId) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/Filter.php?teacher_id=${currentTeacherId}`, {
        credentials: 'include'
      });

      const { parsed: data, raw } = await readResponseBody(response);

      if (!response.ok) {
        console.error('Filter.php failed:', response.status, raw);
        throw new Error(`Authorization request failed (${response.status})`);
      }

      if (Array.isArray(data)) {
        setTeacherAssignments(data);
        const hasPermission = data.some(a => ['Attendance Boys', 'Attendance Girls'].includes(a.subject_name));
        setIsAuthorized(hasPermission);

        if (hasPermission) {
          const uniqueSections = [...new Map(data.filter(a => a.section_id).map(a =>
            [a.section_id, { id: a.section_id, name: a.section_name || `Section ${a.section_id}` }]
          )).values()];

          setSections(uniqueSections);
          message.success('Attendance access authorized');
        } else {
          message.warning('You are not authorized to take attendance');
        }
      } else {
        console.error('Filter.php returned unexpected payload:', data ?? raw);
        message.error('Unexpected response from server while checking authorization');
      }
    } catch (error) {
      console.error('Authorization error:', error);
      if (error.message.includes('Session expired')) {
        localStorage.removeItem('teacher');
        localStorage.removeItem('teacher_id');
        window.location.href = '/teacher-signIn';
      } else {
        message.error(`Authorization error: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let tId = localStorage.getItem('teacher_id');
    const teacherData = localStorage.getItem('teacher');
    if (teacherData) {
      try {
        const parsed = JSON.parse(teacherData);
        if (parsed.teacher_id) tId = parsed.teacher_id;
      } catch (e) {
        console.error("Error parsing teacher from localStorage", e);
      }
    }

    if (tId) {
      setTeacherId(tId);
      checkTeacherAuthorization(tId);
    } else {
      window.location.href = '/teacher-signIn';
    }
  }, [checkTeacherAuthorization]);

  // ---- Students fetch ---------------------------------------------------
  useEffect(() => {
    if (!sectionId || !isAuthorized) {
      setStudents([]);
      setAttendanceData({});
      return;
    }

    const controller = new AbortController();

    const fetchStudents = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${API_BASE}/SecStudents.php`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify({ section_id: sectionId }),
          credentials: 'include',
          signal: controller.signal
        });

        const { parsed: data, raw } = await readResponseBody(response);

        if (response.status === 401) throw new Error('Session expired');

        if (!response.ok) {
          const backendMessage = (data && (data.message || data.error)) || raw || `HTTP ${response.status}`;
          console.error('secStudents.php error body:', raw);
          throw new Error(`Failed to load students: ${backendMessage}`);
        }

        if (data?.section_students?.length > 0) {
          const formattedStudents = data.section_students.map(student => ({
            id: student.id || student.student_id,
            Name: student.std_name || student.Name || 'Unknown Student',
            Class_No: student.Class_No || student.roll_no || 'N/A',
            fullName: `${student.std_name || student.Name || 'Unknown'} (${student.Class_No || student.roll_no || 'N/A'})`,
            section_id: student.Section_id || student.section_id,
          }));

          setStudents(formattedStudents);
          setAttendanceData(
            formattedStudents.reduce((acc, curr) => ({ ...acc, [curr.id]: ATTENDANCE_STATUS.PRESENT }), {})
          );

          const section = sectionsRef.current.find(s => s.id === sectionId);
          if (section) setSectionName(section.name);
        } else {
          message.warning(data?.message || 'No students found');
          setStudents([]);
        }
      } catch (error) {
        if (error.name === 'AbortError') return;
        if (error.message === 'Session expired') {
          message.error('Session expired. Please login again.');
        } else {
          message.error(error.message || 'Error fetching students');
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    fetchStudents();

    return () => controller.abort();
  }, [sectionId, isAuthorized]);

  const handleAttendanceChange = useCallback((studentId, status) => {
    setAttendanceData(prev => ({ ...prev, [studentId]: status }));
  }, []);

  const handleMarkAllPresent = () => {
    if (students.length === 0) return;
    setAttendanceData(
      students.reduce((acc, curr) => ({ ...acc, [curr.id]: ATTENDANCE_STATUS.PRESENT }), {})
    );
    message.success('All students marked as Present');
  };

  const handleMarkAllAbsent = () => {
    if (students.length === 0) return;
    setAttendanceData(
      students.reduce((acc, curr) => ({ ...acc, [curr.id]: ATTENDANCE_STATUS.ABSENT }), {})
    );
    message.info('All students marked as Absent');
  };

  const submitAttendance = async () => {
    if (!sectionId || students.length === 0) return message.error('Invalid submission data');

    const payload = students.filter(s => s.id).map(student => ({
      student_id: student.id,
      section_id: sectionId,
      attendance: attendanceData[student.id] || ATTENDANCE_STATUS.PRESENT,
      date: currentDate,
      student_name: student.Name,
      roll_no: student.Class_No || 'N/A'
    }));

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/Add_attendance.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include'
      });

      const { parsed: data, raw } = await readResponseBody(response);

      if (response.status === 401) throw new Error('Session expired');
      if (!response.ok) {
        console.error('Add_attendance.php error body:', raw);
        throw new Error((data && (data.message || data.error)) || `Submit failed (${response.status})`);
      }

      if (data?.status === 'success') message.success('Attendance submitted successfully');
      else throw new Error(data?.message || 'Failed to submit');
    } catch (error) {
      message.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchPreviousAttendance = async () => {
    if (!selectedDate || !sectionId) return message.error('Select a date and section');

    setLoading(true);
    try {
      const params = new URLSearchParams({ section_id: sectionId, created_at: selectedDate });
      const response = await fetch(`${API_BASE}/GetAttendance.php?${params}`, { credentials: 'include' });

      const { parsed: data, raw } = await readResponseBody(response);

      if (!response.ok) {
        console.error('GetAttendance.php error body:', raw);
        throw new Error((data && (data.message || data.error)) || `Failed to fetch (${response.status})`);
      }

      if (data?.status === 'success' && Array.isArray(data.data)) {
        const mappedRecords = data.data.map(record => {
          const student = students.find(s => s.id === record.student_id);
          return {
            ...record,
            student_name: student?.Name || record.student_name,
            roll_no: student?.Class_No || record.roll_no,
            attendance_status: record.attendance || 'Unknown'
          };
        });
        setModalStudents(mappedRecords);
      } else {
        message.warning('No records found for this date');
        setModalStudents([]);
      }
    } catch (error) {
      message.error(error.message || 'Failed to fetch previous records');
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendanceSummary = async () => {
    if (!sectionId) return message.error('Select a section first');

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/GetTAttendancesummery.php?section_id=${sectionId}`, { credentials: 'include' });
      const { parsed: data, raw } = await readResponseBody(response);

      if (!response.ok) {
        console.error('GetTAttendancesummery.php error body:', raw);
        throw new Error((data && (data.message || data.error)) || `Failed to fetch summary (${response.status})`);
      }

      if (data?.status === 'success' && Array.isArray(data.attendance)) {
        setModalSummary(data.attendance.map(summary => {
          const student = students.find(s => s.id === summary.student_id);
          return { ...summary, student_name: student?.Name || summary.student_name, roll_no: student?.Class_No || 'N/A' };
        }));
        setIsSummaryModalVisible(true);
      } else {
        throw new Error(data?.message || 'Failed to fetch summary');
      }
    } catch (error) {
      message.error(error.message || 'Failed to fetch summary');
    } finally {
      setLoading(false);
    }
  };

  // Real-time stats calculations
  const stats = useMemo(() => {
    let present = 0;
    let absent = 0;
    let leave = 0;
    let late = 0;
    let halfLeave = 0;

    students.forEach(s => {
      const st = attendanceData[s.id] || ATTENDANCE_STATUS.PRESENT;
      if (st === ATTENDANCE_STATUS.PRESENT) present++;
      else if (st === ATTENDANCE_STATUS.ABSENT) absent++;
      else if (st === ATTENDANCE_STATUS.LEAVE) leave++;
      else if (st === ATTENDANCE_STATUS.LATE_COMER) late++;
      else if (st === ATTENDANCE_STATUS.HALF_LEAVE) halfLeave++;
    });

    return {
      total: students.length,
      present,
      absent,
      leave,
      late,
      halfLeave,
      other: leave + late + halfLeave
    };
  }, [students, attendanceData]);

  // Filter students based on search query
  const filteredStudents = useMemo(() => {
    if (!searchQuery.trim()) return students;
    const q = searchQuery.trim().toLowerCase();
    return students.filter(s =>
      (s.Name || '').toLowerCase().includes(q) ||
      String(s.Class_No || '').toLowerCase().includes(q)
    );
  }, [students, searchQuery]);

  return (
    <PageContainer hasSider={!isMobile}>
      {/* DESKTOP PINNED SIDEBAR (> 992px) */}
      {!isMobile && (
        <DesktopSidebarWrapper>
          <Sidebar
            collapsed={sidebarCollapsed}
            onCollapse={setSidebarCollapsed}
          />
        </DesktopSidebarWrapper>
      )}

      {/* MOBILE DRAWER SIDEBAR (<= 992px) */}
      {isMobile && (
        <StyledDrawer
          title="APEX COLLEGE"
          placement="left"
          closable={true}
          onClose={() => setMobileSidebarVisible(false)}
          open={mobileSidebarVisible}
          visible={mobileSidebarVisible}
          width={260}
          styles={{
            body: { padding: 0, overflow: 'hidden', background: '#061129' },
            header: {
              background: '#061129',
              borderBottom: '1px solid rgba(212, 175, 55, 0.15)',
              color: '#ffffff'
            }
          }}
        >
          <Sidebar
            collapsed={false}
            onItemClick={() => setMobileSidebarVisible(false)}
          />
        </StyledDrawer>
      )}

      {/* MAIN CONTENT LAYOUT */}
      <ContentLayout>
        {/* MOBILE TOP BAR (<= 992px) */}
        {isMobile && (
          <MobileNavBar>
            <NavLeftGroup>
              <Button
                type="text"
                icon={<MenuOutlined style={{ fontSize: 18 }} />}
                onClick={() => setMobileSidebarVisible(true)}
                aria-label="Open menu"
                style={{ width: 38, height: 38 }}
              />
              <Link to="/teacher/dashboard">
                <Button
                  type="text"
                  icon={<ArrowLeftOutlined />}
                  style={{ width: 36, height: 36 }}
                />
              </Link>
              <div style={{ minWidth: 0 }}>
                <Text
                  style={{
                    fontSize: 10,
                    color: THEME.textMuted,
                    display: 'block',
                    letterSpacing: '0.05em',
                    fontWeight: 600
                  }}
                >
                  TEACHER PORTAL
                </Text>
                <Text
                  strong
                  style={{
                    fontSize: 14,
                    color: THEME.textMain,
                    display: 'block',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                >
                  Daily Attendance
                </Text>
              </div>
            </NavLeftGroup>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {sectionId && (
                <Tooltip title="Attendance Summary">
                  <Button
                    type="default"
                    shape="circle"
                    icon={<FileTextOutlined />}
                    onClick={fetchAttendanceSummary}
                    size="middle"
                  />
                </Tooltip>
              )}
              {sectionId && (
                <Tooltip title="History">
                  <Button
                    type="default"
                    shape="circle"
                    icon={<CalendarOutlined />}
                    onClick={() => setIsModalVisible(true)}
                    size="middle"
                  />
                </Tooltip>
              )}
            </div>
          </MobileNavBar>
        )}

        <ContentWrapper>
          {/* HERO BANNER */}
          <HeroBanner>
            <HeroContent>
              <div style={{ flex: 1, minWidth: 220 }}>
                <HeroBadge>
                  <CalendarOutlined /> TEACHER PORTAL • ATTENDANCE
                </HeroBadge>
                <Title
                  level={2}
                  style={{
                    color: '#fff',
                    margin: '0 0 6px 0',
                    fontWeight: 800,
                    fontSize: 'clamp(20px, 2.8vw, 28px)',
                    letterSpacing: '-0.02em',
                  }}
                >
                  Attendance Management
                </Title>
                <Text
                  style={{
                    color: 'rgba(255, 255, 255, 0.85)',
                    fontSize: 'clamp(12px, 1.2vw, 14px)',
                    maxWidth: 620,
                    display: 'block',
                    lineHeight: 1.5,
                  }}
                >
                  Mark today&apos;s section attendance, track student presence in real time, and review historical logs.
                </Text>
              </div>

              <HeroActions>
                <div
                  style={{
                    background: 'rgba(255, 255, 255, 0.15)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.25)',
                    borderRadius: 10,
                    padding: '8px 14px',
                    color: '#ffffff',
                    fontSize: 13,
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <ClockCircleOutlined style={{ color: '#fde68a' }} />
                  <span>{moment(currentDate).format('dddd, MMM D, YYYY')}</span>
                </div>
              </HeroActions>
            </HeroContent>
          </HeroBanner>

          {/* LOADING & AUTHORIZATION CHECK */}
          {loading && !isAuthorized ? (
            <div
              style={{
                background: '#ffffff',
                borderRadius: 16,
                padding: '48px 24px',
                textAlign: 'center',
                border: `1px solid ${THEME.border}`,
                boxShadow: THEME.shadowSm,
              }}
            >
              <Spin size="large" />
              <Text style={{ display: 'block', marginTop: 16, color: THEME.textMuted, fontSize: 14 }}>
                Verifying attendance access permissions...
              </Text>
            </div>
          ) : !isAuthorized ? (
            <div
              style={{
                background: '#ffffff',
                borderRadius: 16,
                padding: '32px 24px',
                border: `1px solid ${THEME.border}`,
                boxShadow: THEME.shadowSm,
              }}
            >
              <Alert
                message="Attendance Access Required"
                description="You are not authorized to take attendance. To mark attendance, your profile must have 'Attendance Boys' or 'Attendance Girls' assigned. Please contact the administrator for permission."
                type="warning"
                showIcon
                icon={<ExclamationCircleOutlined style={{ fontSize: 24 }} />}
                action={
                  <Link to="/teacher/dashboard">
                    <Button type="primary" style={{ borderRadius: 8, background: THEME.primary }}>
                      Return to Dashboard
                    </Button>
                  </Link>
                }
              />
            </div>
          ) : (
            <>
              {/* SECTION PICKER CARD */}
              <SectionPickerCard>
                <div className="picker-header">
                  <div className="picker-badge">
                    <TeamOutlined />
                  </div>
                  <div>
                    <Text strong style={{ fontSize: 15, color: THEME.textMain, display: 'block' }}>
                      Select Class / Section
                    </Text>
                    <Text style={{ fontSize: 12, color: THEME.textMuted }}>
                      Choose a section to load student roster and mark attendance
                    </Text>
                  </div>
                </div>

                <SectionButtonGrid>
                  {sections.map(section => {
                    const isSelected = sectionId === section.id;
                    return (
                      <SectionButton
                        key={section.id}
                        $active={isSelected}
                        onClick={() => setSectionId(section.id)}
                        disabled={loading}
                      >
                        <span>{section.name}</span>
                        {isSelected && (
                          <Tag
                            color="#059669"
                            style={{ margin: 0, borderRadius: 9999, fontSize: 10, padding: '0 6px' }}
                          >
                            Active
                          </Tag>
                        )}
                      </SectionButton>
                    );
                  })}
                </SectionButtonGrid>
              </SectionPickerCard>

              {/* ROSTER SECTION */}
              {!sectionId ? (
                <div
                  style={{
                    background: '#ffffff',
                    borderRadius: 16,
                    padding: '48px 24px',
                    textAlign: 'center',
                    border: `1px solid ${THEME.border}`,
                    boxShadow: THEME.shadowSm,
                  }}
                >
                  <TeamOutlined style={{ fontSize: 44, color: '#94a3b8', marginBottom: 12 }} />
                  <Title level={4} style={{ color: THEME.textMain, margin: '0 0 6px 0' }}>
                    No Section Selected
                  </Title>
                  <Text style={{ color: THEME.textMuted, maxWidth: 400, display: 'block', margin: '0 auto' }}>
                    Please click on one of your assigned sections above to open the student roster.
                  </Text>
                </div>
              ) : loading && students.length === 0 ? (
                <div
                  style={{
                    background: '#ffffff',
                    borderRadius: 16,
                    padding: '48px 24px',
                    textAlign: 'center',
                    border: `1px solid ${THEME.border}`,
                    boxShadow: THEME.shadowSm,
                  }}
                >
                  <Spin size="large" />
                  <Text style={{ display: 'block', marginTop: 14, color: THEME.textMuted }}>
                    Loading students for {sectionName}...
                  </Text>
                </div>
              ) : students.length === 0 ? (
                <div
                  style={{
                    background: '#ffffff',
                    borderRadius: 16,
                    padding: '48px 24px',
                    textAlign: 'center',
                    border: `1px solid ${THEME.border}`,
                    boxShadow: THEME.shadowSm,
                  }}
                >
                  <Empty description={`No students enrolled in ${sectionName}`} />
                </div>
              ) : (
                <>
                  {/* REAL-TIME STATS ROW */}
                  <StatsRow>
                    <StatCard>
                      <div className="stat-icon" style={{ background: THEME.primaryLight, color: THEME.primary }}>
                        <TeamOutlined />
                      </div>
                      <div className="stat-info">
                        <Text className="stat-label">Total Students</Text>
                        <Title level={3} className="stat-value">{stats.total}</Title>
                      </div>
                    </StatCard>

                    <StatCard>
                      <div className="stat-icon" style={{ background: THEME.emeraldLight, color: THEME.emerald }}>
                        <CheckCircleOutlined />
                      </div>
                      <div className="stat-info">
                        <Text className="stat-label">Present</Text>
                        <Title level={3} className="stat-value" style={{ color: THEME.emerald }}>
                          {stats.present}
                        </Title>
                      </div>
                    </StatCard>

                    <StatCard>
                      <div className="stat-icon" style={{ background: THEME.rubyLight, color: THEME.ruby }}>
                        <CloseCircleOutlined />
                      </div>
                      <div className="stat-info">
                        <Text className="stat-label">Absent</Text>
                        <Title level={3} className="stat-value" style={{ color: THEME.ruby }}>
                          {stats.absent}
                        </Title>
                      </div>
                    </StatCard>

                    <StatCard>
                      <div className="stat-icon" style={{ background: THEME.amberLight, color: THEME.amber }}>
                        <ExclamationCircleOutlined />
                      </div>
                      <div className="stat-info">
                        <Text className="stat-label">Leave / Other</Text>
                        <Title level={3} className="stat-value" style={{ color: THEME.amber }}>
                          {stats.other}
                        </Title>
                      </div>
                    </StatCard>
                  </StatsRow>

                  {/* SEARCH & QUICK ACTION BAR */}
                  <ActionBarCard>
                    <SearchBoxWrapper>
                      <Input
                        prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
                        placeholder="Search student by name or roll number..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        allowClear
                        style={{ borderRadius: 8 }}
                      />
                    </SearchBoxWrapper>

                    <ActionButtonGroup>
                      <Tooltip title="Mark all students as Present">
                        <Button
                          icon={<CheckSquareOutlined />}
                          onClick={handleMarkAllPresent}
                          style={{
                            borderColor: '#a7f3d0',
                            background: '#ecfdf5',
                            color: '#059669',
                            fontWeight: 600,
                            borderRadius: 8,
                          }}
                        >
                          All Present
                        </Button>
                      </Tooltip>

                      <Tooltip title="Mark all students as Absent">
                        <Button
                          icon={<CloseSquareOutlined />}
                          onClick={handleMarkAllAbsent}
                          style={{
                            borderColor: '#fecaca',
                            background: '#fef2f2',
                            color: '#dc2626',
                            fontWeight: 600,
                            borderRadius: 8,
                          }}
                        >
                          All Absent
                        </Button>
                      </Tooltip>

                      <Button
                        icon={<CalendarOutlined />}
                        onClick={() => setIsModalVisible(true)}
                        style={{ borderRadius: 8, borderColor: THEME.border }}
                      >
                        History
                      </Button>

                      <Button
                        icon={<FileTextOutlined />}
                        onClick={fetchAttendanceSummary}
                        style={{ borderRadius: 8, borderColor: THEME.border }}
                      >
                        Summary
                      </Button>

                      <Button
                        icon={<EditOutlined />}
                        onClick={() => setIsUpdateModalVisible(true)}
                        style={{ borderRadius: 8, borderColor: THEME.border }}
                      >
                        Update
                      </Button>

                      <Button
                        type="primary"
                        icon={<SendOutlined />}
                        onClick={submitAttendance}
                        loading={loading}
                        style={{
                          background: 'linear-gradient(135deg, #091838 0%, #061129 100%)',
                          borderColor: '#061129',
                          borderRadius: 8,
                          fontWeight: 700,
                          boxShadow: '0 4px 12px rgba(6, 17, 41, 0.25)',
                        }}
                      >
                        Submit Attendance
                      </Button>
                    </ActionButtonGroup>
                  </ActionBarCard>

                  {/* STUDENT CARDS GRID */}
                  <StudentGrid>
                    {filteredStudents.map(student => {
                      const currentStatus = attendanceData[student.id] || ATTENDANCE_STATUS.PRESENT;
                      return (
                        <StudentCard key={student.id}>
                          <div className="card-top-row">
                            <div className="student-profile">
                              <StudentPicture studentId={student.id} size={44} showViewButton={false} />
                              <div className="student-meta">
                                <Text strong className="student-name">{student.Name}</Text>
                                <div className="student-badges">
                                  <Tag className="roll-tag">Roll: {student.Class_No}</Tag>
                                  {getAttendanceTag(currentStatus)}
                                </div>
                              </div>
                            </div>
                          </div>

                          <AttendanceButtonGroup>
                            <StatusButton
                              type="button"
                              $status="Present"
                              $active={currentStatus === ATTENDANCE_STATUS.PRESENT}
                              onClick={() => handleAttendanceChange(student.id, ATTENDANCE_STATUS.PRESENT)}
                            >
                              <CheckCircleOutlined /> Present
                            </StatusButton>

                            <StatusButton
                              type="button"
                              $status="Absent"
                              $active={currentStatus === ATTENDANCE_STATUS.ABSENT}
                              onClick={() => handleAttendanceChange(student.id, ATTENDANCE_STATUS.ABSENT)}
                            >
                              <CloseCircleOutlined /> Absent
                            </StatusButton>

                            <StatusButton
                              type="button"
                              $status="Leave"
                              $active={currentStatus === ATTENDANCE_STATUS.LEAVE}
                              onClick={() => handleAttendanceChange(student.id, ATTENDANCE_STATUS.LEAVE)}
                            >
                              <ExclamationCircleOutlined /> Leave
                            </StatusButton>

                            <StatusButton
                              type="button"
                              $status="Late"
                              $active={currentStatus === ATTENDANCE_STATUS.LATE_COMER}
                              onClick={() => handleAttendanceChange(student.id, ATTENDANCE_STATUS.LATE_COMER)}
                            >
                              <ClockCircleOutlined /> Late
                            </StatusButton>

                            <StatusButton
                              type="button"
                              $status="Half"
                              $active={currentStatus === ATTENDANCE_STATUS.HALF_LEAVE}
                              onClick={() => handleAttendanceChange(student.id, ATTENDANCE_STATUS.HALF_LEAVE)}
                            >
                              <ExclamationCircleOutlined /> Half
                            </StatusButton>
                          </AttendanceButtonGroup>
                        </StudentCard>
                      );
                    })}
                  </StudentGrid>

                  {/* BOTTOM SUBMIT ROW (DESKTOP) */}
                  <div
                    style={{
                      background: '#ffffff',
                      border: `1px solid ${THEME.border}`,
                      borderRadius: 14,
                      padding: '16px 20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      boxShadow: THEME.shadowSm,
                    }}
                  >
                    <div>
                      <Text strong style={{ color: THEME.textMain, fontSize: 14, display: 'block' }}>
                        Ready to record attendance for {sectionName}?
                      </Text>
                      <Text style={{ color: THEME.textMuted, fontSize: 12 }}>
                        {stats.present} Present, {stats.absent} Absent, {stats.other} Leave/Other of {stats.total} total students.
                      </Text>
                    </div>

                    <Button
                      type="primary"
                      size="large"
                      icon={<SendOutlined />}
                      onClick={submitAttendance}
                      loading={loading}
                      style={{
                        background: 'linear-gradient(135deg, #091838 0%, #061129 100%)',
                        borderColor: '#061129',
                        borderRadius: 8,
                        fontWeight: 700,
                        padding: '0 24px',
                        boxShadow: '0 4px 14px rgba(6, 17, 41, 0.25)',
                      }}
                    >
                      Submit Attendance
                    </Button>
                  </div>
                </>
              )}
            </>
          )}

          {/* PREVIOUS ATTENDANCE HISTORY MODAL */}
          <Modal
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <CalendarOutlined style={{ color: THEME.accent, fontSize: 18 }} />
                <span>Previous Attendance History - {sectionName || 'Section'}</span>
              </div>
            }
            open={isModalVisible}
            visible={isModalVisible}
            onCancel={() => setIsModalVisible(false)}
            footer={null}
            width={800}
            styles={{
              body: { maxHeight: '75vh', overflowY: 'auto', padding: '16px 20px' }
            }}
          >
            <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
              <DatePicker
                onChange={(d, dateStr) => setSelectedDate(dateStr)}
                style={{ flex: 1, minWidth: 200, borderRadius: 8 }}
                placeholder="Select Date"
              />
              <Button
                type="primary"
                icon={<SearchOutlined />}
                onClick={fetchPreviousAttendance}
                disabled={!selectedDate}
                loading={loading}
                style={{
                  background: 'linear-gradient(135deg, #091838 0%, #061129 100%)',
                  borderColor: '#061129',
                  borderRadius: 8,
                  fontWeight: 600
                }}
              >
                Fetch Records
              </Button>
            </div>

            <Table
              dataSource={modalStudents}
              rowKey="student_id"
              loading={loading}
              columns={[
                {
                  title: 'Student',
                  key: 'student',
                  render: (_, r) => (
                    <Space>
                      {/* <StudentPicture studentId={r.student_id} size={38} showViewButton={false} /> */}
                      <div>
                        <Text strong style={{ color: THEME.textMain, display: 'block' }}>{r.student_name}</Text>
                        <Text style={{ color: THEME.textMuted, fontSize: 11 }}>Roll: {r.roll_no}</Text>
                      </div>
                    </Space>
                  )
                },
                {
                  title: 'Status',
                  key: 'status',
                  render: (_, r) => getAttendanceTag(r.attendance_status)
                },
                {
                  title: 'Date',
                  key: 'date',
                  render: (_, r) => formatDateSafe(r.date)
                }
              ]}
              scroll={{ x: isMobile ? '100%' : 600 }}
              pagination={{ pageSize: 10, showSizeChanger: false }}
              locale={{
                emptyText: (
                  <Empty
                    description="No attendance records found. Select a date and click Fetch Records."
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  />
                )
              }}
            />
          </Modal>

          {/* ATTENDANCE SUMMARY MODAL */}
          <AttendanceSummaryModal
            visible={isSummaryModalVisible}
            onCancel={() => setIsSummaryModalVisible(false)}
            sections={sections}
            subjects={subjects}
            screenSize={screens}
            fetchAttendanceSummary={fetchAttendanceSummary}
            modalSummary={modalSummary}
            loading={loading}
            sectionName={sectionName}
          />

          {/* UPDATE ATTENDANCE MODAL */}
          <UpdateAttendanceModal
            visible={isUpdateModalVisible}
            onCancel={() => setIsUpdateModalVisible(false)}
            sectionId={sectionId}
            subjectId={subjectId}
            teacherId={teacherId}
            students={students}
            sectionName={sectionName}
            screenSize={screens}
            attendanceStatus={ATTENDANCE_STATUS}
          />
        </ContentWrapper>

        {/* MOBILE STICKY FOOTER ACTION BAR */}
        {isMobile && students.length > 0 && (
          <MobileStickyFooter>
            <div className="footer-summary">
              <Text strong style={{ color: THEME.textMain, fontSize: 13 }}>
                {stats.present} / {stats.total} Present
              </Text>
              <Text style={{ fontSize: 11, color: THEME.textMuted }}>
                ({stats.absent} Absent, {stats.other} Other)
              </Text>
            </div>
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={submitAttendance}
              loading={loading}
              style={{
                background: 'linear-gradient(135deg, #091838 0%, #061129 100%)',
                borderColor: '#061129',
                borderRadius: 8,
                fontWeight: 700,
                height: 40,
                padding: '0 18px',
                boxShadow: '0 4px 12px rgba(6, 17, 41, 0.25)',
              }}
            >
              Submit Attendance
            </Button>
          </MobileStickyFooter>
        )}
      </ContentLayout>
    </PageContainer>
  );
};

export default CheckAttendanceSection;